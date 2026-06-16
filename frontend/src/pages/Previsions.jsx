// src/pages/Previsions.jsx
import { useEffect, useState } from 'react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import { theme } from '../styles/theme';
import {
    LineChart, Line, XAxis, YAxis,
    CartesianGrid, Tooltip, Legend,
    ResponsiveContainer
} from 'recharts';
import {
    Sparkles, Settings, TrendingUp, Target,
    Package, Database, FileDown, BarChart3,
    ClipboardList, History, ArrowUp, ArrowDown
} from 'lucide-react';

export default function Previsions() {
    const [produits, setProduits]       = useState([]);
    const [produitId, setProduitId]     = useState('');
    const [moisFutur, setMoisFutur]     = useState(3);
    const [resultat, setResultat]       = useState(null);
    const [historique, setHistorique]   = useState([]);
    const [loading, setLoading]         = useState(false);
    const [loadingHist, setLoadingHist] = useState(true);
    const [exportingPDF, setExportingPDF] = useState(false);

    useEffect(() => {
        api.get('produits/').then(r => setProduits(r.data));
        fetchHistorique();
    }, []);

    const handleExportPDF = async () => {
        if (!produitId) return;
        setExportingPDF(true);
        try {
            const response = await api.get(`rapports/export-pdf/?produit_id=${produitId}`, {
                responseType: 'blob',
            });
            const url  = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href  = url;
            link.setAttribute('download', `rapport_produit_${produitId}_${new Date().toISOString().slice(0, 10)}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (e) {
            alert('Erreur lors de l\'export PDF');
        } finally {
            setExportingPDF(false);
        }
    };

    const fetchHistorique = async () => {
        setLoadingHist(true);
        const r = await api.get('previsions/historique/');
        setHistorique(r.data);
        setLoadingHist(false);
    };

    const handleGenerer = async () => {
        if (!produitId) return alert('Choisissez un produit !');
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
            alert(e.response?.data?.erreur || 'Erreur lors de la prévision');
        } finally {
            setLoading(false);
        }
    };

    // Fusionner historique + prévisions pour le graphique
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
        }))
    ] : [];

    const scoreColor = resultat?.score_r2 >= 0.8 ? theme.colors.success
                     : resultat?.score_r2 >= 0.5 ? theme.colors.warning
                     : theme.colors.danger;

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: theme.colors.background, fontFamily: 'Segoe UI, sans-serif' }}>
            <Sidebar />
            <main style={{ marginLeft: '260px', flex: 1, padding: '32px' }}>

                <h1 style={{
                    fontSize: '24px', fontWeight: '700', color: theme.colors.textPrimary,
                    margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '10px'
                }}>
                    <Sparkles size={24} color={theme.colors.primary} />
                    Prévisions
                </h1>
                <p style={{ color: theme.colors.textSecondary, fontSize: '14px', marginBottom: '28px' }}>
                    Prévision des ventes par Random Forest
                </p>

                {/* ── Panneau de configuration ── */}
                <div style={styles.configCard}>
                    <h3 style={styles.configTitle}>
                        <Settings size={16} color={theme.colors.primary} />
                        Paramètres de prévision
                    </h3>
                    <div style={styles.configRow}>
                        <div style={styles.configField}>
                            <label style={styles.label}>Produit</label>
                            <select style={styles.select} value={produitId}
                                onChange={e => setProduitId(e.target.value)}
                                onFocus={e => e.target.style.borderColor = theme.colors.primary}
                                onBlur={e => e.target.style.borderColor = theme.colors.border}>
                                <option value="">-- Choisir un produit --</option>
                                {produits.map(p => (
                                    <option key={p.id} value={p.id}>{p.nom}</option>
                                ))}
                            </select>
                        </div>

                        <div style={styles.configField}>
                            <label style={styles.label}>Période de prévision</label>
                            <select style={styles.select} value={moisFutur}
                                onChange={e => setMoisFutur(parseInt(e.target.value))}
                                onFocus={e => e.target.style.borderColor = theme.colors.primary}
                                onBlur={e => e.target.style.borderColor = theme.colors.border}>
                                <option value={1}>1 mois</option>
                                <option value={3}>3 mois</option>
                                <option value={6}>6 mois</option>
                                <option value={12}>12 mois</option>
                            </select>
                        </div>

                        <button onClick={handleGenerer} disabled={loading}
                            style={loading ? styles.btnDisabled : styles.btn}
                            onMouseEnter={e => { if (!loading) e.currentTarget.style.backgroundColor = theme.colors.primaryDark; }}
                            onMouseLeave={e => { if (!loading) e.currentTarget.style.backgroundColor = theme.colors.primary; }}>
                            <Sparkles size={16} />
                            {loading ? 'Calcul en cours...' : 'Générer la prévision'}
                        </button>
                    </div>
                </div>

                {/* ── Résultats ── */}
                {resultat && (
                    <>
                        {/* KPIs résultats */}
                        <div style={styles.kpiGrid}>
                            <div style={styles.kpiCard}>
                                <div style={{ ...styles.kpiIconBox, backgroundColor: theme.colors.primaryLight }}>
                                    <TrendingUp size={20} color={theme.colors.primary} />
                                </div>
                                <div style={styles.kpiValue}>
                                    {resultat.total_prevu?.toLocaleString()} DH
                                </div>
                                <div style={styles.kpiLabel}>
                                    CA prévu sur {resultat.mois_prevu} mois
                                </div>
                            </div>
                            <div style={styles.kpiCard}>
                                <div style={{ ...styles.kpiIconBox, backgroundColor: '#FEF3C7' }}>
                                    <Target size={20} color={theme.colors.warning} />
                                </div>
                                <div style={{ ...styles.kpiValue, color: scoreColor }}>
                                    {(resultat.score_r2 * 100).toFixed(1)}%
                                </div>
                                <div style={styles.kpiLabel}>Score de précision (R²)</div>
                            </div>
                            <div style={styles.kpiCard}>
                                <div style={{ ...styles.kpiIconBox, backgroundColor: '#FCE7F3' }}>
                                    <Package size={20} color={theme.colors.pink} />
                                </div>
                                <div style={styles.kpiValue}>{resultat.produit_nom}</div>
                                <div style={styles.kpiLabel}>Produit analysé</div>
                            </div>
                            <div style={styles.kpiCard}>
                                <div style={{ ...styles.kpiIconBox, backgroundColor: '#D1FAE5' }}>
                                    <Database size={20} color={theme.colors.success} />
                                </div>
                                <div style={styles.kpiValue}>{resultat.nb_ventes}</div>
                                <div style={styles.kpiLabel}>Ventes analysées</div>
                            </div>
                        </div>

                        {/* Bouton Export PDF */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                            <button onClick={handleExportPDF} disabled={exportingPDF}
                                style={exportingPDF ? styles.btnPdfDisabled : styles.btnPdf}
                                onMouseEnter={e => { if (!exportingPDF) e.currentTarget.style.backgroundColor = '#047857'; }}
                                onMouseLeave={e => { if (!exportingPDF) e.currentTarget.style.backgroundColor = theme.colors.success; }}>
                                <FileDown size={16} />
                                {exportingPDF ? 'Génération...' : 'Générer le rapport PDF de ce produit'}
                            </button>
                        </div>

                        {/* Graphique */}
                        <div style={styles.chartCard}>
                            <h3 style={styles.chartTitle}>
                                <BarChart3 size={16} color={theme.colors.primary} />
                                Historique vs Prévision — {resultat.produit_nom}
                            </h3>
                            <ResponsiveContainer width="100%" height={350}>
                                <LineChart data={graphData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.background} />
                                    <XAxis dataKey="date" tick={{ fontSize: 11 }}
                                        tickFormatter={d => d?.slice(0, 7)} />
                                    <YAxis tick={{ fontSize: 11 }} />
                                    <Tooltip
                                        formatter={(v, name) => [
                                            v ? `${v.toLocaleString()} DH` : '-',
                                            name === 'historique' ? 'Historique' : 'Prévision'
                                        ]}
                                    />
                                    <Legend />
                                    <Line type="monotone" dataKey="historique"
                                        stroke={theme.colors.primary} strokeWidth={2}
                                        dot={false} connectNulls={false} />
                                    <Line type="monotone" dataKey="prevision"
                                        stroke={theme.colors.success} strokeWidth={2}
                                        strokeDasharray="6 3"
                                        dot={{ r: 5, fill: theme.colors.success }}
                                        connectNulls={false} />
                                </LineChart>
                            </ResponsiveContainer>
                            <div style={styles.legend}>
                                <span style={styles.legendItem}>
                                    <span style={{ ...styles.legendDot, backgroundColor: theme.colors.primary }} />
                                    Historique réel
                                </span>
                                <span style={styles.legendItem}>
                                    <span style={{ ...styles.legendDot, backgroundColor: theme.colors.success }} />
                                    Prévision Random Forest
                                </span>
                            </div>
                        </div>

                        {/* Tableau des prévisions */}
                        <div style={styles.tableCard}>
                            <h3 style={styles.chartTitle}>
                                <ClipboardList size={16} color={theme.colors.primary} />
                                Détail des prévisions
                            </h3>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ backgroundColor: theme.colors.background }}>
                                        <th style={styles.th}>Mois</th>
                                        <th style={styles.th}>CA Prévu (DH)</th>
                                        <th style={styles.th}>Variation</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {resultat.previsions.map((p, i) => {
                                        const prev = i > 0 ? resultat.previsions[i - 1].ca : null;
                                        const variation = prev ? ((p.ca - prev) / prev * 100).toFixed(1) : null;
                                        return (
                                            <tr key={i} style={{ backgroundColor: i % 2 === 0 ? theme.colors.white : '#FAFBFC' }}>
                                                <td style={styles.td}>{p.date?.slice(0, 7)}</td>
                                                <td style={{ ...styles.td, fontWeight: '700', color: theme.colors.success }}>
                                                    {p.ca.toLocaleString()} DH
                                                </td>
                                                <td style={styles.td}>
                                                    {variation !== null && (
                                                        <span style={{
                                                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                                                            color: variation >= 0 ? theme.colors.success : theme.colors.danger
                                                        }}>
                                                            {variation >= 0 ? <ArrowUp size={13} /> : <ArrowDown size={13} />}
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
                    </>
                )}

                {/* ── Historique des prévisions ── */}
                <div style={{ ...styles.tableCard, marginTop: '24px' }}>
                    <h3 style={styles.chartTitle}>
                        <History size={16} color={theme.colors.primary} />
                        Historique des prévisions générées
                    </h3>
                    {loadingHist ? (
                        <p style={{ color: theme.colors.textSecondary }}>Chargement...</p>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: theme.colors.background }}>
                                    <th style={styles.th}>Produit</th>
                                    <th style={styles.th}>Période</th>
                                    <th style={styles.th}>CA Prévu</th>
                                    <th style={styles.th}>Score R²</th>
                                    <th style={styles.th}>Généré le</th>
                                </tr>
                            </thead>
                            <tbody>
                                {historique.map((h, i) => (
                                    <tr key={h.id} style={{ backgroundColor: i % 2 === 0 ? theme.colors.white : '#FAFBFC' }}>
                                        <td style={{ ...styles.td, fontWeight: '600' }}>{h.produit_nom}</td>
                                        <td style={styles.td}>{h.date_debut} → {h.date_fin}</td>
                                        <td style={{ ...styles.td, color: theme.colors.success, fontWeight: '700' }}>
                                            {h.valeur_prevue?.toLocaleString()} DH
                                        </td>
                                        <td style={styles.td}>
                                            <span style={{
                                                backgroundColor: h.score_r2 >= 0.8 ? '#D1FAE5' : '#FEF3C7',
                                                color: h.score_r2 >= 0.8 ? theme.colors.success : theme.colors.warning,
                                                padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600'
                                            }}>
                                                {(h.score_r2 * 100).toFixed(1)}%
                                            </span>
                                        </td>
                                        <td style={styles.td}>
                                            {new Date(h.created_at).toLocaleDateString('fr-FR')}
                                        </td>
                                    </tr>
                                ))}
                                {historique.length === 0 && (
                                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: theme.colors.textSecondary }}>
                                        Aucune prévision générée pour l'instant.
                                    </td></tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>
        </div>
    );
}

const styles = {
    configCard: {
        backgroundColor: theme.colors.white, borderRadius: '12px', padding: '24px',
        boxShadow: '0 1px 8px rgba(0,0,0,0.06)', marginBottom: '24px',
    },
    configTitle: {
        fontSize: '16px', fontWeight: '700', color: theme.colors.textPrimary,
        margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px',
    },
    configRow: { display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' },
    configField: { flex: 1, minWidth: '200px' },
    label: { display: 'block', fontSize: '13px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '6px' },
    select: {
        width: '100%', padding: '10px', border: `1px solid ${theme.colors.border}`,
        borderRadius: '8px', fontSize: '14px', outline: 'none',
        transition: 'border-color 0.15s', color: theme.colors.textPrimary,
        backgroundColor: theme.colors.white,
    },
    btn: {
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '10px 24px', backgroundColor: theme.colors.primary, color: theme.colors.white,
        border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600',
        fontSize: '14px', whiteSpace: 'nowrap', transition: 'background-color 0.15s',
    },
    btnDisabled: {
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '10px 24px', backgroundColor: '#A5B4D6', color: theme.colors.white,
        border: 'none', borderRadius: '8px', cursor: 'not-allowed', fontWeight: '600', fontSize: '14px',
    },
    kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' },
    kpiCard: { backgroundColor: theme.colors.white, borderRadius: '12px', padding: '20px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' },
    kpiIconBox: {
        width: '40px', height: '40px', borderRadius: '10px', display: 'flex',
        alignItems: 'center', justifyContent: 'center', marginBottom: '12px',
    },
    kpiValue: { fontSize: '20px', fontWeight: '700', color: theme.colors.textPrimary, marginBottom: '4px' },
    kpiLabel: { fontSize: '12px', color: theme.colors.textSecondary },
    chartCard: {
        backgroundColor: theme.colors.white, borderRadius: '12px', padding: '24px',
        boxShadow: '0 1px 8px rgba(0,0,0,0.06)', marginBottom: '24px',
    },
    chartTitle: {
        fontSize: '15px', fontWeight: '700', color: theme.colors.textPrimary,
        margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px',
    },
    legend: { display: 'flex', gap: '24px', justifyContent: 'center', marginTop: '16px' },
    legendItem: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: theme.colors.textPrimary },
    legendDot: { width: '12px', height: '12px', borderRadius: '50%', display: 'inline-block' },
    tableCard: { backgroundColor: theme.colors.white, borderRadius: '12px', padding: '24px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' },
    th: {
        padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600',
        color: theme.colors.textPrimary, borderBottom: `1px solid ${theme.colors.border}`,
    },
    td: {
        padding: '12px 16px', fontSize: '14px', color: theme.colors.textPrimary,
        borderBottom: `1px solid ${theme.colors.background}`,
    },
    btnPdf: {
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '10px 20px', backgroundColor: theme.colors.success, color: theme.colors.white,
        border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600',
        fontSize: '14px', transition: 'background-color 0.15s',
    },
    btnPdfDisabled: {
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '10px 20px', backgroundColor: '#86EFAC', color: theme.colors.white,
        border: 'none', borderRadius: '8px', cursor: 'not-allowed', fontWeight: '600', fontSize: '14px',
    },
};