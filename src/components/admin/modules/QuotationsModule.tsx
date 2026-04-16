/**
 * QuotationsModule.tsx â€” Panel Admin v2
 * GestiÃ³n completa de cotizaciones para freelancer peruano.
 *
 * UX inspirado en Mini-ERP: panel lateral deslizante, bÃºsqueda de cliente
 * con typeahead (no select con 100 opciones), items editables en tabla,
 * cÃ¡lculo automÃ¡tico con retenciÃ³n IR (SUNAT 4ta categorÃ­a).
 */

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  FileText, Plus, Search, Download, X, Trash2, ChevronLeft, ChevronRight,
  CheckCircle2, Clock, XCircle, Edit2, Send, FileCheck2, AlertCircle,
  RotateCcw, Building2, User, Mail, Save, DollarSign,
} from 'lucide-react';
import {
  quotationStore, clientStore, serviceStore, configStore,
  addBusinessDays,
  type Quotation, type QuotationItem, type QuotationStatus,
  type Client, type Currency, type PaymentMethod,
  generateId, formatCurrency, formatDate, isCompanyRUC,
} from '../../../lib/admin-store';
import { generateQuotationPDF } from '../../../lib/admin-pdf';

// â”€â”€ Constants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const CURRENCIES: Currency[] = ['PEN', 'USD', 'EUR'];
const SYM: Record<Currency, string> = { PEN: 'S/', USD: 'US$', EUR: 'â‚¬' };

const PAYMENT_OPTS: { value: PaymentMethod; label: string }[] = [
  { value: 'transfer',  label: 'Transferencia bancaria' },
  { value: 'yape_plin', label: 'Yape / Plin' },
  { value: 'cash',      label: 'Efectivo' },
  { value: 'card',      label: 'Tarjeta' },
  { value: 'paypal',    label: 'PayPal' },
  { value: 'other',     label: 'Otro' },
];

const STATUS_META: Record<QuotationStatus, { label: string; color: string; icon: React.ComponentType<any> }> = {
  draft:    { label: 'Borrador',  color: 'bg-slate-700 text-slate-300',         icon: RotateCcw },
  sent:     { label: 'Enviada',  color: 'bg-sky-500/20 text-sky-400',           icon: Send },
  accepted: { label: 'Aceptada', color: 'bg-emerald-500/20 text-emerald-400',   icon: CheckCircle2 },
  rejected: { label: 'Rechazada',color: 'bg-red-500/20 text-red-400',           icon: XCircle },
  expired:  { label: 'Vencida',  color: 'bg-amber-500/20 text-amber-400',       icon: Clock },
};
const ALL_STATUSES = Object.keys(STATUS_META) as QuotationStatus[];

// â”€â”€ Micro-components â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function StatusPill({ status }: { status: QuotationStatus }) {
  const m = STATUS_META[status];
  const Icon = m.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${m.color}`}>
      <Icon size={9} />
      {m.label}
    </span>
  );
}

function FInput({ className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white
        placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500
        transition-colors ${className}`}
      {...props}
    />
  );
}

function FSelect({ className = '', children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white
        focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500
        appearance-none transition-colors ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
      {children}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  );
}

// â”€â”€ Client Typeahead â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function ClientSearch({
  value, onChange, onSelect,
}: {
  value: string;
  onChange: (v: string) => void;
  onSelect: (client: Client) => void;
}) {
  const [results, setResults] = useState<Client[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value.length >= 2) {
      const r = clientStore.search(value);
      setResults(r.slice(0, 6));
      setOpen(r.length > 0);
    } else {
      setOpen(false);
    }
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
        <FInput
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Buscar cliente por nombre o RUC/DNI..."
          className="pl-9"
        />
        {value && (
          <button onClick={() => { onChange(''); setOpen(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
            <X size={13} />
          </button>
        )}
      </div>
      {open && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
          {results.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => { onSelect(c); setOpen(false); onChange(c.name); }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-700 transition-colors text-left border-b border-slate-700 last:border-0"
            >
              <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-bold shrink-0">
                {c.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-white text-sm font-medium truncate">{c.name}</p>
                <p className="text-slate-500 text-xs flex items-center gap-1">
                  {c.documentType === 'RUC' && c.documentNumber.startsWith('20') ? <Building2 size={9} /> : <User size={9} />}
                  {c.documentType}: {c.documentNumber}
                  {isCompanyRUC(c.documentType, c.documentNumber) && (
                    <span className="text-amber-400 font-semibold"> Â· aplica retenciÃ³n</span>
                  )}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// â”€â”€ Calculation logic â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function calcTotals(
  items: QuotationItem[],
  discountType: 'percentage' | 'fixed',
  discountValue: number,
  applyRetention: boolean,
  retentionPct: number,
) {
  const subtotal      = items.reduce((s, i) => s + i.subtotal, 0);
  const discountAmount = discountType === 'percentage'
    ? subtotal * (discountValue / 100)
    : Math.min(discountValue, subtotal);
  const total          = Math.max(0, subtotal - discountAmount);
  const retentionAmount = applyRetention ? total * (retentionPct / 100) : 0;
  const netToReceive    = total - retentionAmount;
  return { subtotal, discountAmount, total, retentionAmount, netToReceive };
}

// â”€â”€ Form state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface QuotForm {
  clientId:        string;
  clientSearch:    string;
  selectedClient:  Client | null;
  status:          QuotationStatus;
  currency:        Currency;
  items:           QuotationItem[];
  discountType:    'percentage' | 'fixed';
  discountValue:   number;
  applyRetention:  boolean;
  retentionPct:    number;
  paymentMethod:   PaymentMethod;
  paymentTerms:    string;
  deliveryDays:    number;
  notes:           string;
}

function emptyForm(config: ReturnType<typeof configStore.get>): QuotForm {
  return {
    clientId: '', clientSearch: '', selectedClient: null,
    status: 'draft',
    currency: 'PEN' as Currency,
    items: [],
    discountType: 'fixed', discountValue: 0,
    applyRetention: false,
    retentionPct: config.retentionPercentage,
    paymentMethod: 'transfer',
    paymentTerms: '50% al inicio del proyecto, 50% al entregar',
    deliveryDays: config.quotationDeliveryDays,
    notes: '',
  };
}

function formFromQuotation(q: Quotation, client: Client | null): QuotForm {
  return {
    clientId: q.clientId, clientSearch: client?.name ?? '', selectedClient: client,
    status: q.status, currency: q.currency, items: q.items,
    discountType: q.discountType, discountValue: q.discountValue,
    applyRetention: q.applyRetention, retentionPct: q.retentionPercentage,
    paymentMethod: q.paymentMethod, paymentTerms: q.paymentTerms,
    deliveryDays: q.deliveryDays, notes: q.notes,
  };
}

// â”€â”€ PAGE SIZE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const PAGE_SIZE = 8;

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// MAIN COMPONENT
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

export function QuotationsModule() {
  const config = useMemo(() => configStore.get(), []);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [filterStatus, setFilterStatus] = useState<QuotationStatus | 'all'>('all');
  const [search, setSearch]             = useState('');
  const [page, setPage]                 = useState(1);

  // View mode: list â†” form
  const [mode, setMode]             = useState<'list' | 'create' | 'edit'>('list');
  const [editing, setEditing]       = useState<Quotation | null>(null);
  const [form, setForm]             = useState<QuotForm>(() => emptyForm(config));
  const [saving, setSaving]         = useState(false);
  const [genPdf, setGenPdf]         = useState<string | null>(null); // generating PDF for id

  // Load
  const reload = () => setQuotations(quotationStore.getAll());
  useEffect(() => { reload(); }, []);

  // â”€â”€ Computed items in form â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const { subtotal, discountAmount, total, retentionAmount, netToReceive } = useMemo(
    () => calcTotals(form.items, form.discountType, form.discountValue, form.applyRetention, form.retentionPct),
    [form.items, form.discountType, form.discountValue, form.applyRetention, form.retentionPct]
  );

  // Auto-suggest retention when client selected
  useEffect(() => {
    if (!form.selectedClient) return;
    const suggests = config.retentionEnabled &&
      isCompanyRUC(form.selectedClient.documentType, form.selectedClient.documentNumber) &&
      total > config.retentionThreshold;
    setForm((prev) => ({ ...prev, applyRetention: suggests }));
  }, [form.selectedClient, total]);

  // â”€â”€ Filtered list â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const filtered = useMemo(() => {
    return quotations.filter((q) => {
      const client = clientStore.getById(q.clientId);
      const matchSearch = !search ||
        q.number.toLowerCase().includes(search.toLowerCase()) ||
        (client?.name ?? '').toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === 'all' || q.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [quotations, search, filterStatus]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  useEffect(() => { setPage(1); }, [search, filterStatus]);

  // â”€â”€ Open / close â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm(config));
    setMode('create');
  };

  const openEdit = (q: Quotation) => {
    const client = clientStore.getById(q.clientId) ?? null;
    setEditing(q);
    setForm(formFromQuotation(q, client));
    setMode('edit');
  };

  const closePanel = () => { setMode('list'); setEditing(null); };

  // â”€â”€ Form helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const setF = <K extends keyof QuotForm>(k: K, v: QuotForm[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const selectClient = (c: Client) => {
    setForm((p) => ({ ...p, clientId: c.id, selectedClient: c }));
  };

  // â”€â”€ Items management â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const addItem = () => {
    const item: QuotationItem = { id: generateId(), description: '', quantity: 1, unitPrice: 0, subtotal: 0 };
    setF('items', [...form.items, item]);
  };

  const updateItem = (id: string, field: keyof QuotationItem, rawValue: string | number) => {
    setForm((prev) => {
      const items = prev.items.map((i) => {
        if (i.id !== id) return i;
        const updated = { ...i, [field]: rawValue };
        updated.subtotal = updated.quantity * updated.unitPrice;
        return updated;
      });
      return { ...prev, items };
    });
  };

  const removeItem = (id: string) => setF('items', form.items.filter((i) => i.id !== id));

  // Service autocomplete for item description
  const [serviceHints, setServiceHints] = useState<string[]>([]);
  const [hintTarget, setHintTarget] = useState<string | null>(null);

  const handleDescriptionChange = (id: string, val: string) => {
    updateItem(id, 'description', val);
    if (val.length >= 2) {
      const svcs = serviceStore.getActive()
        .filter((s) => s.name.toLowerCase().includes(val.toLowerCase()))
        .slice(0, 4)
        .map((s) => s.name);
      setServiceHints(svcs);
      setHintTarget(id);
    } else {
      setHintTarget(null);
    }
  };

  const applyHint = (id: string, svcName: string) => {
    const svc = serviceStore.getActive().find((s) => s.name === svcName);
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item) => {
        if (item.id !== id) return item;
        const price = form.currency === 'PEN' ? svc?.defaultPrice ?? item.unitPrice : item.unitPrice;
        return { ...item, description: svcName, unitPrice: price, subtotal: item.quantity * price };
      }),
    }));
    setHintTarget(null);
  };

  // â”€â”€ Save â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleSave = () => {
    if (!form.clientId) { alert('Selecciona un cliente'); return; }
    if (form.items.length === 0) { alert('Agrega al menos un servicio'); return; }

    setSaving(true);
    const now = new Date().toISOString().split('T')[0];
    const expiresAt = addBusinessDays(new Date(), config.quotationValidityDays)
      .toISOString().split('T')[0];

    const payload = {
      clientId:            form.clientId,
      status:              form.status,
      currency:            form.currency,
      items:               form.items,
      subtotal,
      discountType:        form.discountType,
      discountValue:       form.discountValue,
      discountAmount,
      applyRetention:      form.applyRetention,
      retentionPercentage: form.retentionPct,
      retentionAmount,
      total,
      netToReceive,
      paymentMethod:       form.paymentMethod,
      paymentTerms:        form.paymentTerms,
      deliveryDays:        form.deliveryDays,
      validityDays:        config.quotationValidityDays,
      notes:               form.notes,
      issueDate:           editing?.issueDate ?? now,
      expiresAt,
    };

    try {
      if (editing) {
        quotationStore.update(editing.id, payload);
      } else {
        quotationStore.create(payload);
      }
      reload();
      closePanel();
    } finally {
      setSaving(false);
    }
  };

  // â”€â”€ Status toggle â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const cycleStatus = (q: Quotation) => {
    const next: Record<QuotationStatus, QuotationStatus> = {
      draft: 'sent', sent: 'accepted', accepted: 'accepted', rejected: 'rejected', expired: 'expired',
    };
    quotationStore.update(q.id, { status: next[q.status] });
    reload();
  };

  // â”€â”€ Download PDF â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handlePDF = async (q: Quotation) => {
    setGenPdf(q.id);
    try {
      const client = clientStore.getById(q.clientId);
      await generateQuotationPDF(q, client, config);
    } finally {
      setGenPdf(null);
    }
  };

  // â”€â”€ Delete â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleDelete = (q: Quotation) => {
    if (!window.confirm(`Â¿Eliminar cotizaciÃ³n ${q.number}? Esta acciÃ³n no se puede deshacer.`)) return;
    quotationStore.delete(q.id);
    reload();
  };

  // â”€â”€ RENDER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  // â”€â”€ FORM VIEW â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (mode === 'create' || mode === 'edit') {
    return (
      <div className="flex flex-col h-full bg-slate-950">
        {/* Form header */}
        <div className="shrink-0 flex items-center gap-4 px-8 py-4 bg-slate-900 border-b border-slate-800">
          <div>
            <h2 className="text-white font-bold text-lg">
              {mode === 'edit' ? `Editar: ${editing?.number}` : 'Nueva CotizaciÃ³n'}
            </h2>
            <p className="text-slate-400 text-xs mt-0.5">Todos los campos se guardan en el mÃ³dulo</p>
          </div>
          <div className="flex-1" />
          <button onClick={closePanel}
            className="px-4 py-2 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg text-sm font-semibold transition-colors">
            Cancelar
          </button>
          <button onClick={handleSave} disabled={saving || !form.clientId || form.items.length === 0}
            className="flex items-center gap-2 px-5 py-2 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition-colors">
            <Save size={15} />{mode === 'edit' ? 'Guardar Cambios' : 'Crear CotizaciÃ³n'}
          </button>
          <button onClick={closePanel} className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Scrollable form */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-8 py-8 space-y-8">

            {/* â‘  CLIENT */}
            <section>
              <h3 className="text-white font-semibold text-sm mb-4 pb-2 border-b border-slate-800 flex items-center gap-2">
                <User size={15} className="text-sky-400" />Cliente
              </h3>
              <FieldLabel required>Buscar Cliente</FieldLabel>
              <ClientSearch
                value={form.clientSearch}
                onChange={(v) => setF('clientSearch', v)}
                onSelect={(c) => { selectClient(c); setF('clientSearch', c.name); }}
              />
              {form.selectedClient && (
                <div className="mt-3 bg-slate-800/70 border border-slate-700 rounded-xl overflow-hidden">
                  <div className="flex items-start gap-4 px-4 py-3">
                    <div className="w-10 h-10 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 font-bold text-sm shrink-0 mt-0.5">
                      {form.selectedClient.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0 grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { label: 'Nombre / RazÃ³n Social', value: form.selectedClient.name },
                        { label: 'Tipo Doc.', value: form.selectedClient.documentType },
                        { label: 'NÂº Documento', value: form.selectedClient.documentNumber },
                        ...(form.selectedClient.email ? [{ label: 'Email', value: form.selectedClient.email }] : []),
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">{label}</p>
                          <div className="bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2">
                            <p className="text-slate-300 text-sm font-mono truncate">{value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button type="button"
                      onClick={() => setForm((p) => ({ ...p, clientId: '', clientSearch: '', selectedClient: null }))}
                      className="shrink-0 p-1.5 text-slate-500 hover:text-white hover:bg-slate-700 rounded-lg transition-colors mt-0.5">
                      <X size={14} />
                    </button>
                  </div>
                  {isCompanyRUC(form.selectedClient.documentType, form.selectedClient.documentNumber) && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/5 border-t border-amber-500/20">
                      <AlertCircle size={12} className="text-amber-400 shrink-0" />
                      <p className="text-[11px] text-amber-400">
                        Empresa RUC <strong>{form.selectedClient.documentNumber}</strong> â€” puede aplicar retenciÃ³n IR 4ta categorÃ­a.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* â‘¡ CURRENCY + PAYMENT */}
            <section>
              <h3 className="text-white font-semibold text-sm mb-4 pb-2 border-b border-slate-800 flex items-center gap-2">
                <DollarSign size={15} className="text-sky-400" />Condiciones
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <FieldLabel>Moneda</FieldLabel>
                  <div className="flex bg-slate-800 border border-slate-700 rounded-lg p-0.5">
                    {CURRENCIES.map((c) => (
                      <button key={c} type="button" onClick={() => setF('currency', c)}
                        className={`flex-1 py-2 rounded-md text-xs font-bold transition-all ${form.currency === c ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'}`}>
                        {SYM[c]}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <FieldLabel>Forma de Pago</FieldLabel>
                  <FSelect value={form.paymentMethod} onChange={(e) => setF('paymentMethod', e.target.value as PaymentMethod)}>
                    {PAYMENT_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </FSelect>
                </div>
                <div>
                  <FieldLabel>Tiempo Entrega (dÃ­as)</FieldLabel>
                  <FInput type="number" min={1} value={form.deliveryDays}
                    onChange={(e) => setF('deliveryDays', parseInt(e.target.value) || 30)}
                    className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none" />
                </div>
                <div>
                  <FieldLabel>Estado</FieldLabel>
                  <div className="flex bg-slate-800 border border-slate-700 rounded-lg p-0.5">
                    {(['draft', 'sent'] as QuotationStatus[]).map((s) => (
                      <button key={s} type="button" onClick={() => setF('status', s)}
                        className={`flex-1 py-2 rounded-md text-xs font-bold transition-all ${form.status === s ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                        {s === 'draft' ? 'Borrador' : 'Enviada'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <FieldLabel>TÃ©rminos de Pago</FieldLabel>
                <FInput value={form.paymentTerms} onChange={(e) => setF('paymentTerms', e.target.value)}
                  placeholder="Ej: 50% al inicio, 50% al entregar" />
              </div>
            </section>

            {/* â‘¢ ITEMS */}
            <section>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
                <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                  <FileText size={15} className="text-sky-400" />Servicios / Items
                </h3>
                <button type="button" onClick={addItem}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-300 hover:text-white transition-colors font-semibold">
                  <Plus size={12} />Agregar servicio
                </button>
              </div>

              {form.items.length === 0 ? (
                <div className="py-10 text-center border border-dashed border-slate-700 rounded-xl text-slate-500 text-sm">
                  <FileText size={28} className="mx-auto mb-2 opacity-30" />
                  Haz clic en "Agregar servicio"
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-[1fr_64px_96px_80px_36px] gap-2 px-1">
                    {['DescripciÃ³n', 'Cant.', 'P. Unit.', 'Subtotal', ''].map((h, i) => (
                      <p key={i} className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{h}</p>
                    ))}
                  </div>
                  {form.items.map((item) => (
                    <div key={item.id} className="relative">
                      <div className="grid grid-cols-[1fr_64px_96px_80px_36px] gap-2 items-start">
                        <div className="relative">
                          <FInput value={item.description}
                            onChange={(e) => handleDescriptionChange(item.id, e.target.value)}
                            placeholder="Ej: Desarrollo Web..." className="text-xs py-2" />
                          {hintTarget === item.id && serviceHints.length > 0 && (
                            <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-lg overflow-hidden shadow-xl">
                              {serviceHints.map((h) => (
                                <button key={h} type="button" onClick={() => applyHint(item.id, h)}
                                  className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">{h}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <input type="number" min={0.1} step={0.1} value={item.quantity}
                          onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-2 text-xs text-white text-center focus:outline-none focus:ring-2 focus:ring-sky-500/50 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none" />
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 text-xs">{SYM[form.currency]}</span>
                          <input type="number" min={0} step={0.01} value={item.unitPrice}
                            onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-7 pr-2 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none" />
                        </div>
                        <div className="bg-slate-700/50 border border-slate-700 rounded-lg px-2 py-2 text-xs text-emerald-400 font-semibold text-right">
                          {SYM[form.currency]} {item.subtotal.toFixed(2)}
                        </div>
                        <button type="button" onClick={() => removeItem(item.id)}
                          className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* â‘£ DISCOUNT + TOTALS */}
            <section>
              <h3 className="text-white font-semibold text-sm mb-4 pb-2 border-b border-slate-800">Descuento y Totales</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <FieldLabel>Descuento</FieldLabel>
                  <div className="flex gap-2">
                    <div className="flex bg-slate-800 border border-slate-700 rounded-lg p-0.5 shrink-0">
                      {(['fixed', 'percentage'] as const).map((t) => (
                        <button key={t} type="button" onClick={() => setF('discountType', t)}
                          className={`px-3 py-2 rounded-md text-xs font-bold transition-all ${form.discountType === t ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                          {t === 'fixed' ? `${SYM[form.currency]} Monto` : '% Porcentaje'}
                        </button>
                      ))}
                    </div>
                    <div className="relative flex-1">
                      {form.discountType === 'fixed' && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">{SYM[form.currency]}</span>}
                      <FInput type="number" min={0} step={0.01} value={form.discountValue}
                        onChange={(e) => setF('discountValue', parseFloat(e.target.value) || 0)}
                        className={`[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none ${form.discountType === 'fixed' ? 'pl-8' : ''}`} />
                      {form.discountType === 'percentage' && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">%</span>}
                    </div>
                  </div>
                </div>

                {form.items.length > 0 && (
                  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Subtotal</span>
                      <span className="text-white">{SYM[form.currency]} {subtotal.toFixed(2)}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Descuento</span>
                        <span className="text-red-400">- {SYM[form.currency]} {discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="border-t border-slate-700 pt-2 flex justify-between text-sm font-semibold">
                      <span className="text-white">Total al Cliente</span>
                      <span className="text-white">{SYM[form.currency]} {total.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-slate-700 pt-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`relative w-9 h-5 rounded-full cursor-pointer transition-colors ${form.applyRetention ? 'bg-amber-500' : 'bg-slate-600'}`}
                            onClick={() => setF('applyRetention', !form.applyRetention)}>
                            <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${form.applyRetention ? 'translate-x-4' : ''}`} />
                          </div>
                          <span className="text-xs font-semibold text-slate-300">RetenciÃ³n IR ({form.retentionPct}%)</span>
                        </div>
                      </div>
                      {form.selectedClient && isCompanyRUC(form.selectedClient.documentType, form.selectedClient.documentNumber) && total > config.retentionThreshold && !form.applyRetention && (
                        <div className="flex items-center gap-2 text-[11px] text-amber-400">
                          <AlertCircle size={11} />Recomendado: la empresa pagadora debe retener
                        </div>
                      )}
                      {form.applyRetention && (
                        <>
                          <div className="flex justify-between text-sm">
                            <span className="text-amber-400">RetenciÃ³n ({form.retentionPct}%)</span>
                            <span className="text-amber-400">- {SYM[form.currency]} {retentionAmount.toFixed(2)}</span>
                          </div>
                          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-2 flex justify-between">
                            <span className="text-emerald-400 font-bold text-sm">Neto a Recibir</span>
                            <span className="text-emerald-400 font-bold text-sm">{SYM[form.currency]} {netToReceive.toFixed(2)}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* â‘¤ NOTES */}
            <section>
              <FieldLabel>Notas adicionales</FieldLabel>
              <textarea value={form.notes} onChange={(e) => setF('notes', e.target.value)} rows={4}
                placeholder="Incluye revisiones ilimitadas, soporte 15 dÃ­as post-entrega..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-colors resize-none" />
            </section>

            {/* Bottom save bar */}
            <div className="flex items-center justify-end gap-3 py-4 border-t border-slate-800">
              <button onClick={closePanel}
                className="px-5 py-2.5 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg text-sm font-semibold transition-colors">Cancelar</button>
              <button onClick={handleSave} disabled={saving || !form.clientId || form.items.length === 0}
                className="flex items-center gap-2 px-6 py-2.5 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white rounded-lg text-sm font-bold transition-colors">
                <Save size={15} />{mode === 'edit' ? 'Guardar Cambios' : 'Crear CotizaciÃ³n'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // â”€â”€ LIST VIEW â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  return (
    <div className="flex flex-col h-full">

      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div>
            <h2 className="text-white font-semibold text-lg flex items-center gap-2">
              <FileText size={20} className="text-sky-400" />
              Cotizaciones
            </h2>
            <p className="text-slate-400 text-sm mt-0.5">{filtered.length} {filtered.length === 1 ? 'cotizaciÃ³n' : 'cotizaciones'}</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            <Plus size={16} />
            Nueva CotizaciÃ³n
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 px-6 py-3 border-b border-slate-800">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar por nÃºmero o cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500"
            />
          </div>

          {/* Status filter */}
          <div className="flex bg-slate-800 rounded-lg p-0.5 gap-0.5 overflow-x-auto">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${filterStatus === 'all' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Todas
            </button>
            {ALL_STATUSES.map((s) => {
              const m = STATUS_META[s];
              return (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${filterStatus === s ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto">
          {paginated.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
              <FileText size={40} className="mb-3 opacity-30" />
              <p className="text-sm">
                {search || filterStatus !== 'all' ? 'No hay cotizaciones con ese filtro' : 'No hay cotizaciones aÃºn â€” '}
                {!search && filterStatus === 'all' && (
                  <button onClick={openCreate} className="text-sky-400 hover:underline">
                    crea la primera
                  </button>
                )}
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="sticky top-0 bg-slate-900 z-10">
                <tr className="border-b border-slate-800">
                  <th className="text-left px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">NÃºmero / Cliente</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Fecha</th>
                  <th className="text-right px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                  <th className="text-center px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                  <th className="text-right px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {paginated.map((q) => {
                  const client = clientStore.getById(q.clientId);
                  const isExpired = q.status === 'sent' && new Date(q.expiresAt) < new Date();
                  return (
                    <tr key={q.id} className="hover:bg-slate-800/30 transition-colors group">
                      <td className="px-6 py-3">
                        <p className="text-white font-semibold text-sm">{q.number}</p>
                        <p className="text-slate-400 text-xs mt-0.5">{client?.name ?? 'Cliente eliminado'}</p>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <p className="text-slate-300 text-sm">{formatDate(q.issueDate)}</p>
                        {isExpired && <p className="text-amber-400 text-xs mt-0.5">Vencida</p>}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <p className="text-white font-bold text-sm">{formatCurrency(q.total, q.currency)}</p>
                        {q.applyRetention && (
                          <p className="text-emerald-400 text-xs mt-0.5">Neto: {formatCurrency(q.netToReceive, q.currency)}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <StatusPill status={isExpired ? 'expired' : q.status} />
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {/* Download PDF */}
                          <button
                            onClick={() => handlePDF(q)}
                            disabled={genPdf === q.id}
                            className="p-1.5 text-slate-400 hover:text-sky-400 hover:bg-sky-400/10 rounded-lg transition-colors disabled:opacity-50"
                            title="Descargar PDF"
                          >
                            <Download size={14} className={genPdf === q.id ? 'animate-pulse' : ''} />
                          </button>
                          {/* Edit */}
                          <button
                            onClick={() => openEdit(q)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit2 size={14} />
                          </button>
                          {/* Next status */}
                          {q.status === 'draft' && (
                            <button
                              onClick={() => cycleStatus(q)}
                              className="p-1.5 text-slate-400 hover:text-sky-400 hover:bg-sky-400/10 rounded-lg transition-colors"
                              title="Marcar como Enviada"
                            >
                              <Send size={14} />
                            </button>
                          )}
                          {q.status === 'sent' && (
                            <button
                              onClick={() => cycleStatus(q)}
                              className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors"
                              title="Marcar como Aceptada"
                            >
                              <FileCheck2 size={14} />
                            </button>
                          )}
                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(q)}
                            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 size={14} />
                          </button>
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
            <p className="text-slate-400 text-xs">
              {((page - 1) * PAGE_SIZE) + 1}â€“{Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1} className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 hover:bg-slate-800 rounded-lg transition-colors"><ChevronLeft size={16} /></button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)} className={`w-7 h-7 text-xs rounded-lg font-semibold ${p === page ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>{p}</button>
              ))}
              <button onClick={() => setPage((p) => Math.min(p + 1, totalPages))} disabled={page === totalPages} className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 hover:bg-slate-800 rounded-lg transition-colors"><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
