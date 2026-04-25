import React from 'react';
import { NavLink, useSearchParams } from 'react-router-dom';
import { ShoppingCart, LayoutDashboard, User, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/src/components/FirebaseContext';
import { cn } from '@/src/lib/utils';
import { motion } from 'motion/react';

export default function BottomNav() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const [searchParams] = useSearchParams();
  const showAdminSecret = searchParams.get('admin') === 'true';

  const navItems = [
    { to: '/', icon: ShoppingCart, label: t('nav.market') },
    { to: '/dashboard', icon: LayoutDashboard, label: t('nav.dashboard') },
    { to: '/profile', icon: User, label: t('nav.profile') },
  ];

  return (
    <nav className="fixed bottom-6 left-4 right-4 bg-slate-900/80 backdrop-blur-xl border border-white/10 px-6 py-4 rounded-3xl flex justify-around shadow-2xl z-50 md:hidden">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => cn(
            "flex flex-col items-center justify-center transition-all px-2 relative",
            isActive ? "text-brand scale-110" : "text-slate-500 hover:text-slate-300"
          )}
        >
          {({ isActive }) => (
            <>
              <item.icon className={cn("w-5 h-5 mb-1", isActive && "drop-shadow-[0_0_8px_rgba(var(--brand),0.5)]")} />
              <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
              {isActive && (
                <motion.div 
                  layoutId="nav-glow"
                  className="absolute -bottom-1 w-1 h-1 bg-brand rounded-full shadow-[0_0_10px_rgba(var(--brand),0.8)]"
                />
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
