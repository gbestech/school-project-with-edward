#!/usr/bin/env python
import os
import sys
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from subject.models import Subject

def fix_nursery_subject_codes():
    print("🔧 Updating Nursery subject codes with new naming convention...")
    
    # Define the updated subject codes with new naming convention
    updated_codes = {
        'COLOURINGACTIVITIES-NUR': 'Col.A-NUR',
        'COMPUTERSTUDIES-NUR': 'Comp.S-NUR',
        'ENGLISHALPHABET-NUR': 'Eng.An-NUR',
        'MATHEMATICSNUMBERS-NUR': 'Maths-N-NUR',
        'SOCIALSTUDIES-NUR': 'So.s-NUR',
        'WRITINGSKILL-NUR': 'Wri-S-NUR',
    }
    
    # Update each subject
    for old_code, new_code in updated_codes.items():
        try:
            subject = Subject.objects.get(code=old_code)
            subject.code = new_code
            subject.save()
            print(f"✅ Updated {subject.name}: {old_code} → {new_code}")
        except Subject.DoesNotExist:
            print(f"❌ Subject with code {old_code} not found")
        except Exception as e:
            print(f"❌ Error updating {old_code}: {str(e)}")
    
    print("🎉 Nursery subject codes update completed!")

if __name__ == "__main__":
    fix_nursery_subject_codes()
