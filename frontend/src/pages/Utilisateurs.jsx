// src/pages/Utilisateurs.jsx
import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import {
  Plus, Search, Edit3, Trash2, X, Users, ShieldCheck,
  UserCog, BriefcaseBusiness, Lock, CheckCircle, XCircle
} from 'lucide-react';

const emptyForm = {
  username: '',
  email: '',
  first_name: '',
  last_name: '',
  role: 'commercial',
  password: '',
  is_active: true,
};

const roleLabels = {
  superadmin: 'Super Admin',
  manager: 'Manager',
  commercial: 'Commercial',
};

export default function Utilisateurs() {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState('');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const r = await api.get('users/');
      setUsers(r.data);
      setErreur('');
    } catch (e) {
      setErreur(e.response?.data?.erreur || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return users.filter(u =>
      u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.first_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.last_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.role?.toLowerCase().includes(search.toLowerCase())
    );
  }, [users, search]);

  const openCreate = () => {
    setEditItem(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const handleEdit = (u) => {
    setEditItem(u);
    setForm({
      username: u.username || '',
      email: u.email || '',
      first_name: u.first_name || '',
      last_name: u.last_name || '',
      role: u.role || 'commercial',
      password: '',
      is_active: u.is_active,
    });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.username) {
      alert("Le nom d'utilisateur est obligatoire.");
      return;
    }

    if (!editItem && !form.password) {
      alert('Le mot de passe est obligatoire pour créer un utilisateur.');
      return;
    }

    try {
      if (editItem) {
        await api.put(`users/${editItem.id}/`, form);
      } else {
        await api.post('users/', form);
      }

      setShowForm(false);
      setEditItem(null);
      setForm(emptyForm);
      fetchUsers();
    } catch (e) {
      alert(e.response?.data?.username?.[0] || 'Erreur lors de la sauvegarde.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cet utilisateur ?')) return;

    try {
      await api.delete(`users/${id}/`);
      fetchUsers();
    } catch {
      alert('Impossible de supprimer cet utilisateur.');
    }
  };

  if (currentUser?.role !== 'superadmin') {
    return (
      <Layout>
        <div style={styles.page}>
          <div style={styles.lockCard}>
            <div style={styles.lockIcon}>
              <Lock size={30} />
            </div>
            <h2 style={styles.lockTitle}>Accès réservé</h2>
            <p style={styles.lockText}>
              Cette page est réservée uniquement au Super Admin.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={styles.page}>
        <div style={styles.hero}>
          <div>
            <div style={styles.badge}>
              <Users size={15} />
              Administration
            </div>
            <h1 style={styles.title}>Gestion des utilisateurs</h1>
            <p style={styles.subtitle}>
              Créez les comptes, gérez les rôles et contrôlez l’accès à la plateforme.
            </p>
          </div>

          <button style={styles.primaryBtn} onClick={openCreate}>
            <Plus size={18} />
            Ajouter un utilisateur
          </button>
        </div>

        <div style={styles.kpiGrid}>
          <KpiCard icon={ShieldCheck} label="Super Admins" value={users.filter(u => u.role === 'superadmin').length} color="#B7860B" bg="#FEF9E7" />
          <KpiCard icon={UserCog} label="Managers" value={users.filter(u => u.role === 'manager').length} color="#1A5276" bg="#D6EAF8" />
          <KpiCard icon={BriefcaseBusiness} label="Commerciaux" value={users.filter(u => u.role === 'commercial').length} color="#1E6B40" bg="#D5F5E3" />
          <KpiCard icon={CheckCircle} label="Comptes actifs" value={users.filter(u => u.is_active).length} color="#C1440E" bg="#F5E8E3" />
        </div>

        <div style={styles.toolbar}>
          <div style={styles.searchBox}>
            <Search size={18} />
            <input
              style={styles.searchInput}
              placeholder="Rechercher par nom, username, email ou rôle..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {showForm && (
          <div style={styles.overlay}>
            <div style={styles.modal}>
              <div style={styles.modalHeader}>
                <div>
                  <h2 style={styles.modalTitle}>
                    {editItem ? "Modifier l'utilisateur" : 'Nouvel utilisateur'}
                  </h2>
                  <p style={styles.modalSub}>
                    Définissez les informations et les droits du compte.
                  </p>
                </div>
                <button style={styles.closeBtn} onClick={() => setShowForm(false)}>
                  <X size={18} />
                </button>
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Prénom</label>
                  <input
                    style={styles.input}
                    value={form.first_name}
                    onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                    placeholder="Prénom"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Nom</label>
                  <input
                    style={styles.input}
                    value={form.last_name}
                    onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                    placeholder="Nom"
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Nom d'utilisateur *</label>
                <input
                  style={styles.input}
                  value={form.username}
                  autoComplete="off"
                  onChange={(e) => setForm({ ...form, username: e.target.value.replace(/\s/g, '_') })}
                  placeholder="Ex : manager1"
                />
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Email</label>
                  <input
                    style={styles.input}
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="email@exemple.com"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Rôle</label>
                  <select
                    style={styles.input}
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                  >
                    <option value="commercial">Commercial</option>
                    <option value="manager">Manager</option>
                    <option value="superadmin">Super Admin</option>
                  </select>
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  {editItem ? 'Nouveau mot de passe' : 'Mot de passe *'}
                </label>
                <input
                  style={styles.input}
                  type="password"
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder={editItem ? 'Laisser vide pour ne pas modifier' : 'Mot de passe'}
                />
              </div>

              <label style={styles.checkboxLine}>
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                />
                <span>Compte actif</span>
              </label>

              <div style={styles.modalFooter}>
                <button style={styles.ghostBtn} onClick={() => setShowForm(false)}>
                  Annuler
                </button>
                <button style={styles.primaryBtn} onClick={handleSubmit}>
                  {editItem ? 'Enregistrer' : 'Créer le compte'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div style={styles.card}>
          {loading ? (
            <div style={styles.loading}>Chargement des utilisateurs...</div>
          ) : erreur ? (
            <div style={styles.error}>{erreur}</div>
          ) : (
            <>
              <div style={styles.tableHeader}>
                <div>
                  <h3 style={styles.cardTitle}>Comptes utilisateurs</h3>
                  <p style={styles.cardSub}>
                    Liste des utilisateurs autorisés à accéder à PréviVentes.
                  </p>
                </div>
              </div>

              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Utilisateur</th>
                      <th style={styles.th}>Username</th>
                      <th style={styles.th}>Email</th>
                      <th style={styles.th}>Rôle</th>
                      <th style={styles.th}>Statut</th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filtered.map(u => (
                      <tr key={u.id} style={styles.tr}>
                        <td style={styles.td}>
                          <div style={styles.userCell}>
                            <div style={styles.avatar}>
                              {u.username?.charAt(0)?.toUpperCase()}
                            </div>
                            <div>
                              <div style={styles.userName}>
                                {(u.first_name || u.last_name)
                                  ? `${u.first_name || ''} ${u.last_name || ''}`
                                  : u.username}
                              </div>
                              <div style={styles.userId}>ID #{u.id}</div>
                            </div>
                          </div>
                        </td>

                        <td style={styles.tdMuted}>{u.username}</td>
                        <td style={styles.tdMuted}>{u.email || '—'}</td>

                        <td style={styles.td}>
                          <span style={getRoleStyle(u.role)}>
                            {roleLabels[u.role] || u.role}
                          </span>
                        </td>

                        <td style={styles.td}>
                          <span style={u.is_active ? styles.activeBadge : styles.inactiveBadge}>
                            {u.is_active ? <CheckCircle size={13} /> : <XCircle size={13} />}
                            {u.is_active ? 'Actif' : 'Inactif'}
                          </span>
                        </td>

                        <td style={styles.td}>
                          <div style={styles.actions}>
                            <button style={styles.iconBtn} onClick={() => handleEdit(u)}>
                              <Edit3 size={16} />
                            </button>

                            {u.id !== currentUser?.id && (
                              <button style={styles.dangerBtn} onClick={() => handleDelete(u.id)}>
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filtered.length === 0 && (
                  <div style={styles.empty}>Aucun utilisateur trouvé.</div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}

function KpiCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div style={styles.kpiCard}>
      <div style={{ ...styles.kpiIcon, background: bg, color }}>
        <Icon size={19} />
      </div>
      <div style={styles.kpiValue}>{value}</div>
      <div style={styles.kpiLabel}>{label}</div>
    </div>
  );
}

function getRoleStyle(role) {
  if (role === 'superadmin') return styles.roleAdmin;
  if (role === 'manager') return styles.roleManager;
  return styles.roleCommercial;
}

const styles = {
  page: {
    padding: 22,
    background: '#F4F0E8',
    minHeight: '100vh',
  },
  hero: {
    background: 'linear-gradient(135deg, #1A5276, #123A55)',
    color: '#FFFFFF',
    borderRadius: 18,
    padding: 24,
    marginBottom: 18,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 18,
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 7,
    padding: '6px 11px',
    borderRadius: 999,
    background: 'rgba(255,255,255,0.12)',
    fontSize: 12,
    fontWeight: 800,
    marginBottom: 10,
  },
  title: {
    margin: 0,
    fontSize: 28,
    fontWeight: 900,
  },
  subtitle: {
    margin: '7px 0 0',
    color: 'rgba(255,255,255,0.72)',
    fontSize: 14,
  },
  primaryBtn: {
    border: 'none',
    background: '#C1440E',
    color: '#FFFFFF',
    borderRadius: 12,
    padding: '11px 15px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    fontWeight: 800,
    cursor: 'pointer',
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 14,
    marginBottom: 18,
  },
  kpiCard: {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: 16,
    padding: 16,
  },
  kpiIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  kpiValue: {
    fontSize: 21,
    fontWeight: 900,
    color: '#0F172A',
  },
  kpiLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 3,
  },
  toolbar: {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: 16,
    padding: 14,
    marginBottom: 18,
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: '#F8FAFC',
    border: '1px solid #E2E8F0',
    borderRadius: 13,
    padding: '0 13px',
    height: 46,
    color: '#64748B',
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    background: 'transparent',
    width: '100%',
    fontSize: 14,
  },
  card: {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: 18,
    overflow: 'hidden',
  },
  tableHeader: {
    padding: 18,
    borderBottom: '1px solid #E2E8F0',
  },
  cardTitle: {
    margin: 0,
    fontSize: 17,
    fontWeight: 900,
    color: '#0F172A',
  },
  cardSub: {
    margin: '4px 0 0',
    fontSize: 13,
    color: '#64748B',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'left',
    padding: '14px 18px',
    background: '#F8FAFC',
    color: '#64748B',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tr: {
    borderTop: '1px solid #E2E8F0',
  },
  td: {
    padding: '15px 18px',
    color: '#334155',
    fontSize: 14,
  },
  tdMuted: {
    padding: '15px 18px',
    color: '#64748B',
    fontSize: 13,
  },
  userCell: {
    display: 'flex',
    alignItems: 'center',
    gap: 11,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: '50%',
    background: '#1A5276',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 900,
  },
  userName: {
    fontWeight: 900,
    color: '#0F172A',
  },
  userId: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  roleAdmin: {
    background: '#FEF9E7',
    color: '#B7860B',
    padding: '6px 10px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 900,
  },
  roleManager: {
    background: '#D6EAF8',
    color: '#1A5276',
    padding: '6px 10px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 900,
  },
  roleCommercial: {
    background: '#D5F5E3',
    color: '#1E6B40',
    padding: '6px 10px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 900,
  },
  activeBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    background: '#D5F5E3',
    color: '#1E6B40',
    padding: '6px 10px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 900,
  },
  inactiveBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    background: '#FEE2E2',
    color: '#DC2626',
    padding: '6px 10px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 900,
  },
  actions: {
    display: 'flex',
    gap: 8,
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    border: '1px solid #E2E8F0',
    background: '#FFFFFF',
    color: '#1A5276',
    cursor: 'pointer',
  },
  dangerBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    border: '1px solid #FECACA',
    background: '#FEF2F2',
    color: '#DC2626',
    cursor: 'pointer',
  },
  empty: {
    padding: 30,
    textAlign: 'center',
    color: '#64748B',
  },
  loading: {
    padding: 30,
    textAlign: 'center',
    color: '#64748B',
  },
  error: {
    padding: 20,
    margin: 20,
    background: '#FEE2E2',
    color: '#991B1B',
    borderRadius: 14,
    fontWeight: 800,
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(15,23,42,0.45)',
    zIndex: 200,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modal: {
    width: '100%',
    maxWidth: 680,
    background: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    boxShadow: '0 25px 70px rgba(15,23,42,0.35)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  modalTitle: {
    margin: 0,
    fontSize: 21,
    fontWeight: 900,
    color: '#0F172A',
  },
  modalSub: {
    margin: '5px 0 0',
    color: '#64748B',
    fontSize: 13,
  },
  closeBtn: {
    border: 'none',
    background: '#F8FAFC',
    color: '#64748B',
    width: 36,
    height: 36,
    borderRadius: 12,
    cursor: 'pointer',
  },
  formGroup: {
    marginBottom: 15,
    flex: 1,
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 14,
  },
  label: {
    display: 'block',
    marginBottom: 7,
    fontSize: 13,
    fontWeight: 800,
    color: '#334155',
  },
  input: {
    width: '100%',
    height: 46,
    border: '1px solid #CBD5E1',
    borderRadius: 12,
    padding: '0 13px',
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
    background: '#FFFFFF',
  },
  checkboxLine: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 13,
    cursor: 'pointer',
    marginBottom: 8,
    color: '#334155',
    fontWeight: 800,
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 18,
  },
  ghostBtn: {
    border: '1px solid #CBD5E1',
    background: '#FFFFFF',
    color: '#334155',
    borderRadius: 12,
    padding: '11px 15px',
    fontWeight: 800,
    cursor: 'pointer',
  },
  lockCard: {
    maxWidth: 460,
    margin: '80px auto',
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: 20,
    padding: 34,
    textAlign: 'center',
  },
  lockIcon: {
    width: 62,
    height: 62,
    borderRadius: 18,
    margin: '0 auto 16px',
    background: '#FEE2E2',
    color: '#DC2626',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockTitle: {
    margin: 0,
    color: '#0F172A',
    fontSize: 23,
    fontWeight: 900,
  },
  lockText: {
    color: '#64748B',
    fontSize: 14,
    marginTop: 8,
  },
};