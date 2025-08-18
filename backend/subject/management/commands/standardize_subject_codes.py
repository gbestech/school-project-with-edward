from django.core.management.base import BaseCommand
from subject.models import Subject


class Command(BaseCommand):
    help = 'Standardize subject codes by education level for better backend differentiation'

    def handle(self, *args, **options):
        self.stdout.write('Starting subject code standardization...')
        
        # Define standardized code patterns by education level
        code_patterns = {
            'NURSERY': '-NUR',
            'PRIMARY': '-PRI', 
            'JUNIOR_SECONDARY': '-JSS',
            'SENIOR_SECONDARY': '-SSS'
        }
        
        # Track changes
        updated_count = 0
        skipped_count = 0
        
        for subject in Subject.objects.all():
            current_code = subject.code
            education_levels = subject.education_levels or []
            
            # Determine the primary education level for this subject
            primary_level = None
            if 'JUNIOR_SECONDARY' in education_levels:
                primary_level = 'JUNIOR_SECONDARY'
            elif 'SENIOR_SECONDARY' in education_levels:
                primary_level = 'SENIOR_SECONDARY'
            elif 'PRIMARY' in education_levels:
                primary_level = 'PRIMARY'
            elif 'NURSERY' in education_levels:
                primary_level = 'NURSERY'
            
            if primary_level:
                expected_suffix = code_patterns[primary_level]
                
                # Check if code already follows the pattern
                if current_code.endswith(expected_suffix):
                    self.stdout.write(f'  ✓ {subject.name} ({current_code}) - already standardized')
                    skipped_count += 1
                else:
                    # Generate new standardized code
                    base_name = subject.name.replace(' ', '').upper()
                    new_code = f"{base_name}{expected_suffix}"
                    
                    # Check if new code already exists
                    if Subject.objects.filter(code=new_code).exclude(id=subject.id).exists():
                        # Add a number suffix if conflict
                        counter = 1
                        while Subject.objects.filter(code=f"{new_code}{counter}").exclude(id=subject.id).exists():
                            counter += 1
                        new_code = f"{new_code}{counter}"
                    
                    old_code = current_code
                    subject.code = new_code
                    subject.save()
                    
                    self.stdout.write(f'  → {subject.name}: {old_code} → {new_code}')
                    updated_count += 1
            else:
                self.stdout.write(f'  ⚠ {subject.name} ({current_code}) - no education level specified')
                skipped_count += 1
        
        self.stdout.write(self.style.SUCCESS(f'\nStandardization completed!'))
        self.stdout.write(f'Updated: {updated_count} subjects')
        self.stdout.write(f'Skipped: {skipped_count} subjects')
        
        # Show summary by education level
        self.stdout.write(f'\nSummary by education level:')
        for level, suffix in code_patterns.items():
            count = Subject.objects.filter(code__endswith=suffix).count()
            self.stdout.write(f'  {level}: {count} subjects ({suffix})')




