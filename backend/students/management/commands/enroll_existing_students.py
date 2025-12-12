from django.core.management.base import BaseCommand
from students.models import Student
from classroom.models import Classroom, StudentEnrollment, Section
from academics.models import AcademicSession, Term


class Command(BaseCommand):
    help = (
        "Enroll existing students in the classrooms they selected during registration"
    )

    def handle(self, *args, **options):
        self.stdout.write('Starting to enroll existing students...')

        # Get current academic session and term
        current_session = AcademicSession.objects.filter(is_current=True).first()
        current_term = Term.objects.filter(is_current=True).first()

        if not current_session or not current_term:
            self.stdout.write(
                self.style.ERROR(
                    "❌ No current academic session or term found. Please set them first."
                )
            )
            return

        enrolled_count = 0
        skipped_count = 0
        error_count = 0

        for student in Student.objects.filter(is_active=True):
            try:
                # Skip if student is already enrolled
                if StudentEnrollment.objects.filter(
                    student=student, is_active=True
                ).exists():
                    self.stdout.write(
                        f"ℹ️ Student {student.user.full_name} already enrolled"
                    )
                    skipped_count += 1
                    continue

                # Normalize student_class to match grade_level.name
                student_class_normalized = student.student_class.replace(
                    "_", " "
                ).title()

                # Find all sections for the student's class
                sections = Section.objects.filter(
                    grade_level__name__icontains=student_class_normalized
                )

                if not sections.exists():
                    self.stdout.write(
                        self.style.WARNING(
                            f"⚠️ No section found for {student.student_class} (normalized: {student_class_normalized})"
                        )
                    )
                    error_count += 1
                    continue

                # Pick the section with the fewest students (count via StudentEnrollment)
                section = min(
                    sections,
                    key=lambda s: StudentEnrollment.objects.filter(
                        classroom__section=s, is_active=True
                    ).count(),
                )

                # Find or create the classroom for this section, session, and term
                classroom, created = Classroom.objects.get_or_create(
                    name=student_class_normalized,
                    section=section,
                    academic_session=current_session,
                    term=current_term,
                    defaults={
                        "room_number": "001",
                        "max_capacity": 30,
                        "is_active": True,
                    },
                )

                # Enroll the student
                StudentEnrollment.objects.create(
                    student=student, classroom=classroom, is_active=True
                )

                self.stdout.write(
                    self.style.SUCCESS(
                        f"✅ Enrolled {student.user.full_name} → {classroom.name} ({section.name})"
                    )
                )
                enrolled_count += 1

            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(
                        f"❌ Error enrolling {student.user.full_name}: {str(e)}"
                    )
                )
                error_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"\nEnrollment completed!\n"
                f"✅ Enrolled: {enrolled_count}\n"
                f"ℹ️ Skipped: {skipped_count}\n"
                f"❌ Errors: {error_count}"
            )
        )
