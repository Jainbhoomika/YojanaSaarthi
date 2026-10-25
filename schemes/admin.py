
from django.contrib import admin
from .models import Scheme


@admin.register(Scheme)
class SchemeAdmin(admin.ModelAdmin):
    list_display = ("name", "last_verified")
    search_fields = ("name", "description", "eligibility_summary")
    list_filter = ("last_verified",)