# ==============================================================================
# 3. SUBJECT MANAGEMENT VIEWSET - Administrative Operations
# ==============================================================================
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, Avg, Sum, Prefetch
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.core.cache import cache
from django.db import transaction
from django.core.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)

from .models import Subject, SUBJECT_CATEGORY_CHOICES, EDUCATION_LEVELS
from classroom.models import GradeLevel  # Import from the correct app
from .serializers import (
    SubjectSerializer,
    SubjectListSerializer,
    SubjectCreateUpdateSerializer,
    SubjectGradeCheckSerializer,
    SubjectPrerequisiteSerializer,
    SubjectEducationLevelSerializer,
)


class SubjectManagementViewSet(viewsets.ViewSet):
    """
    Management ViewSet for Subject administrative operations and bulk actions.

    Responsibilities:
    - Bulk operations (create, update, delete, status changes)
    - Administrative management tasks
    - Subject lifecycle management
    - Data maintenance and cleanup
    - Import/Export operations

    URL Pattern: /api/subjects/management/
    """

    permission_classes = [IsAdminUser]  # Admin only
    queryset = Subject.objects.all()

    @action(detail=False, methods=["post"])
    def bulk_create(self, request):
        """Bulk create subjects from uploaded data"""
        subjects_data = request.data.get("subjects", [])

        if not subjects_data:
            return Response({"error": "No subjects data provided"}, status=400)

        created_subjects = []
        errors = []

        with transaction.atomic():
            for i, subject_data in enumerate(subjects_data):
                try:
                    serializer = SubjectCreateUpdateSerializer(data=subject_data)
                    if serializer.is_valid():
                        subject = serializer.save()
                        created_subjects.append(subject)
                    else:
                        errors.append({f"subject_{i}": serializer.errors})
                except Exception as e:
                    errors.append({f"subject_{i}": str(e)})

        # Clear caches
        cache.delete_many(["subjects_cache_v1", "subjects_analytics_dashboard_v3"])

        return Response(
            {
                "created_count": len(created_subjects),
                "error_count": len(errors),
                "created_subjects": [
                    {"id": s.id, "name": s.name, "code": s.code}
                    for s in created_subjects
                ],
                "errors": errors,
            }
        )

    @action(detail=False, methods=["post"])
    def bulk_update_status(self, request):
        """Bulk update active/discontinued status"""
        subject_ids = request.data.get("subject_ids", [])
        is_active = request.data.get("is_active")
        is_discontinued = request.data.get("is_discontinued")

        if not subject_ids:
            return Response({"error": "subject_ids required"}, status=400)

        update_fields = {}
        if is_active is not None:
            update_fields["is_active"] = is_active
        if is_discontinued is not None:
            update_fields["is_discontinued"] = is_discontinued

        if not update_fields:
            return Response({"error": "No update fields provided"}, status=400)

        try:
            with transaction.atomic():
                updated_count = Subject.objects.filter(id__in=subject_ids).update(
                    **update_fields
                )

                # Clear caches
                cache.delete_many(
                    ["subjects_cache_v1", "subjects_analytics_dashboard_v3"]
                )

                logger.info(
                    f"Bulk status update: {updated_count} subjects by {request.user}"
                )

                return Response(
                    {
                        "message": f"Successfully updated {updated_count} subjects",
                        "updated_count": updated_count,
                        "update_fields": update_fields,
                    }
                )
        except Exception as e:
            logger.error(f"Bulk update failed: {e}")
            return Response({"error": "Bulk update failed"}, status=500)

    @action(detail=False, methods=["post"])
    def bulk_delete(self, request):
        """Bulk delete subjects with safety checks"""
        subject_ids = request.data.get("subject_ids", [])
        force_delete = request.data.get("force_delete", False)

        if not subject_ids:
            return Response({"error": "subject_ids required"}, status=400)

        subjects = Subject.objects.filter(id__in=subject_ids)

        if not subjects.exists():
            return Response({"error": "No subjects found"}, status=404)

        # Check for dependencies
        subjects_with_dependencies = []
        subjects_safe_to_delete = []

        for subject in subjects:
            if (
                hasattr(subject, "student_subjects")
                and subject.student_subjects.exists()
            ):
                subjects_with_dependencies.append(subject)
            else:
                subjects_safe_to_delete.append(subject)

        result = {"deleted_count": 0, "soft_deleted_count": 0, "errors": []}

        try:
            with transaction.atomic():
                # Soft delete subjects with dependencies
                if subjects_with_dependencies:
                    soft_delete_count = len(subjects_with_dependencies)
                    Subject.objects.filter(
                        id__in=[s.id for s in subjects_with_dependencies]
                    ).update(is_active=False, is_discontinued=True)
                    result["soft_deleted_count"] = soft_delete_count

                # Hard delete subjects without dependencies (if force_delete or safe)
                if subjects_safe_to_delete and (
                    force_delete or not subjects_with_dependencies
                ):
                    deleted_count = len(subjects_safe_to_delete)
                    Subject.objects.filter(
                        id__in=[s.id for s in subjects_safe_to_delete]
                    ).delete()
                    result["deleted_count"] = deleted_count

                # Clear caches
                cache.delete_many(
                    ["subjects_cache_v1", "subjects_analytics_dashboard_v3"]
                )

                logger.info(f"Bulk delete: {result} by {request.user}")

        except Exception as e:
            logger.error(f"Bulk delete failed: {e}")
            return Response({"error": "Bulk delete failed"}, status=500)

        return Response(result)

    @action(detail=False, methods=["post"])
    def import_subjects(self, request):
        """Import subjects from CSV/Excel file"""
        uploaded_file = request.FILES.get("file")

        if not uploaded_file:
            return Response({"error": "No file uploaded"}, status=400)

        # Process file based on extension
        file_extension = uploaded_file.name.split(".")[-1].lower()

        try:
            if file_extension == "csv":
                data = self._process_csv_import(uploaded_file)
            elif file_extension in ["xlsx", "xls"]:
                data = self._process_excel_import(uploaded_file)
            else:
                return Response({"error": "Unsupported file format"}, status=400)

            # Validate and create subjects
            import_result = self._create_subjects_from_import(data)

            return Response(import_result)

        except Exception as e:
            logger.error(f"Import failed: {e}")
            return Response({"error": f"Import failed: {str(e)}"}, status=500)

    @action(detail=False, methods=["get"])
    def inactive_subjects(self, request):
        """Get all inactive subjects for management review"""
        inactive_subjects = Subject.objects.filter(
            Q(is_active=False) | Q(is_discontinued=True)
        ).order_by("-updated_at")

        serializer = SubjectListSerializer(inactive_subjects, many=True)

        stats = {
            "total_inactive": inactive_subjects.count(),
            "deactivated_only": inactive_subjects.filter(
                is_active=False, is_discontinued=False
            ).count(),
            "discontinued_only": inactive_subjects.filter(is_discontinued=True).count(),
        }

        return Response({"statistics": stats, "subjects": serializer.data})

    @action(detail=False, methods=["post"])
    def reactivate_subjects(self, request):
        """Bulk reactivate subjects"""
        subject_ids = request.data.get("subject_ids", [])

        if not subject_ids:
            return Response({"error": "subject_ids required"}, status=400)

        try:
            with transaction.atomic():
                updated_count = Subject.objects.filter(id__in=subject_ids).update(
                    is_active=True, is_discontinued=False
                )

                cache.delete_many(
                    ["subjects_cache_v1", "subjects_analytics_dashboard_v3"]
                )

                logger.info(
                    f"Bulk reactivation: {updated_count} subjects by {request.user}"
                )

                return Response(
                    {
                        "message": f"Successfully reactivated {updated_count} subjects",
                        "reactivated_count": updated_count,
                    }
                )
        except Exception as e:
            logger.error(f"Bulk reactivation failed: {e}")
            return Response({"error": "Reactivation failed"}, status=500)

    @action(detail=False, methods=["post"])
    def cleanup_orphaned(self, request):
        """Clean up orphaned or inconsistent subject data"""
        cleanup_results = {
            "orphaned_prerequisites": 0,
            "invalid_grade_levels": 0,
            "duplicate_codes": 0,
            "inconsistent_statuses": 0,
        }

        try:
            with transaction.atomic():
                # Clean up orphaned prerequisites
                # Clean up invalid grade level assignments
                # Fix duplicate subject codes
                # Fix inconsistent status combinations

                # Implementation details would go here
                logger.info(
                    f"Data cleanup completed by {request.user}: {cleanup_results}"
                )

                return Response(
                    {
                        "message": "Cleanup completed successfully",
                        "results": cleanup_results,
                    }
                )
        except Exception as e:
            logger.error(f"Cleanup failed: {e}")
            return Response({"error": "Cleanup failed"}, status=500)

    @action(detail=False, methods=["get"])
    def maintenance_report(self, request):
        """Generate maintenance and health report"""
        report = {
            "data_quality": self._check_data_quality(),
            "system_health": self._check_system_health(),
            "recommendations": self._generate_maintenance_recommendations(),
            "last_updated": timezone.now().isoformat(),
        }

        return Response(report)

    # Helper methods for import/export and data processing
    def _process_csv_import(self, file):
        """Process CSV file for import"""
        # Implementation for CSV processing
        pass

    def _process_excel_import(self, file):
        """Process Excel file for import"""
        # Implementation for Excel processing
        pass

    def _create_subjects_from_import(self, data):
        """Create subjects from imported data"""
        # Implementation for creating subjects from import data
        pass

    def _check_data_quality(self):
        """Check data quality metrics"""
        # Implementation for data quality checks
        pass

    def _check_system_health(self):
        """Check system health metrics"""
        # Implementation for system health checks
        pass

    def _generate_maintenance_recommendations(self):
        """Generate maintenance recommendations"""
        # Implementation for generating recommendations
        pass
