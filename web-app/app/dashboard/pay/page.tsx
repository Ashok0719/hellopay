'use client';

import { Suspense, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Smartphone, CheckCircle, Clock, Upload, ShieldCheck, Zap, AlertCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';

function PayContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');
  const upiIntent = searchParams.get('upiIntent');
  const transactionId = searchParams.get('txnId');

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'verifying' | 'success' | 'failed'>('idle');
  const [error, setError] = useState('');

  const handlePayNow = () => {
    if (upiIntent) {
      window.location.href = upiIntent;
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const verifyPayment = async () => {
    if (!file || !transactionId) return;
    
    setLoading(true);
    setStatus('uploading');
    setError('');

    const formData = new FormData();
    formData.append('screenshot', file);
    formData.append('transactionId', transactionId);

    try {
      setStatus('verifying');
      const { data } = await api.post('/listings/upload-receipt', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (data.status === 'success') {
        setStatus('success');
      } else {
        setStatus('failed');
        setError(data.message || 'Verification pending manual review.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Verification failed. Please ensure the screenshot is clear.');
      setStatus('failed');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mb-8 mx-auto border border-emerald-500/20">
            <CheckCircle className="text-emerald-500" size={48} />
          </div>
          <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">Verified!</h1>
          <p className="text-slate-500 font-bold mt-2">₹{amount} has been added to your wallet.</p>
          <button 
            onClick={() => router.push('/dashboard')}
            className="mt-12 px-10 py-5 bg-indigo-600 rounded-[24px] text-white font-black uppercase italic shadow-xl shadow-indigo-500/30 active:scale-95 transition-all w-full"
          >
            Back to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 font-sans flex flex-col items-center">
      <div className="w-full max-w-md">
        <Link href="/dashboard" className="flex items-center gap-2 text-slate-600 hover:text-white transition-colors mb-8 group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">Cancel Asset Binding</span>
        </Link>

        <header className="mb-10">
          <div className="flex items-center gap-3 mb-2">
             <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <ShieldCheck size={24} />
             </div>
             <h1 className="text-3xl font-black italic uppercase tracking-tighter">Secure Payment</h1>
          </div>
          <p className="text-slate-500 font-black text-[10px] uppercase tracking-widest opacity-60">REF: {orderId}</p>
        </header>

        <div className="bg-slate-900 border border-slate-800 rounded-[40px] p-8 shadow-2xl relative overflow-hidden mb-8">
           <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-bl-full blur-[60px]" />
           
           <div className="relative z-10 flex flex-col items-center">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Required Value</span>
              <div className="text-5xl font-black text-indigo-500 italic mb-8 tracking-tighter">₹{amount}</div>

              <div className="w-full space-y-4">
                 <button 
                   onClick={handlePayNow}
                   className="w-full py-5 bg-indigo-600 rounded-[24px] flex items-center justify-center gap-3 font-black uppercase italic shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 active:scale-95 transition-all"
                 >
                   <Zap className="fill-white" size={20} /> Authorize UPI Pay
                 </button>
                 <div className="flex justify-center gap-4 opacity-40">
                    <img src="https://img.icons8.com/color/48/google-pay.png" className="w-6 h-6 grayscale" />
                    <img src="https://img.icons8.com/color/48/phonepe.png" className="w-6 h-6 grayscale" />
                    <img src="https://img.icons8.com/color/48/paytm.png" className="w-6 h-6 grayscale" />
                 </div>
              </div>
           </div>
        </div>

        <div className="space-y-6">
           <div className="flex items-center gap-3">
              <div className="h-px bg-slate-800/50 flex-1" />
              <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Neural Verification</span>
              <div className="h-px bg-slate-800/50 flex-1" />
           </div>

           <div className="bg-slate-900/40 border border-slate-800/60 rounded-[32px] p-6 backdrop-blur-sm">
              <h3 className="text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2 text-indigo-400">
                 <ShieldCheck size={16} /> Asset Confirmation Bot
              </h3>
              
              {!file ? (
                <label className="block p-10 border-2 border-dashed border-slate-800 rounded-[24px] cursor-pointer hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all text-center">
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                  <Upload className="mx-auto text-slate-700 mb-3" size={32} />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Drop Screenshot Here</span>
                </label>
              ) : (
                <div className="space-y-4">
                   <div className="p-4 bg-slate-800/50 rounded-2xl flex items-center justify-between border border-slate-700/50">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 bg-indigo-600/20 text-indigo-400 rounded-lg flex items-center justify-center"><CheckCircle size={16} /></div>
                         <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase text-slate-400">Captured Evidence</span>
                            <span className="text-[9px] font-bold text-slate-600 truncate max-w-[150px]">{file.name}</span>
                         </div>
                      </div>
                      <button onClick={() => setFile(null)} className="p-2 text-slate-500 hover:text-red-500 transition-colors">
                         <AlertCircle size={18} />
                      </button>
                   </div>
                   
                   <button 
                     onClick={verifyPayment}
                     disabled={loading}
                     className="w-full py-5 bg-white text-slate-950 font-black rounded-[24px] uppercase italic tracking-tighter shadow-2xl active:scale-95 transition-all disabled:opacity-50"
                   >
                     {status === 'verifying' ? 'Bot Scanning...' : 'Finalize Binding'}
                   </button>
                </div>
              )}

              <AnimatePresence>
                {status === 'verifying' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 space-y-3"
                  >
                     <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ x: "-100%" }}
                          animate={{ x: "0%" }}
                          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                          className="w-1/2 h-full bg-indigo-500"
                        />
                     </div>
                     <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest text-center animate-pulse">Running OCR Neural Extraction...</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {error && (
                <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-[10px] font-bold leading-relaxed flex items-start gap-3">
                   <AlertCircle size={14} className="shrink-0 mt-0.5" />
                   <div>
                      <span className="uppercase tracking-widest block mb-1">Signal Mismatch</span>
                      {error}
                   </div>
                </div>
              )}
           </div>
        </div>

        <footer className="mt-12 flex flex-col items-center gap-4 opacity-20 group cursor-default">
           <div className="flex items-center gap-1">
             <div className="w-2 h-2 bg-indigo-600 rounded-full animate-ping" />
             <div className="w-2 h-2 bg-indigo-600 rounded-full" />
           </div>
           <p className="text-[8px] font-black uppercase tracking-[0.5em] text-slate-500 italic text-center leading-relaxed">
             HelloPay Security Mesh Active<br/>v1.0.4 // Zero-Knowledge Verification
           </p>
        </footer>
      </div>
    </div>
  );
}

export default function PayPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center font-black text-indigo-500 uppercase tracking-[0.5em] animate-pulse">Initializing...</div>}>
      <PayContent />
    </Suspense>
  );
}
