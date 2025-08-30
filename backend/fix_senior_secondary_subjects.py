#!/usr/bin/env python
import os
import sys
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from subject.models import Subject

def fix_senior_secondary_subjects():
    print("🔧 Updating Senior Secondary subjects...")
    
    # Define the correct Senior Secondary subjects
    correct_sss_subjects = [
        # CROSS-CUTTING
        {'name': 'English', 'code': 'English-SSS'},
        {'name': 'Mathematics', 'code': 'MAT-CR-112'},
        {'name': 'Civic Education', 'code': 'CIVICEDUCATION-SSS'},
        
        # CORE-SCIENCE
        {'name': 'Chemistry', 'code': 'CHEMISTRY-SSS'},
        {'name': 'Physics', 'code': 'PHYSICS-SSS'},
        
        # CORE-ARTS
        {'name': 'Literature in English', 'code': 'LITERATUREINENGLISH-SSS'},
        {'name': 'Government', 'code': 'GOVERNMENT-SSS'},
        {'name': 'Physical and Health Education', 'code': 'PHYSICALANDHEALTHEDUCATION-SSS'},
        
        # CORE-HUMANITIES
        {'name': 'Accounting', 'code': 'ACCOUNTING-SSS'},
        {'name': 'Economics', 'code': 'ECONOMICS-SSS'},
        
        # ELECTIVE
        {'name': 'Agricultural Science', 'code': 'AGRICULTURALSCIENCE-SSS'},
        {'name': 'Animal Husbandry', 'code': 'ANIMALHUSBANDRY-SSS'},
        {'name': 'Biology', 'code': 'BIOLOGY-SSS'},
        {'name': 'Commerce', 'code': 'COMMCE-SSS'},
        {'name': 'Computer studies', 'code': 'COMPUTERSTUDIES-SSS'},
        {'name': 'Data processing', 'code': 'DATAPROCESSING-SSS'},
        {'name': 'Food and Nutrition', 'code': 'FOODANDNUTRITION-SSS'},
        {'name': 'Physical and Health Education', 'code': 'PHE-SSS'},
        {'name': 'Christian Religious Studies', 'code': 'CRS-SSS'},
    ]
    
    # Subjects to remove from Senior Secondary
    subjects_to_remove_from_sss = [
        'ENGLISH-JSS',  # Wrong code for SSS
        'MATH-SSS',     # Wrong code
        'ENG-SSS',      # Wrong code
        'PHY-SSS',      # Wrong code
        'CHEM-SSS',     # Wrong code
        'BIO-SSS',      # Wrong code
        'GEO-SSS',      # Wrong code
        'HIST-SSS',     # Wrong code
        'ECON-SSS',     # Wrong code
        'GOV-SSS',      # Wrong code
        'LIT-SSS',      # Wrong code
        'FMATH-SSS',    # Wrong code
        'CS-SSS',       # Wrong code
        'TD-SSS',       # Wrong code
        'CHR-RE-335',   # Wrong code
    ]
    
    # First, remove SENIOR_SECONDARY from incorrect subjects
    print("\n🗑️  Removing SENIOR_SECONDARY from incorrect subjects...")
    for code in subjects_to_remove_from_sss:
        try:
            subject = Subject.objects.get(code=code)
            if 'SENIOR_SECONDARY' in subject.education_levels:
                subject.education_levels.remove('SENIOR_SECONDARY')
                subject.save()
                print(f"  ✅ Removed SENIOR_SECONDARY from {subject.name} ({subject.code})")
        except Subject.DoesNotExist:
            print(f"  ⚠️  Subject with code {code} not found")
    
    # Now ensure correct subjects have SENIOR_SECONDARY
    print("\n✅ Ensuring correct subjects have SENIOR_SECONDARY...")
    for subject_data in correct_sss_subjects:
        try:
            # First try to find by code
            subject = Subject.objects.get(code=subject_data['code'])
            if 'SENIOR_SECONDARY' not in subject.education_levels:
                subject.education_levels.append('SENIOR_SECONDARY')
                subject.save()
                print(f"  ✅ Added SENIOR_SECONDARY to {subject.name} ({subject.code})")
            else:
                print(f"  ✓ {subject.name} ({subject.code}) already has SENIOR_SECONDARY")
        except Subject.DoesNotExist:
            # Try to find by name
            try:
                subject = Subject.objects.get(name=subject_data['name'])
                # Update the code and add SENIOR_SECONDARY
                subject.code = subject_data['code']
                if 'SENIOR_SECONDARY' not in subject.education_levels:
                    subject.education_levels.append('SENIOR_SECONDARY')
                subject.save()
                print(f"  🔄 Updated existing subject: {subject.name} ({subject.code})")
            except Subject.DoesNotExist:
                # Create the subject if it doesn't exist
                try:
                    subject = Subject.objects.create(
                        name=subject_data['name'],
                        code=subject_data['code'],
                        education_levels=['SENIOR_SECONDARY']
                    )
                    print(f"  ➕ Created new subject: {subject.name} ({subject.code})")
                except Exception as e:
                    print(f"  ❌ Failed to create {subject_data['name']} ({subject_data['code']}): {e}")
    
    # Verification
    print("\n📋 Verification - Current Senior Secondary subjects:")
    sss_subjects = Subject.objects.filter(education_levels__contains=['SENIOR_SECONDARY'])
    for subject in sss_subjects.order_by('name'):
        print(f"  • {subject.name} ({subject.code})")
    
    print(f"\n🎉 Total Senior Secondary subjects: {sss_subjects.count()}")

if __name__ == '__main__':
    fix_senior_secondary_subjects()
