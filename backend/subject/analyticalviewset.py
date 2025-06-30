# ==============================================================================
# 2. SUBJECT ANALYTICS VIEWSET - Statistics & Reporting
# ==============================================================================
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Prefetch, Avg, Sum
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.core.cache import cache
from django.db import transaction
from django.core.exceptions import ValidationError
from django.utils import timezone
from .models import Subject, SUBJECT_CATEGORY_CHOICES, EDUCATION_LEVELS
import logging


from classroom.models import GradeLevel


class SubjectAnalyticsViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Analytics ViewSet for Subject statistics, reports, and data insights.

    Responsibilities:
    - Comprehensive statistics dashboard
    - Performance metrics and KPIs
    - Data export for reporting
    - Academic planning insights
    - Resource utilization analysis

    URL Pattern: /api/subjects/analytics/
    """

    queryset = Subject.objects.all()
    permission_classes = [IsAuthenticated]

    # Only allow read operations
    http_method_names = ["get", "head", "options"]

    @action(detail=False, methods=["get"])
    def dashboard(self, request):
        """Comprehensive analytics dashboard"""
        cache_key = "subjects_analytics_dashboard_v3"
        stats = cache.get(cache_key)

        if not stats:
            queryset = Subject.objects.all()

            # Core metrics
            total_subjects = queryset.count()
            active_subjects = queryset.filter(
                is_active=True, is_discontinued=False
            ).count()

            stats = {
                "overview": {
                    "total_subjects": total_subjects,
                    "active_subjects": active_subjects,
                    "inactive_subjects": queryset.filter(is_active=False).count(),
                    "discontinued_subjects": queryset.filter(
                        is_discontinued=True
                    ).count(),
                    "compulsory_subjects": queryset.filter(is_compulsory=True).count(),
                    "elective_subjects": queryset.filter(is_compulsory=False).count(),
                    "practical_subjects": queryset.filter(has_practical=True).count(),
                    "lab_required_subjects": queryset.filter(requires_lab=True).count(),
                },
                "by_category": self._get_category_breakdown(queryset),
                "by_education_level": self._get_education_level_breakdown(queryset),
                "academic_metrics": self._get_academic_metrics(queryset),
                "resource_requirements": self._get_resource_requirements(queryset),
                "grade_distribution": self._get_grade_distribution(queryset),
                "trends": self._get_trend_analysis(queryset),
            }

            # Cache for 1 hour
            cache.set(cache_key, stats, 60 * 60)

        return Response(stats)

    @action(detail=False, methods=["get"])
    def category_analysis(self, request):
        """Deep dive into category-specific analytics"""
        category = request.query_params.get("category")

        if category and category in dict(SUBJECT_CATEGORY_CHOICES):
            queryset = Subject.objects.filter(category=category)
        else:
            queryset = Subject.objects.all()

        analysis = {
            "category_overview": self._get_category_breakdown(queryset),
            "performance_metrics": self._get_category_performance(queryset, category),
            "resource_analysis": self._get_category_resources(queryset, category),
            "student_engagement": self._get_category_engagement(queryset, category),
        }

        return Response(analysis)

    @action(detail=False, methods=["get"])
    def resource_utilization(self, request):
        """Analyze resource requirements and utilization"""
        queryset = Subject.objects.filter(is_active=True)

        utilization = {
            "lab_requirements": {
                "total_lab_subjects": queryset.filter(requires_lab=True).count(),
                "lab_utilization_rate": self._calculate_lab_utilization(),
                "peak_lab_hours": self._get_peak_lab_usage(),
            },
            "equipment_requirements": {
                "special_equipment_subjects": queryset.filter(
                    requires_special_equipment=True
                ).count(),
                "equipment_categories": self._get_equipment_breakdown(),
            },
            "staff_requirements": {
                "practical_subjects": queryset.filter(has_practical=True).count(),
                "estimated_staff_hours": self._calculate_staff_requirements(),
            },
        }

        return Response(utilization)

    @action(detail=False, methods=["get"])
    def academic_planning(self, request):
        """Insights for academic planning and curriculum development"""
        planning_data = {
            "curriculum_gaps": self._identify_curriculum_gaps(),
            "prerequisite_chains": self._analyze_prerequisite_chains(),
            "credit_distribution": self._analyze_credit_distribution(),
            "workload_analysis": self._analyze_student_workload(),
            "recommendations": self._generate_planning_recommendations(),
        }

        return Response(planning_data)

    @action(detail=False, methods=["get"])
    def export_analytics(self, request):
        """Export comprehensive analytics data"""
        if not request.user.is_staff:
            return Response({"error": "Permission denied"}, status=403)

        export_format = request.query_params.get("format", "json")  # json, csv, excel

        analytics_data = {
            "export_metadata": {
                "generated_at": timezone.now().isoformat(),
                "generated_by": request.user.username,
                "format": export_format,
            },
            "dashboard_data": self._get_dashboard_export(),
            "detailed_subjects": self._get_subjects_export(),
            "trends_analysis": self._get_trends_export(),
        }

        if export_format == "csv":
            # Return CSV response
            return self._generate_csv_response(analytics_data)
        elif export_format == "excel":
            # Return Excel response
            return self._generate_excel_response(analytics_data)

        return Response(analytics_data)

    # Helper methods for analytics calculations
    def _get_category_breakdown(self, queryset):
        """Calculate breakdown by category"""
        breakdown = {}
        for category, display in SUBJECT_CATEGORY_CHOICES:
            category_subjects = queryset.filter(category=category)
            breakdown[category] = {
                "display_name": display,
                "total": category_subjects.count(),
                "active": category_subjects.filter(
                    is_active=True, is_discontinued=False
                ).count(),
                "avg_credit_hours": category_subjects.aggregate(
                    avg=Avg("credit_hours")
                )["avg"]
                or 0,
            }
        return breakdown

    def _get_education_level_breakdown(self, queryset):
        """Calculate breakdown by education level"""
        breakdown = {}
        for level_code, display in EDUCATION_LEVELS:
            level_subjects = queryset.filter(
                Q(education_levels__contains=[level_code])
                | Q(education_levels__isnull=True)
                | Q(education_levels=[])
            )
            breakdown[level_code] = {
                "display_name": display,
                "total": level_subjects.count(),
                "active": level_subjects.filter(
                    is_active=True, is_discontinued=False
                ).count(),
            }
        return breakdown

    def _get_academic_metrics(self, queryset):
        """Calculate academic performance metrics"""
        return queryset.aggregate(
            avg_credit_hours=Avg("credit_hours"),
            total_credit_hours=Sum("credit_hours"),
            avg_practical_hours=Avg("practical_hours"),
            total_practical_hours=Sum("practical_hours"),
            avg_pass_mark=Avg("pass_mark"),
        )

    def _get_resource_requirements(self, queryset):
        """Calculate resource requirement statistics"""
        return {
            "lab_required": queryset.filter(requires_lab=True).count(),
            "special_equipment": queryset.filter(
                requires_special_equipment=True
            ).count(),
            "practical_components": queryset.filter(has_practical=True).count(),
            "standard_classroom_only": queryset.filter(
                requires_lab=False,
                requires_special_equipment=False,
                has_practical=False,
            ).count(),
        }

    def _get_grade_distribution(self, queryset):
        """Calculate distribution across grade levels"""
        distribution = {}
        if GradeLevel.objects.exists():
            for grade in GradeLevel.objects.all().order_by("order"):
                count = queryset.filter(
                    grade_levels=grade, is_active=True, is_discontinued=False
                ).count()
                distribution[f"grade_{grade.order}"] = {
                    "name": grade.name,
                    "count": count,
                }
        return distribution

    def _get_trend_analysis(self, queryset):
        """Analyze trends over time"""
        # Implement trend analysis logic
        return {"message": "Trend analysis implementation"}

    # Additional helper methods would go here...
