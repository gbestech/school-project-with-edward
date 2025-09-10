#!/usr/bin/env python
import os
import sys
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from classroom.models import ClassroomTeacherAssignment, Classroom, StudentEnrollment
from teacher.models import Teacher
from subject.models import Subject
from classroom.models import Section, GradeLevel, AcademicYear, Term
from students.models import Student

def check_chemistry_students():
    print("🔍 CHECKING CHEMISTRY STUDENTS IN SS1, SS2, SS3")
    print("=" * 60)
    
    # Check if Chemistry subject exists
    print("🔬 CHECKING CHEMISTRY SUBJECT:")
    chemistry_subjects = Subject.objects.filter(
        name__icontains='Chemistry'
    )
    
    if not chemistry_subjects.exists():
        print("  ❌ No Chemistry subject found")
        return
    
    chemistry = chemistry_subjects.first()
    print(f"  ✅ Found Chemistry: {chemistry.name} ({chemistry.code})")
    
    # Check Senior Secondary classrooms (SS1, SS2, SS3)
    print("\n🏫 CHECKING SENIOR SECONDARY CLASSROOMS:")
    ss_grade_levels = GradeLevel.objects.filter(
        name__in=['SS 1', 'SS 2', 'SS 3'],
        education_level='SENIOR_SECONDARY'
    )
    
    if not ss_grade_levels.exists():
        print("  ❌ No Senior Secondary grade levels found")
        return
    
    print("  ✅ Found Senior Secondary grade levels:")
    for grade_level in ss_grade_levels:
        print(f"    - {grade_level.name} ({grade_level.education_level})")
    
    # Get current academic year and term
    try:
        current_academic_year = AcademicYear.objects.filter(is_active=True).first()
        current_term = Term.objects.filter(is_active=True).first()
        
        if not current_academic_year or not current_term:
            print("  ❌ No active academic year or term found")
            return
            
        print(f"  📅 Academic Year: {current_academic_year.name}")
        print(f"  📅 Term: {current_term.name}")
        
    except Exception as e:
        print(f"  ❌ Error getting academic year/term: {e}")
        return
    
    # Check Chemistry assignments
    print("\n🔍 CHECKING CHEMISTRY ASSIGNMENTS:")
    chemistry_assignments = ClassroomTeacherAssignment.objects.filter(
        subject=chemistry,
        is_active=True
    ).select_related('classroom', 'teacher', 'classroom__section', 'classroom__section__grade_level')
    
    if not chemistry_assignments.exists():
        print("  ❌ No Chemistry assignments found")
        return
    
    print("  📋 Chemistry assignments found:")
    for assignment in chemistry_assignments:
        classroom = assignment.classroom
        section = classroom.section
        grade_level = section.grade_level
        teacher = assignment.teacher
        print(f"    - {teacher.user.first_name} {teacher.user.last_name} teaches {chemistry.name}")
        print(f"      in {classroom.name} ({grade_level.name} - {section.name})")
        
        # Check students enrolled in this classroom
        student_enrollments = StudentEnrollment.objects.filter(
            classroom=classroom,
            is_active=True
        ).select_related('student', 'student__user')
        
        if student_enrollments.exists():
            print(f"      👥 Students enrolled ({student_enrollments.count()}):")
            for enrollment in student_enrollments:
                student = enrollment.student
                print(f"        - {student.user.first_name} {student.user.last_name} ({student.registration_number or 'No Reg No'})")
        else:
            print(f"      ⚠️  No students enrolled in this classroom")
        print()
    
    # Summary
    print("\n" + "=" * 60)
    print("🎯 SUMMARY:")
    
    total_chemistry_students = 0
    for assignment in chemistry_assignments:
        classroom = assignment.classroom
        section = classroom.section
        grade_level = section.grade_level
        
        student_count = StudentEnrollment.objects.filter(
            classroom=classroom,
            is_active=True
        ).count()
        
        total_chemistry_students += student_count
        print(f"  📊 {grade_level.name} {section.name}: {student_count} students taking Chemistry")
    
    print(f"\n  🎓 Total Chemistry students in SS1, SS2, SS3: {total_chemistry_students}")
    
    if total_chemistry_students > 0:
        print("  ✅ YES - There are students recorded in SS1, SS2, SS3 who are taking Chemistry")
    else:
        print("  ❌ NO - No students found taking Chemistry in SS1, SS2, SS3")
    
    print("\n✨ Script completed!")

if __name__ == "__main__":
    check_chemistry_students()
