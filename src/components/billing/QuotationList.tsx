import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Eye,
  Edit3,
  Trash2,
  Send,
  MessageCircle,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  FileText,
  X,
  Save,
  ChevronDown,
  Download,
  FileDown,
  Minus,
} from 'lucide-react';
import type {
  Quotation,
  QuotationItem,
  QuotationStatus,
  Client,
  Currency,
  PaymentMethod,
  Project,
  Service,
} from '../../lib/billing-store';
import Pagination from '../common/Pagination';
import SearchableSelect from '../common/SearchableSelect';

// ============================================
// STATUS CONFIG
// ============================================

const STATUS_CONFIG: Record<QuotationStatus, { label: string; color: string; icon: any }> = {
  draft: { label: 'Borrador', color: 'gray', icon: Clock },
  sent: { label: 'Enviada', color: 'blue', icon: Send },
  accepted: { label: 'Aceptada', color: 'emerald', icon: CheckCircle },
  paid: { label: 'Pagada', color: 'green', icon: DollarSign },
  cancelled: { label: 'Cancelada', color: 'red', icon: XCircle },
};

const colorMap: Record<string, string> = {
  gray: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  green: 'bg-green-500/10 text-green-400 border-green-500/20',
  red: 'bg-red-500/10 text-red-400 border-red-500/20',
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function QuotationList() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<QuotationStatus | 'all'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'year'>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(null);
  const [previewQuotation, setPreviewQuotation] = useState<Quotation | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  useEffect(() => { setCurrentPage(1); }, [searchQuery, statusFilter, dateFilter]);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const { quotationStore, clientStore, projectStore } = await import('../../lib/billing-store');
    setQuotations(quotationStore.getAll());
    setClients(clientStore.getAll());
    setProjects(projectStore.getAll());
  };

  const getClientName = (clientId: string) => clients.find((c) => c.id === clientId)?.name || 'N/A';

  const handleStatusChange = async (id: string, status: QuotationStatus) => {
    const { quotationStore } = await import('../../lib/billing-store');
    quotationStore.update(id, { status });
    loadData();
  };

  const handleDelete = async (id: string) => {
    const { quotationStore } = await import('../../lib/billing-store');
    quotationStore.delete(id);
    loadData();
  };

  const handleWhatsApp = async (quotation: Quotation) => {
    const client = clients.find((c) => c.id === quotation.clientId);
    if (!client?.phone) { alert('Este cliente no tiene teléfono registrado'); return; }
    const { generateWhatsAppLink, formatCurrency } = await import('../../lib/billing-store');
    const msg = `Hola ${client.name}, le envío la cotización ${quotation.number} por ${formatCurrency(quotation.total, quotation.currency)}. Quedo atento a su respuesta.`;
    window.open(generateWhatsAppLink(client.phone, msg), '_blank');
  };

  const getClientDoc = (clientId: string) => clients.find((c) => c.id === clientId)?.documentNumber || '';

  let filtered = quotations
    .filter((q) => statusFilter === 'all' || q.status === statusFilter)
    .filter((q) => {
      const client = getClientName(q.clientId);
      const doc = getClientDoc(q.clientId);
      const query = searchQuery.toLowerCase();
      return q.number.toLowerCase().includes(query) || client.toLowerCase().includes(query) || doc.toLowerCase().includes(query);
    })
    .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());

  // Filtrar por fecha
  if (dateFilter !== 'all') {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let from = startOfDay;
    if (dateFilter === 'week') { from = new Date(startOfDay); from.setDate(from.getDate() - 7); }
    else if (dateFilter === 'month') { from = new Date(startOfDay); from.setMonth(from.getMonth() - 1); }
    else if (dateFilter === 'year') { from = new Date(startOfDay); from.setFullYear(from.getFullYear() - 1); }
    filtered = filtered.filter(q => new Date(q.issueDate) >= from);
  }

  const paginated = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const currencySymbol: Record<Currency, string> = { PEN: 'S/', USD: '$', EUR: '€' };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold">Cotizaciones</h3>
          <p className="text-gray-400 text-sm">{quotations.length} cotizaciones</p>
        </div>
        <div className="flex items-center gap-2">
          {quotations.length > 0 && (
            <button
              onClick={async () => { const { exportQuotations } = await import('../../lib/billing-store'); exportQuotations(quotations, clients); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 font-medium text-sm hover:bg-white/10 hover:text-white transition-all"
              title="Exportar a Excel"
            >
              <Download size={16} />
              Excel
            </button>
          )}
          <button
            onClick={() => { setEditingQuotation(null); setIsFormOpen(true); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-sm hover:shadow-lg hover:shadow-emerald-500/25 transition-all hover:scale-[1.02]"
          >
            <Plus size={16} /> Nueva Cotización
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar por número, cliente o documento..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-all"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 appearance-none min-w-[140px]"
        >
          <option value="all">Todos</option>
          {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        <div className="flex gap-1 bg-white/5 rounded-lg p-0.5 items-center">
          {(['all', 'today', 'week', 'month', 'year'] as const).map(f => (
            <button key={f} onClick={() => setDateFilter(f)} className={`px-2.5 py-1.5 rounded text-[10px] font-medium transition-all ${dateFilter === f ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
              {f === 'all' ? 'Todo' : f === 'today' ? 'Hoy' : f === 'week' ? 'Semana' : f === 'month' ? 'Mes' : 'Año'}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center text-gray-500">
          <FileText size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">{quotations.length === 0 ? 'No hay cotizaciones aún' : 'Sin resultados'}</p>
        </div>
      ) : (
        <>
          <div className="grid gap-3">
            {paginated.map((q) => {
            const statusCfg = STATUS_CONFIG[q.status];
            return (
              <motion.div
                key={q.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-mono text-sm font-bold text-white">{q.number}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${colorMap[statusCfg.color]}`}>
                        {statusCfg.label}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
                      <span>{getClientName(q.clientId)}</span>
                      <span>{new Date(q.issueDate).toLocaleDateString('es-PE')}</span>
                      <span className="font-bold text-white">{currencySymbol[q.currency]} {q.total.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 flex-wrap">
                    {/* Status actions */}
                    {q.status === 'draft' && (
                      <button onClick={() => handleStatusChange(q.id, 'sent')} className="px-2 py-1.5 rounded-lg text-xs font-medium text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 transition-all">Enviar</button>
                    )}
                    {q.status === 'sent' && (
                      <button onClick={() => handleStatusChange(q.id, 'accepted')} className="px-2 py-1.5 rounded-lg text-xs font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 transition-all">Aceptar</button>
                    )}
                    {q.status === 'accepted' && (
                      <button onClick={() => handleStatusChange(q.id, 'paid')} className="px-2 py-1.5 rounded-lg text-xs font-medium text-green-400 bg-green-500/10 hover:bg-green-500/20 transition-all">Pagada</button>
                    )}

                    <button onClick={() => handleWhatsApp(q)} className="p-1.5 rounded-lg text-gray-400 hover:text-green-400 hover:bg-green-500/10 transition-all" title="WhatsApp"><MessageCircle size={15} /></button>
                    <button onClick={() => setPreviewQuotation(q)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all" title="Ver"><Eye size={15} /></button>
                    <button onClick={() => { setEditingQuotation(q); setIsFormOpen(true); }} className="p-1.5 rounded-lg text-gray-400 hover:text-amber-400 hover:bg-amber-500/10 transition-all" title="Editar"><Edit3 size={15} /></button>

                    {q.status === 'draft' && (
                      <button onClick={() => handleDelete(q.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all" title="Eliminar"><Trash2 size={15} /></button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filtered.length / pageSize)}
            onPageChange={setCurrentPage}
            totalRecords={filtered.length}
            pageSize={pageSize}
          />
        </>
      )}

      {/* Form Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <QuotationFormModal
            clients={clients}
            editing={editingQuotation}
            onClose={() => { setIsFormOpen(false); setEditingQuotation(null); }}
            onSave={() => { setIsFormOpen(false); setEditingQuotation(null); loadData(); }}
          />
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewQuotation && (
          <QuotationPreviewModal
            quotation={previewQuotation}
            client={clients.find((c) => c.id === previewQuotation.clientId)}
            onClose={() => setPreviewQuotation(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// FORM MODAL
// ============================================

function QuotationFormModal({
  clients,
  editing,
  onClose,
  onSave,
}: {
  clients: Client[];
  editing: Quotation | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const [services, setServices] = useState<Service[]>([]);
  const [clientId, setClientId] = useState(editing?.clientId || '');
  const [projectId, setProjectId] = useState(editing?.projectId || '');

  useEffect(() => {
    import('../../lib/billing-store').then(({ serviceStore }) => setServices(serviceStore.getAll()));
  }, []);

  const [currency, setCurrency] = useState<Currency>(editing?.currency || 'PEN');
  const [items, setItems] = useState<QuotationItem[]>(
    editing?.items || [{ id: '1', description: '', quantity: 1, unitPrice: 0, subtotal: 0 }]
  );
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>(editing?.discountType || 'fixed');
  const [discountValue, setDiscountValue] = useState(editing?.discountValue || 0);
  const [retentionPercentage, setRetentionPercentage] = useState(editing?.retentionPercentage || 0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(editing?.paymentMethod || 'transfer');
  const [notes, setNotes] = useState(editing?.notes || '');
  const [issueDate, setIssueDate] = useState(editing?.issueDate || new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(editing?.dueDate || '');

  const updateItem = (index: number, updates: Partial<QuotationItem>) => {
    setItems(prev => {
      const newItems = [...prev];
      newItems[index] = { ...newItems[index], ...updates };
      if ('quantity' in updates || 'unitPrice' in updates) {
        newItems[index].subtotal = newItems[index].quantity * newItems[index].unitPrice;
      }
      return newItems;
    });
  };

  const addItem = () => {
    setItems([...items, { id: Date.now().toString(), description: '', quantity: 1, unitPrice: 0, subtotal: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const discountAmount = discountType === 'percentage' ? subtotal * (discountValue / 100) : discountValue;
  const afterDiscount = subtotal - discountAmount;
  const retentionAmount = afterDiscount * (retentionPercentage / 100);
  const total = afterDiscount - retentionAmount;

  const currencySymbol: Record<Currency, string> = { PEN: 'S/', USD: '$', EUR: '€' };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) { alert('Selecciona un cliente'); return; }
    if (items.some((i) => !i.description || i.unitPrice <= 0)) { alert('Completa todos los items'); return; }

    const { quotationStore } = await import('../../lib/billing-store');
    const data = {
      clientId,
      projectId,
      status: (editing?.status || 'draft') as QuotationStatus,
      currency,
      items,
      subtotal: Math.round(subtotal * 100) / 100,
      discountType,
      discountValue,
      discountAmount: Math.round(discountAmount * 100) / 100,
      retentionPercentage,
      retentionAmount: Math.round(retentionAmount * 100) / 100,
      total: Math.round(total * 100) / 100,
      paymentMethod,
      notes,
      issueDate,
      dueDate,
    };

    if (editing) {
      quotationStore.update(editing.id, data);
    } else {
      quotationStore.create(data);
    }
    onSave();
  };

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-start justify-center p-4 overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-4xl bg-[#111] border border-white/10 rounded-2xl shadow-2xl my-8 max-h-[90vh] flex flex-col"
      >
        <div className="sticky top-0 bg-[#111] border-b border-white/10 p-5 flex justify-between items-center z-10 rounded-t-2xl">
          <h3 className="font-bold text-lg">{editing ? 'Editar Cotización' : 'Nueva Cotización'}</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5 overflow-y-auto flex-1">
          {/* Client — full width row */}
          <div className="space-y-3">
            <div className="z-[30]">
              <label className="text-xs text-emerald-400/80 font-bold mb-1 block uppercase tracking-wider">Buscar Cliente *</label>
              <SearchableSelect
                options={clients.filter(c => (c as any).status !== 'suspended').map(c => ({ id: c.id, label: c.name, sublabel: `${c.documentType}: ${c.documentNumber}` }))}
                value={clientId}
                onChange={setClientId}
                placeholder="Escribe el nombre o documento del cliente..."
              />
            </div>
            
            {clientId && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="bg-white/[0.02] border border-white/5 p-2 rounded-xl">
                  <label className="text-[10px] text-gray-500 block mb-0.5">Tipo Doc.</label>
                  <div className="text-sm font-medium text-gray-300">
                    {clients.find(c => c.id === clientId)?.documentType || '—'}
                  </div>
                </div>
                <div className="bg-white/[0.02] border border-white/5 p-2 rounded-xl">
                  <label className="text-[10px] text-gray-500 block mb-0.5">N° Documento</label>
                  <div className="text-sm font-medium text-gray-300">
                    {clients.find(c => c.id === clientId)?.documentNumber || '—'}
                  </div>
                </div>
                <div className="bg-white/[0.02] border border-white/5 p-2 rounded-xl">
                  <label className="text-[10px] text-gray-500 block mb-0.5">Nombre / Razón Social</label>
                  <div className="text-sm font-medium text-gray-300 truncate">
                    {clients.find(c => c.id === clientId)?.name || '—'}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Currency + Dates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Moneda</label>
              <select value={currency} onChange={(e) => setCurrency(e.target.value as Currency)} className={`${inputClass} appearance-none`}>
                <option value="PEN">Soles (PEN)</option>
                <option value="USD">Dólares (USD)</option>
                <option value="EUR">Euros (EUR)</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Fecha de emisión</label>
              <input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Fecha de vencimiento</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inputClass} />
            </div>
          </div>

          {/* Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs text-emerald-400/80 font-bold block uppercase tracking-wider">Detalle de Servicios</label>
              <div className="text-[10px] text-gray-500 italic">Cada ítem debe tener descripción y precio</div>
            </div>
            
            <div className="space-y-4">
              {items.map((item, i) => (
                <div key={item.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3 relative group">
                  {/* Row 1: Description (Full Width) */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[10px] text-gray-500 font-bold uppercase">Descripción del Servicio</label>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(i)}
                          className="text-red-400/50 hover:text-red-400 transition-colors"
                          title="Eliminar ítem"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateItem(i, { description: e.target.value })}
                      className={`${inputClass} text-base`}
                      placeholder="Ej: Desarrollo de plataforma web a medida..."
                      required
                    />
                  </div>

                  {/* Row 2: Catalog, Quantity, Price, Subtotal */}
                  <div className="grid grid-cols-12 gap-3 items-end">
                    <div className="col-span-12 lg:col-span-5 z-[50]">
                      <label className="text-[10px] text-gray-500 block mb-1">Cargar del Catálogo</label>
                      <SearchableSelect
                        options={services.filter(s => s.status !== 'suspended').map(s => ({ id: s.id, label: s.name, sublabel: `${s.code} — S/ ${s.salePrice.toFixed(2)}` }))}
                        value=""
                        onChange={(id) => {
                          const s = services.find(sv => sv.id === id);
                          if (s) {
                            updateItem(i, { description: s.name, unitPrice: s.salePrice });
                          }
                        }}
                        placeholder="Buscar en servicios..."
                      />
                    </div>
                    <div className="col-span-4 lg:col-span-2">
                      <label className="text-[10px] text-gray-500 block mb-1 text-center">Cantidad</label>
                      <div className="flex items-center gap-1">
                        <button type="button" onClick={() => updateItem(i, { quantity: Math.max(1, item.quantity - 1) })} className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all shrink-0"><Minus size={14} /></button>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(i, { quantity: parseFloat(e.target.value) || 0 })}
                          className={`${inputClass} text-center font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                          min={1}
                        />
                        <button type="button" onClick={() => updateItem(i, { quantity: item.quantity + 1 })} className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all shrink-0"><Plus size={14} /></button>
                      </div>
                    </div>
                    <div className="col-span-4 lg:col-span-3">
                      <label className="text-[10px] text-gray-500 block mb-1">Precio Unitario</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">{currencySymbol[currency]}</span>
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(i, { unitPrice: parseFloat(e.target.value) || 0 })}
                          className={`${inputClass} pl-8 font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                          step="0.01"
                          min={0}
                        />
                      </div>
                    </div>
                    <div className="col-span-4 lg:col-span-2">
                      <label className="text-[10px] text-gray-500 block mb-1 text-right">Subtotal</label>
                      <div className="h-[42px] flex items-center justify-end px-1">
                        <span className="text-sm text-emerald-400 font-mono font-bold tracking-tighter">
                          {currencySymbol[currency]} {(item.quantity * item.unitPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addItem}
              className="w-full py-4 rounded-2xl border-2 border-dashed border-white/5 text-gray-400 hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all text-sm font-bold flex items-center justify-center gap-2"
            >
              <Plus size={18} /> Agregar un nuevo ítem a la cotización
            </button>
          </div>

          {/* Discount + Retention */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Descuento</label>
              <div className="flex gap-2">
                <select value={discountType} onChange={(e) => setDiscountType(e.target.value as any)} className="bg-white/5 border border-white/10 rounded-xl py-2.5 px-2 text-xs text-white focus:outline-none appearance-none w-16">
                  <option value="fixed">{currencySymbol[currency]}</option>
                  <option value="percentage">%</option>
                </select>
                <input type="number" value={discountValue || ''} onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)} className={inputClass} step="0.01" min={0} />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Retención (%)</label>
              <input type="number" value={retentionPercentage || ''} onChange={(e) => setRetentionPercentage(parseFloat(e.target.value) || 0)} className={inputClass} step="0.1" min={0} max={100} placeholder="Ej: 8" />
            </div>
          </div>

          {/* Payment method */}
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Método de Pago</label>
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)} className={`${inputClass} appearance-none`}>
              <option value="transfer">Transferencia Bancaria</option>
              <option value="cash">Efectivo</option>
              <option value="yape_plin">Yape / Plin</option>
              <option value="paypal">PayPal</option>
              <option value="card">Tarjeta</option>
              <option value="crypto">Criptomoneda</option>
              <option value="other">Otro</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Notas / Observaciones</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className={`${inputClass} resize-none`} placeholder="Términos, condiciones, etc." />
          </div>

          {/* Totals */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex justify-between text-sm text-gray-400">
              <span>Subtotal</span>
              <span>{currencySymbol[currency]} {subtotal.toFixed(2)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-sm text-amber-400">
                <span>Descuento</span>
                <span>- {currencySymbol[currency]} {discountAmount.toFixed(2)}</span>
              </div>
            )}
            {retentionAmount > 0 && (
              <div className="flex justify-between text-sm text-orange-400">
                <span>Retención ({retentionPercentage}%)</span>
                <span>- {currencySymbol[currency]} {retentionAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-white/10">
              <span>TOTAL</span>
              <span>{currencySymbol[currency]} {total.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-sm hover:shadow-lg hover:shadow-emerald-500/25 transition-all"
          >
            <Save size={16} />
            {editing ? 'Guardar Cambios' : 'Crear Cotización'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ============================================
// PREVIEW MODAL
// ============================================

function QuotationPreviewModal({
  quotation,
  client,
  onClose,
}: {
  quotation: Quotation;
  client?: Client;
  onClose: () => void;
}) {
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    import('../../lib/billing-store').then(({ configStore }) => setConfig(configStore.get()));
  }, []);

  const currencySymbol: Record<Currency, string> = { PEN: 'S/', USD: '$', EUR: '€' };
  const sym = currencySymbol[quotation.currency];

  const paymentLabels: Record<PaymentMethod, string> = {
    transfer: 'Transferencia Bancaria', cash: 'Efectivo', yape_plin: 'Yape / Plin',
    paypal: 'PayPal', card: 'Tarjeta', crypto: 'Criptomoneda', other: 'Otro',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-start justify-center p-4 overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="w-full max-w-3xl bg-white text-gray-900 rounded-2xl shadow-2xl my-8 overflow-hidden"
      >
        {/* Header: Logo → Business LEFT ║ Doc RIGHT → Separator → Client */}
        <div className="p-6 pb-0 space-y-3">
          {/* Logo own row */}
          {(config?.logoData || config?.logoUrl) && (
            <img
              src={config?.logoData || config?.logoUrl || '/logo.png'}
              alt="Logo"
              className="h-12 w-auto object-contain"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          )}

          {/* Business LEFT ║ Doc Info RIGHT */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">{config?.businessName || 'Tomastech'}</h2>
              {config?.fullName && <p className="text-sm text-gray-600">{config.fullName}</p>}
              <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                {config?.documentNumber && <p>{config.documentType}: {config.documentNumber}</p>}
                {config?.email && <p>{config.email}</p>}
                {config?.phone && <p>Tel: {config.phone}</p>}
                {config?.address && <p>{config.address}</p>}
              </div>
            </div>
            <div className="text-right">
              <h3 className="text-2xl font-bold text-emerald-700">COTIZACIÓN</h3>
              <p className="text-sm font-mono text-gray-700 mt-1">{quotation.number}</p>
              <div className="mt-2 text-xs text-gray-500 space-y-0.5">
                <p>Emisión: <span className="text-gray-700 font-medium">{new Date(quotation.issueDate).toLocaleDateString('es-PE')}</span></p>
                <p>Válida: <span className="text-gray-700 font-medium">{config?.quotationValidityDays || 15} días hábiles</span></p>
                {quotation.dueDate && <p>Vence: <span className="text-gray-700 font-medium">{new Date(quotation.dueDate).toLocaleDateString('es-PE')}</span></p>}
              </div>
            </div>
          </div>

          {/* Thin separator */}
          <hr className="border-gray-200" />

          {/* Client data (own section) */}
          <div className="text-sm pb-3">
            <p className="text-xs text-emerald-700 uppercase font-bold tracking-wide mb-1">Cliente</p>
            <p className="font-semibold text-gray-900">{client?.name || 'N/A'}</p>
            <div className="text-gray-500 text-xs space-y-0.5 mt-0.5">
              {client?.documentNumber && <p>{client.documentType}: {client.documentNumber}</p>}
              {client?.email && <p>{client.email}</p>}
              {client?.phone && <p>Tel: {client.phone}</p>}
              {client?.address && <p>{client.address}</p>}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 space-y-5">
          {/* Items Table */}
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200 text-xs text-gray-500 uppercase">
                <th className="py-2 text-left">Descripción</th>
                <th className="py-2 text-center w-16">Cant.</th>
                <th className="py-2 text-right w-24">P. Unit.</th>
                <th className="py-2 text-right w-24">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {quotation.items.map((item, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-2.5">{item.description}</td>
                  <td className="py-2.5 text-center">{item.quantity}</td>
                  <td className="py-2.5 text-right">{sym} {item.unitPrice.toFixed(2)}</td>
                  <td className="py-2.5 text-right font-medium">{sym} {(item.quantity * item.unitPrice).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{sym} {quotation.subtotal.toFixed(2)}</span></div>
              {quotation.discountAmount > 0 && <div className="flex justify-between text-orange-600"><span>Descuento</span><span>- {sym} {quotation.discountAmount.toFixed(2)}</span></div>}
              {quotation.retentionAmount > 0 && <div className="flex justify-between text-red-600"><span>Retención ({quotation.retentionPercentage}%)</span><span>- {sym} {quotation.retentionAmount.toFixed(2)}</span></div>}
              <div className="flex justify-between font-bold text-lg pt-2 border-t-2 border-gray-300"><span>TOTAL</span><span>{sym} {quotation.total.toFixed(2)}</span></div>
            </div>
          </div>

          {/* Payment & Notes */}
          <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
            <div>
              <p className="font-bold text-gray-800 mb-1">Método de Pago</p>
              <p>{paymentLabels[quotation.paymentMethod]}</p>
            </div>
            {quotation.notes && (
              <div>
                <p className="font-bold text-gray-800 mb-1">Notas</p>
                <p>{quotation.notes}</p>
              </div>
            )}
          </div>

          {/* Bank info */}
          {config?.bankAccounts?.length > 0 && (
            <div className="text-xs text-gray-600 border-t border-gray-200 pt-3">
              <p className="font-bold text-gray-800 mb-1">Datos Bancarios</p>
              {config.bankAccounts.map((b: any, i: number) => (
                <p key={i}>{b.bankName} — Cuenta: {b.accountNumber} {b.cci && `| CCI: ${b.cci}`} | Titular: {b.accountHolder}</p>
              ))}
            </div>
          )}
        </div>

        {/* Close */}
        <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
          <button
            onClick={async () => {
              const { generateQuotationPDF } = await import('../../lib/billing-pdf');
              await generateQuotationPDF(quotation, client, config);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
          >
            <FileDown size={15} /> Descargar PDF
          </button>
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition-colors">Cerrar</button>
        </div>
      </motion.div>
    </motion.div>
  );
}
