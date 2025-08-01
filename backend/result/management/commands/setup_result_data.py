from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from result.models import (
    GradingSystem, Grade, AssessmentType, ExamSession,
    StudentResult, StudentTermResult, ResultComment
)
from students.models import Student
from academics.models import AcademicSession, Subject
from decimal import Decimal
from datetime import date

User = get_user_model()

class Command(BaseCommand):
    help = 'Set up default result data for testing'

    def handle(self, *args, **options):
        self.stdout.write('Setting up result data...')

        # Create grading system
        grading_system, created = GradingSystem.objects.get_or_create(
            name="Standard Grading System",
            defaults={
                'grading_type': 'PERCENTAGE',
                'description': 'Standard percentage-based grading system',
                'min_score': 0,
                'max_score': 100,
                'pass_mark': 40,
                'is_active': True
            }
        )

        if created:
            self.stdout.write('Created grading system')
        else:
            self.stdout.write('Grading system already exists')

        # Create grades
        grades_data = [
            {'grade': 'A+', 'min_score': 90, 'max_score': 100, 'grade_point': 4.0, 'description': 'Excellent'},
            {'grade': 'A', 'min_score': 80, 'max_score': 89, 'grade_point': 3.7, 'description': 'Very Good'},
            {'grade': 'B+', 'min_score': 70, 'max_score': 79, 'grade_point': 3.3, 'description': 'Good'},
            {'grade': 'B', 'min_score': 60, 'max_score': 69, 'grade_point': 3.0, 'description': 'Above Average'},
            {'grade': 'C+', 'min_score': 50, 'max_score': 59, 'grade_point': 2.3, 'description': 'Average'},
            {'grade': 'C', 'min_score': 40, 'max_score': 49, 'grade_point': 2.0, 'description': 'Below Average'},
            {'grade': 'D', 'min_score': 30, 'max_score': 39, 'grade_point': 1.0, 'description': 'Poor'},
            {'grade': 'F', 'min_score': 0, 'max_score': 29, 'grade_point': 0.0, 'description': 'Fail', 'is_passing': False},
        ]

        for grade_data in grades_data:
            grade, created = Grade.objects.get_or_create(
                grading_system=grading_system,
                grade=grade_data['grade'],
                defaults=grade_data
            )
            if created:
                self.stdout.write(f'Created grade {grade_data["grade"]}')

        # Create assessment types
        assessment_types_data = [
            {'name': 'Continuous Assessment', 'code': 'CA', 'weight_percentage': 30},
            {'name': 'Examination', 'code': 'EXAM', 'weight_percentage': 70},
        ]

        for at_data in assessment_types_data:
            at, created = AssessmentType.objects.get_or_create(
                name=at_data['name'],
                defaults=at_data
            )
            if created:
                self.stdout.write(f'Created assessment type {at_data["name"]}')

        # Get or create academic session
        academic_session, created = AcademicSession.objects.get_or_create(
            name="2023/2024",
            defaults={
                'start_date': date(2023, 9, 1),
                'end_date': date(2024, 7, 31),
                'is_active': True
            }
        )

        # Create exam sessions
        exam_sessions_data = [
            {
                'name': 'First Term Examination',
                'exam_type': 'FINAL_EXAM',
                'term': 'FIRST',
                'start_date': date(2023, 12, 1),
                'end_date': date(2023, 12, 15),
                'is_published': True
            },
            {
                'name': 'Second Term Examination',
                'exam_type': 'FINAL_EXAM',
                'term': 'SECOND',
                'start_date': date(2024, 3, 1),
                'end_date': date(2024, 3, 15),
                'is_published': True
            },
            {
                'name': 'Third Term Examination',
                'exam_type': 'FINAL_EXAM',
                'term': 'THIRD',
                'start_date': date(2024, 6, 1),
                'end_date': date(2024, 6, 15),
                'is_published': True
            }
        ]

        for es_data in exam_sessions_data:
            exam_session, created = ExamSession.objects.get_or_create(
                name=es_data['name'],
                academic_session=academic_session,
                defaults=es_data
            )
            if created:
                self.stdout.write(f'Created exam session {es_data["name"]}')

        # Get some students and subjects for sample data
        students = Student.objects.all()[:5]  # Get first 5 students
        subjects = Subject.objects.all()[:8]  # Get first 8 subjects

        if not students.exists():
            self.stdout.write('No students found. Please create students first.')
            return

        if not subjects.exists():
            self.stdout.write('No subjects found. Please create subjects first.')
            return

        # Create sample student results
        for student in students:
            for subject in subjects:
                for exam_session in ExamSession.objects.all():
                    # Create student result
                    ca_score = Decimal('25.0')  # Sample CA score
                    exam_score = Decimal('65.0')  # Sample exam score
                    total_score = ca_score + exam_score
                    
                    student_result, created = StudentResult.objects.get_or_create(
                        student=student,
                        subject=subject,
                        exam_session=exam_session,
                        defaults={
                            'grading_system': grading_system,
                            'ca_score': ca_score,
                            'exam_score': exam_score,
                            'total_score': total_score,
                            'percentage': (total_score / 100) * 100,
                            'grade': 'B',
                            'grade_point': Decimal('3.0'),
                            'is_passed': True,
                            'position': 5,
                            'remarks': 'Good performance',
                            'status': 'APPROVED'
                        }
                    )
                    
                    if created:
                        self.stdout.write(f'Created result for {student.full_name} - {subject.name}')

        # Create sample term results
        for student in students:
            for exam_session in ExamSession.objects.all():
                # Calculate term statistics
                student_results = StudentResult.objects.filter(
                    student=student,
                    exam_session=exam_session
                )
                
                if student_results.exists():
                    total_subjects = student_results.count()
                    subjects_passed = student_results.filter(is_passed=True).count()
                    total_score = sum(result.total_score for result in student_results)
                    average_score = total_score / total_subjects if total_subjects > 0 else 0
                    
                    term_result, created = StudentTermResult.objects.get_or_create(
                        student=student,
                        academic_session=academic_session,
                        term=exam_session.term,
                        defaults={
                            'total_subjects': total_subjects,
                            'subjects_passed': subjects_passed,
                            'subjects_failed': total_subjects - subjects_passed,
                            'total_score': total_score,
                            'average_score': average_score,
                            'gpa': Decimal('3.0'),
                            'class_position': 5,
                            'total_students': 30,
                            'status': 'APPROVED',
                            'remarks': 'Good academic performance',
                            'next_term_begins': date(2024, 9, 1)
                        }
                    )
                    
                    if created:
                        self.stdout.write(f'Created term result for {student.full_name} - {exam_session.term}')

        self.stdout.write(
            self.style.SUCCESS('Successfully set up result data')
        ) 