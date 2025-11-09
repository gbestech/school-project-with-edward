from rest_framework import serializers
from students.models import Student
from subject.models import Subject
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
    SeniorSecondaryTermReport,
    SeniorSecondarySessionReport,
    JuniorSecondaryResult,
    JuniorSecondaryTermReport,
    PrimaryResult,
    PrimaryTermReport,
    NurseryResult,
    NurseryTermReport,
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
    result_type_display = serializers.CharField(
        source="get_result_type_display", read_only=True
    )
    total_ca_max_score = serializers.DecimalField(
        source="ca_total_max_score", read_only=True, max_digits=5, decimal_places=2
    )

    # Add frontend field names for compatibility
    first_test_max_score = serializers.DecimalField(
        decimal_places=2, max_digits=5, required=True, source="test1_max_score"
    )
    second_test_max_score = serializers.DecimalField(
        decimal_places=2, max_digits=5, required=True, source="test2_max_score"
    )
    third_test_max_score = serializers.DecimalField(
        decimal_places=2, max_digits=5, required=True, source="test3_max_score"
    )

    # Add created_by information
    created_by_name = serializers.CharField(
        source="created_by.full_name", read_only=True
    )

    class Meta:
        model = ScoringConfiguration
        fields = [
            "id",
            "name",
            "education_level",
            "education_level_display",
            "result_type",
            "result_type_display",
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
            "created_by",
            "created_by_name",
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

        # IMPORTANT: Check both the source field name (test1_max_score)
        # AND the frontend field name (first_test_max_score)
        # because DRF puts the value in the source field during validation

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
            # For Senior Secondary, check the SOURCE field names (test1_max_score, etc.)
            # because DRF has already mapped them during field validation
            required_test_fields = {
                "test1_max_score": "First test score",
                "test2_max_score": "Second test score",
                "test3_max_score": "Third test score",
            }

            for field, display_name in required_test_fields.items():
                if field not in data or data[field] is None:
                    raise serializers.ValidationError(
                        {
                            field: [
                                f"{display_name} is required for Senior Secondary education level."
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
                # Use the SOURCE field names (test1_max_score, etc.)
                # DRF has already mapped the frontend names to source names
                first_test = data.get("test1_max_score", 0)
                second_test = data.get("test2_max_score", 0)
                third_test = data.get("test3_max_score", 0)

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
            validated_data["created_by"] = request.user

        # Note: Field mapping from first_test_max_score -> test1_max_score
        # is already handled by DRF because we used source="test1_max_score"
        # So validated_data already has the correct field names

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
            if field in validated_data and validated_data[field] is not None:
                from decimal import Decimal

                validated_data[field] = Decimal(str(validated_data[field]))

        return super().create(validated_data)

    def update(self, instance, validated_data):
        """Handle field mapping during updates"""
        # Note: Field mapping is already handled by DRF source parameter
        # So validated_data already has the correct field names (test1_max_score, etc.)

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
            if field in validated_data and validated_data[field] is not None:
                from decimal import Decimal

                validated_data[field] = Decimal(str(validated_data[field]))

        return super().update(instance, validated_data)


class GradingSystemSerializer(serializers.ModelSerializer):
    grades = serializers.SerializerMethodField()
    grading_type_display = serializers.CharField(
        source="get_grading_type_display", read_only=True
    )

    class Meta:
        model = GradingSystem
        fields = "__all__"

    def get_grades(self, obj):
        return GradeSerializer(obj.grades.all(), many=True).data


class GradeSerializer(serializers.ModelSerializer):
    grading_system_name = serializers.CharField(
        source="grading_system.name", read_only=True
    )

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
    exam_type_display = serializers.CharField(
        source="get_exam_type_display", read_only=True
    )
    term_display = serializers.CharField(source="get_term_display", read_only=True)
    academic_session_name = serializers.CharField(
        source="academic_session.name", read_only=True
    )

    class Meta:
        model = ExamSession
        fields = "__all__"


class AssessmentScoreSerializer(serializers.ModelSerializer):
    assessment_type = AssessmentTypeSerializer(read_only=True)

    class Meta:
        model = AssessmentScore
        fields = "__all__"


class ResultCommentSerializer(serializers.ModelSerializer):
    comment_type_display = serializers.CharField(
        source="get_comment_type_display", read_only=True
    )
    commented_by_name = serializers.CharField(
        source="commented_by.full_name", read_only=True
    )

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
    # Status display
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    # User information
    entered_by_name = serializers.CharField(
        source="entered_by.full_name", read_only=True
    )
    approved_by_name = serializers.CharField(
        source="approved_by.full_name", read_only=True
    )

    class Meta:
        model = StudentResult
        fields = "__all__"


class StudentTermResultSerializer(serializers.ModelSerializer):
    student = StudentDetailSerializer(read_only=True)
    academic_session = AcademicSessionSerializer(read_only=True)
    subject_results = serializers.SerializerMethodField()

    class Meta:
        model = StudentTermResult
        fields = "__all__"

    def get_subject_results(self, obj):
        """Get all subject results linked to this term report"""
        # StudentTermResult doesn't have direct subject_results relationship
        # We need to get results based on student, session, and term
        from .models import (
            StudentResult,
            SeniorSecondaryResult,
            PrimaryResult,
            JuniorSecondaryResult,
            NurseryResult,
        )

        # Determine which result model to use based on student's education level
        education_level = obj.student.education_level

        # First try to find results for the exact academic session and term
        if education_level == "SENIOR_SECONDARY":
            results = SeniorSecondaryResult.objects.filter(
                student=obj.student,
                exam_session__academic_session=obj.academic_session,
                exam_session__term=obj.term,
            ).select_related("subject", "grading_system", "exam_session")

            # If no results found, try to find results for the same term in any academic session
            if not results.exists():
                results = (
                    SeniorSecondaryResult.objects.filter(
                        student=obj.student, exam_session__term=obj.term
                    )
                    .select_related("subject", "grading_system", "exam_session")
                    .order_by("-exam_session__academic_session__start_date")
                )

        elif education_level == "PRIMARY":
            results = PrimaryResult.objects.filter(
                student=obj.student,
                exam_session__academic_session=obj.academic_session,
                exam_session__term=obj.term,
            ).select_related("subject", "grading_system", "exam_session")

            if not results.exists():
                results = (
                    PrimaryResult.objects.filter(
                        student=obj.student, exam_session__term=obj.term
                    )
                    .select_related("subject", "grading_system", "exam_session")
                    .order_by("-exam_session__academic_session__start_date")
                )

        elif education_level == "JUNIOR_SECONDARY":
            results = JuniorSecondaryResult.objects.filter(
                student=obj.student,
                exam_session__academic_session=obj.academic_session,
                exam_session__term=obj.term,
            ).select_related("subject", "grading_system", "exam_session")

            if not results.exists():
                results = (
                    JuniorSecondaryResult.objects.filter(
                        student=obj.student, exam_session__term=obj.term
                    )
                    .select_related("subject", "grading_system", "exam_session")
                    .order_by("-exam_session__academic_session__start_date")
                )

        elif education_level == "NURSERY":
            results = NurseryResult.objects.filter(
                student=obj.student,
                exam_session__academic_session=obj.academic_session,
                exam_session__term=obj.term,
            ).select_related("subject", "grading_system", "exam_session")

            if not results.exists():
                results = (
                    NurseryResult.objects.filter(
                        student=obj.student, exam_session__term=obj.term
                    )
                    .select_related("subject", "grading_system", "exam_session")
                    .order_by("-exam_session__academic_session__start_date")
                )

        else:
            # Fallback to base StudentResult
            results = StudentResult.objects.filter(
                student=obj.student,
                exam_session__academic_session=obj.academic_session,
                exam_session__term=obj.term,
            ).select_related("subject", "grading_system", "exam_session")

            if not results.exists():
                results = (
                    StudentResult.objects.filter(
                        student=obj.student, exam_session__term=obj.term
                    )
                    .select_related("subject", "grading_system", "exam_session")
                    .order_by("-exam_session__academic_session__start_date")
                )

        # Use the appropriate serializer based on education level
        if education_level == "SENIOR_SECONDARY":
            from .serializers import SeniorSecondaryResultSerializer

            return SeniorSecondaryResultSerializer(results, many=True).data
        elif education_level == "PRIMARY":
            from .serializers import PrimaryResultSerializer

            return PrimaryResultSerializer(results, many=True).data
        elif education_level == "JUNIOR_SECONDARY":
            from .serializers import JuniorSecondaryResultSerializer

            return JuniorSecondaryResultSerializer(results, many=True).data
        elif education_level == "NURSERY":
            from .serializers import NurseryResultSerializer

            return NurseryResultSerializer(results, many=True).data
        else:
            return StudentResultSerializer(results, many=True).data


class SeniorSecondarySessionReportSerializer(serializers.ModelSerializer):
    """Serializer for consolidated Senior Secondary session reports"""

    student = StudentDetailSerializer(read_only=True)
    academic_session = AcademicSessionSerializer(read_only=True)
    stream_name = serializers.CharField(source="stream.name", read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    subject_results = serializers.SerializerMethodField()

    class Meta:
        model = SeniorSecondarySessionReport
        fields = "__all__"

    def get_subject_results(self, obj):
        """Get all subject session results linked to this session report"""
        return SeniorSecondarySessionResultSerializer(
            obj.subject_results.all(), many=True
        ).data

    def validate_status(self, value):
        """
        Validate status transitions:
        DRAFT -> SUBMITTED (by teacher)
        SUBMITTED -> APPROVED (by admin)
        APPROVED -> PUBLISHED (by admin)

        Cannot go backwards or skip steps
        """
        instance = self.instance
        if not instance:
            # Creating new record, only allow DRAFT
            if value not in ["DRAFT", "SUBMITTED"]:
                raise serializers.ValidationError(
                    "New term reports must start as DRAFT or SUBMITTED"
                )
            return value

        current_status = instance.status

        # Define valid transitions
        valid_transitions = {
            "DRAFT": ["SUBMITTED", "APPROVED"],  # Can skip to APPROVED for admin
            "SUBMITTED": ["APPROVED", "DRAFT"],  # Can go back to DRAFT if needed
            "APPROVED": [
                "PUBLISHED",
                "SUBMITTED",
            ],  # Can go back to SUBMITTED if needed
            "PUBLISHED": [],  # Cannot change once published
        }

        if current_status == value:
            # Same status is always valid
            return value

        if value not in valid_transitions.get(current_status, []):
            raise serializers.ValidationError(
                f"Cannot change status from {current_status} to {value}. "
                f"Valid transitions: {', '.join(valid_transitions.get(current_status, []))}"
            )

        return value


class SeniorSecondaryResultSerializer(serializers.ModelSerializer):
    """Serializer for Senior Secondary specific results"""

    student = StudentDetailSerializer(read_only=True)
    subject = SubjectSerializer(read_only=True)
    exam_session = ExamSessionSerializer(read_only=True)
    grading_system = GradingSystemSerializer(read_only=True)

    # Additional read-only fields for display
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

    # Stream information
    stream_name = serializers.CharField(source="stream.name", read_only=True)
    stream_type = serializers.CharField(source="stream.stream_type", read_only=True)

    # User information
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

    # Status display
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    # Calculated fields for frontend compatibility
    test1_score = serializers.DecimalField(
        source="first_test_score", read_only=True, max_digits=5, decimal_places=2
    )
    test2_score = serializers.DecimalField(
        source="second_test_score", read_only=True, max_digits=5, decimal_places=2
    )
    test3_score = serializers.DecimalField(
        source="third_test_score", read_only=True, max_digits=5, decimal_places=2
    )
    total_obtainable = serializers.SerializerMethodField()
    position = serializers.SerializerMethodField()

    class Meta:
        model = SeniorSecondaryResult
        fields = "__all__"

    def get_total_obtainable(self, obj):
        return 100  # Always 100 for Senior Secondary

    def get_position(self, obj):
        if obj.subject_position:
            suffix = (
                "st"
                if obj.subject_position == 1
                else (
                    "nd"
                    if obj.subject_position == 2
                    else "rd" if obj.subject_position == 3 else "th"
                )
            )
            return f"{obj.subject_position}{suffix}"
        return ""


class SeniorSecondaryResultCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating Senior Secondary results"""

    # Make foreign key fields optional for updates
    student = serializers.PrimaryKeyRelatedField(
        queryset=Student.objects.all(), required=False
    )
    subject = serializers.PrimaryKeyRelatedField(
        queryset=Subject.objects.all(), required=False
    )
    exam_session = serializers.PrimaryKeyRelatedField(
        queryset=ExamSession.objects.all(), required=False
    )
    grading_system = serializers.PrimaryKeyRelatedField(
        queryset=GradingSystem.objects.all(), required=False
    )

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
            "class_teacher_remark",
            "head_teacher_remark",
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

    def create(self, validated_data):
        """Set tracking fields when creating"""
        request = self.context.get("request")
        if request and request.user:
            validated_data["entered_by"] = request.user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        """Set tracking fields when updating"""
        request = self.context.get("request")
        if request and request.user:
            from django.utils import timezone

            validated_data["last_edited_by"] = request.user
            validated_data["last_edited_at"] = timezone.now()
        return super().update(instance, validated_data)


class SeniorSecondarySessionResultSerializer(serializers.ModelSerializer):
    """Serializer for Senior Secondary session results"""

    student = StudentDetailSerializer(read_only=True)
    subject = SubjectSerializer(read_only=True)
    academic_session = AcademicSessionSerializer(read_only=True)

    student_name = serializers.CharField(source="student.full_name", read_only=True)
    student_class = serializers.CharField(
        source="student.student_class", read_only=True
    )
    subject_name = serializers.CharField(source="subject.name", read_only=True)
    academic_session_name = serializers.CharField(
        source="academic_session.name", read_only=True
    )
    stream_name = serializers.CharField(source="stream.name", read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    # Frontend compatibility fields
    term1_score = serializers.DecimalField(
        source="first_term_score", read_only=True, max_digits=5, decimal_places=2
    )
    term2_score = serializers.DecimalField(
        source="second_term_score", read_only=True, max_digits=5, decimal_places=2
    )
    term3_score = serializers.DecimalField(
        source="third_term_score", read_only=True, max_digits=5, decimal_places=2
    )
    average_score = serializers.DecimalField(
        source="average_for_year", read_only=True, max_digits=5, decimal_places=2
    )
    position = serializers.SerializerMethodField()

    class Meta:
        model = SeniorSecondarySessionResult
        fields = "__all__"

    def get_position(self, obj):
        if obj.subject_position:
            suffix = (
                "st"
                if obj.subject_position == 1
                else (
                    "nd"
                    if obj.subject_position == 2
                    else "rd" if obj.subject_position == 3 else "th"
                )
            )
            return f"{obj.subject_position}{suffix}"
        return ""


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
            "class_teacher_remark",
            "head_teacher_remark",
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


# ===== JUNIOR SECONDARY SERIALIZERS =====
class JuniorSecondaryTermReportSerializer(serializers.ModelSerializer):
    """Serializer for consolidated Junior Secondary term reports"""

    student = StudentDetailSerializer(read_only=True)
    exam_session = ExamSessionSerializer(read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    published_by_name = serializers.CharField(
        source="published_by.full_name", read_only=True
    )
    subject_results = serializers.SerializerMethodField()

    class Meta:
        model = JuniorSecondaryTermReport
        fields = "__all__"

    def get_subject_results(self, obj):
        """Get all subject results linked to this term report"""
        return JuniorSecondaryResultSerializer(
            obj.subject_results.all(), many=True
        ).data

    def validate_status(self, value):
        """
        Validate status transitions:
        DRAFT -> SUBMITTED (by teacher)
        SUBMITTED -> APPROVED (by admin)
        APPROVED -> PUBLISHED (by admin)

        Cannot go backwards or skip steps
        """
        instance = self.instance
        if not instance:
            # Creating new record, only allow DRAFT
            if value not in ["DRAFT", "SUBMITTED"]:
                raise serializers.ValidationError(
                    "New term reports must start as DRAFT or SUBMITTED"
                )
            return value

        current_status = instance.status

        # Define valid transitions
        valid_transitions = {
            "DRAFT": ["SUBMITTED", "APPROVED"],  # Can skip to APPROVED for admin
            "SUBMITTED": ["APPROVED", "DRAFT"],  # Can go back to DRAFT if needed
            "APPROVED": [
                "PUBLISHED",
                "SUBMITTED",
            ],  # Can go back to SUBMITTED if needed
            "PUBLISHED": [],  # Cannot change once published
        }

        if current_status == value:
            # Same status is always valid
            return value

        if value not in valid_transitions.get(current_status, []):
            raise serializers.ValidationError(
                f"Cannot change status from {current_status} to {value}. "
                f"Valid transitions: {', '.join(valid_transitions.get(current_status, []))}"
            )

        return value


class JuniorSecondaryResultSerializer(serializers.ModelSerializer):
    """Serializer for Junior Secondary specific results"""

    student = StudentDetailSerializer(read_only=True)
    subject = SubjectSerializer(read_only=True)
    exam_session = ExamSessionSerializer(read_only=True)
    grading_system = GradingSystemSerializer(read_only=True)

    # User information
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

    # Status display
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    # Frontend compatibility fields
    exam_marks = serializers.DecimalField(
        source="exam_score", read_only=True, max_digits=5, decimal_places=2
    )
    mark_obtained = serializers.DecimalField(
        source="total_score", read_only=True, max_digits=5, decimal_places=2
    )
    total_obtainable = serializers.SerializerMethodField()
    position = serializers.SerializerMethodField()

    class Meta:
        model = JuniorSecondaryResult
        fields = "__all__"

    def get_total_obtainable(self, obj):
        return 100  # Always 100 for Junior Secondary

    def get_position(self, obj):
        if obj.subject_position:
            suffix = (
                "st"
                if obj.subject_position == 1
                else (
                    "nd"
                    if obj.subject_position == 2
                    else "rd" if obj.subject_position == 3 else "th"
                )
            )
            return f"{obj.subject_position}{suffix}"
        return ""


class JuniorSecondaryResultCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating Junior Secondary results"""

    # Make foreign key fields optional for updates
    student = serializers.PrimaryKeyRelatedField(
        queryset=Student.objects.all(), required=False
    )
    subject = serializers.PrimaryKeyRelatedField(
        queryset=Subject.objects.all(), required=False
    )
    exam_session = serializers.PrimaryKeyRelatedField(
        queryset=ExamSession.objects.all(), required=False
    )
    grading_system = serializers.PrimaryKeyRelatedField(
        queryset=GradingSystem.objects.all(), required=False
    )

    class Meta:
        model = JuniorSecondaryResult
        fields = [
            "student",
            "subject",
            "exam_session",
            "grading_system",
            "continuous_assessment_score",
            "take_home_test_score",
            "practical_score",
            "appearance_score",
            "project_score",
            "note_copying_score",
            "exam_score",
            "teacher_remark",
            "class_teacher_remark",
            "head_teacher_remark",
            "status",
        ]

    def validate(self, data):
        """Validate Junior Secondary result data"""
        # Validate scores are within reasonable limits
        if data.get("continuous_assessment_score", 0) > 15:
            raise serializers.ValidationError(
                "Continuous Assessment score cannot exceed 15 marks"
            )
        if data.get("take_home_test_score", 0) > 5:
            raise serializers.ValidationError(
                "Take Home Test score cannot exceed 5 marks"
            )
        if data.get("practical_score", 0) > 5:
            raise serializers.ValidationError("Practical score cannot exceed 5 marks")
        if data.get("appearance_score", 0) > 5:
            raise serializers.ValidationError("Appearance score cannot exceed 5 marks")
        if data.get("project_score", 0) > 5:
            raise serializers.ValidationError("Project score cannot exceed 5 marks")
        if data.get("note_copying_score", 0) > 5:
            raise serializers.ValidationError(
                "Note Copying score cannot exceed 5 marks"
            )
        if data.get("exam_score", 0) > 60:
            raise serializers.ValidationError("Exam score cannot exceed 60 marks")

        return data

    def create(self, validated_data):
        """Set tracking fields when creating"""
        request = self.context.get("request")
        if request and request.user:
            validated_data["entered_by"] = request.user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        """Set tracking fields when updating"""
        request = self.context.get("request")
        if request and request.user:
            from django.utils import timezone

            validated_data["last_edited_by"] = request.user
            validated_data["last_edited_at"] = timezone.now()
        return super().update(instance, validated_data)


# ===== PRIMARY SERIALIZERS =====
class PrimaryTermReportSerializer(serializers.ModelSerializer):
    """Serializer for consolidated Primary term reports"""

    student = StudentDetailSerializer(read_only=True)
    exam_session = ExamSessionSerializer(read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    published_by_name = serializers.CharField(
        source="published_by.full_name", read_only=True
    )
    subject_results = serializers.SerializerMethodField()

    class Meta:
        model = PrimaryTermReport
        fields = "__all__"

    def get_subject_results(self, obj):
        """Get all subject results linked to this term report"""
        return PrimaryResultSerializer(obj.subject_results.all(), many=True).data

    def validate_status(self, value):
        """
        Validate status transitions:
        DRAFT -> SUBMITTED (by teacher)
        SUBMITTED -> APPROVED (by admin)
        APPROVED -> PUBLISHED (by admin)

        Cannot go backwards or skip steps
        """
        instance = self.instance
        if not instance:
            # Creating new record, only allow DRAFT
            if value not in ["DRAFT", "SUBMITTED"]:
                raise serializers.ValidationError(
                    "New term reports must start as DRAFT or SUBMITTED"
                )
            return value

        current_status = instance.status

        # Define valid transitions
        valid_transitions = {
            "DRAFT": ["SUBMITTED", "APPROVED"],  # Can skip to APPROVED for admin
            "SUBMITTED": ["APPROVED", "DRAFT"],  # Can go back to DRAFT if needed
            "APPROVED": [
                "PUBLISHED",
                "SUBMITTED",
            ],  # Can go back to SUBMITTED if needed
            "PUBLISHED": [],  # Cannot change once published
        }

        if current_status == value:
            # Same status is always valid
            return value

        if value not in valid_transitions.get(current_status, []):
            raise serializers.ValidationError(
                f"Cannot change status from {current_status} to {value}. "
                f"Valid transitions: {', '.join(valid_transitions.get(current_status, []))}"
            )

        return value


class PrimaryResultSerializer(serializers.ModelSerializer):
    """Serializer for Primary specific results"""

    student = StudentDetailSerializer(read_only=True)
    subject = SubjectSerializer(read_only=True)
    exam_session = ExamSessionSerializer(read_only=True)
    grading_system = GradingSystemSerializer(read_only=True)

    # User information
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

    # Status display
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    # Frontend compatibility fields
    exam_marks = serializers.DecimalField(
        source="exam_score", read_only=True, max_digits=5, decimal_places=2
    )
    mark_obtained = serializers.DecimalField(
        source="total_score", read_only=True, max_digits=5, decimal_places=2
    )
    total_obtainable = serializers.SerializerMethodField()
    position = serializers.SerializerMethodField()

    class Meta:
        model = PrimaryResult
        fields = "__all__"

    def get_total_obtainable(self, obj):
        return 100  # Always 100 for Primary

    def get_position(self, obj):
        if obj.subject_position:
            suffix = (
                "st"
                if obj.subject_position == 1
                else (
                    "nd"
                    if obj.subject_position == 2
                    else "rd" if obj.subject_position == 3 else "th"
                )
            )
            return f"{obj.subject_position}{suffix}"
        return ""


class PrimaryResultCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating Primary results"""

    # Make foreign key fields optional for updates
    student = serializers.PrimaryKeyRelatedField(
        queryset=Student.objects.all(), required=False
    )
    subject = serializers.PrimaryKeyRelatedField(
        queryset=Subject.objects.all(), required=False
    )
    exam_session = serializers.PrimaryKeyRelatedField(
        queryset=ExamSession.objects.all(), required=False
    )
    grading_system = serializers.PrimaryKeyRelatedField(
        queryset=GradingSystem.objects.all(), required=False
    )

    class Meta:
        model = PrimaryResult
        fields = [
            "student",
            "subject",
            "exam_session",
            "grading_system",
            "continuous_assessment_score",
            "take_home_test_score",
            "practical_score",
            "appearance_score",
            "project_score",
            "note_copying_score",
            "exam_score",
            "teacher_remark",
            "class_teacher_remark",
            "head_teacher_remark",
            "status",
        ]

    def validate(self, data):
        """Validate Primary result data"""
        # Validate scores are within reasonable limits (same as Junior Secondary)
        if data.get("continuous_assessment_score", 0) > 15:
            raise serializers.ValidationError(
                "Continuous Assessment score cannot exceed 15 marks"
            )
        if data.get("take_home_test_score", 0) > 5:
            raise serializers.ValidationError(
                "Take Home Test score cannot exceed 5 marks"
            )
        if data.get("practical_score", 0) > 5:
            raise serializers.ValidationError("Practical score cannot exceed 5 marks")
        if data.get("appearance_score", 0) > 5:
            raise serializers.ValidationError("Appearance score cannot exceed 5 marks")
        if data.get("project_score", 0) > 5:
            raise serializers.ValidationError("Project score cannot exceed 5 marks")
        if data.get("note_copying_score", 0) > 5:
            raise serializers.ValidationError(
                "Note Copying score cannot exceed 5 marks"
            )
        if data.get("exam_score", 0) > 60:
            raise serializers.ValidationError("Exam score cannot exceed 60 marks")

        return data

    def create(self, validated_data):
        """Set tracking fields when creating"""
        request = self.context.get("request")
        if request and request.user:
            validated_data["entered_by"] = request.user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        """Set tracking fields when updating"""
        request = self.context.get("request")
        if request and request.user:
            from django.utils import timezone

            validated_data["last_edited_by"] = request.user
            validated_data["last_edited_at"] = timezone.now()
        return super().update(instance, validated_data)


# ===== NURSERY SERIALIZERS =====
class NurseryTermReportSerializer(serializers.ModelSerializer):
    """Serializer for consolidated Nursery term reports"""

    student = StudentDetailSerializer(read_only=True)
    exam_session = ExamSessionSerializer(read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    published_by_name = serializers.CharField(
        source="published_by.full_name", read_only=True
    )
    subject_results = serializers.SerializerMethodField()

    # Physical development display fields
    physical_development_display = serializers.CharField(
        source="get_physical_development_display", read_only=True
    )
    health_display = serializers.CharField(source="get_health_display", read_only=True)
    cleanliness_display = serializers.CharField(
        source="get_cleanliness_display", read_only=True
    )
    general_conduct_display = serializers.CharField(
        source="get_general_conduct_display", read_only=True
    )

    class Meta:
        model = NurseryTermReport
        fields = "__all__"

    def get_subject_results(self, obj):
        """Get all subject results linked to this term report"""
        return NurseryResultSerializer(obj.subject_results.all(), many=True).data

    def validate_status(self, value):
        """
        Validate status transitions:
        DRAFT -> SUBMITTED (by teacher)
        SUBMITTED -> APPROVED (by admin)
        APPROVED -> PUBLISHED (by admin)

        Cannot go backwards or skip steps
        """
        instance = self.instance
        if not instance:
            # Creating new record, only allow DRAFT
            if value not in ["DRAFT", "SUBMITTED"]:
                raise serializers.ValidationError(
                    "New term reports must start as DRAFT or SUBMITTED"
                )
            return value

        current_status = instance.status

        # Define valid transitions
        valid_transitions = {
            "DRAFT": ["SUBMITTED", "APPROVED"],  # Can skip to APPROVED for admin
            "SUBMITTED": ["APPROVED", "DRAFT"],  # Can go back to DRAFT if needed
            "APPROVED": [
                "PUBLISHED",
                "SUBMITTED",
            ],  # Can go back to SUBMITTED if needed
            "PUBLISHED": [],  # Cannot change once published
        }

        if current_status == value:
            # Same status is always valid
            return value

        if value not in valid_transitions.get(current_status, []):
            raise serializers.ValidationError(
                f"Cannot change status from {current_status} to {value}. "
                f"Valid transitions: {', '.join(valid_transitions.get(current_status, []))}"
            )

        return value


class NurseryResultSerializer(serializers.ModelSerializer):
    """Serializer for Nursery specific results"""

    student = StudentDetailSerializer(read_only=True)
    subject = SubjectSerializer(read_only=True)
    exam_session = ExamSessionSerializer(read_only=True)
    grading_system = GradingSystemSerializer(read_only=True)

    # User information
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

    # Status display
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = NurseryResult
        fields = "__all__"


class NurseryResultCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating Nursery results"""

    # Make foreign key fields optional for updates
    student = serializers.PrimaryKeyRelatedField(
        queryset=Student.objects.all(), required=False
    )
    subject = serializers.PrimaryKeyRelatedField(
        queryset=Subject.objects.all(), required=False
    )
    exam_session = serializers.PrimaryKeyRelatedField(
        queryset=ExamSession.objects.all(), required=False
    )
    grading_system = serializers.PrimaryKeyRelatedField(
        queryset=GradingSystem.objects.all(), required=False
    )

    class Meta:
        model = NurseryResult
        fields = [
            "student",
            "subject",
            "exam_session",
            "grading_system",
            "max_marks_obtainable",
            "mark_obtained",
            "academic_comment",
            "status",
        ]

    def validate(self, data):
        """Validate Nursery result data"""
        max_marks = data.get("max_marks_obtainable", 0)
        mark_obtained = data.get("mark_obtained", 0)

        if mark_obtained > max_marks:
            raise serializers.ValidationError(
                "Mark obtained cannot exceed max marks obtainable"
            )

        return data

    def create(self, validated_data):
        """Set tracking fields when creating"""
        request = self.context.get("request")
        if request and request.user:
            validated_data["entered_by"] = request.user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        """Set tracking fields when updating"""
        request = self.context.get("request")
        if request and request.user:
            from django.utils import timezone

            validated_data["last_edited_by"] = request.user
            validated_data["last_edited_at"] = timezone.now()
        return super().update(instance, validated_data)


# ===== CONSOLIDATED REPORT SERIALIZERS =====
class ConsolidatedTermReportSerializer(serializers.Serializer):
    """Unified serializer for all education level term reports"""

    def to_representation(self, instance):
        """Return appropriate serializer based on education level"""
        education_level = getattr(instance.student, "education_level", None)

        if education_level == "SENIOR_SECONDARY":
            return SeniorSecondaryTermReportSerializer(
                instance, context=self.context
            ).data
        elif education_level == "JUNIOR_SECONDARY":
            return JuniorSecondaryTermReportSerializer(
                instance, context=self.context
            ).data
        elif education_level == "PRIMARY":
            return PrimaryTermReportSerializer(instance, context=self.context).data
        elif education_level == "NURSERY":
            return NurseryTermReportSerializer(instance, context=self.context).data
        else:
            # Fallback to basic structure
            return {
                "id": str(instance.id),
                "student": StudentDetailSerializer(instance.student).data,
                "exam_session": ExamSessionSerializer(instance.exam_session).data,
                "education_level": education_level,
                "status": getattr(instance, "status", "DRAFT"),
            }


class ConsolidatedResultSerializer(serializers.Serializer):
    """Unified serializer for all education level results"""

    def to_representation(self, instance):
        """Return appropriate serializer based on education level"""
        education_level = getattr(instance.student, "education_level", None)

        if education_level == "SENIOR_SECONDARY":
            return SeniorSecondaryResultSerializer(instance, context=self.context).data
        elif education_level == "JUNIOR_SECONDARY":
            return JuniorSecondaryResultSerializer(instance, context=self.context).data
        elif education_level == "PRIMARY":
            return PrimaryResultSerializer(instance, context=self.context).data
        elif education_level == "NURSERY":
            return NurseryResultSerializer(instance, context=self.context).data
        else:
            # Fallback to base StudentResult
            return StudentResultSerializer(
                instance, context=self.context
            ).dataSerializerMethodField()

    comments = ResultCommentSerializer(many=True, read_only=True)
    term_display = serializers.CharField(source="get_term_display", read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = StudentTermResult
        fields = [
            "id",
            "student",
            "academic_session",
            "term",
            "term_display",
            "total_subjects",
            "subjects_passed",
            "subjects_failed",
            "total_score",
            "average_score",
            "gpa",
            "class_position",
            "total_students",
            "status",
            "status_display",
            "remarks",
            "next_term_begins",
            "subject_results",
            "comments",
            "created_at",
        ]

    def get_subject_results(self, obj):
        # Always return a combined list from base results and education-level specific results
        combined = []

        # Get education level to determine which results to fetch
        education_level = getattr(obj.student, "education_level", None)

        if education_level == "SENIOR_SECONDARY":
            # Senior Secondary specific results
            try:
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
                                getattr(r.stream, "stream_type", None)
                                if r.stream
                                else None
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
                                r.created_at.isoformat()
                                if hasattr(r, "created_at")
                                else ""
                            ),
                        }
                    )
            except Exception:
                pass

        elif education_level == "JUNIOR_SECONDARY":
            # Junior Secondary specific results
            try:
                junior_results = JuniorSecondaryResult.objects.filter(
                    student=obj.student,
                    exam_session__term=obj.term,
                    exam_session__academic_session=obj.academic_session,
                ).select_related("subject", "grading_system", "exam_session")

                for r in junior_results:
                    combined.append(
                        {
                            "id": str(r.id),
                            "subject": SubjectSerializer(r.subject).data,
                            "exam_session": ExamSessionSerializer(r.exam_session).data,
                            "ca_score": r.ca_total,
                            "exam_score": r.exam_score,
                            "total_score": r.total_score,
                            "percentage": r.total_percentage,
                            "grade": r.grade,
                            "grade_point": r.grade_point,
                            "is_passed": r.is_passed,
                            "position": r.subject_position,
                            "remarks": r.teacher_remark,
                            "status": r.status,
                            "assessment_scores": [],
                            "created_at": (
                                r.created_at.isoformat()
                                if hasattr(r, "created_at")
                                else ""
                            ),
                        }
                    )
            except Exception:
                pass

        elif education_level == "PRIMARY":
            # Primary specific results
            try:
                primary_results = PrimaryResult.objects.filter(
                    student=obj.student,
                    exam_session__term=obj.term,
                    exam_session__academic_session=obj.academic_session,
                ).select_related("subject", "grading_system", "exam_session")

                for r in primary_results:
                    combined.append(
                        {
                            "id": str(r.id),
                            "subject": SubjectSerializer(r.subject).data,
                            "exam_session": ExamSessionSerializer(r.exam_session).data,
                            "ca_score": r.ca_total,
                            "exam_score": r.exam_score,
                            "total_score": r.total_score,
                            "percentage": r.total_percentage,
                            "grade": r.grade,
                            "grade_point": r.grade_point,
                            "is_passed": r.is_passed,
                            "position": r.subject_position,
                            "remarks": r.teacher_remark,
                            "status": r.status,
                            "assessment_scores": [],
                            "created_at": (
                                r.created_at.isoformat()
                                if hasattr(r, "created_at")
                                else ""
                            ),
                        }
                    )
            except Exception:
                pass

        elif education_level == "NURSERY":
            # Nursery specific results
            try:
                nursery_results = NurseryResult.objects.filter(
                    student=obj.student,
                    exam_session__term=obj.term,
                    exam_session__academic_session=obj.academic_session,
                ).select_related("subject", "grading_system", "exam_session")

                for r in nursery_results:
                    combined.append(
                        {
                            "id": str(r.id),
                            "subject": SubjectSerializer(r.subject).data,
                            "exam_session": ExamSessionSerializer(r.exam_session).data,
                            "mark_obtained": r.mark_obtained,
                            "max_marks_obtainable": r.max_marks_obtainable,
                            "percentage": r.percentage,
                            "grade": r.grade,
                            "grade_point": r.grade_point,
                            "is_passed": r.is_passed,
                            "position": r.subject_position,
                            "remarks": r.academic_comment,
                            "status": r.status,
                            "assessment_scores": [],
                            "created_at": (
                                r.created_at.isoformat()
                                if hasattr(r, "created_at")
                                else ""
                            ),
                        }
                    )
            except Exception:
                pass

        # Fallback to base StudentResult if no specific results found
        if not combined:
            base_results = StudentResult.objects.filter(
                student=obj.student,
                exam_session__term=obj.term,
                exam_session__academic_session=obj.academic_session,
            ).select_related("subject", "grading_system", "exam_session")
            combined.extend(StudentResultSerializer(base_results, many=True).data)

        return combined


class StudentTermResultDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for StudentTermResult with full subject breakdown"""

    student = StudentDetailSerializer(read_only=True)
    academic_session = AcademicSessionSerializer(read_only=True)
    subject_results = serializers.SerializerMethodField()
    comments = ResultCommentSerializer(many=True, read_only=True)
    term_display = serializers.CharField(source="get_term_display", read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = StudentTermResult
        fields = "__all__"

    def get_subject_results(self, obj):
        # Get all results for this student in this term across education levels
        education_level = getattr(obj.student, "education_level", None)

        if education_level == "SENIOR_SECONDARY":
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

        elif education_level == "JUNIOR_SECONDARY":
            return JuniorSecondaryResultSerializer(
                JuniorSecondaryResult.objects.filter(
                    student=obj.student,
                    exam_session__term=obj.term,
                    exam_session__academic_session=obj.academic_session,
                ).select_related("subject", "grading_system", "exam_session"),
                many=True,
            ).data

        elif education_level == "PRIMARY":
            return PrimaryResultSerializer(
                PrimaryResult.objects.filter(
                    student=obj.student,
                    exam_session__term=obj.term,
                    exam_session__academic_session=obj.academic_session,
                ).select_related("subject", "grading_system", "exam_session"),
                many=True,
            ).data

        elif education_level == "NURSERY":
            return NurseryResultSerializer(
                NurseryResult.objects.filter(
                    student=obj.student,
                    exam_session__term=obj.term,
                    exam_session__academic_session=obj.academic_session,
                ).select_related("subject", "grading_system", "exam_session"),
                many=True,
            ).data

        else:
            # Fallback to base StudentResult
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
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    entered_by_name = serializers.CharField(
        source="entered_by.full_name", read_only=True
    )
    approved_by_name = serializers.CharField(
        source="approved_by.full_name", read_only=True
    )

    class Meta:
        model = StudentResult
        fields = "__all__"


class ResultSheetSerializer(serializers.ModelSerializer):
    exam_session = ExamSessionSerializer(read_only=True)
    student_class_display = serializers.CharField(
        source="get_student_class_display", read_only=True
    )
    education_level_display = serializers.CharField(
        source="get_education_level_display", read_only=True
    )
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    prepared_by_name = serializers.CharField(
        source="prepared_by.full_name", read_only=True
    )
    approved_by_name = serializers.CharField(
        source="approved_by.full_name", read_only=True
    )

    class Meta:
        model = ResultSheet
        fields = "__all__"


# ===== SENIOR SECONDARY SERIALIZERS =====
class SeniorSecondaryTermReportSerializer(serializers.ModelSerializer):
    """Serializer for consolidated Senior Secondary term reports"""

    student = StudentDetailSerializer(read_only=True)
    exam_session = ExamSessionSerializer(read_only=True)
    stream_name = serializers.CharField(source="stream.name", read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    published_by_name = serializers.CharField(
        source="published_by.full_name", read_only=True
    )
    subject_results = serializers.SerializerMethodField()

    class Meta:
        model = SeniorSecondaryTermReport
        fields = "__all__"

    def get_subject_results(self, obj):
        """Get all subject results linked to this term report"""
        return SeniorSecondaryResultSerializer(
            obj.subject_results.all(), many=True
        ).data

    def validate_status(self, value):
        """
        Validate status transitions:
        DRAFT -> SUBMITTED (by teacher)
        SUBMITTED -> APPROVED (by admin)
        APPROVED -> PUBLISHED (by admin)

        Cannot go backwards or skip steps
        """
        instance = self.instance
        if not instance:
            # Creating new record, only allow DRAFT
            if value not in ["DRAFT", "SUBMITTED"]:
                raise serializers.ValidationError(
                    "New term reports must start as DRAFT or SUBMITTED"
                )
            return value

        current_status = instance.status

        # Define valid transitions
        valid_transitions = {
            "DRAFT": ["SUBMITTED", "APPROVED"],  # Can skip to APPROVED for admin
            "SUBMITTED": ["APPROVED", "DRAFT"],  # Can go back to DRAFT if needed
            "APPROVED": [
                "PUBLISHED",
                "SUBMITTED",
            ],  # Can go back to SUBMITTED if needed
            "PUBLISHED": [],  # Cannot change once published
        }

        if current_status == value:
            # Same status is always valid
            return value

        if value not in valid_transitions.get(current_status, []):
            raise serializers.ValidationError(
                f"Cannot change status from {current_status} to {value}. "
                f"Valid transitions: {', '.join(valid_transitions.get(current_status, []))}"
            )

        return value
