#!/usr/bin/env python
import os
import django
import requests
import json

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from students.models import Student
from django.contrib.auth import get_user_model

User = get_user_model()

def test_search_api():
    """Test the search API directly"""
    print("=== Testing Search API ===")
    
    # Test 1: Search by exact username using public endpoint
    print("\n1. Testing search by exact username 'STU/GTS/AUG/25/STU002':")
    try:
        response = requests.get('http://localhost:8000/api/results/result-checker/search_students/?search=STU/GTS/AUG/25/STU002')
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Results found: {len(data.get('results', []))}")
            for student in data.get('results', []):
                print(f"  - {student.get('name')} (ID: {student.get('id')}, Username: {student.get('username')})")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Error making request: {e}")
    
    # Test 2: Search by partial username using public endpoint
    print("\n2. Testing search by partial username 'STU002':")
    try:
        response = requests.get('http://localhost:8000/api/results/result-checker/search_students/?search=STU002')
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Results found: {len(data.get('results', []))}")
            for student in data.get('results', []):
                print(f"  - {student.get('name')} (ID: {student.get('id')}, Username: {student.get('username')})")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Error making request: {e}")
    
    # Test 3: Search by student name using public endpoint
    print("\n3. Testing search by student name:")
    try:
        response = requests.get('http://localhost:8000/api/results/result-checker/search_students/?search=Ivan')
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Results found: {len(data.get('results', []))}")
            for student in data.get('results', []):
                print(f"  - {student.get('name')} (ID: {student.get('id')}, Username: {student.get('username')})")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Error making request: {e}")

def test_database_search():
    """Test search directly in database"""
    print("\n=== Testing Database Search ===")
    
    # Check if user exists
    user = User.objects.filter(username='STU/GTS/AUG/25/STU002').first()
    if user:
        print(f"✓ User found: {user.username}")
        print(f"  Email: {user.email}")
        print(f"  Name: {user.first_name} {user.last_name}")
        
        # Check if student exists
        student = Student.objects.filter(user=user).first()
        if student:
            print(f"✓ Student found: {student.full_name}")
            print(f"  Registration: {student.registration_number}")
            print(f"  Education Level: {student.education_level}")
        else:
            print("✗ No student record found for this user")
    else:
        print("✗ User not found")
    
    # Test search fields
    print("\n--- Testing Search Fields ---")
    students = Student.objects.filter(user__username__icontains='STU002')
    print(f"Students with username containing 'STU002': {students.count()}")
    for student in students:
        print(f"  - {student.user.username} -> {student.full_name}")

if __name__ == "__main__":
    test_database_search()
    test_search_api()
