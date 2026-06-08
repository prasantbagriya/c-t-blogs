import { Outlet, Link } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = () => {
    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans">
            {/* Background Glow */}
            <div className="fixed w-[600px] h-[600px] bg-indigo-500/15 rounded-full blur-3xl -top-48 left-1/2 -translate-x-1/2 pointer-events-none -z-10" />

            {/* Header */}
            <Navbar />

            {/* Main Content */}
            <main>
                <Outlet />
            </main>

            {/* Footer */}
            <div className="mt-24">
                <Footer />
            </div>
        </div>
    );
};

export default Layout;
