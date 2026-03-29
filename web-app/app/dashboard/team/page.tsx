'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Copy, Share2, MessageCircle, MessageSquare, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/hooks/useAuth';
import api from '@/lib/api';

export default function TeamPage() {
  const router = useRouter();
  const { user, setUser }: any = useAuthStore();
  const [referralCode, setReferralCode] = useState(user?.referralCode || '... ');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/auth/profile');
        setReferralCode(data.referralCode);
        setUser({ ...user, ...data });
      } catch (err) {
        console.error('Failed to fetch profile', err);
      }
    };
    fetchProfile();
  }, []);

  const copyCode = () => {
    navigator.clipboard.writeText(referralCode);
    alert('Referral Code Copied: ' + referralCode);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12 font-sans max-w-lg mx-auto shadow-2xl border-x border-slate-200">
      {/* Header */}
      <header className="p-4 flex items-center justify-between bg-white border-b border-slate-100 sticky top-0 z-50">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors">
          <ChevronLeft size={28} />
        </button>
        <h1 className="text-xl font-bold text-emerald-600">Team</h1>
        <div className="w-10" />
      </header>

      <div className="p-4 space-y-6">
        {/* Total Commissions Card */}
        <div className="bg-emerald-600 rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 text-center mb-8">
            <span className="text-emerald-100 text-sm font-medium uppercase tracking-widest">My Total Commissions:</span>
            <div className="text-5xl font-black mt-2">+0.00</div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 relative z-10">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center">
              <span className="text-[10px] text-emerald-100 block uppercase font-bold mb-1">Commissions Yesterday</span>
              <span className="text-xl font-black">+0.00</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center">
              <span className="text-[10px] text-emerald-100 block uppercase font-bold mb-1">Total Team Members</span>
              <span className="text-xl font-black">+0</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center">
              <span className="text-[10px] text-emerald-100 block uppercase font-bold mb-1">Commissions Today</span>
              <span className="text-xl font-black">+0.00</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center">
              <span className="text-[10px] text-emerald-100 block uppercase font-bold mb-1">Total Team Deposit</span>
              <span className="text-xl font-black">+0.00</span>
            </div>
          </div>
        </div>

        {/* Invitation Card */}
        <div className="relative pt-6">
           <div className="absolute top-0 left-0 bg-emerald-700 px-6 py-2 rounded-t-2xl text-xs font-bold text-white uppercase italic">
             Invitation
           </div>
           <div className="bg-emerald-600 rounded-b-[32px] rounded-tr-[32px] p-6 shadow-lg">
              <div className="flex justify-between items-center bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 mb-6">
                 <span className="text-2xl font-black text-white italic">Link</span>
                 <div className="flex items-center gap-3">
                   <span className="text-emerald-50 text-sm font-bold">{referralCode}</span>
                   <Copy size={20} className="text-emerald-100 cursor-pointer hover:text-white" onClick={copyCode} />
                 </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-inner">
                <p className="text-center text-xs font-bold text-slate-800 mb-6">New Team Members:</p>
                <div className="flex gap-4">
                  <TeamLevelStats level="Level.B" today={0} yesterday={0} />
                  <TeamLevelStats level="Level.C" today={0} yesterday={0} />
                </div>
              </div>
           </div>
        </div>

        {/* Share Section */}
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 text-center">
           <h3 className="text-xl font-black mb-8 text-slate-800">Share APP to</h3>
           <div className="grid grid-cols-4 gap-4">
              <ShareIcon icon={<Send className="text-white fill-white" size={24}/>} label="Telegram" color="bg-blue-400" />
              <ShareIcon icon={<MessageSquare className="text-white fill-white" size={24}/>} label="Facebook" color="bg-blue-600" />
              <ShareIcon icon={<MessageCircle className="text-white fill-white" size={24}/>} label="Whatsapp" color="bg-green-500" />
              <ShareIcon icon={<Share2 className="text-white" size={24}/>} label="Copy link" color="bg-gradient-to-br from-indigo-500 to-purple-600" />
           </div>
        </div>

        {/* Commissions / Deposit Summary */}
        <div className="relative pt-6">
           <div className="absolute top-0 left-0 bg-emerald-700 px-6 py-2 rounded-t-2xl text-[10px] font-black text-white uppercase tracking-widest italic">
             Commissions / Deposit
           </div>
           <div className="bg-white rounded-b-[32px] rounded-tr-[32px] p-8 shadow-sm border border-slate-100">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-emerald-700 font-bold">
                   <span className="text-xl font-black italic">Level.B</span>
                   <span className="text-lg">0.00/0.00</span>
                 </div>
                 <div className="flex justify-between items-center text-emerald-700 font-bold">
                   <span className="text-xl font-black italic">Level.C</span>
                   <span className="text-lg">0.00/0.00</span>
                </div>
                <button className="text-emerald-500 text-xs font-bold underline mt-2">View details &gt;</button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function TeamLevelStats({ level, today, yesterday }: any) {
  return (
    <div className="flex-1 bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
      <h4 className="text-emerald-800 font-black text-center mb-4 text-lg italic">{level}</h4>
      <div className="space-y-2">
        <div className="flex justify-between text-[10px] font-bold text-slate-500">
          <span>Today:</span>
          <span className="text-slate-800">{today}</span>
        </div>
        <div className="flex justify-between text-[10px] font-bold text-slate-500">
          <span>Yesterday:</span>
          <span className="text-slate-800">{yesterday}</span>
        </div>
      </div>
    </div>
  );
}

function ShareIcon({ icon, label, color }: any) {
  return (
    <div className="flex flex-col items-center gap-3">
       <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center shadow-lg active:scale-90 transition-transform cursor-pointer`}>
         {icon}
       </div>
       <span className="text-[10px] font-bold text-slate-500">{label}</span>
    </div>
  );
}
