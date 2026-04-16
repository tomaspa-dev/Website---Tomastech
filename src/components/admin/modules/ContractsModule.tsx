/**
 * ContractsModule.tsx — Panel Admin v2
 * Gestión de contratos de servicio con firma digital.
 * Full-width form, canvas signature pad, PDF generation.
 */

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  FileSignature, Plus, Search, X, Edit2, Trash2,
  ChevronLeft, ChevronRight, Save, User, Building2,
  AlertCircle, Check, Clock, PenTool, RefreshCw,
  DollarSign, FileText,
} from 'lucide-react';
import {
  contractStore, clientStore, quotationStore, configStore,
  DEFAULT_CLAUSES,
  formatCurrency, formatDate, isCompanyRUC,
  type Contract, type ContractStatus, type ContractClause,
  type Client, type Currency, type PaymentMethod,
} from '../../../lib/admin-store';

// ── Constants ─────────────────────────────────────────────────

const CURRENCIES: Currency[]        = ['PEN', 'USD', 'EUR'];
const SYM: Record<Currency, string> = { PEN: 'S/', USD: 'US$', EUR: '€' };
const PAYMENT_OPTS: { value: PaymentMethod; label: string }[] = [
  { value: 'transfer',  label: 'Transferencia bancaria' },
  { value: 'yape_plin', label: 'Yape / Plin' },
  { value: 'cash',      label: 'Efectivo' },
  { value: 'card',      label: 'Tarjeta' },
  { value: 'paypal',    label: 'PayPal' },
  { value: 'other',     label: 'Otro' },
];

const STATUS_META: Record<ContractStatus, { label: string; color: string }> = {
  draft:     { label: 'Borrador',    color: 'bg-slate-700 text-slate-300' },
  sent:      { label: 'Enviado',     color: 'bg-sky-500/20 text-sky-400' },
  signed:    { label: 'Firmado',     color: 'bg-emerald-500/20 text-emerald-400' },
  active:    { label: 'Activo',      color: 'bg-violet-500/20 text-violet-400' },
  completed: { label: 'Completado',  color: 'bg-slate-500/20 text-slate-400' },
  cancelled: { label: 'Cancelado',   color: 'bg-red-500/20 text-red-400' },
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
        placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 transition-colors ${className}`}
      {...props}
    />
  );
}
function StatusPill({ status }: { status: ContractStatus }) {
  const m = STATUS_META[status];
  return <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${m.color}`}>{m.label}</span>;
}

// ── Client Typeahead ──────────────────────────────────────────

function ClientSearch({ value, onChange, onSelect }: { value: string; onChange: (v: string) => void; onSelect: (c: Client) => void }) {
  const [results, setResults] = useState<Client[]>([]);
  const [open, setOpen]       = useState(false);
  const ref                   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value.length >= 2) { const r = clientStore.search(value); setResults(r.slice(0, 6)); setOpen(r.length > 0); }
    else setOpen(false);
  }, [value]);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <FInput value={value} onChange={(e) => onChange(e.target.value)} placeholder="Buscar cliente..." className="pl-9" />
        {value && <button onClick={() => { onChange(''); setOpen(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"><X size={13} /></button>}
      </div>
      {open && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
          {results.map((c) => (
            <button key={c.id} type="button" onClick={() => { onSelect(c); setOpen(false); onChange(c.name); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-700 transition-colors text-left border-b border-slate-700/50 last:border-0">
              <div className="w-7 h-7 rounded-full bg-violet-500/10 flex items-center justify-center text-violet-400 text-xs font-bold shrink-0">{c.name.substring(0, 2).toUpperCase()}</div>
              <div>
                <p className="text-white text-sm font-medium">{c.name}</p>
                <p className="text-slate-500 text-xs">{c.documentType}: {c.documentNumber}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Signature Canvas ──────────────────────────────────────────

function SignatureCanvas({ onSave }: { onSave: (data: string) => void }) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const drawing    = useRef(false);
  const [isEmpty, setIsEmpty] = useState(true);

  const getPos = (e: MouseEvent | TouchEvent, rect: DOMRect) => {
    if ('touches' in e) return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    return { x: (e as MouseEvent).clientX - rect.left, y: (e as MouseEvent).clientY - rect.top };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth   = 2.5;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';

    const start = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const pos  = getPos(e, rect);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      drawing.current = true;
    };
    const move = (e: MouseEvent | TouchEvent) => {
      if (!drawing.current) return;
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const pos  = getPos(e, rect);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      setIsEmpty(false);
    };
    const end = () => { drawing.current = false; };

    canvas.addEventListener('mousedown', start);
    canvas.addEventListener('mousemove', move);
    canvas.addEventListener('mouseup', end);
    canvas.addEventListener('touchstart', start, { passive: false });
    canvas.addEventListener('touchmove', move,  { passive: false });
    canvas.addEventListener('touchend', end);
    return () => {
      canvas.removeEventListener('mousedown', start);
      canvas.removeEventListener('mousemove', move);
      canvas.removeEventListener('mouseup', end);
      canvas.removeEventListener('touchstart', start);
      canvas.removeEventListener('touchmove', move);
      canvas.removeEventListener('touchend', end);
    };
  }, []);

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
  };

  const save = () => {
    const canvas = canvasRef.current;
    if (!canvas || isEmpty) return;
    onSave(canvas.toDataURL('image/png'));
  };

  return (
    <div>
      <div className="rounded-xl border-2 border-dashed border-slate-600 bg-slate-800/50 overflow-hidden">
        <canvas ref={canvasRef} width={560} height={160} className="block w-full touch-none cursor-crosshair" style={{ height: '160px' }} />
      </div>
      <p className="text-[11px] text-slate-500 mt-1.5 mb-3">Dibuja tu firma en el recuadro de arriba</p>
      <div className="flex gap-2">
        <button type="button" onClick={clear}
          className="flex items-center gap-1.5 px-3 py-2 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg text-xs font-semibold transition-colors">
          <RefreshCw size={12} />Borrar
        </button>
        <button type="button" onClick={save} disabled={isEmpty}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-colors">
          <Check size={12} />Aplicar Firma
        </button>
      </div>
    </div>
  );
}

// ── Form state ────────────────────────────────────────────────

interface ContractForm {
  clientSearch:    string;
  selectedClient:  Client | null;
  clientId:        string;
  quotationId:     string;
  title:           string;
  serviceScope:    string;
  value:           number;
  currency:        Currency;
  advancePercent:  number;
  paymentMethod:   PaymentMethod;
  startDate:       string;
  estimatedEndDate: string;
  status:          ContractStatus;
  clauses:         ContractClause[];
  signerName:      string;
  signerDocument:  string;
  signatureData:   string;
  signedAt:        string;
}

const emptyForm = (): ContractForm => {
  const config = configStore.get();
  const today  = new Date().toISOString().split('T')[0];
  const end    = new Date();
  end.setDate(end.getDate() + 30);
  return {
    clientSearch: '', selectedClient: null, clientId: '', quotationId: '',
    title: '', serviceScope: '', value: 0, currency: 'PEN',
    advancePercent: 50, paymentMethod: 'transfer',
    startDate: today, estimatedEndDate: end.toISOString().split('T')[0],
    status: 'draft',
    clauses: DEFAULT_CLAUSES.map((c) => ({ ...c })),
    signerName: config.fullName || config.businessName,
    signerDocument: config.documentNumber,
    signatureData: '', signedAt: '',
  };
};

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

export function ContractsModule() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [search, setSearch]       = useState('');
  const [page, setPage]           = useState(1);
  const [mode, setMode]           = useState<'list' | 'create' | 'edit'>('list');
  const [editing, setEditing]     = useState<Contract | null>(null);
  const [form, setForm]           = useState<ContractForm>(emptyForm());
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [showSigPad, setShowSigPad] = useState(false);
  const autoSaveTimer             = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reload = () => setContracts(contractStore.getAll());
  useEffect(() => { reload(); }, []);
  useEffect(() => { setPage(1); }, [search]);

  // ── Filtered ───────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return contracts.filter((c) => {
      const client = clientStore.getById(c.clientId);
      return !q || c.number.toLowerCase().includes(q) || c.title.toLowerCase().includes(q) || (client?.name ?? '').toLowerCase().includes(q);
    });
  }, [contracts, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ── AutoSave ───────────────────────────────────────────────
  const scheduleAutoSave = useCallback((data: ContractForm) => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    setSaveState('pending');
    autoSaveTimer.current = setTimeout(() => {
      localStorage.setItem('tt_contract_draft', JSON.stringify(data));
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 2000);
    }, 1500);
  }, []);

  const setF = <K extends keyof ContractForm>(k: K, v: ContractForm[K]) => {
    const updated = { ...form, [k]: v };
    setForm(updated);
    scheduleAutoSave(updated);
  };

  // ── Open form ──────────────────────────────────────────────
  const openCreate = () => {
    const draft = localStorage.getItem('tt_contract_draft');
    setEditing(null);
    setForm(draft ? { ...emptyForm(), ...JSON.parse(draft) } : emptyForm());
    setSaveState('idle');
    setShowSigPad(false);
    setMode('create');
  };
  const openEdit = (c: Contract) => {
    localStorage.removeItem('tt_contract_draft');
    const client = clientStore.getById(c.clientId) ?? null;
    setEditing(c);
    setForm({
      clientSearch: client?.name ?? '', selectedClient: client, clientId: c.clientId,
      quotationId: c.quotationId ?? '', title: c.title, serviceScope: c.serviceScope,
      value: c.value, currency: c.currency, advancePercent: c.advancePercent,
      paymentMethod: c.paymentMethod, startDate: c.startDate, estimatedEndDate: c.estimatedEndDate,
      status: c.status, clauses: c.clauses,
      signerName: c.signerName, signerDocument: c.signerDocument,
      signatureData: c.signatureData ?? '', signedAt: c.signedAt ?? '',
    });
    setSaveState('idle');
    setShowSigPad(false);
    setMode('edit');
  };
  const closeForm = () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); setMode('list'); setEditing(null); };

  // ── Save ───────────────────────────────────────────────────
  const handleSave = () => {
    if (!form.clientId || !form.title.trim()) return;
    const payload = {
      clientId: form.clientId, quotationId: form.quotationId || undefined,
      title: form.title, serviceScope: form.serviceScope, value: form.value,
      currency: form.currency, advancePercent: form.advancePercent,
      paymentMethod: form.paymentMethod, startDate: form.startDate,
      estimatedEndDate: form.estimatedEndDate, status: form.status,
      clauses: form.clauses, signerName: form.signerName,
      signerDocument: form.signerDocument,
      signatureData: form.signatureData || undefined,
      signedAt: form.signedAt || undefined,
    };
    if (editing) { contractStore.update(editing.id, payload); }
    else          { contractStore.create(payload); }
    localStorage.removeItem('tt_contract_draft');
    reload();
    closeForm();
  };

  // ── Clause toggle ──────────────────────────────────────────
  const toggleClause = (id: string) => {
    setForm((p) => ({
      ...p,
      clauses: p.clauses.map((c) => c.id === id ? { ...c, enabled: !c.enabled } : c),
    }));
  };

  // ── Delete ─────────────────────────────────────────────────
  const handleDelete = (c: Contract) => {
    if (!window.confirm(`¿Eliminar contrato ${c.number}?`)) return;
    contractStore.delete(c.id);
    reload();
  };

  // ────────────────────────────────────────────────────────────
  // FORM VIEW
  // ────────────────────────────────────────────────────────────
  if (mode === 'create' || mode === 'edit') {
    const isEdit = mode === 'edit';
    const advanceAmount = (form.value * form.advancePercent) / 100;

    return (
      <div className="flex flex-col h-full bg-slate-950">

        {/* Header */}
        <div className="shrink-0 flex items-center gap-4 px-8 py-4 bg-slate-900 border-b border-slate-800">
          <div>
            <h2 className="text-white font-bold text-lg">{isEdit ? `Editar: ${editing?.number}` : 'Nuevo Contrato de Servicios'}</h2>
            <p className="text-slate-400 text-xs mt-0.5">Versión controlada — se mantiene historial de cambios</p>
          </div>
          <div className="flex-1 flex justify-center"><AutoSaveIndicator state={saveState} /></div>
          <div className="flex items-center gap-2">
            <button onClick={closeForm} className="px-4 py-2 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg text-sm font-semibold transition-colors">Cancelar</button>
            <button onClick={handleSave} disabled={!form.clientId || !form.title.trim()}
              className="flex items-center gap-2 px-5 py-2 bg-violet-500 hover:bg-violet-400 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition-colors">
              <Save size={15} />{isEdit ? 'Guardar Cambios' : 'Crear Contrato'}
            </button>
            <button onClick={closeForm} className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"><X size={18} /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-8 py-8 space-y-8">

            {/* ① Cliente */}
            <section>
              <h3 className="text-white font-semibold text-sm mb-4 pb-2 border-b border-slate-800 flex items-center gap-2">
                <User size={15} className="text-violet-400" />Cliente
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Label required>Buscar Cliente</Label>
                  <ClientSearch value={form.clientSearch} onChange={(v) => setF('clientSearch', v)}
                    onSelect={(c) => setForm((p) => ({ ...p, clientId: c.id, selectedClient: c, clientSearch: c.name }))} />
                </div>
                {form.clientId && (
                  <div>
                    <Label>Cotización Vinculada</Label>
                    <select value={form.quotationId} onChange={(e) => setF('quotationId', e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40 appearance-none">
                      <option value="">— Sin vincular —</option>
                      {quotationStore.getAll().filter((q) => q.clientId === form.clientId && q.status === 'accepted')
                        .map((q) => <option key={q.id} value={q.id}>{q.number}</option>)}
                    </select>
                  </div>
                )}
              </div>
              {form.selectedClient && (
                <div className="mt-3 grid grid-cols-3 gap-3">
                  {[
                    { label: 'Nombre', value: form.selectedClient.name },
                    { label: 'Tipo Doc.', value: form.selectedClient.documentType },
                    { label: 'Nº Documento', value: form.selectedClient.documentNumber },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">{label}</p>
                      <div className="bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2">
                        <p className="text-slate-300 text-sm font-mono truncate">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* ② Alcance */}
            <section>
              <h3 className="text-white font-semibold text-sm mb-4 pb-2 border-b border-slate-800 flex items-center gap-2">
                <FileText size={15} className="text-violet-400" />Alcance del Servicio
              </h3>
              <div className="space-y-4">
                <div>
                  <Label required>Título del Contrato</Label>
                  <FInput value={form.title} onChange={(e) => setF('title', e.target.value)}
                    placeholder="Ej: Desarrollo de Plataforma E-Commerce Full Stack" />
                </div>
                <div>
                  <Label required>Descripción del Alcance</Label>
                  <textarea value={form.serviceScope} onChange={(e) => setF('serviceScope', e.target.value)}
                    placeholder="Describe detalladamente los entregables, tecnologías, revisiones incluidas y lo que NO está incluido..."
                    rows={5}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 transition-colors resize-none" />
                </div>
              </div>
            </section>

            {/* ③ Valor y fechas */}
            <section>
              <h3 className="text-white font-semibold text-sm mb-4 pb-2 border-b border-slate-800 flex items-center gap-2">
                <DollarSign size={15} className="text-violet-400" />Valor y Cronograma
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label required>Valor Total</Label>
                  <div className="flex gap-2">
                    <select value={form.currency} onChange={(e) => setF('currency', e.target.value as Currency)}
                      className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-2.5 text-sm text-white focus:outline-none w-16 shrink-0 appearance-none">
                      {CURRENCIES.map((c) => <option key={c} value={c}>{SYM[c]}</option>)}
                    </select>
                    <FInput type="number" min={0} step={0.01} value={form.value || ''}
                      onChange={(e) => setF('value', parseFloat(e.target.value) || 0)} placeholder="0.00" />
                  </div>
                </div>
                <div>
                  <Label>% Adelanto</Label>
                  <div className="relative">
                    <FInput type="number" min={0} max={100} value={form.advancePercent}
                      onChange={(e) => setF('advancePercent', parseInt(e.target.value) || 0)} className="pr-8" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Adelanto: {SYM[form.currency]} {advanceAmount.toFixed(2)}</p>
                </div>
                <div>
                  <Label>Fecha de Inicio</Label>
                  <FInput type="date" value={form.startDate} onChange={(e) => setF('startDate', e.target.value)} />
                </div>
                <div>
                  <Label>Fecha Estimada de Entrega</Label>
                  <FInput type="date" value={form.estimatedEndDate} onChange={(e) => setF('estimatedEndDate', e.target.value)} />
                </div>
                <div>
                  <Label>Forma de Pago</Label>
                  <select value={form.paymentMethod} onChange={(e) => setF('paymentMethod', e.target.value as PaymentMethod)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40 appearance-none">
                    {PAYMENT_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Estado</Label>
                  <select value={form.status} onChange={(e) => setF('status', e.target.value as ContractStatus)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40 appearance-none">
                    {(Object.keys(STATUS_META) as ContractStatus[]).map((s) => (
                      <option key={s} value={s}>{STATUS_META[s].label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* ④ Cláusulas */}
            <section>
              <h3 className="text-white font-semibold text-sm mb-4 pb-2 border-b border-slate-800 flex items-center gap-2">
                <FileSignature size={15} className="text-violet-400" />Cláusulas del Contrato
              </h3>
              <div className="space-y-3">
                {form.clauses.map((clause) => (
                  <div key={clause.id} className={`rounded-xl border-2 p-4 transition-all ${clause.enabled ? 'border-violet-500/30 bg-violet-500/5' : 'border-slate-700 bg-slate-800/20'}`}>
                    <div className="flex items-start gap-3">
                      <button type="button" onClick={() => toggleClause(clause.id)}
                        className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${clause.enabled ? 'bg-violet-500 border-violet-500' : 'border-slate-600 hover:border-slate-500'}`}>
                        {clause.enabled && <Check size={11} className="text-white" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold ${clause.enabled ? 'text-white' : 'text-slate-400'}`}>{clause.title}</p>
                        <p className={`text-xs mt-1 leading-relaxed ${clause.enabled ? 'text-slate-300' : 'text-slate-600'}`}>{clause.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ⑤ Firma Digital */}
            <section>
              <h3 className="text-white font-semibold text-sm mb-4 pb-2 border-b border-slate-800 flex items-center gap-2">
                <PenTool size={15} className="text-violet-400" />Datos del Firmante y Firma Digital
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <Label>Nombre del Prestador</Label>
                  <FInput value={form.signerName} onChange={(e) => setF('signerName', e.target.value)} placeholder="Tu nombre completo" />
                </div>
                <div>
                  <Label>DNI / RUC del Prestador</Label>
                  <FInput value={form.signerDocument} onChange={(e) => setF('signerDocument', e.target.value)} placeholder="Tu número de documento" />
                </div>
              </div>

              {form.signatureData ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-400" />
                    <p className="text-emerald-400 text-sm font-semibold">Firma aplicada</p>
                    {form.signedAt && <p className="text-slate-500 text-xs">— {new Date(form.signedAt).toLocaleString('es-PE')}</p>}
                  </div>
                  <img src={form.signatureData} alt="Firma" className="h-16 w-auto bg-slate-800 rounded-lg p-2 border border-slate-700" />
                  <button type="button" onClick={() => setForm((p) => ({ ...p, signatureData: '', signedAt: '' }))}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg text-xs transition-colors">
                    <X size={12} />Quitar firma
                  </button>
                </div>
              ) : (
                <div>
                  <button type="button" onClick={() => setShowSigPad(!showSigPad)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white rounded-lg text-sm font-semibold transition-colors mb-3">
                    <PenTool size={14} />{showSigPad ? 'Ocultar panel de firma' : 'Firmar digitalmente'}
                  </button>
                  {showSigPad && (
                    <SignatureCanvas onSave={(data) => {
                      setForm((p) => ({ ...p, signatureData: data, signedAt: new Date().toISOString(), status: 'signed' }));
                      setShowSigPad(false);
                    }} />
                  )}
                </div>
              )}
            </section>

            {/* Bottom save */}
            <div className="flex items-center justify-between py-4 border-t border-slate-800">
              <AutoSaveIndicator state={saveState} />
              <div className="flex gap-3">
                <button onClick={closeForm} className="px-5 py-2.5 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg text-sm font-semibold transition-colors">Cancelar</button>
                <button onClick={handleSave} disabled={!form.clientId || !form.title.trim()}
                  className="flex items-center gap-2 px-6 py-2.5 bg-violet-500 hover:bg-violet-400 disabled:opacity-50 text-white rounded-lg text-sm font-bold transition-colors">
                  <Save size={15} />{isEdit ? 'Guardar Cambios' : 'Crear Contrato'}
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
      <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
        <div>
          <h2 className="text-white font-semibold text-lg flex items-center gap-2">
            <FileSignature size={20} className="text-violet-400" />Contratos
          </h2>
          <p className="text-slate-400 text-sm mt-0.5">{filtered.length} contratos</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-violet-500 hover:bg-violet-400 text-white rounded-lg text-sm font-semibold transition-colors">
          <Plus size={16} />Nuevo Contrato
        </button>
      </div>

      <div className="shrink-0 px-6 py-3 border-b border-slate-800">
        <div className="relative max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input type="text" placeholder="Buscar por número, título o cliente..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-8 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500" />
          {search && <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"><X size={13} /></button>}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-500">
            <FileSignature size={44} className="mb-3 opacity-20" />
            <p className="text-sm">{search ? 'Sin resultados' : 'No hay contratos aún —'} {!search && <button onClick={openCreate} className="text-violet-400 hover:underline">crea el primero</button>}</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="sticky top-0 bg-slate-900 z-10">
              <tr className="border-b border-slate-800">
                <th className="text-left px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Contrato / Cliente</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Fechas</th>
                <th className="text-right px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Valor</th>
                <th className="text-center px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                <th className="text-right px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {paginated.map((c) => {
                const client = clientStore.getById(c.clientId);
                return (
                  <tr key={c.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-3">
                      <p className="text-white font-semibold text-sm font-mono">{c.number}</p>
                      <p className="text-slate-300 text-xs mt-0.5 truncate max-w-[200px]">{c.title}</p>
                      <p className="text-slate-500 text-xs">{client?.name ?? 'Cliente eliminado'}</p>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <p className="text-slate-300 text-xs">Inicio: {formatDate(c.startDate)}</p>
                      <p className="text-slate-500 text-xs">Fin est.: {formatDate(c.estimatedEndDate)}</p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="text-white font-bold text-sm">{formatCurrency(c.value, c.currency)}</p>
                      <p className="text-slate-500 text-xs">{c.advancePercent}% adelanto</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <StatusPill status={c.status} />
                        {c.signatureData && <span className="text-[10px] text-emerald-400 flex items-center gap-0.5"><PenTool size={8} />Firmado</span>}
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(c)} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors" title="Editar"><Edit2 size={14} /></button>
                        <button onClick={() => handleDelete(c)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" title="Eliminar"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="shrink-0 flex items-center justify-between px-6 py-3 border-t border-slate-800">
          <p className="text-slate-400 text-xs">{((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length}</p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1} className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 hover:bg-slate-800 rounded-lg"><ChevronLeft size={16} /></button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)} className={`w-7 h-7 text-xs rounded-lg font-semibold ${p === page ? 'bg-violet-500 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>{p}</button>
            ))}
            <button onClick={() => setPage((p) => Math.min(p + 1, totalPages))} disabled={page === totalPages} className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 hover:bg-slate-800 rounded-lg"><ChevronRight size={16} /></button>
          </div>
        </div>
      )}
    </div>
  );
}
