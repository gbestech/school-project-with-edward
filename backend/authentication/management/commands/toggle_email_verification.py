from django.core.management.base import BaseCommand
from django.conf import settings
import os
import re

class Command(BaseCommand):
    help = 'Toggle email verification on/off'

    def add_arguments(self, parser):
        parser.add_argument(
            'action',
            type=str,
            choices=['on', 'off', 'status'],
            help='Turn email verification on, off, or check status'
        )

    def handle(self, *args, **options):
        action = options['action']
        
        if action == 'status':
            status = settings.ACCOUNT_EMAIL_VERIFICATION
            self.stdout.write(
                self.style.SUCCESS(f'📧 Email verification is currently: {status}')
            )
            return
        
        settings_file = os.path.join(settings.BASE_DIR, 'config', 'settings.py')
        
        with open(settings_file, 'r') as f:
            content = f.read()
        
        if action == 'off':
            # Change "mandatory" to "none"
            content = re.sub(
                r'ACCOUNT_EMAIL_VERIFICATION = ["\']mandatory["\']',
                'ACCOUNT_EMAIL_VERIFICATION = "none"',
                content
            )
            self.stdout.write(self.style.SUCCESS('✅ Email verification DISABLED'))
            self.stdout.write(self.style.WARNING('⚠️  Remember to turn it back on!'))
        
        elif action == 'on':
            # Change "none" to "mandatory"
            content = re.sub(
                r'ACCOUNT_EMAIL_VERIFICATION = ["\']none["\']',
                'ACCOUNT_EMAIL_VERIFICATION = "mandatory"',
                content
            )
            self.stdout.write(self.style.SUCCESS('✅ Email verification ENABLED'))
        
        with open(settings_file, 'w') as f:
            f.write(content)
        
        self.stdout.write(
            self.style.WARNING('⚠️  You need to restart the server for changes to take effect')
        )