#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from subject.models import Subject
from academics.models import Subject as AcademicsSubject
from result.models import GradingSystem, ExamSession
from students.models import Student

print("=== Debugging Foreign Key Constraints ===")

print("\n1. Checking Subject models:")
print("subject.models.Subject count:", Subject.objects.count())
print("academics.models.Subject count:", AcademicsSubject.objects.count())

print("\n2. Checking Grading System ID 2:")
grading_system = GradingSystem.objects.filter(id=2).first()
if grading_system:
    print(f"Found: {grading_system.name} (Active: {grading_system.is_active})")
else:
    print("Grading System ID 2 does not exist")

print("\n3. Checking Exam Sessions:")
exam_sessions = ExamSession.objects.all()[:5]
print(f"Found {exam_sessions.count()} exam sessions")
for session in exam_sessions:
    print(f"  ID: {session.id}, Name: {session.name}")

print("\n4. Checking Students:")
students = Student.objects.all()[:5]
print(f"Found {students.count()} students")
for student in students:
    print(f"  ID: {student.id}, Name: {student.full_name}, Level: {student.education_level}")

print("\n5. Checking Subject ID 109 in both models:")
subject_109 = Subject.objects.filter(id=109).first()
academics_subject_109 = AcademicsSubject.objects.filter(id=109).first()

if subject_109:
    print(f"subject.models.Subject ID 109: {subject_109.name} ({subject_109.code})")
else:
    print("subject.models.Subject ID 109: Not found")

if academics_subject_109:
    print(f"academics.models.Subject ID 109: {academics_subject_109.name} ({academics_subject_109.code})")
else:
    print("academics.models.Subject ID 109: Not found")


