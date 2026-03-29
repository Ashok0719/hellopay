'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Phone, Mail, Lock, ArrowRight, Zap, Fingerprint, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/hooks/useAuth';

export default function RegisterPage() {
  const [step, setStep] = useState(1); // 1: Info, 2: OTP
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    pincode: '',
    referral: '',
    otp: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { setToken, setUser } = useAuthStore();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.phone || !formData.name) {
      setError('Name and Phone are required for Neural Link');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/send-otp', { phone: formData.phone });
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await api.post('/auth/verify-otp', {
        phone: formData.phone,
        otp: formData.otp,
        name: formData.name,
        email: formData.email,
        pincode: formData.pincode,
        referralCode: formData.referral
      });
      setToken(data.token);
      setUser(data);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Neural synchronization failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center py-20 px-6">
      <Link href="/" className="flex items-center gap-2 mb-12">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
          <Zap className="text-white fill-white" size={24} />
        </div>
        <span className="text-2xl font-black tracking-tighter text-white italic">HelloPay</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg p-10 rounded-[48px] bg-[#030712] border border-white/5 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2" />
        
        <h2 className="text-4xl font-black mb-2 tracking-tight">Neural Link</h2>
        <p className="text-slate-500 mb-10 leading-relaxed font-medium">
          {step === 1 ? 'Enter your details to initialize account.' : 'Confirm identity with the verification code.'}
        </p>

        {error && <div className="p-5 mb-8 rounded-3xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold">{error}</div>}

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.form
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleSendOtp}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Display Name</label>
                  <div className="relative">
                    <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                    <input
                      required
                      type="text"
                      placeholder="Neural Node ID"
                      className="w-full bg-[#020617]/50 border border-white/5 rounded-[24px] py-5 pl-14 pr-6 outline-none focus:border-blue-500/40 transition-all font-bold text-white placeholder:text-slate-700"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Neural Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                    <input
                      required
                      type="text"
                      placeholder="10-Digit Link"
                      className="w-full bg-[#020617]/50 border border-white/5 rounded-[24px] py-5 pl-14 pr-6 outline-none focus:border-blue-500/40 transition-all font-bold text-white placeholder:text-slate-700"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Email Interface</label>
                <div className="relative">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                  <input
                    type="email"
                    placeholder="nexus@hellopay.io"
                    className="w-full bg-[#020617]/50 border border-white/5 rounded-[24px] py-5 pl-14 pr-6 outline-none focus:border-blue-500/40 transition-all font-bold text-white placeholder:text-slate-700"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Security PIN</label>
                  <div className="relative">
                    <Fingerprint className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                    <input
                      required
                      type="text"
                      maxLength={4}
                      placeholder="0000"
                      className="w-full bg-[#020617]/50 border border-white/5 rounded-[24px] py-5 pl-14 pr-6 outline-none focus:border-blue-500/40 transition-all font-bold text-white placeholder:text-slate-700 tracking-[0.5em]"
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '') })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Referral Node</label>
                  <div className="relative">
                    <ArrowRight className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                    <input
                      type="text"
                      placeholder="Optional ID"
                      className="w-full bg-[#020617]/50 border border-white/5 rounded-[24px] py-5 pl-14 pr-6 outline-none focus:border-blue-500/40 transition-all font-bold text-white placeholder:text-slate-700"
                      value={formData.referral}
                      onChange={(e) => setFormData({ ...formData, referral: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 py-6 rounded-[28px] text-lg font-black tracking-tight flex items-center justify-center gap-3 transition-all hover:bg-blue-500 hover:shadow-[0_20px_40px_rgba(37,99,235,0.3)] disabled:opacity-50"
              >
                {loading ? 'Initializing...' : 'Initialize Link'} <Zap size={22} className="fill-white" />
              </button>
            </motion.form>
          ) : (
            <motion.form
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleVerifyOtp}
              className="space-y-8"
            >
              <div className="space-y-4">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1 text-center block">Neural Link Verification PIN</label>
                <div className="relative">
                   <ShieldCheck className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-500" size={24} />
                   <input
                    required
                    autoFocus
                    type="text"
                    maxLength={4}
                    placeholder="· · · ·"
                    className="w-full bg-blue-600/5 border border-blue-500/30 rounded-[32px] py-8 pl-18 pr-8 outline-none focus:border-blue-500 transition-all font-black text-4xl text-center text-white placeholder:text-slate-800 tracking-[0.8em]"
                    value={formData.otp}
                    onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '') })}
                  />
                </div>
                <p className="text-center text-xs text-slate-600 font-bold">Code sent to: {formData.phone}</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 py-6 rounded-[28px] text-lg font-black tracking-tight flex items-center justify-center gap-3 transition-all hover:bg-blue-500 hover:shadow-[0_20px_40px_rgba(37,99,235,0.3)] disabled:opacity-50"
              >
                {loading ? 'Synchronizing...' : 'Establish Connection'} <Zap size={22} className="fill-white" />
              </button>

              <button 
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-slate-500 text-sm font-bold hover:text-white transition-colors"
              >
                Wrong Phone Number? Back to Link
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        <p className="mt-10 text-center text-slate-500 text-[13px] font-bold">
          Already verified?{' '}
          <Link href="/login" className="text-blue-400 hover:text-blue-300 font-black transition-colors underline decoration-2 underline-offset-4 uppercase tracking-tighter">Sign In</Link>
        </p>
      </motion.div>
    </div>
  );
}
