from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Student
from classroom.models import Classroom, StudentEnrollment, GradeLevel, Section
from academics.models import AcademicSession, Term


@receiver(post_save, sender=Student)
def auto_enroll_or_update_student(sender, instance, created, **kwargs):
    """
    Automatically enroll or update student's classroom enrollment
    when a Student is created or their classroom changes.
    """
    try:
        # Skip inactive students
        if not instance.is_active:
            return

        education_level = instance.education_level
        student_class = instance.student_class
        classroom_name = instance.classroom

        # Class to grade mapping
        class_to_grade_mapping = {
            "PRE_NURSERY": "Pre-Nursery",
            "NURSERY_1": "Nursery 1",
            "NURSERY_2": "Nursery 2",
            "PRE_K": "Pre-K",
            "KINDERGARTEN": "Kindergarten",
            "PRIMARY_1": "Primary 1",
            "PRIMARY_2": "Primary 2",
            "PRIMARY_3": "Primary 3",
            "PRIMARY_4": "Primary 4",
            "PRIMARY_5": "Primary 5",
            "PRIMARY_6": "Primary 6",
            "JSS_1": "JSS 1",
            "JSS_2": "JSS 2",
            "JSS_3": "JSS 3",
            "SS_1": "SSS 1",
            "SS_2": "SSS 2",
            "SS_3": "SSS 3",
            "SS1": "SSS 1",
            "SS2": "SSS 2",
            "SS3": "SSS 3",
            "SSS_1": "SSS 1",
            "SSS_2": "SSS 2",
            "SSS_3": "SSS 3",
            "JSS1": "JSS 1",
            "JSS2": "JSS 2",
            "JSS3": "JSS 3",
        }

        # Step 1: Determine grade level
        grade_level_name = class_to_grade_mapping.get(student_class)
        if not grade_level_name:
            grade_level_name = student_class.replace("_", " ").replace(
                "GRADE ", "Primary "
            )

        grade_level = GradeLevel.objects.filter(name__iexact=grade_level_name).first()
        if not grade_level:
            print(f"⚠️ No grade level found for {education_level} - {student_class}")
            return

        # Step 2: Extract section name
        section_name = "A"
        if classroom_name:
            parts = classroom_name.split()
            if len(parts) > 1 and parts[-1].isalpha():
                section_name = parts[-1].upper()
                print(f"🔍 Extracted section '{section_name}' from '{classroom_name}'")

        # Step 3: Get section
        section = Section.objects.filter(
            grade_level=grade_level, name=section_name
        ).first()
        if not section:
            print(f"⚠️ No section '{section_name}' found for {grade_level.name}")
            return

        # Step 4: Get current session and term
        academic_session = AcademicSession.objects.filter(is_current=True).first()
        term = Term.objects.filter(is_current=True).first()
        if not academic_session or not term:
            print("⚠️ No current academic session or term found.")
            return

        # Step 5: Get or create classroom
        # FIXED: Changed 'academic_year' to 'academic_session'
        classroom, _ = Classroom.objects.get_or_create(
            section=section,
            academic_session=academic_session,  # ← FIXED HERE
            term=term,
            defaults={
                "name": f"{grade_level.name} {section_name}",
                "room_number": "001",
                "max_capacity": 30,
                "is_active": True,
            },
        )

        # Step 6: Check if already enrolled
        active_enrollment = StudentEnrollment.objects.filter(
            student=instance, is_active=True
        ).first()

        if created:
            # If student was just created, enroll fresh
            if not active_enrollment:
                StudentEnrollment.objects.create(student=instance, classroom=classroom)
                print(f"✅ {instance.user.full_name} auto-enrolled in {classroom.name}")
        else:
            # If updated, move student if classroom changed
            if active_enrollment and active_enrollment.classroom != classroom:
                # Deactivate old enrollment
                active_enrollment.is_active = False
                active_enrollment.save()

                # Create new enrollment
                StudentEnrollment.objects.create(student=instance, classroom=classroom)
                print(
                    f"🔄 Updated {instance.user.full_name}'s classroom to {classroom.name}"
                )
            elif not active_enrollment:
                # In case student had no enrollment before
                StudentEnrollment.objects.create(student=instance, classroom=classroom)
                print(f"✅ {instance.user.full_name} enrolled in {classroom.name}")

    except Exception as e:
        print(f"❌ Error enrolling/updating {instance.user.full_name}: {str(e)}")
        import traceback

        traceback.print_exc()
