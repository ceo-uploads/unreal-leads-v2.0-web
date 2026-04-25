import React, { useState, useEffect } from 'react';
import { useAuth } from '@/src/components/FirebaseContext';
import { Outlet, NavLink, useSearchParams } from 'react-router-dom';
import { ref, onValue, update, set, push, remove, query as rtdbQuery, orderByChild, off, get, child } from 'firebase/database';
import { db } from '@/src/lib/firebase';
import { Transaction, UserProfile, SoftUser } from '@/src/types';
import { cn, formatDate, formatCurrency } from '@/src/lib/utils';
import { PackageStatus, SUBSCRIPTION_PLANS } from '@/src/constants/plans';
import { 
  Users, 
  CreditCard, 
  ShieldCheck, 
  UserPlus, 
  Package, 
  Search, 
  Check, 
  X, 
  Trash2,
  ExternalLink,
  Lock,
  BarChart2,
  TrendingUp,
  Activity,
  Key
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminView() {
  const { profile, user: authUser } = useAuth();
  const [searchParams] = useSearchParams();
  const showAdminSecret = searchParams.get('admin') === 'true';
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [softUsers, setSoftUsers] = useState<SoftUser[]>([]);
  
  const [activeTab, setActiveTab] = useState<'payments' | 'users' | 'soft_users' | 'stats'>('payments');
  const [passcode, setPasscode] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  
  // Software User Form
  const [softUsername, setSoftUsername] = useState('');
  const [softPassword, setSoftPassword] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [userSearchText, setUserSearchText] = useState('');
  const [isCreatingSoft, setIsCreatingSoft] = useState(false);

  // Restore Package State
  const [restoreUserSearch, setRestoreUserSearch] = useState('');
  const [selectedRestoreUser, setSelectedRestoreUser] = useState<UserProfile | null>(null);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<any | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  const checkPasscode = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === '366720') {
      setIsUnlocked(true);
    } else {
      alert('ACCESS DENIED');
    }
  };

  useEffect(() => {
    if (!isUnlocked) return;

    // Listen to Transactions
    const txRef = rtdbQuery(ref(db, 'transactions'), orderByChild('timestamp'));
    const unsubTx = onValue(txRef, (snap) => {
      const data = snap.val();
      if (data) {
        setTransactions(Object.values(data).sort((a: any, b: any) => b.timestamp - a.timestamp) as Transaction[]);
      } else {
        setTransactions([]);
      }
    });

    // Listen to Registered Users
    const usersRef = ref(db, 'users');
    const unsubUsers = onValue(usersRef, (snap) => {
      const data = snap.val();
      if (data) {
        const users = Object.values(data) as UserProfile[];
        setAllUsers(users.sort((a, b) => (a.displayName || '').localeCompare(b.displayName || '')));
      } else {
        setAllUsers([]);
      }
    });

    // Listen to Software Users
    const softRef = rtdbQuery(ref(db, 'softUsers'), orderByChild('createdAt'));
    const unsubSoft = onValue(softRef, (snap) => {
      const data = snap.val();
      if (data) {
        setSoftUsers(Object.values(data).sort((a: any, b: any) => b.createdAt - a.createdAt) as SoftUser[]);
      } else {
        setSoftUsers([]);
      }
    });

    return () => {
      off(txRef, 'value', unsubTx);
      off(usersRef, 'value', unsubUsers);
      off(softRef, 'value', unsubSoft);
    };
  }, [isUnlocked]);

  const isExpired = (deadline: number | 'lifetime') => {
    if (deadline === 'lifetime') return false;
    return Date.now() > deadline;
  };

  const approvePayment = async (trx: Transaction) => {
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === trx.planId);
    if (!plan) return;

    const activationDate = Date.now();
    const deadline = plan.durationDays === 'lifetime' 
      ? 'lifetime' 
      : activationDate + (plan.durationDays * 24 * 60 * 60 * 1000);

    const newPkg = {
      id: trx.id,
      planId: plan.id,
      planName: plan.id === 'lifetime' ? 'Enterprise Lifetime' : `Premium Access (${plan.durationDays} Days)`,
      amountPaid: trx.amount,
      activationDate,
      deadline,
      status: PackageStatus.ACTIVE
    };

    // Update user profile in RTDB
    const userPkgRef = push(ref(db, `users/${trx.userId}/purchaseHistory`));
    await set(userPkgRef, newPkg);
    
    await update(ref(db, `users/${trx.userId}`), {
      currentPackage: newPkg
    });

    // Update transaction status
    await update(ref(db, `transactions/${trx.id}`), { status: 'completed' });
    
    // Also update transaction status in user's profile if it exists there
    const userTrxRef = ref(db, `users/${trx.userId}/transactionHistory`);
    const userTrxSnap = await get(userTrxRef);
    const userTrxs = userTrxSnap.val();
    if (userTrxs) {
      const entryPath = Object.entries(userTrxs).find(([k, v]: [string, any]) => v.id === trx.id || v.trxId === trx.trxId)?.[0];
      if (entryPath) {
        await update(ref(db, `users/${trx.userId}/transactionHistory/${entryPath}`), { status: 'completed' });
      }
    }
  };

  const createSoftUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !softUsername || !softPassword) return;
    setIsCreatingSoft(true);

    try {
      const softRef = push(ref(db, 'softUsers'));
      const id = softRef.key || Date.now().toString();
      
      await set(softRef, {
        id,
        username: softUsername,
        password: softPassword,
        userId: selectedUser.uid,
        displayName: selectedUser.displayName || selectedUser.email,
        enrolledAt: selectedUser.currentPackage?.activationDate || Date.now(),
        deadline: selectedUser.currentPackage?.deadline || Date.now(),
        createdAt: Date.now(),
        status: 'Active'
      });

      setSoftUsername('');
      setSoftPassword('');
      setSelectedUser(null);
      setUserSearchText('');
      alert('Software User Created Successfully');
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreatingSoft(false);
    }
  };

  const deleteSoftUser = async (id: string) => {
    if (confirm('Delete this user access?')) {
      // We need to find the key. If ID was used as key, it's easy.
      // In createSoftUserSubmit we used push, so the key is the ID.
      await remove(ref(db, `softUsers/${id}`));
    }
  };

  const handleRestorePackage = async () => {
    if (!selectedRestoreUser || !selectedHistoryItem) return;
    setIsRestoring(true);

    try {
      const restoredPkg = {
        ...selectedHistoryItem,
        status: PackageStatus.ACTIVE,
        restoredAt: Date.now()
      };

      // Update current package
      await update(ref(db, `users/${selectedRestoreUser.uid}`), {
        currentPackage: restoredPkg
      });

      // Update in history list as well to reflect ACTIVE status
      // In RTDB history is an object, we need to find the key mapping to this package id
      const historyRef = ref(db, `users/${selectedRestoreUser.uid}/purchaseHistory`);
      const historySnap = await get(historyRef);
      const historyData = historySnap.val();
      
      if (historyData) {
        const itemKey = Object.entries(historyData).find(([_, val]: [string, any]) => val.id === selectedHistoryItem.id)?.[0];
        if (itemKey) {
          await update(ref(db, `users/${selectedRestoreUser.uid}/purchaseHistory/${itemKey}`), {
            status: PackageStatus.ACTIVE
          });
        }
      }

      alert(`Package ${restoredPkg.planName} restored for ${selectedRestoreUser.displayName}`);
      setSelectedRestoreUser(null);
      setSelectedHistoryItem(null);
      setRestoreUserSearch('');
    } catch (err) {
      console.error(err);
      alert('FAILED_TO_RESTORE');
    } finally {
      setIsRestoring(false);
    }
  };

  if (!profile?.isAdmin && !showAdminSecret) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <ShieldCheck className="w-20 h-20 text-red-500 mb-8 opacity-20" />
        <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">REDACTED NODE</h2>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-4 max-w-xs leading-relaxed">
          The requested resource is restricted to system-level entities.
        </p>
        <button onClick={() => window.location.href = '/'} className="mt-12 px-8 py-4 bg-slate-900 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all">
          Return to Public Network
        </button>
      </div>
    );
  }

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="bg-slate-900/40 border border-white/5 p-10 rounded-[2.5rem] text-center space-y-10 backdrop-blur-xl shadow-2xl relative overflow-hidden">
            <Lock className="w-12 h-12 text-brand mx-auto mb-4" />
            <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white text-center">GATEWAY</h2>
            <form onSubmit={checkPasscode} className="space-y-6">
              <input 
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-2xl py-5 px-4 text-center font-black tracking-[1em] text-brand focus:border-brand/40 outline-none text-xl lg:translate-x-1"
                placeholder="••••••"
                maxLength={6}
                autoFocus
              />
              <button type="submit" className="w-full bg-brand text-black font-black py-5 rounded-2xl hover:bg-brand-dark transition-all text-sm uppercase tracking-widest">
                UNPATCH NODE
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-8 pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900/40 p-8 rounded-[2rem] border border-white/5">
          <div>
            <h1 className="text-3xl font-black italic tracking-tighter uppercase text-brand">CONTROL PANEL</h1>
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.25em] mt-1">Management Infrastructure v2.1</p>
          </div>
          <button onClick={() => window.location.href = '/'} className="px-6 py-3 bg-slate-800 rounded-xl hover:bg-slate-700 text-[10px] uppercase font-black tracking-widest border border-white/5">
            Exit Portal
          </button>
        </div>

        {/* Navigation */}
        <div className="flex space-x-1 border-b border-white/5 overflow-x-auto scrollbar-hide">
          {[
            { id: 'payments', icon: CreditCard, label: 'Payments' },
            { id: 'users', icon: Users, label: 'User List' },
            { id: 'restore', icon: Package, label: 'Restore Package' },
            { id: 'soft_users', icon: UserPlus, label: 'Create Software Access' },
            { id: 'stats', icon: BarChart2, label: 'Overview' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "px-6 py-4 flex items-center space-x-2 border-b-2 transition-all text-[10px] font-black uppercase tracking-widest min-w-max",
                activeTab === tab.id ? "border-brand text-brand bg-brand/5" : "border-transparent text-slate-500 hover:text-slate-300"
              )}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-8">
          {activeTab === 'payments' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {transactions.filter(t => t.status === 'pending').map(tx => (
                <div key={tx.id} className="bg-slate-900/40 border border-white/5 p-6 rounded-3xl space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[9px] font-black text-brand uppercase tracking-widest mb-1">New Order Request</p>
                      <h3 className="text-xl font-black italic text-white uppercase">{tx.email}</h3>
                    </div>
                    <span className="bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-yellow-500/20">Pending</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/5">
                    <div>
                      <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest">Transaction ID</p>
                      <p className="text-xs font-mono text-slate-300 mt-1">{tx.trxId}</p>
                    </div>
                    <div>
                      <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest">Amount</p>
                      <p className="text-xs font-black text-brand mt-1">{formatCurrency(tx.amount)}</p>
                    </div>
                  </div>
                  <div className="flex space-x-4">
                    <button onClick={() => approvePayment(tx)} className="flex-1 bg-brand text-black py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-dark transition-all">Approve Order</button>
                    <button onClick={() => update(ref(db, `transactions/${tx.id}`), { status: 'failed' })} className="px-6 py-4 bg-slate-800 rounded-xl font-black text-[10px] uppercase tracking-widest text-red-500 hover:bg-red-500/10 transition-all border border-red-500/20">Reject</button>
                  </div>
                </div>
              ))}
              {transactions.filter(t => t.status === 'pending').length === 0 && (
                <div className="col-span-full py-20 text-center text-slate-600 font-black uppercase tracking-[0.3em] italic">No Pending Orders</div>
              )}
            </div>
          )}

          {activeTab === 'users' && (
            <div className="bg-slate-900/40 border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto scrollbar-hide">
                <table className="w-full text-left text-[10px] min-w-[900px]">
                  <thead className="bg-black/40 text-slate-500 font-black uppercase tracking-widest border-b border-white/5">
                    <tr>
                      <th className="p-6">User Data</th>
                      <th className="p-6">Join Date</th>
                      <th className="p-6">Last Purchase</th>
                      <th className="p-6">Timeline</th>
                      <th className="p-6 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {allUsers.map(u => {
                      const isActive = u.currentPackage && !isExpired(u.currentPackage.deadline);
                      return (
                        <tr key={u.uid} className="hover:bg-brand/5 transition-colors group">
                          <td className="p-6">
                            <p className="text-white font-black uppercase italic text-sm">{u.displayName}</p>
                            <p className="text-slate-500 text-[8px] font-mono tracking-tighter mt-1">{u.email}</p>
                          </td>
                          <td className="p-6 text-slate-500 font-bold uppercase">{u.createdAt ? formatDate(u.createdAt) : 'N/A'}</td>
                          <td className="p-6">
                            {u.currentPackage ? (
                              <div>
                                <p className="text-brand font-black italic uppercase text-[11px]">{u.currentPackage.planName}</p>
                                <p className="text-slate-600 font-bold">{formatCurrency(u.currentPackage.amountPaid)}</p>
                              </div>
                            ) : <span className="text-slate-700 italic">No Purchases</span>}
                          </td>
                          <td className="p-6 font-mono">
                            {u.currentPackage ? (
                              <div className="flex items-center space-x-2">
                                <span className="text-slate-500">{formatDate(u.currentPackage.activationDate)}</span>
                                <span className="text-slate-800">{'>>'}</span>
                                <span className={isActive ? "text-white" : "text-red-500"}>
                                  {u.currentPackage.deadline === 'lifetime' ? '∞ LIFETIME' : formatDate(u.currentPackage.deadline as number)}
                                </span>
                              </div>
                            ) : '--'}
                          </td>
                          <td className="p-6 text-right">
                             <span className={cn(
                               "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                               isActive ? "bg-brand/10 text-brand border-brand/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                             )}>
                               {isActive ? 'Authorized' : 'Expired'}
                             </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'restore' && (
            <div className="max-w-2xl mx-auto space-y-8">
              <div className="bg-slate-900/40 border border-white/5 p-8 rounded-[2.5rem] space-y-8 backdrop-blur-xl">
                <div className="flex items-center space-x-4 mb-2">
                  <div className="w-12 h-12 bg-brand/10 rounded-2xl flex items-center justify-center text-brand">
                    <Package className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">License Restoration</h3>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Reactivate closed or expired licenses</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Step 1: User Selection */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">01_IDENTIFY_USER</label>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input 
                        type="text" 
                        placeholder="Search Identity (Email/Name)..." 
                        value={restoreUserSearch}
                        onChange={(e) => setRestoreUserSearch(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-2xl py-5 pl-12 pr-4 outline-none focus:border-brand/40 text-[11px] font-black uppercase tracking-widest text-white shadow-inner"
                      />
                      {restoreUserSearch && !selectedRestoreUser && (
                        <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-slate-900 border border-white/20 rounded-2xl overflow-hidden shadow-2xl max-h-60 overflow-y-auto backdrop-blur-2xl">
                          {allUsers.filter(u => u.email.toLowerCase().includes(restoreUserSearch.toLowerCase()) || u.displayName.toLowerCase().includes(restoreUserSearch.toLowerCase())).map(u => (
                            <button 
                              key={u.uid}
                              onClick={() => {
                                setSelectedRestoreUser(u);
                                setRestoreUserSearch(u.displayName);
                              }}
                              className="w-full p-5 text-left hover:bg-brand/10 border-b border-white/5 last:border-0 transition-all flex items-center justify-between group"
                            >
                              <div>
                                <p className="text-xs font-black text-white uppercase italic group-hover:text-brand transition-colors">{u.displayName}</p>
                                <p className="text-[8px] text-slate-500 font-mono mt-1 uppercase">{u.email}</p>
                              </div>
                              <ExternalLink className="w-3 h-3 text-slate-700 group-hover:text-brand transition-all" />
                            </button>
                          ))}
                          {allUsers.filter(u => u.email.toLowerCase().includes(restoreUserSearch.toLowerCase()) || u.displayName.toLowerCase().includes(restoreUserSearch.toLowerCase())).length === 0 && (
                            <p className="p-6 text-center text-[10px] font-black text-slate-600 uppercase italic">Identity Not Found</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedRestoreUser && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6 pt-6 border-t border-white/5"
                    >
                      {/* Step 2: History Selection */}
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">02_SELECT_TARGET_PACKAGE</label>
                        <div className="space-y-3">
                          {Object.values(selectedRestoreUser.purchaseHistory || {}).length > 0 ? (
                            Object.values(selectedRestoreUser.purchaseHistory as any).map((item: any) => (
                              <button
                                key={item.id}
                                onClick={() => setSelectedHistoryItem(item)}
                                className={cn(
                                  "w-full p-4 rounded-2xl border transition-all text-left group flex items-center justify-between",
                                  selectedHistoryItem?.id === item.id 
                                    ? "bg-brand border-brand text-black shadow-[0_0_20px_rgba(255,255,255,0.1)]" 
                                    : "bg-slate-950 border-white/10 text-slate-400 hover:border-white/20 hover:bg-slate-900"
                                )}
                              >
                                <div className="flex items-center space-x-4">
                                  <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                                    selectedHistoryItem?.id === item.id ? "bg-black/10 text-black" : "bg-white/5 text-slate-600"
                                  )}>
                                    <Package className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <p className={cn("text-[11px] font-black italic uppercase tracking-tight flex items-center", selectedHistoryItem?.id === item.id ? "text-black" : "text-white")}>
                                      {item.planName}
                                      {selectedRestoreUser.currentPackage?.id === item.id && (
                                        <span className={cn(
                                          "ml-2 px-1.5 py-0.5 rounded text-[6px] font-black uppercase tracking-widest border",
                                          selectedHistoryItem?.id === item.id ? "bg-black text-brand border-brand/50" : "bg-brand/10 text-brand border-brand/20"
                                        )}>
                                          CURRENT_ACTIVE
                                        </span>
                                      )}
                                    </p>
                                    <div className={cn("flex space-x-2 text-[8px] font-bold mt-0.5", selectedHistoryItem?.id === item.id ? "text-black/60" : "text-slate-500")}>
                                      <span>{formatDate(item.activationDate)}</span>
                                      <span>•</span>
                                      <span className={cn(item.status === 'ACTIVE' ? "text-green-500" : "text-red-500", selectedHistoryItem?.id === item.id && "text-black font-black")}>
                                        {item.status}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                {selectedHistoryItem?.id === item.id && <Check className="w-5 h-5" />}
                              </button>
                            ))
                          ) : (
                            <div className="bg-red-500/5 border border-red-500/10 p-6 rounded-2xl text-center">
                              <p className="text-[10px] font-black text-red-500/60 uppercase tracking-widest italic">User Has No Purchase Records</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Step 3: Confirmation */}
                      {selectedHistoryItem && (
                        <div className="pt-6 border-t border-white/5">
                          <div className="bg-brand/5 border border-brand/20 p-6 rounded-3xl mb-6 flex items-start space-x-4">
                            <Activity className="w-5 h-5 text-brand shrink-0 mt-1" />
                            <div className="space-y-1">
                              <p className="text-[10px] font-black text-brand uppercase tracking-[0.2em]">OPERATIONAL_IMPACT</p>
                              <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase">
                                Restoring <span className="text-white">"{selectedHistoryItem.planName}"</span> will force status <span className="text-white">"ACTIVE"</span> 
                                and set as current license for {selectedRestoreUser.displayName}.
                              </p>
                            </div>
                          </div>
                          
                          <button 
                            onClick={handleRestorePackage}
                            disabled={isRestoring}
                            className="w-full bg-white text-black py-5 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.3em] hover:bg-brand transition-all shadow-xl shadow-brand/10 disabled:opacity-20"
                          >
                            {isRestoring ? 'PATCHING_DATABASE...' : 'CONFIRM_RESTORATION'}
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'soft_users' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-slate-900/40 border border-white/5 p-8 rounded-[2rem] space-y-6 sticky top-8">
                  <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">Create Software User</h3>
                  
                  {/* User Search & Select */}
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input 
                        type="text" 
                        placeholder="Search Identity..." 
                        value={userSearchText}
                        onChange={(e) => setUserSearchText(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-brand/40 text-[10px] font-black uppercase tracking-widest text-white"
                      />
                      {userSearchText && !selectedUser && (
                        <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-slate-900 border border-white/10 rounded-xl overflow-hidden shadow-2xl max-h-60 overflow-y-auto">
                          {allUsers.filter(u => u.email.toLowerCase().includes(userSearchText.toLowerCase()) || u.displayName.toLowerCase().includes(userSearchText.toLowerCase())).map(u => (
                            <button 
                              key={u.uid}
                              onClick={() => {
                                setSelectedUser(u);
                                setUserSearchText(u.displayName);
                              }}
                              className="w-full p-4 text-left hover:bg-brand/10 border-b border-white/5 last:border-0 transition-colors"
                            >
                              <p className="text-[10px] font-black text-white uppercase italic">{u.displayName}</p>
                              <p className="text-[8px] text-slate-500 font-mono">{u.email}</p>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {selectedUser && (
                      <div className="p-4 bg-brand/5 border border-brand/20 rounded-2xl relative">
                        <button onClick={() => {setSelectedUser(null); setUserSearchText('');}} className="absolute top-2 right-2 text-slate-600 hover:text-white transition-all">
                          <X className="w-4 h-4" />
                        </button>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Selected Partner</p>
                        <p className="text-sm font-black text-white italic truncate">{selectedUser.displayName}</p>
                        {selectedUser.currentPackage ? (
                          <div className="mt-3 grid grid-cols-2 gap-2 text-[8px] font-black uppercase text-brand/60">
                            <div>
                               <p className="text-slate-600">Enrolled</p>
                               <p>{formatDate(selectedUser.currentPackage.activationDate)}</p>
                            </div>
                            <div>
                               <p className="text-slate-600">End Date</p>
                               <p>{selectedUser.currentPackage.deadline === 'lifetime' ? 'Forever' : formatDate(selectedUser.currentPackage.deadline as number)}</p>
                            </div>
                          </div>
                        ) : (
                          <p className="mt-3 text-[8px] font-black text-red-500 uppercase">Warning: No active license detected</p>
                        )}
                      </div>
                    )}

                    <form onSubmit={createSoftUserSubmit} className="space-y-4 pt-4 border-t border-white/5">
                      <input 
                        type="text" 
                        placeholder="Software Username" 
                        value={softUsername}
                        onChange={(e) => setSoftUsername(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl py-4 px-4 outline-none focus:border-brand/40 text-[10px] font-black uppercase tracking-widest text-white"
                        required
                      />
                      <input 
                        type="password" 
                        placeholder="System Password" 
                        value={softPassword}
                        onChange={(e) => setSoftPassword(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl py-4 px-4 outline-none focus:border-brand/40 text-[10px] font-black uppercase tracking-widest text-white"
                        required
                      />
                      <button 
                        type="submit" 
                        disabled={!selectedUser || isCreatingSoft}
                        className="w-full bg-white text-black py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-brand transition-all disabled:opacity-20"
                      >
                        {isCreatingSoft ? 'Creating...' : 'Finalize Software Access'}
                      </button>
                    </form>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2">
                <div className="bg-slate-900/40 border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                  <div className="overflow-x-auto scrollbar-hide">
                    <table className="w-full text-left text-[10px] min-w-[700px]">
                      <thead className="bg-black/40 text-slate-500 font-black uppercase tracking-widest border-b border-white/5">
                        <tr>
                          <th className="p-6">Software Creds</th>
                          <th className="p-6">Linked To</th>
                          <th className="p-6">Timeline</th>
                          <th className="p-6 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {softUsers.map(su => {
                          const active = !isExpired(su.deadline || Date.now());
                          return (
                            <tr key={su.id} className="hover:bg-brand/5 transition-colors group">
                              <td className="p-6">
                                <p className="text-white font-black italic uppercase text-sm">@{su.username}</p>
                                <p className="text-slate-500 font-mono mt-1 select-all cursor-copy">PASS: {su.password}</p>
                              </td>
                              <td className="p-6">
                                <p className="text-slate-300 font-black uppercase italic">{su.displayName}</p>
                                <p className="text-slate-600 text-[8px] font-mono uppercase mt-1">ID: {su.userId?.slice(0, 8)}</p>
                              </td>
                              <td className="p-6 font-mono">
                                <div className="space-y-1">
                                  <p className="text-slate-500">FROM: {formatDate(su.enrolledAt as number)}</p>
                                  <p className={active ? "text-brand" : "text-red-500"}>
                                    DEADLINE: {su.deadline === 'lifetime' ? 'FOREVER' : formatDate(su.deadline as number)}
                                  </p>
                                </div>
                              </td>
                              <td className="p-6 text-right">
                                <div className="flex items-center justify-end space-x-4">
                                  <span className={cn(
                                    "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                    active ? "bg-brand/10 text-brand border-brand/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                                  )}>
                                    {active ? 'Active' : 'Expired'}
                                  </span>
                                  <button onClick={() => deleteSoftUser(su.id)} className="text-slate-600 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                        {softUsers.length === 0 && (
                          <tr><td colSpan={4} className="p-20 text-center text-slate-700 font-black uppercase italic tracking-widest">No Issued Licenses</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Total Sales', value: formatCurrency(transactions.filter(t => t.status === 'completed').reduce((a, b) => a + b.amount, 0)), icon: TrendingUp },
                { label: 'Registered Network', value: allUsers.length, icon: Users },
                { label: 'Software Nodes', value: softUsers.length, icon: Key },
                { label: 'Active Licenses', value: allUsers.filter(u => u.currentPackage && !isExpired(u.currentPackage.deadline)).length, icon: ShieldCheck }
              ].map((s, i) => (
                <div key={i} className="bg-slate-900/40 border border-white/5 p-8 rounded-3xl group hover:border-brand/40 transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{s.label}</p>
                    <s.icon className="w-4 h-4 text-brand/40 group-hover:text-brand transition-colors" />
                  </div>
                  <p className="text-3xl font-black text-white italic tracking-tighter leading-none">{s.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
