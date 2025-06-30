from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import NotFound
from django.db.models import Avg

from .models import ParentProfile
from .serializers import ParentProfileSerializer
from .permissions import IsParent

from attendance.models import Attendance
from result.models import StudentResult


class ParentViewSet(viewsets.ViewSet):
    permission_classes = [IsParent]

    def retrieve(self, request):
        try:
            parent = request.user.parent_profile
        except ParentProfile.DoesNotExist:
            raise NotFound("Parent profile not found.")

        serializer = ParentProfileSerializer(parent)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="dashboard")
    def dashboard(self, request):
        try:
            parent = request.user.parent_profile
        except ParentProfile.DoesNotExist:
            raise NotFound("Parent profile not found.")

        students = parent.students.all()
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
