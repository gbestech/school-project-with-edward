#!/usr/bin/env python
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from subject.models import Subject

def check_subjects():
    subjects = Subject.objects.all()
    print(f"Total subjects: {subjects.count()}")
    print("\n" + "="*50)
    
    # Group by education level
    nursery_subjects = []
    primary_subjects = []
    junior_secondary_subjects = []
    senior_secondary_subjects = []
    
    for subject in subjects:
        levels = subject.education_levels or []
        if 'NURSERY' in levels:
            nursery_subjects.append(subject)
        if 'PRIMARY' in levels:
            primary_subjects.append(subject)
        if 'JUNIOR_SECONDARY' in levels:
            junior_secondary_subjects.append(subject)
        if 'SENIOR_SECONDARY' in levels:
            senior_secondary_subjects.append(subject)
    
    print("NURSERY SUBJECTS:")
    print("-" * 30)
    for subject in nursery_subjects:
        print(f"- {subject.name} ({subject.code})")
    
    print("\nPRIMARY SUBJECTS:")
    print("-" * 30)
    for subject in primary_subjects:
        print(f"- {subject.name} ({subject.code})")
    
    print("\nJUNIOR SECONDARY SUBJECTS:")
    print("-" * 30)
    for subject in junior_secondary_subjects:
        print(f"- {subject.name} ({subject.code})")
    
    print("\nSENIOR SECONDARY SUBJECTS:")
    print("-" * 30)
    for subject in senior_secondary_subjects:
        print(f"- {subject.name} ({subject.code})")

if __name__ == "__main__":
    check_subjects()
