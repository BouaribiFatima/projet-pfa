// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError]       = useState('');
    const [loading, setLoading]   = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const user = await login(username, password);
            // Redirection selon le rôle
            if (user.role === 'superadmin' || user.role === 'manager') {
                navigate('/dashboard');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            setError('Identifiants incorrects. Veuillez réessayer.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>Connexion</h2>
                <p style={styles.subtitle}>Prévision des ventes</p>

                {error && <div style={styles.error}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={styles.field}>
                        <label style={styles.label}>Nom d'utilisateur</label>
                        <input
                            style={styles.input}
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            placeholder="Entrez votre username"
                            autoComplete="off"
                            required
                        />
                    </div>

                    <div style={styles.field}>
                        <label style={styles.label}>Mot de passe</label>
                        <input
                            style={styles.input}
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Entrez votre mot de passe"
                            autoComplete="off"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        style={loading ? styles.buttonDisabled : styles.button}
                        disabled={loading}
                    >
                        {loading ? 'Connexion...' : 'Se connecter'}
                    </button>
                </form>
            </div>
        </div>
    );
}

const styles = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f2f5',
    },
    card: {
        backgroundColor: '#fff',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px',
    },
    title: {
        margin: '0 0 6px',
        fontSize: '24px',
        fontWeight: '600',
        color: '#1a1a2e',
        textAlign: 'center',
    },
    subtitle: {
        margin: '0 0 28px',
        fontSize: '14px',
        color: '#888',
        textAlign: 'center',
    },
    field: {
        marginBottom: '18px',
    },
    label: {
        display: 'block',
        marginBottom: '6px',
        fontSize: '14px',
        fontWeight: '500',
        color: '#444',
    },
    input: {
        width: '100%',
        padding: '10px 14px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        fontSize: '14px',
        boxSizing: 'border-box',
        outline: 'none',
    },
    button: {
        width: '100%',
        padding: '12px',
        backgroundColor: '#4f46e5',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontSize: '15px',
        fontWeight: '600',
        cursor: 'pointer',
        marginTop: '8px',
    },
    buttonDisabled: {
        width: '100%',
        padding: '12px',
        backgroundColor: '#a5a3f0',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontSize: '15px',
        fontWeight: '600',
        cursor: 'not-allowed',
        marginTop: '8px',
    },
    error: {
        backgroundColor: '#fee2e2',
        color: '#dc2626',
        padding: '10px 14px',
        borderRadius: '8px',
        marginBottom: '18px',
        fontSize: '14px',
    },
};