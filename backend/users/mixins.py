# users/mixins.py or core/mixins.py
from rest_framework import viewsets
from django.db.models import Q


class SectionFilterMixin:
    """
    Mixin to automatically filter querysets by section for section admins.
    Superadmins see everything, section admins see only their section's data.

    Usage:
        class ParentViewSet(SectionFilterMixin, viewsets.ModelViewSet):
            queryset = Parent.objects.all()
            serializer_class = ParentSerializer
            section_filter_field = 'students__grade_level__section'  # Adjust as needed
    """

    section_filter_field = "section"  # Override in your viewset

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user

        # Superadmins see everything
        if user.role == "superadmin" or user.is_superuser:
            return queryset

        # Section admins see only their section's data
        if user.is_section_admin and user.section:
            # Build filter dynamically based on section_filter_field
            filter_kwargs = {self.section_filter_field: user.section}
            return queryset.filter(**filter_kwargs).distinct()

        # Other users see nothing (or customize as needed)
        return queryset.none()


# Example usage in different ViewSets:

# 1. For Parents (assuming parents are linked via students)
"""
from users.mixins import SectionFilterMixin

class ParentViewSet(SectionFilterMixin, viewsets.ModelViewSet):
    queryset = Parent.objects.all()
    serializer_class = ParentSerializer
    permission_classes = [IsAuthenticated, CanManageSection]
    section_filter_field = 'students__grade_level__section'  # Parent -> Student -> GradeLevel -> Section
"""

# 2. For Lesson Schedules (assuming lessons have grade_level)
"""
class LessonScheduleViewSet(SectionFilterMixin, viewsets.ModelViewSet):
    queryset = LessonSchedule.objects.all()
    serializer_class = LessonScheduleSerializer
    permission_classes = [IsAuthenticated, CanManageSection]
    section_filter_field = 'grade_level__section'  # LessonSchedule -> GradeLevel -> Section
"""

# 3. For Teachers
"""
class TeacherViewSet(SectionFilterMixin, viewsets.ModelViewSet):
    queryset = Teacher.objects.all()
    serializer_class = TeacherSerializer
    permission_classes = [IsAuthenticated, CanManageSection]
    section_filter_field = 'user__section'  # Teacher -> User -> Section
"""

# 4. For Students
"""
class StudentViewSet(SectionFilterMixin, viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticated, CanManageSection]
    section_filter_field = 'grade_level__section'  # Student -> GradeLevel -> Section
"""

# 5. For Exams
"""
class ExamViewSet(SectionFilterMixin, viewsets.ModelViewSet):
    queryset = Exam.objects.all()
    serializer_class = ExamSerializer
    permission_classes = [IsAuthenticated, CanManageSection]
    section_filter_field = 'grade_level__section'  # Exam -> GradeLevel -> Section
"""


# Advanced: Multiple section filter paths
class AdvancedSectionFilterMixin:
    """
    For complex models with multiple paths to section.
    Override get_section_queryset() in your viewset.
    """

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user

        # Superadmins see everything
        if user.role == "superadmin" or user.is_superuser:
            return queryset

        # Section admins use custom filtering
        if user.is_section_admin and user.section:
            return self.get_section_queryset(queryset, user.section)

        return queryset.none()

    def get_section_queryset(self, queryset, section):
        """
        Override this method to define custom section filtering logic.

        Example for Parents:
            return queryset.filter(
                Q(students__grade_level__section=section) |
                Q(wards__grade_level__section=section)
            ).distinct()
        """
        raise NotImplementedError("Implement get_section_queryset() in your viewset")
