from django.core.management.base import BaseCommand
from academics.models import Subject

class Command(BaseCommand):
    help = 'Set up sample subjects in the academics app'

    def handle(self, *args, **options):
        self.stdout.write('Setting up academic subjects...')

        # Create sample subjects in academics app
        subjects_data = [
            {
                'name': 'Mathematics',
                'code': 'MATH',
                'description': 'Core mathematics subject',
                'subject_type': 'CORE',
                'is_compulsory': True,
                'education_levels': 'SECONDARY'
            },
            {
                'name': 'English Language',
                'code': 'ENG',
                'description': 'Core English language subject',
                'subject_type': 'CORE',
                'is_compulsory': True,
                'education_levels': 'SECONDARY'
            },
            {
                'name': 'Physics',
                'code': 'PHY',
                'description': 'Core physics subject',
                'subject_type': 'CORE',
                'is_compulsory': True,
                'education_levels': 'SECONDARY'
            },
            {
                'name': 'Chemistry',
                'code': 'CHEM',
                'description': 'Core chemistry subject',
                'subject_type': 'CORE',
                'is_compulsory': True,
                'education_levels': 'SECONDARY'
            },
            {
                'name': 'Biology',
                'code': 'BIO',
                'description': 'Core biology subject',
                'subject_type': 'CORE',
                'is_compulsory': True,
                'education_levels': 'SECONDARY'
            },
            {
                'name': 'Literature in English',
                'code': 'LIT',
                'description': 'Literature subject',
                'subject_type': 'CORE',
                'is_compulsory': True,
                'education_levels': 'SECONDARY'
            },
            {
                'name': 'Geography',
                'code': 'GEO',
                'description': 'Geography subject',
                'subject_type': 'CORE',
                'is_compulsory': True,
                'education_levels': 'SECONDARY'
            },
            {
                'name': 'Government',
                'code': 'GOV',
                'description': 'Government subject',
                'subject_type': 'CORE',
                'is_compulsory': True,
                'education_levels': 'SECONDARY'
            }
        ]

        for subject_data in subjects_data:
            subject, created = Subject.objects.get_or_create(
                code=subject_data['code'],
                defaults=subject_data
            )
            if created:
                self.stdout.write(f'Created academic subject {subject_data["name"]}')

        self.stdout.write(
            self.style.SUCCESS('Successfully set up academic subjects')
        ) 