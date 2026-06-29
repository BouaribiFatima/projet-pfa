// src/pages/Ventes.jsx
import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import {
  Plus, Upload, Search, Edit3, Trash2, X, ShoppingCart,
  TrendingUp, Package, User, CalendarDays, FileSpreadsheet
} from 'lucide-react';

const emptyForm = { produit: '', quantite: '', chiffre_affaires: '', date_vente: '' };

const money = (v) => {
  if (v === null || v === undefined) return '—';
  return `${Number(v).toLocaleString()} DH`;
};

export default function Ventes() {
  const [ventes, setVentes] = useState([]);
  const [produits, setProduits] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [fichier, setFichier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [v, p] = await Promise.all([
        api.get('ventes/'),
        api.get('produits/')
      ]);
      setVentes(v.data);
      setProduits(p.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return ventes.filter(v =>
      v.produit_nom?.toLowerCase().includes(search.toLowerCase()) ||
      v.commercial_nom?.toLowerCase().includes(search.toLowerCase())
    );
  }, [ventes, search]);

  const totalCA = ventes.reduce((s, v) => s + Number(v.chiffre_affaires || 0), 0);
  const totalQty = ventes.reduce((s, v) => s + Number(v.quantite || 0), 0);
  const avgCA = ventes.length ? totalCA / ventes.length : 0;

  const openCreate = () => {
    setEditItem(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.produit || !form.quantite || !form.chiffre_affaires || !form.date_vente) {
      alert('Veuillez remplir tous les champs.');
      return;
    }

    try {
      if (editItem) {
        await api.put(`ventes/${editItem.id}/`, form);
      } else {
        await api.post('ventes/', form);
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

  const handleEdit = (v) => {
    setEditItem(v);
    setForm({
      produit: v.produit,
      quantite: v.quantite,
      chiffre_affaires: v.chiffre_affaires,
      date_vente: v.date_vente
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette vente ?')) return;

    try {
      await api.delete(`ventes/${id}/`);
      fetchData();
    } catch (e) {
      console.error(e);
      alert('Impossible de supprimer cette vente.');
    }
  };

  const handleImport = async () => {
    if (!fichier) {
      alert('Choisissez un fichier.');
      return;
    }

    const fd = new FormData();
    fd.append('fichier', fichier);

    try {
      const res = await api.post('ventes/import/', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert(res.data.message || 'Import terminé.');
      setShowImport(false);
      setFichier(null);
      fetchData();
    } catch {
      alert("Erreur lors de l'import.");
    }
  };

  return (
    <Layout>
      <div style={styles.page}>
        <div style={styles.hero}>
          <div>
            <div style={styles.badge}>
              <ShoppingCart size={15} />
              Activité commerciale
            </div>
            <h1 style={styles.title}>Gestion des ventes</h1>
            <p style={styles.subtitle}>
              Suivez vos transactions, analysez le chiffre d’affaires et importez vos données de ventes.
            </p>
          </div>

          <div style={styles.heroActions}>
            <button style={styles.outlineBtn} onClick={() => setShowImport(true)}>
              <Upload size={18} />
              Importer Excel / CSV
            </button>
            <button style={styles.primaryBtn} onClick={openCreate}>
              <Plus size={18} />
              Nouvelle vente
            </button>
          </div>
        </div>

        <div style={styles.kpiGrid}>
          <KpiCard icon={TrendingUp} label="CA total" value={money(totalCA)} color="#1E6B40" bg="#D5F5E3" />
          <KpiCard icon={ShoppingCart} label="Transactions" value={ventes.length} color="#1A5276" bg="#D6EAF8" />
          <KpiCard icon={Package} label="Quantité vendue" value={totalQty} color="#C1440E" bg="#F5E8E3" />
          <KpiCard icon={CalendarDays} label="CA moyen" value={money(avgCA)} color="#B7860B" bg="#FEF9E7" />
        </div>

        <div style={styles.toolbar}>
          <div style={styles.searchBox}>
            <Search size={18} />
            <input
              style={styles.searchInput}
              placeholder="Rechercher par produit ou commercial..."
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
                    {editItem ? 'Modifier la vente' : 'Nouvelle vente'}
                  </h2>
                  <p style={styles.modalSub}>Ajoutez ou modifiez une transaction commerciale.</p>
                </div>
                <button style={styles.closeBtn} onClick={() => setShowForm(false)}>
                  <X size={18} />
                </button>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Produit</label>
                <select
                  style={styles.input}
                  value={form.produit}
                  onChange={(e) => setForm({ ...form, produit: e.target.value })}
                >
                  <option value="">Sélectionner un produit</option>
                  {produits.map(p => (
                    <option key={p.id} value={p.id}>{p.nom}</option>
                  ))}
                </select>
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Quantité</label>
                  <input
                    style={styles.input}
                    type="number"
                    value={form.quantite}
                    onChange={(e) => setForm({ ...form, quantite: e.target.value })}
                    placeholder="Ex : 10"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Chiffre d’affaires DH</label>
                  <input
                    style={styles.input}
                    type="number"
                    value={form.chiffre_affaires}
                    onChange={(e) => setForm({ ...form, chiffre_affaires: e.target.value })}
                    placeholder="Ex : 85000"
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Date de vente</label>
                <input
                  style={styles.input}
                  type="date"
                  value={form.date_vente}
                  onChange={(e) => setForm({ ...form, date_vente: e.target.value })}
                />
              </div>

              <div style={styles.modalFooter}>
                <button style={styles.ghostBtn} onClick={() => setShowForm(false)}>Annuler</button>
                <button style={styles.primaryBtn} onClick={handleSubmit}>
                  {editItem ? 'Enregistrer' : 'Ajouter'}
                </button>
              </div>
            </div>
          </div>
        )}

        {showImport && (
          <div style={styles.overlay}>
            <div style={styles.modal}>
              <div style={styles.modalHeader}>
                <div>
                  <h2 style={styles.modalTitle}>Importer des ventes</h2>
                  <p style={styles.modalSub}>Chargez un fichier Excel ou CSV contenant vos ventes.</p>
                </div>
                <button style={styles.closeBtn} onClick={() => setShowImport(false)}>
                  <X size={18} />
                </button>
              </div>

              <div style={styles.importBox}>
                <FileSpreadsheet size={22} />
                <div>
                  <div style={styles.importTitle}>Colonnes attendues</div>
                  <div style={styles.importText}>
                    produit_id · quantite · chiffre_affaires · date_vente
                  </div>
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Fichier Excel ou CSV</label>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={(e) => setFichier(e.target.files[0])}
                />
              </div>

              <div style={styles.modalFooter}>
                <button style={styles.ghostBtn} onClick={() => setShowImport(false)}>Annuler</button>
                <button style={styles.primaryBtn} onClick={handleImport}>Importer</button>
              </div>
            </div>
          </div>
        )}

        <div style={styles.card}>
          {loading ? (
            <div style={styles.loading}>Chargement des ventes...</div>
          ) : (
            <>
              <div style={styles.tableHeader}>
                <div>
                  <h3 style={styles.cardTitle}>Liste des ventes</h3>
                  <p style={styles.cardSub}>Transactions enregistrées dans le système.</p>
                </div>
              </div>

              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Produit</th>
                      <th style={styles.th}>Commercial</th>
                      <th style={styles.th}>Quantité</th>
                      <th style={styles.th}>CA</th>
                      <th style={styles.th}>Date</th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filtered.map(v => (
                      <tr key={v.id} style={styles.tr}>
                        <td style={styles.td}>
                          <div style={styles.productCell}>
                            <div style={styles.productIcon}>
                              <Package size={17} />
                            </div>
                            <div>
                              <div style={styles.productName}>{v.produit_nom}</div>
                              <div style={styles.productId}>Vente #{v.id}</div>
                            </div>
                          </div>
                        </td>

                        <td style={styles.td}>
                          <span style={styles.userBadge}>
                            <User size={13} />
                            {v.commercial_nom || '—'}
                          </span>
                        </td>

                        <td style={styles.td}>{v.quantite}</td>

                        <td style={styles.td}>
                          <span style={styles.price}>{money(v.chiffre_affaires)}</span>
                        </td>

                        <td style={styles.tdMuted}>
                          {v.date_vente ? new Date(v.date_vente).toLocaleDateString('fr-FR') : '—'}
                        </td>

                        <td style={styles.td}>
                          <div style={styles.actions}>
                            <button style={styles.iconBtn} onClick={() => handleEdit(v)}>
                              <Edit3 size={16} />
                            </button>
                            <button style={styles.dangerBtn} onClick={() => handleDelete(v.id)}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filtered.length === 0 && (
                  <div style={styles.empty}>Aucune vente trouvée.</div>
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
  page: { padding: 22, background: '#F4F0E8', minHeight: '100vh' },
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
  title: { margin: 0, fontSize: 28, fontWeight: 900 },
  subtitle: { margin: '7px 0 0', color: 'rgba(255,255,255,0.72)', fontSize: 14 },
  heroActions: { display: 'flex', gap: 10, flexWrap: 'wrap' },
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
  outlineBtn: {
    border: '1px solid rgba(255,255,255,0.3)',
    background: 'rgba(255,255,255,0.1)',
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
  kpiCard: { background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16, padding: 16 },
  kpiIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  kpiValue: { fontSize: 21, fontWeight: 900, color: '#0F172A' },
  kpiLabel: { fontSize: 12, color: '#64748B', marginTop: 3 },
  toolbar: { background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16, padding: 14, marginBottom: 18 },
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
  searchInput: { border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: 14 },
  card: { background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 18, overflow: 'hidden' },
  tableHeader: { padding: 18, borderBottom: '1px solid #E2E8F0' },
  cardTitle: { margin: 0, fontSize: 17, fontWeight: 900, color: '#0F172A' },
  cardSub: { margin: '4px 0 0', fontSize: 13, color: '#64748B' },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    textAlign: 'left',
    padding: '14px 18px',
    background: '#F8FAFC',
    color: '#64748B',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tr: { borderTop: '1px solid #E2E8F0' },
  td: { padding: '15px 18px', color: '#334155', fontSize: 14 },
  tdMuted: { padding: '15px 18px', color: '#64748B', fontSize: 13 },
  productCell: { display: 'flex', alignItems: 'center', gap: 11 },
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
  productName: { fontWeight: 850, color: '#0F172A' },
  productId: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  userBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    background: '#FEF9E7',
    color: '#B7860B',
    padding: '6px 10px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 800,
  },
  price: { color: '#1E6B40', fontWeight: 900 },
  actions: { display: 'flex', gap: 8 },
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
  empty: { padding: 30, textAlign: 'center', color: '#64748B' },
  loading: { padding: 30, textAlign: 'center', color: '#64748B' },
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
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  modalTitle: { margin: 0, fontSize: 21, fontWeight: 900, color: '#0F172A' },
  modalSub: { margin: '5px 0 0', color: '#64748B', fontSize: 13 },
  closeBtn: {
    border: 'none',
    background: '#F8FAFC',
    color: '#64748B',
    width: 36,
    height: 36,
    borderRadius: 12,
    cursor: 'pointer',
  },
  formGroup: { marginBottom: 15, flex: 1 },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 },
  label: { display: 'block', marginBottom: 7, fontSize: 13, fontWeight: 800, color: '#334155' },
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
  modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 },
  ghostBtn: {
    border: '1px solid #CBD5E1',
    background: '#FFFFFF',
    color: '#334155',
    borderRadius: 12,
    padding: '11px 15px',
    fontWeight: 800,
    cursor: 'pointer',
  },
  importBox: {
    display: 'flex',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    background: '#F8FAFC',
    border: '1px solid #E2E8F0',
    marginBottom: 16,
    color: '#1A5276',
  },
  importTitle: { fontWeight: 900, color: '#0F172A', marginBottom: 4 },
  importText: { color: '#64748B', fontSize: 13 },
};