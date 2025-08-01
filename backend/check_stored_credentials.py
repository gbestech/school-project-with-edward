#!/usr/bin/env python
"""
Check for stored credentials in the database
"""
import os
import sys
import django

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.db import connection

User = get_user_model()

def check_stored_credentials():
    """Check for any stored credentials in the database"""
    print("🔍 Checking for stored credentials...")
    
    # List all users
    users = User.objects.all()
    print(f"\n📊 Found {users.count()} user(s):")
    
    for user in users:
        print(f"\n👤 User: {user.first_name} {user.last_name}")
        print(f"📧 Email: {user.email}")
        print(f"🆔 Username: {user.username}")
        print(f"🏷️  Role: {user.role}")
        print(f"✅ Active: {user.is_active}")
        print(f"👑 Staff: {user.is_staff}")
        print(f"🔑 Superuser: {user.is_superuser}")
        print(f"📅 Created: {user.date_joined}")
        
        # Check if there are any custom fields that might store credentials
        if hasattr(user, 'verification_code'):
            print(f"🔢 Verification Code: {user.verification_code}")
        
        # Check for any temporary attributes (these won't be in DB but might be in memory)
        if hasattr(user, '_generated_username'):
            print(f"🆔 Generated Username: {user._generated_username}")
        if hasattr(user, '_generated_password'):
            print(f"🔑 Generated Password: {user._generated_password}")
    
    # Check if there are any other tables that might store credentials
    print(f"\n🔍 Checking database tables...")
    with connection.cursor() as cursor:
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        print("📋 Available tables:")
        for table in tables:
            print(f"  - {table[0]}")
    
    print("\n💡 Note: Passwords are hashed in Django for security.")
    print("   If you need to reset a password, we can generate a new one.")

if __name__ == '__main__':
    check_stored_credentials() 