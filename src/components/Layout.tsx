import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Menu, X } from 'lucide-react';

interface LayoutProps {
  children?: React.ReactNode;
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
            <svg viewBox="0 0 100 100" className="w-8 h-8 text-brand-500" fill="currentColor" stroke="none">
               <path d="M50 20 C50 20 60 40 60 55 C60 70 50 80 50 80 C50 80 40 70 40 55 C40 40 50 20 50 20 Z" />
               <path d="M50 80 C50 80 35 70 30 50 C30 40 35 30 35 30 C35 30 40 50 50 80 Z" />
               <path d="M50 80 C50 80 65 70 70 50 C70 40 65 30 65 30 C65 30 60 50 50 80 Z" />
               <path d="M35 30 C35 30 20 35 15 50 C15 60 25 70 30 70 C30 70 25 50 35 30 Z" />
               <path d="M65 30 C65 30 80 35 85 50 C85 60 75 70 70 70 C70 70 75 50 65 30 Z" />
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