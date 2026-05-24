import { useEffect, useState } from 'react';
import { ClipboardList, Search, Download, ChevronDown, Eye, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import api from '../../api';

export default function AdminResults() {
  const [data, setData] = useState({ results: [], classes: [], exams: [] });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterExam, setFilterExam] = useState('');

  const fetchAll = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterClass) params.set('class_id', filterClass);
    if (filterExam) params.set('exam_id', filterExam);
    if (search) params.set('search', search);
    api.get(`/admin/results?${params}`).then(r => setData(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, [filterClass, filterExam]);

  const handleSearch = e => {
    e.preventDefault();
    fetchAll();
  };

  const handleExport = () => {
    const params = new URLSearchParams();
    if (filterClass) params.set('class_id', filterClass);
    if (filterExam) params.set('exam_id', filterExam);
    const token = localStorage.getItem('admin_token');
    if (token) params.set('_token', token);
    window.open(`/api/admin/results/export?${params}`, '_blank');
  };

  const pct = r => r.total_questions > 0 ? ((r.score / r.total_questions) * 100).toFixed(1) : '0.0';

  const getGrade = p => {
    const n = parseFloat(p);
    if (n >= 90) return { label: 'A+', color: 'var(--emerald)' };
    if (n >= 75) return { label: 'A', color: 'var(--emerald)' };
    if (n >= 60) return { label: 'B', color: 'var(--accent-light)' };
    if (n >= 45) return { label: 'C', color: 'var(--amber)' };
    return { label: 'F', color: 'var(--rose)' };
  };

  return (
    <AdminLayout title="Exam Results">
      <div className="page-header">
        <div className="page-header-left">
          <h2>Results</h2>
          <p>{data.results.length} results shown</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={handleExport}>
          <Download size={15} /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, flex: 1, minWidth: 200 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="form-control" style={{ paddingLeft: 42 }} placeholder="Search student name or mobile..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-ghost btn-sm">Search</button>
        </form>
        {[
          { value: filterClass, set: setFilterClass, placeholder: 'All Classes', options: data.classes.map(c => ({ value: c.id, label: c.name })) },
          { value: filterExam, set: setFilterExam, placeholder: 'All Exams', options: data.exams.map(e => ({ value: e.id, label: e.title })) },
        ].map((col, i) => (
          <div key={i} style={{ position: 'relative', minWidth: 160 }}>
            <select className="form-control" value={col.value} onChange={e => col.set(e.target.value)} style={{ paddingRight: 32, appearance: 'none' }}>
              <option value="">{col.placeholder}</option>
              {col.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><div className="spinner" /></div>
      ) : data.results.length === 0 ? (
        <div className="empty-state">
          <ClipboardList />
          <h3>No results found</h3>
          <p>Results will appear here after students attempt exams</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Student</th>
                <th>Class</th>
                <th>Exam</th>
                <th>Score</th>
                <th>%</th>
                <th>Attempted</th>
                <th>Wrong</th>
                <th>Time</th>
                <th>Date</th>
                <th style={{ textAlign: 'right' }}>View</th>
              </tr>
            </thead>
            <tbody>
              {data.results.map((r, i) => {
                const p = pct(r);
                const grade = getGrade(p);
                return (
                  <tr key={r.id}>
                    <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{r.student_name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{r.student_mobile}</div>
                    </td>
                    <td><span className="badge badge-violet">{r.class_name}</span></td>
                    <td>
                      <div style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13 }}>
                        {r.exam_title}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, fontSize: 16 }}>{r.score}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>/{r.total_questions}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: grade.color }}>{p}%</span>
                      <span style={{ fontSize: 11, color: grade.color, marginLeft: 4, fontWeight: 700 }}>[{grade.label}]</span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{r.attempted_count}</td>
                    <td style={{ color: 'var(--rose)' }}>{r.wrong_count}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{r.time_taken || '—'}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                      {new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link to={`/admin/results/${r.id}`} className="btn btn-ghost btn-icon btn-sm" title="View detail">
                        <Eye size={15} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}

