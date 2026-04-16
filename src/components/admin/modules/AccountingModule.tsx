/**
 * AccountingModule.tsx — Panel Admin v2
 * Libro de ingresos y gastos simplificado.
 * Categorías, resumen mensual, balance, exportación CSV.
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  BookOpen, Plus, Trash2, TrendingUp, TrendingDown,
  DollarSign, X, ChevronLeft, ChevronRight, Download, Search,
  Save,
} from 'lucide-react';
import {
  accountingStore, formatCurrency, formatDate,
  type AccountingEntry, type MovementType, type Currency,
} from '../../../lib/admin-store';

// ── Constants ─────────────────────────────────────────────────

const CURRENCIES: Currency[] = ['PEN', 'USD', 'EUR'];
const SYM: Record<Currency, string> = { PEN: 'S/', USD: 'US$', EUR: '€' };

const INCOME_CATEGORIES = [
  'Servicios Web', 'Diseño', 'Consultoría', 'Mantenimiento', 'Marketing', 'Otro ingreso',
];
const EXPENSE_CATEGORIES = [
  'Licencias y Software', 'Marketing', 'Dominio / Hosting', 'Equipos', 'Transporte', 'Educación', 'Servicios', 'Otro gasto',
];

const PAGE_SIZE = 10;

// ── Micro-components ──────────────────────────────────────────

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
      {children}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  );
}

function FInput({ className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white
        placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 transition-colors ${className}`}
      {...props}
    />
  );
}

// ── KPI Card ──────────────────────────────────────────────────

function KpiCard({
  label, value, sub, icon: Icon, accent,
}: { label: string; value: string; sub: string; icon: React.ComponentType<any>; accent: string }) {
  return (
    <div className={`bg-slate-900 border rounded-xl p-5 ${accent}`}>
      <div className="flex items-center gap-3 mb-3">
        <Icon size={18} className="text-white opacity-80" />
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
      </div>
      <p className="text-2xl font-bold text-white mb-0.5">{value}</p>
      <p className="text-xs text-slate-500">{sub}</p>
    </div>
  );
}

// ── Form ──────────────────────────────────────────────────────

interface EntryForm {
  date:        string;
  type:        MovementType;
  category:    string;
  description: string;
  amount:      number;
  currency:    Currency;
  notes:       string;
}

const emptyForm = (type: MovementType = 'income'): EntryForm => ({
  date: new Date().toISOString().split('T')[0],
  type,
  category: type === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0],
  description: '',
  amount: 0,
  currency: 'PEN',
  notes: '',
});

// ══════════════════════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════════════════════

export function AccountingModule() {
  const [entries, setEntries]   = useState<AccountingEntry[]>([]);
  const [search, setSearch]     = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [page, setPage]         = useState(1);

  // Inline form
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState<EntryForm>(emptyForm('income'));

  const reload = () => setEntries(accountingStore.getAll());
  useEffect(() => { reload(); }, []);
  useEffect(() => { setPage(1); }, [search, filterType]);

  // ── Summary ────────────────────────────────────────────────
  const summary = useMemo(() => accountingStore.getSummary(), [entries]);

  // ── Monthly totals (last 3 months) ────────────────────────
  const monthlyData = useMemo(() => {
    const months: Record<string, { income: number; expense: number }> = {};
    entries.forEach((e) => {
      const m = e.date.substring(0, 7); // YYYY-MM
      if (!months[m]) months[m] = { income: 0, expense: 0 };
      if (e.type === 'income')  months[m].income  += e.amount;
      else                       months[m].expense += e.amount;
    });
    return Object.entries(months)
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 4)
      .map(([month, data]) => ({ month, ...data }));
  }, [entries]);

  // ── Filtered list ──────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return entries.filter((e) => {
      const matchQ = !q || e.description.toLowerCase().includes(q) || e.category.toLowerCase().includes(q);
      const matchT = filterType === 'all' || e.type === filterType;
      return matchQ && matchT;
    });
  }, [entries, search, filterType]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ── Form helpers ───────────────────────────────────────────
  const setF = <K extends keyof EntryForm>(k: K, v: EntryForm[K]) =>
    setForm((p) => {
      const updated = { ...p, [k]: v };
      if (k === 'type') {
        updated.category = v === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0];
      }
      return updated;
    });

  const handleSave = () => {
    if (!form.description.trim() || form.amount <= 0) return;
    accountingStore.create({
      date:          form.date,
      description:   form.description,
      type:          form.type,
      amount:        form.amount,
      currency:      form.currency,
      category:      form.category,
      referenceType: 'manual',
      notes:         form.notes,
    });
    reload();
    setForm(emptyForm(form.type));
    setShowForm(false);
  };

  // ── Export CSV ─────────────────────────────────────────────
  const exportCSV = () => {
    const rows = [
      ['Fecha', 'Tipo', 'Categoría', 'Descripción', 'Monto', 'Moneda', 'Notas'],
      ...filtered.map((e) => [
        e.date, e.type === 'income' ? 'Ingreso' : 'Gasto',
        e.category, e.description, e.amount.toFixed(2), e.currency, e.notes,
      ]),
    ];
    const csv  = rows.map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const a    = document.createElement('a');
    a.href     = URL.createObjectURL(blob);
    a.download = `Contabilidad_Tomastech_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  // ── Category bar max value ─────────────────────────────────
  const catSummary = useMemo(() => {
    const cats: Record<string, number> = {};
    entries.filter((e) => e.type === 'income').forEach((e) => {
      cats[e.category] = (cats[e.category] ?? 0) + e.amount;
    });
    return Object.entries(cats).sort(([, a], [, b]) => b - a).slice(0, 5);
  }, [entries]);
  const maxCat = catSummary[0]?.[1] ?? 1;

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
        <div>
          <h2 className="text-white font-semibold text-lg flex items-center gap-2">
            <BookOpen size={20} className="text-violet-400" />Contabilidad
          </h2>
          <p className="text-slate-400 text-sm mt-0.5">{entries.length} movimientos registrados</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-2 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg text-xs font-semibold transition-colors">
            <Download size={14} />Exportar CSV
          </button>
          <button
            onClick={() => { setForm(emptyForm('expense')); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2 border border-red-500/40 text-red-400 hover:bg-red-500/10 rounded-lg text-sm font-semibold transition-colors"
          >
            <TrendingDown size={16} />Nuevo Gasto
          </button>
          <button
            onClick={() => { setForm(emptyForm('income')); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-violet-500 hover:bg-violet-400 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            <Plus size={16} />Nuevo Ingreso
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6 max-w-6xl mx-auto">

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <KpiCard
              label="Total Ingresos"
              value={`S/ ${summary.totalIncome.toFixed(2)}`}
              sub={`${entries.filter((e) => e.type === 'income').length} movimientos`}
              icon={TrendingUp}
              accent="border-emerald-500/30"
            />
            <KpiCard
              label="Total Gastos"
              value={`S/ ${summary.totalExpenses.toFixed(2)}`}
              sub={`${entries.filter((e) => e.type === 'expense').length} movimientos`}
              icon={TrendingDown}
              accent="border-red-500/30"
            />
            <KpiCard
              label="Balance Neto"
              value={`S/ ${summary.balance.toFixed(2)}`}
              sub={summary.balance >= 0 ? '✓ Positivo' : '⚠ Negativo'}
              icon={DollarSign}
              accent={summary.balance >= 0 ? 'border-violet-500/30' : 'border-amber-500/30'}
            />
          </div>

          {/* Inline form */}
          {showForm && (
            <div className={`bg-slate-900 border-2 rounded-xl p-5 ${form.type === 'income' ? 'border-violet-500/30' : 'border-red-500/30'}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  {form.type === 'income'
                    ? <><TrendingUp size={16} className="text-emerald-400" />Nuevo Ingreso</>
                    : <><TrendingDown size={16} className="text-red-400" />Nuevo Gasto</>
                  }
                </h3>
                <button onClick={() => setShowForm(false)} className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"><X size={16} /></button>
              </div>

              {/* Type toggle */}
              <div className="flex bg-slate-800 border border-slate-700 rounded-lg p-0.5 mb-4 w-48">
                {(['income', 'expense'] as MovementType[]).map((t) => (
                  <button key={t} type="button" onClick={() => setF('type', t)}
                    className={`flex-1 py-2 rounded-md text-xs font-bold transition-all ${form.type === t ? (t === 'income' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white') : 'text-slate-400 hover:text-white'}`}>
                    {t === 'income' ? 'Ingreso' : 'Gasto'}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <Label required>Fecha</Label>
                  <FInput type="date" value={form.date} onChange={(e) => setF('date', e.target.value)} />
                </div>
                <div>
                  <Label required>Categoría</Label>
                  <select value={form.category} onChange={(e) => setF('category', e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40 appearance-none">
                    {(form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label required>Monto</Label>
                  <div className="flex gap-2">
                    <select value={form.currency} onChange={(e) => setF('currency', e.target.value as Currency)}
                      className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-2.5 text-sm text-white focus:outline-none w-16 shrink-0 appearance-none">
                      {CURRENCIES.map((c) => <option key={c} value={c}>{SYM[c]}</option>)}
                    </select>
                    <FInput type="number" min={0} step={0.01} value={form.amount || ''} onChange={(e) => setF('amount', parseFloat(e.target.value) || 0)} placeholder="0.00" />
                  </div>
                </div>
                <div className="flex items-end">
                  <button onClick={handleSave} disabled={!form.description.trim() || form.amount <= 0}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-violet-500 hover:bg-violet-400 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition-colors">
                    <Save size={15} />Registrar
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label required>Descripción</Label>
                  <FInput value={form.description} onChange={(e) => setF('description', e.target.value)} placeholder="Ej: Adelanto proyecto ABC / Figma Pro mensual" />
                </div>
                <div>
                  <Label>Notas</Label>
                  <FInput value={form.notes} onChange={(e) => setF('notes', e.target.value)} placeholder="Observación adicional" />
                </div>
              </div>
            </div>
          )}

          {/* Monthly summary */}
          {monthlyData.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
                <TrendingUp size={15} className="text-violet-400" />Resumen por Mes
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-800">
                      {['Mes', 'Ingresos', 'Gastos', 'Balance'].map((h) => (
                        <th key={h} className="text-left pb-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider pr-6">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {monthlyData.map(({ month, income, expense }) => {
                      const bal = income - expense;
                      const [yr, mo] = month.split('-');
                      const label = new Date(`${yr}-${mo}-01`).toLocaleDateString('es-PE', { month: 'long', year: 'numeric' });
                      return (
                        <tr key={month} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-2.5 pr-6 text-slate-300 capitalize">{label}</td>
                          <td className="py-2.5 pr-6 text-emerald-400 font-semibold">S/ {income.toFixed(2)}</td>
                          <td className="py-2.5 pr-6 text-red-400 font-semibold">S/ {expense.toFixed(2)}</td>
                          <td className={`py-2.5 font-bold ${bal >= 0 ? 'text-white' : 'text-amber-400'}`}>S/ {bal.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Movements table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3 px-5 py-3 border-b border-slate-800">
              <div className="relative flex-1 min-w-[180px] max-w-xs">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="text" placeholder="Buscar movimiento..." value={search} onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500" />
              </div>
              <div className="flex bg-slate-800 rounded-lg p-0.5 gap-0.5">
                {(['all', 'income', 'expense'] as const).map((t) => (
                  <button key={t} onClick={() => setFilterType(t)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${filterType === t ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}>
                    {t === 'all' ? 'Todos' : t === 'income' ? 'Ingresos' : 'Gastos'}
                  </button>
                ))}
              </div>
            </div>

            {paginated.length === 0 ? (
              <div className="py-16 text-center text-slate-500">
                <BookOpen size={36} className="mx-auto mb-3 opacity-20" />
                <p className="text-sm">{search ? 'Sin resultados' : 'Sin movimientos aún'}</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900">
                    <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Descripción / Categoría</th>
                    <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Fecha</th>
                    <th className="text-center px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Tipo</th>
                    <th className="text-right px-5 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Monto</th>
                    <th className="px-5 py-2.5 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {paginated.map((e) => (
                    <tr key={e.id} className="hover:bg-slate-800/30 transition-colors group">
                      <td className="px-5 py-3">
                        <p className="text-white text-sm font-medium truncate">{e.description}</p>
                        <span className="inline-block mt-0.5 px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] text-slate-400">{e.category}</span>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell text-slate-400 text-sm">{formatDate(e.date)}</td>
                      <td className="px-4 py-3 text-center">
                        {e.type === 'income'
                          ? <span className="flex items-center justify-center gap-1 text-emerald-400 text-xs font-semibold"><TrendingUp size={11} />Ingreso</span>
                          : <span className="flex items-center justify-center gap-1 text-red-400 text-xs font-semibold"><TrendingDown size={11} />Gasto</span>
                        }
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span className={`font-bold text-sm ${e.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                          {e.type === 'income' ? '+' : '−'}{formatCurrency(e.amount, e.currency)}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <button onClick={() => { accountingStore.delete(e.id); reload(); }}
                          className="p-1 text-slate-600 hover:text-red-400 hover:bg-red-400/10 rounded opacity-0 group-hover:opacity-100 transition-all">
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800">
                <p className="text-slate-500 text-xs">{((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length}</p>
                <div className="flex items-center gap-1">
                  <button onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1} className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 hover:bg-slate-800 rounded-lg"><ChevronLeft size={15} /></button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button key={p} onClick={() => setPage(p)} className={`w-7 h-7 text-xs rounded-lg font-semibold ${p === page ? 'bg-violet-500 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>{p}</button>
                  ))}
                  <button onClick={() => setPage((p) => Math.min(p + 1, totalPages))} disabled={page === totalPages} className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 hover:bg-slate-800 rounded-lg"><ChevronRight size={15} /></button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
