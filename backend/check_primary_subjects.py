#!/usr/bin/env python
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from subject.models import Subject

def check_primary_subjects():
    print("🔍 CHECKING CURRENT PRIMARY SUBJECTS")
    print("=" * 50)
    
    primary_subjects = []
    for subject in Subject.objects.all():
        if subject.education_levels and 'PRIMARY' in subject.education_levels:
            primary_subjects.append(subject)
    
    print("Current PRIMARY subjects:")
    for subject in sorted(primary_subjects, key=lambda x: x.name):
        print(f"✅ {subject.name} ({subject.code})")
    
    print(f"\n📊 Total primary subjects: {len(primary_subjects)}")
    
    # Check for subjects that should be primary but aren't
    print("\n🔍 CHECKING FOR MISSING PRIMARY SUBJECTS:")
    expected_codes = [
        'CCA-PRI', 'NV-PRI', 'FRENCH-PRI', 'HW-PRI', 'BST-PRI', 
        'HISTORY-PRI', 'MATH-PRI', 'ES-PRI', 'CRS-PRI', 'PVS-PRI'
    ]
    
    for code in expected_codes:
        try:
            subject = Subject.objects.get(code=code)
            if 'PRIMARY' not in (subject.education_levels or []):
                print(f"⚠️  {subject.name} ({subject.code}) exists but not assigned to PRIMARY")
        except Subject.DoesNotExist:
            print(f"❌ Subject with code {code} not found")

if __name__ == "__main__":
    check_primary_subjects()
