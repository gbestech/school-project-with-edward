#!/usr/bin/env python
import os
import sys
import django

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from events.models import Event
from django.contrib.auth import get_user_model

User = get_user_model()

def check_events():
    """Check for events in the database and create test events if needed"""
    print("🔍 Checking for events in the database...")
    
    # Count existing events
    total_events = Event.objects.count()
    print(f"📊 Total events found: {total_events}")
    
    if total_events > 0:
        print("✅ Events exist in the database")
        events = Event.objects.all()[:5]  # Show first 5 events
        for event in events:
            print(f"  - {event.title} ({event.event_type}) - Active: {event.is_active}, Published: {event.is_published}")
    else:
        print("❌ No events found in the database")
        
        # Create test events
        print("🛠️ Creating test events...")
        
        # Get or create a superuser for creating events
        try:
            admin_user = User.objects.filter(is_superuser=True).first()
            if not admin_user:
                print("⚠️ No superuser found. Creating a test user...")
                admin_user = User.objects.create_user(
                    username='testadmin',
                    email='admin@test.com',
                    password='testpass123',
                    is_superuser=True,
                    is_staff=True
                )
                print(f"✅ Created test admin user: {admin_user.username}")
        except Exception as e:
            print(f"❌ Error creating admin user: {e}")
            return
        
        # Create test events
        test_events = [
            {
                'title': 'Welcome to Our School',
                'subtitle': 'Excellence in Education',
                'description': 'Join us for an exceptional learning experience with state-of-the-art facilities and dedicated teachers.',
                'event_type': 'announcement',
                'display_type': 'banner',
                'background_theme': 'default',
                'is_active': True,
                'is_published': True,
                'badge_text': 'Welcome',
                'cta_text': 'Learn More',
                'secondary_cta_text': 'Contact Us'
            },
            {
                'title': 'Academic Excellence',
                'subtitle': 'Achieving Greatness Together',
                'description': 'Our students consistently achieve outstanding results through our comprehensive curriculum.',
                'event_type': 'achievement',
                'display_type': 'carousel',
                'background_theme': 'achievement',
                'is_active': False,
                'is_published': True,
                'badge_text': 'Excellence',
                'cta_text': 'View Results',
                'secondary_cta_text': 'Apply Now'
            },
            {
                'title': 'Enrollment Open',
                'subtitle': 'Secure Your Child\'s Future',
                'description': 'Limited spots available for the upcoming academic year. Apply now to secure your child\'s place.',
                'event_type': 'enrollment',
                'display_type': 'ribbon',
                'background_theme': 'enrollment',
                'is_active': False,
                'is_published': True,
                'ribbon_text': '🎓 Enrollment Open - Limited Spots Available! Apply Now!',
                'badge_text': 'Enrollment',
                'cta_text': 'Apply Now',
                'secondary_cta_text': 'Learn More'
            }
        ]
        
        created_count = 0
        for event_data in test_events:
            try:
                event = Event.objects.create(
                    created_by=admin_user,
                    **event_data
                )
                created_count += 1
                print(f"✅ Created event: {event.title}")
            except Exception as e:
                print(f"❌ Error creating event '{event_data['title']}': {e}")
        
        print(f"🎉 Successfully created {created_count} test events")
        
        # Show final count
        final_count = Event.objects.count()
        print(f"📊 Total events now: {final_count}")

if __name__ == '__main__':
    check_events() 