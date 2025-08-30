#!/usr/bin/env python
import os
import sys
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from subject.models import Subject

def fix_sss_subject_codes_final():
    print("🔧 Making final corrections to Senior Secondary subject codes...")
    
    # Define the corrections
    corrections = {
        # Fix Mathematics to Cross-cutting
        'Math-Cor-SSS': 'Math-Cro-SSS',
        
        # Fix Civic Education to Cross-cutting
        'CIV.-Core-SSS': 'CIV-Cro-SSS',
        
        # Fix Commerce name and code
        'Comm-Elec-SSS': 'Comm-Elec-SSS',  # Code stays the same, just fixing the name
    }
    
    # Update each subject
    for old_code, new_code in corrections.items():
        try:
            subject = Subject.objects.get(code=old_code)
            subject.code = new_code
            
            # Special case: Fix Commerce name
            if old_code == 'Comm-Elec-SSS':
                subject.name = 'Commerce'  # Fix the typo "Commce" to "Commerce"
            
            subject.save()
            print(f"  ✅ Updated {subject.name}: {old_code} → {new_code}")
        except Subject.DoesNotExist:
            print(f"  ⚠️  Subject with code {old_code} not found")
    
    # Verification
    print("\n📋 Verification - Final Senior Secondary subjects:")
    all_subjects = Subject.objects.all()
    sss_subjects = [s for s in all_subjects if 'SENIOR_SECONDARY' in s.education_levels]
    for subject in sorted(sss_subjects, key=lambda x: x.name):
        print(f"  • {subject.name} ({subject.code})")
    
    print(f"\n🎉 Total Senior Secondary subjects: {len(sss_subjects)}")

if __name__ == '__main__':
    fix_sss_subject_codes_final()
