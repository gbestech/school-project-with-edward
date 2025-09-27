import os
import sys
import django

# Add the backend directory to the path
sys.path.append('backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# Setup Django
django.setup()

from schoolSettings.models import SchoolSettings

print('=== CHECKING SCHOOL SETTINGS DATA ===')

# Get school settings from database
school = SchoolSettings.objects.first()
if school:
    print('RAW DATABASE VALUES:')
    print(f'  school_name: {school.school_name}')
    print(f'  school_address: {school.school_address}')
    print(f'  school_phone: {school.school_phone}')
    print(f'  school_email: {school.school_email}')
    print(f'  school_motto: {school.school_motto}')
    
    print('\nSCHOOL SETTINGS FIELDS:')
    for field in school._meta.get_fields():
        if hasattr(school, field.name):
            try:
                value = getattr(school, field.name)
                if 'school' in field.name.lower() or field.name in ['address', 'phone', 'email', 'motto']:
                    print(f'  {field.name}: {value}')
            except:
                print(f'  {field.name}: <error getting value>')
            
else:
    print('No school settings found in database!')
    
print('\n=== CHECKING INDIVIDUAL PUBLISHED RESULTS FOR SOCHIKANYIMA ===')
from students.models import Student
from result.models import SeniorSecondaryResult

sochi = Student.objects.get(user__first_name__icontains='sochi')
print(f'Student: {sochi.full_name} (ID: {sochi.id})')

# Get ALL results (including drafts) to see what's missing
all_results = SeniorSecondaryResult.objects.filter(student=sochi)
published_results = SeniorSecondaryResult.objects.filter(student=sochi, status='PUBLISHED')

print(f'\nAll SS Results: {all_results.count()}')
for result in all_results:
    print(f'  {result.subject.name}: {result.status} - Test1:{result.first_test_score}, Exam:{result.exam_score}')

print(f'\nPublished SS Results: {published_results.count()}')
for result in published_results:
    print(f'  {result.subject.name}: {result.status} - Test1:{result.first_test_score}, Exam:{result.exam_score}')
