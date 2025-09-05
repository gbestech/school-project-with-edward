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

