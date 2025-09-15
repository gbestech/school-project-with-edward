# timetable/management/commands/create_sample_timetables.py
from django.core.management.base import BaseCommand
from timetable.models import Timetable
from classroom.models import Section
from academics.models import Subject
from teacher.models import Teacher


class Command(BaseCommand):
    help = "Create sample timetables for testing"

    def add_arguments(self, parser):
        parser.add_argument(
            "--section-id",
            type=int,
            help="Create timetables for specific section ID",
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Show what would be created without making changes",
        )

    def handle(self, *args, **options):
        # Sample schedule structure
        schedule_template = [
            {"day": "MONDAY", "start_time": "08:00", "end_time": "09:00"},
            {"day": "MONDAY", "start_time": "09:00", "end_time": "10:00"},
            {"day": "TUESDAY", "start_time": "08:00", "end_time": "09:00"},
            {"day": "TUESDAY", "start_time": "09:00", "end_time": "10:00"},
            {"day": "WEDNESDAY", "start_time": "08:00", "end_time": "09:00"},
        ]

        if options["section_id"]:
            sections = Section.objects.filter(id=options["section_id"])
        else:
            # Create for all sections that don't have timetables
            sections = Section.objects.filter(timetable__isnull=True).distinct()[
                :5
            ]  # Limit to first 5 for testing

        if not sections.exists():
            self.stdout.write(
                "No sections found or all sections already have timetables"
            )
            return

        # Get some subjects and teachers for the timetables
        subjects = Subject.objects.all()[:3]  # Get first 3 subjects
        teachers = Teacher.objects.all()[:3]  # Get first 3 teachers

        if not subjects.exists():
            self.stdout.write(
                self.style.ERROR("No subjects found. Please create subjects first.")
            )
            return

        if not teachers.exists():
            self.stdout.write(
                self.style.ERROR("No teachers found. Please create teachers first.")
            )
            return

        created_count = 0

        for section in sections:
            self.stdout.write(f"Creating timetables for section: {section}")

            for i, slot in enumerate(schedule_template):
                subject = subjects[i % len(subjects)]
                teacher = teachers[i % len(teachers)]

                if not options["dry_run"]:
                    timetable, created = Timetable.objects.get_or_create(
                        section=section,
                        subject=subject,
                        teacher=teacher,
                        day=slot["day"],
                        start_time=slot["start_time"],
                        end_time=slot["end_time"],
                    )

                    if created:
                        created_count += 1
                        self.stdout.write(
                            f"  ✅ Created: {slot['day']} {slot['start_time']}-{slot['end_time']} - {subject.name}"
                        )
                    else:
                        self.stdout.write(
                            f"  ⚠️  Already exists: {slot['day']} {slot['start_time']}-{slot['end_time']} - {subject.name}"
                        )
                else:
                    self.stdout.write(
                        f"  Would create: {slot['day']} {slot['start_time']}-{slot['end_time']} - {subject.name} - {teacher.user.get_full_name()}"
                    )

        if not options["dry_run"]:
            self.stdout.write(
                self.style.SUCCESS(f"✅ Created {created_count} timetable entries!")
            )
        else:
            self.stdout.write(
                "Dry run completed. Use without --dry-run to create actual entries."
            )

        # Show current timetable count
        total_timetables = Timetable.objects.count()
        self.stdout.write(f"Total timetables in database: {total_timetables}")
