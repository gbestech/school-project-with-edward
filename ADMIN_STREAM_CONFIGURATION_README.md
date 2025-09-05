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
