from django.core.management.base import BaseCommand
from users.models import CustomUser
from utils import generate_unique_username
from django.utils import timezone

class Command(BaseCommand):
    help = 'Test username generation and conflict scenarios'

    def handle(self, *args, **options):
        self.stdout.write('Testing username generation and conflicts...')
        
        # Test 1: Create a student with registration number
        registration_number = "2024-001"
        username1 = generate_unique_username("student", registration_number)
        self.stdout.write(f'Generated username for registration {registration_number}: {username1}')
        
        # Create the user to simulate existing user
        user1 = CustomUser.objects.create(
            email=f"student1@test.com",
            username=username1,
            first_name="John",
            last_name="Doe",
            role="student",
            is_active=False
        )
        self.stdout.write(f'Created user: {user1.username}')
        
        # Test 2: Try to generate same username again (should add suffix)
        username2 = generate_unique_username("student", registration_number)
        self.stdout.write(f'Generated username for same registration {registration_number}: {username2}')
        
        # Create the second user
        user2 = CustomUser.objects.create(
            email=f"student2@test.com",
            username=username2,
            first_name="Jane",
            last_name="Smith",
            role="student",
            is_active=False
        )
        self.stdout.write(f'Created user: {user2.username}')
        
        # Test 3: Generate username with employment ID
        employee_id = "Emp-001"
        username3 = generate_unique_username("teacher", None, employee_id)
        self.stdout.write(f'Generated username for employment ID {employee_id}: {username3}')
        
        # Create the teacher user
        user3 = CustomUser.objects.create(
            email=f"teacher1@test.com",
            username=username3,
            first_name="Teacher",
            last_name="One",
            role="teacher",
            is_active=False
        )
        self.stdout.write(f'Created user: {user3.username}')
        
        # Test 4: Try to generate same employment ID username again
        username4 = generate_unique_username("teacher", None, employee_id)
        self.stdout.write(f'Generated username for same employment ID {employee_id}: {username4}')
        
        # Create the second teacher user
        user4 = CustomUser.objects.create(
            email=f"teacher2@test.com",
            username=username4,
            first_name="Teacher",
            last_name="Two",
            role="teacher",
            is_active=False
        )
        self.stdout.write(f'Created user: {user4.username}')
        
        # Test 5: Generate auto-increment usernames
        username5 = generate_unique_username("parent")
        self.stdout.write(f'Generated auto-increment parent username: {username5}')
        
        username6 = generate_unique_username("admin")
        self.stdout.write(f'Generated auto-increment admin username: {username6}')
        
        # Clean up test users
        CustomUser.objects.filter(email__endswith="@test.com").delete()
        self.stdout.write('Cleaned up test users')
        
        self.stdout.write(
            self.style.SUCCESS('Username generation tests completed!')
        ) 