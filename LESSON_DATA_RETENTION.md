# Lesson Data Retention System

## Overview

The lesson data retention system automatically manages lesson details to balance functionality with database performance. It ensures that detailed lesson information is available during and immediately after lessons, while automatically cleaning up old data to prevent database bloat.

## How It Works

### 1. **During Lesson**
- All lesson details are stored and accessible
- Teachers and admins can view real-time progress
- Attendance and notes are recorded

### 2. **After Lesson Completion**
- Lesson data is retained for **24 hours** for reference
- Download functionality is available for lesson reports
- Data retention expiry is automatically set

### 3. **After 24 Hours**
- Detailed lesson data is automatically cleaned up
- Basic lesson information is preserved (title, schedule, completion status)
- Attendance records are removed
- Notes and feedback are cleared

## Features

### ✅ **Download Lesson Reports**
- Available for completed and in-progress lessons
- Comprehensive JSON report including:
  - Lesson information (title, subject, teacher, classroom, schedule)
  - Educational content (objectives, concepts, materials)
  - Notes and feedback
  - Attendance records with student details
  - Resources and attachments
  - Participation scores

### ✅ **Automatic Cleanup**
- Runs via Django management command
- Cleans up expired lessons (older than 24 hours)
- Preserves essential lesson metadata
- Removes detailed data to save database space

## Setup Instructions

### 1. **Manual Cleanup**
```bash
# Check what would be cleaned up (dry run)
docker-compose exec backend python manage.py cleanup_expired_lessons --dry-run

# Actually perform cleanup
docker-compose exec backend python manage.py cleanup_expired_lessons
```

### 2. **Automatic Cleanup (Recommended)**

#### Option A: Using Cron (Linux/Mac)
Add to your crontab:
```bash
# Run cleanup every hour
0 * * * * docker-compose -f /path/to/your/docker-compose.yml exec -T backend python manage.py cleanup_expired_lessons
```

#### Option B: Using Windows Task Scheduler
1. Create a batch file `cleanup_lessons.bat`:
```batch
cd /d C:\path\to\your\schoolmsapp
docker-compose exec -T backend python manage.py cleanup_expired_lessons
```

2. Schedule it to run every hour using Windows Task Scheduler

#### Option C: Using Docker Cron
Add to your docker-compose.yml:
```yaml
services:
  cron:
    image: alpine:latest
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    command: |
      sh -c "
        echo '0 * * * * docker-compose exec -T backend python manage.py cleanup_expired_lessons' > /etc/crontabs/root
        crond -f
      "
```

## Data Retention Policy

### **Kept After Cleanup:**
- Lesson title and basic information
- Schedule (date, start/end times)
- Teacher and classroom assignments
- Subject information
- Completion status and percentage
- Created/modified timestamps

### **Removed After Cleanup:**
- Detailed lesson notes
- Student feedback
- Admin notes
- Attendance records
- Participation scores
- Resources and attachments
- Learning objectives and concepts
- Materials needed
- Assessment criteria

## Benefits

### 🎯 **Performance**
- Reduces database size over time
- Improves query performance
- Prevents data accumulation

### 🎯 **Functionality**
- Maintains lesson history for reporting
- Provides download capability for important data
- Keeps essential metadata for future reference

### 🎯 **Compliance**
- Automatic data lifecycle management
- Configurable retention periods
- Audit trail preservation

## Usage

### **For Teachers:**
1. Conduct lessons normally
2. Add notes and feedback during/after lesson
3. Download lesson report within 24 hours if needed
4. Data automatically cleans up after 24 hours

### **For Admins:**
1. Monitor lesson progress in real-time
2. Download comprehensive reports
3. Review lesson history (basic info only after cleanup)
4. Run manual cleanup if needed

## Troubleshooting

### **If cleanup isn't working:**
1. Check if the management command exists:
   ```bash
   docker-compose exec backend python manage.py help cleanup_expired_lessons
   ```

2. Verify the migration was applied:
   ```bash
   docker-compose exec backend python manage.py showmigrations lesson
   ```

3. Check for expired lessons manually:
   ```bash
   docker-compose exec backend python -c "
   import os; os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
   import django; django.setup()
   from lesson.models import Lesson
   from django.utils import timezone
   expired = Lesson.objects.filter(data_retention_expires_at__lt=timezone.now())
   print(f'Expired lessons: {expired.count()}')
   "
   ```

### **If download isn't working:**
1. Check if lesson is completed or in progress
2. Verify API endpoint is accessible
3. Check browser console for errors
4. Ensure lesson has data to download

## Customization

### **Change Retention Period**
Modify the `set_data_retention_expiry` method in `backend/lesson/models.py`:
```python
def set_data_retention_expiry(self):
    """Set data retention expiry to 48 hours from now"""
    from datetime import timedelta
    self.data_retention_expires_at = timezone.now() + timedelta(hours=48)
    self.save()
```

### **Modify Cleanup Behavior**
Edit the `cleanup_lesson_data` method to change what gets removed:
```python
def cleanup_lesson_data(self):
    """Custom cleanup behavior"""
    # Keep more data if needed
    self.lesson_notes = ""  # Remove notes
    # self.learning_objectives = []  # Keep objectives
    # ... customize as needed
```

