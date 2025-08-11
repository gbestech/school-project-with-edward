#!/usr/bin/env python
"""
Script to populate the database with sample subjects
"""
import os
import sys
import django
from django.db.models import Count

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from subject.models import Subject

def create_sample_subjects():
    """Create sample subjects for testing"""
    print("=== Creating Sample Subjects ===")
    
    # Sample subjects data
    subjects_data = [
        # Nursery Subjects
        {
            'name': 'Play Activities',
            'short_name': 'Play',
            'code': 'PLAY-NUR',
            'description': 'Structured play activities for early learning',
            'category': 'nursery_activities',
            'education_levels': ['NURSERY'],
            'nursery_levels': ['PRE_NURSERY', 'NURSERY_1', 'NURSERY_2'],
            'is_compulsory': True,
            'is_activity_based': True,
            'has_continuous_assessment': True,
            'has_final_exam': False,
            'pass_mark': 60,
            'has_practical': False,
            'practical_hours': 0,
            'requires_lab': False,
            'requires_special_equipment': False,
            'requires_specialist_teacher': False
        },
        {
            'name': 'Early Learning',
            'short_name': 'Early Learning',
            'code': 'EL-NUR',
            'description': 'Basic early learning concepts and activities',
            'category': 'nursery_activities',
            'education_levels': ['NURSERY'],
            'nursery_levels': ['PRE_NURSERY', 'NURSERY_1', 'NURSERY_2'],
            'is_compulsory': True,
            'is_activity_based': True,
            'has_continuous_assessment': True,
            'has_final_exam': False,
            'pass_mark': 60,
            'has_practical': False,
            'practical_hours': 0,
            'requires_lab': False,
            'requires_special_equipment': False,
            'requires_specialist_teacher': False
        },
        {
            'name': 'Creative Arts',
            'short_name': 'Creative Arts',
            'code': 'CA-NUR',
            'description': 'Drawing, painting, and creative expression',
            'category': 'creative_arts',
            'education_levels': ['NURSERY'],
            'nursery_levels': ['PRE_NURSERY', 'NURSERY_1', 'NURSERY_2'],
            'is_compulsory': True,
            'is_activity_based': True,
            'has_continuous_assessment': True,
            'has_final_exam': False,
            'pass_mark': 60,
            'has_practical': True,
            'practical_hours': 1,
            'requires_lab': False,
            'requires_special_equipment': True,
            'equipment_notes': 'Art supplies, drawing materials',
            'requires_specialist_teacher': False
        },
        
        # Primary Subjects
        {
            'name': 'Mathematics',
            'short_name': 'Maths',
            'code': 'MATH-PRI',
            'description': 'Basic arithmetic, problem solving, and mathematical concepts',
            'category': 'core',
            'education_levels': ['PRIMARY'],
            'is_compulsory': True,
            'is_core': True,
            'has_continuous_assessment': True,
            'has_final_exam': True,
            'pass_mark': 50,
            'has_practical': False,
            'practical_hours': 0,
            'requires_lab': False,
            'requires_special_equipment': False,
            'requires_specialist_teacher': False
        },
        {
            'name': 'English Language',
            'short_name': 'English',
            'code': 'ENG-PRI',
            'description': 'Grammar, composition, reading, and writing skills',
            'category': 'core',
            'education_levels': ['PRIMARY'],
            'is_compulsory': True,
            'is_core': True,
            'has_continuous_assessment': True,
            'has_final_exam': True,
            'pass_mark': 50,
            'has_practical': False,
            'practical_hours': 0,
            'requires_lab': False,
            'requires_special_equipment': False,
            'requires_specialist_teacher': False
        },
        {
            'name': 'Basic Science and Technology',
            'short_name': 'BST',
            'code': 'BST-PRI',
            'description': 'Basic science concepts and technology awareness',
            'category': 'core',
            'education_levels': ['PRIMARY'],
            'is_compulsory': True,
            'is_core': True,
            'has_continuous_assessment': True,
            'has_final_exam': True,
            'pass_mark': 50,
            'has_practical': True,
            'practical_hours': 2,
            'requires_lab': True,
            'requires_special_equipment': True,
            'equipment_notes': 'Basic lab equipment, microscopes',
            'requires_specialist_teacher': True
        },
        {
            'name': 'Social Studies',
            'short_name': 'Social Studies',
            'code': 'SS-PRI',
            'description': 'History, geography, and civic education',
            'category': 'core',
            'education_levels': ['PRIMARY'],
            'is_compulsory': True,
            'is_core': True,
            'has_continuous_assessment': True,
            'has_final_exam': True,
            'pass_mark': 50,
            'has_practical': False,
            'practical_hours': 0,
            'requires_lab': False,
            'requires_special_equipment': False,
            'requires_specialist_teacher': False
        },
        {
            'name': 'Physical and Health Education',
            'short_name': 'PHE',
            'code': 'PHE-PRI',
            'description': 'Physical education and health awareness',
            'category': 'physical_education',
            'education_levels': ['PRIMARY'],
            'is_compulsory': True,
            'has_continuous_assessment': True,
            'has_final_exam': True,
            'pass_mark': 50,
            'has_practical': True,
            'practical_hours': 2,
            'requires_lab': False,
            'requires_special_equipment': True,
            'equipment_notes': 'Sports equipment, playground facilities',
            'requires_specialist_teacher': True
        },
        
        # Junior Secondary Subjects
        {
            'name': 'Mathematics',
            'short_name': 'Maths',
            'code': 'MATH-JSS',
            'description': 'Advanced mathematics including algebra and geometry',
            'category': 'core',
            'education_levels': ['JUNIOR_SECONDARY'],
            'is_compulsory': True,
            'is_core': True,
            'has_continuous_assessment': True,
            'has_final_exam': True,
            'pass_mark': 50,
            'has_practical': False,
            'practical_hours': 0,
            'requires_lab': False,
            'requires_special_equipment': False,
            'requires_specialist_teacher': True
        },
        {
            'name': 'English Language',
            'short_name': 'English',
            'code': 'ENG-JSS',
            'description': 'Advanced English grammar, literature, and composition',
            'category': 'core',
            'education_levels': ['JUNIOR_SECONDARY'],
            'is_compulsory': True,
            'is_core': True,
            'has_continuous_assessment': True,
            'has_final_exam': True,
            'pass_mark': 50,
            'has_practical': False,
            'practical_hours': 0,
            'requires_lab': False,
            'requires_special_equipment': False,
            'requires_specialist_teacher': True
        },
        {
            'name': 'Basic Science',
            'short_name': 'Basic Science',
            'code': 'BS-JSS',
            'description': 'Integrated science concepts and practical work',
            'category': 'core',
            'education_levels': ['JUNIOR_SECONDARY'],
            'is_compulsory': True,
            'is_core': True,
            'has_continuous_assessment': True,
            'has_final_exam': True,
            'pass_mark': 50,
            'has_practical': True,
            'practical_hours': 3,
            'requires_lab': True,
            'requires_special_equipment': True,
            'equipment_notes': 'Laboratory equipment, chemicals, safety gear',
            'requires_specialist_teacher': True
        },
        {
            'name': 'Basic Technology',
            'short_name': 'Basic Tech',
            'code': 'BT-JSS',
            'description': 'Technology education and practical skills',
            'category': 'core',
            'education_levels': ['JUNIOR_SECONDARY'],
            'is_compulsory': True,
            'is_core': True,
            'has_continuous_assessment': True,
            'has_final_exam': True,
            'pass_mark': 50,
            'has_practical': True,
            'practical_hours': 3,
            'requires_lab': True,
            'requires_special_equipment': True,
            'equipment_notes': 'Workshop tools, technical drawing equipment',
            'requires_specialist_teacher': True
        },
        {
            'name': 'Social Studies',
            'short_name': 'Social Studies',
            'code': 'SS-JSS',
            'description': 'History, geography, and civic education',
            'category': 'core',
            'education_levels': ['JUNIOR_SECONDARY'],
            'is_compulsory': True,
            'is_core': True,
            'has_continuous_assessment': True,
            'has_final_exam': True,
            'pass_mark': 50,
            'has_practical': False,
            'practical_hours': 0,
            'requires_lab': False,
            'requires_special_equipment': False,
            'requires_specialist_teacher': True
        },
        {
            'name': 'Business Studies',
            'short_name': 'Business Studies',
            'code': 'BUS-JSS',
            'description': 'Introduction to business concepts and entrepreneurship',
            'category': 'elective',
            'education_levels': ['JUNIOR_SECONDARY'],
            'is_compulsory': False,
            'has_continuous_assessment': True,
            'has_final_exam': True,
            'pass_mark': 50,
            'has_practical': False,
            'practical_hours': 0,
            'requires_lab': False,
            'requires_special_equipment': False,
            'requires_specialist_teacher': True
        },
        
        # Senior Secondary Subjects
        {
            'name': 'Mathematics',
            'short_name': 'Maths',
            'code': 'MATH-SSS',
            'description': 'Advanced mathematics including calculus and statistics',
            'category': 'core',
            'education_levels': ['SENIOR_SECONDARY'],
            'ss_subject_type': 'core',
            'is_compulsory': True,
            'is_core': True,
            'has_continuous_assessment': True,
            'has_final_exam': True,
            'pass_mark': 50,
            'has_practical': False,
            'practical_hours': 0,
            'requires_lab': False,
            'requires_special_equipment': False,
            'requires_specialist_teacher': True
        },
        {
            'name': 'English Language',
            'short_name': 'English',
            'code': 'ENG-SSS',
            'description': 'Advanced English literature and language studies',
            'category': 'core',
            'education_levels': ['SENIOR_SECONDARY'],
            'ss_subject_type': 'core',
            'is_compulsory': True,
            'is_core': True,
            'has_continuous_assessment': True,
            'has_final_exam': True,
            'pass_mark': 50,
            'has_practical': False,
            'practical_hours': 0,
            'requires_lab': False,
            'requires_special_equipment': False,
            'requires_specialist_teacher': True
        },
        {
            'name': 'Physics',
            'short_name': 'Physics',
            'code': 'PHY-SSS',
            'description': 'Advanced physics concepts and laboratory work',
            'category': 'science',
            'education_levels': ['SENIOR_SECONDARY'],
            'ss_subject_type': 'science',
            'is_compulsory': False,
            'has_continuous_assessment': True,
            'has_final_exam': True,
            'pass_mark': 50,
            'has_practical': True,
            'practical_hours': 4,
            'requires_lab': True,
            'requires_special_equipment': True,
            'equipment_notes': 'Physics laboratory equipment, measuring instruments',
            'requires_specialist_teacher': True
        },
        {
            'name': 'Chemistry',
            'short_name': 'Chemistry',
            'code': 'CHEM-SSS',
            'description': 'Advanced chemistry concepts and laboratory work',
            'category': 'science',
            'education_levels': ['SENIOR_SECONDARY'],
            'ss_subject_type': 'science',
            'is_compulsory': False,
            'has_continuous_assessment': True,
            'has_final_exam': True,
            'pass_mark': 50,
            'has_practical': True,
            'practical_hours': 4,
            'requires_lab': True,
            'requires_special_equipment': True,
            'equipment_notes': 'Chemistry laboratory equipment, chemicals, safety gear',
            'requires_specialist_teacher': True
        },
        {
            'name': 'Biology',
            'short_name': 'Biology',
            'code': 'BIO-SSS',
            'description': 'Advanced biology concepts and laboratory work',
            'category': 'science',
            'education_levels': ['SENIOR_SECONDARY'],
            'ss_subject_type': 'science',
            'is_compulsory': False,
            'has_continuous_assessment': True,
            'has_final_exam': True,
            'pass_mark': 50,
            'has_practical': True,
            'practical_hours': 4,
            'requires_lab': True,
            'requires_special_equipment': True,
            'equipment_notes': 'Biology laboratory equipment, microscopes, specimens',
            'requires_specialist_teacher': True
        },
        {
            'name': 'Economics',
            'short_name': 'Economics',
            'code': 'ECO-SSS',
            'description': 'Economic principles and analysis',
            'category': 'social_sciences',
            'education_levels': ['SENIOR_SECONDARY'],
            'ss_subject_type': 'social_sciences',
            'is_compulsory': False,
            'has_continuous_assessment': True,
            'has_final_exam': True,
            'pass_mark': 50,
            'has_practical': False,
            'practical_hours': 0,
            'requires_lab': False,
            'requires_special_equipment': False,
            'requires_specialist_teacher': True
        },
        {
            'name': 'Literature in English',
            'short_name': 'Literature',
            'code': 'LIT-SSS',
            'description': 'Study of English literature and literary analysis',
            'category': 'arts',
            'education_levels': ['SENIOR_SECONDARY'],
            'ss_subject_type': 'arts',
            'is_compulsory': False,
            'has_continuous_assessment': True,
            'has_final_exam': True,
            'pass_mark': 50,
            'has_practical': False,
            'practical_hours': 0,
            'requires_lab': False,
            'requires_special_equipment': False,
            'requires_specialist_teacher': True
        },
        {
            'name': 'Government',
            'short_name': 'Government',
            'code': 'GOV-SSS',
            'description': 'Political science and government studies',
            'category': 'social_sciences',
            'education_levels': ['SENIOR_SECONDARY'],
            'ss_subject_type': 'social_sciences',
            'is_compulsory': False,
            'has_continuous_assessment': True,
            'has_final_exam': True,
            'pass_mark': 50,
            'has_practical': False,
            'practical_hours': 0,
            'requires_lab': False,
            'requires_special_equipment': False,
            'requires_specialist_teacher': True
        },
        {
            'name': 'Computer Science',
            'short_name': 'Computer Science',
            'code': 'CS-SSS',
            'description': 'Programming, algorithms, and computer systems',
            'category': 'technology',
            'education_levels': ['SENIOR_SECONDARY'],
            'ss_subject_type': 'technology',
            'is_compulsory': False,
            'has_continuous_assessment': True,
            'has_final_exam': True,
            'pass_mark': 50,
            'has_practical': True,
            'practical_hours': 3,
            'requires_lab': True,
            'requires_special_equipment': True,
            'equipment_notes': 'Computer laboratory, programming software',
            'requires_specialist_teacher': True
        }
    ]
    
    created_count = 0
    updated_count = 0
    
    for subject_data in subjects_data:
        try:
            # Remove credit_hours if it exists in the data
            subject_data.pop('credit_hours', None)
            
            # Create or get the subject
            subject, created = Subject.objects.get_or_create(
                code=subject_data['code'],
                defaults=subject_data
            )
            
            if created:
                created_count += 1
                print(f"✅ Created: {subject.name} ({subject.code})")
            else:
                # Update existing subject with new data
                for key, value in subject_data.items():
                    setattr(subject, key, value)
                subject.save()
                updated_count += 1
                print(f"🔄 Updated: {subject.name} ({subject.code})")
                
        except Exception as e:
            print(f"❌ Error creating/updating {subject_data.get('name', 'Unknown')}: {str(e)}")
    
    print(f"\n=== Summary ===")
    print(f"Created: {created_count} subjects")
    print(f"Updated: {updated_count} subjects")
    print(f"Total processed: {created_count + updated_count} subjects")
    
    # Display statistics
    print(f"\n=== Statistics ===")
    total_subjects = Subject.objects.count()
    print(f"Total subjects in database: {total_subjects}")
    
    by_category = Subject.objects.values('category').annotate(count=Count('id'))
    print(f"\nBy Category:")
    for item in by_category:
        print(f"  {item['category']}: {item['count']}")
    
    by_level = Subject.objects.values('education_levels').annotate(count=Count('id'))
    print(f"\nBy Education Level:")
    for item in by_level:
        print(f"  {item['education_levels']}: {item['count']}")

if __name__ == "__main__":
    create_sample_subjects() 