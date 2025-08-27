from rest_framework import viewsets, status, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from schoolSettings.permissions import HasStudentsPermission, HasStudentsPermissionOrReadOnly
from django.db.models import Avg, Count, Q
from django.shortcuts import get_object_or_404
from django.http import HttpResponse
from django_filters.rest_framework import DjangoFilterBackend
import csv
from datetime import date, timedelta
from django.utils import timezone
from .models import Student
from .serializers import (
    StudentDetailSerializer,
    StudentListSerializer,
    StudentCreateSerializer,
)
from attendance.models import Attendance
from result.models import StudentResult
from schoolSettings.models import SchoolAnnouncement
from events.models import Event
from academics.models import AcademicCalendar


class StudentViewSet(viewsets.ModelViewSet):
    permission_classes = [HasStudentsPermissionOrReadOnly]
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_fields = ["education_level", "student_class", "gender", "is_active"]
    search_fields = [
        "user__first_name",
        "user__last_name",
        "user__email",
        "parent_contact",
        "registration_number",
        "user__username",
    ]
    ordering_fields = ["user__first_name", "admission_date", "date_of_birth"]
    ordering = ["education_level", "student_class", "user__first_name"]

    def get_queryset(self):
        """Optimize queryset with select_related for better performance."""
        return Student.objects.select_related("user").prefetch_related("parents")  # type: ignore

    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == "list":
            return StudentListSerializer
        elif self.action == "create":
            return StudentCreateSerializer
        return StudentDetailSerializer

    def create(self, request, *args, **kwargs):
        # Allow unauthenticated POST requests for testing
        self.permission_classes = [AllowAny]
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        student = serializer.save()
        student_password = getattr(serializer, '_generated_student_password', None)
        student_username = getattr(serializer, '_generated_student_username', None)
        parent_password = getattr(serializer, '_generated_parent_password', None)
        headers = self.get_success_headers(serializer.data)
        # Return the student data and the generated passwords
        return Response(
            {
                "student": StudentDetailSerializer(student, context=self.get_serializer_context()).data,
                "student_username": student_username,
                "student_password": student_password,
                "parent_password": parent_password,
            },
            status=status.HTTP_201_CREATED,
            headers=headers,
        )  # type: ignore[unreachable]

    def retrieve(self, request, pk=None):
        """Enhanced retrieve with education-level specific data."""
        student = get_object_or_404(Student, pk=pk)
        student_data = StudentDetailSerializer(student).data

        # For now, return just the student data to fix the frontend issue
        # We can add the additional data back later if needed
        return Response(student_data)

    @action(detail=False, methods=["get"])
    def nursery_students(self, request):
        """Get all nursery students."""
        students = self.get_queryset().filter(education_level="NURSERY")
        serializer = StudentListSerializer(students, many=True)
        return Response({"count": students.count(), "students": serializer.data})

    @action(detail=False, methods=["get"])
    def primary_students(self, request):
        """Get all primary students."""
        students = self.get_queryset().filter(education_level="PRIMARY")
        serializer = StudentListSerializer(students, many=True)
        return Response({"count": students.count(), "students": serializer.data})

    @action(detail=False, methods=["get"])
    def secondary_students(self, request):
        """Get all secondary students."""
        students = self.get_queryset().filter(education_level="SECONDARY")
        serializer = StudentListSerializer(students, many=True)
        return Response({"count": students.count(), "students": serializer.data})

    @action(detail=False, methods=["get"])
    def students_by_class(self, request, class_name=None):
        """Get students by specific class."""
        if not class_name:
            return Response(
                {"error": "class_name parameter is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        students = self.get_queryset().filter(student_class=class_name)
        serializer = StudentListSerializer(students, many=True)
        return Response(
            {
                "class": class_name,
                "count": students.count(),
                "students": serializer.data,
            }
        )

    @action(detail=False, methods=["get"])
    def students_by_age_range(self, request, min_age=None, max_age=None):
        """Get students within a specific age range."""
        if not min_age or not max_age:
            return Response(
                {"error": "Both min_age and max_age parameters are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            min_age, max_age = int(min_age), int(max_age)
        except ValueError:
            return Response(
                {"error": "Age parameters must be integers"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Calculate date range for age filtering
        today = date.today()
        max_birth_date = today.replace(year=today.year - min_age)
        min_birth_date = today.replace(year=today.year - max_age - 1)

        students = self.get_queryset().filter(
            date_of_birth__gte=min_birth_date, date_of_birth__lte=max_birth_date
        )

        serializer = StudentListSerializer(students, many=True)
        return Response(
            {
                "age_range": f"{min_age}-{max_age} years",
                "count": students.count(),
                "students": serializer.data,
            }
        )

    @action(detail=False, methods=["get"])
    def student_statistics(self, request):
        """Get comprehensive student statistics."""
        queryset = self.get_queryset()

        stats = {
            "total_students": queryset.count(),
            "by_education_level": {
                "nursery": queryset.filter(education_level="NURSERY").count(),
                "primary": queryset.filter(education_level="PRIMARY").count(),
                "secondary": queryset.filter(education_level="SECONDARY").count(),
            },
            "by_gender": {
                "male": queryset.filter(gender="M").count(),
                "female": queryset.filter(gender="F").count(),
            },
            "age_distribution": self._get_age_distribution(queryset),
            "students_with_medical_conditions": queryset.exclude(
                Q(medical_conditions__isnull=True) | Q(medical_conditions__exact="")
            ).count(),
            "students_with_special_requirements": queryset.exclude(
                Q(special_requirements__isnull=True) | Q(special_requirements__exact="")
            ).count(),
        }

        return Response(stats)

    @action(detail=False, methods=["get"])
    def statistics_by_level(self, request):
        """Get detailed statistics broken down by education level."""
        queryset = self.get_queryset()

        stats_by_level = {}
        for level_code, level_name in [
            ("NURSERY", "Nursery"),
            ("PRIMARY", "Primary"),
            ("SECONDARY", "Secondary"),
        ]:
            level_students = queryset.filter(education_level=level_code)

            stats_by_level[level_code.lower()] = {
                "name": level_name,
                "total_count": level_students.count(),
                "gender_breakdown": {
                    "male": level_students.filter(gender="M").count(),
                    "female": level_students.filter(gender="F").count(),
                },
                "class_breakdown": dict(
                    level_students.values("student_class")
                    .annotate(count=Count("id"))
                    .values_list("student_class", "count")
                ),
                "average_age": self._calculate_average_age(level_students),
            }

            # Add level-specific metrics
            if level_code == "NURSERY":
                stats_by_level[level_code.lower()]["with_medical_conditions"] = (
                    level_students.exclude(
                        Q(medical_conditions__isnull=True)
                        | Q(medical_conditions__exact="")
                    ).count()
                )
                stats_by_level[level_code.lower()]["with_parent_contact"] = (
                    level_students.exclude(
                        Q(parent_contact__isnull=True) | Q(parent_contact__exact="")
                    ).count()
                )

        return Response(stats_by_level)

    @action(detail=False, methods=["get"])
    def students_with_medical_conditions(self, request):
        """Get students with medical conditions (important for nursery care)."""
        students = self.get_queryset().exclude(
            Q(medical_conditions__isnull=True) | Q(medical_conditions__exact="")
        )
        serializer = StudentListSerializer(students, many=True)
        return Response({"count": students.count(), "students": serializer.data})

    @action(detail=False, methods=["get"])
    def students_with_special_requirements(self, request):
        """Get students with special requirements."""
        students = self.get_queryset().exclude(
            Q(special_requirements__isnull=True) | Q(special_requirements__exact="")
        )
        serializer = StudentListSerializer(students, many=True)
        return Response({"count": students.count(), "students": serializer.data})

    @action(detail=True, methods=["get"])
    def emergency_contacts(self, request, pk=None):
        """Get emergency contact information for a student."""
        student = get_object_or_404(Student, pk=pk)

        contacts = []
        if student.parent_contact:
            contacts.append(
                {"type": "Parent", "number": student.parent_contact, "is_primary": True}
            )

        if (
            student.emergency_contact
            and student.emergency_contact != student.parent_contact
        ):
            contacts.append(
                {
                    "type": "Emergency",
                    "number": student.emergency_contact,
                    "is_primary": False,
                }
            )

        return Response(
            {"student_name": student.full_name, "emergency_contacts": contacts}
        )

    @action(detail=False, methods=["get"])
    def export_csv(self, request):
        """Export all students to CSV."""
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="students_export.csv"'

        writer = csv.writer(response)
        writer.writerow(
            [
                "ID",
                "Full Name",
                "Email",
                "Gender",
                "Date of Birth",
                "Age",
                "Education Level",
                "Class",
                "Parent Contact",
                "Emergency Contact",
                "Admission Date",
            ]
        )

        for student in self.get_queryset():
            writer.writerow(
                [
                    student.id,
                    student.full_name,
                    student.user.email,
                    student.get_gender_display(),
                    student.date_of_birth,
                    student.age,
                    student.get_education_level_display(),
                    student.get_student_class_display(),
                    student.parent_contact or "",
                    student.emergency_contact or "",
                    student.admission_date,
                ]
            )

        return response

    @action(detail=False, methods=["get"])
    def export_nursery_csv(self, request):
        """Export nursery students with additional nursery-specific fields."""
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = (
            'attachment; filename="nursery_students_export.csv"'
        )

        writer = csv.writer(response)
        writer.writerow(
            [
                "ID",
                "Full Name",
                "Age",
                "Gender",
                "Class",
                "Parent Contact",
                "Emergency Contact",
                "Medical Conditions",
                "Special Requirements",
                "Admission Date",
            ]
        )

        nursery_students = self.get_queryset().filter(education_level="NURSERY")
        for student in nursery_students:
            writer.writerow(
                [
                    student.id,
                    student.full_name,
                    student.age,
                    student.get_gender_display(),
                    student.get_student_class_display(),
                    student.parent_contact or "",
                    student.emergency_contact or "",
                    student.medical_conditions or "",
                    student.special_requirements or "",
                    student.admission_date,
                ]
            )

        return response

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        student = self.get_object()
        student.is_active = True
        
        # Also update the user's active status
        if hasattr(student, 'user') and student.user:
            student.user.is_active = True
            student.user.save()
        
        student.save()
        from .serializers import StudentDetailSerializer
        return Response({
            'status': 'student activated',
            'student': StudentDetailSerializer(student, context={'request': request}).data
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        student = self.get_object()
        student.is_active = False
        
        # Also update the user's active status
        if hasattr(student, 'user') and student.user:
            student.user.is_active = False
            student.user.save()
        
        student.save()
        from .serializers import StudentDetailSerializer
        return Response({
            'status': 'student deactivated',
            'student': StudentDetailSerializer(student, context={'request': request}).data
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def toggle_status(self, request, pk=None):
        """Toggle student active status (both user and student profile)"""
        try:
            student = self.get_object()
            new_status = not student.is_active
            
            # Update student profile
            student.is_active = new_status
            student.save()
            
            # Update user account if it exists
            if hasattr(student, 'user') and student.user:
                student.user.is_active = new_status
                student.user.save()
            
            from .serializers import StudentDetailSerializer
            return Response({
                'status': f'student {"activated" if new_status else "deactivated"}',
                'is_active': new_status,
                'student': StudentDetailSerializer(student, context={'request': request}).data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': f'Failed to toggle student status: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=["get"])
    def dashboard(self, request):
        """Get comprehensive dashboard data for the logged-in student."""
        print(f"Dashboard request from user: {request.user.username}")
        print(f"User has student_profile: {hasattr(request.user, 'student_profile')}")
        
        if not hasattr(request.user, 'student_profile'):
            # Try to get student profile directly
            try:
                student = Student.objects.get(user=request.user)
                print(f"Found student profile: {student}")
            except Student.DoesNotExist:
                print(f"No student profile found for user: {request.user.username}")
                return Response(
                    {"error": "User is not a student", "username": request.user.username}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            student = request.user.student_profile
        today = date.today()
        
        # Get attendance statistics
        total_attendance = Attendance.objects.filter(student=student).count()
        present_attendance = Attendance.objects.filter(
            student=student, 
            status='P'
        ).count()
        attendance_rate = (present_attendance / total_attendance * 100) if total_attendance > 0 else 0
        
        # Get recent attendance (last 30 days)
        thirty_days_ago = today - timedelta(days=30)
        recent_attendance = Attendance.objects.filter(
            student=student,
            date__gte=thirty_days_ago
        ).order_by('-date')[:10]
        
        # Get academic performance
        results = StudentResult.objects.filter(student=student)
        total_subjects = results.values('subject').distinct().count()
        
        # Calculate average score if results exist
        if results.exists():
            # Calculate average percentage from all results
            average_score = sum(result.percentage for result in results if result.percentage) / results.count()
        else:
            average_score = 0
        
        # Get today's classes (you might need to implement this based on your timetable model)
        today_classes = 0  # Placeholder - implement based on your timetable structure
        
        # Get recent activities (recent results, attendance, etc.)
        recent_activities = []
        
        # Add recent results
        recent_results = results.order_by('-created_at')[:5]
        for result in recent_results:
            recent_activities.append({
                'type': 'result',
                'title': f'{result.subject.name} Result',
                'description': f'Score: {result.total_score} ({result.percentage}%)',
                'date': result.created_at.strftime('%Y-%m-%d'),
                'time_ago': self._get_time_ago(result.created_at)
            })
        
        # Add recent attendance
        for attendance in recent_attendance[:5]:
            recent_activities.append({
                'type': 'attendance',
                'title': f'Attendance - {attendance.get_status_display()}',
                'description': f'Section: {attendance.section.name}',
                'date': attendance.date.strftime('%Y-%m-%d'),
                'time_ago': self._get_time_ago(attendance.date)
            })
        
        # Sort activities by date
        recent_activities.sort(key=lambda x: x['date'], reverse=True)
        recent_activities = recent_activities[:5]  # Limit to 5 most recent
        
        # Get announcements for students
        all_announcements = SchoolAnnouncement.objects.filter(
            is_active=True,
            start_date__lte=timezone.now(),
            end_date__gte=timezone.now()
        ).order_by('-is_pinned', '-created_at')
        
        # Filter for student announcements in Python
        announcements = [
            announcement for announcement in all_announcements 
            if 'student' in announcement.target_audience
        ][:5]
        
        announcements_data = []
        for announcement in announcements:
            announcements_data.append({
                'id': announcement.id,
                'title': announcement.title,
                'content': announcement.content,
                'type': announcement.announcement_type,
                'is_pinned': announcement.is_pinned,
                'created_at': announcement.created_at.strftime('%Y-%m-%d %H:%M'),
                'time_ago': self._get_time_ago(announcement.created_at)
            })
        
        # Get upcoming events
        upcoming_events = Event.objects.filter(
            is_active=True,
            is_published=True,
            start_date__gte=timezone.now()
        ).order_by('start_date')[:5]
        
        events_data = []
        for event in upcoming_events:
            events_data.append({
                'id': event.id,
                'title': event.title,
                'subtitle': event.subtitle,
                'description': event.description,
                'type': event.event_type,
                'start_date': event.start_date.strftime('%Y-%m-%d') if event.start_date else None,
                'end_date': event.end_date.strftime('%Y-%m-%d') if event.end_date else None,
                'days_until': (event.start_date.date() - today).days if event.start_date else None
            })
        
        # Get academic calendar events
        academic_calendar = AcademicCalendar.objects.filter(
            is_active=True,
            start_date__gte=today
        ).order_by('start_date')[:10]
        
        calendar_data = []
        for event in academic_calendar:
            calendar_data.append({
                'id': event.id,
                'title': event.title,
                'description': event.description,
                'type': event.event_type,
                'start_date': event.start_date.strftime('%Y-%m-%d'),
                'end_date': event.end_date.strftime('%Y-%m-%d') if event.end_date else None,
                'location': event.location,
                'days_until': (event.start_date - today).days
            })
        
        dashboard_data = {
            'student_info': {
                'name': student.full_name,
                'class': student.get_student_class_display(),
                'education_level': student.get_education_level_display(),
                'registration_number': student.registration_number,
                'admission_date': student.admission_date.strftime('%Y-%m-%d') if student.admission_date else None,
            },
            'statistics': {
                'performance': {
                    'average_score': round(average_score, 1),
                    'label': 'Average Score'
                },
                'attendance': {
                    'rate': round(attendance_rate, 1),
                    'present': present_attendance,
                    'total': total_attendance,
                    'label': 'Present Rate'
                },
                'subjects': {
                    'count': total_subjects,
                    'label': 'Total Subjects'
                },
                'schedule': {
                    'classes_today': today_classes,
                    'label': 'Classes Today'
                }
            },
            'recent_activities': recent_activities,
            'announcements': announcements_data,
            'upcoming_events': events_data,
            'academic_calendar': calendar_data,
            'quick_stats': {
                'total_results': results.count(),
                'this_term_results': results.filter(
                    created_at__month=today.month
                ).count(),
                'attendance_this_month': Attendance.objects.filter(
                    student=student,
                    date__month=today.month
                ).count(),
            }
        }
        
        return Response(dashboard_data)

    def _get_time_ago(self, date_obj):
        """Helper method to get human-readable time ago."""
        from datetime import datetime
        if isinstance(date_obj, date):
            date_obj = datetime.combine(date_obj, datetime.min.time())
        
        now = datetime.now()
        diff = now - date_obj
        
        if diff.days > 0:
            if diff.days == 1:
                return "Yesterday"
            elif diff.days < 7:
                return f"{diff.days} days ago"
            else:
                weeks = diff.days // 7
                return f"{weeks} week{'s' if weeks > 1 else ''} ago"
        else:
            hours = diff.seconds // 3600
            if hours > 0:
                return f"{hours} hour{'s' if hours > 1 else ''} ago"
            else:
                minutes = (diff.seconds % 3600) // 60
                return f"{minutes} minute{'s' if minutes > 1 else ''} ago"

    def _get_age_group(self, age):
        """Categorize age into groups."""
        if age <= 3:
            return "Toddler"
        elif age <= 5:
            return "Pre-K"
        elif age <= 8:
            return "Early Elementary"
        elif age <= 12:
            return "Elementary"
        elif age <= 15:
            return "Middle School"
        else:
            return "High School"

    def _get_age_distribution(self, queryset):
        """Calculate age distribution across all students."""
        distribution = {"0-3": 0, "4-6": 0, "7-12": 0, "13-18": 0, "18+": 0}

        for student in queryset:
            age = student.age
            if age <= 3:
                distribution["0-3"] += 1
            elif age <= 6:
                distribution["4-6"] += 1
            elif age <= 12:
                distribution["7-12"] += 1
            elif age <= 18:
                distribution["13-18"] += 1
            else:
                distribution["18+"] += 1

        return distribution

    def _calculate_average_age(self, queryset):
        """Calculate average age for a queryset."""
        if not queryset.exists():
            return 0

        total_age = sum(student.age for student in queryset)
        return round(total_age / queryset.count(), 1)

    @action(detail=False, methods=["get"])
    def profile(self, request):
        """Get detailed profile information for the logged-in student."""
        try:
            # Get the student profile for the current user
            if hasattr(request.user, 'student_profile'):
                student = request.user.student_profile
            else:
                student = Student.objects.get(user=request.user)
            
            # Use the detailed serializer to get comprehensive profile data
            serializer = StudentDetailSerializer(student, context={'request': request})
            profile_data = serializer.data
            
            # Add additional profile-specific data
            profile_data.update({
                'user_info': {
                    'username': student.user.username,
                    'email': student.user.email,
                    'first_name': student.user.first_name,
                    'last_name': student.user.last_name,
                    'middle_name': student.user.middle_name,
                    'is_active': student.user.is_active,
                    'date_joined': student.user.date_joined,
                },
                'academic_info': {
                    'class': student.get_student_class_display(),
                    'education_level': student.get_education_level_display(),
                    'admission_date': student.admission_date,
                    'registration_number': student.registration_number,
                    'classroom': student.classroom,
                },
                'contact_info': {
                    'parent_contact': student.parent_contact,
                    'emergency_contact': student.emergency_contact,
                },
                'medical_info': {
                    'medical_conditions': student.medical_conditions,
                    'special_requirements': student.special_requirements,
                }
            })
            
            return Response(profile_data)
            
        except Student.DoesNotExist:
            return Response(
                {"error": "Student profile not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": f"Failed to fetch profile: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
