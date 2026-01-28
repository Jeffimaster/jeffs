
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Fingerprint, ShieldCheck, ShieldAlert, Cpu, Activity, RefreshCcw } from 'lucide-react';

// --- Types ---
type ScanResult = 'GAY' | 'HÉTERO' | null;

// --- Components ---

const Header: React.FC = () => (
  <div className="flex flex-col items-center pt-4 mb-4">
    <div className="flex items-center gap-2 mb-1">
      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_#3b82f6]"></div>
      <span className="text-blue-500 font-orbitron text-[8px] tracking-[0.3em] uppercase">System Online</span>
    </div>
    <h1 className="text-2xl font-orbitron font-bold text-slate-100 tracking-tighter text-center">
      BIO-ID <span className="text-blue-500">QUANTUM</span>
    </h1>
    <p className="text-slate-500 text-[9px] uppercase tracking-widest mt-0.5">Biometric Analyzer v4.2.0</p>
  </div>
);

const InfoPanel: React.FC<{ isScanning: boolean }> = ({ isScanning }) => (
  <div className="w-full max-w-[280px] grid grid-cols-2 gap-3 mb-6 opacity-60">
    <div className="border border-slate-800 p-2 rounded-lg flex flex-col items-center bg-slate-900/50">
      <Cpu size={12} className="text-blue-400 mb-1" />
      <span className="text-[8px] uppercase font-bold text-slate-400">Core Engine</span>
      <span className="text-[10px] font-orbitron">{isScanning ? 'Syncing...' : 'Ready'}</span>
    </div>
    <div className="border border-slate-800 p-2 rounded-lg flex flex-col items-center bg-slate-900/50">
      <Activity size={12} className="text-emerald-400 mb-1" />
      <span className="text-[8px] uppercase font-bold text-slate-400">Network</span>
      <span className="text-[10px] font-orbitron">Secure</span>
    </div>
  </div>
);

const App: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ScanResult>(null);
  const [secretActive, setSecretActive] = useState(false);
  const [scanMessage, setScanMessage] = useState("PRESSIONE E SEGURE");
  
  const timerRef = useRef<number | null>(null);

  const triggerSecret = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setSecretActive(true);
    // Pequeno feedback tátil se disponível
    if ('vibrate' in navigator) {
      navigator.vibrate(20);
    }
  }, []);

  const resetScanner = () => {
    setResult(null);
    setIsScanning(false);
    setProgress(0);
    setSecretActive(false);
    setScanMessage("PRESSIONE E SEGURE");
  };

  const startScanning = (e: React.MouseEvent | React.TouchEvent) => {
    if (result) return;
    if ('vibrate' in navigator) navigator.vibrate(50);
    setIsScanning(true);
    setScanMessage("LENDO BIOMETRIA...");
    
    let currentProgress = 0;
    timerRef.current = window.setInterval(() => {
      currentProgress += Math.random() * 4;
      if (currentProgress >= 100) {
        currentProgress = 100;
        if (timerRef.current) clearInterval(timerRef.current);
        finishScan();
      }
      setProgress(currentProgress);
    }, 80);
  };

  const finishScan = () => {
    setScanMessage("ANALISANDO DADOS...");
    if ('vibrate' in navigator) navigator.vibrate([100, 50, 100]);
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
    setScanMessage("ESCANEAMENTO INTERROMPIDO");
    setTimeout(() => {
      if (!isScanning) setScanMessage("PRESSIONE E SEGURE");
    }, 1500);
  };

  return (
    <div className="relative h-[100dvh] w-full flex flex-col items-center bg-slate-950 p-4 overflow-hidden select-none touch-none">
      {/* Botão Secreto Invisível no Canto Superior Esquerdo */}
      <div 
        onClick={triggerSecret}
        onTouchStart={triggerSecret}
        className="absolute top-0 left-0 w-20 h-20 z-[60] cursor-default bg-transparent active:bg-white/5 transition-colors rounded-br-full"
      />

      {/* Grade de Fundo Decorativa */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle, #3b82f6 1px, transparent 1px)', backgroundSize: '24px 24px' }} 
      />

      {/* Conteúdo Principal Ajustado para Vertical */}
      <div className="z-10 w-full flex-1 flex flex-col items-center justify-between py-6">
        <div className="w-full flex flex-col items-center">
          <Header />
          <InfoPanel isScanning={isScanning} />
        </div>

        {/* Área do Scanner Centralizada */}
        <div className="relative flex flex-col items-center justify-center flex-1 w-full max-h-[400px]">
          <div 
            onMouseDown={startScanning}
            onMouseUp={stopScanning}
            onTouchStart={startScanning}
            onTouchEnd={stopScanning}
            className={`
              relative w-44 h-56 border-2 rounded-[2.5rem] flex items-center justify-center
              transition-all duration-300 cursor-pointer overflow-hidden
              ${isScanning ? 'border-blue-500 bg-blue-900/10 scale-105 shadow-[0_0_30px_rgba(59,130,246,0.2)]' : 'border-slate-800 bg-slate-900/40 shadow-inner'}
              ${result ? 'opacity-0 scale-90' : 'opacity-100'}
            `}
          >
            {/* Scan Line Animation */}
            {isScanning && <div className="scan-line" />}
            
            <div className={`transition-all duration-500 ${isScanning ? 'text-blue-400 scale-110' : 'text-slate-700'}`}>
              <Fingerprint size={80} strokeWidth={1} />
            </div>

            {/* Glowing Aura */}
            {isScanning && (
              <div className="absolute inset-0 rounded-[2.5rem] animate-pulse ring-4 ring-blue-500/30" />
            )}
          </div>

          {/* Mensagem e Progresso abaixo do scanner */}
          <div className="mt-8 text-center h-16 w-full px-4">
            <p className={`font-orbitron text-[10px] tracking-[0.2em] uppercase mb-4 transition-colors ${isScanning ? 'text-blue-400' : 'text-slate-500'}`}>
              {scanMessage}
            </p>
            <div className={`w-full max-w-[200px] mx-auto h-1 bg-slate-900 rounded-full overflow-hidden transition-opacity duration-300 ${isScanning ? 'opacity-100' : 'opacity-0'}`}>
              <div 
                className="h-full bg-blue-500 shadow-[0_0_10px_#3b82f6] transition-all duration-150 ease-out" 
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Footer Branding */}
        <div className="text-slate-800 text-[8px] font-orbitron tracking-[0.4em] uppercase pb-2">
          Quantum Bio v4.2
        </div>
      </div>

      {/* Overlay de Resultado - Ocupa a tela cheia */}
      {result && (
        <div className={`
          fixed inset-0 z-[100] flex flex-col items-center justify-center p-6
          animate-in fade-in zoom-in duration-500
          ${result === 'GAY' ? 'bg-red-950/98' : 'bg-emerald-950/98'}
        `}>
          <div className={`
            w-full max-w-sm text-center p-10 rounded-3xl border-2 flex flex-col items-center
            ${result === 'GAY' ? 'border-red-500/50 shadow-[0_0_60px_rgba(239,68,68,0.2)]' : 'border-emerald-500/50 shadow-[0_0_60px_rgba(16,185,129,0.2)]'}
          `}>
            <div className="mb-6">
              {result === 'GAY' ? (
                <ShieldAlert size={90} className="text-red-500 animate-bounce" />
              ) : (
                <ShieldCheck size={90} className="text-emerald-500 animate-pulse" />
              )}
            </div>
            
            <h2 className={`text-sm font-orbitron uppercase tracking-[0.3em] mb-3 ${result === 'GAY' ? 'text-red-400' : 'text-emerald-400'}`}>
              Identidade Confirmada:
            </h2>
            
            <h1 className={`text-6xl font-orbitron font-black mb-12 drop-shadow-lg ${result === 'GAY' ? 'text-red-500' : 'text-emerald-500'}`}>
              {result}!!!
            </h1>

            <button 
              onClick={resetScanner}
              className={`
                flex items-center gap-3 px-10 py-4 rounded-2xl font-bold uppercase tracking-[0.2em] text-sm transition-all active:scale-95
                ${result === 'GAY' ? 'bg-red-500 shadow-[0_4px_20px_rgba(239,68,68,0.4)]' : 'bg-emerald-500 shadow-[0_4px_20px_rgba(16,185,129,0.4)]'}
                text-white
              `}
            >
              <RefreshCcw size={18} />
              Reiniciar
            </button>
          </div>
          
          <p className="absolute bottom-10 text-white/20 text-[8px] uppercase font-orbitron tracking-widest text-center px-10">
            Aviso: Resultados baseados em algoritmos quânticos bio-simulados.
          </p>
        </div>
      )}
    </div>
  );
};

export default App;
