import React, { useEffect, useState } from 'react';
import { Database, Save, ShieldCheck } from 'lucide-react';
import { getSettings, updateSettings } from '../services/dbService';
import { SystemSettings } from '../types';

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings>({
    storageType: 'DATABASE',
    organizationName: '',
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings(getSettings());
  }, []);

  const handleSave = () => {
    updateSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-8 max-w-4xl">
      <h2 className="text-3xl font-bold text-slate-800 mb-8">System Settings</h2>

      <div className="space-y-6">
        {/* Storage Configuration */}
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-start gap-5 mb-8">
            <div className="p-4 bg-brand-50 rounded-2xl">
                <Database className="w-8 h-8 text-brand-600" />
            </div>
            <div>
                <h3 className="text-xl font-bold text-slate-800">Data Storage Mode</h3>
                <p className="text-slate-500 text-sm mt-1">Choose how the system persists your workforce data.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
                onClick={() => setSettings({ ...settings, storageType: 'DATABASE' })}
                className={`p-6 rounded-2xl border-2 text-left transition-all relative ${
                    settings.storageType === 'DATABASE' 
                    ? 'border-brand-500 bg-brand-50/30' 
                    : 'border-slate-100 hover:border-slate-200'
                }`}
            >
                <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-slate-800 text-lg">Database Mode</span>
                    {settings.storageType === 'DATABASE' && <ShieldCheck className="w-6 h-6 text-brand-500" />}
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">Connect to MySQL / PostgreSQL / MongoDB. Best for performance and large teams.</p>
            </button>

            <button 
                onClick={() => setSettings({ ...settings, storageType: 'EXCEL' })}
                className={`p-6 rounded-2xl border-2 text-left transition-all relative ${
                    settings.storageType === 'EXCEL' 
                    ? 'border-brand-500 bg-brand-50/30' 
                    : 'border-slate-100 hover:border-slate-200'
                }`}
            >
                <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-slate-800 text-lg">Excel / Local File</span>
                    {settings.storageType === 'EXCEL' && <ShieldCheck className="w-6 h-6 text-brand-500" />}
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">Store data in a local file. Free, simple, no server setup required.</p>
            </button>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-50">
             <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-3">Connection String (Optional)</h4>
             <input 
                type="password" 
                disabled={settings.storageType === 'EXCEL'}
                placeholder="mongodb://username:password@host:port/database"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed font-mono text-sm"
             />
          </div>
        </div>

        {/* Organization Info */}
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
           <h3 className="text-xl font-bold text-slate-800 mb-6">Organization Details</h3>
           <div className="grid grid-cols-1 gap-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Company Name</label>
                    <input 
                        type="text" 
                        value={settings.organizationName}
                        onChange={(e) => setSettings({...settings, organizationName: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                    />
                </div>
           </div>
        </div>

        <button 
            onClick={handleSave}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-xl shadow-slate-900/10 transform hover:-translate-y-0.5"
        >
            <Save size={18} />
            {saved ? 'Settings Saved!' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};