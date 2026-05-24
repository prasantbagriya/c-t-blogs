import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, AlertTriangle, ChevronLeft, ChevronRight, Send } from 'lucide-react';
import api from '../../api';

export default function StudentExam() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [visitedQs, setVisitedQs] = useState(new Set());
  const startTime = useRef(Date.now());
  const timerRef = useRef(null);

  useEffect(() => {
    api.get(`/student/exam/${id}`).then(r => {
      setExam(r.data.exam);
      setQuestions(r.data.questions);
      setTimeLeft(r.data.exam.duration_minutes * 60);
      setVisitedQs(new Set([0]));
    }).catch(err => {
      const msg = err.response?.data?.error;
      if (err.response?.data?.result_id) {
        navigate(`/student/result/${err.response.data.result_id}`);
      } else {
        setError(msg || 'Could not load exam');
        setLoading(false);
      }
    }).finally(() => setLoading(false));
  }, [id]);

  // Countdown timer
  useEffect(() => {
    if (!exam || submitted) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          handleSubmit(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [exam, submitted]);

  // Anti tab switch warning
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden && !submitted) {
        alert('⚠️ Warning: Switching tabs is not allowed during the exam!');
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [submitted]);

  const handleSubmit = useCallback(async (auto = false) => {
    if (submitting || submitted) return;
    if (!auto && !confirm('Are you sure you want to submit the exam?')) return;
    setSubmitting(true);
    clearInterval(timerRef.current);
    const elapsed = Math.floor((Date.now() - startTime.current) / 1000);
    const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
    const ss = String(elapsed % 60).padStart(2, '0');
    try {
      const res = await api.post(`/student/exam/${id}/submit`, {
        answers,
        time_taken: `${mm}:${ss}`
      });
      setSubmitted(true);
      setTimeout(() => navigate(`/student/result/${res.data.result_id}`), 1500);
    } catch (err) {
      if (err.response?.data?.result_id) {
        navigate(`/student/result/${err.response.data.result_id}`);
      } else {
        alert('Submission failed. Please try again.');
        setSubmitting(false);
      }
    }
  }, [submitting, submitted, answers, id]);

  const goTo = idx => {
    setCurrent(idx);
    setVisitedQs(prev => new Set([...prev, idx]));
  };

  const formatTime = s => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const timerClass = timeLeft < 60 ? 'danger' : timeLeft < 300 ? 'warning' : '';

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)' }}>
      <div className="spinner" style={{ width: 40, height: 40 }} />
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)' }}>
      <div style={{ textAlign: 'center', padding: 40 }}>
        <AlertTriangle size={48} style={{ color: 'var(--amber)', marginBottom: 16 }} />
        <h2 style={{ marginBottom: 12 }}>{error}</h2>
        <button className="btn btn-ghost" onClick={() => navigate('/student/dashboard')}>← Back to Dashboard</button>
      </div>
    </div>
  );

  if (submitted) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
        <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Exam Submitted!</h2>
        <p style={{ color: 'var(--text-muted)' }}>Redirecting to your results...</p>
        <div className="spinner" style={{ margin: '24px auto 0', width: 28, height: 28 }} />
      </div>
    </div>
  );

  if (!questions.length) return null;
  const q = questions[current];
  const answeredCount = Object.keys(answers).filter(k => answers[k]).length;

  return (
    <div className="exam-layout">
      {/* Exam Header */}
      <div className="exam-header">
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{exam?.title}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Q {current + 1}/{questions.length} &nbsp;|&nbsp; {answeredCount} answered
          </div>
        </div>
        <div className={`timer-badge ${timerClass}`}>
          <Clock size={16} />
          {formatTime(timeLeft)}
        </div>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => handleSubmit(false)}
          disabled={submitting}
        >
          <Send size={15} /> Submit Exam
        </button>
      </div>

      <div className="exam-body" style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Main Question Area */}
        <div className="question-area" style={{ flex: 1, overflowY: 'auto', padding: '32px 40px' }}>
          <div className="question-card" style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 20, padding: 40, maxWidth: 760, margin: '0 auto'
          }}>
            {/* Question Number Badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '4px 12px', borderRadius: 20, marginBottom: 20,
              background: 'rgba(99,102,241,0.12)', border: '1px solid var(--border)',
              fontSize: 12, fontWeight: 700, color: 'var(--accent-light)'
            }}>
              Question {current + 1} of {questions.length}
              {q.subject && <span style={{ marginLeft: 4, opacity: 0.7 }}>• {q.subject}</span>}
            </div>

            <div style={{ fontSize: 18, fontWeight: 600, lineHeight: 1.6, marginBottom: 32, color: 'var(--text-primary)' }}>
              {q.question_text}
            </div>

            {/* Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { key: 'A', text: q.option_a },
                { key: 'B', text: q.option_b },
                { key: 'C', text: q.option_c },
                { key: 'D', text: q.option_d },
              ].filter(o => o.text).map(opt => {
                const isSelected = answers[q.id] === opt.key;
                return (
                  <label
                    key={opt.key}
                    className="option-label"
                    style={{
                      borderColor: isSelected ? 'var(--accent)' : undefined,
                      background: isSelected ? 'rgba(99,102,241,0.1)' : undefined,
                    }}
                  >
                    <input
                      type="radio"
                      name={`q_${q.id}`}
                      value={opt.key}
                      checked={isSelected}
                      onChange={() => setAnswers(prev => ({ ...prev, [q.id]: opt.key }))}
                      style={{ display: 'none' }}
                    />
                    <div className="option-letter" style={{
                      background: isSelected ? 'var(--accent)' : undefined,
                      color: isSelected ? 'white' : undefined,
                    }}>{opt.key}</div>
                    <span style={{ fontSize: 15, lineHeight: 1.5 }}>{opt.text}</span>
                  </label>
                );
              })}
            </div>

            {/* Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 36 }}>
              <button
                className="btn btn-ghost btn-sm"
                disabled={current === 0}
                onClick={() => goTo(current - 1)}
              >
                <ChevronLeft size={16} /> Previous
              </button>
              {current < questions.length - 1 ? (
                <button className="btn btn-primary btn-sm" onClick={() => goTo(current + 1)}>
                  Next <ChevronRight size={16} />
                </button>
              ) : (
                <button className="btn btn-success btn-sm" onClick={() => handleSubmit(false)} disabled={submitting}>
                  <Send size={15} /> Submit
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Question Navigator Sidebar */}
        <div className="navigator-sidebar" style={{
          width: 240, background: 'var(--bg-card)', borderLeft: '1px solid var(--border)',
          padding: 24, overflowY: 'auto', flexShrink: 0
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: 16 }}>
            Questions
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginBottom: 24 }}>
            {questions.map((question, idx) => {
              const isAnswered = !!answers[question.id];
              const isVisited = visitedQs.has(idx);
              const isCurrent = idx === current;
              return (
                <button
                  key={idx}
                  className={`nav-dot ${isAnswered ? 'answered' : isVisited ? 'visited' : ''} ${isCurrent ? 'current' : ''}`}
                  onClick={() => goTo(idx)}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 14, height: 14, borderRadius: 3, background: 'rgba(16,185,129,0.2)', border: '1px solid var(--emerald)' }} />
              Answered
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 14, height: 14, borderRadius: 3, background: 'rgba(99,102,241,0.15)', border: '1px solid var(--accent-light)' }} />
              Visited
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 14, height: 14, borderRadius: 3, background: 'rgba(255,255,255,0.05)' }} />
              Not visited
            </div>
          </div>

          {/* Stats */}
          <div style={{ marginTop: 24, padding: 16, borderRadius: 12, background: 'rgba(99,102,241,0.06)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Progress</div>
            <div className="progress-bar-wrap">
              <div className="progress-bar-fill" style={{ width: `${(answeredCount / questions.length) * 100}%` }} />
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8 }}>
              {answeredCount}/{questions.length} answered
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

