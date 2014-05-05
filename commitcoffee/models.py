from django.db import models


class Place(models.Model):
    name=models.CharField(max_length=256)
    city=models.CharField(max_length=128)
    country=models.CharField(max_length=128)
    address=models.CharField(max_length=256)

    latitude = models.FloatField()
    longitude = models.FloatField()

    homepage=models.URLField(null=True)
    facebook=models.URLField(null=True)
    twitter=models.URLField(null=True)


