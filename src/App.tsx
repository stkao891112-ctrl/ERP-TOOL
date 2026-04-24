/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Papa from 'papaparse';
import { sb } from './lib/supabase';
import { 
  BarChart3, 
  Package, 
  Tag, 
  Wallet, 
  ShoppingCart, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  RefreshCw,
  Truck, 
  Clock, 
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  LayoutDashboard,
  Box,
  CreditCard,
  History,
  AlertCircle,
  X,
  Menu,
  Zap,
  FileUp,
  FileDown,
  ArrowUpDown,
  RotateCcw,
  Check,
  LogOut,
  Lock,
  Mail,
  Pin
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
type Category = {
  id: string;
  分類名稱: string;
  分類代號: string;
  建立時間?: string;
};

type Product = {
  id: string;
  分類ID: string;
  商品名稱: string;
  商品代號: string;
  庫存數量: number;
  買入數量?: number;
  賣出數量?: number;
  平均成本?: number;
  平均獲利?: number;
  目前狀態: string;
  更新時間?: string;
  是否置頂?: boolean;
};

type Purchase = {
  id: string;
  商品ID: string;
  數量: number;
  單位成本: number;
  金額?: number;
  進貨日期: string;
  進貨來源?: string;
  訂單狀態: string;
  備註?: string;
};

type Sale = {
  id: string;
  商品ID: string;
  數量: number;
  銷售金額: number;
  銷貨日期: string;
  訂單狀態: string;
  備註?: string;
  平台?: string;
  訂單編號: string;
  當前單位成本?: number;
  毛利?: number;
};

type OtherTrans = {
  id: string;
  日期: string;
  收支類型: '收入' | '支出';
  項目內容: string;
  金額: number;
  備註?: string;
};

// --- Helper Functions ---
const today = () => new Date().toISOString().split('T')[0];
const normalizeDateToOrderPrefix = (dateStr: string) => {
  if (!dateStr) return '';
  const clean = dateStr.split(' ')[0]; // Remove potential time part
  const parts = clean.split(/[-/]/);
  if (parts.length === 3) {
    const y = parts[0];
    const m = parts[1].padStart(2, '0');
    const d = parts[2].padStart(2, '0');
    return `${y}${m}${d}`;
  }
  return clean.replace(/[^0-9]/g, '');
};
const formatCurrency = (val: number | null | undefined) => {
  const v = val ?? 0;
  return `NT$${v.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};

// --- Components ---

const AuthScreen = ({ onGuestLogin }: { onGuestLogin: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!email || !password) return setErrorMsg('請填寫完整資訊');
    setLoading(true);
    try {
      const { error } = await sb.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message === 'Invalid login credentials') {
          throw new Error('帳號或密碼錯誤，或該帳號尚未獲得授權。');
        }
        throw error;
      }
    } catch (error: any) {
      setErrorMsg(error.message || '授權過程發生錯誤');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestEntry = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      // 嘗試以預設訪客帳號登入
      const { error } = await sb.auth.signInWithPassword({ 
        email: 'guest@demo.com', 
        password: 'guest123456' 
      });
      if (error) throw new Error('訪客帳號目前不可用，請聯繫管理員。');
    } catch (error: any) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-brand-50/50 via-transparent to-transparent">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-10">
          <div className="inline-flex p-4 rounded-3xl bg-[#111827] shadow-xl shadow-brand-500/10 mb-6 ring-8 ring-white">
            <Zap className="text-brand-500" size={32} fill="currentColor" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">代購管家</h1>
          <p className="text-gray-500 font-medium tracking-wide">個人商務數據管理中心</p>
        </div>

        <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-gray-200/50 border border-gray-100">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1.5 h-6 bg-brand-500 rounded-full" />
            <h2 className="text-xl font-bold text-gray-900">歡迎登入</h2>
          </div>
          
          <form onSubmit={handleAuth} className="space-y-6">
            {errorMsg && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-red-50 border border-red-100 text-red-500 p-4 rounded-2xl text-xs font-bold flex items-start gap-3"
              >
                <AlertCircle size={16} className="shrink-0" />
                <p>{errorMsg}</p>
              </motion.div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">管理員信箱</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@logic.com"
                  className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl pl-12 pr-4 py-4 text-sm focus:border-brand-500/30 focus:bg-white transition-all outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">安全密碼</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl pl-12 pr-4 py-4 text-sm focus:border-brand-500/30 focus:bg-white transition-all outline-none"
                  required
                />
              </div>
            </div>

            <button 
              disabled={loading}
              className="w-full bg-[#111827] text-white font-bold py-5 rounded-2xl shadow-xl shadow-gray-900/10 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 mt-4 flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>驗證中...</span>
                </>
              ) : (
                <>
                  <Lock size={18} />
                  <span>進入管理系統</span>
                </>
              )}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase font-bold text-gray-400">
              <span className="bg-white px-4">或</span>
            </div>
          </div>

          <button 
            type="button"
            onClick={handleGuestEntry}
            disabled={loading}
            className="w-full bg-white border-2 border-brand-500/20 text-brand-600 font-bold py-5 rounded-2xl hover:bg-brand-50 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
          >
            <Box size={18} />
            <span>訪客試用體驗</span>
          </button>
        </div>

        <div className="mt-10 bg-brand-50/50 border border-brand-100 rounded-2xl p-4 flex gap-3">
          <AlertCircle size={18} className="text-brand-500 shrink-0" />
          <p className="text-[11px] text-brand-800 font-medium leading-relaxed">
            訪客模式提醒：試用期間產生的所有資料將於登出或下次登入時清空。本帳號同一時間僅限一人操作以維持資料庫一致性。
          </p>
        </div>
      </motion.div>
    </div>
  );
};

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
      >
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {children}
        </div>
      </motion.div>
    </div>
  );
};

const Card = ({ title, actions, children, className }: { title?: string, actions?: React.ReactNode, children: React.ReactNode, className?: string }) => (
  <div className={cn("bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden", className)}>
    {(title || actions) && (
      <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
        {title && <h3 className="text-base font-semibold text-gray-900">{title}</h3>}
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>
    )}
    <div className="p-6">
      {children}
    </div>
  </div>
);

const Pagination = ({ total, current, onChange, pageSize }: { total: number, current: number, onChange: (page: number) => void, pageSize: number }) => {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-gray-50/50 border-t border-gray-100">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
        第 <span className="text-gray-900">{current}</span> 頁 / 共 <span className="text-gray-900">{totalPages}</span> 頁 
        <span className="ml-2">( 共 {total} 筆 )</span>
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => onChange(Math.max(1, current - 1))}
          disabled={current === 1}
          className={cn(
            "p-2 rounded-xl transition-all",
            current === 1 ? "text-gray-300 bg-gray-50 cursor-not-allowed" : "text-gray-600 bg-white hover:bg-gray-100 border border-gray-200"
          )}
        >
          <ChevronRight size={16} className="rotate-180" />
        </button>
        <button
          onClick={() => onChange(Math.min(totalPages, current + 1))}
          disabled={current === totalPages}
          className={cn(
            "p-2 rounded-xl transition-all",
            current === totalPages ? "text-gray-300 bg-gray-50 cursor-not-allowed" : "text-gray-600 bg-white hover:bg-gray-100 border border-gray-200"
          )}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

const ProductSearchSelect = ({ 
  prods, 
  name, 
  defaultValue, 
  required,
  placeholder = "搜尋商品...",
  colorTheme = "brand"
}: { 
  prods: Product[], 
  name: string, 
  defaultValue?: string, 
  required?: boolean,
  placeholder?: string,
  colorTheme?: 'blue' | 'brand'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(defaultValue || "");

  const selectedProd = prods.find(p => p.id === selectedId);
  
  const filtered = prods.filter(p => 
    p.商品名稱.toLowerCase().includes(search.toLowerCase()) || 
    p.商品代號.toLowerCase().includes(search.toLowerCase())
  );

  const ringClass = colorTheme === 'blue' ? "focus:ring-blue-500/20" : "focus:ring-brand-500/20";
  const hoverClass = colorTheme === 'blue' ? "hover:bg-blue-50" : "hover:bg-brand-50";
  const selectedBgClass = colorTheme === 'blue' ? "bg-blue-50/50" : "bg-brand-50/50";
  const textClass = colorTheme === 'blue' ? "text-blue-600" : "text-brand-600";

  return (
    <div className="relative">
      <input type="hidden" name={name} value={selectedId} required={required} />
      <div 
        className={cn(
          "w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus-within:ring-2 flex items-center justify-between cursor-pointer transition-all",
          ringClass,
          isOpen && "ring-2"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          {selectedProd ? (
            <div className="truncate flex items-center gap-2">
              <span className={cn("font-bold text-[10px] px-1.5 py-0.5 rounded-md", selectedBgClass, textClass)}>
                {selectedProd.商品代號}
              </span>
              <span className="font-semibold text-gray-900 truncate">{selectedProd.商品名稱}</span>
            </div>
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </div>
        <Search size={16} className="text-gray-400 flex-shrink-0" />
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 z-20 overflow-hidden"
            >
              <div className="p-3 border-b border-gray-50">
                <input 
                  autoFocus
                  type="text"
                  placeholder="輸入關鍵字搜尋..."
                  className="w-full bg-gray-50 border-none rounded-xl px-4 py-2 text-sm focus:ring-0"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <ul className="max-h-60 overflow-y-auto">
                {filtered.length > 0 ? (
                  filtered.map(p => (
                    <li 
                      key={p.id}
                      className={cn(
                        "px-4 py-3 text-sm cursor-pointer transition-colors flex items-center justify-between group",
                        selectedId === p.id ? selectedBgClass : hoverClass
                      )}
                      onClick={() => {
                        setSelectedId(p.id);
                        setIsOpen(false);
                        setSearch("");
                      }}
                    >
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[10px] text-gray-400 group-hover:text-gray-600">#{p.商品代號}</span>
                          <span className="font-semibold text-gray-900">{p.商品名稱}</span>
                        </div>
                        <span className="text-[10px] text-gray-400 flex items-center gap-2">
                          目前的庫存：<span className="font-bold">{p.庫存數量}</span>
                        </span>
                      </div>
                      {selectedId === p.id && <Check size={16} className={textClass} />}
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-8 text-center text-gray-400 text-xs italic">
                    找不到相符的商品...
                  </li>
                )}
              </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const KPICard = ({ label, value, sub, icon: Icon, colorClass, delay = 0 }: { label: string, value: string | number, sub?: string, icon: any, colorClass: string, delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-start gap-4"
  >
    <div className={cn("p-3 rounded-2xl", colorClass)}>
      <Icon size={24} className="text-white" />
    </div>
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-xl font-bold text-gray-900 truncate">{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  </motion.div>
);

const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      onAnimationComplete={(definition) => {
        if (definition === "exit") onComplete();
      }}
      className="fixed inset-0 z-[100] bg-[#111827] flex flex-col items-center justify-center p-6 overflow-hidden"
    >
      <div className="relative">
        {/* Decorative background glow */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute inset-0 bg-brand-500/20 blur-[100px] rounded-full"
        />

        <motion.div
          initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ 
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.1
          }}
          className="relative z-10 w-24 h-24 bg-gradient-to-br from-brand-400 to-red-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-brand-500/40"
        >
          <Zap size={48} className="text-white" fill="white" />
        </motion.div>
      </div>

      <div className="mt-8 text-center relative z-10">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="overflow-hidden"
        >
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">
            代購<span className="text-brand-500">管家</span>
          </h1>
        </motion.div>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="text-gray-400 mt-4 text-sm font-medium tracking-[0.3em] uppercase"
        >
          Professional ERP System
        </motion.p>
      </div>

      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: 240 }}
        transition={{ delay: 0.8, duration: 1.0, ease: "circIn" }}
        className="mt-12 h-1 bg-gradient-to-r from-transparent via-brand-500 to-transparent opacity-50 rounded-full"
      />
    </motion.div>
  );
};

// --- Main App ---

const ImportProgressOverlay = ({ progress }: { progress: number }) => (
  <div className="fixed inset-0 bg-[#111827]/60 backdrop-blur-md z-[100] flex items-center justify-center p-6">
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-white rounded-[2.5rem] p-10 w-full max-w-sm shadow-2xl flex flex-col items-center text-center space-y-6"
    >
      <div className="relative">
        <div className="w-24 h-24 border-[6px] border-gray-100 rounded-full" />
        <svg className="w-24 h-24 absolute top-0 left-0 -rotate-90">
          <circle
            cx="48"
            cy="48"
            r="42"
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="6"
            strokeDasharray={264}
            strokeDashoffset={264 - (264 * progress) / 100}
            strokeLinecap="round"
            className="transition-all duration-300"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--brand-hex)" />
              <stop offset="100%" stopColor="var(--brand-hex)" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-black text-gray-900">{progress}%</span>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-bold text-gray-900">資料匯入中</h3>
        <p className="text-sm text-gray-500 font-medium px-4">
          正在處理大體量數據並同步庫存與獲利，請勿關閉或重新整理頁面。
        </p>
      </div>

      <div className="w-full bg-gray-50 rounded-2xl p-4 flex items-center gap-3">
        <div className="w-2 h-2 bg-brand-500 rounded-full animate-pulse" />
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
          {progress < 30 ? '校驗數據格式' : progress < 80 ? '處理商品關聯' : '寫入資料庫並同步'}
        </span>
      </div>
    </motion.div>
  </div>
);

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState<'orange' | 'pink' | 'blue' | 'emerald' | 'violet'>(
    (localStorage.getItem('app-theme') as any) || 'orange'
  );
  const [cats, setCats] = useState<Category[]>([]);
  const [prods, setProds] = useState<Product[]>([]);
  const [purch, setPurch] = useState<Purchase[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [others, setOthers] = useState<OtherTrans[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [csvErrors, setCsvErrors] = useState<string[]>([]);
  const [importSuccessInfo, setImportSuccessInfo] = useState<{count: number, type: string} | null>(null);
  
  // Sync Progress State
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [showSyncComplete, setShowSyncComplete] = useState(false);

  // Dashboard Specific State
  const [dashMonth, setDashMonth] = useState(today().slice(0, 7));
  const [dashViewType, setDashViewType] = useState<'month' | 'year'>('month');
  const [dashChartType, setDashChartType] = useState<'bar' | 'line'>('bar');
  const [dashChartMetric, setDashChartMetric] = useState<'rev_pur' | 'net'>('rev_pur');
  
  const shiftDashboardDate = (offset: number) => {
    if (dashViewType === 'month') {
      const [y, m] = dashMonth.split('-').map(Number);
      const date = new Date(y, m - 1 + offset, 1);
      const nextY = date.getFullYear();
      const nextM = String(date.getMonth() + 1).padStart(2, '0');
      setDashMonth(`${nextY}-${nextM}`);
    } else {
      const [y] = dashMonth.split('-').map(Number);
      setDashMonth(`${y + offset}-01`);
    }
  };
  
  // Modals Overlay
  const [modalType, setModalType] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<any>(null);
  const [showBatchDelete, setShowBatchDelete] = useState<'進貨表' | '銷貨表' | '其他收支表' | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{table: string, id: string} | null>(null);

  // Auth State
  const [session, setSession] = useState<any>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [isGuestCleaned, setIsGuestCleaned] = useState(false);

  // Search/Filters (Inputs)
  const [invSearch, setInvSearch] = useState('');
  const [financeSearch, setFinanceSearch] = useState('');
  const [financeStartDate, setFinanceStartDate] = useState('');
  const [financeEndDate, setFinanceEndDate] = useState('');
  const [purchaseSearch, setPurchaseSearch] = useState('');
  const [purchaseStartDate, setPurchaseStartDate] = useState('');
  const [purchaseEndDate, setPurchaseEndDate] = useState('');
  const [salesSearch, setSalesSearch] = useState('');
  const [salesStartDate, setSalesStartDate] = useState('');
  const [salesEndDate, setSalesEndDate] = useState('');

  // Search/Filters (Applied)
  const [invSearchApplied, setInvSearchApplied] = useState('');
  const [hideDiscontinued, setHideDiscontinued] = useState(false);
  const [invSortKey, setInvSortKey] = useState<'code' | 'cost' | 'stock' | 'status' | null>(null);
  const [invSortDir, setInvSortDir] = useState<'asc' | 'desc'>('asc');
  
  // Pagination State
  const ITEMS_PER_PAGE = 100;
  const [financePage, setFinancePage] = useState(1);
  const [purchasePage, setPurchasePage] = useState(1);
  const [salesPage, setSalesPage] = useState(1);

  const [financeSearchApplied, setFinanceSearchApplied] = useState('');
  const [financeStartDateApplied, setFinanceStartDateApplied] = useState('');
  const [financeEndDateApplied, setFinanceEndDateApplied] = useState('');
  const [financeSortDir, setFinanceSortDir] = useState<'asc' | 'desc'>('desc');

  const [purchaseSearchApplied, setPurchaseSearchApplied] = useState('');
  const [purchaseStartDateApplied, setPurchaseStartDateApplied] = useState('');
  const [purchaseEndDateApplied, setPurchaseEndDateApplied] = useState('');
  const [purchaseSortDir, setPurchaseSortDir] = useState<'asc' | 'desc'>('desc');

  const [salesSearchApplied, setSalesSearchApplied] = useState('');
  const [salesStartDateApplied, setSalesStartDateApplied] = useState('');
  const [salesEndDateApplied, setSalesEndDateApplied] = useState('');
  const [salesSortDir, setSalesSortDir] = useState<'asc' | 'desc'>('desc');

  // Purchase Modal Form Assistant (Auto-calc)
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  const [purQty, setPurQty] = useState<string | number>('');
  const [purUnitCost, setPurUnitCost] = useState<string | number>('');
  const [purTotal, setPurTotal] = useState<string | number>('');

  const themeConfig = {
    orange: { hex: '#f97316', b400: '#fb923c' },
    pink: { hex: '#ec4899', b400: '#f472b6' },
    blue: { hex: '#3b82f6', b400: '#60a5fa' },
    emerald: { hex: '#10b981', b400: '#34d399' },
    violet: { hex: '#8b5cf6', b400: '#a78bfa' }
  };

  const brandHex = themeConfig[theme].hex;
  const brand400 = themeConfig[theme].b400;

  useEffect(() => {
    if (modalType === 'purchase') {
      if (editItem) {
        setPurQty(editItem.數量 || '');
        setPurUnitCost(editItem.單位成本 || '');
        setPurTotal(editItem.金額 || (editItem.數量 * editItem.單位成本) || '');
      } else {
        setPurQty('');
        setPurUnitCost('');
        setPurTotal('');
      }
    }
  }, [modalType, editItem]);
  
  useEffect(() => {
    localStorage.setItem('app-theme', theme);
    
    // 動態更新瀏覽器與 PWA 主題顏色 (影響 iPhone 狀態列)
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', brandHex);
    }

    // 動態生成帶有主題背景的 Apple Touch Icon (影響加入主畫面的圖示)
    const canvas = document.createElement('canvas');
    canvas.width = 180;
    canvas.height = 180;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // 繪製背景 (帶有圓角以適應不同平台，雖然 iOS 會自動切圓角，但這樣預覽更精確)
      ctx.fillStyle = brandHex;
      ctx.fillRect(0, 0, 180, 180);

      // 繪製中心閃電圖示 (Zap)
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0,0,0,0.1)';
      ctx.shadowBlur = 10;
      
      // 繪製 Zap 圖示的路徑 (大致比例)
      ctx.beginPath();
      ctx.moveTo(105, 30);  // 頂點
      ctx.lineTo(55, 100);  // 左折點 
      ctx.lineTo(90, 100);  // 中間收縮
      ctx.lineTo(75, 155);  // 底點
      ctx.lineTo(125, 85);  // 右折點
      ctx.lineTo(90, 85);   // 中間收縮
      ctx.lineTo(105, 30);  // 回到頂點
      ctx.closePath();
      ctx.fill();

      const iconUrl = canvas.toDataURL('image/png');
      
      // 更新 apple-touch-icon
      let appleIcon = document.querySelector('link[rel="apple-touch-icon"]');
      if (appleIcon) {
        appleIcon.setAttribute('href', iconUrl);
      } else {
        appleIcon = document.createElement('link');
        appleIcon.setAttribute('rel', 'apple-touch-icon');
        appleIcon.setAttribute('href', iconUrl);
        document.head.appendChild(appleIcon);
      }

      // 同時更新一般 favicon 保持主題感
      let favicon = document.querySelector('link[rel="icon"]');
      if (favicon) {
        favicon.setAttribute('href', iconUrl);
      }
    }
  }, [theme, brandHex]);

  // --- Data Fetching Utils ---
  const fetchAll = async (tableName: string, orderCol: string, ascending = false, secondaryOrder?: { col: string, asc: boolean }) => {
    if (!session?.user?.id) return [];
    let allData: any[] = [];
    let from = 0;
    let to = 999;
    let hasMore = true;

    while (hasMore) {
      let query = sb.from(tableName)
        .select('*')
        .eq('user_id', session.user.id) // 關鍵：只抓取屬於當前使用者的資料
        .order(orderCol, { ascending })
        .range(from, to);
      
      if (secondaryOrder) {
        query = query.order(secondaryOrder.col, { ascending: secondaryOrder.asc });
      }
      const { data, error } = await query;
      
      if (error) {
        console.error(`Fetch error for ${tableName}:`, error);
        break;
      }
      
      if (data && data.length > 0) {
        allData = [...allData, ...data];
        if (data.length < 1000) {
          hasMore = false;
        } else {
          from += 1000;
          to += 1000;
        }
      } else {
        hasMore = false;
      }
      if (from > 20000) break;
    }
    return allData;
  };

  const cleanGuestDataInternal = async (uid: string) => {
    try {
      console.log('Attempting to clean guest data for:', uid);
      setLoading(true);
      
      // Clear local state immediately to avoid showing old data
      setCats([]);
      setProds([]);
      setPurch([]);
      setSales([]);
      setOthers([]);

      const tables = ['銷貨表', '進貨表', '其他收支表', '庫存總表', '商品分類表'];
      
      // Use for...of to ensure sequential deletion or at least catch all errors properly
      for (const t of tables) {
        const { error } = await sb.from(t).delete().eq('user_id', uid);
        if (error) {
          console.warn(`Clean ${t} failed:`, error.message);
        }
      }

      console.log('Guest data reset complete for:', uid);
      sessionStorage.setItem('guest_cleaned', 'true');
      setIsGuestCleaned(true);
      
      // Wait a bit to ensure DB consistency before fetching
      await new Promise(resolve => setTimeout(resolve, 300));
      await fetchData();
    } catch (err) {
      console.error('Guest clean internal error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    if (!session?.user?.id) return;
    try {
      const [cData, pData, purData, sData, oData] = await Promise.all([
        sb.from('商品分類表').select('*').eq('user_id', session.user.id).order('建立時間', { ascending: true }),
        fetchAll('庫存總表', '更新時間', false),
        fetchAll('進貨表', '進貨日期', false, { col: '建立時間', asc: false }),
        fetchAll('銷貨表', '銷貨日期', false, { col: '訂單編號', asc: false }),
        fetchAll('其他收支表', '日期', false)
      ]);

      setCats(cData.data || []);
      setProds(pData as any[] || []);
      setPurch(purData as any[] || []);
      setSales(sData as any[] || []);
      setOthers(oData as any[] || []);
    } catch (err) {
      console.error('FetchData error:', err);
    } finally {
      setLoading(false);
      setShowSplash(false);
    }
  };

  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Initial Session Check
    const sessionTimeout = setTimeout(() => {
      if (checkingSession) {
        console.warn('Session check timed out');
        setCheckingSession(false);
      }
    }, 8000); // 8s safety net

    sb.auth.getSession()
      .then(async ({ data: { session }, error }: any) => {
        if (error) {
          console.error('Session error:', error);
          setAuthError(error.message);
        }
        setSession(session);
        
        // Basic guest detection for initial state, cleanup is handled in onAuthStateChange
        if (session?.user?.email === 'guest@demo.com') {
          setIsGuest(true);
          // Check if already cleaned in this session
          if (sessionStorage.getItem('guest_cleaned')) {
            setIsGuestCleaned(true);
          }
        }

        // We don't call cleanGuestDataInternal here anymore; 
        // onAuthStateChange handles event === 'INITIAL_SESSION' or 'SIGNED_IN'
        
        setCheckingSession(false);
        clearTimeout(sessionTimeout);
      })
      .catch((err: any) => {
        console.error('Session check failed:', err);
        setAuthError('無法連接到授權伺服器，請檢查網路連線。');
        setCheckingSession(false);
        clearTimeout(sessionTimeout);
      });

    // Listen for Auth Changes
    const { data: { subscription } } = sb.auth.onAuthStateChange(async (event: string, session: any) => {
      console.log('Auth event:', event, 'Session user:', session?.user?.id);
      setSession(session);
      
      // 訪客特殊邏輯
      if (session?.user?.email === 'guest@demo.com') {
        setIsGuest(true);
        const hasCleaned = sessionStorage.getItem('guest_cleaned');
        
        // 只有在登入事件或是初次載入且尚未標記清理時執行
        if (event === 'SIGNED_IN' || (event === 'INITIAL_SESSION' && !hasCleaned)) {
          console.log('Guest cleanup triggered by:', event);
          setIsGuestCleaned(false);
          // Don't await so we don't block setCheckingSession(false)
          cleanGuestDataInternal(session.user.id);
        } else if (hasCleaned) {
          setIsGuestCleaned(true);
        }
      } else {
        setIsGuest(false);
        setIsGuestCleaned(false);
      }
      
      // 登出時清空 sessionStorage 標記
      if (event === 'SIGNED_OUT') {
        console.log('User signed out, clearing guest markers');
        sessionStorage.removeItem('guest_cleaned');
        setIsGuestCleaned(false);
        setIsGuest(false);
      }

      if (session?.user?.email) {
        localStorage.setItem('last_user', session.user.email);
      }

      setCheckingSession(false);
      clearTimeout(sessionTimeout);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;

    // 如果是訪客且尚未清理完畢，則不執行此處的 fetchData (cleanGuestDataInternal 會自己 fetch)
    if (isGuest && !isGuestCleaned) {
      console.log('Guest detected, waiting for cleanup before fetching data...');
      return;
    }

    console.log('FetchData triggered. isGuest:', isGuest, 'isGuestCleaned:', isGuestCleaned);
    fetchData();
    const channel = sb.channel('db-changes')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => {
        fetchData();
      })
      .subscribe();

    // Auto-hide splash after a few seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    return () => { 
      sb.removeChannel(channel);
      clearTimeout(timer);
    };
  }, [session, isGuest, isGuestCleaned]);

  const cleanGuestData = async () => {
    if (!isGuest || !session?.user?.id) return;
    
    if (!window.confirm('確定要清空當前試用環境的所有資料嗎？這將無法復原。')) {
      return;
    }

    try {
      setLoading(true);
      await cleanGuestDataInternal(session.user.id);
      alert('環境已重置，資料已全數清空。');
    } catch (err) {
      console.error('訪客資料清除失敗:', err);
      alert('重置失敗，請稍後再試。');
    } finally {
      setLoading(false);
    }
  };

  const syncInventory = async (prodId: string) => {
    if (!prodId) return;
    try {
      // 1. 抓取進貨數據 (使用 fetchAll 確保抓取全量資料)
      const purData = await fetchAll('進貨表', '進貨日期', true, { col: '建立時間', asc: true });
      const filteredPur = purData.filter((p: any) => p.商品ID === prodId);

      // 2. 抓取銷貨數據
      const saleData = await fetchAll('銷貨表', '銷貨日期', true, { col: '訂單編號', asc: true });
      const filteredSale = saleData.filter((s: any) => s.商品ID === prodId);

      // FIFO 進貨池
      const purchasePool = filteredPur.map((p: any) => ({
        qty: p.數量 || 0,
        cost: p.單位成本 || 0
      }));

      const totalPurQty = purchasePool.reduce((sum: number, p: any) => sum + p.qty, 0);
      const totalPurCost = purchasePool.reduce((sum: number, p: any) => sum + (p.qty * p.cost), 0);
      const totalSaleQty = filteredSale.reduce((sum: number, s: any) => sum + (s.數量 || 0), 0);

      let totalProfit = 0;
      const profitUpdates = [];

      for (const sale of filteredSale) {
        let remainingToMatch = sale.數量 || 0;
        let saleCost = 0;

        for (const batch of purchasePool) {
          if (remainingToMatch <= 0) break;
          if (batch.qty <= 0) continue;

          const consume = Math.min(remainingToMatch, batch.qty);
          saleCost += consume * batch.cost;
          batch.qty -= consume;
          remainingToMatch -= consume;
        }

        if (remainingToMatch > 0) {
          const fallbackCost = totalPurQty > 0 ? (totalPurCost / totalPurQty) : 0;
          saleCost += remainingToMatch * fallbackCost;
        }

        const calculatedProfit = Math.round(((sale.銷售金額 || 0) - saleCost) * 100) / 100;
        const actualUnitCost = sale.數量 > 0 ? Math.round((saleCost / sale.數量) * 100) / 100 : 0;
        
        totalProfit += calculatedProfit;

        if (sale.毛利 !== calculatedProfit || sale.當前單位成本 !== actualUnitCost) {
          profitUpdates.push(
            sb.from('銷貨表').update({ 
              毛利: calculatedProfit, 
              當前單位成本: actualUnitCost,
              user_id: session?.user?.id
            })
            .eq('id', sale.id)
            .eq('user_id', session?.user?.id)
          );
        }
      }

      if (profitUpdates.length > 0) {
        await Promise.all(profitUpdates);
      }

      const currentStock = totalPurQty - totalSaleQty;
      const avgCost = totalPurQty > 0 ? Math.round((totalPurCost / totalPurQty) * 100) / 100 : 0;
      const avgProfit = totalSaleQty > 0 ? Math.round(totalProfit / totalSaleQty) : 0;

      await sb.from('庫存總表').update({
        庫存數量: currentStock,
        買入數量: totalPurQty,
        賣出數量: totalSaleQty,
        平均成本: avgCost,
        平均獲利: avgProfit,
        user_id: session?.user?.id
      })
      .eq('id', prodId)
      .eq('user_id', session?.user?.id);
    } catch (err) {
      console.error('FIFO Sync failed:', err);
    }
  };

  const syncAllInventory = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setSyncProgress(0);
    try {
      const total = prods.length;
      for (let i = 0; i < total; i++) {
        await syncInventory(prods[i].id);
        const progress = Math.round(((i + 1) / total) * 100);
        setSyncProgress(progress);
      }
      setShowSyncComplete(true);
      await fetchData();
    } catch (err) {
      console.error('syncAllInventory error:', err);
      alert('同步過程中發生錯誤');
    } finally {
      setIsSyncing(false);
    }
  };


  const togglePinProduct = async (id: string, currentPin: any) => {
    try {
      const isPinned = currentPin === 'Y' || currentPin === true;
      const { error } = await sb.from('庫存總表')
        .update({ 是否置頂: !isPinned })
        .eq('id', id);
      if (error) throw error;
      fetchData();
    } catch (err) {
      console.error('togglePinProduct error:', err);
    }
  };

  const handleSaveCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const code = (formData.get('code') as string || '').toUpperCase();

    try {
      if (editItem) {
        const { error } = await sb.from('商品分類表')
          .update({ 分類名稱: name, user_id: session?.user?.id })
          .eq('id', editItem.id)
          .eq('user_id', session?.user?.id);
        if (error) throw error;
      } else {
        const { error } = await sb.from('商品分類表')
          .insert([{ 
            分類名稱: name, 
            分類代號: code,
            user_id: session?.user?.id
          }]);
        if (error) throw error;
      }
      setModalType(null);
      setEditItem(null);
      fetchData();
    } catch (err: any) {
      alert('儲存品類失敗：' + (err.message || '未知錯誤'));
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleSaveProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const catId = (formData.get('catId') as string) || (editItem?.分類ID);
    const name = formData.get('name') as string;
    const stock = Number(formData.get('stock'));
    const status = formData.get('status') as string;
    
    // 預防編輯時因為欄位 disabled 導致抓不到 catId
    const targetCatId = catId || editItem?.分類ID;
    const cat = cats.find(c => c.id === targetCatId);
    
    if (!cat) {
      console.error('找不到對應分類:', targetCatId);
      setIsSubmitting(false);
      return;
    }

    try {
      if (editItem) {
        // 編輯邏輯：通常不建議修改商品代號，這裡只更新名稱與狀態
        const { error } = await sb.from('庫存總表').update({
          商品名稱: name, 
          目前狀態: status,
          user_id: session?.user?.id
        })
        .eq('id', editItem.id)
        .eq('user_id', session?.user?.id);
        if (error) alert(error.message);
      } else {
      // ✅ 依照需求：即時從 Supabase 抓取該分類目前的商品
      const { data: existingProds, error: fetchErr } = await sb
        .from('庫存總表')
        .select('商品代號')
        .eq('分類ID', catId)
        .eq('user_id', session?.user?.id);
        
        if (fetchErr) {
          setIsSubmitting(false);
          return alert('讀取流水號失敗：' + fetchErr.message);
        }

      // 計算最新流水號
      let maxSeq = 0;
      (existingProds || []).forEach((p: any) => {
        if (p.商品代號 && p.商品代號.startsWith(cat.分類代號)) {
          const numStr = p.商品代號.replace(cat.分類代號, '');
          const num = parseInt(numStr, 10);
          if (!isNaN(num) && num > maxSeq) maxSeq = num;
        }
      });
      const newCode = cat.分類代號 + String(maxSeq + 1).padStart(3, '0');

      const { error } = await sb.from('庫存總表').insert([{
        分類ID: catId, 
        商品名稱: name, 
        庫存數量: stock, 
        買入數量: stock, // 初始庫存視為買入
        賣出數量: 0,
        商品代號: newCode, 
        目前狀態: status,
        user_id: session?.user?.id // 記錄擁有者
      }]);
      if (error) alert(error.message);
    }
      setModalType(null);
      setEditItem(null);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('儲存失敗');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSavePurchase = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const date = formData.get('date') as string;
    const prodId = formData.get('prodId') as string;
    const qty = Number(formData.get('qty'));
    const cost = Number(formData.get('cost'));
    const status = formData.get('status') as string;
    const source = formData.get('source') as string;
    const note = formData.get('note') as string;

    if (!prodId) {
      setIsSubmitting(false);
      return alert('請選擇商品');
    }

    try {
      let res;
      const oldProdId = editItem?.商品ID;
      
      if (editItem) {
        res = await sb.from('進貨表').update({
          進貨日期: date, 商品ID: prodId, 數量: qty, 單位成本: cost, 金額: Number(formData.get('amount')), 訂單狀態: status, 進貨來源: source, 備註: note,
          user_id: session?.user?.id
        })
        .eq('id', editItem.id)
        .eq('user_id', session?.user?.id);
      } else {
        res = await sb.from('進貨表').insert([{
          進貨日期: date, 
          商品ID: prodId, 
          數量: qty, 
          單位成本: cost, 
          金額: Number(formData.get('amount')), 
          訂單狀態: status || '待入庫', 
          進貨來源: source, 
          備註: note,
          user_id: session?.user?.id // 記錄擁有者
        }]);
      }
      
      if (res.error) {
        alert('儲存失敗：' + res.error.message);
      } else {
        await syncInventory(prodId);
        if (oldProdId && oldProdId !== prodId) {
          await syncInventory(oldProdId);
        }
        setModalType(null);
        setEditItem(null);
        fetchData();
      }
    } catch (err) {
      console.error(err);
      alert('進貨儲存發生錯誤');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveSale = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const date = formData.get('date') as string;
    const prodId = formData.get('prodId') as string;
    const qty = Number(formData.get('qty'));
    const amount = Number(formData.get('amount'));
    const platform = formData.get('platform') as string;
    const status = formData.get('status') as string;
    const note = formData.get('note') as string;
    let finalNote = note;
    if (amount === 0) {
      finalNote = finalNote ? `${finalNote} (贈品)` : '贈品';
    }

    if (!prodId) {
      setIsSubmitting(false);
      return alert('請先選擇商品');
    }

    try {
      let res;
      const oldProdId = editItem?.商品ID;

      if (editItem) {
        res = await sb.from('銷貨表').update({
          銷貨日期: date, 商品ID: prodId, 數量: qty, 銷售金額: amount, 平台: platform, 訂單狀態: status, 備註: finalNote,
          user_id: session?.user?.id
        })
        .eq('id', editItem.id)
        .eq('user_id', session?.user?.id);
      } else {
        const datePrefix = normalizeDateToOrderPrefix(date || today());
        const { data: existingSales, error: seqErr } = await sb.from('銷貨表')
          .select('訂單編號')
          .like('訂單編號', `${datePrefix}%`)
          .eq('user_id', session?.user?.id);
        
        if (seqErr) console.warn('Seq fetch error:', seqErr);

        let maxSeq = 0;
        (existingSales || []).forEach((s: any) => {
          if (s.訂單編號 && s.訂單編號.startsWith(datePrefix)) {
            const seq = parseInt(s.訂單編號.replace(datePrefix, ''), 10);
            if (!isNaN(seq) && seq > maxSeq) maxSeq = seq;
          }
        });
        const orderNo = datePrefix + String(maxSeq + 1).padStart(3, '0');
        
        res = await sb.from('銷貨表').insert([{
          銷貨日期: date, 
          訂單編號: orderNo, 
          商品ID: prodId, 
          數量: qty, 
          銷售金額: amount, 
          平台: platform, 
          訂單狀態: status || '未出貨', 
          備註: finalNote,
          當前單位成本: 0, 
          毛利: 0,
          user_id: session?.user?.id // 記錄擁有者
        }]);
      }

      if (res.error) {
        alert('儲存失敗：' + res.error.message);
      } else {
        await syncInventory(prodId);
        if (oldProdId && oldProdId !== prodId) {
          await syncInventory(oldProdId);
        }
        setModalType(null);
        setEditItem(null);
        fetchData();
      }
    } catch (err) {
      console.error('handleSaveSale error:', err);
      alert('發生錯誤，請稍後再試');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveFinance = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const date = formData.get('date') as string;
    const type = formData.get('type') as '收入' | '支出';
    const amount = Number(formData.get('amount'));
    const item = formData.get('item') as string;
    const note = formData.get('note') as string;

    try {
      if (editItem) {
        const { error } = await sb.from('其他收支表').update({
          日期: date, 收支類型: type, 金額: amount, 項目內容: item, 備註: note,
          user_id: session?.user?.id
        })
        .eq('id', editItem.id)
        .eq('user_id', session?.user?.id);
        if (error) alert(error.message);
      } else {
        const { error } = await sb.from('其他收支表').insert([{
          日期: date, 收支類型: type, 金額: amount, 項目內容: item, 備註: note,
          user_id: session?.user?.id // 記錄擁有者
        }]);
        if (error) alert(error.message);
      }
      setModalType(null);
      setEditItem(null);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('收支儲存發生錯誤');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCsvImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || isSubmitting || isImporting) return;

    setIsImporting(true);
    setImportProgress(0);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data as any[];
        const fields = results.meta.fields || [];

        // 檢查必要表頭
        const requiredHeaders = ['商品分類(代號)', '商品名稱'];
        const missingHeaders = requiredHeaders.filter(h => !fields.includes(h));
        
        if (missingHeaders.length > 0) {
          setIsImporting(false);
          e.target.value = '';
          return alert(`匯入失敗：CSV 缺少必要的表頭欄位: ${missingHeaders.join(', ')}\n請下載正確的範本使用。`);
        }

        if (rows.length === 0) {
          setIsImporting(false);
          e.target.value = '';
          return alert('匯入失敗：CSV 檔案內沒有任何資料內容。');
        }

        const validItems: any[] = [];
        const errors: string[] = [];

        // 1. 預先檢查分類代號
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          const catCode = row['商品分類(代號)']?.toString().trim().toUpperCase();
          const name = row['商品名稱']?.toString().trim();
          const status = row['商品狀態']?.toString().trim() || '售賣中';

          if (!catCode || !name) {
            errors.push(`第 ${i + 2} 行資料不完整 (缺代號或名稱)`);
            continue;
          }

          const cat = cats.find(c => c.分類代號 === catCode);
          if (!cat) {
            errors.push(`第 ${i + 2} 行：分類代號 "${catCode}" 不存在於系統中`);
            continue;
          }

          validItems.push({ cat, name, status });
          setImportProgress(Math.round(((i + 1) / rows.length) * 30));
        }

        if (errors.length > 0) {
          alert('匯入失敗，請修正後再試：\n' + errors.join('\n'));
          setIsImporting(false);
          e.target.value = ''; 
          return;
        }

        try {
          // 2. 批次處理代號與寫入
          const grouped = validItems.reduce((acc, item) => {
            if (!acc[item.cat.id]) acc[item.cat.id] = { cat: item.cat, items: [] };
            acc[item.cat.id].items.push(item);
            return acc;
          }, {} as Record<string, { cat: Category, items: any[] }>);

          const insertData: any[] = [];
          const catCount = Object.keys(grouped).length;
          let currentCatIdx = 0;

          for (const catId in grouped) {
            const group = grouped[catId];
            const { data: existingCodes } = await sb
              .from('庫存總表')
              .select('商品代號')
              .eq('分類ID', catId);
            
            let maxSeq = 0;
            (existingCodes || []).forEach((p: any) => {
              if (p.商品代號) {
                const numStr = p.商品代號.replace(group.cat.分類代號, '');
                const num = parseInt(numStr, 10);
                if (!isNaN(num) && num > maxSeq) maxSeq = num;
              }
            });

            group.items.forEach((item: any, index: number) => {
              const newSeq = maxSeq + index + 1;
              const newCode = group.cat.分類代號 + String(newSeq).padStart(3, '0');
              insertData.push({
                分類ID: item.cat.id,
                商品名稱: item.name,
                商品代號: newCode,
                目前狀態: item.status,
                庫存數量: 0,
                買入數量: 0,
                賣出數量: 0,
                平均成本: 0,
                user_id: session?.user?.id // 記錄擁有者
              });
            });
            currentCatIdx++;
            setImportProgress(30 + Math.round((currentCatIdx / catCount) * 50));
          }

          setImportProgress(90);
          const { error } = await sb.from('庫存總表').insert(insertData);
          if (error) {
            alert('批次寫入資料庫失敗：' + error.message);
          } else {
            setImportProgress(100);
            setTimeout(() => {
              alert(`成功完成匯入，共 ${insertData.length} 筆商品。`);
              fetchData();
            }, 300);
          }
        } catch (err) {
          console.error(err);
          alert('匯入過程發生未預期錯誤');
        } finally {
          setIsImporting(false);
          e.target.value = ''; 
        }
      },
      error: (err) => {
        alert('解析 CSV 失敗：' + err.message);
        setIsImporting(false);
        e.target.value = '';
      }
    });
  };

  const handleDownloadTemplate = () => {
    const headers = ['商品分類(代號)', '商品名稱', '商品狀態'];
    const csvContent = headers.join(',') + '\n';
    
    // 使用 Blob 處理 UTF-8 BOM，確保 Excel 開啟時不亂碼
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const blob = new Blob([bom, csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', '庫存匯入範本.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePurchaseCsvImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || isSubmitting || isImporting) return;

    const parseNum = (str: any) => {
      const s = String(str || '').replace(/,/g, '').trim();
      return s === '' ? NaN : Number(s);
    };

    setIsImporting(true);
    setImportProgress(0);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data as any[];
        const fields = results.meta.fields || [];

        const requiredHeaders = ['日期', '商品名稱', '數量', '金額', '單位成本'];
        const missingHeaders = requiredHeaders.filter(h => !fields.includes(h));
        
        if (missingHeaders.length > 0) {
          setIsImporting(false);
          e.target.value = '';
          const msg = `匯入失敗：CSV 缺少必要的表頭欄位: ${missingHeaders.join(', ')}\n請下載正確的範本使用。`;
          setCsvErrors([msg]);
          setModalType('csvErrors');
          return;
        }

        const validItems: any[] = [];
        const errors: string[] = [];

        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          const date = row['日期']?.toString().trim() || today();
          const pName = row['商品名稱']?.toString().trim();
          const qty = parseNum(row['數量']);
          const amount = parseNum(row['金額']);
          const unitCost = parseNum(row['單位成本']);
          const status = row['訂單狀態']?.toString().trim() || '待入庫';
          const source = row['來源']?.toString().trim() || '';
          const note = row['備註']?.toString().trim() || '';

          if (!pName) {
            errors.push(`第 ${i + 2} 行：找不到商品名稱`);
            continue;
          }

          if (isNaN(qty) || isNaN(amount) || isNaN(unitCost) || qty <= 0) {
            errors.push(`第 ${i + 2} 行：數量、金額、單位成本必須為有效數字 (目前的輸入: 數量=${row['數量']}, 金額=${row['金額']}, 單位成本=${row['單位成本']})`);
            continue;
          }

          // 檢查金額計算 (允許 0.5 誤差)
          if (Math.abs(amount - (qty * unitCost)) > 0.5) {
            errors.push(`第 ${i + 2} 行：金額計算錯誤 (數量 ${qty} * 單價 ${unitCost} = ${qty * unitCost}，但 CSV 填寫 ${amount})`);
            continue;
          }

          const product = prods.find(p => p.商品名稱 === pName);
          if (!product) {
            errors.push(`第 ${i + 2} 行：商品 "${pName}" 不存在於系統中，請確認名稱是否正確`);
            continue;
          }

          validItems.push({ 
            商品ID: product.id, 
            數量: qty, 
            單位成本: unitCost, 
            金額: amount, 
            進貨日期: date, 
            進貨來源: source, 
            訂單狀態: status,
            備註: note,
            user_id: session?.user?.id
          });
          setImportProgress(Math.round(((i + 1) / rows.length) * 40)); // 前 40% 校驗
        }

        if (errors.length > 0) {
          setCsvErrors(errors);
          setModalType('csvErrors');
          setIsImporting(false);
          e.target.value = ''; 
          return;
        }

        try {
          setImportProgress(50);
          const { error } = await sb.from('進貨表').insert(validItems);
          if (error) throw error;

          setImportProgress(60);
          // 同步庫存
          const uniqueIds = Array.from(new Set(validItems.map(v => v.商品ID)));
          for (let i = 0; i < uniqueIds.length; i++) {
            await syncInventory(uniqueIds[i]);
            setImportProgress(60 + Math.round(((i + 1) / uniqueIds.length) * 40)); // 後 40% 同步
          }

          setImportSuccessInfo({ count: validItems.length, type: '進貨' });
          setModalType('importSuccess');
          fetchData();
        } catch (err: any) {
          console.error(err);
          alert('資料庫寫入失敗：' + err.message);
        } finally {
          setIsImporting(false);
          e.target.value = '';
        }
      },
      error: (err) => {
        alert('解析 CSV 失敗：' + err.message);
        setIsImporting(false);
        e.target.value = '';
      }
    });
  };

  const handleDownloadPurchaseTemplate = () => {
    const headers = ['日期', '商品名稱', '數量', '金額', '單位成本', '訂單狀態', '來源', '備註'];
    const csvContent = headers.join(',') + '\n';
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const blob = new Blob([bom, csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', '進貨匯入範本.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSaleCsvImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || isSubmitting || isImporting) return;

    const parseNum = (str: any) => {
      const s = String(str || '').replace(/,/g, '').trim();
      return s === '' ? NaN : Number(s);
    };

    setIsImporting(true);
    setImportProgress(0);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data as any[];
        const fields = results.meta.fields || [];

        const requiredHeaders = ['日期', '商品名稱', '數量', '銷售金額'];
        const missingHeaders = requiredHeaders.filter(h => !fields.includes(h));
        
        if (missingHeaders.length > 0) {
          setIsImporting(false);
          e.target.value = '';
          const msg = `匯入失敗：CSV 缺少必要的表頭欄位: ${missingHeaders.join(', ')}`;
          setCsvErrors([msg]);
          setModalType('csvErrors');
          return;
        }

        const validItems: any[] = [];
        const errors: string[] = [];
        const dateSeqs: Record<string, number> = {};

        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          const date = row['日期']?.toString().trim() || today();
          const pName = row['商品名稱']?.toString().trim();
          const qty = parseNum(row['數量']);
          const amount = parseNum(row['銷售金額']);
          const platform = row['平台']?.toString().trim() || '';
          const status = row['訂單狀態']?.toString().trim() || '未出貨';
          const note = row['備註']?.toString().trim() || '';

          if (!pName) {
            errors.push(`第 ${i + 2} 行：找不到商品名稱`);
            continue;
          }

          if (isNaN(qty) || isNaN(amount) || qty <= 0 || amount < 0) {
            errors.push(`第 ${i + 2} 行：數量、銷售金額無效 (目前的輸入: 數量=${row['數量']}, 金額=${row['銷售金額']})`);
            continue;
          }

          let finalNote = note;
          if (amount === 0) {
            finalNote = finalNote ? `${finalNote} (贈品)` : '贈品';
          }

          const product = prods.find(p => p.商品名稱 === pName);
          if (!product) {
            errors.push(`第 ${i + 2} 行：商品 "${pName}" 不存在於系統中`);
            continue;
          }

          validItems.push({ 
            date,
            商品ID: product.id, 
            數量: qty, 
            銷售金額: amount, 
            平台: platform,
            訂單狀態: status,
            備註: finalNote,
            unitCost: product.平均成本 || 0
          });
          setImportProgress(Math.round(((i + 1) / rows.length) * 20));
        }

        if (errors.length > 0) {
          setCsvErrors(errors);
          setModalType('csvErrors');
          setIsImporting(false);
          e.target.value = ''; 
          return;
        }

        try {
          const finalInsertData = [];
          for (let i = 0; i < validItems.length; i++) {
            const item = validItems[i];
            const datePrefix = normalizeDateToOrderPrefix(item.date);
            if (!dateSeqs[datePrefix]) {
              const { data: existingSales } = await sb.from('銷貨表')
                .select('訂單編號')
                .like('訂單編號', `${datePrefix}%`);
              
              let maxSeq = 0;
              (existingSales || []).forEach((s: any) => {
                const seq = parseInt(s.訂單編號.replace(datePrefix, ''), 10);
                if (!isNaN(seq) && seq > maxSeq) maxSeq = seq;
              });
              dateSeqs[datePrefix] = maxSeq;
            }

            dateSeqs[datePrefix]++;
            const orderNo = datePrefix + String(dateSeqs[datePrefix]).padStart(3, '0');
            const profit = item.銷售金額 - (item.unitCost * item.數量);

            finalInsertData.push({
              銷貨日期: item.date,
              訂單編號: orderNo,
              商品ID: item.商品ID,
              數量: item.數量,
              銷售金額: item.銷售金額,
              平台: item.平台,
              訂單狀態: item.訂單狀態,
              備註: item.備註,
              當前單位成本: item.unitCost,
              毛利: profit,
              user_id: session?.user?.id
            });
            setImportProgress(20 + Math.round(((i + 1) / validItems.length) * 40));
          }

          const { error } = await sb.from('銷貨表').insert(finalInsertData);
          if (error) throw error;

          const uniqueIds = Array.from(new Set(validItems.map(v => v.商品ID)));
          for (let i = 0; i < uniqueIds.length; i++) {
            await syncInventory(uniqueIds[i]);
            setImportProgress(60 + Math.round(((i + 1) / uniqueIds.length) * 40));
          }

          setImportSuccessInfo({ count: finalInsertData.length, type: '銷貨' });
          setModalType('importSuccess');
          fetchData();
        } catch (err: any) {
          console.error(err);
          alert('資料庫寫入失敗：' + err.message);
        } finally {
          setIsImporting(false);
          e.target.value = '';
        }
      },
      error: (err) => {
        alert('解析 CSV 失敗：' + err.message);
        setIsImporting(false);
        e.target.value = '';
      }
    });
  };

  const handleDownloadSaleTemplate = () => {
    const headers = ['日期', '商品名稱', '數量', '銷售金額', '平台', '訂單狀態', '備註'];
    const csvContent = headers.join(',') + '\n';
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const blob = new Blob([bom, csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', '銷貨匯入範本.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFinanceCsvImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || isSubmitting || isImporting) return;

    const parseNum = (str: any) => {
      const s = String(str || '').replace(/,/g, '').trim();
      return s === '' ? NaN : Number(s);
    };

    setIsImporting(true);
    setImportProgress(0);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data as any[];
        const fields = results.meta.fields || [];

        const requiredHeaders = ['日期', '項目內容', '收支類型', '金額'];
        const missingHeaders = requiredHeaders.filter(h => !fields.includes(h));
        
        if (missingHeaders.length > 0) {
          setIsImporting(false);
          e.target.value = '';
          const msg = `匯入失敗：CSV 缺少必要的表頭欄位: ${missingHeaders.join(', ')}`;
          setCsvErrors([msg]);
          setModalType('csvErrors');
          return;
        }

        const validItems: any[] = [];
        const errors: string[] = [];

        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          const date = row['日期']?.toString().trim() || today();
          const item = row['項目內容']?.toString().trim();
          const type = row['收支類型']?.toString().trim();
          const amount = parseNum(row['金額']);
          const note = row['備註']?.toString().trim() || '';

          if (!item || !type) {
            errors.push(`第 ${i + 2} 行：項目內容與收支類型為必填`);
            continue;
          }

          if (type !== '收入' && type !== '支出') {
            errors.push(`第 ${i + 2} 行：收支類型必須為 "收入" 或 "支出" (目前的輸入: ${type})`);
            continue;
          }

          if (isNaN(amount) || amount < 0) {
            errors.push(`第 ${i + 2} 行：金額無效 (目前的輸入: ${row['金額']})`);
            continue;
          }

          validItems.push({ 
            日期: date, 
            收支類型: type,
            金額: amount, 
            項目內容: item, 
            備註: note,
            user_id: session?.user?.id
          });
          setImportProgress(Math.round(((i + 1) / rows.length) * 50));
        }

        if (errors.length > 0) {
          setCsvErrors(errors);
          setModalType('csvErrors');
          setIsImporting(false);
          e.target.value = ''; 
          return;
        }

        try {
          const { error } = await sb.from('其他收支表').insert(validItems);
          if (error) throw error;
          
          setImportProgress(100);
          setImportSuccessInfo({ count: validItems.length, type: '收支' });
          setModalType('importSuccess');
          fetchData();
        } catch (err: any) {
          console.error(err);
          alert('資料庫寫入失敗：' + err.message);
        } finally {
          setIsImporting(false);
          e.target.value = '';
        }
      },
      error: (err) => {
        alert('解析 CSV 失敗：' + err.message);
        setIsImporting(false);
        e.target.value = '';
      }
    });
  };

  const handleDownloadFinanceTemplate = () => {
    const headers = ['日期', '項目內容', '收支類型', '金額', '備註'];
    const csvContent = headers.join(',') + '\n';
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const blob = new Blob([bom, csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', '其他收支匯入範本.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDelete = async () => {
    if (!showDeleteConfirm || isSubmitting) return;
    setIsSubmitting(true);
    const { table, id } = showDeleteConfirm;
    
    try {
      if (table === '商品分類表') {
        // 級聯刪除分類下的所有商品與訂單 (需嚴格限制在該使用者下)
        const { data: catProds } = await sb.from('庫存總表')
          .select('id')
          .eq('分類ID', id)
          .eq('user_id', session?.user?.id);
        const prodIds = (catProds || []).map((p: any) => p.id);
        
        if (prodIds.length > 0) {
          await sb.from('銷貨表').delete().in('商品ID', prodIds).eq('user_id', session?.user?.id);
          await sb.from('進貨表').delete().in('商品ID', prodIds).eq('user_id', session?.user?.id);
          await sb.from('庫存總表').delete().in('id', prodIds).eq('user_id', session?.user?.id);
        }
      } else if (table === '庫存總表') {
        // 級聯刪除該商品的所有訂單
        await sb.from('銷貨表').delete().eq('商品ID', id).eq('user_id', session?.user?.id);
        await sb.from('進貨表').delete().eq('商品ID', id).eq('user_id', session?.user?.id);
      }

      // 如果是單一進貨或銷貨刪除，需要先抓到 商品ID 以同步庫存
      let prodIdToSync = null;
      if (table === '進貨表' || table === '銷貨表') {
        const { data } = await sb.from(table).select('商品ID').eq('id', id).eq('user_id', session?.user?.id).single();
        if (data) prodIdToSync = data.商品ID;
      }

      const { error } = await sb.from(table).delete().eq('id', id).eq('user_id', session?.user?.id);
      if (error) {
        alert(error.message);
      } else if (prodIdToSync) {
        await syncInventory(prodIdToSync);
      }

      setShowDeleteConfirm(null);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('刪除過程中發生未預期錯誤');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBatchDelete = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!showBatchDelete || isSubmitting) return;
    
    const formData = new FormData(e.currentTarget);
    const table = showBatchDelete;
    const startDate = formData.get('startDate') as string;
    const endDate = formData.get('endDate') as string;
    const pName = formData.get('pName') as string;
    const isConfirmed = formData.get('confirmDelete') === 'on';
    
    if (!startDate || !endDate) {
      return window.alert('請填寫完整日期區間');
    }

    if (!isConfirmed) {
      return window.alert('請先勾選「我確定要執行批次刪除」');
    }

    setIsSubmitting(true);
    try {
      const dateCol = table === '進貨表' ? '進貨日期' : 
                     table === '銷貨表' ? '銷貨日期' : '日期';
      let query = sb.from(table).delete()
        .eq('user_id', session?.user?.id) // 安全檢查
        .gte(dateCol, startDate)
        .lte(dateCol, endDate);

      if (pName) {
        const product = prods.find(p => p.商品名稱 === pName);
        if (!product) {
          throw new Error(`找不到商品名稱：「${pName}」，請檢查輸入是否正確。`);
        }
        query = query.eq('商品ID', product.id);
      }

      const { error } = await query;
      if (error) throw error;

      setShowBatchDelete(null);
      await fetchData();
      await syncAllInventory(); 
      window.alert('批次刪除成功，庫存與獲利數據已更新。');
    } catch (err: any) {
      window.alert('批次刪除失敗：' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Derived Data ---
  
  const sortedProds = useMemo(() => {
    let filtered = prods.filter(p => {
      // 隱藏停售商品過濾
      if (hideDiscontinued && p.目前狀態 === '停售') {
        return false;
      }

      const cat = cats.find(c => c.id === p.分類ID);
      const q = invSearchApplied.toLowerCase();
      return (cat?.分類名稱 || '').toLowerCase().includes(q) || 
             (cat?.分類代號 || '').toLowerCase().includes(q) || 
             (p.商品代號 || '').toLowerCase().includes(q) || 
             (p.商品名稱 || '').toLowerCase().includes(q);
    });

    // 置頂邏輯與排序邏輯結合
    return [...filtered].sort((a, b) => {
      // 第一層：置頂排序
      const pinA = (a.是否置頂 === true || (a.是否置頂 as any) === 'Y') ? 1 : 0;
      const pinB = (b.是否置頂 === true || (b.是否置頂 as any) === 'Y') ? 1 : 0;
      if (pinA !== pinB) return pinB - pinA;

      // 第二層：使用者選擇的排序，如果沒選，預設依商品代號正序
      if (!invSortKey) {
        return (a.商品代號 || '').localeCompare(b.商品代號 || '');
      }
      
      let valA: any = '';
      let valB: any = '';

      if (invSortKey === 'code') {
        valA = a.商品代號 || '';
        valB = b.商品代號 || '';
      } else if (invSortKey === 'cost') {
        valA = a.平均成本 || 0;
        valB = b.平均成本 || 0;
      } else if (invSortKey === 'stock') {
        valA = a.庫存數量 || 0;
        valB = b.庫存數量 || 0;
      } else if (invSortKey === 'status') {
        valA = a.目前狀態 || '';
        valB = b.目前狀態 || '';
      }

      if (valA < valB) return invSortDir === 'asc' ? -1 : 1;
      if (valA > valB) return invSortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [prods, cats, invSearchApplied, hideDiscontinued, invSortKey, invSortDir]);

  const currentYear = dashMonth.slice(0, 4);
  const dashData = useMemo(() => {
    const isYear = dashViewType === 'year';
    
    // Primary Filter
    const dateFilter = (dateStr: string) => isYear ? (dateStr || '').startsWith(currentYear) : (dateStr || '').startsWith(dashMonth);

    const ms = sales.filter(s => dateFilter(s.銷貨日期));
    const mp = purch.filter(p => dateFilter(p.進貨日期));
    const mo = others.filter(o => dateFilter(o.日期));

    const rev = ms.reduce((s, r) => s + (r.銷售金額 || 0), 0);
    const cost = mp.reduce((s, r) => s + (r.金額 || (r.數量 || 0) * (r.單位成本 || 0)), 0);
    
    // 計算總毛利 (Sum of Gross Profits)
    const grossProfitTotal = ms.reduce((sum, s) => {
      // 優先使用已計算好的毛利紀錄
      if (s.毛利 !== undefined && s.毛利 !== null) return sum + s.毛利;
      
      // 若無（新資料或舊版本），則降級即時計算
      const saleCost = s.當前單位成本 ?? prods.find(p => p.id === s.商品ID)?.平均成本 ?? 0;
      return sum + Math.round((s.銷售金額 || 0) - ((s.數量 || 0) * saleCost));
    }, 0);

    const oIn = mo.filter(o => o.收支類型 === '收入').reduce((s, o) => s + (o.金額 || 0), 0);
    const oOut = mo.filter(o => o.收支類型 === '支出').reduce((s, o) => s + (o.金額 || 0), 0);
    const net = grossProfitTotal + oIn - oOut;
    
    const chartData = [];
    const getPeriodStats = (prefix: string) => {
      const pSales = sales.filter(s => (s.銷貨日期 || '').startsWith(prefix));
      const pPurch = purch.filter(p => (p.進貨日期 || '').startsWith(prefix));
      const pOthers = others.filter(o => (o.日期 || '').startsWith(prefix));

      const pRev = pSales.reduce((s, r) => s + (r.銷售金額 || 0), 0);
      const pPur = pPurch.reduce((s, p) => s + (p.金額 || (p.數量 || 0) * (p.單位成本 || 0)), 0);
      
      const pGross = pSales.reduce((sum, s) => {
        if (s.毛利 !== undefined && s.毛利 !== null) return sum + s.毛利;
        const saleCost = s.當前單位成本 ?? prods.find(p => p.id === s.商品ID)?.平均成本 ?? 0;
        return sum + Math.round(((s.銷售金額 || 0) - ((s.數量 || 0) * saleCost)) * 100) / 100;
      }, 0);

      const pIn = pOthers.filter(o => o.收支類型 === '收入').reduce((s, o) => s + (o.金額 || 0), 0);
      const pOut = pOthers.filter(o => o.收支類型 === '支出').reduce((s, o) => s + (o.金額 || 0), 0);
      
      return {
        revenue: pRev,
        purchase: pPur,
        net: Math.round((pGross + pIn - pOut) * 100) / 100
      };
    };

    for (let m = 1; m <= 12; m++) {
      const monthStr = `${currentYear}-${String(m).padStart(2, '0')}`;
      chartData.push({
        name: m + '月',
        ...getPeriodStats(monthStr)
      });
    }

    // Pie Chart Data
    const catTotals: Record<string, number> = {};
    ms.forEach(s => {
      const prod = prods.find(p => p.id === s.商品ID);
      const cat = prod ? cats.find(c => c.id === prod.分類ID) : null;
      const catName = cat?.分類名稱 || '其他';
      catTotals[catName] = (catTotals[catName] || 0) + (s.銷售金額 || 0);
    });
    const pieData = Object.entries(catTotals).map(([name, value]) => ({ name, value }));

    // Top 5 Products (Scoped to current period)
    const productStats: Record<string, { qty: number, rev: number }> = {};
    ms.forEach(s => {
      if (!productStats[s.商品ID]) productStats[s.商品ID] = { qty: 0, rev: 0 };
      productStats[s.商品ID].qty += (s.數量 || 0);
      productStats[s.商品ID].rev += (s.銷售金額 || 0);
    });

    const topProducts = Object.entries(productStats)
      .map(([id, stats]) => {
        const p = prods.find(pr => pr.id === id);
        return { id, ...stats, name: p?.商品名稱 || '未知商品', code: p?.商品代號 || '???' };
      })
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    return { rev, cost, net, oNet: oIn - oOut, ms, chartData, pieData, topProducts };
  }, [sales, purch, others, dashMonth, dashViewType, cats, prods]);

  const filteredInv = prods.filter(p => {
    const cat = cats.find(c => c.id === p.分類ID);
    const q = invSearch.toLowerCase();
    return (cat?.分類名稱 || '').toLowerCase().includes(q) ||
           (cat?.分類代號 || '').toLowerCase().includes(q) ||
           (p.商品代號 || '').toLowerCase().includes(q) ||
           (p.商品名稱 || '').toLowerCase().includes(q);
  });

  const sortedOthers = useMemo(() => {
    setFinancePage(1); // Reset page on filter/sort change
    let filtered = others.filter(o => {
      const q = financeSearch.toLowerCase();
      const matchesSearch = (o.項目內容 || '').toLowerCase().includes(q) || 
                            (o.備註 || '').toLowerCase().includes(q);
      const matchesStart = !financeStartDate || o.日期 >= financeStartDate;
      const matchesEnd = !financeEndDate || o.日期 <= financeEndDate;
      return matchesSearch && matchesStart && matchesEnd;
    });
    return [...filtered].sort((a, b) => {
      const dateA = a.日期 || '';
      const dateB = b.日期 || '';
      if (dateA < dateB) return financeSortDir === 'asc' ? -1 : 1;
      if (dateA > dateB) return financeSortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [others, financeSearch, financeStartDate, financeEndDate, financeSortDir]);

  const sortedPurch = useMemo(() => {
    setPurchasePage(1); // Reset page on filter/sort change
    let filtered = purch.filter(p => {
      const prod = prods.find(pr => pr.id === p.商品ID);
      const q = purchaseSearch.toLowerCase();
      const matchesSearch = (prod?.商品名稱 || '').toLowerCase().includes(q) || 
                            (prod?.商品代號 || '').toLowerCase().includes(q) || 
                            (p.進貨來源 || '').toLowerCase().includes(q);
      const matchesStart = !purchaseStartDate || p.進貨日期 >= purchaseStartDate;
      const matchesEnd = !purchaseEndDate || p.進貨日期 <= purchaseEndDate;
      return matchesSearch && matchesStart && matchesEnd;
    });
    return [...filtered].sort((a, b) => {
      const dateA = a.進貨日期 || '';
      const dateB = b.進貨日期 || '';
      if (dateA < dateB) return purchaseSortDir === 'asc' ? -1 : 1;
      if (dateA > dateB) return purchaseSortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [purch, prods, purchaseSearch, purchaseStartDate, purchaseEndDate, purchaseSortDir]);

  const sortedSales = useMemo(() => {
    setSalesPage(1); // Reset page on filter/sort change
    let filtered = sales.filter(s => {
      const prod = prods.find(pr => pr.id === s.商品ID);
      const q = salesSearch.toLowerCase();
      const matchesSearch = (s.訂單編號 || '').toLowerCase().includes(q) || 
                            (prod?.商品名稱 || '').toLowerCase().includes(q) || 
                            (prod?.商品代號 || '').toLowerCase().includes(q) || 
                            (s.平台 || '').toLowerCase().includes(q);
      const matchesStart = !salesStartDate || s.銷貨日期 >= salesStartDate;
      const matchesEnd = !salesEndDate || s.銷貨日期 <= salesEndDate;
      return matchesSearch && matchesStart && matchesEnd;
    });
    return [...filtered].sort((a, b) => {
      const valA = a.訂單編號 || '';
      const valB = b.訂單編號 || '';
      if (valA < valB) return salesSortDir === 'asc' ? -1 : 1;
      if (valA > valB) return salesSortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [sales, prods, salesSearch, salesStartDate, salesEndDate, salesSortDir]);

  const [viewingSaleBatches, setViewingSaleBatches] = useState<Sale | null>(null);
  const [saleBatchResults, setSaleBatchResults] = useState<{ purchaseDate: string, cost: number, qty: number, profit: number }[]>([]);
  const [isLoadingBatches, setIsLoadingBatches] = useState(false);

  const handleViewBatches = async (sale: Sale) => {
    setViewingSaleBatches(sale);
    setIsLoadingBatches(true);
    setSaleBatchResults([]);
    try {
      const purData = await fetchAll('進貨表', '進貨日期', true, { col: '建立時間', asc: true });
      const filteredPur = purData.filter(p => p.商品ID === sale.商品ID);
      
      const saleData = await fetchAll('銷貨表', '銷貨日期', true, { col: '訂單編號', asc: true });
      const filteredSale = saleData.filter(s => s.商品ID === sale.商品ID);

      const purchasePool = filteredPur.map(p => ({
        id: p.id,
        date: p.進貨日期,
        qty: p.數量 || 0,
        cost: p.單位成本 || 0
      }));

      for (const s of filteredSale) {
        let remaining = s.數量 || 0;
        const currentSaleBatches: { purchaseDate: string, cost: number, qty: number, profit: number }[] = [];

        for (const batch of purchasePool) {
          if (remaining <= 0) break;
          if (batch.qty <= 0) continue;

          const consume = Math.min(remaining, batch.qty);
          const unitRevenue = (s.銷售金額 || 0) / (s.數量 || 1);
          const segmentRevenue = unitRevenue * consume;
          const segmentCost = consume * batch.cost;
          const segmentProfit = segmentRevenue - segmentCost;

          currentSaleBatches.push({
            purchaseDate: batch.date,
            cost: batch.cost,
            qty: consume,
            profit: Math.round(segmentProfit * 100) / 100
          });

          batch.qty -= consume;
          remaining -= consume;
        }

        if (s.id === sale.id) {
          if (remaining > 0) {
            const fallbackProfit = (s.銷售金額 || 0) * (remaining / s.數量) - (s.當前單位成本 || 0) * remaining;
            currentSaleBatches.push({
              purchaseDate: '庫存不足 (自動回退)',
              cost: s.當前單位成本 || 0,
              qty: remaining,
              profit: Math.round(fallbackProfit * 100) / 100
            });
          }
          setSaleBatchResults(currentSaleBatches);
          break;
        }
      }
    } catch (err) {
      console.error('Fetch batches error:', err);
    } finally {
      setIsLoadingBatches(false);
    }
  };

  const sidebarItems = [
    { id: 'dashboard', label: '主控面板', icon: LayoutDashboard },
    { id: 'category', label: '品類設定', icon: Tag },
    { id: 'inventory', label: '全域庫存', icon: Box },
    { id: 'finance', label: '其他收支', icon: CreditCard },
    { id: 'purchase', label: '進貨管理', icon: ShoppingCart },
    { id: 'sales', label: '銷售訂單', icon: History },
  ];

  if (checkingSession || (session && loading)) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        {authError ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-sm w-full bg-white p-8 rounded-3xl shadow-xl border border-red-50"
          >
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="text-red-500" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">連線發生錯誤</h3>
            <p className="text-sm text-gray-500 mb-8 font-medium leading-relaxed">{authError}</p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-[#111827] text-white font-bold py-4 rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw size={18} />
              <span>重新整理頁面</span>
            </button>
          </motion.div>
        ) : (
          <>
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full mb-4"
            />
            <p className="text-gray-500 font-medium animate-pulse">
              {checkingSession ? "驗證權限中..." : "系統加載中..."}
            </p>
            <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest mt-2">
              Secure Cloud Connection via Supabase
            </p>
          </>
        )}
      </div>
    );
  }

  if (!session) {
    return <AuthScreen onGuestLogin={() => {}} />;
  }

  const toggleInvSort = (key: 'code' | 'cost' | 'stock' | 'status') => {
    if (invSortKey === key) {
      setInvSortDir(invSortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setInvSortKey(key);
      setInvSortDir('asc');
    }
  };

  const handleSignOut = async () => {
    sb.auth.signOut();
  };

  const SortIcon = ({ sKey }: { sKey: string }) => {
    if (invSortKey !== sKey) return <ArrowUpDown size={12} className="ml-1 opacity-40" />;
    return invSortDir === 'asc' ? <ArrowUpDown size={12} className="ml-1 text-brand-500" /> : <ArrowUpDown size={12} className="ml-1 text-brand-500 rotate-180" />;
  };

  const SortIconGeneric = ({ dir, active }: { dir: 'asc' | 'desc', active: boolean }) => {
    if (!active) return <ArrowUpDown size={12} className="ml-1 opacity-40" />;
    return dir === 'asc' ? <ArrowUpDown size={12} className="ml-1 text-brand-500" /> : <ArrowUpDown size={12} className="ml-1 text-brand-500 rotate-180" />;
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col lg:flex-row font-sans text-gray-900 overflow-x-hidden" data-theme={theme}>
      {/* --- Import Progress Overlay --- */}
      {isImporting && <ImportProgressOverlay progress={importProgress} />}

      <AnimatePresence>
        {showSplash && <SplashScreen onComplete={() => {}} />}
      </AnimatePresence>

      {/* --- Sidebar (Desktop) --- */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-20 xl:w-64 bg-[#111827] text-white flex-col z-40 transition-all duration-300">
        <div className="p-4 xl:p-8 flex items-center justify-center xl:justify-start gap-3">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="w-10 h-10 bg-gradient-to-br from-brand-400 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20"
          >
            <Zap className="text-white" size={24} fill="white" />
          </motion.div>
          <span className="hidden xl:block text-xl font-bold tracking-tight">代購<span className="text-brand-500">管家</span></span>
        </div>

        <nav className="flex-1 mt-8 space-y-2 px-3">
          {sidebarItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center justify-center xl:justify-start gap-4 p-4 xl:px-6 rounded-2xl transition-all duration-200 group relative",
                activeTab === item.id 
                  ? "bg-white/10 text-white font-semibold" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon size={22} className={cn(activeTab === item.id ? "text-brand-500" : "group-hover:text-brand-400")} />
              <span className="hidden xl:block whitespace-nowrap">{item.label}</span>
              {activeTab === item.id && (
                <motion.div 
                  layoutId="active-nav"
                  className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-brand-500 rounded-l-full shadow-[0_0_15px_rgba(var(--brand-rgb),0.5)]"
                />
              )}
            </button>
          ))}
        </nav>

        <div className="p-6 space-y-4">
          <div className="hidden xl:block bg-white/5 rounded-2xl p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">目前工作空間</p>
            </div>
            <p className="text-xs text-white font-medium truncate opacity-80" title={session?.user?.email}>
              {isGuest ? "訪客試用環境" : session?.user?.email}
            </p>
            <p className="text-[10px] text-gray-500 mt-1">資料庫：獨立隔離中</p>
          </div>
          <div className="hidden xl:flex flex-wrap items-center gap-2 px-2 pb-2 border-b border-white/5">
            {[
              { id: 'orange', color: '#f97316', name: '橘色' },
              { id: 'pink', color: '#ec4899', name: '粉色' },
              { id: 'blue', color: '#3b82f6', name: '藍色' },
              { id: 'emerald', color: '#10b981', name: '翠綠' },
              { id: 'violet', color: '#8b5cf6', name: '紫羅蘭' },
            ].map((t) => (
              <button 
                key={t.id}
                onClick={() => setTheme(t.id as any)}
                className={cn(
                  "w-5 h-5 rounded-full ring-offset-2 ring-offset-[#111827] transition-all", 
                  theme === t.id ? "ring-2 ring-white scale-110" : "hover:scale-110 opacity-50"
                )}
                style={{ backgroundColor: t.color }}
                title={`${t.name}主題`}
              />
            ))}
          </div>
          <div className="hidden xl:block bg-white/5 rounded-2xl p-4 border border-white/10">
            <p className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-1">Version 2.0</p>
            <p className="text-xs text-gray-300">雲端同步已開啟</p>
          </div>
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center justify-center xl:justify-start gap-4 p-4 xl:px-6 rounded-2xl transition-all duration-200 text-gray-400 hover:text-red-400 hover:bg-red-500/10 group"
          >
            <LogOut size={20} />
            <span className="hidden xl:block font-medium">登出系統</span>
          </button>
        </div>
      </aside>

      {/* --- Bottom Nav (Mobile) --- */}
      <nav className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] bg-[#111827]/90 backdrop-blur-lg border border-white/10 rounded-[2rem] px-4 py-3 flex items-center justify-between z-50 shadow-2xl">
        {sidebarItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "p-3 rounded-2xl transition-all relative flex flex-col items-center gap-1",
              activeTab === item.id ? "text-brand-500" : "text-gray-500"
            )}
          >
            <item.icon size={20} className={activeTab === item.id ? "fill-brand-500/20" : ""} />
            {activeTab === item.id && (
              <motion.div 
                layoutId="active-nav-mobile"
                className="absolute -top-1 w-1 h-1 bg-brand-500 rounded-full"
              />
            )}
            <span className="text-[10px] font-bold tracking-tight">{item.label.slice(0, 2)}</span>
          </button>
        ))}
        <button 
          onClick={handleSignOut}
          className="p-3 text-gray-500"
        >
          <LogOut size={20} />
        </button>
      </nav>

      {/* --- Main Content --- */}
      <main className="flex-1 lg:ml-20 xl:ml-64 min-h-screen px-4 py-8 xl:px-12 xl:py-10 pb-32 lg:pb-10">
        {isGuest && (
          <div className="mb-6 bg-orange-50 border border-orange-100 rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <AlertCircle size={18} className="text-orange-500" />
              <p className="text-xs font-bold text-orange-800">
                您目前處於訪客試用模式。所有錄入資料將於下次登出入時自動清空。
              </p>
            </div>
            <button 
              onClick={cleanGuestData}
              disabled={loading}
              className="text-[10px] font-black bg-white text-orange-600 px-3 py-2 rounded-xl border border-orange-200 hover:bg-orange-600 hover:text-white hover:border-orange-600 transition-all flex items-center gap-1.5 shadow-sm whitespace-nowrap"
            >
              <RotateCcw size={12} className={cn(loading && "animate-spin")} />
              <span>立刻重置環境</span>
            </button>
          </div>
        )}
        {/* Top Bar */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                {sidebarItems.find(i => i.id === activeTab)?.label}
              </h1>
              <p className="text-gray-500 mt-1">
                {activeTab === 'dashboard' ? '歡迎回來，今天又是充滿元氣的一天！' : `管理您的${sidebarItems.find(i => i.id === activeTab)?.label}`}
              </p>
            </div>
            
            {/* Mobile Theme Selector */}
            <div className="lg:hidden flex items-center gap-2 p-2 bg-white rounded-2xl border border-gray-100 shadow-sm w-fit">
              {[
                { id: 'orange', color: '#f97316' },
                { id: 'pink', color: '#ec4899' },
                { id: 'blue', color: '#3b82f6' },
                { id: 'emerald', color: '#10b981' },
                { id: 'violet', color: '#8b5cf6' },
              ].map((t) => (
                <button 
                  key={t.id}
                  onClick={() => setTheme(t.id as any)}
                  className={cn(
                    "w-6 h-6 rounded-full transition-all ring-offset-2", 
                    theme === t.id ? "ring-2 ring-gray-200 scale-110" : "opacity-40 hover:opacity-100"
                  )}
                  style={{ backgroundColor: t.color }}
                />
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-white px-4 py-2.5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center">
                <LayoutDashboard size={14} className="text-brand-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Administrator</span>
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* --- Tab: Dashboard --- */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex flex-col xs:flex-row items-center gap-3 bg-white p-2 xs:pl-6 rounded-3xl border border-gray-100 shadow-sm w-full sm:w-auto">
                    <div className="flex bg-gray-100 p-1 rounded-2xl w-full xs:w-auto">
                      <button 
                        onClick={() => setDashViewType('month')}
                        className={cn("flex-1 xs:flex-none px-4 py-1.5 rounded-xl text-xs font-bold transition-all", dashViewType === 'month' ? "bg-white text-brand-600 shadow-sm" : "text-gray-500 hover:text-gray-700")}
                      >
                        月統計
                      </button>
                      <button 
                        onClick={() => setDashViewType('year')}
                        className={cn("flex-1 xs:flex-none px-4 py-1.5 rounded-xl text-xs font-bold transition-all", dashViewType === 'year' ? "bg-white text-brand-600 shadow-sm" : "text-gray-500 hover:text-gray-700")}
                      >
                        年統計
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-2 w-full xs:w-auto justify-center xs:justify-start">
                      <span className="hidden xs:inline text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                        {dashViewType === 'month' ? '基準月份' : '統計年份'}
                      </span>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => shiftDashboardDate(-1)}
                          className="p-1.5 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-brand-500 transition-colors"
                          title={dashViewType === 'month' ? "上一個月" : "下一年"}
                        >
                          <ChevronLeft size={16} />
                        </button>
                        
                        {dashViewType === 'month' ? (
                          <input 
                            type="month" 
                            value={dashMonth}
                            onChange={(e) => setDashMonth(e.target.value)}
                            className="bg-gray-50 border-none rounded-xl px-2 py-1.5 font-bold text-gray-800 focus:ring-2 focus:ring-brand-500/20 text-center text-sm w-32"
                          />
                        ) : (
                          <div className="flex items-center gap-1">
                            <input 
                              type="number" 
                              min="2000"
                              max="2100"
                              value={dashMonth.slice(0, 4)}
                              onChange={(e) => setDashMonth(`${e.target.value}-${dashMonth.slice(5, 7)}`)}
                              className="bg-gray-50 border-none rounded-xl px-2 py-1.5 font-bold text-gray-800 focus:ring-2 focus:ring-brand-500/20 w-20 text-center text-sm"
                            />
                            <span className="text-[10px] font-bold text-gray-400">年</span>
                          </div>
                        )}
                        
                        <button 
                          onClick={() => shiftDashboardDate(1)}
                          className="p-1.5 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-brand-500 transition-colors"
                          title={dashViewType === 'month' ? "下一個月" : "下一年"}
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                  <KPICard 
                    label={dashViewType === 'year' ? "年度總營收" : "本月營業額"}
                    value={formatCurrency(dashData.rev)} 
                    sub={`${dashData.ms.length} 筆訂單`} 
                    icon={TrendingUp} 
                    colorClass="bg-blue-600 shadow-blue-500/30 shadow-lg" 
                    delay={0.1}
                  />
                  <KPICard 
                    label={dashViewType === 'year' ? "年度採購支出" : "本月採購額"}
                    value={formatCurrency(dashData.cost)} 
                    sub="庫存補充支出" 
                    icon={ShoppingCart} 
                    colorClass="bg-brand-500 shadow-brand-500/30 shadow-lg" 
                    delay={0.2}
                  />
                  <KPICard 
                    label="雜項淨收支" 
                    value={(dashData.oNet >= 0 ? '+' : '-') + formatCurrency(Math.abs(dashData.oNet))} 
                    sub="廣告/運費/包材" 
                    icon={Wallet} 
                    colorClass={dashData.oNet >= 0 ? "bg-emerald-500 shadow-emerald-500/30 shadow-lg" : "bg-red-500 shadow-red-500/30 shadow-lg"} 
                    delay={0.3}
                  />
                  <KPICard 
                    label={dashViewType === 'year' ? "年度總淨利" : "本月總淨利"}
                    value={formatCurrency(dashData.net)} 
                    sub={`利潤率 ${dashData.rev ? ((dashData.net / dashData.rev) * 100).toFixed(1) : 0}%`} 
                    icon={BarChart3} 
                    colorClass="bg-[#2D3142] shadow-gray-500/30 shadow-lg" 
                    delay={0.4}
                  />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                  <Card 
                    title={`${currentYear} 年度營運趨勢`} 
                    className="xl:col-span-2"
                    actions={
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex bg-gray-100/80 p-1 rounded-xl shadow-inner border border-gray-100">
                          <button 
                            onClick={() => setDashChartMetric('rev_pur')}
                            className={cn("px-4 py-1.5 rounded-lg text-xs font-bold transition-all", dashChartMetric === 'rev_pur' ? "bg-white text-brand-600 shadow-md ring-1 ring-brand-500/5" : "text-gray-400 hover:text-gray-600")}
                          >
                            收支
                          </button>
                          <button 
                            onClick={() => setDashChartMetric('net')}
                            className={cn("px-4 py-1.5 rounded-lg text-xs font-bold transition-all", dashChartMetric === 'net' ? "bg-white text-brand-600 shadow-md ring-1 ring-brand-500/5" : "text-gray-400 hover:text-gray-600")}
                          >
                            淨利
                          </button>
                        </div>
                        <div className="flex bg-gray-100/80 p-1 rounded-xl shadow-inner border border-gray-100">
                          <button 
                            onClick={() => setDashChartType('bar')}
                            className={cn("px-4 py-1.5 rounded-lg text-xs font-bold transition-all", dashChartType === 'bar' ? "bg-white text-gray-900 shadow-md ring-1 ring-gray-900/5" : "text-gray-400 hover:text-gray-600")}
                          >
                            柱狀
                          </button>
                          <button 
                            onClick={() => setDashChartType('line')}
                            className={cn("px-4 py-1.5 rounded-lg text-xs font-bold transition-all", dashChartType === 'line' ? "bg-white text-gray-900 shadow-md ring-1 ring-gray-900/5" : "text-gray-400 hover:text-gray-600")}
                          >
                            折線
                          </button>
                        </div>
                      </div>
                    }
                  >
                    <div className="h-[380px] w-full mt-6 -ml-4 pr-2">
                      <ResponsiveContainer width="100%" height="100%">
                        {dashChartType === 'bar' ? (
                          <BarChart data={dashData.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                            <XAxis 
                              dataKey="name" 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{fill: '#9CA3AF', fontSize: 11, fontWeight: 500}} 
                              dy={10}
                            />
                            <YAxis 
                              width={70} 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{fill: '#9CA3AF', fontSize: 11, fontWeight: 500}} 
                              tickFormatter={(value) => `NT$${(value / 1000).toLocaleString()}k`} 
                            />
                            <Tooltip 
                              formatter={(value: any) => [`NT$${value.toLocaleString()}`, '']}
                              contentStyle={{ 
                                borderRadius: '16px', 
                                border: 'none', 
                                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                                padding: '12px'
                              }}
                              cursor={{ fill: '#F9FAFB' }}
                            />
                            {dashChartMetric === 'rev_pur' && <Bar dataKey="revenue" name="營業額" fill="#185FA5" radius={[6, 6, 0, 0]} barSize={20} />}
                            {dashChartMetric === 'rev_pur' && <Bar dataKey="purchase" name="採購額" fill={brandHex} radius={[6, 6, 0, 0]} barSize={20} />}
                            {dashChartMetric === 'net' && <Bar dataKey="net" name="總淨利" fill="#10B981" radius={[6, 6, 0, 0]} barSize={32} />}
                            <Legend verticalAlign="top" align="right" height={36} iconType="circle" wrapperStyle={{ paddingBottom: '20px', fontSize: '12px' }} />
                          </BarChart>
                        ) : (
                          <LineChart data={dashData.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                            <XAxis 
                              dataKey="name" 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{fill: '#9CA3AF', fontSize: 11, fontWeight: 500}} 
                              dy={10}
                            />
                            <YAxis 
                              width={70} 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{fill: '#9CA3AF', fontSize: 11, fontWeight: 500}} 
                              tickFormatter={(value) => `NT$${(value / 1000).toLocaleString()}k`} 
                            />
                            <Tooltip 
                              formatter={(value: any) => [`NT$${value.toLocaleString()}`, '']}
                              contentStyle={{ 
                                borderRadius: '16px', 
                                border: 'none', 
                                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                                padding: '12px'
                              }}
                            />
                            {dashChartMetric === 'rev_pur' && <Line type="monotone" dataKey="revenue" name="營業額" stroke="#185FA5" strokeWidth={4} dot={{ r: 4, fill: '#185FA5', strokeWidth: 0 }} activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }} />}
                            {dashChartMetric === 'rev_pur' && <Line type="monotone" dataKey="purchase" name="採購額" stroke={brandHex} strokeWidth={4} dot={{ r: 4, fill: brandHex, strokeWidth: 0 }} activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }} />}
                            {dashChartMetric === 'net' && <Line type="monotone" dataKey="net" name="總淨利" stroke="#10B981" strokeWidth={4} dot={{ r: 4, fill: '#10B981', strokeWidth: 0 }} activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }} />}
                            <Legend verticalAlign="top" align="right" height={36} iconType="circle" wrapperStyle={{ paddingBottom: '20px', fontSize: '12px' }} />
                          </LineChart>
                        )}
                      </ResponsiveContainer>
                    </div>
                  </Card>

                  <div className="space-y-8">
                    <Card title="品類銷售佔比">
                      <div className="h-[250px] w-full flex flex-col items-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={dashData.pieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={45}
                              outerRadius={65}
                              paddingAngle={5}
                              dataKey="value"
                              stroke="none"
                              labelLine={true}
                              label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                            >
                              {dashData.pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={['#10B981', '#F59E0B', '#3B82F6', '#8B5CF6', '#EC4899'][index % 5]} />
                              ))}
                            </Pie>
                            <Tooltip 
                              formatter={(value: any) => [`NT$${value.toLocaleString()}`, '金額']}
                              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                            />
                            <Legend 
                              layout="horizontal" 
                              verticalAlign="bottom" 
                              align="center"
                              iconType="circle"
                              wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '10px' }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </Card>

                    <Card title={`熱賣 TOP 5 (${dashViewType === 'year' ? '年度' : '月度'})`} className="bg-gradient-to-br from-brand-50 to-white">
                      <div className="space-y-4">
                        {dashData.topProducts.length > 0 ? dashData.topProducts.map((p, idx) => (
                          <div key={p.id} className="flex items-center gap-3">
                            <div className={cn(
                              "w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold",
                              idx === 0 ? "bg-brand-500 text-white" : "bg-gray-100 text-gray-500"
                            )}>
                              {idx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-gray-900 truncate">{p.name}</p>
                              <p className="text-[10px] text-gray-400 font-medium">代號: {p.code}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-bold text-brand-600">{p.qty} 件</p>
                              <p className="text-[10px] text-gray-400">{formatCurrency(p.rev)}</p>
                            </div>
                          </div>
                        )) : (
                          <p className="text-center text-xs text-gray-400 py-4 italic">此期間尚無銷貨資料</p>
                        )}
                      </div>
                    </Card>
                  </div>
                </div>

                <Card title={dashViewType === 'year' ? `${dashMonth.slice(0, 4)} 年度銷售明細` : `${dashMonth} 月份銷售明細`}>
                  <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                          <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest leading-none">日期</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest leading-none">商品</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest leading-none text-right">金額</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest leading-none">狀態</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {dashData.ms.length > 0 ? dashData.ms.map(item => {
                          const prod = prods.find(p => p.id === item.商品ID);
                          return (
                            <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                              <td className="px-6 py-4 text-sm text-gray-500 font-medium">{item.銷貨日期}</td>
                              <td className="px-6 py-4">
                                <span className="text-sm font-bold text-brand-600 block">{prod?.商品代號}</span>
                                <span className="text-sm text-gray-700">{prod?.商品名稱}</span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <span className="text-sm font-bold text-gray-900">{formatCurrency(item.銷售金額)}</span>
                              </td>
                              <td className="px-6 py-4">
                                <span className={cn(
                                  "px-3 py-1 rounded-full text-[10px] font-bold uppercase",
                                  item.訂單狀態 === '已完成' ? "bg-emerald-100 text-emerald-600" :
                                  item.訂單狀態 === '已出貨' ? "bg-blue-100 text-blue-600" :
                                  "bg-amber-100 text-amber-600"
                                )}>
                                  {item.訂單狀態}
                                </span>
                              </td>
                            </tr>
                          );
                        }) : (
                          <tr><td colSpan={4} className="py-12 text-center text-gray-400 italic">此區間尚無銷售資料</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile View */}
                  <div className="lg:hidden divide-y divide-gray-100">
                    {dashData.ms.length > 0 ? dashData.ms.map(item => {
                      const prod = prods.find(p => p.id === item.商品ID);
                      return (
                        <div key={item.id} className="py-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                               <p className="text-[10px] text-gray-400 font-bold mb-0.5">{item.銷貨日期}</p>
                               <p className="text-sm font-bold text-gray-900">{prod?.商品名稱}</p>
                            </div>
                            <span className={cn(
                              "px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase",
                              item.訂單狀態 === '已完成' ? "bg-emerald-100 text-emerald-600" :
                              item.訂單狀態 === '已出貨' ? "bg-blue-100 text-blue-600" :
                              "bg-amber-100 text-amber-600"
                            )}>
                              {item.訂單狀態}
                            </span>
                          </div>
                          <div className="flex justify-between items-end">
                             <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded">#{prod?.商品代號}</span>
                             <span className="text-sm font-black text-gray-900">{formatCurrency(item.銷售金額)}</span>
                          </div>
                        </div>
                      );
                    }) : (
                      <p className="text-center text-xs text-gray-400 py-8 italic">此區間尚無銷售資料</p>
                    )}
                  </div>
                </Card>
              </div>
            )}

            {/* --- Tab: Category --- */}
            {activeTab === 'category' && (
              <div className="space-y-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800">所有產品類別</h2>
                  <button 
                    onClick={() => { setModalType('category'); setEditItem(null); }} 
                    className="bg-brand-500 hover:bg-brand-600 text-white px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-brand-500/20 flex items-center gap-2"
                  >
                    <Plus size={18} /> 新增分類
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {cats.map((cat, i) => (
                    <motion.div
                      key={cat.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group relative"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center font-bold text-brand-500 text-xl tracking-wider">
                          {cat.分類代號}
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setEditItem(cat); setModalType('category'); }} className="p-2 hover:bg-gray-100 rounded-xl text-blue-500 transition-colors">
                            <Edit3 size={16} />
                          </button>
                          <button onClick={() => setShowDeleteConfirm({ table: '商品分類表', id: cat.id })} className="p-2 hover:bg-gray-100 rounded-xl text-red-500 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <h4 className="text-lg font-bold text-gray-900 mb-1">{cat.分類名稱}</h4>
                      <p className="text-xs text-gray-500">
                        {prods.filter(p => p.分類ID === cat.id).length} 個相關商品
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* --- Tab: Inventory --- */}
            {activeTab === 'inventory' && (
              <div className="space-y-6">
                <div className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                  <div className="flex flex-col lg:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        type="text" 
                        placeholder="搜尋品類、代號或商品名稱..." 
                        value={invSearch}
                        onChange={(e) => setInvSearch(e.target.value)}
                        className="w-full bg-gray-50 border-none rounded-2xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-brand-500/20"
                      />
                    </div>
                    <button 
                      onClick={() => setInvSearchApplied(invSearch)}
                      className="w-full lg:w-auto bg-brand-100 text-brand-600 px-8 py-3 rounded-2xl font-bold text-sm hover:bg-brand-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <Search size={16} /> 查詢
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button 
                      onClick={syncAllInventory}
                      disabled={isSubmitting}
                      className="p-3 text-emerald-600 hover:text-emerald-700 transition-colors bg-gray-50 rounded-xl hover:bg-emerald-100"
                      title="重新計算所有庫存與獲利"
                    >
                      <RotateCcw size={20} className={cn(isSubmitting && "animate-spin")} />
                    </button>
                    <button 
                      onClick={handleDownloadTemplate}
                      className="p-3 text-gray-400 hover:text-gray-600 transition-colors bg-gray-50 rounded-xl hover:bg-gray-100"
                      title="下載匯入範本"
                    >
                      <FileDown size={20} />
                    </button>
                    <label className={cn(
                      "flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-xs transition-all cursor-pointer",
                      isSubmitting ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                    )}>
                      <FileUp size={14} /> {isSubmitting ? '載入中...' : 'CSV 匯入'}
                      <input 
                        type="file" 
                        accept=".csv" 
                        className="hidden" 
                        onChange={handleCsvImport} 
                        disabled={isSubmitting}
                      />
                    </label>

                    {/* 隱藏停售商品勾選框 */}
                    <label className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl cursor-pointer transition-colors border border-transparent hover:border-gray-200">
                      <input 
                        type="checkbox" 
                        checked={hideDiscontinued}
                        onChange={(e) => setHideDiscontinued(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20"
                      />
                      <span className="text-xs font-bold text-gray-600">隱藏停售商品</span>
                    </label>

                    <button 
                      onClick={() => { setModalType('product'); setEditItem(null); }}
                      className="flex-1 sm:flex-none bg-[#111827] text-white px-8 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity shadow-lg"
                    >
                      新增商品
                    </button>
                  </div>
                </div>

                <Card>
                  <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th 
                            className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-brand-500 transition-colors"
                            onClick={() => toggleInvSort('code')}
                          >
                            <div className="flex items-center">商品資訊 <SortIcon sKey="code" /></div>
                          </th>
                          <th 
                            className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-brand-500 transition-colors"
                            onClick={() => toggleInvSort('cost')}
                          >
                            <div className="flex items-center">平均成本 <SortIcon sKey="cost" /></div>
                          </th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                            累計買入 / 賣出
                          </th>
                          <th 
                            className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-brand-500 transition-colors"
                            onClick={() => toggleInvSort('stock')}
                          >
                            <div className="flex items-center">庫存數 <SortIcon sKey="stock" /></div>
                          </th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                            平均獲利
                          </th>
                          <th 
                            className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-brand-500 transition-colors"
                            onClick={() => toggleInvSort('status')}
                          >
                            <div className="flex items-center">狀態 <SortIcon sKey="status" /></div>
                          </th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">操作</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {sortedProds.map(p => {
                          const cat = cats.find(c => c.id === p.分類ID);
                          return (
                            <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-6 py-5">
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center text-brand-600 font-bold text-xs">
                                    {cat?.分類代號}
                                  </div>
                                  <div>
                                    <span className="text-xs font-bold text-brand-500 tracking-wider">#{p.商品代號}</span>
                                    <p className="font-semibold text-gray-900">{p.商品名稱}</p>
                                    <span className="text-[10px] text-gray-400 font-bold uppercase">{cat?.分類名稱}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-5">
                                <span className="font-bold text-gray-900">{formatCurrency(p.平均成本 || 0)}</span>
                              </td>
                              <td className="px-6 py-5">
                                <div className="flex flex-col gap-0.5">
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                    <span className="text-xs font-bold text-gray-600">買: {p.買入數量 || 0}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    <span className="text-xs font-bold text-emerald-600 font-mono">賣: {p.賣出數量 || 0}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-5">
                                <div className="flex items-center gap-2">
                                  <span className={cn("text-lg font-bold", p.庫存數量 < 5 ? "text-red-500" : "text-gray-900")}>
                                    {p.庫存數量}
                                  </span>
                                  {p.庫存數量 < 5 && <AlertCircle size={14} className="text-red-500 animate-pulse" />}
                                </div>
                              </td>
                              <td className="px-6 py-5">
                                <p className="font-bold text-emerald-600">{formatCurrency(p.平均獲利 || 0)}</p>
                                <p className="text-[10px] text-gray-400 font-medium whitespace-nowrap">平均單件獲利</p>
                              </td>
                              <td className="px-6 py-5">
                                <span className={cn(
                                  "text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase border transition-colors",
                                  p.目前狀態 === '售賣中' ? "border-emerald-200 text-emerald-600 bg-emerald-50" : "border-gray-200 text-gray-400 bg-gray-50"
                                )}>
                                  {p.目前狀態}
                                </span>
                              </td>
                              <td className="px-6 py-5 text-right">
                                <div className="flex justify-end gap-2">
                                  <button 
                                    onClick={() => togglePinProduct(p.id, p.是否置頂)} 
                                    className={cn("p-2 transition-colors rounded-xl flex items-center gap-1", (p.是否置頂 === true) ? "text-brand-500 bg-brand-50" : "text-gray-400 hover:bg-gray-100")}
                                    title={(p.是否置頂 === true) ? "取消置頂" : "設為置頂"}
                                  >
                                    <Pin size={16} fill={(p.是否置頂 === true) ? "currentColor" : "none"} />
                                    {(p.是否置頂 === true) && <span className="text-[10px] font-bold">置頂</span>}
                                  </button>
                                  <button onClick={() => { setEditItem(p); setModalType('product'); }} className="p-2 transition-colors hover:bg-gray-100 rounded-xl text-blue-500">
                                    <Edit3 size={16} />
                                  </button>
                                  <button onClick={() => setShowDeleteConfirm({ table: '庫存總表', id: p.id })} className="p-2 transition-colors hover:bg-gray-100 rounded-xl text-red-500">
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="lg:hidden divide-y divide-gray-100">
                    {sortedProds.map(p => {
                      const cat = cats.find(c => c.id === p.分類ID);
                      return (
                        <div key={p.id} className="py-4 space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center text-brand-600 font-bold text-xs shrink-0">
                                {cat?.分類代號}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1">
                                  <span className="text-xs font-bold text-brand-500 tracking-wider">#{p.商品代號}</span>
                                  {(p.是否置頂 === true) && <Pin size={10} className="text-brand-500 fill-brand-500" />}
                                  {(p.是否置頂 === true) && <span className="text-[8px] font-bold text-brand-500">置頂</span>}
                                </div>
                                <p className="font-bold text-gray-900 truncate">{p.商品名稱}</p>
                                <p className="text-[10px] text-gray-400 font-bold">{cat?.分類名稱}</p>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <button 
                                onClick={() => togglePinProduct(p.id, p.是否置頂)} 
                                className={cn("p-2 rounded-xl transition-colors", (p.是否置頂 === true) ? "text-brand-500 bg-brand-100" : "text-gray-400 bg-gray-50")}
                              >
                                <Pin size={16} fill={(p.是否置頂 === true) ? "currentColor" : "none"} />
                              </button>
                              <button onClick={() => { setEditItem(p); setModalType('product'); }} className="p-2 text-blue-500 bg-blue-50 rounded-xl">
                                <Edit3 size={16} />
                              </button>
                              <button onClick={() => setShowDeleteConfirm({ table: '庫存總表', id: p.id })} className="p-2 text-red-500 bg-red-50 rounded-xl">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl">
                            <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">庫存 / 成本</p>
                              <div className="flex items-baseline gap-1">
                                <span className={cn("text-lg font-black", p.庫存數量 < 5 ? "text-red-500" : "text-gray-900")}>{p.庫存數量}</span>
                                <span className="text-[10px] text-gray-400">件</span>
                              </div>
                              <p className="text-xs font-bold text-gray-600 mt-1">{formatCurrency(p.平均成本 || 0)}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">平均獲利</p>
                              <p className="text-sm font-black text-emerald-600">{formatCurrency(p.平均獲利 || 0)}</p>
                              <span className={cn(
                                "mt-1 inline-block text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase",
                                p.目前狀態 === '售賣中' ? "bg-emerald-100 text-emerald-600" : "bg-gray-200 text-gray-500"
                              )}>
                                {p.目前狀態}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </div>
            )}
            
            {/* --- Tab: Other Transactions --- */}
            {activeTab === 'finance' && (
              <div className="space-y-6">
                <div className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                  <div className="flex flex-col lg:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        type="text" 
                        placeholder="搜尋項目內容或備註..." 
                        value={financeSearch}
                        onChange={(e) => setFinanceSearch(e.target.value)}
                        className="w-full bg-gray-50 border-none rounded-2xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex bg-gray-50 rounded-2xl px-4 py-2 border-none w-full sm:w-auto">
            <input 
              type="date"
              value={financeStartDate}
              onChange={(e) => setFinanceStartDate(e.target.value)}
              className="bg-transparent border-none p-1 text-sm focus:ring-0 text-gray-500 w-full sm:w-32"
            />
            <span className="text-gray-300 mx-2 text-xs">至</span>
            <input 
              type="date"
              value={financeEndDate}
              onChange={(e) => setFinanceEndDate(e.target.value)}
              className="bg-transparent border-none p-1 text-sm focus:ring-0 text-gray-500 w-full sm:w-32"
            />
          </div>
                      <button 
                        onClick={() => {
                          setFinanceSearchApplied(financeSearch);
                          setFinanceStartDateApplied(financeStartDate);
                          setFinanceEndDateApplied(financeEndDate);
                        }}
                        className="w-full sm:w-auto bg-emerald-100 text-emerald-600 px-8 py-3 rounded-2xl font-bold text-sm hover:bg-emerald-200 transition-colors flex items-center justify-center gap-2"
                      >
                        <Search size={16} /> 查詢
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button 
                      onClick={handleDownloadFinanceTemplate}
                      className="p-3 text-gray-400 hover:text-emerald-600 transition-colors bg-gray-50 rounded-xl hover:bg-emerald-50"
                      title="下載匯入範本"
                    >
                      <FileDown size={20} />
                    </button>
                    <label className="flex-1 sm:flex-none cursor-pointer bg-gray-50 text-gray-600 px-6 py-3 rounded-xl font-bold text-xs hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
                      <FileUp size={14} /> CSV 匯入
                      <input 
                        type="file" 
                        accept=".csv" 
                        className="hidden" 
                        onChange={handleFinanceCsvImport} 
                        disabled={isSubmitting}
                      />
                    </label>
                    <button 
                      onClick={() => setShowBatchDelete('其他收支表')}
                      className="p-3 text-red-100 hover:text-red-500 transition-colors bg-red-50 rounded-xl hover:bg-red-100"
                      title="批次刪除數據"
                    >
                      <Trash2 size={20} />
                    </button>
                    <button 
                      onClick={() => { setModalType('finance'); setEditItem(null); }}
                      className="flex-1 sm:flex-none bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity shadow-lg"
                    >
                      新增收支
                    </button>
                  </div>
                </div>

                <Card>
                  <Pagination 
                    total={sortedOthers.length} 
                    current={financePage} 
                    pageSize={ITEMS_PER_PAGE} 
                    onChange={setFinancePage} 
                  />
                  <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th 
                            className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-emerald-500 transition-colors"
                            onClick={() => setFinanceSortDir(financeSortDir === 'asc' ? 'desc' : 'asc')}
                          >
                            <div className="flex items-center">日期 <SortIconGeneric dir={financeSortDir} active={true} /></div>
                          </th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">類型 / 項目</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">金額</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">備註</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">操作</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {sortedOthers.slice((financePage - 1) * ITEMS_PER_PAGE, financePage * ITEMS_PER_PAGE).map(o => (
                          <tr key={o.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-5 text-sm text-gray-500 font-medium">{o.日期}</td>
                            <td className="px-6 py-5">
                              <span className={cn(
                                "px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase mb-1 inline-block",
                                o.收支類型 === '收入' ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
                              )}>
                                {o.收支類型}
                              </span>
                              <p className="font-bold text-gray-900">{o.項目內容}</p>
                            </td>
                            <td className="px-6 py-5">
                              <span className={cn("font-bold text-lg", o.收支類型 === '收入' ? "text-emerald-600" : "text-red-600")}>
                                {o.收支類型 === '收入' ? '+' : '-'}{formatCurrency(o.金額)}
                              </span>
                            </td>
                            <td className="px-6 py-5">
                              <p className="text-xs text-gray-400">{o.備註 || '無備註'}</p>
                            </td>
                            <td className="px-6 py-5 text-right">
                              <div className="flex justify-end gap-2">
                                <button onClick={() => { setEditItem(o); setModalType('finance'); }} className="p-2 transition-colors hover:bg-gray-100 rounded-xl text-blue-500">
                                  <Edit3 size={16} />
                                </button>
                                <button onClick={() => setShowDeleteConfirm({ table: '其他收支表', id: o.id })} className="p-2 transition-colors hover:bg-gray-100 rounded-xl text-red-500">
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="lg:hidden divide-y divide-gray-100">
                    {sortedOthers.slice((financePage - 1) * ITEMS_PER_PAGE, financePage * ITEMS_PER_PAGE).map(o => (
                      <div key={o.id} className="py-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{o.日期}</p>
                            <span className={cn(
                              "px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase inline-block",
                              o.收支類型 === '收入' ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
                            )}>
                              {o.收支類型}
                            </span>
                            <h4 className="font-bold text-gray-900">{o.項目內容}</h4>
                          </div>
                          <div className="flex gap-1">
                            <button onClick={() => { setEditItem(o); setModalType('finance'); }} className="p-2 text-blue-500 bg-blue-50 rounded-xl">
                              <Edit3 size={16} />
                            </button>
                            <button onClick={() => setShowDeleteConfirm({ table: '其他收支表', id: o.id })} className="p-2 text-red-500 bg-red-50 rounded-xl">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-between items-end bg-gray-50 p-4 rounded-2xl">
                          <div>
                            <p className="text-[10px] text-gray-400 font-bold mb-0.5">備註說明</p>
                            <p className="text-xs text-gray-600 italic">{o.備註 || '均無備註'}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-gray-400 font-bold mb-0.5">交易金額</p>
                            <p className={cn("text-lg font-black", o.收支類型 === '收入' ? "text-emerald-600" : "text-red-600")}>
                               {o.收支類型 === '收入' ? '+' : '-'}{formatCurrency(o.金額)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* --- Tab: Purchase --- */}
            {activeTab === 'purchase' && (
              <div className="space-y-6">
                <div className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                  <div className="flex flex-col lg:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        type="text" 
                        placeholder="搜尋商品名稱、代號或來源..." 
                        value={purchaseSearch}
                        onChange={(e) => setPurchaseSearch(e.target.value)}
                        className="w-full bg-gray-50 border-none rounded-2xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-brand-500/20"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <div className="flex items-center bg-gray-50 rounded-2xl px-4 py-2 border-none w-full sm:w-auto">
                        <input 
                          type="date"
                          value={purchaseStartDate}
                          onChange={(e) => setPurchaseStartDate(e.target.value)}
                          className="bg-transparent border-none p-1 text-sm focus:ring-0 text-gray-500 w-full sm:w-32"
                        />
                        <span className="text-gray-300 mx-2 text-xs">至</span>
                        <input 
                          type="date"
                          value={purchaseEndDate}
                          onChange={(e) => setPurchaseEndDate(e.target.value)}
                          className="bg-transparent border-none p-1 text-sm focus:ring-0 text-gray-500 w-full sm:w-32"
                        />
                      </div>
                      <button 
                        onClick={() => {
                          setPurchaseSearch('');
                          setPurchaseStartDate('');
                          setPurchaseEndDate('');
                        }}
                        className="w-full sm:w-auto bg-gray-100 text-gray-500 px-6 py-3 rounded-2xl font-bold text-sm hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                        title="清空所有篩選"
                      >
                        <RotateCcw size={16} /> 重置
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button 
                      onClick={handleDownloadPurchaseTemplate}
                      className="p-3 text-gray-400 hover:text-blue-600 transition-colors bg-gray-50 rounded-xl hover:bg-blue-50"
                      title="下載匯入範本"
                    >
                      <FileDown size={20} />
                    </button>
                    <label className="flex-1 sm:flex-none cursor-pointer bg-gray-50 text-gray-600 px-6 py-3 rounded-xl font-bold text-xs hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
                      <FileUp size={14} /> CSV 匯入
                      <input 
                        type="file" 
                        accept=".csv" 
                        className="hidden" 
                        onChange={handlePurchaseCsvImport} 
                        disabled={isSubmitting}
                      />
                    </label>
                    <button 
                      onClick={() => setShowBatchDelete('進貨表')}
                      className="p-3 text-red-400 hover:text-red-500 transition-colors bg-red-50 rounded-xl hover:bg-red-100"
                      title="批次刪除數據"
                    >
                      <Trash2 size={20} />
                    </button>
                    <button 
                      onClick={() => { setModalType('purchase'); setEditItem(null); }}
                      className="flex-1 sm:flex-none bg-blue-600 text-white px-8 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity shadow-lg"
                    >
                      新增進貨
                    </button>
                  </div>
                </div>

                <Card>
                  <Pagination 
                    total={sortedPurch.length} 
                    current={purchasePage} 
                    pageSize={ITEMS_PER_PAGE} 
                    onChange={setPurchasePage} 
                  />
                  <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th 
                            className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-brand-500 transition-colors"
                            onClick={() => setPurchaseSortDir(purchaseSortDir === 'asc' ? 'desc' : 'asc')}
                          >
                            <div className="flex items-center">日期 <SortIconGeneric dir={purchaseSortDir} active={true} /></div>
                          </th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">商品資訊</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">數量</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">總額 / 單價</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">狀態 / 來源 / 備註</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">操作</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {sortedPurch.slice((purchasePage - 1) * ITEMS_PER_PAGE, purchasePage * ITEMS_PER_PAGE).map(p => {
                          const prod = prods.find(pr => pr.id === p.商品ID);
                          return (
                            <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-6 py-5 text-sm text-gray-500 font-medium">{p.進貨日期}</td>
                              <td className="px-6 py-5">
                                <span className="text-xs font-bold text-brand-500 tracking-wider">#{prod?.商品代號}</span>
                                <p className="font-bold text-gray-900">{prod?.商品名稱}</p>
                              </td>
                              <td className="px-6 py-5">
                                <p className="font-bold text-gray-900">{p.數量} <span className="text-xs text-gray-400 font-normal">件</span></p>
                              </td>
                              <td className="px-6 py-5">
                                <p className="text-sm font-bold text-blue-600">{formatCurrency(p.金額 || (p.數量 * p.單位成本))}</p>
                                <p className="text-[10px] text-gray-400 font-medium">單價 {formatCurrency(p.單位成本)}</p>
                              </td>
                              <td className="px-6 py-5">
                                <span className={cn(
                                  "px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase inline-block mb-1",
                                  p.訂單狀態 === '已入庫' ? "bg-emerald-100 text-emerald-600" : "bg-blue-100 text-blue-600"
                                )}>
                                  {p.訂單狀態 || '待入庫'}
                                </span>
                                <p className="text-sm font-semibold text-gray-700">{p.進貨來源 || '--'}</p>
                                <p className="text-xs text-gray-400">{p.備註 || '無備註'}</p>
                              </td>
                              <td className="px-6 py-5 text-right">
                                <div className="flex justify-end gap-2">
                                  <button onClick={() => { setEditItem(p); setModalType('purchase'); }} className="p-2 transition-colors hover:bg-gray-100 rounded-xl text-blue-500">
                                    <Edit3 size={16} />
                                  </button>
                                  <button onClick={() => setShowDeleteConfirm({ table: '進貨表', id: p.id })} className="p-2 transition-colors hover:bg-gray-100 rounded-xl text-red-500">
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="lg:hidden divide-y divide-gray-100">
                    {sortedPurch.slice((purchasePage - 1) * ITEMS_PER_PAGE, purchasePage * ITEMS_PER_PAGE).map(p => {
                      const prod = prods.find(pr => pr.id === p.商品ID);
                      return (
                        <div key={p.id} className="py-5 space-y-4">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{p.進貨日期}</p>
                               <span className={cn(
                                  "px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase inline-block mb-1",
                                  p.訂單狀態 === '已入庫' ? "bg-emerald-100 text-emerald-600" : "bg-blue-100 text-blue-600"
                                )}>
                                  {p.訂單狀態 || '待入庫'}
                                </span>
                              <h4 className="font-bold text-gray-900">{prod?.商品名稱}</h4>
                              <p className="text-[10px] text-brand-500 font-bold">#{prod?.商品代號}</p>
                            </div>
                            <div className="flex gap-1">
                              <button onClick={() => { setEditItem(p); setModalType('purchase'); }} className="p-2 text-blue-500 bg-blue-50 rounded-xl">
                                <Edit3 size={16} />
                              </button>
                              <button onClick={() => setShowDeleteConfirm({ table: '進貨表', id: p.id })} className="p-2 text-red-500 bg-red-50 rounded-xl">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                          
                          <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                            <div className="grid grid-cols-2 gap-4 pb-2 border-b border-gray-200/50">
                              <div>
                                <p className="text-[10px] text-gray-400 font-bold mb-0.5">進貨來源</p>
                                <p className="text-sm font-bold text-gray-700">{p.進貨來源 || '--'}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] text-gray-400 font-bold mb-0.5">數量</p>
                                <p className="text-base font-black text-gray-900">{p.數量} <span className="text-[10px] font-normal text-gray-400">件</span></p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-[10px] text-gray-400 font-bold mb-0.5">採購總額</p>
                                <p className="text-sm font-black text-blue-600">{formatCurrency(p.金額 || (p.數量 * p.單位成本))}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] text-gray-400 font-bold mb-0.5">單位成本</p>
                                <p className="text-sm font-bold text-gray-600">{formatCurrency(p.單位成本)}</p>
                              </div>
                            </div>
                          </div>

                          <p className="text-[10px] text-gray-400 italic bg-gray-50/50 p-2 rounded-lg border border-gray-100">{p.備註 || '無備註'}</p>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </div>
            )}
            {activeTab === 'sales' && (
              <div className="space-y-6">
                <div className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                  <div className="flex flex-col lg:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        type="text" 
                        placeholder="搜尋單號、商品名稱、代號或平台..." 
                        value={salesSearch}
                        onChange={(e) => setSalesSearch(e.target.value)}
                        className="w-full bg-gray-50 border-none rounded-2xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-brand-500/20"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <div className="flex items-center bg-gray-50 rounded-2xl px-4 py-2 border-none w-full sm:w-auto">
                        <input 
                          type="date"
                          value={salesStartDate}
                          onChange={(e) => setSalesStartDate(e.target.value)}
                          className="bg-transparent border-none p-1 text-sm focus:ring-0 text-gray-500 w-full sm:w-32"
                        />
                        <span className="text-gray-300 mx-2 text-xs">至</span>
                        <input 
                          type="date"
                          value={salesEndDate}
                          onChange={(e) => setSalesEndDate(e.target.value)}
                          className="bg-transparent border-none p-1 text-sm focus:ring-0 text-gray-500 w-full sm:w-32"
                        />
                      </div>
                      <button 
                         onClick={() => {
                           setSalesSearch('');
                           setSalesStartDate('');
                           setSalesEndDate('');
                         }}
                         className="w-full sm:w-auto bg-gray-100 text-gray-500 px-6 py-3 rounded-2xl font-bold text-sm hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                         title="清空所有篩選"
                      >
                         <RotateCcw size={16} /> 重置
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button 
                       onClick={handleDownloadSaleTemplate}
                       className="p-3 text-gray-400 hover:text-[#111827] transition-colors bg-gray-50 rounded-xl hover:bg-gray-100"
                       title="下載匯入範本"
                    >
                       <FileDown size={20} />
                    </button>
                    <label className="flex-1 sm:flex-none cursor-pointer bg-gray-50 text-gray-600 px-6 py-3 rounded-xl font-bold text-xs hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
                       <FileUp size={14} /> CSV 匯入
                       <input 
                         type="file" 
                         accept=".csv" 
                         className="hidden" 
                         onChange={handleSaleCsvImport} 
                         disabled={isSubmitting}
                       />
                    </label>
                    <button 
                      onClick={() => setShowBatchDelete('銷貨表')}
                      className="p-3 text-red-100 hover:text-red-500 transition-colors bg-red-50 rounded-xl hover:bg-red-100"
                      title="批次刪除數據"
                    >
                      <Trash2 size={20} />
                    </button>
                    <button 
                      onClick={() => { setModalType('sale'); setEditItem(null); }}
                      className="flex-1 sm:flex-none bg-[#111827] text-white px-8 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity shadow-lg"
                    >
                      新建訂單
                    </button>
                  </div>
                </div>

                <Card>
                  <Pagination 
                    total={sortedSales.length} 
                    current={salesPage} 
                    pageSize={ITEMS_PER_PAGE} 
                    onChange={setSalesPage} 
                  />
                  <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th 
                            className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-brand-500 transition-colors"
                            onClick={() => setSalesSortDir(salesSortDir === 'asc' ? 'desc' : 'asc')}
                          >
                            <div className="flex items-center">訂單資訊 <SortIconGeneric dir={salesSortDir} active={true} /></div>
                          </th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">商品 / 數量</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">總金額</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">毛利</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">狀態 / 備註</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">操作</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {sortedSales.slice((salesPage - 1) * ITEMS_PER_PAGE, salesPage * ITEMS_PER_PAGE).map(s => {
                          const prod = prods.find(pr => pr.id === s.商品ID);
                          return (
                            <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-6 py-5">
                                <p className="text-xs text-gray-400 font-medium mb-1">{s.銷貨日期}</p>
                                <p className="font-black text-gray-900 tracking-tight">{s.訂單編號}</p>
                                <span className="inline-block px-2 py-0.5 rounded-lg bg-gray-100 text-[10px] font-bold text-gray-500 mt-1 uppercase tracking-widest">
                                  {s.平台 || '未知平台'}
                                </span>
                              </td>
                              <td className="px-6 py-5">
                                <p className="font-bold text-gray-900 truncate max-w-[200px]">{prod?.商品名稱}</p>
                                <p className="text-xs text-gray-500">數量: <span className="font-bold text-brand-600">{s.數量}</span></p>
                              </td>
                              <td className="px-6 py-5">
                                <span className="font-black text-lg text-gray-900">{formatCurrency(s.銷售金額)}</span>
                              </td>
                                <td className="px-6 py-5">
                                  <p className="font-bold text-emerald-600">
                                    {formatCurrency(s.毛利 ?? ((s.銷售金額 || 0) - ((s.當前單位成本 || 0) * (s.數量 || 0))))}
                                  </p>
                                  <p className="text-[10px] text-gray-400">成本: @{formatCurrency(s.當前單位成本 || 0)}</p>
                                </td>
                              <td className="px-6 py-5">
                                <span className={cn(
                                  "px-3 py-1 rounded-full text-[10px] font-bold uppercase inline-block mb-1",
                                  s.訂單狀態 === '已完成' ? "bg-emerald-100 text-emerald-600" :
                                  s.訂單狀態 === '已出貨' ? "bg-blue-100 text-blue-600" :
                                  "bg-amber-100 text-amber-600"
                                )}>
                                  {s.訂單狀態}
                                </span>
                                <p className="text-[10px] text-gray-400 truncate max-w-[150px]">{s.備註 || '無備註'}</p>
                              </td>
                              <td className="px-6 py-5 text-right">
                                <div className="flex justify-end gap-2">
                                  <button onClick={() => handleViewBatches(s)} className="p-2 transition-colors hover:bg-gray-100 rounded-xl text-emerald-500" title="查看批次詳情">
                                    <Search size={16} />
                                  </button>
                                  <button onClick={() => { setEditItem(s); setModalType('sale'); }} className="p-2 transition-colors hover:bg-gray-100 rounded-xl text-blue-500">
                                    <Edit3 size={16} />
                                  </button>
                                  <button onClick={() => setShowDeleteConfirm({ table: '銷貨表', id: s.id })} className="p-2 transition-colors hover:bg-gray-100 rounded-xl text-red-500">
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="lg:hidden divide-y divide-gray-100">
                    {sortedSales.slice((salesPage - 1) * ITEMS_PER_PAGE, salesPage * ITEMS_PER_PAGE).map(s => {
                      const prod = prods.find(pr => pr.id === s.商品ID);
                      return (
                        <div key={s.id} className="py-5 space-y-4">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{s.銷貨日期}</p>
                              <p className="text-sm font-black text-gray-900">{s.訂單編號}</p>
                              <span className="inline-block px-1.5 py-0.5 rounded-md bg-gray-100 text-[9px] font-bold text-gray-500 uppercase">
                                {s.平台 || '未知平台'}
                              </span>
                            </div>
                            <div className="flex gap-1">
                              <button onClick={() => handleViewBatches(s)} className="p-2 text-emerald-500 bg-emerald-50 rounded-xl">
                                <Search size={16} />
                              </button>
                              <button onClick={() => { setEditItem(s); setModalType('sale'); }} className="p-2 text-blue-500 bg-blue-50 rounded-xl">
                                <Edit3 size={16} />
                              </button>
                              <button onClick={() => setShowDeleteConfirm({ table: '銷貨表', id: s.id })} className="p-2 text-red-500 bg-red-50 rounded-xl">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                          
                          <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                            <div className="flex justify-between items-center pb-2 border-b border-gray-200/50">
                              <div className="min-w-0 pr-2">
                                <p className="text-[10px] text-gray-400 font-bold mb-0.5">商品明細</p>
                                <p className="text-sm font-bold text-gray-900 truncate">{prod?.商品名稱}</p>
                                <p className="text-[10px] text-brand-500 font-bold">#{prod?.商品代號}</p>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-[10px] text-gray-400 font-bold mb-0.5">數量</p>
                                <p className="text-base font-black text-gray-900">{s.數量} <span className="text-[10px] font-normal text-gray-400">件</span></p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-[10px] text-gray-400 font-bold mb-0.5">銷售總額</p>
                                <p className="text-sm font-black text-gray-900">{formatCurrency(s.銷售金額)}</p>
                              </div>
                              <div>
                                <p className="text-[10px] text-gray-400 font-bold mb-0.5">預估毛利</p>
                                <p className="text-sm font-black text-emerald-600">
                                  {formatCurrency(s.毛利 ?? ((s.銷售金額 || 0) - ((s.當前單位成本 || 0) * (s.數量 || 0))))}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className={cn(
                              "px-3 py-1 rounded-full text-[10px] font-bold uppercase",
                              s.訂單狀態 === '已完成' ? "bg-emerald-100 text-emerald-600" :
                              s.訂單狀態 === '已出貨' ? "bg-blue-100 text-blue-600" :
                              "bg-amber-100 text-amber-600"
                            )}>
                              {s.訂單狀態}
                            </span>
                            <p className="text-[10px] text-gray-400 italic max-w-[60%] truncate">{s.備註 || '無備註'}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </main>

      {/* --- Modals --- */}
      <AnimatePresence>
        {modalType === 'importSuccess' && importSuccessInfo && (
          <Modal title="匯入成功" isOpen={true} onClose={() => setModalType(null)}>
            <div className="py-6 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 size={40} className="text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">資料匯入完成</h3>
              <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                恭喜！系統已成功處理並寫入 <span className="font-black text-emerald-600 px-1">{importSuccessInfo.count}</span> 筆{importSuccessInfo.type}紀錄。<br />
                庫存與獲利數據已自動完成同步。
              </p>
              <button 
                onClick={() => setModalType(null)}
                className="w-full bg-[#111827] text-white font-bold py-4 rounded-2xl shadow-lg hover:opacity-90 transition-opacity"
              >
                我知道了
              </button>
            </div>
          </Modal>
        )}

        {viewingSaleBatches && (
          <Modal 
            title={`訂單 ${viewingSaleBatches.訂單編號} - 批次對應詳情`} 
            isOpen={true} 
            onClose={() => setViewingSaleBatches(null)}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">商品名稱</p>
                  <p className="font-bold text-gray-900">{prods.find(p => p.id === viewingSaleBatches.商品ID)?.商品名稱}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">總銷貨數量</p>
                  <p className="font-bold text-brand-600 text-lg">{viewingSaleBatches.數量}</p>
                </div>
              </div>

              {isLoadingBatches ? (
                <div className="py-12 flex flex-col items-center justify-center gap-4">
                  <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm font-medium text-gray-500">正在計算 FIFO 批次路徑...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">對應進貨批次 (FIFO 扣重順序)</p>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {saleBatchResults.map((batch, idx) => (
                      <div key={idx} className="p-4 border border-gray-100 rounded-2xl flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            <p className="text-sm font-bold text-gray-900">{batch.purchaseDate}</p>
                          </div>
                          <p className="text-[10px] text-gray-400">
                            進貨成本: <span className="text-gray-600">@{formatCurrency(batch.cost)}</span> | 
                            本次扣重: <span className="text-gray-900 font-bold">{batch.qty}</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-emerald-600">{formatCurrency(batch.profit)}</p>
                          <p className="text-[8px] text-gray-400 uppercase">階段毛利</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="pt-4 border-t border-dashed border-gray-100 mt-2">
                    <div className="flex justify-between items-center px-2">
                      <div>
                        <p className="text-sm font-bold text-gray-900">合計毛利</p>
                        <p className="text-[10px] text-gray-400 italic">計算方式：(單價 - 批次成本) × 扣重數量</p>
                      </div>
                      <p className="text-2xl font-black text-emerald-600">
                        {formatCurrency(saleBatchResults.reduce((sum, b) => sum + b.profit, 0))}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <button 
                onClick={() => setViewingSaleBatches(null)}
                className="w-full bg-[#111827] text-white font-bold py-4 rounded-2xl shadow-lg hover:opacity-90 transition-opacity mt-4"
              >
                關閉詳情
              </button>
            </div>
          </Modal>
        )}

        {modalType === 'csvErrors' && (
          <Modal title="匯入失敗報告" isOpen={true} onClose={() => setModalType(null)}>
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3">
                <AlertCircle className="text-red-500 mt-0.5" size={18} />
                <div>
                  <p className="text-sm font-bold text-red-600">偵測到資料格式錯誤</p>
                  <p className="text-xs text-red-500 mt-1">
                    請檢查 CSV 檔案中的數字欄位（數量、金額等），確保沒有特殊符號，且商品名稱必須完全正確。
                  </p>
                </div>
              </div>
              
              <div className="max-h-[350px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {csvErrors.map((err, i) => (
                  <div key={i} className="p-3 bg-gray-50 rounded-2xl text-xs text-gray-600 border border-gray-100 leading-relaxed">
                    {err}
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <button 
                  onClick={() => setModalType(null)}
                  className="w-full bg-[#111827] text-white font-bold py-4 rounded-2xl shadow-lg hover:opacity-90 transition-opacity"
                >
                  關閉並返回修正
                </button>
              </div>
            </div>
          </Modal>
        )}

        {modalType === 'category' && (
          <Modal title={editItem ? "編輯品類" : "新增品類"} isOpen={true} onClose={() => setModalType(null)}>
            <form onSubmit={handleSaveCategory} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">分類名稱</label>
                <input 
                  name="name" 
                  defaultValue={editItem?.分類名稱} 
                  required 
                  className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-brand-500/20" 
                  placeholder="例如：韓妝系列"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">英文代碼 (1-3碼)</label>
                  {editItem && (
                    <span className="text-[10px] text-brand-500 font-bold bg-brand-50 px-2 py-0.5 rounded-lg flex items-center gap-1">
                      <AlertCircle size={10} /> 禁止修改
                    </span>
                  )}
                </div>
                <input 
                  name="code" 
                  defaultValue={editItem?.分類代號} 
                  required={!editItem}
                  disabled={!!editItem}
                  maxLength={3}
                  className={cn(
                    "w-full border-none rounded-2xl p-4 text-sm font-bold uppercase focus:ring-2 focus:ring-brand-500/20",
                    editItem ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-gray-50 text-gray-800"
                  )}
                  placeholder="例如：SK"
                />
                {editItem && (
                  <p className="text-[10px] text-gray-400 mt-1">
                    * 代號已與現有商品編號連動，若需更換請刪除品類重新建立。
                  </p>
                )}
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className={cn(
                  "w-full text-white font-bold py-4 rounded-2xl shadow-lg transition-all",
                  isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-brand-500 hover:bg-brand-600"
                )}
              >
                {isSubmitting ? "儲存中..." : "確認儲存"}
              </button>
            </form>
          </Modal>
        )}

        {modalType === 'product' && (
          <Modal title={editItem ? "編輯商品" : "新增商品"} isOpen={true} onClose={() => setModalType(null)}>
            <form onSubmit={handleSaveProduct} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">所屬分類</label>
                <select 
                  name="catId" 
                  required 
                  defaultValue={editItem?.分類ID}
                  disabled={!!editItem}
                  className={cn(
                    "w-full border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-brand-500/20 appearance-none",
                    editItem ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-gray-50 text-gray-800"
                  )}
                >
                  <option value="">請選擇...</option>
                  {cats.map(c => <option key={c.id} value={c.id}>{c.分類代號} - {c.分類名稱}</option>)}
                </select>
                {editItem && <p className="text-[10px] text-gray-400 mt-1">* 編輯模式下無法更換分類</p>}
              </div>

              {!editItem && (
                <div className="p-4 bg-brand-50 rounded-2xl border border-brand-100">
                  <p className="text-[10px] font-bold text-brand-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                    <Zap size={10} /> 商品代號預覽
                  </p>
                  <p className="text-sm font-bold text-brand-600">
                    選取分類後，系統將自動依據資料庫最大號碼加 1 生成。
                  </p>
                </div>
              )}

              {editItem && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">商品代號</label>
                  <input readOnly value={editItem.商品代號} className="w-full bg-gray-100 border-none rounded-2xl p-4 text-sm font-bold text-gray-400 cursor-not-allowed" />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">商品名稱</label>
                <input 
                  name="name" 
                  required 
                  defaultValue={editItem?.商品名稱}
                  className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-brand-500/20" 
                  placeholder="例如：水光保濕面膜" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">商品狀態</label>
                <select 
                  name="status" 
                  defaultValue={editItem?.目前狀態 || '售賣中'}
                  className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-brand-500/20 appearance-none"
                >
                  <option value="售賣中">售賣中</option>
                  <option value="停售">停售</option>
                </select>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className={cn(
                  "w-full text-white font-bold py-4 rounded-2xl shadow-lg transition-all mt-4",
                  isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-[#111827] hover:opacity-90"
                )}
              >
                {isSubmitting ? "儲存中..." : (editItem ? "儲存變更" : "確認新增商品")}
              </button>
            </form>
          </Modal>
        )}

        {modalType === 'finance' && (
          <Modal title={editItem ? "編輯收支" : "新增收支"} isOpen={true} onClose={() => setModalType(null)}>
            <form onSubmit={handleSaveFinance} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">日期</label>
                  <input name="date" type="date" required defaultValue={editItem?.日期 || today()} className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-emerald-500/20" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">類型</label>
                  <select name="type" required defaultValue={editItem?.收支類型 || '支出'} className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-emerald-500/20 appearance-none">
                    <option value="收入">收入</option>
                    <option value="支出">支出</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">項目名稱</label>
                <input name="item" required defaultValue={editItem?.項目內容} className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-emerald-500/20" placeholder="例如：運費支出" />
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">金額</label>
                  <input name="amount" type="number" required defaultValue={editItem?.金額} className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-emerald-500/20" placeholder="0" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">備註</label>
                <textarea name="note" defaultValue={editItem?.備註} className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-emerald-500/20 h-24 resize-none" placeholder="補充說明..."></textarea>
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className={cn(
                  "w-full text-white font-bold py-4 rounded-2xl shadow-lg transition-all mt-4",
                  isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700"
                )}
              >
                {isSubmitting ? "儲存中..." : "完成儲存"}
              </button>
            </form>
          </Modal>
        )}

        {modalType === 'purchase' && (
          <Modal title={editItem ? "編輯進貨" : "新增進貨"} isOpen={true} onClose={() => setModalType(null)}>
            <form onSubmit={handleSavePurchase} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">進貨日期</label>
                <input name="date" type="date" required defaultValue={editItem?.進貨日期 || today()} className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">選擇商品</label>
                <ProductSearchSelect 
                  prods={prods} 
                  name="prodId" 
                  defaultValue={editItem?.商品ID} 
                  required 
                  colorTheme="blue"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">進貨數量</label>
                  <input 
                    name="qty" 
                    type="number" 
                    required 
                    value={purQty}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPurQty(val);
                      if (val && purUnitCost) {
                        setPurTotal(parseFloat((Number(val) * Number(purUnitCost)).toFixed(2)));
                      }
                    }}
                    className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500/20" 
                    placeholder="0" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">單位成本</label>
                  <input 
                    name="cost" 
                    type="number" 
                    step="0.01" 
                    required 
                    value={purUnitCost}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPurUnitCost(val);
                      if (val && purQty) {
                        setPurTotal(parseFloat((Number(purQty) * Number(val)).toFixed(2)));
                      }
                    }}
                    className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500/20" 
                    placeholder="0.00" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">進貨金額</label>
                  <input 
                    name="amount" 
                    type="number" 
                    step="0.01" 
                    required 
                    value={purTotal}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPurTotal(val);
                      if (val && Number(purQty) > 0) {
                        setPurUnitCost(parseFloat((Number(val) / Number(purQty)).toFixed(2)));
                      }
                    }}
                    className="w-full bg-blue-50/50 border border-blue-100 rounded-2xl p-4 text-sm font-bold text-blue-600 focus:ring-2 focus:ring-blue-500/20 outline-none" 
                    placeholder="0.00" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">進貨來源</label>
                  <input name="source" defaultValue={editItem?.進貨來源} className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500/20" placeholder="例如：供應商名稱" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">訂單狀態</label>
                  <select name="status" defaultValue={editItem?.訂單狀態 || '待入庫'} className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500/20 appearance-none">
                    <option value="待入庫">待入庫</option>
                    <option value="已入庫">已入庫</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">備註</label>
                <textarea name="note" defaultValue={editItem?.備註} className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500/20 h-24 resize-none"></textarea>
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className={cn(
                  "w-full text-white font-bold py-4 rounded-2xl shadow-lg transition-all mt-4",
                  isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                )}
              >
                {isSubmitting ? "儲存中..." : "確認進貨"}
              </button>
            </form>
          </Modal>
        )}

        {modalType === 'sale' && (
          <Modal title={editItem ? "編輯訂單" : "新建訂單"} isOpen={true} onClose={() => setModalType(null)}>
            <form onSubmit={handleSaveSale} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">銷貨日期</label>
                  <input name="date" type="date" required defaultValue={editItem?.銷貨日期 || today()} className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-brand-500/20" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">訂單編號</label>
                  <input readOnly value={editItem?.訂單編號 || '系統自動生成'} className="w-full bg-gray-100 border-none rounded-2xl p-4 text-sm font-bold text-gray-400 cursor-not-allowed" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">選擇商品</label>
                <ProductSearchSelect 
                  prods={prods} 
                  name="prodId" 
                  defaultValue={editItem?.商品ID} 
                  required 
                  colorTheme="brand"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">銷售數量</label>
                  <input name="qty" type="number" required defaultValue={editItem?.數量} className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-brand-500/20" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">銷售總金額</label>
                  <input 
                    name="amount" 
                    type="number" 
                    required 
                    defaultValue={editItem?.銷售金額} 
                    className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-brand-500/20" 
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">銷售平台</label>
                  <input name="platform" defaultValue={editItem?.平台} className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-brand-500/20" placeholder="例如：蝦皮 / 官網" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">訂單狀態</label>
                  <select name="status" defaultValue={editItem?.訂單狀態 || '未出貨'} className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-brand-500/20 appearance-none">
                    <option value="未出貨">未出貨</option>
                    <option value="待出貨">待出貨</option>
                    <option value="已出貨">已出貨</option>
                    <option value="已完成">已完成</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">備註</label>
                <textarea name="note" defaultValue={editItem?.備註} className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-brand-500/20 h-20 resize-none"></textarea>
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className={cn(
                  "w-full text-white font-bold py-4 rounded-2xl shadow-lg transition-all mt-4",
                  isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-[#111827] hover:opacity-90"
                )}
              >
                {isSubmitting ? "建立中..." : (editItem ? "儲存訂單變更" : "立即建立訂單")}
              </button>
            </form>
          </Modal>
        )}

        {showBatchDelete && (
          <Modal 
            title={`批次刪除${showBatchDelete === '進貨表' ? '進貨' : '銷貨'}單據`} 
            isOpen={true} 
            onClose={() => setShowBatchDelete(null)}
          >
            <form onSubmit={handleBatchDelete} className="space-y-6">
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 mb-4">
                <AlertCircle className="text-red-500 mt-0.5" size={18} />
                <p className="text-xs text-red-600 font-medium leading-relaxed">
                  警告：此操作將永久刪除符合條件的所有單據，刪除後將自動重新計算庫存與獲利數據。
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">開始日期</label>
                    <input required type="date" name="startDate" className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-red-500/20" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">結束日期</label>
                    <input required type="date" name="endDate" className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-red-500/20" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">商品名稱 (選填)</label>
                  <input name="pName" className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-red-500/20" placeholder="留空則刪除該區間所有商品" />
                  <p className="text-[10px] text-gray-400">若需針對單一商品刪除，請輸入完整商品名稱</p>
                </div>

                <label className="flex items-center gap-3 p-4 bg-brand-50 rounded-2xl cursor-pointer hover:bg-brand-100 transition-colors">
                  <input type="checkbox" name="confirmDelete" required className="w-5 h-5 rounded border-brand-300 text-brand-600 focus:ring-brand-500" />
                  <span className="text-sm font-bold text-brand-700">我確定要執行批次刪除，此動作無法復原</span>
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowBatchDelete(null)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-4 rounded-2xl transition-all"
                >
                  取消
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className={cn(
                    "flex-1 font-bold py-4 rounded-2xl shadow-lg transition-all",
                    isSubmitting ? "bg-gray-400 cursor-not-allowed text-white" : "bg-red-500 hover:bg-red-600 text-white shadow-red-500/20"
                  )}
                >
                  {isSubmitting ? "正在刪除..." : "執行批次刪除"}
                </button>
              </div>
            </form>
          </Modal>
        )}

        {showDeleteConfirm && (
          <Modal title="確認刪除" isOpen={true} onClose={() => setShowDeleteConfirm(null)}>
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="text-red-500" size={32} />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">確定要刪除此項目嗎？</h4>
              <p className="text-sm text-gray-500 mb-8 font-medium leading-relaxed">
                {showDeleteConfirm.table === '商品分類表' ? (
                  <span className="text-red-600">警告：刪除此「分類」將會同步刪除該分類下的所有商品及其相關的進銷貨訂單！</span>
                ) : showDeleteConfirm.table === '庫存總表' ? (
                  <span className="text-brand-600">警告：刪除此「商品」將會同步刪除該商品相關的所有進銷貨紀錄！</span>
                ) : (
                  "此動作將無法復原，相關聯的資料可能會受到影響。"
                )}
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-4 rounded-2xl transition-all"
                >
                  取消
                </button>
                <button 
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className={cn(
                    "flex-1 font-bold py-4 rounded-2xl shadow-lg transition-all",
                    isSubmitting ? "bg-gray-400 cursor-not-allowed text-white" : "bg-red-500 hover:bg-red-600 text-white shadow-red-500/20"
                  )}
                >
                  {isSubmitting ? "刪除中..." : "確定刪除"}
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* --- Sync Progress Modal --- */}
      <AnimatePresence>
        {isSyncing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#111827]/80 backdrop-blur-md z-[100] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl text-center"
            >
              <div className="w-20 h-20 bg-brand-100 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
                <RefreshCw className="text-brand-600 animate-spin" size={36} />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">庫存同步中</h3>
              <p className="text-gray-400 text-sm font-medium mb-8">正在重新計算 FIFO 成本與毛利...</p>
              
              <div className="w-full bg-gray-100 h-4 rounded-full overflow-hidden mb-4 p-1 shadow-inner">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${syncProgress}%` }}
                  className="h-full bg-gradient-to-r from-brand-400 to-red-600 rounded-full shadow-lg"
                />
              </div>
              <span className="text-2xl font-black text-brand-600 font-mono italic">{syncProgress}%</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Sync Complete Modal --- */}
      <AnimatePresence>
        {showSyncComplete && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#111827]/60 backdrop-blur-sm z-[110] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl text-center border-b-8 border-emerald-500"
            >
              <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
                <CheckCircle2 className="text-emerald-600" size={40} />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">同步完成</h3>
              <p className="text-gray-500 text-sm font-medium leading-relaxed mb-10 px-4">
                所有商品的庫存、歷史毛利與成本已按照先進先出 (FIFO) 原則重新計算完畢。
              </p>
              
              <button 
                onClick={() => setShowSyncComplete(false)}
                className="w-full bg-[#111827] text-white font-bold py-5 rounded-2xl shadow-xl shadow-gray-900/20 hover:scale-[1.02] transition-all"
              >
                太棒了，完成！
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
