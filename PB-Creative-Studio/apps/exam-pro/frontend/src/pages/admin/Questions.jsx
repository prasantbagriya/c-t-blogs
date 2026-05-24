import { useEffect, useState, useRef } from 'react';
import { FileQuestion, Plus, Trash2, Edit2, Search, Upload, Download, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import Modal from '../../components/Modal';
import api from '../../api';

const emptyForm = {
  exam_id: '', class_id: '', subject: '',
  question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'A'
};

export default function AdminQuestions() {
  const [data, setData] = useState({ questions: [], total: 0, classes: [], exams: [], subjects: [], page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterExam, setFilterExam] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState([]);
  const fileRef = useRef();
  const [uploadResult, setUploadResult] = useState(null);
  const [uploadExamId, setUploadExamId] = useState('');
  const [uploadClassId, setUploadClassId] = useState('');

  const fetchAll = (p = page) => {
    setLoading(true);
    const params = new URLSearchParams({ page: p });
    if (filterExam) params.set('exam_id', filterExam);
    if (filterClass) params.set('class_id', filterClass);
    if (filterSubject) params.set('subject', filterSubject);
    api.get(`/admin/questions?${params}`).then(r => setData(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { setPage(1); fetchAll(1); }, [filterExam, filterClass, filterSubject]);
  useEffect(() => { fetchAll(page); }, [page]);

  const openAdd = () => { setForm({ ...emptyForm, class_id: filterClass, exam_id: filterExam, subject: filterSubject }); setEditingId(null); setShowForm(true); };
  const openEdit = q => {
    setForm({
      exam_id: q.exam_id || '', class_id: q.class_id || '', subject: q.subject || '',
      question_text: q.question_text, option_a: q.option_a, option_b: q.option_b || '',
      option_c: q.option_c || '', option_d: q.option_d || '', correct_option: q.correct_option
    });
    setEditingId(q.id);
    setShowForm(true);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/admin/questions/${editingId}`, form);
      } else {
        await api.post('/admin/questions', form);
      }
      setShowForm(false);
      fetchAll(page);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleDelete = async id => {
    if (!confirm('Delete this question?')) return;
    try {
      await api.delete(`/admin/questions/${id}`);
      fetchAll(page);
    } catch { alert('Failed to delete'); }
  };

  const handleBulkDelete = async () => {
    if (!selected.length || !confirm(`Delete ${selected.length} questions?`)) return;
    try {
      await api.post('/admin/questions/bulk-delete', { ids: selected });
      setSelected([]);
      fetchAll(page);
    } catch { alert('Failed'); }
  };

  const handleUpload = async e => {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) return alert('Select a CSV file');
    setSaving(true);
    setUploadResult(null);
    const fd = new FormData();
    fd.append('file', file);
    if (uploadExamId) fd.append('exam_id', uploadExamId);
    if (uploadClassId) fd.append('class_id', uploadClassId);
    try {
      const res = await api.post('/admin/questions/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setUploadResult(res.data);
      fetchAll(page);
    } catch (err) {
      alert(err.response?.data?.error || 'Upload failed');
    } finally { setSaving(false); }
  };

  const handleExport = () => {
    const params = new URLSearchParams();
    if (filterExam) params.set('exam_id', filterExam);
    if (filterClass) params.set('class_id', filterClass);
    const token = localStorage.getItem('admin_token');
    if (token) params.set('_token', token);
    window.open(`/api/admin/questions/export?${params}`, '_blank');
  };

  const toggleSelect = id => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleAll = () => setSelected(prev => prev.length === data.questions.length ? [] : data.questions.map(q => q.id));

  const f = v => e => setForm(x => ({ ...x, [v]: e.target.value }));

  return (
    <AdminLayout title="Question Bank">
      <div className="page-header">
        <div className="page-header-left">
          <h2>Questions</h2>
          <p>{data.total} total questions</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {selected.length > 0 && (
            <button className="btn btn-danger btn-sm" onClick={handleBulkDelete}>
              <Trash2 size={14} /> Delete {selected.length}
            </button>
          )}
          <button className="btn btn-ghost btn-sm" onClick={() => setShowUpload(true)}><Upload size={14} /> CSV</button>
          <button className="btn btn-ghost btn-sm" onClick={handleExport}><Download size={14} /> Export</button>
          <button className="btn btn-primary" onClick={openAdd}><Plus size={16} /> Add Question</button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { value: filterExam, set: setFilterExam, placeholder: 'All Exams', options: data.exams.map(e => ({ value: e.id, label: e.title })) },
          { value: filterClass, set: setFilterClass, placeholder: 'All Classes', options: data.classes.map(c => ({ value: c.id, label: c.name })) },
          { value: filterSubject, set: setFilterSubject, placeholder: 'All Subjects', options: data.subjects.map(s => ({ value: s, label: s })) },
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
      ) : data.questions.length === 0 ? (
        <div className="empty-state">
          <FileQuestion />
          <h3>No questions found</h3>
          <p>Add questions or change your filters</p>
        </div>
      ) : (
        <>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>
                    <input type="checkbox" checked={selected.length === data.questions.length} onChange={toggleAll} style={{ accentColor: 'var(--accent)' }} />
                  </th>
                  <th>#</th>
                  <th>Question</th>
                  <th>Subject</th>
                  <th>Correct</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.questions.map((q, i) => (
                  <tr key={q.id}>
                    <td>
                      <input type="checkbox" checked={selected.includes(q.id)} onChange={() => toggleSelect(q.id)} style={{ accentColor: 'var(--accent)' }} />
                    </td>
                    <td style={{ color: 'var(--text-muted)', width: 50 }}>
                      {(page - 1) * 25 + i + 1}
                    </td>
                    <td style={{ maxWidth: 360 }}>
                      <div style={{ fontWeight: 500, lineHeight: 1.5 }}>{q.question_text}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                        A: {q.option_a} &nbsp;|&nbsp; B: {q.option_b}
                        {q.option_c ? ` | C: ${q.option_c}` : ''}
                        {q.option_d ? ` | D: ${q.option_d}` : ''}
                      </div>
                    </td>
                    <td>
                      {q.subject ? <span className="badge badge-violet">{q.subject}</span> : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: 28, height: 28, borderRadius: 8,
                        background: 'rgba(16,185,129,0.2)', color: 'var(--emerald)',
                        fontWeight: 700, fontSize: 13
                      }}>{q.correct_option}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(q)}><Edit2 size={14} /></button>
                        <button className="btn btn-danger btn-icon btn-sm" onClick={() => handleDelete(q.id)}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, padding: '0 4px' }}>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                Page {data.page} of {data.totalPages} ({data.total} total)
              </span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft size={16} /> Prev
                </button>
                <button className="btn btn-ghost btn-sm" disabled={page >= data.totalPages} onClick={() => setPage(p => p + 1)}>
                  Next <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Add/Edit Modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title={editingId ? 'Edit Question' : 'Add Question'} size="modal-lg">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Exam <span style={{ color: 'var(--text-muted)' }}>(opt)</span></label>
              <select className="form-control" value={form.exam_id} onChange={f('exam_id')}>
                <option value="">No specific exam</option>
                {data.exams.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Class <span style={{ color: 'var(--text-muted)' }}>(opt)</span></label>
              <select className="form-control" value={form.class_id} onChange={f('class_id')}>
                <option value="">No class</option>
                {data.classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Subject <span style={{ color: 'var(--text-muted)' }}>(opt)</span></label>
              <input className="form-control" list="subject-opts" placeholder="e.g. Physics" value={form.subject} onChange={f('subject')} />
              <datalist id="subject-opts">
                {data.subjects.map(s => <option key={s} value={s} />)}
              </datalist>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Question Text</label>
            <textarea className="form-control" placeholder="Enter your question here..." value={form.question_text} onChange={f('question_text')} required style={{ minHeight: 90 }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {['A', 'B', 'C', 'D'].map(opt => (
              <div className="form-group" key={opt}>
                <label className="form-label">Option {opt} {opt === 'A' || opt === 'B' ? '' : <span style={{ color: 'var(--text-muted)' }}>(opt)</span>}</label>
                <input className="form-control" placeholder={`Option ${opt}`} value={form[`option_${opt.toLowerCase()}`]} onChange={f(`option_${opt.toLowerCase()}`)} required={opt === 'A' || opt === 'B'} />
              </div>
            ))}
          </div>
          <div className="form-group">
            <label className="form-label">Correct Option</label>
            <div style={{ display: 'flex', gap: 10 }}>
              {['A', 'B', 'C', 'D'].map(opt => (
                <label key={opt} style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: 8, padding: '10px', borderRadius: 8, cursor: 'pointer',
                  border: `2px solid ${form.correct_option === opt ? 'var(--emerald)' : 'var(--border)'}`,
                  background: form.correct_option === opt ? 'rgba(16,185,129,0.1)' : 'transparent',
                  transition: 'all 0.15s', fontWeight: 700
                }}>
                  <input type="radio" name="correct_opt" value={opt} checked={form.correct_option === opt} onChange={f('correct_option')} style={{ display: 'none' }} />
                  {opt}
                </label>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 4 }}>
            <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : editingId ? 'Save Changes' : 'Add Question'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Upload Modal */}
      <Modal open={showUpload} onClose={() => { setShowUpload(false); setUploadResult(null); }} title="Upload Questions CSV" subtitle="Format: Subject, Question, A, B, C, D, CorrectOption">
        <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ padding: 14, borderRadius: 10, background: 'rgba(99,102,241,0.06)', border: '1px solid var(--border)', fontSize: 13, color: 'var(--text-secondary)' }}>
            <strong style={{ color: 'var(--accent-light)' }}>CSV Format (header required):</strong><br />
            Subject,Question,Option A,Option B,Option C,Option D,Correct<br />
            Physics,What is velocity?,Speed,Acceleration,Distance,Force,A
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Assign to Exam <span style={{ color: 'var(--text-muted)' }}>(opt)</span></label>
              <select className="form-control" value={uploadExamId} onChange={e => setUploadExamId(e.target.value)}>
                <option value="">Global / No exam</option>
                {data.exams.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Assign to Class <span style={{ color: 'var(--text-muted)' }}>(opt)</span></label>
              <select className="form-control" value={uploadClassId} onChange={e => setUploadClassId(e.target.value)}>
                <option value="">No class</option>
                {data.classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">CSV File</label>
            <input type="file" accept=".csv" ref={fileRef} className="form-control" required />
          </div>
          {uploadResult && (
            <div style={{ padding: 12, borderRadius: 8, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: 'var(--emerald)', fontSize: 14 }}>
              ✓ {uploadResult.message}
            </div>
          )}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={() => { setShowUpload(false); setUploadResult(null); }}>Close</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : <><Upload size={16} /> Upload</>}
            </button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}

