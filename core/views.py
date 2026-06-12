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
from .serializers import (LoginSerializer, UserSerializer,
                          CategorieSerializer, ProduitSerializer,
                          VenteSerializer, UserCreateSerializer)
from .models import Vente, Produit, User, Categorie, Prevision
import pandas as pd
from rest_framework import status
from .services.prevision import generer_prevision
from django.http import HttpResponse

from datetime import date
from .services.rapport import generer_rapport_pdf, generer_rapport_produit_pdf

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
    


from django.utils import timezone

class DashboardKPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role == 'commercial':
            ventes_qs = Vente.objects.filter(commercial=request.user)
        else:
            ventes_qs = Vente.objects.all()

        ca_total  = ventes_qs.aggregate(total=Sum('chiffre_affaires'))['total'] or 0
        nb_ventes = ventes_qs.count()

        if request.user.role == 'commercial':
            # Stats personnelles pour le commercial
            produit_favori = (
                ventes_qs.values('produit__nom')
                .annotate(ca=Sum('chiffre_affaires'))
                .order_by('-ca').first()
            )

            today = timezone.now().date()
            ventes_mois = ventes_qs.filter(
                date_vente__year=today.year,
                date_vente__month=today.month
            )
            ca_mois  = ventes_mois.aggregate(total=Sum('chiffre_affaires'))['total'] or 0
            nb_mois  = ventes_mois.count()

            return Response({
                'ca_total':         round(ca_total, 2),
                'nb_ventes':        nb_ventes,
                'produit_favori':   produit_favori['produit__nom'] if produit_favori else 'N/A',
                'ca_mois':          round(ca_mois, 2),
                'nb_ventes_mois':   nb_mois,
            })

        # Manager / Superadmin — stats globales
        meilleur_produit = (
            ventes_qs.values('produit__nom')
            .annotate(ca=Sum('chiffre_affaires'))
            .order_by('-ca').first()
        )
        meilleur_commercial = (
            Vente.objects.values('commercial__username')
            .annotate(ca=Sum('chiffre_affaires'))
            .order_by('-ca').first()
        )

        return Response({
            'ca_total':            round(ca_total, 2),
            'nb_ventes':           nb_ventes,
            'meilleur_produit':    meilleur_produit['produit__nom'] if meilleur_produit else 'N/A',
            'meilleur_commercial': meilleur_commercial['commercial__username'] if meilleur_commercial else 'N/A',
        })


class VentesParMoisView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role == 'commercial':
            qs = Vente.objects.filter(commercial=request.user)
        else:
            qs = Vente.objects.all()

        data = (qs.annotate(mois=TruncMonth('date_vente'))
                  .values('mois')
                  .annotate(ca=Sum('chiffre_affaires'), nb=Count('id'))
                  .order_by('mois'))

        return Response([{
            'mois': item['mois'].strftime('%b %Y'),
            'ca':   round(item['ca'], 2),
            'nb':   item['nb']
        } for item in data])


class VentesParProduitView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role == 'commercial':
            qs = Vente.objects.filter(commercial=request.user)
        else:
            qs = Vente.objects.all()

        data = (qs.values('produit__nom')
                  .annotate(ca=Sum('chiffre_affaires'))
                  .order_by('-ca')[:8])

        return Response([{
            'produit': item['produit__nom'],
            'ca':      round(item['ca'], 2)
        } for item in data])

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


# ─── CATEGORIES ───
class CategorieListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cats = Categorie.objects.all()
        return Response(CategorieSerializer(cats, many=True).data)

    def post(self, request):
        s = CategorieSerializer(data=request.data)
        if s.is_valid():
            s.save()
            return Response(s.data, status=201)
        return Response(s.errors, status=400)


# ─── PRODUITS ───
class ProduitListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        produits = Produit.objects.select_related('categorie').all()
        return Response(ProduitSerializer(produits, many=True).data)

    def post(self, request):
        s = ProduitSerializer(data=request.data)
        if s.is_valid():
            s.save()
            return Response(s.data, status=201)
        return Response(s.errors, status=400)


class ProduitDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return Produit.objects.get(pk=pk)
        except Produit.DoesNotExist:
            return None

    def get(self, request, pk):
        p = self.get_object(pk)
        if not p:
            return Response({'error': 'Produit non trouvé'}, status=404)
        return Response(ProduitSerializer(p).data)

    def put(self, request, pk):
        p = self.get_object(pk)
        if not p:
            return Response({'error': 'Produit non trouvé'}, status=404)
        s = ProduitSerializer(p, data=request.data, partial=True)
        if s.is_valid():
            s.save()
            return Response(s.data)
        return Response(s.errors, status=400)

    def delete(self, request, pk):
        p = self.get_object(pk)
        if not p:
            return Response({'error': 'Produit non trouvé'}, status=404)
        p.delete()
        return Response({'message': 'Produit supprimé'}, status=204)


# ─── VENTES ───
class VenteListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role == 'commercial':
            ventes = Vente.objects.filter(commercial=request.user).select_related('produit', 'commercial').order_by('-date_vente')
        else:
            ventes = Vente.objects.select_related('produit', 'commercial').all().order_by('-date_vente')
        return Response(VenteSerializer(ventes, many=True).data)

    def post(self, request):
        data = request.data.copy()
        # Le commercial est automatiquement assigné
        if request.user.role == 'commercial':
            data['commercial'] = request.user.id
        s = VenteSerializer(data=data)
        if s.is_valid():
            s.save()
            return Response(s.data, status=201)
        return Response(s.errors, status=400)


class VenteDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return Vente.objects.get(pk=pk)
        except Vente.DoesNotExist:
            return None

    def put(self, request, pk):
        v = self.get_object(pk)
        if not v:
            return Response({'error': 'Vente non trouvée'}, status=404)
        s = VenteSerializer(v, data=request.data, partial=True)
        if s.is_valid():
            s.save()
            return Response(s.data)
        return Response(s.errors, status=400)

    def delete(self, request, pk):
        v = self.get_object(pk)
        if not v:
            return Response({'error': 'Vente non trouvée'}, status=404)
        v.delete()
        return Response({'message': 'Vente supprimée'}, status=204)


# ─── IMPORT EXCEL/CSV ───
class ImportVentesView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        fichier = request.FILES.get('fichier')
        if not fichier:
            return Response({'error': 'Aucun fichier fourni'}, status=400)

        try:
            if fichier.name.endswith('.csv'):
                df = pd.read_csv(fichier)
            else:
                df = pd.read_excel(fichier)

            # Colonnes attendues : produit_id, quantite, chiffre_affaires, date_vente
            ventes_creees = 0
            for _, row in df.iterrows():
                try:
                    produit = Produit.objects.get(id=int(row['produit_id']))
                    Vente.objects.create(
                        produit=produit,
                        commercial=request.user,
                        quantite=int(row['quantite']),
                        chiffre_affaires=float(row['chiffre_affaires']),
                        date_vente=row['date_vente']
                    )
                    ventes_creees += 1
                except Exception:
                    continue

            return Response({
                'message': f'{ventes_creees} ventes importées avec succès !',
                'total': ventes_creees
            })
        except Exception as e:
            return Response({'error': str(e)}, status=400)     

class PrevisionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        produit_id = request.data.get('produit_id')
        mois_futur = int(request.data.get('mois_futur', 3))

        if not produit_id:
            return Response({'erreur': 'produit_id requis'}, status=400)

        try:
            produit = Produit.objects.get(id=produit_id)
        except Produit.DoesNotExist:
            return Response({'erreur': 'Produit non trouvé'}, status=404)

        resultat = generer_prevision(produit_id, mois_futur)

        if 'erreur' in resultat:
            return Response(resultat, status=400)

        # Sauvegarder la prévision en BDD
        from datetime import date, timedelta
        today = date.today()
        Prevision.objects.create(
            produit=produit,
            date_debut=today,
            date_fin=today + timedelta(days=30 * mois_futur),
            valeur_prevue=resultat['total_prevu'],
            score_r2=resultat['score_r2'],
        )

        return Response({
            **resultat,
            'produit_nom': produit.nom,
        })


class PrevisionHistoriqueView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        previsions = Prevision.objects.select_related('produit').all().order_by('-created_at')
        data = [
            {
                'id':           p.id,
                'produit_nom':  p.produit.nom,
                'date_debut':   p.date_debut,
                'date_fin':     p.date_fin,
                'valeur_prevue': p.valeur_prevue,
                'score_r2':     p.score_r2,
                'created_at':   p.created_at,
            }
            for p in previsions
        ]
        return Response(data)  

class UserListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Seul le superadmin voit tous les users
        if request.user.role != 'superadmin':
            return Response({'erreur': 'Accès refusé'}, status=403)
        users = User.objects.all().order_by('-date_joined')
        return Response(UserCreateSerializer(users, many=True).data)

    def post(self, request):
        if request.user.role != 'superadmin':
            return Response({'erreur': 'Accès refusé'}, status=403)
        s = UserCreateSerializer(data=request.data)
        if s.is_valid():
            s.save()
            return Response(s.data, status=201)
        return Response(s.errors, status=400)


class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return User.objects.get(pk=pk)
        except User.DoesNotExist:
            return None

    def put(self, request, pk):
        if request.user.role != 'superadmin':
            return Response({'erreur': 'Accès refusé'}, status=403)
        u = self.get_object(pk)
        if not u:
            return Response({'erreur': 'Utilisateur non trouvé'}, status=404)
        s = UserCreateSerializer(u, data=request.data, partial=True)
        if s.is_valid():
            s.save()
            return Response(s.data)
        return Response(s.errors, status=400)

    def delete(self, request, pk):
        if request.user.role != 'superadmin':
            return Response({'erreur': 'Accès refusé'}, status=403)
        u = self.get_object(pk)
        if not u:
            return Response({'erreur': 'Utilisateur non trouvé'}, status=404)
        if u.id == request.user.id:
            return Response({'erreur': 'Vous ne pouvez pas vous supprimer vous-même'}, status=400)
        u.delete()
        return Response({'message': 'Utilisateur supprimé'}, status=204)   

class ExportPDFView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        produit_id = request.query_params.get('produit_id')

        if produit_id:
            buffer = generer_rapport_produit_pdf(produit_id)
            filename = f"rapport_produit_{produit_id}_{date.today()}.pdf"
        else:
            buffer = generer_rapport_pdf()
            filename = f"rapport_global_{date.today()}.pdf"

        response = HttpResponse(buffer, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response
     
