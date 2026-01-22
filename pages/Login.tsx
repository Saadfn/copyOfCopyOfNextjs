
import React, { useState, useEffect } from 'react';
import { Stethoscope, Mail, Lock, LogIn, AlertCircle, Loader2, ShieldCheck, UserPlus, Fingerprint, ChevronRight, MailCheck, CheckCircle2 } from 'lucide-react';
import { db } from '../utils/storage';

interface LoginProps {
  onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    db.init();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    await new Promise(resolve => setTimeout(resolve, 800));

    const user = db.login(email, password);
    if (user) {
      onLoginSuccess();
    } else {
      setError("Invalid credentials. Use password '123' for any staff or existing user.");
      setIsLoading(false);
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    setError(null);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    db.registerPatient(email);
    setIsOtpSent(true);
    setIsLoading(false);
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    await new Promise(resolve => setTimeout(resolve, 1000));
    const user = db.verifyOTP(email, otp);
    if (user) {
      onLoginSuccess();
    } else {
      setError("Invalid code. Please check your email.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-[120px] opacity-50"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-100 rounded-full blur-[120px] opacity-50"></div>

      <div className="w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-slate-100 animate-in zoom-in-95 duration-500">
        
        <div className="md:w-1/2 bg-blue-600 p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-700"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30">
                <Stethoscope size={28} className="text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight">St. George</span>
            </div>
            
            <h1 className="text-4xl font-bold leading-tight mb-6">
              Your Health, <br /> 
              <span className="text-blue-200">Our Priority.</span>
            </h1>
            <p className="text-blue-100 text-lg leading-relaxed max-w-md">
              Securely access your medical records, book diagnostic tests, and schedule consultations with our specialists.
            </p>
          </div>
        </div>

        <div className="md:w-1/2 p-12 lg:p-16 bg-white">
          <div className="max-w-md mx-auto h-full flex flex-col">
            <div className="flex p-1 bg-slate-100 rounded-2xl mb-10 self-start">
              <button 
                onClick={() => { setActiveTab('login'); setError(null); setIsOtpSent(false); }}
                className={`px-6 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === 'login' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                LOGIN
              </button>
              <button 
                onClick={() => { setActiveTab('register'); setError(null); setIsOtpSent(false); }}
                className={`px-6 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === 'register' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                PATIENT SIGNUP
              </button>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">
                {activeTab === 'login' ? 'Welcome Back' : 'Join Our Network'}
              </h2>
              <p className="text-slate-500 font-medium">
                {activeTab === 'login' ? 'Sign in to access your portal.' : 'Only an email is required to register.'}
              </p>
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-start gap-3 mb-6 animate-in slide-in-from-top-2">
                <AlertCircle className="text-rose-500 shrink-0 mt-0.5" size={18} />
                <p className="text-sm text-rose-700 font-medium">{error}</p>
              </div>
            )}

            {activeTab === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                    <input 
                      type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Password</label>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                    <input 
                      type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <button 
                  type="submit" disabled={isLoading}
                  className="w-full bg-slate-900 text-white rounded-2xl py-4 font-bold shadow-xl hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : <LogIn size={20} />}
                  Sign In to Portal
                </button>
              </form>
            ) : (
              <div className="space-y-6">
                {!isOtpSent ? (
                  <form onSubmit={handleSendOTP} className="space-y-6 animate-in fade-in slide-in-from-right-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address Only</label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                        <input 
                          type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                          placeholder="your.email@gmail.com"
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                        />
                      </div>
                    </div>
                    <button 
                      type="submit" disabled={isLoading}
                      className="w-full bg-blue-600 text-white rounded-2xl py-4 font-bold shadow-xl shadow-blue-100 hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                    >
                      {isLoading ? <Loader2 className="animate-spin" size={20} /> : <MailCheck size={20} />}
                      Receive OTP Code
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOTP} className="space-y-6 animate-in fade-in slide-in-from-right-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Verification Code</label>
                      <div className="relative group">
                        <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                        <input 
                          type="text" required maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value)}
                          placeholder="Enter 6-digit OTP"
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-lg font-bold tracking-[0.5em] outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-center"
                        />
                      </div>
                    </div>
                    <button 
                      type="submit" disabled={isLoading}
                      className="w-full bg-emerald-600 text-white rounded-2xl py-4 font-bold shadow-xl shadow-emerald-100 hover:bg-emerald-700 disabled:opacity-50 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                    >
                      {isLoading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                      Verify & Register
                    </button>
                    <button type="button" onClick={() => setIsOtpSent(false)} className="w-full text-xs font-bold text-blue-600 hover:underline">Resend code to different email?</button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
