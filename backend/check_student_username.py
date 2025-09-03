#!/usr/bin/env python
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from students.models import Student
from django.contrib.auth import get_user_model

User = get_user_model()

print("=== Checking for student with username STU/GTS/AUG/25/STU002 ===")

# Check by exact username
exact_user = User.objects.filter(username='STU/GTS/AUG/25/STU002').first()
if exact_user:
    print(f"✓ Found user with exact username: {exact_user.username}")
    print(f"  Email: {exact_user.email}")
    print(f"  First Name: {exact_user.first_name}")
    print(f"  Last Name: {exact_user.last_name}")
else:
    print("✗ No user found with exact username")

# Check by partial username
partial_users = User.objects.filter(username__icontains='STU002')
print(f"\nUsers with username containing 'STU002': {partial_users.count()}")
for user in partial_users:
    print(f"  - {user.username}")

# Check by registration number
students_with_registration = Student.objects.filter(registration_number__icontains='STU002')
print(f"\nStudents with registration number containing 'STU002': {students_with_registration.count()}")
for student in students_with_registration:
    print(f"  - Registration: {student.registration_number}")
    if student.user:
        print(f"    Username: {student.user.username}")
        print(f"    Name: {student.user.first_name} {student.user.last_name}")

# Check all students with usernames
print(f"\n=== All students with usernames ===")
students_with_users = Student.objects.filter(user__isnull=False).select_related('user')
for student in students_with_users[:10]:  # Show first 10
    print(f"  - {student.user.username} -> {student.registration_number} -> {student.user.first_name} {student.user.last_name}")

print(f"\nTotal students with users: {students_with_users.count()}")
