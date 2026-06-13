// src/pages/Produits.jsx
import { useEffect, useState } from 'react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

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
        setShowForm(false);
        setEditItem(null);
        setForm({ nom: '', prix: '', categorie: '' });
        fetchData();
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
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f9fc', fontFamily: 'Segoe UI, sans-serif' }}>
            <Sidebar />
            <main style={{ marginLeft: '240px', flex: 1, padding: '32px' }}>

                {/* Header */}
                <div style={styles.header}>
                    <div>
                        <h1 style={styles.title}>📦 Produits</h1>
                        <p style={styles.subtitle}>{produits.length} produits au total</p>
                    </div>
                    {canEdit && (
                        <button onClick={() => {
                            setShowForm(true);
                            setEditItem(null);
                            setForm({ nom: '', prix: '', categorie: '' });
                        }} style={styles.addBtn}>
                            + Ajouter un produit
                        </button>
                    )}
                </div>

                {/* Recherche */}
                <input
                    style={styles.search}
                    placeholder="🔍 Rechercher un produit..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />

                {/* Modal Formulaire — seulement superadmin */}
                {showForm && canEdit && (
                    <div style={styles.overlay}>
                        <div style={styles.modal}>
                            <h2 style={styles.modalTitle}>
                                {editItem ? '✏️ Modifier le produit' : '➕ Nouveau produit'}
                            </h2>
                            <label style={styles.label}>Nom du produit</label>
                            <input style={styles.input} placeholder="Ex: iPhone 15"
                                value={form.nom}
                                onChange={e => setForm({ ...form, nom: e.target.value })} />

                            <label style={styles.label}>Prix (DH)</label>
                            <input style={styles.input} type="number" placeholder="Ex: 12000"
                                value={form.prix}
                                onChange={e => setForm({ ...form, prix: e.target.value })} />

                            <label style={styles.label}>Catégorie</label>
                            <select style={styles.input} value={form.categorie}
                                onChange={e => setForm({ ...form, categorie: e.target.value })}>
                                <option value="">-- Choisir --</option>
                                {categories.map(c => (
                                    <option key={c.id} value={c.id}>{c.nom}</option>
                                ))}
                            </select>

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
                {loading ? <p>Chargement...</p> : (
                    <div style={styles.tableWrapper}>
                        <table style={styles.table}>
                            <thead>
                                <tr style={styles.thead}>
                                    <th style={styles.th}>#</th>
                                    <th style={styles.th}>Nom</th>
                                    <th style={styles.th}>Catégorie</th>
                                    <th style={styles.th}>Prix</th>
                                    <th style={styles.th}>Date ajout</th>
                                    {canEdit && <th style={styles.th}>Actions</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((p, i) => (
                                    <tr key={p.id} style={i % 2 === 0 ? styles.trEven : styles.trOdd}>
                                        <td style={styles.td}>{p.id}</td>
                                        <td style={styles.td}><strong>{p.nom}</strong></td>
                                        <td style={styles.td}>
                                            <span style={styles.badge}>{p.categorie_nom || 'N/A'}</span>
                                        </td>
                                        <td style={styles.td}>{p.prix?.toLocaleString()} DH</td>
                                        <td style={styles.td}>
                                            {new Date(p.created_at).toLocaleDateString('fr-FR')}
                                        </td>
                                        {canEdit && (
                                            <td style={styles.td}>
                                                <button onClick={() => handleEdit(p)} style={styles.editBtn}>✏️</button>
                                                <button onClick={() => handleDelete(p.id)} style={styles.deleteBtn}>🗑️</button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filtered.length === 0 && (
                            <p style={styles.empty}>Aucun produit trouvé.</p>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}

const styles = {
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
    title: { fontSize: '24px', fontWeight: '700', color: '#1a1a2e', margin: 0 },
    subtitle: { color: '#94a3b8', fontSize: '14px', margin: '4px 0 0' },
    addBtn: { backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontWeight: '600' },
    search: { width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', marginBottom: '20px', boxSizing: 'border-box' },
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modal: { backgroundColor: '#fff', borderRadius: '12px', padding: '32px', width: '420px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' },
    modalTitle: { fontSize: '18px', fontWeight: '700', marginBottom: '20px', color: '#1a1a2e' },
    label: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' },
    input: { width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', marginBottom: '16px', boxSizing: 'border-box' },
    modalBtns: { display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' },
    cancelBtn: { padding: '10px 20px', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', backgroundColor: '#fff' },
    saveBtn: { padding: '10px 20px', backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
    tableWrapper: { backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)', overflow: 'hidden' },
    table: { width: '100%', borderCollapse: 'collapse' },
    thead: { backgroundColor: '#f8f9fc' },
    th: { padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e2e8f0' },
    td: { padding: '12px 16px', fontSize: '14px', color: '#374151', borderBottom: '1px solid #f1f5f9' },
    trEven: { backgroundColor: '#fff' },
    trOdd: { backgroundColor: '#fafafa' },
    badge: { backgroundColor: '#ede9fe', color: '#7c3aed', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
    editBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', marginRight: '8px' },
    deleteBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' },
    empty: { textAlign: 'center', padding: '40px', color: '#94a3b8' },
};