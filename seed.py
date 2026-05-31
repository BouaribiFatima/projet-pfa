# seed.py
import os
import django
import random
from datetime import date, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from core.models import User, Categorie, Produit, Vente

# Catégories
cats = ['Électronique', 'Vêtements', 'Alimentation', 'Mobilier']
categories = [Categorie.objects.get_or_create(nom=c)[0] for c in cats]

# Produits
produits_data = [
    ('Laptop HP', 8500, 0), ('iPhone 15', 12000, 0),
    ('T-shirt Nike', 250, 1), ('Jean Levi\'s', 600, 1),
    ('Café Arabica', 120, 2), ('Chocolat Lindt', 80, 2),
    ('Chaise Bureau', 1500, 3), ('Bureau Standing', 3200, 3),
]
produits = []
for nom, prix, cat_idx in produits_data:
    p, _ = Produit.objects.get_or_create(nom=nom, defaults={
        'prix': prix, 'categorie': categories[cat_idx]
    })
    produits.append(p)

# Commercial
commercial, _ = User.objects.get_or_create(
    username='commercial1',
    defaults={'role': 'commercial', 'email': 'commercial1@test.com'}
)
commercial.set_password('password123')
commercial.save()

# Ventes sur 12 mois
start = date.today() - timedelta(days=365)
for i in range(200):
    produit = random.choice(produits)
    qte = random.randint(1, 20)
    Vente.objects.create(
        produit=produit,
        commercial=commercial,
        quantite=qte,
        chiffre_affaires=round(produit.prix * qte * random.uniform(0.9, 1.1), 2),
        date_vente=start + timedelta(days=random.randint(0, 365))
    )

print("✅ Données de test créées avec succès !")