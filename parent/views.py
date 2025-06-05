from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.exceptions import NotFound
from rest_framework.views import APIView
from django.db.models import Avg
from .models import ParentProfile
from .serializers import ParentProfileSerializer
from attendance.models import Attendance
from exam.models import Result


class MyChildrenView(generics.RetrieveAPIView):
    serializer_class = ParentProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        try:
            return self.request.user.parent_profile
        except ParentProfile.DoesNotExist:
            raise NotFound("Parent profile not found.")


class ParentDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user

        if user.role != "parent":
            return Response({"error": "Unauthorized"}, status=403)

        try:
            parent = user.parent_profile
        except ParentProfile.DoesNotExist:
            return Response({"error": "Parent profile not found"}, status=404)

        children = parent.children.all()
        dashboard_data = []

        for child in children:
            attendance_records = Attendance.objects.filter(student=child)
            total_attendance = attendance_records.count()
            present_count = attendance_records.filter(status="present").count()
            attendance_percentage = (
                round((present_count / total_attendance) * 100, 2)
                if total_attendance
                else 0
            )

            avg_score = (
                Result.objects.filter(student=child).aggregate(avg=Avg("score"))["avg"]
                or 0
            )

            # Get last 5 attendance records
            recent_attendance = attendance_records.order_by("-attendance_date")[:5]
            attendance_list = [
                {"date": att.attendance_date, "status": att.status}
                for att in recent_attendance
            ]

            # Get last 5 results
            recent_results = Result.objects.filter(student=child).order_by(
                "-exam__exam_date"
            )[:5]
            result_list = [
                {
                    "subject": (
                        res.exam.subject.name
                        if res.exam and res.exam.subject
                        else "N/A"
                    ),
                    "score": res.score,
                    "exam_date": res.exam.exam_date if res.exam else None,
                }
                for res in recent_results
            ]

            dashboard_data.append(
                {
                    "student": child.full_name,
                    "attendance_percentage": attendance_percentage,
                    "average_score": round(avg_score, 2),
                    "recent_attendance": attendance_list,
                    "recent_results": result_list,
                    "alert": "Low performance" if avg_score < 50 else None,
                }
            )

        return Response({"dashboard": dashboard_data})
