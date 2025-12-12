from django.core.management.base import BaseCommand
from students.models import Student
from classroom.models import Classroom, StudentEnrollment, AcademicYear, Term


class Command(BaseCommand):
    help = (
        "Enroll existing students in the classrooms they selected during registration"
    )

    def handle(self, *args, **options):
        self.stdout.write('Starting to enroll existing students...')

        # Get current academic year and term
        current_academic_year = AcademicYear.objects.filter(is_current=True).first()
        current_term = Term.objects.filter(is_current=True).first()

        if not current_academic_year or not current_term:
            self.stdout.write(
                self.style.ERROR(
                    "❌ No current academic year or term found. Please set them first."
                )
            )
            return

        enrolled_count = 0
        skipped_count = 0

        # Loop through students
        for student in Student.objects.filter(is_active=True):

            # The classroom chosen during registration
            classroom = student.student_class  # <<< IMPORTANT

            if not classroom:
                self.stdout.write(
                    self.style.ERROR(
                        f"❌ Student {student.user.full_name} has no assigned class."
                    )
                )
                continue

            # Check if enrollment already exists
            if StudentEnrollment.objects.filter(
                student=student, classroom=classroom, is_active=True
            ).exists():
                self.stdout.write(
                    f"ℹ️ Already enrolled: {student.user.full_name} in {classroom}"
                )
                skipped_count += 1
                continue

            # Create the enrollment
            StudentEnrollment.objects.create(
                student=student,
                classroom=classroom,
                academic_year=current_academic_year,
                term=current_term,
                is_active=True,
            )

            self.stdout.write(
                self.style.SUCCESS(
                    f"✅ Enrolled {student.user.full_name} → {classroom}"
                )
            )
            enrolled_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"\n✔ Enrollment Completed!\n"
                f"➕ Enrolled: {enrolled_count}\n"
                f"⏭ Skipped: {skipped_count}\n"
            )
        )
