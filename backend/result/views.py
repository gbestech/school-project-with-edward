from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
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
    AssessmentType
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
    StudentTermResultDetailSerializer
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
