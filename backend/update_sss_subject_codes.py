#!/usr/bin/env python
import os
import sys
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from subject.models import Subject

def update_sss_subject_codes():
    print("🔧 Updating Senior Secondary subject codes with new naming convention...")
    
    # Define the updated subject codes with new naming convention
    updated_codes = {
        # CROSS-CUTTING
        'English-SSS': 'Eng.-Cro-SSS',
        'MAT-CR-112': 'Math-Cor-SSS',
        'CIVICEDUCATION-SSS': 'CIV.-Core-SSS',
        
        # CORE-SCIENCE
        'CHEMISTRY-SSS': 'Chem. Core-Sc-SSS',
        'PHYSICS-SSS': 'Phy-Core-Sc-SSS',
        
        # CORE-ARTS
        'LITERATUREINENGLISH-SSS': 'Lt.Eng-Art-SSS',
        'GOVERNMENT-SSS': 'Gov.-Art-SSS',
        'PHYSICALANDHEALTHEDUCATION-SSS': 'PHE-Elec-SSS',
        
        # CORE-HUMANITIES
        'ACCOUNTING-SSS': 'ACC. Core-Hum-SSS',
        'ECONOMICS-SSS': 'Econs-Hum-SSS',
        
        # ELECTIVE
        'AGRICULTURALSCIENCE-SSS': 'Agric-Elec-SSS',
        'ANIMALHUSBANDRY-SSS': 'A.Hus-Elec-SSS',
        'BIOLOGY-SSS': 'Bio-Elec-SSS',
        'COMMCE-SSS': 'Comm-Elec-SSS',
        'COMPUTERSTUDIES-SSS': 'Comp.S-Elec-SSS',
        'DATAPROCESSING-SSS': 'D.P-Elec-SSS',
        'FOODANDNUTRITION-SSS': 'F.Nurt-Elec-SSS',
        'PHE-SSS': 'PHE-Elec-SSS',
        'CRS-SSS': 'CRS-Elec-SSS',
    }
    
    # Update each subject
    for old_code, new_code in updated_codes.items():
        try:
            subject = Subject.objects.get(code=old_code)
            subject.code = new_code
            subject.save()
            print(f"  ✅ Updated {subject.name}: {old_code} → {new_code}")
        except Subject.DoesNotExist:
            print(f"  ⚠️  Subject with code {old_code} not found")
    
    # Verification
    print("\n📋 Verification - Updated Senior Secondary subjects:")
    all_subjects = Subject.objects.all()
    sss_subjects = [s for s in all_subjects if 'SENIOR_SECONDARY' in s.education_levels]
    for subject in sorted(sss_subjects, key=lambda x: x.name):
        print(f"  • {subject.name} ({subject.code})")
    
    print(f"\n🎉 Total Senior Secondary subjects: {len(sss_subjects)}")

if __name__ == '__main__':
    update_sss_subject_codes()
