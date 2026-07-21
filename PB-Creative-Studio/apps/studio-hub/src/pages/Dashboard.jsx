import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { 
  Search, Filter, CheckCircle2, Trash2, 
  ChevronRight, ExternalLink, Mail, Phone, Users, Inbox 
} from 'lucide-react';

export default function Dashboard() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLeads = async () => {
    try {
      const res = await fetch('/api/hub/leads', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('hub_token')}` }
      });
      const data = await res.json();
      setLeads(Array.isArray(data) ? data : []);
    } catch (err) { console.error('Fetch failed', err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLeads(); }, []);

  const markRead = async (id) => {
    try {
      await fetch(`/api/hub/leads/${id}/read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('hub_token')}` }
      });
      fetchLeads();
    } catch (err) { alert('Failed to update lead'); }
  };

  const deleteLead = async (id) => {
    if (!confirm('Permanently delete this inquiry?')) return;
    try {
      await fetch(`/api/hub/leads/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('hub_token')}` }
      });
      fetchLeads();
    } catch (err) { alert('Deletion failed'); }
  };

  const filteredLeads = leads.filter(l => {
    const matchesFilter = filter === 'all' ? true : (filter === 'unread' ? l.is_read === 0 : l.is_read === 1);
    const matchesSearch = l.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (l.email && l.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (l.source && l.source.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <Layout title="Leads Hub">
      {/* Stats Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24, marginBottom: 40 }}>
        <div className="glass" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent)', padding: 10, borderRadius: 12 }}><Inbox size={20} /></div>
            <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>Total Inquiries</span>
          </div>
          <div style={{ fontSize: 32, fontWeight: 900 }}>{leads.length}</div>
        </div>
        <div className="glass" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ background: 'rgba(236, 72, 153, 0.1)', color: 'var(--rose)', padding: 10, borderRadius: 12 }}><CheckCircle2 size={20} /></div>
            <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>New & Unread</span>
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--rose)' }}>{leads.filter(l => !l.is_read).length}</div>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 20, marginBottom: 30, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 300 }}>
          <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            className="input" 
            placeholder="Search by name, email or source..." 
            style={{ paddingLeft: 48 }} 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setFilter('all')} className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-ghost'}`}>All</button>
          <button onClick={() => setFilter('unread')} className={`btn ${filter === 'unread' ? 'btn-primary' : 'btn-ghost'}`}>Unread</button>
          <button onClick={() => setFilter('read')} className={`btn ${filter === 'read' ? 'btn-primary' : 'btn-ghost'}`}>Read</button>
        </div>
      </div>

      {/* Leads List */}
      <div className="glass" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>Loading leads data...</div>
        ) : filteredLeads.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
             <Users size={40} style={{ opacity: 0.2, marginBottom: 16 }} />
             <p>No inquiries found matching your criteria.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', textAlign: 'left', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>
                <th style={{ padding: '16px 24px' }}>Lead Details</th>
                <th style={{ padding: '16px 24px' }}>Type & Source</th>
                <th style={{ padding: '16px 24px' }}>Submission Date</th>
                <th style={{ padding: '16px 24px' }}>Status</th>
                <th style={{ padding: '16px 24px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map(lead => (
                <tr key={lead.id} style={{ borderTop: '1px solid var(--border)', transition: 'var(--transition)' }}>
                  <td style={{ padding: '24px' }}>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{lead.name}</div>
                    <div style={{ display: 'flex', gap: 15, fontSize: 12, color: 'var(--text-muted)' }}>
                      {lead.email && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Mail size={12} /> {lead.email}</span>}
                      {lead.mobile && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={12} /> {lead.mobile}</span>}
                    </div>
                    {lead.message && (
                      <div style={{ marginTop: 12, padding: 12, background: 'rgba(255,255,255,0.02)', borderRadius: 10, fontSize: 13, color: '#e2e8f0', lineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2, overflow: 'hidden' }}>
                        "{lead.message}"
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '24px' }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--accent)', marginBottom: 4 }}>{lead.type}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{lead.source}</div>
                  </td>
                  <td style={{ padding: '24px', fontSize: 13, color: 'var(--text-muted)' }}>
                    {new Date(lead.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td style={{ padding: '24px' }}>
                    <span className={`badge ${lead.is_read ? 'badge-read' : 'badge-unread'}`}>
                      {lead.is_read ? 'Handled' : 'New Lead'}
                    </span>
                  </td>
                  <td style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {!lead.is_read && (
                        <button onClick={() => markRead(lead.id)} className="btn btn-ghost" style={{ padding: 8, color: '#10b981' }} title="Mark as Handled"><CheckCircle2 size={18} /></button>
                      )}
                      <button onClick={() => deleteLead(lead.id)} className="btn btn-ghost" style={{ padding: 8, color: '#ef4444' }} title="Delete Inquiry"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}
