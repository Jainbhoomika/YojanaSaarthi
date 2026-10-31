
from django.contrib import admin
from .models import Scheme, EligibilityCriteria


@admin.register(Scheme)
class SchemeAdmin(admin.ModelAdmin):
    list_display = ("name", "last_verified")
    search_fields = ("name", "description", "eligibility_summary")
    list_filter = ("last_verified",)

@admin.register(EligibilityCriteria)
class EligibilityCriteriaAdmin(admin.ModelAdmin):
    list_display = (
        "scheme",
        "criterion_type",
        "operator",
        "is_mandatory"
    )

    list_filter = ("criterion_type", "operator", "is_mandatory")
    search_fields = ("scheme__name", "criterion_type")
