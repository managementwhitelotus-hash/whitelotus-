import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, ArrowLeft, LogOut } from 'lucide-react';
import { getWorkers, markAttendance } from '../services/dbService';
import { Worker, AttendanceStatus } from '../types';

export const WorkerPanel: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [worker, setWorker] = useState<Worker | null>(null);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const workers = getWorkers();
    const found = workers.find(w => w.id === id);
    if (!found) {
        navigate('/');
        return;
    }
    setWorker(found);
  }, [id, navigate]);

  const handleAction = (status: AttendanceStatus) => {
    if (!worker) return;
    try {
        markAttendance(worker.id, status);
        setSuccess(true);
        setMessage(`Successfully marked as ${status}`);
        
        // Auto logout after 3 seconds
        setTimeout(() => {
            navigate('/');
        }, 3000);
    } catch (e) {
        setSuccess(false);
        setMessage('Error marking attendance.');
    }
  };

  if (!worker) return null;

  if (success) {
    return (
        <div className="min-h-screen bg-brand-600 flex flex-col items-center justify-center p-8 text-white text-center">
            <div className="bg-white/20 p-8 rounded-full mb-8 animate-bounce">
                <CheckCircle size={64} />
            </div>
            <h1 className="text-4xl font-bold mb-4">Attendance Recorded!</h1>
            <p className="text-brand-100 text-xl">{message}</p>
            <p className="text-sm text-brand-200 mt-12 animate-pulse">Redirecting to home...</p>
        </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center p-6 relative">
        <header className="w-full max-w-md flex items-center justify-between mb-8 pt-4 relative z-10">
             <button onClick={() => navigate('/')} className="p-3 bg-white rounded-full text-slate-400 shadow-sm hover:text-brand-600 transition-colors">
                <ArrowLeft size={20} />
             </button>
             <div className="flex items-center gap-2 bg-white/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/50">
                <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
                <span className="text-[10px] font-bold text-brand-900 uppercase tracking-widest">Secure Session</span>
             </div>
        </header>

        <div className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/50 relative z-10">
            <div className="p-8 text-center border-b border-brand-50 bg-gradient-to-b from-brand-50/50 to-transparent">
                <div className="relative inline-block">
                    <img 
                        src={worker.avatar_url} 
                        alt={worker.name} 
                        className="w-28 h-28 rounded-full border-4 border-white shadow-md bg-slate-100 mx-auto mb-4" 
                    />
                    <div className="absolute bottom-4 right-0 w-7 h-7 bg-emerald-500 border-4 border-white rounded-full"></div>
                </div>
                <h1 className="text-2xl font-bold text-slate-800">Welcome, {worker.name.split(' ')[0]}</h1>
                <p className="text-brand-500 font-medium mt-1">{worker.role}</p>
            </div>

            <div className="p-8 space-y-4">
                <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">Select Status for {new Date().toLocaleDateString()}</p>
                
                <button 
                    onClick={() => handleAction(AttendanceStatus.PRESENT)}
                    className="w-full group flex items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl hover:border-emerald-200 hover:bg-emerald-50/50 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
                >
                    <div className="flex items-center gap-5">
                        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                            <CheckCircle size={24} />
                        </div>
                        <div className="text-left">
                            <span className="block font-bold text-slate-800 group-hover:text-emerald-700">Mark Present</span>
                            <span className="text-xs text-slate-400 group-hover:text-emerald-600">Clock in for the day</span>
                        </div>
                    </div>
                </button>

                <button 
                    onClick={() => handleAction(AttendanceStatus.LEAVE)}
                    className="w-full group flex items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl hover:border-amber-200 hover:bg-amber-50/50 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
                >
                    <div className="flex items-center gap-5">
                        <div className="p-3 bg-amber-100 text-amber-600 rounded-xl group-hover:bg-amber-500 group-hover:text-white transition-colors">
                            <Clock size={24} />
                        </div>
                        <div className="text-left">
                            <span className="block font-bold text-slate-800 group-hover:text-amber-700">Request Leave</span>
                            <span className="text-xs text-slate-400 group-hover:text-amber-600">Mark as on leave today</span>
                        </div>
                    </div>
                </button>

                 <button 
                    onClick={() => handleAction(AttendanceStatus.ABSENT)}
                    className="w-full group flex items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl hover:border-rose-200 hover:bg-rose-50/50 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
                >
                    <div className="flex items-center gap-5">
                        <div className="p-3 bg-rose-100 text-rose-600 rounded-xl group-hover:bg-rose-500 group-hover:text-white transition-colors">
                            <XCircle size={24} />
                        </div>
                        <div className="text-left">
                            <span className="block font-bold text-slate-800 group-hover:text-rose-700">Mark Absent</span>
                            <span className="text-xs text-slate-400 group-hover:text-rose-600">Not working today</span>
                        </div>
                    </div>
                </button>
            </div>
            
            <div className="bg-slate-50 p-5 text-center border-t border-slate-100">
                 <button onClick={() => navigate('/')} className="text-slate-400 text-sm hover:text-slate-600 flex items-center justify-center gap-2 mx-auto font-medium transition-colors">
                    <LogOut size={16} />
                    Cancel & Logout
                 </button>
            </div>
        </div>
    </div>
  );
};