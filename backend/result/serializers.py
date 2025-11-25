# from rest_framework import serializers
# from students.models import Student
# from subject.models import Subject
# from .models import (
#     GradingSystem,
#     Grade,
#     AssessmentType,
#     ExamSession,
#     StudentResult,
#     StudentTermResult,
#     ResultSheet,
#     AssessmentScore,
#     ResultComment,
#     SeniorSecondaryResult,
#     SeniorSecondarySessionResult,
#     SeniorSecondaryTermReport,
#     SeniorSecondarySessionReport,
#     JuniorSecondaryResult,
#     JuniorSecondaryTermReport,
#     PrimaryResult,
#     PrimaryTermReport,
#     NurseryResult,
#     NurseryTermReport,
#     ScoringConfiguration,
# )
# from students.serializers import StudentDetailSerializer
# from subject.serializers import SubjectSerializer
# from academics.serializers import AcademicSessionSerializer


# class ScoringConfigurationSerializer(serializers.ModelSerializer):
#     """Serializer for ScoringConfiguration model"""

#     education_level_display = serializers.CharField(
#         source="get_education_level_display", read_only=True
#     )
#     result_type_display = serializers.CharField(
#         source="get_result_type_display", read_only=True
#     )
#     total_ca_max_score = serializers.DecimalField(
#         source="ca_total_max_score", read_only=True, max_digits=5, decimal_places=2
#     )

#     # Add frontend field names for compatibility
#     first_test_max_score = serializers.DecimalField(
#         decimal_places=2, max_digits=5, required=True, source="test1_max_score"
#     )
#     second_test_max_score = serializers.DecimalField(
#         decimal_places=2, max_digits=5, required=True, source="test2_max_score"
#     )
#     third_test_max_score = serializers.DecimalField(
#         decimal_places=2, max_digits=5, required=True, source="test3_max_score"
#     )

#     # Add created_by information
#     created_by_name = serializers.CharField(
#         source="created_by.full_name", read_only=True
#     )

#     class Meta:
#         model = ScoringConfiguration
#         fields = [
#             "id",
#             "name",
#             "education_level",
#             "education_level_display",
#             "result_type",
#             "result_type_display",
#             "description",
#             "test1_max_score",
#             "test2_max_score",
#             "test3_max_score",
#             "first_test_max_score",
#             "second_test_max_score",
#             "third_test_max_score",
#             "continuous_assessment_max_score",
#             "take_home_test_max_score",
#             "appearance_max_score",
#             "practical_max_score",
#             "project_max_score",
#             "note_copying_max_score",
#             "exam_max_score",
#             "total_max_score",
#             "ca_weight_percentage",
#             "exam_weight_percentage",
#             "total_ca_max_score",
#             "is_active",
#             "is_default",
#             "created_by",
#             "created_by_name",
#             "created_at",
#             "updated_at",
#         ]
#         read_only_fields = ["id", "created_at", "updated_at"]


# class ScoringConfigurationCreateUpdateSerializer(serializers.ModelSerializer):
#     """Serializer for creating/updating ScoringConfiguration"""

#     # Map frontend field names to backend field names - make them optional
#     # Nursery mapping
#     exam_max_score = serializers.DecimalField(
#         max_digits=5, decimal_places=2, required=False, allow_null=True
#     )
#     total_max_score = serializers.DecimalField(
#         max_digits=5, decimal_places=2, required=False, allow_null=True
#     )

#     first_test_max_score = serializers.DecimalField(
#         source="test1_max_score",
#         max_digits=5,
#         decimal_places=2,
#         coerce_to_string=False,
#         required=False,
#         allow_null=True,
#     )
#     second_test_max_score = serializers.DecimalField(
#         source="test2_max_score",
#         max_digits=5,
#         decimal_places=2,
#         coerce_to_string=False,
#         required=False,
#         allow_null=True,
#     )
#     third_test_max_score = serializers.DecimalField(
#         source="test3_max_score",
#         max_digits=5,
#         decimal_places=2,
#         coerce_to_string=False,
#         required=False,
#         allow_null=True,
#     )

#     class Meta:
#         model = ScoringConfiguration
#         fields = [
#             "name",
#             "education_level",
#             "result_type",
#             "description",
#             "first_test_max_score",
#             "second_test_max_score",
#             "third_test_max_score",
#             "continuous_assessment_max_score",
#             "take_home_test_max_score",
#             "appearance_max_score",
#             "practical_max_score",
#             "project_max_score",
#             "note_copying_max_score",
#             "exam_max_score",
#             "total_max_score",
#             "ca_weight_percentage",
#             "exam_weight_percentage",
#             "is_active",
#             "is_default",
#         ]

#     def validate(self, data):
#         """Enhanced validation for scoring configuration"""
#         # Set default result_type if not provided
#         if "result_type" not in data:
#             data["result_type"] = "TERMLY"

#         result_type = data.get("result_type", "TERMLY")
#         education_level = data.get("education_level")

#         # IMPORTANT: Check both the source field name (test1_max_score)
#         # AND the frontend field name (first_test_max_score)
#         # because DRF puts the value in the source field during validation

#         # Validate required fields based on education level
#         if education_level in ["JUNIOR_SECONDARY", "PRIMARY"]:
#             # For Junior Secondary and Primary, require the CA fields
#             required_fields = [
#                 "continuous_assessment_max_score",
#                 "take_home_test_max_score",
#                 "appearance_max_score",
#                 "practical_max_score",
#                 "project_max_score",
#                 "note_copying_max_score",
#             ]
#             for field in required_fields:
#                 if field not in data or data[field] is None:
#                     raise serializers.ValidationError(
#                         {
#                             field: [
#                                 "This field is required for Junior Secondary and Primary education levels."
#                             ]
#                         }
#                     )
#         elif education_level == "SENIOR_SECONDARY":
#             # For Senior Secondary, check the SOURCE field names (test1_max_score, etc.)
#             # because DRF has already mapped them during field validation
#             required_test_fields = {
#                 "test1_max_score": "First test score",
#                 "test2_max_score": "Second test score",
#                 "test3_max_score": "Third test score",
#             }

#             for field, display_name in required_test_fields.items():
#                 if field not in data or data[field] is None:
#                     raise serializers.ValidationError(
#                         {
#                             field: [
#                                 f"{display_name} is required for Senior Secondary education level."
#                             ]
#                         }
#                     )
#         elif education_level == "NURSERY":
#             # For Nursery, only require total_max_score
#             if "total_max_score" not in data or data["total_max_score"] is None:
#                 raise serializers.ValidationError(
#                     {
#                         "total_max_score": [
#                             "Max Mark Obtainable is required for Nursery education level."
#                         ]
#                     }
#                 )

#         # Only validate weight percentages for TERMLY result type and non-Nursery education levels
#         if result_type == "TERMLY" and education_level != "NURSERY":
#             ca_weight = data.get("ca_weight_percentage", 0)
#             exam_weight = data.get("exam_weight_percentage", 0)

#             # Validate weight percentages sum to 100
#             if ca_weight + exam_weight != 100:
#                 raise serializers.ValidationError(
#                     {
#                         "non_field_errors": [
#                             "CA weight percentage and exam weight percentage must sum to 100"
#                         ]
#                     }
#                 )

#         # Validate total max score matches sum of components (only for TERMLY)
#         if result_type == "TERMLY":
#             if education_level in ["JUNIOR_SECONDARY", "PRIMARY"]:
#                 ca_score = data.get("continuous_assessment_max_score", 0)
#                 take_home = data.get("take_home_test_max_score", 0)
#                 appearance = data.get("appearance_max_score", 0)
#                 practical = data.get("practical_max_score", 0)
#                 project = data.get("project_max_score", 0)
#                 note_copying = data.get("note_copying_max_score", 0)
#                 exam = data.get("exam_max_score", 0)

#                 expected_total = (
#                     ca_score
#                     + take_home
#                     + appearance
#                     + practical
#                     + project
#                     + note_copying
#                     + exam
#                 )
#             elif education_level == "SENIOR_SECONDARY":
#                 # Use the SOURCE field names (test1_max_score, etc.)
#                 # DRF has already mapped the frontend names to source names
#                 first_test = data.get("test1_max_score", 0)
#                 second_test = data.get("test2_max_score", 0)
#                 third_test = data.get("test3_max_score", 0)

#                 # For TERMLY result type, the total should be tests + exam
#                 expected_total = (
#                     first_test
#                     + second_test
#                     + third_test
#                     + data.get("exam_max_score", 0)
#                 )
#             elif education_level == "NURSERY":
#                 # For Nursery, the total is just the max mark obtainable
#                 expected_total = data.get("total_max_score", 0)

#             total_max_score = data.get("total_max_score", 0)
#             if expected_total != total_max_score:
#                 raise serializers.ValidationError(
#                     {
#                         "total_max_score": [
#                             f"Total max score must equal sum of components ({expected_total})"
#                         ]
#                     }
#                 )

#         return data

#     def create(self, validated_data):
#         """Set created_by when creating and handle data type conversion"""
#         request = self.context.get("request")
#         if request and request.user:
#             validated_data["created_by"] = request.user

#         # Note: Field mapping from first_test_max_score -> test1_max_score
#         # is already handled by DRF because we used source="test1_max_score"
#         # So validated_data already has the correct field names

#         # Ensure all decimal fields are properly converted
#         decimal_fields = [
#             "test1_max_score",
#             "test2_max_score",
#             "test3_max_score",
#             "continuous_assessment_max_score",
#             "take_home_test_max_score",
#             "appearance_max_score",
#             "practical_max_score",
#             "project_max_score",
#             "note_copying_max_score",
#             "exam_max_score",
#             "total_max_score",
#             "ca_weight_percentage",
#             "exam_weight_percentage",
#         ]

#         for field in decimal_fields:
#             if field in validated_data and validated_data[field] is not None:
#                 from decimal import Decimal

#                 validated_data[field] = Decimal(str(validated_data[field]))

#         return super().create(validated_data)

#     def update(self, instance, validated_data):
#         """Handle field mapping during updates"""
#         # Note: Field mapping is already handled by DRF source parameter
#         # So validated_data already has the correct field names (test1_max_score, etc.)

#         # Ensure all decimal fields are properly converted
#         decimal_fields = [
#             "test1_max_score",
#             "test2_max_score",
#             "test3_max_score",
#             "continuous_assessment_max_score",
#             "take_home_test_max_score",
#             "appearance_max_score",
#             "practical_max_score",
#             "project_max_score",
#             "note_copying_max_score",
#             "exam_max_score",
#             "total_max_score",
#             "ca_weight_percentage",
#             "exam_weight_percentage",
#         ]

#         for field in decimal_fields:
#             if field in validated_data and validated_data[field] is not None:
#                 from decimal import Decimal

#                 validated_data[field] = Decimal(str(validated_data[field]))

#         return super().update(instance, validated_data)


# class GradingSystemSerializer(serializers.ModelSerializer):
#     grades = serializers.SerializerMethodField()
#     grading_type_display = serializers.CharField(
#         source="get_grading_type_display", read_only=True
#     )

#     class Meta:
#         model = GradingSystem
#         fields = "__all__"

#     def get_grades(self, obj):
#         return GradeSerializer(obj.grades.all(), many=True).data


# class GradeSerializer(serializers.ModelSerializer):
#     grading_system_name = serializers.CharField(
#         source="grading_system.name", read_only=True
#     )

#     class Meta:
#         model = Grade
#         fields = "__all__"


# class AssessmentTypeSerializer(serializers.ModelSerializer):
#     education_level_display = serializers.CharField(
#         source="get_education_level_display", read_only=True
#     )

#     class Meta:
#         model = AssessmentType
#         fields = "__all__"


# class ExamSessionSerializer(serializers.ModelSerializer):
#     exam_type_display = serializers.CharField(
#         source="get_exam_type_display", read_only=True
#     )
#     term_display = serializers.CharField(source="get_term_display", read_only=True)
#     academic_session_name = serializers.CharField(
#         source="academic_session.name", read_only=True
#     )

#     class Meta:
#         model = ExamSession
#         fields = "__all__"


# class AssessmentScoreSerializer(serializers.ModelSerializer):
#     assessment_type = AssessmentTypeSerializer(read_only=True)

#     class Meta:
#         model = AssessmentScore
#         fields = "__all__"


# class ResultCommentSerializer(serializers.ModelSerializer):
#     comment_type_display = serializers.CharField(
#         source="get_comment_type_display", read_only=True
#     )
#     commented_by_name = serializers.CharField(
#         source="commented_by.full_name", read_only=True
#     )

#     class Meta:
#         model = ResultComment
#         fields = "__all__"


# class StudentResultSerializer(serializers.ModelSerializer):
#     student = StudentDetailSerializer(read_only=True)
#     subject = SubjectSerializer(read_only=True)
#     exam_session = ExamSessionSerializer(read_only=True)
#     grading_system = GradingSystemSerializer(read_only=True)
#     assessment_scores = AssessmentScoreSerializer(many=True, read_only=True)
#     comments = ResultCommentSerializer(many=True, read_only=True)
#     # Stream information
#     stream_name = serializers.CharField(source="stream.name", read_only=True)
#     stream_type = serializers.CharField(source="stream.stream_type", read_only=True)
#     # Status display
#     status_display = serializers.CharField(source="get_status_display", read_only=True)
#     # User information
#     entered_by_name = serializers.CharField(
#         source="entered_by.full_name", read_only=True
#     )
#     approved_by_name = serializers.CharField(
#         source="approved_by.full_name", read_only=True
#     )

#     class Meta:
#         model = StudentResult
#         fields = "__all__"


# class StudentTermResultSerializer(serializers.ModelSerializer):
#     student = StudentDetailSerializer(read_only=True)
#     academic_session = AcademicSessionSerializer(read_only=True)
#     subject_results = serializers.SerializerMethodField()

#     class Meta:
#         model = StudentTermResult
#         fields = "__all__"

#     def get_subject_results(self, obj):
#         """Get all subject results linked to this term report"""
#         # StudentTermResult doesn't have direct subject_results relationship
#         # We need to get results based on student, session, and term
#         from .models import (
#             StudentResult,
#             SeniorSecondaryResult,
#             PrimaryResult,
#             JuniorSecondaryResult,
#             NurseryResult,
#         )

#         # Determine which result model to use based on student's education level
#         education_level = obj.student.education_level

#         # First try to find results for the exact academic session and term
#         if education_level == "SENIOR_SECONDARY":
#             results = SeniorSecondaryResult.objects.filter(
#                 student=obj.student,
#                 exam_session__academic_session=obj.academic_session,
#                 exam_session__term=obj.term,
#             ).select_related("subject", "grading_system", "exam_session")

#             # If no results found, try to find results for the same term in any academic session
#             if not results.exists():
#                 results = (
#                     SeniorSecondaryResult.objects.filter(
#                         student=obj.student, exam_session__term=obj.term
#                     )
#                     .select_related("subject", "grading_system", "exam_session")
#                     .order_by("-exam_session__academic_session__start_date")
#                 )

#         elif education_level == "PRIMARY":
#             results = PrimaryResult.objects.filter(
#                 student=obj.student,
#                 exam_session__academic_session=obj.academic_session,
#                 exam_session__term=obj.term,
#             ).select_related("subject", "grading_system", "exam_session")

#             if not results.exists():
#                 results = (
#                     PrimaryResult.objects.filter(
#                         student=obj.student, exam_session__term=obj.term
#                     )
#                     .select_related("subject", "grading_system", "exam_session")
#                     .order_by("-exam_session__academic_session__start_date")
#                 )

#         elif education_level == "JUNIOR_SECONDARY":
#             results = JuniorSecondaryResult.objects.filter(
#                 student=obj.student,
#                 exam_session__academic_session=obj.academic_session,
#                 exam_session__term=obj.term,
#             ).select_related("subject", "grading_system", "exam_session")

#             if not results.exists():
#                 results = (
#                     JuniorSecondaryResult.objects.filter(
#                         student=obj.student, exam_session__term=obj.term
#                     )
#                     .select_related("subject", "grading_system", "exam_session")
#                     .order_by("-exam_session__academic_session__start_date")
#                 )

#         elif education_level == "NURSERY":
#             results = NurseryResult.objects.filter(
#                 student=obj.student,
#                 exam_session__academic_session=obj.academic_session,
#                 exam_session__term=obj.term,
#             ).select_related("subject", "grading_system", "exam_session")

#             if not results.exists():
#                 results = (
#                     NurseryResult.objects.filter(
#                         student=obj.student, exam_session__term=obj.term
#                     )
#                     .select_related("subject", "grading_system", "exam_session")
#                     .order_by("-exam_session__academic_session__start_date")
#                 )

#         else:
#             # Fallback to base StudentResult
#             results = StudentResult.objects.filter(
#                 student=obj.student,
#                 exam_session__academic_session=obj.academic_session,
#                 exam_session__term=obj.term,
#             ).select_related("subject", "grading_system", "exam_session")

#             if not results.exists():
#                 results = (
#                     StudentResult.objects.filter(
#                         student=obj.student, exam_session__term=obj.term
#                     )
#                     .select_related("subject", "grading_system", "exam_session")
#                     .order_by("-exam_session__academic_session__start_date")
#                 )

#         # Use the appropriate serializer based on education level
#         if education_level == "SENIOR_SECONDARY":
#             from .serializers import SeniorSecondaryResultSerializer

#             return SeniorSecondaryResultSerializer(results, many=True).data
#         elif education_level == "PRIMARY":
#             from .serializers import PrimaryResultSerializer

#             return PrimaryResultSerializer(results, many=True).data
#         elif education_level == "JUNIOR_SECONDARY":
#             from .serializers import JuniorSecondaryResultSerializer

#             return JuniorSecondaryResultSerializer(results, many=True).data
#         elif education_level == "NURSERY":
#             from .serializers import NurseryResultSerializer

#             return NurseryResultSerializer(results, many=True).data
#         else:
#             return StudentResultSerializer(results, many=True).data


# class SeniorSecondarySessionReportSerializer(serializers.ModelSerializer):
#     """Serializer for consolidated Senior Secondary session reports"""

#     student = StudentDetailSerializer(read_only=True)
#     academic_session = AcademicSessionSerializer(read_only=True)
#     stream_name = serializers.CharField(source="stream.name", read_only=True)
#     status_display = serializers.CharField(source="get_status_display", read_only=True)
#     subject_results = serializers.SerializerMethodField()

#     class Meta:
#         model = SeniorSecondarySessionReport
#         fields = "__all__"

#     def get_subject_results(self, obj):
#         """Get all subject session results linked to this session report"""
#         return SeniorSecondarySessionResultSerializer(
#             obj.subject_results.all(), many=True
#         ).data

#     def validate_status(self, value):
#         """
#         Validate status transitions:
#         DRAFT -> SUBMITTED (by teacher)
#         SUBMITTED -> APPROVED (by admin)
#         APPROVED -> PUBLISHED (by admin)

#         Cannot go backwards or skip steps
#         """
#         instance = self.instance
#         if not instance:
#             # Creating new record, only allow DRAFT
#             if value not in ["DRAFT", "SUBMITTED"]:
#                 raise serializers.ValidationError(
#                     "New term reports must start as DRAFT or SUBMITTED"
#                 )
#             return value

#         current_status = instance.status

#         # Define valid transitions
#         valid_transitions = {
#             "DRAFT": ["SUBMITTED", "APPROVED"],  # Can skip to APPROVED for admin
#             "SUBMITTED": ["APPROVED", "DRAFT"],  # Can go back to DRAFT if needed
#             "APPROVED": [
#                 "PUBLISHED",
#                 "SUBMITTED",
#             ],  # Can go back to SUBMITTED if needed
#             "PUBLISHED": [],  # Cannot change once published
#         }

#         if current_status == value:
#             # Same status is always valid
#             return value

#         if value not in valid_transitions.get(current_status, []):
#             raise serializers.ValidationError(
#                 f"Cannot change status from {current_status} to {value}. "
#                 f"Valid transitions: {', '.join(valid_transitions.get(current_status, []))}"
#             )

#         return value


# class SeniorSecondaryResultSerializer(serializers.ModelSerializer):
#     """Serializer for Senior Secondary specific results"""

#     student = StudentDetailSerializer(read_only=True)
#     subject = SubjectSerializer(read_only=True)
#     exam_session = ExamSessionSerializer(read_only=True)
#     grading_system = GradingSystemSerializer(read_only=True)

#     # Additional read-only fields for display
#     student_name = serializers.CharField(source="student.full_name", read_only=True)
#     student_class = serializers.CharField(
#         source="student.student_class", read_only=True
#     )
#     subject_name = serializers.CharField(source="subject.name", read_only=True)
#     exam_session_name = serializers.CharField(
#         source="exam_session.name", read_only=True
#     )
#     grading_system_name = serializers.CharField(
#         source="grading_system.name", read_only=True
#     )

#     # Stream information
#     stream_name = serializers.CharField(source="stream.name", read_only=True)
#     stream_type = serializers.CharField(source="stream.stream_type", read_only=True)

#     # User information
#     entered_by_name = serializers.CharField(
#         source="entered_by.full_name", read_only=True
#     )
#     approved_by_name = serializers.CharField(
#         source="approved_by.full_name", read_only=True
#     )
#     published_by_name = serializers.CharField(
#         source="published_by.full_name", read_only=True
#     )
#     last_edited_by_name = serializers.CharField(
#         source="last_edited_by.full_name", read_only=True
#     )

#     # Status display
#     status_display = serializers.CharField(source="get_status_display", read_only=True)

#     # Calculated fields for frontend compatibility
#     test1_score = serializers.DecimalField(
#         source="first_test_score", read_only=True, max_digits=5, decimal_places=2
#     )
#     test2_score = serializers.DecimalField(
#         source="second_test_score", read_only=True, max_digits=5, decimal_places=2
#     )
#     test3_score = serializers.DecimalField(
#         source="third_test_score", read_only=True, max_digits=5, decimal_places=2
#     )
#     total_obtainable = serializers.SerializerMethodField()
#     position = serializers.SerializerMethodField()

#     class Meta:
#         model = SeniorSecondaryResult
#         fields = "__all__"

#     def get_total_obtainable(self, obj):
#         return 100  # Always 100 for Senior Secondary

#     def get_position(self, obj):
#         if obj.subject_position:
#             suffix = (
#                 "st"
#                 if obj.subject_position == 1
#                 else (
#                     "nd"
#                     if obj.subject_position == 2
#                     else "rd" if obj.subject_position == 3 else "th"
#                 )
#             )
#             return f"{obj.subject_position}{suffix}"
#         return ""


# class SeniorSecondaryResultCreateUpdateSerializer(serializers.ModelSerializer):
#     """Serializer for creating/updating Senior Secondary results"""

#     # Make foreign key fields optional for updates
#     student = serializers.PrimaryKeyRelatedField(
#         queryset=Student.objects.all(), required=False
#     )
#     subject = serializers.PrimaryKeyRelatedField(
#         queryset=Subject.objects.all(), required=False
#     )
#     exam_session = serializers.PrimaryKeyRelatedField(
#         queryset=ExamSession.objects.all(), required=False
#     )
#     grading_system = serializers.PrimaryKeyRelatedField(
#         queryset=GradingSystem.objects.all(), required=False
#     )

#     class Meta:
#         model = SeniorSecondaryResult
#         fields = [
#             "student",
#             "subject",
#             "exam_session",
#             "grading_system",
#             "stream",
#             "first_test_score",
#             "second_test_score",
#             "third_test_score",
#             "exam_score",
#             "teacher_remark",
#             "class_teacher_remark",
#             "head_teacher_remark",
#             "status",
#         ]

#     def validate(self, data):
#         """Validate Senior Secondary result data"""
#         # Validate test scores are within reasonable limits
#         if data.get("first_test_score", 0) > 10:
#             raise serializers.ValidationError("First test score cannot exceed 10 marks")
#         if data.get("second_test_score", 0) > 10:
#             raise serializers.ValidationError(
#                 "Second test score cannot exceed 10 marks"
#             )
#         if data.get("third_test_score", 0) > 10:
#             raise serializers.ValidationError("Third test score cannot exceed 10 marks")
#         if data.get("exam_score", 0) > 70:
#             raise serializers.ValidationError("Exam score cannot exceed 70 marks")

#         return data

#     def create(self, validated_data):
#         """Set tracking fields when creating"""
#         request = self.context.get("request")
#         if request and request.user:
#             validated_data["entered_by"] = request.user
#         return super().create(validated_data)

#     def update(self, instance, validated_data):
#         """Set tracking fields when updating"""
#         request = self.context.get("request")
#         if request and request.user:
#             from django.utils import timezone

#             validated_data["last_edited_by"] = request.user
#             validated_data["last_edited_at"] = timezone.now()
#         return super().update(instance, validated_data)


# class SeniorSecondarySessionResultSerializer(serializers.ModelSerializer):
#     """Serializer for Senior Secondary session results"""

#     student = StudentDetailSerializer(read_only=True)
#     subject = SubjectSerializer(read_only=True)
#     academic_session = AcademicSessionSerializer(read_only=True)

#     student_name = serializers.CharField(source="student.full_name", read_only=True)
#     student_class = serializers.CharField(
#         source="student.student_class", read_only=True
#     )
#     subject_name = serializers.CharField(source="subject.name", read_only=True)
#     academic_session_name = serializers.CharField(
#         source="academic_session.name", read_only=True
#     )
#     stream_name = serializers.CharField(source="stream.name", read_only=True)
#     status_display = serializers.CharField(source="get_status_display", read_only=True)

#     # Frontend compatibility fields
#     term1_score = serializers.DecimalField(
#         source="first_term_score", read_only=True, max_digits=5, decimal_places=2
#     )
#     term2_score = serializers.DecimalField(
#         source="second_term_score", read_only=True, max_digits=5, decimal_places=2
#     )
#     term3_score = serializers.DecimalField(
#         source="third_term_score", read_only=True, max_digits=5, decimal_places=2
#     )
#     average_score = serializers.DecimalField(
#         source="average_for_year", read_only=True, max_digits=5, decimal_places=2
#     )
#     position = serializers.SerializerMethodField()

#     class Meta:
#         model = SeniorSecondarySessionResult
#         fields = "__all__"

#     def get_position(self, obj):
#         if obj.subject_position:
#             suffix = (
#                 "st"
#                 if obj.subject_position == 1
#                 else (
#                     "nd"
#                     if obj.subject_position == 2
#                     else "rd" if obj.subject_position == 3 else "th"
#                 )
#             )
#             return f"{obj.subject_position}{suffix}"
#         return ""


# class SeniorSecondarySessionResultCreateUpdateSerializer(serializers.ModelSerializer):
#     """Serializer for creating/updating Senior Secondary session results"""

#     class Meta:
#         model = SeniorSecondarySessionResult
#         fields = [
#             "student",
#             "subject",
#             "academic_session",
#             "stream",
#             "first_term_score",
#             "second_term_score",
#             "third_term_score",
#             "teacher_remark",
#             "class_teacher_remark",
#             "head_teacher_remark",
#             "status",
#         ]

#     def validate(self, data):
#         """Validate Senior Secondary session result data"""
#         # Validate term scores are within reasonable limits
#         first_term = data.get("first_term_score", 0)
#         second_term = data.get("second_term_score", 0)
#         third_term = data.get("third_term_score", 0)

#         if first_term > 100:
#             raise serializers.ValidationError(
#                 "First term score cannot exceed 100 marks"
#             )
#         if second_term > 100:
#             raise serializers.ValidationError(
#                 "Second term score cannot exceed 100 marks"
#             )
#         if third_term > 100:
#             raise serializers.ValidationError(
#                 "Third term score cannot exceed 100 marks"
#             )

#         # Validate total obtained doesn't exceed obtainable
#         total_obtained = first_term + second_term + third_term
#         if total_obtained > 300:
#             raise serializers.ValidationError("Total obtained cannot exceed 300 marks")

#         return data


# # ===== JUNIOR SECONDARY SERIALIZERS =====
# class JuniorSecondaryTermReportSerializer(serializers.ModelSerializer):
#     """Serializer for consolidated Junior Secondary term reports"""

#     student = StudentDetailSerializer(read_only=True)
#     exam_session = ExamSessionSerializer(read_only=True)
#     status_display = serializers.CharField(source="get_status_display", read_only=True)
#     published_by_name = serializers.CharField(
#         source="published_by.full_name", read_only=True
#     )
#     subject_results = serializers.SerializerMethodField()

#     class Meta:
#         model = JuniorSecondaryTermReport
#         fields = "__all__"

#     def get_subject_results(self, obj):
#         """Get all subject results linked to this term report"""
#         return JuniorSecondaryResultSerializer(
#             obj.subject_results.all(), many=True
#         ).data

#     def validate_status(self, value):
#         """
#         Validate status transitions:
#         DRAFT -> SUBMITTED (by teacher)
#         SUBMITTED -> APPROVED (by admin)
#         APPROVED -> PUBLISHED (by admin)

#         Cannot go backwards or skip steps
#         """
#         instance = self.instance
#         if not instance:
#             # Creating new record, only allow DRAFT
#             if value not in ["DRAFT", "SUBMITTED"]:
#                 raise serializers.ValidationError(
#                     "New term reports must start as DRAFT or SUBMITTED"
#                 )
#             return value

#         current_status = instance.status

#         # Define valid transitions
#         valid_transitions = {
#             "DRAFT": ["SUBMITTED", "APPROVED"],  # Can skip to APPROVED for admin
#             "SUBMITTED": ["APPROVED", "DRAFT"],  # Can go back to DRAFT if needed
#             "APPROVED": [
#                 "PUBLISHED",
#                 "SUBMITTED",
#             ],  # Can go back to SUBMITTED if needed
#             "PUBLISHED": [],  # Cannot change once published
#         }

#         if current_status == value:
#             # Same status is always valid
#             return value

#         if value not in valid_transitions.get(current_status, []):
#             raise serializers.ValidationError(
#                 f"Cannot change status from {current_status} to {value}. "
#                 f"Valid transitions: {', '.join(valid_transitions.get(current_status, []))}"
#             )

#         return value


# class JuniorSecondaryResultSerializer(serializers.ModelSerializer):
#     """Serializer for Junior Secondary specific results"""

#     student = StudentDetailSerializer(read_only=True)
#     subject = SubjectSerializer(read_only=True)
#     exam_session = ExamSessionSerializer(read_only=True)
#     grading_system = GradingSystemSerializer(read_only=True)

#     # User information
#     entered_by_name = serializers.CharField(
#         source="entered_by.full_name", read_only=True
#     )
#     approved_by_name = serializers.CharField(
#         source="approved_by.full_name", read_only=True
#     )
#     published_by_name = serializers.CharField(
#         source="published_by.full_name", read_only=True
#     )
#     last_edited_by_name = serializers.CharField(
#         source="last_edited_by.full_name", read_only=True
#     )

#     # Status display
#     status_display = serializers.CharField(source="get_status_display", read_only=True)

#     # Frontend compatibility fields
#     exam_marks = serializers.DecimalField(
#         source="exam_score", read_only=True, max_digits=5, decimal_places=2
#     )
#     mark_obtained = serializers.DecimalField(
#         source="total_score", read_only=True, max_digits=5, decimal_places=2
#     )
#     total_obtainable = serializers.SerializerMethodField()
#     position = serializers.SerializerMethodField()

#     class Meta:
#         model = JuniorSecondaryResult
#         fields = "__all__"

#     def get_total_obtainable(self, obj):
#         return 100  # Always 100 for Junior Secondary

#     def get_position(self, obj):
#         if obj.subject_position:
#             suffix = (
#                 "st"
#                 if obj.subject_position == 1
#                 else (
#                     "nd"
#                     if obj.subject_position == 2
#                     else "rd" if obj.subject_position == 3 else "th"
#                 )
#             )
#             return f"{obj.subject_position}{suffix}"
#         return ""


# class JuniorSecondaryResultCreateUpdateSerializer(serializers.ModelSerializer):
#     """Serializer for creating/updating Junior Secondary results"""

#     # Make foreign key fields optional for updates
#     student = serializers.PrimaryKeyRelatedField(
#         queryset=Student.objects.all(), required=False
#     )
#     subject = serializers.PrimaryKeyRelatedField(
#         queryset=Subject.objects.all(), required=False
#     )
#     exam_session = serializers.PrimaryKeyRelatedField(
#         queryset=ExamSession.objects.all(), required=False
#     )
#     grading_system = serializers.PrimaryKeyRelatedField(
#         queryset=GradingSystem.objects.all(), required=False
#     )

#     class Meta:
#         model = JuniorSecondaryResult
#         fields = [
#             "student",
#             "subject",
#             "exam_session",
#             "grading_system",
#             "continuous_assessment_score",
#             "take_home_test_score",
#             "practical_score",
#             "appearance_score",
#             "project_score",
#             "note_copying_score",
#             "exam_score",
#             "teacher_remark",
#             "class_teacher_remark",
#             "head_teacher_remark",
#             "status",
#         ]

#     def validate(self, data):
#         """Validate Junior Secondary result data"""
#         # Validate scores are within reasonable limits
#         if data.get("continuous_assessment_score", 0) > 15:
#             raise serializers.ValidationError(
#                 "Continuous Assessment score cannot exceed 15 marks"
#             )
#         if data.get("take_home_test_score", 0) > 5:
#             raise serializers.ValidationError(
#                 "Take Home Test score cannot exceed 5 marks"
#             )
#         if data.get("practical_score", 0) > 5:
#             raise serializers.ValidationError("Practical score cannot exceed 5 marks")
#         if data.get("appearance_score", 0) > 5:
#             raise serializers.ValidationError("Appearance score cannot exceed 5 marks")
#         if data.get("project_score", 0) > 5:
#             raise serializers.ValidationError("Project score cannot exceed 5 marks")
#         if data.get("note_copying_score", 0) > 5:
#             raise serializers.ValidationError(
#                 "Note Copying score cannot exceed 5 marks"
#             )
#         if data.get("exam_score", 0) > 60:
#             raise serializers.ValidationError("Exam score cannot exceed 60 marks")

#         return data

#     def create(self, validated_data):
#         """Set tracking fields when creating"""
#         request = self.context.get("request")
#         if request and request.user:
#             validated_data["entered_by"] = request.user
#         return super().create(validated_data)

#     def update(self, instance, validated_data):
#         """Set tracking fields when updating"""
#         request = self.context.get("request")
#         if request and request.user:
#             from django.utils import timezone

#             validated_data["last_edited_by"] = request.user
#             validated_data["last_edited_at"] = timezone.now()
#         return super().update(instance, validated_data)


# # ===== PRIMARY SERIALIZERS =====
# class PrimaryTermReportSerializer(serializers.ModelSerializer):
#     """Serializer for consolidated Primary term reports"""

#     student = StudentDetailSerializer(read_only=True)
#     exam_session = ExamSessionSerializer(read_only=True)
#     status_display = serializers.CharField(source="get_status_display", read_only=True)
#     published_by_name = serializers.CharField(
#         source="published_by.full_name", read_only=True
#     )
#     subject_results = serializers.SerializerMethodField()

#     class Meta:
#         model = PrimaryTermReport
#         fields = "__all__"

#     def get_subject_results(self, obj):
#         """Get all subject results linked to this term report"""
#         return PrimaryResultSerializer(obj.subject_results.all(), many=True).data

#     def validate_status(self, value):
#         """
#         Validate status transitions:
#         DRAFT -> SUBMITTED (by teacher)
#         SUBMITTED -> APPROVED (by admin)
#         APPROVED -> PUBLISHED (by admin)

#         Cannot go backwards or skip steps
#         """
#         instance = self.instance
#         if not instance:
#             # Creating new record, only allow DRAFT
#             if value not in ["DRAFT", "SUBMITTED"]:
#                 raise serializers.ValidationError(
#                     "New term reports must start as DRAFT or SUBMITTED"
#                 )
#             return value

#         current_status = instance.status

#         # Define valid transitions
#         valid_transitions = {
#             "DRAFT": ["SUBMITTED", "APPROVED"],  # Can skip to APPROVED for admin
#             "SUBMITTED": ["APPROVED", "DRAFT"],  # Can go back to DRAFT if needed
#             "APPROVED": [
#                 "PUBLISHED",
#                 "SUBMITTED",
#             ],  # Can go back to SUBMITTED if needed
#             "PUBLISHED": [],  # Cannot change once published
#         }

#         if current_status == value:
#             # Same status is always valid
#             return value

#         if value not in valid_transitions.get(current_status, []):
#             raise serializers.ValidationError(
#                 f"Cannot change status from {current_status} to {value}. "
#                 f"Valid transitions: {', '.join(valid_transitions.get(current_status, []))}"
#             )

#         return value


# class PrimaryResultSerializer(serializers.ModelSerializer):
#     """Serializer for Primary specific results"""

#     student = StudentDetailSerializer(read_only=True)
#     subject = SubjectSerializer(read_only=True)
#     exam_session = ExamSessionSerializer(read_only=True)
#     grading_system = GradingSystemSerializer(read_only=True)

#     # User information
#     entered_by_name = serializers.CharField(
#         source="entered_by.full_name", read_only=True
#     )
#     approved_by_name = serializers.CharField(
#         source="approved_by.full_name", read_only=True
#     )
#     published_by_name = serializers.CharField(
#         source="published_by.full_name", read_only=True
#     )
#     last_edited_by_name = serializers.CharField(
#         source="last_edited_by.full_name", read_only=True
#     )

#     # Status display
#     status_display = serializers.CharField(source="get_status_display", read_only=True)

#     # Frontend compatibility fields
#     exam_marks = serializers.DecimalField(
#         source="exam_score", read_only=True, max_digits=5, decimal_places=2
#     )
#     mark_obtained = serializers.DecimalField(
#         source="total_score", read_only=True, max_digits=5, decimal_places=2
#     )
#     total_obtainable = serializers.SerializerMethodField()
#     position = serializers.SerializerMethodField()

#     class Meta:
#         model = PrimaryResult
#         fields = "__all__"

#     def get_total_obtainable(self, obj):
#         return 100  # Always 100 for Primary

#     def get_position(self, obj):
#         if obj.subject_position:
#             suffix = (
#                 "st"
#                 if obj.subject_position == 1
#                 else (
#                     "nd"
#                     if obj.subject_position == 2
#                     else "rd" if obj.subject_position == 3 else "th"
#                 )
#             )
#             return f"{obj.subject_position}{suffix}"
#         return ""


# class PrimaryResultCreateUpdateSerializer(serializers.ModelSerializer):
#     """Serializer for creating/updating Primary results"""

#     # Make foreign key fields optional for updates
#     student = serializers.PrimaryKeyRelatedField(
#         queryset=Student.objects.all(), required=False
#     )
#     subject = serializers.PrimaryKeyRelatedField(
#         queryset=Subject.objects.all(), required=False
#     )
#     exam_session = serializers.PrimaryKeyRelatedField(
#         queryset=ExamSession.objects.all(), required=False
#     )
#     grading_system = serializers.PrimaryKeyRelatedField(
#         queryset=GradingSystem.objects.all(), required=False
#     )

#     class Meta:
#         model = PrimaryResult
#         fields = [
#             "student",
#             "subject",
#             "exam_session",
#             "grading_system",
#             "continuous_assessment_score",
#             "take_home_test_score",
#             "practical_score",
#             "appearance_score",
#             "project_score",
#             "note_copying_score",
#             "exam_score",
#             "teacher_remark",
#             "class_teacher_remark",
#             "head_teacher_remark",
#             "status",
#         ]

#     def validate(self, data):
#         """Validate Primary result data"""
#         # Validate scores are within reasonable limits (same as Junior Secondary)
#         if data.get("continuous_assessment_score", 0) > 15:
#             raise serializers.ValidationError(
#                 "Continuous Assessment score cannot exceed 15 marks"
#             )
#         if data.get("take_home_test_score", 0) > 5:
#             raise serializers.ValidationError(
#                 "Take Home Test score cannot exceed 5 marks"
#             )
#         if data.get("practical_score", 0) > 5:
#             raise serializers.ValidationError("Practical score cannot exceed 5 marks")
#         if data.get("appearance_score", 0) > 5:
#             raise serializers.ValidationError("Appearance score cannot exceed 5 marks")
#         if data.get("project_score", 0) > 5:
#             raise serializers.ValidationError("Project score cannot exceed 5 marks")
#         if data.get("note_copying_score", 0) > 5:
#             raise serializers.ValidationError(
#                 "Note Copying score cannot exceed 5 marks"
#             )
#         if data.get("exam_score", 0) > 60:
#             raise serializers.ValidationError("Exam score cannot exceed 60 marks")

#         return data

#     def create(self, validated_data):
#         """Set tracking fields when creating"""
#         request = self.context.get("request")
#         if request and request.user:
#             validated_data["entered_by"] = request.user
#         return super().create(validated_data)

#     def update(self, instance, validated_data):
#         """Set tracking fields when updating"""
#         request = self.context.get("request")
#         if request and request.user:
#             from django.utils import timezone

#             validated_data["last_edited_by"] = request.user
#             validated_data["last_edited_at"] = timezone.now()
#         return super().update(instance, validated_data)


# # ===== NURSERY SERIALIZERS =====
# class NurseryTermReportSerializer(serializers.ModelSerializer):
#     """Serializer for consolidated Nursery term reports"""

#     student = StudentDetailSerializer(read_only=True)
#     exam_session = ExamSessionSerializer(read_only=True)
#     status_display = serializers.CharField(source="get_status_display", read_only=True)
#     published_by_name = serializers.CharField(
#         source="published_by.full_name", read_only=True
#     )
#     subject_results = serializers.SerializerMethodField()

#     # Physical development display fields
#     physical_development_display = serializers.CharField(
#         source="get_physical_development_display", read_only=True
#     )
#     health_display = serializers.CharField(source="get_health_display", read_only=True)
#     cleanliness_display = serializers.CharField(
#         source="get_cleanliness_display", read_only=True
#     )
#     general_conduct_display = serializers.CharField(
#         source="get_general_conduct_display", read_only=True
#     )

#     class Meta:
#         model = NurseryTermReport
#         fields = "__all__"

#     def get_subject_results(self, obj):
#         """Get all subject results linked to this term report"""
#         return NurseryResultSerializer(obj.subject_results.all(), many=True).data

#     def validate_status(self, value):
#         """
#         Validate status transitions:
#         DRAFT -> SUBMITTED (by teacher)
#         SUBMITTED -> APPROVED (by admin)
#         APPROVED -> PUBLISHED (by admin)

#         Cannot go backwards or skip steps
#         """
#         instance = self.instance
#         if not instance:
#             # Creating new record, only allow DRAFT
#             if value not in ["DRAFT", "SUBMITTED"]:
#                 raise serializers.ValidationError(
#                     "New term reports must start as DRAFT or SUBMITTED"
#                 )
#             return value

#         current_status = instance.status

#         # Define valid transitions
#         valid_transitions = {
#             "DRAFT": ["SUBMITTED", "APPROVED"],  # Can skip to APPROVED for admin
#             "SUBMITTED": ["APPROVED", "DRAFT"],  # Can go back to DRAFT if needed
#             "APPROVED": [
#                 "PUBLISHED",
#                 "SUBMITTED",
#             ],  # Can go back to SUBMITTED if needed
#             "PUBLISHED": [],  # Cannot change once published
#         }

#         if current_status == value:
#             # Same status is always valid
#             return value

#         if value not in valid_transitions.get(current_status, []):
#             raise serializers.ValidationError(
#                 f"Cannot change status from {current_status} to {value}. "
#                 f"Valid transitions: {', '.join(valid_transitions.get(current_status, []))}"
#             )

#         return value


# class NurseryResultSerializer(serializers.ModelSerializer):
#     """Serializer for Nursery specific results"""

#     student = StudentDetailSerializer(read_only=True)
#     subject = SubjectSerializer(read_only=True)
#     exam_session = ExamSessionSerializer(read_only=True)
#     grading_system = GradingSystemSerializer(read_only=True)

#     # User information
#     entered_by_name = serializers.CharField(
#         source="entered_by.full_name", read_only=True
#     )
#     approved_by_name = serializers.CharField(
#         source="approved_by.full_name", read_only=True
#     )
#     published_by_name = serializers.CharField(
#         source="published_by.full_name", read_only=True
#     )
#     last_edited_by_name = serializers.CharField(
#         source="last_edited_by.full_name", read_only=True
#     )

#     # Status display
#     status_display = serializers.CharField(source="get_status_display", read_only=True)

#     # ADD THESE: Physical development fields from term report
#     physical_development = serializers.SerializerMethodField()
#     health = serializers.SerializerMethodField()
#     cleanliness = serializers.SerializerMethodField()
#     general_conduct = serializers.SerializerMethodField()
#     height_beginning = serializers.SerializerMethodField()
#     height_end = serializers.SerializerMethodField()
#     weight_beginning = serializers.SerializerMethodField()
#     weight_end = serializers.SerializerMethodField()

#     class Meta:
#         model = NurseryResult
#         fields = "__all__"

#     # ADD THESE METHODS
#     def get_physical_development(self, obj):
#         return obj.term_report.physical_development if obj.term_report else None

#     def get_health(self, obj):
#         return obj.term_report.health if obj.term_report else None

#     def get_cleanliness(self, obj):
#         return obj.term_report.cleanliness if obj.term_report else None

#     def get_general_conduct(self, obj):
#         return obj.term_report.general_conduct if obj.term_report else None

#     def get_height_beginning(self, obj):
#         return obj.term_report.height_beginning if obj.term_report else None

#     def get_height_end(self, obj):
#         return obj.term_report.height_end if obj.term_report else None

#     def get_weight_beginning(self, obj):
#         return obj.term_report.weight_beginning if obj.term_report else None

#     def get_weight_end(self, obj):
#         return obj.term_report.weight_end if obj.term_report else None


# class NurseryResultCreateUpdateSerializer(serializers.ModelSerializer):
#     """Serializer for creating/updating Nursery results"""

#     # Make foreign key fields optional for updates
#     student = serializers.PrimaryKeyRelatedField(
#         queryset=Student.objects.all(), required=False
#     )
#     subject = serializers.PrimaryKeyRelatedField(
#         queryset=Subject.objects.all(), required=False
#     )
#     exam_session = serializers.PrimaryKeyRelatedField(
#         queryset=ExamSession.objects.all(), required=False
#     )
#     grading_system = serializers.PrimaryKeyRelatedField(
#         queryset=GradingSystem.objects.all(), required=False
#     )

#     class Meta:
#         model = NurseryResult
#         fields = [
#             "student",
#             "subject",
#             "exam_session",
#             "grading_system",
#             "max_marks_obtainable",
#             "mark_obtained",
#             "academic_comment",
#             "status",
#         ]

#     def validate(self, data):
#         """Validate Nursery result data"""
#         max_marks = data.get("max_marks_obtainable", 0)
#         mark_obtained = data.get("mark_obtained", 0)

#         if mark_obtained > max_marks:
#             raise serializers.ValidationError(
#                 "Mark obtained cannot exceed max marks obtainable"
#             )

#         return data

#     def create(self, validated_data):
#         """Set tracking fields when creating"""
#         request = self.context.get("request")
#         if request and request.user:
#             validated_data["entered_by"] = request.user
#         return super().create(validated_data)

#     def update(self, instance, validated_data):
#         """Set tracking fields when updating"""
#         request = self.context.get("request")
#         if request and request.user:
#             from django.utils import timezone

#             validated_data["last_edited_by"] = request.user
#             validated_data["last_edited_at"] = timezone.now()
#         return super().update(instance, validated_data)


# # ===== CONSOLIDATED REPORT SERIALIZERS =====
# class ConsolidatedTermReportSerializer(serializers.Serializer):
#     """Unified serializer for all education level term reports"""

#     def to_representation(self, instance):
#         """Return appropriate serializer based on education level"""
#         education_level = getattr(instance.student, "education_level", None)

#         if education_level == "SENIOR_SECONDARY":
#             return SeniorSecondaryTermReportSerializer(
#                 instance, context=self.context
#             ).data
#         elif education_level == "JUNIOR_SECONDARY":
#             return JuniorSecondaryTermReportSerializer(
#                 instance, context=self.context
#             ).data
#         elif education_level == "PRIMARY":
#             return PrimaryTermReportSerializer(instance, context=self.context).data
#         elif education_level == "NURSERY":
#             return NurseryTermReportSerializer(instance, context=self.context).data
#         else:
#             # Fallback to basic structure
#             return {
#                 "id": str(instance.id),
#                 "student": StudentDetailSerializer(instance.student).data,
#                 "exam_session": ExamSessionSerializer(instance.exam_session).data,
#                 "education_level": education_level,
#                 "status": getattr(instance, "status", "DRAFT"),
#             }


# class ConsolidatedResultSerializer(serializers.Serializer):
#     """Unified serializer for all education level results"""

#     def to_representation(self, instance):
#         """Return appropriate serializer based on education level"""
#         education_level = getattr(instance.student, "education_level", None)

#         if education_level == "SENIOR_SECONDARY":
#             return SeniorSecondaryResultSerializer(instance, context=self.context).data
#         elif education_level == "JUNIOR_SECONDARY":
#             return JuniorSecondaryResultSerializer(instance, context=self.context).data
#         elif education_level == "PRIMARY":
#             return PrimaryResultSerializer(instance, context=self.context).data
#         elif education_level == "NURSERY":
#             return NurseryResultSerializer(instance, context=self.context).data
#         else:
#             # Fallback to base StudentResult
#             return StudentResultSerializer(
#                 instance, context=self.context
#             ).dataSerializerMethodField()

#     comments = ResultCommentSerializer(many=True, read_only=True)
#     term_display = serializers.CharField(source="get_term_display", read_only=True)
#     status_display = serializers.CharField(source="get_status_display", read_only=True)

#     class Meta:
#         model = StudentTermResult
#         fields = [
#             "id",
#             "student",
#             "academic_session",
#             "term",
#             "term_display",
#             "total_subjects",
#             "subjects_passed",
#             "subjects_failed",
#             "total_score",
#             "average_score",
#             "gpa",
#             "class_position",
#             "total_students",
#             "status",
#             "status_display",
#             "remarks",
#             "next_term_begins",
#             "subject_results",
#             "comments",
#             "created_at",
#         ]

#     def get_subject_results(self, obj):
#         # Always return a combined list from base results and education-level specific results
#         combined = []

#         # Get education level to determine which results to fetch
#         education_level = getattr(obj.student, "education_level", None)

#         if education_level == "SENIOR_SECONDARY":
#             # Senior Secondary specific results
#             try:
#                 senior_results = SeniorSecondaryResult.objects.filter(
#                     student=obj.student,
#                     exam_session__term=obj.term,
#                     exam_session__academic_session=obj.academic_session,
#                 ).select_related("subject", "grading_system", "exam_session", "stream")

#                 for r in senior_results:
#                     combined.append(
#                         {
#                             "id": str(r.id),
#                             "subject": SubjectSerializer(r.subject).data,
#                             "exam_session": ExamSessionSerializer(r.exam_session).data,
#                             "stream": (
#                                 {
#                                     "id": r.stream.id,
#                                     "name": r.stream.name,
#                                     "stream_type": getattr(r.stream, "stream_type", ""),
#                                 }
#                                 if r.stream
#                                 else None
#                             ),
#                             "stream_name": r.stream.name if r.stream else None,
#                             "stream_type": (
#                                 getattr(r.stream, "stream_type", None)
#                                 if r.stream
#                                 else None
#                             ),
#                             "ca_score": r.total_ca_score,
#                             "exam_score": r.exam_score,
#                             "total_score": r.total_score,
#                             "percentage": r.percentage,
#                             "grade": r.grade,
#                             "grade_point": r.grade_point,
#                             "is_passed": r.is_passed,
#                             "position": r.subject_position,
#                             "remarks": r.teacher_remark,
#                             "status": r.status,
#                             "assessment_scores": [],
#                             "created_at": (
#                                 r.created_at.isoformat()
#                                 if hasattr(r, "created_at")
#                                 else ""
#                             ),
#                         }
#                     )
#             except Exception:
#                 pass

#         elif education_level == "JUNIOR_SECONDARY":
#             # Junior Secondary specific results
#             try:
#                 junior_results = JuniorSecondaryResult.objects.filter(
#                     student=obj.student,
#                     exam_session__term=obj.term,
#                     exam_session__academic_session=obj.academic_session,
#                 ).select_related("subject", "grading_system", "exam_session")

#                 for r in junior_results:
#                     combined.append(
#                         {
#                             "id": str(r.id),
#                             "subject": SubjectSerializer(r.subject).data,
#                             "exam_session": ExamSessionSerializer(r.exam_session).data,
#                             "ca_score": r.ca_total,
#                             "exam_score": r.exam_score,
#                             "total_score": r.total_score,
#                             "percentage": r.total_percentage,
#                             "grade": r.grade,
#                             "grade_point": r.grade_point,
#                             "is_passed": r.is_passed,
#                             "position": r.subject_position,
#                             "remarks": r.teacher_remark,
#                             "status": r.status,
#                             "assessment_scores": [],
#                             "created_at": (
#                                 r.created_at.isoformat()
#                                 if hasattr(r, "created_at")
#                                 else ""
#                             ),
#                         }
#                     )
#             except Exception:
#                 pass

#         elif education_level == "PRIMARY":
#             # Primary specific results
#             try:
#                 primary_results = PrimaryResult.objects.filter(
#                     student=obj.student,
#                     exam_session__term=obj.term,
#                     exam_session__academic_session=obj.academic_session,
#                 ).select_related("subject", "grading_system", "exam_session")

#                 for r in primary_results:
#                     combined.append(
#                         {
#                             "id": str(r.id),
#                             "subject": SubjectSerializer(r.subject).data,
#                             "exam_session": ExamSessionSerializer(r.exam_session).data,
#                             "ca_score": r.ca_total,
#                             "exam_score": r.exam_score,
#                             "total_score": r.total_score,
#                             "percentage": r.total_percentage,
#                             "grade": r.grade,
#                             "grade_point": r.grade_point,
#                             "is_passed": r.is_passed,
#                             "position": r.subject_position,
#                             "remarks": r.teacher_remark,
#                             "status": r.status,
#                             "assessment_scores": [],
#                             "created_at": (
#                                 r.created_at.isoformat()
#                                 if hasattr(r, "created_at")
#                                 else ""
#                             ),
#                         }
#                     )
#             except Exception:
#                 pass

#         elif education_level == "NURSERY":
#             # Nursery specific results
#             try:
#                 nursery_results = NurseryResult.objects.filter(
#                     student=obj.student,
#                     exam_session__term=obj.term,
#                     exam_session__academic_session=obj.academic_session,
#                 ).select_related("subject", "grading_system", "exam_session")

#                 for r in nursery_results:
#                     combined.append(
#                         {
#                             "id": str(r.id),
#                             "subject": SubjectSerializer(r.subject).data,
#                             "exam_session": ExamSessionSerializer(r.exam_session).data,
#                             "mark_obtained": r.mark_obtained,
#                             "max_marks_obtainable": r.max_marks_obtainable,
#                             "percentage": r.percentage,
#                             "grade": r.grade,
#                             "grade_point": r.grade_point,
#                             "is_passed": r.is_passed,
#                             "position": r.subject_position,
#                             "remarks": r.academic_comment,
#                             "status": r.status,
#                             "assessment_scores": [],
#                             "created_at": (
#                                 r.created_at.isoformat()
#                                 if hasattr(r, "created_at")
#                                 else ""
#                             ),
#                         }
#                     )
#             except Exception:
#                 pass

#         # Fallback to base StudentResult if no specific results found
#         if not combined:
#             base_results = StudentResult.objects.filter(
#                 student=obj.student,
#                 exam_session__term=obj.term,
#                 exam_session__academic_session=obj.academic_session,
#             ).select_related("subject", "grading_system", "exam_session")
#             combined.extend(StudentResultSerializer(base_results, many=True).data)

#         return combined


# class StudentTermResultDetailSerializer(serializers.ModelSerializer):
#     """Detailed serializer for StudentTermResult with full subject breakdown"""

#     student = StudentDetailSerializer(read_only=True)
#     academic_session = AcademicSessionSerializer(read_only=True)
#     subject_results = serializers.SerializerMethodField()
#     comments = ResultCommentSerializer(many=True, read_only=True)
#     term_display = serializers.CharField(source="get_term_display", read_only=True)
#     status_display = serializers.CharField(source="get_status_display", read_only=True)

#     class Meta:
#         model = StudentTermResult
#         fields = "__all__"

#     def get_subject_results(self, obj):
#         # Get all results for this student in this term across education levels
#         education_level = getattr(obj.student, "education_level", None)

#         if education_level == "SENIOR_SECONDARY":
#             senior_results = SeniorSecondaryResult.objects.filter(
#                 student=obj.student,
#                 exam_session__term=obj.term,
#                 exam_session__academic_session=obj.academic_session,
#             ).select_related("subject", "grading_system", "exam_session", "stream")

#             # Map Senior Secondary fields to a shape compatible with frontend SubjectResult
#             mapped = []
#             for r in senior_results:
#                 mapped.append(
#                     {
#                         "id": str(r.id),
#                         "subject": SubjectSerializer(r.subject).data,
#                         "exam_session": ExamSessionSerializer(r.exam_session).data,
#                         "stream": (
#                             {
#                                 "id": r.stream.id,
#                                 "name": r.stream.name,
#                                 "stream_type": getattr(r.stream, "stream_type", ""),
#                             }
#                             if r.stream
#                             else None
#                         ),
#                         "stream_name": r.stream.name if r.stream else None,
#                         "stream_type": (
#                             getattr(r.stream, "stream_type", None) if r.stream else None
#                         ),
#                         "ca_score": r.total_ca_score,  # total of tests
#                         "exam_score": r.exam_score,
#                         "total_score": r.total_score,
#                         "percentage": r.percentage,
#                         "grade": r.grade,
#                         "grade_point": r.grade_point,
#                         "is_passed": r.is_passed,
#                         "position": r.subject_position,
#                         "remarks": r.teacher_remark,
#                         "status": r.status,
#                         "assessment_scores": [],
#                         "created_at": (
#                             r.created_at.isoformat() if hasattr(r, "created_at") else ""
#                         ),
#                     }
#                 )
#             return mapped

#         elif education_level == "JUNIOR_SECONDARY":
#             return JuniorSecondaryResultSerializer(
#                 JuniorSecondaryResult.objects.filter(
#                     student=obj.student,
#                     exam_session__term=obj.term,
#                     exam_session__academic_session=obj.academic_session,
#                 ).select_related("subject", "grading_system", "exam_session"),
#                 many=True,
#             ).data

#         elif education_level == "PRIMARY":
#             return PrimaryResultSerializer(
#                 PrimaryResult.objects.filter(
#                     student=obj.student,
#                     exam_session__term=obj.term,
#                     exam_session__academic_session=obj.academic_session,
#                 ).select_related("subject", "grading_system", "exam_session"),
#                 many=True,
#             ).data

#         elif education_level == "NURSERY":
#             return NurseryResultSerializer(
#                 NurseryResult.objects.filter(
#                     student=obj.student,
#                     exam_session__term=obj.term,
#                     exam_session__academic_session=obj.academic_session,
#                 ).select_related("subject", "grading_system", "exam_session"),
#                 many=True,
#             ).data

#         else:
#             # Fallback to base StudentResult
#             results = StudentResult.objects.filter(
#                 student=obj.student,
#                 exam_session__term=obj.term,
#                 exam_session__academic_session=obj.academic_session,
#             ).select_related("subject", "grading_system", "exam_session")
#             return StudentResultSerializer(results, many=True).data


# class DetailedStudentResultSerializer(serializers.ModelSerializer):
#     """Detailed serializer for StudentResult with full assessment breakdown"""

#     student = StudentDetailSerializer(read_only=True)
#     subject = SubjectSerializer(read_only=True)
#     exam_session = ExamSessionSerializer(read_only=True)
#     grading_system = GradingSystemSerializer(read_only=True)
#     assessment_scores = AssessmentScoreSerializer(many=True, read_only=True)
#     comments = ResultCommentSerializer(many=True, read_only=True)
#     status_display = serializers.CharField(source="get_status_display", read_only=True)
#     entered_by_name = serializers.CharField(
#         source="entered_by.full_name", read_only=True
#     )
#     approved_by_name = serializers.CharField(
#         source="approved_by.full_name", read_only=True
#     )

#     class Meta:
#         model = StudentResult
#         fields = "__all__"


# class ResultSheetSerializer(serializers.ModelSerializer):
#     exam_session = ExamSessionSerializer(read_only=True)
#     student_class_display = serializers.CharField(
#         source="get_student_class_display", read_only=True
#     )
#     education_level_display = serializers.CharField(
#         source="get_education_level_display", read_only=True
#     )
#     status_display = serializers.CharField(source="get_status_display", read_only=True)
#     prepared_by_name = serializers.CharField(
#         source="prepared_by.full_name", read_only=True
#     )
#     approved_by_name = serializers.CharField(
#         source="approved_by.full_name", read_only=True
#     )

#     class Meta:
#         model = ResultSheet
#         fields = "__all__"


# # ===== SENIOR SECONDARY SERIALIZERS =====
# class SeniorSecondaryTermReportSerializer(serializers.ModelSerializer):
#     """Serializer for consolidated Senior Secondary term reports"""

#     student = StudentDetailSerializer(read_only=True)
#     exam_session = ExamSessionSerializer(read_only=True)
#     stream_name = serializers.CharField(source="stream.name", read_only=True)
#     status_display = serializers.CharField(source="get_status_display", read_only=True)
#     published_by_name = serializers.CharField(
#         source="published_by.full_name", read_only=True
#     )
#     subject_results = serializers.SerializerMethodField()

#     class Meta:
#         model = SeniorSecondaryTermReport
#         fields = "__all__"

#     def get_subject_results(self, obj):
#         """Get all subject results linked to this term report"""
#         return SeniorSecondaryResultSerializer(
#             obj.subject_results.all(), many=True
#         ).data

#     def validate_status(self, value):
#         """
#         Validate status transitions:
#         DRAFT -> SUBMITTED (by teacher)
#         SUBMITTED -> APPROVED (by admin)
#         APPROVED -> PUBLISHED (by admin)

#         Cannot go backwards or skip steps
#         """
#         instance = self.instance
#         if not instance:
#             # Creating new record, only allow DRAFT
#             if value not in ["DRAFT", "SUBMITTED"]:
#                 raise serializers.ValidationError(
#                     "New term reports must start as DRAFT or SUBMITTED"
#                 )
#             return value

#         current_status = instance.status

#         # Define valid transitions
#         valid_transitions = {
#             "DRAFT": ["SUBMITTED", "APPROVED"],  # Can skip to APPROVED for admin
#             "SUBMITTED": ["APPROVED", "DRAFT"],  # Can go back to DRAFT if needed
#             "APPROVED": [
#                 "PUBLISHED",
#                 "SUBMITTED",
#             ],  # Can go back to SUBMITTED if needed
#             "PUBLISHED": [],  # Cannot change once published
#         }

#         if current_status == value:
#             # Same status is always valid
#             return value

#         if value not in valid_transitions.get(current_status, []):
#             raise serializers.ValidationError(
#                 f"Cannot change status from {current_status} to {value}. "
#                 f"Valid transitions: {', '.join(valid_transitions.get(current_status, []))}"
#             )

#         return value

from rest_framework import serializers
from decimal import Decimal
from django.utils import timezone
from students.models import Student
from subject.models import Subject
from academics.models import AcademicSession
from students.serializers import StudentDetailSerializer
from subject.serializers import SubjectSerializer
from academics.serializers import AcademicSessionSerializer
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
    ResultTemplate,
)


# ===== BASE SERIALIZERS =====


class StudentMinimalSerializer(serializers.ModelSerializer):
    """Minimal student serializer to avoid circular imports"""

    admission_number = serializers.CharField(
        source="registration_number", read_only=True
    )
    full_name = serializers.CharField(read_only=True)
    student_class_display = serializers.CharField(
        source="get_student_class_display", read_only=True
    )
    education_level_display = serializers.CharField(
        source="get_education_level_display", read_only=True
    )

    class Meta:
        model = Student
        fields = [
            "id",
            "admission_number",
            "full_name",
            "student_class",
            "student_class_display",
            "education_level",
            "education_level_display",
        ]


class SubjectMinimalSerializer(serializers.ModelSerializer):
    """Minimal subject serializer"""

    class Meta:
        model = Subject
        fields = ["id", "name", "code", "subject_type"]


class AcademicSessionMinimalSerializer(serializers.ModelSerializer):
    """Minimal academic session serializer"""

    class Meta:
        model = AcademicSession
        fields = ["id", "name", "start_date", "end_date", "is_active"]


# ===== GRADING SYSTEM SERIALIZERS =====


class GradeSerializer(serializers.ModelSerializer):
    grading_system_name = serializers.CharField(
        source="grading_system.name", read_only=True
    )

    class Meta:
        model = Grade
        fields = "__all__"
        read_only_fields = ["id"]


class GradeCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Grade
        fields = [
            "grading_system",
            "grade",
            "min_score",
            "max_score",
            "grade_point",
            "description",
            "is_passing",
        ]

    def validate(self, data):
        if data.get("min_score", 0) >= data.get("max_score", 0):
            raise serializers.ValidationError(
                "Minimum score must be less than maximum score"
            )
        return data


class GradingSystemSerializer(serializers.ModelSerializer):
    grades = GradeSerializer(many=True, read_only=True)
    grading_type_display = serializers.CharField(
        source="get_grading_type_display", read_only=True
    )

    class Meta:
        model = GradingSystem
        fields = "__all__"
        read_only_fields = ["id", "created_at", "updated_at"]


class GradingSystemCreateUpdateSerializer(serializers.ModelSerializer):
    grades = GradeCreateUpdateSerializer(many=True, required=False)

    class Meta:
        model = GradingSystem
        fields = [
            "name",
            "grading_type",
            "description",
            "min_score",
            "max_score",
            "pass_mark",
            "is_active",
            "grades",
        ]

    def validate(self, data):
        if data.get("min_score", 0) >= data.get("max_score", 0):
            raise serializers.ValidationError(
                "Minimum score must be less than maximum score"
            )
        if data.get("pass_mark", 0) < data.get("min_score", 0):
            raise serializers.ValidationError(
                "Pass mark cannot be less than minimum score"
            )
        if data.get("pass_mark", 0) > data.get("max_score", 0):
            raise serializers.ValidationError("Pass mark cannot exceed maximum score")
        return data

    def create(self, validated_data):
        grades_data = validated_data.pop("grades", [])
        grading_system = GradingSystem.objects.create(**validated_data)
        for grade_data in grades_data:
            Grade.objects.create(grading_system=grading_system, **grade_data)
        return grading_system

    def update(self, instance, validated_data):
        grades_data = validated_data.pop("grades", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if grades_data is not None:
            instance.grades.all().delete()
            for grade_data in grades_data:
                Grade.objects.create(grading_system=instance, **grade_data)
        return instance


# ===== SCORING CONFIGURATION SERIALIZERS =====


class ScoringConfigurationSerializer(serializers.ModelSerializer):
    education_level_display = serializers.CharField(
        source="get_education_level_display", read_only=True
    )
    result_type_display = serializers.CharField(
        source="get_result_type_display", read_only=True
    )
    total_ca_max_score = serializers.DecimalField(
        source="ca_total_max_score", read_only=True, max_digits=5, decimal_places=2
    )
    created_by_name = serializers.CharField(
        source="created_by.get_full_name", read_only=True, allow_null=True
    )

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
        fields = "__all__"
        read_only_fields = ["id", "created_at", "updated_at", "created_by"]


class ScoringConfigurationCreateUpdateSerializer(serializers.ModelSerializer):
    first_test_max_score = serializers.DecimalField(
        source="test1_max_score",
        max_digits=5,
        decimal_places=2,
        required=False,
        allow_null=True,
    )
    second_test_max_score = serializers.DecimalField(
        source="test2_max_score",
        max_digits=5,
        decimal_places=2,
        required=False,
        allow_null=True,
    )
    third_test_max_score = serializers.DecimalField(
        source="test3_max_score",
        max_digits=5,
        decimal_places=2,
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
        result_type = data.get("result_type", "TERMLY")
        education_level = data.get("education_level")

        if education_level in ["JUNIOR_SECONDARY", "PRIMARY"]:
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
                        {field: [f"This field is required for {education_level}"]}
                    )

        elif education_level == "SENIOR_SECONDARY":
            for field in ["test1_max_score", "test2_max_score", "test3_max_score"]:
                if field not in data or data[field] is None:
                    raise serializers.ValidationError(
                        {field: ["This field is required for Senior Secondary"]}
                    )

        elif education_level == "NURSERY":
            if "total_max_score" not in data or data["total_max_score"] is None:
                raise serializers.ValidationError(
                    {"total_max_score": ["Required for Nursery"]}
                )

        if result_type == "TERMLY" and education_level != "NURSERY":
            ca_weight = data.get("ca_weight_percentage", 0)
            exam_weight = data.get("exam_weight_percentage", 0)
            if ca_weight + exam_weight != 100:
                raise serializers.ValidationError("CA and exam weights must sum to 100")

        return data

    def create(self, validated_data):
        request = self.context.get("request")
        if request and request.user:
            validated_data["created_by"] = request.user
        return super().create(validated_data)


# ===== ASSESSMENT TYPE SERIALIZERS =====


class AssessmentTypeSerializer(serializers.ModelSerializer):
    education_level_display = serializers.CharField(
        source="get_education_level_display", read_only=True
    )

    class Meta:
        model = AssessmentType
        fields = "__all__"
        read_only_fields = ["id", "created_at"]


class AssessmentTypeCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssessmentType
        fields = [
            "name",
            "code",
            "description",
            "education_level",
            "max_score",
            "weight_percentage",
            "is_active",
        ]

    def validate(self, data):
        if data.get("weight_percentage", 0) > 100:
            raise serializers.ValidationError("Weight percentage cannot exceed 100")
        return data


# ===== EXAM SESSION SERIALIZERS =====


class ExamSessionSerializer(serializers.ModelSerializer):
    exam_type_display = serializers.CharField(
        source="get_exam_type_display", read_only=True
    )
    term_display = serializers.CharField(source="get_term_display", read_only=True)
    academic_session = AcademicSessionMinimalSerializer(read_only=True)
    academic_session_name = serializers.CharField(
        source="academic_session.name", read_only=True
    )

    class Meta:
        model = ExamSession
        fields = "__all__"
        read_only_fields = ["id", "created_at", "updated_at"]


class ExamSessionCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExamSession
        fields = [
            "name",
            "exam_type",
            "academic_session",
            "term",
            "start_date",
            "end_date",
            "result_release_date",
            "is_published",
            "is_active",
        ]

    def validate(self, data):
        if data.get("start_date") and data.get("end_date"):
            if data["start_date"] >= data["end_date"]:
                raise serializers.ValidationError("Start date must be before end date")
        return data


# ===== ASSESSMENT SCORE SERIALIZERS =====


class AssessmentScoreSerializer(serializers.ModelSerializer):
    assessment_type = AssessmentTypeSerializer(read_only=True)
    assessment_type_name = serializers.CharField(
        source="assessment_type.name", read_only=True
    )

    class Meta:
        model = AssessmentScore
        fields = "__all__"
        read_only_fields = ["id", "percentage"]


# ===== RESULT COMMENT SERIALIZERS =====


class ResultCommentSerializer(serializers.ModelSerializer):
    comment_type_display = serializers.CharField(
        source="get_comment_type_display", read_only=True
    )
    commented_by_name = serializers.CharField(
        source="commented_by.get_full_name", read_only=True, allow_null=True
    )

    class Meta:
        model = ResultComment
        fields = "__all__"
        read_only_fields = ["id", "commented_by", "created_at"]


class ResultCommentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResultComment
        fields = ["student_result", "term_result", "comment_type", "comment"]

    def create(self, validated_data):
        request = self.context.get("request")
        if request and request.user:
            validated_data["commented_by"] = request.user
        return super().create(validated_data)


# ===== SENIOR SECONDARY SERIALIZERS =====


class SeniorSecondaryResultSerializer(serializers.ModelSerializer):
    student = StudentMinimalSerializer(read_only=True)
    subject = SubjectMinimalSerializer(read_only=True)
    exam_session = ExamSessionSerializer(read_only=True)
    grading_system = GradingSystemSerializer(read_only=True)

    student_name = serializers.CharField(source="student.full_name", read_only=True)
    subject_name = serializers.CharField(source="subject.name", read_only=True)
    stream_name = serializers.CharField(
        source="stream.name", read_only=True, allow_null=True
    )
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    entered_by_name = serializers.CharField(
        source="entered_by.get_full_name", read_only=True, allow_null=True
    )
    approved_by_name = serializers.CharField(
        source="approved_by.get_full_name", read_only=True, allow_null=True
    )

    test1_score = serializers.DecimalField(
        source="first_test_score", read_only=True, max_digits=5, decimal_places=2
    )
    test2_score = serializers.DecimalField(
        source="second_test_score", read_only=True, max_digits=5, decimal_places=2
    )
    test3_score = serializers.DecimalField(
        source="third_test_score", read_only=True, max_digits=5, decimal_places=2
    )
    position = serializers.SerializerMethodField()
    total_obtainable = serializers.SerializerMethodField()

    class Meta:
        model = SeniorSecondaryResult
        fields = "__all__"
        read_only_fields = [
            "id",
            "total_ca_score",
            "total_score",
            "percentage",
            "grade",
            "grade_point",
            "is_passed",
            "created_at",
            "updated_at",
        ]

    def get_position(self, obj):
        if obj.subject_position:
            suffix = {1: "st", 2: "nd", 3: "rd"}.get(obj.subject_position, "th")
            return f"{obj.subject_position}{suffix}"
        return ""

    def get_total_obtainable(self, obj):
        return 100


class SeniorSecondaryResultCreateUpdateSerializer(serializers.ModelSerializer):
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
        request = self.context.get("request")
        if request and request.user:
            validated_data["entered_by"] = request.user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        request = self.context.get("request")
        if request and request.user:
            validated_data["last_edited_by"] = request.user
            validated_data["last_edited_at"] = timezone.now()
        return super().update(instance, validated_data)


class SeniorSecondaryTermReportSerializer(serializers.ModelSerializer):
    student = StudentMinimalSerializer(read_only=True)
    exam_session = ExamSessionSerializer(read_only=True)
    stream_name = serializers.CharField(
        source="stream.name", read_only=True, allow_null=True
    )
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    subject_results = SeniorSecondaryResultSerializer(many=True, read_only=True)

    class Meta:
        model = SeniorSecondaryTermReport
        fields = "__all__"
        read_only_fields = [
            "id",
            "total_score",
            "average_score",
            "overall_grade",
            "class_position",
            "total_students",
            "created_at",
            "updated_at",
        ]


class SeniorSecondarySessionResultSerializer(serializers.ModelSerializer):
    student = StudentMinimalSerializer(read_only=True)
    subject = SubjectMinimalSerializer(read_only=True)
    academic_session = AcademicSessionMinimalSerializer(read_only=True)
    stream_name = serializers.CharField(
        source="stream.name", read_only=True, allow_null=True
    )
    status_display = serializers.CharField(source="get_status_display", read_only=True)

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
        read_only_fields = [
            "id",
            "average_for_year",
            "obtained",
            "created_at",
            "updated_at",
        ]

    def get_position(self, obj):
        if obj.subject_position:
            suffix = {1: "st", 2: "nd", 3: "rd"}.get(obj.subject_position, "th")
            return f"{obj.subject_position}{suffix}"
        return ""


class SeniorSecondarySessionReportSerializer(serializers.ModelSerializer):
    student = StudentMinimalSerializer(read_only=True)
    academic_session = AcademicSessionMinimalSerializer(read_only=True)
    stream_name = serializers.CharField(
        source="stream.name", read_only=True, allow_null=True
    )
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    subject_results = SeniorSecondarySessionResultSerializer(many=True, read_only=True)

    class Meta:
        model = SeniorSecondarySessionReport
        fields = "__all__"
        read_only_fields = [
            "id",
            "term1_total",
            "term2_total",
            "term3_total",
            "taa_score",
            "average_for_year",
            "obtainable",
            "obtained",
            "overall_grade",
            "class_position",
            "total_students",
            "created_at",
            "updated_at",
        ]


# ===== JUNIOR SECONDARY SERIALIZERS =====


class JuniorSecondaryResultSerializer(serializers.ModelSerializer):
    student = StudentMinimalSerializer(read_only=True)
    subject = SubjectMinimalSerializer(read_only=True)
    exam_session = ExamSessionSerializer(read_only=True)
    grading_system = GradingSystemSerializer(read_only=True)

    status_display = serializers.CharField(source="get_status_display", read_only=True)
    entered_by_name = serializers.CharField(
        source="entered_by.get_full_name", read_only=True, allow_null=True
    )

    exam_marks = serializers.DecimalField(
        source="exam_score", read_only=True, max_digits=5, decimal_places=2
    )
    mark_obtained = serializers.DecimalField(
        source="total_score", read_only=True, max_digits=5, decimal_places=2
    )
    position = serializers.SerializerMethodField()
    total_obtainable = serializers.SerializerMethodField()

    class Meta:
        model = JuniorSecondaryResult
        fields = "__all__"
        read_only_fields = [
            "id",
            "ca_total",
            "total_score",
            "ca_percentage",
            "exam_percentage",
            "total_percentage",
            "grade",
            "grade_point",
            "is_passed",
            "created_at",
            "updated_at",
        ]

    def get_position(self, obj):
        if obj.subject_position:
            suffix = {1: "st", 2: "nd", 3: "rd"}.get(obj.subject_position, "th")
            return f"{obj.subject_position}{suffix}"
        return ""

    def get_total_obtainable(self, obj):
        return 100


class JuniorSecondaryResultCreateUpdateSerializer(serializers.ModelSerializer):
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
        validations = {
            "continuous_assessment_score": (15, "Continuous Assessment"),
            "take_home_test_score": (5, "Take Home Test"),
            "practical_score": (5, "Practical"),
            "appearance_score": (5, "Appearance"),
            "project_score": (5, "Project"),
            "note_copying_score": (5, "Note Copying"),
            "exam_score": (60, "Exam score"),
        }
        for field, (max_val, label) in validations.items():
            if data.get(field, 0) > max_val:
                raise serializers.ValidationError(
                    f"{label} cannot exceed {max_val} marks"
                )
        return data

    def create(self, validated_data):
        request = self.context.get("request")
        if request and request.user:
            validated_data["entered_by"] = request.user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        request = self.context.get("request")
        if request and request.user:
            validated_data["last_edited_by"] = request.user
            validated_data["last_edited_at"] = timezone.now()
        return super().update(instance, validated_data)


class JuniorSecondaryTermReportSerializer(serializers.ModelSerializer):
    student = StudentMinimalSerializer(read_only=True)
    exam_session = ExamSessionSerializer(read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    subject_results = JuniorSecondaryResultSerializer(many=True, read_only=True)

    class Meta:
        model = JuniorSecondaryTermReport
        fields = "__all__"
        read_only_fields = [
            "id",
            "total_score",
            "average_score",
            "overall_grade",
            "class_position",
            "total_students",
            "created_at",
            "updated_at",
        ]


# ===== PRIMARY SERIALIZERS =====


class PrimaryResultSerializer(serializers.ModelSerializer):
    student = StudentMinimalSerializer(read_only=True)
    subject = SubjectMinimalSerializer(read_only=True)
    exam_session = ExamSessionSerializer(read_only=True)
    grading_system = GradingSystemSerializer(read_only=True)

    status_display = serializers.CharField(source="get_status_display", read_only=True)
    entered_by_name = serializers.CharField(
        source="entered_by.get_full_name", read_only=True, allow_null=True
    )

    exam_marks = serializers.DecimalField(
        source="exam_score", read_only=True, max_digits=5, decimal_places=2
    )
    mark_obtained = serializers.DecimalField(
        source="total_score", read_only=True, max_digits=5, decimal_places=2
    )
    position = serializers.SerializerMethodField()
    total_obtainable = serializers.SerializerMethodField()

    class Meta:
        model = PrimaryResult
        fields = "__all__"
        read_only_fields = [
            "id",
            "ca_total",
            "total_score",
            "ca_percentage",
            "exam_percentage",
            "total_percentage",
            "grade",
            "grade_point",
            "is_passed",
            "created_at",
            "updated_at",
        ]

    def get_position(self, obj):
        if obj.subject_position:
            suffix = {1: "st", 2: "nd", 3: "rd"}.get(obj.subject_position, "th")
            return f"{obj.subject_position}{suffix}"
        return ""

    def get_total_obtainable(self, obj):
        return 100


class PrimaryResultCreateUpdateSerializer(serializers.ModelSerializer):
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
        validations = {
            "continuous_assessment_score": (15, "Continuous Assessment"),
            "take_home_test_score": (5, "Take Home Test"),
            "practical_score": (5, "Practical"),
            "appearance_score": (5, "Appearance"),
            "project_score": (5, "Project"),
            "note_copying_score": (5, "Note Copying"),
            "exam_score": (60, "Exam score"),
        }
        for field, (max_val, label) in validations.items():
            if data.get(field, 0) > max_val:
                raise serializers.ValidationError(
                    f"{label} cannot exceed {max_val} marks"
                )
        return data

    def create(self, validated_data):
        request = self.context.get("request")
        if request and request.user:
            validated_data["entered_by"] = request.user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        request = self.context.get("request")
        if request and request.user:
            validated_data["last_edited_by"] = request.user
            validated_data["last_edited_at"] = timezone.now()
        return super().update(instance, validated_data)


class PrimaryTermReportSerializer(serializers.ModelSerializer):
    student = StudentMinimalSerializer(read_only=True)
    exam_session = ExamSessionSerializer(read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    subject_results = PrimaryResultSerializer(many=True, read_only=True)

    class Meta:
        model = PrimaryTermReport
        fields = "__all__"
        read_only_fields = [
            "id",
            "total_score",
            "average_score",
            "overall_grade",
            "class_position",
            "total_students",
            "created_at",
            "updated_at",
        ]


# ===== NURSERY SERIALIZERS =====


class NurseryResultSerializer(serializers.ModelSerializer):
    student = StudentMinimalSerializer(read_only=True)
    subject = SubjectMinimalSerializer(read_only=True)
    exam_session = ExamSessionSerializer(read_only=True)
    grading_system = GradingSystemSerializer(read_only=True)

    status_display = serializers.CharField(source="get_status_display", read_only=True)
    entered_by_name = serializers.CharField(
        source="entered_by.get_full_name", read_only=True, allow_null=True
    )

    physical_development = serializers.SerializerMethodField()
    health = serializers.SerializerMethodField()
    cleanliness = serializers.SerializerMethodField()
    general_conduct = serializers.SerializerMethodField()
    height_beginning = serializers.SerializerMethodField()
    height_end = serializers.SerializerMethodField()
    weight_beginning = serializers.SerializerMethodField()
    weight_end = serializers.SerializerMethodField()

    class Meta:
        model = NurseryResult
        fields = "__all__"
        read_only_fields = [
            "id",
            "percentage",
            "grade",
            "grade_point",
            "is_passed",
            "created_at",
            "updated_at",
        ]

    def get_physical_development(self, obj):
        return obj.term_report.physical_development if obj.term_report else None

    def get_health(self, obj):
        return obj.term_report.health if obj.term_report else None

    def get_cleanliness(self, obj):
        return obj.term_report.cleanliness if obj.term_report else None

    def get_general_conduct(self, obj):
        return obj.term_report.general_conduct if obj.term_report else None

    def get_height_beginning(self, obj):
        return obj.term_report.height_beginning if obj.term_report else None

    def get_height_end(self, obj):
        return obj.term_report.height_end if obj.term_report else None

    def get_weight_beginning(self, obj):
        return obj.term_report.weight_beginning if obj.term_report else None

    def get_weight_end(self, obj):
        return obj.term_report.weight_end if obj.term_report else None


class NurseryResultCreateUpdateSerializer(serializers.ModelSerializer):
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
        if data.get("mark_obtained", 0) > data.get("max_marks_obtainable", 0):
            raise serializers.ValidationError(
                "Mark obtained cannot exceed max marks obtainable"
            )
        return data

    def create(self, validated_data):
        request = self.context.get("request")
        if request and request.user:
            validated_data["entered_by"] = request.user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        request = self.context.get("request")
        if request and request.user:
            validated_data["last_edited_by"] = request.user
            validated_data["last_edited_at"] = timezone.now()
        return super().update(instance, validated_data)


class NurseryTermReportSerializer(serializers.ModelSerializer):
    student = StudentMinimalSerializer(read_only=True)
    exam_session = ExamSessionSerializer(read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    subject_results = NurseryResultSerializer(many=True, read_only=True)

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
        read_only_fields = [
            "id",
            "total_subjects",
            "total_max_marks",
            "total_marks_obtained",
            "overall_percentage",
            "class_position",
            "total_students_in_class",
            "created_at",
            "updated_at",
        ]


class NurseryTermReportCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = NurseryTermReport
        fields = [
            "student",
            "exam_session",
            "times_school_opened",
            "times_student_present",
            "physical_development",
            "health",
            "cleanliness",
            "general_conduct",
            "physical_development_comment",
            "height_beginning",
            "height_end",
            "weight_beginning",
            "weight_end",
            "next_term_begins",
            "class_teacher_remark",
            "head_teacher_remark",
            "status",
        ]


# ===== BASE STUDENT RESULT SERIALIZERS =====


class StudentResultSerializer(serializers.ModelSerializer):
    student = StudentMinimalSerializer(read_only=True)
    subject = SubjectMinimalSerializer(read_only=True)
    exam_session = ExamSessionSerializer(read_only=True)
    grading_system = GradingSystemSerializer(read_only=True)
    assessment_scores = AssessmentScoreSerializer(many=True, read_only=True)
    comments = ResultCommentSerializer(many=True, read_only=True)

    stream_name = serializers.CharField(
        source="stream.name", read_only=True, allow_null=True
    )
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = StudentResult
        fields = "__all__"
        read_only_fields = ["id", "created_at", "updated_at"]


class StudentTermResultSerializer(serializers.ModelSerializer):
    student = StudentDetailSerializer(read_only=True)
    academic_session = AcademicSessionSerializer(read_only=True)
    comments = ResultCommentSerializer(many=True, read_only=True)

    term_display = serializers.CharField(source="get_term_display", read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    published_by_name = serializers.CharField(
        source="published_by.get_full_name", read_only=True, allow_null=True
    )
    subject_results = serializers.SerializerMethodField()

    class Meta:
        model = StudentTermResult
        fields = "__all__"
        read_only_fields = [
            "id",
            "total_subjects",
            "subjects_passed",
            "subjects_failed",
            "total_score",
            "average_score",
            "gpa",
            "class_position",
            "total_students",
            "created_at",
            "updated_at",
        ]

    def get_subject_results(self, obj):
        """Get all subject results based on education level"""
        education_level = obj.student.education_level

        result_models = {
            "SENIOR_SECONDARY": (
                SeniorSecondaryResult,
                SeniorSecondaryResultSerializer,
            ),
            "JUNIOR_SECONDARY": (
                JuniorSecondaryResult,
                JuniorSecondaryResultSerializer,
            ),
            "PRIMARY": (PrimaryResult, PrimaryResultSerializer),
            "NURSERY": (NurseryResult, NurseryResultSerializer),
        }

        model_class, serializer_class = result_models.get(
            education_level, (StudentResult, StudentResultSerializer)
        )

        results = model_class.objects.filter(
            student=obj.student,
            exam_session__academic_session=obj.academic_session,
            exam_session__term=obj.term,
        ).select_related("subject", "grading_system", "exam_session")

        return serializer_class(results, many=True).data


class StudentTermResultCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentTermResult
        fields = [
            "student",
            "academic_session",
            "term",
            "times_opened",
            "times_present",
            "next_term_begins",
            "class_teacher_remark",
            "head_teacher_remark",
            "status",
        ]


# ===== RESULT SHEET SERIALIZERS =====


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
        source="prepared_by.get_full_name", read_only=True, allow_null=True
    )
    approved_by_name = serializers.CharField(
        source="approved_by.get_full_name", read_only=True, allow_null=True
    )

    class Meta:
        model = ResultSheet
        fields = "__all__"
        read_only_fields = [
            "id",
            "total_students",
            "students_passed",
            "students_failed",
            "class_average",
            "highest_score",
            "lowest_score",
            "created_at",
            "updated_at",
        ]


# ===== RESULT TEMPLATE SERIALIZERS =====


class ResultTemplateSerializer(serializers.ModelSerializer):
    template_type_display = serializers.CharField(
        source="get_template_type_display", read_only=True
    )
    education_level_display = serializers.CharField(
        source="get_education_level_display", read_only=True, allow_blank=True
    )

    class Meta:
        model = ResultTemplate
        fields = "__all__"
        read_only_fields = ["id", "created_at", "updated_at"]


class ResultTemplateCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResultTemplate
        fields = [
            "name",
            "template_type",
            "education_level",
            "template_content",
            "is_active",
        ]


# ===== TERM REPORT CREATE/UPDATE SERIALIZERS =====


class SeniorSecondaryTermReportCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SeniorSecondaryTermReport
        fields = [
            "student",
            "exam_session",
            "stream",
            "times_opened",
            "times_present",
            "next_term_begins",
            "class_teacher_remark",
            "head_teacher_remark",
            "status",
        ]


class JuniorSecondaryTermReportCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = JuniorSecondaryTermReport
        fields = [
            "student",
            "exam_session",
            "times_opened",
            "times_present",
            "next_term_begins",
            "class_teacher_remark",
            "head_teacher_remark",
            "status",
        ]


class PrimaryTermReportCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrimaryTermReport
        fields = [
            "student",
            "exam_session",
            "times_opened",
            "times_present",
            "next_term_begins",
            "class_teacher_remark",
            "head_teacher_remark",
            "status",
        ]


# ===== SESSION REPORT CREATE/UPDATE SERIALIZERS =====


class SeniorSecondarySessionResultCreateUpdateSerializer(serializers.ModelSerializer):
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
        for field, max_score in [
            ("first_term_score", 100),
            ("second_term_score", 100),
            ("third_term_score", 100),
        ]:
            if data.get(field, 0) > max_score:
                raise serializers.ValidationError(
                    f"{field} cannot exceed {max_score} marks"
                )
        return data


class SeniorSecondarySessionReportCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SeniorSecondarySessionReport
        fields = [
            "student",
            "academic_session",
            "stream",
            "teacher_remark",
            "head_teacher_remark",
            "status",
        ]


# ===== CONSOLIDATED SERIALIZERS =====


class ConsolidatedTermReportSerializer(serializers.Serializer):
    """Unified serializer for all education level term reports"""

    def to_representation(self, instance):
        education_level = getattr(instance.student, "education_level", None)

        serializer_map = {
            "SENIOR_SECONDARY": SeniorSecondaryTermReportSerializer,
            "JUNIOR_SECONDARY": JuniorSecondaryTermReportSerializer,
            "PRIMARY": PrimaryTermReportSerializer,
            "NURSERY": NurseryTermReportSerializer,
        }

        serializer_class = serializer_map.get(education_level)
        if serializer_class:
            return serializer_class(instance, context=self.context).data

        return {
            "id": str(instance.id),
            "student": StudentMinimalSerializer(instance.student).data,
            "exam_session": ExamSessionSerializer(instance.exam_session).data,
            "education_level": education_level,
            "status": getattr(instance, "status", "DRAFT"),
        }


class ConsolidatedResultSerializer(serializers.Serializer):
    """Unified serializer for all education level results"""

    def to_representation(self, instance):
        education_level = getattr(instance.student, "education_level", None)

        serializer_map = {
            "SENIOR_SECONDARY": SeniorSecondaryResultSerializer,
            "JUNIOR_SECONDARY": JuniorSecondaryResultSerializer,
            "PRIMARY": PrimaryResultSerializer,
            "NURSERY": NurseryResultSerializer,
        }

        serializer_class = serializer_map.get(education_level, StudentResultSerializer)
        return serializer_class(instance, context=self.context).data


# ===== BULK OPERATIONS SERIALIZERS =====


class BulkResultCreateSerializer(serializers.Serializer):
    """Serializer for bulk result creation"""

    education_level = serializers.ChoiceField(
        choices=["SENIOR_SECONDARY", "JUNIOR_SECONDARY", "PRIMARY", "NURSERY"],
        required=True,
    )
    exam_session_id = serializers.UUIDField(required=True)
    grading_system_id = serializers.IntegerField(required=True)
    results = serializers.ListField(child=serializers.DictField(), required=True)

    def validate_exam_session_id(self, value):
        if not ExamSession.objects.filter(id=value).exists():
            raise serializers.ValidationError("Exam session does not exist")
        return value

    def validate_grading_system_id(self, value):
        if not GradingSystem.objects.filter(id=value).exists():
            raise serializers.ValidationError("Grading system does not exist")
        return value

    def validate_results(self, value):
        if not value:
            raise serializers.ValidationError("Results list cannot be empty")
        return value


class BulkResultUpdateSerializer(serializers.Serializer):
    """Serializer for bulk result updates"""

    results = serializers.ListField(child=serializers.DictField(), required=True)

    def validate_results(self, value):
        if not value:
            raise serializers.ValidationError("Results list cannot be empty")

        for result in value:
            if "id" not in result:
                raise serializers.ValidationError("Each result must have an 'id' field")
        return value


class BulkStatusUpdateSerializer(serializers.Serializer):
    """Serializer for bulk status updates"""

    result_ids = serializers.ListField(child=serializers.UUIDField(), required=True)
    status = serializers.ChoiceField(
        choices=["DRAFT", "SUBMITTED", "APPROVED", "PUBLISHED"], required=True
    )
    comment = serializers.CharField(required=False, allow_blank=True)

    def validate_result_ids(self, value):
        if not value:
            raise serializers.ValidationError("Result IDs list cannot be empty")
        return value


# ===== STATUS TRANSITION SERIALIZERS =====


class StatusTransitionSerializer(serializers.Serializer):
    """Serializer for status transitions"""

    status = serializers.ChoiceField(
        choices=["DRAFT", "SUBMITTED", "APPROVED", "PUBLISHED"], required=True
    )
    comment = serializers.CharField(required=False, allow_blank=True)

    def validate_status(self, value):
        instance = self.context.get("instance")
        if not instance:
            return value

        current_status = instance.status

        valid_transitions = {
            "DRAFT": ["SUBMITTED", "APPROVED"],
            "SUBMITTED": ["APPROVED", "DRAFT"],
            "APPROVED": ["PUBLISHED", "SUBMITTED"],
            "PUBLISHED": [],
        }

        if current_status == value:
            return value

        if value not in valid_transitions.get(current_status, []):
            raise serializers.ValidationError(
                f"Cannot change status from {current_status} to {value}"
            )
        return value


class PublishResultSerializer(serializers.Serializer):
    """Serializer for publishing results"""

    result_ids = serializers.ListField(child=serializers.UUIDField(), required=True)
    publish_date = serializers.DateTimeField(required=False, allow_null=True)
    notification_message = serializers.CharField(required=False, allow_blank=True)
    send_notifications = serializers.BooleanField(default=True)

    def validate_result_ids(self, value):
        if not value:
            raise serializers.ValidationError("Result IDs list cannot be empty")
        return value


# ===== REPORT GENERATION SERIALIZERS =====


class ReportGenerationSerializer(serializers.Serializer):
    """Serializer for report generation requests"""

    student_ids = serializers.ListField(
        child=serializers.UUIDField(), required=False, allow_empty=True
    )
    exam_session_id = serializers.UUIDField(required=True)
    report_type = serializers.ChoiceField(
        choices=["TERM_REPORT", "SESSION_REPORT", "SUBJECT_REPORT"], required=True
    )
    format = serializers.ChoiceField(
        choices=["PDF", "EXCEL", "JSON", "CSV"], default="PDF"
    )
    include_comments = serializers.BooleanField(default=True)
    include_attendance = serializers.BooleanField(default=True)
    include_statistics = serializers.BooleanField(default=True)

    def validate_exam_session_id(self, value):
        if not ExamSession.objects.filter(id=value).exists():
            raise serializers.ValidationError("Exam session does not exist")
        return value

    def validate_student_ids(self, value):
        if value:
            existing_count = Student.objects.filter(id__in=value).count()
            if existing_count != len(value):
                raise serializers.ValidationError("Some student IDs do not exist")
        return value


class BulkReportGenerationSerializer(serializers.Serializer):
    """Serializer for bulk report generation"""

    exam_session_id = serializers.UUIDField(required=True)
    student_class = serializers.CharField(required=False, allow_blank=True)
    education_level = serializers.CharField(required=False, allow_blank=True)
    stream_id = serializers.IntegerField(required=False, allow_null=True)
    report_type = serializers.ChoiceField(
        choices=["TERM_REPORT", "SESSION_REPORT"], required=True
    )
    format = serializers.ChoiceField(choices=["PDF", "EXCEL"], default="PDF")

    def validate_exam_session_id(self, value):
        if not ExamSession.objects.filter(id=value).exists():
            raise serializers.ValidationError("Exam session does not exist")
        return value


# ===== STATISTICS SERIALIZERS =====
class ResultStatisticsSerializer(serializers.Serializer):
    """Serializer for result statistics"""

    total_students = serializers.IntegerField()
    students_passed = serializers.IntegerField()
    students_failed = serializers.IntegerField()
    pass_percentage = serializers.DecimalField(max_digits=5, decimal_places=2)
    class_average = serializers.DecimalField(max_digits=5, decimal_places=2)
    highest_score = serializers.DecimalField(max_digits=5, decimal_places=2)
    lowest_score = serializers.DecimalField(max_digits=5, decimal_places=2)
    grade_distribution = serializers.DictField()
    attendance_rate = serializers.DecimalField(
        max_digits=5, decimal_places=2, required=False
    )


class SubjectPerformanceSerializer(serializers.Serializer):
    """Serializer for subject performance statistics"""

    subject_id = serializers.IntegerField()
    subject_name = serializers.CharField()
    subject_code = serializers.CharField()
    total_students = serializers.IntegerField()
    average_score = serializers.DecimalField(max_digits=5, decimal_places=2)
    highest_score = serializers.DecimalField(max_digits=5, decimal_places=2)
    lowest_score = serializers.DecimalField(max_digits=5, decimal_places=2)
    pass_rate = serializers.DecimalField(max_digits=5, decimal_places=2)
    students_passed = serializers.IntegerField()
    students_failed = serializers.IntegerField()


class StudentPerformanceTrendSerializer(serializers.Serializer):
    """Serializer for student performance trends"""

    student = StudentMinimalSerializer()
    term_scores = serializers.ListField(child=serializers.DictField())
    average_score = serializers.DecimalField(max_digits=5, decimal_places=2)
    trend = serializers.ChoiceField(choices=["IMPROVING", "DECLINING", "STABLE"])
    percentage_change = serializers.DecimalField(max_digits=5, decimal_places=2)
    best_subject = serializers.CharField(required=False, allow_null=True)
    worst_subject = serializers.CharField(required=False, allow_null=True)


class ClassPerformanceSerializer(serializers.Serializer):
    """Serializer for class-level performance"""

    student_class = serializers.CharField()
    education_level = serializers.CharField()
    total_students = serializers.IntegerField()
    class_average = serializers.DecimalField(max_digits=5, decimal_places=2)
    pass_rate = serializers.DecimalField(max_digits=5, decimal_places=2)
    top_performers = serializers.ListField(child=serializers.DictField())
    subject_performance = SubjectPerformanceSerializer(many=True)


class SessionComparisonSerializer(serializers.Serializer):
    """Serializer for comparing performance across sessions"""

    student_id = serializers.UUIDField()
    student_name = serializers.CharField()
    sessions = serializers.ListField(child=serializers.DictField())
    overall_trend = serializers.ChoiceField(
        choices=["IMPROVING", "DECLINING", "STABLE"]
    )
    average_improvement = serializers.DecimalField(max_digits=5, decimal_places=2)


# ===== VALIDATION SERIALIZERS =====


class ResultValidationSerializer(serializers.Serializer):
    """Serializer for validating result data before submission"""

    education_level = serializers.ChoiceField(
        choices=["SENIOR_SECONDARY", "JUNIOR_SECONDARY", "PRIMARY", "NURSERY"]
    )
    result_data = serializers.DictField()

    def validate(self, data):
        education_level = data.get("education_level")
        result_data = data.get("result_data", {})

        if education_level == "SENIOR_SECONDARY":
            required_fields = [
                "first_test_score",
                "second_test_score",
                "third_test_score",
                "exam_score",
            ]
            for field in required_fields:
                if field not in result_data:
                    raise serializers.ValidationError(
                        f"{field} is required for Senior Secondary"
                    )

        elif education_level in ["JUNIOR_SECONDARY", "PRIMARY"]:
            required_fields = ["continuous_assessment_score", "exam_score"]
            for field in required_fields:
                if field not in result_data:
                    raise serializers.ValidationError(f"{field} is required")

        elif education_level == "NURSERY":
            if (
                "mark_obtained" not in result_data
                or "max_marks_obtainable" not in result_data
            ):
                raise serializers.ValidationError(
                    "Both mark_obtained and max_marks_obtainable are required"
                )

        return data


# ===== IMPORT/EXPORT SERIALIZERS =====


class ResultImportSerializer(serializers.Serializer):
    """Serializer for importing results from file"""

    file = serializers.FileField(required=True)
    education_level = serializers.ChoiceField(
        choices=["SENIOR_SECONDARY", "JUNIOR_SECONDARY", "PRIMARY", "NURSERY"]
    )
    exam_session_id = serializers.UUIDField(required=True)
    grading_system_id = serializers.IntegerField(required=True)
    overwrite_existing = serializers.BooleanField(default=False)
    validate_only = serializers.BooleanField(default=False)

    def validate_file(self, value):
        if not value.name.endswith((".csv", ".xlsx", ".xls")):
            raise serializers.ValidationError("Only CSV and Excel files are supported")
        return value


class ResultExportSerializer(serializers.Serializer):
    """Serializer for exporting results"""

    exam_session_id = serializers.UUIDField(required=True)
    education_level = serializers.CharField(required=False, allow_blank=True)
    student_class = serializers.CharField(required=False, allow_blank=True)
    format = serializers.ChoiceField(choices=["CSV", "EXCEL", "PDF"], default="EXCEL")
    include_statistics = serializers.BooleanField(default=True)
    include_comments = serializers.BooleanField(default=False)


# ===== ANALYTICS SERIALIZERS =====


class TermComparisonSerializer(serializers.Serializer):
    """Serializer for comparing student performance across terms"""

    student_id = serializers.UUIDField()
    academic_session_id = serializers.IntegerField()
    terms = serializers.ListField(child=serializers.DictField())
    overall_performance = serializers.CharField()
    improvement_areas = serializers.ListField(child=serializers.CharField())
    declining_areas = serializers.ListField(child=serializers.CharField())


class GradeDistributionSerializer(serializers.Serializer):
    """Serializer for grade distribution analytics"""

    exam_session_id = serializers.UUIDField()
    education_level = serializers.CharField()
    student_class = serializers.CharField()
    grade_counts = serializers.DictField()
    percentages = serializers.DictField()
    total_students = serializers.IntegerField()


class AttendancePerformanceCorrelationSerializer(serializers.Serializer):
    """Serializer for correlating attendance with performance"""

    student_id = serializers.UUIDField()
    attendance_rate = serializers.DecimalField(max_digits=5, decimal_places=2)
    average_score = serializers.DecimalField(max_digits=5, decimal_places=2)
    correlation_strength = serializers.CharField()
    recommendation = serializers.CharField()


# ===== NOTIFICATION SERIALIZERS =====


class ResultNotificationSerializer(serializers.Serializer):
    """Serializer for result notification"""

    student_ids = serializers.ListField(child=serializers.UUIDField(), required=False)
    exam_session_id = serializers.UUIDField(required=True)
    notification_type = serializers.ChoiceField(
        choices=["EMAIL", "SMS", "PUSH", "ALL"], default="ALL"
    )
    custom_message = serializers.CharField(required=False, allow_blank=True)
    include_pdf = serializers.BooleanField(default=True)

    def validate_exam_session_id(self, value):
        if not ExamSession.objects.filter(id=value).exists():
            raise serializers.ValidationError("Exam session does not exist")
        return value


# ===== SUMMARY SERIALIZERS =====


class ResultSummarySerializer(serializers.Serializer):
    """Serializer for result summary dashboard"""

    total_results = serializers.IntegerField()
    published_results = serializers.IntegerField()
    pending_approval = serializers.IntegerField()
    draft_results = serializers.IntegerField()
    overall_pass_rate = serializers.DecimalField(max_digits=5, decimal_places=2)
    average_class_performance = serializers.DecimalField(max_digits=5, decimal_places=2)
    top_performing_class = serializers.CharField()
    subjects_summary = serializers.ListField(child=serializers.DictField())


class StudentResultSummarySerializer(serializers.Serializer):
    """Serializer for individual student result summary"""

    student = StudentMinimalSerializer()
    total_subjects = serializers.IntegerField()
    subjects_passed = serializers.IntegerField()
    subjects_failed = serializers.IntegerField()
    average_score = serializers.DecimalField(max_digits=5, decimal_places=2)
    gpa = serializers.DecimalField(max_digits=3, decimal_places=2)
    class_position = serializers.IntegerField()
    overall_grade = serializers.CharField()
    attendance_rate = serializers.DecimalField(max_digits=5, decimal_places=2)
    strengths = serializers.ListField(child=serializers.CharField())
    weaknesses = serializers.ListField(child=serializers.CharField())


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


class AssessmentScoreNestedSerializer(serializers.ModelSerializer):
    """Nested serializer for assessment scores within results"""

    assessment_type_name = serializers.CharField(
        source="assessment_type.name", read_only=True
    )
    assessment_type_code = serializers.CharField(
        source="assessment_type.code", read_only=True
    )

    class Meta:
        model = AssessmentScore
        fields = [
            "id",
            "assessment_type",
            "assessment_type_name",
            "assessment_type_code",
            "score",
            "max_score",
            "percentage",
            "remarks",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class ResultCommentNestedSerializer(serializers.ModelSerializer):
    """Nested serializer for result comments"""

    commented_by_name = serializers.SerializerMethodField()

    class Meta:
        model = ResultComment
        fields = [
            "id",
            "comment_type",
            "comment",
            "commented_by",
            "commented_by_name",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_commented_by_name(self, obj):
        if obj.commented_by:
            return f"{obj.commented_by.first_name} {obj.commented_by.last_name}".strip()
        return None


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
        """Get all results for this student in this term across education levels"""
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
                        "subject": SubjectMinimalSerializer(r.subject).data,
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
