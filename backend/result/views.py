from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Avg, Count, Max, Min
from django.shortcuts import get_object_or_404

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
    filterset_fields = ['student', 'subject', 'exam_session', 'status', 'is_passed']
    search_fields = ['student__full_name', 'subject__name']

    def get_queryset(self):
        queryset = super().get_queryset()
        # Add prefetch_related for better performance
        return queryset.select_related(
            'student', 'subject', 'exam_session', 'grading_system'
        ).prefetch_related('assessment_scores', 'comments')

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
