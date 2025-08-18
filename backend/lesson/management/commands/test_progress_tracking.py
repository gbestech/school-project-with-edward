from django.core.management.base import BaseCommand
from lesson.models import Lesson
from django.utils import timezone
from datetime import datetime, timedelta


class Command(BaseCommand):
    help = 'Test lesson progress tracking functionality'

    def handle(self, *args, **options):
        self.stdout.write('🧪 TESTING LESSON PROGRESS TRACKING')
        self.stdout.write('=' * 50)
        
        # Get a lesson to test with
        lesson = Lesson.objects.filter(status='scheduled').first()
        
        if not lesson:
            self.stdout.write('❌ No scheduled lessons found. Please create a lesson first.')
            return
        
        self.stdout.write(f'📚 Testing with lesson: {lesson.title}')
        self.stdout.write(f'   Date: {lesson.date}')
        self.stdout.write(f'   Time: {lesson.start_time} - {lesson.end_time}')
        self.stdout.write(f'   Current Status: {lesson.status}')
        self.stdout.write(f'   Current Progress: {lesson.completion_percentage}%')
        
        # Test starting the lesson
        self.stdout.write('\n🚀 Testing lesson start...')
        if lesson.start_lesson():
            self.stdout.write('   ✅ Lesson started successfully')
            self.stdout.write(f'   New Status: {lesson.status}')
            self.stdout.write(f'   Actual Start Time: {lesson.actual_start_time}')
            self.stdout.write(f'   Progress: {lesson.completion_percentage}%')
        else:
            self.stdout.write('   ❌ Failed to start lesson')
            return
        
        # Test progress calculation
        self.stdout.write('\n📊 Testing progress calculation...')
        progress = lesson.calculate_progress_percentage()
        self.stdout.write(f'   Calculated Progress: {progress}%')
        
        # Test progress update
        self.stdout.write('\n🔄 Testing progress update...')
        updated_progress = lesson.update_progress()
        self.stdout.write(f'   Updated Progress: {updated_progress}%')
        
        # Test completing the lesson
        self.stdout.write('\n✅ Testing lesson completion...')
        if lesson.complete_lesson():
            self.stdout.write('   ✅ Lesson completed successfully')
            self.stdout.write(f'   New Status: {lesson.status}')
            self.stdout.write(f'   Actual End Time: {lesson.actual_end_time}')
            self.stdout.write(f'   Final Progress: {lesson.completion_percentage}%')
        else:
            self.stdout.write('   ❌ Failed to complete lesson')
        
        self.stdout.write('\n🎉 Progress tracking test completed!')
        
        # Show final lesson state
        self.stdout.write('\n📋 Final Lesson State:')
        self.stdout.write(f'   Title: {lesson.title}')
        self.stdout.write(f'   Status: {lesson.status}')
        self.stdout.write(f'   Progress: {lesson.completion_percentage}%')
        self.stdout.write(f'   Start Time: {lesson.actual_start_time}')
        self.stdout.write(f'   End Time: {lesson.actual_end_time}')




