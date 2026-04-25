import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PAYMENT_METHODS, SubscriptionPlan, PaymentMethod } from '@/src/constants/plans';
import { cn, formatCurrency } from '@/src/lib/utils';
import { X, CheckCircle2, QrCode, CreditCard, Send, Wallet, Smartphone, ShieldCheck, Coins, Copy, Check } from 'lucide-react';
import { ref, push, set, update } from 'firebase/database';
import { db } from '@/src/lib/firebase';
import { useAuth } from '@/src/components/FirebaseContext';
import { motion, AnimatePresence } from 'motion/react';

interface CheckoutModalProps {
  plan: SubscriptionPlan;
  onClose: () => void;
}

const MethodIcons: Record<string, any> = {
  Wallet,
  ShieldCheck,
  Smartphone,
  Coins
};

export default function CheckoutModal({ plan, onClose }: CheckoutModalProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [trxId, setTrxId] = useState('');
  const [senderAccount, setSenderAccount] = useState('');
  const [whatsApp, setWhatsApp] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  const MERCHANT_DETAILS: Record<string, { account: string; label: string; qr?: boolean }> = {
    [PaymentMethod.BKASH]: { account: '01316366720', label: 'bKash Merchant (Send Money)' },
    [PaymentMethod.NAGAD]: { account: '01316366720', label: 'Nagad Merchant (Send Money)' },
    [PaymentMethod.NSAVE]: { account: '@rayhan_md4', label: 'Nsave Ntag', qr: true },
    [PaymentMethod.BINANCE]: { account: 'binance_address_here', label: 'Binance Address', qr: true },
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedMethod) return;

    setIsProcessing(true);
    try {
      const transactionData = {
        userId: user.uid,
        amount: plan.price,
        method: selectedMethod,
        trxId,
        senderAccount,
        status: 'pending',
        timestamp: Date.now(),
        planId: plan.id,
        whatsApp,
        userEmail: email
      };

      // Push to main transactions log
      const newTransactionRef = push(ref(db, 'transactions'));
      const transactionId = newTransactionRef.key || Date.now().toString();
      
      await set(newTransactionRef, {
        ...transactionData,
        id: transactionId
      });
      
      // Also save to user's profile transaction history
      const userTrxRef = push(ref(db, `users/${user.uid}/transactionHistory`));
      await set(userTrxRef, {
        ...transactionData,
        id: transactionId
      });

      // Update user metadata
      await update(ref(db, `users/${user.uid}`), {
        whatsApp
      });

      setIsSuccess(true);
    } catch (error) {
      console.error("Payment error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-slate-900/60 border border-white/5 w-full max-w-lg rounded-[2rem] overflow-hidden relative shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
      >
        <button onClick={onClose} className="absolute right-6 top-6 p-2 text-slate-500 hover:text-white transition-colors z-10 bg-slate-950/50 rounded-full">
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-10 max-h-[90vh] overflow-y-auto scrollbar-hide">
          {isSuccess ? (
            <div className="text-center py-8 sm:py-12 space-y-6 sm:space-y-8">
              <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-brand/10 text-brand rounded-3xl border border-brand/20 shadow-xl shadow-brand/10">
                <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tighter uppercase italic text-white leading-none">ORDER QUEUED</h2>
                <p className="text-slate-500 mt-3 sm:mt-4 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed">System administrators will verify your transaction against the network ledger shortly.</p>
              </div>
              <button 
                onClick={onClose}
                className="bg-white text-black font-black px-8 py-3.5 sm:px-10 sm:py-4 rounded-xl hover:bg-brand transition-all text-[10px] sm:text-xs uppercase tracking-[0.2em]"
              >
                RETURN TO DASHBOARD
              </button>
            </div>
          ) : (
            <form onSubmit={handlePayment} className="space-y-6 sm:space-y-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tighter uppercase italic text-white leading-none">Secure Payment</h2>
                <div className="mt-4 sm:mt-6 flex items-center justify-between p-4 sm:p-6 bg-slate-950/50 border border-white/5 rounded-2xl shadow-inner relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 blur-3xl rounded-full"></div>
                  <div className="relative z-10">
                    <p className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Package Selection</p>
                    <span className="text-xs sm:text-sm font-black text-white italic uppercase tracking-tighter">{t(plan.nameKey)}</span>
                  </div>
                  <span className="text-xl sm:text-2xl font-black text-brand italic tracking-tighter relative z-10">{formatCurrency(plan.price)}</span>
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <label className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">ALLOCATION CHANNEL</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                  {PAYMENT_METHODS.map((method) => {
                    const Icon = MethodIcons[method.icon] || Wallet;
                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setSelectedMethod(method.id as PaymentMethod)}
                        className={cn(
                          "flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl border transition-all space-y-2 sm:space-y-3 group relative overflow-hidden",
                          selectedMethod === method.id 
                            ? "bg-brand/10 border-brand shadow-lg shadow-brand/10" 
                            : "bg-slate-950 border-white/5 grayscale hover:grayscale-0 hover:border-white/20"
                        )}
                      >
                        <Icon className={cn("w-5 h-5 sm:w-6 sm:h-6 relative z-10", selectedMethod === method.id ? "text-brand" : "text-slate-500 group-hover:text-slate-300")} />
                        <span className={cn("text-[8px] sm:text-[9px] font-black uppercase tracking-widest relative z-10", selectedMethod === method.id ? "text-brand" : "text-slate-500")}>
                          {t(method.nameKey).split(' ')[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedMethod && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="space-y-4 sm:space-y-6"
                >
                  <div className="p-4 sm:p-6 bg-slate-950/80 border border-brand/20 rounded-2xl space-y-4 relative overflow-hidden">
                    <div className="absolute inset-0 bg-brand/5 opacity-40 pointer-events-none"></div>
                    
                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <div className="p-2 sm:p-3 bg-brand/10 rounded-xl">
                          <QrCode className="w-5 h-5 sm:w-6 sm:h-6 text-brand" />
                        </div>
                        <div>
                          <p className="text-[8px] sm:text-[9px] font-black uppercase text-slate-500 tracking-widest leading-none mb-1">
                            {MERCHANT_DETAILS[selectedMethod]?.label || 'Merchant Account'}
                          </p>
                          <p className="text-sm sm:text-base font-black text-white italic tracking-widest break-all">
                            {MERCHANT_DETAILS[selectedMethod]?.account || 'N/A'}
                          </p>
                        </div>
                      </div>
                      <button 
                        type="button"
                        onClick={() => handleCopy(MERCHANT_DETAILS[selectedMethod]?.account || '')}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-brand"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>

                    <div className="relative z-10 space-y-2 bg-black/40 p-3 sm:p-4 rounded-xl border border-white/5">
                      <div className="flex items-start space-x-2 sm:space-x-3">
                        <ShieldCheck className="w-3.5 h-3.5 text-brand shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          {(selectedMethod === PaymentMethod.BKASH || selectedMethod === PaymentMethod.NAGAD) && (
                            <p className="text-[8px] sm:text-[9px] text-brand font-black uppercase tracking-widest leading-none mb-1">
                              REQUIRED: SEND MONEY ONLY
                            </p>
                          )}
                          <p className="text-[8px] sm:text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                            {selectedMethod === PaymentMethod.NSAVE || selectedMethod === PaymentMethod.BINANCE 
                              ? `Copy the merchant account and send exactly ${formatCurrency(plan.price)}`
                              : "Please select 'Send Money' for bKash/Nagad payments. And give correct Transaction ID."}
                          </p>
                          <p className="text-[8px] sm:text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed italic">
                            Enter Your WhatsApp Number For Delivery, and check your email after payment completion.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[8px] sm:text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">
                        {selectedMethod === PaymentMethod.NSAVE ? 'Your Ntag' : 
                         selectedMethod === PaymentMethod.BINANCE ? 'Your Binance ID/Email' : 
                         'Your Account Number'}
                      </label>
                      <input 
                        type="text"
                        value={senderAccount}
                        onChange={(e) => setSenderAccount(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl py-3.5 sm:py-4 px-4 focus:border-brand/40 outline-none transition-all text-[10px] sm:text-xs font-black uppercase tracking-widest text-white shadow-inner"
                        placeholder={selectedMethod === PaymentMethod.NSAVE ? '@your_ntag' : 'Enter details...'}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-1">
                        <label className="text-[8px] sm:text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">WhatsApp Delivery</label>
                        <input 
                          type="tel"
                          value={whatsApp}
                          onChange={(e) => setWhatsApp(e.target.value)}
                          className="w-full bg-slate-950 border border-white/10 rounded-xl py-3.5 sm:py-4 px-4 focus:border-brand/40 outline-none transition-all text-[10px] sm:text-xs font-black uppercase tracking-widest text-white shadow-inner"
                          placeholder="+880 1..."
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] sm:text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">TRXID</label>
                        <input 
                          type="text"
                          value={trxId}
                          onChange={(e) => setTrxId(e.target.value)}
                          className="w-full bg-slate-950 border border-white/10 rounded-xl py-3.5 sm:py-4 px-4 focus:border-brand/40 outline-none transition-all text-[10px] sm:text-xs font-black uppercase tracking-widest text-brand shadow-inner"
                          placeholder="Transaction Number"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              <button 
                type="submit"
                disabled={!selectedMethod || isProcessing}
                className={cn(
                  "w-full py-4 sm:py-5 rounded-2xl font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center space-x-2 text-[10px] sm:text-xs shadow-2xl shadow-black/20",
                  selectedMethod && !isProcessing 
                    ? "bg-brand text-black hover:bg-brand-dark active:scale-[0.98]" 
                    : "bg-slate-800 text-slate-600 cursor-not-allowed border border-white/5"
                )}
              >
                {isProcessing ? (
                  <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-black/30 border-t-black animate-spin rounded-full"></div>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>INITIALIZE ORDER</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
