import csv
import os
import requests
from datetime import date
from django.http import HttpResponse
from django.conf import settings
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Emprunt
from .serializers import EmpruntSerializer, EmpruntCreateSerializer, RetourSerializer


def appel_service(url, method='get', **kwargs):
    """Utilitaire pour appeler les autres microservices."""
    try:
        resp = getattr(requests, method)(url, timeout=5, **kwargs)
        return resp.json(), resp.status_code
    except requests.exceptions.ConnectionError:
        return {'error': f'Service indisponible: {url}'}, 503
    except Exception as e:
        return {'error': str(e)}, 500


class EmpruntViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour la gestion des emprunts.
    Endpoints :
      GET  /api/emprunts/               - Historique complet
      POST /api/emprunts/emprunter/     - Emprunter un livre
      POST /api/emprunts/{id}/retourner/ - Retourner un livre
      GET  /api/emprunts/en_retard/     - Liste des retards
      GET  /api/emprunts/historique_utilisateur/ - Historique par user
      GET  /api/emprunts/export_csv/    - Export pour ML
      GET  /api/emprunts/stats/         - Statistiques
    """
    queryset = Emprunt.objects.all()
    serializer_class = EmpruntSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['statut', 'utilisateur_id', 'livre_id']

    @action(detail=False, methods=['post'], url_path='emprunter')
    def emprunter(self, request):
        """Enregistre un nouvel emprunt avec vérifications inter-services."""
        serializer = EmpruntCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user_id = serializer.validated_data['utilisateur_id']
        livre_id = serializer.validated_data['livre_id']

        # 1. Vérifier que l'utilisateur existe
        user_data, user_status = appel_service(
            f"{settings.USERS_SERVICE_URL}/api/utilisateurs/{user_id}/"
        )
        if user_status != 200:
            return Response(
                {'error': f'Utilisateur {user_id} introuvable'},
                status=status.HTTP_404_NOT_FOUND
            )
        if not user_data.get('actif', True):
            return Response(
                {'error': 'Ce compte utilisateur est désactivé.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # 2. Vérifier la limite d'emprunts
        emprunts_en_cours = Emprunt.objects.filter(
            utilisateur_id=user_id, statut='en_cours'
        ).count()
        max_emprunts = user_data.get('max_emprunts', 3)
        if emprunts_en_cours >= max_emprunts:
            return Response(
                {'error': f'Limite d\'emprunts atteinte ({max_emprunts} maximum).'},
                status=status.HTTP_409_CONFLICT
            )

        # 3. Réserver le livre (diminue quantité disponible)
        livre_data, livre_status = appel_service(
            f"{settings.LIVRES_SERVICE_URL}/api/livres/{livre_id}/reserver/",
            method='post'
        )
        if livre_status == 409:
            return Response(
                {'error': 'Ce livre n\'est pas disponible en ce moment.'},
                status=status.HTTP_409_CONFLICT
            )
        if livre_status != 200:
            return Response(
                {'error': f'Livre {livre_id} introuvable'},
                status=status.HTTP_404_NOT_FOUND
            )

        # 4. Créer l'emprunt
        emprunt = Emprunt.objects.create(**serializer.validated_data)
        return Response(
            EmpruntSerializer(emprunt).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['post'], url_path='retourner')
    def retourner(self, request, pk=None):
        """Enregistre le retour d'un livre."""
        emprunt = self.get_object()
        if emprunt.statut == 'retourne':
            return Response(
                {'error': 'Ce livre a déjà été retourné.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        emprunt.statut = 'retourne'
        emprunt.date_retour_reelle = date.today()
        notes = request.data.get('notes', '')
        if notes:
            emprunt.notes = notes
        emprunt.save()

        # Libérer le livre (augmente quantité disponible)
        appel_service(
            f"{settings.LIVRES_SERVICE_URL}/api/livres/{emprunt.livre_id}/liberer/",
            method='post'
        )

        return Response({
            'message': 'Retour enregistré avec succès.',
            'emprunt': EmpruntSerializer(emprunt).data
        })

    @action(detail=False, methods=['get'], url_path='en_retard')
    def en_retard(self, request):
        """Retourne la liste des emprunts en retard."""
        today = date.today()
        emprunts = Emprunt.objects.filter(
            statut='en_cours',
            date_retour_prevue__lt=today
        )
        # Mettre à jour le statut
        emprunts.update(statut='en_retard')
        serializer = EmpruntSerializer(emprunts, many=True)
        return Response({
            'count': emprunts.count(),
            'emprunts_en_retard': serializer.data
        })

    @action(detail=False, methods=['get'], url_path='historique_utilisateur')
    def historique_utilisateur(self, request):
        """Retourne l'historique d'un utilisateur spécifique."""
        user_id = request.query_params.get('user_id')
        if not user_id:
            return Response(
                {'error': 'Paramètre user_id requis.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        emprunts = Emprunt.objects.filter(utilisateur_id=user_id)
        serializer = EmpruntSerializer(emprunts, many=True)
        return Response({
            'utilisateur_id': user_id,
            'count': emprunts.count(),
            'emprunts': serializer.data
        })

    @action(detail=False, methods=['get'], url_path='export_csv')
    def export_csv(self, request):
        """
        Exporte l'historique des emprunts en CSV pour le pipeline ML (DVC).
        Colonnes : user_id, livre_id, date_emprunt, date_retour, statut, rating
        """
        emprunts = Emprunt.objects.all()

        # Export vers fichier pour DVC
        export_path = '/app/exports/loans.csv'
        os.makedirs(os.path.dirname(export_path), exist_ok=True)

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="loans.csv"'

        writer = csv.writer(response)
        writer.writerow(['user_id', 'livre_id', 'date_emprunt', 'date_retour_prevue',
                         'date_retour_reelle', 'statut', 'jours_retard', 'rating'])

        for e in emprunts:
            # Rating implicite : 5 si retour à temps, 3 si léger retard, 1 si très en retard
            retard = e.jours_retard
            rating = 5 if retard == 0 else (3 if retard <= 7 else 1)
            writer.writerow([
                e.utilisateur_id, e.livre_id,
                e.date_emprunt.date(), e.date_retour_prevue,
                e.date_retour_reelle or '', e.statut,
                retard, rating
            ])

        # Sauvegarde aussi en fichier
        with open(export_path, 'w', newline='') as f:
            file_writer = csv.writer(f)
            file_writer.writerow(['user_id', 'livre_id', 'date_emprunt', 'date_retour_prevue',
                                   'date_retour_reelle', 'statut', 'jours_retard', 'rating'])
            for e in emprunts:
                retard = e.jours_retard
                rating = 5 if retard == 0 else (3 if retard <= 7 else 1)
                file_writer.writerow([
                    e.utilisateur_id, e.livre_id,
                    e.date_emprunt.date(), e.date_retour_prevue,
                    e.date_retour_reelle or '', e.statut,
                    retard, rating
                ])

        return response

    @action(detail=False, methods=['get'], url_path='stats')
    def stats(self, request):
        """Statistiques globales des emprunts."""
        today = date.today()
        return Response({
            'total_emprunts': Emprunt.objects.count(),
            'en_cours': Emprunt.objects.filter(statut='en_cours').count(),
            'retournes': Emprunt.objects.filter(statut='retourne').count(),
            'en_retard': Emprunt.objects.filter(
                statut='en_cours', date_retour_prevue__lt=today
            ).count(),
        })
