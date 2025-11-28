"""
Django management command to set up school settings.

Save this file as: backend/schoolSettings/management/commands/setup_school.py

Usage: python manage.py setup_school
"""

from django.core.management.base import BaseCommand
from schoolSettings.models import SchoolSettings


class Command(BaseCommand):
    help = 'Set up or update school settings including school code'

    def add_arguments(self, parser):
        parser.add_argument(
            '--school-name',
            type=str,
            help='Name of the school',
        )
        parser.add_argument(
            '--school-code',
            type=str,
            help='School code (e.g., AIS, GTS, etc.)',
        )
        parser.add_argument(
            '--address',
            type=str,
            help='School address',
        )
        parser.add_argument(
            '--phone',
            type=str,
            help='School phone number',
        )
        parser.add_argument(
            '--email',
            type=str,
            help='School email',
        )

    def handle(self, *args, **options):
        # Check if school settings already exist
        settings = SchoolSettings.objects.first()
        
        if settings:
            self.stdout.write(self.style.WARNING('School settings already exist. Updating...'))
            action = 'Updated'
        else:
            self.stdout.write(self.style.SUCCESS('Creating new school settings...'))
            settings = SchoolSettings()
            action = 'Created'

        # Get values from options or prompt user
        school_name = options.get('school_name')
        if not school_name:
            school_name = input('Enter school name: ').strip()
        
        school_code = options.get('school_code')
        if not school_code:
            school_code = input('Enter school code (e.g., AIS, GTS) [default: SCH]: ').strip() or 'SCH'
        
        address = options.get('address')
        if not address:
            address = input('Enter school address (optional): ').strip() or ''
        
        phone = options.get('phone')
        if not phone:
            phone = input('Enter school phone (optional): ').strip() or ''
        
        email = options.get('email')
        if not email:
            email = input('Enter school email (optional): ').strip() or ''

        # Update settings
        settings.school_name = school_name
        settings.school_code = school_code.upper().strip()
        
        # Only update optional fields if provided
        if address:
            settings.address = address
        if phone:
            settings.phone = phone
        if email:
            settings.email = email
        
        # Set default site_name if not set
        if not settings.site_name:
            settings.site_name = school_name
        
        settings.save()

        # Display results
        self.stdout.write(self.style.SUCCESS('\n' + '='*60))
        self.stdout.write(self.style.SUCCESS(f'SCHOOL SETTINGS {action.upper()} SUCCESSFULLY!'))
        self.stdout.write(self.style.SUCCESS('='*60))
        self.stdout.write(self.style.SUCCESS(f'School Name: {settings.school_name}'))
        self.stdout.write(self.style.SUCCESS(f'School Code: {settings.school_code}'))
        if settings.address:
            self.stdout.write(self.style.SUCCESS(f'Address:     {settings.address}'))
        if settings.phone:
            self.stdout.write(self.style.SUCCESS(f'Phone:       {settings.phone}'))
        if settings.email:
            self.stdout.write(self.style.SUCCESS(f'Email:       {settings.email}'))
        self.stdout.write(self.style.SUCCESS('='*60))
        self.stdout.write(self.style.WARNING(f'\n✅ All new usernames will use code: {settings.school_code}\n'))