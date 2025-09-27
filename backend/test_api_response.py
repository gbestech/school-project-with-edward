import os
import sys
import django
import json

# Add the backend directory to the path
sys.path.append('backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# Setup Django
django.setup()

from result.views import SeniorSecondaryResultViewSet
from result.serializers import SeniorSecondaryResultSerializer
from students.models import Student
from result.models import SeniorSecondaryResult
from django.test import RequestFactory

print('=== TESTING SS RESULT API RESPONSE ===')

# Get Sochikanyima's results
sochi = Student.objects.get(user__first_name__icontains='sochi')
print(f'Student: {sochi.full_name} (ID: {sochi.id})')

# Get the actual results from the database
ss_results = SeniorSecondaryResult.objects.filter(student=sochi)
print(f'Found {ss_results.count()} SeniorSecondaryResult records\n')

print('=== RAW DATABASE VALUES ===')
for result in ss_results:
    print(f'Subject: {result.subject.name}')
    print(f'  first_test_score: {result.first_test_score}')
    print(f'  second_test_score: {result.second_test_score}')
    print(f'  third_test_score: {result.third_test_score}')
    print(f'  exam_score: {result.exam_score}')
    print()

print('=== SERIALIZED OUTPUT ===')
serializer = SeniorSecondaryResultSerializer(ss_results, many=True)
serialized_data = serializer.data

for i, data in enumerate(serialized_data):
    print(f'Result {i+1}: {data.get("subject_name", "Unknown Subject")}')
    print(f'  test1_score: {data.get("test1_score", "MISSING")}')
    print(f'  test2_score: {data.get("test2_score", "MISSING")}')
    print(f'  test3_score: {data.get("test3_score", "MISSING")}')
    print(f'  first_test_score: {data.get("first_test_score", "MISSING")}')
    print(f'  second_test_score: {data.get("second_test_score", "MISSING")}')
    print(f'  third_test_score: {data.get("third_test_score", "MISSING")}')
    print(f'  exam_score: {data.get("exam_score", "MISSING")}')
    print(f'  Available fields: {list(data.keys())[:10]}...')  # Show first 10 fields
    print()

print('=== SAMPLE JSON OUTPUT ===')
if serialized_data:
    print(json.dumps(serialized_data[0], indent=2, default=str)[:1000] + '...')
