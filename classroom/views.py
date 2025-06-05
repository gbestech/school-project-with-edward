from django.shortcuts import render
from rest_framework import viewsets
from .models import GradeLevel, Section
from .serializers import GradeLevelSerializer, SectionSerializer


class GradeLevelViewSet(viewsets.ModelViewSet):
    queryset = GradeLevel.objects.all()
    serializer_class = GradeLevelSerializer


class SectionViewSet(viewsets.ModelViewSet):
    queryset = Section.objects.all()
    serializer_class = SectionSerializer
