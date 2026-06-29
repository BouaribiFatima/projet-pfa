// src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Layout from '../components/Layout';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  Tooltip, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend,
} from 'recharts';
import {
  TrendingUp, ShoppingCart, User, Calendar,
  Sparkles, Package, Target
} from 'lucide-react';

const COLORS = ['#1A5276', '#C1440E', '#B7860B', '#1E6B40', '#DC2626'];

const money = (v) => {
  if (v === null || v === undefined) return '—';
  return `${Number(v).toLocaleString()} DH`;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #E2E8F0',
      borderRadius: 10,
      padding: '10px 14px',
      boxShadow: '0 8px 20px rgba(15,23,42,0.12)',
      fontSize: 13
    }}>
      <div style={{ color: '#64748B', marginBottom: 4, fontWeight: 600 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, fontWeight: 600 }}>
          {p.name}: {typeof p.value === 'number' ? money(p.value) : p.value}
        </div>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const { user } = useAuth();
  const isCommercial = user?.role === 'commercial';

  const [kpis, setKpis] = useState(null);
  const [venteMois, setVenteMois] = useState([]);
  const [venteProd, setVenteProd] = useState([]);
  const [venteCat, setVenteCat] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <Layout>
        <div style={styles.loadingState}>
          <div style={styles.spinner}></div>
          <span>Chargement du tableau de bord...</span>
        </div>
      </Layout>
    );
  }

  const kpiCards = isCommercial ? [
    {
      label: 'Mon chiffre d’affaires',
      value: money(kpis?.ca_total),
      color: 'terracotta',
      icon: TrendingUp,
      delta: '+12.4% ce mois'
    },
    {
      label: 'Mes ventes totales',
      value: kpis?.nb_ventes ?? '—',
      color: 'bleu',
      icon: ShoppingCart,
      delta: '+8.1% vs mois préc.'
    },
    {
      label: 'Produit le plus vendu',
      value: kpis?.produit_favori ?? '—',
      color: 'or',
      icon: Package,
      delta: 'Top performance'
    },
    {
      label: 'CA ce mois',
      value: money(kpis?.ca_mois),
      color: 'vert',
      icon: Calendar,
      delta: 'Objectif en cours'
    },
  ] : [
    {
      label: "Chiffre d'affaires total",
      value: money(kpis?.ca_total),
      color: 'terracotta',
      icon: TrendingUp,
      delta: '+12.4% vs mois préc.'
    },
    {
      label: 'Nombre de ventes',
      value: kpis?.nb_ventes ?? '—',
      color: 'bleu',
      icon: ShoppingCart,
      delta: '+8.1% vs mois préc.'
    },
    {
      label: 'Meilleur produit',
      value: kpis?.meilleur_produit ?? '—',
      color: 'or',
      icon: Package,
      delta: 'Produit leader'
    },
    {
      label: 'Meilleur commercial',
      value: kpis?.meilleur_commercial ?? '—',
      color: 'vert',
      icon: User,
      delta: 'Top commercial'
    },
  ];

   return (
    <Layout>
      <div style={styles.page}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: 18,
          }}
        >
          {!isCommercial && (
            <button
              style={styles.btnPrimary}
              onClick={() => window.location.href = '/previsions'}
            >
              <Sparkles size={16} />
              Lancer prévision
            </button>
          )}
        </div>

        <div style={styles.kpiGrid}>
          {kpiCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <div key={i} style={{ ...styles.kpiCard, ...styles[`kpi_${card.color}`] }}>
                <div style={{ ...styles.kpiIcon, ...styles[`icon_${card.color}`] }}>
                  <Icon size={18} />
                </div>
                <div style={styles.kpiValue}>{card.value}</div>
                <div style={styles.kpiLabel}>{card.label}</div>
                <div style={styles.kpiDelta}>{card.delta}</div>
              </div>
            );
          })}
        </div>

        <div
          style={{
            ...styles.chartGrid,
            gridTemplateColumns: isCommercial ? '1fr' : '2fr 1fr',
          }}
        >
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <div style={styles.cardTitle}>Évolution du CA mensuel</div>
                <div style={styles.cardSub}>
                  {isCommercial ? 'Vos ventes mensuelles' : 'Ventes globales des équipes'}
                </div>
              </div>
              <span style={styles.badge}>Analyse active</span>
            </div>

            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={venteMois}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="mois" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="ca" stroke="#1A5276" strokeWidth={3} dot={{ r: 4, fill: '#1A5276' }} activeDot={{ r: 6 }} name="CA" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {!isCommercial && (
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <div>
                  <div style={styles.cardTitle}>Répartition par catégorie</div>
                  <div style={styles.cardSub}>Part du chiffre d’affaires</div>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={venteCat} dataKey="ca" nameKey="categorie" cx="50%" cy="50%" outerRadius={90} innerRadius={52}>
                    {venteCat.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [money(v), 'CA']} />
                  <Legend iconSize={10} iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {!isCommercial && (
          <div style={styles.bottomGrid}>
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <div>
                  <div style={styles.cardTitle}>Ventes par produit</div>
                  <div style={styles.cardSub}>Classement par chiffre d’affaires</div>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={venteProd} layout="vertical" barSize={12}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                  <YAxis dataKey="produit" type="category" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} width={110} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="ca" fill="#C1440E" radius={[0, 6, 6, 0]} name="CA" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <div>
                  <div style={styles.cardTitle}>Objectifs mensuels</div>
                  <div style={styles.cardSub}>Suivi des performances</div>
                </div>
                <span style={styles.badgeGold}>Juin 2026</span>
              </div>

              <Goal label="CA mensuel" value={80} color="#C1440E" />
              <Goal label="Commandes" value={67} color="#1A5276" />
              <Goal label="Fidélité" value={91} color="#1E6B40" />
              <Goal label="Nouveaux clients" value={54} color="#B7860B" />

              <div style={styles.forecastBox}>
                <div style={styles.forecastTitle}>
                  <Target size={15} />
                  Prévision Juillet
                </div>
                <div style={styles.forecastText}>
                  Hausse estimée de <strong>+17%</strong> selon l’évolution actuelle des ventes.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

function Goal({ label, value, color }) {
  return (
    <div style={styles.goalRow}>
      <div style={styles.goalLabel}>{label}</div>
      <div style={styles.goalTrack}>
        <div style={{ ...styles.goalFill, width: `${value}%`, background: color }} />
      </div>
      <div style={styles.goalPct}>{value}%</div>
    </div>
  );
}

const styles = {
  page: {
    padding: '22px',
    background: '#F4F0E8',
    minHeight: '100vh',
  },
  dashboardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '18px',
  },
  title: {
    margin: 0,
    fontSize: '24px',
    color: '#0F172A',
    fontWeight: 700,
  },
  subtitle: {
    margin: '4px 0 0',
    color: '#64748B',
    fontSize: '14px',
  },
  btnPrimary: {
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    background: '#C1440E',
    color: '#FFFFFF',
    border: 'none',
    padding: '10px 14px',
    borderRadius: '9px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: '14px',
    marginBottom: '18px',
  },
  kpiCard: {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '14px',
    padding: '16px',
    position: 'relative',
    overflow: 'hidden',
  },
  kpi_terracotta: { borderTop: '4px solid #C1440E' },
  kpi_bleu: { borderTop: '4px solid #1A5276' },
  kpi_or: { borderTop: '4px solid #B7860B' },
  kpi_vert: { borderTop: '4px solid #1E6B40' },
  kpiIcon: {
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '12px',
  },
  icon_terracotta: { background: '#F5E8E3', color: '#C1440E' },
  icon_bleu: { background: '#D6EAF8', color: '#1A5276' },
  icon_or: { background: '#FEF9E7', color: '#B7860B' },
  icon_vert: { background: '#D5F5E3', color: '#1E6B40' },
  kpiValue: {
    fontSize: '22px',
    fontWeight: 700,
    color: '#0F172A',
    marginBottom: '4px',
  },
  kpiLabel: {
    fontSize: '13px',
    color: '#64748B',
  },
  kpiDelta: {
    fontSize: '12px',
    color: '#1E6B40',
    marginTop: '8px',
    fontWeight: 600,
  },
  chartGrid: {
    display: 'grid',
    gap: '18px',
    marginBottom: '18px',
  },
  bottomGrid: {
    display: 'grid',
    gridTemplateColumns: '1.4fr 1fr',
    gap: '18px',
  },
  card: {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '14px',
    padding: '18px',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '14px',
    gap: '10px',
  },
  cardTitle: {
    fontSize: '15px',
    fontWeight: 700,
    color: '#0F172A',
  },
  cardSub: {
    fontSize: '12px',
    color: '#64748B',
    marginTop: '2px',
  },
  badge: {
    background: '#D6EAF8',
    color: '#1A5276',
    padding: '5px 10px',
    borderRadius: '999px',
    fontSize: '11px',
    fontWeight: 700,
  },
  badgeGold: {
    background: '#FEF9E7',
    color: '#B7860B',
    padding: '5px 10px',
    borderRadius: '999px',
    fontSize: '11px',
    fontWeight: 700,
  },
  goalRow: {
    display: 'grid',
    gridTemplateColumns: '110px 1fr 42px',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '13px',
  },
  goalLabel: {
    color: '#475569',
    fontSize: '13px',
  },
  goalTrack: {
    height: '8px',
    background: '#E2E8F0',
    borderRadius: '999px',
    overflow: 'hidden',
  },
  goalFill: {
    height: '100%',
    borderRadius: '999px',
  },
  goalPct: {
    color: '#64748B',
    fontSize: '12px',
    textAlign: 'right',
    fontWeight: 600,
  },
  forecastBox: {
    marginTop: '18px',
    padding: '14px',
    background: '#D6EAF8',
    borderLeft: '4px solid #1A5276',
    borderRadius: '10px',
  },
  forecastTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#1A5276',
    fontWeight: 700,
    fontSize: '13px',
    marginBottom: '5px',
  },
  forecastText: {
    color: '#1A5276',
    fontSize: '13px',
    lineHeight: 1.5,
  },
  loadingState: {
    minHeight: '70vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '12px',
    color: '#64748B',
  },
  spinner: {
    width: '22px',
    height: '22px',
    border: '3px solid #E2E8F0',
    borderTop: '3px solid #C1440E',
    borderRadius: '50%',
  },
};