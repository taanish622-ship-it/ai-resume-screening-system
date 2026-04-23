import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import API from '../services/api';
import toast from 'react-hot-toast';
import { HiOutlineUpload, HiOutlineDocumentText, HiOutlineCheckCircle, HiOutlineXCircle } from 'react-icons/hi';

export default function JobDetail() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchJobAndCandidates();
  }, [id]);

  const fetchJobAndCandidates = async () => {
    try {
      const [jobRes, candRes] = await Promise.all([
        API.get(`/jobs/${id}`),
        API.get(`/candidates/job/${id}`)
      ]);
      setJob(jobRes.data.job);
      setCandidates(candRes.data.candidates);
    } catch (err) {
      toast.error('Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    
    setUploading(true);
    const formData = new FormData();
    acceptedFiles.forEach(file => formData.append('resumes', file));

    try {
      const { data } = await API.post(`/candidates/upload/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(`Successfully processed ${data.count} resumes`);
      fetchJobAndCandidates();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload resumes');
    } finally {
      setUploading(false);
    }
  }, [id]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    }
  });

  if (loading) return <div className="loading-page"><div className="spinner"></div></div>;
  if (!job) return <div className="empty-state">Job not found</div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <Link to="/jobs" style={{ color: 'var(--text-secondary)' }}>Jobs</Link>
          <span style={{ color: 'var(--text-secondary)' }}>/</span>
          <span style={{ color: 'var(--text-primary)' }}>{job.title}</span>
        </div>
        <h1>{job.title}</h1>
      </div>

      <div className="grid-3" style={{ marginBottom: 24 }}>
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: 16 }}>Job Details</h2>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
            {job.description}
          </div>
          
          <h3 style={{ fontSize: '1rem', marginTop: 24, marginBottom: 12 }}>Required Skills</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {job.requiredSkills.map(s => <span key={s} className="badge badge-accent">{s}</span>)}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card">
            <h2 style={{ fontSize: '1.1rem', marginBottom: 16 }}>Upload Resumes</h2>
            <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
              <input {...getInputProps()} />
              <HiOutlineUpload className="icon" />
              {uploading ? (
                <div style={{ padding: '20px 0' }}>
                  <div className="spinner" style={{ width: 24, height: 24, margin: '0 auto 10px', borderWidth: 2 }}></div>
                  <p>Processing resumes with AI...</p>
                </div>
              ) : (
                <>
                  <p style={{ fontWeight: 500, color: 'var(--text-primary)' }}>Drag & drop resumes here</p>
                  <p className="hint">or click to select files</p>
                  <p className="hint" style={{ marginTop: 8 }}>Supports PDF, DOCX, TXT</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.1rem', marginBottom: 20 }}>Ranked Candidates ({candidates.length})</h2>
        {candidates.length === 0 ? (
          <div className="empty-state" style={{ padding: '40px 20px' }}>
            <HiOutlineDocumentText className="icon" />
            <p>No candidates yet. Upload some resumes to get started.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Candidate Name</th>
                  <th>Match Score</th>
                  <th>Experience</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((c, index) => (
                  <tr key={c._id}>
                    <td><div style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>#{index + 1}</div></td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{c.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{c.email || c.resumeOriginalName}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ 
                          fontWeight: 700, 
                          color: c.score >= 80 ? 'var(--success)' : c.score >= 60 ? 'var(--warning)' : 'var(--danger)' 
                        }}>{c.score}%</span>
                        <div style={{ width: 100, height: 6, background: 'var(--bg-primary)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ 
                            height: '100%', width: `${c.score}%`,
                            background: c.score >= 80 ? 'var(--success)' : c.score >= 60 ? 'var(--warning)' : 'var(--danger)' 
                          }}></div>
                        </div>
                      </div>
                    </td>
                    <td>{c.experienceYears} yrs</td>
                    <td>
                      <span className={`badge ${c.status === 'shortlisted' ? 'badge-success' : c.status === 'rejected' ? 'badge-danger' : 'badge-warning'}`} style={{ textTransform: 'capitalize' }}>
                        {c.status}
                      </span>
                    </td>
                    <td>
                      <Link to={`/candidates/${c._id}`} className="btn btn-secondary btn-sm">View Profile</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
