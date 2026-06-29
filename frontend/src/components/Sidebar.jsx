import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  TrendingUp,
  FileText,
  Users,
  LogOut,
  ChevronRight,
  X,
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard, roles: ['superadmin', 'manager', 'commercial'] },
  { path: '/previsions', label: 'Prévisions', icon: TrendingUp, roles: ['superadmin', 'manager'] },
  { path: '/ventes', label: 'Ventes', icon: ShoppingCart, roles: ['superadmin', 'manager', 'commercial'] },
  { path: '/produits', label: 'Produits', icon: Package, roles: ['superadmin', 'manager'] },
  { path: '/rapports', label: 'Rapports', icon: FileText, roles: ['superadmin', 'manager'] },
  { path: '/utilisateurs', label: 'Utilisateurs', icon: Users, roles: ['superadmin'] },
];
const GrowthLogo = ({ size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 25H27" />
    <path d="M5 25V7" />
    <path d="M8 21L14 15L19 17L27 8" />
    <path d="M23 8H27V12" />
  </svg>
);

export default function Sidebar({ isOpen = false, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const filteredItems = navItems.filter(item => item.roles.includes(user?.role));

  return (
    <aside style={{
      ...styles.sidebar,
      ...(isOpen ? styles.sidebarOpen : {})
    }}>
      <div style={styles.logoArea}>
        <div style={styles.logoIcon}>
          <GrowthLogo size={22} />
        </div>

        <div style={{ flex: 1 }}>
          <div style={styles.logoText}>PréviVentes</div>
          <div style={styles.logoSub}>Plateforme de prévision</div>
        </div>

        <button style={styles.closeBtn} onClick={onClose}>
          <X size={18} />
        </button>
      </div>

      <nav style={styles.nav}>
        <div style={styles.navSection}>
          <div style={styles.navLabel}>Principal</div>

          {filteredItems.map(item => {
            const Icon = item.icon;
            const active = location.pathname === item.path;

            return (
              <button
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                style={{
                  ...styles.navItem,
                  ...(active ? styles.navItemActive : {})
                }}
              >
                <Icon size={18} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {active && <ChevronRight size={15} />}
              </button>
            );
          })}
        </div>
      </nav>

      <div style={styles.footer}>
        <div style={styles.userCard}>
          <div style={styles.avatar}>
            {user?.username?.charAt(0)?.toUpperCase() || 'U'}
          </div>

          <div style={styles.userInfo}>
            <div style={styles.userName}>{user?.username || 'Utilisateur'}</div>
            <div style={styles.userRole}>{user?.role || 'role'}</div>
          </div>
        </div>

        <button style={styles.logoutBtn} onClick={handleLogout}>
          <LogOut size={16} />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: 240,
    height: '100vh',
    background: '#1A5276',
    color: '#FFFFFF',
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 100,
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '4px 0 18px rgba(15,23,42,0.18)',
  },
  sidebarOpen: {
    transform: 'translateX(0)',
  },
  logoArea: {
    padding: '22px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    borderBottom: '1px solid rgba(255,255,255,0.12)',
  },
  logoIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    background: '#C1440E',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#FFFFFF',
    boxShadow: '0 8px 18px rgba(193,68,14,0.35)',
  },
  logoText: {
    fontSize: 18,
    fontWeight: 800,
    letterSpacing: 0.2,
  },
  logoSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.58)',
    marginTop: 2,
  },
  closeBtn: {
    display: 'none',
    background: 'rgba(255,255,255,0.1)',
    border: 'none',
    color: '#FFFFFF',
    width: 32,
    height: 32,
    borderRadius: 10,
    cursor: 'pointer',
  },
  nav: {
    flex: 1,
    padding: '16px 10px',
    overflowY: 'auto',
  },
  navSection: {
    marginBottom: 18,
  },
  navLabel: {
    color: 'rgba(255,255,255,0.38)',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    padding: '8px 10px',
    fontWeight: 800,
  },
  navItem: {
    width: '100%',
    border: 'none',
    background: 'transparent',
    color: 'rgba(255,255,255,0.75)',
    display: 'flex',
    alignItems: 'center',
    gap: 11,
    padding: '11px 12px',
    borderRadius: 10,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 4,
    transition: '0.18s ease',
    textAlign: 'left',
  },
  navItemActive: {
    background: '#C1440E',
    color: '#FFFFFF',
    boxShadow: '0 8px 18px rgba(193,68,14,0.28)',
  },
  footer: {
    padding: 14,
    borderTop: '1px solid rgba(255,255,255,0.12)',
  },
  userCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 12,
    background: 'rgba(255,255,255,0.08)',
    marginBottom: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: '#C1440E',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800,
    color: '#FFFFFF',
  },
  userInfo: {
    overflow: 'hidden',
  },
  userName: {
    fontSize: 13,
    fontWeight: 800,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  userRole: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.55)',
    textTransform: 'capitalize',
    marginTop: 2,
  },
  logoutBtn: {
    width: '100%',
    border: 'none',
    background: 'transparent',
    color: 'rgba(255,255,255,0.78)',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '11px 12px',
    borderRadius: 10,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 600,
  },
};