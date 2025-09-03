from django.core.management.base import BaseCommand
from django.utils import timezone
from result.models import (
    StudentResult, 
    ExamSession, 
    GradingSystem, 
    Grade,
    AssessmentType
)
from students.models import Student
from subject.models import Subject
from academics.models import AcademicSession
from users.models import CustomUser
from decimal import Decimal
import random


class Command(BaseCommand):
    help = 'Populate database with sample result data for testing'

    def handle(self, *args, **options):
        self.stdout.write('📊 POPULATING SAMPLE RESULTS')
        self.stdout.write('=' * 50)
        
        # Create grading system if it doesn't exist
        grading_system, created = GradingSystem.objects.get_or_create(
            name='Standard Grading System',
            defaults={
                'grading_type': 'LETTER',
                'description': 'Standard letter grading system (A-F)',
                'min_score': 0,
                'max_score': 100,
                'pass_mark': 40,
                'is_active': True
            }
        )
        
        if created:
            self.stdout.write('✅ Created grading system')
        else:
            self.stdout.write('ℹ️  Using existing grading system')
        
        # Create grades if they don't exist
        grades_data = [
            {'grade': 'A+', 'min_score': 90, 'max_score': 100, 'grade_point': 4.0, 'description': 'Excellent', 'is_passing': True},
            {'grade': 'A', 'min_score': 80, 'max_score': 89, 'grade_point': 4.0, 'description': 'Very Good', 'is_passing': True},
            {'grade': 'B+', 'min_score': 75, 'max_score': 79, 'grade_point': 3.5, 'description': 'Good', 'is_passing': True},
            {'grade': 'B', 'min_score': 70, 'max_score': 74, 'grade_point': 3.0, 'description': 'Above Average', 'is_passing': True},
            {'grade': 'C+', 'min_score': 65, 'max_score': 69, 'grade_point': 2.5, 'description': 'Average', 'is_passing': True},
            {'grade': 'C', 'min_score': 60, 'max_score': 64, 'grade_point': 2.0, 'description': 'Below Average', 'is_passing': True},
            {'grade': 'D', 'min_score': 50, 'max_score': 59, 'grade_point': 1.0, 'description': 'Poor', 'is_passing': True},
            {'grade': 'F', 'min_score': 0, 'max_score': 49, 'grade_point': 0.0, 'description': 'Fail', 'is_passing': False},
        ]
        
        for grade_data in grades_data:
            grade, created = Grade.objects.get_or_create(
                grading_system=grading_system,
                grade=grade_data['grade'],
                defaults=grade_data
            )
            if created:
                self.stdout.write(f'   ✅ Created grade: {grade_data["grade"]}')
        
        # Create assessment types if they don't exist
        assessment_types_data = [
            {'name': 'Continuous Assessment', 'code': 'CA', 'weight_percentage': 30, 'description': 'Regular class assessments'},
            {'name': 'Examination', 'code': 'EXAM', 'weight_percentage': 70, 'description': 'Final examination'},
        ]
        
        for at_data in assessment_types_data:
            at, created = AssessmentType.objects.get_or_create(
                code=at_data['code'],
                defaults=at_data
            )
            if created:
                self.stdout.write(f'   ✅ Created assessment type: {at_data["name"]}')
        
        # Get or create academic session
        academic_session, created = AcademicSession.objects.get_or_create(
            name='2024/2025',
            defaults={
                'start_date': '2024-09-01',
                'end_date': '2025-07-31',
                'is_active': True
            }
        )
        
        if created:
            self.stdout.write('✅ Created academic session: 2024/2025')
        
        # Create exam sessions
        exam_sessions_data = [
            {
                'name': 'First Term Examination',
                'exam_type': 'FINAL_EXAM',
                'term': 'FIRST',
                'start_date': '2024-09-01',
                'end_date': '2024-09-30',
                'result_release_date': '2024-10-15',
                'is_published': True,
                'is_active': True
            },
            {
                'name': 'Second Term Examination',
                'exam_type': 'FINAL_EXAM',
                'term': 'SECOND',
                'start_date': '2024-12-01',
                'end_date': '2024-12-30',
                'result_release_date': '2025-01-15',
                'is_published': True,
                'is_active': True
            }
        ]
        
        exam_sessions = []
        for es_data in exam_sessions_data:
            es, created = ExamSession.objects.get_or_create(
                academic_session=academic_session,
                term=es_data['term'],
                exam_type=es_data['exam_type'],
                defaults=es_data
            )
            exam_sessions.append(es)
            if created:
                self.stdout.write(f'   ✅ Created exam session: {es_data["name"]}')
        
        # Create subjects in academics app if they don't exist
        subjects_data = [
            {'name': 'Mathematics', 'code': 'MATH', 'description': 'Mathematics subject'},
            {'name': 'English Language', 'code': 'ENG', 'description': 'English Language subject'},
            {'name': 'Physics', 'code': 'PHY', 'description': 'Physics subject'},
            {'name': 'Chemistry', 'code': 'CHEM', 'description': 'Chemistry subject'},
            {'name': 'Biology', 'code': 'BIO', 'description': 'Biology subject'},
        ]
        
        subjects = []
        for subj_data in subjects_data:
            subject, created = Subject.objects.get_or_create(
                code=subj_data['code'],
                defaults=subj_data
            )
            subjects.append(subject)
            if created:
                self.stdout.write(f'   ✅ Created subject: {subj_data["name"]}')
        
        # Get students
        students = list(Student.objects.all()[:10])  # Get first 10 students
        
        if not students:
            self.stdout.write('❌ No students found. Please create students first.')
            return
        
        if not subjects:
            self.stdout.write('❌ No subjects found. Please create subjects first.')
            return
        
        # Get or create a user for entering results
        user, created = CustomUser.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@school.com',
                'first_name': 'Admin',
                'last_name': 'User',
                'is_staff': True,
                'is_superuser': True
            }
        )
        
        # Create sample results
        self.stdout.write('\n📝 Creating sample results...')
        
        results_created = 0
        for student in students:
            for subject in subjects:
                for exam_session in exam_sessions:
                    # Check if result already exists
                    if StudentResult.objects.filter(
                        student=student,
                        subject=subject,
                        exam_session=exam_session
                    ).exists():
                        continue
                    
                    # Generate random scores
                    ca_score = random.randint(15, 30)
                    exam_score = random.randint(40, 80)
                    total_score = ca_score + exam_score
                    
                    # Calculate percentage
                    percentage = (total_score / 100) * 100
                    
                    # Determine grade
                    if percentage >= 90:
                        grade = 'A+'
                        grade_point = 4.0
                        is_passed = True
                    elif percentage >= 80:
                        grade = 'A'
                        grade_point = 4.0
                        is_passed = True
                    elif percentage >= 75:
                        grade = 'B+'
                        grade_point = 3.5
                        is_passed = True
                    elif percentage >= 70:
                        grade = 'B'
                        grade_point = 3.0
                        is_passed = True
                    elif percentage >= 65:
                        grade = 'C+'
                        grade_point = 2.5
                        is_passed = True
                    elif percentage >= 60:
                        grade = 'C'
                        grade_point = 2.0
                        is_passed = True
                    elif percentage >= 50:
                        grade = 'D'
                        grade_point = 1.0
                        is_passed = True
                    else:
                        grade = 'F'
                        grade_point = 0.0
                        is_passed = False
                    
                    # Random status
                    status = random.choice(['DRAFT', 'APPROVED', 'PUBLISHED'])
                    
                    # Create result
                    result = StudentResult.objects.create(
                        student=student,
                        subject=subject,
                        exam_session=exam_session,
                        grading_system=grading_system,
                        ca_score=ca_score,
                        exam_score=exam_score,
                        total_score=total_score,
                        percentage=percentage,
                        grade=grade,
                        grade_point=grade_point,
                        is_passed=is_passed,
                        status=status,
                        remarks=f'Sample result for {student.full_name} in {subject.name}',
                        entered_by=user
                    )
                    
                    results_created += 1
                    
                    if results_created % 10 == 0:
                        self.stdout.write(f'   ✅ Created {results_created} results...')
        
        self.stdout.write(f'\n🎉 Successfully created {results_created} sample results!')
        
        # Show summary
        total_results = StudentResult.objects.count()
        published_results = StudentResult.objects.filter(status='PUBLISHED').count()
        approved_results = StudentResult.objects.filter(status='APPROVED').count()
        draft_results = StudentResult.objects.filter(status='DRAFT').count()
        passed_results = StudentResult.objects.filter(is_passed=True).count()
        failed_results = StudentResult.objects.filter(is_passed=False).count()
        
        self.stdout.write('\n📊 SUMMARY:')
        self.stdout.write(f'   Total Results: {total_results}')
        self.stdout.write(f'   Published: {published_results}')
        self.stdout.write(f'   Approved: {approved_results}')
        self.stdout.write(f'   Draft: {draft_results}')
        self.stdout.write(f'   Passed: {passed_results}')
        self.stdout.write(f'   Failed: {failed_results}')
        
        self.stdout.write('\n✅ Sample data population completed!')
