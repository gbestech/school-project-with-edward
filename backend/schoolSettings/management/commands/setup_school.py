from django.core.management.base import BaseCommand
from schoolSettings.models import SchoolSettings

class Command(BaseCommand):
    help = "Create or update school settings for AL-QOLAMUL MUWAFFAQ"

    def handle(self, *args, **options):
        try:
            settings, created = SchoolSettings.objects.get_or_create(
                school_code="AIS",
                defaults={
                    "school_name": "AL-QOLAMUL MUWAFFAQ International School",
                },
            )

            if not created:
                settings.school_name = "AL-QOLAMUL MUWAFFAQ International School"
                settings.save()
                self.stdout.write(
                    self.style.SUCCESS(f"✓ Updated school: {settings.school_name}")
                )
            else:
                self.stdout.write(
                    self.style.SUCCESS(f"✓ Created school: {settings.school_name}")
                )

            self.stdout.write(f"School Name: {settings.school_name}")
            self.stdout.write(f"School Code: {settings.school_code}")

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"✗ Error: {str(e)}"))
            raise
