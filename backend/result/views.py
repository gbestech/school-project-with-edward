from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Avg, Count, Max, Min
from django.shortcuts import get_object_or_404
from django.utils import timezone

from .models import (
    StudentResult, 
    StudentTermResult, 
    ExamSession, 
    ResultSheet,
    AssessmentScore,
    ResultComment,
    GradingSystem,
    Grade,
    AssessmentType,
    ScoringConfiguration,
    JuniorSecondaryResult,
    PrimaryResult,
    NurseryResult,
    SeniorSecondaryResult,
    SeniorSecondarySessionResult
)
from .serializers import (
    StudentResultSerializer,
    StudentTermResultSerializer,
    ExamSessionSerializer,
    ResultSheetSerializer,
    AssessmentScoreSerializer,
    ResultCommentSerializer,
    GradingSystemSerializer,
    GradeSerializer,
    AssessmentTypeSerializer,
    DetailedStudentResultSerializer,
    StudentTermResultDetailSerializer,
    ScoringConfigurationSerializer,
    ScoringConfigurationCreateUpdateSerializer,
    JuniorSecondaryResultSerializer,
    JuniorSecondaryResultCreateUpdateSerializer,
    PrimaryResultSerializer,
    PrimaryResultCreateUpdateSerializer,
    NurseryResultSerializer,
    NurseryResultCreateUpdateSerializer,
    SeniorSecondaryResultSerializer,
    SeniorSecondaryResultCreateUpdateSerializer,
    SeniorSecondarySessionResultSerializer,
    SeniorSecondarySessionResultCreateUpdateSerializer
)
from students.models import Student
from academics.models import AcademicSession
from classroom.models import Stream


class GradingSystemViewSet(viewsets.ModelViewSet):
    queryset = GradingSystem.objects.all()
    serializer_class = GradingSystemSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['grading_type', 'is_active']
    search_fields = ['name', 'description']


class GradeViewSet(viewsets.ModelViewSet):
    queryset = Grade.objects.all()
    serializer_class = GradeSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['grading_system', 'is_passing']


class AssessmentTypeViewSet(viewsets.ModelViewSet):
    queryset = AssessmentType.objects.all()
    serializer_class = AssessmentTypeSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['is_active']
    search_fields = ['name', 'code']


class ExamSessionViewSet(viewsets.ModelViewSet):
    queryset = ExamSession.objects.all()
    serializer_class = ExamSessionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['exam_type', 'term', 'academic_session', 'is_published', 'is_active']
    search_fields = ['name']


class StudentResultViewSet(viewsets.ModelViewSet):
    queryset = StudentResult.objects.all()
    serializer_class = StudentResultSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['student', 'subject', 'exam_session', 'status', 'is_passed', 'stream']
    search_fields = ['student__full_name', 'subject__name']

    def get_queryset(self):
        queryset = super().get_queryset()
        # Add prefetch_related for better performance
        return queryset.select_related(
            'student', 'subject', 'exam_session', 'grading_system', 'stream'
        ).prefetch_related('assessment_scores', 'comments')

    def create(self, request, *args, **kwargs):
        """Create a new student result with automatic calculations"""
        try:
            # Set the user who is creating the result
            request.data['entered_by'] = request.user.id
            
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            result = serializer.save()
            
            # Return detailed response
            detailed_serializer = DetailedStudentResultSerializer(result)
            return Response(detailed_serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(
                {'error': f'Failed to create result: {str(e)}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    def update(self, request, *args, **kwargs):
        """Update a student result with automatic recalculations"""
        try:
            partial = kwargs.pop('partial', False)
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=partial)
            serializer.is_valid(raise_exception=True)
            result = serializer.save()
            
            # Return detailed response
            detailed_serializer = DetailedStudentResultSerializer(result)
            return Response(detailed_serializer.data)
        except Exception as e:
            return Response(
                {'error': f'Failed to update result: {str(e)}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    def destroy(self, request, *args, **kwargs):
        """Delete a student result"""
        try:
            instance = self.get_object()
            instance.delete()
            return Response({'message': 'Result deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response(
                {'error': f'Failed to delete result: {str(e)}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'])
    def by_student(self, request):
        """Get all results for a specific student"""
        student_id = request.query_params.get('student_id')
        if not student_id:
            return Response(
                {'error': 'student_id parameter is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        results = self.get_queryset().filter(student_id=student_id)
        serializer = DetailedStudentResultSerializer(results, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_exam_session(self, request):
        """Get all results for a specific exam session"""
        exam_session_id = request.query_params.get('exam_session_id')
        if not exam_session_id:
            return Response(
                {'error': 'exam_session_id parameter is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        results = self.get_queryset().filter(exam_session_id=exam_session_id)
        serializer = DetailedStudentResultSerializer(results, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def class_statistics(self, request):
        """Get class statistics for an exam session"""
        exam_session_id = request.query_params.get('exam_session_id')
        class_name = request.query_params.get('class')
        
        if not exam_session_id or not class_name:
            return Response(
                {'error': 'exam_session_id and class parameters are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        results = self.get_queryset().filter(
            exam_session_id=exam_session_id,
            student__student_class=class_name
        )
        
        if not results.exists():
            return Response({'error': 'No results found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Calculate statistics
        stats = results.aggregate(
            total_students=Count('student', distinct=True),
            average_score=Avg('total_score'),
            highest_score=Max('total_score'),
            lowest_score=Min('total_score'),
            passed_count=Count('id', filter=Q(is_passed=True)),
            failed_count=Count('id', filter=Q(is_passed=False))
        )
        
        return Response(stats)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve a student result"""
        try:
            result = self.get_object()
            result.status = 'APPROVED'
            result.approved_by = request.user
            result.approved_date = timezone.now()
            result.save()
            
            serializer = DetailedStudentResultSerializer(result)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': f'Failed to approve result: {str(e)}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        """Publish a student result"""
        try:
            result = self.get_object()
            result.status = 'PUBLISHED'
            result.save()
            
            serializer = DetailedStudentResultSerializer(result)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': f'Failed to publish result: {str(e)}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        """Create multiple results at once"""
        try:
            results_data = request.data.get('results', [])
            created_results = []
            
            for result_data in results_data:
                result_data['entered_by'] = request.user.id
                serializer = self.get_serializer(data=result_data)
                serializer.is_valid(raise_exception=True)
                result = serializer.save()
                created_results.append(result)
            
            detailed_serializer = DetailedStudentResultSerializer(created_results, many=True)
            return Response(detailed_serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(
                {'error': f'Failed to create results: {str(e)}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get summary statistics for all results"""
        try:
            queryset = self.get_queryset()
            
            summary = {
                'total_results': queryset.count(),
                'approved_results': queryset.filter(status='APPROVED').count(),
                'published_results': queryset.filter(status='PUBLISHED').count(),
                'draft_results': queryset.filter(status='DRAFT').count(),
                'passed_results': queryset.filter(is_passed=True).count(),
                'failed_results': queryset.filter(is_passed=False).count(),
                'average_score': queryset.aggregate(Avg('total_score'))['total_score__avg'] or 0,
                'highest_score': queryset.aggregate(Max('total_score'))['total_score__max'] or 0,
                'lowest_score': queryset.aggregate(Min('total_score'))['total_score__min'] or 0,
            }
            
            return Response(summary)
        except Exception as e:
            return Response(
                {'error': f'Failed to get summary: {str(e)}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )


class StudentTermResultViewSet(viewsets.ModelViewSet):
    queryset = StudentTermResult.objects.all()
    serializer_class = StudentTermResultSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['student', 'academic_session', 'term', 'status']
    search_fields = ['student__full_name']

    def get_queryset(self):
        queryset = super().get_queryset()
        return queryset.select_related('student', 'academic_session').prefetch_related('comments')

    @action(detail=True, methods=['get'])
    def detailed(self, request, pk=None):
        """Get detailed term result with all subject results"""
        term_result = self.get_object()
        serializer = StudentTermResultDetailSerializer(term_result)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_student(self, request):
        """Get all term results for a specific student"""
        student_id = request.query_params.get('student_id')
        if not student_id:
            return Response(
                {'error': 'student_id parameter is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        results = self.get_queryset().filter(student_id=student_id)
        serializer = StudentTermResultDetailSerializer(results, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_academic_session(self, request):
        """Get all term results for a specific academic session"""
        session_id = request.query_params.get('session_id')
        term = request.query_params.get('term')
        
        if not session_id:
            return Response(
                {'error': 'session_id parameter is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        filters = {'academic_session_id': session_id}
        if term:
            filters['term'] = term
        
        results = self.get_queryset().filter(**filters)
        serializer = StudentTermResultDetailSerializer(results, many=True)
        return Response(serializer.data)


class ResultSheetViewSet(viewsets.ModelViewSet):
    queryset = ResultSheet.objects.all()
    serializer_class = ResultSheetSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['exam_session', 'student_class', 'education_level', 'status']


class AssessmentScoreViewSet(viewsets.ModelViewSet):
    queryset = AssessmentScore.objects.all()
    serializer_class = AssessmentScoreSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['student_result', 'assessment_type']


class ResultCommentViewSet(viewsets.ModelViewSet):
    queryset = ResultComment.objects.all()
    serializer_class = ResultCommentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['student_result', 'term_result', 'comment_type']


# Junior Secondary Result ViewSet
class JuniorSecondaryResultViewSet(viewsets.ModelViewSet):
    """ViewSet for Junior Secondary results"""

    
    queryset = JuniorSecondaryResult.objects.all().order_by('-created_at')
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['student', 'subject', 'exam_session', 'status', 'is_passed']
    search_fields = ['student__full_name', 'subject__name']

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return JuniorSecondaryResultCreateUpdateSerializer
        return JuniorSecondaryResultSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        return queryset.select_related(
            'student', 'subject', 'exam_session', 'grading_system', 'scoring_configuration'
        )

    def create(self, request, *args, **kwargs):
        """Create a new Junior Secondary result with automatic calculations"""
        try:
            # Set the user who is creating the result
            request.data['entered_by'] = request.user.id
            
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            result = serializer.save()
            
            # Return detailed response
            detailed_serializer = JuniorSecondaryResultSerializer(result)
            return Response(detailed_serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(
                {'error': f'Failed to create result: {str(e)}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        """Bulk create Junior Secondary results"""
        results_data = request.data.get('results', [])
        created_results = []
        
        for result_data in results_data:
            try:
                result_data['entered_by'] = request.user.id
                serializer = self.get_serializer(data=result_data)
                serializer.is_valid(raise_exception=True)
                result = serializer.save()
                created_results.append(JuniorSecondaryResultSerializer(result).data)
            except Exception as e:
                return Response(
                    {'error': f'Failed to create result: {str(e)}'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        return Response({
            'message': f'Successfully created {len(created_results)} results',
            'results': created_results
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def class_statistics(self, request):
        """Get class statistics for Junior Secondary results"""
        exam_session = request.query_params.get('exam_session')
        student_class = request.query_params.get('student_class')
        subject = request.query_params.get('subject')
        
        if not all([exam_session, student_class, subject]):
            return Response(
                {'error': 'exam_session, student_class, and subject are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        results = JuniorSecondaryResult.objects.filter(
            exam_session=exam_session,
            student__student_class=student_class,
            subject=subject,
            status__in=['APPROVED', 'PUBLISHED']
        )
        
        if not results.exists():
            return Response({'error': 'No results found'}, status=status.HTTP_404_NOT_FOUND)
        
        averages = list(results.values_list('total_score', flat=True))
        statistics = {
            'total_students': len(averages),
            'class_average': sum(averages) / len(averages),
            'highest_score': max(averages),
            'lowest_score': min(averages),
            'students_passed': results.filter(is_passed=True).count(),
            'students_failed': results.filter(is_passed=False).count(),
        }
        
        return Response(statistics)


# Primary Result ViewSet
class PrimaryResultViewSet(viewsets.ModelViewSet):
    """ViewSet for Primary results"""

    
    queryset = PrimaryResult.objects.all().order_by('-created_at')
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['student', 'subject', 'exam_session', 'status', 'is_passed']
    search_fields = ['student__full_name', 'subject__name']

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return PrimaryResultCreateUpdateSerializer
        return PrimaryResultSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        return queryset.select_related(
            'student', 'subject', 'exam_session', 'grading_system', 'scoring_configuration'
        )

    def create(self, request, *args, **kwargs):
        """Create a new Primary result with automatic calculations"""
        try:
            # Set the user who is creating the result
            request.data['entered_by'] = request.user.id
            
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            result = serializer.save()
            
            # Return detailed response
            detailed_serializer = PrimaryResultSerializer(result)
            return Response(detailed_serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(
                {'error': f'Failed to create result: {str(e)}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        """Bulk create Primary results"""
        results_data = request.data.get('results', [])
        created_results = []
        
        for result_data in results_data:
            try:
                result_data['entered_by'] = request.user.id
                serializer = self.get_serializer(data=result_data)
                serializer.is_valid(raise_exception=True)
                result = serializer.save()
                created_results.append(PrimaryResultSerializer(result).data)
            except Exception as e:
                return Response(
                    {'error': f'Failed to create result: {str(e)}'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        return Response({
            'message': f'Successfully created {len(created_results)} results',
            'results': created_results
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def class_statistics(self, request):
        """Get class statistics for Primary results"""
        exam_session = request.query_params.get('exam_session')
        student_class = request.query_params.get('student_class')
        subject = request.query_params.get('subject')
        
        if not all([exam_session, student_class, subject]):
            return Response(
                {'error': 'exam_session, student_class, and subject are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        results = PrimaryResult.objects.filter(
            exam_session=exam_session,
            student__student_class=student_class,
            subject=subject,
            status__in=['APPROVED', 'PUBLISHED']
        )
        
        if not results.exists():
            return Response({'error': 'No results found'}, status=status.HTTP_404_NOT_FOUND)
        
        averages = list(results.values_list('total_score', flat=True))
        statistics = {
            'total_students': len(averages),
            'class_average': sum(averages) / len(averages),
            'highest_score': max(averages),
            'lowest_score': min(averages),
            'students_passed': results.filter(is_passed=True).count(),
            'students_failed': results.filter(is_passed=False).count(),
        }
        
        return Response(statistics)


# Nursery Result ViewSet
class NurseryResultViewSet(viewsets.ModelViewSet):
    """ViewSet for Nursery results"""

    
    queryset = NurseryResult.objects.all().order_by('-created_at')
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['student', 'subject', 'exam_session', 'status', 'is_passed']
    search_fields = ['student__full_name', 'subject__name']

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return NurseryResultCreateUpdateSerializer
        return NurseryResultSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        return queryset.select_related(
            'student', 'subject', 'exam_session', 'grading_system', 'scoring_configuration'
        )

    def create(self, request, *args, **kwargs):
        """Create a new Nursery result with automatic calculations"""
        try:
            # Set the user who is creating the result
            request.data['entered_by'] = request.user.id
            
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            result = serializer.save()
            
            # Return detailed response
            detailed_serializer = NurseryResultSerializer(result)
            return Response(detailed_serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(
                {'error': f'Failed to create result: {str(e)}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        """Bulk create Nursery results"""
        results_data = request.data.get('results', [])
        created_results = []
        
        for result_data in results_data:
            try:
                result_data['entered_by'] = request.user.id
                serializer = self.get_serializer(data=result_data)
                serializer.is_valid(raise_exception=True)
                result = serializer.save()
                created_results.append(NurseryResultSerializer(result).data)
            except Exception as e:
                return Response(
                    {'error': f'Failed to create result: {str(e)}'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        return Response({
            'message': f'Successfully created {len(created_results)} results',
            'results': created_results
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def class_statistics(self, request):
        """Get class statistics for Nursery results"""
        exam_session = request.query_params.get('exam_session')
        student_class = request.query_params.get('student_class')
        subject = request.query_params.get('subject')
        
        if not all([exam_session, student_class, subject]):
            return Response(
                {'error': 'exam_session, student_class, and subject are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        results = NurseryResult.objects.filter(
            exam_session=exam_session,
            student__student_class=student_class,
            subject=subject,
            status__in=['APPROVED', 'PUBLISHED']
        )
        
        if not results.exists():
            return Response({'error': 'No results found'}, status=status.HTTP_404_NOT_FOUND)
        
        averages = list(results.values_list('total_score', flat=True))
        statistics = {
            'total_students': len(averages),
            'class_average': sum(averages) / len(averages),
            'highest_score': max(averages),
            'lowest_score': min(averages),
            'students_passed': results.filter(is_passed=True).count(),
            'students_failed': results.filter(is_passed=False).count(),
        }
        
        return Response(statistics)


# Senior Secondary Result ViewSets
class SeniorSecondaryResultViewSet(viewsets.ModelViewSet):
    """ViewSet for Senior Secondary results"""

    
    queryset = SeniorSecondaryResult.objects.all().order_by('-created_at')
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['student', 'subject', 'exam_session', 'status', 'is_passed', 'stream']
    search_fields = ['student__full_name', 'subject__name']

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return SeniorSecondaryResultCreateUpdateSerializer
        return SeniorSecondaryResultSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        return queryset.select_related(
            'student', 'subject', 'exam_session', 'grading_system', 'stream'
        )

    def create(self, request, *args, **kwargs):
        """Create a new Senior Secondary result with automatic calculations"""
        try:
            # Set the user who is creating the result
            request.data['entered_by'] = request.user.id
            
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            result = serializer.save()
            
            # Return detailed response
            detailed_serializer = SeniorSecondaryResultSerializer(result)
            return Response(detailed_serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(
                {'error': f'Failed to create result: {str(e)}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        """Bulk create Senior Secondary results"""
        results_data = request.data.get('results', [])
        created_results = []
        
        for result_data in results_data:
            try:
                result_data['entered_by'] = request.user.id
                serializer = self.get_serializer(data=result_data)
                serializer.is_valid(raise_exception=True)
                result = serializer.save()
                created_results.append(SeniorSecondaryResultSerializer(result).data)
            except Exception as e:
                return Response(
                    {'error': f'Failed to create result: {str(e)}'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        return Response({
            'message': f'Successfully created {len(created_results)} results',
            'results': created_results
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def class_statistics(self, request):
        """Get class statistics for Senior Secondary results"""
        exam_session = request.query_params.get('exam_session')
        student_class = request.query_params.get('student_class')
        subject = request.query_params.get('subject')
        
        if not all([exam_session, student_class, subject]):
            return Response(
                {'error': 'exam_session, student_class, and subject are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        results = SeniorSecondaryResult.objects.filter(
            exam_session=exam_session,
            student__student_class=student_class,
            subject=subject,
            status__in=['APPROVED', 'PUBLISHED']
        )
        
        if not results.exists():
            return Response({'error': 'No results found'}, status=status.HTTP_404_NOT_FOUND)
        
        averages = list(results.values_list('total_score', flat=True))
        statistics = {
            'total_students': len(averages),
            'class_average': sum(averages) / len(averages),
            'highest_score': max(averages),
            'lowest_score': min(averages),
            'students_passed': results.filter(is_passed=True).count(),
            'students_failed': results.filter(is_passed=False).count(),
        }
        
        return Response(statistics)


class SeniorSecondarySessionResultViewSet(viewsets.ModelViewSet):
    """ViewSet for Senior Secondary session results"""

    
    queryset = SeniorSecondarySessionResult.objects.all().order_by('-created_at')
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['student', 'subject', 'academic_session', 'status', 'stream']
    search_fields = ['student__full_name', 'subject__name']

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return SeniorSecondarySessionResultCreateUpdateSerializer
        return SeniorSecondarySessionResultSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        return queryset.select_related(
            'student', 'subject', 'academic_session', 'stream'
        )

    def create(self, request, *args, **kwargs):
        """Create a new Senior Secondary session result"""
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            result = serializer.save()
            
            # Return detailed response
            detailed_serializer = SeniorSecondarySessionResultSerializer(result)
            return Response(detailed_serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(
                {'error': f'Failed to create session result: {str(e)}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )


class ScoringConfigurationViewSet(viewsets.ModelViewSet):
    """ViewSet for Scoring Configuration"""
    
    queryset = ScoringConfiguration.objects.all().order_by('education_level', 'name')
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['education_level', 'is_active', 'is_default']
    search_fields = ['name', 'description']

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ScoringConfigurationCreateUpdateSerializer
        return ScoringConfigurationSerializer

    @action(detail=False, methods=['get'])
    def by_education_level(self, request):
        """Get scoring configurations by education level"""
        education_level = request.query_params.get('education_level')
        if not education_level:
            return Response(
                {'error': 'education_level parameter is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        configs = self.get_queryset().filter(education_level=education_level)
        serializer = ScoringConfigurationSerializer(configs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def defaults(self, request):
        """Get default scoring configurations for all education levels"""
        configs = self.get_queryset().filter(is_default=True, is_active=True)
        serializer = ScoringConfigurationSerializer(configs, many=True)
        return Response(serializer.data)


class ResultCheckerViewSet(viewsets.ViewSet):
    """ViewSet for Result Checker functionality"""
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def search_students(self, request):
        """Public endpoint to search students by username, name, or ID for result checking"""
        try:
            search_term = request.query_params.get('search', '').strip()
            if not search_term:
                return Response({'results': []})
            
            from students.models import Student
            
            # Search in students by username, name, or registration number
            students = Student.objects.filter(
                Q(user__username__icontains=search_term) |
                Q(user__first_name__icontains=search_term) |
                Q(user__last_name__icontains=search_term) |
                Q(registration_number__icontains=search_term) |
                Q(id__icontains=search_term)
            ).select_related('user')[:10]  # Limit to 10 results
            
            # Serialize the results
            results = []
            for student in students:
                results.append({
                    'id': student.id,
                    'name': student.full_name,
                    'username': student.user.username if student.user else None,
                    'admission_number': student.registration_number,
                    'class': student.student_class,
                    'education_level': student.education_level
                })
            
            return Response({'results': results})
        except Exception as e:
            return Response(
                {'error': f'Search failed: {str(e)}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'])
    def termly_results(self, request):
        """Get termly results based on user role and filters"""
        try:
            user = request.user
            filters = request.query_params
            
            # Determine user role and apply appropriate filters
            if user.role == 'ADMIN':
                # Admin can see all results
                results = self._get_termly_results(filters)
            elif user.role == 'TEACHER':
                # Teacher can only see results for their assigned classes
                results = self._get_termly_results_for_teacher(filters, user)
            elif user.role == 'STUDENT':
                # Student can only see their own results
                results = self._get_termly_results_for_student(filters, user)
            elif user.role == 'PARENT':
                # Parent can see results of their children
                results = self._get_termly_results_for_parent(filters, user)
            else:
                return Response(
                    {'error': 'Unauthorized access'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            return Response(results)
        except Exception as e:
            return Response(
                {'error': f'Failed to fetch results: {str(e)}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'])
    def session_results(self, request):
        """Get session results based on user role and filters"""
        try:
            user = request.user
            filters = request.query_params
            
            # Determine user role and apply appropriate filters
            if user.role == 'ADMIN':
                results = self._get_session_results(filters)
            elif user.role == 'TEACHER':
                results = self._get_session_results_for_teacher(filters, user)
            elif user.role == 'STUDENT':
                results = self._get_session_results_for_student(filters, user)
            elif user.role == 'PARENT':
                results = self._get_session_results_for_parent(filters, user)
            else:
                return Response(
                    {'error': 'Unauthorized access'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            return Response(results)
        except Exception as e:
            return Response(
                {'error': f'Failed to fetch session results: {str(e)}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'])
    def parent_results(self, request):
        """Get results for parent view (published results only)"""
        try:
            user = request.user
            filters = request.query_params
            
            if user.role not in ['PARENT', 'ADMIN']:
                return Response(
                    {'error': 'Unauthorized access'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Only return published results for parents
            filters['status'] = 'PUBLISHED'
            
            if user.role == 'PARENT':
                results = self._get_parent_results(filters, user)
            else:
                results = self._get_all_published_results(filters)
            
            return Response(results)
        except Exception as e:
            return Response(
                {'error': f'Failed to fetch parent results: {str(e)}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    def _get_termly_results(self, filters):
        """Get termly results for admin"""
        try:
            from .models import SeniorSecondaryResult, JuniorSecondaryResult, PrimaryResult, NurseryResult
            
            # Build query filters
            query_filters = {}
            if filters.get('student_id'):
                query_filters['student_id'] = filters['student_id']
            if filters.get('class_id'):
                query_filters['student__student_class_id'] = filters['class_id']
            if filters.get('term_id'):
                query_filters['exam_session__term'] = filters['term_id']
            if filters.get('academic_session_id'):
                query_filters['exam_session__academic_session_id'] = filters['academic_session_id']
            if filters.get('education_level'):
                query_filters['student__education_level'] = filters['education_level']
            
            # Get results from all education levels
            results = []
            
            # Senior Secondary Results
            senior_results = SeniorSecondaryResult.objects.filter(**query_filters).select_related(
                'student', 'student__user', 'exam_session', 'exam_session__academic_session'
            )
            for result in senior_results:
                results.append(self._serialize_termly_result(result))
            
            # Junior Secondary Results
            junior_results = JuniorSecondaryResult.objects.filter(**query_filters).select_related(
                'student', 'student__user', 'exam_session', 'exam_session__academic_session'
            )
            for result in junior_results:
                results.append(self._serialize_termly_result(result))
            
            # Primary Results
            primary_results = PrimaryResult.objects.filter(**query_filters).select_related(
                'student', 'student__user', 'exam_session', 'exam_session__academic_session'
            )
            for result in primary_results:
                results.append(self._serialize_termly_result(result))
            
            # Nursery Results
            nursery_results = NurseryResult.objects.filter(**query_filters).select_related(
                'student', 'student__user', 'exam_session', 'exam_session__academic_session'
            )
            for result in nursery_results:
                results.append(self._serialize_termly_result(result))
            
            return results
        except Exception as e:
            print(f"Error in _get_termly_results: {e}")
            return []

    def _get_termly_results_for_teacher(self, filters, user):
        """Get termly results for teacher"""
        # Implementation for teacher termly results
        return []

    def _get_termly_results_for_student(self, filters, user):
        """Get termly results for student"""
        # Implementation for student termly results
        return []

    def _get_termly_results_for_parent(self, filters, user):
        """Get termly results for parent"""
        # Implementation for parent termly results
        return []

    def _get_session_results(self, filters):
        """Get session results for admin"""
        # Implementation for admin session results
        return []

    def _get_session_results_for_teacher(self, filters, user):
        """Get session results for teacher"""
        # Implementation for teacher session results
        return []

    def _get_session_results_for_student(self, filters, user):
        """Get session results for student"""
        # Implementation for student session results
        return []

    def _get_session_results_for_parent(self, filters, user):
        """Get session results for parent"""
        # Implementation for parent session results
        return []

    def _get_parent_results(self, filters, user):
        """Get results for parent"""
        # Implementation for parent results
        return []

    def _get_all_published_results(self, filters):
        """Get all published results for admin"""
        try:
            # Admin can see all published results
            filters['status'] = 'PUBLISHED'
            
            termly_results = self._get_termly_results(filters)
            session_results = self._get_session_results(filters)
            
            return {
                'termly_results': termly_results,
                'session_results': session_results
            }
        except Exception as e:
            print(f"Error in _get_all_published_results: {e}")
            return {'termly_results': [], 'session_results': []}

    def _serialize_termly_result(self, result):
        """Serialize a termly result object"""
        try:
            # Get attendance data if available
            attendance_data = {
                'times_opened': 0,
                'times_present': 0
            }
            
            # Try to get attendance from the attendance app
            try:
                from attendance.models import StudentAttendance
                attendance = StudentAttendance.objects.filter(
                    student=result.student,
                    term=result.term
                ).first()
                if attendance:
                    attendance_data = {
                        'times_opened': attendance.times_opened or 0,
                        'times_present': attendance.times_present or 0
                    }
            except:
                pass
            
            return {
                'id': result.id,
                'student': {
                    'id': result.student.id,
                    'name': result.student.full_name,
                    'username': result.student.user.username if result.student.user else None,
                    'admission_number': result.student.registration_number,
                    'class': result.student.student_class.name if result.student.student_class else 'Unknown',
                    'education_level': result.student.education_level,
                    'house': result.student.house.name if result.student.house else None
                },
                'term': {
                    'id': result.exam_session.id,
                    'name': result.exam_session.name,
                    'academic_session': {
                        'id': result.exam_session.academic_session.id,
                        'name': result.exam_session.academic_session.name,
                        'start_year': result.exam_session.academic_session.start_year,
                        'end_year': result.exam_session.academic_session.end_year
                    }
                },
                'subjects': self._get_subject_results(result),
                'total_score': getattr(result, 'total_score', 0),
                'average_score': getattr(result, 'average_score', 0),
                'overall_grade': getattr(result, 'overall_grade', 'N/A'),
                'class_position': getattr(result, 'class_position', 0),
                'total_students': getattr(result, 'total_students', 0),
                'attendance': attendance_data,
                'next_term_begins': getattr(result, 'next_term_begins', ''),
                'class_teacher_remark': getattr(result, 'class_teacher_remark', ''),
                'head_teacher_remark': getattr(result, 'head_teacher_remark', ''),
                'is_published': getattr(result, 'is_published', False),
                'created_at': result.created_at.isoformat() if hasattr(result, 'created_at') else '',
                'updated_at': result.updated_at.isoformat() if hasattr(result, 'updated_at') else ''
            }
        except Exception as e:
            print(f"Error serializing termly result: {e}")
            return None

    def _serialize_session_result(self, result):
        """Serialize a session result object"""
        try:
            return {
                'id': result.id,
                'student': {
                    'id': result.student.id,
                    'name': result.student.full_name,
                    'username': result.student.user.username if result.student.user else None,
                    'admission_number': result.student.registration_number,
                    'class': result.student.student_class.name if result.student.student_class else 'Unknown',
                    'education_level': result.student.education_level,
                    'house': result.student.house.name if result.student.house else None
                },
                'academic_session': {
                    'id': result.academic_session.id,
                    'name': result.academic_session.name,
                    'start_year': result.academic_session.start_year,
                    'end_year': result.academic_session.end_year
                },
                'term1_total': getattr(result, 'term1_total', 0),
                'term2_total': getattr(result, 'term2_total', 0),
                'term3_total': getattr(result, 'term3_total', 0),
                'average_for_year': getattr(result, 'average_for_year', 0),
                'obtainable': getattr(result, 'obtainable', 0),
                'obtained': getattr(result, 'obtained', 0),
                'overall_grade': getattr(result, 'overall_grade', 'N/A'),
                'class_position': getattr(result, 'class_position', 0),
                'total_students': getattr(result, 'total_students', 0),
                'subjects': self._get_session_subject_results(result),
                'is_published': getattr(result, 'is_published', False),
                'created_at': result.created_at.isoformat() if hasattr(result, 'created_at') else '',
                'updated_at': result.updated_at.isoformat() if hasattr(result, 'updated_at') else ''
            }
        except Exception as e:
            print(f"Error serializing session result: {e}")
            return None

    def _get_subject_results(self, result):
        """Get subject results for a termly result"""
        try:
            subjects = []
            
            # Try to get subject results based on the result type
            if hasattr(result, 'subjects'):
                # If the result has a subjects relationship
                for subject_result in result.subjects.all():
                    subjects.append({
                        'subject': {
                            'id': subject_result.subject.id,
                            'name': subject_result.subject.name,
                            'code': subject_result.subject.code
                        },
                        'test1_score': getattr(subject_result, 'test1_score', 0),
                        'test2_score': getattr(subject_result, 'test2_score', 0),
                        'test3_score': getattr(subject_result, 'test3_score', 0),
                        'exam_score': getattr(subject_result, 'exam_score', 0),
                        'total_score': getattr(subject_result, 'total_score', 0),
                        'percentage': getattr(subject_result, 'percentage', 0),
                        'grade': getattr(subject_result, 'grade', 'N/A'),
                        'position': getattr(subject_result, 'position', 0),
                        'class_average': getattr(subject_result, 'class_average', 0),
                        'highest_in_class': getattr(subject_result, 'highest_in_class', 0),
                        'lowest_in_class': getattr(subject_result, 'lowest_in_class', 0),
                        'teacher_remark': getattr(subject_result, 'teacher_remark', '')
                    })
            
            return subjects
        except Exception as e:
            print(f"Error getting subject results: {e}")
            return []

    def _get_session_subject_results(self, result):
        """Get subject results for a session result"""
        try:
            subjects = []
            
            # Try to get subject results based on the result type
            if hasattr(result, 'subjects'):
                # If the result has a subjects relationship
                for subject_result in result.subjects.all():
                    subjects.append({
                        'subject': {
                            'id': subject_result.subject.id,
                            'name': subject_result.subject.name,
                            'code': subject_result.subject.code
                        },
                        'term1_score': getattr(subject_result, 'term1_score', 0),
                        'term2_score': getattr(subject_result, 'term2_score', 0),
                        'term3_score': getattr(subject_result, 'term3_score', 0),
                        'average_score': getattr(subject_result, 'average_score', 0),
                        'class_average': getattr(subject_result, 'class_average', 0),
                        'highest_in_class': getattr(subject_result, 'highest_in_class', 0),
                        'lowest_in_class': getattr(subject_result, 'lowest_in_class', 0),
                        'position': getattr(subject_result, 'position', 0),
                        'teacher_remark': getattr(subject_result, 'teacher_remark', '')
                    })
            
            return subjects
        except Exception as e:
            print(f"Error getting session subject results: {e}")
            return []
