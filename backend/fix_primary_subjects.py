#!/usr/bin/env python
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from subject.models import Subject

def fix_primary_subjects():
    print("🔧 FIXING PRIMARY SUBJECT ASSIGNMENTS")
    print("=" * 50)
    
    # Correct primary subjects as specified by user
    correct_primary_subjects = [
        'CCA-PRI',      # Cultural and creative arts
        'NV-PRI',       # National values
        'FRENCH-PRI',   # French
        'HW-PRI',       # Hand writing
        'BST-PRI',      # Basic Science and Technology
        'HISTORY-PRI',  # History
        'MATH-PRI',     # Mathematics
        'ES-PRI',       # English Studies
        'CRS-PRI',      # Christian Religious Studies
        'PVS-PRI',      # Pre-vocational Studies
    ]
    
    # Subjects to remove from primary (incorrectly assigned)
    subjects_to_remove_from_primary = [
        'CULTURALANDCREATIVEARTS-JSS',  # Cultural and creative arts (Junior Secondary)
        'NATIONALVALUES-JSS',           # National values (Junior Secondary)
        'FRENCH-JSS',                   # French (Junior Secondary)
        'ENGLISH-JSS',                  # English (Junior Secondary)
        'BASICSCIENCE-PRI',             # Basic Science (Primary)
        'COLOURINGACTIVITIES-PRI',      # Colouring activities (Primary)
        'MORALANDVALUESSTUDIES-PRI',    # Moral and Values Studies (Primary)
    ]
    
    print("📋 CORRECT PRIMARY SUBJECTS:")
    for subject_code in correct_primary_subjects:
        try:
            subject = Subject.objects.get(code=subject_code)
            print(f"✅ {subject.name} ({subject.code})")
            
            # Ensure this subject has PRIMARY in its education_levels
            if 'PRIMARY' not in (subject.education_levels or []):
                subject.education_levels = (subject.education_levels or []) + ['PRIMARY']
                subject.save()
                print(f"   🔧 Added PRIMARY to education levels")
        except Subject.DoesNotExist:
            print(f"❌ Subject with code {subject_code} not found")
    
    print("\n🗑️ REMOVING INCORRECT SUBJECTS FROM PRIMARY:")
    for subject_code in subjects_to_remove_from_primary:
        try:
            subject = Subject.objects.get(code=subject_code)
            print(f"📝 {subject.name} ({subject.code}) - Current levels: {subject.education_levels}")
            
            # Remove PRIMARY from education_levels if present
            if subject.education_levels and 'PRIMARY' in subject.education_levels:
                subject.education_levels = [level for level in subject.education_levels if level != 'PRIMARY']
                subject.save()
                print(f"   🗑️ Removed PRIMARY from education levels")
            else:
                print(f"   ✅ Already not assigned to PRIMARY")
        except Subject.DoesNotExist:
            print(f"❌ Subject with code {subject_code} not found")
    
    print("\n🔍 VERIFICATION - FINAL PRIMARY SUBJECTS:")
    primary_subjects = []
    for subject in Subject.objects.all():
        if subject.education_levels and 'PRIMARY' in subject.education_levels:
            primary_subjects.append(subject)
    
    for subject in sorted(primary_subjects, key=lambda x: x.name):
        print(f"✅ {subject.name} ({subject.code})")
    
    print(f"\n📊 Total primary subjects: {len(primary_subjects)}")

if __name__ == "__main__":
    fix_primary_subjects()
