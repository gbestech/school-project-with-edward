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
    queryset = ParentProfile.objects.all()  # type: ignore
    serializer_class = ParentProfileSerializer
    permission_classes = [IsParentOrAdmin]

    @action(
        detail=False, methods=["get"], url_path="search", permission_classes=[AllowAny]
    )
    def search(self, request):
        """Search parents by name, username, or email."""
        query = request.query_params.get("q", "")
        parents = ParentProfile.objects.select_related("user")  # type: ignore[attr-defined]
        if query:
            parents = parents.filter(  # type: ignore[attr-defined]
                Q(user__first_name__icontains=query)
                | Q(user__last_name__icontains=query)
                | Q(user__username__icontains=query)
                | Q(user__email__icontains=query)
            )
        results = [
            {
                "id": parent.id,  # type: ignore[attr-defined]
                "user_id": parent.user.id,  # type: ignore[attr-defined]
                "full_name": parent.user.full_name,  # type: ignore[attr-defined]
                "username": parent.user.username,  # type: ignore[attr-defined]
                "email": parent.user.email,  # type: ignore[attr-defined]
                "phone": parent.phone,  # type: ignore[attr-defined]
                "address": parent.address,  # type: ignore[attr-defined]
            }
            for parent in parents  # type: ignore[attr-defined]
        ]
        return Response(results)

    def retrieve(self, request):
        try:
            parent = request.user.parent_profile
        except ParentProfile.DoesNotExist:  # type: ignore
            raise NotFound("Parent profile not found.")

        serializer = ParentProfileSerializer(parent)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="dashboard")
    def dashboard(self, request):
        try:
            parent = request.user.parent_profile
        except ParentProfile.DoesNotExist:  # type: ignore
            raise NotFound("Parent profile not found.")

        students = parent.students.all()
        dashboard_data = []

        for student in students:
            attendance_records = Attendance.objects.filter(student=student)  # type: ignore
            total_attendance = attendance_records.count()
            present_count = attendance_records.filter(status="present").count()
            attendance_percentage = (
                round((present_count / total_attendance) * 100, 2)
                if total_attendance
                else 0
            )

            avg_score = (
                StudentResult.objects.filter(student=student).aggregate(  # type: ignore
                    avg=Avg("score")
                )["avg"]
                or 0
            )

            recent_attendance = attendance_records.order_by("-attendance_date")[:5]
            attendance_list = [
                {"date": att.attendance_date, "status": att.status}
                for att in recent_attendance
            ]

            recent_results = StudentResult.objects.filter(student=student).order_by(  # type: ignore
                "-exam__exam_date"
            )[
                :5
            ]
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
        try:
            parent = ParentProfile.objects.get(pk=pk)  # type: ignore
        except ParentProfile.DoesNotExist:  # type: ignore
            raise NotFound("Parent profile not found.")
        parent.user.is_active = True
        parent.user.save()
        return Response({"status": "parent activated"})

    @action(detail=True, methods=["post"])
    def deactivate(self, request, pk=None):
        try:
            parent = ParentProfile.objects.get(pk=pk)  # type: ignore
        except ParentProfile.DoesNotExist:  # type: ignore
            raise NotFound("Parent profile not found.")
        parent.user.is_active = False
        parent.user.save()
        return Response({"status": "parent deactivated"})

    @action(detail=True, methods=["post"])
    def add_student(self, request, pk=None):
        """Add a new student to an existing parent."""
        try:
            parent = ParentProfile.objects.get(pk=pk)  # type: ignore
        except ParentProfile.DoesNotExist:  # type: ignore
            raise NotFound("Parent profile not found.")

        # Use the student creation serializer with existing_parent_id
        from students.serializers import StudentCreateSerializer

        student_data = request.data.copy()
        student_data["existing_parent_id"] = pk

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
        """Link an existing student to a parent."""
        try:
            parent = ParentProfile.objects.get(pk=pk)  # type: ignore
        except ParentProfile.DoesNotExist:  # type: ignore
            raise NotFound("Parent profile not found.")

        student_id = request.data.get("student_id")
        if not student_id:
            return Response(
                {"error": "student_id is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            from students.models import Student

            student = Student.objects.get(id=student_id)  # type: ignore
        except Student.DoesNotExist:  # type: ignore
            return Response(
                {"error": "Student not found"}, status=status.HTTP_404_NOT_FOUND
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
