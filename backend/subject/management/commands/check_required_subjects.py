from django.core.management.base import BaseCommand
from subject.models import Subject


class Command(BaseCommand):
    help = 'Check if all required subjects are available according to specifications'

    def handle(self, *args, **options):
        self.stdout.write('📋 REQUIRED SUBJECTS CHECK')
        self.stdout.write('=' * 50)
        
        # Define required subjects by education level based on user specifications
        required_subjects = {
            'JUNIOR_SECONDARY': [
                'Mathematics',
                'English Studies', 
                'Basic Science and Technology',  # Parent subject with components
                'National Values',  # Parent subject with components
                'Pre-Vocational Studies',  # Parent subject with components
                'Christian Religious Studies',
                'History',
                'Cultural and Creative Arts',
                'Business Studies',
                'Hausa',
                'French'
            ],
            'PRIMARY': [
                'Mathematics',
                'English Studies',
                'Basic Science and Technology',
                'Social Studies',
                'Christian Religious Studies',
                'Cultural and Creative Arts',
                'Physical and Health Education'
            ],
            'NURSERY': [
                'Basic Science',
                'Mathematics',
                'English',
                'Social Studies',
                'Creative Arts'
            ]
        }
        
        # JSS Component subjects that should exist
        jss_components = {
            'Basic Science and Technology': [
                'Basic Science',
                'Basic Technology', 
                'Information Technology',
                'Physical and Health Education'
            ],
            'National Values': [
                'Civic Education',
                'Social Studies',
                'Security Education'
            ],
            'Pre-Vocational Studies': [
                'Home Economics',
                'Agricultural Science'
            ]
        }
        
        for level, subjects in required_subjects.items():
            self.stdout.write(f'\n🎓 {level} REQUIRED SUBJECTS:')
            
            for subject_name in subjects:
                # Check if subject exists
                if level == 'JUNIOR_SECONDARY':
                    suffix = '-JSS'
                elif level == 'PRIMARY':
                    suffix = '-PRI'
                elif level == 'NURSERY':
                    suffix = '-NUR'
                
                existing_subjects = Subject.objects.filter(
                    name__icontains=subject_name,
                    code__endswith=suffix
                )
                
                if existing_subjects.exists():
                    self.stdout.write(f'   ✅ {subject_name}')
                    
                    # Check for component subjects if it's a parent subject
                    if subject_name in jss_components and level == 'JUNIOR_SECONDARY':
                        parent = existing_subjects.first()
                        if parent.component_subjects.exists():
                            self.stdout.write(f'      📋 Parent subject with components:')
                            for component in parent.component_subjects.all():
                                self.stdout.write(f'         └─ {component.name}')
                        else:
                            self.stdout.write(f'      ⚠️  Parent subject but no components found')
                            
                        # Check if all required components exist
                        required_components = jss_components[subject_name]
                        for comp_name in required_components:
                            comp_exists = Subject.objects.filter(
                                name__icontains=comp_name,
                                code__endswith='-JSS'
                            ).exists()
                            if comp_exists:
                                self.stdout.write(f'         ✅ Component: {comp_name}')
                            else:
                                self.stdout.write(f'         ❌ Missing component: {comp_name}')
                else:
                    self.stdout.write(f'   ❌ {subject_name} - NOT FOUND')
        
        # Check for the one subject without proper code
        self.stdout.write(f'\n⚠️  SUBJECTS NEEDING ATTENTION:')
        from django.db.models import Q
        improper_subjects = Subject.objects.exclude(
            Q(code__endswith='-NUR') | 
            Q(code__endswith='-PRI') | 
            Q(code__endswith='-JSS') | 
            Q(code__endswith='-SSS')
        )
        
        if improper_subjects.exists():
            for subject in improper_subjects:
                self.stdout.write(f'   ❌ {subject.name} ({subject.code}) - Needs proper education level code')
        
        # Check for duplicates
        self.stdout.write(f'\n🔍 DUPLICATE SUBJECTS:')
        for level, suffix in [('JUNIOR_SECONDARY', '-JSS'), ('PRIMARY', '-PRI'), ('NURSERY', '-NUR')]:
            subjects = Subject.objects.filter(code__endswith=suffix)
            names = []
            duplicates = []
            
            for subject in subjects:
                if subject.name in names:
                    duplicates.append(subject)
                else:
                    names.append(subject.name)
            
            if duplicates:
                self.stdout.write(f'   ⚠️  {level}: {len(duplicates)} duplicates')
                for dup in duplicates:
                    self.stdout.write(f'      - {dup.name} ({dup.code})')
        
        self.stdout.write(self.style.SUCCESS('\n✅ Required subjects check completed!'))




