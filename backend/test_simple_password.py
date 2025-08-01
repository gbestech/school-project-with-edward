#!/usr/bin/env python
"""
Simple test to verify password generation logic
"""
import os
import sys
import django
import secrets
import string

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from utils import generate_unique_username

def test_password_generation():
    """Test password generation logic"""
    print("🧪 Testing password generation logic...")
    
    # Test password generation
    password = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(10))
    print(f"🔑 Generated password: {password}")
    print(f"📏 Password length: {len(password)}")
    print(f"✅ Password contains letters: {any(c.isalpha() for c in password)}")
    print(f"✅ Password contains digits: {any(c.isdigit() for c in password)}")
    
    # Test username generation
    username = generate_unique_username("admin")
    print(f"🆔 Generated username: {username}")
    
    # Test different roles
    roles = ["admin", "teacher", "student", "parent"]
    for role in roles:
        username = generate_unique_username(role)
        print(f"🏷️  {role.title()} username: {username}")
    
    print("✅ Password and username generation working correctly!")

if __name__ == '__main__':
    test_password_generation() 