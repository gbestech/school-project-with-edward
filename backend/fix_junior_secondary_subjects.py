#!/usr/bin/env python
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from subject.models import Subject

def fix_junior_secondary_subjects():
    print("🔧 FIXING JUNIOR SECONDARY SUBJECT ASSIGNMENTS")
    print("=" * 50)
    
    # Correct junior secondary subjects as specified by user
    correct_jss_subjects = [
        'ENG-JSS',      # English Studies
        'MAT-JSS',      # Mathematics
        'NV-JSS',       # National Values
        'CIV-JSS',      # Civic Education
        'SEC-JSS',      # Security Education
        'SOC-JSS',      # Social Studies
        'BST-JSS',      # Basic Science and Technology (Composite subject)
        'BAT-JSS',      # Basic Technology (Part of BST team)
        'IT-JSS',       # Information Technology (Part of BST team)
        'BAS-JSS',      # Basic Science (Part of BST team)
        'PHE-JSS',      # Physical and Health Education (Part of BST team)
        'PVS-JSS',      # Pre-Vocational Studies
        'AGR-JSS',      # Agricultural Science
        'HE-JSS',       # Home Economics
        'BUSINESSSTUDIES-JSS',  # Business Studies
        'HIS-JSS',      # History
        'CCA-JSS',      # Cultural and Creative Arts
        'HAUSA-JSS',    # Hausa
        'CRS-JSS',      # Christian Religious Studies
    ]
    
    # Subjects to remove from junior secondary (incorrectly assigned)
    subjects_to_remove_from_jss = [
        'CULTURALANDCREATIVEARTS-JSS',  # Cultural and creative arts (Duplicate)
        'NATIONALVALUES-JSS',           # National values (Duplicate)
        'FRENCH-JSS',                   # French (Not in JSS)
        'ENGLISH-JSS',                  # English (Duplicate - should be ENG-JSS)
    ]
    
    print("📋 CORRECT JUNIOR SECONDARY SUBJECTS:")
    for subject_code in correct_jss_subjects:
        try:
            subject = Subject.objects.get(code=subject_code)
            print(f"✅ {subject.name} ({subject.code})")
            
            # Ensure this subject has JUNIOR_SECONDARY in its education_levels
            if 'JUNIOR_SECONDARY' not in (subject.education_levels or []):
                subject.education_levels = (subject.education_levels or []) + ['JUNIOR_SECONDARY']
                subject.save()
                print(f"   🔧 Added JUNIOR_SECONDARY to education levels")
        except Subject.DoesNotExist:
            print(f"❌ Subject with code {subject_code} not found")
    
    print("\n🗑️ REMOVING INCORRECT SUBJECTS FROM JUNIOR SECONDARY:")
    for subject_code in subjects_to_remove_from_jss:
        try:
            subject = Subject.objects.get(code=subject_code)
            print(f"📝 {subject.name} ({subject.code}) - Current levels: {subject.education_levels}")
            
            # Remove JUNIOR_SECONDARY from education_levels if present
            if subject.education_levels and 'JUNIOR_SECONDARY' in subject.education_levels:
                subject.education_levels = [level for level in subject.education_levels if level != 'JUNIOR_SECONDARY']
                subject.save()
                print(f"   🗑️ Removed JUNIOR_SECONDARY from education levels")
            else:
                print(f"   ✅ Already not assigned to JUNIOR_SECONDARY")
        except Subject.DoesNotExist:
            print(f"❌ Subject with code {subject_code} not found")
    
    print("\n🔍 VERIFICATION - FINAL JUNIOR SECONDARY SUBJECTS:")
    jss_subjects = []
    for subject in Subject.objects.all():
        if subject.education_levels and 'JUNIOR_SECONDARY' in subject.education_levels:
            jss_subjects.append(subject)
    
    for subject in sorted(jss_subjects, key=lambda x: x.name):
        print(f"✅ {subject.name} ({subject.code})")
    
    print(f"\n📊 Total junior secondary subjects: {len(jss_subjects)}")
    
    # Highlight BST team subjects
    print("\n🎯 BST TEAM SUBJECTS (Composite: Basic Science and Technology):")
    bst_team = ['BST-JSS', 'BAT-JSS', 'IT-JSS', 'BAS-JSS', 'PHE-JSS']
    for code in bst_team:
        try:
            subject = Subject.objects.get(code=code)
            if 'JUNIOR_SECONDARY' in (subject.education_levels or []):
                print(f"   🔗 {subject.name} ({subject.code})")
        except Subject.DoesNotExist:
            print(f"   ❌ {code} not found")

if __name__ == "__main__":
    fix_junior_secondary_subjects()
