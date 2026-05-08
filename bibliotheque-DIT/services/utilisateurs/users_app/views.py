from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Utilisateur
from .serializers import UtilisateurSerializer, UtilisateurListSerializer


class UtilisateurViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour la gestion des utilisateurs.
    Endpoints :
      GET    /api/utilisateurs/           - Liste tous les utilisateurs
      POST   /api/utilisateurs/           - Créer un utilisateur
      GET    /api/utilisateurs/{id}/      - Profil d'un utilisateur
      PUT    /api/utilisateurs/{id}/      - Modifier un utilisateur
      DELETE /api/utilisateurs/{id}/      - Désactiver un utilisateur
      GET    /api/utilisateurs/par_type/  - Filtrer par type
      GET    /api/utilisateurs/{id}/profil_complet/ - Profil détaillé
      POST   /api/utilisateurs/{id}/activer/  - Activer un compte
      POST   /api/utilisateurs/{id}/desactiver/ - Désactiver un compte
    """
    queryset = Utilisateur.objects.filter(actif=True)
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['type_utilisateur', 'actif']
    search_fields = ['nom', 'prenom', 'email', 'numero_etudiant']
    ordering_fields = ['nom', 'date_inscription']
    ordering = ['nom']

    def get_serializer_class(self):
        if self.action == 'list':
            return UtilisateurListSerializer
        return UtilisateurSerializer

    def get_queryset(self):
        # Retourner tous si on demande explicitement
        inclure_inactifs = self.request.query_params.get('inclure_inactifs', 'false')
        if inclure_inactifs.lower() == 'true':
            return Utilisateur.objects.all()
        return Utilisateur.objects.filter(actif=True)

    @action(detail=False, methods=['get'], url_path='par_type')
    def par_type(self, request):
        """Retourne les utilisateurs groupés par type."""
        result = {}
        for type_val, type_label in Utilisateur.TYPE_CHOICES:
            users = Utilisateur.objects.filter(type_utilisateur=type_val, actif=True)
            result[type_val] = {
                'label': type_label,
                'count': users.count(),
                'utilisateurs': UtilisateurListSerializer(users, many=True).data
            }
        return Response(result)

    @action(detail=True, methods=['get'], url_path='profil_complet')
    def profil_complet(self, request, pk=None):
        """Retourne le profil complet d'un utilisateur."""
        utilisateur = self.get_object()
        serializer = UtilisateurSerializer(utilisateur)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='activer')
    def activer(self, request, pk=None):
        """Active un compte utilisateur."""
        utilisateur = self.get_object()
        utilisateur.actif = True
        utilisateur.save()
        return Response({'message': f'Compte de {utilisateur.nom_complet} activé.'})

    @action(detail=True, methods=['post'], url_path='desactiver')
    def desactiver(self, request, pk=None):
        """Désactive un compte utilisateur."""
        utilisateur = self.get_object()
        utilisateur.actif = False
        utilisateur.save()
        return Response({'message': f'Compte de {utilisateur.nom_complet} désactivé.'})

    @action(detail=False, methods=['get'], url_path='stats')
    def stats(self, request):
        """Statistiques sur les utilisateurs."""
        return Response({
            'total': Utilisateur.objects.count(),
            'actifs': Utilisateur.objects.filter(actif=True).count(),
            'etudiants': Utilisateur.objects.filter(type_utilisateur='etudiant', actif=True).count(),
            'professeurs': Utilisateur.objects.filter(type_utilisateur='professeur', actif=True).count(),
            'personnels': Utilisateur.objects.filter(type_utilisateur='personnel', actif=True).count(),
        })
