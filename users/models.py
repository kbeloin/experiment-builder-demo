from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.
class User(AbstractUser):
    is_participant = models.BooleanField(null=True, default=True)
    is_moderator = models.BooleanField(null=True, default=False)

    def __str__(self):
        return self.username

class Participant(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.username
