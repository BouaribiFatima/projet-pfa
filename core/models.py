# core/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLES = [
        ('superadmin', 'Super Admin'),
        ('manager', 'Manager'),
        ('commercial', 'Commercial'),
    ]
    role = models.CharField(max_length=20, choices=ROLES, default='commercial')

    def __str__(self):
        return f"{self.username} ({self.role})"


class Categorie(models.Model):
    nom = models.CharField(max_length=100)

    def __str__(self):
        return self.nom


class Produit(models.Model):
    nom = models.CharField(max_length=200)
    categorie = models.ForeignKey(Categorie, on_delete=models.SET_NULL, null=True)
    prix = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nom


class Vente(models.Model):
    produit = models.ForeignKey(Produit, on_delete=models.CASCADE)
    commercial = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    quantite = models.IntegerField()
    chiffre_affaires = models.FloatField()
    date_vente = models.DateField()

    def __str__(self):
        return f"{self.produit} - {self.date_vente}"


class Prevision(models.Model):
    produit = models.ForeignKey(Produit, on_delete=models.CASCADE)
    date_debut = models.DateField()
    date_fin = models.DateField()
    valeur_prevue = models.FloatField()
    score_r2 = models.FloatField(null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Prévision {self.produit} - {self.date_debut}"