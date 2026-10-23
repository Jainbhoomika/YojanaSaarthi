from django.db import models

class Scheme(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField()
    benefits = models.TextField()
    eligibility_summary = models.TextField()
    required_documents = models.TextField()
    application_process = models.TextField()
    official_url = models.URLField()
    last_verified = models.DateField()

    def __str__(self):
        return self.name
