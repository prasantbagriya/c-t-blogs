import { Outlet } from 'react-router-dom';
// @ts-ignore
import GlobalNavbar from './GlobalNavbar';
// @ts-ignore
import GlobalFooter from './GlobalFooter';

const Layout = () => {
    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans">
            {/* Background Glow */}
            <div className="fixed w-150 h-150 bg-indigo-500/15 rounded-full blur-3xl -top-48 left-1/2 -translate-x-1/2 pointer-events-none -z-10" />

            {/* Header */}
            <GlobalNavbar />

            {/* Main Content */}
            <main>
                <Outlet />
            </main>

            {/* Footer */}
            <GlobalFooter />
        </div>
    );
};

export default Layout;
