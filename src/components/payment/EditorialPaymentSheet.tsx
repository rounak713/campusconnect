import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, QrCode, Smartphone, ArrowRight, Lock, Copy, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const EditorialPaymentSheet: React.FC = () => {
  const { isPaymentModalOpen, setIsPaymentModalOpen, completePayment } = useApp();
  const [selectedApp, setSelectedApp] = useState<string>('gpay');
  const [mode, setMode] = useState<'apps' | 'qr'>('apps');
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
      }, 1200);
    }, 1500);
  };

  const handleCopyVpa = () => {
    navigator.clipboard?.writeText('campusconnect@okaxis');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div 
        className="w-full max-w-md bg-noir-900 border border-white/10 rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 text-left shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {isSuccess ? (
          <div className="py-12 text-center space-y-3 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-2xl text-bone">Slot Unlocked</h3>
            <p className="text-xs text-subtle">
              ₹10.00 confirmed. +1 anonymous slot added to your vault.
            </p>
          </div>
        ) : isProcessing ? (
          <div className="py-16 text-center space-y-4">
            <div className="w-12 h-12 rounded-full border-2 border-hinge-purple border-t-transparent animate-spin mx-auto" />
            <h4 className="font-serif text-xl text-bone">Authorizing ₹10 UPI...</h4>
            <p className="text-xs text-subtle">Securing double-blind token</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/8">
              <div>
                <span className="text-xs uppercase tracking-wider text-subtle font-mono">Micro-Charge</span>
                <h3 className="font-serif text-2xl text-bone font-normal">
                  Unlock Next Slot
                </h3>
              </div>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="w-8 h-8 rounded-full bg-noir-800 flex items-center justify-center text-subtle hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Price & Guarantee Callout */}
            <div className="py-4 my-2 flex items-baseline justify-between border-b border-white/8">
              <div>
                <span className="text-3xl font-light text-white">₹10.00</span>
                <span className="text-xs text-subtle ml-1.5">/ semester pass</span>
              </div>
              <span className="text-[11px] text-emerald-400 font-medium">
                100% Anonymous Guarantee
              </span>
            </div>

            {/* Tab switch */}
            <div className="grid grid-cols-2 gap-2 my-4">
              <button
                onClick={() => setMode('apps')}
                className={`py-2 text-xs font-medium rounded-xl transition-colors ${
                  mode === 'apps' ? 'bg-noir-800 text-white border border-white/10' : 'text-subtle hover:text-white'
                }`}
              >
                UPI Apps
              </button>
              <button
                onClick={() => setMode('qr')}
                className={`py-2 text-xs font-medium rounded-xl transition-colors ${
                  mode === 'qr' ? 'bg-noir-800 text-white border border-white/10' : 'text-subtle hover:text-white'
                }`}
              >
                Scan QR Code
              </button>
            </div>

            {mode === 'apps' ? (
              <div className="space-y-2 mb-6">
                {[
                  { id: 'gpay', name: 'Google Pay', sub: 'Instant 1-tap UPI' },
                  { id: 'phonepe', name: 'PhonePe', sub: 'UPI / Direct Bank' },
                  { id: 'paytm', name: 'Paytm', sub: 'Instant Wallet or UPI' }
                ].map((app) => (
                  <div
                    key={app.id}
                    onClick={() => setSelectedApp(app.id)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      selectedApp === app.id
                        ? 'bg-noir-800 border-hinge-purple'
                        : 'bg-noir-850 border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-medium text-white">{app.name}</div>
                      <div className="text-[10px] text-subtle">{app.sub}</div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      selectedApp === app.id ? 'border-hinge-purple bg-hinge-purple' : 'border-zinc-700'
                    }`}>
                      {selectedApp === app.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-4 bg-noir-850 rounded-2xl border border-white/5 mb-6">
                <div className="w-36 h-36 mx-auto bg-white p-2 rounded-xl flex items-center justify-center">
                  <QrCode className="w-28 h-28 text-noir-900" />
                </div>
                <div className="mt-3 flex items-center justify-center space-x-2 text-xs font-mono text-subtle">
                  <span>campusconnect@okaxis</span>
                  <button onClick={handleCopyVpa} className="text-hinge-purple hover:underline">
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            )}

            {/* CTA Button */}
            <button
              onClick={handlePay}
              className="w-full py-4 bg-hinge-purple hover:bg-hinge-hover text-white font-medium text-sm rounded-full transition-all shadow-lg shadow-hinge-purple/20 flex items-center justify-center space-x-2"
            >
              <span>Pay ₹10.00 via {selectedApp.toUpperCase()}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-center text-[10px] text-zinc-600 mt-3">
              UPI Intent • Zero personal payment data linked to crush identities
            </p>
          </>
        )}
      </div>
    </div>
  );
};
