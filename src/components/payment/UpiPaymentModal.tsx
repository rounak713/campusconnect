import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Smartphone, 
  QrCode, 
  ArrowRight, 
  Lock, 
  CreditCard,
  Copy,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const UpiPaymentModal: React.FC = () => {
  const { isPaymentModalOpen, setIsPaymentModalOpen, completePayment } = useApp();
  const [selectedApp, setSelectedApp] = useState<string>('gpay');
  const [activeTab, setActiveTab] = useState<'apps' | 'qr' | 'upi-id'>('apps');
  const [upiId, setUpiId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isPaymentModalOpen) return null;

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        completePayment();
      }, 1400);
    }, 1800);
  };

  const handleCopyVpa = () => {
    navigator.clipboard?.writeText('campusconnect@okaxis');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-navy-900 border border-violet-500/30 rounded-t-3xl sm:rounded-3xl p-6 text-left shadow-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative ambient gradient */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {isSuccess ? (
          /* Payment Success State */
          <div className="py-10 text-center space-y-4 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-emerald-500/20 border-2 border-emerald-400 rounded-full flex items-center justify-center mx-auto text-emerald-400 shadow-glow-emerald">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">Payment Confirmed!</h3>
              <p className="text-xs text-emerald-400 font-semibold mt-1">₹10.00 Authorized via UPI</p>
              <p className="text-xs text-slate-400 mt-2">
                +1 Secret Crush Slot added to your vault. 100% Anonymous.
              </p>
            </div>
          </div>
        ) : isProcessing ? (
          /* Processing Simulation */
          <div className="py-12 text-center space-y-5 animate-in fade-in">
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <div className="w-20 h-20 rounded-full border-4 border-violet-500/20 border-t-neon-violet animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Lock className="w-7 h-7 text-violet-400" />
              </div>
            </div>
            <div>
              <h4 className="text-base font-bold text-white">Connecting UPI Gateway...</h4>
              <p className="text-xs text-slate-400 mt-1">Securing double-blind cryptographic token</p>
              <div className="flex items-center justify-center space-x-1 mt-3">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        ) : (
          /* Main Payment Sheet */
          <>
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
                  <CreditCard className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-1.5">
                    <span>Unlock Crush Slot</span>
                    <Sparkles className="w-4 h-4 text-violet-400" />
                  </h3>
                  <p className="text-[11px] text-emerald-400 font-semibold tracking-wide">
                    ₹10 / Semester Pass • 100% Anonymous Guarantee
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsPaymentModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Price Badge */}
            <div className="my-4 p-4 rounded-2xl bg-gradient-to-r from-violet-950/60 via-navy-800 to-emerald-950/40 border border-violet-500/25 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Total Micro-Charge</span>
                <div className="text-2xl font-black text-white flex items-baseline gap-1">
                  <span>₹10.00</span>
                  <span className="text-xs text-slate-400 font-normal">/ slot</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                  Zero Server Storage
                </span>
                <p className="text-[10px] text-slate-500 mt-1">Single-time charge</p>
              </div>
            </div>

            {/* Mode Switcher */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-navy-850 rounded-xl mb-4 border border-white/5 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('apps')}
                className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'apps' ? 'bg-violet-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>UPI Apps</span>
              </button>
              <button
                onClick={() => setActiveTab('qr')}
                className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'qr' ? 'bg-violet-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Scan QR</span>
              </button>
              <button
                onClick={() => setActiveTab('upi-id')}
                className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'upi-id' ? 'bg-violet-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>UPI ID</span>
              </button>
            </div>

            {/* Tab 1: 1-Tap UPI Apps */}
            {activeTab === 'apps' && (
              <div className="space-y-2.5 mb-5">
                {[
                  { id: 'gpay', name: 'Google Pay', subtitle: 'Fastest 1-tap approval', badge: 'Recommended', color: 'from-blue-600/20 to-emerald-600/20' },
                  { id: 'phonepe', name: 'PhonePe', subtitle: 'UPI / Wallet auto-switch', color: 'from-purple-600/20 to-indigo-600/20' },
                  { id: 'paytm', name: 'Paytm UPI', subtitle: 'Instant bank transfer', color: 'from-sky-600/20 to-cyan-600/20' },
                  { id: 'cred', name: 'CRED UPI', subtitle: 'Direct bank account payment', color: 'from-zinc-600/20 to-slate-600/20' },
                ].map((app) => (
                  <div
                    key={app.id}
                    onClick={() => setSelectedApp(app.id)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      selectedApp === app.id
                        ? 'bg-gradient-to-r ' + app.color + ' border-violet-500 shadow-md shadow-violet-900/30'
                        : 'bg-navy-850/60 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-xs font-black text-white">
                        {app.name[0]}P
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-white">{app.name}</span>
                          {app.badge && (
                            <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded border border-emerald-500/30">
                              {app.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400">{app.subtitle}</p>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      selectedApp === app.id ? 'border-neon-violet bg-neon-violet' : 'border-slate-600'
                    }`}>
                      {selectedApp === app.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 2: UPI QR Code */}
            {activeTab === 'qr' && (
              <div className="mb-5 text-center p-4 bg-navy-850 rounded-2xl border border-white/10">
                <div className="w-44 h-44 mx-auto bg-white p-3 rounded-2xl flex flex-col items-center justify-center shadow-lg relative group">
                  {/* Styled QR pattern */}
                  <div className="w-full h-full border-4 border-navy-900 rounded-lg flex flex-col items-center justify-center p-2 bg-slate-50">
                    <QrCode className="w-28 h-28 text-navy-900" />
                    <span className="text-[10px] font-black text-navy-900 tracking-wider">₹10.00 • UPI SECURE</span>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-center space-x-2">
                  <span className="text-xs text-slate-300 font-mono">campusconnect@okaxis</span>
                  <button 
                    onClick={handleCopyVpa}
                    className="text-xs text-violet-400 hover:text-violet-300 p-1 rounded bg-white/5 flex items-center space-x-1"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Scan using any UPI app on another device</p>
              </div>
            )}

            {/* Tab 3: Manual UPI ID */}
            {activeTab === 'upi-id' && (
              <div className="mb-5 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Enter Virtual Payment Address (VPA)
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. yourname@oksbi or 9876543210@paytm"
                    className="w-full bg-navy-850 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white placeholder:text-slate-500 font-mono focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  We'll dispatch a collect request of ₹10 to your UPI app.
                </p>
              </div>
            )}

            {/* Micro-copy and CTA */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={handlePay}
                className="w-full py-3.5 bg-gradient-to-r from-violet-600 via-indigo-600 to-emerald-600 hover:from-violet-500 hover:to-emerald-500 text-white font-bold text-sm rounded-2xl transition-all shadow-lg shadow-violet-600/30 flex items-center justify-center space-x-2"
              >
                <span>Pay ₹10.00 via {activeTab === 'apps' ? (selectedApp.toUpperCase()) : 'UPI'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center space-x-2 text-[10px] text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Razorpay 256-Bit Encrypted • RBI Regulated UPI Switch</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
