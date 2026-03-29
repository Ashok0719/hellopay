'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Lock, ArrowRight, Zap, UserCircle, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/hooks/useAuth';
import { Suspense, useEffect } from 'react';

function LoginContent() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [step, setStep] = useState<'phone' | 'otp' | 'register'>('phone');
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setToken, setUser } = useAuthStore();

  useEffect(() => {
    if (searchParams.get('status') === 'banned') {
      setError('Your account has been banned temporarily');
    }
  }, [searchParams]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/send-otp', { phone });
      setStep('otp');
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
      const { data } = await api.post('/auth/verify-otp', { phone, otp, name });
      setToken(data.token);
      setUser(data);
      router.push('/dashboard');
    } catch (err: any) {
      if (err.response?.data?.message?.includes('Name is required')) {
        setStep('register');
      } else {
        setError(err.response?.data?.message || 'Verification failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setToken('guest_token_demo_123');
      setUser({
        _id: 'guest_user_id',
        name: 'Guest User',
        phone: '9999999999',
        walletBalance: 0.86,
        isSeller: false
      });
      router.push('/dashboard');
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-6 font-sans">
      <Link href="/" className="flex items-center gap-3 mb-10 group">
        <div className="w-12 h-12 bg-indigo-600 rounded-[18px] flex items-center justify-center shadow-xl shadow-indigo-500/30 group-hover:scale-110 transition-transform">
          <Zap className="text-white fill-white" size={28} />
        </div>
        <span className="text-3xl font-black tracking-tighter text-white uppercase">HelloPay</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md p-10 rounded-[40px] bg-slate-900 border border-slate-800 shadow-2xl"
      >
        <h2 className="text-4xl font-black mb-2 text-white tracking-tight">
          {step === 'phone' ? (isRegistering ? 'Join HelloPay' : 'Welcome!') : step === 'otp' ? 'Secure OTP' : 'Final Step'}
        </h2>
        <p className="text-slate-500 font-bold text-sm mb-10">
          {step === 'phone' ? 'Enter your mobile to begin.' : step === 'otp' ? `Sent to ${phone}` : 'Enter your name to join HelloPay.'}
        </p>

        {error && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-4 mb-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-[13px] font-bold flex items-center gap-2"
          >
             <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
             {error}
          </motion.div>
        )}

        <form onSubmit={step === 'phone' ? handleSendOtp : handleVerifyOtp} className="space-y-6">
          {step === 'phone' && (
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
              <div className="relative group">
                <Smartphone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" size={20} />
                <input
                  type="text"
                  placeholder="0000000000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4.5 pl-14 pr-6 focus:border-indigo-500/50 text-white font-bold placeholder:text-slate-700 outline-none transition-all shadow-sm"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
          )}

          {step === 'otp' && (
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">4-Digit Code</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" size={20} />
                <input
                  type="text"
                  placeholder="0000"
                  maxLength={4}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4.5 pl-14 pr-6 focus:border-indigo-500/50 text-white font-bold placeholder:text-slate-700 outline-none transition-all shadow-sm tracking-[1.5em] text-center"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
            </div>
          )}

          {step === 'register' && (
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
              <div className="relative group">
                <UserCircle className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" size={20} />
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4.5 pl-14 pr-6 focus:border-indigo-500/50 text-white font-bold placeholder:text-slate-700 outline-none transition-all shadow-sm"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl flex items-center justify-center gap-3 group active:scale-[0.98] transition-all shadow-xl shadow-indigo-500/20 disabled:opacity-50 uppercase tracking-tighter"
            >
              {loading ? 'Processing...' : step === 'phone' ? 'Get OTP' : 'Verify & Continue'} <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>

            {step === 'phone' && !isRegistering && (
              <button
                type="button"
                onClick={() => setIsRegistering(true)}
                className="w-full py-4 text-slate-500 hover:text-indigo-400 font-bold transition-all text-[11px] uppercase tracking-widest border border-slate-800/50 rounded-2xl bg-white/5 active:scale-95 shadow-lg shadow-indigo-500/0 hover:shadow-indigo-500/5"
              >
                New here? Create Account
              </button>
            )}

            {step === 'phone' && (
              <button
                type="button"
                onClick={handleGuestLogin}
                disabled={loading}
                className="w-full py-5 bg-slate-950 text-indigo-400 font-black rounded-2xl flex items-center justify-center gap-3 group active:scale-[0.98] transition-all border-2 border-slate-800 disabled:opacity-50 uppercase tracking-tighter"
              >
                <UserCircle size={22} /> Guest mode
              </button>
            )}

            {step !== 'phone' && (
              <button
                type="button"
                onClick={() => setStep('phone')}
                className="w-full py-3 text-slate-500 font-bold hover:text-white transition-colors text-xs uppercase"
              >
                Back to Phone
              </button>
            )}
          </div>
        </form>
      </motion.div>

      <div className="mt-12 pt-8 border-t border-slate-800/50 flex justify-center">
        <Link 
          href="http://localhost:3001" 
          target="_blank"
          className="text-[10px] font-black text-slate-700 hover:text-indigo-400 transition-colors uppercase tracking-[0.4em] italic flex items-center gap-2 group"
        >
          <ShieldCheck size={12} className="group-hover:animate-pulse" />
          Admin Registry Access
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
