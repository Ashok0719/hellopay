'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet,
  Send,
  Plus,
  Smartphone,
  History,
  Settings,
  LogOut,
  QrCode,
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard, 
  Home, 
  User as UserIcon, 
  Zap, 
  ArrowRight, 
  ShieldCheck, 
  Trash2, 
  CheckCircle, 
  Lock, 
  RefreshCcw, 
  ChevronRight, 
  Camera,
  Search,
  Bell,
  Activity,
  Copy,
  LayoutGrid,
  Target,
  Users,
  MessageSquare,
  ArrowUp,
  ArrowDown,
  Clock,
  CircleUser,
  Check
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/hooks/useAuth';
import api from '@/lib/api';
import { io } from 'socket.io-client';

export default function Dashboard() {
  const { user, setUser, logout, token } = useAuthStore();
  const [activeTab, setActiveTab] = useState('home');
  const [history, setHistory] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [config, setConfig] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const router = useRouter();

  // Initial data synchronization
  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      if (token === 'guest_token_demo_123') {
        setUser({ _id: 'guest_id', userIdNumber: 528391, name: 'Guest User', phone: '9999988888', walletBalance: 0.86, isSeller: false } as any);
        setIsLoading(false);
        return;
      }
      try {
        const { data: profile } = await api.get('/auth/profile');
        setUser(profile);
        
        const { data: txHistory } = await api.get('/transactions/history');
        setHistory(txHistory);

        const { data: activeListings } = await api.get('/listings');
        setListings(activeListings);

        const { data: sysConfig } = await api.get('/wallet/config');
        setConfig(sysConfig);
      } catch (err) {
        logout();
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [setUser, logout, router, token]);
  
  // Real-time Neural Synchronization (Socket.io)
  useEffect(() => {
    const socketUrl = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? 'http://localhost:5000'
      : 'https://api.hellopayapp.com';
    
    const socket = io(socketUrl);

    socket.on('configUpdated', (newConfig) => {
      console.log('Neural Signal: Config Updated', newConfig);
      setConfig(newConfig);
    });

    socket.on('userStatusChanged', (data) => {
      if (user && data.userId === user._id) {
        setUser({ 
          ...user, 
          isBlocked: data.isBlocked !== undefined ? data.isBlocked : user.isBlocked,
          walletBalance: data.walletBalance !== undefined ? data.walletBalance : user.walletBalance
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user, setUser]);

  const forceSync = async () => {
    setIsSyncing(true);
    try {
      const { data: profile } = await api.get('/auth/profile');
      setUser(profile);
      const { data: sysConfig } = await api.get('/wallet/config');
      setConfig(sysConfig);
      const { data: txHistory } = await api.get('/transactions/history');
      setHistory(txHistory);
    } catch (err) {}
    setTimeout(() => setIsSyncing(false), 800);
  };

  const handleClaim = async (idOrAmount: string | number) => {
    // Determine if it's a direct amount (System Plan) or a Listing ID
    if (typeof idOrAmount === 'number' || !isNaN(Number(idOrAmount))) {
      const amt = Number(idOrAmount);
      // For system plans, we go straight to payment simulation for this demo/prod hybrid
      router.push(`/dashboard/pay?amount=${amt}&method=phonepe`);
      return;
    }

    try {
      const { data } = await api.post(`/listings/${idOrAmount}/claim`);
      // Redirect to a claim/pay page with the UPI intent
      router.push(`/dashboard/pay?orderId=${data.orderId}&amount=${data.amount}&upiIntent=${encodeURIComponent(data.upiIntent)}&txnId=${data.transactionId}`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to initiate claim');
    }
  };

  if (user?.isBlocked) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-8 border border-red-500/20">
          <Lock className="text-red-500" size={48 } />
        </div>
        <h1 className="text-3xl font-black text-white mb-4 italic uppercase tracking-tighter">Account Locked</h1>
        <p className="text-slate-400 text-sm leading-relaxed mb-10 max-w-xs">
          Your neural node has been suspended by the administration. All transactions and asset access are currently frozen.
        </p>
        <button 
          onClick={() => { logout(); router.push('/login'); }}
          className="px-10 py-4 bg-white/5 border border-white/10 rounded-full text-white font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
        >
          Logout of Node
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 font-sans max-w-lg mx-auto shadow-2xl overflow-hidden relative border-x border-slate-200">
      {/* Dynamic Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'home' && (
          <HomeView 
            key="home" 
            user={user} 
            history={history} 
            listings={listings}
            openDeposit={() => setShowDepositModal(true)} 
            config={config}
            setActiveTab={setActiveTab}
            handleClaim={handleClaim}
            router={router}
            forceSync={forceSync}
            isSyncing={isSyncing}
          />
        )}
        {activeTab === 'statistics' && <StatisticsView key="stats" user={user} />}
        {activeTab === 'my' && <MyView key="my" user={user} logout={() => { logout(); router.push('/login'); }} />}
        {activeTab === 'payment' && <PaymentView key="payment" user={user} config={config} handleClaim={handleClaim} />}
      </AnimatePresence>

      {/* Robot Floating Support */}
      <div className="fixed bottom-24 right-4 z-40">
        <div className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center border border-emerald-100 overflow-hidden cursor-pointer active:scale-95 transition-transform">
          <img src="https://img.icons8.com/color/96/chatbot.png" alt="Support" className="w-10 h-10" />
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-20 bg-white border-t border-slate-100 flex items-center justify-around px-2 z-50">
        <BottomNavItem 
          icon={<HomeIcon active={activeTab === 'home'} />} 
          label="Home" 
          active={activeTab === 'home'} 
          onClick={() => setActiveTab('home')} 
        />
        <BottomNavItem 
          icon={<CreditCard className={activeTab === 'payment' ? 'text-emerald-500' : 'text-slate-400'} size={24} />} 
          label="Payment" 
          active={activeTab === 'payment'} 
          onClick={() => setActiveTab('payment')} 
        />
        
        {/* Middle Wallet Button (Yellow Hub) */}
        <div className="relative -top-3">
          <button 
            onClick={() => setShowDepositModal(true)}
            className="w-16 h-16 bg-[#facc15] rounded-full flex items-center justify-center shadow-xl shadow-yellow-100 border-4 border-slate-50 active:scale-95 hover:scale-105 transition-all"
          >
            <div className="p-2 bg-slate-900/10 rounded-xl">
               <Wallet className="text-slate-800" size={28} />
            </div>
          </button>
        </div>

        <DepositModal 
          isOpen={showDepositModal} 
          onClose={() => setShowDepositModal(false)}
          config={config}
          onSelect={(method: string, amt: string) => {
            router.push(`/dashboard/pay?amount=${amt}&method=${method}`);
            setShowDepositModal(false);
          }}
        />

        <BottomNavItem 
          icon={<Users className={activeTab === 'statistics' ? 'text-emerald-500' : 'text-slate-400'} size={24} />} 
          label="Statistics" 
          active={activeTab === 'statistics'} 
          onClick={() => setActiveTab('statistics')} 
        />
        <BottomNavItem 
          icon={<CircleUser className={activeTab === 'my' ? 'text-emerald-500' : 'text-slate-400'} size={24} />} 
          label="My" 
          active={activeTab === 'my'} 
          onClick={() => setActiveTab('my')} 
        />
      </nav>
    </div>
  );
}

// --- Home View ---
function HomeView({ user, history, listings, openDeposit, config, setActiveTab, handleClaim, router, forceSync, isSyncing }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="p-4"
    >
      {/* User Header */}
      <div className="flex justify-between items-center mb-6 px-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full border-2 border-white shadow-sm overflow-hidden bg-slate-100 flex items-center justify-center text-slate-400">
             <UserIcon size={28} fill="currentColor" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-slate-800 leading-tight">{user?.name}</h2>
            <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-tighter">
              <span>{user?.phone}</span>
              <span className="w-1 h-1 bg-slate-300 rounded-full" />
              <span className="text-emerald-600 font-bold">ID: {user?.userIdNumber || '******'}</span>
              {user?.isSeller && (
                <Link href="/dashboard/seller" className="bg-emerald-600 text-white px-2 py-0.5 rounded-md flex items-center gap-1">
                  <ShieldCheck size={10} /> HelloPay Seller
                </Link>
              )}
            </div>
            <div className="w-5 h-5 rounded-md bg-emerald-50 flex items-center justify-center text-emerald-600 cursor-pointer active:scale-90 transition-transform shadow-sm">
                  <Copy size={10} />
            </div>
          </div>
        </div>
        <div className="relative p-2 bg-white rounded-2xl shadow-sm border border-slate-100 active:scale-95 transition-all">
          <Bell size={22} className="text-slate-600" />
          <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
        </div>
      </div>

      {/* Main Balance Card (Emerald Theme) */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#10b981] to-[#059669] p-8 text-white shadow-xl shadow-emerald-100 mb-4 border-b-4 border-emerald-700/20">
        {/* Abstract Shapes */}
        <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-yellow-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-32 h-32 bg-emerald-300/20 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex flex-col gap-10">
               <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                     <div className="w-16 h-16 bg-white/10 rounded-[28px] flex items-center justify-center border border-white/20 shadow-inner">
                        <Zap size={28} className="text-white fill-white" />
                     </div>
                     <div>
                        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60">Neural Value</h2>
                        <div className="flex items-center gap-4 mt-2">
                           <h1 className="text-5xl font-black italic tracking-tighter tabular-nums">₹{user?.walletBalance.toLocaleString() || '0.00'}</h1>
                           <button 
                             onClick={forceSync}
                             className={`p-2 rounded-full hover:bg-white/10 transition-all ${isSyncing ? 'animate-spin opacity-100' : 'opacity-40'}`}
                           >
                             <RefreshCcw size={20} />
                           </button>
                        </div>
                     </div>
                  </div>
                  <button onClick={openDeposit} className="w-14 h-14 bg-yellow-400 rounded-full flex items-center justify-center shadow-[0_15px_30px_rgba(250,204,21,0.4)] active:scale-90 transition-all">
                     <Plus size={32} className="text-slate-950" />
                  </button>
               </div>
          </div>
        </div>
      </div>

      {/* Stats Bar (Emerald-Dual Pane) */}
      <div className="bg-[#10b981] rounded-3xl p-4 mb-8 flex items-center justify-between text-white shadow-md relative overflow-hidden">
        <div className="absolute top-[-50%] right-[-10%] w-20 h-20 bg-yellow-400/30 rounded-full blur-xl pointer-events-none" />
        <div className="absolute bottom-[-20%] left-[-5%] w-16 h-16 bg-blue-400/20 rounded-full blur-xl pointer-events-none" />
        
        <div className="flex-1 flex flex-col items-center gap-1 border-r border-white/20">
           <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-emerald-100 tracking-widest">
              <ArrowUp size={12} className="text-emerald-200" />
              Deposit
           </div>
           <div className="text-lg font-black tracking-tight">₹{(user?.totalDeposited || 0).toLocaleString()}</div>
        </div>
        
        <div className="flex-1 flex flex-col items-center gap-1">
           <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-emerald-100 tracking-widest">
              <ArrowDown size={12} className="text-red-300" />
              Withdrawal
           </div>
           <div className="text-lg font-black tracking-tight">₹{(user?.totalWithdrawn || 0).toLocaleString()}</div>
        </div>
      </div>

      {/* Quick Action Grid (As per Screenshot) */}
      <div className="grid grid-cols-4 gap-4 mb-8 px-2">
        <QuickActionItem 
          icon={<img src="/icons-v2/deposit.png" className="w-14 h-14 object-contain shadow-sm" />} 
          label="Deposit" 
          onClick={openDeposit}
        />
        <QuickActionItem 
          icon={<img src="/icons-v2/task.png" className="w-14 h-14 object-contain shadow-sm" />} 
          label="Task" 
          onClick={() => setActiveTab('payment')}
        />
        <QuickActionItem 
          icon={<img src="/icons-v2/team.png" className="w-14 h-14 object-contain shadow-sm" />} 
          label="Team" 
          onClick={() => router.push('/dashboard/service')}
        />
        <QuickActionItem 
          icon={<img src="/icons-v2/order.png" className="w-14 h-14 object-contain shadow-sm" />} 
          label="Order" 
          onClick={() => router.push('/dashboard/payment-history')}
        />
      </div>

      {/* Featured Assets Grid */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4 px-2 mt-4">
          <h3 className="text-lg font-black italic uppercase tracking-tighter text-slate-800">Marketplace</h3>
          <span onClick={() => setActiveTab('payment')} className="text-emerald-600 text-[10px] font-black uppercase tracking-widest cursor-pointer hover:underline bg-emerald-50 px-3 py-1 rounded-full">See All</span>
        </div>
        
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 px-1">
          {(() => {
            const displayList = (listings && listings.length > 0) 
              ? listings.map((l: any) => ({ _id: l._id, price: l.price, name: l.stockName, qty: l.quantity }))
              : (config?.stockPlans || []).map((p: any) => ({ _id: p.code || `PL${p.amount}`, price: p.amount, name: `SYSTEM NEURAL NODE ${p.amount}`, qty: '∞' }));

            return displayList.length > 0 ? displayList.map((plan: any, i: number) => (
              <div 
                key={i} 
                onClick={() => handleClaim(plan.price)}
                className="min-w-[160px] bg-white rounded-3xl p-5 border border-slate-100 shadow-sm relative overflow-hidden group cursor-pointer active:scale-95 transition-all"
              >
                <div className="absolute top-0 right-0 w-12 h-12 bg-indigo-500/5 rounded-bl-3xl" />
                <div className="text-2xl font-black text-indigo-600 italic mb-2 leading-none">₹{plan.price}</div>
                <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-4">{plan.name}</div>
                
                <div className="flex justify-between items-center">
                   <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                      <Zap size={14} className="text-white fill-white" />
                   </div>
                   <span className="text-[10px] font-black text-slate-300 uppercase">Qty: {plan.qty}</span>
                </div>
              </div>
            )) : (
               <div className="w-full h-24 bg-slate-50 border border-dashed border-slate-200 rounded-3xl flex items-center justify-center">
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Scanning Marketplace...</p>
               </div>
            );
          })()}
        </div>
      </div>

      {/* Recent Transactions List */}
      <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 min-h-[300px]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-800">Transactions</h3>
          <span className="text-emerald-600 text-[11px] font-black uppercase tracking-widest cursor-pointer hover:underline underline-offset-4 decoration-emerald-200">See All</span>
        </div>

        <div className="space-y-6">
          {history.length > 0 ? history.map((tx: any, i: number) => (
             <TransactionItem key={i} tx={tx} />
          )) : (
            <>
              <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                <History size={48} className="mb-2 opacity-20" />
                <p className="text-sm font-medium">No transactions yet</p>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// --- Statistics View ---
function StatisticsView({ user }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="p-4"
    >
      <h2 className="text-2xl font-bold text-center text-[#10b981] mb-6">Statistics</h2>

      <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 mb-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
          <h3 className="font-bold flex items-center gap-2">Statistics <span className="text-slate-400 text-sm font-normal">(25/03/2026)</span></h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <StatBox icon={<Wallet className="text-teal-500" size={16}/>} label="Balance" value={`₹ ${user?.walletBalance || '0'}`} color="bg-teal-600" />
          <StatBox icon={<RefreshCcw className="text-amber-500" size={16}/>} label="Reward" value={`₹ ${user?.rewardBalance || '0'}`} color="bg-amber-500" />
          <StatBox icon={<Target className="text-emerald-500" size={16}/>} label="Deposit" value={`₹ ${user?.totalDeposited || '0'}`} color="bg-emerald-600" />
          <StatBox icon={<Activity className="text-pink-500" size={16}/>} label="Total Rewards" value={`₹ ${user?.totalRewards || '0'}`} color="bg-pink-500" />
        </div>
      </div>

      <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 mb-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
          <h3 className="font-bold">Payment</h3>
        </div>

        <div className="bg-emerald-50 rounded-xl p-3 flex justify-between items-center mb-6">
          <span className="text-emerald-800 text-sm font-medium">Real Time Exchange Rates(INR/USDT)</span>
          <span className="text-emerald-800 font-bold">103</span>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-4">
          <MiniStatBox label="In Process Amount" value="₹ 0.00" />
          <MiniStatBox label="In Process Orders" value="0" />
          <MiniStatBox label="Commission Rate" value="4.00 %" />
          <MiniStatBox label="Estimated Income" value="₹ 0.00" />
        </div>
      </div>

      <button className="w-full py-4 bg-emerald-600 text-white font-bold rounded-full shadow-lg shadow-emerald-200 active:scale-95 transition-transform mb-12">
        Closed Selling
      </button>
    </motion.div>
  );
}

// --- My View ---
function MyView({ user, logout }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="p-4"
    >
      <h2 className="text-2xl font-bold text-center text-[#10b981] mb-8">My Asset</h2>

      <div className="flex flex-col gap-4 mb-10">
        <div className="grid grid-cols-2 gap-4">
          <AssetCard icon={<CreditCard size={20}/>} label="Deposit" value={`₹ ${user?.totalDeposited || '0'}`} color="text-teal-500" />
          <AssetCard icon={<Wallet size={20}/>} label="Withdraw" value={`₹ ${user?.totalWithdrawn || '0'}`} color="text-emerald-500" />
        </div>
        <AssetCard icon={<RefreshCcw size={20}/>} label="Reward Balance" value={`₹ ${user?.rewardBalance || '0'}`} color="text-amber-500" />
      </div>

      <div className="bg-white rounded-[32px] p-10 shadow-sm border border-slate-100 grid grid-cols-3 gap-y-10 mb-10 relative">
        <MyGridItem icon={<Wallet size={28}/>} label="Wallet" href="/dashboard/wallet" />
        <MyGridItem icon={<Activity size={28}/>} label="Integral" href="/dashboard/score" />
        <MyGridItem icon={<Smartphone size={28}/>} label="Service" href="/dashboard/service" />
        <MyGridItem icon={<MessageSquare size={28}/>} label="Message" href="/dashboard/message" />
        <MyGridItem icon={<Lock size={28}/>} label="Pin" href="/dashboard/pin" />
        
        <span className="absolute bottom-4 right-6 text-[10px] text-slate-300 font-mono">v1.1.3</span>
      </div>

      <button 
        onClick={logout}
        className="w-full py-4 bg-[#10b981] text-white font-bold rounded-full shadow-lg shadow-emerald-100 active:scale-95 transition-transform"
      >
        Logout
      </button>
    </motion.div>
  );
}

// --- Payment View ---
function PaymentView({ user, config, handleClaim }: any) {
  const [activeFilter, setActiveFilter] = useState('All');

  const defaultPlans = [
    { amount: 100, code: 'H100X' },
    { amount: 200, code: 'H200X' },
    { amount: 500, code: 'H500S' },
    { amount: 1000, code: 'H1000S' },
    { amount: 2000, code: 'H2000S' },
  ];

  const plans = (config?.stockPlans || []).filter((p: any) => p.isActive !== false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="p-4"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="w-10" />
        <h2 className="text-2xl font-bold text-center text-emerald-600">HelloPay</h2>
        <Link href="/dashboard/payment-history" className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors shadow-sm">
          <Clock size={24} />
        </Link>
      </div>

      {/* Financial Status Card */}
      <div className="bg-emerald-600 rounded-[32px] p-6 text-white shadow-xl mb-6 flex flex-col gap-6 relative overflow-hidden">
        <div className="flex justify-between items-start">
          <div className="space-y-4">
             <div>
               <span className="text-emerald-100 text-sm font-medium">Global Cashback</span>
               <div className="text-4xl font-black">{config?.globalCashbackPercent || 4}%</div>
             </div>
             <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                <span className="text-emerald-100 text-xs block mb-1">Total Assets</span>
                <div className="text-xl font-bold flex items-center gap-1">
                   <span className="text-sm font-normal">₹</span> {user?.walletBalance.toLocaleString() || '0'}
                </div>
             </div>
          </div>
          
          <div className="flex items-end gap-2 h-24 pt-4">
            <div className="w-4 bg-white/20 rounded-t-sm h-1/2" />
            <div className="w-4 bg-white/40 rounded-t-sm h-[80%]" />
            <div className="w-4 bg-white/60 rounded-t-sm h-[60%]" />
            <div className="w-4 bg-white/30 rounded-t-sm h-full" />
            <div className="w-4 bg-white/50 rounded-t-sm h-[40%]" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
           <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
              <span className="text-emerald-100 text-xs block mb-1">Reward Wallet</span>
              <div className="text-lg font-bold flex items-center gap-1">
                 <span className="text-sm font-normal">₹</span> {(user?.rewardBalance || 0).toLocaleString()}
              </div>
           </div>
           <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
              <span className="text-emerald-100 text-xs block mb-1">Pending Sync</span>
              <div className="text-lg font-bold flex items-center gap-1">
                 <span className="text-sm font-normal">₹</span> 0
              </div>
           </div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-[11px] text-emerald-600 font-bold mb-6 px-1">
        <div className="w-4 h-4 rounded-full border border-emerald-500 flex items-center justify-center text-[10px]">!</div>
        <p>Purchased stocks will be split according to system rules.</p>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-6 custom-scrollbar no-scrollbar">
        {['All', '100-300', '300-500', '500-700', '700-1000', '1000-3000', '3000-6000', '6000-8000', '8000-10000', '10000-15000'].map(filter => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-5 py-2 rounded-full whitespace-nowrap font-bold text-sm transition-all ${
              activeFilter === filter ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="space-y-4 mb-20">
        {plans.filter((p: any) => {
          if (activeFilter === 'All') return true;
          const [min, max] = activeFilter.split('-').map(Number);
          return p.amount >= min && p.amount <= max;
        }).map((plan: any, idx: number) => (
          <div key={idx} className="bg-white rounded-[24px] p-5 shadow-sm border border-slate-100 flex justify-between items-center group active:scale-[0.98] transition-all">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-black text-emerald-600 italic">₹ {plan.amount}</span>
                <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-slate-900 text-[10px] font-bold rounded-md border border-emerald-100 italic">
                  <span className="text-emerald-500 font-medium">SIG</span> {plan.code || `PL${plan.amount}`}
                </div>
              </div>
              <div className="space-y-1">
                 <div className="text-slate-500 text-xs font-medium">Potential Split: <span className="text-emerald-600 font-bold">Dual Node</span></div>
                 <div className="text-slate-500 text-xs font-medium">Cashback: <span className="text-teal-500 font-bold">{(plan.amount * (config?.globalCashbackPercent || 4) / 100).toFixed(0)}</span></div>
              </div>
            </div>
            <button 
              onClick={() => handleClaim(plan.amount)}
              className="px-6 py-2 bg-emerald-600 text-white rounded-full text-sm font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-colors"
            >
              Claim
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// --- Sub-components ---

function QuickActionItem({ icon, label, onClick }: any) {
  return (
    <div onClick={onClick} className="flex flex-col items-center gap-2 cursor-pointer group active:scale-95 transition-all">
      <div className="w-16 h-16 bg-white rounded-3xl shadow-sm border border-slate-50 flex items-center justify-center group-hover:shadow-md group-hover:-translate-y-0.5 transition-all">
         {icon}
      </div>
      <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tight">{label}</span>
    </div>
  );
}

function BottomNavItem({ icon, label, active, onClick }: any) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 min-w-[60px]">
      <div className="relative">
        {icon}
      </div>
      <span className={`text-[11px] font-bold ${active ? 'text-emerald-500' : 'text-slate-400'}`}>{label}</span>
    </button>
  );
}

function HomeIcon({ active }: { active: boolean }) {
  return (
    <div className={`transition-colors ${active ? 'text-emerald-500' : 'text-slate-400'}`}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    </div>
  );
}

function QuickServiceItem({ icon, label }: any) {
  return (
    <div className="flex flex-col items-center gap-2 cursor-pointer active:scale-90 transition-transform">
      <div className="shadow-sm">
        {icon}
      </div>
      <span className="text-xs font-bold text-slate-600">{label}</span>
    </div>
  );
}

function TransactionItem({ tx }: any) {
  const isOut = tx.type === 'transfer' || tx.type === 'withdrawal';
  const isPlan = tx.type === 'plan_purchase' || tx.type === 'buy_stock';
  const isSuccess = tx.status === 'success' || tx.status === 'completed';
  const isFailed = tx.status === 'failed' || tx.status === 'rejected';

  return (
    <div className="flex justify-between items-center group active:scale-[0.98] transition-all">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-full ${isOut ? 'bg-orange-100 text-orange-500' : 'bg-red-500 text-white'} flex items-center justify-center shadow-sm`}>
           {isOut ? <ArrowUp size={20} /> : <div className="font-bold text-xl">$</div>}
        </div>
        <div>
          <div className="font-bold text-sm text-slate-800 capitalize">{tx.type.replace('_', ' ')} INR</div>
          <div className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
            {tx.createdAt ? new Date(tx.createdAt).toLocaleString() : 'Recent • ' + (tx.paymentMethod || 'Wallet')}
          </div>
        </div>
      </div>
      <div className="text-right flex flex-col items-end gap-1">
        <div className={`font-black tracking-tight text-slate-800`}>
          ₹ {tx.amount.toFixed(2)}
        </div>
        <div className={`text-[9px] px-2 py-0.5 rounded-md font-black uppercase tracking-widest ${
          isSuccess ? 'bg-emerald-50 text-emerald-600' : 
          isFailed ? 'bg-red-50 text-red-500' : 
          'bg-amber-50 text-amber-600'
        }`}>
          {tx.status === 'success' ? 'Completed' : tx.status === 'failed' ? 'Close' : tx.status || 'Pending'}
        </div>
      </div>
    </div>
  );
}

function StatBox({ icon, label, value, color }: any) {
  return (
    <div className="flex flex-col gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
      <div className="flex items-center gap-2">
        <div className={`p-1.5 rounded-lg bg-white shadow-sm`}>
           {icon}
        </div>
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{label}</span>
      </div>
      <div className="text-lg font-black text-slate-800">{value}</div>
      <div className={`absolute top-0 right-0 w-12 h-12 ${color} opacity-[0.03] rounded-bl-full`} />
    </div>
  );
}

function MiniStatBox({ label, value }: any) {
  return (
    <div className="p-4 bg-white border border-slate-100 rounded-2xl flex flex-col items-center text-center shadow-sm">
      <div className="flex items-center gap-1 mb-2">
        <div className="w-4 h-4 rounded-full border border-amber-300 flex items-center justify-center">
          <span className="text-[8px] text-amber-500 font-bold">$</span>
        </div>
        <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap">{label}</span>
      </div>
      <div className="font-bold text-slate-800">{value}</div>
    </div>
  );
}

function AssetCard({ icon, label, value, color }: any) {
  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{label}</span>
        <span className="text-sm font-black text-slate-800">{value}</span>
      </div>
    </div>
  );
}

function MyGridItem({ icon, label, href = '#' }: any) {
  return (
    <Link href={href} className="flex flex-col items-center gap-3 cursor-pointer group active:scale-95 transition-all">
      <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-slate-700 group-hover:bg-indigo-100 group-hover:text-indigo-700 transition-colors shadow-sm">
        {icon}
      </div>
      <span className="text-xs font-bold text-slate-600 font-sans tracking-tight">{label}</span>
    </Link>
  );
}

function DepositModal({ isOpen, onClose, onSelect, config }: any) {
  const [selectedPlan, setSelectedPlan] = useState('100');
  const [selectedMethod, setSelectedMethod] = useState('');

  if (!isOpen) return null;

  const methods = [
    { id: 'freecharge', name: 'Freecharge', icon: 'https://img.icons8.com/color/48/freecharge.png', color: '#ff611d' },
    { id: 'phonepe', name: 'Phonepe', icon: 'https://img.icons8.com/color/48/phonepe.png', color: '#5f259f' },
    { id: 'mobikwik', name: 'Mobikwik', icon: 'https://img.icons8.com/color/48/mobikwik.png', color: '#0055a4' },
    { id: 'paytm', name: 'Paytm', icon: 'https://img.icons8.com/color/48/paytm.png', color: '#00baf2' },
    { id: 'paytm_business', name: 'Paytm Business', icon: 'https://img.icons8.com/color/48/paytm.png', color: '#00baf2' },
  ];

  const plans = config?.stockPlans || [
    { amount: 100 }, { amount: 200 }, { amount: 500 }, { amount: 1000 }, { amount: 2000 }
  ];

  const handleClose = () => {
    setSelectedMethod('');
    onClose();
  };

  const handleSure = () => {
    if (selectedMethod && selectedPlan) {
      onSelect(selectedMethod, selectedPlan);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ y: "100%" }} 
        animate={{ y: 0 }} 
        exit={{ y: "100%" }}
        className="w-full max-w-lg bg-white rounded-t-[48px] p-8 pb-12 shadow-2xl relative overflow-hidden min-h-[500px]"
      >
        <div className="flex justify-between items-center mb-8">
           <h2 className="text-xl font-bold text-center w-full text-emerald-800">
             Choose <span className="text-emerald-600">your payment</span>
           </h2>
           <button onClick={handleClose} className="text-slate-400 font-bold text-xs uppercase hover:text-red-500 transition-colors absolute top-10 right-8">Close</button>
        </div>

        <div className="space-y-6">
          {/* Enhanced Amount Selector */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {plans.map((p: any, idx: number) => (
              <button
                key={idx}
                onClick={() => setSelectedPlan(p.amount.toString())}
                className={`px-6 py-2 rounded-xl font-black italic whitespace-nowrap transition-all border ${
                  selectedPlan === p.amount.toString() 
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' 
                  : 'bg-white text-slate-400 border-slate-100 hover:border-emerald-200'
                }`}
              >
                ₹{p.amount}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            {methods.map(method => (
              <button 
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                  selectedMethod === method.id 
                  ? 'bg-emerald-50 border-emerald-500 shadow-sm' 
                  : 'bg-white border-slate-100'
                }`}
              >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                  selectedMethod === method.id 
                  ? 'bg-emerald-600 border-emerald-600' 
                  : 'border-slate-200'
                }`}>
                  {selectedMethod === method.id && <Check size={14} className="text-white" />}
                </div>
                
                <div className="w-10 h-10 flex items-center justify-center overflow-hidden">
                   <img src={method.icon} alt={method.name} className="w-8 h-8 object-contain" />
                </div>
                
                <span className="text font-bold text-slate-800">{method.name}</span>
              </button>
            ))}
          </div>

          <div className="pt-6">
            <button 
              onClick={handleSure}
              disabled={!selectedMethod}
              className={`w-full py-4 rounded-full text-white font-black text-xl shadow-lg transition-all active:scale-95 ${
                selectedMethod ? 'bg-[#108967] hover:bg-[#0a664c]' : 'bg-slate-300 cursor-not-allowed'
              }`}
            >
              Sure
            </button>
          </div>

          <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-widest leading-relaxed pt-4 opacity-50">
            Security Node Active<br/>Transaction Binding to Neural Signature
          </p>
        </div>
      </motion.div>
    </div>
  );
}
