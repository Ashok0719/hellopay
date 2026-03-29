'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Zap, 
  Settings, 
  LogOut, 
  Bell, 
  Search, 
  Activity, 
  Terminal, 
  CheckCircle, 
  XCircle, 
  Monitor, 
  Plus, 
  Save, 
  Trash2, 
  ShieldCheck, 
  ChevronRight, 
  UserPlus, 
  LayoutGrid, 
  Minus, 
  Check, 
  RefreshCw, 
  Cpu,
  Clock,
  ArrowRightLeft
} from 'lucide-react';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { io } from 'socket.io-client';

const api = axios.create({
  baseURL: typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5000/api/admin'
    : (process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api/admin` : 'https://api.hellopayapp.com/api/admin'),
});

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState<any>(null);
  const [config, setConfig] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stagedCount, setStagedCount] = useState(0);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, configRes] = await Promise.all([
        api.get('/analytics'),
        api.get('/config')
      ]);
      setStats(statsRes.data);
      if (configRes.data) {
         const plans = (configRes.data.stockPlans || []).map((p: any) => ({
           ...p, isActive: p.isActive !== undefined ? p.isActive : true
         }));
         setConfig({ ...configRes.data, stockPlans: plans });
      } else {
         // Handle empty response gracefully
         setConfig({ stockPlans: [], globalCashbackPercent: 4 });
      }
    } catch (err) {
      console.error('Initial data fetch failed');
      // Prevent UI crash on data failure by providing functional defaults
      setConfig({ stockPlans: [], globalCashbackPercent: 4 });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const socketUrl = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? 'http://localhost:5000'
      : 'https://api.hellopayapp.com';
    const socket = io(socketUrl);
    return () => { socket.disconnect(); };
  }, []);

  const handleGlobalPush = async () => {
    setIsSaving(true);
    try {
      await api.put('/config', config);
      setStagedCount(0);
      alert('Neural Core Synchronized Successfully');
    } catch (err) {
      alert('Propagation Failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfigChange = async (newConfig: any) => {
    setConfig(newConfig);
    setStagedCount(prev => prev + 1);
    
    // Instant Neural Sync: Auto-save to backend
    try {
      await api.put('/config', newConfig);
      setStagedCount(0);
    } catch (err) {
      console.error('Auto-sync failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-blue-500/30 overflow-hidden flex">
      {/* Sidebar */}
      <aside className="w-80 border-r border-white/5 bg-[#030712] flex flex-col p-8 fixed h-full z-50 shadow-2xl">
           <div className="flex items-center gap-4 mb-20 px-8">
              <div className="w-14 h-14 bg-blue-600 rounded-[20px] shadow-[0_20px_40px_rgba(37,99,235,0.4)] flex items-center justify-center">
                 <Zap size={28} className="text-white fill-white" />
              </div>
              <div>
                 <h1 className="text-2xl font-black italic tracking-tighter text-white leading-none">HelloPay</h1>
                 <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500 mt-1 block">Admin Registry</span>
              </div>
           </div>

        <nav className="flex-1 space-y-3">
          <SidebarLink icon={<LayoutDashboard size={20}/>} label="Neural Dash" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarLink icon={<Users size={20}/>} label="Entity Registry" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
          <SidebarLink icon={<LayoutGrid size={20}/>} label="Asset Manager" active={activeTab === 'assets'} onClick={() => setActiveTab('assets')} />
          <SidebarLink icon={<Activity size={20}/>} label="TX Monitoring" active={activeTab === 'monitoring'} onClick={() => setActiveTab('monitoring')} />
          <SidebarLink icon={<Settings size={20}/>} label="Admin Limits" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-80 p-12 overflow-y-auto max-h-screen custom-scrollbar relative">
        <div className="flex justify-between items-center mb-16 relative z-10">
          <div className="relative w-96">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={20} />
            <input 
              type="text" 
              placeholder="Query Node..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-5 pl-16 pr-8 bg-slate-900/40 border border-white/5 rounded-[32px] text-sm focus:outline-none focus:border-blue-500/40 transition-all font-medium" 
            />
          </div>

          <div className="flex items-center gap-8">
            <motion.button 
              animate={stagedCount > 0 ? { scale: [1, 1.05, 1], boxShadow: '0 0 30px rgba(37,99,235,0.4)' } : {}}
              onClick={handleGlobalPush}
              disabled={isSaving || !config}
              className="flex items-center gap-4 px-12 py-5 bg-blue-600 rounded-[32px] text-white font-black text-[12px] uppercase tracking-[0.3em] shadow-xl hover:scale-105 active:scale-95 transition-all relative"
            >
              <Save size={18}/> {isSaving ? 'PUBLISHING...' : `Push Final Sync`}
              {stagedCount > 0 && (
                 <div className="absolute -top-3 -right-3 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-[11px] font-black italic border-2 border-[#020617] animate-bounce shadow-2xl">
                   {stagedCount}
                 </div>
              )}
            </motion.button>
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center font-black text-xs text-white">DP</div>
          </div>
        </div>

        {isLoading ? (
           <div className="flex flex-col items-center justify-center h-[60vh] gap-6">
              <RefreshCw className="text-blue-500 animate-spin" size={48} />
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-600 animate-pulse">Establishing Signal...</p>
           </div>
        ) : (
          <div className="relative z-10">
            <AnimatePresence mode="wait">
               {activeTab === 'dashboard' && <DashboardView key="dash" stats={stats} />}
               {activeTab === 'users' && <UserRegistry key="users" searchQuery={searchQuery} />}
               {activeTab === 'assets' && <AssetManager key="assets" config={config} setConfig={handleConfigChange} />}
               {activeTab === 'monitoring' && <MonitoringView key="monitoring" searchQuery={searchQuery} />}
               {activeTab === 'settings' && <OperationsCenter key="settings" config={config} setConfig={handleConfigChange} />}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}

// --- Dashboard View ---
function DashboardView({ stats }: any) {
  const chartData = stats?.dailyStats || [{ name: '00:00', val: 400 }, { name: '12:00', val: 900 }, { name: '23:59', val: 950 }];
  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-12 pb-20">
      <div className="grid grid-cols-4 gap-10">
        <StatCard label="Live Entities" value={stats?.totalUsers || '0'} icon={<Users size={24}/>} color="blue" />
        <StatCard label="Network Flow" value={`₹${stats?.totalTransferred?.toLocaleString() || '0'}`} icon={<CreditCard size={24}/>} color="amber" />
        <StatCard label="Neural Profit" value={`₹${stats?.totalAdminProfit?.toLocaleString() || '0'}`} icon={<Zap size={24}/>} color="emerald" />
        <StatCard label="Released Yield" value={`₹${stats?.totalCashbackGiven?.toLocaleString() || '0'}`} icon={<Plus size={24}/>} color="purple" />
      </div>
      <div className="grid grid-cols-3 gap-12">
        <div className="col-span-2 bg-[#030712] border border-white/5 rounded-[56px] p-12 h-[500px]">
          <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-12">Throughput Matrix</h3>
          <ResponsiveContainer width="100%" height="80%">
             <AreaChart data={chartData}><Area type="monotone" dataKey="val" stroke="#3b82f6" fill="#1e3a8a22" strokeWidth={5} /></AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-[#030712] border border-white/5 rounded-[56px] p-10 flex flex-col h-[500px]">
           <h3 className="text-xl font-black italic uppercase tracking-tighter mb-10 pb-8 border-b border-white/5 flex items-center gap-4"><Terminal size={24}/> Neural Logs</h3>
           <div className="flex-1 space-y-6 overflow-y-auto pr-2 scrollbar-hide font-mono text-[11px]">
              <LogItem type="success" msg="Signal: AUTH_NODE_X92" timestamp="LIVE" />
              <LogItem type="info" msg="Connecting Liquidity_SYNC..." timestamp="LIVE" />
              <LogItem type="warning" msg="Manual Override ACTIVE" timestamp="LIVE" />
           </div>
        </div>
      </div>
    </motion.div>
  );
}

function UserRegistry({ searchQuery }: { searchQuery: string }) {
  const [users, setUsers] = useState<any[]>([]);
  useEffect(() => {
    const fetchUsers = async () => {
      try { const { data } = await api.get('/users'); setUsers(data); } catch (err) {}
    };
    fetchUsers();
  }, []);
  const handleBlock = async (id: string, isBlocked: boolean) => {
    console.log('Initiating Neutral Lockdown for ID:', id, 'Current State:', isBlocked);
    try { 
      const res = await api.put(`/user/${id}/block`); 
      console.log('Security Logic Synchronized:', res.data);
      setUsers(prev => prev.map(u => u._id === id ? { ...u, isBlocked: !isBlocked } : u));
    } catch (err) {
      console.error('Lockdown Propagation Failed:', err);
      alert('Security Override Failed. Check Backend Connection.');
    }
  };

  const handleEditBalance = async (id: string, currentBalance: number) => {
    const newAmount = prompt(`Neural Override: Input New Balance for Node ${id}`, currentBalance.toString());
    if (newAmount !== null && !isNaN(parseFloat(newAmount))) {
      try {
        const { data } = await api.put(`/user/${id}/balance`, { amount: parseFloat(newAmount) });
        setUsers(prev => prev.map(u => u._id === id ? { ...u, walletBalance: data.walletBalance } : u));
      } catch (err) {
        alert('Neural Injection Failed');
      }
    }
  };

  const filteredUsers = users.filter(u => 
    (u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false) || 
    (u.userIdNumber?.toString().includes(searchQuery) || false)
  );

  return (
    <div className="space-y-10">
      <h2 className="text-5xl font-black italic uppercase tracking-tighter text-white">Entity <span className="text-blue-500">Registry</span></h2>
      <div className="space-y-6">
        {filteredUsers.map((user, i) => (
          <div key={user._id} className="bg-slate-900/40 border border-white/5 p-10 rounded-[56px] flex items-center justify-between shadow-2xl group hover:border-blue-500/30 transition-all">
             <div className="flex items-center gap-10">
                <div className="w-20 h-20 bg-slate-800 rounded-[32px] flex items-center justify-center font-black text-3xl text-blue-500 italic uppercase">{user.name[0]}</div>
                <div>
                   <h4 className={`text-2xl font-black italic transition-all ${user.isBlocked ? 'text-red-500 underline decoration-red-500/50' : 'text-white'}`}>{user.name}</h4>
                   <div className="flex items-center gap-3 mt-2">
                      <div className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-mono text-slate-500 uppercase tracking-widest">ID_{user.userIdNumber}</div>
                      {user.isBlocked && (
                        <div className="px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-full text-[9px] font-black text-red-500 uppercase tracking-tighter animate-pulse">ID SUSPENDED</div>
                      )}
                   </div>
                </div>
             </div>
             <div className="flex items-center gap-12">
                <div 
                  onClick={() => handleEditBalance(user._id, user.walletBalance)}
                  className="flex items-center gap-4 cursor-pointer hover:bg-white/5 p-4 rounded-3xl transition-all border border-transparent hover:border-white/5"
                >
                   <span className={`text-xl font-black italic tabular-nums transition-all ${user.isBlocked ? 'text-red-400' : 'text-white'}`}>₹{user.walletBalance.toLocaleString()}</span>
                   <RefreshCw size={14} className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleBlock(user._id, !!user.isBlocked); }} 
                  className={`w-12 h-12 rounded-[14px] flex items-center justify-center transition-all cursor-pointer z-20 ${user.isBlocked ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-white/5 text-slate-600 hover:bg-white/10'}`}
                >
                  <Trash2 size={20}/>
                </button>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Asset Manager ---
function AssetManager({ config, setConfig }: any) {
  const addPlan = () => {
    const amount = prompt('Input Neural Asset Amount (₹)');
    if (amount && !isNaN(parseInt(amount))) {
      const amtNum = parseInt(amount);
      const newPlan = { amount: amtNum, code: `SIG${amtNum}`, isDefault: false, isActive: true };
      const currentPlans = config?.stockPlans || [];
      setConfig({ ...config, stockPlans: [...currentPlans, newPlan] });
    }
  };
  const setPlanActive = (idx: number, status: boolean, e: any) => {
    e.stopPropagation();
    const newPlans = [...(config?.stockPlans || [])]; 
    if (newPlans[idx]) {
      newPlans[idx] = { ...newPlans[idx], isActive: status };
      setConfig({ ...config, stockPlans: newPlans });
    }
  };
  const removePlan = (idx: number, e: any) => {
    e.stopPropagation();
    const newPlans = (config?.stockPlans || []).filter((_: any, i: number) => i !== idx);
    setConfig({ ...config, stockPlans: newPlans });
  };
  return (
    <div className="space-y-12">
      <div className="flex justify-between items-center">
         <h2 className="text-5xl font-black italic uppercase tracking-tighter text-white">Asset <span className="text-blue-500">Commander</span></h2>
         <button onClick={addPlan} className="px-12 py-5 bg-white/5 border border-white/10 rounded-[32px] text-white font-black text-[11px] uppercase tracking-[0.3em] hover:bg-white/10 transition-all font-mono">Inject Proposal</button>
      </div>
      <div className="grid grid-cols-4 gap-10">
        {config?.stockPlans?.map((plan: any, i: number) => (
          <div key={i} className={`group relative p-10 rounded-[56px] border transition-all duration-700 ${plan.isActive ? 'bg-[#030712] border-indigo-600 shadow-indigo-500/10 shadow-2xl' : 'bg-slate-900/40 border-white/5 opacity-40 grayscale'}`}>
             <button 
                onClick={(e) => removePlan(i, e)} 
                className="absolute top-8 right-8 w-12 h-12 rounded-2xl bg-red-600/10 text-red-500 flex items-center justify-center border border-red-500/20 hover:bg-red-600 hover:text-white transition-all shadow-lg active:scale-95 z-20"
             >
                <Trash2 size={20} />
             </button>
             <div className={`w-20 h-20 rounded-[32px] flex items-center justify-center italic font-black text-4xl mb-8 ${plan.isActive ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30' : 'bg-white/5 text-slate-800'}`}>₹</div>
             <h4 className={`text-4xl font-black italic tabular-nums mb-8 ${plan.isActive ? 'text-white' : 'text-slate-600'}`}>₹{plan.amount}</h4>
             <div className="flex gap-4">
                <button onClick={(e) => setPlanActive(i, true, e)} className={`flex-1 h-14 rounded-2xl flex items-center justify-center transition-all ${plan.isActive ? 'bg-blue-600 text-white shadow-xl shadow-blue-400/20' : 'bg-white/5 text-slate-600 hover:bg-blue-500/20'}`}><Check size={24}/></button>
                <button onClick={(e) => setPlanActive(i, false, e)} className={`flex-1 h-14 rounded-2xl flex items-center justify-center transition-all ${!plan.isActive ? 'bg-red-600 text-white shadow-xl shadow-red-400/20' : 'bg-white/5 text-slate-600 hover:bg-red-500/20'}`}><Minus size={24}/></button>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- TX Monitoring View (Real-time Feed) ---
function MonitoringView({ searchQuery }: { searchQuery: string }) {
  const [txs, setTxs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTxs = async () => {
    try {
      const { data } = await api.get('/transactions');
      setTxs(data);
    } catch (err) {
      console.error('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTxs();
  }, []);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    try {
      await api.post(`/transactions/${id}/${action}`);
      fetchTxs(); // Refresh list
    } catch (err) {
      alert('Action failed');
    }
  };

  const filteredTxs = txs.filter(tx => 
    tx.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tx._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tx.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="text-center py-20 animate-pulse text-slate-500 font-black uppercase tracking-widest text-[10px]">Synchronizing Ledger...</div>;

  return (
    <div className="space-y-12">
      <h2 className="text-5xl font-black italic uppercase tracking-tighter text-white flex items-center gap-6">TX <span className="text-indigo-500 italic">Monitoring</span> <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center animate-pulse"><div className="w-2 h-2 bg-indigo-500 rounded-full shadow-lg" /></div></h2>
      <div className="space-y-6">
        {filteredTxs.map((tx, i) => (
          <div key={tx._id} className="bg-slate-900/40 border border-white/5 p-10 rounded-[56px] flex items-center justify-between shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 opacity-20" />
             <div className="flex items-center gap-10">
                <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center shadow-inner ${tx.type === 'DEPOSIT' || tx.type === 'buy_stock' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                   <ArrowRightLeft size={24} />
                </div>
                <div className="flex-1">
                   <div className="flex items-center gap-3">
                      <h4 className="text-xl font-black text-white italic">{tx.user?.name || 'Anonymous User'}</h4>
                      <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-white/5 rounded-md border border-white/10 text-slate-500">{tx.type.replace('_', ' ')}</span>
                   </div>
                   <div className="flex items-center gap-4 mt-2">
                      <span className="text-[10px] font-mono text-slate-600 uppercase tracking-widest flex items-center gap-2"><Clock size={12}/> {new Date(tx.createdAt).toLocaleString()}</span>
                      <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full ${tx.status === 'PENDING' ? 'bg-indigo-600/10 text-indigo-500 border border-indigo-500/10' : tx.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/10' : 'bg-red-500/10 text-red-500 border border-red-500/10'}`}>{tx.status}</span>
                   </div>
                   {tx.receiptUrl && (
                     <a href={`http://localhost:5000${tx.receiptUrl}`} target="_blank" className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-white transition-colors">
                        <Monitor size={12} /> View Receipt Evidence
                     </a>
                   )}
                </div>
             </div>
             <div className="flex items-center gap-12 font-black italic text-2xl tabular-nums text-white">
                ₹{tx.amount.toLocaleString()}
                <div className="flex gap-4 ml-8 px-8 border-l border-white/5 text-sm h-16 items-center">
                   {tx.status === 'PENDING' && (
                     <>
                       <button onClick={() => handleAction(tx._id, 'approve')} className="w-14 h-14 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all shadow-xl shadow-emerald-500/5 items-center">
                          <Check size={24} />
                       </button>
                       <button onClick={() => handleAction(tx._id, 'reject')} className="w-14 h-14 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-xl shadow-red-500/5 items-center">
                          <Minus size={24} />
                       </button>
                     </>
                   )}
                </div>
             </div>
          </div>
        ))}
        {filteredTxs.length === 0 && (
          <div className="text-center py-20 text-slate-700 font-bold uppercase tracking-widest text-xs">No transactions in neural queue</div>
        )}
      </div>
    </div>
  );
}

// --- Operations Center ---
function OperationsCenter({ config, setConfig }: any) {
  if (!config) return null;
  return (
    <div className="bg-[#030712] border border-white/5 rounded-[56px] p-20 shadow-2xl relative overflow-hidden">
       <h2 className="text-6xl font-black italic uppercase tracking-tighter text-white mb-20 leading-tight">System <span className="text-blue-500">Params</span></h2>
       <div className="p-12 bg-black/40 border border-white/5 rounded-[56px] shadow-inner mb-20">
          <div className="flex justify-between items-end mb-10">
             <div><span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Yield Matrix (%)</span><div className="text-6xl font-black text-white italic tabular-nums">{config.globalCashbackPercent}%</div></div>
          </div>
          <input type="range" min="0" max="30" step="1" value={config.globalCashbackPercent} onChange={(e) => setConfig({...config, globalCashbackPercent: parseInt(e.target.value)})} className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500" />
       </div>
       <div className="grid grid-cols-4 gap-8">
          <OpToggle label="Profit" active={config.adminProfitEnabled} onChange={() => setConfig({...config, adminProfitEnabled: !config.adminProfitEnabled})} />
          <OpToggle label="Sign" active={config.adminExtraEnabled} onChange={() => setConfig({...config, adminExtraEnabled: !config.adminExtraEnabled})} />
          <OpToggle label="In" active={config.depositEnabled} onChange={() => setConfig({...config, depositEnabled: !config.depositEnabled})} />
          <OpToggle label="Out" active={config.withdrawalEnabled} onChange={() => setConfig({...config, withdrawalEnabled: !config.withdrawalEnabled})} />
       </div>
    </div>
  );
}

// Helpers
function SidebarLink({ icon, label, active, onClick }: any) {
  return <button onClick={onClick} className={`w-full flex items-center gap-6 px-8 py-5 rounded-[24px] transition-all duration-300 ${active ? 'bg-blue-600 text-white shadow-[0_20px_40px_rgba(37,99,235,0.4)]' : 'text-slate-500 hover:bg-white/5'}`}>{icon} <span className="text-[13px] font-black uppercase tracking-[0.2em] italic transition-colors group-hover:text-white">{label}</span></button>;
}
function StatCard({ label, value, icon, color }: any) {
  const colors: any = { blue: 'border-blue-500/20 bg-blue-500/[0.03] text-blue-400', amber: 'border-amber-500/20 bg-amber-500/[0.03] text-amber-400', emerald: 'border-emerald-500/20 bg-emerald-500/[0.03] text-emerald-400', purple: 'border-purple-500/20 bg-purple-500/[0.03] text-purple-400' };
  return <div className={`p-10 rounded-[56px] border ${colors[color]} hover:scale-105 transition-all cursor-pointer shadow-2xl`}><div className="flex flex-col gap-10"> <div className="w-16 h-16 rounded-[24px] bg-white/5 flex items-center justify-center border border-white/10 group-hover:rotate-12 transition-transform shadow-inner">{icon}</div> <div className="space-y-1"> <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 leading-none">{label}</p> <h4 className="text-4xl font-black italic text-white leading-none mt-4 tabular-nums">{value}</h4> </div> </div> </div>;
}
function LogItem({ type, msg, timestamp }: any) {
  const col = type === 'success' ? 'text-emerald-500' : 'text-blue-500';
  return <div className="flex gap-4"><span className="text-[9px] text-slate-700 pt-0.5">[{timestamp}]</span><p className={`text-[10px] font-black ${col} italic tracking-tight`}>{msg}</p></div>;
}
function OpToggle({ label, active, onChange }: any) {
  return <button onClick={onChange} className="flex flex-col items-center justify-center p-10 bg-[#030712] border border-white/5 rounded-[56px] gap-8 hover:border-blue-500/30 transition-all flex-1 shadow-2xl group"> <span className="text-[11px] font-black uppercase text-slate-600 group-hover:text-slate-400 tracking-[0.3em]">{label}</span> <div className={`w-20 h-10 rounded-full p-1.5 transition-all flex ${active ? 'bg-blue-600 justify-end shadow-[0_0_20px_rgba(37,99,235,0.4)]' : 'bg-slate-800 justify-start'}`}><div className="w-7 h-7 bg-white rounded-full shadow-2xl" /></div> </button>;
}
