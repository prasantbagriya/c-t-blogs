import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, BookOpen, Clock, CheckCircle, PlayCircle, LogOut, Trophy } from 'lucide-react';
import api from '../../api';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const info = (() => {
    try { return JSON.parse(localStorage.getItem('student_info') || '{}'); }
    catch { return {}; }
  })();

  useEffect(() => {
    api.get('/student/dashboard').then(r => setData(r.data)).catch(() => {
      localStorage.removeItem('student_token');
      navigate('/student/login');
    }).finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('student_token');
    localStorage.removeItem('student_info');
    navigate('/student/login');
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)' }}>
      <div className="spinner" style={{ width: 40, height: 40 }} />
    </div>
  );

  const available = data?.exams?.filter(e => !e.attempted) || [];
  const attempted = data?.exams?.filter(e => e.attempted) || [];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-dark)' }}>
      {/* Header */}
      <header className="res-header" style={{
        minHeight: 64, background: 'var(--bg-card)', borderBottom: '1px solid var(--border)',
        padding: '12px 24px', position: 'sticky', top: 0, zIndex: 100
      }}>
        <div className="res-flex">
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: 'linear-gradient(135deg, var(--emerald), #059669)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0
          }}>🎓</div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 800, fontSize: 15, background: 'linear-gradient(to right, var(--emerald), #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>EduExam Pro</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Student Portal</div>
          </div>
        </div>
        <div className="res-flex" style={{ flexWrap: 'nowrap' }}>
          <div className="hidden md-block" style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{data?.student?.name}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{data?.student?.class_name}</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
            <LogOut size={15} /> <span className="hidden md-block">Logout</span>
          </button>
        </div>
      </header>

      <div className="res-container">
        {/* Welcome */}
        <div className="res-header" style={{
          padding: 24, borderRadius: 20, marginBottom: 32,
          background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.08))',
          border: '1px solid rgba(16,185,129,0.25)',
        }}>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>
              Welcome back, {data?.student?.name?.split(' ')[0]}! 👋
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
              Class: <strong style={{ color: 'var(--emerald)' }}>{data?.student?.class_name}</strong>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 24, textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--emerald)' }}>{available.length}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Available</div>
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--accent-light)' }}>{attempted.length}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Completed</div>
            </div>
          </div>
        </div>

        {/* Available Exams */}
        <div style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <BookOpen size={18} style={{ color: 'var(--accent-light)' }} /> Available Exams
          </h2>
          {available.length === 0 ? (
            <div className="glass" style={{ padding: '36px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <BookOpen size={40} style={{ opacity: 0.2, marginBottom: 12 }} />
              <p>No exams available right now. Check back later!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {available.map(exam => (
                <div key={exam.id} className="glass glass-hover p-4 res-header" style={{ border: '1px solid var(--border)' }}>
                  <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{exam.title}</div>
                    <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--text-secondary)' }}>
                      <span>⏱ {exam.duration_minutes}m</span>
                      <span>📝 {exam.question_limit} Qs</span>
                    </div>
                  </div>
                  <Link
                    to={`/student/exam/${exam.id}`}
                    className="btn btn-success btn-sm"
                  >
                    <PlayCircle size={15} /> Start
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Attempted Exams */}
        {attempted.length > 0 && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Trophy size={18} style={{ color: 'var(--amber)' }} /> Completed Exams
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {attempted.map(exam => (
                <div key={exam.id} className="glass" style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, opacity: 0.8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <CheckCircle size={20} style={{ color: 'var(--emerald)', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 15 }}>{exam.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Already attempted</div>
                    </div>
                  </div>
                  {exam.result_id && (
                    <Link to={`/student/result/${exam.result_id}`} className="btn btn-ghost btn-sm">
                      View Result
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

