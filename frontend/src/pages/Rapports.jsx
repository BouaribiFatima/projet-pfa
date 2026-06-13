// src/pages/Rapports.jsx
import { useEffect, useState } from 'react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';

export default function Rapports() {
    const [kpis, setKpis]           = useState(null);
    const [produits, setProduits]   = useState([]);
    const [produitId, setProduitId] = useState('');
    const [loading, setLoading]     = useState(true);
    const [exportingGlobal, setExportingGlobal] = useState(false);
    const [exportingProduit, setExportingProduit] = useState(false);

    useEffect(() => {
        Promise.all([
            api.get('dashboard/kpis/'),
            api.get('produits/')
        ]).then(([k, p]) => {
            setKpis(k.data);
            setProduits(p.data);
            setLoading(false);
        });
    }, []);

    const telecharger = async (url, filename, setLoadingState) => {
        setLoadingState(true);
        try {
            const response = await api.get(url, { responseType: 'blob' });
            const blobUrl  = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = blobUrl;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (e) {
            alert('Erreur lors de l\'export PDF');
        } finally {
            setLoadingState(false);
        }
    };

    const handleExportGlobal = () => {
        telecharger('rapports/export-pdf/', `rapport_global_${new Date().toISOString().slice(0, 10)}.pdf`, setExportingGlobal);
    };

    const handleExportProduit = () => {
        if (!produitId) return alert('Choisissez un produit !');
        telecharger(`rapports/export-pdf/?produit_id=${produitId}`, `rapport_produit_${produitId}_${new Date().toISOString().slice(0, 10)}.pdf`, setExportingProduit);
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f9fc', fontFamily: 'Segoe UI, sans-serif' }}>
            <Sidebar />
            <main style={{ marginLeft: '240px', flex: 1, padding: '32px' }}>

                <div style={{ marginBottom: '28px' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1a1a2e', margin: 0 }}>📄 Rapports</h1>
                    <p style={{ color: '#94a3b8', fontSize: '14px', margin: '4px 0 0' }}>
                        Exportez vos rapports en PDF
                    </p>
                </div>

                {/* ── Rapport Global ── */}
                <div style={styles.exportCard}>
                    <div style={styles.exportIcon}>📊</div>
                    <div style={styles.exportInfo}>
                        <h3 style={styles.exportTitle}>Rapport Global des Ventes</h3>
                        <p style={styles.exportDesc}>
                            Vue d'ensemble : KPIs globaux, Top 5 produits, évolution mensuelle, dernières prévisions générées.
                        </p>
                        <div style={styles.exportTags}>
                            <span style={styles.tag}>📈 KPIs</span>
                            <span style={styles.tag}>🏆 Top Produits</span>
                            <span style={styles.tag}>📅 Évolution mensuelle</span>
                            <span style={styles.tag}>🔮 Prévisions récentes</span>
                        </div>
                    </div>
                    <button onClick={handleExportGlobal} disabled={exportingGlobal}
                        style={exportingGlobal ? styles.btnDisabled : styles.btn}>
                        {exportingGlobal ? '⏳ Génération...' : '⬇️ Télécharger PDF'}
                    </button>
                </div>

                {/* ── Rapport par Produit ── */}
                <div style={{ ...styles.exportCard, marginTop: '20px', borderLeftColor: '#16a34a' }}>
                    <div style={styles.exportIcon}>📦</div>
                    <div style={styles.exportInfo}>
                        <h3 style={styles.exportTitle}>Rapport Détaillé par Produit</h3>
                        <p style={styles.exportDesc}>
                            Historique des ventes du produit, prévisions générées pour ce produit, et analyse de fiabilité (score R²).
                        </p>
                        <select style={styles.select} value={produitId}
                            onChange={e => setProduitId(e.target.value)}>
                            <option value="">-- Choisir un produit --</option>
                            {produits.map(p => (
                                <option key={p.id} value={p.id}>{p.nom}</option>
                            ))}
                        </select>
                    </div>
                    <button onClick={handleExportProduit} disabled={exportingProduit}
                        style={exportingProduit ? styles.btnDisabledGreen : styles.btnGreen}>
                        {exportingProduit ? '⏳ Génération...' : '⬇️ Télécharger PDF'}
                    </button>
                </div>

                {/* KPIs rappel */}
                {!loading && kpis && (
                    <>
                        <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#1a1a2e', margin: '32px 0 16px' }}>
                            Aperçu des données globales
                        </h2>
                        <div style={styles.kpiGrid}>
                            <div style={styles.kpiCard}>
                                <div style={styles.kpiIcon}>💰</div>
                                <div style={styles.kpiValue}>{kpis.ca_total?.toLocaleString()} DH</div>
                                <div style={styles.kpiLabel}>CA Total</div>
                            </div>
                            <div style={styles.kpiCard}>
                                <div style={styles.kpiIcon}>🛒</div>
                                <div style={styles.kpiValue}>{kpis.nb_ventes}</div>
                                <div style={styles.kpiLabel}>Ventes</div>
                            </div>
                            <div style={styles.kpiCard}>
                                <div style={styles.kpiIcon}>🏆</div>
                                <div style={styles.kpiValue}>{kpis.meilleur_produit}</div>
                                <div style={styles.kpiLabel}>Meilleur Produit</div>
                            </div>
                            <div style={styles.kpiCard}>
                                <div style={styles.kpiIcon}>👑</div>
                                <div style={styles.kpiValue}>{kpis.meilleur_commercial}</div>
                                <div style={styles.kpiLabel}>Meilleur Commercial</div>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}

const styles = {
    exportCard: { backgroundColor: '#fff', borderRadius: '12px', padding: '28px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: '24px', borderLeft: '4px solid #4f46e5' },
    exportIcon: { fontSize: '48px' },
    exportInfo: { flex: 1 },
    exportTitle: { fontSize: '16px', fontWeight: '700', color: '#1a1a2e', margin: '0 0 6px' },
    exportDesc: { fontSize: '13px', color: '#94a3b8', margin: '0 0 12px' },
    exportTags: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
    tag: { backgroundColor: '#ede9fe', color: '#7c3aed', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
    select: { padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', minWidth: '220px' },
    btn: { padding: '12px 24px', backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', whiteSpace: 'nowrap' },
    btnDisabled: { padding: '12px 24px', backgroundColor: '#a5a3f0', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'not-allowed', fontWeight: '600', fontSize: '14px', whiteSpace: 'nowrap' },
    btnGreen: { padding: '12px 24px', backgroundColor: '#16a34a', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', whiteSpace: 'nowrap' },
    btnDisabledGreen: { padding: '12px 24px', backgroundColor: '#86efac', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'not-allowed', fontWeight: '600', fontSize: '14px', whiteSpace: 'nowrap' },
    kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' },
    kpiCard: { backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' },
    kpiIcon: { fontSize: '24px', marginBottom: '8px' },
    kpiValue: { fontSize: '18px', fontWeight: '700', color: '#1a1a2e', marginBottom: '4px' },
    kpiLabel: { fontSize: '12px', color: '#94a3b8' },
};