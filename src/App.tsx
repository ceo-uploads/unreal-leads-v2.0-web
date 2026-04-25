import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/FirebaseContext';
import { LogIn, UserPlus, Fingerprint, Mail, Lock, AlertCircle } from 'lucide-react';
import Layout from './components/Layout';

// Lazy load views for better performance
const MarketView = React.lazy(() => import('./views/MarketView'));
const DashboardView = React.lazy(() => import('./views/DashboardView'));
const ProfileView = React.lazy(() => import('./views/ProfileView'));
const AdminView = React.lazy(() => import('./views/AdminView'));
const AuthView = React.lazy(() => import('./views/AuthView'));

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-slate-950">
      <div className="relative">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-brand border-opacity-50"></div>
        <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border-2 border-brand border-opacity-20"></div>
      </div>
    </div>
  );
  return user ? children : <Navigate to="/auth" />;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useAuth();
  if (loading) return null;
  return profile?.isAdmin ? children : <Navigate to="/" />;
}

function ConnectionError({ error }: { error: any }) {
  const hostname = window.location.hostname;

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full space-y-6 bg-slate-900/40 border border-red-500/20 p-8 rounded-[2.5rem] backdrop-blur-xl">
        <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 mx-auto mb-6">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white px-2">
          FIREBASE_CONNECTION_FAILED
        </h2>
        <div className="space-y-4 text-left">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Protocol: {error?.code || 'unknown'}</p>
          
          <div className="p-4 bg-black/40 rounded-xl border border-white/5 space-y-3">
             <p className="text-[10px] font-bold text-slate-400 leading-relaxed italic">
               "{error?.message || 'The connection to Firebase could not be established.'}"
             </p>
          </div>

          <div className="space-y-3 pt-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand">REQUIRED_ACTIONS:</h3>
            <ul className="text-[10px] space-y-2 text-slate-400 font-bold uppercase tracking-widest list-disc pl-4">
              <li>Add <span className="text-white">'{hostname}'</span> to Authorized Domains in Firebase console.</li>
              <li>Ensure Realtime Database is enabled for project <span className="text-white">'unreal-leads'</span>.</li>
              <li>Check for API Key restrictions in Google Cloud Console.</li>
            </ul>
          </div>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="w-full bg-white text-black font-black py-4 rounded-xl hover:bg-brand transition-all uppercase text-[10px] tracking-widest mt-4"
        >
          Retry Connection
        </button>
      </div>
    </div>
  );
}

function AppContent() {
  const { error } = useAuth();

  if (error) {
    return <ConnectionError error={error} />;
  }

  return (
    <BrowserRouter>
      <React.Suspense fallback={
        <div className="flex items-center justify-center h-screen bg-slate-950">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-brand border-opacity-50"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border-2 border-brand border-opacity-20"></div>
          </div>
        </div>
      }>
        <Routes>
          <Route path="/auth" element={<AuthView />} />
          <Route path="/admin" element={
            <AdminView />
          } />
          <Route path="/" element={<Layout />}>
            <Route index element={<MarketView />} />
            <Route path="dashboard" element={
              <PrivateRoute>
                <DashboardView />
              </PrivateRoute>
            } />
            <Route path="profile" element={
              <PrivateRoute>
                <ProfileView />
              </PrivateRoute>
            } />
          </Route>
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </React.Suspense>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
