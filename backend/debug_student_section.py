#!/usr/bin/env python3
"""
Script to debug student section assignment issue
"""

import os
import sys
import django

# Setup Django environment
sys.path.append('/app')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from students.models import Student
from students.serializers import StudentDetailSerializer
from classroom.models import Section, GradeLevel, Classroom
from django.contrib.auth import get_user_model

User = get_user_model()

def debug_student_section():
    print("🔍 Debugging Student Section Assignment")
    print("=" * 50)
    
    # Find the specific student
    student_name = "Williams Oshomo Fredrick"
    try:
        student = Student.objects.get(user__first_name="Williams", user__last_name="Fredrick")
        print(f"✅ Found student: {student.user.full_name}")
        print(f"   - ID: {student.id}")
        print(f"   - Education Level: {student.education_level}")
        print(f"   - Student Class: {student.student_class}")
        print(f"   - Classroom: {student.classroom}")
        print(f"   - User ID: {student.user.id}")
        
        # Check the serializer's section_id calculation
        serializer = StudentDetailSerializer(student)
        section_id = serializer.data.get('section_id')
        print(f"   - Serializer section_id: {section_id}")
        
        # Debug the get_section_id method logic
        print(f"\n🔍 Debugging get_section_id logic:")
        print(f"   - student_class: {student.student_class}")
        
        # Check if the classroom exists
        if student.classroom:
            print(f"   - Classroom exists: {student.classroom}")
            try:
                classroom_obj = Classroom.objects.get(name=student.classroom)
                print(f"   - Classroom object found: {classroom_obj}")
                print(f"   - Classroom section: {classroom_obj.section}")
                if classroom_obj.section:
                    print(f"   - Section ID: {classroom_obj.section.id}")
                    print(f"   - Section name: {classroom_obj.section.name}")
                    print(f"   - Grade Level: {classroom_obj.section.grade_level}")
                    print(f"   - Grade Level name: {classroom_obj.section.grade_level.name}")
            except Classroom.DoesNotExist:
                print(f"   - ❌ Classroom object not found for: {student.classroom}")
        else:
            print(f"   - ❌ No classroom assigned")
        
        # Check GradeLevel mapping
        print(f"\n🔍 Checking GradeLevel mapping:")
        class_to_grade = {
            'NURSERY_1': 'Nursery 1',
            'NURSERY_2': 'Nursery 2',
            'NURSERY_3': 'Nursery 3',
            'PRIMARY_1': 'Primary 1',
            'PRIMARY_2': 'Primary 2',
            'PRIMARY_3': 'Primary 3',
            'PRIMARY_4': 'Primary 4',
            'PRIMARY_5': 'Primary 5',
            'PRIMARY_6': 'Primary 6',
            'JSS_1': 'JSS 1',
            'JSS_2': 'JSS 2',
            'JSS_3': 'JSS 3',
            'SS_1': 'SS 1',
            'SS_2': 'SS 2',
            'SS_3': 'SS 3',
        }
        
        expected_grade = class_to_grade.get(student.student_class)
        print(f"   - Expected grade level: {expected_grade}")
        
        if expected_grade:
            try:
                grade_level = GradeLevel.objects.get(name=expected_grade)
                print(f"   - ✅ GradeLevel found: {grade_level.name}")
                
                # Check sections for this grade level
                sections = Section.objects.filter(grade_level=grade_level)
                print(f"   - Sections for this grade level: {[s.name for s in sections]}")
                
                # Check if there's a section that matches the classroom
                if student.classroom:
                    matching_section = None
                    for section in sections:
                        if section.name in student.classroom:
                            matching_section = section
                            break
                    
                    if matching_section:
                        print(f"   - ✅ Matching section found: {matching_section.name}")
                        print(f"   - Section ID: {matching_section.id}")
                    else:
                        print(f"   - ❌ No matching section found for classroom: {student.classroom}")
                        
            except GradeLevel.DoesNotExist:
                print(f"   - ❌ GradeLevel not found: {expected_grade}")
        else:
            print(f"   - ❌ No grade level mapping for: {student.student_class}")
            
    except Student.DoesNotExist:
        print(f"❌ Student not found: {student_name}")
        # List all students with similar names
        students = Student.objects.filter(user__first_name__icontains="Williams")
        print(f"Found {students.count()} students with 'Williams' in first name:")
        for s in students:
            print(f"  - {s.user.full_name} (ID: {s.id})")

def check_all_students_sections():
    print(f"\n🔍 Checking all students' section assignments")
    print("=" * 50)
    
    students = Student.objects.all()
    print(f"Total students: {students.count()}")
    
    students_without_section = []
    students_with_section = []
    
    for student in students:
        serializer = StudentDetailSerializer(student)
        section_id = serializer.data.get('section_id')
        
        if section_id is None:
            students_without_section.append(student)
        else:
            students_with_section.append(student)
    
    print(f"Students WITH section_id: {len(students_with_section)}")
    print(f"Students WITHOUT section_id: {len(students_without_section)}")
    
    if students_without_section:
        print(f"\n❌ Students without section_id:")
        for student in students_without_section:
            print(f"  - {student.user.full_name}: {student.student_class} -> {student.classroom}")
    
    if students_with_section:
        print(f"\n✅ Students with section_id:")
        for student in students_with_section[:5]:  # Show first 5
            serializer = StudentDetailSerializer(student)
            section_id = serializer.data.get('section_id')
            print(f"  - {student.user.full_name}: {student.student_class} -> {student.classroom} -> section_id: {section_id}")

if __name__ == "__main__":
    debug_student_section()
    check_all_students_sections()
