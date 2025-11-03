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


# @method_decorator(csrf_exempt, name="dispatch")
# class ParentViewSet(viewsets.ModelViewSet):
#     queryset = ParentProfile.objects.all()  # type: ignore
#     serializer_class = ParentProfileSerializer
#     permission_classes = [IsParentOrAdmin]

#     @action(
#         detail=False, methods=["get"], url_path="search", permission_classes=[AllowAny]
#     )
#     def search(self, request):
#         """Search parents by name, username, or email."""
#         query = request.query_params.get("q", "")
#         parents = ParentProfile.objects.select_related("user")  # type: ignore[attr-defined]
#         if query:
#             parents = parents.filter(  # type: ignore[attr-defined]
#                 Q(user__first_name__icontains=query)
#                 | Q(user__last_name__icontains=query)
#                 | Q(user__username__icontains=query)
#                 | Q(user__email__icontains=query)
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
#             )[
#                 :5
#             ]
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

#     @action(detail=True, methods=["post"])
#     def activate(self, request, pk=None):
#         try:
#             parent = ParentProfile.objects.get(pk=pk)  # type: ignore
#         except ParentProfile.DoesNotExist:  # type: ignore
#             raise NotFound("Parent profile not found.")
#         parent.user.is_active = True
#         parent.user.save()
#         return Response({"status": "parent activated"})

#     @action(detail=True, methods=["post"])
#     def deactivate(self, request, pk=None):
#         try:
#             parent = ParentProfile.objects.get(pk=pk)  # type: ignore
#         except ParentProfile.DoesNotExist:  # type: ignore
#             raise NotFound("Parent profile not found.")
#         parent.user.is_active = False
#         parent.user.save()
#         return Response({"status": "parent deactivated"})

#     @action(detail=True, methods=["post"])
#     def add_student(self, request, pk=None):
#         """Add a new student to an existing parent."""
#         try:
#             parent = ParentProfile.objects.get(pk=pk)  # type: ignore
#         except ParentProfile.DoesNotExist:  # type: ignore
#             raise NotFound("Parent profile not found.")

#         # Use the student creation serializer with existing_parent_id
#         from students.serializers import StudentCreateSerializer

#         student_data = request.data.copy()
#         student_data["existing_parent_id"] = pk

#         serializer = StudentCreateSerializer(data=student_data)
#         serializer.is_valid(raise_exception=True)
#         student = serializer.save()

#         return Response(
#             {
#                 "status": "student added to parent",
#                 "student": {
#                     "id": student.id,
#                     "name": student.user.full_name,
#                     "email": student.user.email,
#                 },
#                 "student_password": getattr(
#                     serializer, "_generated_student_password", None
#                 ),
#             },
#             status=status.HTTP_201_CREATED,
#         )

#     @action(detail=True, methods=["post"])
#     def add_existing_student(self, request, pk=None):
#         """Link an existing student to a parent."""
#         try:
#             parent = ParentProfile.objects.get(pk=pk)  # type: ignore
#         except ParentProfile.DoesNotExist:  # type: ignore
#             raise NotFound("Parent profile not found.")

#         student_id = request.data.get("student_id")
#         if not student_id:
#             return Response(
#                 {"error": "student_id is required"}, status=status.HTTP_400_BAD_REQUEST
#             )

#         try:
#             from students.models import Student

#             student = Student.objects.get(id=student_id)  # type: ignore
#         except Student.DoesNotExist:  # type: ignore
#             return Response(
#                 {"error": "Student not found"}, status=status.HTTP_404_NOT_FOUND
#             )

#         # Check if student is already linked to this parent
#         if parent.students.filter(id=student_id).exists():
#             return Response(
#                 {"error": "Student is already linked to this parent"},
#                 status=status.HTTP_400_BAD_REQUEST,
#             )

#         # Link student to parent
#         parent.students.add(student)

#         return Response(
#             {
#                 "status": "existing student linked to parent",
#                 "student": {
#                     "id": student.id,
#                     "name": student.user.full_name,
#                     "email": student.user.email,
#                 },
#             },
#             status=status.HTTP_200_OK,
#         )


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

from attendance.models import Attendance
from result.models import StudentResult
from users.models import CustomUser


@method_decorator(csrf_exempt, name="dispatch")
class ParentViewSet(viewsets.ModelViewSet):
    queryset = ParentProfile.objects.all()
    serializer_class = ParentProfileSerializer
    permission_classes = [IsParentOrAdmin]

    def _get_section_education_levels(self, user):
        """
        Helper method to get education levels based on user's section/role
        Returns a list of education levels the user can access
        """
        SECTION_TO_EDUCATION_LEVEL = {
            "nursery": ["NURSERY"],
            "primary": ["PRIMARY"],
            "junior_secondary": ["JUNIOR_SECONDARY"],
            "senior_secondary": ["SENIOR_SECONDARY"],
            "secondary": ["JUNIOR_SECONDARY", "SENIOR_SECONDARY"],
        }

        ROLE_TO_SECTION = {
            "nursery_admin": "nursery",
            "primary_admin": "primary",
            "junior_secondary_admin": "junior_secondary",
            "senior_secondary_admin": "senior_secondary",
            "secondary_admin": "secondary",
        }

        user_section = user.section
        if not user_section and user.role in ROLE_TO_SECTION:
            user_section = ROLE_TO_SECTION[user.role]

        return SECTION_TO_EDUCATION_LEVEL.get(user_section, [])

    def get_queryset(self):
        """
        Filter parents based on user role and section access.
        - Superadmin: See all parents
        - Section Admin: See only parents with children in their section
        - Regular Staff: See all parents
        - Parent: See only their own profile
        """
        queryset = ParentProfile.objects.select_related("user")
        user = self.request.user

        if not user.is_authenticated:
            return queryset.none()

        # 🟢 SUPERADMIN: See all parents
        if user.is_superuser:
            return queryset

        # 🟢 SECTION ADMINS: See only parents with children in their section
        if user.is_staff and user.is_section_admin:
            education_levels = self._get_section_education_levels(user)
            if not education_levels:
                return queryset.none()

            # Filter parents who have at least one child in the section's education level
            return queryset.filter(
                students__education_level__in=education_levels
            ).distinct()

        # 🟢 REGULAR STAFF: See all parents
        if user.is_staff:
            return queryset

        # 🟢 PARENT: See only their own profile
        try:
            parent = ParentProfile.objects.get(user=user)
            return queryset.filter(id=parent.id)
        except ParentProfile.DoesNotExist:
            return queryset.none()

    @action(
        detail=False, methods=["get"], url_path="search", permission_classes=[AllowAny]
    )
    def search(self, request):
        """Search parents by name, username, or email - respects section filtering."""
        query = request.query_params.get("q", "")

        # Use get_queryset() to apply section filtering
        parents = self.get_queryset()

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
            }
            for parent in parents
        ]
        return Response(results)

    def retrieve(self, request, pk=None):
        """
        Retrieve parent profile - section admins can only see parents in their section.
        """
        if pk:
            # If pk is provided, use standard retrieve with permission check
            try:
                parent = self.get_queryset().get(pk=pk)
            except ParentProfile.DoesNotExist:
                raise NotFound("Parent profile not found or you don't have access.")
        else:
            # If no pk, return current user's parent profile
            try:
                parent = request.user.parent_profile
            except ParentProfile.DoesNotExist:
                raise NotFound("Parent profile not found.")

        serializer = ParentProfileSerializer(parent)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="dashboard")
    def dashboard(self, request):
        """
        Parent dashboard - section admins see filtered data based on their section.
        """
        user = request.user

        # For section admins viewing a specific parent's dashboard
        parent_id = request.query_params.get("parent_id")

        if parent_id and (
            user.is_superuser or (user.is_staff and user.is_section_admin)
        ):
            # Admin viewing a specific parent's dashboard
            try:
                parent = self.get_queryset().get(id=parent_id)
            except ParentProfile.DoesNotExist:
                raise NotFound("Parent profile not found or you don't have access.")
        else:
            # Parent viewing their own dashboard
            try:
                parent = request.user.parent_profile
            except ParentProfile.DoesNotExist:
                raise NotFound("Parent profile not found.")

        # Get students - filter by section if section admin
        students = parent.students.all()

        if user.is_staff and user.is_section_admin:
            education_levels = self._get_section_education_levels(user)
            if education_levels:
                students = students.filter(education_level__in=education_levels)

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
        """Activate parent - respects section filtering."""
        try:
            parent = self.get_queryset().get(pk=pk)
        except ParentProfile.DoesNotExist:
            raise NotFound("Parent profile not found or you don't have access.")

        parent.user.is_active = True
        parent.user.save()
        return Response({"status": "parent activated"})

    @action(detail=True, methods=["post"])
    def deactivate(self, request, pk=None):
        """Deactivate parent - respects section filtering."""
        try:
            parent = self.get_queryset().get(pk=pk)
        except ParentProfile.DoesNotExist:
            raise NotFound("Parent profile not found or you don't have access.")

        parent.user.is_active = False
        parent.user.save()
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

        # Use the student creation serializer with existing_parent_id
        from students.serializers import StudentCreateSerializer

        student_data = request.data.copy()
        student_data["existing_parent_id"] = pk

        # For section admins, validate that the student's education level matches their section
        user = request.user
        if user.is_staff and user.is_section_admin:
            education_levels = self._get_section_education_levels(user)
            student_education_level = student_data.get("education_level")

            if (
                student_education_level
                and student_education_level not in education_levels
            ):
                return Response(
                    {
                        "error": f"You can only add students in your section ({', '.join(education_levels)})"
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

        serializer = StudentCreateSerializer(data=student_data)
        serializer.is_valid(raise_exception=True)
        student = serializer.save()

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

        # For section admins, validate that the student is in their section
        user = request.user
        if user.is_staff and user.is_section_admin:
            education_levels = self._get_section_education_levels(user)
            if student.education_level not in education_levels:
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
