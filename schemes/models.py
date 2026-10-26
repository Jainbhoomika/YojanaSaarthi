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

    def __str__(self):
        return self.name
