from django.core.management.base import BaseCommand
from subject.models import Subject
from django.db import transaction


class Command(BaseCommand):
    help = 'Clean up duplicate subjects and add missing subjects according to specifications'

    def handle(self, *args, **options):
        self.stdout.write('🧹 CLEANING UP AND ADDING SUBJECTS')
        self.stdout.write('=' * 50)
        
        with transaction.atomic():
            # Step 1: Remove duplicates
            self.stdout.write('\n🗑️  REMOVING DUPLICATES...')
            self.remove_duplicates()
            
            # Step 2: Fix the subject without proper code
            self.stdout.write('\n🔧 FIXING SUBJECT WITHOUT PROPER CODE...')
            self.fix_improper_codes()
            
            # Step 3: Add missing subjects
            self.stdout.write('\n➕ ADDING MISSING SUBJECTS...')
            self.add_missing_subjects()
            
            # Step 4: Update parent-child relationships
            self.stdout.write('\n🔗 UPDATING PARENT-CHILD RELATIONSHIPS...')
            self.update_relationships()
        
        self.stdout.write(self.style.SUCCESS('\n✅ Cleanup and addition completed!'))
        
        # Show final summary
        self.stdout.write('\n📊 FINAL SUMMARY:')
        self.show_summary()

    def remove_duplicates(self):
        """Remove duplicate subjects in JSS level"""
        duplicates_to_remove = [
            'HISTORY-JSS',  # Keep HIS-JSS
            'PRE-VOCATIONALSTUDIES-JSS',  # Keep PVS-JSS
            'MATHEMATICS-JSS',  # Keep MAT-JSS
            'CHRISTIANRELIGIOUSSTUDIES-JSS'  # Keep CRS-JSS
        ]
        
        for code in duplicates_to_remove:
            try:
                subject = Subject.objects.get(code=code)
                self.stdout.write(f'   🗑️  Removing duplicate: {subject.name} ({code})')
                subject.delete()
            except Subject.DoesNotExist:
                self.stdout.write(f'   ⚠️  Subject with code {code} not found')

    def fix_improper_codes(self):
        """Fix subjects without proper education level codes"""
        from django.db.models import Q
        improper_subjects = Subject.objects.exclude(
            Q(code__endswith='-NUR') | 
            Q(code__endswith='-PRI') | 
            Q(code__endswith='-JSS') | 
            Q(code__endswith='-SSS')
        )
        
        for subject in improper_subjects:
            self.stdout.write(f'   🔧 Fixing: {subject.name} ({subject.code})')
            # Determine the correct education level based on name
            if 'Mathematics' in subject.name:
                subject.code = 'MATHEMATICS-PRI'  # Assign to Primary
                subject.education_levels = ['PRIMARY']
                subject.save()
                self.stdout.write(f'      → Updated to: {subject.code}')

    def add_missing_subjects(self):
        """Add missing subjects according to specifications"""
        
        # NURSERY SUBJECTS
        nursery_subjects = [
            {'name': 'English (Alphabet)', 'code': 'ENGLISHALPHABET-NUR', 'category': 'language'},
            {'name': 'Mathematics (Numbers)', 'code': 'MATHEMATICSNUMBERS-NUR', 'category': 'core'},
            {'name': 'Christian Religious Studies', 'code': 'CRS-NUR', 'category': 'religious'},
            {'name': 'Computer Studies', 'code': 'COMPUTERSTUDIES-NUR', 'category': 'practical'},
            {'name': 'Moral and Value Studies', 'code': 'MVS-NUR', 'category': 'core'},
            {'name': 'Physical and Health Education', 'code': 'PHE-NUR', 'category': 'physical'},
        ]
        
        # PRIMARY SUBJECTS
        primary_subjects = [
            {'name': 'English Studies', 'code': 'ENGLISHSTUDIES-PRI', 'category': 'language'},
            {'name': 'Mathematics', 'code': 'MATHEMATICS-PRI', 'category': 'core'},
            {'name': 'National Values', 'code': 'NATIONALVALUES-PRI', 'category': 'core'},
            {'name': 'Christian Religious Studies', 'code': 'CRS-PRI', 'category': 'religious'},
            {'name': 'Pre-vocational Studies', 'code': 'PREVOCATIONALSTUDIES-PRI', 'category': 'vocational'},
            {'name': 'History', 'code': 'HISTORY-PRI', 'category': 'core_humanities'},
            {'name': 'Cultural and Creative Arts', 'code': 'CULTURALANDCREATIVEARTS-PRI', 'category': 'creative_arts'},
            {'name': 'French', 'code': 'FRENCH-PRI', 'category': 'language'},
        ]
        
        # Add Nursery subjects
        self.stdout.write('   📚 Adding Nursery subjects...')
        for subject_data in nursery_subjects:
            if not Subject.objects.filter(code=subject_data['code']).exists():
                Subject.objects.create(
                    name=subject_data['name'],
                    code=subject_data['code'],
                    category=subject_data['category'],
                    education_levels=['NURSERY'],
                    is_active=True
                )
                self.stdout.write(f'      ✅ Added: {subject_data["name"]}')
            else:
                self.stdout.write(f'      ⚠️  Already exists: {subject_data["name"]}')
        
        # Add Primary subjects
        self.stdout.write('   📚 Adding Primary subjects...')
        for subject_data in primary_subjects:
            if not Subject.objects.filter(code=subject_data['code']).exists():
                Subject.objects.create(
                    name=subject_data['name'],
                    code=subject_data['code'],
                    category=subject_data['category'],
                    education_levels=['PRIMARY'],
                    is_active=True
                )
                self.stdout.write(f'      ✅ Added: {subject_data["name"]}')
            else:
                self.stdout.write(f'      ⚠️  Already exists: {subject_data["name"]}')

    def update_relationships(self):
        """Update parent-child relationships for JSS subjects"""
        
        # Update BST parent-child relationships
        try:
            bst_parent = Subject.objects.get(code='BST-JSS')
            bst_components = ['BAS-JSS', 'BAT-JSS', 'IT-JSS', 'PHE-JSS']
            
            for comp_code in bst_components:
                try:
                    component = Subject.objects.get(code=comp_code)
                    component.parent_subject = bst_parent
                    component.save()
                    self.stdout.write(f'   🔗 Linked {component.name} to BST parent')
                except Subject.DoesNotExist:
                    self.stdout.write(f'   ⚠️  Component {comp_code} not found')
        except Subject.DoesNotExist:
            self.stdout.write('   ⚠️  BST parent subject not found')
        
        # Update National Values parent-child relationships
        try:
            nv_parent = Subject.objects.get(code='NV-JSS')
            nv_components = ['CIV-JSS', 'SOC-JSS', 'SEC-JSS']
            
            for comp_code in nv_components:
                try:
                    component = Subject.objects.get(code=comp_code)
                    component.parent_subject = nv_parent
                    component.save()
                    self.stdout.write(f'   🔗 Linked {component.name} to National Values parent')
                except Subject.DoesNotExist:
                    self.stdout.write(f'   ⚠️  Component {comp_code} not found')
        except Subject.DoesNotExist:
            self.stdout.write('   ⚠️  National Values parent subject not found')
        
        # Update Pre-Vocational Studies parent-child relationships
        try:
            pvs_parent = Subject.objects.get(code='PVS-JSS')
            pvs_components = ['HE-JSS', 'AGR-JSS']
            
            for comp_code in pvs_components:
                try:
                    component = Subject.objects.get(code=comp_code)
                    component.parent_subject = pvs_parent
                    component.save()
                    self.stdout.write(f'   🔗 Linked {component.name} to Pre-Vocational Studies parent')
                except Subject.DoesNotExist:
                    self.stdout.write(f'   ⚠️  Component {comp_code} not found')
        except Subject.DoesNotExist:
            self.stdout.write('   ⚠️  Pre-Vocational Studies parent subject not found')

    def show_summary(self):
        """Show final summary of subjects by level"""
        levels = {
            'NURSERY': '-NUR',
            'PRIMARY': '-PRI',
            'JUNIOR_SECONDARY': '-JSS',
            'SENIOR_SECONDARY': '-SSS'
        }
        
        for level_name, suffix in levels.items():
            count = Subject.objects.filter(code__endswith=suffix).count()
            self.stdout.write(f'   {level_name}: {count} subjects')
        
        total = Subject.objects.count()
        self.stdout.write(f'   Total: {total} subjects')
