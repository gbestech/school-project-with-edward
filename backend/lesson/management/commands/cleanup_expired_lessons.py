from django.core.management.base import BaseCommand
from lesson.models import Lesson


class Command(BaseCommand):
    help = 'Clean up expired lesson data (older than 24 hours)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be cleaned up without actually doing it',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        
        if dry_run:
            self.stdout.write('DRY RUN MODE - No changes will be made')
        
        # Get lessons that should be cleaned up
        from django.utils import timezone
        expired_lessons = Lesson.objects.filter(
            data_retention_expires_at__lt=timezone.now(),
            data_retention_expires_at__isnull=False
        )
        
        count = expired_lessons.count()
        
        if count == 0:
            self.stdout.write(
                self.style.SUCCESS('No expired lessons found to clean up')
            )
            return
        
        self.stdout.write(f'Found {count} expired lessons to clean up')
        
        if not dry_run:
            cleaned_count = Lesson.cleanup_expired_lessons()
            self.stdout.write(
                self.style.SUCCESS(f'Successfully cleaned up {cleaned_count} lessons')
            )
        else:
            for lesson in expired_lessons:
                self.stdout.write(
                    f'Would clean up: {lesson.title} (completed: {lesson.actual_end_time})'
                )

