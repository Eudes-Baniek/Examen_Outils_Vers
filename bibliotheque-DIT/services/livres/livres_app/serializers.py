from rest_framework import serializers
from .models import Livre


class LivreSerializer(serializers.ModelSerializer):
    est_disponible = serializers.ReadOnlyField()

    class Meta:
        model = Livre
        fields = '__all__'

    def validate_isbn(self, value):
        value = value.replace('-', '').replace(' ', '')
        if len(value) not in [10, 13]:
            raise serializers.ValidationError("L'ISBN doit contenir 10 ou 13 chiffres.")
        return value

    def validate_quantite_disponible(self, value):
        quantite_totale = self.initial_data.get('quantite_totale')
        if quantite_totale and value > int(quantite_totale):
            raise serializers.ValidationError(
                "La quantité disponible ne peut pas dépasser la quantité totale."
            )
        return value


class LivreListSerializer(serializers.ModelSerializer):
    """Serializer allégé pour les listes."""
    est_disponible = serializers.ReadOnlyField()

    class Meta:
        model = Livre
        fields = ['id', 'titre', 'auteur', 'isbn', 'genre', 'quantite_disponible', 'est_disponible']
