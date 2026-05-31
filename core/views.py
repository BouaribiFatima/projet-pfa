# core/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import LoginSerializer, UserSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import Sum, Count, Max
from django.db.models.functions import TruncMonth
from .models import Vente, Produit, User
from .serializers import LoginSerializer, UserSerializer

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)

        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data
        })


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data['refresh']
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'message': 'Déconnexion réussie.'})
        except Exception:
            return Response({'error': 'Token invalide.'}, status=400)


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)
    


class DashboardKPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Chiffre d'affaires total
        ca_total = Vente.objects.aggregate(total=Sum('chiffre_affaires'))['total'] or 0

        # Nombre total de ventes
        nb_ventes = Vente.objects.count()

        # Meilleur produit (par CA)
        meilleur_produit = (
            Vente.objects
            .values('produit__nom')
            .annotate(ca=Sum('chiffre_affaires'))
            .order_by('-ca')
            .first()
        )

        # Meilleur commercial (par CA)
        meilleur_commercial = (
            Vente.objects
            .values('commercial__username')
            .annotate(ca=Sum('chiffre_affaires'))
            .order_by('-ca')
            .first()
        )

        return Response({
            'ca_total': round(ca_total, 2),
            'nb_ventes': nb_ventes,
            'meilleur_produit': meilleur_produit['produit__nom'] if meilleur_produit else 'N/A',
            'meilleur_commercial': meilleur_commercial['commercial__username'] if meilleur_commercial else 'N/A',
        })


class VentesParMoisView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        data = (
            Vente.objects
            .annotate(mois=TruncMonth('date_vente'))
            .values('mois')
            .annotate(ca=Sum('chiffre_affaires'), nb=Count('id'))
            .order_by('mois')
        )
        return Response([
            {
                'mois': item['mois'].strftime('%b %Y'),
                'ca': round(item['ca'], 2),
                'nb': item['nb']
            }
            for item in data
        ])


class VentesParProduitView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        data = (
            Vente.objects
            .values('produit__nom')
            .annotate(ca=Sum('chiffre_affaires'))
            .order_by('-ca')[:8]
        )
        return Response([
            {'produit': item['produit__nom'], 'ca': round(item['ca'], 2)}
            for item in data
        ])


class VentesParCategorieView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        data = (
            Vente.objects
            .values('produit__categorie__nom')
            .annotate(ca=Sum('chiffre_affaires'))
            .order_by('-ca')
        )
        return Response([
            {'categorie': item['produit__categorie__nom'] or 'Sans catégorie',
             'ca': round(item['ca'], 2)}
            for item in data
        ])    