import { useEffect, useState } from 'react';
import { BookOpen, Users, ClipboardCheck, TrendingUp } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import AdminLayout from '../../components/AdminLayout';
import api from '../../api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard').then(r => setData(r.data)).finally(() => setLoading(false));
  }, []);

  const chartOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: 'rgba(255,255,255,0.7)', font: { family: 'Outfit', size: 12, weight: 'bold' } } },
      tooltip: { 
        backgroundColor: '#050508', 
        borderColor: 'rgba(139,92,246,0.3)', 
        borderWidth: 1,
        titleFont: { family: 'Outfit', size: 14, weight: 'bold' },
        bodyFont: { family: 'Outfit', size: 13 },
        padding: 12,
        cornerRadius: 12
      }
    },
    scales: {
      x: { ticks: { color: 'rgba(255,255,255,0.4)', font: { family: 'Outfit', size: 10 } }, grid: { color: 'rgba(255,255,255,0.03)' } },
      y: { ticks: { color: 'rgba(255,255,255,0.4)', font: { family: 'Outfit', size: 10 } }, grid: { color: 'rgba(255,255,255,0.05)' }, beginAtZero: true }
    }
  };

  return (
    <AdminLayout title="Dashboard Overview">
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
          <div className="spinner" />
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="stats-grid">
            {[
              { icon: BookOpen, label: 'Total Exams', value: data?.totalExams || 0, color: 'violet' },
              { icon: Users, label: 'Total Students', value: data?.totalStudents || 0, color: 'violet' },
              { icon: ClipboardCheck, label: 'Exams Taken', value: data?.totalResults || 0, color: 'emerald' },
              { icon: TrendingUp, label: 'Avg. Score', value: `${(data?.avgScore || 0).toFixed(1)}%`, color: 'amber' },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <div className={`stat-icon ${s.color}`}><s.icon size={24} /></div>
                <div>
                  <div className="stat-label">{s.label}</div>
                  <div className="stat-value">{s.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="glass" style={{ padding: 'clamp(20px, 4vw, 28px)' }}>
              <h3 style={{ fontWeight: 700, marginBottom: 24, fontSize: 16 }}>Class-wise Avg. Score (%)</h3>
              <div style={{ height: 280, minHeight: 0 }}>
                <Bar
                  options={{ ...chartOpts, scales: { ...chartOpts.scales, y: { ...chartOpts.scales.y, max: 100 } } }}
                  data={{
                    labels: data?.classWiseResults?.map(r => r.name) || [],
                    datasets: [{
                      label: 'Avg Score (%)',
                      data: data?.classWiseResults?.map(r => parseFloat(r.avg_percentage || 0).toFixed(1)) || [],
                      backgroundColor: 'rgba(139,92,246,0.5)',
                      borderColor: 'rgba(139,92,246,1)',
                      borderWidth: 2,
                      borderRadius: 12,
                    }]
                  }}
                />
              </div>
            </div>
            <div className="glass" style={{ padding: 'clamp(20px, 4vw, 28px)' }}>
              <h3 style={{ fontWeight: 700, marginBottom: 24, fontSize: 16 }}>Participation by Class</h3>
              <div style={{ height: 280, minHeight: 0 }}>
                <Bar
                  options={chartOpts}
                  data={{
                    labels: data?.participantStats?.map(r => r.name) || [],
                    datasets: [{
                      label: 'Participants',
                      data: data?.participantStats?.map(r => r.participants) || [],
                      backgroundColor: 'rgba(236,72,153,0.5)',
                      borderColor: 'rgba(236,72,153,1)',
                      borderWidth: 2,
                      borderRadius: 12,
                    }]
                  }}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}

