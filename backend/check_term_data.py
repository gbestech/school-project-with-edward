import os
import sys
import django

# Add the backend directory to the path
sys.path.append('backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# Setup Django
django.setup()

from students.models import Student
from result.models import StudentTermResult

print('=== CHECKING TERM RESULT DATA FOR SOCHIKANYIMA ===')

sochi = Student.objects.get(user__first_name__icontains='sochi')
print(f'Student: {sochi.full_name} (ID: {sochi.id})')

# Get all term results for Sochikanyima
term_results = StudentTermResult.objects.filter(student=sochi)
print(f'Total StudentTermResult records: {term_results.count()}')

for i, result in enumerate(term_results):
    print(f'\nTermResult {i+1}:')
    print(f'  Academic Session: {result.academic_session}')
    print(f'  Average Score: {result.average_score}')
    print(f'  Total Score: {result.total_score}')
    print(f'  Status: {result.status}')
    
    # Check for fields that might contain attendance/position data
    for field in result._meta.get_fields():
        if hasattr(result, field.name):
            try:
                value = getattr(result, field.name)
                if 'position' in field.name.lower() or 'attendance' in field.name.lower() or 'times' in field.name.lower() or 'next_term' in field.name.lower():
                    print(f'  {field.name}: {value}')
            except:
                print(f'  {field.name}: <error getting value>')

print('\n=== CHECKING WHAT FIELDS ARE AVAILABLE ===')
if term_results.exists():
    result = term_results.first()
    print('Available fields:')
    for field in result._meta.get_fields():
        if hasattr(result, field.name):
            print(f'  - {field.name}')
