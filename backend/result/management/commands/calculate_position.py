from django.core.management.base import BaseCommand
from django.db import transaction
from result.models import (
    SeniorSecondaryResult,
    JuniorSecondaryResult,
    PrimaryResult,
    NurseryResult,
    SeniorSecondaryTermReport,
    JuniorSecondaryTermReport,
    PrimaryTermReport,
    NurseryTermReport,
)


class Command(BaseCommand):
    help = (
        "Recalculate all subject positions, class statistics, and term report positions"
    )

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
        parser.add_argument(
            "--class",
            type=str,
            dest="student_class",
            help="Only recalculate for specific class",
        )

    def handle(self, *args, **options):
        education_level = options.get("education_level")
        exam_session_id = options.get("exam_session")
        student_class = options.get("student_class")

        self.stdout.write(self.style.SUCCESS("=" * 60))
        self.stdout.write(self.style.SUCCESS("🔄 Starting Position Recalculation"))
        self.stdout.write(self.style.SUCCESS("=" * 60))

        models_config = []

        if not education_level or education_level == "SENIOR_SECONDARY":
            models_config.append(
                {
                    "result_model": SeniorSecondaryResult,
                    "report_model": SeniorSecondaryTermReport,
                    "name": "Senior Secondary",
                    "score_field": "total_score",
                    "report_score_field": "average_score",
                }
            )

        if not education_level or education_level == "JUNIOR_SECONDARY":
            models_config.append(
                {
                    "result_model": JuniorSecondaryResult,
                    "report_model": JuniorSecondaryTermReport,
                    "name": "Junior Secondary",
                    "score_field": "total_percentage",  # Fixed: Use percentage
                    "report_score_field": "average_score",
                }
            )

        if not education_level or education_level == "PRIMARY":
            models_config.append(
                {
                    "result_model": PrimaryResult,
                    "report_model": PrimaryTermReport,
                    "name": "Primary",
                    "score_field": "total_percentage",  # Fixed: Use percentage
                    "report_score_field": "average_score",
                }
            )

        if not education_level or education_level == "NURSERY":
            models_config.append(
                {
                    "result_model": NurseryResult,
                    "report_model": NurseryTermReport,
                    "name": "Nursery",
                    "score_field": "percentage",  # Fixed: Nursery uses percentage
                    "report_score_field": "overall_percentage",  # Fixed: Different field
                }
            )

        total_results_updated = 0
        total_reports_updated = 0

        for config in models_config:
            result_model = config["result_model"]
            report_model = config["report_model"]
            name = config["name"]
            score_field = config["score_field"]
            report_score_field = config["report_score_field"]

            self.stdout.write(f"\n📚 Processing {name} Results...")

            # STEP 1: Recalculate Subject Positions
            results_updated = self._recalculate_subject_positions(
                result_model, score_field, exam_session_id, student_class
            )
            total_results_updated += results_updated

            self.stdout.write(
                self.style.SUCCESS(f"  ✅ Updated {results_updated} subject positions")
            )

            # STEP 2: Recalculate Term Report Metrics
            metrics_updated = self._recalculate_term_report_metrics(
                report_model, exam_session_id, student_class
            )
            self.stdout.write(
                self.style.SUCCESS(
                    f"  ✅ Recalculated {metrics_updated} term report metrics"
                )
            )

            # STEP 3: Recalculate Term Report Positions
            reports_updated = self._recalculate_term_report_positions(
                report_model, report_score_field, exam_session_id, student_class
            )
            total_reports_updated += reports_updated

            self.stdout.write(
                self.style.SUCCESS(
                    f"  ✅ Updated {reports_updated} term report positions"
                )
            )

        # Summary
        self.stdout.write(self.style.SUCCESS("\n" + "=" * 60))
        self.stdout.write(self.style.SUCCESS("✨ RECALCULATION COMPLETE"))
        self.stdout.write(self.style.SUCCESS("=" * 60))
        self.stdout.write(
            f"📊 Total Subject Positions Updated: {total_results_updated}"
        )
        self.stdout.write(f"📋 Total Term Reports Updated: {total_reports_updated}")
        self.stdout.write(self.style.SUCCESS("=" * 60 + "\n"))

    def _recalculate_subject_positions(
        self, model_class, score_field, exam_session_id=None, student_class=None
    ):
        """Recalculate subject positions for all results"""
        updated_count = 0

        filters = {"status__in": ["APPROVED", "PUBLISHED"]}
        if exam_session_id:
            filters["exam_session_id"] = exam_session_id
        if student_class:
            filters["student__student_class"] = student_class

        unique_combos = (
            model_class.objects.filter(**filters)
            .values(
                "subject",
                "exam_session",
                "student__student_class",
                "student__education_level",
            )
            .distinct()
        )

        for combo in unique_combos:
            # Get all results for this combo, ordered by score
            results = model_class.objects.filter(
                subject=combo["subject"],
                exam_session=combo["exam_session"],
                student__student_class=combo["student__student_class"],
                student__education_level=combo["student__education_level"],
                status__in=["APPROVED", "PUBLISHED"],
            ).order_by(f"-{score_field}", "student__user__first_name")

            if results.exists():
                # Calculate statistics
                scores = [getattr(r, score_field) for r in results]
                class_avg = sum(scores) / len(scores)
                highest = max(scores)
                lowest = min(scores)

                # Update positions
                with transaction.atomic():
                    for position, result in enumerate(results, start=1):
                        model_class.objects.filter(id=result.id).update(
                            subject_position=position,
                            class_average=class_avg,
                            highest_in_class=highest,
                            lowest_in_class=lowest,
                        )
                        updated_count += 1

        return updated_count

    def _recalculate_term_report_metrics(
        self, report_model, exam_session_id=None, student_class=None
    ):
        """Recalculate term report metrics (total_score, average_score, etc.)"""
        updated_count = 0

        filters = {"status__in": ["DRAFT", "SUBMITTED", "APPROVED", "PUBLISHED"]}
        if exam_session_id:
            filters["exam_session_id"] = exam_session_id
        if student_class:
            filters["student__student_class"] = student_class

        reports = report_model.objects.filter(**filters)

        for report in reports:
            try:
                report.calculate_metrics()
                updated_count += 1
            except Exception as e:
                self.stdout.write(
                    self.style.WARNING(
                        f"  ⚠️  Failed to recalculate metrics for {report}: {e}"
                    )
                )

        return updated_count

    def _recalculate_term_report_positions(
        self, report_model, score_field, exam_session_id=None, student_class=None
    ):
        """Recalculate overall class positions in term reports"""
        updated_count = 0

        filters = {"status__in": ["APPROVED", "PUBLISHED"]}
        if exam_session_id:
            filters["exam_session_id"] = exam_session_id
        if student_class:
            filters["student__student_class"] = student_class

        unique_combos = (
            report_model.objects.filter(**filters)
            .values(
                "exam_session", "student__student_class", "student__education_level"
            )
            .distinct()
        )

        for combo in unique_combos:
            # Get all term reports for this combo, ordered by average score
            reports = report_model.objects.filter(
                exam_session=combo["exam_session"],
                student__student_class=combo["student__student_class"],
                student__education_level=combo["student__education_level"],
                status__in=["APPROVED", "PUBLISHED"],
            ).order_by(f"-{score_field}", "student__user__first_name")

            if reports.exists():
                total_students = reports.count()

                # Update class positions
                with transaction.atomic():
                    for position, report in enumerate(reports, start=1):
                        report_model.objects.filter(id=report.id).update(
                            class_position=position,
                            total_students=total_students,
                        )
                        updated_count += 1

        return updated_count
