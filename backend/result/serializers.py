from rest_framework import serializers
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
from students.serializers import StudentDetailSerializer as StudentSerializer
from subject.serializers import SubjectSerializer
from academics.serializers import AcademicSessionSerializer


class GradingSystemSerializer(serializers.ModelSerializer):
    class Meta:
        model = GradingSystem
        fields = '__all__'


class GradeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Grade
        fields = '__all__'


class AssessmentTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssessmentType
        fields = '__all__'


class ExamSessionSerializer(serializers.ModelSerializer):
    academic_session = AcademicSessionSerializer(read_only=True)
    
    class Meta:
        model = ExamSession
        fields = '__all__'


class AssessmentScoreSerializer(serializers.ModelSerializer):
    assessment_type = AssessmentTypeSerializer(read_only=True)
    
    class Meta:
        model = AssessmentScore
        fields = '__all__'


class ResultCommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResultComment
        fields = '__all__'


class StudentResultSerializer(serializers.ModelSerializer):
    student = StudentSerializer(read_only=True)
    subject = SubjectSerializer(read_only=True)
    exam_session = ExamSessionSerializer(read_only=True)
    grading_system = GradingSystemSerializer(read_only=True)
    assessment_scores = AssessmentScoreSerializer(many=True, read_only=True)
    comments = ResultCommentSerializer(many=True, read_only=True)
    
    class Meta:
        model = StudentResult
        fields = '__all__'


class StudentTermResultSerializer(serializers.ModelSerializer):
    student = StudentSerializer(read_only=True)
    academic_session = AcademicSessionSerializer(read_only=True)
    comments = ResultCommentSerializer(many=True, read_only=True)
    
    class Meta:
        model = StudentTermResult
        fields = '__all__'


class ResultSheetSerializer(serializers.ModelSerializer):
    exam_session = ExamSessionSerializer(read_only=True)
    
    class Meta:
        model = ResultSheet
        fields = '__all__'


# Detailed result serializer for the frontend
class DetailedStudentResultSerializer(serializers.ModelSerializer):
    student = StudentSerializer(read_only=True)
    subject = SubjectSerializer(read_only=True)
    exam_session = ExamSessionSerializer(read_only=True)
    assessment_scores = AssessmentScoreSerializer(many=True, read_only=True)
    
    class Meta:
        model = StudentResult
        fields = [
            'id', 'student', 'subject', 'exam_session', 'ca_score', 'exam_score',
            'total_score', 'percentage', 'grade', 'grade_point', 'is_passed',
            'position', 'remarks', 'status', 'assessment_scores', 'created_at'
        ]


# Term result with all subjects for a student
class StudentTermResultDetailSerializer(serializers.ModelSerializer):
    student = StudentSerializer(read_only=True)
    academic_session = AcademicSessionSerializer(read_only=True)
    subject_results = DetailedStudentResultSerializer(many=True, read_only=True)
    comments = ResultCommentSerializer(many=True, read_only=True)
    
    class Meta:
        model = StudentTermResult
        fields = [
            'id', 'student', 'academic_session', 'term', 'total_subjects',
            'subjects_passed', 'subjects_failed', 'total_score', 'average_score',
            'gpa', 'class_position', 'total_students', 'status', 'remarks',
            'next_term_begins', 'subject_results', 'comments', 'created_at'
        ] 