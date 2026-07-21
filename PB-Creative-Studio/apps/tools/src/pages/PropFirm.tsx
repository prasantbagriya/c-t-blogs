import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, X, AlertTriangle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const PropFirm = () => {
    const [profitTarget, setProfitTarget] = useState<number>(0);
    const [threshold, setThreshold] = useState<number>(50);
    const [dailyProfitInput, setDailyProfitInput] = useState<string>('');
    const [dailyProfits, setDailyProfits] = useState<number[]>([]);

    // FIX: Dynamic SEO — unique page title and description for Prop Firm tool
    useEffect(() => {
      const prevTitle = document.title;
      const prevDesc = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
      document.title = 'Prop Firm Evaluator — Free Consistency Rule Checker | DevForge Kit';
      document.querySelector('meta[name="description"]')?.setAttribute('content',
        'Check if your prop firm trading meets the consistency rule. Enter daily profits to evaluate if your single-day profit exceeds the allowed percentage of total profit.');
      return () => {
        document.title = prevTitle;
        document.querySelector('meta[name="description"]')?.setAttribute('content', prevDesc);
      };
    }, []);

    // Stats
    const [stats, setStats] = useState({
        totalProfit: 0,
        avgProfit: 0,
        maxProfit: 0,
        contributionPct: 0,
        neededTotal: 0,
        extraNeeded: 0,
        status: 'Waiting'
    });

    const addDay = () => {
        const val = parseFloat(dailyProfitInput);
        if (!isNaN(val) && val > 0) {
            setDailyProfits([...dailyProfits, val]);
            setDailyProfitInput('');
        }
    };

    const removeDay = (index: number) => {
        const newProfits = [...dailyProfits];
        newProfits.splice(index, 1);
        setDailyProfits(newProfits);
    };

    useEffect(() => {
        const total = dailyProfits.reduce((sum, val) => sum + val, 0);
        const max = dailyProfits.length > 0 ? Math.max(...dailyProfits) : 0;
        const avg = dailyProfits.length > 0 ? total / dailyProfits.length : 0;

        const pct = total > 0 ? (max / total) * 100 : 0;
        const needed = max > 0 ? (max / (threshold / 100)) : 0;
        const extra = Math.max(0, needed - total);

        let status = 'Waiting';
        if (dailyProfits.length > 0) {
            status = pct <= threshold ? 'Safe' : 'Warning';
        }

        setStats({
            totalProfit: total,
            avgProfit: avg,
            maxProfit: max,
            contributionPct: pct,
            neededTotal: needed,
            extraNeeded: extra,
            status
        });
    }, [dailyProfits, threshold, profitTarget]);

    return (
        <div className="container mx-auto px-6 py-10 max-w-5xl">
            <Link to="/" className="inline-flex items-center text-sm text-gray-400 hover:text-white mb-8">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Tools
            </Link>

            <h1 className="text-3xl font-bold mb-8">Prop Firm Manager</h1>

            <div className="grid md:grid-cols-12 gap-8">
                {/* Controls */}
                <div className="md:col-span-8 space-y-6">
                    {/* Settings */}
                    <div className="bg-[#0a0a0a] border border-[#222] p-6 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className="text-sm font-medium text-gray-400 mb-2 block">Profit Target ($)</label>
                            <input
                                type="number"
                                className="w-full bg-[#111] border border-[#333] rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                                placeholder="e.g. 10000"
                                value={profitTarget || ''}
                                onChange={(e) => setProfitTarget(parseFloat(e.target.value))}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-400 mb-2 block">Consistency Rule (%)</label>
                            <select
                                className="w-full bg-[#111] border border-[#333] rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500 transition-colors appearance-none"
                                value={threshold}
                                onChange={(e) => setThreshold(parseFloat(e.target.value))}
                            >
                                <option value="30">30% (Strict)</option>
                                <option value="40">40%</option>
                                <option value="50">50% (Standard)</option>
                                <option value="60">60%</option>
                            </select>
                        </div>
                    </div>

                    {/* Add Day */}
                    <div className="bg-[#0a0a0a] border border-[#222] p-6 rounded-2xl">
                        <label className="text-sm font-medium text-gray-400 mb-2 block">Add Daily Profit</label>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <input
                                type="number"
                                className="flex-1 bg-[#111] border border-[#333] rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                                placeholder="Profit Amount"
                                value={dailyProfitInput}
                                onChange={(e) => setDailyProfitInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addDay()}
                            />
                            <button
                                onClick={addDay}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center"
                            >
                                <Plus className="w-5 h-5 mr-1" /> Add
                            </button>
                        </div>
                    </div>

                    {/* Day List */}
                    <div className="bg-[#0a0a0a] border border-[#222] p-6 rounded-2xl">
                        <h3 className="text-lg font-semibold mb-4 text-white">Profit Log</h3>
                        {dailyProfits.length === 0 ? (
                            <p className="text-gray-500 text-sm italic">No data yet. Add your trading days above.</p>
                        ) : (
                            <div className="flex flex-wrap gap-3">
                                {dailyProfits.map((p, idx) => (
                                    <div key={idx} className="bg-[#1a1a1a] border border-[#333] px-4 py-2 rounded-lg flex items-center gap-3 animate-in fade-in zoom-in duration-200">
                                        <span className="text-sm">Day {idx + 1}: <span className="font-mono font-bold text-green-400">₹{p.toLocaleString()}</span></span>
                                        <button onClick={() => removeDay(idx)} className="text-gray-500 hover:text-red-400 transition-colors">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Stats Sidebar */}
                <div className="md:col-span-4 space-y-6">
                    {/* Status Card */}
                    <div className={`p-6 rounded-2xl border ${stats.status === 'Safe' ? 'bg-green-500/10 border-green-500/20' : stats.status === 'Warning' ? 'bg-amber-500/10 border-amber-500/20' : 'bg-[#0a0a0a] border-[#222]'}`}>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h4 className="text-sm font-medium text-gray-400">Status</h4>
                                <span className={`text-2xl font-bold ${stats.status === 'Safe' ? 'text-green-500' : stats.status === 'Warning' ? 'text-amber-500' : 'text-gray-200'}`}>
                                    {stats.status === 'Safe' ? 'Safe ✅' : stats.status === 'Warning' ? 'Warning ⚠️' : 'Waiting...'}
                                </span>
                            </div>
                            {stats.status === 'Safe' ? <CheckCircle className="w-8 h-8 text-green-500 opacity-50" /> : <AlertTriangle className="w-8 h-8 text-amber-500 opacity-50" />}
                        </div>

                        <div className="space-y-3">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-400">Highest Day</span>
                                    <span className="font-bold">₹{stats.maxProfit.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-400">Contribution</span>
                                    <span className="font-bold">{stats.contributionPct.toFixed(1)}%</span>
                                </div>
                                <div className="h-2 bg-gray-800 rounded-full overflow-hidden mt-2">
                                    <div
                                        className={`h-full ${stats.status === 'Safe' ? 'bg-green-500' : 'bg-amber-500'}`}
                                        style={{ width: `${Math.min(stats.contributionPct, 100)}%` }}
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1 text-right">Max allowed: {threshold}%</p>
                            </div>
                        </div>
                    </div>

                    {/* Recommendation */}
                    {stats.status === 'Warning' && (
                        <div className="bg-amber-500/5 border border-amber-500/20 p-6 rounded-2xl">
                            <h4 className="font-bold text-amber-400 mb-2">How to Fix</h4>
                            <p className="text-sm text-gray-400 leading-relaxed">
                                To match the consistency rule, you need a total profit of <strong className="text-white">₹{Math.round(stats.neededTotal).toLocaleString()}</strong>.
                            </p>
                            <div className="mt-4 pt-4 border-t border-amber-500/10">
                                <p className="text-sm text-gray-400">Balance needed:</p>
                                <p className="text-xl font-bold text-white">₹{Math.round(stats.extraNeeded).toLocaleString()}</p>
                            </div>
                        </div>
                    )}

                    <div className="bg-[#0a0a0a] border border-[#222] p-6 rounded-2xl">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-400 text-sm">Total Profit</span>
                            <span className="text-xl font-bold font-mono">₹{stats.totalProfit.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400 text-sm">Average / Day</span>
                            <span className="font-mono text-gray-300">₹{Math.round(stats.avgProfit).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PropFirm;
