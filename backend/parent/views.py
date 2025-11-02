# from rest_framework import viewsets, status
# from rest_framework.decorators import action
# from rest_framework.response import Response
# from rest_framework.exceptions import NotFound
# from rest_framework.permissions import AllowAny
# from django.db.models import Avg, Q
# from django.utils.decorators import method_decorator
# from django.views.decorators.csrf import csrf_exempt

# from .models import ParentProfile
# from .serializers import ParentProfileSerializer
# from .permissions import IsParent, IsParentOrAdmin

# from attendance.models import Attendance
# from result.models import StudentResult
# from users.models import CustomUser


# @method_decorator(csrf_exempt, name='dispatch')
# class ParentViewSet(viewsets.ModelViewSet):
#     queryset = ParentProfile.objects.all()  # type: ignore
#     serializer_class = ParentProfileSerializer
#     permission_classes = [IsParentOrAdmin]

#     @action(detail=False, methods=["get"], url_path="search", permission_classes=[AllowAny])
#     def search(self, request):
#         """Search parents by name, username, or email."""
#         query = request.query_params.get("q", "")
#         parents = ParentProfile.objects.select_related("user")  # type: ignore[attr-defined]
#         if query:
#             parents = parents.filter(  # type: ignore[attr-defined]
#                 Q(user__first_name__icontains=query) |
#                 Q(user__last_name__icontains=query) |
#                 Q(user__username__icontains=query) |
#                 Q(user__email__icontains=query)
#             )
#         results = [
#             {
#                 "id": parent.id,  # type: ignore[attr-defined]
#                 "user_id": parent.user.id,  # type: ignore[attr-defined]
#                 "full_name": parent.user.full_name,  # type: ignore[attr-defined]
#                 "username": parent.user.username,  # type: ignore[attr-defined]
#                 "email": parent.user.email,  # type: ignore[attr-defined]
#                 "phone": parent.phone,  # type: ignore[attr-defined]
#                 "address": parent.address,  # type: ignore[attr-defined]
#             }
#             for parent in parents  # type: ignore[attr-defined]
#         ]
#         return Response(results)

#     def retrieve(self, request):
#         try:
#             parent = request.user.parent_profile
#         except ParentProfile.DoesNotExist:  # type: ignore
#             raise NotFound("Parent profile not found.")

#         serializer = ParentProfileSerializer(parent)
#         return Response(serializer.data)

#     @action(detail=False, methods=["get"], url_path="dashboard")
#     def dashboard(self, request):
#         try:
#             parent = request.user.parent_profile
#         except ParentProfile.DoesNotExist:  # type: ignore
#             raise NotFound("Parent profile not found.")

#         students = parent.students.all()
#         dashboard_data = []

#         for student in students:
#             attendance_records = Attendance.objects.filter(student=student)  # type: ignore
#             total_attendance = attendance_records.count()
#             present_count = attendance_records.filter(status="present").count()
#             attendance_percentage = (
#                 round((present_count / total_attendance) * 100, 2)
#                 if total_attendance
#                 else 0
#             )

#             avg_score = (
#                 StudentResult.objects.filter(student=student).aggregate(  # type: ignore
#                     avg=Avg("score")
#                 )["avg"]
#                 or 0
#             )

#             recent_attendance = attendance_records.order_by("-attendance_date")[:5]
#             attendance_list = [
#                 {"date": att.attendance_date, "status": att.status}
#                 for att in recent_attendance
#             ]

#             recent_results = StudentResult.objects.filter(student=student).order_by(  # type: ignore
#                 "-exam__exam_date"
#             )[:5]
#             result_list = [
#                 {
#                     "subject": getattr(
#                         getattr(res.exam, "subject", None), "name", "N/A"
#                     ),
#                     "score": res.score,
#                     "exam_date": getattr(res.exam, "exam_date", None),
#                 }
#                 for res in recent_results
#             ]

#             dashboard_data.append(
#                 {
#                     "student_id": student.id,
#                     "student": student.full_name,
#                     "attendance_percentage": attendance_percentage,
#                     "average_score": round(avg_score, 2),
#                     "recent_attendance": attendance_list,
#                     "recent_results": result_list,
#                     "alert": "Low performance" if avg_score < 50 else None,
#                 }
#             )

#         return Response({"dashboard": dashboard_data})

#     @action(detail=True, methods=['post'])
#     def activate(self, request, pk=None):
#         try:
#             parent = ParentProfile.objects.get(pk=pk)  # type: ignore
#         except ParentProfile.DoesNotExist:  # type: ignore
#             raise NotFound("Parent profile not found.")
#         parent.user.is_active = True
#         parent.user.save()
#         return Response({'status': 'parent activated'})

#     @action(detail=True, methods=['post'])
#     def deactivate(self, request, pk=None):
#         try:
#             parent = ParentProfile.objects.get(pk=pk)  # type: ignore
#         except ParentProfile.DoesNotExist:  # type: ignore
#             raise NotFound("Parent profile not found.")
#         parent.user.is_active = False
#         parent.user.save()
#         return Response({'status': 'parent deactivated'})

#     @action(detail=True, methods=['post'])
#     def add_student(self, request, pk=None):
#         """Add a new student to an existing parent."""
#         try:
#             parent = ParentProfile.objects.get(pk=pk)  # type: ignore
#         except ParentProfile.DoesNotExist:  # type: ignore
#             raise NotFound("Parent profile not found.")

#         # Use the student creation serializer with existing_parent_id
#         from students.serializers import StudentCreateSerializer
#         student_data = request.data.copy()
#         student_data['existing_parent_id'] = pk

#         serializer = StudentCreateSerializer(data=student_data)
#         serializer.is_valid(raise_exception=True)
#         student = serializer.save()

#         return Response({
#             'status': 'student added to parent',
#             'student': {
#                 'id': student.id,
#                 'name': student.user.full_name,
#                 'email': student.user.email
#             },
#             'student_password': getattr(serializer, '_generated_student_password', None)
#         }, status=status.HTTP_201_CREATED)

#     @action(detail=True, methods=['post'])
#     def add_existing_student(self, request, pk=None):
#         """Link an existing student to a parent."""
#         try:
#             parent = ParentProfile.objects.get(pk=pk)  # type: ignore
#         except ParentProfile.DoesNotExist:  # type: ignore
#             raise NotFound("Parent profile not found.")

#         student_id = request.data.get('student_id')
#         if not student_id:
#             return Response({'error': 'student_id is required'}, status=status.HTTP_400_BAD_REQUEST)

#         try:
#             from students.models import Student
#             student = Student.objects.get(id=student_id)  # type: ignore
#         except Student.DoesNotExist:  # type: ignore
#             return Response({'error': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)

#         # Check if student is already linked to this parent
#         if parent.students.filter(id=student_id).exists():
#             return Response({'error': 'Student is already linked to this parent'}, status=status.HTTP_400_BAD_REQUEST)

#         # Link student to parent
#         parent.students.add(student)

#         return Response({
#             'status': 'existing student linked to parent',
#             'student': {
#                 'id': student.id,
#                 'name': student.user.full_name,
#                 'email': student.user.email
#             }
#         }, status=status.HTTP_200_OK)


# parent/views.py - UPDATED with section filtering

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import NotFound
from rest_framework.permissions import AllowAny
from django.db.models import Avg, Q
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

from .models import ParentProfile
from .serializers import ParentProfileSerializer
from .permissions import IsParent, IsParentOrAdmin
from users.permissions import CanManageSection  # ✅ Add this import

from attendance.models import Attendance
from result.models import StudentResult
from users.models import CustomUser

import logging

logger = logging.getLogger(__name__)


@method_decorator(csrf_exempt, name="dispatch")
class ParentViewSet(viewsets.ModelViewSet):
    queryset = ParentProfile.objects.all()
    serializer_class = ParentProfileSerializer
    permission_classes = [IsParentOrAdmin, CanManageSection]  # ✅ Add CanManageSection

    def get_queryset(self):
        """
        Filter parents based on user role and section.
        - Superadmins: See all parents
        - Section admins: See only parents whose children are in their section
        - Parents: See only themselves
        """
        queryset = ParentProfile.objects.select_related("user").prefetch_related(
            "students__grade_level__section"
        )

        user = self.request.user

        # Superadmin sees all parents
        if user.role == "superadmin" or user.is_superuser:
            logger.info(f"Superadmin {user.email} accessing all parents")
            return queryset

        # Section admins see only parents with children in their section
        if user.is_section_admin and user.section:
            # Filter parents whose students are in the admin's section
            filtered_queryset = queryset.filter(
                students__grade_level__section=user.section
            ).distinct()

            logger.info(
                f"Section admin {user.email} ({user.section}) accessing "
                f"{filtered_queryset.count()} parents"
            )
            return filtered_queryset

        # Parents see only their own profile
        if user.role == "parent":
            try:
                parent_profile = ParentProfile.objects.get(user=user)
                return queryset.filter(id=parent_profile.id)
            except ParentProfile.DoesNotExist:
                return queryset.none()

        # Unknown role - no access
        logger.warning(f"User {user.email} with role {user.role} denied parent access")
        return queryset.none()

    @action(
        detail=False, methods=["get"], url_path="search", permission_classes=[AllowAny]
    )
    def search(self, request):
        """
        Search parents by name, username, or email.
        Section admins can only search within their section.
        """
        query = request.query_params.get("q", "")
        user = request.user

        # Start with role-filtered queryset
        parents = self.get_queryset()

        # Apply search filter
        if query:
            parents = parents.filter(
                Q(user__first_name__icontains=query)
                | Q(user__last_name__icontains=query)
                | Q(user__username__icontains=query)
                | Q(user__email__icontains=query)
            )

        results = [
            {
                "id": parent.id,
                "user_id": parent.user.id,
                "full_name": parent.user.full_name,
                "username": parent.user.username,
                "email": parent.user.email,
                "phone": parent.phone,
                "address": parent.address,
                "section": self._get_parent_section(parent),  # ✅ Add section info
            }
            for parent in parents
        ]

        return Response(results)

    def _get_parent_section(self, parent):
        """Helper to get the primary section of a parent based on their children"""
        students = parent.students.all()
        if students:
            # Return the section of the first child (or most common section)
            sections = [
                s.grade_level.section
                for s in students
                if hasattr(s.grade_level, "section")
            ]
            if sections:
                return sections[0]
        return None

    def retrieve(self, request, pk=None):
        """
        Retrieve parent profile with section-based access control.
        """
        if pk:
            # Admin/section admin retrieving specific parent
            try:
                parent = self.get_queryset().get(pk=pk)
            except ParentProfile.DoesNotExist:
                raise NotFound("Parent profile not found or you don't have access.")
        else:
            # Parent retrieving their own profile
            try:
                parent = request.user.parent_profile
            except ParentProfile.DoesNotExist:
                raise NotFound("Parent profile not found.")

        # Verify access
        if not self._can_access_parent(request.user, parent):
            raise NotFound("You don't have permission to access this parent profile.")

        serializer = ParentProfileSerializer(parent)
        return Response(serializer.data)

    def _can_access_parent(self, user, parent):
        """Check if user can access this parent profile"""
        # Superadmin can access all
        if user.role == "superadmin" or user.is_superuser:
            return True

        # Section admin can access if parent has children in their section
        if user.is_section_admin and user.section:
            return parent.students.filter(grade_level__section=user.section).exists()

        # Parent can access their own profile
        if user.role == "parent":
            return parent.user == user

        return False

    @action(detail=False, methods=["get"], url_path="dashboard")
    def dashboard(self, request):
        """Parent dashboard with section-based filtering"""
        try:
            parent = request.user.parent_profile
        except ParentProfile.DoesNotExist:
            raise NotFound("Parent profile not found.")

        # Get students accessible to this parent
        students = parent.students.all()

        # If user is section admin, filter students by section
        if request.user.is_section_admin and request.user.section:
            students = students.filter(grade_level__section=request.user.section)

        dashboard_data = []

        for student in students:
            attendance_records = Attendance.objects.filter(student=student)
            total_attendance = attendance_records.count()
            present_count = attendance_records.filter(status="present").count()
            attendance_percentage = (
                round((present_count / total_attendance) * 100, 2)
                if total_attendance
                else 0
            )

            avg_score = (
                StudentResult.objects.filter(student=student).aggregate(
                    avg=Avg("score")
                )["avg"]
                or 0
            )

            recent_attendance = attendance_records.order_by("-attendance_date")[:5]
            attendance_list = [
                {"date": att.attendance_date, "status": att.status}
                for att in recent_attendance
            ]

            recent_results = StudentResult.objects.filter(student=student).order_by(
                "-exam__exam_date"
            )[:5]
            result_list = [
                {
                    "subject": getattr(
                        getattr(res.exam, "subject", None), "name", "N/A"
                    ),
                    "score": res.score,
                    "exam_date": getattr(res.exam, "exam_date", None),
                }
                for res in recent_results
            ]

            dashboard_data.append(
                {
                    "student_id": student.id,
                    "student": student.full_name,
                    "attendance_percentage": attendance_percentage,
                    "average_score": round(avg_score, 2),
                    "recent_attendance": attendance_list,
                    "recent_results": result_list,
                    "alert": "Low performance" if avg_score < 50 else None,
                }
            )

        return Response({"dashboard": dashboard_data})

    @action(detail=True, methods=["post"])
    def activate(self, request, pk=None):
        """Activate parent - with section-based access control"""
        try:
            parent = self.get_queryset().get(pk=pk)
        except ParentProfile.DoesNotExist:
            raise NotFound("Parent profile not found or you don't have access.")

        if not self._can_access_parent(request.user, parent):
            return Response(
                {"error": "You do not have permission to activate this parent"},
                status=status.HTTP_403_FORBIDDEN,
            )

        parent.user.is_active = True
        parent.user.save()
        logger.info(f"Parent {parent.user.email} activated by {request.user.email}")
        return Response({"status": "parent activated"})

    @action(detail=True, methods=["post"])
    def deactivate(self, request, pk=None):
        """Deactivate parent - with section-based access control"""
        try:
            parent = self.get_queryset().get(pk=pk)
        except ParentProfile.DoesNotExist:
            raise NotFound("Parent profile not found or you don't have access.")

        if not self._can_access_parent(request.user, parent):
            return Response(
                {"error": "You do not have permission to deactivate this parent"},
                status=status.HTTP_403_FORBIDDEN,
            )

        parent.user.is_active = False
        parent.user.save()
        logger.info(f"Parent {parent.user.email} deactivated by {request.user.email}")
        return Response({"status": "parent deactivated"})

    @action(detail=True, methods=["post"])
    def add_student(self, request, pk=None):
        """
        Add a new student to an existing parent.
        Section admins can only add students to parents in their section.
        """
        try:
            parent = self.get_queryset().get(pk=pk)
        except ParentProfile.DoesNotExist:
            raise NotFound("Parent profile not found or you don't have access.")

        if not self._can_access_parent(request.user, parent):
            return Response(
                {"error": "You do not have permission to add students to this parent"},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Use the student creation serializer with existing_parent_id
        from students.serializers import StudentCreateSerializer

        student_data = request.data.copy()
        student_data["existing_parent_id"] = pk

        # If section admin, ensure student is in their section
        if request.user.is_section_admin and request.user.section:
            grade_level_id = student_data.get("grade_level")
            if grade_level_id:
                from classroom.models import GradeLevel

                try:
                    grade_level = GradeLevel.objects.get(id=grade_level_id)
                    if grade_level.section != request.user.section:
                        return Response(
                            {"error": "You can only add students to your section"},
                            status=status.HTTP_403_FORBIDDEN,
                        )
                except GradeLevel.DoesNotExist:
                    pass

        serializer = StudentCreateSerializer(data=student_data)
        serializer.is_valid(raise_exception=True)
        student = serializer.save()

        logger.info(
            f"Student {student.user.email} added to parent {parent.user.email} "
            f"by {request.user.email}"
        )

        return Response(
            {
                "status": "student added to parent",
                "student": {
                    "id": student.id,
                    "name": student.user.full_name,
                    "email": student.user.email,
                },
                "student_password": getattr(
                    serializer, "_generated_student_password", None
                ),
            },
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["post"])
    def add_existing_student(self, request, pk=None):
        """
        Link an existing student to a parent.
        Section admins can only link students in their section.
        """
        try:
            parent = self.get_queryset().get(pk=pk)
        except ParentProfile.DoesNotExist:
            raise NotFound("Parent profile not found or you don't have access.")

        if not self._can_access_parent(request.user, parent):
            return Response(
                {"error": "You do not have permission to link students to this parent"},
                status=status.HTTP_403_FORBIDDEN,
            )

        student_id = request.data.get("student_id")
        if not student_id:
            return Response(
                {"error": "student_id is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            from students.models import Student

            student = Student.objects.get(id=student_id)
        except Student.DoesNotExist:
            return Response(
                {"error": "Student not found"}, status=status.HTTP_404_NOT_FOUND
            )

        # Section admin can only link students in their section
        if request.user.is_section_admin and request.user.section:
            if student.grade_level.section != request.user.section:
                return Response(
                    {"error": "You can only link students from your section"},
                    status=status.HTTP_403_FORBIDDEN,
                )

        # Check if student is already linked to this parent
        if parent.students.filter(id=student_id).exists():
            return Response(
                {"error": "Student is already linked to this parent"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Link student to parent
        parent.students.add(student)

        logger.info(
            f"Existing student {student.user.email} linked to parent {parent.user.email} "
            f"by {request.user.email}"
        )

        return Response(
            {
                "status": "existing student linked to parent",
                "student": {
                    "id": student.id,
                    "name": student.user.full_name,
                    "email": student.user.email,
                },
            },
            status=status.HTTP_200_OK,
        )
