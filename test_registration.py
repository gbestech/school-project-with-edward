import requests
import json

# Test registration
url = "http://localhost:8000/api/auth/register/"
data = {
    "first_name": "Test",
    "last_name": "User",
    "email": "test5@example.com",
    "password": "testpass123",
    "password_confirm": "testpass123",
    "role": "student",
    "agree_to_terms": True,
    "subscribe_newsletter": False
}

try:
    response = requests.post(url, json=data, headers={'Content-Type': 'application/json'})
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 201:
        print("Registration successful!")
        # Test verification
        verify_url = "http://localhost:8000/api/auth/verify-account/"
        verify_data = {
            "email": "test5@example.com",
            "verification_code": "123456"  # This would be the actual code sent via email
        }
        
        verify_response = requests.post(verify_url, json=verify_data, headers={'Content-Type': 'application/json'})
        print(f"Verification Status Code: {verify_response.status_code}")
        print(f"Verification Response: {verify_response.text}")
        
except Exception as e:
    print(f"Error: {e}") 