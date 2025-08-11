from django.core.management.base import BaseCommand
from classroom.models import GradeLevel, Section


class Command(BaseCommand):
    help = 'Set up default grade levels and sections for the school system'

    def handle(self, *args, **options):
        self.stdout.write('Setting up grade levels and sections...')

        # Define the grade levels and their sections
        grade_levels_data = {
            'NURSERY': [
                {'name': 'Pre-Nursery', 'order': 1},
                {'name': 'Nursery 1', 'order': 2},
                {'name': 'Nursery 2', 'order': 3},
            ],
            'PRIMARY': [
                {'name': 'Primary 1', 'order': 1},
                {'name': 'Primary 2', 'order': 2},
                {'name': 'Primary 3', 'order': 3},
                {'name': 'Primary 4', 'order': 4},
                {'name': 'Primary 5', 'order': 5},
                {'name': 'Primary 6', 'order': 6},
            ],
            'JUNIOR_SECONDARY': [
                {'name': 'JSS 1', 'order': 1},
                {'name': 'JSS 2', 'order': 2},
                {'name': 'JSS 3', 'order': 3},
            ],
            'SENIOR_SECONDARY': [
                {'name': 'SS 1', 'order': 1},
                {'name': 'SS 2', 'order': 2},
                {'name': 'SS 3', 'order': 3},
            ],
        }

        created_count = 0
        updated_count = 0

        for education_level, grades in grade_levels_data.items():
            for grade_data in grades:
                grade_level, created = GradeLevel.objects.get_or_create(
                    education_level=education_level,
                    order=grade_data['order'],
                    defaults={
                        'name': grade_data['name'],
                        'description': f'{grade_data["name"]} level',
                        'is_active': True
                    }
                )
                
                if created:
                    created_count += 1
                    self.stdout.write(f'Created grade level: {grade_level.name}')
                else:
                    # Update existing grade level
                    grade_level.name = grade_data['name']
                    grade_level.description = f'{grade_data["name"]} level'
                    grade_level.save()
                    updated_count += 1
                    self.stdout.write(f'Updated grade level: {grade_level.name}')

                # Create default sections for each grade level
                sections = ['A', 'B', 'C']
                for section_name in sections:
                    section, section_created = Section.objects.get_or_create(
                        grade_level=grade_level,
                        name=section_name,
                        defaults={'is_active': True}
                    )
                    
                    if section_created:
                        created_count += 1
                        self.stdout.write(f'  Created section: {grade_level.name} - {section_name}')
                    else:
                        updated_count += 1
                        self.stdout.write(f'  Updated section: {grade_level.name} - {section_name}')

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully set up grade levels and sections! '
                f'Created: {created_count}, Updated: {updated_count}'
            )
        ) 