import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import toast from 'react-hot-toast';
import { HiOutlineBriefcase, HiOutlineUserGroup, HiOutlineStar, HiOutlineTrendingUp, HiOutlinePlus } from 'react-icons/hi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentJobs, setRecentJobs] = useState([]);
  const [recentCandidates, setRecentCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [{ data: statsData }, { data: recentData }] = await Promise.all([
        API.get('/dashboard/stats'),
        API.get('/dashboard/recent')
      ]);
      setStats(statsData.stats);
      setRecentJobs(recentData.recentJobs);
      setRecentCandidates(recentData.recentCandidates);
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-page"><div className="spinner"></div></div>;

  const scoreData = stats?.scoreRanges?.map(r => ({
    range: `${r._id}-${r._id === 80 ? 100 : r._id + 19}`,
    count: r.count
  })) || [];

  return (
    <div className="fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Dashboard Overview</h1>
          <p>Welcome back! Here's what's happening with your hiring pipeline.</p>
        </div>
        <Link to="/jobs" className="btn btn-primary">
          <HiOutlinePlus /> Create Job
        </Link>
      </div>

      <div className="grid-4" style={{ marginBottom: 32 }}>
        <StatCard title="Total Jobs" value={stats?.totalJobs || 0} icon={<HiOutlineBriefcase />} color="var(--accent)" />
        <StatCard title="Total Candidates" value={stats?.totalCandidates || 0} icon={<HiOutlineUserGroup />} color="var(--teal)" />
        <StatCard title="Shortlisted" value={stats?.shortlisted || 0} icon={<HiOutlineStar />} color="var(--warning)" />
        <StatCard title="Avg Match Score" value={`${stats?.avgScore || 0}%`} icon={<HiOutlineTrendingUp />} color="var(--success)" />
      </div>

      <div className="grid-2">
        <div className="card">
          <h2 style={{ fontSize: '1.1rem', marginBottom: 20 }}>Score Distribution</h2>
          <div style={{ height: 300 }}>
            {scoreData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoreData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="range" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(99,102,241,0.1)' }} contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8 }} />
                  <Bar dataKey="count" fill="url(#colorAccent)" radius={[4, 4, 0, 0]} />
                  <defs>
                    <linearGradient id="colorAccent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent)" stopOpacity={1}/>
                      <stop offset="95%" stopColor="var(--accent)" stopOpacity={0.5}/>
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state" style={{ padding: '80px 20px' }}>
                <p>No score data available yet.</p>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <h2 style={{ fontSize: '1.1rem', marginBottom: 20 }}>Top Candidates</h2>
          {stats?.topCandidates?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {stats.topCandidates.map(c => (
                <Link to={`/candidates/${c._id}`} key={c._id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: 16, borderRadius: 'var(--radius-sm)', background: 'var(--bg-primary)',
                  border: '1px solid var(--border)', transition: 'var(--transition)'
                }}>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{c.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{c.jobId?.title}</div>
                  </div>
                  <div style={{
                    background: c.score >= 80 ? 'rgba(16,185,129,0.15)' : c.score >= 60 ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)',
                    color: c.score >= 80 ? 'var(--success)' : c.score >= 60 ? 'var(--warning)' : 'var(--danger)',
                    padding: '8px 12px', borderRadius: 8, fontWeight: 700, fontSize: '1.1rem'
                  }}>
                    {c.score}%
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '80px 20px' }}>
              <p>No candidates processed yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <div style={{
        width: 56, height: 56, borderRadius: 16,
        background: `color-mix(in srgb, ${color} 15%, transparent)`,
        color: color, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.8rem'
      }}>
        {icon}
      </div>
      <div>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>{value}</div>
      </div>
    </div>
  );
}
