#!/usr/bin/env python3
"""
Test the API response for Sochikanyima's term report
"""
import os
import sys
import django
import requests
import json

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from result.models import SeniorSecondaryTermReport

def test_api_response():
    print("=== TESTING API RESPONSE ===")
    
    # Get Sochikanyima's term report
    term_report = SeniorSecondaryTermReport.objects.get(id="8d2d7cc7-2343-4fc9-9e04-0f4d12160d47")
    
    print(f"Term Report ID: {term_report.id}")
    print(f"Student: {term_report.student.user.full_name}")
    print(f"Next Term Begins: {term_report.next_term_begins}")
    print(f"Exam Session: {term_report.exam_session.name}")
    
    # Test the API endpoint
    try:
        # This would be the URL for the term report API
        url = f"http://localhost:8000/api/results/senior-secondary/term-reports/{term_report.id}/"
        print(f"\nTesting API endpoint: {url}")
        
        response = requests.get(url)
        print(f"Response status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"API Response next_term_begins: {data.get('next_term_begins')}")
            print(f"Full API Response:")
            print(json.dumps(data, indent=2, default=str))
        else:
            print(f"API Error: {response.text}")
            
    except Exception as e:
        print(f"Error testing API: {e}")
        print("API server might not be running")

if __name__ == "__main__":
    test_api_response()
