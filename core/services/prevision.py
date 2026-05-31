# core/services/prevision.py
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import r2_score
from datetime import date, timedelta
from ..models import Vente


def generer_prevision(produit_id, mois_futur=3):
    """
    Génère une prévision de ventes pour un produit donné.
    - produit_id : ID du produit
    - mois_futur : nombre de mois à prévoir (1, 3, 6, 12)
    """

    # ── 1. Récupérer l'historique des ventes ──
    ventes = Vente.objects.filter(
        produit_id=produit_id
    ).values('date_vente', 'chiffre_affaires', 'quantite').order_by('date_vente')

    if len(ventes) < 3:
        return {
            'erreur': 'Pas assez de données historiques (minimum 3 ventes requises)'
        }

    # ── 2. Préparer le DataFrame ──
    df = pd.DataFrame(list(ventes))
    df['date_vente'] = pd.to_datetime(df['date_vente'])
    df['mois']       = df['date_vente'].dt.month
    df['annee']      = df['date_vente'].dt.year
    df['trimestre']  = df['date_vente'].dt.quarter
    df['jour_annee'] = df['date_vente'].dt.dayofyear
    df['index_temps'] = range(len(df))

    # ── 3. Features et Target ──
    features = ['index_temps', 'mois', 'trimestre', 'annee', 'jour_annee']
    X = df[features]
    y = df['chiffre_affaires']

    # ── 4. Entraîner le modèle Random Forest ──
    model = RandomForestRegressor(
        n_estimators=100,
        random_state=42,
        max_depth=5
    )
    model.fit(X, y)

    # ── 5. Score R² sur les données historiques ──
    y_pred_hist = model.predict(X)
    score_r2 = round(r2_score(y, y_pred_hist), 3)

    # ── 6. Générer les dates futures ──
    derniere_date = df['date_vente'].max()
    dates_futures = []
    for i in range(1, mois_futur + 1):
        # Ajouter environ 30 jours par mois
        nouvelle_date = derniere_date + timedelta(days=30 * i)
        dates_futures.append(nouvelle_date)

    # ── 7. Prédire pour les dates futures ──
    future_data = []
    for idx, d in enumerate(dates_futures):
        future_data.append({
            'index_temps': len(df) + idx,
            'mois':        d.month,
            'trimestre':   (d.month - 1) // 3 + 1,
            'annee':       d.year,
            'jour_annee':  d.timetuple().tm_yday,
        })

    df_future = pd.DataFrame(future_data)
    previsions = model.predict(df_future[features])

    # ── 8. Importance des features ──
    importances = dict(zip(features, model.feature_importances_.round(3)))

    # ── 9. Construire la réponse ──
    historique = [
        {
            'date':  row['date_vente'].strftime('%Y-%m-%d'),
            'ca':    round(float(row['chiffre_affaires']), 2),
            'type':  'historique'
        }
        for _, row in df.iterrows()
    ]

    predictions = [
        {
            'date':  d.strftime('%Y-%m-%d'),
            'ca':    round(float(max(0, p)), 2),
            'type':  'prevision'
        }
        for d, p in zip(dates_futures, previsions)
    ]

    return {
        'historique':   historique,
        'previsions':   predictions,
        'score_r2':     score_r2,
        'importances':  importances,
        'nb_ventes':    len(df),
        'mois_prevu':   mois_futur,
        'total_prevu':  round(float(sum(max(0, p) for p in previsions)), 2),
    }