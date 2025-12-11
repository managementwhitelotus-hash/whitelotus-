import React, { useEffect, useState } from 'react';
import { Plus, Search, Trash2, CheckCircle, Circle, Calendar, User, AlignLeft, X } from 'lucide-react';
import { getTasks, addTask, deleteTask, updateTaskStatus, getWorkers } from '../services/dbService';
import { Task, Worker } from '../types';

export const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');

  const loadData = () => {
    setTasks(getTasks());
    setWorkers(getWorkers());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !assignedTo || !dueDate) return;

    addTask(title, description, assignedTo, dueDate);
    
    // Reset
    setTitle('');
    setDescription('');
    setAssignedTo('');
    setDueDate('');
    setIsModalOpen(false);
    loadData();
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this task?')) {
      deleteTask(id);
      loadData();
    }
  };

  const toggleStatus = (task: Task) => {
    const newStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    updateTaskStatus(task.id, newStatus);
    loadData();
  };

  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(search.toLowerCase()) || 
    t.assignedName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-2 md:p-6 w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
            <h2 className="text-3xl font-bold text-slate-800">Task Management</h2>
            <p className="text-slate-500 mt-1">Assign and track worker tasks</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-5 py-3 rounded-xl font-medium transition-all shadow-lg shadow-brand-600/20 transform hover:-translate-y-0.5"
        >
          <Plus size={18} />
          Create Task
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden w-full">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-4">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm bg-white"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm text-slate-600 whitespace-nowrap">
            <thead className="bg-slate-50/80 text-xs uppercase font-semibold text-slate-400 tracking-wider">
              <tr>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Task</th>
                <th className="px-6 py-4">Assigned To</th>
                <th className="px-6 py-4">Due Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredTasks.map((task) => (
                <tr key={task.id} className="hover:bg-brand-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <button 
                        onClick={() => toggleStatus(task)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all ${
                            task.status === 'COMPLETED' 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : 'bg-amber-100 text-amber-700'
                        }`}
                    >
                        {task.status === 'COMPLETED' ? <CheckCircle size={14} /> : <Circle size={14} />}
                        {task.status}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-[300px] truncate">
                        <span className={`font-semibold text-slate-700 block ${task.status === 'COMPLETED' ? 'line-through text-slate-400' : ''}`}>
                            {task.title}
                        </span>
                        {task.description && <span className="text-xs text-slate-400 block truncate">{task.description}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                         <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
                            {task.assignedName.charAt(0)}
                         </div>
                         <span className="font-medium text-slate-600">{task.assignedName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                    {new Date(task.dueDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleDelete(task.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredTasks.length === 0 && (
                <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 bg-slate-50/30">
                        No tasks found.
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 md:p-8 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">Assign New Task</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddTask} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Task Title</label>
                <input 
                  type="text" 
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                  placeholder="e.g. Clean main lobby"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description (Optional)</label>
                <div className="relative">
                    <AlignLeft className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
                    <textarea 
                        rows={3}
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                        placeholder="Additional details..."
                    />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Assign To</label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <select 
                            required
                            value={assignedTo}
                            onChange={(e) => setAssignedTo(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all bg-white"
                        >
                            <option value="">Select Worker</option>
                            {workers.map(w => (
                                <option key={w.id} value={w.id}>{w.name}</option>
                            ))}
                        </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Due Date</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input 
                            type="date" 
                            required
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                        />
                    </div>
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
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};