# utils/section_filtering.py
from django.db.models import Q
from classroom.models import Section
import logging

logger = logging.getLogger(__name__)


class SectionFilterMixin:
    """
    Mixin to filter querysets based on user's section and role.
    """

    def get_user_role(self):
        """
        Helper method to get user's role from various possible sources.
        Returns role name as string in lowercase.
        """
        user = self.request.user

        # Check if superuser first
        if user.is_superuser:
            return "superadmin"

        # Check for role attribute directly on user
        if hasattr(user, "role") and isinstance(user.role, str):
            return user.role.lower()

        # Check for userrole relationship (many-to-many)
        if hasattr(user, "userrole"):
            roles = user.userrole.roles.all()
            if roles.exists():
                # Return the highest priority role
                role_names = [role.name.lower() for role in roles]

                # Priority order
                if "super_admin" in role_names or "superadmin" in role_names:
                    return "superadmin"
                if "admin" in role_names or "principal" in role_names:
                    return "admin"
                if "secondary_admin" in role_names:
                    return "secondary_admin"
                if "teacher" in role_names:
                    return "teacher"
                if "student" in role_names:
                    return "student"
                if "parent" in role_names:
                    return "parent"

                # Return first role if no priority match
                return role_names[0] if role_names else None

        # Check for is_staff as fallback
        if user.is_staff:
            return "admin"

        return None

    def get_user_section_access(self):
        """
        Returns the sections the current user has access to based on their role.
        """
        user = self.request.user
        role = self.get_user_role()

        logger.info(f"User {user.username} has role: {role}")

        # Super Admin sees everything
        if role == "superadmin" or user.is_superuser:
            logger.info("Super admin access - returning all sections")
            return Section.objects.all()

        # Admin/Principal sees everything
        if role in ["admin", "principal"]:
            logger.info("Admin access - returning all sections")
            return Section.objects.all()

        # Secondary Admin sees both JSS and SSS
        if role == "secondary_admin":
            logger.info("Secondary admin access")
            return Section.objects.filter(
                grade_level__education_level__in=[
                    "JUNIOR_SECONDARY",
                    "SENIOR_SECONDARY",
                ]
            )

        # Section Admins see only their section
        if hasattr(user, "is_section_admin") and user.is_section_admin:
            if hasattr(user, "section") and user.section:
                section_to_edu = {
                    "nursery": "NURSERY",
                    "primary": "PRIMARY",
                    "junior_secondary": "JUNIOR_SECONDARY",
                    "senior_secondary": "SENIOR_SECONDARY",
                }
                edu_level = section_to_edu.get(
                    user.section.lower()
                    if isinstance(user.section, str)
                    else user.section
                )

                if edu_level:
                    logger.info(f"Section admin access for {edu_level}")
                    return Section.objects.filter(
                        grade_level__education_level=edu_level
                    )

        # Teachers see sections of their assigned classrooms
        if role == "teacher":
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

                sections = Section.objects.filter(id__in=section_ids)
                logger.info(f"Teacher access - {sections.count()} sections")
                return sections
            except Teacher.DoesNotExist:
                logger.warning(f"Teacher object not found for user {user.username}")
                return Section.objects.none()
            except Exception as e:
                logger.error(f"Error getting teacher sections: {str(e)}")
                return Section.objects.none()

        # Students see only their section
        if role == "student":
            try:
                from students.models import Student

                student = Student.objects.get(user=user)
                if hasattr(student, "current_classroom") and student.current_classroom:
                    return Section.objects.filter(
                        id=student.current_classroom.section_id
                    )
            except Student.DoesNotExist:
                logger.warning(f"Student object not found for user {user.username}")
            except Exception as e:
                logger.error(f"Error getting student sections: {str(e)}")

        # Default: For staff users without specific role, grant all access
        if user.is_staff:
            logger.info("Staff user without specific role - granting all access")
            return Section.objects.all()

        logger.warning(f"No section access for user {user.username} with role {role}")
        return Section.objects.none()

    def get_education_levels_for_sections(self, sections):
        """
        Returns distinct education levels for the given sections.
        """
        if not sections or not sections.exists():
            logger.warning("No sections provided or sections queryset is empty")
            return []

        education_levels = list(
            sections.values_list("grade_level__education_level", flat=True).distinct()
        )
        logger.info(f"Education levels from sections: {education_levels}")
        return education_levels

    def filter_students_by_section_access(self, queryset):
        """Filter students based on user's role and section"""
        user = self.request.user
        role = self.get_user_role()

        # Super Admin sees everything
        if role == "superadmin" or user.is_superuser or user.is_staff:
            return queryset

        # Admin/Principal sees everything
        if role in ["admin", "principal"]:
            return queryset

        # Secondary Admin sees both JSS and SSS
        if role == "secondary_admin":
            return queryset.filter(
                education_level__in=["JUNIOR_SECONDARY", "SENIOR_SECONDARY"]
            )

        # Section Admins see only their section
        if hasattr(user, "is_section_admin") and user.is_section_admin:
            if hasattr(user, "section") and user.section:
                section_to_edu = {
                    "nursery": "NURSERY",
                    "primary": "PRIMARY",
                    "junior_secondary": "JUNIOR_SECONDARY",
                    "senior_secondary": "SENIOR_SECONDARY",
                }
                edu_level = section_to_edu.get(
                    user.section.lower()
                    if isinstance(user.section, str)
                    else user.section
                )

                if edu_level:
                    return queryset.filter(education_level=edu_level)

        # Teachers see only students in their assigned classes
        if role == "teacher":
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
                logger.warning(f"Teacher not found for user {user.username}")
                return queryset.none()
            except Exception as e:
                logger.error(f"Error filtering students by teacher: {str(e)}")
                return queryset.none()

        # Students see only themselves
        if role == "student":
            try:
                from students.models import Student

                student = Student.objects.get(user=user)
                return queryset.filter(id=student.id)
            except:
                return queryset.none()

        # Parents see only their children
        if role == "parent":
            try:
                from parent.models import Parent

                parent = Parent.objects.get(user=user)
                return queryset.filter(parents=parent)
            except:
                return queryset.none()

        # Default: no access
        logger.warning(f"No student access for user {user.username} with role {role}")
        return queryset.none()

    def filter_classrooms_by_section_access(self, queryset):
        """Filter classrooms based on user's role and section"""
        user = self.request.user
        role = self.get_user_role()

        # Super Admin sees everything
        if role == "superadmin" or user.is_superuser or user.is_staff:
            return queryset

        # Admin/Principal sees everything
        if role in ["admin", "principal"]:
            return queryset

        # Secondary Admin sees both JSS and SSS classrooms
        if role == "secondary_admin":
            return queryset.filter(
                section__grade_level__education_level__in=[
                    "JUNIOR_SECONDARY",
                    "SENIOR_SECONDARY",
                ]
            )

        # Section Admins see only their section's classrooms
        if hasattr(user, "is_section_admin") and user.is_section_admin:
            if hasattr(user, "section") and user.section:
                section_to_edu = {
                    "nursery": "NURSERY",
                    "primary": "PRIMARY",
                    "junior_secondary": "JUNIOR_SECONDARY",
                    "senior_secondary": "SENIOR_SECONDARY",
                }
                edu_level = section_to_edu.get(
                    user.section.lower()
                    if isinstance(user.section, str)
                    else user.section
                )

                if edu_level:
                    return queryset.filter(
                        section__grade_level__education_level=edu_level
                    )

        # Teachers see only their assigned classrooms
        if role == "teacher":
            try:
                from teacher.models import Teacher

                teacher = Teacher.objects.get(user=user)

                return queryset.filter(
                    Q(class_teacher=teacher)
                    | Q(classroomteacherassignment__teacher=teacher)
                ).distinct()
            except Teacher.DoesNotExist:
                logger.warning(f"Teacher not found for user {user.username}")
                return queryset.none()
            except Exception as e:
                logger.error(f"Error filtering classrooms: {str(e)}")
                return queryset.none()

        # Students see classrooms they're enrolled in
        if role == "student":
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
        logger.warning(f"No classroom access for user {user.username} with role {role}")
        return queryset.none()
