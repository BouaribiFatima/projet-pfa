// src/components/Sidebar.jsx
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    // ── Menus selon le rôle ──
    const allNavItems = [
        { path: '/dashboard',    icon: '🏠', label: 'Dashboard',     roles: ['superadmin', 'manager', 'commercial'] },
        { path: '/produits',     icon: '📦', label: 'Produits',      roles: ['superadmin', 'manager'] },
        { path: '/ventes',       icon: '💰', label: 'Ventes',        roles: ['superadmin', 'manager', 'commercial'] },
        { path: '/previsions',   icon: '🔮', label: 'Prévisions',    roles: ['superadmin', 'manager'] },
        { path: '/rapports',     icon: '📄', label: 'Rapports',      roles: ['superadmin', 'manager'] },
        { path: '/utilisateurs', icon: '👥', label: 'Utilisateurs',  roles: ['superadmin'] },
    ];

    // Filtrer selon le rôle de l'utilisateur connecté
    const navItems = allNavItems.filter(item => item.roles.includes(user?.role));

    return (
        <aside style={styles.sidebar}>
            <div style={styles.logo}>📈 PréviVentes</div>
            <nav style={styles.nav}>
                {navItems.map(item => (
                    <div key={item.path}
                        onClick={() => navigate(item.path)}
                        style={location.pathname === item.path
                            ? styles.navItemActive
                            : styles.navItem}>
                        {item.icon} {item.label}
                    </div>
                ))}
            </nav>
            <div style={styles.sidebarBottom}>
                <div style={styles.userInfo}>
                    <div style={styles.avatar}>
                        {user?.username?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div style={styles.userName}>{user?.username}</div>
                        <div style={styles.userRole}>{user?.role}</div>
                    </div>
                </div>
                <button onClick={handleLogout} style={styles.logoutBtn}>
                    🚪 Déconnexion
                </button>
            </div>
        </aside>
    );
}

const styles = {
    sidebar: { width: '240px', backgroundColor: '#1a1a2e', display: 'flex', flexDirection: 'column', padding: '24px 0', position: 'fixed', height: '100vh' },
    logo: { color: '#fff', fontSize: '20px', fontWeight: '700', padding: '0 24px 32px' },
    nav: { flex: 1 },
    navItem: { padding: '12px 24px', color: '#94a3b8', cursor: 'pointer', fontSize: '14px' },
    navItemActive: { padding: '12px 24px', color: '#fff', backgroundColor: '#4f46e5', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
    sidebarBottom: { padding: '0 24px' },
    userInfo: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' },
    avatar: { width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#4f46e5', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' },
    userName: { color: '#fff', fontSize: '13px', fontWeight: '600' },
    userRole: { color: '#94a3b8', fontSize: '11px' },
    logoutBtn: { width: '100%', padding: '10px', backgroundColor: 'transparent', border: '1px solid #374151', color: '#94a3b8', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' },
};