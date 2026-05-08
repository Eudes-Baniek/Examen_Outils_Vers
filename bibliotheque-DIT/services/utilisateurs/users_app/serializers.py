from rest_framework import serializers
from .models import Utilisateur


class UtilisateurSerializer(serializers.ModelSerializer):
    nom_complet = serializers.ReadOnlyField()

    class Meta:
        model = Utilisateur
        fields = '__all__'

    def validate_email(self, value):
        return value.lower().strip()

    def validate_numero_etudiant(self, value):
        if value and Utilisateur.objects.filter(
            numero_etudiant=value
        ).exclude(pk=self.instance.pk if self.instance else None).exists():
            raise serializers.ValidationError("Ce numéro étudiant est déjà utilisé.")
        return value


class UtilisateurListSerializer(serializers.ModelSerializer):
    nom_complet = serializers.ReadOnlyField()

    class Meta:
        model = Utilisateur
        fields = ['id', 'nom_complet', 'email', 'type_utilisateur', 'actif', 'max_emprunts']
