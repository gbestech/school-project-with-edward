from django.core.management.base import BaseCommand
from teacher.models import Teacher, TeacherAssignment
from subject.models import Subject
from classroom.models import GradeLevel, Section
from users.models import CustomUser
from django.db import transaction


class Command(BaseCommand):
    help = 'Set up sample teacher assignments for testing teacher filtering'

    def handle(self, *args, **options):
        self.stdout.write('👨‍🏫 Setting up teacher assignments...')
        
        with transaction.atomic():
            # Step 1: Create sample teachers if they don't exist
            self.stdout.write('Step 1: Creating sample teachers...')
            
            teachers_data = [
                {
                    'email': 'science.teacher@school.com',
                    'first_name': 'John',
                    'last_name': 'Smith',
                    'employee_id': 'T001',
                    'specialization': 'Science',
                    'level': 'primary'
                },
                {
                    'email': 'math.teacher@school.com',
                    'first_name': 'Sarah',
                    'last_name': 'Johnson',
                    'employee_id': 'T002',
                    'specialization': 'Mathematics',
                    'level': 'primary'
                },
                {
                    'email': 'english.teacher@school.com',
                    'first_name': 'Michael',
                    'last_name': 'Brown',
                    'employee_id': 'T003',
                    'specialization': 'English',
                    'level': 'primary'
                },
                {
                    'email': 'nursery.teacher@school.com',
                    'first_name': 'Emily',
                    'last_name': 'Davis',
                    'employee_id': 'T004',
                    'specialization': 'Early Childhood',
                    'level': 'nursery'
                },
                {
                    'email': 'jss.science@school.com',
                    'first_name': 'David',
                    'last_name': 'Wilson',
                    'employee_id': 'T005',
                    'specialization': 'Integrated Science',
                    'level': 'junior_secondary'
                }
            ]
            
            created_teachers = []
            for teacher_data in teachers_data:
                user, created = CustomUser.objects.get_or_create(
                    email=teacher_data['email'],
                    defaults={
                        'first_name': teacher_data['first_name'],
                        'last_name': teacher_data['last_name'],
                        'role': 'teacher',
                        'is_active': True
                    }
                )
                
                if created:
                    self.stdout.write(f'  ✅ Created user: {user.full_name}')
                
                teacher, created = Teacher.objects.get_or_create(
                    user=user,
                    defaults={
                        'employee_id': teacher_data['employee_id'],
                        'specialization': teacher_data['specialization'],
                        'level': teacher_data['level'],
                        'is_active': True
                    }
                )
                
                if created:
                    self.stdout.write(f'  ✅ Created teacher: {teacher.user.full_name} ({teacher.specialization})')
                else:
                    # Update existing teacher
                    teacher.specialization = teacher_data['specialization']
                    teacher.level = teacher_data['level']
                    teacher.save()
                    self.stdout.write(f'  🔄 Updated teacher: {teacher.user.full_name} ({teacher.specialization})')
                
                created_teachers.append(teacher)
            
            # Step 2: Get or create grade levels and sections
            self.stdout.write('\nStep 2: Setting up grade levels and sections...')
            
            # Create grade levels if they don't exist
            grade_levels_data = [
                {'name': 'Nursery 1', 'level': 'NURSERY'},
                {'name': 'Nursery 2', 'level': 'NURSERY'},
                {'name': 'Primary 1', 'level': 'PRIMARY'},
                {'name': 'Primary 2', 'level': 'PRIMARY'},
                {'name': 'Primary 3', 'level': 'PRIMARY'},
                {'name': 'JSS 1', 'level': 'JUNIOR_SECONDARY'},
                {'name': 'JSS 2', 'level': 'JUNIOR_SECONDARY'},
                {'name': 'JSS 3', 'level': 'JUNIOR_SECONDARY'},
            ]
            
            grade_levels = {}
            for grade_data in grade_levels_data:
                grade_level, created = GradeLevel.objects.get_or_create(
                    name=grade_data['name'],
                    defaults={'level': grade_data['level']}
                )
                grade_levels[grade_data['name']] = grade_level
                if created:
                    self.stdout.write(f'  ✅ Created grade level: {grade_level.name}')
            
            # Create sections if they don't exist
            sections_data = [
                {'name': 'Section A'},
                {'name': 'Section B'},
                {'name': 'Section C'},
            ]
            
            sections = {}
            for section_data in sections_data:
                section, created = Section.objects.get_or_create(
                    name=section_data['name']
                )
                sections[section_data['name']] = section
                if created:
                    self.stdout.write(f'  ✅ Created section: {section.name}')
            
            # Step 3: Create teacher assignments
            self.stdout.write('\nStep 3: Creating teacher assignments...')
            
            # Get subjects
            subjects = Subject.objects.filter(is_active=True)
            
            # Create assignments based on teacher specialization
            assignments_data = [
                # Science teacher assignments
                {
                    'teacher_email': 'science.teacher@school.com',
                    'subjects': ['Basic Science and Technology'],
                    'grade_levels': ['Primary 1', 'Primary 2', 'Primary 3'],
                    'sections': ['Section A', 'Section B']
                },
                # Math teacher assignments
                {
                    'teacher_email': 'math.teacher@school.com',
                    'subjects': ['Mathematics'],
                    'grade_levels': ['Primary 1', 'Primary 2', 'Primary 3'],
                    'sections': ['Section A', 'Section B', 'Section C']
                },
                # English teacher assignments
                {
                    'teacher_email': 'english.teacher@school.com',
                    'subjects': ['English Language'],
                    'grade_levels': ['Primary 1', 'Primary 2', 'Primary 3'],
                    'sections': ['Section A', 'Section B', 'Section C']
                },
                # Nursery teacher assignments
                {
                    'teacher_email': 'nursery.teacher@school.com',
                    'subjects': ['Basic Science', 'Play Activities', 'Early Learning', 'Creative Arts'],
                    'grade_levels': ['Nursery 1', 'Nursery 2'],
                    'sections': ['Section A', 'Section B']
                },
                # JSS Science teacher assignments
                {
                    'teacher_email': 'jss.science@school.com',
                    'subjects': ['Basic Science and Technology', 'Basic Technology'],
                    'grade_levels': ['JSS 1', 'JSS 2', 'JSS 3'],
                    'sections': ['Section A', 'Section B']
                }
            ]
            
            created_assignments = 0
            for assignment_data in assignments_data:
                teacher = Teacher.objects.get(user__email=assignment_data['teacher_email'])
                
                for subject_name in assignment_data['subjects']:
                    subject = subjects.filter(name__icontains=subject_name).first()
                    if not subject:
                        self.stdout.write(f'  ⚠️ Subject not found: {subject_name}')
                        continue
                    
                    for grade_name in assignment_data['grade_levels']:
                        grade_level = grade_levels.get(grade_name)
                        if not grade_level:
                            self.stdout.write(f'  ⚠️ Grade level not found: {grade_name}')
                            continue
                        
                        for section_name in assignment_data['sections']:
                            section = sections.get(section_name)
                            if not section:
                                self.stdout.write(f'  ⚠️ Section not found: {section_name}')
                                continue
                            
                            assignment, created = TeacherAssignment.objects.get_or_create(
                                teacher=teacher,
                                grade_level=grade_level,
                                section=section,
                                subject=subject
                            )
                            
                            if created:
                                created_assignments += 1
                                self.stdout.write(f'  ✅ Created assignment: {teacher.user.full_name} -> {subject.name} ({grade_level.name} {section.name})')
            
            # Step 4: Display summary
            self.stdout.write('\nStep 4: Assignment summary...')
            
            total_teachers = Teacher.objects.count()
            total_assignments = TeacherAssignment.objects.count()
            total_subjects = Subject.objects.filter(is_active=True).count()
            
            self.stdout.write(f'\n📊 Summary:')
            self.stdout.write(f'  • Total Teachers: {total_teachers}')
            self.stdout.write(f'  • Total Assignments: {total_assignments}')
            self.stdout.write(f'  • Total Active Subjects: {total_subjects}')
            self.stdout.write(f'  • New Assignments Created: {created_assignments}')
            
            # Display assignments by teacher
            self.stdout.write(f'\n👨‍🏫 Assignments by Teacher:')
            for teacher in Teacher.objects.all():
                teacher_assignments = TeacherAssignment.objects.filter(teacher=teacher)
                self.stdout.write(f'  • {teacher.user.full_name} ({teacher.specialization}): {teacher_assignments.count()} assignments')
                
                # Show subject details
                subjects_taught = teacher_assignments.values_list('subject__name', flat=True).distinct()
                if subjects_taught:
                    self.stdout.write(f'    Subjects: {", ".join(subjects_taught)}')
            
            self.stdout.write('\n✅ Teacher assignments setup completed!')
            self.stdout.write('\n🔗 API Endpoints for testing:')
            self.stdout.write('  • GET /api/subjects/?teacher_id=<teacher_id>')
            self.stdout.write('  • GET /api/subjects/?teacher_specialization=<specialization>')
            self.stdout.write('  • GET /api/subjects/by_teacher/?teacher_id=<teacher_id>')
            self.stdout.write('  • GET /api/subjects/by_teacher/?teacher_specialization=<specialization>')
