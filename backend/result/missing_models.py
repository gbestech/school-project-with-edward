# Missing models to be added to backend/result/models.py

class JuniorSecondaryResult(models.Model):
    """Junior Secondary specific result model with detailed CA breakdown"""
    
    RESULT_STATUS = [
        ("DRAFT", "Draft"),
        ("SUBMITTED", "Submitted"),
        ("APPROVED", "Approved"),
        ("PUBLISHED", "Published"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(
        Student, on_delete=models.CASCADE, related_name="junior_secondary_results"
    )
    subject = models.ForeignKey(
        Subject, on_delete=models.CASCADE, related_name="junior_secondary_results"
    )
    exam_session = models.ForeignKey(
        ExamSession, on_delete=models.CASCADE, related_name="junior_secondary_results"
    )
    grading_system = models.ForeignKey(
        GradingSystem, on_delete=models.CASCADE, related_name="junior_secondary_results"
    )

    # Continuous Assessment Breakdown (Total 40%)
    continuous_assessment_score = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        validators=[MinValueValidator(0), MaxValueValidator(15)],
        verbose_name="Continuous Assessment (15 marks)"
    )
    take_home_test_score = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
        verbose_name="Take Home Test (5 marks)"
    )
    practical_score = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
        verbose_name="Practical (5 marks)"
    )
    project_score = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
        verbose_name="Project (5 marks)"
    )
    note_copying_score = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
        verbose_name="Note Copying (5 marks)"
    )

    # Exam Score (60%)
    exam_score = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        validators=[MinValueValidator(0), MaxValueValidator(60)],
        verbose_name="Examination (60 marks)"
    )

    # Calculated scores
    ca_total = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        verbose_name="C.A Total (35 marks)"
    )
    total_score = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        verbose_name="Total (100 marks)"
    )

    # Percentages
    ca_percentage = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name="Continuous Assessment (%)"
    )
    exam_percentage = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name="Examination (%)"
    )
    total_percentage = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name="Total (%)"
    )

    # Grade information
    grade = models.CharField(max_length=5, blank=True)
    grade_point = models.DecimalField(
        max_digits=3, decimal_places=2, null=True, blank=True
    )
    is_passed = models.BooleanField(default=False)

    # Class statistics
    class_average = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        verbose_name="Class Average"
    )
    highest_in_class = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        verbose_name="Highest Score in Class"
    )
    lowest_in_class = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        verbose_name="Lowest Score in Class"
    )
    subject_position = models.PositiveIntegerField(
        null=True, blank=True,
        verbose_name="Subject Position"
    )

    # Previous term and cumulative
    previous_term_score = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        verbose_name="Previous Term Score"
    )
    cumulative_score = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        verbose_name="Cumulative Score"
    )

    # Teacher remarks
    teacher_remark = models.TextField(blank=True, verbose_name="Teacher's Remark")

    # Status and tracking
    status = models.CharField(max_length=20, choices=RESULT_STATUS, default="DRAFT")
    entered_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="entered_junior_results",
    )
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="approved_junior_results",
    )
    approved_date = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "results_junior_secondary_result"
        unique_together = ["student", "subject", "exam_session"]
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["student", "exam_session"]),
            models.Index(fields=["subject", "exam_session"]),
            models.Index(fields=["status"]),
        ]

    def __str__(self):
        return f"{self.student.full_name} - {self.subject.name} ({self.total_score})"

    def save(self, *args, **kwargs):
        # Calculate scores
        self.calculate_scores()
        # Determine grade
        self.determine_grade()
        # Calculate class statistics
        self.calculate_class_statistics()
        super().save(*args, **kwargs)

    def calculate_scores(self):
        """Calculate CA total, total score, and percentages"""
        # Calculate CA total (sum of all CA components)
        self.ca_total = (
            self.continuous_assessment_score + 
            self.take_home_test_score + 
            self.practical_score + 
            self.project_score + 
            self.note_copying_score
        )
        
        # Calculate total score (CA + Exam)
        self.total_score = self.ca_total + self.exam_score
        
        # Calculate percentages
        self.ca_percentage = (self.ca_total / 35) * 100 if self.ca_total > 0 else 0
        self.exam_percentage = (self.exam_score / 60) * 100 if self.exam_score > 0 else 0
        self.total_percentage = (self.total_score / 100) * 100 if self.total_score > 0 else 0

    def determine_grade(self):
        """Determine grade based on grading system"""
        try:
            grade_obj = self.grading_system.grades.filter(
                min_score__lte=self.total_percentage,
                max_score__gte=self.total_percentage
            ).first()
            
            if grade_obj:
                self.grade = grade_obj.grade
                self.grade_point = grade_obj.grade_point
                self.is_passed = grade_obj.is_passing
            else:
                self.grade = "N/A"
                self.grade_point = None
                self.is_passed = False
        except Exception:
            self.grade = "N/A"
            self.grade_point = None
            self.is_passed = False

    def calculate_class_statistics(self):
        """Calculate class statistics for this subject"""
        from django.db.models import Avg, Max, Min
        
        # Get all results for this subject and exam session in the same class
        class_results = JuniorSecondaryResult.objects.filter(
            subject=self.subject,
            exam_session=self.exam_session,
            student__student_class=self.student.student_class,
            status__in=['APPROVED', 'PUBLISHED']
        ).exclude(id=self.id)  # Exclude current result
        
        if class_results.exists():
            # Calculate statistics
            self.class_average = class_results.aggregate(avg=Avg('total_percentage'))['avg'] or 0
            self.highest_in_class = class_results.aggregate(max=Max('total_percentage'))['max'] or 0
            self.lowest_in_class = class_results.aggregate(min=Min('total_percentage'))['min'] or 0
            
            # Calculate position
            all_scores = list(class_results.values_list('total_percentage', flat=True)) + [self.total_percentage]
            all_scores.sort(reverse=True)
            self.subject_position = all_scores.index(self.total_percentage) + 1


class PrimaryResult(models.Model):
    """Primary School specific result model with detailed CA breakdown"""
    
    RESULT_STATUS = [
        ("DRAFT", "Draft"),
        ("SUBMITTED", "Submitted"),
        ("APPROVED", "Approved"),
        ("PUBLISHED", "Published"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(
        Student, on_delete=models.CASCADE, related_name="primary_results"
    )
    subject = models.ForeignKey(
        Subject, on_delete=models.CASCADE, related_name="primary_results"
    )
    exam_session = models.ForeignKey(
        ExamSession, on_delete=models.CASCADE, related_name="primary_results"
    )
    grading_system = models.ForeignKey(
        GradingSystem, on_delete=models.CASCADE, related_name="primary_results"
    )

    # Continuous Assessment Breakdown (Total 40%)
    continuous_assessment_score = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        validators=[MinValueValidator(0), MaxValueValidator(15)],
        verbose_name="Continuous Assessment (15 marks)"
    )
    take_home_test_score = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
        verbose_name="Take Home Test (5 marks)"
    )
    practical_score = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
        verbose_name="Practical (5 marks)"
    )
    project_score = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
        verbose_name="Project (5 marks)"
    )
    note_copying_score = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
        verbose_name="Note Copying (5 marks)"
    )

    # Exam Score (60%)
    exam_score = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        validators=[MinValueValidator(0), MaxValueValidator(60)],
        verbose_name="Examination (60 marks)"
    )

    # Calculated scores
    ca_total = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        verbose_name="C.A Total (35 marks)"
    )
    total_score = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        verbose_name="Total (100 marks)"
    )

    # Percentages
    ca_percentage = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name="Continuous Assessment (%)"
    )
    exam_percentage = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name="Examination (%)"
    )
    total_percentage = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name="Total (%)"
    )

    # Grade information
    grade = models.CharField(max_length=5, blank=True)
    grade_point = models.DecimalField(
        max_digits=3, decimal_places=2, null=True, blank=True
    )
    is_passed = models.BooleanField(default=False)

    # Class statistics
    class_average = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        verbose_name="Class Average"
    )
    highest_in_class = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        verbose_name="Highest Score in Class"
    )
    lowest_in_class = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        verbose_name="Lowest Score in Class"
    )
    subject_position = models.PositiveIntegerField(
        null=True, blank=True,
        verbose_name="Subject Position"
    )

    # Previous term and cumulative
    previous_term_score = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        verbose_name="Previous Term Score"
    )
    cumulative_score = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        verbose_name="Cumulative Score"
    )

    # Teacher remarks
    teacher_remark = models.TextField(blank=True, verbose_name="Teacher's Remark")

    # Status and tracking
    status = models.CharField(max_length=20, choices=RESULT_STATUS, default="DRAFT")
    entered_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="entered_primary_results",
    )
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="approved_primary_results",
    )
    approved_date = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "results_primary_result"
        unique_together = ["student", "subject", "exam_session"]
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["student", "exam_session"]),
            models.Index(fields=["subject", "exam_session"]),
            models.Index(fields=["status"]),
        ]

    def __str__(self):
        return f"{self.student.full_name} - {self.subject.name} ({self.total_score})"

    def save(self, *args, **kwargs):
        # Calculate scores
        self.calculate_scores()
        # Determine grade
        self.determine_grade()
        # Calculate class statistics
        self.calculate_class_statistics()
        super().save(*args, **kwargs)

    def calculate_scores(self):
        """Calculate CA total, total score, and percentages"""
        # Calculate CA total (sum of all CA components)
        self.ca_total = (
            self.continuous_assessment_score + 
            self.take_home_test_score + 
            self.practical_score + 
            self.project_score + 
            self.note_copying_score
        )
        
        # Calculate total score (CA + Exam)
        self.total_score = self.ca_total + self.exam_score
        
        # Calculate percentages
        self.ca_percentage = (self.ca_total / 35) * 100 if self.ca_total > 0 else 0
        self.exam_percentage = (self.exam_score / 60) * 100 if self.exam_score > 0 else 0
        self.total_percentage = (self.total_score / 100) * 100 if self.total_score > 0 else 0

    def determine_grade(self):
        """Determine grade based on grading system"""
        try:
            grade_obj = self.grading_system.grades.filter(
                min_score__lte=self.total_percentage,
                max_score__gte=self.total_percentage
            ).first()
            
            if grade_obj:
                self.grade = grade_obj.grade
                self.grade_point = grade_obj.grade_point
                self.is_passed = grade_obj.is_passing
            else:
                self.grade = "N/A"
                self.grade_point = None
                self.is_passed = False
        except Exception:
            self.grade = "N/A"
            self.grade_point = None
            self.is_passed = False

    def calculate_class_statistics(self):
        """Calculate class statistics for this subject"""
        from django.db.models import Avg, Max, Min
        
        # Get all results for this subject and exam session in the same class
        class_results = PrimaryResult.objects.filter(
            subject=self.subject,
            exam_session=self.exam_session,
            student__student_class=self.student.student_class,
            status__in=['APPROVED', 'PUBLISHED']
        ).exclude(id=self.id)  # Exclude current result
        
        if class_results.exists():
            # Calculate statistics
            self.class_average = class_results.aggregate(avg=Avg('total_percentage'))['avg'] or 0
            self.highest_in_class = class_results.aggregate(max=Max('total_percentage'))['max'] or 0
            self.lowest_in_class = class_results.aggregate(min=Min('total_percentage'))['min'] or 0
            
            # Calculate position
            all_scores = list(class_results.values_list('total_percentage', flat=True)) + [self.total_percentage]
            all_scores.sort(reverse=True)
            self.subject_position = all_scores.index(self.total_percentage) + 1


class NurseryResult(models.Model):
    """Nursery School specific result model with academic performance and physical development"""
    
    RESULT_STATUS = [
        ("DRAFT", "Draft"),
        ("SUBMITTED", "Submitted"),
        ("APPROVED", "Approved"),
        ("PUBLISHED", "Published"),
    ]

    PHYSICAL_DEVELOPMENT_CHOICES = [
        ("EXCELLENT", "Excellent"),
        ("VERY_GOOD", "Very Good"),
        ("GOOD", "Good"),
        ("FAIR", "Fair"),
        ("POOR", "Poor"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(
        Student, on_delete=models.CASCADE, related_name="nursery_results"
    )
    subject = models.ForeignKey(
        Subject, on_delete=models.CASCADE, related_name="nursery_results"
    )
    exam_session = models.ForeignKey(
        ExamSession, on_delete=models.CASCADE, related_name="nursery_results"
    )
    grading_system = models.ForeignKey(
        GradingSystem, on_delete=models.CASCADE, related_name="nursery_results"
    )

    # Academic Performance
    max_marks_obtainable = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        validators=[MinValueValidator(0)],
        verbose_name="Max Marks Obtainable"
    )
    mark_obtained = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        validators=[MinValueValidator(0)],
        verbose_name="Mark Obtained"
    )
    position = models.PositiveIntegerField(
        null=True, blank=True,
        verbose_name="Position"
    )
    academic_comment = models.TextField(
        blank=True,
        verbose_name="Academic Comment"
    )

    # Physical Development / Special Reports
    physical_development = models.CharField(
        max_length=20,
        choices=PHYSICAL_DEVELOPMENT_CHOICES,
        blank=True,
        verbose_name="Physical Development"
    )
    health = models.CharField(
        max_length=20,
        choices=PHYSICAL_DEVELOPMENT_CHOICES,
        blank=True,
        verbose_name="Health"
    )
    cleanliness = models.CharField(
        max_length=20,
        choices=PHYSICAL_DEVELOPMENT_CHOICES,
        blank=True,
        verbose_name="Cleanliness"
    )
    general_conduct = models.CharField(
        max_length=20,
        choices=PHYSICAL_DEVELOPMENT_CHOICES,
        blank=True,
        verbose_name="General Conduct"
    )
    physical_development_comment = models.TextField(
        blank=True,
        verbose_name="Physical Development Comment"
    )

    # Calculated scores
    percentage = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name="Percentage"
    )

    # Grade information
    grade = models.CharField(max_length=5, blank=True)
    grade_point = models.DecimalField(
        max_digits=3, decimal_places=2, null=True, blank=True
    )
    is_passed = models.BooleanField(default=False)

    # Status and tracking
    status = models.CharField(max_length=20, choices=RESULT_STATUS, default="DRAFT")
    entered_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="entered_nursery_results",
    )
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="approved_nursery_results",
    )
    approved_date = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "results_nursery_result"
        unique_together = ["student", "subject", "exam_session"]
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["student", "exam_session"]),
            models.Index(fields=["subject", "exam_session"]),
            models.Index(fields=["status"]),
        ]

    def __str__(self):
        return f"{self.student.full_name} - {self.subject.name} ({self.mark_obtained})"

    def save(self, *args, **kwargs):
        # Calculate percentage
        self.calculate_percentage()
        # Determine grade
        self.determine_grade()
        super().save(*args, **kwargs)

    def calculate_percentage(self):
        """Calculate percentage based on marks obtained and max marks"""
        if self.max_marks_obtainable > 0:
            self.percentage = (self.mark_obtained / self.max_marks_obtainable) * 100
        else:
            self.percentage = 0

    def determine_grade(self):
        """Determine grade based on grading system"""
        try:
            grade_obj = self.grading_system.grades.filter(
                min_score__lte=self.percentage,
                max_score__gte=self.percentage
            ).first()
            
            if grade_obj:
                self.grade = grade_obj.grade
                self.grade_point = grade_obj.grade_point
                self.is_passed = grade_obj.is_passing
            else:
                self.grade = "N/A"
                self.grade_point = None
                self.is_passed = False
        except Exception:
            self.grade = "N/A"
            self.grade_point = None
            self.is_passed = False





