import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Menu, X } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close menu when route changes or user clicks overlay
  const handleOverlayClick = () => setIsMobileMenuOpen(false);

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md z-30 px-6 py-4 flex items-center justify-between border-b border-slate-100 shadow-sm">
         <div className="flex items-center gap-2">
            <svg viewBox="0 0 100 80" className="w-8 h-8 text-brand-500" fill="none" stroke="currentColor" strokeWidth="4">
               <path d="M50 70 C50 70 30 60 20 40 C20 25 35 25 35 25 C35 25 40 40 50 50 C60 40 65 25 65 25 C65 25 80 25 80 40 C70 60 50 70 50 70 Z" />
               <path d="M50 50 C50 50 45 25 50 5 C55 25 50 50 50 50 Z" />
            </svg>
            <span className="font-bold text-slate-800 uppercase tracking-wide text-sm">White Lotus</span>
         </div>
         <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-500 hover:text-brand-600 transition-colors"
         >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
         </button>
      </div>

      {/* Sidebar - Desktop: Fixed, Mobile: Fixed overlay */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:shadow-none lg:border-r lg:border-slate-200
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar onCloseMobile={() => setIsMobileMenuOpen(false)} />
      </div>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={handleOverlayClick}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 p-4 md:p-8 pt-20 lg:pt-8 w-full min-w-0 overflow-hidden">
        <div className="max-w-7xl mx-auto w-full">
            {children}
        </div>
      </div>
    </div>
  );
};