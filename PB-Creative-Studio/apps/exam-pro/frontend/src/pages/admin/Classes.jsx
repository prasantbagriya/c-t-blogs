import { useEffect, useState } from 'react';
import { GraduationCap, Plus, Trash2, Search } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import Modal from '../../components/Modal';
import api from '../../api';

export default function AdminClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchClasses = () => {
    setLoading(true);
    api.get('/admin/classes').then(r => setClasses(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchClasses(); }, []);

  const handleAdd = async e => {
    e.preventDefault();
    if (!newName.trim()) return;
    setSaving(true);
    try {
      await api.post('/admin/classes', { name: newName.trim() });
      setNewName('');
      setShowAdd(false);
      fetchClasses();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add class');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete class "${name}"? All related data may be affected.`)) return;
    try {
      await api.delete(`/admin/classes/${id}`);
      fetchClasses();
    } catch { alert('Failed to delete'); }
  };

  const filtered = classes.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <AdminLayout title="Class Management">
      <div className="page-header">
        <div className="page-header-left">
          <h2>Classes</h2>
          <p>{classes.length} total classes</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          <Plus size={16} /> Add Class
        </button>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 24, maxWidth: 360 }}>
        <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          className="form-control"
          style={{ paddingLeft: 42 }}
          placeholder="Search classes..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <GraduationCap />
          <h3>No classes found</h3>
          <p>{search ? 'Try a different search term' : 'Add your first class to get started'}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {filtered.map(c => (
            <div key={c.id} className="glass glass-hover" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="stat-icon violet" style={{ width: 44, height: 44, borderRadius: 12 }}>
                  <GraduationCap size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>ID: {c.id}</div>
                </div>
              </div>
              <button
                className="btn btn-danger btn-icon"
                onClick={() => handleDelete(c.id, c.name)}
                title="Delete class"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      <Modal open={showAdd} onClose={() => { setShowAdd(false); setNewName(''); }} title="Add New Class" subtitle="Create a class to group your students">
        <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="form-group">
            <label className="form-label">Class Name</label>
            <input
              className="form-control"
              placeholder="e.g. Class 10, Grade A, Batch 2025..."
              value={newName}
              onChange={e => setNewName(e.target.value)}
              autoFocus required
            />
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={() => { setShowAdd(false); setNewName(''); }}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : <><Plus size={16} /> Add Class</>}
            </button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}

