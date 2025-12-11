import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  ClipboardList, 
  Settings, 
  LogOut,
  Sparkles,
  CheckSquare
} from 'lucide-react';
import { getSettings } from '../services/dbService';

const LotusIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="currentColor" stroke="none">
    <path d="M50 20 C50 20 60 40 60 55 C60 70 50 80 50 80 C50 80 40 70 40 55 C40 40 50 20 50 20 Z" />
    <path d="M50 80 C50 80 35 70 30 50 C30 40 35 30 35 30 C35 30 40 50 50 80 Z" />
    <path d="M50 80 C50 80 65 70 70 50 C70 40 65 30 65 30 C65 30 60 50 50 80 Z" />
    <path d="M35 30 C35 30 20 35 15 50 C15 60 25 70 30 70 C30 70 25 50 35 30 Z" />
    <path d="M65 30 C65 30 80 35 85 50 C85 60 75 70 70 70 C70 70 75 50 65 30 Z" />
  </svg>
);

interface SidebarProps {
    onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const navigate = useNavigate();
  const [orgName, setOrgName] = useState('White Lotus');
  const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    const settings = getSettings();
    setOrgName(settings.organizationName);
    setLogoUrl(settings.logoUrl);
  }, []);

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
        <div className="text-brand-500 flex-shrink-0">
            {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-10 h-10 object-contain" />
            ) : (
                <LotusIcon className="w-10 h-10" />
            )}
        </div>
        <div>
            <h1 className="text-brand-500 font-bold text-lg tracking-tight leading-none uppercase truncate max-w-[140px]">{orgName}</h1>
            <p className="text-[10px] text-slate-400 font-bold tracking-widest mt-1">MANAGEMENT SYSTEM</p>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2 py-4 overflow-y-auto">
        <NavLink to="/admin/dashboard" className={navClass} onClick={onCloseMobile}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/admin/assistant" className={navClass} onClick={onCloseMobile}>
          <Sparkles size={20} />
          <span>AI Assistant</span>
        </NavLink>
        <NavLink to="/admin/tasks" className={navClass} onClick={onCloseMobile}>
          <CheckSquare size={20} />
          <span>Tasks</span>
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