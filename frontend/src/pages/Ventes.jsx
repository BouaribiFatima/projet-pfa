// src/pages/Ventes.jsx
import { useEffect, useState } from 'react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';

export default function Ventes() {
    const [ventes, setVentes]         = useState([]);
    const [produits, setProduits]     = useState([]);
    const [showForm, setShowForm]     = useState(false);
    const [showImport, setShowImport] = useState(false);
    const [editItem, setEditItem]     = useState(null);
    const [fichier, setFichier]       = useState(null);
    const [loading, setLoading]       = useState(true);
    const [search, setSearch]         = useState('');
    const [form, setForm]             = useState({
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

    const handleSubmit = async () => {
        if (!form.produit || !form.quantite || !form.chiffre_affaires || !form.date_vente) return;
        if (editItem) {
            await api.put(`ventes/${editItem.id}/`, form);
        } else {
            await api.post('ventes/', form);
        }
        setShowForm(false);
        setEditItem(null);
        setForm({ produit: '', quantite: '', chiffre_affaires: '', date_vente: '' });
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
        } catch (e) {
            alert('Erreur lors de l\'import');
        }
    };

    const filtered = ventes.filter(v =>
        v.produit_nom?.toLowerCase().includes(search.toLowerCase()) ||
        v.commercial_nom?.toLowerCase().includes(search.toLowerCase())
    );

    const totalCA = ventes.reduce((sum, v) => sum + v.chiffre_affaires, 0);

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f9fc', fontFamily: 'Segoe UI, sans-serif' }}>
            <Sidebar />
            <main style={{ marginLeft: '240px', flex: 1, padding: '32px' }}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1a1a2e', margin: 0 }}>💰 Ventes</h1>
                        <p style={{ color: '#94a3b8', fontSize: '14px', margin: '4px 0 0' }}>
                            {ventes.length} ventes — CA total : <strong>{totalCA.toLocaleString()} DH</strong>
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => setShowImport(true)} style={styles.importBtn}>
                            📥 Importer Excel/CSV
                        </button>
                        <button onClick={() => { setShowForm(true); setEditItem(null); setForm({ produit: '', quantite: '', chiffre_affaires: '', date_vente: '' }); }}
                            style={styles.addBtn}>
                            + Ajouter une vente
                        </button>
                    </div>
                </div>

                {/* Recherche */}
                <input
                    style={styles.search}
                    placeholder="🔍 Rechercher par produit ou commercial..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />

                {/* Modal Ajout/Modification */}
                {showForm && (
                    <div style={styles.overlay}>
                        <div style={styles.modal}>
                            <h2 style={styles.modalTitle}>
                                {editItem ? '✏️ Modifier la vente' : '➕ Nouvelle vente'}
                            </h2>

                            <label style={styles.label}>Produit</label>
                            <select style={styles.input} value={form.produit}
                                onChange={e => setForm({ ...form, produit: e.target.value })}>
                                <option value="">-- Choisir un produit --</option>
                                {produits.map(p => (
                                    <option key={p.id} value={p.id}>{p.nom}</option>
                                ))}
                            </select>

                            <label style={styles.label}>Quantité</label>
                            <input style={styles.input} type="number" placeholder="Ex: 5"
                                value={form.quantite}
                                onChange={e => setForm({ ...form, quantite: e.target.value })} />

                            <label style={styles.label}>Chiffre d'affaires (DH)</label>
                            <input style={styles.input} type="number" placeholder="Ex: 60000"
                                value={form.chiffre_affaires}
                                onChange={e => setForm({ ...form, chiffre_affaires: e.target.value })} />

                            <label style={styles.label}>Date de vente</label>
                            <input style={styles.input} type="date"
                                value={form.date_vente}
                                onChange={e => setForm({ ...form, date_vente: e.target.value })} />

                            <div style={styles.modalBtns}>
                                <button onClick={() => setShowForm(false)} style={styles.cancelBtn}>Annuler</button>
                                <button onClick={handleSubmit} style={styles.saveBtn}>
                                    {editItem ? 'Modifier' : 'Ajouter'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal Import */}
                {showImport && (
                    <div style={styles.overlay}>
                        <div style={styles.modal}>
                            <h2 style={styles.modalTitle}>📥 Importer des ventes</h2>
                            <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '16px' }}>
                                Le fichier doit contenir les colonnes :<br/>
                                <strong>produit_id, quantite, chiffre_affaires, date_vente</strong>
                            </p>
                            <label style={styles.label}>Fichier Excel ou CSV</label>
                            <input type="file" accept=".xlsx,.xls,.csv"
                                onChange={e => setFichier(e.target.files[0])}
                                style={{ marginBottom: '20px', fontSize: '14px' }} />

                            <div style={styles.modalBtns}>
                                <button onClick={() => setShowImport(false)} style={styles.cancelBtn}>Annuler</button>
                                <button onClick={handleImport} style={styles.saveBtn}>
                                    Importer
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
                                <tr style={{ backgroundColor: '#f8f9fc' }}>
                                    <th style={styles.th}>#</th>
                                    <th style={styles.th}>Produit</th>
                                    <th style={styles.th}>Commercial</th>
                                    <th style={styles.th}>Quantité</th>
                                    <th style={styles.th}>CA (DH)</th>
                                    <th style={styles.th}>Date</th>
                                    <th style={styles.th}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((v, i) => (
                                    <tr key={v.id} style={{ backgroundColor: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                                        <td style={styles.td}>{v.id}</td>
                                        <td style={styles.td}><strong>{v.produit_nom}</strong></td>
                                        <td style={styles.td}>
                                            <span style={styles.badge}>{v.commercial_nom}</span>
                                        </td>
                                        <td style={styles.td}>{v.quantite}</td>
                                        <td style={styles.td}>
                                            <strong style={{ color: '#16a34a' }}>
                                                {v.chiffre_affaires?.toLocaleString()} DH
                                            </strong>
                                        </td>
                                        <td style={styles.td}>
                                            {new Date(v.date_vente).toLocaleDateString('fr-FR')}
                                        </td>
                                        <td style={styles.td}>
                                            <button onClick={() => handleEdit(v)} style={styles.editBtn}>✏️</button>
                                            <button onClick={() => handleDelete(v.id)} style={styles.deleteBtn}>🗑️</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filtered.length === 0 && (
                            <p style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                                Aucune vente trouvée.
                            </p>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}

const styles = {
    addBtn: { backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontWeight: '600' },
    importBtn: { backgroundColor: '#fff', color: '#4f46e5', border: '1px solid #4f46e5', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontWeight: '600' },
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
    th: { padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e2e8f0' },
    td: { padding: '12px 16px', fontSize: '14px', color: '#374151', borderBottom: '1px solid #f1f5f9' },
    badge: { backgroundColor: '#dbeafe', color: '#1d4ed8', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
    editBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', marginRight: '8px' },
    deleteBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' },
};