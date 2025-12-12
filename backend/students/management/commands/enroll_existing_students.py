from django.core.management.base import BaseCommand
from students.models import Student
from classroom.models import Classroom, StudentEnrollment, GradeLevel, Section
from academics.models import AcademicSession, Term


class Command(BaseCommand):
    help = "Enroll existing students in appropriate classrooms"

    def handle(self, *args, **options):
        self.stdout.write('Starting to enroll existing students...')

        # Get current academic session and term
        current_academic_session = AcademicSession.objects.filter(
            is_current=True
        ).first()
        current_term = Term.objects.filter(is_current=True).first()

        if not current_academic_session or not current_term:
            self.stdout.write(
                self.style.ERROR(
                    "No current academic session or term found. Please set them first."
                )
            )
            return

        enrolled_count = 0
        skipped_count = 0
        error_count = 0

        for student in Student.objects.filter(is_active=True):
            try:
                # Check if student is already enrolled
                existing_enrollment = StudentEnrollment.objects.filter(
                    student=student, is_active=True
                ).first()

                if existing_enrollment:
                    self.stdout.write(
                        f"ℹ️ Student {student.user.full_name} already enrolled in {existing_enrollment.classroom.name}"
                    )
                    skipped_count += 1
                    continue

                # Student's level and class
                education_level = student.education_level
                student_class = student.student_class

                # Match grade level
                grade_level = GradeLevel.objects.filter(
                    education_level=education_level,
                    name__icontains=student_class.replace("GRADE_", "").replace(
                        "_", " "
                    ),
                ).first()

                if not grade_level:
                    grade_level = GradeLevel.objects.filter(
                        education_level=education_level
                    ).first()

                if grade_level:
                    # Default to Section A
                    section = Section.objects.filter(
                        grade_level=grade_level, name="A"
                    ).first()

                    if section:
                        classroom, created = Classroom.objects.get_or_create(
                            section=section,
                            academic_session=current_academic_session,
                            term=current_term,
                            defaults={
                                "name": f"{grade_level.name}",
                                "room_number": "001",
                                "max_capacity": 30,
                                "is_active": True,
                            },
                        )

                        StudentEnrollment.objects.create(
                            student=student, classroom=classroom
                        )

                        self.stdout.write(
                            self.style.SUCCESS(
                                f"✅ Enrolled student {student.user.full_name} in {classroom.name}"
                            )
                        )
                        enrolled_count += 1

                    else:
                        self.stdout.write(
                            self.style.WARNING(
                                f"⚠️ No section found for {grade_level.name}"
                            )
                        )
                        error_count += 1

                else:
                    self.stdout.write(
                        self.style.WARNING(
                            f"⚠️ No grade level found for {education_level} - {student_class}"
                        )
                    )
                    error_count += 1

            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(
                        f"❌ Error enrolling student {student.user.full_name}: {str(e)}"
                    )
                )
                error_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"\nEnrollment completed!\n"
                f"✅ Enrolled: {enrolled_count}\n"
                f"ℹ️ Skipped (already enrolled): {skipped_count}\n"
                f"❌ Errors: {error_count}"
            )
        )
