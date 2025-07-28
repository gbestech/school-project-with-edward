from rest_framework import viewsets
from .models import Teacher, TeacherAssignment
from .serializers import TeacherSerializer, TeacherAssignmentSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status


class TeacherViewSet(viewsets.ModelViewSet):
    queryset = Teacher.objects.all()  # type: ignore
    serializer_class = TeacherSerializer

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
