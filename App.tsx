
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Fingerprint, ShieldCheck, ShieldAlert, Cpu, Activity, RefreshCcw } from 'lucide-react';

// --- Types ---
type ScanResult = 'GAY' | 'HÉTERO' | null;

// --- Components ---

const Header: React.FC = () => (
  <div className="flex flex-col items-center mb-8">
    <div className="flex items-center gap-2 mb-2">
      <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_#3b82f6]"></div>
      <span className="text-blue-500 font-orbitron text-xs tracking-[0.3em] uppercase">System Online</span>
    </div>
    <h1 className="text-3xl font-orbitron font-bold text-slate-100 tracking-tighter text-center">
      BIO-ID <span className="text-blue-500">QUANTUM</span>
    </h1>
    <p className="text-slate-500 text-[10px] uppercase tracking-widest mt-1">Biometric Orientation Analyzer v4.2.0</p>
  </div>
);

const InfoPanel: React.FC<{ isScanning: boolean }> = ({ isScanning }) => (
  <div className="w-full max-w-xs grid grid-cols-2 gap-4 mb-10 opacity-60">
    <div className="border border-slate-800 p-2 rounded flex flex-col items-center bg-slate-900/50">
      <Cpu size={14} className="text-blue-400 mb-1" />
      <span className="text-[9px] uppercase font-bold text-slate-400">Core Engine</span>
      <span className="text-xs font-orbitron">{isScanning ? 'Syncing...' : 'Ready'}</span>
    </div>
    <div className="border border-slate-800 p-2 rounded flex flex-col items-center bg-slate-900/50">
      <Activity size={14} className="text-emerald-400 mb-1" />
      <span className="text-[9px] uppercase font-bold text-slate-400">Network</span>
      <span className="text-xs font-orbitron">Secure</span>
    </div>
  </div>
);

const App: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ScanResult>(null);
  const [secretActive, setSecretActive] = useState(false);
  const [scanMessage, setScanMessage] = useState("PRESS AND HOLD TO SCAN");
  
  const timerRef = useRef<number | null>(null);

  const triggerSecret = useCallback(() => {
    setSecretActive(true);
    // Visual feedback for the owner (optional, very subtle)
    console.log("Secret Mode Active");
  }, []);

  const resetScanner = () => {
    setResult(null);
    setIsScanning(false);
    setProgress(0);
    setSecretActive(false);
    setScanMessage("PRESS AND HOLD TO SCAN");
  };

  const startScanning = () => {
    if (result) return;
    setIsScanning(true);
    setScanMessage("READING BIOMETRICS...");
    
    let currentProgress = 0;
    timerRef.current = window.setInterval(() => {
      currentProgress += Math.random() * 5;
      if (currentProgress >= 100) {
        currentProgress = 100;
        if (timerRef.current) clearInterval(timerRef.current);
        finishScan();
      }
      setProgress(currentProgress);
    }, 100);
  };

  const finishScan = () => {
    setScanMessage("ANALYZING DATA...");
    setTimeout(() => {
      setResult(secretActive ? 'HÉTERO' : 'GAY');
      setIsScanning(false);
    }, 1200);
  };

  const stopScanning = () => {
    if (result || !isScanning) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setIsScanning(false);
    setProgress(0);
    setScanMessage("SCAN INTERRUPTED");
    setTimeout(() => {
      if (!isScanning) setScanMessage("PRESS AND HOLD TO SCAN");
    }, 2000);
  };

  return (
    <div className="relative h-screen w-full flex flex-col items-center justify-center bg-slate-950 p-6 overflow-hidden">
      {/* Invisible Secret Button */}
      <button 
        onClick={triggerSecret}
        className="absolute top-0 left-0 w-24 h-24 z-50 cursor-default outline-none bg-transparent"
        aria-label="Secret Trigger"
      />

      {/* Decorative Background Grid */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle, #3b82f6 1px, transparent 1px)', backgroundSize: '30px 30px' }} 
      />

      {/* Main UI */}
      <div className="z-10 w-full max-w-md flex flex-col items-center transition-all duration-500">
        <Header />
        
        <InfoPanel isScanning={isScanning} />

        {/* The Scanner */}
        <div className="relative mb-12 flex flex-col items-center">
          <div 
            onMouseDown={startScanning}
            onMouseUp={stopScanning}
            onTouchStart={startScanning}
            onTouchEnd={stopScanning}
            className={`
              relative w-48 h-64 border-2 rounded-3xl flex items-center justify-center
              transition-all duration-300 cursor-pointer
              ${isScanning ? 'border-blue-500 bg-blue-900/10 scale-105' : 'border-slate-800 bg-slate-900/40'}
              ${result ? 'opacity-20' : 'opacity-100'}
            `}
          >
            {/* Scan Line Animation */}
            {isScanning && <div className="scan-line" />}
            
            <div className={`transition-all duration-500 ${isScanning ? 'text-blue-400' : 'text-slate-700'}`}>
              <Fingerprint size={100} strokeWidth={1.5} />
            </div>

            {/* Glowing Aura when scanning */}
            {isScanning && (
              <div className="absolute inset-0 rounded-3xl animate-pulse ring-4 ring-blue-500/30" />
            )}
          </div>

          {/* Message & Progress */}
          <div className="mt-8 text-center min-h-[60px]">
            <p className={`font-orbitron text-xs tracking-widest mb-3 ${isScanning ? 'text-blue-400' : 'text-slate-500'}`}>
              {scanMessage}
            </p>
            {isScanning && (
              <div className="w-48 h-1 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 shadow-[0_0_10px_#3b82f6] transition-all duration-150" 
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Result Overlay */}
      {result && (
        <div className={`
          fixed inset-0 z-[100] flex flex-col items-center justify-center p-8
          animate-in fade-in zoom-in duration-300
          ${result === 'GAY' ? 'bg-red-950/95' : 'bg-emerald-950/95'}
        `}>
          <div className={`
            text-center p-8 rounded-2xl border-2 flex flex-col items-center
            ${result === 'GAY' ? 'border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.3)]' : 'border-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.3)]'}
          `}>
            <div className="mb-6">
              {result === 'GAY' ? (
                <ShieldAlert size={80} className="text-red-500 animate-bounce" />
              ) : (
                <ShieldCheck size={80} className="text-emerald-500 animate-pulse" />
              )}
            </div>
            
            <h2 className={`text-xl font-orbitron uppercase tracking-widest mb-2 ${result === 'GAY' ? 'text-red-400' : 'text-emerald-400'}`}>
              Scan Result:
            </h2>
            
            <h1 className={`text-7xl font-orbitron font-black mb-10 ${result === 'GAY' ? 'text-red-500' : 'text-emerald-500'}`}>
              {result}!!!
            </h1>

            <button 
              onClick={resetScanner}
              className={`
                flex items-center gap-2 px-8 py-3 rounded-full font-bold uppercase tracking-widest transition-all
                ${result === 'GAY' ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'}
                text-white shadow-lg
              `}
            >
              <RefreshCcw size={18} />
              Reset System
            </button>
          </div>
          
          <p className="mt-8 text-white/40 text-[10px] uppercase font-orbitron tracking-widest">
            Identity verification complete. Biometric data stored.
          </p>
        </div>
      )}

      {/* Footer Branding */}
      <div className="absolute bottom-6 text-slate-700 text-[10px] font-orbitron tracking-widest uppercase">
        © 2024 PRANK-TECH INDUSTRIAL S.A.
      </div>
    </div>
  );
};

export default App;
