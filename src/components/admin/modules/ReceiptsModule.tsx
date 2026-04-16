/**
 * ReceiptsModule.tsx — Panel Admin v2
 * Recibos por Honorarios (4ta Categoría - Perú)
 * Full-width layout, auto-cálculo de retención IR.
 */

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  Receipt, Plus, Search, X, Download, Edit2, Trash2,
  ChevronLeft, ChevronRight, AlertCircle, Check, Clock,
  Save, User, Building2, Mail, DollarSign, FileText,
} from 'lucide-react';
import {
  receiptStore, clientStore, quotationStore, configStore,
  calcRetention, formatCurrency, formatDate, isCompanyRUC,
  generateId,
  type Receipt as AdminReceipt, type Client, type Currency,
  type PaymentMethod, type ReceiptStatus,
} from '../../../lib/admin-store';

// ── Constants ─────────────────────────────────────────────────
const CURRENCIES: Currency[]       = ['PEN', 'USD', 'EUR'];
const SYM: Record<Currency, string> = { PEN: 'S/', USD: 'US$', EUR: '€' };

const PAYMENT_OPTS: { value: PaymentMethod; label: string }[] = [
  { value: 'transfer',  label: 'Transferencia bancaria' },
  { value: 'yape_plin', label: 'Yape / Plin' },
  { value: 'cash',      label: 'Efectivo' },
  { value: 'card',      label: 'Tarjeta' },
  { value: 'paypal',    label: 'PayPal' },
  { value: 'other',     label: 'Otro' },
];

const SUNAT_META: Record<ReceiptStatus, { label: string; color: string }> = {
  pending: { label: 'Pendiente',  color: 'bg-amber-500/20 text-amber-400' },
  issued:  { label: 'Emitido',    color: 'bg-emerald-500/20 text-emerald-400' },
  voided:  { label: 'Anulado',    color: 'bg-red-500/20 text-red-400' },
};

const PAGE_SIZE = 8;

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
        placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500
        transition-colors ${className}`}
      {...props}
    />
  );
}

function SunatBadge({ status }: { status: ReceiptStatus }) {
  const m = SUNAT_META[status];
  return <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${m.color}`}>{m.label}</span>;
}

// ── Client Typeahead ──────────────────────────────────────────

function ClientSearch({
  value, onChange, onSelect,
}: { value: string; onChange: (v: string) => void; onSelect: (c: Client) => void }) {
  const [results, setResults] = useState<Client[]>([]);
  const [open, setOpen]       = useState(false);
  const ref                   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value.length >= 2) {
      const r = clientStore.search(value);
      setResults(r.slice(0, 6));
      setOpen(r.length > 0);
    } else setOpen(false);
  }, [value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <FInput value={value} onChange={(e) => onChange(e.target.value)} placeholder="Buscar cliente por nombre o RUC/DNI..." className="pl-9" />
        {value && <button onClick={() => { onChange(''); setOpen(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"><X size={13} /></button>}
      </div>
      {open && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
          {results.map((c) => (
            <button key={c.id} type="button" onClick={() => { onSelect(c); setOpen(false); onChange(c.name); }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-700 transition-colors text-left border-b border-slate-700/50 last:border-0">
              <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-bold shrink-0">
                {c.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-white text-sm font-medium truncate">{c.name}</p>
                <p className="text-slate-500 text-xs flex items-center gap-1">
                  {isCompanyRUC(c.documentType, c.documentNumber) ? <Building2 size={9} /> : <User size={9} />}
                  {c.documentType}: {c.documentNumber}
                  {isCompanyRUC(c.documentType, c.documentNumber) && <span className="text-amber-400 font-semibold">· aplica retención</span>}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Form state ────────────────────────────────────────────────

interface ReceiptForm {
  clientSearch:       string;
  selectedClient:     Client | null;
  clientId:           string;
  quotationId:        string;
  serviceDescription: string;
  grossAmount:        number;
  applyRetention:     boolean;
  retentionPct:       number;
  currency:           Currency;
  paymentMethod:      PaymentMethod;
  paymentReference:   string;
  issueDate:          string;
  sunatStatus:        ReceiptStatus;
  notes:              string;
}

const emptyForm = (): ReceiptForm => ({
  clientSearch: '', selectedClient: null, clientId: '',
  quotationId: '', serviceDescription: '', grossAmount: 0,
  applyRetention: false, retentionPct: 8,
  currency: 'PEN', paymentMethod: 'transfer',
  paymentReference: '', issueDate: new Date().toISOString().split('T')[0],
  sunatStatus: 'pending', notes: '',
});

// ── AutoSave indicator ────────────────────────────────────────

type SaveState = 'idle' | 'pending' | 'saved';

function AutoSaveIndicator({ state }: { state: SaveState }) {
  if (state === 'idle') return null;
  return (
    <span className={`flex items-center gap-1 text-[11px] font-medium ${state === 'saved' ? 'text-emerald-400' : 'text-slate-400'}`}>
      {state === 'saved' ? <><Check size={11} />Auto-guardado</> : <><Clock size={11} className="animate-pulse" />Guardando…</>}
    </span>
  );
}

// ══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════

export function ReceiptsModule() {
  const config     = useMemo(() => configStore.get(), []);
  const [receipts, setReceipts] = useState<AdminReceipt[]>([]);
  const [search, setSearch]     = useState('');
  const [page, setPage]         = useState(1);

  const [mode, setMode]         = useState<'list' | 'create' | 'edit'>('list');
  const [editing, setEditing]   = useState<AdminReceipt | null>(null);
  const [form, setForm]         = useState<ReceiptForm>(emptyForm());
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const autoSaveTimer           = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reload = () => setReceipts(receiptStore.getAll());
  useEffect(() => { reload(); }, []);
  useEffect(() => { setPage(1); }, [search]);

  // ── Computed totals ────────────────────────────────────────
  const retentionAmount = form.applyRetention
    ? form.grossAmount * (form.retentionPct / 100)
    : 0;
  const netAmount = Math.max(0, form.grossAmount - retentionAmount);

  // ── Auto-suggest retention ─────────────────────────────────
  useEffect(() => {
    if (!form.selectedClient) return;
    const r = calcRetention(form.grossAmount, form.selectedClient, config);
    setForm((p) => ({ ...p, applyRetention: r.applies, retentionPct: r.percentage }));
  }, [form.selectedClient, form.grossAmount]);

  // ── Filtered ───────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return receipts.filter((r) => {
      const client = clientStore.getById(r.clientId);
      return !q || r.number.toLowerCase().includes(q) || (client?.name ?? '').toLowerCase().includes(q);
    });
  }, [receipts, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ── Auto-save ──────────────────────────────────────────────
  const scheduleAutoSave = useCallback((data: ReceiptForm) => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    setSaveState('pending');
    autoSaveTimer.current = setTimeout(() => {
      localStorage.setItem('tt_receipt_draft', JSON.stringify(data));
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 2000);
    }, 1200);
  }, []);

  const setF = <K extends keyof ReceiptForm>(k: K, v: ReceiptForm[K]) => {
    const updated = { ...form, [k]: v };
    setForm(updated);
    scheduleAutoSave(updated);
  };

  // ── Open form ──────────────────────────────────────────────
  const openCreate = () => {
    const draft = localStorage.getItem('tt_receipt_draft');
    setEditing(null);
    setForm(draft ? { ...emptyForm(), ...JSON.parse(draft) } : emptyForm());
    setSaveState('idle');
    setMode('create');
  };

  const openEdit = (r: AdminReceipt) => {
    localStorage.removeItem('tt_receipt_draft');
    const client = clientStore.getById(r.clientId) ?? null;
    setEditing(r);
    setForm({
      clientSearch: client?.name ?? '',
      selectedClient: client,
      clientId: r.clientId,
      quotationId: r.quotationId ?? '',
      serviceDescription: r.serviceDescription,
      grossAmount: r.grossAmount,
      applyRetention: r.applyRetention,
      retentionPct: r.retentionPercentage,
      currency: r.currency,
      paymentMethod: r.paymentMethod,
      paymentReference: r.paymentReference,
      issueDate: r.issueDate,
      sunatStatus: r.sunatStatus,
      notes: r.notes,
    });
    setSaveState('idle');
    setMode('edit');
  };

  const closeForm = () => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    setMode('list');
    setEditing(null);
  };

  // ── Save ───────────────────────────────────────────────────
  const handleSave = () => {
    if (!form.clientId) return;
    if (!form.serviceDescription.trim()) return;
    if (form.grossAmount <= 0) return;

    const payload = {
      clientId: form.clientId,
      quotationId: form.quotationId || undefined,
      serviceDescription: form.serviceDescription,
      grossAmount: form.grossAmount,
      applyRetention: form.applyRetention,
      retentionPercentage: form.retentionPct,
      retentionAmount,
      netAmount,
      currency: form.currency,
      paymentMethod: form.paymentMethod,
      paymentReference: form.paymentReference,
      issueDate: form.issueDate,
      sunatStatus: form.sunatStatus,
      notes: form.notes,
    };

    if (editing) {
      receiptStore.update(editing.id, payload);
    } else {
      receiptStore.create(payload);
    }
    localStorage.removeItem('tt_receipt_draft');
    reload();
    closeForm();
  };

  // ── PDF ────────────────────────────────────────────────────
  const handlePDF = async (r: AdminReceipt) => {
    const { generateReceiptPDF } = await import('../../../lib/admin-pdf');
    const client = clientStore.getById(r.clientId);
    await generateReceiptPDF(r, client, config);
  };

  // ── Delete ─────────────────────────────────────────────────
  const handleDelete = (r: AdminReceipt) => {
    if (!window.confirm(`¿Eliminar recibo ${r.number}?`)) return;
    // Note: no .delete() in receiptStore by design — void instead
    receiptStore.update(r.id, { sunatStatus: 'voided' });
    reload();
  };

  // ────────────────────────────────────────────────────────────
  // FORM VIEW
  // ────────────────────────────────────────────────────────────
  if (mode === 'create' || mode === 'edit') {
    const isEdit = mode === 'edit';

    return (
      <div className="flex flex-col h-full bg-slate-950">

        {/* Header */}
        <div className="shrink-0 flex items-center gap-4 px-8 py-4 bg-slate-900 border-b border-slate-800">
          <div>
            <h2 className="text-white font-bold text-lg">
              {isEdit ? `Editar: ${editing?.number}` : 'Nuevo Recibo por Honorarios'}
            </h2>
            <p className="text-slate-400 text-xs mt-0.5">
              Serie {config.receiptSeries} — Correlativo {isEdit ? editing?.correlative : config.nextReceiptCorrelative}
            </p>
          </div>
          <div className="flex-1 flex justify-center"><AutoSaveIndicator state={saveState} /></div>
          <div className="flex items-center gap-2">
            <button onClick={closeForm} className="px-4 py-2 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg text-sm font-semibold transition-colors">
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={!form.clientId || !form.serviceDescription.trim() || form.grossAmount <= 0}
              className="flex items-center gap-2 px-5 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold transition-colors"
            >
              <Save size={15} />{isEdit ? 'Guardar Cambios' : 'Crear Recibo'}
            </button>
            <button onClick={closeForm} className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"><X size={18} /></button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-8 py-8 space-y-8">

            {/* ① Cliente */}
            <section>
              <h3 className="text-white font-semibold text-sm mb-4 pb-2 border-b border-slate-800 flex items-center gap-2">
                <User size={15} className="text-emerald-400" />Cliente
              </h3>
              <Label required>Buscar Cliente</Label>
              <ClientSearch
                value={form.clientSearch}
                onChange={(v) => setF('clientSearch', v)}
                onSelect={(c) => { setForm((p) => ({ ...p, clientId: c.id, selectedClient: c, clientSearch: c.name })); }}
              />
              {form.selectedClient && (
                <div className="mt-3 grid grid-cols-3 gap-3">
                  {[
                    { label: 'Nombre', value: form.selectedClient.name, icon: <User size={12} className="text-slate-500" /> },
                    { label: 'Tipo Doc.', value: form.selectedClient.documentType, icon: isCompanyRUC(form.selectedClient.documentType, form.selectedClient.documentNumber) ? <Building2 size={12} className="text-sky-400" /> : <User size={12} className="text-slate-500" /> },
                    { label: 'Nº Documento', value: form.selectedClient.documentNumber, icon: null },
                  ].map(({ label, value, icon }) => (
                    <div key={label}>
                      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">{label}</p>
                      <div className="flex items-center gap-2 bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2">
                        {icon}
                        <p className="text-slate-300 text-sm font-mono truncate">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {form.selectedClient && isCompanyRUC(form.selectedClient.documentType, form.selectedClient.documentNumber) && (
                <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                  <AlertCircle size={12} className="text-amber-400 shrink-0" />
                  <p className="text-[11px] text-amber-400">Empresa con RUC {form.selectedClient.documentNumber} — se sugerirá retención IR 4ta categoría si el monto supera S/ {config.retentionThreshold}.</p>
                </div>
              )}
            </section>

            {/* ② Servicio y Monto */}
            <section>
              <h3 className="text-white font-semibold text-sm mb-4 pb-2 border-b border-slate-800 flex items-center gap-2">
                <DollarSign size={15} className="text-emerald-400" />Honorarios y Monto
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div className="md:col-span-2">
                  <Label required>Descripción del Servicio</Label>
                  <textarea
                    value={form.serviceDescription}
                    onChange={(e) => setF('serviceDescription', e.target.value)}
                    placeholder="Ej: Desarrollo de plataforma web e-commerce — Adelanto 50%"
                    rows={3}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-colors resize-none"
                  />
                </div>

                <div>
                  <Label required>Monto Bruto de Honorarios</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">{SYM[form.currency]}</span>
                    <FInput
                      type="number" min={0} step={0.01}
                      value={form.grossAmount || ''}
                      onChange={(e) => setF('grossAmount', parseFloat(e.target.value) || 0)}
                      className="pl-9"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <Label>Moneda</Label>
                  <div className="flex bg-slate-800 border border-slate-700 rounded-lg p-0.5">
                    {CURRENCIES.map((c) => (
                      <button key={c} type="button" onClick={() => setF('currency', c)}
                        className={`flex-1 py-2.5 rounded-md text-xs font-bold transition-all ${form.currency === c ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white'}`}>
                        {SYM[c]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Retención IR */}
                <div className="md:col-span-2">
                  <div className={`rounded-xl border-2 p-4 transition-all ${form.applyRetention ? 'border-amber-500/40 bg-amber-500/5' : 'border-slate-700 bg-slate-800/30'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-white font-semibold text-sm">Retención IR 4ta Categoría</p>
                        <p className="text-slate-400 text-xs">SUNAT — Artículo 74 LIR</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setF('applyRetention', !form.applyRetention)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.applyRetention ? 'bg-amber-500' : 'bg-slate-600'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.applyRetention ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                    {form.applyRetention && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-amber-500/20">
                        <div>
                          <p className="text-[10px] font-semibold text-slate-500 uppercase mb-1">% Retención</p>
                          <div className="flex items-center gap-2">
                            <FInput type="number" min={1} max={20} value={form.retentionPct}
                              onChange={(e) => setF('retentionPct', parseFloat(e.target.value) || 8)}
                              className="text-center text-sm" />
                            <span className="text-slate-400 text-sm shrink-0">%</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold text-slate-500 uppercase mb-1">Monto Retención</p>
                          <div className="bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2.5">
                            <p className="text-amber-400 font-bold text-sm">{SYM[form.currency]} {retentionAmount.toFixed(2)}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold text-slate-500 uppercase mb-1">Bruto (Factura)</p>
                          <div className="bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2.5">
                            <p className="text-white font-bold text-sm">{SYM[form.currency]} {form.grossAmount.toFixed(2)}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold text-slate-500 uppercase mb-1">Neto (Recibo)</p>
                          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-2.5">
                            <p className="text-emerald-400 font-bold text-sm">{SYM[form.currency]} {netAmount.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* ③ Pago */}
            <section>
              <h3 className="text-white font-semibold text-sm mb-4 pb-2 border-b border-slate-800 flex items-center gap-2">
                <FileText size={15} className="text-emerald-400" />Datos de Pago y emisión
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <Label>Fecha de Emisión</Label>
                  <FInput type="date" value={form.issueDate} onChange={(e) => setF('issueDate', e.target.value)} />
                </div>
                <div>
                  <Label>Forma de Pago</Label>
                  <select value={form.paymentMethod} onChange={(e) => setF('paymentMethod', e.target.value as PaymentMethod)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 appearance-none">
                    {PAYMENT_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Referencia de Pago</Label>
                  <FInput value={form.paymentReference} onChange={(e) => setF('paymentReference', e.target.value)} placeholder="Nº operación / Yape" />
                </div>
                <div>
                  <Label>Estado SUNAT</Label>
                  <div className="flex bg-slate-800 border border-slate-700 rounded-lg p-0.5">
                    {(['pending', 'issued'] as ReceiptStatus[]).map((s) => (
                      <button key={s} type="button" onClick={() => setF('sunatStatus', s)}
                        className={`flex-1 py-2 rounded-md text-xs font-bold transition-all ${form.sunatStatus === s ? (s === 'issued' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white') : 'text-slate-400 hover:text-white'}`}>
                        {SUNAT_META[s].label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quotation link */}
                <div className="md:col-span-2">
                  <Label>Vincular a Cotización (opcional)</Label>
                  <select value={form.quotationId} onChange={(e) => setF('quotationId', e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 appearance-none">
                    <option value="">— Sin vincular —</option>
                    {quotationStore.getAll()
                      .filter((q) => q.clientId === form.clientId && q.status === 'accepted')
                      .map((q) => <option key={q.id} value={q.id}>{q.number} — {formatCurrency(q.total, q.currency)}</option>)}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <Label>Notas</Label>
                  <textarea value={form.notes} onChange={(e) => setF('notes', e.target.value)}
                    placeholder="Observaciones adicionales..." rows={2}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-colors resize-none" />
                </div>
              </div>
            </section>

            {/* Bottom save */}
            <div className="flex items-center justify-between py-4 border-t border-slate-800">
              <AutoSaveIndicator state={saveState} />
              <div className="flex gap-3">
                <button onClick={closeForm} className="px-5 py-2.5 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg text-sm font-semibold transition-colors">Cancelar</button>
                <button onClick={handleSave} disabled={!form.clientId || !form.serviceDescription.trim() || form.grossAmount <= 0}
                  className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-bold transition-colors">
                  <Save size={15} />{isEdit ? 'Guardar Cambios' : 'Crear Recibo'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────
  // LIST VIEW
  // ────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
        <div>
          <h2 className="text-white font-semibold text-lg flex items-center gap-2">
            <Receipt size={20} className="text-emerald-400" />Recibos por Honorarios
          </h2>
          <p className="text-slate-400 text-sm mt-0.5">{filtered.length} recibos · Serie {config.receiptSeries}</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg text-sm font-semibold transition-colors">
          <Plus size={16} />Nuevo Recibo
        </button>
      </div>

      {/* Search */}
      <div className="shrink-0 px-6 py-3 border-b border-slate-800">
        <div className="relative max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input type="text" placeholder="Buscar por número o cliente..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-8 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500" />
          {search && <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"><X size={13} /></button>}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto">
        {paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-500">
            <Receipt size={44} className="mb-3 opacity-20" />
            <p className="text-sm">{search ? 'No se encontraron recibos' : 'No hay recibos aún —'} {!search && <button onClick={openCreate} className="text-emerald-400 hover:underline">crea el primero</button>}</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="sticky top-0 bg-slate-900 z-10">
              <tr className="border-b border-slate-800">
                {['Número / Cliente', 'Fecha', 'Bruto', 'Retención', 'Neto', 'Estado', ''].map((h, i) => (
                  <th key={i} className={`px-${i === 0 ? 6 : 4} py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider ${i === 0 ? 'text-left' : i <= 4 ? 'text-right' : 'text-center'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {paginated.map((r) => {
                const client = clientStore.getById(r.clientId);
                return (
                  <tr key={r.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-3">
                      <p className="text-white font-semibold text-sm font-mono">{r.number}</p>
                      <p className="text-slate-400 text-xs mt-0.5">{client?.name ?? 'Cliente eliminado'}</p>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-300 text-sm">{formatDate(r.issueDate)}</td>
                    <td className="px-4 py-3 text-right text-white font-semibold text-sm">{formatCurrency(r.grossAmount, r.currency)}</td>
                    <td className="px-4 py-3 text-right">
                      {r.applyRetention
                        ? <span className="text-amber-400 text-sm">−{formatCurrency(r.retentionAmount, r.currency)}</span>
                        : <span className="text-slate-600 text-sm">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right text-emerald-400 font-bold text-sm">{formatCurrency(r.netAmount, r.currency)}</td>
                    <td className="px-4 py-3 text-center"><SunatBadge status={r.sunatStatus} /></td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handlePDF(r)} className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors" title="Descargar PDF"><Download size={14} /></button>
                        <button onClick={() => openEdit(r)} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors" title="Editar"><Edit2 size={14} /></button>
                        {r.sunatStatus !== 'voided' && (
                          <button onClick={() => handleDelete(r)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" title="Anular"><Trash2 size={14} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="shrink-0 flex items-center justify-between px-6 py-3 border-t border-slate-800">
          <p className="text-slate-400 text-xs">{((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length}</p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1} className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 hover:bg-slate-800 rounded-lg"><ChevronLeft size={16} /></button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)} className={`w-7 h-7 text-xs rounded-lg font-semibold ${p === page ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>{p}</button>
            ))}
            <button onClick={() => setPage((p) => Math.min(p + 1, totalPages))} disabled={page === totalPages} className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 hover:bg-slate-800 rounded-lg"><ChevronRight size={16} /></button>
          </div>
        </div>
      )}
    </div>
  );
}
