// src/pages/Ventes.jsx
import { useEffect, useState } from 'react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import {
    Plus, Search, Pencil, Trash2,
    ShoppingCart, Upload, X,
    ChevronDown, TrendingUp
} from 'lucide-react';

export default function Ventes() {
    const [ventes, setVentes]         = useState([]);
    const [produits, setProduits]     = useState([]);
    const [showForm, setShowForm]     = useState(false);
    const [showImport, setShowImport] = useState(false);
    const [editItem, setEditItem]     = useState(null);
    const [fichier, setFichier]       = useState(null);
    const [loading, setLoading]       = useState(true);
    const [search, setSearch]         = useState('');
    const [form, setForm] = useState({
        produit: '', quantite: '', chiffre_affaires: '', date_vente: ''
    });

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setLoading(true);
        const [v, p] = await Promise.all([
            api.get('ventes/'),
            api.get('produits/'),
        ]);
        setVentes(v.data);
        setProduits(p.data);
        setLoading(false);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditItem(null);
        setForm({ produit: '', quantite: '', chiffre_affaires: '', date_vente: '' });
    };

    const handleSubmit = async () => {
        if (!form.produit || !form.quantite || !form.chiffre_affaires || !form.date_vente) return;
        if (editItem) {
            await api.put(`ventes/${editItem.id}/`, form);
        } else {
            await api.post('ventes/', form);
        }
        closeForm();
        fetchData();
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
        if (window.confirm('Supprimer cette vente ?')) {
            await api.delete(`ventes/${id}/`);
            fetchData();
        }
    };

    const handleImport = async () => {
        if (!fichier) return;
        const formData = new FormData();
        formData.append('fichier', fichier);
        try {
            const res = await api.post('ventes/import/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert(res.data.message);
            setShowImport(false);
            fetchData();
        } catch {
            alert('Erreur lors de l\'import');
        }
    };

    const filtered = ventes.filter(v =>
        v.produit_nom?.toLowerCase().includes(search.toLowerCase()) ||
        v.commercial_nom?.toLowerCase().includes(search.toLowerCase())
    );

    const totalCA = ventes.reduce((sum, v) => sum + v.chiffre_affaires, 0);

    return (
        <div style={styles.page}>
            <Sidebar />
            <main style={styles.main}>

                {/* ── Header ── */}
                <div style={styles.header}>
                    <div>
                        <h1 style={styles.pageTitle}>Ventes</h1>
                       
                    </div>
                    <div style={styles.headerBtns}>
                        <button
                            onClick={() => setShowImport(true)}
                            style={styles.importBtn}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F1F5F9'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#fff'}
                        >
                            <Upload size={15} />
                            <span>Importer</span>
                        </button>
                        <button
                            onClick={() => setShowForm(true)}
                            style={styles.addBtn}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1E3A8A'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#1E40AF'}
                        >
                            <Plus size={15} />
                            <span>Nouvelle vente</span>
                        </button>
                    </div>
                </div>

                {/* ── Stat rapide ── */}
                <div style={styles.statRow}>
                    <div style={styles.statCard}>
                        <TrendingUp size={16} color="#1E40AF" />
                        <span style={styles.statLabel}>Total ventes</span>
                        <span style={styles.statValue}>{ventes.length}</span>
                    </div>
                    <div style={styles.statCard}>
                        <ShoppingCart size={16} color="#059669" />
                        <span style={styles.statLabel}>CA total</span>
                        <span style={{ ...styles.statValue, color: '#059669' }}>{totalCA.toLocaleString()} DH</span>
                    </div>
                </div>

                {/* ── Recherche ── */}
                <div style={styles.searchBar}>
                    <Search size={16} color="#94A3B8" style={{ flexShrink: 0 }} />
                    <input
                        style={styles.searchInput}
                        placeholder="Rechercher par produit ou commercial..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    {search && (
                        <button onClick={() => setSearch('')} style={styles.clearBtn}>
                            <X size={14} color="#94A3B8" />
                        </button>
                    )}
                </div>

                {/* ── Modal Ajout/Modification ── */}
                {showForm && (
                    <div style={styles.overlay}>
                        <div style={styles.modal}>
                            <div style={styles.modalHeader}>
                                <h2 style={styles.modalTitle}>
                                    {editItem ? 'Modifier la vente' : 'Nouvelle vente'}
                                </h2>
                                <button onClick={closeForm} style={styles.closeBtn}>
                                    <X size={18} color="#64748B" />
                                </button>
                            </div>
                            <div style={styles.modalBody}>
                                <div style={styles.field}>
                                    <label style={styles.label}>Produit *</label>
                                    <select style={styles.select} value={form.produit}
                                        onChange={e => setForm({ ...form, produit: e.target.value })}>
                                        <option value="">-- Sélectionner --</option>
                                        {produits.map(p => (
                                            <option key={p.id} value={p.id}>{p.nom}</option>
                                        ))}
                                    </select>
                                </div>
                                <div style={styles.row}>
                                    <div style={{ ...styles.field, flex: 1 }}>
                                        <label style={styles.label}>Quantité *</label>
                                        <input style={styles.input} type="number" placeholder="Ex : 5"
                                            value={form.quantite}
                                            onChange={e => setForm({ ...form, quantite: e.target.value })} />
                                    </div>
                                    <div style={{ ...styles.field, flex: 1 }}>
                                        <label style={styles.label}>Chiffre d'affaires (DH) *</label>
                                        <input style={styles.input} type="number" placeholder="Ex : 60000"
                                            value={form.chiffre_affaires}
                                            onChange={e => setForm({ ...form, chiffre_affaires: e.target.value })} />
                                    </div>
                                </div>
                                <div style={styles.field}>
                                    <label style={styles.label}>Date de vente *</label>
                                    <input style={styles.input} type="date"
                                        value={form.date_vente}
                                        onChange={e => setForm({ ...form, date_vente: e.target.value })} />
                                </div>
                            </div>
                            <div style={styles.modalFooter}>
                                <button onClick={closeForm} style={styles.cancelBtn}>Annuler</button>
                                <button onClick={handleSubmit} style={styles.submitBtn}>
                                    {editItem ? 'Enregistrer' : 'Ajouter'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Modal Import ── */}
                {showImport && (
                    <div style={styles.overlay}>
                        <div style={styles.modal}>
                            <div style={styles.modalHeader}>
                                <h2 style={styles.modalTitle}>Importer des ventes</h2>
                                <button onClick={() => setShowImport(false)} style={styles.closeBtn}>
                                    <X size={18} color="#64748B" />
                                </button>
                            </div>
                            <div style={styles.modalBody}>
                                <div style={styles.importInfo}>
                                    <p style={{ margin: '0 0 8px', fontWeight: '600', color: '#0F172A', fontSize: '14px' }}>
                                        Format attendu
                                    </p>
                                    <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
                                        Le fichier Excel ou CSV doit contenir les colonnes :<br />
                                        <code style={styles.code}>produit_id, quantite, chiffre_affaires, date_vente</code>
                                    </p>
                                </div>
                                <div style={styles.field}>
                                    <label style={styles.label}>Fichier Excel / CSV</label>
                                    <input
                                        type="file"
                                        accept=".xlsx,.xls,.csv"
                                        onChange={e => setFichier(e.target.files[0])}
                                        style={{ fontSize: '14px', color: '#374151' }}
                                    />
                                </div>
                            </div>
                            <div style={styles.modalFooter}>
                                <button onClick={() => setShowImport(false)} style={styles.cancelBtn}>Annuler</button>
                                <button onClick={handleImport} style={styles.submitBtn}>
                                    Importer
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Table ── */}
                <div style={styles.tableCard}>
                    {loading ? (
                        <div style={styles.emptyState}>
                            <p style={{ color: '#94A3B8' }}>Chargement...</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div style={styles.emptyState}>
                            <ShoppingCart size={40} color="#CBD5E1" />
                            <p style={{ color: '#94A3B8', marginTop: '12px' }}>
                                {search ? 'Aucune vente trouvée' : 'Aucune vente enregistrée'}
                            </p>
                        </div>
                    ) : (
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>#</th>
                                    <th style={styles.th}>Produit</th>
                                    <th style={styles.th}>Commercial</th>
                                    <th style={styles.th}>Quantité</th>
                                    <th style={styles.th}>CA (DH)</th>
                                    <th style={styles.th}>Date</th>
                                    <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((v, i) => (
                                    <tr key={v.id} style={styles.tr}
                                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                                        onMouseLeave={e => e.currentTarget.style.backgroundColor = '#fff'}>
                                        <td style={{ ...styles.td, color: '#94A3B8', fontSize: '12px' }}>{v.id}</td>
                                        <td style={styles.td}>
                                            <span style={{ fontWeight: '500', color: '#0F172A' }}>{v.produit_nom}</span>
                                        </td>
                                        <td style={styles.td}>
                                            <span style={styles.badge}>{v.commercial_nom}</span>
                                        </td>
                                        <td style={styles.td}>{v.quantite}</td>
                                        <td style={styles.td}>
                                            <span style={{ fontWeight: '700', color: '#059669' }}>
                                                {v.chiffre_affaires?.toLocaleString()} DH
                                            </span>
                                        </td>
                                        <td style={{ ...styles.td, color: '#64748B' }}>
                                            {new Date(v.date_vente).toLocaleDateString('fr-FR')}
                                        </td>
                                        <td style={{ ...styles.td, textAlign: 'right' }}>
                                            <div style={styles.actions}>
                                                <button onClick={() => handleEdit(v)} style={styles.editBtn} title="Modifier">
                                                    <Pencil size={15} />
                                                </button>
                                                <button onClick={() => handleDelete(v.id)} style={styles.deleteBtn} title="Supprimer">
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>
        </div>
    );
}

const styles = {
    page: { display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFC', fontFamily: "'Inter', 'Segoe UI', sans-serif" },
    main: { marginLeft: '260px', flex: 1, padding: '32px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' },
    pageTitle: { fontSize: '24px', fontWeight: '700', color: '#0F172A', margin: '0 0 4px' },
    pageSubtitle: { fontSize: '14px', color: '#64748B', margin: 0 },
    headerBtns: { display: 'flex', gap: '10px' },
    addBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', backgroundColor: '#1E40AF', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', transition: 'background 0.15s' },
    importBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', backgroundColor: '#fff', color: '#374151', border: '1px solid #E2E8F0', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', transition: 'background 0.15s' },
    statRow: { display: 'flex', gap: '16px', marginBottom: '20px' },
    statCard: { display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '12px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' },
    statLabel: { fontSize: '13px', color: '#64748B' },
    statValue: { fontSize: '15px', fontWeight: '700', color: '#0F172A', marginLeft: '4px' },
    searchBar: { display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '10px 16px', marginBottom: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' },
    searchInput: { flex: 1, border: 'none', outline: 'none', fontSize: '14px', color: '#0F172A', backgroundColor: 'transparent' },
    clearBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' },
    overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(2px)' },
    modal: { backgroundColor: '#fff', borderRadius: '16px', width: '480px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', overflow: 'hidden' },
    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #F1F5F9' },
    modalTitle: { fontSize: '16px', fontWeight: '700', color: '#0F172A', margin: 0 },
    closeBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '6px', display: 'flex', alignItems: 'center' },
    modalBody: { padding: '24px' },
    modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '16px 24px', borderTop: '1px solid #F1F5F9', backgroundColor: '#F8FAFC' },
    row: { display: 'flex', gap: '16px' },
    field: { marginBottom: '18px' },
    label: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' },
    input: { width: '100%', padding: '10px 14px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', color: '#0F172A', backgroundColor: '#F8FAFC', boxSizing: 'border-box', outline: 'none' },
    select: { width: '100%', padding: '10px 14px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', color: '#0F172A', backgroundColor: '#F8FAFC', boxSizing: 'border-box', outline: 'none' },
    cancelBtn: { padding: '9px 18px', border: '1px solid #E2E8F0', borderRadius: '8px', cursor: 'pointer', backgroundColor: '#fff', fontSize: '14px', color: '#374151', fontWeight: '500' },
    submitBtn: { padding: '9px 20px', backgroundColor: '#1E40AF', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
    importInfo: { backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '14px 16px', marginBottom: '20px' },
    code: { backgroundColor: '#E2E8F0', padding: '2px 6px', borderRadius: '4px', fontSize: '12px', fontFamily: 'monospace' },
    tableCard: { backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)', border: '1px solid #F1F5F9', overflow: 'hidden' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748B', backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', letterSpacing: '0.5px' },
    tr: { borderBottom: '1px solid #F1F5F9', transition: 'background 0.1s', backgroundColor: '#fff' },
    td: { padding: '14px 16px', fontSize: '14px', color: '#374151' },
    badge: { display: 'inline-flex', alignItems: 'center', backgroundColor: '#DBEAFE', color: '#1E40AF', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
    actions: { display: 'flex', justifyContent: 'flex-end', gap: '6px' },
    editBtn: { padding: '7px', backgroundColor: '#F1F5F9', border: 'none', borderRadius: '7px', cursor: 'pointer', color: '#475569', display: 'flex', alignItems: 'center' },
    deleteBtn: { padding: '7px', backgroundColor: '#FEF2F2', border: 'none', borderRadius: '7px', cursor: 'pointer', color: '#DC2626', display: 'flex', alignItems: 'center' },
    emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px', color: '#94A3B8' },
};