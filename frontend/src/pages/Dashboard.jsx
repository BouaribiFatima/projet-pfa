// src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import {
    LineChart, Line, BarChart, Bar,
    PieChart, Pie, Cell, Tooltip,
    XAxis, YAxis, CartesianGrid,
    ResponsiveContainer
} from 'recharts';

const COLORS = ['#4f46e5', '#7c3aed', '#db2777', '#ea580c', '#16a34a', '#0891b2'];

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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
            <p>Chargement du dashboard...</p>
        </div>
    );

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f9fc', fontFamily: 'Segoe UI, sans-serif' }}>
            <Sidebar />
            <main style={{ marginLeft: '240px', flex: 1, padding: '32px' }}>
                <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#1a1a2e', margin: '0 0 4px' }}>
                    {isCommercial ? `Bienvenue, ${user?.username} 👋` : 'Dashboard'}
                </h1>
                <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '28px' }}>
                    {isCommercial ? 'Vue de vos performances personnelles' : 'Vue générale des performances'}
                </p>

                {/* ── KPIs ── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '28px' }}>
                    <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)', borderTop: '4px solid #4f46e5' }}>
                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>💰</div>
                        <div style={{ fontSize: '22px', fontWeight: '700', color: '#1a1a2e' }}>{kpis?.ca_total?.toLocaleString()} DH</div>
                        <div style={{ fontSize: '13px', color: '#94a3b8' }}>
                            {isCommercial ? 'Mon CA total' : 'Chiffre d\'affaires total'}
                        </div>
                    </div>
                    <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)', borderTop: '4px solid #16a34a' }}>
                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>🛒</div>
                        <div style={{ fontSize: '22px', fontWeight: '700', color: '#1a1a2e' }}>{kpis?.nb_ventes}</div>
                        <div style={{ fontSize: '13px', color: '#94a3b8' }}>
                            {isCommercial ? 'Mes ventes totales' : 'Nombre de ventes'}
                        </div>
                    </div>

                    {isCommercial ? (
                        <>
                            <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)', borderTop: '4px solid #db2777' }}>
                                <div style={{ fontSize: '24px', marginBottom: '8px' }}>⭐</div>
                                <div style={{ fontSize: '22px', fontWeight: '700', color: '#1a1a2e' }}>{kpis?.produit_favori}</div>
                                <div style={{ fontSize: '13px', color: '#94a3b8' }}>Mon produit le + vendu</div>
                            </div>
                            <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)', borderTop: '4px solid #ea580c' }}>
                                <div style={{ fontSize: '24px', marginBottom: '8px' }}>📅</div>
                                <div style={{ fontSize: '22px', fontWeight: '700', color: '#1a1a2e' }}>{kpis?.ca_mois?.toLocaleString()} DH</div>
                                <div style={{ fontSize: '13px', color: '#94a3b8' }}>CA réalisé ce mois ({kpis?.nb_ventes_mois} ventes)</div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)', borderTop: '4px solid #db2777' }}>
                                <div style={{ fontSize: '24px', marginBottom: '8px' }}>🏆</div>
                                <div style={{ fontSize: '22px', fontWeight: '700', color: '#1a1a2e' }}>{kpis?.meilleur_produit}</div>
                                <div style={{ fontSize: '13px', color: '#94a3b8' }}>Meilleur produit</div>
                            </div>
                            <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)', borderTop: '4px solid #ea580c' }}>
                                <div style={{ fontSize: '24px', marginBottom: '8px' }}>👑</div>
                                <div style={{ fontSize: '22px', fontWeight: '700', color: '#1a1a2e' }}>{kpis?.meilleur_commercial}</div>
                                <div style={{ fontSize: '13px', color: '#94a3b8' }}>Meilleur commercial</div>
                            </div>
                        </>
                    )}
                </div>

                {/* ── Graphiques ── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                    <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)', gridColumn: isCommercial ? 'span 2' : 'span 2' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#1a1a2e', margin: '0 0 16px' }}>
                            📈 {isCommercial ? 'Évolution de mes ventes (CA/mois)' : 'Évolution des ventes (CA/mois)'}
                        </h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={venteMois}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                                <XAxis dataKey="mois" tick={{ fontSize: 12 }}/>
                                <YAxis tick={{ fontSize: 12 }}/>
                                <Tooltip formatter={(v) => `${v.toLocaleString()} DH`}/>
                                <Line type="monotone" dataKey="ca" stroke="#4f46e5" strokeWidth={2} dot={{ r: 4 }}/>
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Graphiques produit/catégorie — masqués pour commercial */}
                    {!isCommercial && (
                        <>
                            <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
                                <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#1a1a2e', margin: '0 0 16px' }}>📦 Ventes par produit</h3>
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={venteProd} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                                        <XAxis type="number" tick={{ fontSize: 11 }}/>
                                        <YAxis dataKey="produit" type="category" tick={{ fontSize: 11 }} width={100}/>
                                        <Tooltip formatter={(v) => `${v.toLocaleString()} DH`}/>
                                        <Bar dataKey="ca" fill="#7c3aed" radius={[0, 4, 4, 0]}/>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
                                <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#1a1a2e', margin: '0 0 16px' }}>🥧 Répartition par catégorie</h3>
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie data={venteCat} dataKey="ca" nameKey="categorie"
                                            cx="50%" cy="50%" outerRadius={90}
                                            label={({ categorie, percent }) => `${categorie} ${(percent * 100).toFixed(0)}%`}>
                                            {venteCat.map((_, i) => (
                                                <Cell key={i} fill={COLORS[i % COLORS.length]}/>
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(v) => `${v.toLocaleString()} DH`}/>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}