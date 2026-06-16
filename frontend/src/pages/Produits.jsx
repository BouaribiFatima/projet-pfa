// src/pages/Produits.jsx
import { useEffect, useState } from 'react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import {
    Plus, Search, Pencil, Trash2,
    Package, Tag, X, ChevronDown,
    Smartphone, Shirt, Home, Utensils,
    Sparkles, BookOpen, Dumbbell, Car,
    Gamepad2, Baby, Gem, PawPrint
} from 'lucide-react';

// Associe un nom de catégorie (insensible à la casse/accents) à une icône + couleur
const CATEGORY_STYLES = {
    'electronique':  { icon: Smartphone, color: '#1E40AF', bg: '#DBEAFE' },
    'electronics':   { icon: Smartphone, color: '#1E40AF', bg: '#DBEAFE' },
    'informatique':  { icon: Smartphone, color: '#1E40AF', bg: '#DBEAFE' },
    'telephonie':    { icon: Smartphone, color: '#1E40AF', bg: '#DBEAFE' },
    'vetements':     { icon: Shirt,      color: '#DB2777', bg: '#FCE7F3' },
    'mode':          { icon: Shirt,      color: '#DB2777', bg: '#FCE7F3' },
    'maison':        { icon: Home,       color: '#059669', bg: '#D1FAE5' },
    'deco':          { icon: Home,       color: '#059669', bg: '#D1FAE5' },
    'alimentation':  { icon: Utensils,   color: '#D97706', bg: '#FEF3C7' },
    'cuisine':       { icon: Utensils,   color: '#D97706', bg: '#FEF3C7' },
    'beaute':        { icon: Sparkles,   color: '#7C3AED', bg: '#EDE9FE' },
    'cosmetique':    { icon: Sparkles,   color: '#7C3AED', bg: '#EDE9FE' },
    'livres':        { icon: BookOpen,   color: '#0E7490', bg: '#CFFAFE' },
    'sport':         { icon: Dumbbell,   color: '#DC2626', bg: '#FEE2E2' },
    'automobile':    { icon: Car,        color: '#475569', bg: '#F1F5F9' },
    'voiture':       { icon: Car,        color: '#475569', bg: '#F1F5F9' },
    'jeux':          { icon: Gamepad2,   color: '#9333EA', bg: '#F3E8FF' },
    'jouets':        { icon: Baby,       color: '#EA580C', bg: '#FFEDD5' },
    'bebe':          { icon: Baby,       color: '#EA580C', bg: '#FFEDD5' },
    'bijoux':        { icon: Gem,        color: '#0891B2', bg: '#CFFAFE' },
    'animaux':       { icon: PawPrint,   color: '#65A30D', bg: '#ECFCCB' },
};

// Normalise (minuscule + sans accents) pour matcher les clés ci-dessus
const normalize = (str) =>
    (str || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

const getCategoryStyle = (categorieNom) => {
    const key = normalize(categorieNom);
    return CATEGORY_STYLES[key] || { icon: Package, color: '#1E40AF', bg: '#DBEAFE' };
};

export default function Produits() {
    const [produits, setProduits]     = useState([]);
    const [categories, setCategories] = useState([]);
    const [showForm, setShowForm]     = useState(false);
    const [editItem, setEditItem]     = useState(null);
    const [form, setForm]             = useState({ nom: '', prix: '', categorie: '' });
    const [loading, setLoading]       = useState(true);
    const [search, setSearch]         = useState('');
    const { user } = useAuth();
    const canEdit = user?.role === 'superadmin' || user?.role === 'manager';

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setLoading(true);
        const [p, c] = await Promise.all([
            api.get('produits/'),
            api.get('categories/'),
        ]);
        setProduits(p.data);
        setCategories(c.data);
        setLoading(false);
    };

    const handleSubmit = async () => {
        if (!form.nom || !form.prix) return;
        if (editItem) {
            await api.put(`produits/${editItem.id}/`, form);
        } else {
            await api.post('produits/', form);
        }
        closeForm();
        fetchData();
    };

    const closeForm = () => {
        setShowForm(false);
        setEditItem(null);
        setForm({ nom: '', prix: '', categorie: '' });
    };

    const handleEdit = (p) => {
        setEditItem(p);
        setForm({ nom: p.nom, prix: p.prix, categorie: p.categorie });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Supprimer ce produit ?')) {
            await api.delete(`produits/${id}/`);
            fetchData();
        }
    };

    const filtered = produits.filter(p =>
        p.nom.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div style={styles.page}>
            <Sidebar />
            <main style={styles.main}>

                {/* ── Header ── */}
                <div style={styles.header}>
                    <div>
                        <h1 style={styles.pageTitle}>Produits</h1>
                        <p style={styles.pageSubtitle}>
                            {produits.length} produit{produits.length > 1 ? 's' : ''} au total
                        </p>
                    </div>
                    {canEdit && (
                        <button
                            onClick={() => setShowForm(true)}
                            style={styles.addBtn}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1E3A8A'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#1E40AF'}
                        >
                            <Plus size={16} />
                            <span>Nouveau produit</span>
                        </button>
                    )}
                </div>

                {/* ── Barre de recherche ── */}
                <div style={styles.searchBar}>
                    <Search size={16} color="#94A3B8" style={{ flexShrink: 0 }} />
                    <input
                        style={styles.searchInput}
                        placeholder="Rechercher un produit..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    {search && (
                        <button onClick={() => setSearch('')} style={styles.clearBtn}>
                            <X size={14} color="#94A3B8" />
                        </button>
                    )}
                </div>

                {/* ── Modal ── */}
                {showForm && (
                    <div style={styles.overlay}>
                        <div style={styles.modal}>
                            <div style={styles.modalHeader}>
                                <h2 style={styles.modalTitle}>
                                    {editItem ? 'Modifier le produit' : 'Nouveau produit'}
                                </h2>
                                <button onClick={closeForm} style={styles.closeBtn}>
                                    <X size={18} color="#64748B" />
                                </button>
                            </div>

                            <div style={styles.modalBody}>
                                <div style={styles.field}>
                                    <label style={styles.label}>Nom du produit *</label>
                                    <input
                                        style={styles.input}
                                        placeholder="Ex : iPhone 15"
                                        value={form.nom}
                                        onChange={e => setForm({ ...form, nom: e.target.value })}
                                    />
                                </div>
                                <div style={styles.field}>
                                    <label style={styles.label}>Prix (DH) *</label>
                                    <input
                                        style={styles.input}
                                        type="number"
                                        placeholder="Ex : 12000"
                                        value={form.prix}
                                        onChange={e => setForm({ ...form, prix: e.target.value })}
                                    />
                                </div>
                                <div style={styles.field}>
                                    <label style={styles.label}>Catégorie</label>
                                    <div style={{ position: 'relative' }}>
                                        <select
                                            style={styles.select}
                                            value={form.categorie}
                                            onChange={e => setForm({ ...form, categorie: e.target.value })}
                                        >
                                            <option value="">-- Sélectionner --</option>
                                            {categories.map(c => (
                                                <option key={c.id} value={c.id}>{c.nom}</option>
                                            ))}
                                        </select>
                                        <ChevronDown size={14} color="#94A3B8" style={styles.selectIcon} />
                                    </div>
                                </div>
                            </div>

                            <div style={styles.modalFooter}>
                                <button onClick={closeForm} style={styles.cancelBtn}>
                                    Annuler
                                </button>
                                <button onClick={handleSubmit} style={styles.submitBtn}>
                                    {editItem ? 'Enregistrer' : 'Ajouter'}
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
                            <Package size={40} color="#CBD5E1" />
                            <p style={{ color: '#94A3B8', marginTop: '12px' }}>
                                {search ? 'Aucun produit trouvé' : 'Aucun produit enregistré'}
                            </p>
                        </div>
                    ) : (
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Produit</th>
                                    <th style={styles.th}>Catégorie</th>
                                    <th style={styles.th}>Prix</th>
                                    <th style={styles.th}>Date ajout</th>
                                    {canEdit && <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((p, i) => {
                                    const catStyle = getCategoryStyle(p.categorie_nom);
                                    const CatIcon = catStyle.icon;
                                    return (
                                    <tr
                                        key={p.id}
                                        style={styles.tr}
                                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                                        onMouseLeave={e => e.currentTarget.style.backgroundColor = '#fff'}
                                    >
                                        <td style={styles.td}>
                                            <div style={styles.productCell}>
                                                <div style={{ ...styles.productIcon, backgroundColor: catStyle.bg }}>
                                                    <CatIcon size={14} color={catStyle.color} />
                                                </div>
                                                <span style={{ fontWeight: '500', color: '#0F172A' }}>{p.nom}</span>
                                            </div>
                                        </td>
                                        <td style={styles.td}>
                                            {p.categorie_nom ? (
                                                <span style={{ ...styles.badge, backgroundColor: catStyle.bg, color: catStyle.color }}>
                                                    <Tag size={11} />
                                                    {p.categorie_nom}
                                                </span>
                                            ) : (
                                                <span style={styles.badgeGray}>—</span>
                                            )}
                                        </td>
                                        <td style={styles.td}>
                                            <span style={{ fontWeight: '600', color: '#1E40AF' }}>
                                                {p.prix?.toLocaleString()} DH
                                            </span>
                                        </td>
                                        <td style={{ ...styles.td, color: '#64748B' }}>
                                            {new Date(p.created_at).toLocaleDateString('fr-FR')}
                                        </td>
                                        {canEdit && (
                                            <td style={{ ...styles.td, textAlign: 'right' }}>
                                                <div style={styles.actions}>
                                                    <button
                                                        onClick={() => handleEdit(p)}
                                                        style={styles.editBtn}
                                                        title="Modifier"
                                                    >
                                                        <Pencil size={15} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(p.id)}
                                                        style={styles.deleteBtn}
                                                        title="Supprimer"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                    );
                                })}
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
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' },
    pageTitle: { fontSize: '24px', fontWeight: '700', color: '#0F172A', margin: '0 0 4px' },
    pageSubtitle: { fontSize: '14px', color: '#64748B', margin: 0 },
    addBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', backgroundColor: '#1E40AF', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', transition: 'background 0.15s' },
    searchBar: { display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '10px 16px', marginBottom: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' },
    searchInput: { flex: 1, border: 'none', outline: 'none', fontSize: '14px', color: '#0F172A', backgroundColor: 'transparent' },
    clearBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' },
    overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(2px)' },
    modal: { backgroundColor: '#fff', borderRadius: '16px', width: '440px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', overflow: 'hidden' },
    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #F1F5F9' },
    modalTitle: { fontSize: '16px', fontWeight: '700', color: '#0F172A', margin: 0 },
    closeBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '6px', display: 'flex', alignItems: 'center' },
    modalBody: { padding: '24px' },
    modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '16px 24px', borderTop: '1px solid #F1F5F9', backgroundColor: '#F8FAFC' },
    field: { marginBottom: '18px' },
    label: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' },
    input: { width: '100%', padding: '10px 14px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', color: '#0F172A', backgroundColor: '#F8FAFC', boxSizing: 'border-box', outline: 'none' },
    select: { width: '100%', padding: '10px 14px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', color: '#0F172A', backgroundColor: '#F8FAFC', boxSizing: 'border-box', outline: 'none', appearance: 'none' },
    selectIcon: { position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' },
    cancelBtn: { padding: '9px 18px', border: '1px solid #E2E8F0', borderRadius: '8px', cursor: 'pointer', backgroundColor: '#fff', fontSize: '14px', color: '#374151', fontWeight: '500' },
    submitBtn: { padding: '9px 20px', backgroundColor: '#1E40AF', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
    tableCard: { backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)', border: '1px solid #F1F5F9', overflow: 'hidden' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748B', backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', letterSpacing: '0.5px' },
    tr: { borderBottom: '1px solid #F1F5F9', transition: 'background 0.1s', backgroundColor: '#fff' },
    td: { padding: '14px 16px', fontSize: '14px', color: '#374151' },
    productCell: { display: 'flex', alignItems: 'center', gap: '10px' },
    productIcon: { width: '32px', height: '32px', backgroundColor: '#DBEAFE', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    badge: { display: 'inline-flex', alignItems: 'center', gap: '5px', backgroundColor: '#DBEAFE', color: '#1E40AF', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
    badgeGray: { color: '#CBD5E1', fontSize: '14px' },
    actions: { display: 'flex', justifyContent: 'flex-end', gap: '6px' },
    editBtn: { padding: '7px', backgroundColor: '#F1F5F9', border: 'none', borderRadius: '7px', cursor: 'pointer', color: '#475569', display: 'flex', alignItems: 'center' },
    deleteBtn: { padding: '7px', backgroundColor: '#FEF2F2', border: 'none', borderRadius: '7px', cursor: 'pointer', color: '#DC2626', display: 'flex', alignItems: 'center' },
    emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px', color: '#94A3B8' },
};