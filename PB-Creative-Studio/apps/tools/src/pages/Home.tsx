import { Link } from 'react-router-dom';
import { TrendingUp, PieChart } from 'lucide-react';

const tools = [
    {
        path: '/prop-firm',
        title: 'Prop Firm Manager',
        desc: 'Calculate Min/Max days and consistency rules tailored for FTMO, MFF, and other firms.',
        icon: TrendingUp,
        tag: 'Flagship'
    },
    {
        path: '/sip-calculator',
        title: 'SIP Forecaster',
        desc: 'Project long-term wealth creation through Systematic Investment Plans.',
        icon: PieChart
    },
    {
        path: '/compound-interest-calculator',
        title: 'Compound Growth',
        desc: 'The math of becoming a millionaire. Visualize exponential growth.',
        icon: TrendingUp
    },
];

const Home = () => {
    return (
        <div className="container mx-auto px-6 max-w-7xl">
            {/* Hero */}
            <section className="text-center py-12 md:py-20 relative">
                <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight mb-4 md:mb-6 bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(to bottom, #ffffff, #9ca3af)' }}>
                    Precision tools for<br className="hidden md:block" />the modern era.
                </h1>
                <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-8 md:mb-10 px-4">
                    Master your trading edge and financial future with our privacy-first, professional-grade calculators. No login. No data tracking.
                </p>
                <a href="#suite" className="inline-flex items-center bg-white text-black px-8 py-3 rounded-full font-semibold hover:scale-105 transition-transform">
                    Explore Suite
                </a>
            </section>

            {/* Tools Grid */}
            <section id="suite" className="py-8 md:py-16">
                <h2 className="text-xl md:text-2xl font-bold mb-6 md:mb-8 border-l-4 border-indigo-500 pl-4 uppercase tracking-wider">Tool Suite</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {tools.map((tool) => {
                        const Icon = tool.icon;
                        return (
                            <Link
                                key={tool.path}
                                to={tool.path}
                                className="group relative bg-[#0a0a0a] border border-[#222] rounded-3xl p-8 hover:bg-[#111] hover:border-[#333] hover:-translate-y-1 transition-all duration-300 flex flex-col"
                            >
                                {tool.tag && (
                                    <span className="absolute top-5 right-5 text-xs text-gray-400 border border-white/10 px-2.5 py-1 rounded-full">
                                        {tool.tag}
                                    </span>
                                )}
                                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center mb-6 text-2xl group-hover:text-indigo-400 transition-colors">
                                    <Icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-semibold mb-3">{tool.title}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed grow">
                                    {tool.desc}
                                </p>
                            </Link>
                        );
                    })}
                </div>
            </section>

            {/* Features */}
            <section className="py-16 mt-16 border-t border-white/5">
                <h2 className="text-2xl font-bold mb-8 border-l-4 border-indigo-500 pl-4">Why ChatWizs Tools?</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
                        <h4 className="text-lg font-semibold mb-2">🔒 Privacy First</h4>
                        <p className="text-gray-400 text-sm">We process everything locally on your device. Your financial data never touches our servers.</p>
                    </div>
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
                        <h4 className="text-lg font-semibold mb-2">⚡ Blazing Fast</h4>
                        <p className="text-gray-400 text-sm">Built with lightweight React. No bloat, no loading screens, just instant answers.</p>
                    </div>
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
                        <h4 className="text-lg font-semibold mb-2">📱 Mobile Optimized</h4>
                        <p className="text-gray-400 text-sm">Responsive design that works perfectly on your phone, tablet, or desktop.</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
