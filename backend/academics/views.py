# academics/views.py
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q

from .models import (
    AcademicSession,
    Term,
    SubjectAllocation,
    Curriculum,
    AcademicCalendar,
)

# ✅ Import Subject from subject app
from subject.models import Subject
from .serializers import (
    AcademicSessionSerializer,
    TermSerializer,
    SubjectSerializer,
    SubjectAllocationSerializer,
    CurriculumSerializer,
    AcademicCalendarSerializer,
)


class AcademicSessionViewSet(viewsets.ModelViewSet):
    """ViewSet for Academic Sessions"""

    queryset = AcademicSession.objects.all().order_by("-start_date")
    serializer_class = AcademicSessionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["is_current", "is_active"]
    search_fields = ["name"]
    ordering_fields = ["start_date", "end_date", "created_at"]
    ordering = ["-start_date"]

    @action(detail=True, methods=["post"])
    def set_active(self, request, pk=None):
        """Set this session as the current active session"""
        session = self.get_object()

        # Deactivate all other sessions
        AcademicSession.objects.all().update(is_current=False)

        # Activate this session
        session.is_current = True
        session.is_active = True
        session.save()

        serializer = self.get_serializer(session)
        return Response(
            {
                "message": f'Academic session "{session.name}" is now the current active session',
                "active_session": serializer.data,
            }
        )

    @action(detail=False, methods=["get"])
    def active(self, request):
        """Get the currently active academic session"""
        active_session = AcademicSession.objects.filter(is_current=True).first()

        if active_session:
            serializer = self.get_serializer(active_session)
            return Response(serializer.data)

        return Response(
            {"message": "No active academic session found"},
            status=status.HTTP_404_NOT_FOUND,
        )

    def perform_create(self, serializer):
        """Override to handle current session logic"""
        # If this session is being set as current, deactivate others
        if serializer.validated_data.get("is_current", False):
            AcademicSession.objects.update(is_current=False)

        session = serializer.save()

        # If this is the first session, make it current by default
        if AcademicSession.objects.count() == 1:
            session.is_current = True
            session.is_active = True
            session.save()

    def perform_update(self, serializer):
        """Override to handle current session logic"""
        # If this session is being set as current, deactivate others
        if serializer.validated_data.get("is_current", False):
            AcademicSession.objects.exclude(id=serializer.instance.id).update(
                is_current=False
            )

        serializer.save()


class TermViewSet(viewsets.ModelViewSet):
    """ViewSet for Academic Terms"""

    queryset = (
        Term.objects.select_related("academic_session")
        .all()
        .order_by("academic_session", "name")
    )
    serializer_class = TermSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["academic_session", "name", "is_current", "is_active"]
    search_fields = ["name", "academic_session__name"]
    ordering_fields = ["start_date", "end_date", "created_at"]
    ordering = ["academic_session", "name"]

    @action(detail=False, methods=["get"])
    def by_session(self, request):
        """Get terms filtered by academic session"""
        session_id = request.query_params.get("session_id")

        if session_id:
            queryset = self.get_queryset().filter(academic_session_id=session_id)
        else:
            queryset = self.get_queryset()

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def set_current(self, request, pk=None):
        """Set this term as the current active term"""
        term = self.get_object()

        # Deactivate all terms in the same session
        Term.objects.filter(academic_session=term.academic_session).update(
            is_current=False
        )

        # Activate this term
        term.is_current = True
        term.is_active = True
        term.save()

        serializer = self.get_serializer(term)
        return Response(
            {
                "message": f'Term "{term.get_name_display()}" is now the current active term',
                "term": serializer.data,
            }
        )

    @action(detail=False, methods=["get"])
    def current(self, request):
        """Get the currently active term"""
        current_term = Term.objects.filter(is_current=True).first()

        if current_term:
            serializer = self.get_serializer(current_term)
            return Response(serializer.data)

        return Response(
            {"message": "No current term found"}, status=status.HTTP_404_NOT_FOUND
        )

    def perform_create(self, serializer):
        """Override to handle current term logic"""
        # If this term is being set as current, deactivate others in the same session
        if serializer.validated_data.get("is_current", False):
            Term.objects.filter(
                academic_session=serializer.validated_data["academic_session"]
            ).update(is_current=False)

        term = serializer.save()

        # If this is the first term for the session, make it current
        session_terms = Term.objects.filter(academic_session=term.academic_session)
        if session_terms.count() == 1:
            term.is_current = True
            term.is_active = True
            term.save()

    def perform_update(self, serializer):
        """Override to handle current term logic"""
        # If this term is being set as current, deactivate others
        if serializer.validated_data.get("is_current", False):
            Term.objects.filter(
                academic_session=serializer.instance.academic_session
            ).exclude(id=serializer.instance.id).update(is_current=False)

        serializer.save()


class SubjectViewSet(viewsets.ModelViewSet):
    """ViewSet for Subjects"""

    queryset = Subject.objects.all().order_by("name")
    serializer_class = SubjectSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["subject_type", "is_compulsory", "is_active"]
    search_fields = ["name", "code", "description"]
    ordering_fields = ["name", "code", "created_at"]
    ordering = ["name"]


class SubjectAllocationViewSet(viewsets.ModelViewSet):
    """ViewSet for Subject Allocations"""

    queryset = (
        SubjectAllocation.objects.select_related(
            "subject", "teacher", "academic_session"
        )
        .all()
        .order_by("-created_at")
    )
    serializer_class = SubjectAllocationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = [
        "subject",
        "teacher",
        "academic_session",
        "education_level",
        "is_active",
    ]
    search_fields = [
        "subject__name",
        "teacher__user__first_name",
        "teacher__user__last_name",
    ]
    ordering_fields = ["created_at"]
    ordering = ["-created_at"]


class CurriculumViewSet(viewsets.ModelViewSet):
    """ViewSet for Curriculum"""

    queryset = (
        Curriculum.objects.select_related("academic_session")
        .all()
        .order_by("-created_at")
    )
    serializer_class = CurriculumSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["education_level", "academic_session", "is_active"]
    search_fields = ["name", "description"]
    ordering_fields = ["name", "created_at"]
    ordering = ["-created_at"]


class AcademicCalendarViewSet(viewsets.ModelViewSet):
    """ViewSet for Academic Calendar Events"""

    queryset = (
        AcademicCalendar.objects.select_related("academic_session", "term")
        .all()
        .order_by("start_date")
    )
    serializer_class = AcademicCalendarSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = [
        "event_type",
        "academic_session",
        "term",
        "is_public",
        "is_active",
    ]
    search_fields = ["title", "description", "location"]
    ordering_fields = ["start_date", "end_date", "created_at"]
    ordering = ["start_date"]

    @action(detail=False, methods=["get"])
    def upcoming(self, request):
        """Get upcoming events"""
        from datetime import date

        queryset = (
            self.get_queryset()
            .filter(start_date__gte=date.today(), is_active=True)
            .order_by("start_date")[:10]
        )

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
