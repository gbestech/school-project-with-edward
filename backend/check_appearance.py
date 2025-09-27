import os
import sys
import django

# Add the backend directory to the path
sys.path.append('backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# Setup Django
django.setup()

from students.models import Student
from result.models import PrimaryResult

print('=== DETAILED APPEARANCE SCORE CHECK ===')

ivan = Student.objects.get(user__first_name__icontains='ivan')
print(f'Student: {ivan.full_name} (ID: {ivan.id})')

# Get all primary results for Ivan
primary_results = PrimaryResult.objects.filter(student=ivan)
print(f'Total PrimaryResult records: {primary_results.count()}')

for i, result in enumerate(primary_results):
    print(f'\nResult {i+1}:')
    print(f'  Subject: {result.subject.name if result.subject else "N/A"}')
    print(f'  CA Score: {result.continuous_assessment_score}')
    print(f'  Take Home: {result.take_home_test_score}')
    print(f'  Appearance: {result.appearance_score}')
    print(f'  Practical: {result.practical_score}')
    print(f'  Project: {result.project_score}')
    print(f'  Note Copying: {result.note_copying_score}')
    print(f'  Exam Score: {result.exam_score}')
    print(f'  Total Score: {result.total_score}')
    print(f'  Status: {result.status}')
    
print('\n=== CHECKING IF THERE ARE NON-ZERO APPEARANCE SCORES ===')
non_zero_appearance = PrimaryResult.objects.filter(appearance_score__gt=0)
print(f'Total results with appearance_score > 0: {non_zero_appearance.count()}')

if non_zero_appearance.exists():
    print('\nSample non-zero appearance scores:')
    for result in non_zero_appearance[:5]:
        print(f'  Student: {result.student.full_name}, Subject: {result.subject.name}, Appearance: {result.appearance_score}')
