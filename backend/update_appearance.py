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

print('=== UPDATING APPEARANCE SCORES FOR IVAN ===')

ivan = Student.objects.get(user__first_name__icontains='ivan')
print(f'Student: {ivan.full_name} (ID: {ivan.id})')

# Get all primary results for Ivan
primary_results = PrimaryResult.objects.filter(student=ivan)
print(f'Found {primary_results.count()} PrimaryResult records')

# Update appearance scores with sample values
from decimal import Decimal
sample_appearance_scores = [Decimal('4.0'), Decimal('3.5'), Decimal('5.0'), Decimal('4.5')]  # Some realistic appearance scores

for i, result in enumerate(primary_results):
    old_appearance = result.appearance_score
    if i < len(sample_appearance_scores):
        result.appearance_score = sample_appearance_scores[i]
        # Recalculate CA total and total score
        result.ca_total = (
            result.continuous_assessment_score + 
            result.take_home_test_score + 
            result.appearance_score + 
            result.practical_score + 
            result.project_score + 
            result.note_copying_score
        )
        result.total_score = result.ca_total + result.exam_score
        result.save()
        
        print(f'Updated {result.subject.name}:')
        print(f'  Appearance: {old_appearance} → {result.appearance_score}')
        print(f'  CA Total: {result.ca_total}')
        print(f'  Total Score: {result.total_score}')
        print()

print('=== VERIFICATION ===')
updated_results = PrimaryResult.objects.filter(student=ivan)
for result in updated_results:
    print(f'{result.subject.name}: Appearance = {result.appearance_score}')
