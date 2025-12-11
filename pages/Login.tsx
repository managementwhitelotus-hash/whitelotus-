import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ScanLine, Camera, LogIn, AlertCircle, User } from 'lucide-react';
import { sha256 } from '../services/cryptoService';
import { validateWorkerQR, getSettings } from '../services/dbService';
import { DEFAULT_PASSWORD_HASH } from '../types';

const LotusIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="currentColor" stroke="none">
    <path d="M50 20 C50 20 60 40 60 55 C60 70 50 80 50 80 C50 80 40 70 40 55 C40 40 50 20 50 20 Z" />
    <path d="M50 80 C50 80 35 70 30 50 C30 40 35 30 35 30 C35 30 40 50 50 80 Z" />
    <path d="M50 80 C50 80 65 70 70 50 C70 40 65 30 65 30 C65 30 60 50 50 80 Z" />
    <path d="M35 30 C35 30 20 35 15 50 C15 60 25 70 30 70 C30 70 25 50 35 30 Z" />
    <path d="M65 30 C65 30 80 35 85 50 C85 60 75 70 70 70 C70 70 75 50 65 30 Z" />
  </svg>
);

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'WORKER' | 'ADMIN'>('WORKER');
  
  // Admin Form
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [error, setError] = useState('');
  
  // Settings for branding & auth
  const [orgName, setOrgName] = useState('White Lotus');
  const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined);
  const [storedAdminHash, setStoredAdminHash] = useState(DEFAULT_PASSWORD_HASH);
  const [storedAdminUser, setStoredAdminUser] = useState('admin');

  // Worker Logic
  const [qrInput, setQrInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const settings = getSettings();
    setOrgName(settings.organizationName);
    setLogoUrl(settings.logoUrl);
    setStoredAdminHash(settings.adminPasswordHash || DEFAULT_PASSWORD_HASH);
    setStoredAdminUser(settings.adminUsername || 'admin');
  }, []);

  // Robust Camera Handling
  useEffect(() => {
    let stream: MediaStream | null = null;
    
    if (mode === 'WORKER') {
        setCameraError(false);
        const startCamera = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { facingMode: "environment" } 
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.warn("Camera access denied or unavailable:", err);
                setCameraError(true);
            }
        };
        startCamera();
    }
    
    return () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    };
  }, [mode]);


  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const hash = await sha256(adminPass);
    
    if (adminUser.toLowerCase() === storedAdminUser.toLowerCase() && hash === storedAdminHash) {
        navigate('/admin/dashboard');
    } else {
        setError('Invalid username or password');
    }
  };

  const handleWorkerScanSimulate = async () => {
    setIsProcessing(true);
    setError('');
    
    setTimeout(async () => {
        const worker = await validateWorkerQR(qrInput);
        if (worker) {
            navigate(`/worker/${worker.id}`);
        } else {
            setError('Invalid QR Code. Access Denied.');
        }
        setIsProcessing(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-brand-50/30">
      
      {/* Background Decorative Blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-brand-200/20 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-brand-300/20 rounded-full blur-3xl -z-10"></div>

      <div className="bg-white/95 backdrop-blur-xl w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-white/60 relative z-10">
        <div className="p-8 pb-6 text-center">
            {/* LOGO CONTAINER */}
            <div className="w-24 h-24 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-100 shadow-inner overflow-hidden relative">
                {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                    <LotusIcon className="w-14 h-14 text-brand-500" />
                )}
            </div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight uppercase truncate px-2">{orgName}</h1>
            <p className="text-brand-500 text-xs font-bold tracking-[0.2em] mt-2">WORKFORCE SYSTEM</p>
        </div>

        <div className="px-8">
            <div className="flex p-1.5 bg-slate-100 rounded-2xl mb-8">
                <button 
                    onClick={() => { setMode('WORKER'); setError(''); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl transition-all ${mode === 'WORKER' ? 'bg-white text-brand-600 shadow-md transform scale-105' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <ScanLine size={18} />
                    Worker Scan
                </button>
                <button 
                    onClick={() => { setMode('ADMIN'); setError(''); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl transition-all ${mode === 'ADMIN' ? 'bg-white text-brand-600 shadow-md transform scale-105' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <Lock size={18} />
                    Admin Panel
                </button>
            </div>
        </div>

        <div className="px-8 pb-8">
            {mode === 'WORKER' ? (
                <div className="space-y-6">
                    {/* Camera Viewport or Fallback */}
                    <div className="relative aspect-square bg-slate-50 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center group border border-slate-200">
                        {!cameraError ? (
                            <>
                                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover opacity-90" />
                                <div className="absolute inset-0 border-2 border-brand-500/50 m-8 rounded-xl animate-pulse pointer-events-none" />
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-xs bg-brand-900/60 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                    Camera Active
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-slate-400 p-6 text-center">
                                <AlertCircle size={48} className="text-slate-300 mb-2" />
                                <p className="font-semibold text-slate-500">Camera Unavailable</p>
                                <p className="text-xs mt-1">Please enter your code manually below.</p>
                            </div>
                        )}
                        
                        {!cameraError && (
                             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <Camera className="text-brand-600/20 w-24 h-24" />
                            </div>
                        )}
                    </div>
                    
                    <div>
                        <div className="flex gap-2">
                            <input 
                                type="text"
                                value={qrInput}
                                onChange={(e) => setQrInput(e.target.value)} 
                                placeholder={cameraError ? "Enter Manual Code" : "Scan or paste QR token..."}
                                className="flex-1 px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                            />
                            <button 
                                onClick={handleWorkerScanSimulate}
                                disabled={isProcessing || !qrInput}
                                className="bg-brand-600 hover:bg-brand-700 text-white px-5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-brand-600/20 flex items-center justify-center"
                            >
                                <LogIn size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleAdminLogin} className="space-y-4">
                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Username</label>
                        <div className="relative">
                            <User className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
                            <input 
                                type="text" 
                                required
                                value={adminUser}
                                onChange={(e) => setAdminUser(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                                placeholder="e.g. admin"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
                            <input 
                                type="password" 
                                required
                                value={adminPass}
                                onChange={(e) => setAdminPass(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>
                    <button 
                        type="submit"
                        className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-brand-600/30 transform hover:-translate-y-1 active:translate-y-0 mt-4"
                    >
                        Access Dashboard
                    </button>
                </form>
            )}

            {error && (
                <div className="mt-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 text-sm rounded-xl text-center font-bold animate-in fade-in slide-in-from-bottom-2 flex items-center justify-center gap-2">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}
        </div>
      </div>
      
      <div className="fixed bottom-4 text-center w-full text-xs text-brand-800/40 font-medium">
         {orgName} System • Secure & Encrypted
      </div>
    </div>
  );
};