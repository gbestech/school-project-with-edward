from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from students.models import Student
from teacher.models import Teacher
from classroom.models import Classroom
from attendance.models import Attendance
from parent.models import Message, ParentProfile
from utils.section_filtering import SectionFilterMixin, AutoSectionFilterMixin
import datetime


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    # Create a temporary instance to use section filtering methods
    class TempSectionFilter:
        def __init__(self, request):
            self.request = request
        
        def get_user_section_access(self):
            """Get the sections the current user has access to."""
            user = self.request.user
            
            # Super admins have access to all sections
            if user.is_superuser and user.is_staff:
                return {
                    'primary': True,
                    'secondary': True,
                    'nursery': True
                }
            
            # Get user's active role assignments
            from schoolSettings.models import UserRole
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
            """Map section access to education levels."""
            education_levels = []
            
            if section_access['primary']:
                education_levels.append('PRIMARY')
            if section_access['secondary']:
                education_levels.extend(['JUNIOR_SECONDARY', 'SENIOR_SECONDARY'])
            if section_access['nursery']:
                education_levels.append('NURSERY')
                
            return education_levels
    
    # Initialize section filter
    section_filter = TempSectionFilter(request)
    section_access = section_filter.get_user_section_access()
    education_levels = section_filter.get_education_levels_for_sections(section_access)
    
    # Filter querysets based on section access
    if not education_levels:
        # User has no section access, return zeros
        return Response({
            "total_students": 0,
            "active_students": 0,
            "inactive_students": 0,
            "total_teachers": 0,
            "active_teachers": 0,
            "inactive_teachers": 0,
            "total_classes": 0,
            "total_messages": 0,
            "total_parents": 0,
            "active_parents": 0,
            "inactive_parents": 0,
            "attendance_today": 0,
        })
    
    # Filter students by education level
    students_queryset = Student.objects.filter(education_level__in=education_levels)
    
    # Filter teachers by their classroom assignments
    from django.db.models import Q
    
    # Build Q objects for teacher filtering
    all_education_levels = ['PRIMARY', 'JUNIOR_SECONDARY', 'SENIOR_SECONDARY', 'NURSERY']
    disallowed_levels = [level for level in all_education_levels if level not in education_levels]
    
    # Teachers with assignments in allowed education levels only
    teachers_with_allowed_assignments_q = Q(
        classroomteacherassignment__classroom__section__grade_level__education_level__in=education_levels,
        classroomteacherassignment__is_active=True
    )
    
    # Exclude teachers who also have assignments in disallowed education levels
    if disallowed_levels:
        teachers_with_allowed_assignments_q = teachers_with_allowed_assignments_q & ~Q(
            classroomteacherassignment__classroom__section__grade_level__education_level__in=disallowed_levels,
            classroomteacherassignment__is_active=True
        )
    
    # Teachers with no assignments
    teachers_with_no_assignments_q = Q(classroomteacherassignment__isnull=True)
    
    # Combine both conditions
    teachers_queryset = Teacher.objects.filter(
        teachers_with_allowed_assignments_q | teachers_with_no_assignments_q
    ).distinct()
    
    # Filter classrooms by education level
    classrooms_queryset = Classroom.objects.filter(
        section__grade_level__education_level__in=education_levels
    )
    
    # Filter attendance by student's education level
    attendance_queryset = Attendance.objects.filter(
        student__education_level__in=education_levels
    )
    
    return Response(
        {
            "total_students": students_queryset.count(),
            "active_students": students_queryset.filter(is_active=True).count(),
            "inactive_students": students_queryset.filter(is_active=False).count(),
            "total_teachers": teachers_queryset.count(),
            "active_teachers": teachers_queryset.filter(is_active=True).count(),
            "inactive_teachers": teachers_queryset.filter(is_active=False).count(),
            "total_classes": classrooms_queryset.count(),
            "total_messages": Message.objects.count(),  # Messages are not section-specific
            "total_parents": ParentProfile.objects.count(),  # Parents are not section-specific
            "active_parents": ParentProfile.objects.filter(user__is_active=True).count(),
            "inactive_parents": ParentProfile.objects.filter(user__is_active=False).count(),
            "attendance_today": attendance_queryset.filter(
                date=datetime.date.today()
            ).count(),
        }
    )
