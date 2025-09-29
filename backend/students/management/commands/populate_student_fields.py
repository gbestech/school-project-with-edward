from django.core.management.base import BaseCommand
from students.models import Student
from django.db import transaction

class Command(BaseCommand):
    help = 'Populate missing fields for existing students'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be updated without making changes',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        
        # Get all students that might have missing fields
        students = Student.objects.all()
        
        updated_count = 0
        
        with transaction.atomic():
            for student in students:
                updated = False
                
                # Set default values for missing fields
                if not student.blood_group:
                    student.blood_group = ''
                    updated = True
                    
                if not student.place_of_birth:
                    student.place_of_birth = ''
                    updated = True
                    
                if not student.address:
                    student.address = ''
                    updated = True
                    
                if not student.phone_number:
                    student.phone_number = ''
                    updated = True
                    
                if not student.payment_method:
                    student.payment_method = ''
                    updated = True
                
                if updated:
                    if not dry_run:
                        student.save()
                    updated_count += 1
                    self.stdout.write(
                        self.style.SUCCESS(
                            f'{"Would update" if dry_run else "Updated"} student: {student.full_name} (ID: {student.id})'
                        )
                    )
        
        if dry_run:
            self.stdout.write(
                self.style.WARNING(f'Dry run complete. Would update {updated_count} students.')
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(f'Successfully updated {updated_count} students.')
            )
