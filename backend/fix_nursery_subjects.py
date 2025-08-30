#!/usr/bin/env python
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from subject.models import Subject

def fix_nursery_subjects():
    print("🔧 FIXING NURSERY SUBJECT ASSIGNMENTS")
    print("=" * 50)
    
    # Correct nursery subjects as specified by user
    correct_nursery_subjects = [
        'MATHEMATICSNUMBERS-NUR',  # Mathematics (Numbers)
        'MVS-NUR',                 # Moral and Value Studies
        'CRAFT-NUR',               # Craft
        'RHYMES-NUR',              # Rhymes
        'SOCIALSTUDIES-NUR',       # Social studies
        'WRITINGSKILL-NUR',        # Writing skill
        'ENGLISHALPHABET-NUR',     # English (Alphabet)
        'BS-NUR',                  # Basic Science
        'PHE-NUR',                 # Physical and Health Education
        'COMPUTERSTUDIES-NUR',     # Computer Studies
        'CRS-NUR',                 # Christian Religious Studies
        'COLOURINGACTIVITIES-NUR', # Colouring activities
    ]
    
    # Subjects to remove from nursery (incorrectly assigned)
    subjects_to_remove_from_nursery = [
        'BASICSCIENCE-PRI',        # Basic science (Primary)
        'COLOURINGACTIVITIES-PRI', # Colouring activities (Primary)
        'MORALANDVALUESSTUDIES-PRI', # Moral and Values Studies (Primary)
        'ENGLISH-JSS',             # English (Junior Secondary)
        'PHYSICALANDHEALTHEDUCATION-SSS', # Physical and Health Education (Senior Secondary)
    ]
    
    print("📋 CORRECT NURSERY SUBJECTS:")
    for subject_code in correct_nursery_subjects:
        try:
            subject = Subject.objects.get(code=subject_code)
            print(f"✅ {subject.name} ({subject.code})")
            
            # Ensure this subject has NURSERY in its education_levels
            if 'NURSERY' not in (subject.education_levels or []):
                subject.education_levels = (subject.education_levels or []) + ['NURSERY']
                subject.save()
                print(f"   🔧 Added NURSERY to education levels")
        except Subject.DoesNotExist:
            print(f"❌ Subject with code {subject_code} not found")
    
    print("\n🗑️ REMOVING INCORRECT SUBJECTS FROM NURSERY:")
    for subject_code in subjects_to_remove_from_nursery:
        try:
            subject = Subject.objects.get(code=subject_code)
            print(f"📝 {subject.name} ({subject.code}) - Current levels: {subject.education_levels}")
            
            # Remove NURSERY from education_levels if present
            if subject.education_levels and 'NURSERY' in subject.education_levels:
                subject.education_levels = [level for level in subject.education_levels if level != 'NURSERY']
                subject.save()
                print(f"   🗑️ Removed NURSERY from education levels")
            else:
                print(f"   ✅ Already not assigned to NURSERY")
        except Subject.DoesNotExist:
            print(f"❌ Subject with code {subject_code} not found")
    
    print("\n🔍 VERIFICATION - FINAL NURSERY SUBJECTS:")
    nursery_subjects = []
    for subject in Subject.objects.all():
        if subject.education_levels and 'NURSERY' in subject.education_levels:
            nursery_subjects.append(subject)
    
    for subject in sorted(nursery_subjects, key=lambda x: x.name):
        print(f"✅ {subject.name} ({subject.code})")
    
    print(f"\n📊 Total nursery subjects: {len(nursery_subjects)}")

if __name__ == "__main__":
    fix_nursery_subjects()
