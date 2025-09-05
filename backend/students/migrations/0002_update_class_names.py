# Generated manually to update class names to Nigerian education system

from django.db import migrations

def update_student_classes(apps, schema_editor):
    """Update existing student class names to Nigerian education system"""
    Student = apps.get_model('students', 'Student')
    
    # Mapping of old class names to new class names
    class_mapping = {
        # Nursery classes
        'PRE_K': 'PRE_NURSERY',
        'KINDERGARTEN': 'NURSERY_1',
        
        # Primary classes
        'GRADE_1': 'PRIMARY_1',
        'GRADE_2': 'PRIMARY_2',
        'GRADE_3': 'PRIMARY_3',
        'GRADE_4': 'PRIMARY_4',
        'GRADE_5': 'PRIMARY_5',
        'GRADE_6': 'PRIMARY_6',
        
        # Junior Secondary classes
        'GRADE_7': 'JSS_1',
        'GRADE_8': 'JSS_2',
        'GRADE_9': 'JSS_3',
        
        # Senior Secondary classes
        'GRADE_10': 'SS_1',
        'GRADE_11': 'SS_2',
        'GRADE_12': 'SS_3',
    }
    
    # Update each student's class
    for student in Student.objects.all():
        if student.student_class in class_mapping:
            student.student_class = class_mapping[student.student_class]
            student.save()

def reverse_update_student_classes(apps, schema_editor):
    """Reverse the class name updates"""
    Student = apps.get_model('students', 'Student')
    
    # Reverse mapping
    reverse_mapping = {
        'PRE_NURSERY': 'PRE_K',
        'NURSERY_1': 'KINDERGARTEN',
        'PRIMARY_1': 'GRADE_1',
        'PRIMARY_2': 'GRADE_2',
        'PRIMARY_3': 'GRADE_3',
        'PRIMARY_4': 'GRADE_4',
        'PRIMARY_5': 'GRADE_5',
        'PRIMARY_6': 'GRADE_6',
        'JSS_1': 'GRADE_7',
        'JSS_2': 'GRADE_8',
        'JSS_3': 'GRADE_9',
        'SS_1': 'GRADE_10',
        'SS_2': 'GRADE_11',
        'SS_3': 'GRADE_12',
    }
    
    for student in Student.objects.all():
        if student.student_class in reverse_mapping:
            student.student_class = reverse_mapping[student.student_class]
            student.save()

class Migration(migrations.Migration):

    dependencies = [
        ('students', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(update_student_classes, reverse_update_student_classes),
    ]








