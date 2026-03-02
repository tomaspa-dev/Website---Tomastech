import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Wallet, LayoutList, Plus, Download, X, Save, Edit3,
  Trash2, ArrowUpCircle, ArrowDownCircle, AlertCircle, RefreshCw,
  TrendingUp, TrendingDown, DollarSign, ShoppingBag,
} from 'lucide-react';
import type {
  Account, AccountType, JournalEntry, CashMovement,
} from '../../lib/billing-store';
import Pagination from '../common/Pagination';

const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  asset: 'Activo', liability: 'Pasivo', equity: 'Patrimonio', income: 'Ingreso', expense: 'Gasto',
};
const ACCOUNT_TYPE_COLORS: Record<AccountType, string> = {
  asset: 'text-blue-400', liability: 'text-red-400', equity: 'text-purple-400', income: 'text-emerald-400', expense: 'text-amber-400',
};

type Tab = 'accounts' | 'journal' | 'cashRegister';

export default function AccountingModule() {
  const [activeTab, setActiveTab] = useState<Tab>('cashRegister');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [journal, setJournal] = useState<JournalEntry[]>([]);
  const [cashMovements, setCashMovements] = useState<CashMovement[]>([]);
  const [cashBalance, setCashBalance] = useState(0);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const mod = await import('../../lib/billing-store');
    setAccounts(mod.accountStore.getAll());
    setJournal(mod.journalStore.getAll());
    setCashMovements(mod.cashRegisterStore.getAll());
    setCashBalance(mod.cashRegisterStore.getCurrentBalance());
  };

  const tabs = [
    { id: 'cashRegister' as Tab, label: 'Caja General', icon: Wallet },
    { id: 'journal' as Tab, label: 'Libro Diario', icon: BookOpen },
    { id: 'accounts' as Tab, label: 'Plan de Cuentas', icon: LayoutList },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-xl font-bold">Contabilidad</h3>
        <p className="text-gray-400 text-sm">Registros contables automáticos, caja general y plan de cuentas</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/5 rounded-xl p-1 border border-white/10">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}`}>
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
          {activeTab === 'cashRegister' && <CashRegisterTab movements={cashMovements} balance={cashBalance} onReload={loadData} />}
          {activeTab === 'journal' && <JournalTab entries={journal} accounts={accounts} onReload={loadData} />}
          {activeTab === 'accounts' && <AccountsTab accounts={accounts} onReload={loadData} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ============================================
// CAJA GENERAL TAB (solo automático + ajustes)
// ============================================

function CashRegisterTab({ movements, balance, onReload }: { movements: CashMovement[]; balance: number; onReload: () => void }) {
  const [showAdjust, setShowAdjust] = useState(false);
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'year'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  useEffect(() => { setCurrentPage(1); }, [dateFilter]);

  const handleExport = async () => {
    const { exportCashRegister } = await import('../../lib/billing-store');
    exportCashRegister(movements);
  };

  const totalIncome = movements.filter(m => m.type === 'income').reduce((s, m) => s + m.amount, 0);
  const totalExpense = movements.filter(m => m.type === 'expense').reduce((s, m) => s + Math.abs(m.amount), 0);

  const filteredMovements = filterByDate(movements, dateFilter);

  return (
    <div className="space-y-4">
      {/* Balance */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
          <p className="text-[10px] text-gray-400 uppercase font-bold">Saldo Actual</p>
          <p className={`text-2xl font-bold ${balance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>S/ {balance.toFixed(2)}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
          <p className="text-[10px] text-gray-400 uppercase font-bold flex items-center justify-center gap-1"><TrendingUp size={12} /> Ingresos</p>
          <p className="text-lg font-bold text-emerald-400">S/ {totalIncome.toFixed(2)}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
          <p className="text-[10px] text-gray-400 uppercase font-bold flex items-center justify-center gap-1"><TrendingDown size={12} /> Egresos</p>
          <p className="text-lg font-bold text-red-400">S/ {totalExpense.toFixed(2)}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={() => setShowAdjust(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 font-medium text-sm hover:bg-amber-500/20 transition-all"><RefreshCw size={16} /> Ajuste / Corrección</button>
        {movements.length > 0 && (
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-sm hover:bg-white/10 transition-all"><Download size={16} /> Excel</button>
        )}
        <div className="ml-auto">
          <DateFilterButtons value={dateFilter} onChange={setDateFilter} />
        </div>
      </div>

      <p className="text-[10px] text-gray-500">Los movimientos se generan automáticamente al crear recibos. Solo puedes hacer ajustes manuales.</p>

      {/* Movements list */}
      {filteredMovements.length === 0 ? (
        <div className="py-12 text-center text-gray-500"><Wallet size={36} className="mx-auto mb-2 opacity-30" /><p>Sin movimientos</p></div>
      ) : (
        <>
          <div className="space-y-1">
            <div className="grid grid-cols-12 gap-2 px-3 py-2 text-[10px] text-gray-500 uppercase font-bold">
              <span className="col-span-2">Fecha/Hora</span><span className="col-span-4">Descripción</span><span className="col-span-2 text-right">Monto</span>
              <span className="col-span-2 text-right">Antes</span><span className="col-span-2 text-right">Después</span>
            </div>
            {[...filteredMovements].reverse().slice((currentPage - 1) * pageSize, currentPage * pageSize).map(m => (
              <div key={m.id} className={`grid grid-cols-12 gap-2 px-3 py-2.5 rounded-lg text-xs border border-transparent hover:border-white/10 hover:bg-white/5 transition-all ${m.type === 'adjustment' ? 'bg-amber-500/5' : ''}`}>
                <span className="col-span-2 text-gray-400">
                  {new Date(m.date).toLocaleDateString('es-PE')}<br/>
                  <span className="text-[10px]">{new Date(m.createdAt).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}</span>
                </span>
                <span className="col-span-4 truncate">
                  <span className="flex items-center gap-1">
                    {m.type === 'income' ? <ArrowUpCircle size={12} className="text-emerald-400 shrink-0" /> : m.type === 'expense' ? <ArrowDownCircle size={12} className="text-red-400 shrink-0" /> : <AlertCircle size={12} className="text-amber-400 shrink-0" />}
                    {m.description}
                  </span>
                  {m.notes && <p className="text-[10px] text-gray-500 mt-0.5">{m.notes}</p>}
                </span>
                <span className={`col-span-2 text-right font-mono font-bold ${m.amount >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {m.amount >= 0 ? '+' : '-'} S/ {Math.abs(m.amount).toFixed(2)}
                </span>
                <span className="col-span-2 text-right text-gray-500 font-mono">{m.balanceBefore.toFixed(2)}</span>
                <span className="col-span-2 text-right font-mono font-bold">{m.balanceAfter.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredMovements.length / pageSize)}
            onPageChange={setCurrentPage}
            totalRecords={filteredMovements.length}
            pageSize={pageSize}
          />
        </>
      )}

      <AnimatePresence>
        {showAdjust && <CashAdjustModal onClose={() => setShowAdjust(false)} onSave={() => { setShowAdjust(false); onReload(); }} />}
      </AnimatePresence>
    </div>
  );
}

function CashAdjustModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState(0);
  const [movType, setMovType] = useState<'income' | 'expense'>('income');
  const [notes, setNotes] = useState('');
  const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-all";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || amount <= 0) { alert('Completa los campos'); return; }
    const { cashRegisterStore } = await import('../../lib/billing-store');
    cashRegisterStore.addAdjustment(description, movType === 'expense' ? -amount : amount, notes);
    onSave();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-start justify-center p-4 overflow-y-auto" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-[#111] border border-amber-500/20 rounded-2xl shadow-2xl my-8">
        <div className="p-5 border-b border-amber-500/20 flex justify-between items-center">
          <h3 className="font-bold text-amber-400">⚠️ Ajuste de Caja</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Tipo</label>
            <div className="flex gap-2">
              <button type="button" onClick={() => setMovType('income')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all border ${movType === 'income' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' : 'bg-white/5 text-gray-400 border-white/10'}`}>+ Sumar</button>
              <button type="button" onClick={() => setMovType('expense')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all border ${movType === 'expense' ? 'bg-red-500/15 text-red-400 border-red-500/20' : 'bg-white/5 text-gray-400 border-white/10'}`}>- Restar</button>
            </div>
          </div>
          <div><label className="text-xs text-gray-400 mb-1 block">Motivo *</label><input type="text" value={description} onChange={e => setDescription(e.target.value)} className={inputClass} required placeholder="Ej: Corrección monto incorrecto" /></div>
          <div><label className="text-xs text-gray-400 mb-1 block">Monto (S/) *</label><input type="number" value={amount || ''} onChange={e => setAmount(parseFloat(e.target.value) || 0)} className={inputClass} step="0.01" min={0.01} required /></div>
          <div><label className="text-xs text-gray-400 mb-1 block">Notas</label><input type="text" value={notes} onChange={e => setNotes(e.target.value)} className={inputClass} placeholder="Opcional" /></div>
          <button type="submit" className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold text-sm"><Save size={16} /> Registrar Ajuste</button>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ============================================
// LIBRO DIARIO TAB
// ============================================

function JournalTab({ entries, accounts, onReload }: { entries: JournalEntry[]; accounts: Account[]; onReload: () => void }) {
  const [showExpense, setShowExpense] = useState(false);
  const [showAdjust, setShowAdjust] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'year'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  useEffect(() => { setCurrentPage(1); }, [dateFilter]);

  const getAcctName = (id: string) => { const a = accounts.find(x => x.id === id); return a ? `${a.code} - ${a.name}` : 'N/A'; };

  const handleExport = async () => {
    const { exportJournal } = await import('../../lib/billing-store');
    exportJournal(entries, accounts);
  };

  const typeLabels: Record<string, { label: string; color: string }> = {
    receipt: { label: 'Auto', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    manual: { label: 'Gasto', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    adjustment: { label: 'Ajuste', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    capital: { label: 'Aporte', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  };

  const filteredEntries = filterByDate(entries, dateFilter);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={() => setShowExpense(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-semibold text-sm hover:shadow-lg transition-all"><ShoppingBag size={16} /> Registrar Gasto</button>
        {entries.length > 0 && (
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-sm hover:bg-white/10 transition-all"><Download size={16} /> Excel</button>
        )}
        <div className="ml-auto">
          <DateFilterButtons value={dateFilter} onChange={setDateFilter} />
        </div>
      </div>

      <p className="text-[10px] text-gray-500">Los asientos de ingreso se generan automáticamente al crear recibos. Aquí puedes registrar gastos y hacer ajustes.</p>

      {filteredEntries.length === 0 ? (
        <div className="py-12 text-center text-gray-500"><BookOpen size={36} className="mx-auto mb-2 opacity-30" /><p>Sin asientos contables</p><p className="text-xs mt-1">Se generan automáticamente al crear recibos</p></div>
      ) : (
        <>
          <div className="space-y-2">
            {[...filteredEntries].reverse().slice((currentPage - 1) * pageSize, currentPage * pageSize).map(e => {
              const tl = typeLabels[e.referenceType] || typeLabels.manual;
              return (
                <div key={e.id} className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-gray-500">{new Date(e.date).toLocaleDateString('es-PE')} {new Date(e.createdAt).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${tl.color}`}>{tl.label}</span>
                        {e.exchangeRate !== 1 && <span className="text-[9px] text-gray-500">TC: {e.exchangeRate}</span>}
                      </div>
                      <p className="text-sm font-medium mt-1">{e.description}</p>
                    </div>
                    <span className={`text-lg font-bold font-mono shrink-0 ${e.referenceType === 'receipt' || e.referenceType === 'capital' || (e.referenceType === 'adjustment' && e.amount > 0) ? 'text-emerald-400' : 'text-red-400'}`}>
                      {e.referenceType === 'receipt' || e.referenceType === 'capital' || (e.referenceType === 'adjustment' && e.amount > 0) ? '+' : '-'} S/ {Math.abs(e.amount).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><ArrowUpCircle size={11} className="text-blue-400" /> {getAcctName(e.debitAccountId)}</span>
                    <span className="flex items-center gap-1"><ArrowDownCircle size={11} className="text-red-400" /> {getAcctName(e.creditAccountId)}</span>
                    {e.referenceType !== 'adjustment' && (
                      <button onClick={() => setShowAdjust(e.id)} className="ml-auto text-amber-400 hover:text-amber-300 text-[10px] font-medium">Ajustar</button>
                    )}
                  </div>
                  {e.notes && <p className="text-[10px] text-gray-500 mt-1">{e.notes}</p>}
                </div>
              );
            })}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredEntries.length / pageSize)}
            onPageChange={setCurrentPage}
            totalRecords={filteredEntries.length}
            pageSize={pageSize}
          />
        </>
      )}

      <AnimatePresence>
        {showExpense && <ExpenseFormModal accounts={accounts} onClose={() => setShowExpense(false)} onSave={() => { setShowExpense(false); onReload(); }} />}
        {showAdjust && <AdjustmentModal originalId={showAdjust} accounts={accounts} onClose={() => setShowAdjust(null)} onSave={() => { setShowAdjust(null); onReload(); }} />}
      </AnimatePresence>
    </div>
  );
}

function ExpenseFormModal({ accounts, onClose, onSave }: { accounts: Account[]; onClose: () => void; onSave: () => void }) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [expenseAccountId, setExpenseAccountId] = useState('');
  const [amount, setAmount] = useState(0);
  const [notes, setNotes] = useState('');
  const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-red-500/50 transition-all";
  const numInputClass = `${inputClass} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`;

  const expenseAccounts = accounts.filter(a => a.type === 'expense');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseAccountId || amount <= 0) { alert('Completa todos los campos'); return; }
    const { journalStore, cashRegisterStore, accountStore } = await import('../../lib/billing-store');
    // Caja General siempre es la cuenta 101 (única fuente de pago)
    const allAccounts = accountStore.getAll();
    const cajaAccount = allAccounts.find(a => a.code === '101');
    if (!cajaAccount) { alert('No se encontró la cuenta Caja General (101)'); return; }
    // Asiento: Gasto (debe) ↔ Caja General (haber)
    journalStore.create({ date, description, debitAccountId: expenseAccountId, creditAccountId: cajaAccount.id, amount: Math.round(amount * 100) / 100, originalCurrency: 'PEN', originalAmount: amount, exchangeRate: 1, referenceType: 'manual', referenceId: '', notes });
    // Movimiento de caja
    cashRegisterStore.addMovement({ date, description, type: 'expense', amount: Math.round(amount * 100) / 100, referenceType: 'manual', referenceId: '', notes });
    onSave();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-start justify-center p-4 overflow-y-auto" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg bg-[#111] border border-red-500/20 rounded-2xl shadow-2xl my-8">
        <div className="p-5 border-b border-red-500/20 flex justify-between items-center">
          <h3 className="font-bold text-red-400">🧾 Registrar Gasto</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div><label className="text-xs text-gray-400 mb-1 block">Fecha</label><input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputClass} /></div>
          <div><label className="text-xs text-gray-400 mb-1 block">Descripción *</label><input type="text" value={description} onChange={e => setDescription(e.target.value)} className={inputClass} required placeholder="Ej: Hosting mensual, Reunión con cliente" /></div>
          <div><label className="text-xs text-gray-400 mb-1 block">Categoría de Gasto *</label>
            <select value={expenseAccountId} onChange={e => setExpenseAccountId(e.target.value)} className={`${inputClass} appearance-none`} required>
              <option value="">Seleccionar...</option>{expenseAccounts.map(a => <option key={a.id} value={a.id}>{a.code} - {a.name}</option>)}
            </select>
          </div>
          <p className="text-[10px] text-gray-500 -mt-2">💡 El gasto se descuenta automáticamente de la Caja General</p>
          <div><label className="text-xs text-gray-400 mb-1 block">Monto (S/) *</label><input type="number" value={amount || ''} onChange={e => setAmount(parseFloat(e.target.value) || 0)} className={numInputClass} step="0.01" min={0.01} required /></div>
          <div><label className="text-xs text-gray-400 mb-1 block">Notas</label><input type="text" value={notes} onChange={e => setNotes(e.target.value)} className={inputClass} /></div>
          <button type="submit" className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-semibold text-sm"><Save size={16} /> Registrar Gasto</button>
        </form>
      </motion.div>
    </motion.div>
  );
}

function AdjustmentModal({ originalId, accounts, onClose, onSave }: { originalId: string; accounts: Account[]; onClose: () => void; onSave: () => void }) {
  const [description, setDescription] = useState('');
  const [debitId, setDebitId] = useState('');
  const [creditId, setCreditId] = useState('');
  const [amount, setAmount] = useState(0);
  const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-all";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!debitId || !creditId || amount <= 0) { alert('Completa todos los campos'); return; }
    const { journalStore } = await import('../../lib/billing-store');
    journalStore.createAdjustment(originalId, description, debitId, creditId, amount);
    onSave();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-start justify-center p-4 overflow-y-auto" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-[#111] border border-amber-500/20 rounded-2xl shadow-2xl my-8">
        <div className="p-5 border-b border-amber-500/20 flex justify-between items-center">
          <h3 className="font-bold text-amber-400">⚠️ Asiento de Ajuste</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div><label className="text-xs text-gray-400 mb-1 block">Motivo *</label><input type="text" value={description} onChange={e => setDescription(e.target.value)} className={inputClass} required placeholder="Ej: Corrección de monto" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-gray-400 mb-1 block">Cuenta DEBE</label><select value={debitId} onChange={e => setDebitId(e.target.value)} className={`${inputClass} appearance-none`} required><option value="">Seleccionar...</option>{accounts.map(a => <option key={a.id} value={a.id}>{a.code} - {a.name}</option>)}</select></div>
            <div><label className="text-xs text-gray-400 mb-1 block">Cuenta HABER</label><select value={creditId} onChange={e => setCreditId(e.target.value)} className={`${inputClass} appearance-none`} required><option value="">Seleccionar...</option>{accounts.map(a => <option key={a.id} value={a.id}>{a.code} - {a.name}</option>)}</select></div>
          </div>
          <div><label className="text-xs text-gray-400 mb-1 block">Monto (S/) *</label><input type="number" value={amount || ''} onChange={e => setAmount(parseFloat(e.target.value) || 0)} className={inputClass} step="0.01" min={0.01} required /></div>
          <button type="submit" className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold text-sm"><Save size={16} /> Registrar Ajuste</button>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ============================================
// PLAN DE CUENTAS TAB
// ============================================

function AccountsTab({ accounts, onReload }: { accounts: Account[]; onReload: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [editAccount, setEditAccount] = useState<Account | null>(null);
  const [showCapital, setShowCapital] = useState(false);

  const grouped = accounts.reduce((g, a) => { (g[a.type] = g[a.type] || []).push(a); return g; }, {} as Record<AccountType, Account[]>);
  const totalAssets = accounts.filter(a => a.type === 'asset').reduce((s, a) => s + a.balance, 0);
  const totalLiabilities = accounts.filter(a => a.type === 'liability').reduce((s, a) => s + a.balance, 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button onClick={() => { setEditAccount(null); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-sm hover:shadow-lg transition-all"><Plus size={16} /> Nueva Cuenta</button>
        <button onClick={() => setShowCapital(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 font-medium text-sm hover:bg-purple-500/20 transition-all"><DollarSign size={16} /> Agregar Capital</button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center">
          <p className="text-[10px] text-gray-400 uppercase">Total Activos</p>
          <p className="text-lg font-bold text-blue-400">S/ {totalAssets.toFixed(2)}</p>
        </div>
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
          <p className="text-[10px] text-gray-400 uppercase">Total Pasivos</p>
          <p className="text-lg font-bold text-red-400">S/ {totalLiabilities.toFixed(2)}</p>
        </div>
      </div>

      {(['asset', 'liability', 'equity', 'income', 'expense'] as AccountType[]).map(type => {
        const accts = grouped[type] || [];
        if (accts.length === 0) return null;
        return (
          <div key={type}>
            <h4 className={`text-xs font-bold uppercase mb-2 ${ACCOUNT_TYPE_COLORS[type]}`}>{ACCOUNT_TYPE_LABELS[type]}</h4>
            <div className="space-y-1">
              {accts.map(a => (
                <div key={a.id} className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-all">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-gray-500 w-8">{a.code}</span>
                    <span className="text-sm">{a.name}</span>
                    {a.isDefault && <span className="text-[9px] text-gray-600 bg-white/5 px-1.5 py-0.5 rounded">Sistema</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold">S/ {a.balance.toFixed(2)}</span>
                    {!a.isDefault && (
                      <>
                        <button onClick={() => { setEditAccount(a); setShowForm(true); }} className="p-1 text-gray-400 hover:text-amber-400"><Edit3 size={13} /></button>
                        <button onClick={async () => { if (!confirm('¿Eliminar esta cuenta?')) return; const { accountStore } = await import('../../lib/billing-store'); accountStore.delete(a.id); onReload(); }} className="p-1 text-gray-400 hover:text-red-400"><Trash2 size={13} /></button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <AnimatePresence>
        {showForm && <AccountFormModal editing={editAccount} onClose={() => { setShowForm(false); setEditAccount(null); }} onSave={() => { setShowForm(false); setEditAccount(null); onReload(); }} />}
        {showCapital && <CapitalModal accounts={accounts} onClose={() => setShowCapital(false)} onSave={() => { setShowCapital(false); onReload(); }} />}
      </AnimatePresence>
    </div>
  );
}

function AccountFormModal({ editing, onClose, onSave }: { editing: Account | null; onClose: () => void; onSave: () => void }) {
  const [code, setCode] = useState(editing?.code || '');
  const [name, setName] = useState(editing?.name || '');
  const [type, setType] = useState<AccountType>(editing?.type || 'expense');
  const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { accountStore } = await import('../../lib/billing-store');
    if (editing) { accountStore.update(editing.id, { code, name, type }); } else { accountStore.create({ code, name, type, balance: 0, isDefault: false }); }
    onSave();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-start justify-center p-4 overflow-y-auto" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm bg-[#111] border border-white/10 rounded-2xl shadow-2xl my-8">
        <div className="p-5 border-b border-white/10 flex justify-between items-center">
          <h3 className="font-bold">{editing ? 'Editar Cuenta' : 'Nueva Cuenta'}</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div><label className="text-xs text-gray-400 mb-1 block">Código *</label><input type="text" value={code} onChange={e => setCode(e.target.value)} className={inputClass} required placeholder="Ej: 807" /></div>
          <div><label className="text-xs text-gray-400 mb-1 block">Nombre *</label><input type="text" value={name} onChange={e => setName(e.target.value)} className={inputClass} required placeholder="Ej: Servicios Externos" /></div>
          <div><label className="text-xs text-gray-400 mb-1 block">Tipo</label>
            <select value={type} onChange={e => setType(e.target.value as AccountType)} className={`${inputClass} appearance-none`}>
              {Object.entries(ACCOUNT_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <button type="submit" className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-sm"><Save size={16} /> {editing ? 'Guardar' : 'Crear Cuenta'}</button>
        </form>
      </motion.div>
    </motion.div>
  );
}

function CapitalModal({ accounts, onClose, onSave }: { accounts: Account[]; onClose: () => void; onSave: () => void }) {
  const [amount, setAmount] = useState(0);
  const [notes, setNotes] = useState('');
  const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-all";
  const numInputClass = `${inputClass} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;
    const { journalStore, cashRegisterStore, accountStore } = await import('../../lib/billing-store');
    const allAccounts = accountStore.getAll();
    const capitalAcct = allAccounts.find(a => a.code === '501');
    const cajaAcct = allAccounts.find(a => a.code === '101');
    if (!capitalAcct || !cajaAcct) return;
    // Asiento: Caja General (debe) ↔ Capital (haber) — siempre va a Caja General
    journalStore.create({ date: new Date().toISOString().split('T')[0], description: `Aporte de Capital${notes ? ': ' + notes : ''}`, debitAccountId: cajaAcct.id, creditAccountId: capitalAcct.id, amount, originalCurrency: 'PEN', originalAmount: amount, exchangeRate: 1, referenceType: 'capital', referenceId: '', notes });
    // Movimiento de caja
    cashRegisterStore.addMovement({ date: new Date().toISOString().split('T')[0], description: `Aporte de Capital${notes ? ': ' + notes : ''}`, type: 'income', amount, referenceType: 'capital', referenceId: '', notes });
    onSave();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-start justify-center p-4 overflow-y-auto" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg bg-[#111] border border-purple-500/20 rounded-2xl shadow-2xl my-8">
        <div className="p-5 border-b border-purple-500/20 flex justify-between items-center">
          <h3 className="font-bold text-purple-400">💰 Agregar Capital</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-[10px] text-gray-500">💡 El capital se agrega automáticamente a la Caja General</p>
          <div><label className="text-xs text-gray-400 mb-1 block">Monto (S/) *</label><input type="number" value={amount || ''} onChange={e => setAmount(parseFloat(e.target.value) || 0)} className={numInputClass} step="0.01" min={0.01} required /></div>
          <div><label className="text-xs text-gray-400 mb-1 block">Notas</label><input type="text" value={notes} onChange={e => setNotes(e.target.value)} className={inputClass} placeholder="Ej: Inversión inicial" /></div>
          <button type="submit" className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold text-sm"><Save size={16} /> Registrar Capital</button>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ============================================
// SHARED: DATE FILTER
// ============================================

function DateFilterButtons({ value, onChange }: { value: string; onChange: (v: 'all' | 'today' | 'week' | 'month' | 'year') => void }) {
  const options = [
    { id: 'all', label: 'Todo' },
    { id: 'today', label: 'Hoy' },
    { id: 'week', label: 'Semana' },
    { id: 'month', label: 'Mes' },
    { id: 'year', label: 'Año' },
  ] as const;
  return (
    <div className="flex gap-1 bg-white/5 rounded-lg p-0.5">
      {options.map(o => (
        <button key={o.id} onClick={() => onChange(o.id)} className={`px-2.5 py-1 rounded text-[10px] font-medium transition-all ${value === o.id ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}>{o.label}</button>
      ))}
    </div>
  );
}

function filterByDate<T extends { date?: string; createdAt?: string }>(items: T[], filter: string): T[] {
  if (filter === 'all') return items;
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const getDate = (item: T) => new Date(item.date || item.createdAt || '');

  switch (filter) {
    case 'today': return items.filter(i => getDate(i) >= startOfDay);
    case 'week': { const d = new Date(startOfDay); d.setDate(d.getDate() - 7); return items.filter(i => getDate(i) >= d); }
    case 'month': { const d = new Date(startOfDay); d.setMonth(d.getMonth() - 1); return items.filter(i => getDate(i) >= d); }
    case 'year': { const d = new Date(startOfDay); d.setFullYear(d.getFullYear() - 1); return items.filter(i => getDate(i) >= d); }
    default: return items;
  }
}
