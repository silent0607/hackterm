import { useState } from 'react';
import axios from 'axios';
import { Lock, User, ShieldAlert } from 'lucide-react';

export default function LoginPage({ onLogin }) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/login', { user, pass });
      if (res.data.success) {
        onLogin(res.data.user);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Giriş başarısız');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card glass-card">
        <div className="login-header">
          <div className="login-icon-box">
            <Lock size={32} color="var(--accent-cyan)" />
          </div>
          <h2 className="login-title">⬡ HackTerm <span>Pro</span></h2>
          <p className="login-subtitle">Yetkili personel girişi gereklidir</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && (
            <div className="login-error alert alert-red">
              <ShieldAlert size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Kullanıcı Adı</label>
            <div className="input-with-icon">
              <User size={18} />
              <input 
                type="text" 
                className="form-input" 
                value={user} 
                onChange={e => setUser(e.target.value)}
                placeholder="admin"
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Şifre</label>
            <div className="input-with-icon">
              <Lock size={18} />
              <input 
                type="password" 
                className="form-input" 
                value={pass} 
                onChange={e => setPass(e.target.value)}
                placeholder="••••••••"
                required 
              />
            </div>
          </div>

          <button className="btn-pro btn-cyan login-btn" disabled={loading}>
            {loading ? 'Doğrulanıyor...' : 'Sisteme Sız Giriş Yap'}
          </button>
        </form>

        <div className="login-footer">
          <p>HackTerm v4.0 Labs — Secured Environment</p>
          <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 8 }}>
            UYARI: Bu sistem sadece yetkili kullanıcılar içindir. Yetkisiz erişim girişimleri kaydedilmektedir.
          </p>
        </div>
      </div>

      <style>{`
        .login-page {
          height: 100vh;
          width: 100vw;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at center, #1a1b26 0%, #0d0e14 100%);
          overflow: hidden;
        }
        .login-card {
          width: 100%;
          max-width: 400px;
          padding: 40px;
          border-radius: 20px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
          animation: slideUp 0.6s ease-out;
        }
        .login-header {
          text-align: center;
          margin-bottom: 32px;
        }
        .login-icon-box {
          width: 64px;
          height: 64px;
          background: rgba(122, 162, 247, 0.1);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
          border: 1px solid rgba(122, 162, 247, 0.2);
        }
        .login-title {
          font-size: 24px;
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: -0.5px;
        }
        .login-title span {
          color: var(--accent-cyan);
        }
        .login-subtitle {
          color: var(--text-muted);
          font-size: 14px;
          margin-top: 4px;
        }
        .login-form .form-group {
          margin-bottom: 20px;
        }
        .input-with-icon {
          position: relative;
        }
        .input-with-icon svg {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          transition: color 0.3s;
        }
        .input-with-icon .form-input {
          padding-left: 40px;
          width: 100%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .input-with-icon .form-input:focus + svg {
          color: var(--accent-cyan);
        }
        .login-btn {
          width: 100%;
          height: 48px;
          font-weight: 600;
          margin-top: 10px;
          font-size: 15px;
        }
        .login-error {
          padding: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          margin-bottom: 20px;
        }
        .login-footer {
          text-align: center;
          margin-top: 32px;
          font-size: 12px;
          color: var(--text-secondary);
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
