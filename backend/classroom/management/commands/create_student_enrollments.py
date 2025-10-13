from django.core.management.base import BaseCommand
from students.models import Student
from classroom.models import Classroom, StudentEnrollment


class Command(BaseCommand):
    help = "Create StudentEnrollment records from Student.classroom field"

    def handle(self, *args, **options):
        count = 0

        for student in Student.objects.filter(classroom__isnull=False, is_active=True):
            # Extract classroom name (remove section letter)
            # "Primary 1 A" → "Primary 1"
            classroom_name = " ".join(student.classroom.split()[:-1])

            classroom = Classroom.objects.filter(name=classroom_name).first()

            if classroom:
                enrollment, created = StudentEnrollment.objects.get_or_create(
                    student=student, classroom=classroom, defaults={"is_active": True}
                )
                if created:
                    count += 1
                    self.stdout.write(
                        self.style.SUCCESS(
                            f"✓ Enrolled {student.full_name} in {classroom.name}"
                        )
                    )
            else:
                self.stdout.write(
                    self.style.WARNING(
                        f"⚠ No classroom found for {student.full_name} ({student.classroom})"
                    )
                )

        self.stdout.write(
            self.style.SUCCESS(f"\n✅ Created {count} StudentEnrollment records")
        )
