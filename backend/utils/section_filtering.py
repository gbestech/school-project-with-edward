"""
Section-based filtering utilities for viewsets.
This module provides functionality to filter data based on user's section access permissions.
"""

from django.db.models import Q
from schoolSettings.models import UserRole
from schoolSettings.permissions import HasModulePermission


class SectionFilterMixin:
    """
    Mixin to add section-based filtering to viewsets.
    
    This mixin filters querysets based on the user's section access permissions
    from their UserRole assignments.
    """
    
    def get_user_section_access(self):
        """
        Get the sections the current user has access to.
        
        Returns:
            dict: Dictionary with section access flags
            {
                'primary': bool,
                'secondary': bool, 
                'nursery': bool
            }
        """
        user = self.request.user
        
        # Super admins have access to all sections
        if user.is_superuser and user.is_staff:
            return {
                'primary': True,
                'secondary': True,
                'nursery': True
            }
        
        # Get user's active role assignments
        user_roles = UserRole.objects.filter(
            user=user,
            is_active=True
        )
        
        section_access = {
            'primary': False,
            'secondary': False,
            'nursery': False
        }
        
        for user_role in user_roles:
            if user_role.is_expired():
                continue
                
            if user_role.primary_section_access:
                section_access['primary'] = True
            if user_role.secondary_section_access:
                section_access['secondary'] = True
            if user_role.nursery_section_access:
                section_access['nursery'] = True
        
        return section_access
    
    def get_education_levels_for_sections(self, section_access):
        """
        Map section access to education levels.
        
        Args:
            section_access (dict): Section access flags
            
        Returns:
            list: List of education levels the user can access
        """
        education_levels = []
        
        if section_access['primary']:
            education_levels.append('PRIMARY')
        if section_access['secondary']:
            education_levels.extend(['JUNIOR_SECONDARY', 'SENIOR_SECONDARY'])
        if section_access['nursery']:
            education_levels.append('NURSERY')
            
        return education_levels
    
    def filter_by_section_access(self, queryset, education_level_field='education_level'):
        """
        Filter queryset based on user's section access.
        
        Args:
            queryset: Django queryset to filter
            education_level_field (str): Field name that contains education level
            
        Returns:
            Filtered queryset
        """
        section_access = self.get_user_section_access()
        education_levels = self.get_education_levels_for_sections(section_access)
        
        if not education_levels:
            # User has no section access, return empty queryset
            return queryset.none()
        
        # Filter by education levels
        return queryset.filter(**{f'{education_level_field}__in': education_levels})
    
    def filter_classrooms_by_section_access(self, queryset):
        """
        Filter classroom queryset based on user's section access.
        
        Args:
            queryset: Classroom queryset to filter
            
        Returns:
            Filtered queryset
        """
        section_access = self.get_user_section_access()
        education_levels = self.get_education_levels_for_sections(section_access)
        
        if not education_levels:
            return queryset.none()
        
        # Filter classrooms by their section's grade level education level
        return queryset.filter(section__grade_level__education_level__in=education_levels)
    
    def filter_students_by_section_access(self, queryset):
        """
        Filter student queryset based on user's section access.
        
        Args:
            queryset: Student queryset to filter
            
        Returns:
            Filtered queryset
        """
        section_access = self.get_user_section_access()
        education_levels = self.get_education_levels_for_sections(section_access)
        
        if not education_levels:
            return queryset.none()
        
        # Filter students by their education level
        return queryset.filter(education_level__in=education_levels)
    
    def filter_subjects_by_section_access(self, queryset):
        """
        Filter subject queryset based on user's section access.
        
        Args:
            queryset: Subject queryset to filter
            
        Returns:
            Filtered queryset
        """
        section_access = self.get_user_section_access()
        education_levels = self.get_education_levels_for_sections(section_access)
        
        if not education_levels:
            return queryset.none()
        
        # Since the database doesn't support contains lookup for JSON fields,
        # we need to filter in Python
        filtered_subject_ids = []
        for subject in queryset:
            # Check if the subject has any education level in the allowed list
            if any(level in subject.education_levels for level in education_levels):
                # Also check that it doesn't have any disallowed education levels
                all_education_levels = ['PRIMARY', 'JUNIOR_SECONDARY', 'SENIOR_SECONDARY', 'NURSERY']
                disallowed_levels = [level for level in all_education_levels if level not in education_levels]
                
                # Only include if it doesn't have any disallowed levels
                if not any(level in subject.education_levels for level in disallowed_levels):
                    filtered_subject_ids.append(subject.id)
        
        return queryset.filter(id__in=filtered_subject_ids)
    
    def filter_teachers_by_section_access(self, queryset):
        """
        Filter teacher queryset based on user's section access.
        Teachers are filtered by their classroom assignments.
        
        Args:
            queryset: Teacher queryset to filter
            
        Returns:
            Filtered queryset
        """
        # Teachers should always be able to see themselves
        # This allows them to access their own dashboard and profile
        user = self.request.user
        user_teacher = queryset.filter(user=user).first()
        
        section_access = self.get_user_section_access()
        education_levels = self.get_education_levels_for_sections(section_access)
        
        if not education_levels:
            # If user has no section access but is a teacher, return only themselves
            if user_teacher:
                return queryset.filter(id=user_teacher.id)
            return queryset.none()
        
        # Filter teachers who have assignments ONLY in classrooms with the allowed education levels
        from django.db.models import Q, Exists, OuterRef
        
        # First, get teachers who have assignments in allowed education levels
        teachers_with_allowed_assignments = queryset.filter(
            classroomteacherassignment__classroom__section__grade_level__education_level__in=education_levels,
            classroomteacherassignment__is_active=True
        ).distinct()
        
        # Then, exclude teachers who also have assignments in disallowed education levels
        # Get all education levels that are NOT allowed
        all_education_levels = ['PRIMARY', 'JUNIOR_SECONDARY', 'SENIOR_SECONDARY', 'NURSERY']
        disallowed_levels = [level for level in all_education_levels if level not in education_levels]
        
        if disallowed_levels:
            # Exclude teachers who have assignments in disallowed levels
            teachers_with_allowed_assignments = teachers_with_allowed_assignments.exclude(
                classroomteacherassignment__classroom__section__grade_level__education_level__in=disallowed_levels,
                classroomteacherassignment__is_active=True
            )
        
        # Always include the current user's own teacher record if they are a teacher
        if user_teacher:
            teachers_with_allowed_assignments = queryset.filter(
                Q(id__in=teachers_with_allowed_assignments.values('id')) | Q(id=user_teacher.id)
            ).distinct()
        
        return teachers_with_allowed_assignments
