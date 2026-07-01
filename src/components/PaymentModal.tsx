import React, { useState } from 'react';
import { CreditCard, ShieldCheck, Check, Sparkles, X, Landmark, RefreshCw } from 'lucide-react';
import { User } from '../types';

interface PaymentModalProps {
  user: User;
  onPaymentSuccess: () => void;
  onClose: () => void;
  brandName?: string;
  proPrice?: string;
  paystackLink?: string;
  flutterwaveLink?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
}

export function PaymentModal({ 
  user, 
  onPaymentSuccess, 
  onClose, 
  brandName = 'LIVINGSTONEEDU', 
  proPrice = '₦5,000',
  paystackLink = '',
  flutterwaveLink = '',
  bankName = 'WEMA Bank (Paystack Secure)',
  bankAccountNumber = '9038472910',
  bankAccountName = 'LIVINGSTONEEDU PREMIUM PORTAL'
}: PaymentModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<'weekly' | 'monthly' | 'term' | 'annual'>('term');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'transfer'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [transferConfirmed, setTransferConfirmed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorInput, setErrorInput] = useState('');

  interface PlanOption {
    id: 'weekly' | 'monthly' | 'term' | 'annual';
    name: string;
    price: string;
    period: string;
    desc: string;
    isPopular?: boolean;
  }

  const plans: PlanOption[] = [
    { id: 'weekly', name: 'Weekly Plan', price: '₦500', period: 'week', desc: 'Continuous weekly learning access' },
    { id: 'monthly', name: 'Monthly Plan', price: '₦2,000', period: 'month', desc: 'Popular month-to-month booster' },
    { id: 'term', name: 'Term Plan', price: '₦5,000', period: 'term', desc: 'Aligned with Nigerian school terms', isPopular: true },
    { id: 'annual', name: 'Annual Plan', price: '₦15,000', period: 'year', desc: 'Maximum discount full year prep' }
  ];

  const activePlanObj = plans.find(p => p.id === selectedPlan)!;

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorInput('');

    if (paymentMethod === 'card') {
      if (cardNumber.replace(/\s/g, '').length < 16) {
        setErrorInput('Kindly input a valid 16-digit debit/credit card number.');
        return;
      }
      if (!cardExpiry.includes('/')) {
        setErrorInput('Kindly input expiration date in MM/YY format.');
        return;
      }
      if (cardCvv.length < 3) {
        setErrorInput('CVV is required (3 digits behind card).');
        return;
      }
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onPaymentSuccess();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[200] animate-fade-in font-sans overflow-y-auto">
      <div className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-md w-full border border-slate-100 flex flex-col max-h-[calc(100dvh-2rem)] sm:max-h-[90vh] transform transition-all animate-scale-in">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-6 text-white text-center relative shrink-0">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 hover:bg-white/10 rounded-full transition cursor-pointer"
          >
            <X size={18} />
          </button>
           <div className="inline-flex p-2.5 bg-white/10 rounded-2xl mb-2 text-blue-200">
            <Sparkles size={24} className="animate-pulse" />
          </div>
          <h3 className="text-lg font-black tracking-tight leading-none">{brandName.toUpperCase()} PREMIUM</h3>
          <p className="text-xs text-blue-200 uppercase tracking-wider mt-1.5 font-bold">Secure Education checkout</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 flex-1 overflow-y-auto">
          
          {/* Plan Selection Grid */}
          <div className="space-y-2">
            <label className="block text-[10px] uppercase font-black text-slate-400 tracking-wider">Select Premium Plan</label>
            <div className="grid grid-cols-2 gap-2">
              {plans.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setSelectedPlan(p.id);
                    setTransferConfirmed(false);
                  }}
                  className={`p-3 rounded-2xl border text-left transition relative flex flex-col justify-between cursor-pointer ${
                    selectedPlan === p.id 
                      ? 'bg-amber-50/70 border-amber-500 ring-2 ring-amber-400/25' 
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {p.isPopular && (
                    <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-[8px] text-white font-black px-1.5 py-0.5 rounded-full uppercase tracking-widest shadow-sm">
                      Popular
                    </span>
                  )}
                  <div>
                    <span className={`text-[9px] font-black uppercase tracking-tight block ${selectedPlan === p.id ? 'text-amber-900' : 'text-slate-400'}`}>
                      {p.name}
                    </span>
                    <span className="text-base font-black text-slate-800 tracking-tight block mt-0.5">
                      {p.price}
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-400 block mt-1 leading-none">
                    per {p.period}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Package details */}
          <div className="bg-blue-50/60 rounded-2xl border border-blue-105 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-blue-800 uppercase tracking-wide">Premier School Plan</span>
              <span className="px-2 py-0.5 bg-blue-100 text-[10px] font-black tracking-tight text-blue-800 rounded-lg uppercase">{activePlanObj.name}</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-800">{activePlanObj.price}</span>
              <span className="text-xs text-slate-400">per student per {activePlanObj.period}</span>
            </div>
            <ul className="text-[11px] text-slate-500 space-y-1 pt-1 border-t border-blue-100/60">
              <li className="flex items-center gap-1.5 text-slate-600 font-bold">
                <Check size={11} className="text-blue-600 shrink-0" />
                Unlocks All Subjects (English, Mathematics, etc.)
              </li>
              <li className="flex items-center gap-1.5 text-slate-600 font-bold">
                <Check size={11} className="text-blue-600 shrink-0" />
                Week 1–12, Term 1–3 Lesson Notes
              </li>
              <li className="flex items-center gap-1.5 text-slate-600 font-bold">
                <Check size={11} className="text-blue-600 shrink-0" />
                Unlimited Quizzes, CBT Exams & AskAfri AI Tutor
              </li>
            </ul>
          </div>

          {/* Payment method toggles */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => { setPaymentMethod('card'); setErrorInput(''); }}
              className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                paymentMethod === 'card' 
                  ? 'bg-slate-50 border-blue-600 text-blue-800 shadow-xs' 
                  : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
            >
              <CreditCard size={14} />
              Card Payment
            </button>
            <button
              onClick={() => { setPaymentMethod('transfer'); setErrorInput(''); }}
              className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                paymentMethod === 'transfer' 
                  ? 'bg-slate-50 border-blue-600 text-blue-800 shadow-xs' 
                  : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
            >
              <Landmark size={14} />
              Bank Transfer
            </button>
          </div>

          <form onSubmit={handlePay} className="space-y-4">
            {errorInput && (
              <p className="text-[11px] font-bold text-red-500 bg-red-50 p-2.5 rounded-xl border border-red-100">
                {errorInput}
              </p>
            )}

            {paymentMethod === 'card' ? (
              <div className="space-y-3">
                {(paystackLink || flutterwaveLink) && (
                  <div className="p-3.5 bg-gradient-to-br from-indigo-50 to-blue-50/50 rounded-2xl border border-indigo-100 space-y-2">
                    <p className="text-[10px] font-black uppercase text-indigo-950 tracking-wider">🔗 Active Billing Links</p>
                    <p className="text-[9px] text-slate-500 font-medium pb-1">Click a portal gateway below to open secure web subscription checks instantly:</p>
                    <div className="flex flex-col gap-1.5 pb-1">
                      {paystackLink && (
                        <a 
                          href={paystackLink} 
                          target="_blank" 
                          rel="noreferrer"
                          className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-center rounded-xl text-[11px] transition shadow-xs flex items-center justify-center gap-1.5"
                        >
                          <span>💳 PAYSTACK SECURE LINK</span>
                        </a>
                      )}
                      {flutterwaveLink && (
                        <a 
                          href={flutterwaveLink} 
                          target="_blank" 
                          rel="noreferrer"
                          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-center rounded-xl text-[11px] transition shadow-xs flex items-center justify-center gap-1.5"
                        >
                          <span>💳 FLUTTERWAVE SECURE LINK</span>
                        </a>
                      )}
                    </div>
                    <div className="border-t border-indigo-100/60 pt-1.5 text-center">
                      <span className="text-[8px] font-bold text-indigo-900 uppercase">Or proceed with local simulator check below:</span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Cardholder Email</label>
                  <input
                    type="text"
                    readOnly
                    value={user.email}
                    className="w-full bg-slate-55 border border-slate-205 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-500 capitalize cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Card Number</label>
                  <input
                    type="text"
                    maxLength={19}
                    placeholder="xxxx xxxx xxxx xxxx"
                    required
                    value={cardNumber}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
                      setCardNumber(val);
                    }}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-700 outline-none focus:border-blue-600 bg-slate-50/50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Expiry Date</label>
                    <input
                      type="text"
                      maxLength={5}
                      placeholder="MM/YY"
                      required
                      value={cardExpiry}
                      onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, '');
                        if (val.length > 2) val = val.slice(0, 2) + '/' + val.slice(2, 4);
                        setCardExpiry(val);
                      }}
                      className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-700 outline-none focus:border-blue-600 text-center bg-slate-50/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">CVV Code</label>
                    <input
                      type="password"
                      maxLength={3}
                      placeholder="xxx"
                      required
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                      className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-700 outline-none focus:border-blue-600 text-center bg-slate-50/50"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-center py-2 animate-scale-in">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{bankName}</span>
                  <span className="text-lg font-black text-blue-700 select-all font-mono tracking-tight">{bankAccountNumber}</span>
                  <span className="text-xs font-extrabold text-slate-700">{bankAccountName}</span>
                  <span className="text-[10px] text-slate-400">(Transfer exactly {activePlanObj.price} and check confirmation box below)</span>
                </div>

                <label className="flex items-center gap-2.5 p-1 bg-blue-50/50 rounded-xl border border-blue-105 cursor-pointer text-left">
                  <input
                    type="checkbox"
                    checked={transferConfirmed}
                    onChange={(e) => setTransferConfirmed(e.target.checked)}
                    className="h-4 w-4 rounded text-blue-600 transition"
                  />
                  <div className="space-y-0.5">
                    <p className="text-[11px] font-bold text-blue-900 leading-none">I have completed this Bank Transfer</p>
                    <p className="text-[9px] text-blue-500">Wait for instant network synchronization</p>
                  </div>
                </label>
              </div>
            )}

            {/* Buttons */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
              <span className="text-[10px] flex items-center gap-1 text-slate-405 font-bold">
                <ShieldCheck size={12} className="text-emerald-500" />
                PCI-DSS Compliant
              </span>
              <button
                type="submit"
                disabled={isProcessing || (paymentMethod === 'transfer' && !transferConfirmed)}
                className={`px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-750 hover:to-indigo-750 text-white font-black rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-blue-500/10 cursor-pointer ${
                  (isProcessing || (paymentMethod === 'transfer' && !transferConfirmed)) ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'
                }`}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" />
                    <span>Authorizing ...</span>
                  </>
                ) : (
                  <>
                    <span>Submit & Pay {activePlanObj.price}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
