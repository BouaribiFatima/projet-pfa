// src/pages/Utilisateurs.jsx
import { useEffect, useState } from 'react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { theme } from '../styles/theme';
import {
    Users, Plus, Pencil, Trash2, Lock,
    ShieldCheck, BarChart3, User as UserIcon, X
} from 'lucide-react';

export default function Utilisateurs() {
    const { user: currentUser } = useAuth();
    const [users, setUsers]       = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [loading, setLoading]   = useState(true);
    const [erreur, setErreur]     = useState('');
    const [form, setForm] = useState({
        username: '', email: '', first_name: '',
        last_name: '', role: 'commercial',
        password: '', is_active: true
    });

    useEffect(() => { fetchUsers(); }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const r = await api.get('users/');
            setUsers(r.data);
        } catch (e) {
            setErreur(e.response?.data?.erreur || 'Erreur de chargement');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => setForm({
        username: '', email: '', first_name: '',
        last_name: '', role: 'commercial',
        password: '', is_active: true
    });

    const handleSubmit = async () => {
        if (!form.username) return;
        try {
            if (editItem) {
                await api.put(`users/${editItem.id}/`, form);
            } else {
                if (!form.password) return alert('Mot de passe requis !');
                await api.post('users/', form);
            }
            setShowForm(false);
            setEditItem(null);
            resetForm();
            fetchUsers();
        } catch (e) {
            alert(e.response?.data?.username?.[0] || 'Erreur lors de la sauvegarde');
        }
    };

    const handleEdit = (u) => {
        setEditItem(u);
        setForm({
            username: u.username, email: u.email,
            first_name: u.first_name, last_name: u.last_name,
            role: u.role, password: '', is_active: u.is_active
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Supprimer cet utilisateur ?')) {
            await api.delete(`users/${id}/`);
            fetchUsers();
        }
    };

    const roleConfig = (role) => ({
        superadmin: { bg: '#FEF3C7', color: theme.colors.warning, icon: ShieldCheck, label: 'Super Admin' },
        manager:    { bg: theme.colors.primaryLight, color: theme.colors.primary, icon: BarChart3, label: 'Manager' },
        commercial: { bg: '#D1FAE5', color: theme.colors.success, icon: UserIcon, label: 'Commercial' },
    }[role] || { bg: '#F1F5F9', color: theme.colors.textSecondary, icon: UserIcon, label: role });

    // Accès réservé au Super Admin
    if (currentUser?.role !== 'superadmin') {
        return (
            <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: theme.colors.background }}>
                <Sidebar />
                <main style={{ marginLeft: '260px', flex: 1, padding: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            width: '72px', height: '72px', borderRadius: '16px',
                            backgroundColor: '#FEE2E2', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', margin: '0 auto 16px'
                        }}>
                            <Lock size={32} color={theme.colors.danger} />
                        </div>
                        <h2 style={{ color: theme.colors.textPrimary, margin: '0 0 6px' }}>Accès refusé</h2>
                        <p style={{ color: theme.colors.textSecondary, margin: 0 }}>
                            Seul le Super Admin peut gérer les utilisateurs.
                        </p>
                    </div>
                </main>
            </div>
        );
    }

    const statCards = ['superadmin', 'manager', 'commercial'].map(role => {
        const cfg = roleConfig(role);
        return { role, ...cfg, count: users.filter(u => u.role === role).length };
    });

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: theme.colors.background, fontFamily: 'Segoe UI, sans-serif' }}>
            <Sidebar />
            <main style={{ marginLeft: '260px', flex: 1, padding: '32px' }}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div>
                        <h1 style={{
                            fontSize: '24px', fontWeight: '700', color: theme.colors.textPrimary,
                            margin: 0, display: 'flex', alignItems: 'center', gap: '10px'
                        }}>
                            <Users size={24} color={theme.colors.primary} />
                            Utilisateurs
                        </h1>
                        <p style={{ color: theme.colors.textSecondary, fontSize: '14px', margin: '4px 0 0' }}>
                            {users.length} utilisateur{users.length !== 1 ? 's' : ''} au total
                        </p>
                    </div>
                    <button
                        onClick={() => { setShowForm(true); setEditItem(null); resetForm(); }}
                        style={styles.addBtn}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = theme.colors.primaryDark}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = theme.colors.primary}
                    >
                        <Plus size={16} /> Ajouter un utilisateur
                    </button>
                </div>

                {/* Stats rapides */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                    {statCards.map(({ role, bg, color, icon: Icon, label, count }) => (
                        <div key={role} style={styles.statCard}>
                            <div style={{
                                width: '48px', height: '48px', borderRadius: '12px',
                                backgroundColor: bg, display: 'flex', alignItems: 'center',
                                justifyContent: 'center', flexShrink: 0
                            }}>
                                <Icon size={22} color={color} />
                            </div>
                            <div>
                                <div style={{ fontSize: '24px', fontWeight: '700', color: theme.colors.textPrimary }}>
                                    {count}
                                </div>
                                <div style={{ fontSize: '13px', color: theme.colors.textSecondary }}>{label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Modal */}
                {showForm && (
                    <div style={styles.overlay}>
                        <div style={styles.modal}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h2 style={styles.modalTitle}>
                                    {editItem ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
                                </h2>
                                <button
                                    onClick={() => setShowForm(false)}
                                    style={styles.closeBtn}
                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = theme.colors.background}
                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <X size={18} color={theme.colors.textSecondary} />
                                </button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <label style={styles.label}>Prénom</label>
                                    <input style={styles.input} placeholder="Prénom"
                                        value={form.first_name}
                                        onChange={e => setForm({ ...form, first_name: e.target.value })}
                                        onFocus={e => e.target.style.borderColor = theme.colors.primary}
                                        onBlur={e => e.target.style.borderColor = theme.colors.border} />
                                </div>
                                <div>
                                    <label style={styles.label}>Nom</label>
                                    <input style={styles.input} placeholder="Nom"
                                        value={form.last_name}
                                        onChange={e => setForm({ ...form, last_name: e.target.value })}
                                        onFocus={e => e.target.style.borderColor = theme.colors.primary}
                                        onBlur={e => e.target.style.borderColor = theme.colors.border} />
                                </div>
                            </div>

                            <label style={styles.label}>Nom d'utilisateur *</label>
                            <input style={styles.input} placeholder="username"
                                autoComplete="off"
                                value={form.username}
                                onChange={e => setForm({ ...form, username: e.target.value.replace(/\s/g, '_') })}
                                onFocus={e => e.target.style.borderColor = theme.colors.primary}
                                onBlur={e => e.target.style.borderColor = theme.colors.border} />

                            <label style={styles.label}>Email</label>
                            <input style={styles.input} type="email" placeholder="email@example.com"
                                value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })}
                                onFocus={e => e.target.style.borderColor = theme.colors.primary}
                                onBlur={e => e.target.style.borderColor = theme.colors.border} />

                            <label style={styles.label}>Rôle</label>
                            <select style={styles.input} value={form.role}
                                onChange={e => setForm({ ...form, role: e.target.value })}
                                onFocus={e => e.target.style.borderColor = theme.colors.primary}
                                onBlur={e => e.target.style.borderColor = theme.colors.border}>
                                <option value="commercial">Commercial</option>
                                <option value="manager">Manager</option>
                                <option value="superadmin">Super Admin</option>
                            </select>

                            <label style={styles.label}>
                                {editItem ? 'Nouveau mot de passe (laisser vide = inchangé)' : 'Mot de passe *'}
                            </label>
                            <input style={styles.input} type="password"
                                autoComplete="new-password"
                                placeholder={editItem ? 'Laisser vide pour ne pas changer' : 'Mot de passe'}
                                value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })}
                                onFocus={e => e.target.style.borderColor = theme.colors.primary}
                                onBlur={e => e.target.style.borderColor = theme.colors.border} />

                            <label style={styles.checkboxLabel}>
                                <input type="checkbox" checked={form.is_active}
                                    onChange={e => setForm({ ...form, is_active: e.target.checked })} />
                                Compte actif
                            </label>

                            <div style={styles.modalBtns}>
                                <button onClick={() => setShowForm(false)} style={styles.cancelBtn}
                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = theme.colors.background}
                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = theme.colors.white}>
                                    Annuler
                                </button>
                                <button onClick={handleSubmit} style={styles.saveBtn}
                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = theme.colors.primaryDark}
                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = theme.colors.primary}>
                                    {editItem ? 'Modifier' : 'Ajouter'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tableau */}
                {loading ? (
                    <p style={{ color: theme.colors.textSecondary }}>Chargement...</p>
                ) : erreur ? (
                    <div style={{ backgroundColor: '#FEE2E2', color: theme.colors.danger, padding: '16px', borderRadius: '8px' }}>
                        {erreur}
                    </div>
                ) : (
                    <div style={styles.tableWrapper}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: theme.colors.background }}>
                                    <th style={styles.th}>#</th>
                                    <th style={styles.th}>Nom complet</th>
                                    <th style={styles.th}>Username</th>
                                    <th style={styles.th}>Email</th>
                                    <th style={styles.th}>Rôle</th>
                                    <th style={styles.th}>Statut</th>
                                    <th style={styles.th}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u, i) => {
                                    const cfg = roleConfig(u.role);
                                    return (
                                        <tr key={u.id} style={{ backgroundColor: i % 2 === 0 ? theme.colors.white : '#FAFBFC' }}>
                                            <td style={styles.td}>{u.id}</td>
                                            <td style={styles.td}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div style={{
                                                        width: '32px', height: '32px', borderRadius: '8px',
                                                        backgroundColor: theme.colors.primary, color: theme.colors.white,
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontWeight: '700', fontSize: '13px', flexShrink: 0
                                                    }}>
                                                        {u.username?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <strong style={{ color: theme.colors.textPrimary }}>
                                                        {u.first_name} {u.last_name}
                                                    </strong>
                                                </div>
                                            </td>
                                            <td style={styles.td}>{u.username}</td>
                                            <td style={styles.td}>{u.email || '—'}</td>
                                            <td style={styles.td}>
                                                <span style={{
                                                    backgroundColor: cfg.bg, color: cfg.color,
                                                    padding: '4px 12px', borderRadius: '20px',
                                                    fontSize: '12px', fontWeight: '600', display: 'inline-flex',
                                                    alignItems: 'center', gap: '6px'
                                                }}>
                                                    <cfg.icon size={12} /> {cfg.label}
                                                </span>
                                            </td>
                                            <td style={styles.td}>
                                                <span style={{
                                                    backgroundColor: u.is_active ? '#D1FAE5' : '#FEE2E2',
                                                    color: u.is_active ? theme.colors.success : theme.colors.danger,
                                                    padding: '4px 12px', borderRadius: '20px',
                                                    fontSize: '12px', fontWeight: '600'
                                                }}>
                                                    {u.is_active ? 'Actif' : 'Inactif'}
                                                </span>
                                            </td>
                                            <td style={styles.td}>
                                                <button onClick={() => handleEdit(u)} style={styles.iconBtn}
                                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = theme.colors.primaryLight}
                                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                                                    <Pencil size={15} color={theme.colors.primary} />
                                                </button>
                                                {u.id !== currentUser.id && (
                                                    <button onClick={() => handleDelete(u.id)} style={styles.iconBtn}
                                                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#FEE2E2'}
                                                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                                                        <Trash2 size={15} color={theme.colors.danger} />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    );
}

const styles = {
    addBtn: {
        display: 'flex', alignItems: 'center', gap: '8px',
        backgroundColor: theme.colors.primary, color: theme.colors.white,
        border: 'none', borderRadius: '8px', padding: '10px 20px',
        cursor: 'pointer', fontWeight: '600', fontSize: '14px',
        transition: 'background-color 0.15s',
    },
    statCard: {
        backgroundColor: theme.colors.white, borderRadius: '12px', padding: '20px',
        boxShadow: '0 1px 8px rgba(0,0,0,0.06)', display: 'flex',
        alignItems: 'center', gap: '16px',
    },
    overlay: {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(15,23,42,0.5)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    },
    modal: {
        backgroundColor: theme.colors.white, borderRadius: '12px', padding: '32px',
        width: '480px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        maxHeight: '90vh', overflowY: 'auto',
    },
    modalTitle: { fontSize: '18px', fontWeight: '700', margin: 0, color: theme.colors.textPrimary },
    closeBtn: {
        background: 'none', border: 'none', cursor: 'pointer', padding: '6px',
        borderRadius: '6px', display: 'flex', transition: 'background-color 0.15s',
    },
    label: { display: 'block', fontSize: '13px', fontWeight: '600', color: theme.colors.textPrimary, marginBottom: '6px' },
    input: {
        width: '100%', padding: '10px', border: `1px solid ${theme.colors.border}`,
        borderRadius: '8px', fontSize: '14px', marginBottom: '16px',
        boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.15s',
        color: theme.colors.textPrimary, backgroundColor: theme.colors.white,
    },
    checkboxLabel: {
        display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px',
        color: theme.colors.textPrimary, marginBottom: '20px', cursor: 'pointer',
    },
    modalBtns: { display: 'flex', gap: '10px', justifyContent: 'flex-end' },
    cancelBtn: {
        padding: '10px 20px', border: `1px solid ${theme.colors.border}`, borderRadius: '8px',
        cursor: 'pointer', backgroundColor: theme.colors.white, color: theme.colors.textPrimary,
        fontWeight: '600', fontSize: '14px', transition: 'background-color 0.15s',
    },
    saveBtn: {
        padding: '10px 20px', backgroundColor: theme.colors.primary, color: theme.colors.white,
        border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600',
        fontSize: '14px', transition: 'background-color 0.15s',
    },
    tableWrapper: {
        backgroundColor: theme.colors.white, borderRadius: '12px',
        boxShadow: '0 1px 8px rgba(0,0,0,0.06)', overflow: 'hidden',
    },
    th: {
        padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600',
        color: theme.colors.textPrimary, borderBottom: `1px solid ${theme.colors.border}`,
    },
    td: {
        padding: '12px 16px', fontSize: '14px', color: theme.colors.textPrimary,
        borderBottom: `1px solid ${theme.colors.background}`,
    },
    iconBtn: {
        background: 'none', border: 'none', cursor: 'pointer', padding: '6px',
        borderRadius: '6px', marginRight: '4px', display: 'inline-flex',
        transition: 'background-color 0.15s',
    },
};