from django.core.management.base import BaseCommand
from django.db import transaction
from django.db.models import Avg, Max, Min
from result.models import (
    SeniorSecondaryResult,
    JuniorSecondaryResult,
    PrimaryResult,
    NurseryResult,
    ExamSession,
)
from subject.models import Subject


class Command(BaseCommand):
    help = "Recalculate all subject positions and class statistics"

    def add_arguments(self, parser):
        parser.add_argument(
            "--education-level",
            type=str,
            help="Only recalculate for specific education level",
        )
        parser.add_argument(
            "--exam-session",
            type=str,
            help="Only recalculate for specific exam session ID",
        )

    def handle(self, *args, **options):
        education_level = options.get("education_level")
        exam_session_id = options.get("exam_session")

        # Get exam sessions
        if exam_session_id:
            exam_sessions = ExamSession.objects.filter(id=exam_session_id)
        else:
            exam_sessions = ExamSession.objects.filter(is_active=True)

        if not exam_sessions.exists():
            self.stdout.write(self.style.ERROR("No exam sessions found"))
            return

        for exam_session in exam_sessions:
            self.stdout.write(f"\nProcessing session: {exam_session.name}")

            # Process each education level
            if not education_level or education_level == "SENIOR_SECONDARY":
                self._process_education_level(
                    SeniorSecondaryResult, "SENIOR_SECONDARY", exam_session
                )

            if not education_level or education_level == "JUNIOR_SECONDARY":
                self._process_education_level(
                    JuniorSecondaryResult, "JUNIOR_SECONDARY", exam_session
                )

            if not education_level or education_level == "PRIMARY":
                self._process_education_level(PrimaryResult, "PRIMARY", exam_session)

            if not education_level or education_level == "NURSERY":
                self._process_education_level(NurseryResult, "NURSERY", exam_session)

        self.stdout.write(
            self.style.SUCCESS("\n✓ Successfully recalculated all results")
        )

    def _process_education_level(self, model_class, level_name, exam_session):
        """Process results for a specific education level"""
        self.stdout.write(f"\n  Processing {level_name} results...")

        # Get unique subject/class combinations
        combinations = (
            model_class.objects.filter(
                exam_session=exam_session, status__in=["APPROVED", "PUBLISHED"]
            )
            .values("subject", "student__student_class", "student__education_level")
            .distinct()
        )

        self.stdout.write(
            f"  Found {combinations.count()} subject/class combinations for {level_name}"
        )

        for idx, combo in enumerate(combinations, 1):
            subject_id = combo["subject"]
            student_class = combo["student__student_class"]
            education_level = combo["student__education_level"]

            try:
                # Get subject for display
                subject = Subject.objects.get(id=subject_id)

                # Count results for this combination
                result_count = model_class.objects.filter(
                    exam_session=exam_session,
                    subject_id=subject_id,
                    student__student_class=student_class,
                    status__in=["APPROVED", "PUBLISHED"],
                ).count()

                self.stdout.write(
                    f"    [{idx}/{combinations.count()}] Processing: "
                    f"Level={education_level}, Class={student_class}, "
                    f"Subject={subject_id} ({result_count} results)"
                )

                # Use the correct method signature
                if hasattr(model_class, "bulk_recalculate_class"):
                    model_class.bulk_recalculate_class(
                        exam_session=exam_session,  # ✅ FIXED: was 'session'
                        subject=subject,
                        student_class=student_class,
                        education_level=education_level,
                    )
                    self.stdout.write(self.style.SUCCESS(f"      ✓ Success"))
                else:
                    # Fallback for NurseryResult which doesn't have bulk_recalculate_class
                    self._manual_recalculate(
                        model_class,
                        exam_session,
                        subject,
                        student_class,
                        education_level,
                    )
                    self.stdout.write(self.style.SUCCESS(f"      ✓ Success (manual)"))

            except Exception as e:
                self.stdout.write(self.style.ERROR(f"      ✗ Error: {e}"))

    def _manual_recalculate(
        self, model_class, exam_session, subject, student_class, education_level
    ):
        """Manual recalculation for models without bulk_recalculate_class"""

        # Determine score field
        if model_class.__name__ == "NurseryResult":
            score_field = "percentage"
        elif model_class.__name__ in ["PrimaryResult", "JuniorSecondaryResult"]:
            score_field = "total_percentage"
        else:
            score_field = "total_score"

        # Get all results for this combination
        results = model_class.objects.filter(
            exam_session=exam_session,
            subject=subject,
            student__student_class=student_class,
            student__education_level=education_level,
            status__in=["APPROVED", "PUBLISHED"],
        ).order_by(f"-{score_field}")

        if not results.exists():
            return

        # Calculate statistics
        stats = results.aggregate(
            avg=Avg(score_field), highest=Max(score_field), lowest=Min(score_field)
        )

        # Update positions
        with transaction.atomic():
            for position, result in enumerate(results, start=1):
                update_fields = {"subject_position": position}

                # Add statistics if fields exist
                if hasattr(result, "class_average"):
                    update_fields["class_average"] = stats["avg"] or 0
                if hasattr(result, "highest_in_class"):
                    update_fields["highest_in_class"] = stats["highest"] or 0
                if hasattr(result, "lowest_in_class"):
                    update_fields["lowest_in_class"] = stats["lowest"] or 0

                model_class.objects.filter(id=result.id).update(**update_fields)
