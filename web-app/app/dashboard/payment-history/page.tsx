'use client';

import { motion } from 'framer-motion';
import { ChevronLeft, Copy, Clock, History } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function PaymentHistoryPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Receive');
  const [activeSubTab, setActiveSubTab] = useState('INR');
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await api.get('/wallet/history');
        setHistoryItems(data);
      } catch (err) {
        console.error('Failed to fetch history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12 font-sans max-w-lg mx-auto shadow-2xl border-x border-slate-200">
      {/* Header */}
      <header className="p-4 flex items-center justify-between bg-white border-b border-slate-100">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors">
          <ChevronLeft size={28} />
        </button>
        <h1 className="text-xl font-bold text-indigo-600">Payment History</h1>
        <div className="w-10" />
      </header>

      <div className="p-4">
        {/* Main Tabs */}
        <div className="flex bg-slate-200/50 p-1.5 rounded-full mb-4">
          {['Receive', 'Purchase'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-full font-bold text-sm transition-all ${
                activeTab === tab ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Stats Card */}
        <div className="bg-slate-900 rounded-[24px] p-6 text-white shadow-xl mb-4 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 opacity-20 rounded-full -translate-y-1/2 translate-x-1/2" />
           <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-400 opacity-20 rounded-full translate-y-1/2 -translate-x-1/3" />
           
           <div className="grid grid-cols-2 gap-y-4 relative z-10">
              <div>
                 <span className="text-slate-400 text-sm font-medium">Balance:</span>
                 <div className="text-2xl font-black flex items-center gap-1">
                    <span className="text-lg font-normal text-indigo-400">₹</span> 0.86
                 </div>
              </div>
              <div className="text-right">
                 <span className="text-slate-400 text-sm font-medium">Reward:</span>
                 <div className="text-2xl font-black flex items-center gap-1 justify-end">
                    <span className="text-lg font-normal text-indigo-400">₹</span> 1852.24
                 </div>
              </div>
              <div className="col-span-2 flex justify-end">
                 <div className="text-right">
                    <span className="text-slate-400 text-sm font-medium">Pending:</span>
                    <div className="text-2xl font-black flex items-center gap-1 justify-end">
                       <span className="text-lg font-normal text-indigo-400">₹</span> 0
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Sub-tabs */}
        <div className="flex gap-4 mb-6">
           {['INR', 'USDT'].map(tab => (
             <button
               key={tab}
               onClick={() => setActiveSubTab(tab)}
               className={`flex-1 py-2 rounded-xl font-bold text-sm border transition-all ${
                 activeSubTab === tab ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : 'bg-white text-slate-400 border-slate-100'
               }`}
             >
               {tab}
             </button>
           ))}
        </div>

        {/* History List */}
        <div className="space-y-4">
          {loading ? (
             <div className="flex justify-center py-20">
               <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
             </div>
          ) : historyItems.length > 0 ? (
            historyItems.map((item, idx) => (
              <div key={idx} className="bg-white rounded-[24px] p-5 shadow-sm border border-slate-100 relative group active:scale-[0.98] transition-all">
                <div className="flex justify-between items-start">
                    <div>
                      <div className={`text-3xl font-black italic mb-1 ${item.action === 'credit' ? 'text-indigo-600' : 'text-red-600'}`}>
                          {item.action === 'credit' ? '+' : '-'} ₹ {item.amount}
                      </div>
                      <div className="text-slate-900 font-bold text-sm mb-2">
                          Balance: <span className="text-blue-600">₹ {item.balanceAfter}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 text-[11px] font-bold">
                          <span>{item.description}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-3 pt-1">
                      <div className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-[10px] font-bold flex items-center gap-1 border border-green-200">
                          <div className="w-2.5 h-2.5 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-[6px]">✓</span>
                          </div>
                          Success
                      </div>
                      <div className="text-right">
                          <div className="text-slate-900 text-[10px] font-bold">
                            {new Date(item.createdAt).toLocaleTimeString()}
                          </div>
                          <div className="text-slate-400 text-[10px] font-bold">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </div>
                      </div>
                    </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
               <History size={48} className="mb-4 opacity-20" />
               <p className="font-bold">No transaction history found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

