import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  BarChart3, Inbox, LogOut, Layout, Menu, X, 
  MessageSquare, Settings, UserCircle 
} from 'lucide-react';

const navItems = [
  { label: 'Leads Hub', icon: Inbox, path: '/dashboard' },
  { label: 'Analytics', icon: BarChart3, path: '/analytics' },
  { label: 'Admin Access', icon: Settings, path: '/settings' },
];

export default function LayoutWrapper({ children, title }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const fetchUnread = async () => {
    try {
      const res = await fetch('/api/hub/leads/unread-count', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('hub_token')}` }
      });
      if (res.status === 401) {
        localStorage.removeItem('hub_token');
        navigate('/');
        return;
      }
      const data = await res.json();
      setUnreadCount(data.count || 0);
    } catch (err) { console.error('Poll failed', err); }
  };

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 15000); // Hub polls faster (15s)
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('hub_token');
    navigate('/');
  };

  const username = localStorage.getItem('hub_user') || 'Manager';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 40 }}
        />
      )}

      {/* Sidebar */}
      <aside style={{
        width: 280,
        background: 'rgba(2, 3, 14, 0.8)',
        borderRight: '1px solid var(--border)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100%',
        zIndex: 50,
        transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s ease',
      }} className="sidebar-desktop">
        <div style={{ padding: '30px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, var(--accent), #f472b6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: 'white' }}>H</div>
            <div>
              <div style={{ fontWeight: 800, letterSpacing: '0.05em' }}>STUDIO HUB</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 900 }}>CENTRAL CONTROL</div>
            </div>
          </div>

          <nav style={{ display: 'grid', gap: 8 }}>
            {navItems.map(item => (
              <NavLink 
                key={item.path} 
                to={item.path} 
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 16px',
                  borderRadius: 14,
                  textDecoration: 'none',
                  color: isActive ? 'white' : 'var(--text-muted)',
                  background: isActive ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                  border: isActive ? '1px solid rgba(99, 102, 241, 0.2)' : '1px solid transparent',
                  fontWeight: 600,
                  fontSize: 14,
                  transition: 'var(--transition)'
                })}
              >
                <item.icon size={18} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.label === 'Leads Hub' && unreadCount > 0 && (
                  <span style={{ background: 'var(--rose)', color: 'white', padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 900 }}>{unreadCount}</span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        <div style={{ marginTop: 'auto', padding: 24, borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#1e293b', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserCircle size={20} className="text-muted" />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{username}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Hub Administrator</div>
            </div>
          </div>
          <button onClick={handleLogout} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start' }}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Panel */}
      <main style={{ flex: 1, paddingLeft: 280 }} className="main-panel">
        <header style={{ padding: '20px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
             <button onClick={() => setIsSidebarOpen(true)} className="mobile-only btn btn-ghost" style={{ padding: 8 }}>
                <Menu size={24} />
             </button>
             <div>
                <h1 style={{ fontSize: 24, fontWeight: 900 }}>{title}</h1>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Management Interface v1.0</p>
             </div>
          </div>
        </header>

        <div style={{ padding: 40 }}>
          {children}
        </div>
      </main>

      <style>{`
        @media (max-width: 1024px) {
          .sidebar-desktop { width: 280px; }
          .main-panel { padding-left: 0 !important; }
          .mobile-only { display: flex !important; }
        }
        @media (min-width: 1025px) {
          .mobile-only { display: none !important; }
          .sidebar-desktop { transform: translateX(0) !important; }
        }
      `}</style>
    </div>
  );
}
