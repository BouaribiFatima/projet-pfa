# core/serializers.py
from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User
from .models import Categorie, Produit, Vente

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(username=data['username'], password=data['password'])
        if not user:
            raise serializers.ValidationError("Identifiants incorrects.")
        if not user.is_active:
            raise serializers.ValidationError("Compte désactivé.")
        data['user'] = user
        return data


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role']



class CategorieSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categorie
        fields = ['id', 'nom']


class ProduitSerializer(serializers.ModelSerializer):
    categorie_nom = serializers.CharField(source='categorie.nom', read_only=True)
    
    class Meta:
        model = Produit
        fields = ['id', 'nom', 'prix', 'categorie', 'categorie_nom', 'created_at']


class VenteSerializer(serializers.ModelSerializer):
    produit_nom = serializers.CharField(source='produit.nom', read_only=True)
    commercial_nom = serializers.CharField(source='commercial.username', read_only=True)

    class Meta:
        model = Vente
        fields = ['id', 'produit', 'produit_nom', 'commercial', 
                  'commercial_nom', 'quantite', 'chiffre_affaires', 'date_vente']        

