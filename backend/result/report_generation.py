# results/report_generation.py
"""
Complete implementation for PDF report generation using WeasyPrint
"""
from django.template.loader import render_to_string
from django.http import HttpResponse

import tempfile
import logging
from datetime import datetime
from decimal import Decimal
import re

from .models import (
    SeniorSecondaryTermReport,
    JuniorSecondaryTermReport,
    PrimaryTermReport,
    NurseryTermReport,
    ExamSession,
)
from students.models import Student
from schoolSettings.models import SchoolSettings
from django.conf import settings

try:
    from weasyprint import HTML
except Exception as e:
    HTML = None

if HTML is None:
    raise RuntimeError(
        "WeasyPrint is not available on this environment. Check apt packages."
    )

logger = logging.getLogger(__name__)


base_url = settings.WEASYPRINT_BASEURL


class ReportGenerator:
    """Base class for generating PDF reports"""

    def __init__(self, request=None):
        self.request = request

    def get_school_info(self):
        try:
            school = SchoolSettings.objects.first()
            if not school:
                return self._default_school_info()

            return {
                "name": school.school_name or school.name or "School Name",
                "site": school.site_name or "Site Name",
                "address": school.school_address or school.address or "",
                "phone": school.school_phone or school.phone or "",
                "email": school.school_email or school.email or "",
                "logo": school.logo.url if school.logo else None,
                "favicon": school.favicon.url if school.favicon else None,
                "motto": school.school_motto or school.motto or "",
            }
        except Exception as e:
            logger.error(f"Error fetching school info: {e}")
            return self._default_school_info()

    def _default_school_info(self):
        return {
            "name": "School Name",
            "site": "Site Name",
            "address": "",
            "phone": "",
            "email": "",
            "logo": None,
            "favicon": None,
            "motto": "",
        }

    def format_grade_suffix(self, position):
        """Format position with ordinal suffix (1st, 2nd, 3rd, etc.)"""
        if not position:
            return ""

        if 10 <= position % 100 <= 20:
            suffix = "th"
        else:
            suffix = {1: "st", 2: "nd", 3: "rd"}.get(position % 10, "th")

        return f"{position}{suffix}"

    def generate_pdf(self, html_string, filename):
        try:
            with tempfile.NamedTemporaryFile(delete=True, suffix=".pdf") as output:
                base_url = self.request.build_absolute_uri("/") if self.request else ""
                HTML(string=html_string, base_url=base_url).write_pdf(
                    target=output.name
                )
                output.seek(0)
                pdf = output.read()

            response = HttpResponse(pdf, content_type="application/pdf")
            response["Content-Disposition"] = f'attachment; filename="{filename}"'
            return response

        except Exception as e:
            logger.error(f"Error generating PDF: {e}", exc_info=True)  # Add traceback
            # Return a proper error response instead of raising
            from django.http import JsonResponse

            return JsonResponse(
                {"error": "Failed to generate PDF report", "detail": str(e)}, status=500
            )


class SeniorSecondaryReportGenerator(ReportGenerator):
    """Generate reports for Senior Secondary students"""

    def generate_term_report(self, report_id):
        """Generate term report for Senior Secondary student"""
        try:
            report = (
                SeniorSecondaryTermReport.objects.select_related(
                    "student", "student__user", "exam_session", "stream"
                )
                .prefetch_related(
                    "subject_results__subject", "subject_results__grading_system"
                )
                .get(id=report_id)
            )

            # Get subject results
            subject_results = (
                report.subject_results.all()
                .select_related("subject", "grading_system")
                .order_by("subject__name")
            )

            # Format subjects data
            subjects_data = []
            for result in subject_results:
                subjects_data.append(
                    {
                        "name": result.subject.name,
                        "code": result.subject.code,
                        "first_test": float(result.first_test_score or 0),
                        "second_test": float(result.second_test_score or 0),
                        "third_test": float(result.third_test_score or 0),
                        "ca_total": float(result.total_ca_score or 0),
                        "exam": float(result.exam_score or 0),
                        "total": float(result.total_score or 0),
                        "grade": result.grade or "",
                        "position": self.format_grade_suffix(result.subject_position),
                        "remark": result.teacher_remark or "",
                    }
                )

            # Calculate grade summary
            grade_summary = self._calculate_grade_summary(subject_results)

            DATE_FORMAT = "%B %d, %Y"
            context = {
                "report_type": "TERM_REPORT",
                "school": self.get_school_info(),
                "student": {
                    "name": report.student.full_name,
                    "admission_number": report.student.admission_number,
                    "class": report.student.get_student_class_display(),
                    "stream": report.stream.name if report.stream else "",
                },
                "term": {
                    "name": report.exam_session.get_term_display(),
                    "session": report.exam_session.academic_session.name,
                    "year": report.exam_session.academic_session.start_date.year,
                },
                "subjects": subjects_data,
                "summary": {
                    "total_subjects": len(subjects_data),
                    "total_score": float(report.total_score or 0),
                    "average": float(report.average_score or 0),
                    "grade": report.overall_grade or "",
                    "position": self.format_grade_suffix(report.class_position),
                    "total_students": report.total_students or 0,
                },
                "grade_summary": grade_summary,
                "attendance": {
                    "times_opened": report.times_opened or 0,
                    "times_present": report.times_present or 0,
                },
                "next_term_begins": (
                    report.next_term_begins.strftime("%B %d, %Y")
                    if report.next_term_begins
                    else ""
                ),
                "remarks": {
                    "class_teacher": report.class_teacher_remark or "",
                    "head_teacher": report.head_teacher_remark or "",
                },
                "generated_date": datetime.now().strftime(DATE_FORMAT),
            }

            html_string = render_to_string(
                "results/senior_secondary_term_report.html", context
            )

            filename = self.sanitize_filename(
                f"{report.student.admission_number}_term_report.pdf"
            )

            return self.generate_pdf(html_string, filename)

        except SeniorSecondaryTermReport.DoesNotExist:
            logger.error(f"Report with ID {report_id} not found")
            raise
        except Exception as e:
            logger.error(f"Error generating Senior Secondary term report: {e}")
            raise

    def sanitize_filename(self, filename: str):
        """Sanitize filename by removing dangerous characters."""
        return re.sub(r"[^\w\s.-]", "", filename).strip().replace(" ", "_")

    def _calculate_grade_summary(self, subject_results):
        """Calculate grade distribution summary"""
        grade_counts = {}
        for result in subject_results:
            grade = result.grade or "N/A"
            grade_counts[grade] = grade_counts.get(grade, 0) + 1

        return [{"grade": k, "count": v} for k, v in sorted(grade_counts.items())]

    def generate_session_report(self, report_id):
        """Generate session report for Senior Secondary student"""
        # Similar to term report but aggregates across terms
        pass


class JuniorSecondaryReportGenerator(ReportGenerator):
    """Generate reports for Junior Secondary students"""

    def generate_term_report(self, report_id):
        """Generate term report for Junior Secondary student"""
        try:
            report = (
                JuniorSecondaryTermReport.objects.select_related(
                    "student", "student__user", "exam_session"
                )
                .prefetch_related(
                    "subject_results__subject", "subject_results__grading_system"
                )
                .get(id=report_id)
            )

            subject_results = (
                report.subject_results.all()
                .select_related("subject", "grading_system")
                .order_by("subject__name")
            )

            subjects_data = []
            for result in subject_results:
                subjects_data.append(
                    {
                        "name": result.subject.name,
                        "code": result.subject.code,
                        "ca": float(result.continuous_assessment_score or 0),
                        "take_home": float(result.take_home_test_score or 0),
                        "practical": float(result.practical_score or 0),
                        "appearance": float(result.appearance_score or 0),
                        "project": float(result.project_score or 0),
                        "note_copying": float(result.note_copying_score or 0),
                        "ca_total": float(result.ca_total or 0),
                        "exam": float(result.exam_score or 0),
                        "total": float(result.total_score or 0),
                        "grade": result.grade or "",
                        "position": self.format_grade_suffix(result.subject_position),
                        "remark": result.teacher_remark or "",
                    }
                )

            DATE_FORMAT = "%B %d, %Y"
            context = {
                "report_type": "TERM_REPORT",
                "school": self.get_school_info(),
                "student": {
                    "name": report.student.full_name,
                    "admission_number": report.student.admission_number,
                    "class": report.student.get_student_class_display(),
                },
                "term": {
                    "name": report.exam_session.get_term_display(),
                    "session": report.exam_session.academic_session.name,
                    "year": report.exam_session.academic_session.start_date.year,
                },
                "subjects": subjects_data,
                "summary": {
                    "total_subjects": len(subjects_data),
                    "total_score": float(report.total_score or 0),
                    "average": float(report.average_score or 0),
                    "grade": report.overall_grade or "",
                    "position": self.format_grade_suffix(report.class_position),
                    "total_students": report.total_students or 0,
                },
                "attendance": {
                    "times_opened": report.times_opened or 0,
                    "times_present": report.times_present or 0,
                },
                "next_term_begins": (
                    report.next_term_begins.strftime("%B %d, %Y")
                    if report.next_term_begins
                    else ""
                ),
                "remarks": {
                    "class_teacher": report.class_teacher_remark or "",
                    "head_teacher": report.head_teacher_remark or "",
                },
                "generated_date": datetime.now().strftime(DATE_FORMAT),
            }

            html_string = render_to_string(
                "results/junior_secondary_term_report.html", context
            )

            filename = self.sanitize_filename(
                f"{report.student.admission_number}_term_report.pdf"
            )

            return self.generate_pdf(html_string, filename)

        except JuniorSecondaryTermReport.DoesNotExist:
            logger.error(f"Report with ID {report_id} not found")
            raise
        except Exception as e:
            logger.error(f"Error generating Junior Secondary term report: {e}")
            raise

    def sanitize_filename(self, filename: str):
        """Sanitize filename by removing dangerous characters."""
        return re.sub(r"[^\w\s.-]", "", filename).strip().replace(" ", "_")


class PrimaryReportGenerator(ReportGenerator):
    """Generate reports for Primary students"""

    def generate_term_report(self, report_id):
        """Generate term report for Primary student"""
        try:
            report = (
                PrimaryTermReport.objects.select_related(
                    "student", "student__user", "exam_session"
                )
                .prefetch_related(
                    "subject_results__subject", "subject_results__grading_system"
                )
                .get(id=report_id)
            )

            subject_results = (
                report.subject_results.all()
                .select_related("subject", "grading_system")
                .order_by("subject__name")
            )

            subjects_data = []
            for result in subject_results:
                subjects_data.append(
                    {
                        "name": result.subject.name,
                        "code": result.subject.code,
                        "ca": float(result.continuous_assessment_score or 0),
                        "take_home": float(result.take_home_test_score or 0),
                        "practical": float(result.practical_score or 0),
                        "appearance": float(result.appearance_score or 0),
                        "project": float(result.project_score or 0),
                        "note_copying": float(result.note_copying_score or 0),
                        "ca_total": float(result.ca_total or 0),
                        "exam": float(result.exam_score or 0),
                        "total": float(result.total_score or 0),
                        "grade": result.grade or "",
                        "position": self.format_grade_suffix(result.subject_position),
                        "remark": result.teacher_remark or "",
                    }
                )
            DATE_FORMAT = "%B %d, %Y"

            context = {
                "report_type": "TERM_REPORT",
                "school": self.get_school_info(),
                "student": {
                    "name": report.student.full_name,
                    "admission_number": report.student.admission_number,
                    "class": report.student.get_student_class_display(),
                },
                "term": {
                    "name": report.exam_session.get_term_display(),
                    "session": report.exam_session.academic_session.name,
                    "year": report.exam_session.academic_session.start_date.year,
                },
                "subjects": subjects_data,
                "summary": {
                    "total_subjects": len(subjects_data),
                    "total_score": float(report.total_score or 0),
                    "average": float(report.average_score or 0),
                    "grade": report.overall_grade or "",
                    "position": self.format_grade_suffix(report.class_position),
                    "total_students": report.total_students or 0,
                },
                "attendance": {
                    "times_opened": report.times_opened or 0,
                    "times_present": report.times_present or 0,
                },
                "next_term_begins": (
                    report.next_term_begins.strftime("%B %d, %Y")
                    if report.next_term_begins
                    else ""
                ),
                "remarks": {
                    "class_teacher": report.class_teacher_remark or "",
                    "head_teacher": report.head_teacher_remark or "",
                },
                "generated_date": datetime.now().strftime(DATE_FORMAT),
            }

            html_string = render_to_string("results/primary_term_report.html", context)
            filename = self.sanitize_filename(
                f"{report.student.admission_number}_term_report.pdf"
            )

            return self.generate_pdf(html_string, filename)

        except PrimaryTermReport.DoesNotExist:
            logger.error(f"Report with ID {report_id} not found")
            raise
        except Exception as e:
            logger.error(f"Error generating Primary term report: {e}")
            raise

    def sanitize_filename(self, filename: str):
        """Sanitize filename by removing dangerous characters."""
        return re.sub(r"[^\w\s.-]", "", filename).strip().replace(" ", "_")


class NurseryReportGenerator(ReportGenerator):
    """Generate reports for Nursery students"""

    def generate_term_report(self, report_id):
        """Generate term report for Nursery student"""
        try:
            report = (
                NurseryTermReport.objects.select_related(
                    "student", "student__user", "exam_session"
                )
                .prefetch_related(
                    "subject_results__subject", "subject_results__grading_system"
                )
                .get(id=report_id)
            )

            subject_results = (
                report.subject_results.all()
                .select_related("subject", "grading_system")
                .order_by("subject__name")
            )

            subjects_data = []
            for result in subject_results:
                subjects_data.append(
                    {
                        "name": result.subject.name,
                        "max_obtainable": float(result.max_marks_obtainable or 0),
                        "mark_obtained": float(result.mark_obtained or 0),
                        "percentage": float(result.percentage or 0),
                        "grade": result.grade or "",
                        "remark": result.academic_comment or "",
                    }
                )

            DATE_FORMAT = "%B %d, %Y"
            context = {
                "report_type": "TERM_REPORT",
                "school": self.get_school_info(),
                "student": {
                    "name": report.student.full_name,
                    "admission_number": report.student.admission_number,
                    "class": report.student.get_student_class_display(),
                },
                "term": {
                    "name": report.exam_session.get_term_display(),
                    "session": report.exam_session.academic_session.name,
                    "year": report.exam_session.academic_session.start_date.year,
                },
                "subjects": subjects_data,
                "summary": {
                    "total_subjects": report.total_subjects or 0,
                    "total_max_marks": float(report.total_max_marks or 0),
                    "total_marks_obtained": float(report.total_marks_obtained or 0),
                    "overall_percentage": float(report.overall_percentage or 0),
                    "position": self.format_grade_suffix(report.class_position),
                    "total_students": report.total_students_in_class or 0,
                },
                "attendance": {
                    "times_opened": report.times_school_opened or 0,
                    "times_present": report.times_student_present or 0,
                },
                "development": {
                    "physical": (
                        report.get_physical_development_display()
                        if report.physical_development
                        else ""
                    ),
                    "health": report.get_health_display() if report.health else "",
                    "cleanliness": (
                        report.get_cleanliness_display() if report.cleanliness else ""
                    ),
                    "conduct": (
                        report.get_general_conduct_display()
                        if report.general_conduct
                        else ""
                    ),
                    "comment": report.physical_development_comment or "",
                },
                "measurements": {
                    "height_beginning": report.height_beginning or "",
                    "height_end": report.height_end or "",
                    "weight_beginning": report.weight_beginning or "",
                    "weight_end": report.weight_end or "",
                },
                "next_term_begins": (
                    report.next_term_begins.strftime("%B %d, %Y")
                    if report.next_term_begins
                    else ""
                ),
                "remarks": {
                    "class_teacher": report.class_teacher_remark or "",
                    "head_teacher": report.head_teacher_remark or "",
                },
                "generated_date": datetime.now().strftime(DATE_FORMAT),
            }

            html_string = render_to_string("results/nursery_term_report.html", context)

            filename = self.sanitize_filename(
                f"{report.student.admission_number}_term_report.pdf"
            )

            return self.generate_pdf(html_string, filename)

        except NurseryTermReport.DoesNotExist:
            logger.error(f"Report with ID {report_id} not found")
            raise
        except Exception as e:
            logger.error(f"Error generating Nursery term report: {e}")
            raise

    def sanitize_filename(self, filename: str):
        """Sanitize filename by removing dangerous characters."""
        return re.sub(r"[^\w\s.-]", "", filename).strip().replace(" ", "_")


def get_report_generator(education_level, request=None):
    """Factory function to get appropriate report generator"""
    generators = {
        "SENIOR_SECONDARY": SeniorSecondaryReportGenerator,
        "JUNIOR_SECONDARY": JuniorSecondaryReportGenerator,
        "PRIMARY": PrimaryReportGenerator,
        "NURSERY": NurseryReportGenerator,
    }

    generator_class = generators.get(education_level)
    if not generator_class:
        raise ValueError(f"Invalid education level: {education_level}")

    return generator_class(request)
