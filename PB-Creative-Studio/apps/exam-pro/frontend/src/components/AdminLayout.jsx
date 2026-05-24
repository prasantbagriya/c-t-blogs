import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, BookOpen, GraduationCap,
  FileQuestion, ClipboardList, LogOut, ChevronRight, Layers, Menu, X
} from 'lucide-react';
import { useState, useEffect } from 'react';
import ToastProvider from './Toast';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
  { label: 'Classes', icon: GraduationCap, path: '/admin/classes' },
  { label: 'Subjects', icon: Layers, path: '/admin/subjects' },
  { label: 'Students', icon: Users, path: '/admin/students' },
  { label: 'Exams', icon: BookOpen, path: '/admin/exams' },
  { label: 'Questions', icon: FileQuestion, path: '/admin/questions' },
  { label: 'Results', icon: ClipboardList, path: '/admin/results' },
];

export default function AdminLayout({ children, title }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/admin/login');
  };

  const username = (() => {
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) return 'Admin';
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.username || 'Admin';
    } catch { return 'Admin'; }
  })();

  return (
    <div className="layout">
      <ToastProvider />

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-brand">
            <div className="sidebar-brand-icon">P</div>
            <div>
              <div className="sidebar-brand-name">PB STUDIO</div>
              <div className="sidebar-brand-sub text-[9px] uppercase tracking-widest font-black opacity-40">Nebula Engine</div>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Main Menu</div>
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, fontSize: 14, color: 'white', flexShrink: 0
            }}>
              {username[0].toUpperCase()}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{username}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Administrator</div>
            </div>
          </div>
          <button onClick={handleLogout} className="btn btn-ghost btn-full btn-sm">
            <LogOut size={15} /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="main-content">
        <div className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button 
              className="md:hidden p-2 -ml-2 text-zinc-400 hover:text-white transition-colors"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div>
              <div className="topbar-title">{title}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {navItems.find(n => location.pathname.startsWith(n.path))?.label}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          </div>
        </div>

        <div className="page-content">
          {children}
        </div>
      </div>
    </div>
  );
}

