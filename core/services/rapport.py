# core/services/rapport.py
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, HRFlowable
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from django.db.models import Sum, Count
from django.db.models.functions import TruncMonth
import io
from datetime import date
from ..models import Vente, Produit, Prevision


def generer_rapport_pdf(type_rapport='global', produit_id=None):
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=2*cm,
        leftMargin=2*cm,
        topMargin=2*cm,
        bottomMargin=2*cm
    )

    styles = getSampleStyleSheet()
    elements = []

    # ── Couleurs ──
    PRIMARY   = colors.HexColor('#4f46e5')
    SECONDARY = colors.HexColor('#7c3aed')
    LIGHT     = colors.HexColor('#f8f9fc')
    GREEN     = colors.HexColor('#16a34a')
    GRAY      = colors.HexColor('#94a3b8')

    # ── Styles personnalisés ──
    title_style = ParagraphStyle('title', fontSize=22, textColor=PRIMARY,
                                  spaceAfter=6, alignment=TA_CENTER, fontName='Helvetica-Bold')
    subtitle_style = ParagraphStyle('subtitle', fontSize=11, textColor=GRAY,
                                     spaceAfter=20, alignment=TA_CENTER)
    section_style = ParagraphStyle('section', fontSize=13, textColor=PRIMARY,
                                    spaceBefore=16, spaceAfter=8, fontName='Helvetica-Bold')
    normal_style = ParagraphStyle('normal', fontSize=10, textColor=colors.black, spaceAfter=6)

    # ── En-tête ──
    elements.append(Paragraph("📈 PréviVentes", title_style))
    elements.append(Paragraph("Rapport de Prévision des Ventes", subtitle_style))
    elements.append(Paragraph(f"Généré le : {date.today().strftime('%d/%m/%Y')}", 
                               ParagraphStyle('date', fontSize=9, textColor=GRAY, alignment=TA_RIGHT)))
    elements.append(HRFlowable(width="100%", thickness=2, color=PRIMARY, spaceAfter=20))

    # ── KPIs globaux ──
    ca_total  = Vente.objects.aggregate(total=Sum('chiffre_affaires'))['total'] or 0
    nb_ventes = Vente.objects.count()
    nb_produits = Produit.objects.count()

    meilleur = (Vente.objects.values('produit__nom')
                .annotate(ca=Sum('chiffre_affaires'))
                .order_by('-ca').first())

    elements.append(Paragraph("Résumé Global", section_style))

    kpi_data = [
        ['Indicateur', 'Valeur'],
        ['Chiffre d\'affaires total', f"{ca_total:,.2f} DH"],
        ['Nombre total de ventes',   str(nb_ventes)],
        ['Nombre de produits',       str(nb_produits)],
        ['Meilleur produit',         meilleur['produit__nom'] if meilleur else 'N/A'],
    ]

    kpi_table = Table(kpi_data, colWidths=[10*cm, 7*cm])
    kpi_table.setStyle(TableStyle([
        ('BACKGROUND',   (0, 0), (-1, 0),  PRIMARY),
        ('TEXTCOLOR',    (0, 0), (-1, 0),  colors.white),
        ('FONTNAME',     (0, 0), (-1, 0),  'Helvetica-Bold'),
        ('FONTSIZE',     (0, 0), (-1, 0),  11),
        ('ALIGN',        (0, 0), (-1, -1), 'LEFT'),
        ('FONTSIZE',     (0, 1), (-1, -1), 10),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, LIGHT]),
        ('GRID',         (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('TOPPADDING',   (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING',(0, 0), (-1, -1), 8),
        ('LEFTPADDING',  (0, 0), (-1, -1), 12),
        ('RIGHTPADDING', (0, 0), (-1, -1), 12),
        ('ROUNDEDCORNERS', [4]),
    ]))
    elements.append(kpi_table)
    elements.append(Spacer(1, 0.5*cm))

    # ── Top 5 produits ──
    elements.append(Paragraph("Top 5 Produits par Chiffre d'Affaires", section_style))

    top_produits = (Vente.objects.values('produit__nom')
                    .annotate(ca=Sum('chiffre_affaires'), nb=Count('id'))
                    .order_by('-ca')[:5])

    prod_data = [['#', 'Produit', 'Nb Ventes', 'CA (DH)']]
    for i, p in enumerate(top_produits, 1):
        prod_data.append([
            str(i),
            p['produit__nom'],
            str(p['nb']),
            f"{p['ca']:,.2f} DH"
        ])

    prod_table = Table(prod_data, colWidths=[1.5*cm, 8*cm, 3*cm, 5*cm])
    prod_table.setStyle(TableStyle([
        ('BACKGROUND',   (0, 0), (-1, 0),  SECONDARY),
        ('TEXTCOLOR',    (0, 0), (-1, 0),  colors.white),
        ('FONTNAME',     (0, 0), (-1, 0),  'Helvetica-Bold'),
        ('ALIGN',        (0, 0), (-1, -1), 'CENTER'),
        ('ALIGN',        (1, 1), (1, -1),  'LEFT'),
        ('FONTSIZE',     (0, 0), (-1, -1), 10),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, LIGHT]),
        ('GRID',         (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('TOPPADDING',   (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING',(0, 0), (-1, -1), 8),
    ]))
    elements.append(prod_table)
    elements.append(Spacer(1, 0.5*cm))

    # ── Ventes par mois ──
    elements.append(Paragraph("Évolution des Ventes par Mois", section_style))

    ventes_mois = (Vente.objects
                   .annotate(mois=TruncMonth('date_vente'))
                   .values('mois')
                   .annotate(ca=Sum('chiffre_affaires'), nb=Count('id'))
                   .order_by('mois'))

    mois_data = [['Mois', 'Nb Ventes', 'CA (DH)']]
    for v in ventes_mois:
        mois_data.append([
            v['mois'].strftime('%B %Y'),
            str(v['nb']),
            f"{v['ca']:,.2f} DH"
        ])

    mois_table = Table(mois_data, colWidths=[7*cm, 4*cm, 6.5*cm])
    mois_table.setStyle(TableStyle([
        ('BACKGROUND',   (0, 0), (-1, 0),  PRIMARY),
        ('TEXTCOLOR',    (0, 0), (-1, 0),  colors.white),
        ('FONTNAME',     (0, 0), (-1, 0),  'Helvetica-Bold'),
        ('ALIGN',        (0, 0), (-1, -1), 'CENTER'),
        ('FONTSIZE',     (0, 0), (-1, -1), 10),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, LIGHT]),
        ('GRID',         (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('TOPPADDING',   (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING',(0, 0), (-1, -1), 8),
    ]))
    elements.append(mois_table)
    elements.append(Spacer(1, 0.5*cm))

    # ── Prévisions générées ──
    previsions = Prevision.objects.select_related('produit').order_by('-created_at')[:5]
    if previsions:
        elements.append(Paragraph("Dernières Prévisions Générées", section_style))
        prev_data = [['Produit', 'Période', 'CA Prévu', 'Score R²']]
        for p in previsions:
            prev_data.append([
                p.produit.nom,
                f"{p.date_debut} → {p.date_fin}",
                f"{p.valeur_prevue:,.2f} DH",
                f"{(p.score_r2 * 100):.1f}%" if p.score_r2 else 'N/A'
            ])

        prev_table = Table(prev_data, colWidths=[5*cm, 5.5*cm, 4*cm, 3*cm])
        prev_table.setStyle(TableStyle([
            ('BACKGROUND',   (0, 0), (-1, 0),  GREEN),
            ('TEXTCOLOR',    (0, 0), (-1, 0),  colors.white),
            ('FONTNAME',     (0, 0), (-1, 0),  'Helvetica-Bold'),
            ('ALIGN',        (0, 0), (-1, -1), 'CENTER'),
            ('FONTSIZE',     (0, 0), (-1, -1), 10),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, LIGHT]),
            ('GRID',         (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
            ('TOPPADDING',   (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING',(0, 0), (-1, -1), 8),
        ]))
        elements.append(prev_table)

    # ── Pied de page ──
    elements.append(Spacer(1, 1*cm))
    elements.append(HRFlowable(width="100%", thickness=1, color=GRAY))
    elements.append(Paragraph(
        "PréviVentes — Application de Prévision des Ventes — Projet PFA 2025/2026",
        ParagraphStyle('footer', fontSize=8, textColor=GRAY, alignment=TA_CENTER, spaceBefore=8)
    ))

    doc.build(elements)
    buffer.seek(0)
    return buffer




def generer_rapport_produit_pdf(produit_id):
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=A4,
        rightMargin=2*cm, leftMargin=2*cm,
        topMargin=2*cm, bottomMargin=2*cm
    )

    styles = getSampleStyleSheet()
    elements = []

    PRIMARY   = colors.HexColor('#4f46e5')
    SECONDARY = colors.HexColor('#7c3aed')
    LIGHT     = colors.HexColor('#f8f9fc')
    GREEN     = colors.HexColor('#16a34a')
    GRAY      = colors.HexColor('#94a3b8')

    title_style = ParagraphStyle('title', fontSize=22, textColor=PRIMARY,
                                  spaceAfter=6, alignment=TA_CENTER, fontName='Helvetica-Bold')
    subtitle_style = ParagraphStyle('subtitle', fontSize=11, textColor=GRAY,
                                     spaceAfter=20, alignment=TA_CENTER)
    section_style = ParagraphStyle('section', fontSize=13, textColor=PRIMARY,
                                    spaceBefore=16, spaceAfter=8, fontName='Helvetica-Bold')

    try:
        produit = Produit.objects.get(id=produit_id)
    except Produit.DoesNotExist:
        produit = None

    # ── En-tête ──
    elements.append(Paragraph("📈 PréviVentes", title_style))
    elements.append(Paragraph(
        f"Rapport Produit — {produit.nom if produit else 'N/A'}",
        subtitle_style
    ))
    elements.append(Paragraph(f"Généré le : {date.today().strftime('%d/%m/%Y')}",
                               ParagraphStyle('date', fontSize=9, textColor=GRAY, alignment=TA_RIGHT)))
    elements.append(HRFlowable(width="100%", thickness=2, color=PRIMARY, spaceAfter=20))

    if not produit:
        elements.append(Paragraph("Produit non trouvé.", styles['Normal']))
        doc.build(elements)
        buffer.seek(0)
        return buffer

    # ── Infos produit ──
    elements.append(Paragraph("Informations Produit", section_style))
    ventes_produit = Vente.objects.filter(produit=produit)
    ca_total = ventes_produit.aggregate(total=Sum('chiffre_affaires'))['total'] or 0
    nb_ventes = ventes_produit.count()

    info_data = [
        ['Champ', 'Valeur'],
        ['Nom du produit',      produit.nom],
        ['Catégorie',           produit.categorie.nom if produit.categorie else 'N/A'],
        ['Prix unitaire',       f"{produit.prix:,.2f} DH"],
        ['CA total réalisé',    f"{ca_total:,.2f} DH"],
        ['Nombre de ventes',    str(nb_ventes)],
    ]
    info_table = Table(info_data, colWidths=[8*cm, 9*cm])
    info_table.setStyle(TableStyle([
        ('BACKGROUND',   (0, 0), (-1, 0),  PRIMARY),
        ('TEXTCOLOR',    (0, 0), (-1, 0),  colors.white),
        ('FONTNAME',     (0, 0), (-1, 0),  'Helvetica-Bold'),
        ('FONTSIZE',     (0, 0), (-1, -1), 10),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, LIGHT]),
        ('GRID',         (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('TOPPADDING',   (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING',(0, 0), (-1, -1), 8),
        ('LEFTPADDING',  (0, 0), (-1, -1), 12),
    ]))
    elements.append(info_table)
    elements.append(Spacer(1, 0.5*cm))

    # ── Historique des ventes (mensuel) ──
    elements.append(Paragraph("Historique des Ventes (par mois)", section_style))
    ventes_mois = (ventes_produit
                   .annotate(mois=TruncMonth('date_vente'))
                   .values('mois')
                   .annotate(ca=Sum('chiffre_affaires'), qte=Sum('quantite'))
                   .order_by('mois'))

    if ventes_mois:
        hist_data = [['Mois', 'Quantité vendue', 'CA Réalisé (DH)']]
        for v in ventes_mois:
            hist_data.append([
                v['mois'].strftime('%B %Y'),
                str(v['qte']),
                f"{v['ca']:,.2f} DH"
            ])
        hist_table = Table(hist_data, colWidths=[6*cm, 5.5*cm, 5.5*cm])
        hist_table.setStyle(TableStyle([
            ('BACKGROUND',   (0, 0), (-1, 0),  SECONDARY),
            ('TEXTCOLOR',    (0, 0), (-1, 0),  colors.white),
            ('FONTNAME',     (0, 0), (-1, 0),  'Helvetica-Bold'),
            ('ALIGN',        (0, 0), (-1, -1), 'CENTER'),
            ('FONTSIZE',     (0, 0), (-1, -1), 10),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, LIGHT]),
            ('GRID',         (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
            ('TOPPADDING',   (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING',(0, 0), (-1, -1), 8),
        ]))
        elements.append(hist_table)
    else:
        elements.append(Paragraph("Aucune vente enregistrée pour ce produit.", styles['Normal']))

    elements.append(Spacer(1, 0.5*cm))

    # ── Prévisions générées pour ce produit ──
    elements.append(Paragraph("Prévisions Générées pour ce Produit", section_style))
    previsions = Prevision.objects.filter(produit=produit).order_by('-created_at')

    if previsions:
        prev_data = [['Période', 'CA Prévu (DH)', 'Score R² (Fiabilité)']]
        for p in previsions:
            prev_data.append([
                f"{p.date_debut} → {p.date_fin}",
                f"{p.valeur_prevue:,.2f} DH",
                f"{(p.score_r2 * 100):.1f}%" if p.score_r2 else 'N/A'
            ])
        prev_table = Table(prev_data, colWidths=[6*cm, 5.5*cm, 5.5*cm])
        prev_table.setStyle(TableStyle([
            ('BACKGROUND',   (0, 0), (-1, 0),  GREEN),
            ('TEXTCOLOR',    (0, 0), (-1, 0),  colors.white),
            ('FONTNAME',     (0, 0), (-1, 0),  'Helvetica-Bold'),
            ('ALIGN',        (0, 0), (-1, -1), 'CENTER'),
            ('FONTSIZE',     (0, 0), (-1, -1), 10),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, LIGHT]),
            ('GRID',         (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
            ('TOPPADDING',   (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING',(0, 0), (-1, -1), 8),
        ]))
        elements.append(prev_table)

        # ── Analyse / Recommandation ──
        elements.append(Spacer(1, 0.4*cm))
        elements.append(Paragraph("Analyse", section_style))

        derniere_prevision = previsions.first()
        moyenne_mensuelle_reelle = ca_total / max(nb_ventes, 1) if nb_ventes else 0

        analyse_txt = (
            f"La dernière prévision générée estime un chiffre d'affaires de "
            f"<b>{derniere_prevision.valeur_prevue:,.2f} DH</b> pour la période "
            f"{derniere_prevision.date_debut} à {derniere_prevision.date_fin}, "
            f"avec un score de fiabilité (R²) de "
            f"<b>{(derniere_prevision.score_r2 * 100):.1f}%</b>. "
        )

        if derniere_prevision.score_r2 and derniere_prevision.score_r2 >= 0.8:
            analyse_txt += "Ce score élevé indique une prévision fiable, basée sur une tendance historique régulière."
        elif derniere_prevision.score_r2 and derniere_prevision.score_r2 >= 0.5:
            analyse_txt += "Ce score modéré suggère une prévision indicative, à confirmer avec plus de données."
        else:
            analyse_txt += "Ce score faible indique une fiabilité limitée — il est recommandé de collecter plus de données historiques."

        elements.append(Paragraph(analyse_txt, ParagraphStyle('analyse', fontSize=10, leading=16)))
    else:
        elements.append(Paragraph(
            "Aucune prévision n'a encore été générée pour ce produit. "
            "Rendez-vous dans le module Prévisions pour en générer une.",
            styles['Normal']
        ))

    # ── Pied de page ──
    elements.append(Spacer(1, 1*cm))
    elements.append(HRFlowable(width="100%", thickness=1, color=GRAY))
    elements.append(Paragraph(
        "PréviVentes — Application de Prévision des Ventes — Projet PFA 2025/2026",
        ParagraphStyle('footer', fontSize=8, textColor=GRAY, alignment=TA_CENTER, spaceBefore=8)
    ))

    doc.build(elements)
    buffer.seek(0)
    return buffer    