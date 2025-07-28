from django.core.management.base import BaseCommand
from users.models import CustomUser
from userprofile.models import UserProfile

class Command(BaseCommand):
    help = 'Backfill UserProfiles for all student users who do not have one.'

    def handle(self, *args, **options):
        students = CustomUser.objects.filter(role='student')
        created_count = 0
        for user in students:
            profile, created = UserProfile.objects.get_or_create(user=user)
            if created:
                created_count += 1
        self.stdout.write(self.style.SUCCESS(f'Backfilled {created_count} student UserProfiles.')) 