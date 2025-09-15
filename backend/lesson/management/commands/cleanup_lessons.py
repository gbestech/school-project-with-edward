from django.core.management.base import BaseCommand
from django.utils import timezone
from lesson.models import Lesson


class Command(BaseCommand):
    help = "Cleanup lesson detailed fields for lessons whose retention window expired"

    def handle(self, *args, **options):
        now = timezone.now()
        expired = Lesson.objects.filter(
            data_retention_expires_at__lte=now,
            data_retention_expires_at__isnull=False,
        )

        count = 0
        for lesson in expired.iterator():
            lesson.cleanup_lesson_data()
            count += 1

        self.stdout.write(self.style.SUCCESS(f"Cleaned up {count} lessons"))


