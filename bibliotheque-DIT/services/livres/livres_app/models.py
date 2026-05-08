from django.db import models


class Livre(models.Model):
    GENRE_CHOICES = [
        ('informatique', 'Informatique'),
        ('mathematiques', 'Mathématiques'),
        ('physique', 'Physique'),
        ('litterature', 'Littérature'),
        ('histoire', 'Histoire'),
        ('economie', 'Économie'),
        ('autre', 'Autre'),
    ]

    titre = models.CharField(max_length=255)
    auteur = models.CharField(max_length=255)
    isbn = models.CharField(max_length=20, unique=True)
    description = models.TextField(null=True, blank=True)
    genre = models.CharField(max_length=50, choices=GENRE_CHOICES, default='autre')
    annee_publication = models.IntegerField(null=True, blank=True)
    editeur = models.CharField(max_length=255, blank=True, default='')
    quantite_totale = models.PositiveIntegerField(default=1)
    quantite_disponible = models.PositiveIntegerField(default=1)
    date_ajout = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'livres'
        ordering = ['titre']

    def __str__(self):
        return f"{self.titre} - {self.auteur}"

    @property
    def est_disponible(self):
        return self.quantite_disponible > 0
