from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import Livre
from .serializers import LivreSerializer, LivreListSerializer


class LivreViewSet(viewsets.ModelViewSet):
    """
    ViewSet complet pour la gestion des livres.
    Endpoints :
      GET    /api/livres/               - Liste tous les livres
      POST   /api/livres/               - Ajouter un livre
      GET    /api/livres/{id}/          - Détail d'un livre
      PUT    /api/livres/{id}/          - Modifier un livre
      DELETE /api/livres/{id}/          - Supprimer un livre
      GET    /api/livres/search/        - Recherche par titre/auteur/ISBN
      GET    /api/livres/disponibles/   - Livres disponibles uniquement
      POST   /api/livres/{id}/reserver/ - Réduire quantité disponible (appel interne)
      POST   /api/livres/{id}/liberer/  - Augmenter quantité disponible (appel interne)
    """
    queryset = Livre.objects.all()
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['genre', 'auteur', 'annee_publication']
    ordering_fields = ['titre', 'auteur', 'date_ajout', 'annee_publication']
    ordering = ['titre']

    def get_serializer_class(self):
        if self.action == 'list':
            return LivreListSerializer
        return LivreSerializer

    @action(detail=False, methods=['get'], url_path='search')
    def search(self, request):
        """Recherche par titre, auteur ou ISBN."""
        query = request.query_params.get('q', '').strip()
        if not query:
            return Response(
                {'error': 'Paramètre q requis. Ex: /api/livres/search/?q=python'},
                status=status.HTTP_400_BAD_REQUEST
            )
        livres = Livre.objects.filter(
            Q(titre__icontains=query) |
            Q(auteur__icontains=query) |
            Q(isbn__icontains=query) |
            Q(description__icontains=query)
        )
        serializer = LivreListSerializer(livres, many=True)
        return Response({
            'query': query,
            'count': livres.count(),
            'results': serializer.data
        })

    @action(detail=False, methods=['get'], url_path='disponibles')
    def disponibles(self, request):
        """Retourne uniquement les livres disponibles."""
        livres = Livre.objects.filter(quantite_disponible__gt=0)
        serializer = LivreListSerializer(livres, many=True)
        return Response({'count': livres.count(), 'results': serializer.data})

    @action(detail=True, methods=['post'], url_path='reserver')
    def reserver(self, request, pk=None):
        """Diminue la quantité disponible lors d'un emprunt (appel interne)."""
        livre = self.get_object()
        if livre.quantite_disponible <= 0:
            return Response(
                {'error': 'Livre non disponible', 'disponible': False},
                status=status.HTTP_409_CONFLICT
            )
        livre.quantite_disponible -= 1
        livre.save()
        return Response({
            'message': 'Réservation effectuée',
            'disponible': True,
            'quantite_disponible': livre.quantite_disponible
        })

    @action(detail=True, methods=['post'], url_path='liberer')
    def liberer(self, request, pk=None):
        """Augmente la quantité disponible lors d'un retour (appel interne)."""
        livre = self.get_object()
        if livre.quantite_disponible < livre.quantite_totale:
            livre.quantite_disponible += 1
            livre.save()
        return Response({
            'message': 'Livre libéré',
            'quantite_disponible': livre.quantite_disponible
        })

    @action(detail=False, methods=['get'], url_path='stats')
    def stats(self, request):
        """Statistiques sur le catalogue."""
        total = Livre.objects.count()
        disponibles = Livre.objects.filter(quantite_disponible__gt=0).count()
        par_genre = {}
        for genre, _ in Livre.GENRE_CHOICES:
            par_genre[genre] = Livre.objects.filter(genre=genre).count()
        return Response({
            'total_livres': total,
            'livres_disponibles': disponibles,
            'livres_indisponibles': total - disponibles,
            'par_genre': par_genre
        })
