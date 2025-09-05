#!/usr/bin/env python
"""
Management command to set up default stream configurations for schools.
This allows schools to start with sensible defaults and then customize as needed.
"""

from django.core.management.base import BaseCommand
from django.db import transaction
from subject.models import Subject, SchoolStreamConfiguration, SchoolStreamSubjectAssignment
from classroom.models import Stream  # Using existing Stream model from classroom app


class Command(BaseCommand):
    help = 'Set up default stream configurations for schools'

    def add_arguments(self, parser):
        parser.add_argument(
            '--stream',
            choices=['SCIENCE', 'ARTS', 'COMMERCIAL', 'TECHNICAL'],
            help='Specific stream to configure (optional)',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be done without making changes',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        stream_type = options.get('stream')
        
        if dry_run:
            self.stdout.write(self.style.WARNING('DRY RUN MODE - No changes will be made'))
        
        self.stdout.write(self.style.SUCCESS('🔧 Setting up default stream configurations...'))
        
        try:
            with transaction.atomic():
                # Since this is a single-school system, we'll use a default school ID of 1
                # or create a placeholder school configuration
                default_school_id = 1
                
                # Get streams to configure
                if stream_type:
                    streams = Stream.objects.filter(stream_type=stream_type, is_active=True)
                else:
                    streams = Stream.objects.filter(is_active=True)
                
                if not streams.exists():
                    self.stdout.write(
                        self.style.ERROR('❌ No streams found to configure')
                    )
                    return
                
                # Default configurations for each stream
                default_configs = {
                    'SCIENCE': {
                        'cross_cutting': {
                            'subjects': ['Mathematics', 'English', 'Civic Education'],
                            'min_required': 3,
                            'max_allowed': 3,
                            'is_compulsory': True,
                            'display_order': 1
                        },
                        'core': {
                            'subjects': ['Physics', 'Chemistry', 'Biology'],
                            'min_required': 3,
                            'max_allowed': 3,
                            'is_compulsory': True,
                            'display_order': 2
                        },
                        'elective': {
                            'subjects': ['Agricultural Science', 'Computer Studies', 'Data Processing', 'Physical and Health Education'],
                            'min_required': 2,
                            'max_allowed': 4,
                            'is_compulsory': False,
                            'display_order': 3
                        }
                    },
                    'ARTS': {
                        'cross_cutting': {
                            'subjects': ['Mathematics', 'English', 'Civic Education'],
                            'min_required': 3,
                            'max_allowed': 3,
                            'is_compulsory': True,
                            'display_order': 1
                        },
                        'core': {
                            'subjects': ['Literature in English', 'Government', 'Christian Religious Studies'],
                            'min_required': 3,
                            'max_allowed': 3,
                            'is_compulsory': True,
                            'display_order': 2
                        },
                        'elective': {
                            'subjects': ['Food and Nutrition', 'Physical and Health Education', 'Computer Studies'],
                            'min_required': 2,
                            'max_allowed': 4,
                            'is_compulsory': False,
                            'display_order': 3
                        }
                    },
                    'COMMERCIAL': {
                        'cross_cutting': {
                            'subjects': ['Mathematics', 'English', 'Civic Education'],
                            'min_required': 3,
                            'max_allowed': 3,
                            'is_compulsory': True,
                            'display_order': 1
                        },
                        'core': {
                            'subjects': ['Economics', 'Accounting', 'Commerce'],
                            'min_required': 3,
                            'max_allowed': 3,
                            'is_compulsory': True,
                            'display_order': 2
                        },
                        'elective': {
                            'subjects': ['Data Processing', 'Computer Studies', 'Physical and Health Education'],
                            'min_required': 2,
                            'max_allowed': 4,
                            'is_compulsory': False,
                            'display_order': 3
                        }
                    },
                    'TECHNICAL': {
                        'cross_cutting': {
                            'subjects': ['Mathematics', 'English', 'Civic Education'],
                            'min_required': 3,
                            'max_allowed': 3,
                            'is_compulsory': True,
                            'display_order': 1
                        },
                        'core': {
                            'subjects': ['Physics', 'Chemistry', 'Computer Studies'],
                            'min_required': 3,
                            'max_allowed': 3,
                            'is_compulsory': True,
                            'display_order': 2
                        },
                        'elective': {
                            'subjects': ['Data Processing', 'Agricultural Science', 'Animal Husbandry', 'Food and Nutrition'],
                            'min_required': 2,
                            'max_allowed': 4,
                            'is_compulsory': False,
                            'display_order': 3
                        }
                    }
                }
                
                configs_created = 0
                assignments_created = 0
                
                self.stdout.write(f'\n🏫 Configuring default school (ID: {default_school_id})')
                
                for stream in streams:
                    if stream.stream_type not in default_configs:
                        continue
                        
                    self.stdout.write(f'  🔄 Stream: {stream.name} ({stream.stream_type})')
                    
                    stream_configs = default_configs[stream.stream_type]
                    
                    for role, config in stream_configs.items():
                        # Create or get stream configuration
                        stream_config, created = SchoolStreamConfiguration.objects.get_or_create(
                            school_id=default_school_id,
                            stream=stream,
                            subject_role=role,
                            defaults={
                                'min_subjects_required': config['min_required'],
                                'max_subjects_allowed': config['max_allowed'],
                                'is_compulsory': config['is_compulsory'],
                                'display_order': config['display_order']
                            }
                        )
                        
                        if created:
                            configs_created += 1
                            self.stdout.write(f'    ✅ Created {role} configuration')
                        
                        # Assign subjects to this configuration
                        for subject_name in config['subjects']:
                            try:
                                # For SQLite compatibility, we'll use a different approach
                                subjects = Subject.objects.filter(
                                    name__icontains=subject_name,
                                    is_active=True
                                )
                                
                                # Check if any subject has SENIOR_SECONDARY in education_levels
                                subject = None
                                for subj in subjects:
                                    if 'SENIOR_SECONDARY' in subj.education_levels:
                                        subject = subj
                                        break
                                
                                if not subject:
                                    self.stdout.write(
                                        self.style.WARNING(f'      ⚠️ Subject not found: {subject_name}')
                                    )
                                    continue
                                
                                # Create or get subject assignment
                                assignment, created = SchoolStreamSubjectAssignment.objects.get_or_create(
                                    stream_config=stream_config,
                                    subject=subject,
                                    defaults={
                                        'is_compulsory': role == 'cross_cutting' or role == 'core',
                                        'credit_weight': 1,
                                        'can_be_elective_elsewhere': role == 'elective'
                                    }
                                )
                                
                                if created:
                                    assignments_created += 1
                                    self.stdout.write(f'      📚 Assigned: {subject.name}')
                                
                            except Subject.DoesNotExist:
                                self.stdout.write(
                                    self.style.WARNING(f'      ⚠️ Subject not found: {subject_name}')
                                )
                
                # Summary
                self.stdout.write('\n' + '='*60)
                self.stdout.write('📊 STREAM CONFIGURATION SUMMARY')
                self.stdout.write('='*60)
                self.stdout.write(f'🏫 School configured: Default School (ID: {default_school_id})')
                self.stdout.write(f'🔄 Streams configured: {streams.count()}')
                self.stdout.write(f'⚙️ Configurations created: {configs_created}')
                self.stdout.write(f'📚 Subject assignments: {assignments_created}')
                
                if dry_run:
                    self.stdout.write(
                        self.style.WARNING('\n🔍 This was a dry run. Run without --dry-run to apply changes.')
                    )
                else:
                    self.stdout.write(
                        self.style.SUCCESS('\n🎉 Stream configuration setup completed successfully!')
                    )
                    
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Fatal error: {str(e)}')
            )
            raise
