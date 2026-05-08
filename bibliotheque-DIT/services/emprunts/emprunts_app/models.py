from django.db import models
from django.utils import timezone
from datetime import timedelta
from django.conf import settings


class Emprunt(models.Model):
    STATUT_CHOICES = [
        ('en_cours', 'En cours'),
        ('retourne', 'Retourné'),
        ('en_retard', 'En retard'),
    ]

    utilisateur_id = models.IntegerField()
    livre_id = models.IntegerField()
    date_emprunt = models.DateTimeField(auto_now_add=True)
    date_retour_prevue = models.DateField()
    date_retour_reelle = models.DateField(null=True, blank=True)
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='en_cours')
    notes = models.TextField(blank=True, default='')

    class Meta:
        db_table = 'emprunts'
        ordering = ['-date_emprunt']

    def __str__(self):
        return f"Emprunt #{self.id} - User:{self.utilisateur_id} Livre:{self.livre_id}"

    def save(self, *args, **kwargs):
        if not self.date_retour_prevue:
            duree = getattr(settings, 'DUREE_EMPRUNT_DEFAULT', 14)
            self.date_retour_prevue = (timezone.now() + timedelta(days=duree)).date()
        super().save(*args, **kwargs)

    @property
    def est_en_retard(self):
        if self.statut == 'retourne':
            return False
        return timezone.now().date() > self.date_retour_prevue

    @property
    def jours_retard(self):
        if not self.est_en_retard:
            return 0
        return (timezone.now().date() - self.date_retour_prevue).days
