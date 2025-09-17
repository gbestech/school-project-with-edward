from rest_framework import serializers
from .models import (
    GradingSystem,
    Grade,
    AssessmentType,
    ExamSession,
    StudentResult,
    StudentTermResult,
    ResultSheet,
    AssessmentScore,
    ResultComment,
    SeniorSecondaryResult,
    SeniorSecondarySessionResult,
    JuniorSecondaryResult,
    PrimaryResult,
    NurseryResult,
    ScoringConfiguration,
)
from students.serializers import StudentDetailSerializer
from subject.serializers import SubjectSerializer
from academics.serializers import AcademicSessionSerializer


class ScoringConfigurationSerializer(serializers.ModelSerializer):
    """Serializer for ScoringConfiguration model"""

    education_level_display = serializers.CharField(
        source="get_education_level_display", read_only=True
    )
    total_ca_max_score = serializers.DecimalField(
        source="ca_total_max_score", read_only=True, max_digits=5, decimal_places=2
    )

    # Add frontend field names for compatibility
    first_test_max_score = serializers.DecimalField(
        source="test1_max_score", read_only=True, max_digits=5, decimal_places=2
    )
    second_test_max_score = serializers.DecimalField(
        source="test2_max_score", read_only=True, max_digits=5, decimal_places=2
    )
    third_test_max_score = serializers.DecimalField(
        source="test3_max_score", read_only=True, max_digits=5, decimal_places=2
    )

    class Meta:
        model = ScoringConfiguration
        fields = [
            "id",
            "name",
            "education_level",
            "education_level_display",
            "result_type",
            "description",
            "test1_max_score",
            "test2_max_score",
            "test3_max_score",
            "first_test_max_score",
            "second_test_max_score",
            "third_test_max_score",
            "continuous_assessment_max_score",
            "take_home_test_max_score",
            "appearance_max_score",
            "practical_max_score",
            "project_max_score",
            "note_copying_max_score",
            "exam_max_score",
            "total_max_score",
            "ca_weight_percentage",
            "exam_weight_percentage",
            "total_ca_max_score",
            "is_active",
            "is_default",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class ScoringConfigurationCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating ScoringConfiguration"""

    # Map frontend field names to backend field names - make them optional
    first_test_max_score = serializers.DecimalField(
        source="test1_max_score",
        max_digits=5,
        decimal_places=2,
        coerce_to_string=False,
        required=False,
        allow_null=True,
    )
    second_test_max_score = serializers.DecimalField(
        source="test2_max_score",
        max_digits=5,
        decimal_places=2,
        coerce_to_string=False,
        required=False,
        allow_null=True,
    )
    third_test_max_score = serializers.DecimalField(
        source="test3_max_score",
        max_digits=5,
        decimal_places=2,
        coerce_to_string=False,
        required=False,
        allow_null=True,
    )

    class Meta:
        model = ScoringConfiguration
        fields = [
            "name",
            "education_level",
            "result_type",
            "description",
            "first_test_max_score",
            "second_test_max_score",
            "third_test_max_score",
            "continuous_assessment_max_score",
            "take_home_test_max_score",
            "appearance_max_score",
            "practical_max_score",
            "project_max_score",
            "note_copying_max_score",
            "exam_max_score",
            "total_max_score",
            "ca_weight_percentage",
            "exam_weight_percentage",
            "is_active",
            "is_default",
        ]

    def validate(self, data):
        """Enhanced validation for scoring configuration"""
        # Set default result_type if not provided
        if "result_type" not in data:
            data["result_type"] = "TERMLY"

        result_type = data.get("result_type", "TERMLY")
        education_level = data.get("education_level")

        # Validate required fields based on education level
        if education_level in ["JUNIOR_SECONDARY", "PRIMARY"]:
            # For Junior Secondary and Primary, require the CA fields
            required_fields = [
                "continuous_assessment_max_score",
                "take_home_test_max_score",
                "appearance_max_score",
                "practical_max_score",
                "project_max_score",
                "note_copying_max_score",
            ]
            for field in required_fields:
                if field not in data or data[field] is None:
                    raise serializers.ValidationError(
                        {
                            field: [
                                "This field is required for Junior Secondary and Primary education levels."
                            ]
                        }
                    )
        elif education_level == "SENIOR_SECONDARY":
            # For Senior Secondary, require the test fields
            required_fields = [
                "first_test_max_score",
                "second_test_max_score",
                "third_test_max_score",
            ]
            for field in required_fields:
                if field not in data or data[field] is None:
                    raise serializers.ValidationError(
                        {
                            field: [
                                "This field is required for Senior Secondary education level."
                            ]
                        }
                    )
        elif education_level == "NURSERY":
            # For Nursery, only require total_max_score
            if "total_max_score" not in data or data["total_max_score"] is None:
                raise serializers.ValidationError(
                    {
                        "total_max_score": [
                            "Max Mark Obtainable is required for Nursery education level."
                        ]
                    }
                )

        # Only validate weight percentages for TERMLY result type and non-Nursery education levels
        if result_type == "TERMLY" and education_level != "NURSERY":
            ca_weight = data.get("ca_weight_percentage", 0)
            exam_weight = data.get("exam_weight_percentage", 0)

            # Validate weight percentages sum to 100
            if ca_weight + exam_weight != 100:
                raise serializers.ValidationError(
                    {
                        "non_field_errors": [
                            "CA weight percentage and exam weight percentage must sum to 100"
                        ]
                    }
                )

        # Validate total max score matches sum of components (only for TERMLY)
        education_level = data.get("education_level")

        # Debug logging
        print(f"DEBUG: education_level = {education_level}")

        # Only validate total_max_score for TERMLY result type
        if result_type == "TERMLY":
            if education_level in ["JUNIOR_SECONDARY", "PRIMARY"]:
                ca_score = data.get("continuous_assessment_max_score", 0)
                take_home = data.get("take_home_test_max_score", 0)
                appearance = data.get("appearance_max_score", 0)
                practical = data.get("practical_max_score", 0)
                project = data.get("project_max_score", 0)
                note_copying = data.get("note_copying_max_score", 0)
                exam = data.get("exam_max_score", 0)

                expected_total = (
                    ca_score
                    + take_home
                    + appearance
                    + practical
                    + project
                    + note_copying
                    + exam
                )
            elif education_level == "SENIOR_SECONDARY":
                # The frontend sends first_test_max_score, second_test_max_score, third_test_max_score
                # But we need to check both frontend and backend field names
                first_test = data.get(
                    "first_test_max_score", data.get("test1_max_score", 0)
                )
                second_test = data.get(
                    "second_test_max_score", data.get("test2_max_score", 0)
                )
                third_test = data.get(
                    "third_test_max_score", data.get("test3_max_score", 0)
                )

                # For TERMLY result type, the total should be tests + exam
                expected_total = (
                    first_test
                    + second_test
                    + third_test
                    + data.get("exam_max_score", 0)
                )
            elif education_level == "NURSERY":
                # For Nursery, the total is just the max mark obtainable
                expected_total = data.get("total_max_score", 0)

            print(f"DEBUG: expected_total = {expected_total}")

            total_max_score = data.get("total_max_score", 0)
            if expected_total != total_max_score:
                raise serializers.ValidationError(
                    {
                        "total_max_score": [
                            f"Total max score must equal sum of components ({expected_total})"
                        ]
                    }
                )

        return data

    def create(self, validated_data):
        """Set created_by when creating and handle data type conversion"""
        request = self.context.get("request")
        if request and request.user:
            validated_data["created_by"] = request.user  # Use user instance, not ID

        # Map frontend field names to backend field names
        field_mapping = {
            "first_test_max_score": "test1_max_score",
            "second_test_max_score": "test2_max_score",
            "third_test_max_score": "test3_max_score",
        }

        # Create a new dict with mapped field names
        mapped_data = {}
        for frontend_field, model_field in field_mapping.items():
            if frontend_field in validated_data:
                mapped_data[model_field] = validated_data.pop(frontend_field)

        # Add remaining fields
        mapped_data.update(validated_data)

        # Ensure all decimal fields are properly converted
        decimal_fields = [
            "test1_max_score",
            "test2_max_score",
            "test3_max_score",
            "continuous_assessment_max_score",
            "take_home_test_max_score",
            "appearance_max_score",
            "practical_max_score",
            "project_max_score",
            "note_copying_max_score",
            "exam_max_score",
            "total_max_score",
            "ca_weight_percentage",
            "exam_weight_percentage",
        ]

        for field in decimal_fields:
            if field in mapped_data and mapped_data[field] is not None:
                # Convert to Decimal if it's a number
                from decimal import Decimal

                mapped_data[field] = Decimal(str(mapped_data[field]))

        return super().create(mapped_data)

    def update(self, instance, validated_data):
        """Handle field mapping during updates"""
        # Map frontend field names back to model field names
        field_mapping = {
            "first_test_max_score": "test1_max_score",
            "second_test_max_score": "test2_max_score",
            "third_test_max_score": "test3_max_score",
        }

        # Create a new dict with mapped field names
        mapped_data = {}
        for frontend_field, model_field in field_mapping.items():
            if frontend_field in validated_data:
                mapped_data[model_field] = validated_data.pop(frontend_field)

        # Add remaining fields
        mapped_data.update(validated_data)

        # Ensure all decimal fields are properly converted
        decimal_fields = [
            "test1_max_score",
            "test2_max_score",
            "test3_max_score",
            "continuous_assessment_max_score",
            "take_home_test_max_score",
            "appearance_max_score",
            "practical_max_score",
            "project_max_score",
            "note_copying_max_score",
            "exam_max_score",
            "total_max_score",
            "ca_weight_percentage",
            "exam_weight_percentage",
        ]

        for field in decimal_fields:
            if field in mapped_data and mapped_data[field] is not None:
                # Convert to Decimal if it's a number
                from decimal import Decimal

                mapped_data[field] = Decimal(str(mapped_data[field]))

        return super().update(instance, mapped_data)


class GradingSystemSerializer(serializers.ModelSerializer):
    grades = serializers.SerializerMethodField()

    class Meta:
        model = GradingSystem
        fields = "__all__"

    def get_grades(self, obj):
        return GradeSerializer(obj.grades.all(), many=True).data


class GradeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Grade
        fields = "__all__"


class AssessmentTypeSerializer(serializers.ModelSerializer):
    education_level_display = serializers.CharField(
        source="get_education_level_display", read_only=True
    )

    class Meta:
        model = AssessmentType
        fields = "__all__"


class ExamSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExamSession
        fields = "__all__"


class AssessmentScoreSerializer(serializers.ModelSerializer):
    assessment_type = AssessmentTypeSerializer(read_only=True)

    class Meta:
        model = AssessmentScore
        fields = "__all__"


class ResultCommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResultComment
        fields = "__all__"


class StudentResultSerializer(serializers.ModelSerializer):
    student = StudentDetailSerializer(read_only=True)
    subject = SubjectSerializer(read_only=True)
    exam_session = ExamSessionSerializer(read_only=True)
    grading_system = GradingSystemSerializer(read_only=True)
    assessment_scores = AssessmentScoreSerializer(many=True, read_only=True)
    comments = ResultCommentSerializer(many=True, read_only=True)
    # Stream information
    stream_name = serializers.CharField(source="stream.name", read_only=True)
    stream_type = serializers.CharField(source="stream.stream_type", read_only=True)

    class Meta:
        model = StudentResult
        fields = "__all__"


class StudentTermResultSerializer(serializers.ModelSerializer):
    student = StudentDetailSerializer(read_only=True)
    academic_session = AcademicSessionSerializer(read_only=True)
    subject_results = serializers.SerializerMethodField()
    comments = ResultCommentSerializer(many=True, read_only=True)

    class Meta:
        model = StudentTermResult
        fields = [
            "id",
            "student",
            "academic_session",
            "term",
            "total_subjects",
            "subjects_passed",
            "subjects_failed",
            "total_score",
            "average_score",
            "gpa",
            "class_position",
            "total_students",
            "status",
            "remarks",
            "next_term_begins",
            "subject_results",
            "comments",
            "created_at",
        ]

    def get_subject_results(self, obj):
        # Always return a combined list from base results and senior secondary results
        combined = []

        # Base results (Primary/Junior or any legacy entries)
        base_results = StudentResult.objects.filter(
            student=obj.student,
            exam_session__term=obj.term,
            exam_session__academic_session=obj.academic_session,
        ).select_related("subject", "grading_system", "exam_session")
        combined.extend(StudentResultSerializer(base_results, many=True).data)

        # Senior Secondary specific results
        try:
            from .models import SeniorSecondaryResult

            senior_results = SeniorSecondaryResult.objects.filter(
                student=obj.student,
                exam_session__term=obj.term,
                exam_session__academic_session=obj.academic_session,
            ).select_related("subject", "grading_system", "exam_session", "stream")

            for r in senior_results:
                combined.append(
                    {
                        "id": str(r.id),
                        "subject": SubjectSerializer(r.subject).data,
                        "exam_session": ExamSessionSerializer(r.exam_session).data,
                        "stream": (
                            {
                                "id": r.stream.id,
                                "name": r.stream.name,
                                "stream_type": getattr(r.stream, "stream_type", ""),
                            }
                            if r.stream
                            else None
                        ),
                        "stream_name": r.stream.name if r.stream else None,
                        "stream_type": (
                            getattr(r.stream, "stream_type", None) if r.stream else None
                        ),
                        "ca_score": r.total_ca_score,
                        "exam_score": r.exam_score,
                        "total_score": r.total_score,
                        "percentage": r.percentage,
                        "grade": r.grade,
                        "grade_point": r.grade_point,
                        "is_passed": r.is_passed,
                        "position": r.subject_position,
                        "remarks": r.teacher_remark,
                        "status": r.status,
                        "assessment_scores": [],
                        "created_at": (
                            r.created_at.isoformat() if hasattr(r, "created_at") else ""
                        ),
                    }
                )
        except Exception:
            pass

        return combined


class StudentTermResultDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for StudentTermResult with full subject breakdown"""

    student = StudentDetailSerializer(read_only=True)
    academic_session = AcademicSessionSerializer(read_only=True)
    subject_results = serializers.SerializerMethodField()
    comments = ResultCommentSerializer(many=True, read_only=True)

    class Meta:
        model = StudentTermResult
        fields = "__all__"

    def get_subject_results(self, obj):
        # Get all results for this student in this term across education levels
        # For Primary/Junior the base StudentResult is used; for Senior Secondary, use SeniorSecondaryResult
        education_level = getattr(obj.student, "education_level", None)
        if education_level == "SENIOR_SECONDARY":
            from .models import SeniorSecondaryResult

            senior_results = SeniorSecondaryResult.objects.filter(
                student=obj.student,
                exam_session__term=obj.term,
                exam_session__academic_session=obj.academic_session,
            ).select_related("subject", "grading_system", "exam_session", "stream")

            # Map Senior Secondary fields to a shape compatible with frontend SubjectResult
            mapped = []
            for r in senior_results:
                mapped.append(
                    {
                        "id": str(r.id),
                        "subject": SubjectSerializer(r.subject).data,
                        "exam_session": ExamSessionSerializer(r.exam_session).data,
                        "stream": (
                            {
                                "id": r.stream.id,
                                "name": r.stream.name,
                                "stream_type": getattr(r.stream, "stream_type", ""),
                            }
                            if r.stream
                            else None
                        ),
                        "stream_name": r.stream.name if r.stream else None,
                        "stream_type": (
                            getattr(r.stream, "stream_type", None) if r.stream else None
                        ),
                        "ca_score": r.total_ca_score,  # total of tests
                        "exam_score": r.exam_score,
                        "total_score": r.total_score,
                        "percentage": r.percentage,
                        "grade": r.grade,
                        "grade_point": r.grade_point,
                        "is_passed": r.is_passed,
                        "position": r.subject_position,
                        "remarks": r.teacher_remark,
                        "status": r.status,
                        "assessment_scores": [],
                        "created_at": (
                            r.created_at.isoformat() if hasattr(r, "created_at") else ""
                        ),
                    }
                )
            return mapped
        else:
            # Primary/Junior/Nursery use StudentResult or their specific serializers already compatible
            results = StudentResult.objects.filter(
                student=obj.student,
                exam_session__term=obj.term,
                exam_session__academic_session=obj.academic_session,
            ).select_related("subject", "grading_system", "exam_session")
            return StudentResultSerializer(results, many=True).data


class DetailedStudentResultSerializer(serializers.ModelSerializer):
    """Detailed serializer for StudentResult with full assessment breakdown"""

    student = StudentDetailSerializer(read_only=True)
    subject = SubjectSerializer(read_only=True)
    exam_session = ExamSessionSerializer(read_only=True)
    grading_system = GradingSystemSerializer(read_only=True)
    assessment_scores = AssessmentScoreSerializer(many=True, read_only=True)
    comments = ResultCommentSerializer(many=True, read_only=True)

    class Meta:
        model = StudentResult
        fields = "__all__"


class ResultSheetSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResultSheet
        fields = "__all__"


# Senior Secondary Result Serializers
class SeniorSecondaryResultSerializer(serializers.ModelSerializer):
    """Serializer for Senior Secondary specific results"""

    student_name = serializers.CharField(source="student.full_name", read_only=True)
    student_class = serializers.CharField(
        source="student.student_class", read_only=True
    )
    subject_name = serializers.CharField(source="subject.name", read_only=True)
    exam_session_name = serializers.CharField(
        source="exam_session.name", read_only=True
    )
    grading_system_name = serializers.CharField(
        source="grading_system.name", read_only=True
    )

    stream_name = serializers.CharField(source="stream.name", read_only=True)
    entered_by_name = serializers.CharField(
        source="entered_by.full_name", read_only=True
    )
    approved_by_name = serializers.CharField(
        source="approved_by.full_name", read_only=True
    )
    published_by_name = serializers.CharField(
        source="published_by.full_name", read_only=True
    )
    last_edited_by_name = serializers.CharField(
        source="last_edited_by.full_name", read_only=True
    )

    class Meta:
        model = SeniorSecondaryResult
        fields = "__all__"


class SeniorSecondaryResultCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating Senior Secondary results"""

    class Meta:
        model = SeniorSecondaryResult
        fields = [
            "student",
            "subject",
            "exam_session",
            "grading_system",
            "stream",
            "first_test_score",
            "second_test_score",
            "third_test_score",
            "exam_score",
            "teacher_remark",
            "status",
        ]

    def validate(self, data):
        """Validate Senior Secondary result data"""
        # Validate test scores are within reasonable limits
        if data.get("first_test_score", 0) > 10:
            raise serializers.ValidationError("First test score cannot exceed 10 marks")
        if data.get("second_test_score", 0) > 10:
            raise serializers.ValidationError(
                "Second test score cannot exceed 10 marks"
            )
        if data.get("third_test_score", 0) > 10:
            raise serializers.ValidationError("Third test score cannot exceed 10 marks")
        if data.get("exam_score", 0) > 70:
            raise serializers.ValidationError("Exam score cannot exceed 70 marks")

        return data


class SeniorSecondarySessionResultSerializer(serializers.ModelSerializer):
    """Serializer for Senior Secondary session results"""

    student_name = serializers.CharField(source="student.full_name", read_only=True)
    student_class = serializers.CharField(
        source="student.student_class", read_only=True
    )
    subject_name = serializers.CharField(source="subject.name", read_only=True)
    academic_session_name = serializers.CharField(
        source="academic_session.name", read_only=True
    )
    stream_name = serializers.CharField(source="stream.name", read_only=True)

    class Meta:
        model = SeniorSecondarySessionResult
        fields = "__all__"


class SeniorSecondarySessionResultCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating Senior Secondary session results"""

    class Meta:
        model = SeniorSecondarySessionResult
        fields = [
            "student",
            "subject",
            "academic_session",
            "stream",
            "first_term_score",
            "second_term_score",
            "third_term_score",
            "teacher_remark",
            "status",
        ]

    def validate(self, data):
        """Validate Senior Secondary session result data"""
        # Validate term scores are within reasonable limits
        first_term = data.get("first_term_score", 0)
        second_term = data.get("second_term_score", 0)
        third_term = data.get("third_term_score", 0)

        if first_term > 100:
            raise serializers.ValidationError(
                "First term score cannot exceed 100 marks"
            )
        if second_term > 100:
            raise serializers.ValidationError(
                "Second term score cannot exceed 100 marks"
            )
        if third_term > 100:
            raise serializers.ValidationError(
                "Third term score cannot exceed 100 marks"
            )

        # Validate total obtained doesn't exceed obtainable
        total_obtained = first_term + second_term + third_term
        if total_obtained > 300:
            raise serializers.ValidationError("Total obtained cannot exceed 300 marks")

        return data


# Junior Secondary Result Serializers
class JuniorSecondaryResultSerializer(serializers.ModelSerializer):
    student = StudentDetailSerializer(read_only=True)
    subject = SubjectSerializer(read_only=True)
    exam_session = ExamSessionSerializer(read_only=True)
    grading_system = GradingSystemSerializer(read_only=True)
    entered_by_name = serializers.CharField(
        source="entered_by.full_name", read_only=True
    )
    approved_by_name = serializers.CharField(
        source="approved_by.full_name", read_only=True
    )
    published_by_name = serializers.CharField(
        source="published_by.full_name", read_only=True
    )
    last_edited_by_name = serializers.CharField(
        source="last_edited_by.full_name", read_only=True
    )

    class Meta:
        model = JuniorSecondaryResult
        fields = "__all__"


class JuniorSecondaryResultCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = JuniorSecondaryResult
        fields = "__all__"


# Primary Result Serializers
class PrimaryResultSerializer(serializers.ModelSerializer):
    student = StudentDetailSerializer(read_only=True)
    subject = SubjectSerializer(read_only=True)
    exam_session = ExamSessionSerializer(read_only=True)
    grading_system = GradingSystemSerializer(read_only=True)
    entered_by_name = serializers.CharField(
        source="entered_by.full_name", read_only=True
    )
    approved_by_name = serializers.CharField(
        source="approved_by.full_name", read_only=True
    )
    published_by_name = serializers.CharField(
        source="published_by.full_name", read_only=True
    )
    last_edited_by_name = serializers.CharField(
        source="last_edited_by.full_name", read_only=True
    )

    class Meta:
        model = PrimaryResult
        fields = "__all__"


class PrimaryResultCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrimaryResult
        fields = "__all__"


# Nursery Result Serializers
class NurseryResultSerializer(serializers.ModelSerializer):
    student = StudentDetailSerializer(read_only=True)
    subject = SubjectSerializer(read_only=True)
    exam_session = ExamSessionSerializer(read_only=True)
    grading_system = GradingSystemSerializer(read_only=True)
    entered_by_name = serializers.CharField(
        source="entered_by.full_name", read_only=True
    )
    approved_by_name = serializers.CharField(
        source="approved_by.full_name", read_only=True
    )
    published_by_name = serializers.CharField(
        source="published_by.full_name", read_only=True
    )
    last_edited_by_name = serializers.CharField(
        source="last_edited_by.full_name", read_only=True
    )

    class Meta:
        model = NurseryResult
        fields = "__all__"


class NurseryResultCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = NurseryResult
        fields = "__all__"
