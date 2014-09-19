from django.contrib.gis.db import models


class Place(models.Model):
    name = models.CharField(max_length=256)
    address = models.CharField(max_length=256)
    city = models.CharField(max_length=128, blank=True)
    country = models.CharField(max_length=128, blank=True)

    location = models.PointField()

    homepage = models.URLField(blank=True)
    facebook = models.URLField(blank=True)
    twitter = models.URLField(blank=True)

    published = models.BooleanField(default=False)

    objects = models.GeoManager()


    def __unicode__(self):
        return self.name
