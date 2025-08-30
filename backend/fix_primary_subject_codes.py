#!/usr/bin/env python
import os
import sys
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from subject.models import Subject

def fix_primary_subject_codes():
    print("🔧 Updating Primary subject codes with new naming convention...")
    
    # Define the updated subject codes with new naming convention
    updated_codes = {
        'CULTURALANDCREATIVEARTS-PRI': 'CCA-PRI',
        'ENGLISHSTUDIES-PRI': 'ENG.S-PRI',
        'HANDWRITING-PRI': 'H.W-PRI',
        'MATHEMATICS-PRI': 'Maths-PRI',
        'NATIONALVALUES-PRI': 'N.V-PRI',
        'PREVOCATIONALSTUDIES-PRI': 'PVS-PRI',
    }
    
    # Update each subject
    for old_code, new_code in updated_codes.items():
        try:
            subject = Subject.objects.get(code=old_code)
            subject.code = new_code
            subject.save()
            print(f"  ✅ Updated {subject.name}: {old_code} → {new_code}")
        except Subject.DoesNotExist:
            print(f"  ⚠️  Subject with code {old_code} not found")
    
    # Verification
    print("\n📋 Verification - Updated Primary subjects:")
    all_subjects = Subject.objects.all()
    primary_subjects = [s for s in all_subjects if 'PRIMARY' in s.education_levels]
    for subject in sorted(primary_subjects, key=lambda x: x.name):
        print(f"  • {subject.name} ({subject.code})")
    
    print(f"\n🎉 Total Primary subjects: {len(primary_subjects)}")

if __name__ == '__main__':
    fix_primary_subject_codes()
