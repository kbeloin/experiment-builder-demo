from django.db import models

# Create your models here.
from users.models import User
from api.models import Module, Question, Option, UserResponse, Experiment
from django.core.exceptions import ValidationError

class FileUpload(models.Model):
    created = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    public_url = models.URLField(null=True)
    bucket_key = models.CharField(max_length=120,null=True, blank=True)
    modules = models.ManyToManyField(Module, related_name="files", blank=True)
    questions = models.ManyToManyField(Question, related_name="files", blank=True)
    options = models.ManyToManyField(Option, related_name="files", blank=True)
    response = models.ForeignKey(UserResponse, on_delete=models.CASCADE, related_name="files", null=True, blank=True)

    def __str__(self):
        return str(self.public_url)

# Model for Embedded File Upload
# Has the foreign keys only to models associated with Rich Text Editor
# Fields:
# - url of the file
# - created_by
# - created

class EmbeddedFile(models.Model):
    created = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    public_url = models.URLField(null=True)
    experiments = models.ManyToManyField(Experiment, related_name="embeds", blank=True)
    modules = models.ManyToManyField(Module, related_name="embeds", blank=True)
    questions = models.ManyToManyField(Question, related_name="embeds", blank=True)

    def __str__(self):
        return str(self.public_url)



