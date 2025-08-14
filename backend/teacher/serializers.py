from rest_framework import serializers
from .models import Teacher, TeacherAssignment
from classroom.models import GradeLevel, Section
from subject.models import Subject


class TeacherAssignmentSerializer(serializers.ModelSerializer):
    grade_level_name = serializers.CharField(source='grade_level.name', read_only=True)
    section_name = serializers.CharField(source='section.name', read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    education_level = serializers.CharField(source='grade_level.education_level', read_only=True)

    class Meta:
        model = TeacherAssignment
        fields = [
            'id', 'teacher', 'grade_level', 'section', 'subject',
            'grade_level_name', 'section_name', 'subject_name', 'education_level'
        ]


class TeacherSerializer(serializers.ModelSerializer):
    # User creation fields
    user_email = serializers.EmailField(write_only=True)
    user_first_name = serializers.CharField(write_only=True, max_length=30)
    user_last_name = serializers.CharField(write_only=True, max_length=30)
    user_middle_name = serializers.CharField(write_only=True, max_length=30, required=False, allow_blank=True)
    
    # Expose fields from related user object
    first_name = serializers.CharField(source="user.first_name", read_only=True)
    last_name = serializers.CharField(source="user.last_name", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)
    is_active = serializers.BooleanField(source="user.is_active", read_only=True)
    user = serializers.SerializerMethodField(read_only=True)
    staff_type = serializers.CharField()
    level = serializers.CharField(allow_blank=True, allow_null=True)
    
    # New fields for multiple assignments
    assignments = serializers.ListField(
        child=serializers.DictField(),
        write_only=True, 
        required=False,
        help_text="List of assignments with grade_level_id, section_id, and subject_id"
    )
    
    # General subject assignments (without specific grade levels)
    subjects = serializers.ListField(
        child=serializers.CharField(),
        write_only=True,
        required=False,
        help_text="List of subject IDs for general teacher assignments"
    )
    
    assigned_subjects = serializers.SerializerMethodField(read_only=True)
    teacher_assignments = TeacherAssignmentSerializer(many=True, read_only=True)
    classroom_assignments = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Teacher
        fields = [
            "id",
            "user_email",
            "user_first_name",
            "user_last_name",
            "user_middle_name",
            "first_name",
            "last_name",
            "email",
            "is_active",
            "user",
            "phone_number",
            "address",
            "created_at",
            "staff_type",
            "level",
            "subjects",
            "assignments",
            "assigned_subjects",
            "teacher_assignments",
            "classroom_assignments",
            "employee_id",
            "hire_date",
            "qualification",
            "specialization",
            "photo",
        ]

    def create(self, validated_data):
        assignments = validated_data.pop("assignments", [])
        subjects = validated_data.pop("subjects", [])
        
        # Extract user creation data
        user_email = validated_data.pop("user_email")
        user_first_name = validated_data.pop("user_first_name")
        user_last_name = validated_data.pop("user_last_name")
        user_middle_name = validated_data.pop("user_middle_name", "")
        
        # Generate username and password
        import secrets
        import string
        from utils import generate_unique_username
        
        teacher_password = "".join(
            secrets.choice(string.ascii_letters + string.digits) for _ in range(10)
        )
        teacher_username = generate_unique_username("teacher", employee_id=validated_data.get('employee_id'))
        
        # Create user
        from users.models import CustomUser
        teacher_user = CustomUser.objects.create_user(
            email=user_email,
            username=teacher_username,
            first_name=user_first_name,
            last_name=user_last_name,
            middle_name=user_middle_name,
            role="teacher",
            password=teacher_password,
            is_active=True,
        )
        
        # Store generated credentials for response
        self._generated_teacher_password = teacher_password
        self._generated_teacher_username = teacher_username
        
        # Create teacher profile
        teacher = Teacher.objects.create(user=teacher_user, **validated_data)
        
        # Handle assignments based on educational level
        level = validated_data.get('level', '')
        is_primary_level = level in ['nursery', 'primary']
        
        if is_primary_level:
            # For primary/nursery: Create single classroom assignment with all selected subjects
            if assignments and len(assignments) > 0:
                assignment = assignments[0]  # Take the first (and only) assignment
                grade_level_id = assignment.get('grade_level_id')
                section_id = assignment.get('section_id')
                
                if grade_level_id and section_id and subjects:
                    print(f"Creating classroom assignment for primary/nursery teacher")
                    print(f"Grade level: {grade_level_id}, Section: {section_id}")
                    print(f"Subjects: {subjects}")
                    
                    # Create assignments for all selected subjects in the single classroom
                    for subject_id in subjects:
                        try:
                            TeacherAssignment.objects.create(
                                teacher=teacher,
                                grade_level_id=grade_level_id,
                                section_id=section_id,
                                subject_id=subject_id
                            )
                            print(f"Successfully created assignment for subject {subject_id}")
                        except Exception as e:
                            print(f"Error creating assignment for subject {subject_id}: {e}")
                else:
                    print("Missing required data for primary/nursery assignment")
            else:
                print("No assignment data provided for primary/nursery teacher")
        else:
            # For secondary: Create specific subject assignments
            if assignments:
                print(f"Creating {len(assignments)} specific assignments for secondary teacher")
                for i, assignment_data in enumerate(assignments):
                    print(f"Processing assignment {i+1}: {assignment_data}")
                    try:
                        grade_level_id = assignment_data.get('grade_level_id')
                        section_id = assignment_data.get('section_id')
                        subject_ids = assignment_data.get('subject_ids', [])
                        
                        print(f"Grade level ID: {grade_level_id}, Section ID: {section_id}, Subject IDs: {subject_ids}")
                        
                        if grade_level_id and section_id and subject_ids:
                            # Create a separate assignment for each subject
                            for subject_id in subject_ids:
                                print(f"Creating assignment for subject {subject_id}")
                                TeacherAssignment.objects.create(
                                    teacher=teacher,
                                    grade_level_id=grade_level_id,
                                    section_id=section_id,
                                    subject_id=subject_id
                                )
                                print(f"Successfully created assignment for subject {subject_id}")
                        else:
                            print(f"Skipping assignment {i+1}: missing required data")
                    except Exception as e:
                        print(f"Error creating assignment {i+1}: {e}")
                        # Continue with other assignments even if one fails
            else:
                print("No specific assignments provided for secondary teacher")
        
        return teacher

    def update(self, instance, validated_data):
        assignments = validated_data.pop("assignments", None)
        subjects = validated_data.pop("subjects", [])
        teacher = super().update(instance, validated_data)
        
        # Update subject assignments if provided
        if subjects is not None:
            print(f"Updating subjects for teacher {teacher.id}: {subjects}")
            
            # Clear existing TeacherAssignment records for this teacher
            TeacherAssignment.objects.filter(teacher=teacher).delete()
            
            # Get the teacher's level to determine appropriate grade levels
            level = validated_data.get('level', '') or instance.level
            print(f"Teacher level: {level}")
            
            # Find appropriate grade levels based on teacher's level
            from classroom.models import GradeLevel, Section
            
            if level == 'nursery':
                grade_levels = GradeLevel.objects.filter(education_level='NURSERY')
            elif level == 'primary':
                grade_levels = GradeLevel.objects.filter(education_level='PRIMARY')
            elif level == 'secondary':
                grade_levels = GradeLevel.objects.filter(education_level='SECONDARY')
            else:
                # If no specific level, use all grade levels
                grade_levels = GradeLevel.objects.all()
            
            print(f"Found {grade_levels.count()} grade levels for level {level}")
            
            # Create TeacherAssignment records for each subject and grade level
            for subject_id in subjects:
                for grade_level in grade_levels:
                    # Get the first section for each grade level
                    section = grade_level.sections.first()
                    if section:
                        try:
                            TeacherAssignment.objects.create(
                                teacher=teacher,
                                grade_level=grade_level,
                                section=section,
                                subject_id=subject_id
                            )
                            print(f"Created TeacherAssignment: {teacher} - {subject_id} - {grade_level.name} - {section.name}")
                        except Exception as e:
                            print(f"Error creating TeacherAssignment for subject {subject_id}, grade {grade_level.name}: {e}")
        
        # Update specific assignments if provided
        if assignments is not None:
            # Clear existing assignments
            TeacherAssignment.objects.filter(teacher=teacher).delete()
            
            # Handle assignments based on educational level
            level = validated_data.get('level', '') or instance.level
            is_primary_level = level in ['nursery', 'primary']
            
            if is_primary_level:
                # For primary/nursery: Create single classroom assignment with all selected subjects
                if assignments and len(assignments) > 0:
                    assignment = assignments[0]  # Take the first (and only) assignment
                    grade_level_id = assignment.get('grade_level_id')
                    section_id = assignment.get('section_id')
                    
                    if grade_level_id and section_id and subjects:
                        print(f"Updating classroom assignment for primary/nursery teacher")
                        # Create assignments for all selected subjects in the single classroom
                        for subject_id in subjects:
                            try:
                                TeacherAssignment.objects.create(
                                    teacher=teacher,
                                    grade_level_id=grade_level_id,
                                    section_id=section_id,
                                    subject_id=subject_id
                                )
                                print(f"Successfully updated assignment for subject {subject_id}")
                            except Exception as e:
                                print(f"Error updating assignment for subject {subject_id}: {e}")
            else:
                # For secondary: Create specific subject assignments
                if assignments and len(assignments) > 0:
                    print(f"Updating {len(assignments)} specific assignments for secondary teacher")
                    for i, assignment_data in enumerate(assignments):
                        try:
                            grade_level_id = assignment_data.get('grade_level_id')
                            section_id = assignment_data.get('section_id')
                            subject_ids = assignment_data.get('subject_ids', [])
                            
                            if grade_level_id and section_id and subject_ids:
                                # Create a separate assignment for each subject
                                for subject_id in subject_ids:
                                    TeacherAssignment.objects.create(
                                        teacher=teacher,
                                        grade_level_id=grade_level_id,
                                        section_id=section_id,
                                        subject_id=subject_id
                                    )
                                    print(f"Successfully updated assignment for subject {subject_id}")
                            else:
                                print(f"Skipping assignment {i+1}: missing required data")
                        except Exception as e:
                            print(f"Error updating assignment {i+1}: {e}")
                else:
                    # For secondary teachers with only subjects (no specific assignments)
                    # Create assignments for all subjects across all secondary grade levels
                    print(f"Creating general subject assignments for secondary teacher with {len(subjects)} subjects")
                    secondary_grade_levels = GradeLevel.objects.filter(education_level='SECONDARY')
                    
                    for subject_id in subjects:
                        for grade_level in secondary_grade_levels:
                            section = grade_level.sections.first()
                            if section:
                                try:
                                    TeacherAssignment.objects.create(
                                        teacher=teacher,
                                        grade_level=grade_level,
                                        section=section,
                                        subject_id=subject_id
                                    )
                                    print(f"Created general assignment: {subject_id} - {grade_level.name} - {section.name}")
                                except Exception as e:
                                    print(f"Error creating general assignment for subject {subject_id}: {e}")
        
        return teacher

    def get_assigned_subjects(self, obj):
        """Get unique subjects assigned to this teacher"""
        assignments = TeacherAssignment.objects.filter(teacher=obj).select_related('subject')
        unique_subjects = {}
        
        for assignment in assignments:
            subject_id = assignment.subject.id
            if subject_id not in unique_subjects:
                unique_subjects[subject_id] = {
                    "id": assignment.subject.id,
                    "name": assignment.subject.name,
                    "assignments": []
                }
            
            unique_subjects[subject_id]["assignments"].append({
                "grade_level": assignment.grade_level.name,
                "section": assignment.section.name,
                "education_level": assignment.grade_level.education_level
            })
        
        return list(unique_subjects.values())

    def get_user(self, obj):
        if obj.user:
            return {
                "id": obj.user.id,
                "username": obj.user.username,
                "email": obj.user.email,
                "first_name": obj.user.first_name,
                "last_name": obj.user.last_name,
                "full_name": obj.user.full_name,
                "is_active": obj.user.is_active,
                "date_joined": obj.user.date_joined,
            }
        return None

    def to_representation(self, instance):
        """Add generated credentials to the response for newly created teachers"""
        data = super().to_representation(instance)
        
        # Add generated credentials if they exist (for newly created teachers)
        if hasattr(self, '_generated_teacher_username') and hasattr(self, '_generated_teacher_password'):
            data['user_username'] = self._generated_teacher_username
            data['user_password'] = self._generated_teacher_password
        
        return data

    def get_classroom_assignments(self, obj):
        """Get actual classroom assignments for this teacher"""
        from classroom.models import ClassroomTeacherAssignment
        
        assignments = ClassroomTeacherAssignment.objects.filter(
            teacher=obj,
            is_active=True
        ).select_related(
            'classroom',
            'classroom__section',
            'classroom__section__grade_level',
            'classroom__academic_year',
            'classroom__term',
            'subject'
        )
        
        classroom_assignments = []
        for assignment in assignments:
            classroom_assignments.append({
                'id': assignment.id,
                'classroom_name': assignment.classroom.name,
                'classroom_id': assignment.classroom.id,
                'section_name': assignment.classroom.section.name,
                'grade_level_name': assignment.classroom.section.grade_level.name,
                'education_level': assignment.classroom.section.grade_level.education_level,
                'academic_year': assignment.classroom.academic_year.name,
                'term': assignment.classroom.term.name,
                'subject_name': assignment.subject.name,
                'subject_code': assignment.subject.code,
                'assigned_date': assignment.assigned_date,
                'room_number': assignment.classroom.room_number,
                'student_count': assignment.classroom.current_enrollment,
                'max_capacity': assignment.classroom.max_capacity,
                'is_class_teacher': assignment.classroom.class_teacher == obj
            })
        
        return classroom_assignments
