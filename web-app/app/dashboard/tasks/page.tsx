'use client';

import { motion } from 'framer-motion';
import { ChevronLeft, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function TasksPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Team Growth');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12 font-sans max-w-lg mx-auto shadow-2xl border-x border-slate-200">
      {/* Header */}
      <header className="p-4 flex items-center justify-between bg-white border-b border-slate-100 sticky top-0 z-50">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors">
          <ChevronLeft size={28} />
        </button>
        <h1 className="text-xl font-bold text-emerald-600">Task Rewards</h1>
        <div className="w-10" />
      </header>

      <div className="p-6">
        <p className="text-center text-slate-400 font-medium mb-10">Earn tokens by completing tasks</p>

        {/* Navigation Tabs */}
        <div className="flex bg-emerald-50 p-1.5 rounded-full mb-10 border border-emerald-100">
          {['Newbie Tasks', 'Team Growth', 'Daily Tasks'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 px-2 rounded-full font-bold text-[11px] transition-all whitespace-nowrap ${
                activeTab === tab ? 'bg-white text-emerald-600 shadow-lg shadow-emerald-200/50' : 'text-emerald-700/50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Task Cards */}
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 relative group active:scale-[0.98] transition-all"
          >
            <div className="flex justify-between items-start mb-4">
               <div>
                  <h3 className="text-xl font-black text-indigo-200 uppercase italic tracking-tighter">INVITE</h3>
                  <p className="text-slate-400 text-[10px] font-bold mt-1">0 invited</p>
               </div>
            </div>
            
            <p className="text-slate-500 font-bold text-xs leading-relaxed mb-6">
               Invite friends to complete the newbie task and get rewarded automatically.
            </p>

            <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
               <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-amber-300 shadow-lg shadow-emerald-900/10">
                     <Star size={16} fill="currentColor" />
                  </div>
                  <span className="text-2xl font-black">0</span>
               </div>
               <button className="px-10 py-2.5 bg-emerald-600 text-white font-bold rounded-full shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-colors">
                 Invite
               </button>
            </div>

            {/* Subtle light effect */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 opacity-20 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
