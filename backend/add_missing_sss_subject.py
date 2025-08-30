#!/usr/bin/env python
import os
import sys
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from subject.models import Subject

def add_missing_sss_subject():
    print("🔧 Adding missing Senior Secondary subject...")
    
    # Check if CRS-SSS already exists
    try:
        subject = Subject.objects.get(code='CRS-SSS')
        print(f"  ✓ {subject.name} ({subject.code}) already exists")
        if 'SENIOR_SECONDARY' not in subject.education_levels:
            subject.education_levels.append('SENIOR_SECONDARY')
            subject.save()
            print(f"  ✅ Added SENIOR_SECONDARY to {subject.name} ({subject.code})")
        else:
            print(f"  ✓ {subject.name} ({subject.code}) already has SENIOR_SECONDARY")
    except Subject.DoesNotExist:
        # Create the subject
        subject = Subject.objects.create(
            name='Christian Religious Studies',
            code='CRS-SSS',
            education_levels=['SENIOR_SECONDARY']
        )
        print(f"  ➕ Created new subject: {subject.name} ({subject.code})")
    
    # Verification
    print("\n📋 Final Senior Secondary subjects:")
    all_subjects = Subject.objects.all()
    sss_subjects = [s for s in all_subjects if 'SENIOR_SECONDARY' in s.education_levels]
    for subject in sorted(sss_subjects, key=lambda x: x.name):
        print(f"  • {subject.name} ({subject.code})")
    
    print(f"\n🎉 Total Senior Secondary subjects: {len(sss_subjects)}")

if __name__ == '__main__':
    add_missing_sss_subject()
