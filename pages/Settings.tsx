import React, { useEffect, useState, useRef } from 'react';
import { Database, Save, ShieldCheck, Upload, PlayCircle, KeyRound, Image as ImageIcon, User } from 'lucide-react';
import { getSettings, updateSettings, seedDatabase } from '../services/dbService';
import { SystemSettings, DEFAULT_PASSWORD_HASH } from '../types';
import { sha256 } from '../services/cryptoService';

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings>({
    storageType: 'DATABASE',
    organizationName: '',
    adminUsername: 'admin'
  });
  const [newPassword, setNewPassword] = useState('');
  const [saved, setSaved] = useState(false);
  const [seeded, setSeeded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSettings(getSettings());
  }, []);

  const handleSave = async () => {
    let updatedSettings = { ...settings };
    
    if (newPassword) {
        const hash = await sha256(newPassword);
        updatedSettings.adminPasswordHash = hash;
    }

    updateSettings(updatedSettings);
    setSettings(updatedSettings);
    setNewPassword(''); // Clear field
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings(prev => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSeedData = async () => {
      if (confirm('Warning: This will clear all existing data and create demo records. Continue?')) {
          await seedDatabase();
          setSeeded(true);
          setTimeout(() => setSeeded(false), 3000);
      }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl w-full animate-in fade-in duration-500">
      <h2 className="text-3xl font-bold text-slate-800 mb-8">System Configuration</h2>

      <div className="space-y-6">
        
        {/* Branding Section */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm">
           <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <ImageIcon className="text-brand-500" />
                Branding & Identity
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Organization Name</label>
                    <input 
                        type="text" 
                        value={settings.organizationName}
                        onChange={(e) => setSettings({...settings, organizationName: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                        placeholder="e.g. White Lotus Corp"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Logo Upload</label>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden">
                            {settings.logoUrl ? (
                                <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                            ) : (
                                <ImageIcon className="text-slate-300" />
                            )}
                        </div>
                        <input 
                            type="file" 
                            ref={fileInputRef}
                            className="hidden" 
                            accept="image/*"
                            onChange={handleLogoUpload}
                        />
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                        >
                            <Upload size={16} />
                            Choose Image
                        </button>
                    </div>
                </div>
           </div>
        </div>

        {/* Security Section */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm">
           <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <ShieldCheck className="text-brand-500" />
                Admin Credentials
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Admin Username</label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input 
                            type="text" 
                            value={settings.adminUsername || 'admin'}
                            onChange={(e) => setSettings({...settings, adminUsername: e.target.value})}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                        />
                    </div>
               </div>
               <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Change Password</label>
                    <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input 
                            type="password" 
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all font-mono"
                        />
                    </div>
                    <p className="text-xs text-slate-400 mt-2">Leave blank to keep current password.</p>
               </div>
           </div>
        </div>

        {/* Demo Data Section */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm border-l-4 border-l-brand-400 opacity-60 hover:opacity-100 transition-opacity">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <PlayCircle className="text-brand-500" />
                        Test Data
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">Populate system with example data for testing purposes.</p>
                </div>
                <button 
                    onClick={handleSeedData}
                    className="px-6 py-3 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition-colors flex items-center gap-2 whitespace-nowrap"
                >
                    {seeded ? 'Data Populated!' : 'Load Test Data'}
                </button>
            </div>
        </div>

        <button 
            onClick={handleSave}
            className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-xl shadow-slate-900/10 transform hover:-translate-y-0.5"
        >
            <Save size={18} />
            {saved ? 'Settings Saved Successfully!' : 'Save All Settings'}
        </button>
      </div>
    </div>
  );
};