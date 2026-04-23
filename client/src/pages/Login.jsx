import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { HiOutlineSparkles, HiOutlineMail, HiOutlineLockClosed } from 'react-icons/hi';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1a1033 50%, #0f172a 100%)',
      position: 'relative', overflow: 'hidden'
    }}>
      {/* Animated background orbs */}
      <div style={{
        position: 'absolute', width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.15), transparent 70%)',
        top: '-10%', right: '-5%', animation: 'float 6s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute', width: 300, height: 300, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(20,184,166,0.1), transparent 70%)',
        bottom: '-5%', left: '-5%', animation: 'float 8s ease-in-out infinite reverse'
      }} />
      <style>{`@keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }`}</style>

      <div className="glass-card slide-up" style={{ width: '100%', maxWidth: 420, padding: 36, position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14, margin: '0 auto 16px',
            background: 'linear-gradient(135deg, var(--accent), #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', color: 'white', boxShadow: '0 8px 32px rgba(99,102,241,0.3)'
          }}>
            <HiOutlineSparkles />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}>Welcome Back</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Sign in to ResumeAI</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <div style={{ position: 'relative' }}>
              <HiOutlineMail style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email" required style={{ paddingLeft: 36 }} />
            </div>
          </div>
          <div className="form-group">
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <HiOutlineLockClosed style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password" required style={{ paddingLeft: 36 }} />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}
            style={{ width: '100%', justifyContent: 'center', marginTop: 8, padding: '12px 20px' }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Don't have an account? <Link to="/register" style={{ fontWeight: 600 }}>Sign Up</Link>
        </p>

        <div style={{
          marginTop: 20, padding: 14, borderRadius: 'var(--radius-sm)',
          background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.1)',
          fontSize: '0.78rem', color: 'var(--text-secondary)'
        }}>
          <strong style={{ color: 'var(--accent-hover)' }}>Demo Accounts:</strong><br />
          Admin: admin@resumescreener.com / admin123<br />
          Recruiter: recruiter@resumescreener.com / recruiter123
        </div>
      </div>
    </div>
  );
}