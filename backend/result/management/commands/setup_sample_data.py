from django.core.management.base import BaseCommand
from subject.models import Subject
from students.models import Student
from users.models import CustomUser
from academics.models import AcademicSession
from datetime import date

class Command(BaseCommand):
    help = 'Set up sample subjects and students for testing'

    def handle(self, *args, **options):
        self.stdout.write('Setting up sample data...')

        # Create sample subjects
        subjects_data = [
            {'name': 'Mathematics', 'code': 'MATH', 'description': 'Core mathematics subject'},
            {'name': 'English Language', 'code': 'ENG', 'description': 'Core English language subject'},
            {'name': 'Physics', 'code': 'PHY', 'description': 'Core physics subject'},
            {'name': 'Chemistry', 'code': 'CHEM', 'description': 'Core chemistry subject'},
            {'name': 'Biology', 'code': 'BIO', 'description': 'Core biology subject'},
            {'name': 'Literature in English', 'code': 'LIT', 'description': 'Literature subject'},
            {'name': 'Geography', 'code': 'GEO', 'description': 'Geography subject'},
            {'name': 'Government', 'code': 'GOV', 'description': 'Government subject'},
        ]

        for subject_data in subjects_data:
            subject, created = Subject.objects.get_or_create(
                name=subject_data['name'],
                defaults=subject_data
            )
            if created:
                self.stdout.write(f'Created subject {subject_data["name"]}')

        # Create sample students
        students_data = [
            {
                'username': 'john.doe',
                'first_name': 'John',
                'last_name': 'Doe',
                'email': 'john.doe@example.com',
                'date_of_birth': date(2008, 5, 15),
                'gender': 'M',
                'student_class': 'GRADE_11',
                'education_level': 'SECONDARY',
                'parent_contact': '08012345678',
                'emergency_contact': '08012345678'
            },
            {
                'username': 'sarah.smith',
                'first_name': 'Sarah',
                'last_name': 'Smith',
                'email': 'sarah.smith@example.com',
                'date_of_birth': date(2007, 8, 22),
                'gender': 'F',
                'student_class': 'GRADE_11',
                'education_level': 'SECONDARY',
                'parent_contact': '08023456789',
                'emergency_contact': '08023456789'
            },
            {
                'username': 'david.johnson',
                'first_name': 'David',
                'last_name': 'Johnson',
                'email': 'david.johnson@example.com',
                'date_of_birth': date(2009, 3, 10),
                'gender': 'M',
                'student_class': 'GRADE_10',
                'education_level': 'SECONDARY',
                'parent_contact': '08034567890',
                'emergency_contact': '08034567890'
            },
            {
                'username': 'emily.brown',
                'first_name': 'Emily',
                'last_name': 'Brown',
                'email': 'emily.brown@example.com',
                'date_of_birth': date(2008, 11, 5),
                'gender': 'F',
                'student_class': 'GRADE_10',
                'education_level': 'SECONDARY',
                'parent_contact': '08045678901',
                'emergency_contact': '08045678901'
            },
            {
                'username': 'michael.wilson',
                'first_name': 'Michael',
                'last_name': 'Wilson',
                'email': 'michael.wilson@example.com',
                'date_of_birth': date(2007, 7, 18),
                'gender': 'M',
                'student_class': 'GRADE_12',
                'education_level': 'SECONDARY',
                'parent_contact': '08056789012',
                'emergency_contact': '08056789012'
            }
        ]

        for student_data in students_data:
            # Create or get the user
            user, created = CustomUser.objects.get_or_create(
                username=student_data['username'],
                defaults={
                    'first_name': student_data['first_name'],
                    'last_name': student_data['last_name'],
                    'email': student_data['email'],
                    'is_active': True
                }
            )
            
            if created:
                self.stdout.write(f'Created user {student_data["first_name"]} {student_data["last_name"]}')
            
            # Create or get the student profile
            student, created = Student.objects.get_or_create(
                user=user,
                defaults={
                    'date_of_birth': student_data['date_of_birth'],
                    'gender': student_data['gender'],
                    'student_class': student_data['student_class'],
                    'education_level': student_data['education_level'],
                    'parent_contact': student_data['parent_contact'],
                    'emergency_contact': student_data['emergency_contact'],
                    'is_active': True
                }
            )
            
            if created:
                self.stdout.write(f'Created student profile for {student_data["first_name"]} {student_data["last_name"]}')

        self.stdout.write(
            self.style.SUCCESS('Successfully set up sample data')
        ) 