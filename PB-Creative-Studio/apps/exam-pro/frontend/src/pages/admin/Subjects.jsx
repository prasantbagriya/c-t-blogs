import { useEffect, useState } from 'react';
import { Layers, Plus, Trash2, Search } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import Modal from '../../components/Modal';
import api from '../../api';

export default function AdminSubjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchSubjects = () => {
    setLoading(true);
    api.get('/admin/subjects').then(r => setSubjects(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchSubjects(); }, []);

  const handleAdd = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/admin/subjects', { name: newName.trim() });
      setNewName('');
      setShowAdd(false);
      fetchSubjects();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add subject');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete subject "${name}"?`)) return;
    try {
      await api.delete(`/admin/subjects/${id}`);
      fetchSubjects();
    } catch { alert('Failed to delete'); }
  };

  const filtered = subjects.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  const colors = ['violet', 'violet', 'emerald', 'amber', 'rose'];

  return (
    <AdminLayout title="Subject Management">
      <div className="page-header">
        <div className="page-header-left">
          <h2>Subjects</h2>
          <p>{subjects.length} total subjects</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          <Plus size={16} /> Add Subject
        </button>
      </div>

      <div style={{ position: 'relative', marginBottom: 24, maxWidth: 360 }}>
        <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          className="form-control"
          style={{ paddingLeft: 42 }}
          placeholder="Search subjects..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <Layers />
          <h3>No subjects found</h3>
          <p>{search ? 'Try a different search term' : 'Add your first subject to get started'}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {filtered.map((s, i) => (
            <div key={s.id} className="glass glass-hover" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className={`stat-icon ${colors[i % colors.length]}`} style={{ width: 44, height: 44, borderRadius: 12 }}>
                  <Layers size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{s.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>ID: {s.id}</div>
                </div>
              </div>
              <button className="btn btn-danger btn-icon" onClick={() => handleDelete(s.id, s.name)}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal open={showAdd} onClose={() => { setShowAdd(false); setNewName(''); }} title="Add New Subject" subtitle="Add a subject to the question bank">
        <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="form-group">
            <label className="form-label">Subject Name</label>
            <input
              className="form-control"
              placeholder="e.g. Mathematics, Physics, Hindi..."
              value={newName}
              onChange={e => setNewName(e.target.value)}
              autoFocus required
            />
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={() => { setShowAdd(false); setNewName(''); }}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : <><Plus size={16} /> Add Subject</>}
            </button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}

