import requests
import json

# API base URL
BASE_URL = "http://localhost:8000/api"

def test_exam_creation():
    print("🧪 Testing Exam Creation...")
    
    # Step 1: Login to get token
    print("\n1. Logging in...")
    login_data = {
        "username": "ADM/GTS/JUL/25/001",
        "password": "u42KsHspop"
    }
    
    login_response = requests.post(f"{BASE_URL}/auth/login/", json=login_data)
    print(f"Login status: {login_response.status_code}")
    
    if login_response.status_code != 200:
        print(f"Login failed: {login_response.text}")
        return
    
    token = login_response.json().get('access')
    print(f"Token received: {token[:20]}...")
    
    # Step 2: Get subjects to find a valid subject ID
    print("\n2. Fetching subjects...")
    headers = {"Authorization": f"Bearer {token}"}
    subjects_response = requests.get(f"{BASE_URL}/subjects/", headers=headers)
    print(f"Subjects status: {subjects_response.status_code}")
    
    if subjects_response.status_code != 200:
        print(f"Failed to get subjects: {subjects_response.text}")
        return
    
    subjects = subjects_response.json()
    print(f"Found {len(subjects)} subjects")
    
    # Find a subject with ID 52 (the one from the frontend)
    subject_52 = None
    for subject in subjects:
        if subject.get('id') == 52:
            subject_52 = subject
            break
    
    if not subject_52:
        print("Subject with ID 52 not found!")
        print("Available subjects:")
        for subject in subjects[:5]:  # Show first 5
            print(f"  ID: {subject.get('id')}, Name: {subject.get('name')}")
        return
    
    print(f"Found subject 52: {subject_52}")
    
    # Step 3: Get grade levels
    print("\n3. Fetching grade levels...")
    grades_response = requests.get(f"{BASE_URL}/classrooms/grades/", headers=headers)
    print(f"Grades status: {grades_response.status_code}")
    
    if grades_response.status_code != 200:
        print(f"Failed to get grades: {grades_response.text}")
        return
    
    grades = grades_response.json()
    print(f"Found {len(grades)} grade levels")
    
    # Find grade level 13
    grade_13 = None
    for grade in grades:
        if grade.get('id') == 13:
            grade_13 = grade
            break
    
    if not grade_13:
        print("Grade level with ID 13 not found!")
        print("Available grades:")
        for grade in grades[:5]:  # Show first 5
            print(f"  ID: {grade.get('id')}, Name: {grade.get('name')}")
        return
    
    print(f"Found grade 13: {grade_13}")
    
    # Step 4: Create exam with the exact data from frontend
    print("\n4. Creating exam...")
    exam_data = {
        "title": "Test Exam from Script",
        "description": "Test exam created by script",
        "subject": 52,  # Integer ID
        "grade_level": 13,  # Integer ID
        "section": None,
        "exam_type": "test",
        "difficulty_level": "medium",
        "exam_date": "2025-12-15",
        "start_time": "09:00",
        "end_time": "11:00",
        "total_marks": 100,
        "pass_marks": 50,
        "duration_minutes": 120,
        "venue": "Test Venue",
        "status": "scheduled"
    }
    
    print(f"Exam data being sent: {json.dumps(exam_data, indent=2)}")
    
    exam_response = requests.post(f"{BASE_URL}/exams/exams/", json=exam_data, headers=headers)
    print(f"Exam creation status: {exam_response.status_code}")
    
    if exam_response.status_code == 201:
        print("✅ Exam created successfully!")
        print(f"Response: {exam_response.json()}")
    else:
        print(f"❌ Exam creation failed: {exam_response.status_code}")
        print(f"Response: {exam_response.text}")
        
        # Try to parse JSON error
        try:
            error_data = exam_response.json()
            print(f"Error details: {json.dumps(error_data, indent=2)}")
        except:
            print("Could not parse error response as JSON")

if __name__ == "__main__":
    test_exam_creation()

