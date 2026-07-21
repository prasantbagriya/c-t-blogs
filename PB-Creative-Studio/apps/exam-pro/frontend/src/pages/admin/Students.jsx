import { useEffect, useState, useRef } from 'react';
import { Users, Plus, Trash2, Search, Upload, ChevronDown, RefreshCw } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import Modal from '../../components/Modal';
import api from '../../api';

export default function AdminStudents() {
  const [data, setData] = useState({ students: [], classes: [] });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const fileRef = useRef();

  const [form, setForm] = useState({ name: '', mobile: '', password: '', class_id: '' });
  const [uploadClassId, setUploadClassId] = useState('');

  const fetchAll = (classId = filterClass) => {
    setLoading(true);
    const params = classId ? `?class_id=${classId}` : '';
    Promise.all([
      api.get(`/admin/students${params}`),
      api.get('/admin/classes'),
    ]).then(([sRes, cRes]) => {
      setData({ students: sRes.data, classes: cRes.data });
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const handleFilterChange = val => {
    setFilterClass(val);
    fetchAll(val);
  };

  const handleAdd = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/admin/students', form);
      setForm({ name: '', mobile: '', password: '', class_id: '' });
      setShowAdd(false);
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add student');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete student "${name}"?`)) return;
    try {
      await api.delete(`/admin/students/${id}`);
      fetchAll();
    } catch { alert('Failed to delete'); }
  };

  const handleUpload = async e => {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file || !uploadClassId) return alert('Select file and class');
    setSaving(true);
    setUploadResult(null);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('class_id', uploadClassId);
    try {
      const res = await api.post('/admin/students/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setUploadResult(res.data);
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.error || 'Upload failed');
    } finally { setSaving(false); }
  };

  const filtered = data.students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.mobile.includes(search)
  );

  return (
    <AdminLayout title="Student Management">
      <div className="page-header">
        <div className="page-header-left">
          <h2>Students</h2>
          <p>{data.students.length} total students</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowUpload(true)}>
            <Upload size={15} /> CSV Upload
          </button>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
            <Plus size={16} /> Add Student
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="form-control" style={{ paddingLeft: 42 }} placeholder="Search by name or mobile..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ position: 'relative', minWidth: 180 }}>
          <select className="form-control" value={filterClass} onChange={e => handleFilterChange(e.target.value)} style={{ paddingRight: 36, appearance: 'none' }}>
            <option value="">All Classes</option>
            {data.classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <ChevronDown size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => fetchAll()} title="Refresh">
          <RefreshCw size={15} />
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <Users />
          <h3>No students found</h3>
          <p>{search ? 'Try different search terms' : 'Add students to get started'}</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Mobile</th>
                <th>Class</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr key={s.id}>
                  <td style={{ color: 'var(--text-muted)', width: 50 }}>{i + 1}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--accent), var(--violet))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: 13, color: 'white', flexShrink: 0
                      }}>
                        {s.name[0].toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 600 }}>{s.name}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{s.mobile}</td>
                  <td>
                    {s.class_name ? (
                      <span className="badge badge-violet">{s.class_name}</span>
                    ) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn btn-danger btn-icon btn-sm" onClick={() => handleDelete(s.id, s.name)}>
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Student Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add New Student" subtitle="Student can login using mobile number as username">
        <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-control" placeholder="Student's full name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Mobile Number</label>
            <input className="form-control" placeholder="10-digit mobile (used as login ID)" value={form.mobile} onChange={e => setForm(f => ({ ...f, mobile: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional — defaults to mobile)</span></label>
            <input className="form-control" placeholder="Leave blank to use mobile as password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Class</label>
            <select className="form-control" value={form.class_id} onChange={e => setForm(f => ({ ...f, class_id: e.target.value }))} required>
              <option value="">Select class...</option>
              {data.classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 4 }}>
            <button type="button" className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : <><Plus size={16} /> Add Student</>}
            </button>
          </div>
        </form>
      </Modal>

      {/* CSV Upload Modal */}
      <Modal open={showUpload} onClose={() => { setShowUpload(false); setUploadResult(null); }} title="Bulk Upload Students" subtitle="CSV format: Name, Mobile, Password (optional)">
        <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ padding: 16, borderRadius: 10, background: 'rgba(99,102,241,0.06)', border: '1px solid var(--border)', fontSize: 13, color: 'var(--text-secondary)' }}>
            <strong style={{ color: 'var(--accent-light)' }}>CSV Format:</strong><br />
            Row 1 (header): Name, Mobile, Password<br />
            Row 2+: Ravi Kumar, 9876543210, mypass123
          </div>
          <div className="form-group">
            <label className="form-label">Select Class</label>
            <select className="form-control" value={uploadClassId} onChange={e => setUploadClassId(e.target.value)} required>
              <option value="">Select class...</option>
              {data.classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
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

