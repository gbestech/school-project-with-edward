#!/usr/bin/env python
"""
Script to check the current subject structure
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from subject.models import Subject

def check_subject_structure():
    """Check the current subject structure"""
    print("=== Current Subject Structure ===")
    
    # Check all Basic Science subjects
    basic_science_subjects = Subject.objects.filter(
        name__icontains='Basic Science'
    ).order_by('id')
    
    print(f"\n🔬 Basic Science Subjects Found: {basic_science_subjects.count()}")
    for subject in basic_science_subjects:
        print(f"  • {subject.name} ({subject.code})")
        print(f"    - Education Levels: {subject.education_levels}")
        print(f"    - Nursery Levels: {subject.nursery_levels}")
        print(f"    - Category: {subject.category}")
        print(f"    - Active: {subject.is_active}")
        print()
    
    # Check all subjects by education level
    print("\n📚 Subjects by Education Level:")
    
    for level in ['NURSERY', 'PRIMARY', 'JUNIOR_SECONDARY', 'SENIOR_SECONDARY']:
        subjects = [s for s in Subject.objects.filter(is_active=True) if level in s.education_levels]
        subjects.sort(key=lambda x: x.name)
        
        print(f"\n{level}:")
        for subject in subjects:
            print(f"  • {subject.name} ({subject.code})")
    
    # Check for any duplicate names within the same education level
    print("\n🔍 Checking for duplicates...")
    all_subjects = Subject.objects.filter(is_active=True)
    
    for level in ['NURSERY', 'PRIMARY', 'JUNIOR_SECONDARY', 'SENIOR_SECONDARY']:
        level_subjects = [s for s in all_subjects if level in s.education_levels]
        names = [subject.name for subject in level_subjects]
        
        duplicates = []
        seen = set()
        for name in names:
            if name in seen:
                duplicates.append(name)
            seen.add(name)
        
        if duplicates:
            print(f"  ⚠️ Duplicates in {level}: {duplicates}")
        else:
            print(f"  ✅ No duplicates in {level}")

if __name__ == "__main__":
    check_subject_structure()
