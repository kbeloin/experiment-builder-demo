from functools import partial
from re import T
from typing import Tuple
from xmlrpc.client import Boolean
from django.db import models
from django.contrib.auth.models import AbstractUser
from users.models import User
from django.core.exceptions import ValidationError
import json
# Create your models here.

class Todo(models.Model):
    title = models.CharField(max_length=120)
    description = models.TextField()
    completed = models.BooleanField(default=False)

    def _str_(self):
        return self.title

class Experiment(models.Model):
    title = models.CharField(max_length=255)
    config = models.JSONField(null=True, blank=True)
    options = models.JSONField(null=True, blank=True)
    moderator =  models.ForeignKey(User, on_delete=models.CASCADE, null=True)
    instructions = models.JSONField(null=True, blank=True)
    participants =  models.ManyToManyField(User, related_name="experiments", blank=True)
    order = models.SmallIntegerField(blank=True, null=True, default=1)
    valid_date = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return self.title

class Module(models.Model):
    title = models.CharField(max_length=255)
    moderator = models.ForeignKey(User, on_delete=models.CASCADE)
    instructions = models.JSONField(null=True, blank=True)
    options = models.JSONField(null=True, blank=True)
    config = models.JSONField(null=True, blank=True)
    experiments = models.ManyToManyField(Experiment, related_name='modules', blank=True)
    start_time = models.DateTimeField(null=True, blank=True)
    end_time = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.title
        
class CompletedExperiment(models.Model):
    participant = models.ForeignKey(User, related_name="submitted_experiments", on_delete=models.SET_NULL, null=True)
    experiment=models.ForeignKey(Experiment, related_name="submitted", on_delete=models.SET_NULL, blank=True, null=True)
    
    def __str__(self):
        return f'{self.participant}, {self.experiment}'

class CompletedModule(models.Model):
    participant = models.ForeignKey(User, on_delete=models.CASCADE)
    submitted_experiment=models.ForeignKey(CompletedExperiment, related_name="submitted_modules", on_delete=models.CASCADE, blank=True, null=True)
    module = models.ForeignKey(Module, related_name="submitted", on_delete=models.SET_NULL, blank=True, null=True)
    result = models.FloatField(default=0)
    feedback = models.JSONField(null=True, blank=True)

class Question(models.Model):
    TARGET_EXACT = 'exact'
    TARGET_PARTIAL = 'partial'
    TARGET_COMPLETE = 'complete'
    TARGET_OPTIONAL = 'optional'
    TARGET_CHOICES = (
        (TARGET_EXACT, 'Exact'),
        (TARGET_PARTIAL, 'Partial'),
        (TARGET_COMPLETE, 'Complete'),
        (TARGET_OPTIONAL, 'Optional'),
    )

    target_type = models.CharField(
        max_length=20,
        choices=TARGET_CHOICES,
        default=TARGET_OPTIONAL,
    )

    question =  models.JSONField(null=True, blank=True)
    module = models.ForeignKey(
        Module, on_delete=models.CASCADE, related_name='questions', blank=True, null=True)
    order = models.SmallIntegerField()
    config = models.JSONField(null=True, blank=True)    

    def __str__(self):
        return self.question


class Option(models.Model):
    title = models.CharField(max_length=255)
    value = models.JSONField(null=True, blank=True)
    question = models.ManyToManyField(
        Question, related_name='options', blank=True)
    target = models.ForeignKey(
        Question, on_delete=models.CASCADE, related_name='target', blank=True, null=True)

    def __str__(self):
        return json.dumps({"title": self.title, "value": self.value})
        
class UserResponse(models.Model):
    participant = models.ForeignKey(User, on_delete=models.CASCADE, related_name='responses', null=True)
    response = models.JSONField(null=True, blank=True)
    question = models.ForeignKey(
        Question, on_delete=models.SET_NULL, related_name="submitted", blank=True, null=True)
    option = models.ForeignKey(
        Option, on_delete=models.SET_NULL, blank=True, null=True)
    completed_module = models.ForeignKey(
        CompletedModule, on_delete=models.CASCADE, related_name='responses', blank=True, null=True)
    # Length of time in milliseconds before user moved on to next question
    response_time = models.IntegerField(default=0, null=True, blank=True)
    
    def __str__(self):
        return str(self.response)

    def is_correct(self)->Tuple:
        target_type = self.question.target_type
        targets = self.question.target.values_list('value', flat=True)
        response = self.response
        if target_type == self.question.TARGET_EXACT:
            return (response==targets, list(filter(lambda x: x in targets, response)), list(filter(lambda x: x not in targets, response)))
             
        elif target_type == self.question.TARGET_PARTIAL:
            targets, response = (set(targets), set(response))
            return (len((targets & response))>0, targets - response, response - targets)

        elif target_type == self.question.TARGET_COMPLETE:
            return (len((response))>0, response)

        elif target_type == self.question.TARGET_OPTIONAL:
            return (True, response)
        else:
            raise ValidationError(f'Unkown target type: {target_type}')

# Feedback for a user's response, module, or experiment
class Feedback(models.Model):
    participant = models.ForeignKey(User, on_delete=models.CASCADE, related_name='feedback', null=False)
    content = models.JSONField(null=True, blank=True)
    user_response = models.ForeignKey(UserResponse, on_delete=models.CASCADE, related_name='response_feedback', null=True)
    completed_module = models.ForeignKey(
        CompletedModule, on_delete=models.CASCADE, related_name='module_feedback', blank=True, null=True)
    completed_experiment = models.ForeignKey(CompletedExperiment, on_delete=models.CASCADE, related_name='experiment_feedback', blank=True, null=True)
    date = models.DateTimeField(auto_now_add=True)
    read = models.BooleanField(default=False)
    # Length of time in milliseconds before user moved on to next question