# core/urls.py
from django.urls import path
from .views import (
    LoginView, LogoutView, MeView,
    DashboardKPIView, VentesParMoisView,
    VentesParProduitView, VentesParCategorieView,
    CategorieListView,
    ProduitListView, ProduitDetailView,
    VenteListView, VenteDetailView,
    ImportVentesView,
    PrevisionView, PrevisionHistoriqueView,
    UserListView, UserDetailView, ExportPDFView,
)

urlpatterns = [
    path('auth/login/',   LoginView.as_view(),  name='login'),
    path('auth/logout/',  LogoutView.as_view(), name='logout'),
    path('auth/me/',      MeView.as_view(),     name='me'),

    # Dashboard
    path('dashboard/kpis/',             DashboardKPIView.as_view()),
    path('dashboard/ventes-mois/',      VentesParMoisView.as_view()),
    path('dashboard/ventes-produit/',   VentesParProduitView.as_view()),
    path('dashboard/ventes-categorie/', VentesParCategorieView.as_view()),

    # Catégories
    path('categories/',         CategorieListView.as_view()),

    # Produits
    path('produits/',           ProduitListView.as_view()),
    path('produits/<int:pk>/',  ProduitDetailView.as_view()),

    # Ventes
    path('ventes/',             VenteListView.as_view()),
    path('ventes/<int:pk>/',    VenteDetailView.as_view()),
    path('ventes/import/',      ImportVentesView.as_view()),

    path('previsions/generer/',     PrevisionView.as_view()),
    path('previsions/historique/',  PrevisionHistoriqueView.as_view()),

    path('users/',          UserListView.as_view()),
    path('users/<int:pk>/', UserDetailView.as_view()),

    path('rapports/export-pdf/', ExportPDFView.as_view()),
]