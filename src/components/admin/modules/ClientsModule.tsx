/**
 * ClientsModule.tsx — Panel Admin v2
 * Gestión completa de clientes para freelancer peruano.
 * 
 * Tipos de documento: DNI (8 dígitos), RUC (11 dígitos), PASAPORTE, CE
 * Auto-validación de documento según tipo.
 * Búsqueda instantánea por nombre, documento o email.
 * Panel lateral para crear/editar (no modal flotante pequeño).
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Users, Plus, Search, Edit2, Trash2, CheckCircle, XCircle,
  Mail, Phone, MapPin, Building2, User, AlertCircle, X,
  ChevronLeft, ChevronRight, Download,
} from 'lucide-react';
import {
  clientStore,
  type Client,
  type DocumentType,
} from '../../../lib/admin-store';

// ── DOCUMENT VALIDATION ──────────────────────────────────────

const DOC_TYPES: { value: DocumentType; label: string; max: number; pattern: string }[] = [
  { value: 'DNI',       label: 'DNI',       max: 8,  pattern: '^[0-9]{8}$' },
  { value: 'RUC',       label: 'RUC',       max: 11, pattern: '^[0-9]{11}$' },
  { value: 'PASAPORTE', label: 'Pasaporte', max: 20, pattern: '^[A-Z0-9]{6,20}$' },
  { value: 'CE',        label: 'C. Extranjería', max: 12, pattern: '^[A-Z0-9]{6,12}$' },
];

function validateDoc(type: DocumentType, number: string): string | null {
  if (!number) return 'El número de documento es requerido';
  const def = DOC_TYPES.find((d) => d.value === type);
  if (!def) return null;
  if (type === 'DNI' && (number.length !== 8 || !/^\d+$/.test(number))) {
    return 'El DNI debe tener exactamente 8 dígitos numéricos';
  }
  if (type === 'RUC') {
    if (number.length !== 11 || !/^\d+$/.test(number)) return 'El RUC debe tener exactamente 11 dígitos';
    if (!['10', '20'].includes(number.substring(0, 2))) return 'El RUC debe empezar con 10 (persona natural) o 20 (empresa)';
  }
  return null;
}

// ── FORM DATA ────────────────────────────────────────────────

type FormData = Omit<Client, 'id' | 'createdAt' | 'updatedAt'>;

const emptyForm = (): FormData => ({
  name: '',
  documentType: 'DNI',
  documentNumber: '',
  email: '',
  phone: '',
  country: 'PE',
  address: '',
  notes: '',
  status: 'active',
});

// ── PAGINATION ───────────────────────────────────────────────

const PAGE_SIZE = 10;

// ── STATUS BADGE ─────────────────────────────────────────────

function StatusBadge({ status }: { status: ClientStatus }) {
  return status === 'active' ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium">
      <CheckCircle size={10} />
      Activo
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-700 text-slate-400 text-xs font-medium">
      <XCircle size={10} />
      Suspendido
    </span>
  );
}

// ── RUC BADGE (empresa o persona natural) ────────────────────

function DocBadge({ type, number }: { type: DocumentType; number: string }) {
  if (type === 'RUC' && number.startsWith('20')) {
    return (
      <span className="inline-flex items-center gap-1 text-sky-400">
        <Building2 size={10} />
        Empresa
      </span>
    );
  }
  if (type === 'RUC' && number.startsWith('10')) {
    return (
      <span className="inline-flex items-center gap-1 text-violet-400">
        <User size={10} />
        Persona c/ RUC
      </span>
    );
  }
  return null;
}

type ClientStatus = 'active' | 'suspended';

// ── FIELD INPUT ──────────────────────────────────────────────

function Field({ label, required, error, children }: {
  label: string;
  required?: boolean;
  error?: string | null;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-[11px] text-red-400">
          <AlertCircle size={10} />{error}
        </p>
      )}
    </div>
  );
}

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className = '', ...props }, ref) {
    return (
      <input
        ref={ref}
        className={`w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white
          placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500
          transition-colors ${className}`}
        {...props}
      />
    );
  }
);

function Select({ className = '', children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white
        focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500
        transition-colors appearance-none cursor-pointer ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

// ── MAIN COMPONENT ───────────────────────────────────────────

export function ClientsModule() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'suspended'>('active');
  const [page, setPage] = useState(1);

  // Side panel state
  const [panelOpen, setPanelOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm());
  const [docError, setDocError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);

  const firstInputRef = useRef<HTMLInputElement>(null);

  // Load
  const reload = () => setClients(clientStore.getAll());
  useEffect(() => { reload(); }, []);

  // Focus first input when panel opens
  useEffect(() => {
    if (panelOpen) setTimeout(() => firstInputRef.current?.focus(), 50);
  }, [panelOpen]);

  // ── Filtered / paginated ────────────────────────────────

  const filtered = useMemo(() => {
    return clients.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.documentNumber.includes(search) ||
        c.email.toLowerCase().includes(search.toLowerCase());
      const matchStatus =
        filterStatus === 'all' ||
        (filterStatus === 'active' && c.status === 'active') ||
        (filterStatus === 'suspended' && c.status === 'suspended');
      return matchSearch && matchStatus;
    });
  }, [clients, search, filterStatus]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [search, filterStatus]);

  // ── Panel actions ────────────────────────────────────────

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setDocError(null);
    setPanelOpen(true);
  };

  const openEdit = (client: Client) => {
    setEditing(client);
    setForm({
      name: client.name,
      documentType: client.documentType,
      documentNumber: client.documentNumber,
      email: client.email,
      phone: client.phone,
      country: client.country,
      address: client.address,
      notes: client.notes,
      status: client.status,
    });
    setDocError(null);
    setPanelOpen(true);
  };

  const closePanel = () => setPanelOpen(false);

  // ── Form change ─────────────────────────────────────────

  const set = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === 'documentNumber' || field === 'documentType') {
      const type = field === 'documentType' ? (value as DocumentType) : form.documentType;
      const num  = field === 'documentNumber' ? value : form.documentNumber;
      setDocError(validateDoc(type, num));
    }
  };

  const setDocType = (type: DocumentType) => {
    setForm((prev) => ({ ...prev, documentType: type, documentNumber: '' }));
    setDocError(null);
  };

  const limitDocNum = (type: DocumentType, value: string): string => {
    const def = DOC_TYPES.find((d) => d.value === type);
    if (!def) return value;
    if (type === 'DNI' || type === 'RUC') return value.replace(/\D/g, '').slice(0, def.max);
    return value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, def.max);
  };

  // ── Save ────────────────────────────────────────────────

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateDoc(form.documentType, form.documentNumber);
    if (err) { setDocError(err); return; }
    if (!form.name.trim()) return;

    setSaving(true);
    try {
      if (editing) {
        clientStore.update(editing.id, form);
      } else {
        clientStore.create(form);
      }
      reload();
      closePanel();
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ──────────────────────────────────────────────

  const confirmDelete = (client: Client) => setDeleteTarget(client);
  const handleDelete = () => {
    if (!deleteTarget) return;
    clientStore.delete(deleteTarget.id);
    reload();
    setDeleteTarget(null);
  };

  // ── Toggle status ───────────────────────────────────────

  const toggleStatus = (client: Client) => {
    const next: ClientStatus = client.status === 'active' ? 'suspended' : 'active';
    clientStore.update(client.id, { status: next });
    reload();
  };

  // ── Export CSV ──────────────────────────────────────────

  const exportCSV = () => {
    const rows = [
      ['Nombre', 'Tipo Doc', 'Número Doc', 'Email', 'Teléfono', 'País', 'Dirección', 'Estado'],
      ...filtered.map((c) => [
        c.name, c.documentType, c.documentNumber,
        c.email, c.phone, c.country, c.address, c.status,
      ]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const ts = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `Clientes_Tomastech_${ts}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── RENDER ──────────────────────────────────────────────

  return (
    <div className="flex h-full relative">

      {/* ── Main list panel ────────────────────────────── */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${panelOpen ? 'mr-[440px]' : ''}`}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
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
        <div className="flex flex-wrap items-center gap-3 px-6 py-3 border-b border-slate-800">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar por nombre, documento o email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Status filter */}
          <div className="flex bg-slate-800 rounded-lg p-0.5 gap-0.5">
            {(['all', 'active', 'suspended'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={[
                  'px-3 py-1.5 rounded-md text-xs font-semibold transition-all',
                  filterStatus === s
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:text-white',
                ].join(' ')}
              >
                {s === 'all' ? 'Todos' : s === 'active' ? 'Activos' : 'Suspendidos'}
              </button>
            ))}
          </div>

          {/* Export */}
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
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
              <Users size={40} className="mb-3 opacity-30" />
              <p className="text-sm">
                {search ? 'No se encontraron clientes' : 'No hay clientes aún — '}
                {!search && (
                  <button onClick={openCreate} className="text-emerald-400 hover:underline">
                    Crea el primero
                  </button>
                )}
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="sticky top-0 bg-slate-900 z-10">
                <tr className="border-b border-slate-800">
                  <th className="text-left px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Cliente</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Documento</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Contacto</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">País</th>
                  <th className="text-center px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                  <th className="text-right px-6 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {paginated.map((client) => (
                  <tr
                    key={client.id}
                    className="hover:bg-slate-800/30 transition-colors group"
                  >
                    {/* Name + address */}
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm shrink-0">
                          {client.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-white font-medium text-sm truncate">{client.name}</p>
                          {client.address && (
                            <p className="text-slate-500 text-[11px] flex items-center gap-1 truncate mt-0.5">
                              <MapPin size={9} />
                              {client.address}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Document */}
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <div>
                        <p className="text-slate-300 text-sm font-mono">
                          {client.documentType}: {client.documentNumber}
                        </p>
                        <div className="text-[10px] mt-0.5">
                          <DocBadge type={client.documentType} number={client.documentNumber} />
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="space-y-0.5">
                        {client.email && (
                          <p className="text-slate-400 text-xs flex items-center gap-1.5">
                            <Mail size={11} className="shrink-0" />
                            {client.email}
                          </p>
                        )}
                        {client.phone && (
                          <p className="text-slate-400 text-xs flex items-center gap-1.5">
                            <Phone size={11} className="shrink-0" />
                            {client.phone}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Country */}
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-slate-400 text-sm">{client.country}</span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={client.status} />
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEdit(client)}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                          title="Editar"
                        >
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
                        <button
                          onClick={() => confirmDelete(client)}
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                          title="Eliminar"
                        >
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
          <div className="shrink-0 flex items-center justify-between px-6 py-3 border-t border-slate-800 bg-slate-900/30">
            <p className="text-slate-400 text-xs">
              Mostrando {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 rounded-lg transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .map((p, i, arr) => (
                  <React.Fragment key={p}>
                    {i > 0 && arr[i - 1] !== p - 1 && (
                      <span className="text-slate-600 px-1">…</span>
                    )}
                    <button
                      onClick={() => setPage(p)}
                      className={[
                        'w-8 h-8 text-xs rounded-lg font-semibold transition-colors',
                        p === page
                          ? 'bg-emerald-500 text-white'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800',
                      ].join(' ')}
                    >
                      {p}
                    </button>
                  </React.Fragment>
                ))}
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 rounded-lg transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── RIGHT SIDE PANEL (Create/Edit) ─────────────────── */}
      <div
        className={[
          'fixed right-0 top-0 bottom-0 w-[440px] bg-slate-900 border-l border-slate-800',
          'flex flex-col z-30 transition-transform duration-300 ease-in-out',
          panelOpen ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
        style={{ top: '56px' }} /* Below header */
      >
        {/* Panel header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0">
          <h3 className="text-white font-semibold">
            {editing ? 'Editar Cliente' : 'Nuevo Cliente'}
          </h3>
          <button
            onClick={closePanel}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Panel form — scrollable */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto">
          <div className="px-6 py-5 space-y-5">

            {/* Name */}
            <Field label="Nombre / Razón Social" required>
              <Input
                ref={firstInputRef}
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="Ej: Empresa ABC SAC / Juan Pérez García"
                required
              />
            </Field>

            {/* Document type + number */}
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Documento de Identidad <span className="text-red-400">*</span>
              </label>
              <div className="flex gap-2">
                {/* Type selector — only 4 options, no huge dropdown */}
                <div className="flex bg-slate-800 border border-slate-700 rounded-lg p-0.5 gap-0.5 shrink-0">
                  {DOC_TYPES.map((dt) => (
                    <button
                      key={dt.value}
                      type="button"
                      onClick={() => setDocType(dt.value)}
                      className={[
                        'px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all',
                        form.documentType === dt.value
                          ? 'bg-emerald-500 text-white'
                          : 'text-slate-400 hover:text-white',
                      ].join(' ')}
                    >
                      {dt.label}
                    </button>
                  ))}
                </div>
                {/* Number */}
                <Input
                  value={form.documentNumber}
                  onChange={(e) => {
                    const v = limitDocNum(form.documentType, e.target.value);
                    set('documentNumber', v);
                  }}
                  placeholder={
                    form.documentType === 'DNI' ? '12345678' :
                    form.documentType === 'RUC' ? '20123456789' :
                    form.documentType === 'CE' ? 'CE123456' : 'AA123456'
                  }
                  className={docError ? 'border-red-500 focus:ring-red-500/50' : ''}
                />
              </div>
              {docError && (
                <p className="flex items-center gap-1 text-[11px] text-red-400 mt-1">
                  <AlertCircle size={10} />{docError}
                </p>
              )}
              {/* RUC hint */}
              {form.documentType === 'RUC' && form.documentNumber.length === 11 && !docError && (
                <p className="text-[11px] text-slate-500 mt-1">
                  {form.documentNumber.startsWith('20') ? '🏢 Empresa — aplica retención IR al realizar recibos' :
                   form.documentNumber.startsWith('10') ? '👤 Persona Natural con RUC' : ''}
                </p>
              )}
            </div>

            {/* Email */}
            <Field label="Email">
              <Input
                type="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="correo@empresa.com"
              />
            </Field>

            {/* Phone */}
            <Field label="Teléfono / WhatsApp">
              <div className="flex gap-2">
                <Select
                  value={form.country}
                  onChange={(e) => set('country', e.target.value)}
                  className="w-24 shrink-0"
                >
                  <option value="PE">🇵🇪 +51</option>
                  <option value="US">🇺🇸 +1</option>
                  <option value="MX">🇲🇽 +52</option>
                  <option value="CO">🇨🇴 +57</option>
                  <option value="AR">🇦🇷 +54</option>
                  <option value="CL">🇨🇱 +56</option>
                  <option value="ES">🇪🇸 +34</option>
                </Select>
                <Input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => set('phone', e.target.value.replace(/[^0-9+\s()-]/g, '').slice(0, 15))}
                  placeholder="999 999 999"
                />
              </div>
            </Field>

            {/* Address */}
            <Field label="Dirección">
              <textarea
                value={form.address}
                onChange={(e) => set('address', e.target.value)}
                placeholder="Av. Principal 123, Miraflores, Lima"
                rows={2}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white
                  placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500
                  transition-colors resize-none"
              />
            </Field>

            {/* Notes */}
            <Field label="Notas internas">
              <textarea
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                placeholder="Ej: Contacto principal es el Gerente de TI. Proyecto de e-commerce..."
                rows={3}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white
                  placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500
                  transition-colors resize-none"
              />
            </Field>

            {/* Status (only when editing) */}
            {editing && (
              <Field label="Estado">
                <div className="flex gap-2">
                  {(['active', 'suspended'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => set('status', s)}
                      className={[
                        'flex-1 py-2 rounded-lg text-sm font-semibold border transition-all',
                        form.status === s
                          ? s === 'active'
                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                            : 'bg-slate-700 border-slate-600 text-slate-300'
                          : 'border-slate-700 text-slate-500 hover:border-slate-600 hover:text-slate-400',
                      ].join(' ')}
                    >
                      {s === 'active' ? '✓ Activo' : '✗ Suspendido'}
                    </button>
                  ))}
                </div>
              </Field>
            )}
          </div>
        </form>

        {/* Panel footer — always visible */}
        <div className="shrink-0 flex gap-3 px-6 py-4 border-t border-slate-800">
          <button
            type="button"
            onClick={closePanel}
            className="flex-1 px-4 py-2.5 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg text-sm font-semibold transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !!docError || !form.name.trim() || !form.documentNumber}
            className="flex-1 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold transition-colors"
          >
            {saving ? 'Guardando...' : editing ? 'Actualizar Cliente' : 'Crear Cliente'}
          </button>
        </div>
      </div>

      {/* ── DELETE CONFIRMATION MODAL ───────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-sm w-full">
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
              Sus cotizaciones y recibos asociados permanecerán en el sistema.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg text-sm font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-400 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
