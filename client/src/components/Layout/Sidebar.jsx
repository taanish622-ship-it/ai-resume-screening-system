import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HiOutlineViewGrid, HiOutlineBriefcase, HiOutlineUsers, HiOutlineLogout, HiOutlineShieldCheck, HiOutlineSparkles } from 'react-icons/hi';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const links = [
    { to: '/dashboard', icon: <HiOutlineViewGrid />, label: 'Dashboard' },
    { to: '/jobs', icon: <HiOutlineBriefcase />, label: 'Jobs' },
  ];

  if (user?.role === 'admin') {
    links.push({ to: '/admin', icon: <HiOutlineShieldCheck />, label: 'Admin Panel' });
  }

  return (
    <aside style={{
      width: 260, height: '100vh', position: 'fixed', left: 0, top: 0,
      background: 'linear-gradient(180deg, #0f172a 0%, #1a1f3a 100%)',
      borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column',
      padding: '0', zIndex: 100, overflow: 'hidden'
    }}>
      {/* Logo */}
      <div style={{
        padding: '24px 20px', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 12
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: 'linear-gradient(135deg, var(--accent), #8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.2rem', color: 'white'
        }}>
          <HiOutlineSparkles />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>ResumeAI</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>AI Screening System</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {links.map(link => (
          <NavLink key={link.to} to={link.to} style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
            borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', fontWeight: 500,
            color: isActive ? 'white' : 'var(--text-secondary)',
            background: isActive ? 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.1))' : 'transparent',
            borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent',
            transition: 'var(--transition)', textDecoration: 'none'
          })}>
            <span style={{ fontSize: '1.2rem' }}>{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div style={{ padding: '16px', borderTop: '1px solid var(--border)' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '12px',
          borderRadius: 'var(--radius-sm)', background: 'rgba(99,102,241,0.05)'
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent), var(--teal))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: '0.85rem', color: 'white'
          }}>
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{user?.role}</div>
          </div>
          <button onClick={handleLogout} title="Logout" style={{
            background: 'none', color: 'var(--text-secondary)', fontSize: '1.1rem', padding: 4
          }}>
            <HiOutlineLogout />
          </button>
        </div>
      </div>
    </aside>
  );
}
