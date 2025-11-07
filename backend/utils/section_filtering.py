# utils/section_filtering.py
from django.db.models import Q
from classroom.models import Section


class SectionFilterMixin:
    """
    Mixin to filter querysets based on user's section and role.
    """

    def get_user_section_access(self):
        """
        Returns the sections the current user has access to based on their role.
        """
        user = self.request.user

        # Super Admin sees everything
        if user.role == "superadmin" or user.is_superuser:
            return Section.objects.all()

        # Secondary Admin sees both JSS and SSS
        if user.role == "secondary_admin":
            return Section.objects.filter(
                grade_level__education_level__in=[
                    "JUNIOR_SECONDARY",
                    "SENIOR_SECONDARY",
                ]
            )

        # Section Admins see only their section
        if user.is_section_admin and user.section:
            section_to_edu = {
                "nursery": "NURSERY",
                "primary": "PRIMARY",
                "junior_secondary": "JUNIOR_SECONDARY",
                "senior_secondary": "SENIOR_SECONDARY",
            }
            edu_level = section_to_edu.get(user.section)

            if edu_level:
                return Section.objects.filter(grade_level__education_level=edu_level)

        # Teachers see sections of their assigned classrooms
        if user.role == "teacher":
            try:
                from teacher.models import Teacher
                from classroom.models import Classroom

                teacher = Teacher.objects.get(user=user)

                assigned_classrooms = Classroom.objects.filter(
                    Q(class_teacher=teacher)
                    | Q(classroomteacherassignment__teacher=teacher)
                ).distinct()

                section_ids = assigned_classrooms.values_list(
                    "section_id", flat=True
                ).distinct()
                return Section.objects.filter(id__in=section_ids)
            except Teacher.DoesNotExist:
                return Section.objects.none()

        # Students see only their section
        if user.role == "student":
            try:
                from students.models import Student

                student = Student.objects.get(user=user)
                if hasattr(student, "current_classroom") and student.current_classroom:
                    return Section.objects.filter(
                        id=student.current_classroom.section_id
                    )
            except Student.DoesNotExist:
                pass

        # Default: no access
        return Section.objects.none()

    def get_education_levels_for_sections(self, sections):
        """
        Returns distinct education levels for the given sections.
        """
        return sections.values_list(
            "grade_level__education_level", flat=True
        ).distinct()

    def filter_students_by_section_access(self, queryset):
        """Filter students based on user's role and section"""
        user = self.request.user

        # Super Admin sees everything
        if user.role == "superadmin" or user.is_superuser:
            return queryset

        # Secondary Admin sees both JSS and SSS
        if user.role == "secondary_admin":
            return queryset.filter(
                user__section__in=["junior_secondary", "senior_secondary"]
            )

        # Section Admins see only their section
        if user.is_section_admin and user.section:
            return queryset.filter(user__section=user.section)

        # Teachers see only students in their assigned classes
        if user.role == "teacher":
            try:
                from teacher.models import Teacher
                from classroom.models import Classroom, StudentEnrollment

                teacher = Teacher.objects.get(user=user)

                assigned_classrooms = Classroom.objects.filter(
                    Q(class_teacher=teacher)
                    | Q(classroomteacherassignment__teacher=teacher)
                ).distinct()

                student_ids = StudentEnrollment.objects.filter(
                    classroom__in=assigned_classrooms, is_active=True
                ).values_list("student_id", flat=True)

                return queryset.filter(id__in=student_ids)
            except Teacher.DoesNotExist:
                return queryset.none()

        # Students see only themselves
        if user.role == "student":
            try:
                from students.models import Student

                student = Student.objects.get(user=user)
                return queryset.filter(id=student.id)
            except:
                return queryset.none()

        # Parents see only their children
        if user.role == "parent":
            try:
                from parent.models import Parent

                parent = Parent.objects.get(user=user)
                return queryset.filter(parents=parent)
            except:
                return queryset.none()

        # Default: no access
        return queryset.none()

    def filter_classrooms_by_section_access(self, queryset):
        """Filter classrooms based on user's role and section"""
        user = self.request.user

        # Super Admin sees everything
        if user.role == "superadmin" or user.is_superuser:
            return queryset

        # Secondary Admin sees both JSS and SSS classrooms
        if user.role == "secondary_admin":
            return queryset.filter(
                section__grade_level__education_level__in=[
                    "JUNIOR_SECONDARY",
                    "SENIOR_SECONDARY",
                ]
            )

        # Section Admins see only their section's classrooms
        if user.is_section_admin and user.section:
            section_to_edu = {
                "nursery": "NURSERY",
                "primary": "PRIMARY",
                "junior_secondary": "JUNIOR_SECONDARY",
                "senior_secondary": "SENIOR_SECONDARY",
            }
            edu_level = section_to_edu.get(user.section)

            if edu_level:
                return queryset.filter(section__grade_level__education_level=edu_level)

        # Teachers see only their assigned classrooms
        if user.role == "teacher":
            try:
                from teacher.models import Teacher

                teacher = Teacher.objects.get(user=user)

                return queryset.filter(
                    Q(class_teacher=teacher)
                    | Q(classroomteacherassignment__teacher=teacher)
                ).distinct()
            except Teacher.DoesNotExist:
                return queryset.none()

        # Students see classrooms they're enrolled in
        if user.role == "student":
            try:
                from students.models import Student
                from classroom.models import StudentEnrollment

                student = Student.objects.get(user=user)
                classroom_ids = StudentEnrollment.objects.filter(
                    student=student, is_active=True
                ).values_list("classroom_id", flat=True)

                return queryset.filter(id__in=classroom_ids)
            except:
                return queryset.none()

        # Default: no access
        return queryset.none()
