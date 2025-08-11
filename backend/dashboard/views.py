from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from students.models import Student
from teacher.models import Teacher
from classroom.models import Classroom
from attendance.models import Attendance
from parent.models import Message, ParentProfile
import datetime


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    return Response(
        {
            "total_students": Student.objects.count(),
            "total_teachers": Teacher.objects.count(),
            "total_classes": Classroom.objects.count(),
            "total_messages": Message.objects.count(),
            "total_parents": ParentProfile.objects.count(),
            "attendance_today": Attendance.objects.filter(
                date=datetime.date.today()
            ).count(),  # ✅ FIXED
        }
    )
