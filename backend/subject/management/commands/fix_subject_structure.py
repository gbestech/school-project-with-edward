from django.core.management.base import BaseCommand
from subject.models import Subject
from django.db import transaction


class Command(BaseCommand):
    help = 'Fix subject structure: Basic Science for nursery, Basic Science and Technology for primary and JSS'

    def handle(self, *args, **options):
        self.stdout.write('🔧 Fixing subject structure...')
        
        with transaction.atomic():
            # Step 1: Remove any duplicate Basic Science subjects
            self.stdout.write('Step 1: Cleaning up duplicate subjects...')
            
            # Find and remove any subjects with duplicate names for the same education level
            subjects_to_remove = []
            
            # Check for duplicate Basic Science subjects
            basic_science_subjects = Subject.objects.filter(
                name__icontains='Basic Science'
            ).order_by('id')
            
            if basic_science_subjects.count() > 1:  # Should only have 1: Basic Science for nursery
                self.stdout.write(f'Found {basic_science_subjects.count()} Basic Science subjects, cleaning up...')
                
                # Keep only the nursery Basic Science, remove others
                nursery_basic_science = None
                for subject in basic_science_subjects:
                    if 'NURSERY' in subject.education_levels:
                        nursery_basic_science = subject
                        break
                
                for subject in basic_science_subjects:
                    if subject != nursery_basic_science:
                        subjects_to_remove.append(subject)
                        self.stdout.write(f'  ❌ Marking for removal: {subject.name} ({subject.code})')
            
            # Remove duplicate subjects
            for subject in subjects_to_remove:
                subject.delete()
                self.stdout.write(f'  🗑️ Removed: {subject.name} ({subject.code})')
            
            # Step 2: Ensure correct Basic Science structure
            self.stdout.write('\nStep 2: Setting up correct Basic Science structure...')
            
            # Create/update Basic Science for Nursery (Pre-Nursery, Nursery 1, Nursery 2)
            nursery_basic_science, created = Subject.objects.get_or_create(
                code='BS-NUR',
                defaults={
                    'name': 'Basic Science',
                    'short_name': 'Basic Science',
                    'description': 'Basic science concepts and activities for nursery students',
                    'category': 'nursery_activities',
                    'education_levels': ['NURSERY'],
                    'nursery_levels': ['PRE_NURSERY', 'NURSERY_1', 'NURSERY_2'],
                    'is_compulsory': True,
                    'is_activity_based': True,
                    'has_continuous_assessment': True,
                    'has_final_exam': False,
                    'pass_mark': 60,
                    'has_practical': False,
                    'practical_hours': 0,
                    'requires_lab': False,
                    'requires_special_equipment': False,
                    'requires_specialist_teacher': False,
                    'subject_order': 1
                }
            )
            
            if created:
                self.stdout.write(f'  ✅ Created: {nursery_basic_science.name} for Nursery')
            else:
                # Update existing nursery Basic Science
                nursery_basic_science.name = 'Basic Science'
                nursery_basic_science.short_name = 'Basic Science'
                nursery_basic_science.description = 'Basic science concepts and activities for nursery students'
                nursery_basic_science.category = 'nursery_activities'
                nursery_basic_science.education_levels = ['NURSERY']
                nursery_basic_science.nursery_levels = ['PRE_NURSERY', 'NURSERY_1', 'NURSERY_2']
                nursery_basic_science.is_activity_based = True
                nursery_basic_science.has_final_exam = False
                nursery_basic_science.requires_specialist_teacher = False
                nursery_basic_science.save()
                self.stdout.write(f'  🔄 Updated: {nursery_basic_science.name} for Nursery')
            
            # Create/update Basic Science and Technology for Primary (Primary 1-6)
            primary_bst, created = Subject.objects.get_or_create(
                code='BST-PRI',
                defaults={
                    'name': 'Basic Science and Technology',
                    'short_name': 'BST',
                    'description': 'Basic science concepts and technology awareness for primary students',
                    'category': 'core',
                    'education_levels': ['PRIMARY'],
                    'is_compulsory': True,
                    'is_core': True,
                    'has_continuous_assessment': True,
                    'has_final_exam': True,
                    'pass_mark': 50,
                    'has_practical': True,
                    'practical_hours': 2,
                    'requires_lab': True,
                    'requires_special_equipment': True,
                    'equipment_notes': 'Basic lab equipment, microscopes',
                    'requires_specialist_teacher': True,
                    'subject_order': 3
                }
            )
            
            if created:
                self.stdout.write(f'  ✅ Created: {primary_bst.name} for Primary')
            else:
                # Update existing primary BST
                primary_bst.name = 'Basic Science and Technology'
                primary_bst.short_name = 'BST'
                primary_bst.description = 'Basic science concepts and technology awareness for primary students'
                primary_bst.category = 'core'
                primary_bst.education_levels = ['PRIMARY']
                primary_bst.is_core = True
                primary_bst.has_final_exam = True
                primary_bst.requires_specialist_teacher = True
                primary_bst.save()
                self.stdout.write(f'  🔄 Updated: {primary_bst.name} for Primary')
            
            # Create/update Basic Science and Technology for Junior Secondary (JSS1-3)
            jss_bst, created = Subject.objects.get_or_create(
                code='BST-JSS',
                defaults={
                    'name': 'Basic Science and Technology',
                    'short_name': 'BST',
                    'description': 'Integrated science concepts and technology for junior secondary students',
                    'category': 'core',
                    'education_levels': ['JUNIOR_SECONDARY'],
                    'is_compulsory': True,
                    'is_core': True,
                    'has_continuous_assessment': True,
                    'has_final_exam': True,
                    'pass_mark': 50,
                    'has_practical': True,
                    'practical_hours': 3,
                    'requires_lab': True,
                    'requires_special_equipment': True,
                    'equipment_notes': 'Laboratory equipment, chemicals, safety gear',
                    'requires_specialist_teacher': True,
                    'subject_order': 3
                }
            )
            
            if created:
                self.stdout.write(f'  ✅ Created: {jss_bst.name} for Junior Secondary')
            else:
                # Update existing JSS BST
                jss_bst.name = 'Basic Science and Technology'
                jss_bst.short_name = 'BST'
                jss_bst.description = 'Integrated science concepts and technology for junior secondary students'
                jss_bst.category = 'core'
                jss_bst.education_levels = ['JUNIOR_SECONDARY']
                jss_bst.is_core = True
                jss_bst.has_final_exam = True
                jss_bst.requires_specialist_teacher = True
                jss_bst.save()
                self.stdout.write(f'  🔄 Updated: {jss_bst.name} for Junior Secondary')
            
            # Step 3: Remove any old Basic Science subjects that are not for nursery
            old_basic_science_subjects = Subject.objects.filter(
                name__icontains='Basic Science'
            )
            for old_subject in old_basic_science_subjects:
                if 'JUNIOR_SECONDARY' in old_subject.education_levels:
                    old_subject.delete()
                    self.stdout.write(f'  🗑️ Removed old Basic Science for JSS: {old_subject.name} ({old_subject.code})')
            
            # Step 4: Update subject order for better organization
            self.stdout.write('\nStep 3: Updating subject order...')
            
            # Update subject order for nursery subjects
            nursery_subjects = [s for s in Subject.objects.all() if 'NURSERY' in s.education_levels]
            for i, subject in enumerate(nursery_subjects, 1):
                subject.subject_order = i
                subject.save(update_fields=['subject_order'])
            
            # Update subject order for primary subjects
            primary_subjects = [s for s in Subject.objects.all() if 'PRIMARY' in s.education_levels]
            for i, subject in enumerate(primary_subjects, 1):
                subject.subject_order = i
                subject.save(update_fields=['subject_order'])
            
            # Update subject order for JSS subjects
            jss_subjects = [s for s in Subject.objects.all() if 'JUNIOR_SECONDARY' in s.education_levels]
            for i, subject in enumerate(jss_subjects, 1):
                subject.subject_order = i
                subject.save(update_fields=['subject_order'])
            
            self.stdout.write('  ✅ Subject order updated')
            
            # Step 5: Display final structure
            self.stdout.write('\nStep 4: Final subject structure:')
            
            # Display nursery subjects
            nursery_subjects = sorted([s for s in Subject.objects.all() if 'NURSERY' in s.education_levels], key=lambda x: x.subject_order)
            self.stdout.write('\n📚 Nursery Subjects:')
            for subject in nursery_subjects:
                self.stdout.write(f'  • {subject.name} ({subject.code}) - {subject.category}')
            
            # Display primary subjects
            primary_subjects = sorted([s for s in Subject.objects.all() if 'PRIMARY' in s.education_levels], key=lambda x: x.subject_order)
            self.stdout.write('\n📚 Primary Subjects:')
            for subject in primary_subjects:
                self.stdout.write(f'  • {subject.name} ({subject.code}) - {subject.category}')
            
            # Display JSS subjects
            jss_subjects = sorted([s for s in Subject.objects.all() if 'JUNIOR_SECONDARY' in s.education_levels], key=lambda x: x.subject_order)
            self.stdout.write('\n📚 Junior Secondary Subjects:')
            for subject in jss_subjects:
                self.stdout.write(f'  • {subject.name} ({subject.code}) - {subject.category}')
            
            # Display Senior Secondary subjects
            sss_subjects = sorted([s for s in Subject.objects.all() if 'SENIOR_SECONDARY' in s.education_levels], key=lambda x: x.subject_order)
            self.stdout.write('\n📚 Senior Secondary Subjects:')
            for subject in sss_subjects:
                self.stdout.write(f'  • {subject.name} ({subject.code}) - {subject.category}')
            
            self.stdout.write('\n✅ Subject structure fixed successfully!')
            self.stdout.write('\n📋 Summary:')
            self.stdout.write('  • Basic Science (BS): Nursery (Pre-Nursery, Nursery 1, Nursery 2)')
            self.stdout.write('  • Basic Science and Technology (BST): Primary (Primary 1-6)')
            self.stdout.write('  • Basic Science and Technology (BST): Junior Secondary (JSS1-3)')
            self.stdout.write('  • Individual Science Subjects: Senior Secondary (SSS1-3)')
