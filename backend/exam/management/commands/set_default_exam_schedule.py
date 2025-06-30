from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from exam.models import ExamSchedule


class Command(BaseCommand):
    help = "Set a default exam schedule"

    def add_arguments(self, parser):
        parser.add_argument(
            "schedule_id", type=int, help="ID of the schedule to set as default"
        )
        parser.add_argument(
            "--list",
            action="store_true",
            help="List all available exam schedules",
        )

    def handle(self, *args, **options):
        # List schedules if requested
        if options["list"]:
            self.list_schedules()
            return

        schedule_id = options["schedule_id"]

        try:
            with transaction.atomic():
                # Check if schedule exists
                try:
                    schedule = ExamSchedule.objects.get(id=schedule_id)
                except ExamSchedule.DoesNotExist:
                    raise CommandError(
                        f"Exam schedule with ID {schedule_id} does not exist. "
                        f"Use --list to see available schedules."
                    )

                # Remove default flag from all schedules
                updated_count = ExamSchedule.objects.filter(is_default=True).update(
                    is_default=False
                )
                if updated_count > 0:
                    self.stdout.write(
                        f"Removed default flag from {updated_count} schedule(s)"
                    )

                # Set the specified schedule as default
                schedule.is_default = True
                schedule.save()

                self.stdout.write(
                    self.style.SUCCESS(
                        f'Successfully set "{schedule.name}" as default exam schedule'
                    )
                )

                # Show schedule details
                self.stdout.write(
                    f"Schedule Details:\n"
                    f"  - Name: {schedule.name}\n"
                    f"  - Session: {schedule.academic_session}\n"
                    f"  - Term: {schedule.term}\n"
                    f"  - Period: {schedule.start_date} to {schedule.end_date}\n"
                    f'  - Active: {"Yes" if schedule.is_active else "No"}'
                )

        except Exception as e:
            raise CommandError(f"Error setting default schedule: {str(e)}")

    def list_schedules(self):
        """List all available exam schedules"""
        schedules = ExamSchedule.objects.all().order_by("-is_default", "-start_date")

        if not schedules.exists():
            self.stdout.write(self.style.WARNING("No exam schedules found."))
            return

        self.stdout.write(self.style.SUCCESS("Available Exam Schedules:"))
        self.stdout.write("-" * 80)

        for schedule in schedules:
            default_text = " (DEFAULT)" if schedule.is_default else ""
            active_text = " (ACTIVE)" if schedule.is_active else " (INACTIVE)"

            self.stdout.write(
                f"ID: {schedule.id:2d} | {schedule.name}{default_text}{active_text}\n"
                f"      Session: {schedule.academic_session} | Term: {schedule.term}\n"
                f"      Period: {schedule.start_date} to {schedule.end_date}\n"
            )

        self.stdout.write("-" * 80)
        self.stdout.write(
            f"Usage: python manage.py set_default_exam_schedule <schedule_id>"
        )
