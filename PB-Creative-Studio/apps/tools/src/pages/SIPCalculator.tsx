import { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

ChartJS.register(ArcElement, Tooltip, Legend);

const SIPCalculator = () => {
    const [monthlyInvestment, setMonthlyInvestment] = useState(5000);
    const [rate, setRate] = useState(12);
    const [years, setYears] = useState(10);
    const [result, setResult] = useState({ invested: 0, returns: 0, total: 0 });

    // FIX: Dynamic SEO — set page-specific title and description on mount
    useEffect(() => {
      const prevTitle = document.title;
      const prevDesc = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
      document.title = 'SIP Calculator — Free Monthly Investment Return Calculator | DevForge Kit';
      document.querySelector('meta[name="description"]')?.setAttribute('content',
        'Calculate your SIP (Systematic Investment Plan) returns. Enter monthly investment, rate, and tenure to see projected wealth with our free SIP calculator.');
      return () => {
        document.title = prevTitle;
        document.querySelector('meta[name="description"]')?.setAttribute('content', prevDesc);
      };
    }, []);

    useEffect(() => {
        const p = parseFloat(monthlyInvestment.toString());
        const i = parseFloat(rate.toString()) / 12 / 100;
        const n = parseFloat(years.toString()) * 12;

        const m = p * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
        const totalInvested = p * n;

        setResult({
            invested: Math.round(totalInvested),
            returns: Math.round(m - totalInvested),
            total: Math.round(m)
        });
    }, [monthlyInvestment, rate, years]);

    const chartData = {
        labels: ['Invested Amount', 'Est. Returns'],
        datasets: [
            {
                data: [result.invested, result.returns],
                backgroundColor: ['#e2e8f0', '#2563eb'],
                borderWidth: 0,
            },
        ],
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(val);
    };

    return (
        <div className="container mx-auto px-6 py-10 max-w-5xl">
            <Link to="/" className="inline-flex items-center text-sm text-gray-400 hover:text-white mb-8">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Tools
            </Link>

            <h1 className="text-3xl font-bold mb-8">SIP Calculator</h1>

            <div className="grid md:grid-cols-12 gap-10">
                {/* Inputs */}
                <div className="md:col-span-7 space-y-8 bg-[#0a0a0a] border border-[#222] p-8 rounded-3xl">
                    <div>
                        <div className="flex justify-between mb-4">
                            <label className="text-sm font-medium text-gray-400">Monthly Investment</label>
                            <span className="font-mono text-blue-400 bg-blue-400/10 px-2 py-1 rounded">₹{monthlyInvestment.toLocaleString()}</span>
                        </div>
                        <input
                            type="range"
                            min="500"
                            max="100000"
                            step="500"
                            value={monthlyInvestment}
                            onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
                            className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                    </div>

                    <div>
                        <div className="flex justify-between mb-4">
                            <label className="text-sm font-medium text-gray-400">Expected Return Rate (p.a)</label>
                            <span className="font-mono text-blue-400 bg-blue-400/10 px-2 py-1 rounded">{rate}%</span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="30"
                            step="0.1"
                            value={rate}
                            onChange={(e) => setRate(Number(e.target.value))}
                            className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                    </div>

                    <div>
                        <div className="flex justify-between mb-4">
                            <label className="text-sm font-medium text-gray-400">Time Period</label>
                            <span className="font-mono text-blue-400 bg-blue-400/10 px-2 py-1 rounded">{years} Years</span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="50"
                            step="1"
                            value={years}
                            onChange={(e) => setYears(Number(e.target.value))}
                            className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                    </div>
                </div>

                {/* Results */}
                <div className="md:col-span-5 flex flex-col gap-6">
                    <div className="bg-[#0a0a0a] border border-[#222] p-8 rounded-3xl flex-1 flex flex-col items-center justify-center">
                        <div className="w-48 h-48 mb-6">
                            <Doughnut data={chartData} options={{ cutout: '70%', plugins: { legend: { display: false } } }} />
                        </div>

                        <div className="w-full space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="flex items-center gap-2 text-gray-400">
                                    <span className="w-3 h-3 rounded-full bg-slate-200"></span> Invested
                                </span>
                                <span className="font-mono font-bold">{formatCurrency(result.invested)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="flex items-center gap-2 text-gray-400">
                                    <span className="w-3 h-3 rounded-full bg-[#2563eb]"></span> Returns
                                </span>
                                <span className="font-mono font-bold text-[#2563eb]">+{formatCurrency(result.returns)}</span>
                            </div>
                            <div className="h-px bg-white/10 my-2"></div>
                            <div className="flex justify-between items-center text-lg">
                                <span className="text-gray-200 font-bold">Total Value</span>
                                <span className="font-mono font-bold">{formatCurrency(result.total)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SIPCalculator;
