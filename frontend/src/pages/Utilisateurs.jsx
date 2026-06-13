// src/pages/Utilisateurs.jsx
import { useEffect, useState } from 'react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

export default function Utilisateurs() {
    const { user: currentUser } = useAuth();
    const [users, setUsers]     = useState([]);
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
            setForm({ username: '', email: '', first_name: '', last_name: '', role: 'commercial', password: '', is_active: true });
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

    const roleColor = (role) => ({
        superadmin: { bg: '#fef3c7', color: '#d97706' },
        manager:    { bg: '#dbeafe', color: '#1d4ed8' },
        commercial: { bg: '#dcfce7', color: '#16a34a' },
    }[role] || { bg: '#f1f5f9', color: '#64748b' });

    // Seul le superadmin peut accéder
    if (currentUser?.role !== 'superadmin') {
        return (
            <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f9fc' }}>
                <Sidebar />
                <main style={{ marginLeft: '240px', flex: 1, padding: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '64px' }}>🔒</div>
                        <h2 style={{ color: '#1a1a2e' }}>Accès refusé</h2>
                        <p style={{ color: '#94a3b8' }}>Seul le Super Admin peut gérer les utilisateurs.</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f9fc', fontFamily: 'Segoe UI, sans-serif' }}>
            <Sidebar />
            <main style={{ marginLeft: '240px', flex: 1, padding: '32px' }}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1a1a2e', margin: 0 }}>👥 Utilisateurs</h1>
                        <p style={{ color: '#94a3b8', fontSize: '14px', margin: '4px 0 0' }}>{users.length} utilisateurs au total</p>
                    </div>
                    <button onClick={() => { setShowForm(true); setEditItem(null); setForm({ username: '', email: '', first_name: '', last_name: '', role: 'commercial', password: '', is_active: true }); }}
                        style={styles.addBtn}>
                        + Ajouter un utilisateur
                    </button>
                </div>

                {/* Stats rapides */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                    {['superadmin', 'manager', 'commercial'].map(role => (
                        <div key={role} style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ fontSize: '32px' }}>
                                {role === 'superadmin' ? '🔐' : role === 'manager' ? '📊' : '👤'}
                            </div>
                            <div>
                                <div style={{ fontSize: '24px', fontWeight: '700', color: '#1a1a2e' }}>
                                    {users.filter(u => u.role === role).length}
                                </div>
                                <div style={{ fontSize: '13px', color: '#94a3b8', textTransform: 'capitalize' }}>{role}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Modal */}
                {showForm && (
                    <div style={styles.overlay}>
                        <div style={styles.modal}>
                            <h2 style={styles.modalTitle}>
                                {editItem ? '✏️ Modifier l\'utilisateur' : '➕ Nouvel utilisateur'}
                            </h2>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <label style={styles.label}>Prénom</label>
                                    <input style={styles.input} placeholder="Prénom"
                                        value={form.first_name}
                                        onChange={e => setForm({ ...form, first_name: e.target.value })} />
                                </div>
                                <div>
                                    <label style={styles.label}>Nom</label>
                                    <input style={styles.input} placeholder="Nom"
                                        value={form.last_name}
                                        onChange={e => setForm({ ...form, last_name: e.target.value })} />
                                </div>
                            </div>

                            <label style={styles.label}>Nom d'utilisateur *</label>
                            <input style={styles.input} placeholder="username"
                            autoComplete="off" 
                                value={form.username}
                                 onChange={e => setForm({ ...form, username: e.target.value.replace(/\s/g, '_') })} />

                            <label style={styles.label}>Email</label>
                            <input style={styles.input} type="email" placeholder="email@example.com"
                                value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })} />

                            <label style={styles.label}>Rôle</label>
                            <select style={styles.input} value={form.role}
                                onChange={e => setForm({ ...form, role: e.target.value })}>
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
                                onChange={e => setForm({ ...form, password: e.target.value })} />

                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#374151', marginBottom: '16px', cursor: 'pointer' }}>
                                <input type="checkbox" checked={form.is_active}
                                    onChange={e => setForm({ ...form, is_active: e.target.checked })} />
                                Compte actif
                            </label>

                            <div style={styles.modalBtns}>
                                <button onClick={() => setShowForm(false)} style={styles.cancelBtn}>Annuler</button>
                                <button onClick={handleSubmit} style={styles.saveBtn}>
                                    {editItem ? 'Modifier' : 'Ajouter'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tableau */}
                {loading ? <p>Chargement...</p> : erreur ? (
                    <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '16px', borderRadius: '8px' }}>
                        {erreur}
                    </div>
                ) : (
                    <div style={styles.tableWrapper}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f8f9fc' }}>
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
                                {users.map((u, i) => (
                                    <tr key={u.id} style={{ backgroundColor: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                                        <td style={styles.td}>{u.id}</td>
                                        <td style={styles.td}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#4f46e5', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '13px' }}>
                                                    {u.username?.charAt(0).toUpperCase()}
                                                </div>
                                                <strong>{u.first_name} {u.last_name}</strong>
                                            </div>
                                        </td>
                                        <td style={styles.td}>{u.username}</td>
                                        <td style={styles.td}>{u.email || '—'}</td>
                                        <td style={styles.td}>
                                            <span style={{ backgroundColor: roleColor(u.role).bg, color: roleColor(u.role).color, padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td style={styles.td}>
                                            <span style={{ backgroundColor: u.is_active ? '#dcfce7' : '#fee2e2', color: u.is_active ? '#16a34a' : '#dc2626', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                                                {u.is_active ? '✅ Actif' : '❌ Inactif'}
                                            </span>
                                        </td>
                                        <td style={styles.td}>
                                            <button onClick={() => handleEdit(u)} style={styles.editBtn}>✏️</button>
                                            {u.id !== currentUser.id && (
                                                <button onClick={() => handleDelete(u.id)} style={styles.deleteBtn}>🗑️</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    );
}

const styles = {
    addBtn: { backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontWeight: '600' },
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modal: { backgroundColor: '#fff', borderRadius: '12px', padding: '32px', width: '480px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' },
    modalTitle: { fontSize: '18px', fontWeight: '700', marginBottom: '20px', color: '#1a1a2e' },
    label: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' },
    input: { width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', marginBottom: '16px', boxSizing: 'border-box' },
    modalBtns: { display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' },
    cancelBtn: { padding: '10px 20px', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', backgroundColor: '#fff' },
    saveBtn: { padding: '10px 20px', backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
    tableWrapper: { backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)', overflow: 'hidden' },
    th: { padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e2e8f0' },
    td: { padding: '12px 16px', fontSize: '14px', color: '#374151', borderBottom: '1px solid #f1f5f9' },
    editBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', marginRight: '8px' },
    deleteBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' },
};