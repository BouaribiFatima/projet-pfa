# core/urls.py
from django.urls import path
from .views import (
    LoginView, LogoutView, MeView,
    DashboardKPIView, VentesParMoisView,
    VentesParProduitView, VentesParCategorieView
)

urlpatterns = [
    path('auth/login/',   LoginView.as_view(),  name='login'),
    path('auth/logout/',  LogoutView.as_view(), name='logout'),
    path('auth/me/',      MeView.as_view(),     name='me'),

    # Dashboard
    path('dashboard/kpis/',       DashboardKPIView.as_view(),       name='kpis'),
    path('dashboard/ventes-mois/', VentesParMoisView.as_view(),     name='ventes-mois'),
    path('dashboard/ventes-produit/', VentesParProduitView.as_view(), name='ventes-produit'),
    path('dashboard/ventes-categorie/', VentesParCategorieView.as_view(), name='ventes-categorie'),
]