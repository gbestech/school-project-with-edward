# File: classroom/management/commands/inspect_classroom_db.py

from django.core.management.base import BaseCommand, CommandError
from django.db import connection
from django.db.models import Count, Q
from classroom.models import Classroom, Section, Stream, StudentEnrollment
from academics.models import AcademicSession, Term
import json
from datetime import datetime
from tabulate import tabulate


class Command(BaseCommand):
    help = "Inspect and analyze the production database schema for classroom app before migrations"

    def add_arguments(self, parser):
        parser.add_argument(
            "--detailed",
            action="store_true",
            help="Show detailed analysis including data examples",
        )
        parser.add_argument(
            "--export",
            action="store_true",
            help="Export analysis to JSON file",
        )
        parser.add_argument(
            "--check-duplicates",
            action="store_true",
            help="Check for potential duplicate classroom names",
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("\n" + "=" * 80))
        self.stdout.write(self.style.SUCCESS("CLASSROOM DATABASE INSPECTION REPORT"))
        self.stdout.write(self.style.SUCCESS("=" * 80 + "\n"))

        # Collect all data
        report = {
            "timestamp": datetime.now().isoformat(),
            "database_name": connection.settings_dict.get("NAME"),
            "database_engine": connection.settings_dict.get("ENGINE"),
        }

        # 1. Table Structure Analysis
        self.stdout.write(self.style.HTTP_INFO("\n1️⃣  DATABASE TABLE STRUCTURE"))
        self.stdout.write("-" * 80)
        table_analysis = self._analyze_table_structure()
        report["table_structure"] = table_analysis

        for table_name, columns in table_analysis.items():
            self.stdout.write(f"\n📋 Table: {table_name}")
            cols_data = [
                [col["name"], col["type"], col["nullable"], col["key"]]
                for col in columns
            ]
            headers = ["Column Name", "Type", "Nullable", "Key"]
            self.stdout.write(tabulate(cols_data, headers=headers, tablefmt="grid"))

        # 2. Current Data Statistics
        self.stdout.write(self.style.HTTP_INFO("\n2️⃣  CURRENT DATA STATISTICS"))
        self.stdout.write("-" * 80)
        stats = self._get_data_statistics()
        report["data_statistics"] = stats

        self._print_statistics(stats)

        # 3. Stream Usage Analysis
        self.stdout.write(self.style.HTTP_INFO("\n3️⃣  STREAM USAGE ANALYSIS"))
        self.stdout.write("-" * 80)
        stream_analysis = self._analyze_stream_usage()
        report["stream_analysis"] = stream_analysis

        self._print_stream_analysis(stream_analysis)

        # 4. Classroom Composition by Level
        self.stdout.write(
            self.style.HTTP_INFO("\n4️⃣  CLASSROOM COMPOSITION BY EDUCATION LEVEL")
        )
        self.stdout.write("-" * 80)
        composition = self._analyze_classroom_composition()
        report["classroom_composition"] = composition

        self._print_composition(composition)

        # 5. Check for constraint violations
        self.stdout.write(self.style.HTTP_INFO("\n5️⃣  CONSTRAINT VIOLATION CHECK"))
        self.stdout.write("-" * 80)
        violations = self._check_constraint_violations()
        report["constraint_violations"] = violations

        self._print_violations(violations)

        # 6. Duplicate classroom names (if requested)
        if options["check_duplicates"]:
            self.stdout.write(
                self.style.HTTP_INFO("\n6️⃣  DUPLICATE CLASSROOM NAMES CHECK")
            )
            self.stdout.write("-" * 80)
            duplicates = self._check_duplicate_classrooms()
            report["duplicate_classrooms"] = duplicates
            self._print_duplicates(duplicates)

        # 7. Detailed data sample (if requested)
        if options["detailed"]:
            self.stdout.write(self.style.HTTP_INFO("\n7️⃣  DETAILED DATA SAMPLE"))
            self.stdout.write("-" * 80)
            samples = self._get_detailed_samples()
            report["data_samples"] = samples
            self._print_detailed_samples(samples)

        # 8. Migration Impact Analysis
        self.stdout.write(self.style.HTTP_INFO("\n8️⃣  MIGRATION IMPACT ANALYSIS"))
        self.stdout.write("-" * 80)
        impact = self._analyze_migration_impact()
        report["migration_impact"] = impact
        self._print_migration_impact(impact)

        # 9. Export to JSON if requested
        if options["export"]:
            filename = f"classroom_db_inspection_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            with open(filename, "w") as f:
                json.dump(report, f, indent=2, default=str)
            self.stdout.write(
                self.style.SUCCESS(f"\n✅ Report exported to: {filename}")
            )

        # Summary
        self.stdout.write(self.style.SUCCESS("\n" + "=" * 80))
        self.stdout.write(self.style.SUCCESS("INSPECTION COMPLETE"))
        self.stdout.write(self.style.SUCCESS("=" * 80 + "\n"))

    def _analyze_table_structure(self):
        """Analyze current table schema"""
        cursor = connection.cursor()
        tables = [
            "classroom_classroom",
            "classroom_section",
            "classroom_stream",
            "classroom_studentenrollment",
            "classroom_classroomteacherassignment",
        ]

        analysis = {}
        for table_name in tables:
            (
                cursor.execute(f"PRAGMA table_info({table_name});")
                if "sqlite" in connection.settings_dict["ENGINE"]
                else None
            )

            try:
                if "sqlite" in connection.settings_dict["ENGINE"]:
                    cursor.execute(f"PRAGMA table_info({table_name});")
                    columns = cursor.fetchall()
                    analysis[table_name] = [
                        {
                            "name": col[1],
                            "type": col[2],
                            "nullable": "NO" if col[3] else "YES",
                            "key": "PRIMARY" if col[5] else "",
                        }
                        for col in columns
                    ]
                elif "postgres" in connection.settings_dict["ENGINE"]:
                    cursor.execute(
                        f"""
                        SELECT column_name, data_type, is_nullable
                        FROM information_schema.columns
                        WHERE table_name = %s
                        ORDER BY ordinal_position
                    """,
                        [table_name],
                    )
                    columns = cursor.fetchall()
                    analysis[table_name] = [
                        {"name": col[0], "type": col[1], "nullable": col[2], "key": ""}
                        for col in columns
                    ]
            except Exception as e:
                self.stdout.write(
                    self.style.WARNING(f"⚠️  Could not read table {table_name}: {e}")
                )

        return analysis

    def _get_data_statistics(self):
        """Get current data statistics"""
        return {
            "total_classrooms": Classroom.objects.count(),
            "active_classrooms": Classroom.objects.filter(is_active=True).count(),
            "inactive_classrooms": Classroom.objects.filter(is_active=False).count(),
            "total_sections": Section.objects.count(),
            "total_streams": Stream.objects.count(),
            "total_enrollments": StudentEnrollment.objects.count(),
            "active_enrollments": StudentEnrollment.objects.filter(
                is_active=True
            ).count(),
            "total_academic_sessions": AcademicSession.objects.count(),
            "total_terms": Term.objects.count(),
        }

    def _analyze_stream_usage(self):
        """Analyze how streams are currently used"""
        classrooms_with_stream = 0
        classrooms_without_stream = Classroom.objects.filter(
            stream__isnull=True
        ).count()

        stream_breakdown = Stream.objects.annotate(
            classroom_count=Count("classrooms")
        ).values("name", "stream_type", "classroom_count")

        return {
            "classrooms_with_stream": classrooms_with_stream,
            "classrooms_without_stream": classrooms_without_stream,
            "percentage_with_stream": round(
                (
                    (
                        classrooms_with_stream
                        / (classrooms_with_stream + classrooms_without_stream)
                        * 100
                    )
                    if (classrooms_with_stream + classrooms_without_stream) > 0
                    else 0
                ),
                2,
            ),
            "stream_breakdown": list(stream_breakdown),
        }

    def _analyze_classroom_composition(self):
        """Analyze classrooms by education level"""
        from classroom.models import GradeLevel

        composition = {}
        for level_code, level_name in GradeLevel.EDUCATION_LEVELS:
            classrooms = Classroom.objects.filter(
                section__grade_level__education_level=level_code
            ).annotate(
                enrollment_count=Count(
                    "studentenrollment", filter=Q(studentenrollment__is_active=True)
                )
            )

            composition[level_name] = {
                "total_classrooms": classrooms.count(),
                "classrooms_with_stream": classrooms.filter(
                    stream__isnull=False
                ).count(),
                "classrooms_without_stream": classrooms.filter(
                    stream__isnull=True
                ).count(),
                "total_students": sum(c.enrollment_count for c in classrooms),
                "average_class_size": round(
                    (
                        sum(c.enrollment_count for c in classrooms) / classrooms.count()
                        if classrooms.count() > 0
                        else 0
                    ),
                    2,
                ),
            }

        return composition

    def _check_constraint_violations(self):
        """Check for existing constraint violations"""
        violations = {
            "duplicate_classroom_names": [],
            "null_stream_in_ss": [],
            "orphaned_enrollments": [],
            "students_in_multiple_classrooms": [],
        }

        # Check duplicate names in same session/term
        duplicates = (
            Classroom.objects.values("section", "academic_session", "term", "name")
            .annotate(count=Count("id"))
            .filter(count__gt=1)
        )

        violations["duplicate_classroom_names"] = list(duplicates)

        # Check SS classrooms (for awareness, not a violation)
        ss_classrooms_with_stream = Classroom.objects.filter(
            section__grade_level__education_level="SENIOR_SECONDARY",
            stream__isnull=False,
        ).count()

        ss_classrooms_without_stream = Classroom.objects.filter(
            section__grade_level__education_level="SENIOR_SECONDARY",
            stream__isnull=True,
        ).count()

        violations["ss_statistics"] = {
            "ss_classrooms_with_stream": ss_classrooms_with_stream,
            "ss_classrooms_without_stream": ss_classrooms_without_stream,
        }

        # Check for orphaned enrollments (student no longer exists)
        try:
            from students.models import Student

            orphaned = StudentEnrollment.objects.filter(student__isnull=True).count()
            violations["orphaned_enrollments"] = orphaned
        except:
            violations["orphaned_enrollments"] = (
                "Cannot check - Student model not accessible"
            )

        return violations

    def _check_duplicate_classrooms(self):
        """Find all duplicate classroom names in same session/term"""
        duplicates = []

        dupes = (
            Classroom.objects.values("section", "academic_session", "term", "name")
            .annotate(count=Count("id"))
            .filter(count__gt=1)
        )

        for dupe in dupes:
            classrooms = Classroom.objects.filter(
                section_id=dupe["section"],
                academic_session_id=dupe["academic_session"],
                term_id=dupe["term"],
                name=dupe["name"],
            ).values("id", "name", "stream__name", "is_active")

            duplicates.append(
                {
                    "section_id": dupe["section"],
                    "session_id": dupe["academic_session"],
                    "term_id": dupe["term"],
                    "name": dupe["name"],
                    "count": dupe["count"],
                    "classrooms": list(classrooms),
                }
            )

        return duplicates

    def _get_detailed_samples(self):
        """Get sample data for detailed inspection"""
        samples = {}

        # Sample classrooms with and without streams
        samples["ss_with_stream"] = list(
            Classroom.objects.filter(
                section__grade_level__education_level="SENIOR_SECONDARY",
                stream__isnull=False,
            ).values("id", "name", "stream__name")[:5]
        )

        samples["ss_without_stream"] = list(
            Classroom.objects.filter(
                section__grade_level__education_level="SENIOR_SECONDARY",
                stream__isnull=True,
            ).values("id", "name", "stream__name")[:5]
        )

        samples["primary_classrooms"] = list(
            Classroom.objects.filter(
                section__grade_level__education_level="PRIMARY"
            ).values("id", "name", "stream__name")[:5]
        )

        samples["recent_enrollments"] = list(
            StudentEnrollment.objects.select_related("student__user", "classroom")
            .values(
                "id",
                "student__user__first_name",
                "student__user__last_name",
                "classroom__name",
                "enrollment_date",
            )
            .order_by("-created_at")[:5]
        )

        return samples

    def _analyze_migration_impact(self):
        """Analyze impact of the migration"""
        ss_classrooms = Classroom.objects.filter(
            section__grade_level__education_level="SENIOR_SECONDARY"
        )

        return {
            "constraints_to_remove": "OLD: unique_together on (section, academic_session, term)",
            "constraints_to_add": "NEW: UniqueConstraint on (section, academic_session, term, name)",
            "affected_rows": {
                "classrooms": ss_classrooms.count(),
                "can_now_have_multiple_per_session_term": True,
            },
            "data_integrity_impact": "LOW - No data deletion, only constraint modification",
            "backward_compatibility": "HIGH - Existing classrooms remain unchanged",
            "recommended_post_migration_checks": [
                "Verify SS1 Science, SS1 Arts, SS1 Commercial can coexist",
                "Check that Primary, Nursery multiple classes work correctly",
                "Verify student enrollment validation",
            ],
        }

    def _print_statistics(self, stats):
        """Pretty print statistics"""
        data = [
            ["Total Classrooms", stats["total_classrooms"]],
            ["Active Classrooms", stats["active_classrooms"]],
            ["Inactive Classrooms", stats["inactive_classrooms"]],
            ["Total Sections", stats["total_sections"]],
            ["Total Streams", stats["total_streams"]],
            ["Total Enrollments", stats["total_enrollments"]],
            ["Active Enrollments", stats["active_enrollments"]],
            ["Academic Sessions", stats["total_academic_sessions"]],
            ["Terms", stats["total_terms"]],
        ]
        self.stdout.write(tabulate(data, headers=["Metric", "Count"], tablefmt="grid"))

    def _print_stream_analysis(self, analysis):
        """Pretty print stream analysis"""
        self.stdout.write(
            f"\nClassrooms WITH stream: {analysis['classrooms_with_stream']}"
        )
        self.stdout.write(
            f"Classrooms WITHOUT stream: {analysis['classrooms_without_stream']}"
        )
        self.stdout.write(
            f"Percentage with stream: {analysis['percentage_with_stream']}%"
        )

        if analysis["stream_breakdown"]:
            self.stdout.write("\nStream Breakdown:")
            data = [
                [s["name"], s["stream_type"], s["classroom_count"]]
                for s in analysis["stream_breakdown"]
            ]
            self.stdout.write(
                tabulate(
                    data, headers=["Stream Name", "Type", "Classrooms"], tablefmt="grid"
                )
            )

    def _print_composition(self, composition):
        """Pretty print classroom composition"""
        data = [
            [
                level,
                comp["total_classrooms"],
                comp["classrooms_with_stream"],
                comp["classrooms_without_stream"],
                comp["total_students"],
                comp["average_class_size"],
            ]
            for level, comp in composition.items()
        ]
        headers = [
            "Education Level",
            "Classrooms",
            "With Stream",
            "Without Stream",
            "Students",
            "Avg Size",
        ]
        self.stdout.write(tabulate(data, headers=headers, tablefmt="grid"))

    def _print_violations(self, violations):
        """Pretty print constraint violations"""
        if violations["duplicate_classroom_names"]:
            self.stdout.write(
                self.style.WARNING("\n⚠️  DUPLICATE CLASSROOM NAMES FOUND:")
            )
            data = [
                [d["section"], d["academic_session"], d["term"], d["name"], d["count"]]
                for d in violations["duplicate_classroom_names"]
            ]
            self.stdout.write(
                tabulate(
                    data,
                    headers=["Section", "Session", "Term", "Name", "Count"],
                    tablefmt="grid",
                )
            )
        else:
            self.stdout.write(self.style.SUCCESS("✅ No duplicate classroom names"))

        self.stdout.write(f"\nSenior Secondary Statistics:")
        ss_stats = violations["ss_statistics"]
        self.stdout.write(
            f"  - SS Classrooms WITH stream: {ss_stats['ss_classrooms_with_stream']}"
        )
        self.stdout.write(
            f"  - SS Classrooms WITHOUT stream: {ss_stats['ss_classrooms_without_stream']}"
        )

    def _print_duplicates(self, duplicates):
        """Pretty print duplicates"""
        if not duplicates:
            self.stdout.write(
                self.style.SUCCESS("✅ No duplicate classroom names found")
            )
        else:
            for dup in duplicates:
                self.stdout.write(
                    f"\n⚠️  Duplicate: {dup['name']} (appears {dup['count']} times)"
                )
                data = [
                    [c["id"], c["name"], c["stream__name"] or "None", c["is_active"]]
                    for c in dup["classrooms"]
                ]
                self.stdout.write(
                    tabulate(
                        data,
                        headers=["ID", "Name", "Stream", "Active"],
                        tablefmt="grid",
                    )
                )

    def _print_detailed_samples(self, samples):
        """Pretty print detailed samples"""
        self.stdout.write("\nSS Classrooms WITH stream (sample):")
        if samples["ss_with_stream"]:
            data = [
                [s["id"], s["name"], s["stream__name"]]
                for s in samples["ss_with_stream"]
            ]
            self.stdout.write(
                tabulate(data, headers=["ID", "Name", "Stream"], tablefmt="grid")
            )
        else:
            self.stdout.write("  (None found)")

        self.stdout.write("\nSS Classrooms WITHOUT stream (sample):")
        if samples["ss_without_stream"]:
            data = [
                [s["id"], s["name"], s["stream__name"] or "None"]
                for s in samples["ss_without_stream"]
            ]
            self.stdout.write(
                tabulate(data, headers=["ID", "Name", "Stream"], tablefmt="grid")
            )
        else:
            self.stdout.write("  (None found)")

        self.stdout.write("\nPrimary Classrooms (sample):")
        if samples["primary_classrooms"]:
            data = [
                [s["id"], s["name"], s["stream__name"] or "None"]
                for s in samples["primary_classrooms"]
            ]
            self.stdout.write(
                tabulate(data, headers=["ID", "Name", "Stream"], tablefmt="grid")
            )

    def _print_migration_impact(self, impact):
        """Pretty print migration impact"""
        self.stdout.write(f"Constraints to Remove: {impact['constraints_to_remove']}")
        self.stdout.write(f"Constraints to Add: {impact['constraints_to_add']}")
        self.stdout.write(
            f"\nAffected Rows: {impact['affected_rows']['classrooms']} SS classrooms"
        )
        self.stdout.write(f"Data Integrity Impact: {impact['data_integrity_impact']}")
        self.stdout.write(f"Backward Compatibility: {impact['backward_compatibility']}")

        self.stdout.write("\nRecommended Post-Migration Checks:")
        for i, check in enumerate(impact["recommended_post_migration_checks"], 1):
            self.stdout.write(f"  {i}. {check}")
