import React from 'react';
import { useAuth } from '@/src/components/FirebaseContext';
import { useTranslation } from 'react-i18next';
import { cn, formatDate, formatCurrency } from '@/src/lib/utils';
import { PackageStatus } from '@/src/constants/plans';
import { 
  Zap, 
  Clock, 
  Calendar, 
  Bell, 
  BarChart3, 
  CreditCard, 
  ArrowUpRight, 
  ShieldCheck, 
  AlertCircle,
  TrendingUp,
  Download
} from 'lucide-react';

export default function DashboardView() {
  const { profile, user } = useAuth();
  const { t } = useTranslation();

  if (!profile) return null;

  const isActive = profile.currentPackage?.status === PackageStatus.ACTIVE;

  const stats = [
    { label: t('dashboard.purchased_total'), value: formatCurrency(profile.purchaseHistory.reduce((acc, p) => acc + p.amountPaid, 0)), icon: CreditCard },
    { label: t('dashboard.active_leads'), value: isActive ? '4,000,000' : '0', icon: BarChart3 },
    { label: t('dashboard.notifications'), value: profile.notifications.filter(n => !n.read).length.toString(), icon: Bell },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tighter uppercase italic text-white">
            {t('dashboard.welcome')}, <span className="text-brand">{profile.displayName || user?.email?.split('@')[0]}</span>
          </h1>
          <p className="text-slate-500 text-[9px] sm:text-[10px] font-black mt-1 uppercase tracking-[0.2em]">{isActive ? 'Premium Member' : 'Free Account'} • ID: {user?.uid.slice(0, 8)}</p>
        </div>
        <div className="flex items-center justify-between sm:justify-end space-x-3 bg-slate-900/40 p-3 sm:p-0 rounded-2xl sm:bg-transparent">
          <div className="text-left sm:text-right">
            <p className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">{t('dashboard.balance')}</p>
            <p className="text-xl sm:text-2xl font-black text-white italic tracking-tighter">{formatCurrency(0)}</p>
          </div>
          <button className="flex items-center space-x-2 bg-brand text-black px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl hover:bg-brand-dark transition-all font-black text-[10px] uppercase tracking-widest shadow-lg shadow-brand/20">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{t('dashboard.deposit')}</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        
        {/* Package Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className={cn(
            "p-6 sm:p-8 rounded-3xl relative overflow-hidden transition-all",
            isActive ? "bg-slate-900/40 border border-brand/30 shadow-2xl shadow-brand/10" : "bg-slate-900/40 border border-white/5"
          )}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 -skew-x-12 translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
            
            <div className="relative z-10 text-white">
              <div className="flex items-center justify-between mb-6 sm:mb-8">
                <div className={cn(
                  "px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest border",
                  isActive ? "bg-brand/10 text-brand border-brand/20" : "bg-slate-800 text-slate-500 border-white/5"
                )}>
                  {isActive ? t('dashboard.status_active') : t('dashboard.status_inactive')}
                </div>
                <Zap className={cn("w-5 h-5 sm:w-6 sm:h-6", isActive ? "text-brand" : "text-slate-700")} />
              </div>

              {isActive ? (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-3xl sm:text-5xl font-black tracking-tighter uppercase italic leading-none">
                      {profile.currentPackage?.planName}
                    </h2>
                    <p className="text-brand text-[9px] sm:text-[10px] mt-2 sm:mt-3 uppercase font-black tracking-[0.3em]">Access Authorized</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 pt-6 border-t border-white/5">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-slate-500">
                        <Calendar className="w-3 h-3" />
                        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest">Start Date</span>
                      </div>
                      <p className="text-xs sm:text-sm font-black text-slate-300">{formatDate(profile.currentPackage!.activationDate)}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-slate-500">
                        <Clock className="w-3 h-3" />
                        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest">{t('dashboard.term_ends')}</span>
                      </div>
                      <p className="text-xs sm:text-sm font-black text-slate-300">
                        {profile.currentPackage?.deadline === 'lifetime' ? '∞ LIFETIME' : formatDate(profile.currentPackage!.deadline)}
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                    <button className="flex-1 bg-white text-black font-black py-3.5 sm:py-4 rounded-2xl hover:bg-brand transition-all uppercase text-[10px] tracking-widest flex items-center justify-center space-x-2">
                       <ArrowUpRight className="w-3.5 h-3.5" />
                       <span>{t('dashboard.market_access')}</span>
                    </button>
                    <button className="px-6 py-3.5 sm:py-4 rounded-2xl bg-slate-800 border border-white/5 hover:bg-slate-700 text-slate-400 transition-all font-black text-[10px] uppercase tracking-widest">
                      {t('dashboard.invoices')}
                    </button>
                  </div>
                </div>
              ) : (
                  <div className="py-12 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center text-slate-600 mb-6 border border-white/5">
                      <AlertCircle className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-tighter italic">{t('dashboard.membership_required')}</h3>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-2 max-w-xs leading-relaxed">{t('dashboard.membership_desc')}</p>
                    <button className="mt-8 bg-brand text-black px-8 py-4 rounded-xl hover:bg-brand-dark transition-all font-black text-[10px] uppercase tracking-widest">
                      {t('dashboard.purchase_package')}
                    </button>
                  </div>
              )}
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="stat-card p-6 rounded-3xl flex flex-col justify-between h-32">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">{stat.label}</span>
                <span className="text-3xl font-black text-white italic tracking-tighter">{stat.value}</span>
                <div className="flex items-center text-[10px] text-brand/60 font-bold uppercase tracking-widest mt-1">
                   <stat.icon className="w-3 h-3 mr-1" />
                   <span>System Logged</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Side Info Shell */}
        <div className="space-y-6">
          {/* Notifications Panel */}
          <div className="bg-slate-900/40 border border-white/5 h-full rounded-3xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h3 className="font-black text-[10px] uppercase tracking-[0.2em] flex items-center space-x-2 italic">
                <Bell className="w-4 h-4 text-brand" />
                <span>{t('dashboard.security_events')}</span>
              </h3>
              <span className="text-[10px] bg-brand text-black px-2 py-0.5 rounded-full font-black">LIVE</span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {profile.notifications.length > 0 ? (
                profile.notifications.slice(0, 5).map((notif) => (
                  <div key={notif.id} className="p-4 rounded-2xl bg-slate-800/40 border border-white/5 space-y-2 group hover:border-brand/40 transition-all cursor-pointer">
                    <div className="flex items-start justify-between">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-300">{notif.title}</h4>
                      <span className="text-[10px] text-slate-600 font-mono">{formatDate(notif.timestamp)}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold leading-relaxed uppercase tracking-wide">{notif.message}</p>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-700 space-y-2 p-12">
                  <Bell className="w-8 h-8 opacity-20" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-center">Protocol Idle</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-black/20 border-t border-white/5">
              <button className="w-full py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-brand transition-colors">
                Sync History
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Activity Preview Table */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="font-black text-[10px] uppercase tracking-[0.2em] flex items-center space-x-2 italic">
            <Download className="w-4 h-4 text-brand" />
            <span>{t('dashboard.extraction_logs')}</span>
          </h3>
          <button className="text-[10px] font-black uppercase text-brand hover:underline tracking-widest">{t('dashboard.full_export')}</button>
        </div>

        <div className="bg-slate-900/40 border border-white/5 rounded-3xl overflow-hidden">
          <div className="p-12 flex flex-col items-center text-center opacity-40">
             <BarChart3 className="w-12 h-12 mb-4 text-slate-600" />
             <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">{t('dashboard.no_activity')}</p>
             <p className="text-[10px] text-slate-600 mt-2 max-w-xs font-bold uppercase tracking-widest">{t('dashboard.no_activity_desc')}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
