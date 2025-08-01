#!/usr/bin/env python
"""
Test script to verify password generation is working correctly
"""
import os
import sys
import django

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from authentication.serializers import RegisterSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

def test_password_generation():
    """Test that passwords are being generated correctly"""
    print("🧪 Testing password generation...")
    
    # Test data for admin registration
    test_data = {
        'first_name': 'Test',
        'last_name': 'Admin',
        'email': 'testadmin@example.com',
        'role': 'admin',
        'agree_to_terms': True,
        'subscribe_newsletter': False,
    }
    
    # Create serializer instance
    serializer = RegisterSerializer(data=test_data)
    
    if serializer.is_valid():
        print("✅ Validation passed")
        
        # Temporarily disable email sending for testing
        original_send_email = serializer.send_verification_email
        serializer.send_verification_email = lambda user, code: None
        
        # Create user
        user = serializer.save()
        
        # Check if credentials were generated
        generated_username = getattr(user, '_generated_username', None)
        generated_password = getattr(user, '_generated_password', None)
        
        print(f"📧 Email: {user.email}")
        print(f"👤 Name: {user.first_name} {user.last_name}")
        print(f"🏷️  Role: {user.role}")
        print(f"🆔 Username: {generated_username}")
        print(f"🔑 Password: {generated_password}")
        print(f"✅ Active: {user.is_active}")
        
        if generated_username and generated_password:
            print("✅ Password generation working correctly!")
        else:
            print("❌ Password generation failed!")
            
        # Clean up
        user.delete()
        print("🧹 Test user deleted")
        
    else:
        print("❌ Validation failed:")
        print(serializer.errors)

if __name__ == '__main__':
    test_password_generation() 