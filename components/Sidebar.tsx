import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  ClipboardList, 
  Settings, 
  LogOut 
} from 'lucide-react';

const LotusIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 80" className={className} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M50 70 C50 70 30 60 20 40 C20 25 35 25 35 25 C35 25 40 40 50 50 C60 40 65 25 65 25 C65 25 80 25 80 40 C70 60 50 70 50 70 Z" />
    <path d="M50 50 C50 50 45 25 50 5 C55 25 50 50 50 50 Z" />
    <path d="M35 25 C35 25 25 15 25 5 C35 15 35 25 35 25 Z" />
    <path d="M65 25 C65 25 75 15 75 5 C65 15 65 25 65 25 Z" />
  </svg>
);

interface SidebarProps {
    onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
  };

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 font-medium ${
      isActive 
        ? 'bg-brand-50 text-brand-600 shadow-sm border border-brand-100' 
        : 'text-slate-500 hover:bg-slate-50 hover:text-brand-500'
    }`;

  return (
    <div className="h-full flex flex-col bg-white/90 backdrop-blur-xl">
      <div className="p-8 flex items-center gap-4">
        <div className="text-brand-500">
            <LotusIcon className="w-10 h-10" />
        </div>
        <div>
            <h1 className="text-brand-500 font-bold text-xl tracking-tight leading-none uppercase">White Lotus</h1>
            <p className="text-[10px] text-slate-400 font-bold tracking-widest mt-1">CREATIVE STUDIO</p>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2 py-4 overflow-y-auto">
        <NavLink to="/admin/dashboard" className={navClass} onClick={onCloseMobile}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/admin/workers" className={navClass} onClick={onCloseMobile}>
          <Users size={20} />
          <span>Workers</span>
        </NavLink>
        <NavLink to="/admin/attendance" className={navClass} onClick={onCloseMobile}>
          <ClipboardList size={20} />
          <span>Attendance</span>
        </NavLink>
        <NavLink to="/admin/settings" className={navClass} onClick={onCloseMobile}>
          <Settings size={20} />
          <span>Settings</span>
        </NavLink>
      </nav>

      <div className="p-6 border-t border-slate-100 mt-auto">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all group"
        >
          <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};