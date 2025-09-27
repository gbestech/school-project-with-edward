import os
import sys
import django

# Add the backend directory to the path
sys.path.append('backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# Setup Django
django.setup()

from students.models import Student
from result.models import SeniorSecondaryResult, StudentResult, StudentTermResult

print('=== CHECKING SOCHIKANYIMA SS RESULTS ===')

sochi = Student.objects.get(user__first_name__icontains='sochi')
print(f'Student: {sochi.full_name} (ID: {sochi.id})')
print(f'Class: {sochi.student_class}')
print(f'Education Level: {sochi.education_level}')

print('\n=== SENIOR SECONDARY RESULTS ===')
ss_results = SeniorSecondaryResult.objects.filter(student=sochi)
print(f'Total SeniorSecondaryResult records: {ss_results.count()}')

for i, result in enumerate(ss_results):
    print(f'\nResult {i+1}:')
    print(f'  Subject: {result.subject.name if result.subject else "N/A"}')
    print(f'  Test 1 (first_test_score): {result.first_test_score}')
    print(f'  Test 2 (second_test_score): {result.second_test_score}') 
    print(f'  Test 3 (third_test_score): {result.third_test_score}')
    print(f'  Exam Score: {result.exam_score}')
    print(f'  Total Score: {result.total_score}')
    print(f'  Grade: {result.grade}')
    print(f'  Status: {result.status}')
    print(f'  Session: {result.exam_session}')

print('\n=== STUDENT RESULTS (General) ===')
student_results = StudentResult.objects.filter(student=sochi)
print(f'Total StudentResult records: {student_results.count()}')

for i, result in enumerate(student_results[:3]):  # Show first 3
    print(f'\nStudentResult {i+1}:')
    print(f'  Subject: {result.subject.name if result.subject else "N/A"}')
    print(f'  Score: {result.score}')
    print(f'  Grade: {result.grade}')
    print(f'  Status: {result.status}')

print('\n=== STUDENT TERM RESULTS ===')
term_results = StudentTermResult.objects.filter(student=sochi)
print(f'Total StudentTermResult records: {term_results.count()}')

for i, result in enumerate(term_results[:2]):  # Show first 2
    print(f'\nTermResult {i+1}:')
    print(f'  Academic Session: {result.academic_session}')
    print(f'  Average Score: {result.average_score}')
    print(f'  Total Score: {result.total_score}')
    print(f'  Position: {getattr(result, "position", "N/A")}')
    print(f'  Status: {result.status}')

print('\n=== CHECKING FOR NON-ZERO SS SCORES ===')
non_zero_test1 = SeniorSecondaryResult.objects.filter(first_test_score__gt=0)
non_zero_exam = SeniorSecondaryResult.objects.filter(exam_score__gt=0)
print(f'Total results with first_test_score > 0: {non_zero_test1.count()}')
print(f'Total results with exam_score > 0: {non_zero_exam.count()}')

if non_zero_test1.exists():
    print('\nSample non-zero test scores:')
    for result in non_zero_test1[:3]:
        print(f'  Student: {result.student.full_name}, Subject: {result.subject.name}, Test1: {result.first_test_score}')

if non_zero_exam.exists():
    print('\nSample non-zero exam scores:')
    for result in non_zero_exam[:3]:
        print(f'  Student: {result.student.full_name}, Subject: {result.subject.name}, Exam: {result.exam_score}')
