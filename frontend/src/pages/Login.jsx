// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BarChart2, Eye, EyeOff, LogIn } from 'lucide-react';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(username, password);
            navigate('/dashboard');
        } catch {
            setError('Identifiants incorrects. Veuillez réessayer.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.page}>
            {/* Panneau gauche */}
            <div style={styles.left}>
                <div style={styles.leftContent}>
                    <div style={styles.leftIcon}>
                        <BarChart2 size={40} color="#FFFFFF" />
                    </div>
                    <h1 style={styles.leftTitle}>PréviVentes</h1>
                    <p style={styles.leftDesc}>
                        Plateforme de gestion et de prévision des ventes pour les entreprises.
                        Analysez vos données, anticipez vos performances.
                    </p>
                
                </div>
            </div>

            {/* Panneau droit */}
            <div style={styles.right}>
                <div style={styles.card}>
                    <div style={styles.cardHeader}>
                        <h2 style={styles.cardTitle}>Connexion</h2>
                        <p style={styles.cardSubtitle}>
                            Entrez vos identifiants pour accéder à votre espace
                        </p>
                    </div>

                    {error && (
                        <div style={styles.errorBox}>
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} autoComplete="off">
                        <div style={styles.field}>
                            <label style={styles.label}>Nom d'utilisateur</label>
                            <input
                                style={styles.input}
                                type="text"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                placeholder="Entrez votre nom d'utilisateur"
                                autoComplete="off"
                                required
                            />
                        </div>

                        <div style={styles.field}>
                            <label style={styles.label}>Mot de passe</label>
                            <div style={styles.inputWrapper}>
                                <input
                                    style={{ ...styles.input, paddingRight: '44px' }}
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="Entrez votre mot de passe"
                                    autoComplete="new-password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={styles.eyeBtn}
                                >
                                    {showPassword
                                        ? <EyeOff size={16} color="#64748B" />
                                        : <Eye size={16} color="#64748B" />
                                    }
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={loading ? styles.btnDisabled : styles.btn}
                        >
                            {loading ? (
                                <span>Connexion en cours...</span>
                            ) : (
                                <>
                                    <LogIn size={16} />
                                    <span>Se connecter</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

const styles = {
    page: {
        display: 'flex',
        minHeight: '100vh',
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
    },
    left: {
        flex: 1,
        backgroundColor: '#1E40AF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 40px',
    },
    leftContent: {
        maxWidth: '380px',
        color: '#FFFFFF',
    },
    leftIcon: {
        width: '72px',
        height: '72px',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '24px',
    },
    leftTitle: {
        fontSize: '32px',
        fontWeight: '700',
        marginBottom: '16px',
        letterSpacing: '-0.5px',
    },
    leftDesc: {
        fontSize: '15px',
        lineHeight: '1.7',
        color: 'rgba(255,255,255,0.75)',
        marginBottom: '32px',
    },
    features: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    feature: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontSize: '14px',
        color: 'rgba(255,255,255,0.85)',
    },
    featureDot: {
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: '#93C5FD',
        flexShrink: 0,
    },
    right: {
        width: '480px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F8FAFC',
        padding: '40px',
    },
    card: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        padding: '40px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        border: '1px solid #E2E8F0',
    },
    cardHeader: {
        marginBottom: '28px',
    },
    cardTitle: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#0F172A',
        margin: '0 0 6px',
    },
    cardSubtitle: {
        fontSize: '14px',
        color: '#64748B',
        margin: 0,
    },
    errorBox: {
        backgroundColor: '#FEF2F2',
        border: '1px solid #FECACA',
        color: '#DC2626',
        padding: '12px 16px',
        borderRadius: '8px',
        marginBottom: '20px',
        fontSize: '14px',
    },
    field: {
        marginBottom: '20px',
    },
    label: {
        display: 'block',
        fontSize: '13px',
        fontWeight: '600',
        color: '#374151',
        marginBottom: '8px',
    },
    input: {
        width: '100%',
        padding: '11px 14px',
        border: '1px solid #E2E8F0',
        borderRadius: '8px',
        fontSize: '14px',
        color: '#0F172A',
        backgroundColor: '#F8FAFC',
        boxSizing: 'border-box',
        outline: 'none',
        transition: 'border-color 0.15s',
    },
    inputWrapper: {
        position: 'relative',
    },
    eyeBtn: {
        position: 'absolute',
        right: '12px',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '4px',
        display: 'flex',
        alignItems: 'center',
    },
    btn: {
        width: '100%',
        padding: '12px',
        backgroundColor: '#1E40AF',
        color: '#FFFFFF',
        border: 'none',
        borderRadius: '8px',
        fontSize: '15px',
        fontWeight: '600',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        marginTop: '8px',
    },
    btnDisabled: {
        width: '100%',
        padding: '12px',
        backgroundColor: '#93C5FD',
        color: '#FFFFFF',
        border: 'none',
        borderRadius: '8px',
        fontSize: '15px',
        fontWeight: '600',
        cursor: 'not-allowed',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        marginTop: '8px',
    },
};