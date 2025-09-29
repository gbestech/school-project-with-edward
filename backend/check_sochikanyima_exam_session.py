#!/usr/bin/env python3
"""
Check what exam session is being used for Sochikanyima's results
"""
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from students.models import Student
from result.models import ExamSession, SeniorSecondaryTermReport

def check_sochikanyima_exam_session():
    print("=== CHECKING SOCHIKANYIMA'S EXAM SESSION ===")
    
    # Find Sochikanyima by ID (we know it's 3 from the frontend logs)
    try:
        student = Student.objects.get(id=3)
        print(f"Found student: {student.user.full_name} (ID: {student.id})")
        print(f"Education Level: {student.education_level}")
    except Student.DoesNotExist:
        print("Student with ID 3 not found")
        return
    
    # Check if there are any term reports for this student
    term_reports = SeniorSecondaryTermReport.objects.filter(student=student)
    print(f"\nTerm reports found: {term_reports.count()}")
    
    for report in term_reports:
        print(f"\nTerm Report ID: {report.id}")
        print(f"Exam Session: {report.exam_session.name}")
        print(f"Exam Session Term: {report.exam_session.term}")
        print(f"Exam Session Academic Session: {report.exam_session.academic_session.name}")
        print(f"Next Term Begins: {report.next_term_begins}")
        print(f"Created: {report.created_at}")
        print(f"Updated: {report.updated_at}")

if __name__ == "__main__":
    check_sochikanyima_exam_session()
