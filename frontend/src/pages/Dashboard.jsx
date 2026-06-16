// src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import {
    TrendingUp, ShoppingCart, Award, User,
    Star, Calendar, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import {
    LineChart, Line, BarChart, Bar,
    PieChart, Pie, Cell, Tooltip,
    XAxis, YAxis, CartesianGrid,
    ResponsiveContainer, Legend
} from 'recharts';

const COLORS = ['#1E40AF', '#3B82F6', '#60A5FA', '#93C5FD', '#059669', '#0891B2'];

const KPICard = ({ icon: Icon, value, label, color, trend }) => (
    <div style={styles.kpiCard}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ ...styles.kpiIconBox, backgroundColor: color + '15' }}>
                <Icon size={20} color={color} />
            </div>
            {trend !== undefined && (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '4px',
                    fontSize: '12px', fontWeight: '600',
                    color: trend >= 0 ? '#059669' : '#DC2626'
                }}>
                    {trend >= 0
                        ? <ArrowUpRight size={14} />
                        : <ArrowDownRight size={14} />
                    }
                    {Math.abs(trend)}%
                </div>
            )}
        </div>
        <div style={styles.kpiValue}>{value}</div>
        <div style={styles.kpiLabel}>{label}</div>
    </div>
);

export default function Dashboard() {
    const { user } = useAuth();
    const isCommercial = user?.role === 'commercial';

    const [kpis, setKpis]           = useState(null);
    const [venteMois, setVenteMois] = useState([]);
    const [venteProd, setVenteProd] = useState([]);
    const [venteCat, setVenteCat]   = useState([]);
    const [loading, setLoading]     = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                if (isCommercial) {
                    const [k, m] = await Promise.all([
                        api.get('dashboard/kpis/'),
                        api.get('dashboard/ventes-mois/'),
                    ]);
                    setKpis(k.data);
                    setVenteMois(m.data);
                } else {
                    const [k, m, p, c] = await Promise.all([
                        api.get('dashboard/kpis/'),
                        api.get('dashboard/ventes-mois/'),
                        api.get('dashboard/ventes-produit/'),
                        api.get('dashboard/ventes-categorie/'),
                    ]);
                    setKpis(k.data);
                    setVenteMois(m.data);
                    setVenteProd(p.data);
                    setVenteCat(c.data);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [isCommercial]);

    if (loading) return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
            <Sidebar />
            <main style={{ marginLeft: '260px', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={styles.loadingBox}>
                    <TrendingUp size={32} color="#1E40AF" />
                    <p style={{ color: '#64748B', margin: '12px 0 0', fontSize: '15px' }}>Chargement du tableau de bord...</p>
                </div>
            </main>
        </div>
    );

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFC', fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
            <Sidebar />
            <main style={{ marginLeft: '260px', flex: 1, padding: '32px' }}>

                {/* ── Header ── */}
                <div style={styles.pageHeader}>
                    <div>
                        <h1 style={styles.pageTitle}>
                            {isCommercial ? `Bonjour, ${user?.username}` : 'Tableau de bord'}
                        </h1>
                        <p style={styles.pageSubtitle}>
                            {isCommercial
                                ? 'Voici un aperçu de vos performances personnelles'
                                : 'Vue générale des performances commerciales'
                            }
                        </p>
                    </div>
                    <div style={styles.dateBadge}>
                        <Calendar size={14} color="#64748B" />
                        <span>{new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                </div>

                {/* ── KPIs ── */}
                <div style={styles.kpiGrid}>
                    <KPICard
                        icon={TrendingUp}
                        value={`${kpis?.ca_total?.toLocaleString()} DH`}
                        label={isCommercial ? 'Mon chiffre d\'affaires' : 'Chiffre d\'affaires total'}
                        color="#1E40AF"
                    />
                    <KPICard
                        icon={ShoppingCart}
                        value={kpis?.nb_ventes}
                        label={isCommercial ? 'Mes ventes totales' : 'Nombre de ventes'}
                        color="#059669"
                    />
                    {isCommercial ? (
                        <>
                            <KPICard
                                icon={Star}
                                value={kpis?.produit_favori}
                                label="Mon produit le plus vendu"
                                color="#D97706"
                            />
                            <KPICard
                                icon={Calendar}
                                value={`${kpis?.ca_mois?.toLocaleString()} DH`}
                                label={`CA ce mois (${kpis?.nb_ventes_mois} ventes)`}
                                color="#7C3AED"
                            />
                        </>
                    ) : (
                        <>
                            <KPICard
                                icon={Award}
                                value={kpis?.meilleur_produit}
                                label="Meilleur produit"
                                color="#D97706"
                            />
                            <KPICard
                                icon={User}
                                value={kpis?.meilleur_commercial}
                                label="Meilleur commercial"
                                color="#7C3AED"
                            />
                        </>
                    )}
                </div>

                {/* ── Graphiques ── */}
                <div style={styles.chartsGrid}>
                    {/* Courbe évolution */}
                    <div style={{ ...styles.chartCard, gridColumn: 'span 2' }}>
                        <div style={styles.chartHeader}>
                            <div>
                                <h3 style={styles.chartTitle}>
                                    {isCommercial ? 'Évolution de mes ventes' : 'Évolution des ventes'}
                                </h3>
                                <p style={styles.chartSub}>Chiffre d'affaires mensuel (DH)</p>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={260}>
                            <LineChart data={venteMois} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                                <XAxis dataKey="mois" tick={{ fontSize: 12, fill: '#475569' }} axisLine={false} tickLine={false} />
                                 <YAxis tick={{ fontSize: 12, fill: '#475569' }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                                    formatter={(v) => [`${v.toLocaleString()} DH`, 'CA']}
                                />
                                <Line type="monotone" dataKey="ca" stroke="#1E40AF" strokeWidth={2.5} dot={{ r: 4, fill: '#1E40AF' }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Barres par produit */}
                    {!isCommercial && (
                        <div style={styles.chartCard}>
                            <div style={styles.chartHeader}>
                                <div>
                                    <h3 style={styles.chartTitle}>Ventes par produit</h3>
                                    <p style={styles.chartSub}>Top produits par CA</p>
                                </div>
                            </div>
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={venteProd} layout="vertical" margin={{ left: 10 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                                    <XAxis type="number" tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} />
                                    <YAxis dataKey="produit" type="category" tick={{ fontSize: 11, fill: '#334155' }} width={90} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0' }}
                                        formatter={(v) => [`${v.toLocaleString()} DH`, 'CA']}
                                    />
                                    <Bar dataKey="ca" fill="#1E40AF" radius={[0, 6, 6, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {/* Camembert catégorie */}
                    {!isCommercial && (
                        <div style={styles.chartCard}>
                            <div style={styles.chartHeader}>
                                <div>
                                    <h3 style={styles.chartTitle}>Répartition par catégorie</h3>
                                    <p style={styles.chartSub}>Part de chaque catégorie</p>
                                </div>
                            </div>
                            <ResponsiveContainer width="100%" height={260}>
                                <PieChart>
                                    <Pie
                                        data={venteCat}
                                        dataKey="ca"
                                        nameKey="categorie"
                                        cx="50%" cy="50%"
                                        outerRadius={95}
                                        innerRadius={40}
                                        paddingAngle={3}
                                        label={({ categorie, percent }) =>
                                            `${categorie} ${(percent * 100).toFixed(0)}%`
                                        }
                                        labelLine={false}
                                    >
                                        {venteCat.map((_, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0' }}
                                        formatter={(v) => [`${v.toLocaleString()} DH`, 'CA']}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

const styles = {
    loadingBox: {
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '40px', backgroundColor: '#fff', borderRadius: '12px',
        boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
    },
    pageHeader: {
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', marginBottom: '28px',
    },
    pageTitle: {
        fontSize: '24px', fontWeight: '700',
        color: '#0F172A', margin: '0 0 4px',
    },
    pageSubtitle: {
        fontSize: '14px', color: '#64748B', margin: 0,
    },
    dateBadge: {
        display: 'flex', alignItems: 'center', gap: '6px',
        backgroundColor: '#fff', border: '1px solid #E2E8F0',
        borderRadius: '8px', padding: '8px 14px',
        fontSize: '13px', color: '#64748B',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    },
    kpiGrid: {
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '20px', marginBottom: '24px',
    },
    kpiCard: {
        backgroundColor: '#fff', borderRadius: '12px',
        padding: '20px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
        border: '1px solid #F1F5F9',
    },
    kpiIconBox: {
        width: '40px', height: '40px', borderRadius: '10px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '16px',
    },
    kpiValue: {
        fontSize: '22px', fontWeight: '700',
        color: '#0F172A', marginBottom: '4px',
    },
    kpiLabel: {
        fontSize: '13px', color: '#64748B',
    },
    chartsGrid: {
        display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '20px',
    },
    chartCard: {
        backgroundColor: '#fff', borderRadius: '12px',
        padding: '24px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
        border: '1px solid #F1F5F9',
    },
    chartHeader: {
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', marginBottom: '20px',
    },
    chartTitle: {
        fontSize: '15px', fontWeight: '600',
        color: '#0F172A', margin: '0 0 4px',
    },
    chartSub: {
        fontSize: '12px', color: '#94A3B8', margin: 0,
    },
};