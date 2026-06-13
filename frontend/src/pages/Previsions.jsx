// src/pages/Previsions.jsx
import { useEffect, useState } from 'react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import {
    LineChart, Line, XAxis, YAxis,
    CartesianGrid, Tooltip, Legend,
    ResponsiveContainer
} from 'recharts';

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

    const scoreColor = resultat?.score_r2 >= 0.8 ? '#16a34a'
                     : resultat?.score_r2 >= 0.5 ? '#ea580c'
                     : '#dc2626';

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f9fc', fontFamily: 'Segoe UI, sans-serif' }}>
            <Sidebar />
            <main style={{ marginLeft: '240px', flex: 1, padding: '32px' }}>

                <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1a1a2e', margin: '0 0 4px' }}>🔮 Prévisions</h1>
                <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '28px' }}>
                    Prévision des ventes par Random Forest
                </p>

                {/* ── Panneau de configuration ── */}
                <div style={styles.configCard}>
                    <h3 style={styles.configTitle}>⚙️ Paramètres de prévision</h3>
                    <div style={styles.configRow}>
                        <div style={styles.configField}>
                            <label style={styles.label}>Produit</label>
                            <select style={styles.select} value={produitId}
                                onChange={e => setProduitId(e.target.value)}>
                                <option value="">-- Choisir un produit --</option>
                                {produits.map(p => (
                                    <option key={p.id} value={p.id}>{p.nom}</option>
                                ))}
                            </select>
                        </div>

                        <div style={styles.configField}>
                            <label style={styles.label}>Période de prévision</label>
                            <select style={styles.select} value={moisFutur}
                                onChange={e => setMoisFutur(parseInt(e.target.value))}>
                                <option value={1}>1 mois</option>
                                <option value={3}>3 mois</option>
                                <option value={6}>6 mois</option>
                                <option value={12}>12 mois</option>
                            </select>
                        </div>

                        <button onClick={handleGenerer} disabled={loading}
                            style={loading ? styles.btnDisabled : styles.btn}>
                            {loading ? '⏳ Calcul en cours...' : '🚀 Générer la prévision'}
                        </button>
                    </div>
                </div>

                {/* ── Résultats ── */}
                {resultat && (
                    <>
                        {/* KPIs résultats */}
                        <div style={styles.kpiGrid}>
                            <div style={styles.kpiCard}>
                                <div style={styles.kpiIcon}>📈</div>
                                <div style={styles.kpiValue}>
                                    {resultat.total_prevu?.toLocaleString()} DH
                                </div>
                                <div style={styles.kpiLabel}>
                                    CA prévu sur {resultat.mois_prevu} mois
                                </div>
                            </div>
                            <div style={styles.kpiCard}>
                                <div style={styles.kpiIcon}>🎯</div>
                                <div style={{ ...styles.kpiValue, color: scoreColor }}>
                                    {(resultat.score_r2 * 100).toFixed(1)}%
                                </div>
                                <div style={styles.kpiLabel}>Score de précision (R²)</div>
                            </div>
                            <div style={styles.kpiCard}>
                                <div style={styles.kpiIcon}>📦</div>
                                <div style={styles.kpiValue}>{resultat.produit_nom}</div>
                                <div style={styles.kpiLabel}>Produit analysé</div>
                            </div>
                            <div style={styles.kpiCard}>
                                <div style={styles.kpiIcon}>🗂️</div>
                                <div style={styles.kpiValue}>{resultat.nb_ventes}</div>
                                <div style={styles.kpiLabel}>Ventes analysées</div>
                            </div>
                        </div>

                        {/* Bouton Export PDF */}
<div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
    <button onClick={handleExportPDF} disabled={exportingPDF}
        style={exportingPDF ? styles.btnPdfDisabled : styles.btnPdf}>
        {exportingPDF ? '⏳ Génération...' : '📄 Générer le rapport PDF de ce produit'}
    </button>
</div>
                          
                        {/* Graphique */}
                        <div style={styles.chartCard}>
                            <h3 style={styles.chartTitle}>
                                📊 Historique vs Prévision — {resultat.produit_nom}
                            </h3>
                            <ResponsiveContainer width="100%" height={350}>
                                <LineChart data={graphData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                                    <XAxis dataKey="date" tick={{ fontSize: 11 }}
                                        tickFormatter={d => d?.slice(0, 7)}/>
                                    <YAxis tick={{ fontSize: 11 }}/>
                                    <Tooltip
                                        formatter={(v, name) => [
                                            v ? `${v.toLocaleString()} DH` : '-',
                                            name === 'historique' ? 'Historique' : 'Prévision'
                                        ]}
                                    />
                                    <Legend />
                                    <Line type="monotone" dataKey="historique"
                                        stroke="#4f46e5" strokeWidth={2}
                                        dot={false} connectNulls={false}/>
                                    <Line type="monotone" dataKey="prevision"
                                        stroke="#16a34a" strokeWidth={2}
                                        strokeDasharray="6 3"
                                        dot={{ r: 5, fill: '#16a34a' }}
                                        connectNulls={false}/>
                                </LineChart>
                            </ResponsiveContainer>
                            <div style={styles.legend}>
                                <span style={styles.legendItem}>
                                    <span style={{ ...styles.legendDot, backgroundColor: '#4f46e5' }}/>
                                    Historique réel
                                </span>
                                <span style={styles.legendItem}>
                                    <span style={{ ...styles.legendDot, backgroundColor: '#16a34a' }}/>
                                    Prévision Random Forest
                                </span>
                            </div>
                        </div>

                        {/* Tableau des prévisions */}
                        <div style={styles.tableCard}>
                            <h3 style={styles.chartTitle}>📋 Détail des prévisions</h3>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f8f9fc' }}>
                                        <th style={styles.th}>Mois</th>
                                        <th style={styles.th}>CA Prévu (DH)</th>
                                        <th style={styles.th}>Variation</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {resultat.previsions.map((p, i) => {
                                        const prev = i > 0 ? resultat.previsions[i-1].ca : null;
                                        const variation = prev ? ((p.ca - prev) / prev * 100).toFixed(1) : null;
                                        return (
                                            <tr key={i} style={{ backgroundColor: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                                                <td style={styles.td}>{p.date?.slice(0, 7)}</td>
                                                <td style={{ ...styles.td, fontWeight: '700', color: '#16a34a' }}>
                                                    {p.ca.toLocaleString()} DH
                                                </td>
                                                <td style={styles.td}>
                                                    {variation !== null && (
                                                        <span style={{ color: variation >= 0 ? '#16a34a' : '#dc2626' }}>
                                                            {variation >= 0 ? '↑' : '↓'} {Math.abs(variation)}%
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
                    <h3 style={styles.chartTitle}>🕓 Historique des prévisions générées</h3>
                    {loadingHist ? <p>Chargement...</p> : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f8f9fc' }}>
                                    <th style={styles.th}>Produit</th>
                                    <th style={styles.th}>Période</th>
                                    <th style={styles.th}>CA Prévu</th>
                                    <th style={styles.th}>Score R²</th>
                                    <th style={styles.th}>Généré le</th>
                                </tr>
                            </thead>
                            <tbody>
                                {historique.map((h, i) => (
                                    <tr key={h.id} style={{ backgroundColor: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                                        <td style={{ ...styles.td, fontWeight: '600' }}>{h.produit_nom}</td>
                                        <td style={styles.td}>{h.date_debut} → {h.date_fin}</td>
                                        <td style={{ ...styles.td, color: '#16a34a', fontWeight: '700' }}>
                                            {h.valeur_prevue?.toLocaleString()} DH
                                        </td>
                                        <td style={styles.td}>
                                            <span style={{
                                                backgroundColor: h.score_r2 >= 0.8 ? '#dcfce7' : '#fef3c7',
                                                color: h.score_r2 >= 0.8 ? '#16a34a' : '#ea580c',
                                                padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600'
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
                                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
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
    configCard: { backgroundColor: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)', marginBottom: '24px' },
    configTitle: { fontSize: '16px', fontWeight: '700', color: '#1a1a2e', margin: '0 0 16px' },
    configRow: { display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' },
    configField: { flex: 1, minWidth: '200px' },
    label: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' },
    select: { width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' },
    btn: { padding: '10px 24px', backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', whiteSpace: 'nowrap' },
    btnDisabled: { padding: '10px 24px', backgroundColor: '#a5a3f0', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'not-allowed', fontWeight: '600', fontSize: '14px' },
    kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' },
    kpiCard: { backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' },
    kpiIcon: { fontSize: '24px', marginBottom: '8px' },
    kpiValue: { fontSize: '20px', fontWeight: '700', color: '#1a1a2e', marginBottom: '4px' },
    kpiLabel: { fontSize: '12px', color: '#94a3b8' },
    chartCard: { backgroundColor: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)', marginBottom: '24px' },
    chartTitle: { fontSize: '15px', fontWeight: '700', color: '#1a1a2e', margin: '0 0 16px' },
    legend: { display: 'flex', gap: '24px', justifyContent: 'center', marginTop: '16px' },
    legendItem: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#374151' },
    legendDot: { width: '12px', height: '12px', borderRadius: '50%', display: 'inline-block' },
    tableCard: { backgroundColor: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' },
    th: { padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e2e8f0' },
    td: { padding: '12px 16px', fontSize: '14px', color: '#374151', borderBottom: '1px solid #f1f5f9' },
    btnPdf: { padding: '10px 20px', backgroundColor: '#16a34a', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' },
btnPdfDisabled: { padding: '10px 20px', backgroundColor: '#86efac', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'not-allowed', fontWeight: '600', fontSize: '14px' },
};
