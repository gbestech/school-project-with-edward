import requests
import json

# Test the students API
print("Testing Students API...")
try:
    response = requests.get("http://localhost:8000/api/students/")
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Students API Response Status: {response.status_code}")
        print(f"📊 Total Students: {len(data.get('results', data))}")
        
        if data.get('results'):
            students = data['results']
        else:
            students = data
            
        if students and len(students) > 0:
            first_student = students[0]
            print(f"🔍 First Student Structure:")
            print(f"   ID: {first_student.get('id')}")
            print(f"   Full Name: {first_student.get('full_name')}")
            print(f"   User Data: {first_student.get('user')}")
            if first_student.get('user'):
                print(f"   Date Joined: {first_student['user'].get('date_joined')}")
        else:
            print("❌ No students found in response")
    else:
        print(f"❌ Students API Error: {response.status_code}")
        print(f"Response: {response.text}")
except Exception as e:
    print(f"❌ Error testing Students API: {e}")

print("\n" + "="*50 + "\n")

# Test the teachers API
print("Testing Teachers API...")
try:
    response = requests.get("http://localhost:8000/api/teachers/teachers/")
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Teachers API Response Status: {response.status_code}")
        print(f"📊 Total Teachers: {len(data.get('results', data))}")
        
        if data.get('results'):
            teachers = data['results']
        else:
            teachers = data
            
        if teachers and len(teachers) > 0:
            first_teacher = teachers[0]
            print(f"🔍 First Teacher Structure:")
            print(f"   ID: {first_teacher.get('id')}")
            print(f"   Full Name: {first_teacher.get('full_name')}")
            print(f"   User Data: {first_teacher.get('user')}")
            if first_teacher.get('user'):
                print(f"   Date Joined: {first_teacher['user'].get('date_joined')}")
        else:
            print("❌ No teachers found in response")
    else:
        print(f"❌ Teachers API Error: {response.status_code}")
        print(f"Response: {response.text}")
except Exception as e:
    print(f"❌ Error testing Teachers API: {e}")

print("\n" + "="*50 + "\n")

# Test the parents API
print("Testing Parents API...")
try:
    response = requests.get("http://localhost:8000/api/parents/")
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Parents API Response Status: {response.status_code}")
        print(f"📊 Total Parents: {len(data.get('results', data))}")
        
        if data.get('results'):
            parents = data['results']
        else:
            parents = data
            
        if parents and len(parents) > 0:
            first_parent = parents[0]
            print(f"🔍 First Parent Structure:")
            print(f"   ID: {first_parent.get('id')}")
            print(f"   User Data: {first_parent.get('user')}")
            if first_parent.get('user'):
                print(f"   Date Joined: {first_parent['user'].get('date_joined')}")
        else:
            print("❌ No parents found in response")
    else:
        print(f"❌ Parents API Error: {response.status_code}")
        print(f"Response: {response.text}")
except Exception as e:
    print(f"❌ Error testing Parents API: {e}")


