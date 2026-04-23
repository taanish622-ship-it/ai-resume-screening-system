import { useState, useEffect } from 'react';
import API from '../services/api';
import toast from 'react-hot-toast';
import { HiOutlineTrash, HiOutlineUser } from 'react-icons/hi';

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, statsRes] = await Promise.all([
        API.get('/admin/users'),
        API.get('/admin/stats')
      ]);
      setUsers(usersRes.data.users);
      setStats(statsRes.data.stats);
    } catch (err) {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user and ALL their jobs/candidates?')) return;
    try {
      await API.delete(`/admin/users/${id}`);
      toast.success('User deleted successfully');
      setUsers(users.filter(u => u._id !== id));
      fetchData(); // Refresh stats
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  if (loading) return <div className="loading-page"><div className="spinner"></div></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Admin Control Panel</h1>
        <p>Manage users and monitor system health.</p>
      </div>

      <div className="grid-4" style={{ marginBottom: 32 }}>
        <div className="card">
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Total Users</div>
          <div style={{ fontSize: '2rem', fontWeight: 700, marginTop: 8 }}>{stats?.totalUsers || 0}</div>
        </div>
        <div className="card">
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Recruiters</div>
          <div style={{ fontSize: '2rem', fontWeight: 700, marginTop: 8 }}>{stats?.totalRecruiters || 0}</div>
        </div>
        <div className="card">
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Total Jobs Posted</div>
          <div style={{ fontSize: '2rem', fontWeight: 700, marginTop: 8 }}>{stats?.totalJobs || 0}</div>
        </div>
        <div className="card">
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Resumes Processed</div>
          <div style={{ fontSize: '2rem', fontWeight: 700, marginTop: 8, color: 'var(--accent)' }}>{stats?.totalCandidates || 0}</div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.2rem', marginBottom: 20 }}>System Users</h2>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Joined Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)'
                      }}>
                        <HiOutlineUser />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{user.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${user.role === 'admin' ? 'badge-accent' : ''}`} style={{ textTransform: 'capitalize' }}>
                      {user.role}
                    </span>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    {user.role !== 'admin' && (
                      <button onClick={() => handleDeleteUser(user._id)} className="btn btn-danger btn-sm">
                        <HiOutlineTrash /> Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
