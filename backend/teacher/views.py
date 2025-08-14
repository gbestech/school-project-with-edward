from rest_framework import viewsets
from .models import Teacher, TeacherAssignment
from .serializers import TeacherSerializer, TeacherAssignmentSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.db import transaction


class TeacherViewSet(viewsets.ModelViewSet):
    queryset = Teacher.objects.all()  # type: ignore
    serializer_class = TeacherSerializer
    permission_classes = [AllowAny]  # Temporarily allow unauthenticated access for testing

    def create(self, request, *args, **kwargs):
        # Allow unauthenticated POST requests for testing
        self.permission_classes = [AllowAny]
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        teacher = serializer.save()
        teacher_password = getattr(serializer, '_generated_teacher_password', None)
        teacher_username = getattr(serializer, '_generated_teacher_username', None)
        headers = self.get_success_headers(serializer.data)
        # Return the teacher data and the generated credentials
        return Response(
            {
                "teacher": TeacherSerializer(teacher, context=self.get_serializer_context()).data,
                "user_username": teacher_username,
                "user_password": teacher_password,
            },
            status=status.HTTP_201_CREATED,
            headers=headers,
        )

    def destroy(self, request, *args, **kwargs):
        """Custom delete method to handle teacher deletion with proper cleanup"""
        try:
            with transaction.atomic():
                teacher = self.get_object()
                
                # Delete related teacher assignments first
                TeacherAssignment.objects.filter(teacher=teacher).delete()
                
                # Delete classroom teacher assignments
                from classroom.models import ClassroomTeacherAssignment
                ClassroomTeacherAssignment.objects.filter(teacher=teacher).delete()
                
                # Delete class schedules
                from classroom.models import ClassSchedule
                ClassSchedule.objects.filter(teacher=teacher).delete()
                
                # Set class_teacher to null in classrooms (since it's SET_NULL)
                from classroom.models import Classroom
                Classroom.objects.filter(class_teacher=teacher).update(class_teacher=None)
                
                # Delete attendance records
                from attendance.models import Attendance
                Attendance.objects.filter(teacher=teacher).delete()
                
                # Delete subject allocations
                from academics.models import SubjectAllocation
                SubjectAllocation.objects.filter(teacher=teacher).delete()
                
                # Delete any other teacher-related records
                # Add other models here if needed
                
                # Delete the associated user (this will cascade to teacher profile)
                if teacher.user:
                    teacher.user.delete()
                
                return Response(
                    {'message': 'Teacher deleted successfully'}, 
                    status=status.HTTP_200_OK
                )
        except Exception as e:
            print(f"Error deleting teacher: {str(e)}")
            return Response(
                {'error': f'Failed to delete teacher: {str(e)}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        teacher = self.get_object()
        teacher.is_active = True
        teacher.save()
        return Response({'status': 'teacher activated'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        teacher = self.get_object()
        teacher.is_active = False
        teacher.save()
        return Response({'status': 'teacher deactivated'}, status=status.HTTP_200_OK)


class TeacherAssignmentViewSet(viewsets.ModelViewSet):
    queryset = TeacherAssignment.objects.all()  # type: ignore
    serializer_class = TeacherAssignmentSerializer
