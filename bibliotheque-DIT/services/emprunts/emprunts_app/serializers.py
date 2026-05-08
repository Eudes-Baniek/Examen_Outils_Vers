from rest_framework import serializers
from .models import Emprunt


class EmpruntSerializer(serializers.ModelSerializer):
    est_en_retard = serializers.ReadOnlyField()
    jours_retard = serializers.ReadOnlyField()

    class Meta:
        model = Emprunt
        fields = '__all__'
        read_only_fields = ['date_emprunt', 'statut']


class EmpruntCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Emprunt
        fields = ['utilisateur_id', 'livre_id', 'notes']

    def validate(self, data):
        # Vérification : l'utilisateur n'a pas déjà emprunté ce livre
        existe = Emprunt.objects.filter(
            utilisateur_id=data['utilisateur_id'],
            livre_id=data['livre_id'],
            statut='en_cours'
        ).exists()
        if existe:
            raise serializers.ValidationError(
                "Cet utilisateur a déjà emprunté ce livre et ne l'a pas encore retourné."
            )
        return data


class RetourSerializer(serializers.Serializer):
    notes = serializers.CharField(required=False, allow_blank=True)
