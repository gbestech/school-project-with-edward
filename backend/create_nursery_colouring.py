#!/usr/bin/env python
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from subject.models import Subject

def create_nursery_colouring():
    print("🎨 CREATING NURSERY COLOURING ACTIVITIES SUBJECT")
    print("=" * 50)
    
    # Check if nursery colouring already exists
    try:
        existing = Subject.objects.get(code='COLOURINGACTIVITIES-NUR')
        print(f"✅ Subject already exists: {existing.name} ({existing.code})")
        return
    except Subject.DoesNotExist:
        pass
    
    # Create the nursery colouring activities subject
    nursery_colouring = Subject.objects.create(
        name='Colouring activities',
        code='COLOURINGACTIVITIES-NUR',
        description='Colouring activities for nursery students',
        education_levels=['NURSERY'],
        is_active=True
    )
    
    print(f"✅ Created: {nursery_colouring.name} ({nursery_colouring.code})")
    print(f"   Education levels: {nursery_colouring.education_levels}")
    
    # Verify final nursery subjects
    print("\n🔍 FINAL NURSERY SUBJECTS:")
    nursery_subjects = []
    for subject in Subject.objects.all():
        if subject.education_levels and 'NURSERY' in subject.education_levels:
            nursery_subjects.append(subject)
    
    for subject in sorted(nursery_subjects, key=lambda x: x.name):
        print(f"✅ {subject.name} ({subject.code})")
    
    print(f"\n📊 Total nursery subjects: {len(nursery_subjects)}")

if __name__ == "__main__":
    create_nursery_colouring()
