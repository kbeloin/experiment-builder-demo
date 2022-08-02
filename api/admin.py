from django.contrib import admin
from django.http import HttpResponse
import csv

from .models import Question, Module, CompletedModule, Option, UserResponse, Experiment, CompletedExperiment

admin.site.register(Module)
admin.site.register(CompletedModule)
admin.site.register(Experiment)
admin.site.register(CompletedExperiment)

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('id', 'question', 'module', 'order', 'config')
    list_filter = ('module',)
    search_fields = ('question',)

@admin.register(Option)
class OptionAdmin(admin.ModelAdmin):
    list_display = ('id', 'question', 'value')
    list_filter = ('question',)
    search_fields = ('option',)

    # For questions, we want to show question id only
    def question(self, obj):
        return obj.question.id



class UserResponseFilter(admin.SimpleListFilter):
    '''
    TimonWeb: https://timonweb.com/django/adding-custom-filters-to-django-admin-is-easy/
    '''
    title = "Completed Responses"
    parameter_name = 'response'

    def lookups(seld, request, model_admin):

        return [
            ("nulled_responses", "Empty Responses"),
            ("non_nulled_responses","Filled Responses")
        ]

    def queryset(self, request, queryset):

        if self.value() == "non_nulled_responses":
            return queryset.filter(response__isnull=False)
        if self.value():
            return queryset.filter(response__isnull=True)

@admin.register(UserResponse)
class UserResponseAdmin(admin.ModelAdmin):
    fields = ("user", "response", "experiment", "module", "module_id", "question_id", "option_id", "response_time")
    list_display = ("user", "response", "experiment", "module", "module_id", "question_id", "option_id", "response_time")
    actions = ["export_as_csv"]
    list_filter = (UserResponseFilter,)

    def user(self, obj):
        return obj.completed_module.participant
    
    def response(self, obj):
        return obj.response

    def option_id(self, obj):
        return obj.option.id
    
    def experiment(self, obj):
        if obj.completed_module.submitted_experiment is not None:
            return obj.completed_module.submitted_experiment.experiment.title
        else:
            return "No experiment"
    
    def question_id(self, obj):
        return obj.question.id

    def response_short(self, obj):
        return str(obj.response)[:25]

    def module(self, obj):
        return obj.completed_module.module.title

    def module_id(self, obj):
        return obj.completed_module.module.id

    def response_time(self, obj):
        return obj.response_time

    def export_as_csv(self, request, queryset):
        '''Cookbook Django example'''
        meta = self.model._meta
        field_names = [field for field in self.fields]
        print(field_names)

        response = HttpResponse(content_type = 'text/csv')
        response['Content-Disposition'] = 'attachment; filename={}.csv'.format(meta)

        writer = csv.writer(response)

        writer.writerow(field_names)
        for obj in queryset:
            row = writer.writerow([getattr(self, field)(obj) for field in field_names])

        return response