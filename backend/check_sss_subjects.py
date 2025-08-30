#!/usr/bin/env python
import os
import sys
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from subject.models import Subject

def check_sss_subjects():
    print("🔍 Checking current Senior Secondary subjects...")
    
    # Check all subjects and filter in Python
    all_subjects = Subject.objects.all()
    sss_subjects = [s for s in all_subjects if 'SENIOR_SECONDARY' in s.education_levels]
    
    print(f"\n📋 Current Senior Secondary subjects ({len(sss_subjects)}):")
    for subject in sorted(sss_subjects, key=lambda x: x.name):
        print(f"  • {subject.name} ({subject.code}) - Levels: {subject.education_levels}")
    
    # Check for subjects with "Physical and Health Education" name
    phe_subjects = Subject.objects.filter(name__icontains='Physical and Health Education')
    print(f"\n🏃 Physical and Health Education subjects ({phe_subjects.count()}):")
    for subject in phe_subjects:
        print(f"  • {subject.name} ({subject.code}) - Levels: {subject.education_levels}")
    
    # Check for subjects with "Christian Religious Studies" name
    crs_subjects = Subject.objects.filter(name__icontains='Christian Religious Studies')
    print(f"\n⛪ Christian Religious Studies subjects ({crs_subjects.count()}):")
    for subject in crs_subjects:
        print(f"  • {subject.name} ({subject.code}) - Levels: {subject.education_levels}")

if __name__ == '__main__':
    check_sss_subjects()
