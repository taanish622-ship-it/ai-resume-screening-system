import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlineSearch, HiOutlineTrash, HiOutlineUsers, HiOutlineCalendar } from 'react-icons/hi';

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', experienceRequired: '', educationRequired: '' });
  const [creating, setCreating] = useState(false);

  useEffect(() => { fetchJobs(); }, []);

  const fetchJobs = async () => {
    try {
      const { data } = await API.get('/jobs');
      setJobs(data.jobs);
    } catch (err) {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await API.post('/jobs', formData);
      toast.success('Job created successfully');
      setShowModal(false);
      setFormData({ title: '', description: '', experienceRequired: '', educationRequired: '' });
      fetchJobs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create job');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteJob = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this job and all its candidates?')) return;
    try {
      await API.delete(`/jobs/${id}`);
      toast.success('Job deleted');
      setJobs(jobs.filter(j => j._id !== id));
    } catch (err) {
      toast.error('Failed to delete job');
    }
  };

  if (loading) return <div className="loading-page"><div className="spinner"></div></div>;

  return (
    <div className="fade-in">
      <div className="page-header" style={{ display: 'flex', justifyItems: 'space-between', alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <h1>Job Openings</h1>
          <p>Manage your job postings and view candidates.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <HiOutlinePlus /> Post New Job
        </button>
      </div>

      {jobs.length === 0 ? (
        <div className="card empty-state">
          <HiOutlineBriefcase className="icon" style={{ fontSize: 48, color: 'var(--accent)' }} />
          <h3>No jobs posted yet</h3>
          <p>Create your first job posting to start screening resumes.</p>
          <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ marginTop: 20 }}>
            Create Job
          </button>
        </div>
      ) : (
        <div className="grid-3">
          {jobs.map(job => (
            <Link to={`/jobs/${job._id}`} key={job._id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 }}>{job.title}</h3>
                <button onClick={(e) => handleDeleteJob(e, job._id)} style={{ color: 'var(--text-secondary)', background: 'none', padding: 4 }} className="hover:text-danger">
                  <HiOutlineTrash />
                </button>
              </div>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
                {job.requiredSkills?.slice(0, 4).map(s => (
                  <span key={s} className="badge badge-accent">{s}</span>
                ))}
                {job.requiredSkills?.length > 4 && (
                  <span className="badge" style={{ background: 'var(--bg-primary)' }}>+{job.requiredSkills.length - 4}</span>
                )}
              </div>

              <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  <HiOutlineUsers /> {job.candidateCount} Candidates
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  <HiOutlineCalendar /> {new Date(job.createdAt).toLocaleDateString()}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Post New Job</h2>
              <button onClick={() => setShowModal(false)} className="modal-close">&times;</button>
            </div>
            <form onSubmit={handleCreateJob}>
              <div className="form-group">
                <label>Job Title</label>
                <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required placeholder="e.g. Senior React Developer" />
              </div>
              <div className="form-group">
                <label>Job Description & Requirements</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required rows={6} placeholder="Paste the full job description here. Our AI will automatically extract required skills." />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>Experience Needed (Optional)</label>
                  <input type="text" value={formData.experienceRequired} onChange={e => setFormData({...formData, experienceRequired: e.target.value})} placeholder="e.g. 3+ years" />
                </div>
                <div className="form-group">
                  <label>Education Required (Optional)</label>
                  <select value={formData.educationRequired} onChange={e => setFormData({...formData, educationRequired: e.target.value})}>
                    <option value="">Any</option>
                    <option value="bachelors">Bachelor's Degree</option>
                    <option value="masters">Master's Degree</option>
                    <option value="phd">PhD</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={creating}>
                  {creating ? 'Creating...' : 'Create Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function HiOutlineBriefcase({ className, style }) {
  return <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
}
