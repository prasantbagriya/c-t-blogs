import { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { ArrowLeft } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

const CompoundInterest = () => {
 const [principal, setPrincipal] = useState<number>(100000);
 const [rate, setRate] = useState<number>(10);
 const [years, setYears] = useState<number>(5);
 const [result, setResult] = useState({ invested: 0, interest: 0, total: 0 });

 useEffect(() => {
 const p = principal;
 const r = rate / 100;
 const t = years;
 const n = 1; // Annually

 const amount = p * Math.pow((1 + (r / n)), (n * t));
 const interest = amount - p;

 setResult({
 invested: Math.round(p),
 interest: Math.round(interest),
 total: Math.round(amount)
 });
 }, [principal, rate, years]);

 const chartData = {
 labels: ['Invested Amount', 'Total Interest'],
 datasets: [
 {
 data: [result.invested, result.interest],
 backgroundColor: ['#e2e8f0', '#10b981'],
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
 <button 
 onClick={() => {
 window.history.pushState({}, '', '/');
 window.dispatchEvent(new CustomEvent('app-navigate', { detail: '/' }));
 }}
 className="inline-flex items-center text-sm text-gray-400 hover:text-white mb-8 bg-transparent border-none cursor-pointer"
 >
 <ArrowLeft className="w-4 h-4 mr-2" /> Back to Tools
 </button>

 <h1 className="text-3xl font-bold mb-8">Compound Interest Calculator</h1>

 <div className="grid md:grid-cols-12 gap-10">
 {/* Inputs */}
 <div className="md:col-span-7 space-y-8 bg-[#0a0a0a] border border-[#222] p-8 rounded-none">
 <div>
 <div className="flex justify-between mb-4">
 <label className="text-sm font-medium text-gray-400">Principal Amount</label>
 <span className="font-mono text-indigo-400 bg-indigo-400/10 px-2 py-1 rounded-none">₹{principal.toLocaleString()}</span>
 </div>
 <input
 type="range"
 min="1000"
 max="10000000"
 step="1000"
 value={principal}
 onChange={(e) => setPrincipal(Number(e.target.value))}
 className="w-full h-2 bg-gray-800 rounded-none appearance-none cursor-pointer accent-indigo-500"
 />
 </div>

 <div>
 <div className="flex justify-between mb-4">
 <label className="text-sm font-medium text-gray-400">Interest Rate</label>
 <span className="font-mono text-indigo-400 bg-indigo-400/10 px-2 py-1 rounded-none">{rate}%</span>
 </div>
 <input
 type="range"
 min="1"
 max="30"
 step="0.1"
 value={rate}
 onChange={(e) => setRate(Number(e.target.value))}
 className="w-full h-2 bg-gray-800 rounded-none appearance-none cursor-pointer accent-indigo-500"
 />
 </div>

 <div>
 <div className="flex justify-between mb-4">
 <label className="text-sm font-medium text-gray-400">Time Period</label>
 <span className="font-mono text-indigo-400 bg-indigo-400/10 px-2 py-1 rounded-none">{years} Years</span>
 </div>
 <input
 type="range"
 min="1"
 max="50"
 step="1"
 value={years}
 onChange={(e) => setYears(Number(e.target.value))}
 className="w-full h-2 bg-gray-800 rounded-none appearance-none cursor-pointer accent-indigo-500"
 />
 </div>
 </div>

 {/* Results */}
 <div className="md:col-span-5 flex flex-col gap-6">
 <div className="bg-[#0a0a0a] border border-[#222] p-8 rounded-none flex-1 flex flex-col items-center justify-center">
 <div className="w-48 h-48 mb-6">
 <Doughnut data={chartData} options={{ cutout: '70%', plugins: { legend: { display: false } } }} />
 </div>

 <div className="w-full space-y-4">
 <div className="flex justify-between items-center text-sm">
 <span className="flex items-center gap-2 text-gray-400">
 <span className="w-3 h-3 rounded-none bg-slate-200"></span> Invested
 </span>
 <span className="font-mono font-bold">{formatCurrency(result.invested)}</span>
 </div>
 <div className="flex justify-between items-center text-sm">
 <span className="flex items-center gap-2 text-gray-400">
 <span className="w-3 h-3 rounded-none bg-[#10b981]"></span> Interest
 </span>
 <span className="font-mono font-bold text-[#10b981]">+{formatCurrency(result.interest)}</span>
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

export default CompoundInterest;
