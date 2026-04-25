import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SUBSCRIPTION_PLANS, SubscriptionPlan } from '@/src/constants/plans';
import { cn, formatCurrency } from '@/src/lib/utils';
import { Search, Filter, Database, TrendingUp, Users, MapPin, Briefcase, ChevronRight, Zap, ShieldCheck } from 'lucide-react';
import CheckoutModal from '@/src/components/CheckoutModal';
import { useAuth } from '@/src/components/FirebaseContext';
import { useNavigate } from 'react-router-dom';

export default function MarketView() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const stats = [
    { label: t('market.stats_users'), value: '12K+', icon: Users },
    { label: t('market.stats_leads'), value: '4M+', icon: Database },
    { label: t('market.stats_success'), value: '98%', icon: TrendingUp },
  ];

  const handlePlanClick = (plan: SubscriptionPlan) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    setSelectedPlan(plan);
  };

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative p-8 md:p-12 glass rounded-3xl overflow-hidden neo-shadow group border-brand/10">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-brand/5 -skew-x-12 translate-x-1/2 group-hover:translate-x-1/3 transition-transform duration-700"></div>
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block px-3 py-1 bg-brand/10 text-brand text-[10px] font-bold uppercase tracking-widest rounded-full mb-4 border border-brand/20">
            {t('market.hero_badge')}
          </span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none">
            {t('market.hero_title').split(' ')[0]} <span className="text-brand">{t('market.hero_title').split(' ').slice(1).join(' ')}</span>
          </h1>
          <p className="mt-6 text-neutral-400 text-lg leading-relaxed">
            {t('market.hero_desc')}
          </p>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="stat-card p-6 rounded-3xl flex flex-col justify-between h-32 group hover:scale-[1.02] transition-all">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">{stat.label}</span>
            <span className="text-4xl font-black text-white italic tracking-tighter">{stat.value}</span>
            <div className="flex items-center text-[10px] text-brand font-bold uppercase tracking-widest mt-1">
               <stat.icon className="w-3 h-3 mr-1" />
               <span>{t('market.stats_verified')}</span>
            </div>
          </div>
        ))}
      </section>

      {/* Subscription Plans */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div>
            <h2 className="text-2xl font-black tracking-tighter uppercase italic">{t('market.plans_title')}</h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">{t('market.plans_subtitle')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {SUBSCRIPTION_PLANS.filter(p => p.id !== 'lifetime').map((plan) => (
            <div
              key={plan.id}
              onClick={() => handlePlanClick(plan)}
              className={cn(
                "p-5 sm:p-6 rounded-3xl flex flex-col justify-between min-h-[14rem] sm:h-56 transition-all group relative overflow-hidden cursor-pointer",
                plan.id === '6_months' 
                  ? "bg-brand/10 border-2 border-brand shadow-2xl shadow-brand/20" 
                  : "bg-slate-900/40 border border-white/5 hover:border-brand/40"
              )}
            >
              {plan.id === '6_months' && (
                <div className="absolute top-0 left-0 bg-brand text-black text-[10px] font-black px-4 py-1 uppercase tracking-widest rounded-br-xl">{t('market.plan_popular')}</div>
              )}
              <div className="flex justify-between items-start mt-2">
                <div>
                  <h4 className="font-black italic uppercase tracking-tighter text-slate-300">{t(plan.nameKey)}</h4>
                  <p className="text-2xl sm:text-3xl font-black text-brand tracking-tighter mt-1">{formatCurrency(plan.price)}</p>
                </div>
                <div className="p-2 bg-slate-800 rounded-lg text-slate-400 group-hover:text-brand transition-colors">
                  <Zap className="w-5 h-5" />
                </div>
              </div>

              <ul className="space-y-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest py-3 sm:py-4">
                <li className="flex items-center space-x-2">
                  <div className="w-1 h-1 bg-brand rounded-full"></div>
                  <span>Full DB Access</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1 h-1 bg-brand rounded-full"></div>
                  <span>Advanced Filters</span>
                </li>
              </ul>

              <button className={cn(
                "w-full py-2.5 sm:py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all shadow-lg",
                plan.id === '6_months' 
                  ? "bg-brand text-black" 
                  : "bg-white text-black hover:bg-brand"
              )}>
                {t('market.purchase_now')}
              </button>
            </div>
          ))}
          
          {/* Lifetime Contact */}
          <a 
            href="#whatsapp-fab" 
            className="p-5 sm:p-6 rounded-3xl border border-white/10 bg-slate-900/40 flex flex-col justify-between min-h-[14rem] sm:h-56 hover:bg-slate-800/60 transition-all border-dashed"
          >
            <div>
              <h3 className="font-black text-xl sm:text-2xl uppercase italic tracking-tighter text-white">{t('market.lifetime_title')}</h3>
              <p className="text-brand text-[10px] font-bold uppercase tracking-widest mt-1.5 sm:mt-2">{t('market.lifetime_badge')}</p>
              <p className="text-slate-500 text-[10px] mt-3 sm:mt-4 font-bold uppercase leading-relaxed">{t('market.lifetime_desc')}</p>
            </div>
            <div className="w-full py-2.5 sm:py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl border border-white/20 text-white flex items-center justify-center mt-4">
              {t('market.contact_team')}
            </div>
          </a>
        </div>
      </section>

      {/* Market Preview */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold tracking-tighter">{t('market.explorer_title')}</h2>
          <div className="relative group max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-brand transition-colors" />
            <input 
              type="text"
              placeholder="Search by state, name or industry..."
              className="w-full bg-neutral-900/50 border border-white/5 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-brand/40 focus:ring-1 focus:ring-brand/40 transition-all text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
          {['all', 'Real Estate', 'Tech', 'Healthcare', 'Finance', 'E-commerce'].map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={cn(
                "px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border transition-all whitespace-nowrap",
                activeFilter === f 
                  ? "bg-brand text-black border-brand" 
                  : "bg-white/5 text-neutral-500 border-white/5 hover:border-white/20"
              )}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="glass rounded-3xl border-white/5 p-4 overflow-hidden">
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-left text-sm min-w-[500px]">
              <thead className="text-[10px] text-neutral-500 uppercase tracking-widest border-b border-white/5">
                <tr>
                  <th className="pb-4 px-4 font-bold">Name</th>
                  <th className="pb-4 px-4 font-bold">Industry</th>
                  <th className="pb-4 px-4 font-bold">Location</th>
                  <th className="pb-4 px-4 font-bold">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="group hover:bg-white/[0.02] transition-colors blur-[2px] select-none cursor-not-allowed">
                    <td className="py-4 px-4 font-medium text-neutral-300">*********</td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-1 bg-white/5 rounded text-[10px] font-bold uppercase">Locked</span>
                    </td>
                    <td className="py-4 px-4 flex items-center space-x-1 text-neutral-500">
                      <MapPin className="w-3 h-3" />
                      <span>USA</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-xs font-mono text-brand opacity-50">B2B</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-8 flex flex-col items-center text-center p-8 border-t border-white/5 bg-brand/5 select-none">
            <ShieldCheck className="w-12 h-12 text-brand mb-4" />
            <h3 className="text-xl font-bold tracking-tight">{t('market.locked_title')}</h3>
            <p className="text-neutral-500 max-w-sm mt-2 text-sm">{t('market.locked_desc')}</p>
            <button 
              onClick={() => window.scrollTo({ top: 400, behavior: 'smooth' })}
              className="mt-6 text-brand font-black uppercase text-xs tracking-widest hover:underline"
            >
              {t('market.go_to_plans')}
            </button>
          </div>
        </div>
      </section>

      {/* Future Works Section */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-brand/5 blur-[120px] rounded-full pointer-events-none opacity-30"></div>
        
        <div className="relative space-y-12">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center space-x-2 px-4 py-1 bg-slate-900 border border-white/5 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Roadmap 2024-2025</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase leading-none">
              Engineering The <span className="text-brand">Future</span>
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-xs sm:text-sm font-bold uppercase tracking-widest leading-relaxed">
              We are scaling our ecosystem with unprecedented data depth, AI-driven intelligence, and global coverage. The million-dollar lead infrastructure is arriving.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
            {[
              {
                title: "Global Data Expansion",
                desc: "Scaling beyond borders. Intensive regional datasets for EU, Southeast Asia, and MEA markets are currently in the final ingestion phase.",
                icon: MapPin,
                color: "brand",
                illustration: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=300&h=200&auto=format&fit=crop"
              },
              {
                title: "AI Predictive Scoring",
                desc: "Proprietary machine learning models to predict lead conversion probability based on historical intent data and digital footprint analysis.",
                icon: Zap,
                color: "blue-500",
                illustration: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=300&h=200&auto=format&fit=crop"
              },
              {
                title: "Hyper-Local Datasets",
                desc: "Drill down into ZIP codes and neighborhoods. We're implementing city-level targeting for the most granular marketing campaigns possible.",
                icon: MapPin,
                color: "emerald-500",
                illustration: "https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?q=80&w=300&h=200&auto=format&fit=crop"
              },
              {
                title: "Deep-Web Extraction",
                desc: "Advanced scraping protocols to reach hidden industry directories and niche professional networks that standard tools miss.",
                icon: Search,
                color: "orange-500",
                illustration: "https://images.unsplash.com/photo-1558486012-817176f84c6d?q=80&w=300&h=200&auto=format&fit=crop"
              },
              {
                title: "Unified CRM Bridge",
                desc: "Seamless, one-click synchronization with Salesforce, HubSpot, and Pipedrive. Real-time data enrichment for your existing leads.",
                icon: Briefcase,
                color: "indigo-500",
                illustration: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=300&h=200&auto=format&fit=crop"
              },
              {
                title: "Live Verification Layer",
                desc: "No more bounce rates. Every lead will pass through a secondary real-time verification at the moment of download.",
                icon: ShieldCheck,
                color: "rose-500",
                illustration: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=300&h=200&auto=format&fit=crop"
              }
            ].map((work, i) => (
              <div 
                key={i}
                className="group relative bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-8 overflow-hidden hover:border-brand/30 transition-all duration-500 hover:shadow-2xl hover:shadow-brand/5"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-brand/10 transition-all"></div>
                
                <div className="relative z-10 space-y-6">
                  <div className={`w-14 h-14 bg-slate-950 border border-white/5 rounded-2xl flex items-center justify-center text-white group-hover:text-brand transition-colors`}>
                    <work.icon className="w-7 h-7" />
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-xl font-black italic uppercase tracking-tighter text-white group-hover:translate-x-1 transition-transform">{work.title}</h3>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                      {work.desc}
                    </p>
                  </div>

                  <div className="pt-4 overflow-hidden rounded-2xl opacity-40 group-hover:opacity-80 transition-opacity grayscale group-hover:grayscale-0">
                    <img 
                      src={work.illustration} 
                      alt={work.title}
                      className="w-full h-24 object-cover scale-110 group-hover:scale-100 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-slate-950 border border-white/5 rounded-[3rem] p-8 md:p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-brand/5 opacity-50 blur-[80px]"></div>
            <div className="relative z-10 space-y-6">
              <h3 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter">Stay Connected With Innovation</h3>
              <p className="text-slate-400 text-xs sm:text-sm font-bold uppercase tracking-widest max-w-xl mx-auto">
                Our roadmap is driven by user feedback. Want a specific feature? Our engineering team is taking the lead.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <button className="px-10 py-5 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-brand transition-all w-full sm:w-auto">
                  Subscribe To Updates
                </button>
                <button className="px-10 py-5 bg-slate-900 border border-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-white/5 transition-all w-full sm:w-auto">
                  View Whitepaper
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {selectedPlan && (
        <CheckoutModal 
          plan={selectedPlan} 
          onClose={() => setSelectedPlan(null)} 
        />
      )}
    </div>
  );
}
