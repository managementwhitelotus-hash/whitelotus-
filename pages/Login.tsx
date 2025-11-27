import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ScanLine, Camera, LogIn, AlertCircle } from 'lucide-react';
import { sha256 } from '../services/cryptoService';
import { validateWorkerQR, getWorkers } from '../services/dbService';
import { MOCK_ADMIN_PASSWORD_HASH } from '../types';

const LotusIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 80" className={className} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M50 70 C50 70 30 60 20 40 C20 25 35 25 35 25 C35 25 40 40 50 50 C60 40 65 25 65 25 C65 25 80 25 80 40 C70 60 50 70 50 70 Z" />
    <path d="M50 50 C50 50 45 25 50 5 C55 25 50 50 50 50 Z" />
    <path d="M35 25 C35 25 25 15 25 5 C35 15 35 25 35 25 Z" />
    <path d="M65 25 C65 25 75 15 75 5 C65 15 65 25 65 25 Z" />
  </svg>
);

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'WORKER' | 'ADMIN'>('WORKER');
  const [adminPass, setAdminPass] = useState('');
  const [error, setError] = useState('');
  
  // Worker Logic
  const [qrInput, setQrInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Robust Camera Handling
  useEffect(() => {
    let stream: MediaStream | null = null;
    
    if (mode === 'WORKER') {
        setCameraError(false); // Reset error state on mount/mode switch
        
        const startCamera = async () => {
            try {
                // Try facing mode environment (rear camera), fallback if needed
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
    if (hash === MOCK_ADMIN_PASSWORD_HASH) {
        navigate('/admin/dashboard');
    } else {
        setError('Invalid credentials');
    }
  };

  const handleWorkerScanSimulate = async () => {
    setIsProcessing(true);
    setError('');
    
    // Simulate network delay
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

  const [workers] = useState(getWorkers());
  const fillDemoWorker = (token: string) => setQrInput(token);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-brand-50/30">
      
      {/* Background Decorative Blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-brand-200/20 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-brand-300/20 rounded-full blur-3xl -z-10"></div>

      <div className="bg-white/95 backdrop-blur-xl w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-white/60 relative z-10">
        <div className="p-8 pb-6 text-center">
            <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-100 shadow-inner">
                <LotusIcon className="w-10 h-10 text-brand-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight uppercase">White Lotus</h1>
            <p className="text-brand-500 text-xs font-bold tracking-[0.2em] mt-2">CREATIVE STUDIO</p>
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
                        
                        {workers.length > 0 && (
                            <div className="mt-6 p-4 bg-brand-50/40 border border-brand-100 rounded-2xl text-xs text-brand-800">
                                <strong className="block mb-2 text-brand-700 uppercase tracking-wide">Demo: Tap a worker to test</strong>
                                <div className="flex flex-wrap gap-2">
                                    {workers.map(w => (
                                        <button 
                                            key={w.id} 
                                            onClick={() => fillDemoWorker(w.qr_token)}
                                            className="px-3 py-1.5 bg-white border border-brand-200 rounded-lg hover:bg-brand-500 hover:text-white hover:border-brand-500 transition-all text-brand-700 shadow-sm"
                                        >
                                            {w.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <form onSubmit={handleAdminLogin} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Admin Password</label>
                        <input 
                            type="password" 
                            required
                            value={adminPass}
                            onChange={(e) => setAdminPass(e.target.value)}
                            className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                            placeholder="••••••••"
                        />
                        <p className="text-xs text-slate-400 mt-2">Default: <strong>password</strong></p>
                    </div>
                    <button 
                        type="submit"
                        className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-brand-600/30 transform hover:-translate-y-1 active:translate-y-0"
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
         White Lotus System • Secure & Encrypted
      </div>
    </div>
  );
};