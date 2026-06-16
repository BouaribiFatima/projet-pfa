// src/pages/Rapports.jsx
import { useEffect, useState } from 'react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import { theme } from '../styles/theme';
import {
    FileText, BarChart3, Package, Download,
    TrendingUp, Trophy, ShoppingCart, Crown
} from 'lucide-react';

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
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: theme.colors.background, fontFamily: 'Segoe UI, sans-serif' }}>
            <Sidebar />
            <main style={{ marginLeft: '260px', flex: 1, padding: '32px' }}>

                <div style={{ marginBottom: '28px' }}>
                    <h1 style={{
                        fontSize: '24px', fontWeight: '700', color: theme.colors.textPrimary,
                        margin: 0, display: 'flex', alignItems: 'center', gap: '10px'
                    }}>
                        <FileText size={24} color={theme.colors.primary} />
                        Rapports
                    </h1>
                    <p style={{ color: theme.colors.textSecondary, fontSize: '14px', margin: '4px 0 0' }}>
                        Exportez vos rapports en PDF
                    </p>
                </div>

                {/* ── Rapport Global ── */}
                <div style={styles.exportCard}>
                    <div style={{ ...styles.exportIconBox, backgroundColor: theme.colors.primaryLight }}>
                        <BarChart3 size={28} color={theme.colors.primary} />
                    </div>
                    <div style={styles.exportInfo}>
                        <h3 style={styles.exportTitle}>Rapport Global des Ventes</h3>
                        <p style={styles.exportDesc}>
                            Vue d'ensemble : KPIs globaux, Top 5 produits, évolution mensuelle, dernières prévisions générées.
                        </p>
                        <div style={styles.exportTags}>
                            <span style={styles.tag}><TrendingUp size={12} /> KPIs</span>
                            <span style={styles.tag}><Trophy size={12} /> Top Produits</span>
                            <span style={styles.tag}><BarChart3 size={12} /> Évolution mensuelle</span>
                            <span style={styles.tag}><FileText size={12} /> Prévisions récentes</span>
                        </div>
                    </div>
                    <button onClick={handleExportGlobal} disabled={exportingGlobal}
                        style={exportingGlobal ? styles.btnDisabled : styles.btn}
                        onMouseEnter={e => { if (!exportingGlobal) e.currentTarget.style.backgroundColor = theme.colors.primaryDark; }}
                        onMouseLeave={e => { if (!exportingGlobal) e.currentTarget.style.backgroundColor = theme.colors.primary; }}>
                        <Download size={16} />
                        {exportingGlobal ? 'Génération...' : 'Télécharger PDF'}
                    </button>
                </div>

                {/* ── Rapport par Produit ── */}
                <div style={{ ...styles.exportCard, marginTop: '20px', borderLeftColor: theme.colors.success }}>
                    <div style={{ ...styles.exportIconBox, backgroundColor: '#D1FAE5' }}>
                        <Package size={28} color={theme.colors.success} />
                    </div>
                    <div style={styles.exportInfo}>
                        <h3 style={styles.exportTitle}>Rapport Détaillé par Produit</h3>
                        <p style={styles.exportDesc}>
                            Historique des ventes du produit, prévisions générées pour ce produit, et analyse de fiabilité (score R²).
                        </p>
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
                    <button onClick={handleExportProduit} disabled={exportingProduit}
                        style={exportingProduit ? styles.btnDisabledGreen : styles.btnGreen}
                        onMouseEnter={e => { if (!exportingProduit) e.currentTarget.style.backgroundColor = '#047857'; }}
                        onMouseLeave={e => { if (!exportingProduit) e.currentTarget.style.backgroundColor = theme.colors.success; }}>
                        <Download size={16} />
                        {exportingProduit ? 'Génération...' : 'Télécharger PDF'}
                    </button>
                </div>

                {/* KPIs rappel */}
                {!loading && kpis && (
                    <>
                        <h2 style={{ fontSize: '16px', fontWeight: '700', color: theme.colors.textPrimary, margin: '32px 0 16px' }}>
                            Aperçu des données globales
                        </h2>
                        <div style={styles.kpiGrid}>
                            <div style={styles.kpiCard}>
                                <div style={{ ...styles.kpiIconBox, backgroundColor: theme.colors.primaryLight }}>
                                    <TrendingUp size={20} color={theme.colors.primary} />
                                </div>
                                <div style={styles.kpiValue}>{kpis.ca_total?.toLocaleString()} DH</div>
                                <div style={styles.kpiLabel}>CA Total</div>
                            </div>
                            <div style={styles.kpiCard}>
                                <div style={{ ...styles.kpiIconBox, backgroundColor: '#D1FAE5' }}>
                                    <ShoppingCart size={20} color={theme.colors.success} />
                                </div>
                                <div style={styles.kpiValue}>{kpis.nb_ventes}</div>
                                <div style={styles.kpiLabel}>Ventes</div>
                            </div>
                            <div style={styles.kpiCard}>
                                <div style={{ ...styles.kpiIconBox, backgroundColor: '#FCE7F3' }}>
                                    <Trophy size={20} color={theme.colors.pink} />
                                </div>
                                <div style={styles.kpiValue}>{kpis.meilleur_produit}</div>
                                <div style={styles.kpiLabel}>Meilleur Produit</div>
                            </div>
                            <div style={styles.kpiCard}>
                                <div style={{ ...styles.kpiIconBox, backgroundColor: '#FEF3C7' }}>
                                    <Crown size={20} color={theme.colors.warning} />
                                </div>
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
    exportCard: {
        backgroundColor: theme.colors.white, borderRadius: '12px', padding: '28px',
        boxShadow: '0 1px 8px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center',
        gap: '24px', borderLeft: `4px solid ${theme.colors.primary}`,
    },
    exportIconBox: {
        width: '64px', height: '64px', borderRadius: '14px', display: 'flex',
        alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    },
    exportInfo: { flex: 1 },
    exportTitle: { fontSize: '16px', fontWeight: '700', color: theme.colors.textPrimary, margin: '0 0 6px' },
    exportDesc: { fontSize: '13px', color: theme.colors.textSecondary, margin: '0 0 12px' },
    exportTags: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
    tag: {
        backgroundColor: theme.colors.primaryLight, color: theme.colors.primary,
        padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
        display: 'inline-flex', alignItems: 'center', gap: '5px',
    },
    select: {
        padding: '8px 12px', border: `1px solid ${theme.colors.border}`, borderRadius: '8px',
        fontSize: '13px', minWidth: '220px', outline: 'none', transition: 'border-color 0.15s',
        color: theme.colors.textPrimary, backgroundColor: theme.colors.white,
    },
    btn: {
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '12px 24px', backgroundColor: theme.colors.primary, color: theme.colors.white,
        border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600',
        fontSize: '14px', whiteSpace: 'nowrap', transition: 'background-color 0.15s',
    },
    btnDisabled: {
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '12px 24px', backgroundColor: '#A5B4D6', color: theme.colors.white,
        border: 'none', borderRadius: '8px', cursor: 'not-allowed', fontWeight: '600',
        fontSize: '14px', whiteSpace: 'nowrap',
    },
    btnGreen: {
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '12px 24px', backgroundColor: theme.colors.success, color: theme.colors.white,
        border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600',
        fontSize: '14px', whiteSpace: 'nowrap', transition: 'background-color 0.15s',
    },
    btnDisabledGreen: {
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '12px 24px', backgroundColor: '#86EFAC', color: theme.colors.white,
        border: 'none', borderRadius: '8px', cursor: 'not-allowed', fontWeight: '600',
        fontSize: '14px', whiteSpace: 'nowrap',
    },
    kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' },
    kpiCard: { backgroundColor: theme.colors.white, borderRadius: '12px', padding: '20px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' },
    kpiIconBox: {
        width: '40px', height: '40px', borderRadius: '10px', display: 'flex',
        alignItems: 'center', justifyContent: 'center', marginBottom: '12px',
    },
    kpiValue: { fontSize: '18px', fontWeight: '700', color: theme.colors.textPrimary, marginBottom: '4px' },
    kpiLabel: { fontSize: '12px', color: theme.colors.textSecondary },
};