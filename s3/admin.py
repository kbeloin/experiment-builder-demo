from django.contrib import admin

from .models import FileUpload, EmbeddedFile

admin.site.register(FileUpload)
admin.site.register(EmbeddedFile)
# Register your models here.
