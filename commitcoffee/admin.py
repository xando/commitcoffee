from django.contrib import admin
from . import models


@admin.register(models.Place)
class PlaceAdmin(admin.ModelAdmin):
    list_display = ['name', 'address', 'published']
    list_filter = ['published']

