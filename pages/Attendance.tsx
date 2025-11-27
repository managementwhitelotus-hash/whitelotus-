import React, { useEffect, useState } from 'react';
import { Download, Filter, Search, Plus, X, Calendar, Clock } from 'lucide-react';
import { getAttendance, exportDataToCSV, getWorkers, createManualRecord } from '../services/dbService';
import { AttendanceRecord, AttendanceStatus, Worker } from '../types';

export const Attendance: React.FC = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [search, setSearch] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formWorker, setFormWorker] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formStatus, setFormStatus] = useState<AttendanceStatus>(AttendanceStatus.PRESENT);
  const [formInTime, setFormInTime] = useState('');
  const [formOutTime, setFormOutTime] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const loadData = () => {
    setRecords(getAttendance());
    setWorkers(getWorkers());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formWorker || !formDate) return;

    createManualRecord(
      formWorker,
      formDate,
      formStatus,
      formInTime,
      formOutTime,
      formNotes
    );
    
    // Reset and close
    setIsModalOpen(false);
    setFormInTime('');
    setFormOutTime('');
    setFormNotes('');
    loadData();
  };

  const filteredRecords = records.filter(r => 
    r.worker_name.toLowerCase().includes(search.toLowerCase()) || 
    r.status.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
        case AttendanceStatus.PRESENT: return 'bg-emerald-50 text-emerald-600 border-emerald-100';
        case AttendanceStatus.ABSENT: return 'bg-rose-50 text-rose-600 border-rose-100';
        case AttendanceStatus.LEAVE: return 'bg-amber-50 text-amber-600 border-amber-100';
        default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="p-2 md:p-6 w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
            <h2 className="text-3xl font-bold text-slate-800">Attendance Log</h2>
            <p className="text-slate-500 mt-1">View and manage daily attendance records</p>
        </div>
        <div className="flex gap-3 flex-wrap">
            <button 
                onClick={() => setIsModalOpen(true)}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-brand-600/20"
            >
                <Plus size={18} />
                Manual Entry
            </button>
            <button 
                onClick={exportDataToCSV}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 px-4 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
            >
            <Download size={18} />
            Export
            </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden w-full">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-4">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search records..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm bg-white"
            />
          </div>
          <button className="p-2.5 text-slate-500 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 rounded-xl transition-all">
            <Filter size={18} />
          </button>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm text-slate-600 whitespace-nowrap">
            <thead className="bg-slate-50/80 text-xs uppercase font-semibold text-slate-400 tracking-wider">
              <tr>
                <th className="px-6 py-4">Worker</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Check In</th>
                <th className="px-6 py-4">Check Out</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-brand-50/30 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-700">{record.worker_name}</td>
                  <td className="px-6 py-4 text-slate-500">{record.date}</td>
                  <td className="px-6 py-4 text-emerald-600 font-medium">
                    {formatTime(record.check_in)}
                  </td>
                  <td className="px-6 py-4 text-rose-500 font-medium">
                    {formatTime(record.check_out)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide border ${getStatusColor(record.status)}`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400 italic text-xs max-w-[200px] truncate">
                    {record.notes || '-'}
                  </td>
                </tr>
              ))}
               {filteredRecords.length === 0 && (
                <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400 bg-slate-50/30">
                        No records found.
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Entry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 md:p-8 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">Manual Attendance Entry</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Worker</label>
                    <select 
                        required
                        value={formWorker}
                        onChange={(e) => setFormWorker(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all bg-white"
                    >
                        <option value="">-- Choose Worker --</option>
                        {workers.map(w => (
                            <option key={w.id} value={w.id}>{w.name} ({w.role})</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Date</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input 
                            type="date"
                            required
                            value={formDate}
                            onChange={(e) => setFormDate(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all" 
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status</label>
                    <select 
                        value={formStatus}
                        onChange={(e) => setFormStatus(e.target.value as AttendanceStatus)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all bg-white"
                    >
                        {Object.values(AttendanceStatus).map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Check In</label>
                    <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input 
                            type="time"
                            value={formInTime}
                            onChange={(e) => setFormInTime(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all" 
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Check Out</label>
                    <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input 
                            type="time"
                            value={formOutTime}
                            onChange={(e) => setFormOutTime(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all" 
                        />
                    </div>
                </div>

                <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Notes</label>
                    <textarea 
                        rows={3}
                        value={formNotes}
                        onChange={(e) => setFormNotes(e.target.value)}
                        placeholder="e.g. Overtime approved..."
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                    />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-3 rounded-xl bg-brand-600 text-white hover:bg-brand-700 font-medium shadow-lg shadow-brand-600/20 transition-all"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};