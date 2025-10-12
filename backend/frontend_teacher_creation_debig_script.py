import requests
import json

BASE_URL = "https://school-management-project-qpox.onrender.com"
ADMIN_USERNAME = "ADM/GTS/OCT/25/003"
ADMIN_PASSWORD = "3u#97ypUGt37"

# Step 1: Login and get token
print("=" * 70)
print("STEP 1: LOGIN")
print("=" * 70)

login_response = requests.post(
    f"{BASE_URL}/api/auth/login/",
    json={"username": ADMIN_USERNAME, "password": ADMIN_PASSWORD},
)

if login_response.status_code != 200:
    print(f"❌ Login failed: {login_response.status_code}")
    print(login_response.json())
    exit(1)

login_data = login_response.json()
token = login_data.get("access")
print(f"✅ Login successful")
print(f"   Token: {token[:50]}...")

# Step 2: Test if endpoints are accessible
print("\n" + "=" * 70)
print("STEP 2: TEST ENDPOINT ACCESSIBILITY")
print("=" * 70)

endpoints = [
    "/api/teachers/teachers/",
    "/api/students/students/",
    "/api/parents/parents/",
]

for endpoint in endpoints:
    response = requests.get(
        f"{BASE_URL}{endpoint}",
        headers={"Authorization": f"Bearer {token}"},
    )
    print(f"\n{endpoint}")
    print(f"   Status: {response.status_code}")
    if response.status_code != 200:
        try:
            print(f"   Error: {response.json()}")
        except:
            print(f"   Response: {response.text[:100]}")

# Step 3: Test with exact frontend data
print("\n" + "=" * 70)
print("STEP 3: CREATE TEACHER WITH FRONTEND DATA")
print("=" * 70)

teacher_data = {
    "user_email": "oshomo@gmail.com",
    "user_first_name": "Williams",
    "user_middle_name": "Oshomo",
    "user_last_name": "Fred",
    "gender": "M",
    "blood_group": "AB+",
    "date_of_birth": "1988-09-12",
    "place_of_birth": "Umuahia, Abia State",
    "academic_session": "2025/2026",
    "employee_id": "EMP001",
    "address": "206 ZION NA STREET JIKWOYI PHA\nNo. 4 Endurance Street, Jikwoy",
    "phone_number": "+2348063770187",
    "photo": None,
    "staff_type": "teaching",
    "level": "nursery",
    "subjects": ["4", "5", "8", "6", "12", "2", "1", "7", "10", "9", "3", "11"],
    "hire_date": "2021-08-21",
    "qualification": "B.A Education",
    "specialization": "English and Literature in English",
    "assignments": [
        {
            "grade_level_id": "2",
            "section_id": "10",
            "subject_ids": [
                "4",
                "5",
                "8",
                "6",
                "12",
                "2",
                "1",
                "7",
                "10",
                "9",
                "3",
                "11",
            ],
        }
    ],
}

print(f"Request Headers:")
print(f"   Authorization: Bearer {token[:30]}...")
print(f"   Content-Type: application/json")

print(f"\nRequest Body:")
print(json.dumps(teacher_data, indent=2)[:500])

response = requests.post(
    f"{BASE_URL}/api/teachers/teachers/",
    json=teacher_data,
    headers={
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    },
)

print(f"\n📊 Status Code: {response.status_code}")

if response.status_code == 201:
    print("✅ Teacher created successfully!")
    data = response.json()
    print(f"\nResponse:")
    print(json.dumps(data, indent=2)[:500])
elif response.status_code == 401:
    print("❌ AUTHENTICATION ERROR")
    print(f"   Response: {response.json()}")
    print(f"\n   Debugging info:")
    print(f"   - Token sent: {token[:30]}...")
    print(f"   - Token header: Authorization: Bearer {token[:30]}...")
elif response.status_code == 400:
    print("❌ VALIDATION ERROR")
    try:
        print(f"   Response: {json.dumps(response.json(), indent=2)}")
    except:
        print(f"   Response: {response.text}")
else:
    print(f"❌ ERROR: {response.status_code}")
    try:
        print(f"   Response: {json.dumps(response.json(), indent=2)}")
    except:
        print(f"   Response: {response.text[:500]}")

# Step 4: Test with minimal data
print("\n" + "=" * 70)
print("STEP 4: CREATE TEACHER WITH MINIMAL DATA")
print("=" * 70)

minimal_data = {
    "user_email": "test.minimal@gmail.com",
    "user_first_name": "Test",
    "user_last_name": "Minimal",
    "employee_id": "MINTEST001",
    "staff_type": "teaching",
    "level": "nursery",
    "qualification": "B.A Education",
}

print(f"Request Body (minimal):")
print(json.dumps(minimal_data, indent=2))

response = requests.post(
    f"{BASE_URL}/api/teachers/teachers/",
    json=minimal_data,
    headers={
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    },
)

print(f"\n📊 Status Code: {response.status_code}")

if response.status_code == 201:
    print("✅ Teacher created successfully with minimal data!")
    data = response.json()
    print(f"\nResponse ID: {data.get('id')}")
elif response.status_code == 401:
    print("❌ AUTHENTICATION ERROR - Token not working")
    print(f"   Response: {response.json()}")
elif response.status_code == 400:
    print("❌ VALIDATION ERROR")
    try:
        print(f"   Response: {json.dumps(response.json(), indent=2)}")
    except:
        print(f"   Response: {response.text}")
else:
    print(f"❌ ERROR: {response.status_code}")
    try:
        print(f"   Response: {json.dumps(response.json(), indent=2)}")
    except:
        print(f"   Response: {response.text[:500]}")

print("\n" + "=" * 70)
print("DEBUG COMPLETE")
print("=" * 70)
