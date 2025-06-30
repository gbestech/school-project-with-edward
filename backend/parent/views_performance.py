from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import NotFound, PermissionDenied
from attendance.models import Attendance
from result.models import StudentResult
from students.models import Student
from django.db import models


class StudentDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, student_id):
        # Check parent profile existence
        try:
            parent_profile = request.user.parent_profile
        except Exception:
            raise NotFound("Parent profile not found.")

        # Confirm student belongs to this parent
        if not parent_profile.students.filter(id=student_id).exists():
            raise PermissionDenied("You do not have access to this student's data.")

        student = Student.objects.get(id=student_id)

        # Gather attendance & result data
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
                avg=models.Avg("score")
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
                "subject": (
                    res.exam.subject.name if res.exam and res.exam.subject else "N/A"
                ),
                "score": res.score,
                "exam_date": res.exam.exam_date if res.exam else None,
            }
            for res in recent_results
        ]

        data = {
            "student": str(student),
            "attendance_percentage": attendance_percentage,
            "average_score": round(avg_score, 2),
            "recent_attendance": attendance_list,
            "recent_results": result_list,
        }
        return Response(data)
