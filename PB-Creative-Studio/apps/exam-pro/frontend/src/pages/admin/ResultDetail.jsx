import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, BookOpen, Clock, CheckCircle, XCircle, MinusCircle, TrendingUp } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../api';

export default function AdminResultDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/admin/results/${id}`).then(r => setResult(r.data)).catch(() => navigate('/admin/results')).finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <AdminLayout title="Result Detail">
      <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><div className="spinner" /></div>
    </AdminLayout>
  );

  if (!result) return null;

  const pct = result.total_questions > 0 ? ((result.score / result.total_questions) * 100).toFixed(1) : '0.0';
  const grade = (() => {
    const n = parseFloat(pct);
    if (n >= 90) return { label: 'A+', color: 'var(--emerald)' };
    if (n >= 75) return { label: 'A', color: 'var(--emerald)' };
    if (n >= 60) return { label: 'B', color: 'var(--accent-light)' };
    if (n >= 45) return { label: 'C', color: 'var(--amber)' };
    return { label: 'F', color: 'var(--rose)' };
  })();

  const subjectEntries = Object.entries(result.subject_stats || {});

  return (
    <AdminLayout title="Result Detail">
      <div style={{ marginBottom: 20 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/results')}>
          <ArrowLeft size={15} /> Back to Results
        </button>
      </div>

      {/* Header Card */}
      <div className="glass" style={{ padding: 32, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 24 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--accent), var(--violet))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: 22, color: 'white'
              }}>{result.student_name[0].toUpperCase()}</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 20 }}>{result.student_name}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{result.student_mobile}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <span className="badge badge-violet">{result.class_name}</span>
              <span className="badge badge-muted">{result.exam_title}</span>
            </div>
          </div>

          {/* Score Display */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 60, fontWeight: 900, color: grade.color, lineHeight: 1 }}>{pct}%</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: grade.color, marginTop: 4 }}>{grade.label}</div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
              {result.score} / {result.total_questions} correct
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ marginTop: 24 }}>
          <div className="progress-bar-wrap">
            <div
              className={`progress-bar-fill ${parseFloat(pct) >= 50 ? 'success' : 'danger'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        {[
          { icon: CheckCircle, label: 'Correct', value: result.score, color: 'emerald' },
          { icon: XCircle, label: 'Wrong', value: result.wrong_count, color: 'rose' },
          { icon: MinusCircle, label: 'Blank', value: result.blank_count, color: 'amber' },
          { icon: Clock, label: 'Time Taken', value: result.time_taken || 'N/A', color: 'violet' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className={`stat-icon ${s.color}`}><s.icon size={22} /></div>
            <div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value" style={{ fontSize: 22 }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Subject-wise breakdown */}
      {subjectEntries.length > 0 && (
        <div className="glass" style={{ padding: 28 }}>
          <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={18} style={{ color: 'var(--accent-light)' }} /> Subject-wise Performance
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {subjectEntries.map(([subject, stats]) => {
              const subPct = stats.total > 0 ? ((stats.correct / stats.total) * 100).toFixed(0) : 0;
              return (
                <div key={subject}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 14 }}>
                    <span style={{ fontWeight: 600 }}>{subject}</span>
                    <span style={{ color: 'var(--text-muted)' }}>
                      {stats.correct}/{stats.total} correct
                      <span style={{ marginLeft: 8, fontWeight: 700, color: parseInt(subPct) >= 50 ? 'var(--emerald)' : 'var(--rose)' }}>
                        ({subPct}%)
                      </span>
                    </span>
                  </div>
                  <div className="progress-bar-wrap">
                    <div
                      className={`progress-bar-fill ${parseInt(subPct) >= 50 ? 'success' : 'danger'}`}
                      style={{ width: `${subPct}%` }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: 16, marginTop: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                    <span style={{ color: 'var(--emerald)' }}>✓ {stats.correct} correct</span>
                    <span style={{ color: 'var(--rose)' }}>✗ {stats.wrong} wrong</span>
                    <span>○ {stats.total - stats.correct - stats.wrong} blank</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

