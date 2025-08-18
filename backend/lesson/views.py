from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Prefetch, Count, Avg
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.core.cache import cache
from django.db import transaction
from django.utils import timezone
from datetime import datetime, timedelta
from .models import Lesson, LessonAttendance, LessonResource, LessonAssessment
from .serializers import (
    LessonSerializer, LessonListSerializer, LessonCreateSerializer,
    LessonUpdateSerializer, LessonStatusUpdateSerializer, LessonBulkCreateSerializer,
    LessonAttendanceSerializer, LessonResourceSerializer, LessonAssessmentSerializer
)
from teacher.models import Teacher
from teacher.serializers import TeacherSerializer
from subject.models import Subject
from subject.serializers import SubjectSerializer
from classroom.models import Classroom
from classroom.serializers import ClassroomSerializer, SectionSerializer
import logging

logger = logging.getLogger(__name__)


class LessonViewSet(viewsets.ModelViewSet):
    """
    Comprehensive ViewSet for Lesson CRUD operations with advanced features.
    
    Features:
    - Full CRUD operations
    - Advanced filtering and search
    - Status management
    - Scheduling conflict detection
    - Bulk operations
    - Calendar view support
    - Statistics and analytics
    """
    
    queryset = Lesson.objects.all()
    permission_classes = [IsAuthenticated]
    
    # Enhanced filtering and searching
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    
    filterset_fields = {
        'status': ['exact', 'in'],
        'lesson_type': ['exact', 'in'],
        'difficulty_level': ['exact', 'in'],
        'date': ['exact', 'gte', 'lte', 'range'],
        'teacher_id': ['exact', 'in'],
        'classroom_id': ['exact', 'in'],
        'subject_id': ['exact', 'in'],
        'is_recurring': ['exact'],
        'requires_special_equipment': ['exact'],
        'is_online_lesson': ['exact'],
        'is_active': ['exact'],
        'completion_percentage': ['exact', 'gte', 'lte'],
    }
    
    search_fields = [
        'title', 'description', 'teacher__user__first_name', 'teacher__user__last_name',
        'classroom__name', 'subject__name', 'teacher_notes', 'lesson_notes'
    ]
    
    ordering_fields = [
        'date', 'start_time', 'title', 'status', 'completion_percentage',
        'created_at', 'updated_at'
    ]
    
    ordering = ['-date', 'start_time']
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        serializer_map = {
            'list': LessonListSerializer,
            'create': LessonCreateSerializer,
            'update': LessonUpdateSerializer,
            'partial_update': LessonUpdateSerializer,
            'bulk_create': LessonBulkCreateSerializer,
            'update_status': LessonStatusUpdateSerializer,
            'calendar': LessonListSerializer,
            'statistics': LessonListSerializer,
        }
        return serializer_map.get(self.action, LessonSerializer)
    
    def get_queryset(self):
        """Enhanced queryset with smart prefetching and filtering"""
        queryset = Lesson.objects.select_related(
            'teacher__user', 'classroom__section__grade_level', 'subject',
            'created_by', 'last_modified_by'
        ).prefetch_related(
            'attendances__student__user'
        )
        
        # Check if request has query_params (DRF Request object)
        if hasattr(self.request, 'query_params'):
            # Date filtering
            date_filter = self.request.query_params.get('date_filter')
            if date_filter:
                today = timezone.now().date()
                if date_filter == 'today':
                    queryset = queryset.filter(date=today)
                elif date_filter == 'tomorrow':
                    tomorrow = today + timedelta(days=1)
                    queryset = queryset.filter(date=tomorrow)
                elif date_filter == 'this_week':
                    week_start = today - timedelta(days=today.weekday())
                    week_end = week_start + timedelta(days=6)
                    queryset = queryset.filter(date__range=[week_start, week_end])
                elif date_filter == 'next_week':
                    next_week_start = today + timedelta(days=7-today.weekday())
                    next_week_end = next_week_start + timedelta(days=6)
                    queryset = queryset.filter(date__range=[next_week_start, next_week_end])
                elif date_filter == 'overdue':
                    queryset = queryset.filter(
                        date__lt=today,
                        status__in=['scheduled', 'in_progress']
                    )
            
            # Status filtering
            status_filter = self.request.query_params.get('status_filter')
            if status_filter:
                if status_filter == 'active':
                    queryset = queryset.filter(status__in=['scheduled', 'in_progress'])
                elif status_filter == 'completed':
                    queryset = queryset.filter(status='completed')
                elif status_filter == 'cancelled':
                    queryset = queryset.filter(status='cancelled')
            
            # Teacher filtering
            teacher_id = self.request.query_params.get('teacher_id')
            if teacher_id:
                queryset = queryset.filter(teacher_id=teacher_id)
            
            # Classroom filtering
            classroom_id = self.request.query_params.get('classroom_id')
            if classroom_id:
                queryset = queryset.filter(classroom_id=classroom_id)
            
            # Subject filtering
            subject_id = self.request.query_params.get('subject_id')
            if subject_id:
                queryset = queryset.filter(subject_id=subject_id)
        
        return queryset
    
    def perform_create(self, serializer):
        """Create with enhanced logging and validation"""
        with transaction.atomic():
            # Debug: Print the validated data
            print("Validated data:", serializer.validated_data)
            lesson = serializer.save()
            logger.info(
                f"Lesson '{lesson.title}' created by {self.request.user} "
                f"for {lesson.classroom} on {lesson.date} at {lesson.start_time}"
            )
    
    def perform_update(self, serializer):
        """Update with enhanced logging and validation"""
        with transaction.atomic():
            old_status = serializer.instance.status
            lesson = serializer.save()
            logger.info(
                f"Lesson '{lesson.title}' updated by {self.request.user} "
                f"(Status: {old_status} -> {lesson.status})"
            )
    
    def perform_destroy(self, instance):
        """Delete with enhanced logging and error handling"""
        try:
            logger.info(f"Lesson '{instance.title}' deleted by {self.request.user}")
            super().perform_destroy(instance)
        except Exception as e:
            logger.error(f"Failed to delete lesson '{instance.title}': {e}")
            from rest_framework.response import Response
            from rest_framework import status
            raise Exception(f"Lesson cannot be deleted: {e}")
    
    @action(detail=False, methods=['get'])
    def calendar(self, request):
        """Get lessons for calendar view"""
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        queryset = self.get_queryset()
        
        if start_date and end_date:
            queryset = queryset.filter(date__range=[start_date, end_date])
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get lesson statistics"""
        queryset = self.get_queryset()
        
        # Calculate statistics
        total_lessons = queryset.count()
        completed_lessons = queryset.filter(status='completed').count()
        scheduled_lessons = queryset.filter(status='scheduled').count()
        in_progress_lessons = queryset.filter(status='in_progress').count()
        cancelled_lessons = queryset.filter(status='cancelled').count()
        
        # Average completion percentage
        avg_completion = queryset.aggregate(
            avg_completion=Avg('completion_percentage')
        )['avg_completion'] or 0
        
        # Lessons by type
        lessons_by_type = queryset.values('lesson_type').annotate(
            count=Count('id')
        )
        
        # Lessons by status
        lessons_by_status = queryset.values('status').annotate(
            count=Count('id')
        )
        
        # Upcoming lessons (next 7 days)
        today = timezone.now().date()
        week_from_now = today + timedelta(days=7)
        upcoming_lessons = queryset.filter(
            date__range=[today, week_from_now],
            status='scheduled'
        ).count()
        
        # Overdue lessons
        overdue_lessons = queryset.filter(
            date__lt=today,
            status__in=['scheduled', 'in_progress']
        ).count()
        
        return Response({
            'total_lessons': total_lessons,
            'completed_lessons': completed_lessons,
            'scheduled_lessons': scheduled_lessons,
            'in_progress_lessons': in_progress_lessons,
            'cancelled_lessons': cancelled_lessons,
            'avg_completion_percentage': round(avg_completion, 2),
            'upcoming_lessons': upcoming_lessons,
            'overdue_lessons': overdue_lessons,
            'lessons_by_type': list(lessons_by_type),
            'lessons_by_status': list(lessons_by_status),
        })
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Update lesson status with validation"""
        lesson = self.get_object()
        serializer = LessonStatusUpdateSerializer(lesson, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            logger.info(
                f"Lesson '{lesson.title}' status updated to '{lesson.status}' "
                f"by {request.user}"
            )
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def start_lesson(self, request, pk=None):
        """Start a lesson"""
        lesson = self.get_object()
        
        if lesson.start_lesson():
            serializer = self.get_serializer(lesson)
            logger.info(f"Lesson '{lesson.title}' started by {request.user}")
            return Response({
                'message': 'Lesson started successfully',
                'lesson': serializer.data
            })
        
        return Response(
            {'error': 'Lesson cannot be started'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    @action(detail=True, methods=['post'])
    def complete_lesson(self, request, pk=None):
        """Complete a lesson"""
        lesson = self.get_object()
        
        if lesson.complete_lesson():
            serializer = self.get_serializer(lesson)
            logger.info(f"Lesson '{lesson.title}' completed by {request.user}")
            return Response({
                'message': 'Lesson completed successfully',
                'lesson': serializer.data
            })
        
        return Response(
            {'error': 'Lesson cannot be completed'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    @action(detail=True, methods=['get'])
    def get_progress(self, request, pk=None):
        """Get current progress of a lesson"""
        lesson = self.get_object()
        progress = lesson.update_progress()
        serializer = self.get_serializer(lesson)
        return Response({
            'progress': progress,
            'lesson': serializer.data
        })
    
    @action(detail=True, methods=['post'])
    def update_progress(self, request, pk=None):
        """Manually update lesson progress"""
        lesson = self.get_object()
        progress = lesson.update_progress()
        serializer = self.get_serializer(lesson)
        return Response({
            'progress': progress,
            'lesson': serializer.data
        })
    
    @action(detail=True, methods=['post'])
    def cancel_lesson(self, request, pk=None):
        """Cancel a lesson"""
        lesson = self.get_object()
        
        if not lesson.can_cancel():
            return Response(
                {'error': 'Lesson cannot be cancelled'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        lesson.status = 'cancelled'
        lesson.save()
        
        logger.info(f"Lesson '{lesson.title}' cancelled by {request.user}")
        return Response({'message': 'Lesson cancelled successfully'})
    
    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        """Create multiple lessons at once"""
        serializer = LessonBulkCreateSerializer(data=request.data)
        
        if serializer.is_valid():
            result = serializer.save()
            logger.info(
                f"Bulk created {len(result['lessons'])} lessons by {request.user}"
            )
            return Response(result, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def conflicts(self, request):
        """Check for scheduling conflicts"""
        classroom_id = request.query_params.get('classroom_id')
        date = request.query_params.get('date')
        start_time = request.query_params.get('start_time')
        end_time = request.query_params.get('end_time')
        lesson_id = request.query_params.get('lesson_id')  # For updates
        
        if not all([classroom_id, date, start_time, end_time]):
            return Response(
                {'error': 'Missing required parameters'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        conflicting_lessons = Lesson.objects.filter(
            classroom_id=classroom_id,
            date=date,
            status__in=['scheduled', 'in_progress']
        )
        
        if lesson_id:
            conflicting_lessons = conflicting_lessons.exclude(id=lesson_id)
        
        conflicts = []
        for lesson in conflicting_lessons:
            if (start_time < lesson.end_time.strftime('%H:%M') and 
                end_time > lesson.start_time.strftime('%H:%M')):
                conflicts.append({
                    'id': lesson.id,
                    'title': lesson.title,
                    'start_time': lesson.start_time.strftime('%H:%M'),
                    'end_time': lesson.end_time.strftime('%H:%M'),
                    'teacher': lesson.teacher.user.full_name,
                    'subject': lesson.subject.name,
                })
        
        return Response({'conflicts': conflicts})

    @action(detail=False, methods=['get'])
    def teacher_subjects(self, request):
        """Get subjects for a selected teacher"""
        teacher_id = request.query_params.get('teacher_id')
        
        if not teacher_id:
            return Response(
                {'error': 'teacher_id parameter is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            teacher = Teacher.objects.get(id=teacher_id)
            
            # Get subjects from ClassroomTeacherAssignment
            from classroom.models import ClassroomTeacherAssignment
            classroom_allocations = ClassroomTeacherAssignment.objects.filter(
                teacher=teacher, 
                is_active=True
            )
            
            # Get subjects from TeacherAssignment
            from teacher.models import TeacherAssignment
            teacher_assignments = TeacherAssignment.objects.filter(teacher=teacher)
            
            # Combine subjects from both sources
            subjects = set()
            for allocation in classroom_allocations:
                subjects.add(allocation.subject)
            for assignment in teacher_assignments:
                subjects.add(assignment.subject)
            
            # For Junior Secondary, show component subjects instead of parent subjects
            filtered_subjects = set()
            for subject in subjects:
                # If this is a parent subject (has component subjects), get the components
                if subject.component_subjects.exists():
                    # Only show component subjects for Junior Secondary
                    component_subjects = subject.component_subjects.filter(
                        education_levels=['JUNIOR_SECONDARY']
                    )
                    filtered_subjects.update(component_subjects)
                else:
                    # If it's a component subject or regular subject, include it
                    filtered_subjects.add(subject)
            
            subjects = filtered_subjects
            
            if subjects:
                subjects = list(subjects)
            else:
                # If no allocations exist, return all active subjects
                subjects = Subject.objects.filter(is_active=True)
            
            serializer = SubjectSerializer(subjects, many=True)
            return Response(serializer.data)
        except Teacher.DoesNotExist:
            return Response(
                {'error': 'Teacher not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['get'])
    def subject_teachers(self, request):
        """Get teachers for a selected subject"""
        subject_id = request.query_params.get('subject_id')
        
        if not subject_id:
            return Response(
                {'error': 'subject_id parameter is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            subject = Subject.objects.get(id=subject_id)
            
            # Get teachers from ClassroomTeacherAssignment
            from classroom.models import ClassroomTeacherAssignment
            classroom_allocations = ClassroomTeacherAssignment.objects.filter(
                subject=subject, 
                is_active=True
            )
            
            # Get teachers from TeacherAssignment
            from teacher.models import TeacherAssignment
            teacher_assignments = TeacherAssignment.objects.filter(subject=subject)
            
            # Combine teachers from both sources
            teachers = set()
            for allocation in classroom_allocations:
                teachers.add(allocation.teacher)
            for assignment in teacher_assignments:
                teachers.add(assignment.teacher)
            
            # If this is a component subject, also get teachers assigned to the parent subject
            if subject.parent_subject:
                parent_classroom_allocations = ClassroomTeacherAssignment.objects.filter(
                    subject=subject.parent_subject, 
                    is_active=True
                )
                parent_teacher_assignments = TeacherAssignment.objects.filter(subject=subject.parent_subject)
                
                for allocation in parent_classroom_allocations:
                    teachers.add(allocation.teacher)
                for assignment in parent_teacher_assignments:
                    teachers.add(assignment.teacher)
            
            if teachers:
                teachers = list(teachers)
            else:
                # If no allocations exist, return all active teachers
                teachers = Teacher.objects.filter(is_active=True)
            
            serializer = TeacherSerializer(teachers, many=True)
            return Response(serializer.data)
        except Subject.DoesNotExist:
            return Response(
                {'error': 'Subject not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['get'])
    def teacher_classrooms(self, request):
        """Get classrooms for a selected teacher"""
        teacher_id = request.query_params.get('teacher_id')
        
        if not teacher_id:
            return Response(
                {'error': 'teacher_id parameter is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            teacher = Teacher.objects.get(id=teacher_id)
            
            # Get classrooms from ClassroomTeacherAssignment
            from classroom.models import ClassroomTeacherAssignment
            classroom_allocations = ClassroomTeacherAssignment.objects.filter(
                teacher=teacher, 
                is_active=True
            )
            
            # Get classrooms from TeacherAssignment (via grade_level and section)
            from teacher.models import TeacherAssignment
            teacher_assignments = TeacherAssignment.objects.filter(teacher=teacher)
            
            # Combine classrooms from both sources
            classrooms = set()
            for allocation in classroom_allocations:
                classrooms.add(allocation.classroom)
            for assignment in teacher_assignments:
                if assignment.grade_level and assignment.section:
                    # Find classrooms for this grade level and section
                    section_classrooms = Classroom.objects.filter(
                        section__grade_level=assignment.grade_level,
                        section=assignment.section,
                        is_active=True
                    )
                    classrooms.update(section_classrooms)
            
            if classrooms:
                classrooms = list(classrooms)
            else:
                # If no assigned classrooms exist, return all active classrooms
                classrooms = Classroom.objects.filter(is_active=True)
            
            serializer = ClassroomSerializer(classrooms, many=True)
            return Response(serializer.data)
        except Teacher.DoesNotExist:
            return Response(
                {'error': 'Teacher not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['get'])
    def classroom_sections(self, request):
        """Get all classroom sections for filtering"""
        from classroom.models import Section
        
        sections = Section.objects.filter(is_active=True)
        serializer = SectionSerializer(sections, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def subjects_by_level(self, request):
        """Get subjects filtered by education level and grade level"""
        education_level = request.query_params.get('education_level')
        grade_level_id = request.query_params.get('grade_level_id')
        
        if not education_level:
            return Response({'error': 'education_level parameter is required'}, status=400)
        
        # Use the new enhanced method for better backend differentiation
        subjects = Subject.get_subjects_by_education_level(education_level)
        
        if grade_level_id:
            # Filter by grade level if specified
            subjects = [s for s in subjects if s.grade_levels.filter(id=grade_level_id).exists()]
        
        serializer = SubjectSerializer(subjects, many=True)
        return Response(serializer.data)


class LessonAttendanceViewSet(viewsets.ModelViewSet):
    """ViewSet for lesson attendance management"""
    
    queryset = LessonAttendance.objects.all()
    serializer_class = LessonAttendanceSerializer
    permission_classes = [IsAuthenticated]
    
    filterset_fields = ['lesson_id', 'student_id', 'status']
    search_fields = ['student__user__first_name', 'student__user__last_name', 'notes']
    
    def get_queryset(self):
        return LessonAttendance.objects.select_related(
            'lesson', 'student__user'
        )


class LessonResourceViewSet(viewsets.ModelViewSet):
    """ViewSet for lesson resources management"""
    
    queryset = LessonResource.objects.all()
    serializer_class = LessonResourceSerializer
    permission_classes = [IsAuthenticated]
    
    filterset_fields = ['lesson_id', 'resource_type', 'is_required']
    search_fields = ['title', 'description']
    
    def get_queryset(self):
        return LessonResource.objects.select_related('lesson')


class LessonAssessmentViewSet(viewsets.ModelViewSet):
    """ViewSet for lesson assessments management"""
    
    queryset = LessonAssessment.objects.all()
    serializer_class = LessonAssessmentSerializer
    permission_classes = [IsAuthenticated]
    
    filterset_fields = ['lesson_id', 'assessment_type', 'due_date']
    search_fields = ['title', 'description']
    ordering_fields = ['due_date', 'total_points', 'weight_percentage']
    ordering = ['due_date']
    
    def get_queryset(self):
        return LessonAssessment.objects.select_related('lesson')
