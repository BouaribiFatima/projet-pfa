// src/pages/Rapports.jsx
import { useEffect, useState } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import {
  Download, FileText, Package, BarChart3, PieChart,
  LineChart, TrendingUp, CheckCircle, Database
} from 'lucide-react';

const money = (v) => {
  if (v === null || v === undefined) return '—';
  return `${Number(v).toLocaleString()} DH`;
};

export default function Rapports() {
  const [kpis, setKpis] = useState(null);
  const [produits, setProduits] = useState([]);
  const [produitId, setProduitId] = useState('');
  const [loading, setLoading] = useState(true);
  const [expGlobal, setExpGlobal] = useState(false);
  const [expProduit, setExpProduit] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('dashboard/kpis/'),
      api.get('produits/')
    ]).then(([k, p]) => {
      setKpis(k.data);
      setProduits(p.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const downloadPDF = async (url, filename, setExporting) => {
    setExporting(true);
    try {
      const res = await api.get(url, { responseType: 'blob' });
      const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      alert("Erreur lors de l'export PDF");
    } finally {
      setExporting(false);
    }
  };

  return (
    <Layout>
      <div style={styles.page}>
        <div style={styles.hero}>
          <div>
            <div style={styles.badge}>
              <FileText size={15} />
              Centre des rapports
            </div>
            <h1 style={styles.title}>Rapports & exports PDF</h1>
            <p style={styles.subtitle}>
              Générez des rapports professionnels contenant les KPIs, tableaux, graphiques, charts et prévisions.
            </p>
          </div>
        </div>

   <div style={styles.kpiGrid}>
  <KpiCard
    icon={FileText}
    label="Rapport complet"
    value="Global"
    color="#1A5276"
    bg="#D6EAF8"
  />

  <KpiCard
    icon={Package}
    label="Analyse détaillée"
    value="Par produit"
    color="#C1440E"
    bg="#F5E8E3"
  />

  <KpiCard
    icon={BarChart3}
    label="Visualisations incluses"
    value="Graphiques"
    color="#1E6B40"
    bg="#D5F5E3"
  />

  <KpiCard
    icon={Download}
    label="Format disponible"
    value="PDF"
    color="#B7860B"
    bg="#FEF9E7"
  />
</div>
        <div style={styles.reportGrid}>
          <ReportCard
            icon={FileText}
            title="Rapport global des ventes"
            description="Rapport complet contenant les indicateurs globaux, les tableaux de ventes, les graphiques d’évolution, la répartition par produit/catégorie et les prévisions récentes."
            tags={['KPIs', 'Tableaux', 'Charts', 'Prévisions']}
            details={[
              'Chiffre d’affaires total',
              'Nombre total de ventes',
              'Meilleur produit et meilleur commercial',
              'Graphique d’évolution mensuelle',
              'Graphiques de répartition par produit et catégorie',
              'Synthèse des prévisions'
            ]}
            buttonLabel={expGlobal ? 'Génération...' : 'Télécharger PDF global'}
            disabled={expGlobal}
            onClick={() =>
              downloadPDF(
                'rapports/export-pdf/',
                `rapport_global_${new Date().toISOString().slice(0, 10)}.pdf`,
                setExpGlobal
              )
            }
          />

          <ReportCard
            icon={Package}
            title="Rapport détaillé par produit"
            description="Analyse précise d’un produit avec historique des ventes, évolution graphique, prévisions générées et score de fiabilité du modèle."
            tags={['Produit', 'Historique', 'Graphes', 'Score R²']}
            details={[
              'Historique des ventes du produit',
              'Courbe historique vs prévision',
              'Chiffre d’affaires prévu',
              'Score de précision R²',
              'Détails mensuels des prévisions',
              'Visualisation graphique intégrée'
            ]}
            extra={
              <select
                style={styles.select}
                value={produitId}
                onChange={(e) => setProduitId(e.target.value)}
              >
                <option value="">Choisir un produit</option>
                {produits.map(p => (
                  <option key={p.id} value={p.id}>{p.nom}</option>
                ))}
              </select>
            }
            buttonLabel={expProduit ? 'Génération...' : 'Télécharger PDF produit'}
            disabled={expProduit}
            onClick={() => {
              if (!produitId) {
                alert('Choisissez un produit.');
                return;
              }
              downloadPDF(
                `rapports/export-pdf/?produit_id=${produitId}`,
                `rapport_produit_${produitId}_${new Date().toISOString().slice(0, 10)}.pdf`,
                setExpProduit
              );
            }}
          />
        </div>

        {!loading && kpis && (
          <div style={styles.previewCard}>
            <div style={styles.previewHeader}>
              <div>
                <h2 style={styles.sectionTitle}>Aperçu rapide des données</h2>
                <p style={styles.sectionSub}>
                  Ces indicateurs seront utilisés dans les rapports PDF.
                </p>
              </div>
            </div>

            <div style={styles.previewGrid}>
              <PreviewItem label="CA total" value={money(kpis.ca_total)} />
              <PreviewItem label="Nombre de ventes" value={kpis.nb_ventes ?? '—'} />
              <PreviewItem label="Meilleur produit" value={kpis.meilleur_produit ?? '—'} />
              <PreviewItem label="Meilleur commercial" value={kpis.meilleur_commercial ?? '—'} />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

function KpiCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div style={styles.kpiCard}>
      <div style={{ ...styles.kpiIcon, background: bg, color }}>
        <Icon size={19} />
      </div>
      <div style={styles.kpiValue}>{value}</div>
      <div style={styles.kpiLabel}>{label}</div>
    </div>
  );
}

function ReportCard({ icon: Icon, title, description, tags, details, extra, buttonLabel, onClick, disabled }) {
  return (
    <div style={styles.reportCard}>
      <div style={styles.reportTop}>
        <div style={styles.reportIcon}>
          <Icon size={25} />
        </div>
        <div>
          <h2 style={styles.reportTitle}>{title}</h2>
          <p style={styles.reportDesc}>{description}</p>
        </div>
      </div>

      <div style={styles.tags}>
        {tags.map(tag => (
          <span key={tag} style={styles.tag}>{tag}</span>
        ))}
      </div>

      <div style={styles.detailsBox}>
        {details.map(item => (
          <div key={item} style={styles.detailLine}>
            <CheckCircle size={15} />
            {item}
          </div>
        ))}
      </div>

      {extra && <div style={styles.extra}>{extra}</div>}

      <button style={styles.downloadBtn} onClick={onClick} disabled={disabled}>
        <Download size={17} />
        {buttonLabel}
      </button>
    </div>
  );
}

function PreviewItem({ label, value }) {
  return (
    <div style={styles.previewItem}>
      <div style={styles.previewLabel}>{label}</div>
      <div style={styles.previewValue}>{value}</div>
    </div>
  );
}

const styles = {
  page: {
    padding: 22,
    background: '#F4F0E8',
    minHeight: '100vh',
  },
  hero: {
    background: 'linear-gradient(135deg, #1A5276, #123A55)',
    color: '#FFFFFF',
    borderRadius: 18,
    padding: 24,
    marginBottom: 18,
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 7,
    padding: '6px 11px',
    borderRadius: 999,
    background: 'rgba(255,255,255,0.12)',
    fontSize: 12,
    fontWeight: 800,
    marginBottom: 10,
  },
  title: {
    margin: 0,
    fontSize: 28,
    fontWeight: 900,
  },
  subtitle: {
    margin: '7px 0 0',
    color: 'rgba(255,255,255,0.72)',
    fontSize: 14,
    maxWidth: 760,
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 14,
    marginBottom: 18,
  },
  kpiCard: {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: 16,
    padding: 16,
  },
  kpiIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  kpiValue: {
    fontSize: 21,
    fontWeight: 900,
    color: '#0F172A',
  },
  kpiLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 3,
  },
  reportGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 18,
    marginBottom: 18,
  },
  reportCard: {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: 18,
    padding: 20,
  },
  reportTop: {
    display: 'flex',
    gap: 14,
    alignItems: 'flex-start',
  },
  reportIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    background: '#F5E8E3',
    color: '#C1440E',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  reportTitle: {
    margin: 0,
    fontSize: 19,
    fontWeight: 900,
    color: '#0F172A',
  },
  reportDesc: {
    margin: '7px 0 0',
    color: '#64748B',
    fontSize: 13,
    lineHeight: 1.55,
  },
  tags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  tag: {
    padding: '6px 10px',
    borderRadius: 999,
    background: '#D6EAF8',
    color: '#1A5276',
    fontSize: 12,
    fontWeight: 800,
  },
  detailsBox: {
    marginTop: 16,
    padding: 14,
    borderRadius: 14,
    background: '#F8FAFC',
    border: '1px solid #E2E8F0',
  },
  detailLine: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    color: '#334155',
    fontSize: 13,
    marginBottom: 9,
  },
  extra: {
    marginTop: 16,
  },
  select: {
    width: '100%',
    height: 45,
    border: '1px solid #CBD5E1',
    borderRadius: 12,
    padding: '0 13px',
    fontSize: 14,
    outline: 'none',
    background: '#FFFFFF',
  },
  downloadBtn: {
    width: '100%',
    marginTop: 18,
    height: 47,
    border: 'none',
    borderRadius: 13,
    background: '#C1440E',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    fontWeight: 900,
    cursor: 'pointer',
    boxShadow: '0 12px 25px rgba(193,68,14,0.22)',
  },
  previewCard: {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: 18,
    padding: 20,
  },
  previewHeader: {
    marginBottom: 15,
  },
  sectionTitle: {
    margin: 0,
    fontSize: 18,
    fontWeight: 900,
    color: '#0F172A',
  },
  sectionSub: {
    margin: '4px 0 0',
    color: '#64748B',
    fontSize: 13,
  },
  previewGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 12,
  },
  previewItem: {
    background: '#F8FAFC',
    border: '1px solid #E2E8F0',
    borderRadius: 14,
    padding: 14,
  },
  previewLabel: {
    color: '#64748B',
    fontSize: 12,
    marginBottom: 6,
  },
  previewValue: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: 900,
  },
};