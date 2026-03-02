import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Eye,
  Send,
  MessageCircle,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  X,
  Save,
  Download,
  FileDown,
} from 'lucide-react';
import type {
  Receipt,
  ReceiptStatus,
  Quotation,
  Client,
  Currency,
  PaymentMethod,
} from '../../lib/billing-store';
import Pagination from '../common/Pagination';
import SearchableSelect from '../common/SearchableSelect';

const STATUS_CONFIG: Record<ReceiptStatus, { label: string; color: string }> = {
  pending: { label: 'Pendiente SUNAT', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  issued: { label: 'Emitido', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
  voided: { label: 'Anulado', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
};

export default function ReceiptList() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [previewReceipt, setPreviewReceipt] = useState<Receipt | null>(null);
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'year'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  useEffect(() => { setCurrentPage(1); }, [searchQuery, dateFilter]);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const { receiptStore, clientStore, quotationStore } = await import('../../lib/billing-store');
    setReceipts(receiptStore.getAll());
    setClients(clientStore.getAll());
    setQuotations(quotationStore.getAll());
  };

  const getClientName = (id: string) => clients.find((c) => c.id === id)?.name || 'N/A';
  const getClientDoc = (id: string) => clients.find((c) => c.id === id)?.documentNumber || '';
  const currencySymbol: Record<Currency, string> = { PEN: 'S/', USD: '$', EUR: '€' };

  const handleStatusChange = async (id: string, status: ReceiptStatus) => {
    const { receiptStore } = await import('../../lib/billing-store');
    receiptStore.update(id, { sunatStatus: status });
    loadData();
  };

  const handleWhatsApp = (receipt: Receipt) => {
    const client = clients.find((c) => c.id === receipt.clientId);
    if (!client?.phone) { alert('Cliente sin teléfono registrado'); return; }
    const sym = currencySymbol[receipt.currency];
    const msg = `Hola ${client.name}, le envío su Recibo por Honorarios N° ${receipt.number} por ${sym} ${receipt.netAmount.toFixed(2)}. Gracias por su confianza.`;
    const cleanPhone = client.phone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // Filtrar por búsqueda (nombre, documento, número)
  let filtered = receipts
    .filter((r) => {
      const q = searchQuery.toLowerCase();
      if (!q) return true;
      return r.number.toLowerCase().includes(q) || getClientName(r.clientId).toLowerCase().includes(q) || getClientDoc(r.clientId).toLowerCase().includes(q);
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
    filtered = filtered.filter(r => new Date(r.issueDate) >= from);
  }

  const paginated = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const paidQuotations = quotations.filter((q) => q.status === 'paid');

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold">Recibos por Honorarios</h3>
          <p className="text-gray-400 text-sm">{receipts.length} recibos emitidos</p>
        </div>
        <div className="flex items-center gap-2">
          {receipts.length > 0 && (
            <button
              onClick={async () => { const { exportReceipts } = await import('../../lib/billing-store'); exportReceipts(receipts, clients); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 font-medium text-sm hover:bg-white/10 hover:text-white transition-all"
              title="Exportar a Excel"
            >
              <Download size={16} />
              Excel
            </button>
          )}
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-sm hover:shadow-lg hover:shadow-emerald-500/25 transition-all hover:scale-[1.02]"
          >
            <Plus size={16} /> Nuevo Recibo
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar por número, cliente o documento..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-all"
          />
        </div>
        <div className="flex gap-1 bg-white/5 rounded-lg p-0.5">
          {(['all', 'today', 'week', 'month', 'year'] as const).map(f => (
            <button key={f} onClick={() => setDateFilter(f)} className={`px-2.5 py-1.5 rounded text-[10px] font-medium transition-all ${dateFilter === f ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
              {f === 'all' ? 'Todo' : f === 'today' ? 'Hoy' : f === 'week' ? 'Semana' : f === 'month' ? 'Mes' : 'Año'}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-16 text-center text-gray-500">
          <FileText size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">{receipts.length === 0 ? 'No hay recibos aún' : 'Sin resultados'}</p>
          {receipts.length === 0 && paidQuotations.length > 0 && (
            <p className="text-xs mt-1">Tienes {paidQuotations.length} cotizaciones pagadas listas para generar recibo</p>
          )}
        </div>
      ) : (
        <>
          <div className="grid gap-3">
            {paginated.map((r) => {
              const sym = currencySymbol[r.currency];
              const statusCfg = STATUS_CONFIG[r.sunatStatus];
              return (
                <motion.div key={r.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-mono text-sm font-bold">{r.number}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${statusCfg.color}`}>{statusCfg.label}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
                        <span>{getClientName(r.clientId)}</span>
                        <span>{new Date(r.issueDate).toLocaleDateString('es-PE')}</span>
                        <span>Bruto: {sym} {r.grossAmount.toFixed(2)}</span>
                        {r.retentionAmount > 0 && <span className="text-orange-400">Ret: -{sym} {r.retentionAmount.toFixed(2)}</span>}
                        <span className="font-bold text-white">Neto: {sym} {r.netAmount.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {r.sunatStatus === 'pending' && (
                        <button onClick={() => handleStatusChange(r.id, 'issued')} className="px-2 py-1.5 rounded-lg text-xs font-medium text-green-400 bg-green-500/10 hover:bg-green-500/20 transition-all">Marcar Emitido</button>
                      )}
                      <button onClick={() => handleWhatsApp(r)} className="p-1.5 rounded-lg text-gray-400 hover:text-green-400 hover:bg-green-500/10 transition-all" title="WhatsApp"><MessageCircle size={15} /></button>
                      <button onClick={() => setPreviewReceipt(r)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all" title="Ver"><Eye size={15} /></button>
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
          <ReceiptFormModal
            clients={clients}
            quotations={paidQuotations}
            onClose={() => setIsFormOpen(false)}
            onSave={() => { setIsFormOpen(false); loadData(); }}
          />
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewReceipt && (
          <ReceiptPreviewModal
            receipt={previewReceipt}
            client={clients.find((c) => c.id === previewReceipt.clientId)}
            onClose={() => setPreviewReceipt(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// FORM MODAL
// ============================================

function ReceiptFormModal({
  clients,
  quotations,
  onClose,
  onSave,
}: {
  clients: Client[];
  quotations: Quotation[];
  onClose: () => void;
  onSave: () => void;
}) {
  const [quotationId, setQuotationId] = useState('');
  const [clientId, setClientId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [grossAmount, setGrossAmount] = useState(0);
  const [retentionPercentage, setRetentionPercentage] = useState(0);
  const [manualRetention, setManualRetention] = useState(false);
  const [currency, setCurrency] = useState<Currency>('PEN');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('transfer');
  const [paymentReference, setPaymentReference] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [useExchangeRate, setUseExchangeRate] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(3.70);
  const [originalQuotationAmount, setOriginalQuotationAmount] = useState<number | null>(null);
  const [clientSearch, setClientSearch] = useState('');
  const [retentionConfig, setRetentionConfig] = useState<{ threshold: number; percentage: number } | null>(null);

  // Load retention config
  useEffect(() => {
    import('../../lib/billing-store').then(({ configStore }) => {
      const cfg = configStore.get();
      if (cfg?.retentionConfigs?.[0]) {
        setRetentionConfig({ threshold: cfg.retentionConfigs[0].threshold, percentage: cfg.retentionConfigs[0].percentage });
      }
    });
  }, []);

  // Auto-calculate retention based on config when grossAmount changes (unless manual)
  useEffect(() => {
    if (!manualRetention && retentionConfig) {
      if (grossAmount >= retentionConfig.threshold) {
        setRetentionPercentage(retentionConfig.percentage);
      } else {
        setRetentionPercentage(0);
      }
    }
  }, [grossAmount, manualRetention, retentionConfig]);

  // Auto-fill from quotation
  const handleQuotationSelect = (qId: string) => {
    setQuotationId(qId);
    const q = quotations.find((q) => q.id === qId);
    if (q) {
      setClientId(q.clientId);
      setProjectId(q.projectId || '');
      const gross = q.total + q.retentionAmount;
      setGrossAmount(gross);
      setOriginalQuotationAmount(gross);
      setCurrency(q.currency);
      setRetentionPercentage(q.retentionPercentage);
      setPaymentMethod(q.paymentMethod);
      setServiceDescription(q.items.map((i) => i.description).join(', '));
      if (q.currency !== 'PEN') {
        setUseExchangeRate(true);
      }
    }
  };

  const retentionAmount = grossAmount * (retentionPercentage / 100);
  const netAmount = grossAmount - retentionAmount;
  const amountInPEN = useExchangeRate ? Math.round(netAmount * exchangeRate * 100) / 100 : netAmount;
  const currencySymbol: Record<Currency, string> = { PEN: 'S/', USD: '$', EUR: '€' };
  const sym = currencySymbol[currency];

  const filteredClients = clientSearch ? clients.filter(c => 
    c.name.toLowerCase().includes(clientSearch.toLowerCase()) || 
    c.documentNumber.toLowerCase().includes(clientSearch.toLowerCase())
  ) : clients;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || grossAmount <= 0) { alert('Completa los campos requeridos'); return; }

    const { receiptStore, clientStore, generateAccountingFromReceipt } = await import('../../lib/billing-store');
    const receipt = receiptStore.create({
      quotationId,
      clientId,
      projectId,
      serviceDescription,
      grossAmount,
      retentionPercentage,
      retentionAmount: Math.round(retentionAmount * 100) / 100,
      netAmount: Math.round(netAmount * 100) / 100,
      currency,
      paymentMethod,
      paymentReference,
      issueDate,
      sunatStatus: 'pending',
    });
    // Generar contabilidad automáticamente
    const client = clientStore.getAll().find(c => c.id === clientId);
    generateAccountingFromReceipt(receipt, client, useExchangeRate ? exchangeRate : 1);
    onSave();
  };

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-start justify-center p-4 overflow-y-auto" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="w-full max-w-4xl bg-[#111] border border-white/10 rounded-2xl shadow-2xl max-h-[90vh] flex flex-col my-8">
        <div className="sticky top-0 bg-[#111] border-b border-white/10 p-5 flex justify-between items-center z-10 rounded-t-2xl">
          <h3 className="font-bold text-lg">Nuevo Recibo por Honorarios</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Quotation & Client selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 z-[20]">
            {quotations.length > 0 && (
              <div>
                <label className="text-xs text-gray-400 mb-1 block italic">Vincular a Cotización (opcional)</label>
                <SearchableSelect
                  options={quotations.map(q => {
                    const client = clients.find(c => c.id === q.clientId);
                    return {
                      id: q.id,
                      label: `${q.number} — ${client?.name || 'N/A'}`,
                      sublabel: `${currencySymbol[q.currency]} ${q.total.toFixed(2)} | ${client?.documentType}: ${client?.documentNumber || ''}`
                    };
                  })}
                  value={quotationId}
                  onChange={handleQuotationSelect}
                  placeholder="Vincular código..."
                />
              </div>
            )}
            <div className={quotations.length > 0 ? "" : "md:col-span-2"}>
              <label className="text-xs text-emerald-400/80 font-bold mb-1 block uppercase tracking-wider">Buscar Cliente *</label>
              <SearchableSelect
                options={clients.filter(c => (c as any).status !== 'suspended').map(c => ({ id: c.id, label: c.name, sublabel: `${c.documentType}: ${c.documentNumber}` }))}
                value={clientId}
                onChange={setClientId}
                placeholder="Escribe el nombre o documento..."
              />
            </div>
          </div>

          {/* Client Details (Read-only) */}
          {clientId && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="bg-white/[0.02] border border-white/5 p-2 rounded-xl">
                <label className="text-[10px] text-gray-500 block mb-0.5 uppercase">Tipo Doc.</label>
                <div className="text-sm font-medium text-gray-300">
                  {clients.find(c => c.id === clientId)?.documentType || '—'}
                </div>
              </div>
              <div className="bg-white/[0.02] border border-white/5 p-2 rounded-xl">
                <label className="text-[10px] text-gray-500 block mb-0.5 uppercase">N° Documento</label>
                <div className="text-sm font-medium text-gray-300">
                  {clients.find(c => c.id === clientId)?.documentNumber || '—'}
                </div>
              </div>
              <div className="bg-white/[0.02] border border-white/5 p-2 rounded-xl">
                <label className="text-[10px] text-gray-500 block mb-0.5 uppercase">Nombre del Cliente</label>
                <div className="text-sm font-medium text-gray-300 truncate">
                  {clients.find(c => c.id === clientId)?.name || '—'}
                </div>
              </div>
            </div>
          )}

          {/* Description — Full Width */}
          <div>
            <label className="text-xs text-emerald-400/80 font-bold mb-1 block uppercase tracking-wider">Descripción del servicio *</label>
            <textarea
              value={serviceDescription}
              onChange={(e) => setServiceDescription(e.target.value)}
              rows={3}
              className={`${inputClass} resize-none text-base`}
              required
              placeholder="Detalle del servicio prestado que aparecerá en el recibo..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">F. Emisión</label>
              <input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block font-bold">Monto Bruto *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">{sym}</span>
                <input type="number" value={grossAmount || ''} onChange={(e) => setGrossAmount(parseFloat(e.target.value) || 0)} className={`${inputClass} pl-8 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none font-bold`} step="0.01" min="0.01" required />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 flex items-center justify-between">
                <span>Retención (%)</span>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input type="checkbox" checked={manualRetention} onChange={e => setManualRetention(e.target.checked)} className="w-3 h-3 rounded border-white/20 bg-white/5 text-emerald-500" />
                  <span className="text-[9px] text-gray-500">Manual</span>
                </label>
              </label>
              <input type="number" value={retentionPercentage || ''} onChange={(e) => setRetentionPercentage(parseFloat(e.target.value) || 0)} className={`${inputClass} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${!manualRetention ? 'opacity-70 bg-white/[0.02]' : ''}`} step="0.1" min={0} max={100} readOnly={!manualRetention} />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Moneda</label>
              <select value={currency} onChange={(e) => setCurrency(e.target.value as Currency)} className={`${inputClass} appearance-none`}>
                <option value="PEN">Soles (PEN)</option>
                <option value="USD">Dólares (USD)</option>
                <option value="EUR">Euros (EUR)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Método de pago</label>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)} className={`${inputClass} appearance-none`}>
                <option value="transfer">Transferencia</option>
                <option value="cash">Efectivo</option>
                <option value="yape_plin">Yape / Plin</option>
                <option value="paypal">PayPal</option>
                <option value="card">Tarjeta</option>
                <option value="crypto">Crypto</option>
                <option value="other">Otro</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">N° Operación</label>
              <input type="text" value={paymentReference} onChange={(e) => setPaymentReference(e.target.value)} className={inputClass} placeholder="Ref. del pago" />
            </div>
          </div>

          {/* Totals */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex justify-between text-sm"><span className="text-gray-400">Monto bruto</span><span>{sym} {grossAmount.toFixed(2)}</span></div>
            {originalQuotationAmount && originalQuotationAmount !== grossAmount && (
              <div className="flex justify-between text-xs text-amber-400"><span>Monto cotización original</span><span>{sym} {originalQuotationAmount.toFixed(2)} {grossAmount > originalQuotationAmount ? '↑' : '↓'}</span></div>
            )}
            {retentionAmount > 0 && <div className="flex justify-between text-sm text-orange-400"><span>Retención ({retentionPercentage}%)</span><span>- {sym} {retentionAmount.toFixed(2)}</span></div>}
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-white/10"><span>MONTO NETO</span><span>{sym} {netAmount.toFixed(2)}</span></div>
            {useExchangeRate && currency !== 'PEN' && (
              <div className="flex justify-between text-sm text-emerald-400 pt-1 border-t border-white/10"><span>Equivalente en Soles (TC: {exchangeRate})</span><span>S/ {amountInPEN.toFixed(2)}</span></div>
            )}
          </div>

          {/* Exchange rate */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={useExchangeRate} onChange={e => { setUseExchangeRate(e.target.checked); if (!e.target.checked) setCurrency('PEN'); }} className="w-4 h-4 rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-emerald-500/50" />
              <span className="text-xs text-gray-400">Aplicar tipo de cambio</span>
            </label>
            {useExchangeRate && (
              <input type="number" value={exchangeRate || ''} onChange={e => setExchangeRate(parseFloat(e.target.value) || 1)} className="w-24 bg-white/5 border border-white/10 rounded-lg py-1.5 px-2 text-xs text-white text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" step="0.01" min={0.01} placeholder="TC" />
            )}
          </div>

          <button type="submit" className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-sm hover:shadow-lg hover:shadow-emerald-500/25 transition-all">
            <Save size={16} /> Crear Recibo
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ============================================
// PREVIEW MODAL
// ============================================

function ReceiptPreviewModal({
  receipt,
  client,
  onClose,
}: {
  receipt: Receipt;
  client?: Client;
  onClose: () => void;
}) {
  const [config, setConfig] = useState<any>(null);
  useEffect(() => {
    import('../../lib/billing-store').then(({ configStore }) => setConfig(configStore.get()));
  }, []);

  const currencySymbol: Record<Currency, string> = { PEN: 'S/', USD: '$', EUR: '€' };
  const sym = currencySymbol[receipt.currency];

  const paymentLabels: Record<PaymentMethod, string> = {
    transfer: 'Transferencia Bancaria', cash: 'Efectivo', yape_plin: 'Yape / Plin',
    paypal: 'PayPal', card: 'Tarjeta', crypto: 'Criptomoneda', other: 'Otro',
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-start justify-center p-4 overflow-y-auto" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="w-full max-w-3xl bg-white text-gray-900 rounded-2xl shadow-2xl my-8 overflow-hidden">

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
              <h3 className="text-xl font-bold text-emerald-700">RECIBO POR HONORARIOS</h3>
              <p className="text-sm font-mono text-gray-700 mt-1">{receipt.number}</p>
              <p className="text-xs text-gray-500 mt-1">Renta de Cuarta Categoría</p>
              <p className="text-xs text-gray-500 mt-1">Fecha: <span className="text-gray-700 font-medium">{new Date(receipt.issueDate).toLocaleDateString('es-PE')}</span></p>
            </div>
          </div>

          {/* Thin separator */}
          <hr className="border-gray-200" />

          {/* Client data (own section) */}
          <div className="text-sm pb-3">
            <p className="text-xs text-emerald-700 uppercase font-bold tracking-wide mb-1">Usuario del Servicio</p>
            <p className="font-semibold text-gray-900">{client?.name || 'N/A'}</p>
            <div className="text-gray-500 text-xs space-y-0.5 mt-0.5">
              {client?.documentNumber && <p>{client.documentType}: {client.documentNumber}</p>}
              {client?.email && <p>{client.email}</p>}
              {client?.phone && <p>Tel: {client.phone}</p>}
              {client?.address && <p>{client.address}</p>}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 pb-6 space-y-5">
          <div className="border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-500 uppercase font-bold mb-2">Descripción del Servicio</p>
            <p className="text-sm">{receipt.serviceDescription}</p>
          </div>

          <div className="border-t-2 border-gray-200 pt-4 space-y-2">
            <div className="flex justify-between text-sm"><span className="text-gray-500">Monto de Honorarios</span><span className="font-medium">{sym} {receipt.grossAmount.toFixed(2)}</span></div>
            {receipt.retentionAmount > 0 && (
              <div className="flex justify-between text-sm text-red-600"><span>Retención IR ({receipt.retentionPercentage}%)</span><span>- {sym} {receipt.retentionAmount.toFixed(2)}</span></div>
            )}
            <div className="flex justify-between text-lg font-bold pt-2 border-t-2 border-gray-300"><span>MONTO NETO RECIBIDO</span><span>{sym} {receipt.netAmount.toFixed(2)}</span></div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs text-gray-600 border-t border-gray-200 pt-3">
            <div>
              <p className="font-bold text-gray-800 mb-1">Forma de Pago</p>
              <p>{paymentLabels[receipt.paymentMethod]}</p>
              {receipt.paymentReference && <p className="text-gray-500">Ref: {receipt.paymentReference}</p>}
            </div>
            <div>
              <p className="font-bold text-gray-800 mb-1">Estado SUNAT</p>
              <p>{receipt.sunatStatus === 'issued' ? '✅ Emitido' : receipt.sunatStatus === 'voided' ? '❌ Anulado' : '⏳ Pendiente'}</p>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
          <button
            onClick={async () => {
              const { generateReceiptPDF } = await import('../../lib/billing-pdf');
              await generateReceiptPDF(receipt, client, config);
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
