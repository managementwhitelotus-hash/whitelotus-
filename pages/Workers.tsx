import React, { useEffect, useState } from 'react';
import QRCode from 'react-qr-code';
import { Plus, Search, Trash2, QrCode, Download, X } from 'lucide-react';
import { getWorkers, addWorker, deleteWorker } from '../services/dbService';
import { Worker, WorkerStatus } from '../types';

export const Workers: React.FC = () => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [newWorkerName, setNewWorkerName] = useState('');
  const [newWorkerRole, setNewWorkerRole] = useState('');
  const [search, setSearch] = useState('');

  const loadWorkers = () => {
    setWorkers(getWorkers());
  };

  useEffect(() => {
    loadWorkers();
  }, []);

  const handleAddWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkerName || !newWorkerRole) return;
    await addWorker(newWorkerName, newWorkerRole);
    setNewWorkerName('');
    setNewWorkerRole('');
    setIsAddModalOpen(false);
    loadWorkers();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this worker?')) {
      deleteWorker(id);
      loadWorkers();
    }
  };

  const filteredWorkers = workers.filter(w => 
    w.name.toLowerCase().includes(search.toLowerCase()) || 
    w.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-2 md:p-6 w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
            <h2 className="text-3xl font-bold text-slate-800">Worker Management</h2>
            <p className="text-slate-500 mt-1">Manage employees and generate QR codes</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-5 py-3 rounded-xl font-medium transition-all shadow-lg shadow-brand-600/20 transform hover:-translate-y-0.5"
        >
          <Plus size={18} />
          Add Worker
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden w-full">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-4">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search workers..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm bg-white"
            />
          </div>
        </div>
        
        {/* Responsive Table Wrapper */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm text-slate-600 whitespace-nowrap">
            <thead className="bg-slate-50/80 text-xs uppercase font-semibold text-slate-400 tracking-wider">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredWorkers.map((worker) => (
                <tr key={worker.id} className="hover:bg-brand-50/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={worker.avatar_url} alt="" className="w-9 h-9 rounded-full bg-slate-100 border border-slate-100" />
                      <span className="font-semibold text-slate-700">{worker.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-500">{worker.role}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide ${
                      worker.status === WorkerStatus.ACTIVE 
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}>
                      {worker.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-xs">
                    {new Date(worker.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => setSelectedWorker(worker)}
                        className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                        title="View QR Code"
                      >
                        <QrCode size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(worker.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Worker"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredWorkers.length === 0 && (
                <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 bg-slate-50/30">
                        No workers found. Add one to get started.
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Worker Modal - Responsive */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-8 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">Add New Worker</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddWorker} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={newWorkerName}
                  onChange={e => setNewWorkerName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                  placeholder="e.g. John Doe"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Role / Department</label>
                <input 
                  type="text" 
                  required
                  value={newWorkerRole}
                  onChange={e => setNewWorkerRole(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                  placeholder="e.g. Creative Designer"
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-3 rounded-xl bg-brand-600 text-white hover:bg-brand-700 font-medium shadow-lg shadow-brand-600/20 transition-all"
                >
                  Create Worker
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Modal - Responsive */}
      {selectedWorker && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-800">Worker ID Card</h3>
                    <button onClick={() => setSelectedWorker(null)} className="text-slate-400 hover:text-slate-600">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="bg-brand-50/50 p-8 rounded-2xl border border-brand-100 mb-6 flex flex-col items-center">
                    <div className="bg-white p-3 rounded-xl shadow-sm mb-6 border border-brand-100">
                        <QRCode value={selectedWorker.qr_token} size={160} fgColor="#374151" />
                    </div>
                    <h4 className="font-bold text-slate-800 text-xl">{selectedWorker.name}</h4>
                    <p className="text-brand-500 font-medium">{selectedWorker.role}</p>
                    <p className="text-[10px] text-slate-400 mt-3 font-mono bg-white px-2 py-1 rounded border border-slate-100">ID: {selectedWorker.id.slice(0, 8)}</p>
                </div>

                <button 
                    onClick={() => window.print()} 
                    className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-3 rounded-xl font-medium transition-colors shadow-lg"
                >
                    <Download size={18} />
                    Print / Save
                </button>
            </div>
        </div>
      )}
    </div>
  );
};