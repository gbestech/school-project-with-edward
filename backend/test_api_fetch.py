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
from students.models import Student
from result.models import SeniorSecondaryResult
from django.test import RequestFactory
from django.contrib.auth.models import AnonymousUser

print('=== TESTING API ENDPOINT DIRECTLY ===')

# Get Sochikanyima's student ID
sochi = Student.objects.get(user__first_name__icontains='sochi')
print(f'Student: {sochi.full_name} (ID: {sochi.id})')

# Create a test request
factory = RequestFactory()
request = factory.get('/api/results/senior-secondary/results/', {'student': sochi.id})
request.user = AnonymousUser()

# Create viewset instance and test list method
viewset = SeniorSecondaryResultViewSet()
viewset.request = request

# Get queryset to see what would be returned
queryset = viewset.get_queryset().filter(student=sochi)
print(f'\nTotal results in queryset: {queryset.count()}')

for result in queryset:
    print(f'  {result.subject.name}: Status={result.status}, Test1={result.first_test_score}, Exam={result.exam_score}')

# Test with status filtering
published_queryset = viewset.get_queryset().filter(student=sochi, status='PUBLISHED')
print(f'\nPublished results: {published_queryset.count()}')

for result in published_queryset:
    print(f'  {result.subject.name}: Status={result.status}, Test1={result.first_test_score}, Exam={result.exam_score}')

# Check default filtering in the viewset
print(f'\nViewset filter_queryset (simulating API call):')
try:
    filtered_qs = viewset.filter_queryset(queryset)
    print(f'Filtered queryset count: {filtered_qs.count()}')
    
    for result in filtered_qs:
        print(f'  {result.subject.name}: Status={result.status}, Test1={result.first_test_score}, Exam={result.exam_score}')
except Exception as e:
    print(f'Error filtering queryset: {e}')
