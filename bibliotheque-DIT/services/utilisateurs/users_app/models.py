from django.db import models


class Utilisateur(models.Model):
    TYPE_CHOICES = [
        ('etudiant', 'Étudiant'),
        ('professeur', 'Professeur'),
        ('personnel', 'Personnel'),
    ]

    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    telephone = models.CharField(max_length=20, blank=True, default='')
    type_utilisateur = models.CharField(max_length=20, choices=TYPE_CHOICES, default='etudiant')
    numero_etudiant = models.CharField(max_length=50, blank=True, null=True, unique=True)
    date_inscription = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)
    actif = models.BooleanField(default=True)
    max_emprunts = models.PositiveIntegerField(default=3)

    class Meta:
        db_table = 'utilisateurs'
        ordering = ['nom', 'prenom']

    def __str__(self):
        return f"{self.prenom} {self.nom} ({self.type_utilisateur})"

    @property
    def nom_complet(self):
        return f"{self.prenom} {self.nom}"

    def save(self, *args, **kwargs):
        # Ajuster le nombre max d'emprunts selon le type
        if self.type_utilisateur == 'professeur':
            self.max_emprunts = 5
        elif self.type_utilisateur == 'personnel':
            self.max_emprunts = 4
        else:
            self.max_emprunts = 3
        super().save(*args, **kwargs)
