// src/pages/Previsions.jsx
import { useEffect, useState } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import {
  Brain, Play, Download, TrendingUp, Package,
  BarChart3, History, ArrowUp, ArrowDown, Target
} from 'lucide-react';

const money = (v) => {
  if (v === null || v === undefined) return '—';
  return `${Number(v).toLocaleString()} DH`;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div style={styles.tooltip}>
      <div style={styles.tooltipLabel}>{label?.slice(0, 7)}</div>
      {payload.map((p, i) => p.value !== null && (
        <div key={i} style={{ color: p.color, fontWeight: 800 }}>
          {p.name === 'historique' ? 'Historique' : 'Prévision'} : {money(p.value)}
        </div>
      ))}
    </div>
  );
};

export default function Previsions() {
  const [produits, setProduits] = useState([]);
  const [produitId, setProduitId] = useState('');
  const [moisFutur, setMoisFutur] = useState(3);
  const [resultat, setResultat] = useState(null);
  const [historique, setHistorique] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingHist, setLoadingHist] = useState(true);
  const [exportingPDF, setExportingPDF] = useState(false);

  useEffect(() => {
    api.get('produits/').then(r => setProduits(r.data));
    fetchHistorique();
  }, []);

  const fetchHistorique = async () => {
    setLoadingHist(true);
    try {
      const r = await api.get('previsions/historique/');
      setHistorique(r.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingHist(false);
    }
  };

  const handleGenerer = async () => {
    if (!produitId) {
      alert('Choisissez un produit.');
      return;
    }

    setLoading(true);
    setResultat(null);

    try {
      const r = await api.post('previsions/generer/', {
        produit_id: produitId,
        mois_futur: moisFutur,
      });

      setResultat(r.data);
      fetchHistorique();
    } catch (e) {
      alert(e.response?.data?.erreur || 'Erreur lors de la prévision.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!produitId) return;

    setExportingPDF(true);

    try {
      const res = await api.get(`rapports/export-pdf/?produit_id=${produitId}`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.setAttribute(
        'download',
        `rapport_prevision_produit_${produitId}_${new Date().toISOString().slice(0, 10)}.pdf`
      );
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch {
      alert("Erreur lors de l'export PDF.");
    } finally {
      setExportingPDF(false);
    }
  };

  const firstPrevDate = resultat?.previsions?.[0]?.date;

  const graphData = resultat ? [
    ...resultat.historique.map(h => ({
      date: h.date,
      historique: h.ca,
      prevision: null,
    })),
    ...resultat.previsions.map(p => ({
      date: p.date,
      historique: null,
      prevision: p.ca,
    })),
  ] : [];

  const score = resultat?.score_r2 || 0;
  const scorePct = Math.round(score * 100);
  const scoreColor = score >= 0.8 ? '#1E6B40' : score >= 0.5 ? '#B7860B' : '#DC2626';
  const scoreLabel = score >= 0.8 ? 'Excellent' : score >= 0.5 ? 'Acceptable' : 'Faible';

  return (
    <Layout>
      <div style={styles.page}>
        <div style={styles.hero}>
          <div>
            <div style={styles.badge}>
              <Brain size={15} />
              Intelligence prédictive
            </div>
            <h1 style={styles.title}>Prévisions des ventes</h1>
            <p style={styles.subtitle}>
              Générez des prévisions du chiffre d’affaires par produit grâce au modèle Random Forest.
            </p>
          </div>
        </div>

        <div style={styles.configCard}>
          <div style={styles.configHeader}>
            <div>
              <h2 style={styles.sectionTitle}>Paramètres de simulation</h2>
              <p style={styles.sectionSub}>
                Sélectionnez un produit et l’horizon de prévision souhaité.
              </p>
            </div>
          </div>

          <div style={styles.configGrid}>
            <div>
              <label style={styles.label}>Produit à analyser</label>
              <select
                style={styles.input}
                value={produitId}
                onChange={(e) => setProduitId(e.target.value)}
              >
                <option value="">Sélectionner un produit</option>
                {produits.map(p => (
                  <option key={p.id} value={p.id}>{p.nom}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={styles.label}>Horizon de prévision</label>
              <select
                style={styles.input}
                value={moisFutur}
                onChange={(e) => setMoisFutur(parseInt(e.target.value))}
              >
                <option value={1}>1 mois</option>
                <option value={3}>3 mois</option>
                <option value={6}>6 mois</option>
                <option value={12}>12 mois</option>
              </select>
            </div>

            <button style={styles.primaryBtn} onClick={handleGenerer} disabled={loading}>
              <Play size={17} />
              {loading ? 'Calcul en cours...' : 'Générer la prévision'}
            </button>
          </div>
        </div>

        {resultat && (
          <>
            <div style={styles.kpiGrid}>
              <KpiCard
                icon={TrendingUp}
                label={`CA prévu sur ${resultat.mois_prevu} mois`}
                value={money(resultat.total_prevu)}
                color="#1E6B40"
                bg="#D5F5E3"
              />
              <div style={styles.kpiCard}>
                <div style={{ ...styles.kpiIcon, background: '#FEF9E7', color: scoreColor }}>
                  <Target size={19} />
                </div>
                <div style={{ ...styles.kpiValue, color: scoreColor }}>{scorePct}%</div>
                <div style={styles.kpiLabel}>Score de précision R² · {scoreLabel}</div>
                <div style={styles.scoreTrack}>
                  <div style={{ ...styles.scoreFill, width: `${scorePct}%`, background: scoreColor }} />
                </div>
              </div>
              <KpiCard
                icon={Package}
                label="Produit analysé"
                value={resultat.produit_nom}
                color="#C1440E"
                bg="#F5E8E3"
              />
              <KpiCard
                icon={BarChart3}
                label="Ventes analysées"
                value={resultat.nb_ventes}
                color="#1A5276"
                bg="#D6EAF8"
              />
            </div>

            <div style={styles.actionRow}>
              <button style={styles.successBtn} onClick={handleExportPDF} disabled={exportingPDF}>
                <Download size={17} />
                {exportingPDF ? 'Génération...' : 'Exporter le rapport '}
              </button>
            </div>

            <div style={styles.chartCard}>
              <div style={styles.cardHeader}>
                <div>
                  <h2 style={styles.sectionTitle}>
                    Historique vs Prévision — {resultat.produit_nom}
                  </h2>
                  <p style={styles.sectionSub}>
                    La ligne bleue représente l’historique, la ligne verte représente la prévision.
                  </p>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={330}>
                <LineChart data={graphData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    tickFormatter={d => d?.slice(0, 7)}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  {firstPrevDate && (
                    <ReferenceLine
                      x={firstPrevDate}
                      stroke="#CBD5E1"
                      strokeDasharray="4 3"
                      label={{
                        value: 'Début prévision',
                        position: 'top',
                        fontSize: 11,
                        fill: '#64748B'
                      }}
                    />
                  )}
                  <Line
                    type="monotone"
                    dataKey="historique"
                    stroke="#1A5276"
                    strokeWidth={3}
                    dot={false}
                    connectNulls={false}
                    name="historique"
                  />
                  <Line
                    type="monotone"
                    dataKey="prevision"
                    stroke="#1E6B40"
                    strokeWidth={3}
                    strokeDasharray="6 4"
                    dot={{ r: 4, fill: '#1E6B40' }}
                    connectNulls={false}
                    name="prevision"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div style={styles.detailsGrid}>
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <div>
                    <h2 style={styles.sectionTitle}>Détail mensuel des prévisions</h2>
                    <p style={styles.sectionSub}>Variation estimée mois par mois.</p>
                  </div>
                </div>

                <div style={styles.tableWrapper}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Mois</th>
                        <th style={styles.th}>CA prévu</th>
                        <th style={styles.th}>Variation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resultat.previsions.map((p, i) => {
                        const prev = i > 0 ? resultat.previsions[i - 1].ca : null;
                        const variation = prev ? ((p.ca - prev) / prev * 100).toFixed(1) : null;
                        const up = parseFloat(variation) >= 0;

                        return (
                          <tr key={i} style={styles.tr}>
                            <td style={styles.td}>{p.date?.slice(0, 7)}</td>
                            <td style={styles.td}>
                              <span style={styles.price}>{money(p.ca)}</span>
                            </td>
                            <td style={styles.td}>
                              {variation === null ? '—' : (
                                <span style={up ? styles.upBadge : styles.downBadge}>
                                  {up ? <ArrowUp size={13} /> : <ArrowDown size={13} />}
                                  {Math.abs(variation)}%
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div style={styles.recoCard}>
                <div style={styles.recoIcon}>
                  <Brain size={24} />
                </div>
                <h2 style={styles.recoTitle}>Recommandation IA</h2>
                <p style={styles.recoText}>
                  Sur la base des tendances historiques, le produit sélectionné présente une
                  prévision de <strong>{money(resultat.total_prevu)}</strong> sur les prochains
                  <strong> {resultat.mois_prevu} mois</strong>. Le score R² indique une fiabilité
                  <strong> {scoreLabel.toLowerCase()}</strong>.
                </p>
              </div>
            </div>
          </>
        )}

        <div style={styles.historyCard}>
          <div style={styles.cardHeader}>
            <div style={styles.historyTitleWrap}>
              <History size={20} />
              <div>
                <h2 style={styles.sectionTitle}>Historique des prévisions</h2>
                <p style={styles.sectionSub}>Toutes les prévisions générées récemment.</p>
              </div>
            </div>
          </div>

          {loadingHist ? (
            <div style={styles.loading}>Chargement de l’historique...</div>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Produit</th>
                    <th style={styles.th}>Période</th>
                    <th style={styles.th}>CA prévu</th>
                    <th style={styles.th}>Score R²</th>
                    <th style={styles.th}>Généré le</th>
                  </tr>
                </thead>

                <tbody>
                  {historique.map(h => (
                    <tr key={h.id} style={styles.tr}>
                      <td style={styles.tdStrong}>{h.produit_nom}</td>
                      <td style={styles.tdMuted}>{h.date_debut} → {h.date_fin}</td>
                      <td style={styles.td}>
                        <span style={styles.price}>{money(h.valeur_prevue)}</span>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.scoreBadge}>
                          {(h.score_r2 * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td style={styles.tdMuted}>
                        {h.created_at ? new Date(h.created_at).toLocaleDateString('fr-FR') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {historique.length === 0 && (
                <div style={styles.empty}>Aucune prévision générée pour l’instant.</div>
              )}
            </div>
          )}
        </div>
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

const styles = {
  page: { padding: 22, background: '#F4F0E8', minHeight: '100vh' },
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
  title: { margin: 0, fontSize: 28, fontWeight: 900 },
  subtitle: { margin: '7px 0 0', color: 'rgba(255,255,255,0.72)', fontSize: 14 },
  configCard: {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: 18,
    padding: 20,
    marginBottom: 18,
  },
  configHeader: { marginBottom: 16 },
  sectionTitle: { margin: 0, fontSize: 18, fontWeight: 900, color: '#0F172A' },
  sectionSub: { margin: '4px 0 0', color: '#64748B', fontSize: 13 },
  configGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 14, alignItems: 'end' },
  label: { display: 'block', marginBottom: 7, fontSize: 13, fontWeight: 800, color: '#334155' },
  input: {
    width: '100%',
    height: 46,
    border: '1px solid #CBD5E1',
    borderRadius: 12,
    padding: '0 13px',
    fontSize: 14,
    outline: 'none',
    background: '#FFFFFF',
  },
  primaryBtn: {
    height: 46,
    border: 'none',
    background: '#C1440E',
    color: '#FFFFFF',
    borderRadius: 12,
    padding: '0 16px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    fontWeight: 900,
    cursor: 'pointer',
  },
  successBtn: {
    border: 'none',
    background: '#1E6B40',
    color: '#FFFFFF',
    borderRadius: 12,
    padding: '12px 16px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    fontWeight: 900,
    cursor: 'pointer',
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 14,
    marginBottom: 18,
  },
  kpiCard: { background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16, padding: 16 },
  kpiIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  kpiValue: { fontSize: 20, fontWeight: 900, color: '#0F172A' },
  kpiLabel: { fontSize: 12, color: '#64748B', marginTop: 3 },
  scoreTrack: { height: 7, background: '#E2E8F0', borderRadius: 999, overflow: 'hidden', marginTop: 10 },
  scoreFill: { height: '100%', borderRadius: 999 },
  actionRow: { display: 'flex', justifyContent: 'flex-end', marginBottom: 18 },
  chartCard: {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: 18,
    padding: 20,
    marginBottom: 18,
  },
  cardHeader: { marginBottom: 16 },
  detailsGrid: { display: 'grid', gridTemplateColumns: '1.4fr 0.8fr', gap: 18, marginBottom: 18 },
  card: { background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 18, padding: 20 },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    textAlign: 'left',
    padding: '13px 14px',
    background: '#F8FAFC',
    color: '#64748B',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tr: { borderTop: '1px solid #E2E8F0' },
  td: { padding: '14px', color: '#334155', fontSize: 14 },
  tdStrong: { padding: '14px', color: '#0F172A', fontWeight: 900, fontSize: 14 },
  tdMuted: { padding: '14px', color: '#64748B', fontSize: 13 },
  price: { color: '#1E6B40', fontWeight: 900 },
  upBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    background: '#D5F5E3',
    color: '#1E6B40',
    padding: '6px 9px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 900,
  },
  downBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    background: '#FEE2E2',
    color: '#DC2626',
    padding: '6px 9px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 900,
  },
  recoCard: {
    background: 'linear-gradient(135deg, #1A5276, #123A55)',
    color: '#FFFFFF',
    borderRadius: 18,
    padding: 22,
  },
  recoIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    background: 'rgba(255,255,255,0.12)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  recoTitle: { margin: 0, fontSize: 20, fontWeight: 900 },
  recoText: { color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, fontSize: 14 },
  historyCard: {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: 18,
    padding: 20,
  },
  historyTitleWrap: { display: 'flex', alignItems: 'center', gap: 10, color: '#1A5276' },
  scoreBadge: {
    background: '#D6EAF8',
    color: '#1A5276',
    padding: '6px 10px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 900,
  },
  loading: { padding: 24, textAlign: 'center', color: '#64748B' },
  empty: { padding: 24, textAlign: 'center', color: '#64748B' },
  tooltip: {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: 10,
    padding: '10px 14px',
    boxShadow: '0 12px 30px rgba(15,23,42,0.16)',
    fontSize: 13,
  },
  tooltipLabel: { color: '#64748B', marginBottom: 6, fontWeight: 800 },
};