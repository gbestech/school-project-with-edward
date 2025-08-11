#!/usr/bin/env python
"""
Script to check and populate classroom form dropdown data
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from classroom.models import Section, AcademicYear, Term
from teacher.models import Teacher
from django.contrib.auth import get_user_model

User = get_user_model()

def check_and_create_data():
    print("=== Checking Classroom Form Data ===")
    
    # Check Sections
    print("\n1. Checking Sections...")
    sections = Section.objects.all()
    print(f"Found {sections.count()} sections")
    if sections.exists():
        for section in sections[:5]:  # Show first 5
            print(f"  - {section.name} (Grade: {section.grade_level.name})")
    else:
        print("  No sections found!")
    
    # Check Academic Years
    print("\n2. Checking Academic Years...")
    academic_years = AcademicYear.objects.all()
    print(f"Found {academic_years.count()} academic years")
    if academic_years.exists():
        for year in academic_years:
            print(f"  - {year.name} (Current: {year.is_current})")
    else:
        print("  No academic years found!")
    
    # Check Terms
    print("\n3. Checking Terms...")
    terms = Term.objects.all()
    print(f"Found {terms.count()} terms")
    if terms.exists():
        for term in terms:
            print(f"  - {term.get_name_display()} (Academic Year: {term.academic_year.name})")
    else:
        print("  No terms found!")
    
    # Check Teachers
    print("\n4. Checking Teachers...")
    teachers = Teacher.objects.all()
    print(f"Found {teachers.count()} teachers")
    if teachers.exists():
        for teacher in teachers[:5]:  # Show first 5
            try:
                teacher_name = teacher.user.get_full_name() if hasattr(teacher.user, 'get_full_name') else teacher.user.full_name
                print(f"  - {teacher_name} (ID: {teacher.id})")
            except:
                print(f"  - Teacher {teacher.id} (User: {teacher.user.email})")
    else:
        print("  No teachers found!")
    
    # Check Users
    print("\n5. Checking Users...")
    users = User.objects.all()
    print(f"Found {users.count()} users")
    if users.exists():
        for user in users[:5]:  # Show first 5
            print(f"  - {user.email} (ID: {user.id})")
    else:
        print("  No users found!")

if __name__ == "__main__":
    check_and_create_data() 