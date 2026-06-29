// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ShieldCheck, Brain } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const GrowthLogo = ({ size = 30 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 25H27" />
    <path d="M5 25V7" />

    <path d="M8 21L14 15L19 17L27 8" />

    <path d="M23 8H27V12" />
  </svg>
);

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
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
      <div style={styles.bgCircleOne}></div>
      <div style={styles.bgCircleTwo}></div>

      <section style={styles.left}>
        <div style={styles.brand}>
          <div style={styles.logoBox}>
            <GrowthLogo size={31} />
          </div>

          <div style={styles.brandText}>
            <div style={styles.brandName}>PréviVentes</div>
            <div style={styles.brandSub}>Plateforme intelligente de prévision</div>
          </div>
        </div>

        <div style={styles.hero}>
          <div style={styles.badge}>
            <Brain size={15} />
            Prévision commerciale assistée par IA
          </div>

          <h1 style={styles.title}>
            Pilotez vos ventes.
            <br />
            Anticipez votre croissance.
          </h1>

          <p style={styles.description}>
            Analysez vos performances, suivez vos équipes et générez des prévisions fiables
            pour prendre les bonnes décisions commerciales.
          </p>

          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statValue}>91%</div>
              <div style={styles.statLabel}>Précision prévisionnelle</div>
            </div>

            <div style={styles.statCard}>
              <div style={styles.statValue}>+17%</div>
              <div style={styles.statLabel}>Croissance estimée</div>
            </div>

            <div style={styles.statCard}>
              <div style={styles.statValue}>24/7</div>
              <div style={styles.statLabel}>Suivi des ventes</div>
            </div>
          </div>
        </div>
      </section>

      <section style={styles.right}>
        <div style={styles.formCard}>
          <div style={styles.formTop}>
            <div style={styles.formIcon}>
              <ShieldCheck size={24} />
            </div>
            <h2 style={styles.formTitle}>Connexion sécurisée</h2>
            <p style={styles.formSub}>
              Accédez à votre espace de gestion commerciale.
            </p>
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div style={styles.group}>
              <label style={styles.label}>Nom d'utilisateur</label>
              <input
                style={styles.input}
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Votre nom d'utilisateur"
                autoComplete="username"
                required
              />
            </div>

            <div style={styles.group}>
              <label style={styles.label}>Mot de passe</label>
              <div style={styles.passwordBox}>
                <input
                  style={{ ...styles.input, paddingRight: 46 }}
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  style={styles.eyeBtn}
                >
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" style={styles.submit} disabled={loading}>
              {loading ? 'Connexion en cours...' : 'Se connecter'}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    height: '100vh',
    display: 'grid',
    gridTemplateColumns: '1.05fr 0.95fr',
    background: 'linear-gradient(135deg, #1A5276 0%, #123A55 48%, #0F172A 100%)',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  bgCircleOne: {
    position: 'absolute',
    width: 420,
    height: 420,
    borderRadius: '50%',
    background: 'rgba(193,68,14,0.22)',
    top: -130,
    left: -90,
    filter: 'blur(4px)',
  },
  bgCircleTwo: {
    position: 'absolute',
    width: 380,
    height: 380,
    borderRadius: '50%',
    background: 'rgba(183,134,11,0.18)',
    bottom: -160,
    right: 250,
    filter: 'blur(6px)',
  },
  left: {
    position: 'relative',
    zIndex: 1,
    color: '#FFFFFF',
    padding: '34px 56px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  brand: {
    position: 'absolute',
    top: 42,
    left: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 18,
  },
  logoBox: {
    width: 58,
    height: 58,
    borderRadius: 18,
    background: 'linear-gradient(135deg, #D35400, #C1440E)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#FFFFFF',
    boxShadow: '0 15px 35px rgba(193,68,14,0.35)',
    flexShrink: 0,
  },
  brandText: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  brandName: {
    fontSize: 28,
    fontWeight: 900,
    lineHeight: 1,
    letterSpacing: -0.6,
  },
  brandSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.66)',
    marginTop: 7,
    lineHeight: 1.2,
    whiteSpace: 'nowrap',
  },
  hero: {
    maxWidth: 720,
    marginTop: 76,
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 13px',
    borderRadius: 999,
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.15)',
    color: '#FEF9E7',
    fontSize: 13,
    fontWeight: 700,
    marginBottom: 22,
  },
  title: {
    fontSize: 'clamp(44px, 5vw, 66px)',
    lineHeight: 1.04,
    margin: 0,
    letterSpacing: -1.4,
    fontWeight: 900,
  },
  description: {
    marginTop: 22,
    fontSize: 17,
    lineHeight: 1.65,
    color: 'rgba(255,255,255,0.72)',
    maxWidth: 650,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 14,
    marginTop: 28,
    maxWidth: 660,
  },
  statCard: {
    padding: 16,
    borderRadius: 18,
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.13)',
    backdropFilter: 'blur(12px)',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 900,
    color: '#FFFFFF',
  },
  statLabel: {
    marginTop: 5,
    fontSize: 12,
    color: 'rgba(255,255,255,0.62)',
  },
  right: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 34,
  },
  formCard: {
    width: '100%',
    maxWidth: 430,
    background: 'rgba(255,255,255,0.95)',
    border: '1px solid rgba(255,255,255,0.55)',
    borderRadius: 26,
    padding: 34,
    boxShadow: '0 30px 80px rgba(15,23,42,0.35)',
  },
  formTop: {
    textAlign: 'center',
    marginBottom: 26,
  },
  formIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    background: '#F5E8E3',
    color: '#C1440E',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 14px',
  },
  formTitle: {
    margin: 0,
    color: '#0F172A',
    fontSize: 27,
    fontWeight: 900,
  },
  formSub: {
    margin: '8px 0 0',
    color: '#64748B',
    fontSize: 14,
  },
  error: {
    background: '#FEE2E2',
    color: '#991B1B',
    border: '1px solid #FECACA',
    borderRadius: 12,
    padding: '11px 13px',
    fontSize: 13,
    marginBottom: 16,
    fontWeight: 700,
  },
  group: {
    marginBottom: 16,
  },
  label: {
    display: 'block',
    marginBottom: 7,
    color: '#334155',
    fontSize: 13,
    fontWeight: 800,
  },
  input: {
    width: '100%',
    height: 48,
    border: '1px solid #CBD5E1',
    borderRadius: 13,
    padding: '0 14px',
    fontSize: 14,
    outline: 'none',
    background: '#FFFFFF',
    color: '#0F172A',
    boxSizing: 'border-box',
  },
  passwordBox: {
    position: 'relative',
  },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: 'translateY(-50%)',
    border: 'none',
    background: 'transparent',
    color: '#64748B',
    cursor: 'pointer',
    display: 'flex',
    padding: 4,
  },
  submit: {
    width: '100%',
    height: 50,
    border: 'none',
    borderRadius: 14,
    background: 'linear-gradient(135deg, #C1440E, #9A360B)',
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 900,
    cursor: 'pointer',
    boxShadow: '0 14px 30px rgba(193,68,14,0.3)',
    marginTop: 4,
  },
};