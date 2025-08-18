from django.core.management.base import BaseCommand
from subject.models import Subject


class Command(BaseCommand):
    help = 'List all subjects organized by education level'

    def handle(self, *args, **options):
        self.stdout.write('📚 ALL SUBJECTS BY EDUCATION LEVEL')
        self.stdout.write('=' * 50)
        
        # Define education levels and their code suffixes
        levels = {
            'NURSERY': '-NUR',
            'PRIMARY': '-PRI', 
            'JUNIOR_SECONDARY': '-JSS',
            'SENIOR_SECONDARY': '-SSS'
        }
        
        total_subjects = 0
        
        for level_name, suffix in levels.items():
            self.stdout.write(f'\n🎓 {level_name} SUBJECTS:')
            subjects = Subject.objects.filter(code__endswith=suffix).order_by('name')
            count = subjects.count()
            total_subjects += count
            
            self.stdout.write(f'   Total: {count} subjects')
            
            if count > 0:
                for subject in subjects:
                    # Check if it's a parent subject (has components)
                    if subject.component_subjects.exists():
                        self.stdout.write(f'   📋 {subject.name} ({subject.code}) - PARENT SUBJECT')
                        # Show component subjects
                        for component in subject.component_subjects.all():
                            self.stdout.write(f'      └─ {component.name} ({component.code})')
                    else:
                        self.stdout.write(f'   📖 {subject.name} ({subject.code})')
            else:
                self.stdout.write('   No subjects found')
        
        # Check for subjects without proper codes
        self.stdout.write(f'\n⚠️  SUBJECTS WITHOUT PROPER EDUCATION LEVEL CODES:')
        from django.db.models import Q
        improper_subjects = Subject.objects.exclude(
            Q(code__endswith='-NUR') | 
            Q(code__endswith='-PRI') | 
            Q(code__endswith='-JSS') | 
            Q(code__endswith='-SSS')
        )
        
        if improper_subjects.exists():
            for subject in improper_subjects:
                self.stdout.write(f'   ❌ {subject.name} ({subject.code})')
        else:
            self.stdout.write('   ✅ All subjects have proper education level codes')
        
        # Summary
        self.stdout.write(f'\n📊 SUMMARY:')
        self.stdout.write(f'   Total subjects: {Subject.objects.count()}')
        self.stdout.write(f'   Subjects with proper codes: {total_subjects}')
        self.stdout.write(f'   Subjects without proper codes: {Subject.objects.count() - total_subjects}')
        
        # Check for duplicates by name within each level
        self.stdout.write(f'\n🔍 DUPLICATE CHECK:')
        for level_name, suffix in levels.items():
            subjects = Subject.objects.filter(code__endswith=suffix)
            names = []
            duplicates = []
            
            for subject in subjects:
                if subject.name in names:
                    duplicates.append(subject)
                else:
                    names.append(subject.name)
            
            if duplicates:
                self.stdout.write(f'   ⚠️  {level_name}: {len(duplicates)} duplicates found')
                for dup in duplicates:
                    self.stdout.write(f'      - {dup.name} ({dup.code})')
            else:
                self.stdout.write(f'   ✅ {level_name}: No duplicates')
        
        self.stdout.write(self.style.SUCCESS('\n✅ Subject listing completed!'))




