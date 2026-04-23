import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import toast from 'react-hot-toast';
import { HiOutlineAcademicCap, HiOutlineBriefcase, HiOutlineMail, HiOutlinePhone, HiOutlineDocumentText } from 'react-icons/hi';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

export default function CandidateDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        const { data } = await API.get(`/candidates/${id}`);
        setCandidate(data.candidate);
      } catch (err) {
        toast.error('Failed to load candidate details');
      } finally {
        setLoading(false);
      }
    };
    fetchCandidate();
  }, [id]);

  const handleStatusChange = async (status) => {
    try {
      await API.put(`/candidates/${id}/status`, { status });
      setCandidate({ ...candidate, status });
      toast.success(`Candidate marked as ${status}`);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this candidate?')) return;
    try {
      await API.delete(`/candidates/${id}`);
      toast.success('Candidate deleted');
      navigate(`/jobs/${candidate.jobId._id}`);
    } catch (err) {
      toast.error('Failed to delete candidate');
    }
  };

  if (loading) return <div className="loading-page"><div className="spinner"></div></div>;
  if (!candidate) return <div className="empty-state">Candidate not found</div>;

  const radarData = [
    { subject: 'Skills', A: candidate.scoreBreakdown.skillMatch, fullMark: 100 },
    { subject: 'Experience', A: candidate.scoreBreakdown.experience, fullMark: 100 },
    { subject: 'Education', A: candidate.scoreBreakdown.education, fullMark: 100 },
    { subject: 'Relevance', A: candidate.scoreBreakdown.textSimilarity, fullMark: 100 },
  ];

  return (
    <div className="fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <Link to="/jobs" style={{ color: 'var(--text-secondary)' }}>Jobs</Link>
            <span style={{ color: 'var(--text-secondary)' }}>/</span>
            <Link to={`/jobs/${candidate.jobId._id}`} style={{ color: 'var(--text-secondary)' }}>{candidate.jobId.title}</Link>
            <span style={{ color: 'var(--text-secondary)' }}>/</span>
            <span style={{ color: 'var(--text-primary)' }}>{candidate.name}</span>
          </div>
          <h1>{candidate.name}</h1>
          <div style={{ display: 'flex', gap: 16, marginTop: 8, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {candidate.email && <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><HiOutlineMail /> {candidate.email}</span>}
            {candidate.phone && <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><HiOutlinePhone /> {candidate.phone}</span>}
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: 12 }}>
          <select 
            value={candidate.status} 
            onChange={(e) => handleStatusChange(e.target.value)}
            style={{ width: 'auto', background: 'var(--bg-surface-light)' }}
          >
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="rejected">Rejected</option>
          </select>
          <button onClick={handleDelete} className="btn btn-danger btn-sm">Delete</button>
        </div>
      </div>

      <div className="grid-3" style={{ marginBottom: 24 }}>
        {/* Score Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h2 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: 20 }}>Overall AI Match</h2>
          <div style={{ position: 'relative', width: 160, height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', position: 'absolute', transform: 'rotate(-90deg)' }}>
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--bg-primary)" strokeWidth="3" />
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" 
                stroke={candidate.score >= 80 ? 'var(--success)' : candidate.score >= 60 ? 'var(--warning)' : 'var(--danger)'} 
                strokeWidth="3" strokeDasharray={`${candidate.score}, 100`} style={{ transition: 'stroke-dasharray 1s ease' }} />
            </svg>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>{candidate.score}%</div>
            </div>
          </div>
        </div>

        {/* Radar Chart */}
        <div className="card">
          <h2 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: 10 }}>Score Breakdown</h2>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <Radar name="Score" dataKey="A" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.5} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Experience & Ed */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', marginBottom: 8, fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase' }}>
              <HiOutlineBriefcase /> Experience
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{candidate.experienceYears} Years</div>
          </div>
          <div style={{ height: 1, background: 'var(--border)' }}></div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', marginBottom: 8, fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase' }}>
              <HiOutlineAcademicCap /> Education
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 500, textTransform: 'capitalize' }}>
              {candidate.educationLevel.replace('_', ' ')}
            </div>
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h2 style={{ fontSize: '1.1rem', marginBottom: 20 }}>Skills Match</h2>
          
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 10 }}>Matched Skills ({candidate.matchedSkills.length})</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              {candidate.matchedSkills.map(s => <span key={s} className="skill-tag matched">{s}</span>)}
              {candidate.matchedSkills.length === 0 && <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>None found</span>}
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 10 }}>Missing Required Skills ({candidate.unmatchedSkills.length})</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              {candidate.unmatchedSkills.map(s => <span key={s} className="skill-tag unmatched">{s}</span>)}
              {candidate.unmatchedSkills.length === 0 && <span style={{ color: 'var(--success)', fontSize: '0.9rem' }}>All required skills matched!</span>}
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 10 }}>Other Extracted Skills</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              {candidate.skills.filter(s => !candidate.matchedSkills.includes(s)).map(s => (
                <span key={s} className="skill-tag neutral">{s}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <h2 style={{ fontSize: '1.1rem', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <HiOutlineDocumentText /> Experience Details
          </h2>
          <div style={{ 
            background: 'var(--bg-primary)', padding: 16, borderRadius: 'var(--radius-sm)', 
            border: '1px solid var(--border)', fontSize: '0.9rem', whiteSpace: 'pre-wrap', 
            color: 'var(--text-secondary)', lineHeight: 1.6, maxHeight: 400, overflowY: 'auto'
          }}>
            {candidate.experienceDetails || "No detailed experience section could be clearly extracted."}
          </div>
        </div>
      </div>
    </div>
  );
}
