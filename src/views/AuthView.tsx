import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail, 
  signInWithPopup, 
  GoogleAuthProvider 
} from 'firebase/auth';
import { ref, set, get } from 'firebase/database';
import { auth, db } from '@/src/lib/firebase';
import { useAuth } from '@/src/components/FirebaseContext';
import { useTranslation } from 'react-i18next';
import { cn } from '@/src/lib/utils';
import { LogIn, UserPlus, Fingerprint, Mail, Lock, AlertCircle } from 'lucide-react';
import { PackageStatus } from '@/src/constants/plans';

export default function AuthView() {
  const { user, loading } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [isLogin, setIsLogin] = useState(true);
  const [isReset, setIsReset] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  if (loading) return null;
  if (user) return <Navigate to="/" />;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMsg('');
    
    try {
      if (isReset) {
        await sendPasswordResetEmail(auth, email);
        setMsg('Password reset link sent to your email.');
      } else if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        navigate('/');
      } else {
        const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password);
        // Create initial profile in Realtime Database
        await set(ref(db, `users/${newUser.uid}`), {
          uid: newUser.uid,
          email: newUser.email,
          displayName: displayName || email.split('@')[0],
          isAdmin: false,
          currentPackage: null,
          purchaseHistory: [],
          transactionHistory: [],
          notifications: [
            {
              id: Date.now().toString(),
              title: 'Welcome to Unreal Leads v2.0!',
              message: 'Thank you for joining our premium leads platform.',
              timestamp: Date.now(),
              read: false
            }
          ]
        });
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const { user: gUser } = await signInWithPopup(auth, provider);
      
      const profileRef = ref(db, `users/${gUser.uid}`);
      const snapshot = await get(profileRef);
      
      if (!snapshot.exists()) {
        await set(profileRef, {
          uid: gUser.uid,
          email: gUser.email,
          displayName: gUser.displayName || gUser.email?.split('@')[0],
          isAdmin: false,
          currentPackage: null,
          purchaseHistory: [],
          transactionHistory: [],
          notifications: []
        });
      }
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-brand/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-brand/5 blur-[120px] rounded-full"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
      </div>

      <div className="w-full max-w-md bg-slate-900/40 border border-white/5 p-10 rounded-[2.5rem] relative z-10 shadow-2xl shadow-black/50 backdrop-blur-xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-slate-950 border border-brand/20 text-brand mb-6 shadow-inner relative group">
            <div className="absolute inset-0 bg-brand/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <Fingerprint className="w-10 h-10 relative z-10" />
          </div>
          <h1 className="text-3xl font-black tracking-tighter uppercase italic text-white leading-none">
            {isReset ? 'Access Recovery' : isLogin ? 'Terminal Login' : 'System Registry'}
          </h1>
          <p className="text-slate-500 text-[10px] uppercase font-black tracking-[0.3em] mt-3 italic">UNREAL LEADS v2.0 • SECURE NODE</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          {!isReset && !isLogin && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest">Full Name</label>
              <div className="relative">
                <LogIn className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                <input 
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-slate-950 border border-white/5 rounded-xl py-4 pl-12 pr-4 focus:border-brand/40 transition-all outline-none text-[11px] font-black uppercase tracking-widest text-white shadow-inner"
                  placeholder="EX: JOHN_DOE"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-white/5 rounded-xl py-4 pl-12 pr-4 focus:border-brand/40 transition-all outline-none text-[11px] font-black uppercase tracking-widest text-white shadow-inner"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          {!isReset && (
            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Password</label>
                {isLogin && (
                  <button 
                    type="button" 
                    onClick={() => setIsReset(true)}
                    className="text-[9px] uppercase font-black text-brand hover:text-white transition-colors tracking-widest"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-white/5 rounded-xl py-4 pl-12 pr-4 focus:border-brand/40 transition-all outline-none text-[11px] font-black uppercase tracking-widest text-white shadow-inner"
                  placeholder="••••••••"
                  required={!isReset}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-start space-x-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest italic">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {msg && (
            <div className="flex items-start space-x-3 p-4 rounded-xl bg-brand/10 border border-brand/20 text-brand text-[10px] font-black uppercase tracking-widest italic">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{msg}</span>
            </div>
          )}

          <button 
            type="submit"
            className="w-full bg-brand text-black font-black py-4 rounded-xl hover:bg-brand-dark transition-all flex items-center justify-center space-x-2 text-[11px] uppercase tracking-[0.2em] shadow-lg shadow-brand/20 mt-4 active:scale-95"
          >
            {isReset ? <span>AUTHENTICATE RESET</span> : isLogin ? <><LogIn className="w-4 h-4" /> <span>LOGIN</span></> : <><UserPlus className="w-4 h-4" /> <span>REGISTER NODE</span></>}
          </button>
        </form>

        {!isReset && (
          <div className="mt-8 flex flex-col items-center space-y-6">
            <div className="flex items-center w-full">
              <div className="flex-1 h-px bg-white/5"></div>
              <span className="px-4 text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">GATEWAY_B</span>
              <div className="flex-1 h-px bg-white/5"></div>
            </div>

            <button 
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center space-x-3 bg-slate-800 border border-white/5 py-4 rounded-xl hover:bg-slate-700 transition-all font-black text-[10px] uppercase tracking-widest text-slate-300 italic"
            >
              <img src="https://www.google.com/favicon.ico" className="w-4 h-4 grayscale opacity-80" alt="google" />
              <span>Continue With Google</span>
            </button>

            <button 
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setMsg('');
              }}
              className="text-[10px] font-black text-slate-500 hover:text-brand transition-colors uppercase tracking-widest italic"
            >
              {isLogin ? "REGISTER NEW ACCOUNT" : "RETURN TO LOGIN"}
            </button>
          </div>
        )}

        {isReset && (
          <button 
            onClick={() => setIsReset(false)}
            className="w-full mt-6 text-[10px] font-black text-slate-500 hover:text-brand transition-colors uppercase tracking-widest italic"
          >
            RETURN TO TERMINAL
          </button>
        )}
      </div>
    </div>
  );
}
