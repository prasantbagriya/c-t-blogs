import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

interface CampaignAnalyticsProps {
  campaigns: any[];
}

export const CampaignAnalytics = ({ campaigns }: CampaignAnalyticsProps) => {
  const data = campaigns.length > 0
    ? campaigns.slice(-7).map(c => ({
      name: c.date === 'Just now' ? 'New' : (c.date?.split(' ')[0] || 'New'),
      open: parseInt(c.open) || 0,
      click: parseInt(c.click) || 0,
      sent: c.sent || 0
    }))
    : [
      { name: 'Mon', open: 0, click: 0, sent: 0 },
      { name: 'Tue', open: 0, click: 0, sent: 0 },
      { name: 'Wed', open: 0, click: 0, sent: 0 },
      { name: 'Thu', open: 0, click: 0, sent: 0 },
      { name: 'Fri', open: 0, click: 0, sent: 0 },
      { name: 'Sat', open: 0, click: 0, sent: 0 },
      { name: 'Sun', open: 0, click: 0, sent: 0 },
    ];

  const avgOpen = campaigns.length > 0
    ? (campaigns.reduce((acc, c) => acc + (parseInt(c.open) || 0), 0) / campaigns.length).toFixed(1)
    : '0';
  const avgClick = campaigns.length > 0
    ? (campaigns.reduce((acc, c) => acc + (parseInt(c.click) || 0), 0) / campaigns.length).toFixed(1)
    : '0';
  const totalSent = campaigns.reduce((acc, c) => acc + (c.sent || 0), 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Open Rate', value: `${avgOpen}%`, color: 'text-blue-600' },
          { label: 'Click Rate', value: `${avgClick}%`, color: 'text-emerald-600' },
          { label: 'Total Sent', value: totalSent.toLocaleString(), color: 'text-slate-900 dark:text-white' },
          { label: 'Count', value: campaigns.length.toString(), color: 'text-slate-400' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-slate-900 p-4 rounded border border-slate-200 dark:border-slate-200">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <h4 className={`text-xl font-bold ${stat.color}`}>{stat.value}</h4>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded border border-slate-200 dark:border-slate-200">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Activity</h3>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" opacity={0.5} />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 600 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 600 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  borderRadius: '4px',
                  border: '1px solid #e2e8f0',
                  boxShadow: 'none'
                }}
              />
              <Area type="monotone" dataKey="open" stroke="#4f46e5" strokeWidth={2} fill="#4f46e5" fillOpacity={0.05} />
              <Area type="monotone" dataKey="click" stroke="#10b981" strokeWidth={2} fill="#10b981" fillOpacity={0.05} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
