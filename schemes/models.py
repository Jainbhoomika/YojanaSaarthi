from django.db import models

class Scheme(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField()
    benefits = models.TextField()
    eligibility_summary = models.TextField()
    required_documents = models.TextField(blank=True)
    application_process = models.TextField(blank=True)
    official_url = models.URLField()
    last_verified = models.DateField()
    eligibility_rules_verified = models.BooleanField(default=False)
    def __str__(self):
        return self.name

class EligibilityCriteria(models.Model):

    scheme = models.ForeignKey(
        Scheme,
        on_delete=models.CASCADE,
        related_name="eligibility_criteria"
    )
    class CriterionType(models.TextChoices):
        AGE = "age", "Age"
        STATE = "state", "State"
        GENDER = "gender", "Gender"
        ANNUAL_INCOME = "annual_income", "Annual Income"
        OCCUPATION = "occupation", "Occupation"
        EDUCATION = "education", "Education"
        CATEGORY = "category", "Category"

    criterion_type = models.CharField(
    max_length=100,
    choices=CriterionType.choices
)
    class Operator(models.TextChoices):
        EQUALS = "EQUALS", "Equals"
        IN = "IN", "In"
        GREATER_THAN = "GREATER_THAN", "Greater Than"
        LESS_THAN = "LESS_THAN", "Less Than"
        BETWEEN = "BETWEEN", "Between"

    operator = models.CharField(
    max_length=20,
    choices=Operator.choices
    )

    criterion_value = models.JSONField()

    is_mandatory = models.BooleanField(default=True)

    source_reference = models.URLField(blank=True)

    def __str__(self):
        return f"{self.scheme.name} - {self.criterion_type}"