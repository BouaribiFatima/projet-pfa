import { useState } from 'react';
import Sidebar from './Sidebar';
import { useLocation } from 'react-router-dom';
import { Menu, Bell, CalendarDays } from 'lucide-react';

const pageTitles = {
  '/dashboard': 'Tableau de bord',
  '/ventes': 'Ventes',
  '/produits': 'Produits',
  '/previsions': 'Prévisions',
  '/rapports': 'Rapports',
  '/utilisateurs': 'Utilisateurs',
};

const pageSubtitles = {
  '/dashboard': "Vue d'ensemble des performances commerciales",
  '/ventes': 'Suivi et gestion des ventes',
  '/produits': 'Gestion du catalogue produit',
  '/previsions': 'Prévisions intelligentes des ventes',
  '/rapports': 'Exports et analyses commerciales',
  '/utilisateurs': 'Gestion des comptes et des rôles',
};

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const title = pageTitles[location.pathname] || 'PréviVentes';
  const subtitle = pageSubtitles[location.pathname] || 'Plateforme intelligente de prévision des ventes';

  return (
    <div style={styles.shell}>
      {sidebarOpen && (
        <div style={styles.overlay} onClick={() => setSidebarOpen(false)} />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main style={styles.main}>
        <header style={styles.topbar}>
          <div style={styles.left}>
            <button style={styles.menuBtn} onClick={() => setSidebarOpen(true)}>
              <Menu size={22} />
            </button>

            <div>
              <h1 style={styles.title}>{title}</h1>
              <p style={styles.subtitle}>{subtitle}</p>
            </div>
          </div>

          <div style={styles.right}>
            <div style={styles.dateBadge}>
              <CalendarDays size={15} />
              {new Date().toLocaleDateString('fr-FR', {
                month: 'long',
                year: 'numeric',
              })}
            </div>

            <button style={styles.iconBtn}>
              <Bell size={18} />
            </button>
          </div>
        </header>

        <section style={styles.body}>
          {children}
        </section>
      </main>
    </div>
  );
}

const styles = {
  shell: {
    minHeight: '100vh',
    background: '#F4F0E8',
    display: 'flex',
  },
  main: {
    marginLeft: 240,
    width: 'calc(100% - 240px)',
    minHeight: '100vh',
    background: '#F4F0E8',
  },
  topbar: {
    height: 78,
    background: '#FFFFFF',
    borderBottom: '1px solid #E2E8F0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    position: 'sticky',
    top: 0,
    zIndex: 50,
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  },
  menuBtn: {
    display: 'none',
    border: 'none',
    background: '#F5E8E3',
    color: '#C1440E',
    width: 42,
    height: 42,
    borderRadius: 12,
    cursor: 'pointer',
  },
  title: {
    margin: 0,
    color: '#0F172A',
    fontSize: 22,
    fontWeight: 800,
  },
  subtitle: {
    margin: '4px 0 0',
    color: '#64748B',
    fontSize: 13,
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  dateBadge: {
    height: 40,
    border: '1px solid #E2E8F0',
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    padding: '0 12px',
    color: '#1A5276',
    background: '#D6EAF8',
    fontWeight: 700,
    fontSize: 13,
    textTransform: 'capitalize',
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    border: '1px solid #E2E8F0',
    background: '#FFFFFF',
    color: '#64748B',
    cursor: 'pointer',
  },
  body: {
    padding: 0,
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(15,23,42,0.45)',
    zIndex: 90,
  },
};