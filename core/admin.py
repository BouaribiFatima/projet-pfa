# core/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Categorie, Produit, Vente, Prevision

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ['username', 'email', 'role', 'is_active']
    fieldsets = UserAdmin.fieldsets + (
        ('Rôle', {'fields': ('role',)}),
    )

admin.site.register(Categorie)
admin.site.register(Produit)
admin.site.register(Vente)
admin.site.register(Prevision)