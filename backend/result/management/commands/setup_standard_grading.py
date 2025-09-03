from django.core.management.base import BaseCommand
from result.models import GradingSystem, Grade
from decimal import Decimal

class Command(BaseCommand):
    help = 'Set up standard grading system with A-F grades'

    def handle(self, *args, **options):
        self.stdout.write('Setting up standard grading system...')

        # Create or get the standard grading system
        grading_system, created = GradingSystem.objects.get_or_create(
            name="Standard Grading System",
            defaults={
                'grading_type': 'LETTER',
                'description': 'Standard letter grading system (A-F) for report cards',
                'min_score': 0,
                'max_score': 100,
                'pass_mark': 40,
                'is_active': True
            }
        )

        if created:
            self.stdout.write('✅ Created standard grading system')
        else:
            self.stdout.write('ℹ️  Using existing standard grading system')

        # Define the standard grading scale
        grades_data = [
            {'grade': 'A', 'min_score': 70, 'max_score': 100, 'description': 'Distinction', 'is_passing': True},
            {'grade': 'B', 'min_score': 60, 'max_score': 69, 'description': 'Very Good', 'is_passing': True},
            {'grade': 'C', 'min_score': 50, 'max_score': 59, 'description': 'Good', 'is_passing': True},
            {'grade': 'D', 'min_score': 45, 'max_score': 49, 'description': 'Pass', 'is_passing': True},
            {'grade': 'E', 'min_score': 40, 'max_score': 44, 'description': 'Fair', 'is_passing': True},
            {'grade': 'F', 'min_score': 0, 'max_score': 39, 'description': 'Fail', 'is_passing': False},
        ]

        # Clear existing grades for this system
        Grade.objects.filter(grading_system=grading_system).delete()
        self.stdout.write('🗑️  Cleared existing grades')

        # Create the grades
        for grade_data in grades_data:
            grade = Grade.objects.create(
                grading_system=grading_system,
                **grade_data
            )
            self.stdout.write(f'✅ Created grade {grade.grade}: {grade.min_score}-{grade.max_score}')

        self.stdout.write('🎉 Standard grading system setup complete!')
        self.stdout.write('Grading Scale:')
        self.stdout.write('  A: 70-100 (Distinction)')
        self.stdout.write('  B: 60-69 (Very Good)')
        self.stdout.write('  C: 50-59 (Good)')
        self.stdout.write('  D: 45-49 (Pass)')
        self.stdout.write('  E: 40-44 (Fair)')
        self.stdout.write('  F: 0-39 (Fail)')
