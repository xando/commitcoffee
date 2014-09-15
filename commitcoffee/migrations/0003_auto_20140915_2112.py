# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('commitcoffee', '0002_place_accepted'),
    ]

    operations = [
        migrations.RenameField(
            model_name='place',
            old_name='accepted',
            new_name='published',
        ),
    ]
