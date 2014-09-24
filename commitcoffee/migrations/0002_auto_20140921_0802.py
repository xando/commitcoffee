# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('commitcoffee', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='place',
            name='contact',
            field=models.EmailField(default='', max_length=75, blank=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='place',
            name='description_internet',
            field=models.TextField(default='', blank=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='place',
            name='description_other',
            field=models.TextField(default='', blank=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='place',
            name='description_power',
            field=models.TextField(default='', blank=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='place',
            name='description_provision',
            field=models.TextField(default='', blank=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='place',
            name='description_service',
            field=models.TextField(default='', blank=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='place',
            name='owner',
            field=models.BooleanField(default=False),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='place',
            name='published',
            field=models.BooleanField(default=False),
            preserve_default=True,
        ),
    ]
