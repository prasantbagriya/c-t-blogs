import { Outlet, Link } from 'react-router-dom';

const Layout = () => {
    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans">
            {/* Background Glow */}
            <div className="fixed w-[600px] h-[600px] bg-indigo-500/15 rounded-full blur-3xl -top-48 left-1/2 -translate-x-1/2 pointer-events-none -z-10" />

            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-md border-b border-white/5 py-4">
                <div className="container mx-auto px-6 flex justify-between items-center max-w-7xl">
                    <Link to="/" className="text-xl font-bold flex items-center gap-2.5 hover:opacity-80 transition-opacity">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full shadow-[0_0_10px_#6366f1]" />
                        TopStore Tools
                    </Link>
                    <nav className="flex gap-8 text-sm font-medium text-gray-400">
                        <a href={import.meta.env && import.meta.env.DEV ? "http://localhost:5174/" : "/"} className="hover:text-white transition-colors">chatwizs studio</a>
                        <Link to="/" className="hover:text-white transition-colors">All Tools</Link>
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <main>
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="border-t border-white/5 mt-24 py-16 text-center">
                <div className="flex justify-center gap-10 mb-8 text-sm text-gray-400">
                    <Link to="/privacy" className="hover:text-white">Privacy</Link>
                    <Link to="/terms" className="hover:text-white">Terms</Link>
                    <a href="mailto:support@chatwizs.com" className="hover:text-white">Contact</a>
                </div>
                <p className="text-gray-600 text-sm">&copy; 2026 TopStore Tools. Crafted for performance.</p>
            </footer>
        </div>
    );
};

export default Layout;
