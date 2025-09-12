# school-management-project

# School Management System - Structure Improvements

## Overview

This document outlines the comprehensive improvements made to the school management system to better reflect real-world educational structures, particularly focusing on Senior Secondary streams, elective subjects, and enhanced teacher assignments.

## 🎯 **Key Improvements Implemented**

### 1. **Stream Management for Senior Secondary**

#### **New Stream Model**

```python
class Stream(models.Model):
    STREAM_CHOICES = [
        ("SCIENCE", "Science"),
        ("ARTS", "Arts"),
        ("COMMERCIAL", "Commercial"),
        ("TECHNICAL", "Technical"),
    ]

    name = models.CharField(max_length=50)
    code = models.CharField(max_length=10, unique=True)
    stream_type = models.CharField(max_length=20, choices=STREAM_CHOICES)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
```

#### **Enhanced Classroom Model**

- Added `stream` field to link classrooms to specific streams
- Supports Senior Secondary stream-based organization
- Maintains backward compatibility for Nursery/Primary/Junior Secondary

### 2. **Enhanced Subject-Stream Relationship**

#### **Subject Model Improvements**

```python
# Stream compatibility for Senior Secondary
compatible_streams = models.ManyToManyField(
    "classroom.Stream",
    related_name="subjects",
    blank=True,
    help_text="Streams where this subject is available (for Senior Secondary)",
)

# Enhanced elective management
is_elective = models.BooleanField(default=False)
elective_group = models.CharField(max_length=50, blank=True, null=True)
min_electives_required = models.PositiveIntegerField(default=0)
max_electives_allowed = models.PositiveIntegerField(default=0)
```

### 3. **Improved Teacher Assignment System**

#### **Enhanced ClassroomTeacherAssignment**

```python
class ClassroomTeacherAssignment(models.Model):
    # Enhanced assignment details
    is_primary_teacher = models.BooleanField(default=False)
    periods_per_week = models.PositiveIntegerField(default=1)
    assigned_date = models.DateField(default=get_current_date)
    is_active = models.BooleanField(default=True)
```

### 4. **Student Stream Assignment**

#### **Student Model Enhancement**

```python
# Stream assignment for Senior Secondary students
stream = models.ForeignKey(
    "classroom.Stream",
    on_delete=models.SET_NULL,
    null=True,
    blank=True,
    related_name="students",
    help_text="Stream assignment for Senior Secondary students",
)
```

## 🏗️ **System Architecture**

### **Education Level Structure**

```
NURSERY
├── Pre-Nursery
├── Nursery 1
└── Nursery 2

PRIMARY
├── Primary 1 (A, B)
├── Primary 2 (A, B)
├── Primary 3 (A, B)
├── Primary 4 (A, B)
├── Primary 5 (A, B)
└── Primary 6 (A, B)

JUNIOR_SECONDARY
├── JSS 1 (A, B)
├── JSS 2 (A, B)
└── JSS 3 (A, B)

SENIOR_SECONDARY
├── SS 1
│   ├── Science Stream
│   ├── Arts Stream
│   ├── Commercial Stream
│   └── Technical Stream
├── SS 2
│   ├── Science Stream
│   ├── Arts Stream
│   ├── Commercial Stream
│   └── Technical Stream
└── SS 3
    ├── Science Stream
    ├── Arts Stream
    ├── Commercial Stream
    └── Technical Stream
```

### **Subject Classification**

#### **Cross-Cutting Subjects** (All SS Students)

- Mathematics
- English Language
- Civic Education

#### **Stream-Specific Subjects**

- **Science**: Physics, Chemistry, Biology, Further Mathematics
- **Arts**: Literature, Government, Economics, Geography
- **Commercial**: Financial Accounting, Commerce, Economics
- **Technical**: Technical Drawing, Woodwork, Metalwork

#### **Elective Subjects**

- Group A: Music, Fine Art, French
- Group B: Computer Studies, Agricultural Science
- Group C: Food & Nutrition, Clothing & Textiles

## 🔄 **Teacher Assignment Logic**

### **Nursery/Primary**

- One teacher handles all subjects for the class
- `class_teacher` field is automatically set
- Specialist teachers can be assigned for specific subjects (Music, PE, ICT)

### **Junior Secondary**

- Different teachers for different subjects
- Subject-specific assignments through `ClassroomTeacherAssignment`
- Flexible teacher-subject-classroom mapping

### **Senior Secondary**

- Stream-based subject assignments
- Teachers assigned to specific subjects within streams
- Support for specialist teachers and practical subjects

## 📊 **Data Relationships**

### **Classroom → Stream → Section**

```
Classroom (SS1 Science A)
├── Stream: Science
├── Section: SS1 A
├── Grade Level: SS1
└── Education Level: SENIOR_SECONDARY
```

### **Subject → Stream Compatibility**

```
Physics
├── Compatible Streams: [Science, Technical]
├── SS Subject Type: core_science
├── Is Elective: False
└── Requires Specialist: True
```

### **Teacher → Subject → Classroom**

```
Teacher: John Doe
├── Subject: Physics
├── Classroom: SS1 Science A
├── Is Primary Teacher: True
├── Periods per Week: 5
└── Stream: Science
```

## 🎓 **Student Progression**

### **Promotion Logic**

1. **Nursery → Primary**: Automatic progression
2. **Primary → Junior Secondary**: Based on performance
3. **Junior Secondary → Senior Secondary**: Based on performance + stream selection
4. **Senior Secondary**: Stream-based progression (SS1 → SS2 → SS3)

### **Stream Selection**

- Students choose stream at SS1 entry
- Stream determines available subjects
- Elective subjects within stream constraints
- Cross-cutting subjects mandatory for all

## 🔧 **Implementation Benefits**

### **1. Flexibility**

- Supports different school structures
- Easy to add new streams or subjects
- Configurable teacher assignments

### **2. Scalability**

- Handles multiple sections per grade
- Supports large student populations
- Efficient teacher-subject mapping

### **3. Real-world Alignment**

- Matches actual school structures
- Supports curriculum requirements
- Handles specialist teachers

### **4. Data Integrity**

- Proper relationships between entities
- Validation for stream-subject compatibility
- Unique constraints prevent conflicts

## 🚀 **Next Steps**

### **Immediate Actions**

1. Run migrations: `python manage.py migrate`
2. Create sample streams and subjects
3. Update admin interfaces
4. Test teacher assignment logic

### **Future Enhancements**

1. **Promotion Management**: Automated student promotion system
2. **Timetable Generation**: Stream-aware timetable creation
3. **Result Analysis**: Stream-based performance analytics
4. **Parent Portal**: Stream-specific information display

### **API Endpoints to Add**

1. `GET /api/streams/` - List all streams
2. `GET /api/streams/{id}/subjects/` - Subjects for a stream
3. `GET /api/streams/{id}/students/` - Students in a stream
4. `POST /api/students/{id}/assign-stream/` - Assign student to stream

## 📝 **Migration Notes**

### **Database Changes**

- New `Stream` model created
- Enhanced `Classroom` model with stream support
- Enhanced `Subject` model with elective management
- Enhanced `Student` model with stream assignment
- Enhanced `ClassroomTeacherAssignment` with detailed assignment info

### **Backward Compatibility**

- All existing data preserved
- Optional stream fields allow gradual migration
- Default values ensure system stability

---

_This improved structure provides a solid foundation for managing complex school systems while maintaining flexibility for different educational approaches._

# 🎓 Flexible Stream Configuration System

## Overview

This system allows **every school to customize their own stream structure** instead of being forced into a rigid, one-size-fits-all curriculum. Schools can:

- **Define which subjects belong to which streams**
- **Set minimum and maximum subject requirements**
- **Configure cross-cutting, core, and elective subjects**
- **Customize credit weights and prerequisites**
- **Adapt to their resources and teaching philosophy**

## 🏗️ System Architecture

### 1. **SchoolStreamConfiguration Model**

- Links schools to streams with subject categories
- Defines requirements (min/max subjects)
- Sets whether categories are compulsory
- Controls display order

### 2. **SchoolStreamSubjectAssignment Model**

- Links specific subjects to stream configurations
- Sets individual subject properties (compulsory, credit weight)
- Manages prerequisites between subjects
- Controls cross-stream availability

### 3. **Flexible Subject Categorization**

- **Cross-Cutting**: Subjects all students must take (e.g., Mathematics, English, Civic Education)
- **Core**: Essential subjects for the specific stream
- **Elective**: Optional subjects students can choose from

## 🚀 Getting Started

### Step 1: Set Up Default Configurations

```bash
# Set up sensible defaults for all schools
python manage.py setup_default_stream_config

# Set up for a specific school
python manage.py setup_default_stream_config --school-id 1

# Set up for a specific stream only
python manage.py setup_default_stream_config --stream SCIENCE

# Preview changes without applying them
python manage.py setup_default_stream_config --dry-run
```

### Step 2: Customize Your Configuration

1. **Access the Admin Panel** at `/admin/`
2. **Navigate to Subject → School Stream Configurations**
3. **Modify existing configurations** or create new ones
4. **Assign subjects** to different categories

### Step 3: Use the Frontend Manager

1. **Access the Stream Configuration Manager** component
2. **Select your school** from the dropdown
3. **Configure each stream** (Science, Arts, Commercial, Technical)
4. **Set subject requirements** and constraints
5. **Save your configurations**

## 📚 Example Configurations

### **Science Stream (Traditional)**

```
Cross-Cutting (Compulsory):
- Mathematics, English, Civic Education

Core (Compulsory):
- Physics, Chemistry, Biology

Elective (Choose 2-4):
- Agricultural Science, Computer Studies, Data Processing, PHE
```

### **Arts Stream (Customized)**

```
Cross-Cutting (Compulsory):
- Mathematics, English, Civic Education

Core (Compulsory):
- Literature in English, Government, CRS

Elective (Choose 2-3):
- Food and Nutrition, PHE, Computer Studies
```

### **Commercial Stream (Business Focus)**

```
Cross-Cutting (Compulsory):
- Mathematics, English, Civic Education

Core (Compulsory):
- Economics, Accounting, Commerce

Elective (Choose 2-4):
- Data Processing, Computer Studies, PHE, Business Studies
```

## ⚙️ Configuration Options

### **Subject Role Settings**

- **Cross-Cutting**: Available to all streams, usually compulsory
- **Core**: Essential for the specific stream, usually compulsory
- **Elective**: Optional subjects within the stream

### **Requirement Controls**

- **Min Subjects Required**: Minimum number of subjects students must take
- **Max Subjects Allowed**: Maximum number of subjects students can take
- **Is Compulsory**: Whether the entire category is mandatory

### **Subject-Level Settings**

- **Is Compulsory**: Whether this specific subject is mandatory
- **Credit Weight**: Academic weight/importance of the subject
- **Prerequisites**: Subjects that must be completed first
- **Cross-Stream Availability**: Whether subject can be taken in other streams

## 🔄 Workflow Examples

### **Scenario 1: Adding a New Subject**

1. Create the subject in the Subject model
2. Assign it to appropriate stream configurations
3. Set its properties (compulsory, credit weight, etc.)
4. Configure prerequisites if needed

### **Scenario 2: Modifying Stream Requirements**

1. Find the stream configuration
2. Adjust min/max subject requirements
3. Add or remove subjects from categories
4. Update subject properties
5. Save changes

### **Scenario 3: Creating a Custom Stream**

1. Create a new Stream model instance
2. Set up configurations for each subject role
3. Assign appropriate subjects
4. Configure requirements and constraints

## 📊 API Endpoints

### **Stream Configurations**

```
GET /api/stream-configurations/ - List all configurations
GET /api/stream-configurations/?school_id=1 - Filter by school
GET /api/stream-configurations/?stream_id=2 - Filter by stream
GET /api/stream-configurations/summary/?school_id=1 - Get summary
```

### **Subject Assignments**

```
GET /api/stream-subject-assignments/ - List all assignments
POST /api/stream-subject-assignments/bulk_assign/ - Bulk assign subjects
```

### **Subjects by Stream**

```
GET /api/subjects/by_stream/?school_id=1&stream_id=2 - Get subjects for a stream
```

## 🎯 Best Practices

### **1. Start with Defaults**

- Use the management command to set up sensible defaults
- Customize gradually based on your needs
- Don't reinvent the wheel

### **2. Balance Flexibility and Structure**

- Ensure students have enough choice
- Don't make requirements too rigid
- Consider student workload and resources

### **3. Plan for Growth**

- Design configurations that can accommodate new subjects
- Consider future curriculum changes
- Document your decisions

### **4. Validate Configurations**

- Ensure minimum requirements are met
- Check for circular prerequisites
- Validate credit weight distributions

## 🚨 Common Pitfalls

### **1. Over-Complexity**

- Don't create too many elective options
- Keep prerequisites simple
- Avoid overly rigid requirements

### **2. Resource Mismatch**

- Don't require subjects you can't teach
- Consider teacher availability
- Plan for practical requirements

### **3. Student Overload**

- Don't require too many subjects
- Consider total credit load
- Balance academic rigor with student well-being

## 🔧 Troubleshooting

### **Problem: Students can't see subjects**

- Check if subjects are assigned to stream configurations
- Verify that configurations are active
- Ensure subjects are marked as active

### **Problem: Prerequisites not working**

- Check for circular dependencies
- Verify prerequisite assignments
- Ensure prerequisite subjects are active

### **Problem: Configuration not saving**

- Check for validation errors
- Verify required fields are filled
- Check database constraints

## 📈 Future Enhancements

### **Planned Features**

- **Curriculum Templates**: Pre-built configurations for common curricula
- **Validation Rules**: Advanced validation for configuration consistency
- **Audit Trail**: Track changes to configurations over time
- **Bulk Operations**: Import/export configurations between schools

### **Integration Points**

- **Student Enrollment**: Automatic subject assignment based on stream
- **Teacher Assignment**: Match teachers to configured subjects
- **Exam Management**: Generate exams based on stream configurations
- **Result Processing**: Calculate results based on subject requirements

## 💡 Tips for School Administrators

### **1. Start Simple**

- Begin with basic configurations
- Add complexity gradually
- Test with small groups first

### **2. Involve Teachers**

- Get input from subject teachers
- Consider teacher expertise
- Plan for professional development

### **3. Monitor and Adjust**

- Track student performance
- Gather feedback from teachers
- Adjust configurations based on results

### **4. Document Everything**

- Keep records of configuration changes
- Document rationale for decisions
- Share knowledge with staff

## 🆘 Getting Help

### **Support Resources**

- **Documentation**: This guide and inline code comments
- **Admin Interface**: Built-in validation and error messages
- **Management Commands**: Pre-built tools for common tasks
- **API Endpoints**: Programmatic access for advanced users

### **Common Questions**

- **Q: Can I have different configurations for different grade levels?**

  - A: Yes, you can create separate configurations for SS1, SS2, SS3

- **Q: What if a student wants to change streams?**

  - A: The system can handle subject transfers and prerequisite checking

- **Q: Can I import configurations from other schools?**
  - A: Yes, you can export/import configurations using the API

---

**🎉 Congratulations!** You now have a flexible, powerful system that puts you in control of your curriculum. Start with the defaults, customize to your needs, and watch your students thrive with a curriculum that fits your school perfectly.

# 🎓 Admin Stream Configuration Guide

## Quick Start

### 1. Access the Stream Configuration

- Go to **Admin Dashboard** → **Settings** → **Academic** tab
- Click on **"Stream Configuration"** section (default view)

### 2. Setup Default Configurations

- Click the **"Setup Defaults"** button to create initial stream configurations
- This will set up sensible defaults for all streams (Science, Arts, Commercial, Technical)

### 3. Customize Your Streams

- Navigate between different streams using the tabs
- Each stream has three categories:
  - **Cross-Cutting**: Subjects all students must take (Math, English, Civic Education)
  - **Core**: Essential subjects for the specific stream
  - **Elective**: Optional subjects students can choose from

## What You Can Configure

### ✅ **Stream Requirements**

- Minimum and maximum subjects required
- Whether categories are compulsory
- Credit weights for subjects

### ✅ **Subject Management**

- Add/remove subjects from streams
- Mark subjects as compulsory or elective
- Set prerequisites between subjects

### ✅ **School-Specific Settings**

- Each school can have different configurations
- Adapt to your resources and teaching philosophy
- No rigid standards - complete flexibility

## Example Configuration

### **Science Stream**

```
Cross-Cutting (Compulsory):
- Mathematics, English, Civic Education

Core (Compulsory):
- Physics, Chemistry, Biology

Elective (Choose 2-4):
- Agricultural Science, Computer Studies, Data Processing, PHE
```

### **Arts Stream**

```
Cross-Cutting (Compulsory):
- Mathematics, English, Civic Education

Core (Compulsory):
- Literature in English, Government, CRS

Elective (Choose 2-3):
- Food and Nutrition, PHE, Computer Studies
```

## Benefits

1. **🎯 School Autonomy**: Design your own curriculum
2. **🔄 Flexibility**: Easy to modify and adapt
3. **📊 Student Management**: Automatic enrollment based on streams
4. **👨‍🏫 Teacher Assignment**: Teachers see only relevant students
5. **📚 Curriculum Control**: Manage subject requirements and prerequisites

## Need Help?

- **Documentation**: See `STREAM_CONFIGURATION_GUIDE.md` for detailed technical information
- **Admin Panel**: Use Django admin at `/admin/` for advanced configuration
- **API Access**: Programmatic access available for bulk operations

---

**🎉 You now have complete control over your school's curriculum structure!**

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
