'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Plus, Loader2, TrendingUp, Clock, User, Phone, MapPin, 
  IndianRupee, ArrowDownLeft, ArrowUpRight, History, X, 
  Sun, Moon, Search, Users, Wallet, Receipt, Trash2, AlertTriangle
} from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string | null;
  balance: number;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  date: string;
}

interface DashboardData {
  totalCustomers: number;
  totalBalance: number;
  totalCredit: number;
  totalDebit: number;
  topDebtors: { id: string; name: string; phone: string; balance: number }[];
  recentTransactions: {
    id: string;
    type: string;
    amount: number;
    description: string;
    date: string;
    customerName: string;
  }[];
}

function formatMoney(paise: number) {
  return `₹${(paise / 100).toFixed(2)}`;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [txCustomer, setTxCustomer] = useState<Customer | null>(null);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', address: '' });
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTx, setLoadingTx] = useState(false);
  const [txType, setTxType] = useState<'CREDIT' | 'DEBIT'>('CREDIT');
  const [txAmount, setTxAmount] = useState('');
  const [txDesc, setTxDesc] = useState('');
  const [txLoading, setTxLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved) setDarkMode(JSON.parse(saved));
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', JSON.stringify(newMode));
  };

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/');
    if (status === 'authenticated') fetchData();
  }, [status]);

  const fetchData = async () => {
    setLoading(true);
    const [dashRes, custRes] = await Promise.all([fetch('/api/dashboard'), fetch('/api/customers')]);
    const dashData = await dashRes.json();
    const custData = await custRes.json();
    setData(dashData);
    setCustomers(custData);
    setLoading(false);
  };

  const addCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCustomer),
    });
    if (res.ok) {
      setNewCustomer({ name: '', phone: '', address: '' });
      setShowAddCustomer(false);
      fetchData();
    }
  };

  const deleteCustomer = async (customerId: string) => {
    setDeleteLoading(true);
    const res = await fetch(`/api/customers?id=${customerId}`, { method: 'DELETE' });
    const result = await res.json();
    setDeleteLoading(false);
    setDeleteConfirm(null);
    
    if (res.ok) {
      fetchData();
    } else {
      alert(result.error || 'Failed to delete');
    }
  };

  const fetchTransactions = async (customerId: string) => {
    setLoadingTx(true);
    const res = await fetch(`/api/transactions?customerId=${customerId}`);
    const data = await res.json();
    setTransactions(data);
    setLoadingTx(false);
  };

  const toggleExpand = (c: Customer) => {
    if (expandedId === c.id) {
      setExpandedId(null);
    } else {
      setExpandedId(c.id);
      fetchTransactions(c.id);
    }
  };

  const submitTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txCustomer || !txAmount) return;
    setTxLoading(true);
    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: txCustomer.id,
        type: txType,
        amount: txAmount,
        description: txDesc,
      }),
    });
    setTxLoading(false);
    if (res.ok) {
      setTxCustomer(null);
      setTxAmount('');
      setTxDesc('');
      fetchData();
    } else {
      alert('Failed to add transaction');
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery)
  );

  if (status === 'loading' || loading) {
    return (
      <div className={`flex items-center justify-center h-screen ${darkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
        <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!data) return null;

  const theme = {
    bg: darkMode ? 'bg-slate-900' : 'bg-gray-50',
    card: darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200',
    text: darkMode ? 'text-white' : 'text-gray-900',
    textSecondary: darkMode ? 'text-slate-400' : 'text-gray-500',
    input: darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400',
    hover: darkMode ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50',
  };

  const stats = [
    { label: 'Total Customers', value: data.totalCustomers, icon: Users, color: 'bg-blue-500', lightBg: 'bg-blue-50', darkBg: 'bg-blue-900/30', textColor: 'text-blue-600 dark:text-blue-400' },
    { label: 'Total Udhaar', value: formatMoney(data.totalBalance), icon: Wallet, color: 'bg-red-500', lightBg: 'bg-red-50', darkBg: 'bg-red-900/30', textColor: 'text-red-600 dark:text-red-400' },
    { label: 'Credit Given', value: formatMoney(data.totalCredit), icon: ArrowDownLeft, color: 'bg-orange-500', lightBg: 'bg-orange-50', darkBg: 'bg-orange-900/30', textColor: 'text-orange-600 dark:text-orange-400' },
    { label: 'Collected', value: formatMoney(data.totalDebit), icon: ArrowUpRight, color: 'bg-emerald-500', lightBg: 'bg-emerald-50', darkBg: 'bg-emerald-900/30', textColor: 'text-emerald-600 dark:text-emerald-400' },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme.bg}`}>
      {/* Header */}
      <div className={`sticky top-0 z-40 border-b backdrop-blur-md ${darkMode ? 'bg-slate-900/90 border-slate-700' : 'bg-white/90 border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2.5 rounded-xl shadow-lg">
                <Receipt className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-xl font-bold ${theme.text}`}>Kirana Ledger</h1>
                <p className={`text-xs ${theme.textSecondary}`}>Digital Udhaar Manager</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <span className={`text-sm hidden sm:block ${theme.textSecondary}`}>
                {session?.user?.name || session?.user?.email}
              </span>
              <button
                onClick={toggleDarkMode}
                className={`p-2.5 rounded-xl transition-all hover:scale-110 ${darkMode ? 'bg-slate-700 text-yellow-400' : 'bg-gray-100 text-gray-600'}`}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setShowAddCustomer(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all"
              >
                <Plus className="w-4 h-4" /> 
                <span className="hidden sm:inline">Add Customer</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((card) => (
            <div key={card.label} className={`${theme.card} rounded-2xl p-5 border shadow-sm hover:shadow-md transition-all hover:scale-[1.02]`}>
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-medium ${theme.textSecondary}`}>{card.label}</span>
                <div className={`p-2 rounded-lg ${darkMode ? card.darkBg : card.lightBg}`}>
                  <card.icon className={`w-4 h-4 ${card.textColor}`} />
                </div>
              </div>
              <div className={`text-2xl font-bold ${theme.text}`}>{card.value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4">
            {/* Search Bar */}
            <div className={`${theme.card} rounded-2xl p-4 border-2 shadow-sm flex items-center gap-3`}>
              <div className={`p-2 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
                <Search className={`w-5 h-5 ${theme.textSecondary}`} />
              </div>
              <input
                type="text"
                placeholder="Search customers by name or phone..."
                className={`flex-1 bg-transparent outline-none text-sm font-medium ${theme.text} placeholder:${theme.textSecondary}`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')} 
                  className="text-red-500 hover:text-red-700 font-bold text-sm px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition"
                >
                  ✕ Clear
                </button>
              )}
            </div>

            {/* Customers List */}
            <div className={`${theme.card} rounded-2xl border shadow-sm overflow-hidden`}>
              <div className={`px-6 py-4 border-b ${darkMode ? 'border-slate-700' : 'border-gray-100'} flex justify-between items-center`}>
                <h2 className={`font-semibold ${theme.text}`}>Customers</h2>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-600'}`}>
                  {filteredCustomers.length} total
                </span>
              </div>
              
              <div className={`divide-y ${darkMode ? 'divide-slate-700' : 'divide-gray-100'}`}>
                {filteredCustomers.length === 0 && (
                  <div className={`px-6 py-12 text-center ${theme.textSecondary}`}>
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No customers found</p>
                    <p className="text-sm mt-1">Add your first customer or try a different search</p>
                  </div>
                )}
                
                {filteredCustomers.map((c) => (
                  <div key={c.id}>
                    <div
                      className={`px-6 py-4 flex items-center justify-between cursor-pointer transition-all ${theme.hover}`}
                      onClick={() => toggleExpand(c)}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center text-base font-bold ${c.balance > 0 ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className={`font-medium ${theme.text}`}>{c.name}</div>
                          <div className={`flex items-center gap-2 text-xs mt-0.5 ${theme.textSecondary}`}>
                            <Phone className="w-3 h-3" /> {c.phone}
                            {c.address && <><MapPin className="w-3 h-3 ml-1" /> {c.address}</>}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className={`text-right ${c.balance > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                          <div className="font-bold text-lg">{(c.balance / 100).toFixed(2)}</div>
                          <div className="text-xs">{c.balance > 0 ? 'Udhaar' : 'Clear'}</div>
                        </div>
                        
                        {/* ✅ DELETE BUTTON - Only when balance is 0 */}
                        {c.balance === 0 && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setDeleteConfirm(c.id); }}
                            className="p-2.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-200 dark:hover:bg-red-900/50 hover:scale-110 transition-all"
                            title="Delete customer (all cleared)"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        
                        <button
                          onClick={(e) => { e.stopPropagation(); setTxCustomer(c); }}
                          className="p-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl shadow-md hover:shadow-lg hover:scale-110 transition-all"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {expandedId === c.id && (
                      <div className={`px-6 py-4 ${darkMode ? 'bg-slate-800/50' : 'bg-gray-50/80'}`}>
                        <div className={`flex items-center gap-2 text-sm font-medium mb-3 ${theme.textSecondary}`}>
                          <History className="w-4 h-4" /> Transaction History
                        </div>
                        {loadingTx ? (
                          <div className={`text-sm ${theme.textSecondary} py-2`}>Loading...</div>
                        ) : transactions.length === 0 ? (
                          <div className={`text-sm ${theme.textSecondary} py-2`}>No transactions yet</div>
                        ) : (
                          <div className="space-y-2">
                            {transactions.map((t) => (
                              <div key={t.id} className={`flex justify-between items-center ${theme.card} px-4 py-3 rounded-xl text-sm border`}>
                                <div className="flex items-center gap-3">
                                  <div className={`w-2 h-2 rounded-full ${t.type === 'CREDIT' ? 'bg-red-500' : 'bg-emerald-500'}`} />
                                  <div>
                                    <span className={`font-medium ${t.type === 'CREDIT' ? 'text-red-500' : 'text-emerald-500'}`}>
                                      {t.type === 'CREDIT' ? 'Udhaar Diya' : 'Paisa Aaya'}
                                    </span>
                                    {t.description && <span className={`${theme.textSecondary} ml-2 text-xs`}>— {t.description}</span>}
                                  </div>
                                </div>
                                <div className={`${theme.textSecondary} text-xs`}>
                                  ₹{(t.amount / 100).toFixed(2)} · {new Date(t.date).toLocaleDateString('en-IN')}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Top Debtors */}
            <div className={`${theme.card} rounded-2xl border shadow-sm p-5`}>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-red-600 dark:text-red-400" />
                </div>
                <h3 className={`font-semibold ${theme.text}`}>Top Debtors</h3>
              </div>
              
              {data.topDebtors.length === 0 ? (
                <div className={`text-sm ${theme.textSecondary} py-2`}>No pending udhaar</div>
              ) : (
                <div className="space-y-3">
                  {data.topDebtors.map((d, i) => (
                    <div key={d.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-red-500 text-white' : i === 1 ? 'bg-orange-500 text-white' : i === 2 ? 'bg-amber-500 text-white' : darkMode ? 'bg-slate-700 text-slate-400' : 'bg-gray-200 text-gray-600'}`}>
                          {i + 1}
                        </div>
                        <div>
                          <div className={`text-sm font-medium ${theme.text}`}>{d.name}</div>
                          <div className={`text-xs ${theme.textSecondary}`}>{d.phone}</div>
                        </div>
                      </div>
                      <div className="text-red-500 font-semibold text-sm">₹{(d.balance / 100).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Transactions */}
            <div className={`${theme.card} rounded-2xl border shadow-sm p-5`}>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className={`font-semibold ${theme.text}`}>Recent Transactions</h3>
              </div>
              
              {data.recentTransactions.length === 0 ? (
                <div className={`text-sm ${theme.textSecondary} py-2`}>No transactions yet</div>
              ) : (
                <div className="space-y-3">
                  {data.recentTransactions.slice(0, 5).map((t) => (
                    <div key={t.id} className="flex items-start justify-between">
                      <div>
                        <div className={`text-sm font-medium ${theme.text}`}>{t.customerName}</div>
                        <div className={`text-xs ${theme.textSecondary}`}>
                          {t.type === 'CREDIT' ? 'Udhaar Diya' : 'Paisa Aaya'} · {new Date(t.date).toLocaleDateString('en-IN')}
                        </div>
                      </div>
                      <div className={`text-sm font-semibold ${t.type === 'CREDIT' ? 'text-red-500' : 'text-emerald-500'}`}>
                        {t.type === 'CREDIT' ? '+' : '-'}₹{(t.amount / 100).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'} rounded-2xl shadow-2xl max-w-sm w-full p-6 border text-center`}>
            <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7 text-red-600 dark:text-red-400" />
            </div>
            <h3 className={`text-lg font-bold mb-2 ${theme.text}`}>Delete Customer?</h3>
            <p className={`text-sm mb-6 ${theme.textSecondary}`}>
              This will permanently remove the customer and all their transaction history. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className={`flex-1 py-3 border rounded-xl font-medium transition-all ${darkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              >
                Cancel
              </button>
              <button
                onClick={() => deleteCustomer(deleteConfirm)}
                disabled={deleteLoading}
                className="flex-1 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all flex justify-center items-center gap-2"
              >
                {deleteLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Transaction Modal */}
      {txCustomer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'} rounded-2xl shadow-2xl max-w-md w-full p-6 border`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-semibold ${theme.text}`}>Add Transaction</h3>
              <button onClick={() => setTxCustomer(null)} className={`p-1 rounded-lg ${theme.hover}`}>
                <X className={`w-5 h-5 ${theme.textSecondary}`} />
              </button>
            </div>

            <div className={`mb-4 p-3 rounded-xl ${darkMode ? 'bg-slate-700' : 'bg-gray-50'}`}>
              <div className={`font-medium ${theme.text}`}>{txCustomer.name}</div>
              <div className={`text-sm ${theme.textSecondary}`}>{txCustomer.phone}</div>
            </div>

            <form onSubmit={submitTransaction} className="space-y-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTxType('CREDIT')}
                  className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                    txType === 'CREDIT' 
                      ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg' 
                      : darkMode ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  Udhaar Diya
                </button>
                <button
                  type="button"
                  onClick={() => setTxType('DEBIT')}
                  className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                    txType === 'DEBIT' 
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg' 
                      : darkMode ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  Paisa Aaya
                </button>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${theme.textSecondary}`}>Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="e.g. 500"
                  className={`w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-emerald-500 ${theme.input}`}
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${theme.textSecondary}`}>Description (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Rice, Oil"
                  className={`w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-emerald-500 ${theme.input}`}
                  value={txDesc}
                  onChange={(e) => setTxDesc(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={txLoading}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 rounded-xl font-medium shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all flex justify-center items-center gap-2"
              >
                {txLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Transaction
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {showAddCustomer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'} rounded-2xl shadow-2xl max-w-md w-full p-6 border`}>
            <h3 className={`text-lg font-semibold mb-4 ${theme.text}`}>Add New Customer</h3>
            <form onSubmit={addCustomer} className="space-y-4">
              <input
                type="text"
                placeholder="Customer Name *"
                required
                className={`w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-emerald-500 ${theme.input}`}
                value={newCustomer.name}
                onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
              />
              <input
                type="tel"
                placeholder="Phone Number *"
                required
                className={`w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-emerald-500 ${theme.input}`}
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
              />
              <input
                type="text"
                placeholder="Address (optional)"
                className={`w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-emerald-500 ${theme.input}`}
                value={newCustomer.address}
                onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddCustomer(false)}
                  className={`flex-1 py-3 border rounded-xl font-medium transition-all ${darkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                >
                  Add Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
