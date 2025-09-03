from django.core.management.base import BaseCommand
from result.models import AssessmentType


class Command(BaseCommand):
    help = 'Set up education level-specific assessment types'

    def handle(self, *args, **options):
        self.stdout.write('Setting up education level-specific assessment types...')
        
        # Clear existing assessment types
        AssessmentType.objects.all().delete()
        
        # Senior Secondary Assessment Types
        senior_secondary_types = [
            {
                'name': 'Test 1 (CA 1)',
                'code': 'SS_TEST1',
                'description': 'First test/Continuous Assessment 1 for Senior Secondary',
                'education_level': 'SENIOR_SECONDARY',
                'max_score': 10,
                'weight_percentage': 10
            },
            {
                'name': 'Test 2',
                'code': 'SS_TEST2',
                'description': 'Second test for Senior Secondary',
                'education_level': 'SENIOR_SECONDARY',
                'max_score': 10,
                'weight_percentage': 10
            },
            {
                'name': 'Test 3',
                'code': 'SS_TEST3',
                'description': 'Third test for Senior Secondary',
                'education_level': 'SENIOR_SECONDARY',
                'max_score': 10,
                'weight_percentage': 10
            },
            {
                'name': 'Final Exam',
                'code': 'SS_EXAM',
                'description': 'Final examination for Senior Secondary',
                'education_level': 'SENIOR_SECONDARY',
                'max_score': 70,
                'weight_percentage': 70
            }
        ]
        
        # Primary Assessment Types
        primary_types = [
            {
                'name': 'Primary - Continuous Assessment',
                'code': 'PRI_CA',
                'description': 'Continuous Assessment for Primary',
                'education_level': 'PRIMARY',
                'max_score': 15,
                'weight_percentage': 15
            },
            {
                'name': 'Primary - Take Home Test',
                'code': 'PRI_THT',
                'description': 'Take Home Test for Primary',
                'education_level': 'PRIMARY',
                'max_score': 5,
                'weight_percentage': 5
            },
            {
                'name': 'Primary - Appearance',
                'code': 'PRI_APP',
                'description': 'Appearance assessment for Primary',
                'education_level': 'PRIMARY',
                'max_score': 5,
                'weight_percentage': 5
            },
            {
                'name': 'Primary - Practical',
                'code': 'PRI_PRA',
                'description': 'Practical assessment for Primary',
                'education_level': 'PRIMARY',
                'max_score': 5,
                'weight_percentage': 5
            },
            {
                'name': 'Primary - Project',
                'code': 'PRI_PRO',
                'description': 'Project assessment for Primary',
                'education_level': 'PRIMARY',
                'max_score': 5,
                'weight_percentage': 5
            },
            {
                'name': 'Primary - Note Copying',
                'code': 'PRI_NC',
                'description': 'Note Copying assessment for Primary',
                'education_level': 'PRIMARY',
                'max_score': 5,
                'weight_percentage': 5
            },
            {
                'name': 'Primary - Final Exam',
                'code': 'PRI_EXAM',
                'description': 'Final examination for Primary',
                'education_level': 'PRIMARY',
                'max_score': 60,
                'weight_percentage': 60
            }
        ]
        
        # Junior Secondary Assessment Types
        junior_secondary_types = [
            {
                'name': 'Junior Secondary - Continuous Assessment',
                'code': 'JS_CA',
                'description': 'Continuous Assessment for Junior Secondary',
                'education_level': 'JUNIOR_SECONDARY',
                'max_score': 15,
                'weight_percentage': 15
            },
            {
                'name': 'Junior Secondary - Take Home Test',
                'code': 'JS_THT',
                'description': 'Take Home Test for Junior Secondary',
                'education_level': 'JUNIOR_SECONDARY',
                'max_score': 5,
                'weight_percentage': 5
            },
            {
                'name': 'Junior Secondary - Appearance',
                'code': 'JS_APP',
                'description': 'Appearance assessment for Junior Secondary',
                'education_level': 'JUNIOR_SECONDARY',
                'max_score': 5,
                'weight_percentage': 5
            },
            {
                'name': 'Junior Secondary - Practical',
                'code': 'JS_PRA',
                'description': 'Practical assessment for Junior Secondary',
                'education_level': 'JUNIOR_SECONDARY',
                'max_score': 5,
                'weight_percentage': 5
            },
            {
                'name': 'Junior Secondary - Project',
                'code': 'JS_PRO',
                'description': 'Project assessment for Junior Secondary',
                'education_level': 'JUNIOR_SECONDARY',
                'max_score': 5,
                'weight_percentage': 5
            },
            {
                'name': 'Junior Secondary - Note Copying',
                'code': 'JS_NC',
                'description': 'Note Copying assessment for Junior Secondary',
                'education_level': 'JUNIOR_SECONDARY',
                'max_score': 5,
                'weight_percentage': 5
            },
            {
                'name': 'Junior Secondary - Final Exam',
                'code': 'JS_EXAM',
                'description': 'Final examination for Junior Secondary',
                'education_level': 'JUNIOR_SECONDARY',
                'max_score': 60,
                'weight_percentage': 60
            }
        ]
        
        # Nursery Assessment Types
        nursery_types = [
            {
                'name': 'Total Score',
                'code': 'NUR_TOTAL',
                'description': 'Total score for Nursery activities and assessments',
                'education_level': 'NURSERY',
                'max_score': 100,
                'weight_percentage': 100
            }
        ]
        
        # Create all assessment types
        all_types = senior_secondary_types + primary_types + junior_secondary_types + nursery_types
        
        created_count = 0
        for type_data in all_types:
            assessment_type, created = AssessmentType.objects.get_or_create(
                code=type_data['code'],
                defaults=type_data
            )
            if created:
                created_count += 1
                self.stdout.write(f"Created: {assessment_type.name} ({assessment_type.education_level})")
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully set up {created_count} assessment types!'
            )
        )
