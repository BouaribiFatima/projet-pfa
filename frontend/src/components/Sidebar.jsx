// src/components/Sidebar.jsx
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard, Package, ShoppingCart,
    TrendingUp, FileText, Users, LogOut,
    BarChart2
} from 'lucide-react';

const navItems = [
    { path: '/dashboard',    label: 'Tableau de bord',    icon: LayoutDashboard,  roles: ['superadmin', 'manager', 'commercial'] },
    { path: '/produits',     label: 'Produits',            icon: Package,          roles: ['superadmin', 'manager'] },
    { path: '/ventes',       label: 'Ventes',              icon: ShoppingCart,     roles: ['superadmin', 'manager', 'commercial'] },
    { path: '/previsions',   label: 'Prévisions',          icon: TrendingUp,       roles: ['superadmin', 'manager'] },
    { path: '/rapports',     label: 'Rapports',            icon: FileText,         roles: ['superadmin', 'manager'] },
    { path: '/utilisateurs', label: 'Utilisateurs',        icon: Users,            roles: ['superadmin'] },
];

export default function Sidebar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const filtered = navItems.filter(item => item.roles.includes(user?.role));

    return (
        <aside style={styles.sidebar}>
            {/* Logo */}
            <div style={styles.logoContainer}>
                <div style={styles.logoIcon}>
                    <BarChart2 size={22} color="#FFFFFF" />
                </div>
                <div>
                    <div style={styles.logoText}>PréviVentes</div>
                    <div style={styles.logoSub}>Gestion des ventes</div>
                </div>
            </div>

            {/* Séparateur */}
            <div style={styles.divider} />

            {/* Navigation */}
            <nav style={styles.nav}>
                <p style={styles.navLabel}>MENU PRINCIPAL</p>
                {filtered.map(item => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                        <div
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            style={isActive ? styles.navItemActive : styles.navItem}
                            onMouseEnter={e => {
                                if (!isActive) e.currentTarget.style.backgroundColor = '#1E293B';
                            }}
                            onMouseLeave={e => {
                                if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                        >
                            <Icon size={18} style={{ flexShrink: 0 }} />
                            <span style={styles.navLabel2}>{item.label}</span>
                            {isActive && <div style={styles.activeIndicator} />}
                        </div>
                    );
                })}
            </nav>

            {/* Bottom — User info */}
            <div style={styles.bottom}>
                <div style={styles.divider} />
                <div style={styles.userCard}>
                    <div style={styles.avatar}>
                        {user?.username?.charAt(0).toUpperCase()}
                    </div>
                    <div style={styles.userInfo}>
                        <div style={styles.userName}>{user?.username}</div>
                        <div style={styles.userRole}>{user?.role}</div>
                    </div>
                </div>
                <button onClick={handleLogout} style={styles.logoutBtn}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1E293B'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <LogOut size={16} />
                    <span>Déconnexion</span>
                </button>
            </div>
        </aside>
    );
}

const styles = {
    sidebar: {
        width: '260px',
        backgroundColor: '#0F172A',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        top: 0,
        left: 0,
        zIndex: 100,
        boxShadow: '4px 0 10px rgba(0,0,0,0.15)',
    },
    logoContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '24px 20px',
    },
    logoIcon: {
        width: '40px',
        height: '40px',
        backgroundColor: '#1E40AF',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    logoText: {
        color: '#FFFFFF',
        fontSize: '16px',
        fontWeight: '700',
        letterSpacing: '0.3px',
    },
    logoSub: {
        color: '#64748B',
        fontSize: '11px',
        marginTop: '1px',
    },
    divider: {
        height: '1px',
        backgroundColor: '#1E293B',
        margin: '0 20px',
    },
    nav: {
        flex: 1,
        padding: '16px 12px',
        overflowY: 'auto',
    },
    navLabel: {
        color: '#475569',
        fontSize: '10px',
        fontWeight: '600',
        letterSpacing: '1px',
        padding: '8px 8px 12px',
        margin: 0,
    },
    navItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '10px 12px',
        borderRadius: '8px',
        cursor: 'pointer',
        color: '#94A3B8',
        fontSize: '14px',
        fontWeight: '500',
        marginBottom: '2px',
        transition: 'all 0.15s',
        position: 'relative',
        backgroundColor: 'transparent',
    },
    navItemActive: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '10px 12px',
        borderRadius: '8px',
        cursor: 'pointer',
        color: '#FFFFFF',
        fontSize: '14px',
        fontWeight: '600',
        marginBottom: '2px',
        backgroundColor: '#1E40AF',
        position: 'relative',
    },
    navLabel2: {
        flex: 1,
    },
    activeIndicator: {
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        backgroundColor: '#93C5FD',
    },
    bottom: {
        padding: '0 0 16px',
    },
    userCard: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '16px 20px',
    },
    avatar: {
        width: '36px',
        height: '36px',
        borderRadius: '8px',
        backgroundColor: '#1E40AF',
        color: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: '700',
        fontSize: '14px',
        flexShrink: 0,
    },
    userInfo: {
        flex: 1,
        overflow: 'hidden',
    },
    userName: {
        color: '#F1F5F9',
        fontSize: '13px',
        fontWeight: '600',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    userRole: {
        color: '#64748B',
        fontSize: '11px',
        marginTop: '1px',
        textTransform: 'capitalize',
    },
    logoutBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        width: 'calc(100% - 24px)',
        margin: '0 12px',
        padding: '10px 12px',
        backgroundColor: 'transparent',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        color: '#94A3B8',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'all 0.15s',
    },
};