import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Radio, 
  Activity, 
  Cpu, 
  RotateCw,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export function LoginPage({ onLoginSuccess }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('officer@grievance.gov');
  const [password, setPassword] = useState('officer123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activePersona, setActivePersona] = useState('officer');

  const viewportRef = useRef(null);
  const stackGroupRef = useRef(null);
  const canvasRef = useRef(null);

  // Quick Demo Personas
  const personas = [
    {
      id: 'officer',
      label: 'Chief Grievance Officer',
      sublabel: 'Central Command',
      email: 'officer@grievance.gov',
      pass: 'officer123',
      badge: 'Officer'
    },
    {
      id: 'supervisor',
      label: 'Dept Supervisor',
      sublabel: 'Water & Sanitation',
      email: 'supervisor@grievance.gov',
      pass: 'super123',
      badge: 'Zonal'
    },
    {
      id: 'citizen',
      label: 'Citizen Complainant',
      sublabel: 'Public Portal',
      email: 'citizen@hyderabad.gov',
      pass: 'citizen123',
      badge: 'Citizen'
    }
  ];

  const handleSelectPersona = (p) => {
    setActivePersona(p.id);
    setEmail(p.email);
    setPassword(p.pass);
    setError('');
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify clearance credentials.');
    } finally {
      setLoading(false);
    }
  };

  // 3D Parallax Tilt Effect on Mouse Move
  const handleMouseMove = (e) => {
    if (!viewportRef.current || !stackGroupRef.current) return;
    const rect = viewportRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    const rotateY = x * 14;
    const rotateX = -y * 14;

    stackGroupRef.current.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(15px)`;
  };

  const handleMouseLeave = () => {
    if (!stackGroupRef.current) return;
    stackGroupRef.current.style.transform = `rotateX(6deg) rotateY(-5deg) translateZ(0)`;
  };

  // Canvas Topographical Wireframe Ambient Mesh
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const cols = 28;
    const rows = 20;
    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = 'rgba(217, 119, 6, 0.14)';
      ctx.lineWidth = 0.9;

      const cellW = width / (cols - 1);
      const cellH = (height * 0.75) / (rows - 1);
      const startY = height * 0.25;

      const points = [];

      for (let r = 0; r < rows; r++) {
        points[r] = [];
        for (let c = 0; c < cols; c++) {
          const x = c * cellW;
          const baseY = startY + r * cellH;
          const wave = Math.sin(c * 0.25 + time + r * 0.15) * 12 + Math.cos(r * 0.2 - time * 0.8) * 8;
          const y = baseY + wave;
          points[r][c] = { x, y };
        }
      }

      // Draw grid lines
      for (let r = 0; r < rows; r++) {
        ctx.beginPath();
        for (let c = 0; c < cols; c++) {
          const pt = points[r][c];
          if (c === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.stroke();
      }

      for (let c = 0; c < cols; c++) {
        ctx.beginPath();
        for (let r = 0; r < rows; r++) {
          const pt = points[r][c];
          if (r === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.stroke();
      }

      time += 0.015;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <section className="bg-[#050505] text-neutral-300 min-h-screen overflow-x-hidden selection:bg-orange-900/40 selection:text-orange-200 antialiased font-sans relative flex items-center justify-center p-4 sm:p-6 md:p-10 lg:p-14">
      
      {/* Background Animated Topographical Wireframe Canvas */}
      <canvas 
        ref={canvasRef} 
        className="fixed inset-0 z-0 pointer-events-none opacity-45"
      />

      {/* Subtle 45-degree diagonal pattern overlay */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: 'repeating-linear-gradient(45deg, #ffffff 0, #ffffff 1px, transparent 1px, transparent 6px)'
        }}
      />

      {/* Main Framed Glass Container */}
      <main className="w-full max-w-[1360px] min-h-[80vh] relative z-10 bg-[#050505]/80 backdrop-blur-xl border border-neutral-800 flex flex-col lg:flex-row shadow-2xl shadow-black/95 overflow-hidden">
        
        {/* Structural Corner Brackets */}
        <div className="absolute -top-px -left-px w-5 h-5 border-t-2 border-l-2 border-orange-500 z-20" />
        <div className="absolute -top-px -right-px w-5 h-5 border-t-2 border-r-2 border-orange-500 z-20" />
        <div className="absolute -bottom-px -left-px w-5 h-5 border-b-2 border-l-2 border-orange-500 z-20" />
        <div className="absolute -bottom-px -right-px w-5 h-5 border-b-2 border-r-2 border-orange-500 z-20" />

        {/* ---------------- LEFT EDITORIAL COLUMN (5 cols) ---------------- */}
        <section className="w-full lg:w-5/12 p-8 sm:p-10 lg:p-14 flex flex-col justify-between relative border-b lg:border-b-0 lg:border-r border-neutral-800/80 z-10 bg-gradient-to-b from-[#080808]/90 to-[#040404]/95">
          
          {/* Inner vertical guidelines */}
          <div className="absolute top-0 bottom-0 left-8 lg:left-14 w-px bg-neutral-800/30 pointer-events-none hidden sm:block" />
          <div className="absolute top-0 bottom-0 right-8 lg:right-14 w-px bg-neutral-800/30 pointer-events-none hidden sm:block" />
          <div className="absolute top-8 lg:top-14 left-0 right-0 h-px bg-neutral-800/30 pointer-events-none hidden sm:block" />

          <div className="relative z-10 space-y-6">
            
            {/* Network Identity */}
            <div className="flex items-center gap-2.5 text-orange-400 mb-6">
              <Radio className="h-4 w-4 animate-pulse text-orange-500" />
              <span className="text-xs uppercase tracking-[0.25em] font-medium text-orange-400">
                CivicAI Protocol Network • Telangana
              </span>
            </div>

            {/* Narrative Typography */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight text-white leading-[1.08] uppercase space-y-1">
              <div className="overflow-hidden inline-block"><span className="block text-white font-medium">Municipal</span></div><br />
              <div className="overflow-hidden inline-block"><span className="block text-neutral-200">Grievance</span></div><br />
              <div className="overflow-hidden inline-block text-neutral-400"><span className="block font-light">Gateway</span></div>
            </h1>

            <p className="text-sm sm:text-base font-normal text-neutral-300 leading-relaxed max-w-md">
              Initialize authenticated clearance with the CivicAI Municipal Grievance Grid. Real-time NLP prioritization, automated voice triage (1800-425-GHMC), and cross-zonal resolution telemetry across Hyderabad.
            </p>

            {/* Quick Demo Access Badges */}
            <div className="pt-2 space-y-2.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block">
                Quick Clearance Personas:
              </span>
              <div className="flex flex-wrap gap-2.5">
                {personas.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPersona(p)}
                    className={`px-3.5 py-2 rounded-md text-xs sm:text-sm font-medium transition-all cursor-pointer border ${
                      activePersona === p.id 
                        ? 'bg-orange-950/50 border-orange-500 text-orange-200 shadow-[0_0_14px_rgba(249,115,22,0.25)]' 
                        : 'bg-neutral-900/60 border-neutral-700/80 text-neutral-300 hover:text-white hover:border-neutral-500'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Telemetry Status Panel */}
          <div className="mt-10 lg:mt-8 relative z-10 pt-6 border-t border-neutral-800/80">
            <p className="text-xs font-medium text-neutral-400 uppercase tracking-widest pb-3 mb-3 flex items-center justify-between">
              <span>Grid Telemetry Status</span>
              <span className="text-emerald-400 text-xs font-mono font-bold">ALL SYSTEMS ONLINE</span>
            </p>
            
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.7)] animate-pulse" />
                  <span className="text-xs sm:text-sm font-normal text-neutral-200 group-hover:text-white transition-colors">
                    Sector Node 01 (Water &amp; Sanitation)
                  </span>
                </div>
                <span className="text-xs font-medium uppercase tracking-wider text-emerald-400">Active</span>
              </div>

              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.7)] animate-pulse" />
                  <span className="text-xs sm:text-sm font-normal text-neutral-200 group-hover:text-white transition-colors">
                    Sector Node 02 (AI Triage &amp; 1800-Voice IVR)
                  </span>
                </div>
                <span className="text-xs font-medium uppercase tracking-wider text-emerald-400">Active</span>
              </div>

              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.7)] animate-pulse" />
                  <span className="text-xs sm:text-sm font-normal text-neutral-200 group-hover:text-white transition-colors">
                    Sector Node 03 (Roads &amp; Electrical Grid)
                  </span>
                </div>
                <span className="text-xs font-medium uppercase tracking-wider text-amber-400">Active</span>
              </div>
            </div>
          </div>

        </section>

        {/* ---------------- RIGHT 3D DEPTH STACK COLUMN (7 cols) ---------------- */}
        <section 
          className="w-full lg:w-7/12 p-8 sm:p-12 lg:p-16 flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-[#060606] via-[#080808] to-[#040404]"
        >
          {/* Central Crosshair Calibration */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 pointer-events-none opacity-25">
            <div className="absolute top-0 bottom-0 left-1/2 w-px bg-neutral-400" />
            <div className="absolute left-0 right-0 top-1/2 h-px bg-neutral-400" />
          </div>

          {/* 3D Transform Viewport */}
          <div 
            ref={viewportRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative w-full max-w-[460px] flex flex-col justify-center py-6"
            style={{ perspective: '1200px' }}
          >
            <div 
              ref={stackGroupRef}
              className="relative w-full transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] group"
              style={{ 
                transformStyle: 'preserve-3d',
                transform: 'rotateX(6deg) rotateY(-5deg) translateZ(0)'
              }}
            >
              {/* Base Shadow Plane */}
              <div className="absolute inset-0 bg-black/90 blur-2xl transform translate-y-12 translate-z-[-50px] scale-90 opacity-70 transition-all duration-700" />

              {/* Layer 1 (Bottom Ambient Panel) */}
              <div className="absolute inset-0 bg-neutral-900/20 border border-neutral-800/50 rounded-xl transform translate-y-6 translate-z-[-30px] scale-[0.96] opacity-40 transition-all duration-700 ease-out group-hover:translate-y-8 group-hover:opacity-70 group-hover:translate-z-[-40px]" />

              {/* Layer 2 (Middle Structure Glass Panel) */}
              <div className="absolute inset-0 bg-[#0a0a0a]/60 backdrop-blur-md border border-neutral-700/40 rounded-xl transform translate-y-3 translate-z-[-15px] scale-[0.98] opacity-75 transition-all duration-700 ease-out group-hover:translate-y-4 group-hover:opacity-95 group-hover:translate-z-[-20px]" />

              {/* Focal Accent Card (Top Layer) */}
              <div className="relative bg-neutral-950/95 backdrop-blur-xl border border-neutral-800 rounded-xl p-8 sm:p-9 transition-all duration-700 ease-out group-hover:border-orange-900/60 group-hover:bg-[#0a0a0a] z-10 overflow-hidden shadow-2xl">
                
                {/* Internal Warm Glow on Hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-600/10 via-transparent to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                {/* Top Edge Highlight */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/40 to-transparent" />

                <div className="relative z-20 space-y-6">
                  
                  {/* Card Header */}
                  <div className="space-y-1.5 border-b border-neutral-800 pb-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-normal tracking-tight text-white flex items-center gap-2.5">
                        <Cpu className="h-5 w-5 text-orange-500" />
                        Authentication Routine
                      </h2>
                      <span className="text-xs font-mono text-orange-300 bg-orange-950/40 px-2.5 py-1 rounded border border-orange-800/50">
                        TLS 1.3 SECURE
                      </span>
                    </div>
                    <p className="text-sm font-normal text-neutral-300">
                      Provide clearance markers to connect to the municipal command grid.
                    </p>
                  </div>

                  {/* Error Notification */}
                  {error && (
                    <div className="p-3 rounded bg-red-950/50 border border-red-800 text-red-200 text-xs sm:text-sm font-medium">
                      {error}
                    </div>
                  )}

                  {/* Login Form */}
                  <form onSubmit={handleFormSubmit} className="space-y-5">
                    
                    {/* ID Field */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-neutral-300 uppercase tracking-wider block">
                        Identification String / Email
                      </label>
                      <div className="p-[1px] rounded-md bg-gradient-to-b from-neutral-700/60 to-neutral-800/60 focus-within:from-orange-600/70 focus-within:to-neutral-800/60 transition-colors duration-500">
                        <div className="relative">
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="officer@grievance.gov"
                            className="w-full bg-[#050505] rounded-[5px] pl-10 pr-4 py-3 text-sm text-white font-normal focus:outline-none placeholder-neutral-600"
                            required
                          />
                          <Mail className="h-4 w-4 absolute left-3.5 top-3.5 text-neutral-400" />
                        </div>
                      </div>
                    </div>

                    {/* Secret Password Field */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-medium text-neutral-300 uppercase tracking-wider">
                          Cipher Key / Password
                        </label>
                        <button 
                          type="button" 
                          onClick={() => {
                            setEmail('officer@grievance.gov');
                            setPassword('officer123');
                          }}
                          className="text-xs font-medium text-neutral-400 hover:text-orange-400 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCw className="h-3 w-3" /> Auto-Fill
                        </button>
                      </div>

                      <div className="relative p-[1px] rounded-md bg-gradient-to-b from-neutral-700/60 to-neutral-800/60 focus-within:from-orange-600/70 focus-within:to-neutral-800/60 transition-colors duration-500">
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••••••"
                            className="w-full bg-[#050505] rounded-[5px] pl-10 pr-11 py-3 text-sm text-white font-normal focus:outline-none placeholder-neutral-600"
                            required
                          />
                          <Lock className="h-4 w-4 absolute left-3.5 top-3.5 text-neutral-400" />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-3.5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Config Toggles */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs sm:text-sm font-normal text-neutral-300">
                        Preserve connection state
                      </span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={rememberMe}
                        onClick={() => setRememberMe(!rememberMe)}
                        className="relative inline-flex h-4 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full focus:outline-none"
                      >
                        <span className={`pointer-events-none absolute w-full h-full rounded-full border transition-colors duration-300 ${
                          rememberMe 
                            ? 'bg-orange-950/60 border-orange-500/60' 
                            : 'bg-neutral-800 border-neutral-700'
                        }`} />
                        <span className={`pointer-events-none absolute left-0.5 inline-block h-3 w-3 transform rounded-full shadow-sm transition-transform duration-300 ease-out ${
                          rememberMe 
                            ? 'translate-x-4 bg-orange-400' 
                            : 'bg-neutral-500'
                        }`} />
                      </button>
                    </div>

                    {/* Action Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full relative group/btn overflow-hidden rounded-md bg-white text-black text-sm font-semibold py-3.5 mt-4 transition-all hover:bg-neutral-100 shadow-[0_0_25px_rgba(255,255,255,0.12)] cursor-pointer"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-400/30 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500" />
                      <span className="relative z-10 flex items-center justify-center gap-2 tracking-wide text-neutral-900 font-semibold">
                        {loading ? 'Authorizing Gateway...' : 'Execute Gateway Link'}
                        <ArrowRight className="h-4 w-4 transform group-hover/btn:translate-x-1.5 transition-transform" />
                      </span>
                    </button>

                  </form>

                  {/* Credentials Footer Note */}
                  <div className="pt-3 border-t border-neutral-800 text-center">
                    <p className="text-xs font-normal text-neutral-400">
                      Officer credentials: <code className="text-orange-300 font-mono font-medium">officer@grievance.gov</code> / <code className="text-orange-300 font-mono font-medium">officer123</code>
                    </p>
                  </div>

                </div>

              </div>

            </div>
          </div>

        </section>

      </main>

    </section>
  );
}
