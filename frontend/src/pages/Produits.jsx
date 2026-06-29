// src/pages/Produits.jsx
import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import {
  Plus, Search, Edit3, Trash2, X, Package, Layers, Tag,
  AlertCircle, ShoppingBag
} from 'lucide-react';

const emptyForm = { nom: '', prix: '', categorie: '' };

const money = (v) => {
  if (v === null || v === undefined || v === '') return '—';
  return `${Number(v).toLocaleString()} DH`;
};

export default function Produits() {
  const [produits, setProduits] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const { user } = useAuth();
  const canEdit = user?.role === 'superadmin' || user?.role === 'manager';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [p, c] = await Promise.all([
        api.get('produits/'),
        api.get('categories/')
      ]);
      setProduits(p.data);
      setCategories(c.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return produits.filter(p =>
      p.nom?.toLowerCase().includes(search.toLowerCase()) ||
      p.categorie_nom?.toLowerCase().includes(search.toLowerCase())
    );
  }, [produits, search]);

  const totalValue = produits.reduce((s, p) => s + Number(p.prix || 0), 0);
  const avgPrice = produits.length ? totalValue / produits.length : 0;

  const openCreate = () => {
    setEditItem(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const handleEdit = (p) => {
    setEditItem(p);
    setForm({
      nom: p.nom || '',
      prix: p.prix || '',
      categorie: p.categorie || ''
    });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.nom || !form.prix || !form.categorie) {
      alert('Veuillez remplir tous les champs.');
      return;
    }

    try {
      if (editItem) {
        await api.put(`produits/${editItem.id}/`, form);
      } else {
        await api.post('produits/', form);
      }

      setShowForm(false);
      setEditItem(null);
      setForm(emptyForm);
      fetchData();
    } catch (e) {
      console.error(e);
      alert("Erreur lors de l'enregistrement.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce produit ?')) return;

    try {
      await api.delete(`produits/${id}/`);
      fetchData();
    } catch (e) {
      console.error(e);
      alert('Impossible de supprimer ce produit.');
    }
  };

  return (
    <Layout>
      <div style={styles.page}>
        <div style={styles.hero}>
          <div>
            <div style={styles.badge}>
              <Package size={15} />
              Catalogue commercial
            </div>
            <h1 style={styles.title}>Gestion des produits</h1>
            <p style={styles.subtitle}>
              Organisez votre catalogue, suivez les prix et préparez vos analyses de ventes.
            </p>
          </div>

          {canEdit && (
            <button style={styles.primaryBtn} onClick={openCreate}>
              <Plus size={18} />
              Ajouter un produit
            </button>
          )}
        </div>

        <div style={styles.kpiGrid}>
          <KpiCard icon={ShoppingBag} label="Produits" value={produits.length} color="#1A5276" bg="#D6EAF8" />
          <KpiCard icon={Layers} label="Catégories" value={categories.length} color="#C1440E" bg="#F5E8E3" />
          <KpiCard icon={Tag} label="Prix moyen" value={money(avgPrice)} color="#1E6B40" bg="#D5F5E3" />
          <KpiCard icon={AlertCircle} label="Résultats affichés" value={filtered.length} color="#B7860B" bg="#FEF9E7" />
        </div>

        <div style={styles.toolbar}>
          <div style={styles.searchBox}>
            <Search size={18} />
            <input
              style={styles.searchInput}
              placeholder="Rechercher par nom ou catégorie..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {showForm && canEdit && (
          <div style={styles.overlay}>
            <div style={styles.modal}>
              <div style={styles.modalHeader}>
                <div>
                  <h2 style={styles.modalTitle}>
                    {editItem ? 'Modifier le produit' : 'Nouveau produit'}
                  </h2>
                  <p style={styles.modalSub}>
                    Remplissez les informations du produit.
                  </p>
                </div>
                <button style={styles.closeBtn} onClick={() => setShowForm(false)}>
                  <X size={18} />
                </button>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Nom du produit</label>
                <input
                  style={styles.input}
                  placeholder="Ex : Laptop HP"
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                />
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Prix en DH</label>
                  <input
                    style={styles.input}
                    type="number"
                    placeholder="Ex : 8500"
                    value={form.prix}
                    onChange={(e) => setForm({ ...form, prix: e.target.value })}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Catégorie</label>
                  <select
                    style={styles.input}
                    value={form.categorie}
                    onChange={(e) => setForm({ ...form, categorie: e.target.value })}
                  >
                    <option value="">Choisir une catégorie</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.nom}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={styles.modalFooter}>
                <button style={styles.ghostBtn} onClick={() => setShowForm(false)}>
                  Annuler
                </button>
                <button style={styles.primaryBtn} onClick={handleSubmit}>
                  {editItem ? 'Enregistrer' : 'Ajouter'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div style={styles.card}>
          {loading ? (
            <div style={styles.loading}>Chargement des produits...</div>
          ) : (
            <>
              <div style={styles.tableHeader}>
                <div>
                  <h3 style={styles.cardTitle}>Liste des produits</h3>
                  <p style={styles.cardSub}>Catalogue utilisé dans les ventes et les prévisions.</p>
                </div>
              </div>

              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Produit</th>
                      <th style={styles.th}>Catégorie</th>
                      <th style={styles.th}>Prix</th>
                      <th style={styles.th}>Date d’ajout</th>
                      {canEdit && <th style={styles.th}>Actions</th>}
                    </tr>
                  </thead>

                  <tbody>
                    {filtered.map((p) => (
                      <tr key={p.id} style={styles.tr}>
                        <td style={styles.td}>
                          <div style={styles.productCell}>
                            <div style={styles.productIcon}>
                              <Package size={17} />
                            </div>
                            <div>
                              <div style={styles.productName}>{p.nom}</div>
                              <div style={styles.productId}>REF #{p.id}</div>
                            </div>
                          </div>
                        </td>

                        <td style={styles.td}>
                          <span style={styles.categoryBadge}>
                            {p.categorie_nom || 'Non classé'}
                          </span>
                        </td>

                        <td style={styles.td}>
                          <span style={styles.price}>{money(p.prix)}</span>
                        </td>

                        <td style={styles.tdMuted}>
                          {p.created_at
                            ? new Date(p.created_at).toLocaleDateString('fr-FR')
                            : '—'}
                        </td>

                        {canEdit && (
                          <td style={styles.td}>
                            <div style={styles.actions}>
                              <button style={styles.iconBtn} onClick={() => handleEdit(p)}>
                                <Edit3 size={16} />
                              </button>
                              <button style={styles.dangerBtn} onClick={() => handleDelete(p.id)}>
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filtered.length === 0 && (
                  <div style={styles.empty}>Aucun produit trouvé.</div>
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
    boxShadow: '0 18px 40px rgba(26,82,118,0.18)',
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
    boxShadow: '0 12px 25px rgba(193,68,14,0.25)',
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
    color: '#0F172A',
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
  productCell: {
    display: 'flex',
    alignItems: 'center',
    gap: 11,
  },
  productIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    background: '#D6EAF8',
    color: '#1A5276',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productName: {
    fontWeight: 850,
    color: '#0F172A',
  },
  productId: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  categoryBadge: {
    background: '#FEF9E7',
    color: '#B7860B',
    padding: '6px 10px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 800,
  },
  price: {
    color: '#1E6B40',
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
    maxWidth: 560,
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
};