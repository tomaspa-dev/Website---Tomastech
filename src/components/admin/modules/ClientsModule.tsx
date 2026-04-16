/**
 * ClientsModule.tsx — Panel Admin v2 (Full-width layout)
 *
 * Layout:
 *  - Lista de clientes (ancho completo)
 *  - Al crear/editar: el área de contenido se convierte en formulario de ancho completo
 *    con auto-guardado, botones Cancelar/Guardar y X para cerrar.
 */

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  Users, Plus, Search, Edit2, Trash2, CheckCircle, XCircle,
  Mail, Phone, MapPin, Building2, User, AlertCircle, X,
  ChevronLeft, ChevronRight, Download, Save, Check, Clock,
} from 'lucide-react';
import {
  clientStore,
  type Client,
  type DocumentType,
} from '../../../lib/admin-store';

// ── VALIDATION ────────────────────────────────────────────────

const DOC_TYPES: { value: DocumentType; label: string; max: number }[] = [
  { value: 'DNI',       label: 'DNI',       max: 8  },
  { value: 'RUC',       label: 'RUC',       max: 11 },
  { value: 'PASAPORTE', label: 'Pasaporte', max: 20 },
  { value: 'CE',        label: 'C. Ext.',   max: 12 },
];

function validateDoc(type: DocumentType, number: string): string | null {
  if (!number) return 'El número de documento es requerido';
  if (type === 'DNI' && (number.length !== 8 || !/^\d+$/.test(number)))
    return 'DNI: exactamente 8 dígitos numéricos';
  if (type === 'RUC') {
    if (number.length !== 11 || !/^\d+$/.test(number)) return 'RUC: exactamente 11 dígitos numéricos';
    if (!['10', '20'].includes(number.substring(0, 2)))
      return 'RUC debe empezar con 10 (persona natural) o 20 (empresa)';
  }
  return null;
}

// ── FORM DATA ────────────────────────────────────────────────

type FormData = Omit<Client, 'id' | 'createdAt' | 'updatedAt'>;

const EMPTY_FORM = (): FormData => ({
  name: '', documentType: 'DNI', documentNumber: '',
  email: '', phone: '', country: 'PE',
  address: '', notes: '', status: 'active',
});

type ClientStatus = 'active' | 'suspended';

// ── COUNTRY PREFIX ────────────────────────────────────────────

const COUNTRIES = [
  { code: 'PE', flag: '🇵🇪', prefix: '+51' },
  { code: 'US', flag: '🇺🇸', prefix: '+1'  },
  { code: 'MX', flag: '🇲🇽', prefix: '+52' },
  { code: 'CO', flag: '🇨🇴', prefix: '+57' },
  { code: 'AR', flag: '🇦🇷', prefix: '+54' },
  { code: 'CL', flag: '🇨🇱', prefix: '+56' },
  { code: 'ES', flag: '🇪🇸', prefix: '+34' },
];

// ── MICRO COMPONENTS ──────────────────────────────────────────

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
      {children}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  );
}

function FInput({ error, className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) {
  return (
    <input
      className={`w-full bg-slate-800 border rounded-lg px-3 py-2.5 text-sm text-white
        placeholder-slate-500 focus:outline-none focus:ring-2 transition-colors
        ${error
          ? 'border-red-500 focus:ring-red-500/30'
          : 'border-slate-700 focus:ring-emerald-500/40 focus:border-emerald-500'
        } ${className}`}
      {...props}
    />
  );
}

function StatusBadge({ status }: { status: ClientStatus }) {
  return status === 'active' ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium">
      <CheckCircle size={10} />Activo
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-700 text-slate-400 text-xs font-medium">
      <XCircle size={10} />Suspendido
    </span>
  );
}

function DocBadge({ type, number }: { type: DocumentType; number: string }) {
  if (type === 'RUC' && number.startsWith('20'))
    return <span className="text-sky-400 text-[10px] flex items-center gap-1"><Building2 size={9} />Empresa</span>;
  if (type === 'RUC' && number.startsWith('10'))
    return <span className="text-violet-400 text-[10px] flex items-center gap-1"><User size={9} />Persona c/ RUC</span>;
  return null;
}

// ── AUTOSAVE INDICATOR ────────────────────────────────────────

type AutoSaveState = 'idle' | 'pending' | 'saved';

function AutoSaveIndicator({ state }: { state: AutoSaveState }) {
  if (state === 'idle') return null;
  return (
    <span className={`flex items-center gap-1 text-[11px] font-medium transition-all ${
      state === 'saved' ? 'text-emerald-400' : 'text-slate-400'
    }`}>
      {state === 'saved'
        ? <><Check size={11} />Auto-guardado</>
        : <><Clock size={11} className="animate-pulse" />Guardando…</>
      }
    </span>
  );
}

const PAGE_SIZE = 10;

// ══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════

export function ClientsModule() {
  const [clients, setClients]       = useState<Client[]>([]);
  const [search, setSearch]         = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'suspended'>('active');
  const [page, setPage]             = useState(1);

  // Form mode
  const [mode, setMode] = useState<'list' | 'create' | 'edit'>('list');
  const [editing, setEditing]       = useState<Client | null>(null);
  const [form, setForm]             = useState<FormData>(EMPTY_FORM());
  const [docError, setDocError]     = useState<string | null>(null);
  const [saveState, setSaveState]   = useState<AutoSaveState>('idle');
  const autoSaveTimer               = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);

  const firstInputRef = useRef<HTMLInputElement>(null);

  const reload = () => setClients(clientStore.getAll());
  useEffect(() => { reload(); }, []);

  // Focus first field when form opens
  useEffect(() => {
    if (mode !== 'list') setTimeout(() => firstInputRef.current?.focus(), 80);
  }, [mode]);

  // ── Filtered / paginated ────────────────────────────────────
  const filtered = useMemo(() =>
    clients.filter((c) => {
      const matchSearch = !search ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.documentNumber.includes(search) ||
        c.email.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === 'all' ||
        (filterStatus === 'active' && c.status === 'active') ||
        (filterStatus === 'suspended' && c.status === 'suspended');
      return matchSearch && matchStatus;
    }),
  [clients, search, filterStatus]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  useEffect(() => { setPage(1); }, [search, filterStatus]);

  // ── Form helpers ────────────────────────────────────────────
  const setField = <K extends keyof FormData>(k: K, v: FormData[K]) => {
    const updated = { ...form, [k]: v };
    setForm(updated);
    if (k === 'documentNumber' || k === 'documentType') {
      const err = validateDoc(
        k === 'documentType' ? (v as DocumentType) : form.documentType,
        k === 'documentNumber' ? (v as string) : form.documentNumber,
      );
      setDocError(err);
    }
    scheduleAutoSave(updated);
  };

  const setDocType = (type: DocumentType) => {
    const updated = { ...form, documentType: type, documentNumber: '' };
    setForm(updated);
    setDocError(null);
  };

  const limitDoc = (type: DocumentType, val: string): string => {
    const def = DOC_TYPES.find((d) => d.value === type);
    if (!def) return val;
    if (type === 'DNI' || type === 'RUC') return val.replace(/\D/g, '').slice(0, def.max);
    return val.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, def.max);
  };

  // ── Auto-save (draft to localStorage) ─────────────────────
  const scheduleAutoSave = useCallback((data: FormData) => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    setSaveState('pending');
    autoSaveTimer.current = setTimeout(() => {
      localStorage.setItem('tt_client_draft', JSON.stringify(data));
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 2500);
    }, 1200);
  }, []);

  // ── Open form ───────────────────────────────────────────────
  const openCreate = () => {
    const draft = localStorage.getItem('tt_client_draft');
    const initial = draft ? { ...EMPTY_FORM(), ...JSON.parse(draft) } : EMPTY_FORM();
    setEditing(null);
    setForm(initial);
    setDocError(null);
    setSaveState('idle');
    setMode('create');
  };

  const openEdit = (client: Client) => {
    localStorage.removeItem('tt_client_draft');
    setEditing(client);
    setForm({
      name: client.name, documentType: client.documentType,
      documentNumber: client.documentNumber, email: client.email,
      phone: client.phone, country: client.country,
      address: client.address, notes: client.notes, status: client.status,
    });
    setDocError(null);
    setSaveState('idle');
    setMode('edit');
  };

  const closeForm = () => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    setMode('list');
    setEditing(null);
  };

  // ── Save ────────────────────────────────────────────────────
  const handleSave = () => {
    if (!form.name.trim()) { firstInputRef.current?.focus(); return; }
    const err = validateDoc(form.documentType, form.documentNumber);
    if (err) { setDocError(err); return; }

    if (editing) {
      clientStore.update(editing.id, form);
    } else {
      clientStore.create(form);
    }
    localStorage.removeItem('tt_client_draft');
    reload();
    closeForm();
  };

  // ── Delete ──────────────────────────────────────────────────
  const handleDelete = () => {
    if (!deleteTarget) return;
    clientStore.delete(deleteTarget.id);
    reload();
    setDeleteTarget(null);
  };

  const toggleStatus = (client: Client) => {
    const next: ClientStatus = client.status === 'active' ? 'suspended' : 'active';
    clientStore.update(client.id, { status: next });
    reload();
  };

  // ── Export CSV ──────────────────────────────────────────────
  const exportCSV = () => {
    const rows = [
      ['Nombre', 'Tipo Doc', 'Número Doc', 'Email', 'Teléfono', 'País', 'Dirección', 'Estado'],
      ...filtered.map((c) => [c.name, c.documentType, c.documentNumber, c.email, c.phone, c.country, c.address, c.status]),
    ];
    const csv  = rows.map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `Clientes_Tomastech_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ──────────────────────────────────────────────────────────
  // FORM VIEW (full-width)
  // ──────────────────────────────────────────────────────────
  if (mode === 'create' || mode === 'edit') {
    const isEdit = mode === 'edit';
    const country = COUNTRIES.find((c) => c.code === form.country) ?? COUNTRIES[0];

    return (
      <div className="flex flex-col h-full bg-slate-950">

        {/* ── Form header ───────────────────────────────────── */}
        <div className="shrink-0 flex items-center gap-4 px-8 py-4 bg-slate-900 border-b border-slate-800">
          {/* Title */}
          <div>
            <h2 className="text-white font-bold text-lg">
              {isEdit ? `Editar: ${editing?.name}` : 'Nuevo Cliente'}
            </h2>
            <p className="text-slate-400 text-xs mt-0.5">
              {isEdit ? 'Modifica los datos del cliente' : 'Completa los datos para registrar el cliente'}
            </p>
          </div>

          {/* Auto-save */}
          <div className="flex-1 flex justify-center">
            <AutoSaveIndicator state={saveState} />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={closeForm}
              className="px-4 py-2 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg text-sm font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={!!docError || !form.name.trim() || !form.documentNumber}
              className="flex items-center gap-2 px-5 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold transition-colors"
            >
              <Save size={15} />
              {isEdit ? 'Guardar Cambios' : 'Crear Cliente'}
            </button>
            <button
              onClick={closeForm}
              className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Cerrar"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── Form body ─────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-8 py-8 space-y-8">

            {/* ── Sección 1: Identidad ──────────────────────── */}
            <section>
              <h3 className="text-white font-semibold text-sm mb-4 pb-2 border-b border-slate-800 flex items-center gap-2">
                <User size={15} className="text-emerald-400" />
                Datos de Identidad
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Nombre */}
                <div className="md:col-span-2">
                  <Label required>Nombre / Razón Social</Label>
                  <FInput
                    ref={firstInputRef}
                    value={form.name}
                    onChange={(e) => setField('name', e.target.value)}
                    placeholder="Ej: Empresa ABC SAC  /  Juan Pérez García"
                    required
                  />
                </div>

                {/* Tipo de documento */}
                <div>
                  <Label required>Tipo de Documento</Label>
                  <div className="flex bg-slate-800 border border-slate-700 rounded-lg p-0.5 gap-0.5">
                    {DOC_TYPES.map((dt) => (
                      <button
                        key={dt.value}
                        type="button"
                        onClick={() => setDocType(dt.value)}
                        className={`flex-1 py-2.5 rounded-md text-xs font-bold transition-all ${
                          form.documentType === dt.value
                            ? 'bg-emerald-500 text-white shadow-sm'
                            : 'text-slate-400 hover:text-white hover:bg-slate-700'
                        }`}
                      >
                        {dt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Número de documento */}
                <div>
                  <Label required>Número de Documento</Label>
                  <FInput
                    value={form.documentNumber}
                    onChange={(e) => setField('documentNumber', limitDoc(form.documentType, e.target.value))}
                    placeholder={
                      form.documentType === 'DNI' ? '12345678' :
                      form.documentType === 'RUC' ? '20123456789' :
                      form.documentType === 'CE'  ? 'CE123456' : 'AA123456'
                    }
                    error={!!docError}
                  />
                  {docError
                    ? <p className="mt-1.5 text-[11px] text-red-400 flex items-center gap-1"><AlertCircle size={10} />{docError}</p>
                    : form.documentType === 'RUC' && form.documentNumber.length === 11 && (
                        <p className="mt-1.5 text-[11px] text-slate-500">
                          {form.documentNumber.startsWith('20') ? '🏢 Empresa — retención IR aplica al facturar.' :
                           form.documentNumber.startsWith('10') ? '👤 Persona Natural con RUC.' : ''}
                        </p>
                      )
                  }
                </div>
              </div>
            </section>

            {/* ── Sección 2: Contacto ───────────────────────── */}
            <section>
              <h3 className="text-white font-semibold text-sm mb-4 pb-2 border-b border-slate-800 flex items-center gap-2">
                <Phone size={15} className="text-emerald-400" />
                Información de Contacto
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Email */}
                <div>
                  <Label>Email</Label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    <FInput
                      type="email"
                      value={form.email}
                      onChange={(e) => setField('email', e.target.value)}
                      placeholder="correo@empresa.com"
                      className="pl-9"
                    />
                  </div>
                </div>

                {/* Teléfono — país compacto + número amplio */}
                <div>
                  <Label>Teléfono / WhatsApp</Label>
                  <div className="flex gap-2">
                    {/* Country selector — compacto */}
                    <div className="relative shrink-0">
                      <select
                        value={form.country}
                        onChange={(e) => setField('country', e.target.value)}
                        className="appearance-none bg-slate-800 border border-slate-700 rounded-lg pl-3 pr-7 py-2.5 text-sm text-white
                          focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 cursor-pointer w-[90px]"
                      >
                        {COUNTRIES.map((c) => (
                          <option key={c.code} value={c.code}>{c.flag} {c.prefix}</option>
                        ))}
                      </select>
                      {/* dropdown arrow */}
                      <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-500">
                        <svg width="10" height="6" viewBox="0 0 10 6"><path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>
                      </div>
                    </div>
                    {/* Number — takes all remaining space */}
                    <div className="relative flex-1">
                      <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                      <FInput
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setField('phone', e.target.value.replace(/[^0-9+\s()-]/g, '').slice(0, 15))}
                        placeholder="999 999 999"
                        className="pl-8"
                      />
                    </div>
                  </div>
                </div>

                {/* Dirección */}
                <div className="md:col-span-2">
                  <Label>Dirección</Label>
                  <div className="relative">
                    <MapPin size={15} className="absolute left-3 top-3 text-slate-500 pointer-events-none" />
                    <textarea
                      value={form.address}
                      onChange={(e) => setField('address', e.target.value)}
                      placeholder="Av. Principal 123, Miraflores, Lima, Perú"
                      rows={2}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white
                        placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500
                        transition-colors resize-none"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* ── Sección 3: Notas + Estado ─────────────────── */}
            <section>
              <h3 className="text-white font-semibold text-sm mb-4 pb-2 border-b border-slate-800 flex items-center gap-2">
                <AlertCircle size={15} className="text-emerald-400" />
                Detalles Adicionales
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Notas */}
                <div className="md:col-span-2">
                  <Label>Notas Internas</Label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setField('notes', e.target.value)}
                    placeholder="Ej: Contacto principal es el Gerente de TI. Prefiere comunicación por WhatsApp..."
                    rows={4}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white
                      placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500
                      transition-colors resize-none"
                  />
                </div>

                {/* Estado */}
                <div>
                  <Label>Estado del Cliente</Label>
                  <div className="space-y-2">
                    {(['active', 'suspended'] as const).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setField('status', s)}
                        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 text-left transition-all ${
                          form.status === s
                            ? s === 'active'
                              ? 'border-emerald-500 bg-emerald-500/10'
                              : 'border-slate-500 bg-slate-700/50'
                            : 'border-slate-700 hover:border-slate-600'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          form.status === s
                            ? s === 'active' ? 'border-emerald-500 bg-emerald-500' : 'border-slate-400 bg-slate-400'
                            : 'border-slate-600'
                        }`}>
                          {form.status === s && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                        <div>
                          <p className={`text-sm font-semibold ${form.status === s ? 'text-white' : 'text-slate-400'}`}>
                            {s === 'active' ? 'Activo' : 'Suspendido'}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {s === 'active' ? 'Visible en búsquedas y cotizaciones' : 'No aparece en búsquedas'}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* ── Save bottom ───────────────────────────────── */}
            <div className="flex items-center justify-between py-4 border-t border-slate-800">
              <AutoSaveIndicator state={saveState} />
              <div className="flex gap-3">
                <button
                  onClick={closeForm}
                  className="px-5 py-2.5 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg text-sm font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={!!docError || !form.name.trim() || !form.documentNumber}
                  className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-bold transition-colors"
                >
                  <Save size={15} />
                  {isEdit ? 'Guardar Cambios' : 'Crear Cliente'}
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────
  // LIST VIEW
  // ──────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
        <div>
          <h2 className="text-white font-semibold text-lg flex items-center gap-2">
            <Users size={20} className="text-emerald-400" />
            Clientes
          </h2>
          <p className="text-slate-400 text-sm mt-0.5">
            {filtered.length} {filtered.length === 1 ? 'cliente' : 'clientes'}
            {filterStatus !== 'all' ? ` ${filterStatus === 'active' ? 'activos' : 'suspendidos'}` : ''}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg text-sm font-semibold transition-colors"
        >
          <Plus size={16} />
          Nuevo Cliente
        </button>
      </div>

      {/* Toolbar */}
      <div className="shrink-0 flex flex-wrap items-center gap-3 px-6 py-3 border-b border-slate-800">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por nombre, documento o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-8 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white p-1">
              <X size={13} />
            </button>
          )}
        </div>

        <div className="flex bg-slate-800 rounded-lg p-0.5 gap-0.5">
          {(['all', 'active', 'suspended'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                filterStatus === s ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {s === 'all' ? 'Todos' : s === 'active' ? 'Activos' : 'Suspendidos'}
            </button>
          ))}
        </div>

        <button
          onClick={exportCSV}
          className="flex items-center gap-1.5 px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg text-xs font-semibold transition-colors"
        >
          <Download size={14} />
          Exportar CSV
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto">
        {paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-500">
            <Users size={44} className="mb-3 opacity-20" />
            <p className="text-sm mb-2">
              {search || filterStatus !== 'all' ? 'No se encontraron clientes con ese filtro' : 'No hay clientes aún'}
            </p>
            {!search && filterStatus === 'all' && (
              <button onClick={openCreate} className="text-sm text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-2">
                Crear el primer cliente →
              </button>
            )}
          </div>
        ) : (
          <table className="w-full">
            <thead className="sticky top-0 bg-slate-900 z-10">
              <tr className="border-b border-slate-800">
                <th className="text-left px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Cliente</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Documento</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Contacto</th>
                <th className="text-center px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                <th className="text-right px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {paginated.map((client) => (
                <tr key={client.id} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm shrink-0">
                        {client.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white font-medium text-sm truncate">{client.name}</p>
                        {client.address && (
                          <p className="text-slate-500 text-[11px] flex items-center gap-1 truncate mt-0.5">
                            <MapPin size={9} />{client.address}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <p className="text-slate-300 text-sm font-mono">{client.documentType}: {client.documentNumber}</p>
                    <div className="text-[10px] mt-0.5">
                      <DocBadge type={client.documentType} number={client.documentNumber} />
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="space-y-0.5">
                      {client.email && (
                        <p className="text-slate-400 text-xs flex items-center gap-1.5">
                          <Mail size={11} className="shrink-0" />{client.email}
                        </p>
                      )}
                      {client.phone && (
                        <p className="text-slate-400 text-xs flex items-center gap-1.5">
                          <Phone size={11} className="shrink-0" />{client.phone}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge status={client.status} />
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(client)} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors" title="Editar">
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => toggleStatus(client)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          client.status === 'active'
                            ? 'text-slate-400 hover:text-amber-400 hover:bg-amber-400/10'
                            : 'text-slate-400 hover:text-emerald-400 hover:bg-emerald-400/10'
                        }`}
                        title={client.status === 'active' ? 'Suspender' : 'Activar'}
                      >
                        {client.status === 'active' ? <XCircle size={14} /> : <CheckCircle size={14} />}
                      </button>
                      <button onClick={() => setDeleteTarget(client)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" title="Eliminar">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="shrink-0 flex items-center justify-between px-6 py-3 border-t border-slate-800">
          <p className="text-slate-400 text-xs">
            {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1} className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 hover:bg-slate-800 rounded-lg transition-colors">
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)} className={`w-7 h-7 text-xs rounded-lg font-semibold ${p === page ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>{p}</button>
            ))}
            <button onClick={() => setPage((p) => Math.min(p + 1, totalPages))} disabled={page === totalPages} className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 hover:bg-slate-800 rounded-lg transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Delete modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <Trash2 size={20} className="text-red-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Eliminar cliente</h3>
                <p className="text-slate-400 text-sm">Esta acción no se puede deshacer</p>
              </div>
            </div>
            <p className="text-slate-300 text-sm mb-6">
              ¿Estás seguro de eliminar a <strong className="text-white">{deleteTarget.name}</strong>?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg text-sm font-semibold transition-colors">
                Cancelar
              </button>
              <button onClick={handleDelete} className="flex-1 py-2.5 bg-red-500 hover:bg-red-400 text-white rounded-lg text-sm font-semibold transition-colors">
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
