from rest_framework import serializers
from .models import Teacher, AssignmentRequest, TeacherSchedule
from classroom.models import GradeLevel, Section, ClassroomTeacherAssignment, Classroom
from subject.models import Subject


# Note: TeacherAssignment model has been deprecated in favor of ClassroomTeacherAssignment
# which provides proper teacher-subject-classroom mapping
class TeacherAssignmentSerializer(serializers.ModelSerializer):
    """Serializer for the new ClassroomTeacherAssignment model"""
    grade_level_name = serializers.CharField(source='classroom.section.grade_level.name', read_only=True)
    section_name = serializers.CharField(source='classroom.section.name', read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    education_level = serializers.CharField(source='classroom.section.grade_level.education_level', read_only=True)
    classroom_name = serializers.CharField(source='classroom.name', read_only=True)

    class Meta:
        model = ClassroomTeacherAssignment
        fields = [
            'id', 'teacher', 'classroom', 'subject',
            'grade_level_name', 'section_name', 'subject_name', 'education_level',
            'classroom_name', 'is_primary_teacher', 'periods_per_week', 'assigned_date', 'is_active'
        ]


class AssignmentRequestSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source='teacher.user.full_name', read_only=True)
    teacher_id = serializers.IntegerField(source='teacher.id', read_only=True)
    requested_subjects_names = serializers.SerializerMethodField()
    requested_grade_levels_names = serializers.SerializerMethodField()
    requested_sections_names = serializers.SerializerMethodField()
    reviewed_by_name = serializers.CharField(source='reviewed_by.full_name', read_only=True)
    days_since_submitted = serializers.SerializerMethodField()
    
    class Meta:
        model = AssignmentRequest
        fields = [
            'id', 'teacher', 'teacher_name', 'teacher_id', 'request_type', 'title', 'description',
            'requested_subjects', 'requested_subjects_names', 'requested_grade_levels', 
            'requested_grade_levels_names', 'requested_sections', 'requested_sections_names',
            'preferred_schedule', 'reason', 'status', 'admin_notes', 'submitted_at', 
            'reviewed_at', 'reviewed_by', 'reviewed_by_name', 'days_since_submitted'
        ]
        read_only_fields = ['teacher', 'submitted_at', 'reviewed_at', 'reviewed_by']
    
    def get_requested_subjects_names(self, obj):
        return [subject.name for subject in obj.requested_subjects.all()]
    
    def get_requested_grade_levels_names(self, obj):
        return [grade.name for grade in obj.requested_grade_levels.all()]
    
    def get_requested_sections_names(self, obj):
        return [section.name for section in obj.requested_sections.all()]
    
    def get_days_since_submitted(self, obj):
        from django.utils import timezone
        delta = timezone.now() - obj.submitted_at
        return delta.days


class TeacherScheduleSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    classroom_name = serializers.CharField(source='classroom.name', read_only=True)
    
    class Meta:
        model = TeacherSchedule
        fields = [
            'id', 'teacher', 'subject', 'classroom', 'subject_name', 'classroom_name',
            'day_of_week', 'start_time', 'end_time', 'is_active'
        ]


class TeacherSerializer(serializers.ModelSerializer):
    # User creation fields (handle both formats)
    first_name = serializers.CharField(write_only=True, required=False)
    last_name = serializers.CharField(write_only=True, required=False)
    password = serializers.CharField(write_only=True, required=False)
    
    # Alternative user creation fields (from frontend)
    user_first_name = serializers.CharField(write_only=True, required=False)
    user_last_name = serializers.CharField(write_only=True, required=False)
    user_email = serializers.EmailField(write_only=True, required=False)
    user_middle_name = serializers.CharField(write_only=True, required=False)
    
    # User profile fields
    bio = serializers.CharField(write_only=True, required=False)
    date_of_birth = serializers.DateField(write_only=True, required=False)
    
    # Assignment fields
    assignments = serializers.ListField(write_only=True, required=False)
    subjects = serializers.ListField(write_only=True, required=False)
    
    # Read-only computed fields
    full_name = serializers.CharField(source='user.full_name', read_only=True)
    email_readonly = serializers.CharField(source='user.email', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    is_active = serializers.BooleanField(source='user.is_active', read_only=True)
    user = serializers.SerializerMethodField()
    
    # Teacher assignments using the new model
    teacher_assignments = TeacherAssignmentSerializer(many=True, read_only=True)
    
    # New classroom assignments field for frontend compatibility
    classroom_assignments = serializers.SerializerMethodField()
    
    # Additional computed fields
    total_students = serializers.SerializerMethodField()
    total_subjects = serializers.SerializerMethodField()
    years_experience = serializers.SerializerMethodField()
    assigned_subjects = serializers.SerializerMethodField()
    
    class Meta:
        model = Teacher
        fields = [
            'id', 'user', 'employee_id', 'staff_type', 'level', 'phone_number', 'address',
            'date_of_birth', 'hire_date', 'qualification', 'specialization', 'photo', 'is_active',
            'created_at', 'updated_at',
            # User creation fields
            'first_name', 'last_name', 'password',
            # Alternative user creation fields (from frontend)
            'user_first_name', 'user_last_name', 'user_email', 'user_middle_name',
            # User profile fields
            'bio',
            # Assignment fields
            'assignments', 'subjects',
            # Read-only computed fields
            'full_name', 'email_readonly', 'username', 'is_active',
            # Teacher assignments
            'teacher_assignments',
            # New classroom assignments
            'classroom_assignments',
            # Additional computed fields
            'total_students', 'total_subjects', 'years_experience', 'assigned_subjects'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'user']

    def get_total_students(self, obj):
        """Get total number of students taught by this teacher"""
        from classroom.models import ClassroomTeacherAssignment
        assignments = ClassroomTeacherAssignment.objects.filter(
            teacher=obj, 
            is_active=True
        ).select_related('classroom')
        
        total_students = 0
        for assignment in assignments:
            total_students += assignment.classroom.current_enrollment
        
        return total_students

    def get_total_subjects(self, obj):
        """Get total number of subjects taught by this teacher"""
        from classroom.models import ClassroomTeacherAssignment
        return ClassroomTeacherAssignment.objects.filter(
            teacher=obj, 
            is_active=True
        ).count()

    def get_years_experience(self, obj):
        """Calculate years of experience"""
        from datetime import date
        if obj.hire_date:
            today = date.today()
            return today.year - obj.hire_date.year - (
                (today.month, today.day) < (obj.hire_date.month, obj.hire_date.day)
            )
        return 0

    def get_user(self, obj):
        """Returns user data including date_joined for sorting."""
        if obj.user:
            user_data = {
                'id': obj.user.id,
                'first_name': obj.user.first_name,
                'last_name': obj.user.last_name,
                'email': obj.user.email,
                'username': obj.user.username,
                'date_joined': obj.user.date_joined,
                'is_active': obj.user.is_active
            }
            
            # Add profile information if available
            try:
                if hasattr(obj.user, 'profile') and obj.user.profile:
                    user_data['bio'] = obj.user.profile.bio
                    user_data['date_of_birth'] = obj.user.profile.date_of_birth
            except Exception as e:
                print(f"❌ Error getting user profile data: {e}")
            
            return user_data
        return None

    def get_assigned_subjects(self, obj):
        """Returns the subjects assigned to this teacher."""
        from classroom.models import ClassroomTeacherAssignment
        assignments = ClassroomTeacherAssignment.objects.filter(
            teacher=obj,
            is_active=True
        ).select_related('subject')
        
        # Use a set to get unique subjects
        subjects = []
        seen_subject_ids = set()
        
        for assignment in assignments:
            if assignment.subject and assignment.subject.id not in seen_subject_ids:
                subjects.append({
                    'id': assignment.subject.id,
                    'name': assignment.subject.name,
                    'code': assignment.subject.code
                })
                seen_subject_ids.add(assignment.subject.id)
        
        return subjects

    def get_classroom_assignments(self, obj):
        """Returns the classroom assignments for this teacher in the format expected by the frontend."""
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
            classroom = assignment.classroom
            section = classroom.section
            grade_level = section.grade_level
            
            # Get student count for this classroom
            student_count = classroom.current_enrollment
            
            assignment_data = {
                'id': assignment.id,
                'classroom_name': classroom.name,
                'classroom_id': classroom.id,
                'section_id': section.id,  # Add section_id for attendance
                'section_name': section.name,
                'grade_level_name': grade_level.name,
                'education_level': grade_level.education_level,
                'academic_year': classroom.academic_year.name,
                'term': classroom.term.get_name_display(),
                'subject_name': assignment.subject.name,
                'subject_code': assignment.subject.code,
                'assigned_date': assignment.assigned_date.isoformat() if assignment.assigned_date else None,
                'room_number': classroom.room_number or '',
                'student_count': student_count,
                'max_capacity': classroom.max_capacity,
                'is_primary_teacher': assignment.is_primary_teacher,
                'periods_per_week': assignment.periods_per_week,
            }
            
            # Add stream information if available (for Senior Secondary)
            if hasattr(classroom, 'stream') and classroom.stream:
                assignment_data['stream_name'] = classroom.stream.name
                assignment_data['stream_type'] = classroom.stream.get_stream_type_display()
            
            classroom_assignments.append(assignment_data)
        
        return classroom_assignments

    def create(self, validated_data):
        print(f"🔍 TeacherSerializer.create called")
        print(f"🔍 Validated data keys: {list(validated_data.keys())}")
        
        # Extract user creation data (handle both formats)
        first_name = validated_data.pop('first_name', None) or validated_data.pop('user_first_name', None)
        last_name = validated_data.pop('last_name', None) or validated_data.pop('user_last_name', None)
        email = validated_data.pop('email', None) or validated_data.pop('user_email', None)
        password = validated_data.pop('password', None)
        
        # Remove user_middle_name from validated_data as it's not a Teacher model field
        validated_data.pop('user_middle_name', None)
        
        print(f"🔍 Extracted user data:")
        print(f"🔍 First name: {first_name}")
        print(f"🔍 Last name: {last_name}")
        print(f"🔍 Email: {email}")
        print(f"🔍 Password: {'*' * len(password) if password else 'None'}")
        
        # Extract assignment data
        assignments = validated_data.pop('assignments', None)
        subjects = validated_data.pop('subjects', [])
        
        # Create user if credentials provided
        user = None
        if email:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            
            print(f"🔍 Creating user with email: {email}")
            print(f"🔍 First name: {first_name}")
            print(f"🔍 Last name: {last_name}")
            
            # Generate a default password if none provided
            if not password:
                import secrets
                import string
                password = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(12))
                print(f"🔍 Generated password: {password}")
            
            try:
                # Generate unique username in format: TCH/GTS/AUG/25/EMP035
                from datetime import datetime
                current_date = datetime.now()
                month = current_date.strftime('%b').upper()
                year = str(current_date.year)[-2:]  # Last 2 digits of year
                
                # Get employee_id from validated_data
                employee_id = validated_data.get('employee_id', 'EMP001')
                
                # Generate username format: TCH/GTS/MONTH/YEAR/EMPLOYEE_ID
                username = f"TCH/GTS/{month}/{year}/{employee_id}"
                
                # Ensure username is unique
                counter = 1
                original_username = username
                while User.objects.filter(username=username).exists():
                    username = f"{original_username}_{counter}"
                    counter += 1
                
                print(f"🔍 Generated unique username: {username}")
                
                user = User.objects.create_user(
                    username=username,
                    email=email,
                    password=password,
                    first_name=first_name or '',
                    last_name=last_name or '',
                    role='teacher',
                    is_active=True  # Explicitly set user as active
                )
                print(f"✅ Created user for teacher: {user.email}")
                print(f"✅ User ID: {user.id}")
                print(f"✅ Username: {user.username}")
                print(f"✅ User is_active: {user.is_active}")
                
                # Store the generated password and username in the response
                self.context['user_password'] = password
                self.context['user_username'] = username
                
            except Exception as e:
                print(f"❌ Error creating user: {e}")
                print(f"❌ Error type: {type(e)}")
                import traceback
                print(f"❌ Full traceback: {traceback.format_exc()}")
                raise serializers.ValidationError(f"Error creating user: {e}")
        else:
            print(f"❌ No email provided for user creation")
        
        print(f"🔍 About to create teacher with user: {user}")
        print(f"🔍 Validated data keys: {list(validated_data.keys())}")
        
        # Create teacher with explicit active status
        teacher = Teacher.objects.create(
            user=user, 
            is_active=True,  # Explicitly set teacher as active
            **validated_data
        )
        print(f"✅ Created teacher: {teacher}")
        print(f"✅ Teacher is_active: {teacher.is_active}")
        
        # Handle teacher assignments using the new ClassroomTeacherAssignment model
        if assignments or subjects:
            self._create_classroom_assignments(teacher, assignments, subjects)
        
        return teacher

    def _create_classroom_assignments(self, teacher, assignments, subjects):
        """Create classroom assignments using the new ClassroomTeacherAssignment model"""
        print(f"🔍 Creating classroom assignments for teacher {teacher.id}")
        print(f"🔍 Assignments data: {assignments}")
        print(f"🔍 Subjects data: {subjects}")
        
        # Clear existing assignments
        ClassroomTeacherAssignment.objects.filter(teacher=teacher).delete()
        
        if assignments:
            # Handle specific classroom assignments
            for assignment_data in assignments:
                try:
                    print(f"🔍 Processing assignment: {assignment_data}")
                    
                    # Handle different assignment data formats
                    classroom_id = assignment_data.get('classroom_id')
                    grade_level_id = assignment_data.get('grade_level_id')
                    section_id = assignment_data.get('section_id')
                    subject_ids = assignment_data.get('subject_ids', [])
                    is_primary = assignment_data.get('is_primary_teacher', False)
                    periods_per_week = assignment_data.get('periods_per_week', 1)
                    
                    # If we have classroom_id directly, use it
                    if classroom_id:
                        try:
                            classroom = Classroom.objects.get(id=classroom_id)
                            print(f"✅ Found classroom by ID: {classroom}")
                        except Classroom.DoesNotExist:
                            print(f"❌ Classroom {classroom_id} not found")
                            continue
                    # If we have grade_level_id and section_id, find the classroom
                    elif grade_level_id and section_id:
                        try:
                            from classroom.models import GradeLevel, Section
                            grade_level = GradeLevel.objects.get(id=grade_level_id)
                            section = Section.objects.get(id=section_id)
                            classroom = Classroom.objects.get(section=section)
                            print(f"✅ Found classroom by grade/section: {classroom}")
                        except (GradeLevel.DoesNotExist, Section.DoesNotExist, Classroom.DoesNotExist) as e:
                            print(f"❌ Error finding classroom: {e}")
                            print(f"🔍 Attempting to create classroom for grade_level_id={grade_level_id}, section_id={section_id}")
                            
                            # Try to create the classroom if it doesn't exist
                            try:
                                grade_level = GradeLevel.objects.get(id=grade_level_id)
                                section = Section.objects.get(id=section_id)
                                
                                # Create classroom name
                                classroom_name = f"{grade_level.name} {section.name}"
                                
                                # Create the classroom
                                classroom = Classroom.objects.create(
                                    name=classroom_name,
                                    section=section,
                                    academic_year="2024-2025",
                                    term="First Term",
                                    max_capacity=40,
                                    current_enrollment=0
                                )
                                print(f"✅ Created new classroom: {classroom}")
                            except Exception as create_error:
                                print(f"❌ Failed to create classroom: {create_error}")
                                continue
                    else:
                        print(f"❌ No classroom information provided")
                        continue
                    
                    # Handle subject assignment - support both single subject_id and array of subject_ids
                    subject_ids = assignment_data.get('subject_ids', [])
                    subject_id = assignment_data.get('subject_id')
                    
                    # If we have subject_ids array, use it; otherwise try single subject_id
                    if subject_ids:
                        successful_assignments = 0
                        for subject_id in subject_ids:
                            try:
                                subject = Subject.objects.get(id=subject_id)
                                
                                ClassroomTeacherAssignment.objects.create(
                                    teacher=teacher,
                                    classroom=classroom,
                                    subject=subject,
                                    is_primary_teacher=is_primary,
                                    periods_per_week=periods_per_week
                                )
                                print(f"✅ Created classroom assignment: {teacher} - {subject} - {classroom}")
                                successful_assignments += 1
                            except Subject.DoesNotExist:
                                print(f"❌ Subject {subject_id} not found - skipping")
                            except Exception as e:
                                print(f"❌ Error creating assignment for subject {subject_id}: {e}")
                        
                        if successful_assignments > 0:
                            print(f"✅ Successfully created {successful_assignments} classroom assignments")
                        else:
                            print(f"❌ No classroom assignments were created")
                    elif subject_id:
                        try:
                            subject = Subject.objects.get(id=subject_id)
                            
                            ClassroomTeacherAssignment.objects.create(
                                teacher=teacher,
                                classroom=classroom,
                                subject=subject,
                                is_primary_teacher=is_primary,
                                periods_per_week=periods_per_week
                            )
                            print(f"✅ Created classroom assignment: {teacher} - {subject} - {classroom}")
                        except Subject.DoesNotExist:
                            print(f"❌ Subject {subject_id} not found")
                        except Exception as e:
                            print(f"❌ Error creating assignment: {e}")
                    else:
                        print(f"❌ No subject_id or subject_ids provided in assignment")
                            
                except Exception as e:
                    print(f"❌ Error processing assignment: {e}")
        elif subjects:
            # Handle general subject assignments (for backward compatibility)
            print(f"🔍 Creating general subject assignments for {len(subjects)} subjects")
            # This would need to be implemented based on your specific logic
            # For now, we'll skip this as it requires classroom context

    def update(self, instance, validated_data):
        print(f"🔍 TeacherSerializer.update called for teacher {instance.id}")
        print(f"🔍 Validated data keys: {list(validated_data.keys())}")
        
        # Extract assignment data
        assignments = validated_data.pop('assignments', None)
        subjects = validated_data.pop('subjects', None)
        
        print(f"🔍 Assignments data: {assignments}")
        print(f"🔍 Subjects data: {subjects}")
        
        # Handle user profile updates
        bio = validated_data.pop('bio', None)
        date_of_birth = validated_data.pop('date_of_birth', None)
        
        if bio is not None or date_of_birth is not None:
            try:
                # Get or create user profile
                from userprofile.models import UserProfile
                user_profile, created = UserProfile.objects.get_or_create(user=instance.user)
                
                if bio is not None:
                    user_profile.bio = bio
                if date_of_birth is not None:
                    user_profile.date_of_birth = date_of_birth
                
                user_profile.save()
                print(f"✅ Updated user profile for teacher {instance.id}")
                print(f"✅ Bio: {bio}")
                print(f"✅ Date of birth: {date_of_birth}")
            except Exception as e:
                print(f"❌ Error updating user profile: {e}")
                import traceback
                print(f"❌ Full traceback: {traceback.format_exc()}")
        
        # Update teacher
        teacher = super().update(instance, validated_data)
        
        # Update classroom assignments if provided
        if assignments is not None or subjects is not None:
            print(f"🔍 Creating/updating classroom assignments for teacher {teacher.id}")
            self._create_classroom_assignments(teacher, assignments, subjects)
        else:
            print(f"🔍 No assignments or subjects provided for update")
        
        return teacher
