#!/usr/bin/env python
import os
import sys
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from classroom.models import ClassroomTeacherAssignment, Classroom
from teacher.models import Teacher
from subject.models import Subject
from classroom.models import Section, GradeLevel, AcademicYear, Term

def check_blessing_chemistry():
    print("🔍 CHECKING BLESSING SIMON'S CHEMISTRY ASSIGNMENT")
    print("=" * 60)
    
    # Find Blessing Simon
    try:
        blessing = Teacher.objects.filter(
            user__first_name__icontains='Blessing',
            user__last_name__icontains='Simon'
        ).first()
        
        if not blessing:
            print("❌ Teacher 'Blessing Simon' not found!")
            return
            
        print(f"✅ Found teacher: {blessing.user.first_name} {blessing.user.last_name} (ID: {blessing.id})")
        
    except Exception as e:
        print(f"❌ Error finding teacher: {e}")
        return
    
    # Check current assignments
    print("\n📚 CURRENT ASSIGNMENTS:")
    current_assignments = ClassroomTeacherAssignment.objects.filter(
        teacher=blessing,
        is_active=True
    ).select_related('classroom', 'subject', 'classroom__section', 'classroom__section__grade_level')
    
    if not current_assignments.exists():
        print("  ⚠️  No current assignments found")
    else:
        for assignment in current_assignments:
            classroom = assignment.classroom
            section = classroom.section
            grade_level = section.grade_level
            print(f"  - {assignment.subject.name} ({assignment.subject.code}) in {classroom.name}")
            print(f"    Grade: {grade_level.name}, Section: {section.name}")
            print(f"    Education Level: {grade_level.education_level}")
            print(f"    Is Primary: {assignment.is_primary_teacher}")
            print()
    
    # Check if Chemistry subject exists
    print("🔬 CHECKING CHEMISTRY SUBJECT:")
    chemistry_subjects = Subject.objects.filter(
        name__icontains='Chemistry',
        education_levels__contains=['SENIOR_SECONDARY']
    )
    
    if not chemistry_subjects.exists():
        print("  ❌ No Chemistry subject found for Senior Secondary")
        return
    
    chemistry = chemistry_subjects.first()
    print(f"  ✅ Found Chemistry: {chemistry.name} ({chemistry.code})")
    
    # Check Senior Secondary classrooms (SS1, SS2, SS3)
    print("\n🏫 CHECKING SENIOR SECONDARY CLASSROOMS:")
    ss_grade_levels = GradeLevel.objects.filter(
        name__in=['SS1', 'SS2', 'SS3'],
        education_level='SENIOR_SECONDARY'
    )
    
    if not ss_grade_levels.exists():
        print("  ❌ No Senior Secondary grade levels found")
        return
    
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
    
    # Check existing Chemistry assignments
    print("\n🔍 CHECKING EXISTING CHEMISTRY ASSIGNMENTS:")
    existing_chemistry_assignments = ClassroomTeacherAssignment.objects.filter(
        subject=chemistry,
        is_active=True
    ).select_related('classroom', 'teacher', 'classroom__section', 'classroom__section__grade_level')
    
    if existing_chemistry_assignments.exists():
        print("  📋 Existing Chemistry assignments:")
        for assignment in existing_chemistry_assignments:
            classroom = assignment.classroom
            section = classroom.section
            grade_level = section.grade_level
            teacher = assignment.teacher
            print(f"    - {teacher.user.first_name} {teacher.user.last_name} teaches {chemistry.name}")
            print(f"      in {classroom.name} ({grade_level.name} - {section.name})")
            print()
    else:
        print("  ⚠️  No Chemistry assignments found in the system")
    
    # Check if Blessing already has Chemistry assignments
    blessing_chemistry = ClassroomTeacherAssignment.objects.filter(
        teacher=blessing,
        subject=chemistry,
        is_active=True
    )
    
    if blessing_chemistry.exists():
        print("  ✅ Blessing already has Chemistry assignments:")
        for assignment in blessing_chemistry:
            classroom = assignment.classroom
            section = classroom.section
            grade_level = section.grade_level
            print(f"    - {chemistry.name} in {classroom.name} ({grade_level.name} - {section.name})")
    else:
        print("  ❌ Blessing does NOT have Chemistry assignments")
        
        # Offer to create Chemistry assignments
        print("\n🔧 CREATING MISSING CHEMISTRY ASSIGNMENTS:")
        
        for grade_level in ss_grade_levels:
            # Find or create sections for this grade level
            sections = Section.objects.filter(grade_level=grade_level)
            
            if not sections.exists():
                print(f"  ⚠️  No sections found for {grade_level.name}")
                continue
                
            for section in sections:
                # Check if classroom exists
                classroom, created = Classroom.objects.get_or_create(
                    section=section,
                    academic_year=current_academic_year,
                    term=current_term,
                    defaults={
                        'name': f"{grade_level.name} {section.name}",
                        'max_capacity': 30,
                        'is_active': True
                    }
                )
                
                if created:
                    print(f"  ✅ Created classroom: {classroom.name}")
                
                # Check if Chemistry assignment already exists for this classroom
                existing_chem_assignment = ClassroomTeacherAssignment.objects.filter(
                    classroom=classroom,
                    subject=chemistry,
                    is_active=True
                ).first()
                
                if existing_chem_assignment:
                    print(f"  ⚠️  Chemistry already assigned to {existing_chem_assignment.teacher.user.first_name} in {classroom.name}")
                else:
                    # Create Chemistry assignment for Blessing
                    try:
                        new_assignment = ClassroomTeacherAssignment.objects.create(
                            classroom=classroom,
                            teacher=blessing,
                            subject=chemistry,
                            is_primary_teacher=False,  # Set to True if she should be primary
                            periods_per_week=5,  # Adjust as needed
                            is_active=True
                        )
                        print(f"  ✅ Created Chemistry assignment for Blessing in {classroom.name}")
                    except Exception as e:
                        print(f"  ❌ Error creating assignment for {classroom.name}: {e}")
    
    print("\n" + "=" * 60)
    print("🎯 SUMMARY:")
    
    # Final check of Blessing's assignments
    final_assignments = ClassroomTeacherAssignment.objects.filter(
        teacher=blessing,
        is_active=True
    ).select_related('classroom', 'subject', 'classroom__section', 'classroom__section__grade_level')
    
    if final_assignments.exists():
        print("  📚 Blessing's final assignments:")
        for assignment in final_assignments:
            classroom = assignment.classroom
            section = classroom.section
            grade_level = section.grade_level
            print(f"    - {assignment.subject.name} in {classroom.name} ({grade_level.name} - {section.name})")
    else:
        print("  ❌ No assignments found for Blessing")
    
    print("\n✨ Script completed!")

if __name__ == "__main__":
    check_blessing_chemistry()
