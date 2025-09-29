from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Student
from classroom.models import Classroom, StudentEnrollment
from classroom.models import GradeLevel, Section, AcademicYear, Term


@receiver(post_save, sender=Student)
def auto_enroll_student(sender, instance, created, **kwargs):
    """
    Automatically enroll student in the appropriate classroom when created
    """
    if created and instance.is_active:
        try:
            # Get the student's education level and class
            education_level = instance.education_level
            student_class = instance.student_class
            
            # Map student class to grade level name
            class_to_grade_mapping = {
                'PRE_NURSERY': 'Pre-Nursery',
                'NURSERY_1': 'Nursery 1',
                'NURSERY_2': 'Nursery 2',
                'PRE_K': 'Pre-K',
                'KINDERGARTEN': 'Kindergarten',
                'PRIMARY_1': 'Primary 1',
                'PRIMARY_2': 'Primary 2',
                'PRIMARY_3': 'Primary 3',
                'PRIMARY_4': 'Primary 4',
                'PRIMARY_5': 'Primary 5',
                'PRIMARY_6': 'Primary 6',
                'JSS_1': 'JSS 1',
                'JSS_2': 'JSS 2',
                'JSS_3': 'JSS 3',
                'SS_1': 'SS 1',
                'SS_2': 'SS 2',
                'SS_3': 'SS 3',
                # Legacy mappings for backward compatibility
                'GRADE_1': 'Primary 1',
                'GRADE_2': 'Primary 2',
                'GRADE_3': 'Primary 3',
                'GRADE_4': 'Primary 4',
                'GRADE_5': 'Primary 5',
                'GRADE_6': 'Primary 6',
                'GRADE_7': 'JSS 1',
                'GRADE_8': 'JSS 2',
                'GRADE_9': 'JSS 3',
                'GRADE_10': 'SS 1',
                'GRADE_11': 'SS 2',
                'GRADE_12': 'SS 3',
                'SS1': 'SS 1',
                'SS2': 'SS 2',
                'SS3': 'SS 3',
                'JSS1': 'JSS 1',
                'JSS2': 'JSS 2',
                'JSS3': 'JSS 3',
            }
            
            grade_level_name = class_to_grade_mapping.get(student_class)
            if grade_level_name:
                # Find the appropriate grade level by name
                grade_level = GradeLevel.objects.filter(name=grade_level_name).first()
            else:
                # Fallback: try to find by education level and partial name match
                grade_level = GradeLevel.objects.filter(
                    education_level=education_level,
                    name__icontains=student_class.replace('GRADE_', '').replace('_', ' ')
                ).first()
                
                if not grade_level:
                    # Try to find by education level only
                    grade_level = GradeLevel.objects.filter(
                        education_level=education_level
                    ).first()
            
            if grade_level:
                # Get the current academic year and term
                current_academic_year = AcademicYear.objects.filter(is_current=True).first()
                current_term = Term.objects.filter(is_current=True).first()
                
                if current_academic_year and current_term:
                    # Try to extract section from classroom field if provided
                    section_name = 'A'  # Default to section A
                    if instance.classroom:
                        # Extract section from classroom name (e.g., "Primary 2 B" -> "B")
                        classroom_parts = instance.classroom.split()
                        if len(classroom_parts) > 1:
                            last_part = classroom_parts[-1]
                            if last_part in ['A', 'B', 'C', 'D']:  # Valid section names
                                section_name = last_part
                                print(f"🔍 Extracted section '{section_name}' from classroom '{instance.classroom}'")
                    
                    # Find the appropriate section
                    section = Section.objects.filter(
                        grade_level=grade_level,
                        name=section_name
                    ).first()
                    
                    if section:
                        # Find or create the classroom
                        classroom, created = Classroom.objects.get_or_create(
                            section=section,
                            academic_year=current_academic_year,
                            term=current_term,
                            defaults={
                                'name': f'{grade_level.name}',
                                'room_number': '001',
                                'max_capacity': 30,
                                'is_active': True
                            }
                        )
                        
                        # Check if student is already enrolled
                        existing_enrollment = StudentEnrollment.objects.filter(
                            student=instance,
                            classroom=classroom,
                            is_active=True
                        ).first()
                        
                        if not existing_enrollment:
                            # Create enrollment
                            StudentEnrollment.objects.create(
                                student=instance,
                                classroom=classroom
                            )
                            print(f"✅ Auto-enrolled student {instance.user.full_name} in {classroom.name}")
                        else:
                            print(f"ℹ️ Student {instance.user.full_name} already enrolled in {classroom.name}")
                    else:
                        print(f"⚠️ No section found for {grade_level.name}")
                else:
                    print(f"⚠️ No current academic year or term found")
            else:
                print(f"⚠️ No grade level found for {education_level} - {student_class}")
                
        except Exception as e:
            print(f"❌ Error auto-enrolling student {instance.user.full_name}: {str(e)}")
