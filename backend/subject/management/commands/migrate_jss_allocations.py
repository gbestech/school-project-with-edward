from django.core.management.base import BaseCommand
from classroom.models import ClassroomTeacherAssignment
from teacher.models import TeacherAssignment
from subject.models import Subject


class Command(BaseCommand):
    help = 'Migrate existing Junior Secondary allocations from parent subjects to component subjects'

    def handle(self, *args, **options):
        self.stdout.write('Starting migration of Junior Secondary allocations...')
        
        # Get existing allocations for parent subjects
        nat_allocations = ClassroomTeacherAssignment.objects.filter(
            subject__name__icontains='National values',
            classroom__section__grade_level__name__startswith='JSS'
        )
        
        pvs_allocations = ClassroomTeacherAssignment.objects.filter(
            subject__name__icontains='Pre-Vocational Studies',
            classroom__section__grade_level__name__startswith='JSS'
        )
        
        self.stdout.write(f'Found {nat_allocations.count()} National Values allocations')
        self.stdout.write(f'Found {pvs_allocations.count()} Pre-Vocational Studies allocations')
        
        # Migrate National Values allocations
        if nat_allocations.exists():
            self.stdout.write('Migrating National Values allocations...')
            nat_parent = Subject.objects.get(code='NV-JSS')
            nat_components = nat_parent.component_subjects.all()
            
            for allocation in nat_allocations:
                self.stdout.write(f'  Migrating: {allocation.classroom.name} - {allocation.teacher.user.full_name}')
                
                for component in nat_components:
                    # Check if allocation already exists
                    existing = ClassroomTeacherAssignment.objects.filter(
                        classroom=allocation.classroom,
                        teacher=allocation.teacher,
                        subject=component
                    ).exists()
                    
                    if not existing:
                        new_allocation = ClassroomTeacherAssignment.objects.create(
                            classroom=allocation.classroom,
                            teacher=allocation.teacher,
                            subject=component,
                            assigned_date=allocation.assigned_date,
                            is_active=True
                        )
                        self.stdout.write(f'    Created: {component.name}')
                    else:
                        self.stdout.write(f'    Skipped: {component.name} (already exists)')
        
        # Migrate Pre-Vocational Studies allocations
        if pvs_allocations.exists():
            self.stdout.write('Migrating Pre-Vocational Studies allocations...')
            pvs_parent = Subject.objects.get(code='PVS-JSS')
            pvs_components = pvs_parent.component_subjects.all()
            
            for allocation in pvs_allocations:
                self.stdout.write(f'  Migrating: {allocation.classroom.name} - {allocation.teacher.user.full_name}')
                
                for component in pvs_components:
                    # Check if allocation already exists
                    existing = ClassroomTeacherAssignment.objects.filter(
                        classroom=allocation.classroom,
                        teacher=allocation.teacher,
                        subject=component
                    ).exists()
                    
                    if not existing:
                        new_allocation = ClassroomTeacherAssignment.objects.create(
                            classroom=allocation.classroom,
                            teacher=allocation.teacher,
                            subject=component,
                            assigned_date=allocation.assigned_date,
                            is_active=True
                        )
                        self.stdout.write(f'    Created: {component.name}')
                    else:
                        self.stdout.write(f'    Skipped: {component.name} (already exists)')
        
        # Also migrate TeacherAssignment records
        nat_teacher_assignments = TeacherAssignment.objects.filter(
            subject__name__icontains='National values',
            grade_level__name__startswith='JSS'
        )
        
        pvs_teacher_assignments = TeacherAssignment.objects.filter(
            subject__name__icontains='Pre-Vocational Studies',
            grade_level__name__startswith='JSS'
        )
        
        self.stdout.write(f'Found {nat_teacher_assignments.count()} National Values teacher assignments')
        self.stdout.write(f'Found {pvs_teacher_assignments.count()} Pre-Vocational Studies teacher assignments')
        
        # Migrate National Values teacher assignments
        if nat_teacher_assignments.exists():
            self.stdout.write('Migrating National Values teacher assignments...')
            nat_parent = Subject.objects.get(code='NV-JSS')
            nat_components = nat_parent.component_subjects.all()
            
            for assignment in nat_teacher_assignments:
                self.stdout.write(f'  Migrating: {assignment.teacher.user.full_name} - {assignment.grade_level.name}')
                
                for component in nat_components:
                    # Check if assignment already exists
                    existing = TeacherAssignment.objects.filter(
                        teacher=assignment.teacher,
                        grade_level=assignment.grade_level,
                        section=assignment.section,
                        subject=component
                    ).exists()
                    
                    if not existing:
                        new_assignment = TeacherAssignment.objects.create(
                            teacher=assignment.teacher,
                            grade_level=assignment.grade_level,
                            section=assignment.section,
                            subject=component
                        )
                        self.stdout.write(f'    Created: {component.name}')
                    else:
                        self.stdout.write(f'    Skipped: {component.name} (already exists)')
        
        # Migrate Pre-Vocational Studies teacher assignments
        if pvs_teacher_assignments.exists():
            self.stdout.write('Migrating Pre-Vocational Studies teacher assignments...')
            pvs_parent = Subject.objects.get(code='PVS-JSS')
            pvs_components = pvs_parent.component_subjects.all()
            
            for assignment in pvs_teacher_assignments:
                self.stdout.write(f'  Migrating: {assignment.teacher.user.full_name} - {assignment.grade_level.name}')
                
                for component in pvs_components:
                    # Check if assignment already exists
                    existing = TeacherAssignment.objects.filter(
                        teacher=assignment.teacher,
                        grade_level=assignment.grade_level,
                        section=assignment.section,
                        subject=component
                    ).exists()
                    
                    if not existing:
                        new_assignment = TeacherAssignment.objects.create(
                            teacher=assignment.teacher,
                            grade_level=assignment.grade_level,
                            section=assignment.section,
                            subject=component
                        )
                        self.stdout.write(f'    Created: {component.name}')
                    else:
                        self.stdout.write(f'    Skipped: {component.name} (already exists)')
        
        self.stdout.write(self.style.SUCCESS('Migration completed successfully!'))
        
        # Summary
        total_nat_components = Subject.objects.filter(parent_subject__code='NV-JSS').count()
        total_pvs_components = Subject.objects.filter(parent_subject__code='PVS-JSS').count()
        
        self.stdout.write(f'\nSummary:')
        self.stdout.write(f'- National Values: {nat_allocations.count()} allocations × {total_nat_components} components')
        self.stdout.write(f'- Pre-Vocational Studies: {pvs_allocations.count()} allocations × {total_pvs_components} components')
        self.stdout.write(f'- Teacher Assignments: {nat_teacher_assignments.count() + pvs_teacher_assignments.count()} assignments migrated')




