#!/usr/bin/env python3
"""
Debug script to check Term data and next_term_begins
"""
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from academics.models import AcademicSession, Term
from result.models import ExamSession

def debug_term_data():
    print("=== DEBUGGING TERM DATA ===")
    
    # Check all academic sessions
    print("\n1. Academic Sessions:")
    sessions = AcademicSession.objects.all().order_by('-start_date')
    for session in sessions:
        print(f"  - {session.name} (ID: {session.id})")
        print(f"    Start: {session.start_date}, End: {session.end_date}")
        print(f"    Active: {session.is_active}, Current: {session.is_current}")
    
    # Check all terms
    print("\n2. Terms:")
    terms = Term.objects.all().order_by('academic_session__start_date', 'name')
    for term in terms:
        print(f"  - {term.name} in {term.academic_session.name} (ID: {term.id})")
        print(f"    Start: {term.start_date}, End: {term.end_date}")
        print(f"    Active: {term.is_active}, Current: {term.is_current}")
        print(f"    Next Term Begins: {term.next_term_begins}")
        print(f"    Academic Session ID: {term.academic_session.id}")
    
    # Check exam sessions
    print("\n3. Exam Sessions:")
    exam_sessions = ExamSession.objects.select_related('academic_session').all().order_by('-created_at')[:5]
    for exam_session in exam_sessions:
        print(f"  - {exam_session.name} (ID: {exam_session.id})")
        print(f"    Term: {exam_session.term}")
        print(f"    Academic Session: {exam_session.academic_session.name}")
        print(f"    Academic Session ID: {exam_session.academic_session.id}")
    
    # Test the get_next_term_begins_date function
    print("\n4. Testing get_next_term_begins_date function:")
    from result.views import get_next_term_begins_date
    
    for exam_session in exam_sessions:
        try:
            next_date = get_next_term_begins_date(exam_session)
            print(f"  - Exam Session {exam_session.name}: {next_date}")
        except Exception as e:
            print(f"  - Exam Session {exam_session.name}: ERROR - {e}")

if __name__ == "__main__":
    debug_term_data()
