import { useEffect, useState } from 'react';
import { BookOpen, Plus, Trash2, Edit2, Search, ChevronDown, ToggleLeft, ToggleRight, Settings } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import Modal from '../../components/Modal';
import api from '../../api';

const emptyForm = {
  title: '', description: '', class_id: '', duration_minutes: 30,
  question_limit: 10, use_specific_questions: true, use_global_questions: false
};

export default function AdminExams() {
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchAll = () => {
    setLoading(true);
    api.get('/admin/exams').then(r => {
      setExams(r.data.exams);
      setClasses(r.data.classes);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const openAdd = () => { setForm(emptyForm); setEditingId(null); setShowForm(true); };
  const openEdit = exam => {
    setForm({
      title: exam.title, description: exam.description || '',
      class_id: exam.class_id, duration_minutes: exam.duration_minutes,
      question_limit: exam.question_limit,
      use_specific_questions: !!exam.use_specific_questions,
      use_global_questions: !!exam.use_global_questions,
    });
    setEditingId(exam.id);
    setShowForm(true);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/admin/exams/${editingId}`, form);
      } else {
        await api.post('/admin/exams', form);
      }
      setShowForm(false);
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete exam "${title}"? This will delete all related questions and results.`)) return;
    try {
      await api.delete(`/admin/exams/${id}`);
      fetchAll();
    } catch { alert('Failed to delete'); }
  };

  const handleToggle = async id => {
    try {
      await api.patch(`/admin/exams/${id}/toggle`);
      fetchAll();
    } catch { alert('Failed to toggle'); }
  };

  const filtered = exams.filter(e =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    (e.class_name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout title="Exam Management">
      <div className="page-header">
        <div className="page-header-left">
          <h2>Exams</h2>
          <p>{exams.length} total exams</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <Plus size={16} /> Create Exam
        </button>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 24, maxWidth: 400 }}>
        <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input className="form-control" style={{ paddingLeft: 42 }} placeholder="Search exams..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <BookOpen />
          <h3>No exams found</h3>
          <p>Create your first exam to get going</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filtered.map(exam => {
            const isActive = !!exam.is_active;
            return (
              <div key={exam.id} className="glass" style={{ padding: '20px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: 17 }}>{exam.title}</span>
                      <span className={`badge ${isActive ? 'badge-emerald' : 'badge-muted'}`}>
                        {isActive ? '● Live' : '● Inactive'}
                      </span>
                      {exam.class_name && <span className="badge badge-violet">{exam.class_name}</span>}
                    </div>
                    {exam.description && (
                      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>{exam.description}</p>
                    )}
                    <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>⏱ {exam.duration_minutes} min</span>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>📝 {exam.questions_count || 0} questions</span>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>🔢 Limit: {exam.question_limit}</span>
                      {exam.use_specific_questions ? <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>🎯 Specific Qs</span> : null}
                      {exam.use_global_questions ? <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>🌐 Global Qs</span> : null}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <button
                      className={`btn btn-sm ${isActive ? 'btn-danger' : 'btn-success'}`}
                      onClick={() => handleToggle(exam.id)}
                      title={isActive ? 'Deactivate exam' : 'Activate exam'}
                      style={{ gap: 6 }}
                    >
                      {isActive ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                      {isActive ? 'Active' : 'Inactive'}
                    </button>
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(exam)} title="Edit">
                      <Edit2 size={15} />
                    </button>
                    <button className="btn btn-danger btn-icon btn-sm" onClick={() => handleDelete(exam.id, exam.title)} title="Delete">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editingId ? 'Edit Exam' : 'Create New Exam'}
        subtitle="Configure exam settings and question delivery"
        size="modal-lg"
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="form-group">
            <label className="form-label">Exam Title</label>
            <input className="form-control" placeholder="e.g. Mid-Term Mathematics Test" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Description <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
            <textarea className="form-control" placeholder="Brief description of the exam..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ minHeight: 72 }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Class</label>
              <select className="form-control" value={form.class_id} onChange={e => setForm(f => ({ ...f, class_id: e.target.value }))} required>
                <option value="">Select class...</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Duration (minutes)</label>
              <input type="number" className="form-control" min={5} max={360} value={form.duration_minutes} onChange={e => setForm(f => ({ ...f, duration_minutes: +e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Question Limit</label>
              <input type="number" className="form-control" min={1} max={500} value={form.question_limit} onChange={e => setForm(f => ({ ...f, question_limit: +e.target.value }))} required />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', flex: 1, padding: '12px 16px', borderRadius: 10, border: `1px solid ${form.use_specific_questions ? 'var(--accent)' : 'var(--border)'}`, background: form.use_specific_questions ? 'rgba(99,102,241,0.08)' : 'transparent', transition: 'all 0.2s' }}>
              <input type="checkbox" checked={form.use_specific_questions} onChange={e => setForm(f => ({ ...f, use_specific_questions: e.target.checked }))} style={{ width: 16, height: 16, accentColor: 'var(--accent)' }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>Exam-specific Questions</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Use questions assigned to this exam</div>
              </div>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', flex: 1, padding: '12px 16px', borderRadius: 10, border: `1px solid ${form.use_global_questions ? 'var(--accent)' : 'var(--border)'}`, background: form.use_global_questions ? 'rgba(99,102,241,0.08)' : 'transparent', transition: 'all 0.2s' }}>
              <input type="checkbox" checked={form.use_global_questions} onChange={e => setForm(f => ({ ...f, use_global_questions: e.target.checked }))} style={{ width: 16, height: 16, accentColor: 'var(--accent)' }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>Global Class Questions</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Include class-level question bank</div>
              </div>
            </label>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 4 }}>
            <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : editingId ? 'Save Changes' : 'Create Exam'}
            </button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}

