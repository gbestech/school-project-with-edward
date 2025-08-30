#!/usr/bin/env python3
import os
import sys
import django

# Add the backend directory to the Python path
sys.path.append('/app')

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'school_management.settings')
django.setup()

from teacher.models import Teacher, TeacherAssignment
from classroom.models import ClassroomTeacherAssignment
from subject.models import Subject

def check_teacher_assignments():
    # Find Obianujunwa
    teacher = Teacher.objects.filter(user__first_name='Obianujunwa').first()
    
    if not teacher:
        print("❌ Teacher 'Obianujunwa' not found!")
        return
    
    print(f"✅ Found teacher: {teacher.user.first_name} {teacher.user.last_name} (ID: {teacher.id})")
    
    # Check TeacherAssignment records
    teacher_assignments = TeacherAssignment.objects.filter(teacher=teacher)
    print(f"\n📚 TeacherAssignment records: {teacher_assignments.count()}")
    
    for assignment in teacher_assignments:
        print(f"  - {assignment.subject.name} ({assignment.grade_level.name} - {assignment.section.name})")
    
    # Check ClassroomTeacherAssignment records
    classroom_assignments = ClassroomTeacherAssignment.objects.filter(teacher=teacher)
    print(f"\n🏫 ClassroomTeacherAssignment records: {classroom_assignments.count()}")
    
    for assignment in classroom_assignments:
        print(f"  - {assignment.subject.name} in {assignment.classroom.name}")
    
    # Check all subjects
    all_subjects = Subject.objects.all()
    print(f"\n📖 Total subjects in database: {all_subjects.count()}")
    
    # Check what subjects are assigned to this teacher
    assigned_subject_ids = set()
    for assignment in teacher_assignments:
        assigned_subject_ids.add(assignment.subject.id)
    
    print(f"\n🎯 Unique subjects assigned to teacher: {len(assigned_subject_ids)}")
    for subject_id in assigned_subject_ids:
        subject = Subject.objects.get(id=subject_id)
        print(f"  - {subject.name} ({subject.code})")

if __name__ == "__main__":
    check_teacher_assignments()





