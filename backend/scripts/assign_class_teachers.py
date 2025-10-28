from teacher.models import Teacher
from classroom.models import ClassroomTeacherAssignment, Classroom
from django.db.models import Q

# Get all nursery and primary teachers
nursery_primary_teachers = Teacher.objects.filter(level__in=["nursery", "primary"])

for teacher in nursery_primary_teachers:
    # Match classrooms by the nested education level field
    assigned_classes = Classroom.objects.filter(
        section__grade_level__education_level__iexact=teacher.level.upper()
    )

    for classroom in assigned_classes:
        ClassroomTeacherAssignment.objects.get_or_create(
            teacher=teacher, classroom=classroom
        )

    print(
        f"✅ Assigned {teacher.user.full_name} as class teacher for {teacher.level.capitalize()} section"
    )

print(
    "🎉 Nursery and Primary teachers have been assigned as classroom teachers successfully!"
)
