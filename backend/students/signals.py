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
            
            # Find the appropriate grade level
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
                    # Find the appropriate section (usually 'A' for new students)
                    section = Section.objects.filter(
                        grade_level=grade_level,
                        name='A'  # Default to section A
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
