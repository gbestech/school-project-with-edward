from django import forms
from .models import Exam, ExamSchedule


class ExamForm(forms.ModelForm):
    class Meta:
        model = Exam
        fields = [
            "title",
            "description",
            "subject",
            "grade_level",
            "section",
            "exam_schedule",
            "exam_type",
            "exam_date",
            "start_time",
            "end_time",
            "total_marks",
            "pass_marks",
            "venue",
            "instructions",
        ]
        widgets = {
            "exam_date": forms.DateInput(attrs={"type": "date"}),
            "start_time": forms.TimeInput(attrs={"type": "time"}),
            "end_time": forms.TimeInput(attrs={"type": "time"}),
            "description": forms.Textarea(attrs={"rows": 3}),
            "instructions": forms.Textarea(attrs={"rows": 4}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        # Set default exam schedule for new exams
        if not self.instance.pk:
            default_schedule = ExamSchedule.get_default()
            if default_schedule:
                self.fields["exam_schedule"].initial = default_schedule

        # Make exam_schedule field more user-friendly
        self.fields["exam_schedule"].empty_label = "Select Exam Schedule"
        self.fields["exam_schedule"].queryset = ExamSchedule.objects.filter(
            is_active=True
        ).order_by("-is_default", "-start_date")

        # Add CSS classes for better styling
        for field_name, field in self.fields.items():
            field.widget.attrs["class"] = "form-control"

        # Make required fields more obvious
        self.fields["exam_schedule"].widget.attrs["class"] += " required"
        self.fields["exam_date"].widget.attrs["class"] += " required"
        self.fields["start_time"].widget.attrs["class"] += " required"
        self.fields["end_time"].widget.attrs["class"] += " required"


class ExamScheduleForm(forms.ModelForm):
    class Meta:
        model = ExamSchedule
        fields = [
            "name",
            "description",
            "academic_session",
            "term",
            "start_date",
            "end_date",
            "registration_start",
            "registration_end",
            "results_publication_date",
            "is_active",
            "is_default",
            "allow_late_registration",
        ]
        widgets = {
            "start_date": forms.DateInput(attrs={"type": "date"}),
            "end_date": forms.DateInput(attrs={"type": "date"}),
            "registration_start": forms.DateTimeInput(attrs={"type": "datetime-local"}),
            "registration_end": forms.DateTimeInput(attrs={"type": "datetime-local"}),
            "results_publication_date": forms.DateInput(attrs={"type": "date"}),
            "description": forms.Textarea(attrs={"rows": 3}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        # Add CSS classes
        for field_name, field in self.fields.items():
            if isinstance(field.widget, (forms.CheckboxInput,)):
                field.widget.attrs["class"] = "form-check-input"
            else:
                field.widget.attrs["class"] = "form-control"

    def clean(self):
        cleaned_data = super().clean()
        start_date = cleaned_data.get("start_date")
        end_date = cleaned_data.get("end_date")
        registration_start = cleaned_data.get("registration_start")
        registration_end = cleaned_data.get("registration_end")

        # Additional form-level validation
        if start_date and end_date and start_date > end_date:
            raise forms.ValidationError("Start date must be before end date")

        if (
            registration_start
            and registration_end
            and registration_start > registration_end
        ):
            raise forms.ValidationError(
                "Registration start must be before registration end"
            )

        return cleaned_data


# Quick form for selecting exam schedule
class ExamScheduleSelectForm(forms.Form):
    exam_schedule = forms.ModelChoiceField(
        queryset=ExamSchedule.objects.filter(is_active=True),
        empty_label="Select Exam Schedule",
        widget=forms.Select(attrs={"class": "form-control"}),
    )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Order by default first
        self.fields["exam_schedule"].queryset = ExamSchedule.objects.filter(
            is_active=True
        ).order_by("-is_default", "-start_date")
