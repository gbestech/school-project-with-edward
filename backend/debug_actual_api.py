import os
import sys
import django

# Add the backend directory to the path
sys.path.append('backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# Setup Django
django.setup()

from students.models import Student  
from result.models import SeniorSecondaryResult, PrimaryResult
from result.serializers import SeniorSecondaryResultSerializer, PrimaryResultSerializer

print('=== TESTING ACTUAL API DATA BEING RETURNED ===')

# Test Sochikanyima's SS results
sochi = Student.objects.get(user__first_name__icontains='sochi')
ss_results = SeniorSecondaryResult.objects.filter(student=sochi, status='PUBLISHED')

print(f'Sochikanyima SS Results: {ss_results.count()} published')
for result in ss_results:
    print(f'  {result.subject.name}: Test1={result.first_test_score}, Exam={result.exam_score}')
    print(f'    Stats: avg={result.class_average}, high={result.highest_in_class}, pos={result.subject_position}')

print('\nSERIALIZED SS RESULTS (what API returns):')
serializer = SeniorSecondaryResultSerializer(ss_results, many=True)
for i, data in enumerate(serializer.data):
    subject_name = data.get('subject_name', 'Unknown')
    print(f'Subject {i+1}: {subject_name}')
    print(f'  test1_score: {data.get("test1_score")}')
    print(f'  test2_score: {data.get("test2_score")}')
    print(f'  test3_score: {data.get("test3_score")}')
    print(f'  exam_score: {data.get("exam_score")}')
    print(f'  class_average: {data.get("class_average")}')
    print(f'  highest_in_class: {data.get("highest_in_class")}')
    print(f'  lowest_in_class: {data.get("lowest_in_class")}')
    print(f'  subject_position: {data.get("subject_position")}')
    
print('\n=== IVAN PRIMARY RESULTS ===')
ivan = Student.objects.get(user__first_name__icontains='ivan')
primary_results = PrimaryResult.objects.filter(student=ivan)

print(f'Ivan Primary Results: {primary_results.count()} total')
for result in primary_results:
    print(f'  {result.subject.name}: CA={result.continuous_assessment_score}, Total={result.total_score}')
    print(f'    CA Total in DB: {result.ca_total}')

print('\nSERIALIZED PRIMARY RESULTS (what API returns):')
primary_serializer = PrimaryResultSerializer(primary_results, many=True)
for i, data in enumerate(primary_serializer.data):
    subject = data.get('subject', {})
    subject_name = subject.get('name', 'Unknown') if isinstance(subject, dict) else 'Unknown'
    print(f'Subject {i+1}: {subject_name}')
    print(f'  continuous_assessment_score: {data.get("continuous_assessment_score")}')
    print(f'  ca_total: {data.get("ca_total")}')
    print(f'  total_score: {data.get("total_score")}')
    print(f'  exam_score: {data.get("exam_score")}')
    print(f'  appearance_score: {data.get("appearance_score")}')

print('\n=== CHECKING FILTER PARAMETERS ===')
# Check what happens when we filter the way the frontend does
from django.test import RequestFactory

factory = RequestFactory()
request = factory.get('/api/results/senior-secondary/results/', {'student': sochi.id})

from result.views import SeniorSecondaryResultViewSet
viewset = SeniorSecondaryResultViewSet()
viewset.request = request

# Test filtering
filtered_qs = viewset.get_queryset().filter(student=sochi)
print(f'Filtered queryset count: {filtered_qs.count()}')
for result in filtered_qs:
    print(f'  {result.subject.name}: Status={result.status}')
