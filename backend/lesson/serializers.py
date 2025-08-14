from rest_framework import serializers
from .models import Lesson, LessonAttendance, LessonResource, LessonAssessment
from teacher.serializers import TeacherSerializer
from classroom.serializers import ClassroomSerializer
from subject.serializers import SubjectSerializer
from classroom.serializers import StudentSerializer
from django.utils import timezone
from datetime import datetime, timedelta


class LessonResourceSerializer(serializers.ModelSerializer):
    """Serializer for lesson resources"""
    
    class Meta:
        model = LessonResource
        fields = [
            'id', 'title', 'resource_type', 'url', 'file_path', 
            'description', 'is_required'
        ]


class LessonAssessmentSerializer(serializers.ModelSerializer):
    """Serializer for lesson assessments"""
    
    class Meta:
        model = LessonAssessment
        fields = [
            'id', 'title', 'assessment_type', 'description', 'due_date',
            'total_points', 'weight_percentage'
        ]


class LessonAttendanceSerializer(serializers.ModelSerializer):
    """Serializer for lesson attendance"""
    student = StudentSerializer(read_only=True)
    student_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = LessonAttendance
        fields = [
            'id', 'student', 'student_id', 'status', 'arrival_time', 'notes'
        ]


class LessonSerializer(serializers.ModelSerializer):
    """Main lesson serializer with nested relationships"""
    
    # Nested serializers for related objects
    teacher = TeacherSerializer(read_only=True)
    classroom = ClassroomSerializer(read_only=True)
    subject = SubjectSerializer(read_only=True)
    attendances = LessonAttendanceSerializer(many=True, read_only=True)
    resources = LessonResourceSerializer(many=True, read_only=True)
    assessments = LessonAssessmentSerializer(many=True, read_only=True)
    
    # Write-only fields for creating/updating
    teacher_id = serializers.IntegerField(write_only=True)
    classroom_id = serializers.IntegerField(write_only=True)
    subject_id = serializers.IntegerField(write_only=True)
    
    # Computed properties
    time_slot = serializers.CharField(read_only=True)
    duration_formatted = serializers.CharField(read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)
    is_today = serializers.BooleanField(read_only=True)
    is_upcoming = serializers.BooleanField(read_only=True)
    can_start = serializers.BooleanField(read_only=True)
    can_complete = serializers.BooleanField(read_only=True)
    can_cancel = serializers.BooleanField(read_only=True)
    
    # Status management
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    lesson_type_display = serializers.CharField(source='get_lesson_type_display', read_only=True)
    difficulty_level_display = serializers.CharField(source='get_difficulty_level_display', read_only=True)
    
    class Meta:
        model = Lesson
        fields = [
            'id', 'title', 'description', 'lesson_type', 'lesson_type_display',
            'difficulty_level', 'difficulty_level_display', 'teacher', 'teacher_id',
            'classroom', 'classroom_id', 'subject', 'subject_id', 'date',
            'start_time', 'end_time', 'duration_minutes', 'duration_formatted',
            'status', 'status_display', 'actual_start_time', 'actual_end_time',
            'completion_percentage', 'learning_objectives', 'key_concepts',
            'materials_needed', 'assessment_criteria', 'teacher_notes',
            'lesson_notes', 'student_feedback', 'admin_notes', 'attendance_count',
            'participation_score', 'resources', 'attachments', 'is_recurring',
            'recurring_pattern', 'parent_lesson', 'is_active',
            'requires_special_equipment', 'is_online_lesson', 'requires_substitution',
            'created_at', 'updated_at', 'created_by', 'last_modified_by',
            'attendances', 'assessments', 'time_slot', 'is_overdue', 'is_today',
            'is_upcoming', 'can_start', 'can_complete', 'can_cancel'
        ]
        read_only_fields = ['created_at', 'updated_at', 'created_by', 'last_modified_by']
    
    def validate(self, data):
        """Custom validation for lesson data"""
        # Check if end time is after start time
        if 'start_time' in data and 'end_time' in data:
            if data['start_time'] >= data['end_time']:
                raise serializers.ValidationError("End time must be after start time")
        
        # Check if date is not in the past for new lessons
        if 'date' in data and not self.instance:
            if data['date'] < timezone.now().date():
                raise serializers.ValidationError("Cannot schedule lessons in the past")
        
        # Check for scheduling conflicts
        if 'classroom_id' in data and 'date' in data and 'start_time' in data and 'end_time' in data:
            conflicting_lessons = Lesson.objects.filter(
                classroom_id=data['classroom_id'],
                date=data['date'],
                status__in=['scheduled', 'in_progress']
            ).exclude(id=self.instance.id if self.instance else None)
            
            # Check for time overlap
            for lesson in conflicting_lessons:
                if (data['start_time'] < lesson.end_time and data['end_time'] > lesson.start_time):
                    raise serializers.ValidationError(
                        f"Time slot conflicts with existing lesson: {lesson.title} "
                        f"({lesson.start_time} - {lesson.end_time})"
                    )
        
        # Validate duration matches start and end times
        if 'start_time' in data and 'end_time' in data and 'duration_minutes' in data:
            start_dt = datetime.combine(data.get('date', timezone.now().date()), data['start_time'])
            end_dt = datetime.combine(data.get('date', timezone.now().date()), data['end_time'])
            calculated_duration = int((end_dt - start_dt).total_seconds() / 60)
            
            if calculated_duration != data['duration_minutes']:
                raise serializers.ValidationError(
                    f"Duration ({data['duration_minutes']} minutes) doesn't match "
                    f"start and end times (calculated: {calculated_duration} minutes)"
                )
        
        return data
    
    def create(self, validated_data):
        """Create lesson with proper user tracking"""
        validated_data['created_by'] = self.context['request'].user
        validated_data['last_modified_by'] = self.context['request'].user
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        """Update lesson with proper user tracking"""
        validated_data['last_modified_by'] = self.context['request'].user
        return super().update(instance, validated_data)


class LessonListSerializer(serializers.ModelSerializer):
    """Simplified serializer for lesson lists"""
    
    teacher_name = serializers.CharField(source='teacher.user.full_name', read_only=True)
    classroom_name = serializers.CharField(source='classroom.name', read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    time_slot = serializers.CharField(read_only=True)
    duration_formatted = serializers.CharField(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    lesson_type_display = serializers.CharField(source='get_lesson_type_display', read_only=True)
    
    class Meta:
        model = Lesson
        fields = [
            'id', 'title', 'teacher_name', 'classroom_name', 'subject_name',
            'date', 'time_slot', 'duration_formatted', 'status', 'status_display',
            'lesson_type', 'lesson_type_display', 'completion_percentage',
            'is_overdue', 'is_today', 'is_upcoming'
        ]


class LessonCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating lessons with validation"""
    
    class Meta:
        model = Lesson
        fields = [
            'title', 'description', 'lesson_type', 'difficulty_level',
            'teacher_id', 'classroom_id', 'subject_id', 'date', 'start_time',
            'end_time', 'duration_minutes', 'learning_objectives', 'key_concepts',
            'materials_needed', 'assessment_criteria', 'teacher_notes',
            'is_recurring', 'recurring_pattern', 'requires_special_equipment',
            'is_online_lesson'
        ]
    
    def validate(self, data):
        """Enhanced validation for lesson creation"""
        # Call parent validation
        data = super().validate(data)
        
        # Additional business logic validation
        if data.get('is_recurring') and not data.get('recurring_pattern'):
            raise serializers.ValidationError("Recurring pattern is required for recurring lessons")
        
        return data


class LessonUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating lessons with status management"""
    
    class Meta:
        model = Lesson
        fields = [
            'title', 'description', 'lesson_type', 'difficulty_level',
            'status', 'actual_start_time', 'actual_end_time', 'completion_percentage',
            'learning_objectives', 'key_concepts', 'materials_needed',
            'assessment_criteria', 'teacher_notes', 'lesson_notes',
            'student_feedback', 'admin_notes', 'attendance_count',
            'participation_score', 'resources', 'attachments'
        ]
    
    def validate_status(self, value):
        """Validate status transitions"""
        if self.instance:
            current_status = self.instance.status
            allowed_transitions = {
                'scheduled': ['in_progress', 'cancelled', 'postponed'],
                'in_progress': ['completed', 'cancelled'],
                'completed': [],  # Cannot change from completed
                'cancelled': [],  # Cannot change from cancelled
                'postponed': ['scheduled', 'cancelled'],
            }
            
            if value != current_status and value not in allowed_transitions.get(current_status, []):
                raise serializers.ValidationError(
                    f"Cannot transition from '{current_status}' to '{value}'"
                )
        
        return value


class LessonStatusUpdateSerializer(serializers.ModelSerializer):
    """Serializer for quick status updates"""
    
    class Meta:
        model = Lesson
        fields = ['status', 'actual_start_time', 'actual_end_time', 'completion_percentage']
    
    def validate(self, data):
        """Validate status-specific data"""
        status = data.get('status')
        
        if status == 'in_progress' and not data.get('actual_start_time'):
            data['actual_start_time'] = timezone.now().time()
        
        if status == 'completed':
            if not data.get('actual_end_time'):
                data['actual_end_time'] = timezone.now().time()
            if not data.get('completion_percentage'):
                data['completion_percentage'] = 100
        
        return data


class LessonBulkCreateSerializer(serializers.Serializer):
    """Serializer for bulk lesson creation"""
    
    lessons = LessonCreateSerializer(many=True)
    
    def create(self, validated_data):
        lessons_data = validated_data['lessons']
        created_lessons = []
        
        for lesson_data in lessons_data:
            lesson_data['created_by'] = self.context['request'].user
            lesson_data['last_modified_by'] = self.context['request'].user
            lesson = Lesson.objects.create(**lesson_data)
            created_lessons.append(lesson)
        
        return {'lessons': created_lessons}
