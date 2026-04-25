import React from 'react';
import { useAuth } from '@/src/components/FirebaseContext';
import { useTranslation } from 'react-i18next';
import { cn, formatDate, formatCurrency } from '@/src/lib/utils';
import { auth, db } from '@/src/lib/firebase';
import { ref, update } from 'firebase/database';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Settings, 
  History, 
  CreditCard, 
  LogOut, 
  Mail, 
  Phone, 
  Calendar, 
  Star,
  CheckCircle2,
  Clock,
  XCircle,
  Package,
  ShieldCheck
} from 'lucide-react';

export default function ProfileView() {
  const { profile, user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (!profile || !user) return null;

  const isExpired = (deadline: number | 'lifetime') => {
    if (deadline === 'lifetime') return false;
    return Date.now() > deadline;
  };

  const currentActive = profile.currentPackage && !isExpired(profile.currentPackage.deadline);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/auth');
  };

  const StatusIcon = ({ status }: { status: string }) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'active':
        return <CheckCircle2 className="w-4 h-4 text-brand" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed':
      case 'ended':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Profile Header */}
      <div className="bg-slate-900/40 border border-white/5 p-8 rounded-3xl relative overflow-hidden shadow-2xl shadow-black/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 -skew-x-12 translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
        
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-6 sm:space-y-0 sm:space-x-8 relative z-10">
          <div className="w-32 h-32 rounded-3xl bg-slate-950 border-2 border-brand/20 flex items-center justify-center text-4xl font-black text-white shadow-inner italic">
            {profile.displayName?.charAt(0) || user.email?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-4xl font-black tracking-tighter uppercase italic text-white leading-tight">{profile.displayName}</h1>
                <p className="text-slate-500 text-[10px] font-black flex items-center justify-center sm:justify-start space-x-2 mt-1 uppercase tracking-widest italic">
                  <Mail className="w-3.5 h-3.5 text-brand" />
                  <span>{user.email}</span>
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center sm:justify-end space-x-3">
                <button className="p-2 sm:p-3 bg-slate-800 rounded-xl sm:rounded-2xl hover:bg-slate-700 transition-all text-slate-400 border border-white/5">
                  <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button 
                  onClick={handleLogout}
                  className="p-2 sm:p-3 bg-red-500/10 rounded-xl sm:rounded-2xl hover:bg-red-500/20 transition-all text-red-500 border border-red-500/20"
                >
                  <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-4">
              <div className="flex items-center space-x-2 px-4 py-1.5 bg-brand/10 rounded-full border border-brand/20">
                <Star className="w-3.5 h-3.5 text-brand" />
                <span className="text-[10px] font-black uppercase tracking-widest text-brand">
                  {profile.isAdmin ? 'PLATINUM ADMIN' : 'ELITE MEMBER'}
                </span>
              </div>
              <div className="flex items-center space-x-2 px-4 py-1.5 bg-slate-800 rounded-full border border-white/5">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">
                   AUTH: {profile.whatsApp || 'SECURE'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Active Package Section */}
        <div className="space-y-4">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-2 flex items-center space-x-2 italic">
            <Package className="w-4 h-4 text-brand" />
            <span>LICENSED PRODUCT</span>
          </h2>
          <div className="stat-card p-6 rounded-3xl space-y-6">
            {profile.currentPackage ? (
              <>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white">
                      {profile.currentPackage.planName}
                    </h3>
                    <p className={cn(
                      "text-[10px] font-black uppercase tracking-[0.2em] mt-1",
                      currentActive ? "text-brand" : "text-red-500"
                    )}>
                      ACCESS STATUS: {currentActive ? 'VALID' : 'EXPIRED'}
                    </p>
                  </div>
                  <div className={cn(
                    "p-2 rounded-xl border transition-all",
                    currentActive ? "bg-brand/10 border-brand/20" : "bg-red-500/10 border-red-500/20"
                  )}>
                    <StatusIcon status={currentActive ? 'active' : 'ended'} />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6 pb-6 border-b border-white/5">
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest leading-none">Registered</p>
                    <p className="text-sm font-black text-slate-300 italic">{formatDate(profile.currentPackage.activationDate)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest leading-none">Security End</p>
                    <p className={cn(
                      "text-sm font-black italic",
                      currentActive ? "text-slate-300" : "text-red-500"
                    )}>
                      {profile.currentPackage.deadline === 'lifetime' ? '∞ PERPETUAL' : formatDate(profile.currentPackage.deadline)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-500 font-black uppercase tracking-widest">Protocol Integrity</span>
                  <span className={cn(
                    "font-black uppercase tracking-widest px-3 py-1 rounded-full border",
                    currentActive ? "bg-brand/10 text-brand border-brand/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                  )}>
                    {currentActive ? 'Active' : 'Expired'}
                  </span>
                </div>
              </>
            ) : (
              <div className="py-12 flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-slate-950 rounded-2xl flex items-center justify-center text-slate-700 border border-white/5 shadow-inner">
                  <Package className="w-8 h-8 opacity-20" />
                </div>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">No signature detected.</p>
                <button 
                  onClick={() => navigate('/')}
                  className="mt-4 bg-brand text-black px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-dark transition-all"
                >
                  Acquire License
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="space-y-4">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-2 flex items-center space-x-2 italic">
            <CreditCard className="w-4 h-4 text-brand" />
            <span>PAYMENT RECORDS</span>
          </h2>
          <div className="bg-slate-900/40 border border-white/5 rounded-3xl overflow-hidden flex flex-col h-[320px]">
            <div className="flex-1 overflow-y-auto">
              {profile.transactionHistory.length > 0 ? (
                <div className="divide-y divide-white/5">
                  {profile.transactionHistory.map((trx) => (
                    <div key={trx.id} className="p-5 flex items-center justify-between hover:bg-white/[0.03] transition-colors group">
                      <div className="flex items-center space-x-4">
                        <div className="p-2.5 bg-slate-950 rounded-xl border border-white/5 group-hover:border-brand/20 transition-all">
                          <History className="w-4 h-4 text-slate-600 group-hover:text-brand transition-colors" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 italic">{trx.method}</p>
                          <p className="text-[9px] text-slate-600 font-mono mt-1 uppercase tracking-tighter">HASH: {trx.trxId.slice(0, 16)}...</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-white italic tracking-tighter">{formatCurrency(trx.amount)}</p>
                        <div className="flex items-center justify-end space-x-2 mt-1">
                          <span className={cn(
                            "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border",
                            trx.status === 'completed' ? "bg-brand/10 text-brand border-brand/20" : trx.status === 'pending' ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                          )}>
                            {trx.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  )).reverse()}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-700 p-8 text-center space-y-4">
                  <CreditCard className="w-10 h-10 opacity-10" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em]">Ledger Empty</p>
                </div>
              )}
            </div>
            <div className="p-4 bg-black/20 border-t border-white/5">
              <button className="w-full text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-brand transition-colors py-2">
                Sync Transaction Data
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Log / Additional History */}
      <section className="space-y-4">
        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-2 flex items-center space-x-2 italic">
          <History className="w-4 h-4 text-brand" />
          <span>TRANSECTIONS HISTORY</span>
        </h2>
        <div className="bg-slate-900/40 border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-left text-[10px] min-w-[600px]">
              <thead className="bg-black/40 text-slate-500 uppercase font-black tracking-widest border-b border-white/5">
                <tr>
                  <th className="p-4 sm:p-6">PROTOCOL / PACKAGE</th>
                  <th className="p-4 sm:p-6">UNIT VALUE</th>
                  <th className="p-4 sm:p-6">TEMPORAL RANGE</th>
                  <th className="p-4 sm:p-6 text-right">METRIC STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {profile.purchaseHistory.length > 0 ? (
                  profile.purchaseHistory.map((pkg) => (
                    <tr key={pkg.id} className="hover:bg-brand/5 transition-colors group">
                      <td className="p-4 sm:p-6 font-black italic uppercase tracking-tighter text-white text-sm sm:text-base">{pkg.planName}</td>
                      <td className="p-4 sm:p-6 font-black text-brand text-xs sm:text-sm italic">{formatCurrency(pkg.amountPaid)}</td>
                      <td className="p-4 sm:p-6 text-slate-500 font-bold uppercase tracking-widest italic whitespace-nowrap">
                        {formatDate(pkg.activationDate)} <span className="mx-1 sm:mx-2 text-slate-700">{'>>'}</span> {pkg.deadline === 'lifetime' ? '∞ FOREVER' : formatDate(pkg.deadline)}
                      </td>
                      <td className="p-4 sm:p-6 text-right">
                        <span className={cn(
                          "px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-widest border shadow-lg",
                          pkg.status === 'Active' ? "bg-brand/10 text-brand border-brand/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                        )}>
                          {pkg.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-16 text-center text-slate-700 font-black uppercase tracking-[0.3em]">
                      NO ARCHIVED ACQUISITIONS
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
