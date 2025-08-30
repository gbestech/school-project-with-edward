#!/usr/bin/env python
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from classroom.models import Classroom, GradeLevel, Section
from subject.models import Subject

print("=== DATABASE DEBUG ===")
print()

# Check Grade Levels
print("📚 GRADE LEVELS:")
grade_levels = GradeLevel.objects.all().order_by('id')
if grade_levels:
    for gl in grade_levels:
        print(f"  ID: {gl.id} | Name: {gl.name} | Education Level: {gl.education_level}")
else:
    print("  ❌ No grade levels found!")

print()

# Check Sections
print("📋 SECTIONS:")
sections = Section.objects.all().order_by('id')
if sections:
    for section in sections:
        print(f"  ID: {section.id} | Name: {section.name} | Grade Level: {section.grade_level.name} (ID: {section.grade_level.id})")
else:
    print("  ❌ No sections found!")

print()

# Check Classrooms
print("🏫 CLASSROOMS:")
classrooms = Classroom.objects.all().order_by('id')
if classrooms:
    for classroom in classrooms:
        print(f"  ID: {classroom.id} | Name: {classroom.name} | Section: {classroom.section.name} (ID: {classroom.section.id})")
else:
    print("  ❌ No classrooms found!")

print()

# Check specific failing IDs
print("🔍 CHECKING FAILING IDs:")
print(f"  Grade Level ID 2 exists: {GradeLevel.objects.filter(id=2).exists()}")
print(f"  Section ID 4 exists: {Section.objects.filter(id=4).exists()}")
print(f"  Classroom with section_id=4 exists: {Classroom.objects.filter(section_id=4).exists()}")

print()

# Check subjects
print("📖 SUBJECTS (first 10):")
subjects = Subject.objects.all()[:10]
for subject in subjects:
    print(f"  ID: {subject.id} | Name: {subject.name}")

print(f"  Total subjects: {Subject.objects.count()}")
