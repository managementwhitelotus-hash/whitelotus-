import React, { useEffect, useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Users, UserCheck, UserX, Clock, Sparkles, RefreshCw } from 'lucide-react';
import { getWorkers, getAttendance } from '../services/dbService';
import { generateDailyBriefing } from '../services/aiService';
import { AttendanceStatus } from '../types';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalWorkers: 0,
    presentToday: 0,
    absentToday: 0,
    lateArrivals: 0,
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [aiBriefing, setAiBriefing] = useState<string>("");
  const [loadingBriefing, setLoadingBriefing] = useState(false);

  useEffect(() => {
    const workers = getWorkers();
    const attendance = getAttendance();
    const today = new Date().toISOString().split('T')[0];

    const present = attendance.filter(a => a.date === today && a.status === AttendanceStatus.PRESENT).length;
    const absent = attendance.filter(a => a.date === today && a.status === AttendanceStatus.ABSENT).length;

    setStats({
      totalWorkers: workers.length,
      presentToday: present,
      absentToday: absent,
      lateArrivals: 0,
    });

    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
    }).reverse();

    const data = last7Days.map(date => {
        const dayRecs = attendance.filter(a => a.date === date);
        return {
            name: date.slice(5),
            Present: dayRecs.filter(a => a.status === AttendanceStatus.PRESENT).length,
            Absent: dayRecs.filter(a => a.status === AttendanceStatus.ABSENT).length,
            Leave: dayRecs.filter(a => a.status === AttendanceStatus.LEAVE).length,
        };
    });

    setChartData(data);
    
    // Load initial briefing if stats exist
    if (workers.length > 0) {
        handleGenerateBriefing();
    }
  }, []);

  const handleGenerateBriefing = async () => {
    setLoadingBriefing(true);
    const briefing = await generateDailyBriefing();
    setAiBriefing(briefing);
    setLoadingBriefing(false);
  };

  const StatCard = ({ title, value, icon: Icon, colorClass, iconColor }: any) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
      <div>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{title}</p>
        <h3 className="text-3xl font-bold text-slate-800 mt-2 group-hover:text-brand-600 transition-colors">{value}</h3>
      </div>
      <div className={`p-4 rounded-xl ${colorClass} group-hover:scale-110 transition-transform duration-300`}>
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>
    </div>
  );

  return (
    <div className="p-2 md:p-6 space-y-8 animate-in fade-in duration-500 w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h2 className="text-3xl font-bold text-slate-800">Dashboard</h2>
            <p className="text-slate-500 mt-1">Real-time workforce overview</p>
        </div>
        <span className="self-start md:self-auto text-xs font-mono text-brand-500 bg-brand-50 px-4 py-1.5 rounded-full border border-brand-100">
            {new Date().toLocaleTimeString()}
        </span>
      </div>
      
      {/* AI Insights Widget */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-500 rounded-2xl p-6 md:p-8 text-white shadow-xl shadow-brand-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Sparkles size={20} className="text-white" />
                </div>
                <h3 className="font-bold text-lg tracking-wide">AI Daily Insight</h3>
                <button 
                    onClick={handleGenerateBriefing} 
                    disabled={loadingBriefing}
                    className="ml-auto p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
                >
                    <RefreshCw size={16} className={loadingBriefing ? 'animate-spin' : ''} />
                </button>
            </div>
            
            <p className="text-brand-50 leading-relaxed text-sm md:text-base max-w-3xl">
                {aiBriefing || "Generating workforce analysis..."}
            </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard 
            title="Total Workers" 
            value={stats.totalWorkers} 
            icon={Users} 
            colorClass="bg-blue-50" 
            iconColor="text-blue-500"
        />
        <StatCard 
            title="Present Today" 
            value={stats.presentToday} 
            icon={UserCheck} 
            colorClass="bg-emerald-50" 
            iconColor="text-emerald-500"
        />
        <StatCard 
            title="Absent Today" 
            value={stats.absentToday} 
            icon={UserX} 
            colorClass="bg-rose-50" 
            iconColor="text-rose-500"
        />
        <StatCard 
            title="On Leave" 
            value="0" 
            icon={Clock} 
            colorClass="bg-amber-50" 
            iconColor="text-amber-500"
        />
      </div>

      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm w-full">
        <h3 className="text-lg font-bold text-slate-800 mb-8 flex items-center gap-2">
            <span className="w-1 h-6 bg-brand-500 rounded-full"></span>
            Weekly Attendance
        </h3>
        
        {/* Responsive Container Wrapper with Safe Dimensions */}
        <div className="w-full h-[300px] min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94a3b8', fontSize: 12}} 
                dy={10} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94a3b8', fontSize: 12}} 
              />
              <Tooltip 
                cursor={{fill: '#fdf2f8'}}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
              />
              <Bar dataKey="Present" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={50} />
              <Bar dataKey="Absent" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={50} />
              <Bar dataKey="Leave" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={50} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};