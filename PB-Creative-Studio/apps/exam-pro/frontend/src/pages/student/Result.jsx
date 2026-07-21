import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, XCircle, MinusCircle, Clock, TrendingUp, Home, Trophy } from 'lucide-react';
import api from '../../api';

export default function StudentResult() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/student/result/${id}`).then(r => setResult(r.data)).catch(() => navigate('/student/dashboard')).finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)' }}>
      <div className="spinner" style={{ width: 40, height: 40 }} />
    </div>
  );

  if (!result) return null;

  const pct = result.total_questions > 0 ? ((result.score / result.total_questions) * 100).toFixed(1) : '0.0';
  const grade = (() => {
    const n = parseFloat(pct);
    if (n >= 90) return { label: 'A+', color: 'var(--emerald)', emoji: '🏆' };
    if (n >= 75) return { label: 'A', color: 'var(--emerald)', emoji: '🌟' };
    if (n >= 60) return { label: 'B', color: 'var(--accent-light)', emoji: '👍' };
    if (n >= 45) return { label: 'C', color: 'var(--amber)', emoji: '📚' };
    return { label: 'F', color: 'var(--rose)', emoji: '💪' };
  })();

  const subjectEntries = Object.entries(result.subject_stats || {});

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-dark)' }} className="res-container">
      <div style={{ maxWidth: 760, margin: '0 auto' }}>

        {/* Score Card */}
        <div className="p-6 md:p-10" style={{
          borderRadius: 24, marginBottom: 24, textAlign: 'center',
          background: 'linear-gradient(135deg, var(--bg-card), var(--bg-card2))',
          border: `1px solid ${grade.color}40`,
          boxShadow: `0 8px 40px ${grade.color}20`
        }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>{grade.emoji}</div>
          <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 4 }}>{result.exam_title}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 24 }}>Exam Result</p>

          <div style={{ fontSize: 64, fontWeight: 900, color: grade.color, lineHeight: 1, marginBottom: 8 }}>
            {pct}%
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: grade.color, marginBottom: 4 }}>
            Grade: {grade.label}
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            You scored <strong style={{ color: 'var(--text-primary)' }}>{result.score}</strong> out of <strong style={{ color: 'var(--text-primary)' }}>{result.total_questions}</strong> questions
          </div>

          {/* Progress Ring */}
          <div style={{ maxWidth: 360, margin: '24px auto 0' }}>
            <div className="progress-bar-wrap" style={{ height: 10 }}>
              <div
                className={`progress-bar-fill ${parseFloat(pct) >= 50 ? 'success' : 'danger'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid" style={{ marginBottom: 24 }}>
          {[
            { icon: CheckCircle, label: 'Correct', value: result.score, color: 'emerald' },
            { icon: XCircle, label: 'Wrong', value: result.wrong_count, color: 'rose' },
            { icon: MinusCircle, label: 'Blank', value: result.blank_count, color: 'amber' },
            { icon: Clock, label: 'Time', value: result.time_taken || '—', color: 'violet' },
          ].map(s => (
            <div key={s.label} className="glass p-4" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div className={`stat-icon ${s.color}`} style={{ marginBottom: 10, width: 44, height: 44, borderRadius: 12 }}>
                <s.icon size={20} />
              </div>
              <div style={{ fontSize: 22, fontWeight: 800 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Subject-wise */}
        {subjectEntries.length > 0 && (
          <div className="glass" style={{ padding: 28, marginBottom: 24 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrendingUp size={18} style={{ color: 'var(--accent-light)' }} /> Subject Performance
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {subjectEntries.map(([subject, stats]) => {
                const sp = stats.total > 0 ? ((stats.correct / stats.total) * 100).toFixed(0) : 0;
                return (
                  <div key={subject}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
                      <span style={{ fontWeight: 600 }}>{subject}</span>
                      <span>
                        <span style={{ color: 'var(--emerald)' }}>{stats.correct}✓</span>
                        {' '}<span style={{ color: 'var(--rose)' }}>{stats.wrong}✗</span>
                        {' '}<span style={{ color: 'var(--text-muted)' }}>of {stats.total}</span>
                        {' '}<strong style={{ color: parseInt(sp) >= 50 ? 'var(--emerald)' : 'var(--rose)' }}>({sp}%)</strong>
                      </span>
                    </div>
                    <div className="progress-bar-wrap">
                      <div className={`progress-bar-fill ${parseInt(sp) >= 50 ? 'success' : 'danger'}`} style={{ width: `${sp}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Link to="/student/dashboard" className="btn btn-primary">
            <Home size={16} /> Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

