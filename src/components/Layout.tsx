import React from 'react';
import { Outlet, NavLink, useSearchParams } from 'react-router-dom';
import BottomNav from './BottomNav';
import { ShoppingCart, LayoutDashboard, User, ShieldCheck, Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/src/components/FirebaseContext';
import { cn } from '@/src/lib/utils';

export default function Layout() {
  const { i18n, t } = useTranslation();
  const { profile, user } = useAuth();
  const [searchParams] = useSearchParams();
  const showAdminSecret = searchParams.get('admin') === 'true';

  const navItems = [
    { to: '/', icon: ShoppingCart, label: t('nav.market') },
    { to: '/dashboard', icon: LayoutDashboard, label: t('nav.dashboard') },
    { to: '/profile', icon: User, label: t('nav.profile') },
  ];

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'bn' : 'en';
    i18n.changeLanguage(nextLang);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-950 text-slate-200">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-white/5 bg-slate-900/50 backdrop-blur-xl sticky top-0 h-screen p-4">
        <div className="p-6 mb-4 glass rounded-2xl border-white/5">
          <h1 className="text-xl font-black text-white italic tracking-tighter">UNREAL <span className="text-brand">LEADS</span></h1>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1 font-bold">{t('tagline')}</p>
        </div>
        
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => cn(
                "flex items-center space-x-3 px-6 py-4 rounded-xl transition-all group",
                isActive ? "bg-brand/10 text-brand border border-brand/20 shadow-lg shadow-brand/5" : "text-slate-400 hover:bg-white/5 border border-transparent"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-bold text-xs uppercase tracking-widest">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-4 space-y-3">
          <button 
            onClick={toggleLanguage}
            className="flex items-center justify-between px-6 py-3 w-full rounded-xl bg-slate-800/50 text-slate-400 hover:text-brand border border-white/5 transition-all text-[10px] font-black uppercase tracking-widest"
          >
            <span>Language</span>
            <span className="text-brand">{i18n.language}</span>
          </button>
          
          {user && (
            <div className="glass p-4 rounded-xl flex items-center space-x-3 border-white/5">
              <div className="w-10 h-10 rounded-full bg-brand flex items-center justify-center text-black font-black text-sm shadow-lg shadow-brand/20">
                {profile?.displayName?.charAt(0) || user.email?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black truncate text-white">{profile?.displayName || user.email?.split('@')[0]}</p>
                <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 pb-20 md:pb-0 overflow-y-auto">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-white/10 bg-neutral-900/50 sticky top-0 z-40 backdrop-blur-xl">
          <h1 className="text-lg font-bold text-brand tracking-tighter">UNREAL v2</h1>
          <button onClick={toggleLanguage} className="p-2 border border-white/10 rounded-lg text-brand">
            <Languages className="w-5 h-5" />
          </button>
        </header>

        <div className="max-w-6xl mx-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>

      <BottomNav />

      {/* WhatsApp Floating Icon */}
      <a 
        href="https://wa.me/+8801333294862" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed right-6 bottom-28 md:bottom-8 w-12 h-12 md:w-14 md:h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-50 animate-bounce sm:animate-none"
        id="whatsapp-fab"
      >
        <svg viewBox="0 0 24 24" className="w-6 h-6 md:w-8 md:h-8 fill-white">
          <path d="M12.031 6.172c-2.32 0-4.513 1.353-5.474 3.417-.963 2.063-.563 4.496 1.002 6.14l-1.025 3.018 3.125-1.002c.767.432 1.621.658 2.372.658 2.32 0 4.512-1.353 5.474-3.417.962-2.063.563-4.496-1.002-6.14a6.376 6.376 0 0 0-4.472-1.674zm.001 11.5c-.658 0-1.289-.184-1.834-.53l-.132-.083-1.851.593.606-1.782-.089-.142a5.13 5.13 0 0 1-1.354-3.4c0-2.83 2.301-5.132 5.132-5.132 2.831 0 5.132 2.302 5.132 5.132 0 2.83-2.301 5.132-5.132 5.132zm2.846-3.876c-.156-.078-.921-.455-1.064-.506-.143-.051-.247-.078-.351.078-.104.156-.403.506-.493.61-.091.104-.182.117-.338.039-.156-.078-.659-.243-1.256-.774-.464-.414-.777-.924-.868-1.08-.091-.156-.01-.24.068-.317.07-.071.156-.182.234-.273.078-.091.104-.156.156-.26.052-.104.026-.195-.013-.273-.039-.078-.351-.844-.481-1.156-.126-.304-.251-.263-.344-.268l-.293-.005c-.104 0-.273.039-.416.195-.143.156-.546.533-.546 1.3s.559 1.507.637 1.611c.078.104 1.1 1.68 2.665 2.353.372.16.663.256.89.329.373.119.713.102.983.062.3-.044.921-.377 1.051-.741.13-.364.13-.676.091-.741-.039-.065-.143-.104-.299-.182z" />
        </svg>
      </a>
    </div>
  );
}
