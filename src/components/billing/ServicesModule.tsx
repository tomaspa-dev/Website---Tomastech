import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Edit3, Trash2, X, Save,
  Briefcase, DollarSign, Tag, Info,
  AlertCircle, CheckCircle2, Package,
  Eye, PauseCircle, PlayCircle, Minus,
} from 'lucide-react';
import type { Service, Currency } from '../../lib/billing-store';
import Pagination from '../common/Pagination';

const CURRENCY_SYMBOLS: Record<Currency, string> = { PEN: 'S/', USD: '$', EUR: '€' };

export default function ServicesModule() {
  const [services, setServices] = useState<Service[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [viewingService, setViewingService] = useState<Service | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  useEffect(() => { loadData(); }, []);
  useEffect(() => { setCurrentPage(1); }, [searchQuery]);

  const loadData = async () => {
    const { serviceStore } = await import('../../lib/billing-store');
    setServices(serviceStore.getAll());
  };

  const handleDelete = async (id: string) => {
    const { serviceStore } = await import('../../lib/billing-store');
    serviceStore.delete(id);
    setConfirmDelete(null);
    loadData();
  };

  const handleToggleSuspend = async (service: Service) => {
    const { serviceStore } = await import('../../lib/billing-store');
    const newStatus = service.status === 'active' ? 'suspended' : 'active';
    serviceStore.update(service.id, { status: newStatus });
    loadData();
  };

  const filtered = services
    .filter(s =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => a.code.localeCompare(b.code));

  const paginated = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold">Portafolio de Servicios</h3>
          <p className="text-gray-400 text-sm">{services.length} servicios registrados</p>
        </div>
        <button
          onClick={() => { setEditingService(null); setIsFormOpen(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-sm hover:shadow-lg hover:shadow-emerald-500/25 transition-all hover:scale-[1.02]"
        >
          <Plus size={16} /> Nuevo Servicio
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Buscar por nombre, código o descripción..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-all"
        />
      </div>

      {/* Service List */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center text-gray-500">
          <Briefcase size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">{services.length === 0 ? 'No hay servicios aún' : 'Sin resultados'}</p>
          <p className="text-xs mt-1">Define tus servicios freelance para agilizar tus cotizaciones</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginated.map(service => {
              const sym = CURRENCY_SYMBOLS[service.currency];
              const profit = service.salePrice - service.costPrice;
              const margin = service.salePrice > 0 ? (profit / service.salePrice) * 100 : 0;
              const isSuspended = service.status === 'suspended';

              return (
                <motion.div
                  key={service.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-5 rounded-2xl border transition-all flex flex-col group ${isSuspended ? 'bg-white/[0.02] border-white/5 opacity-60' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2 min-w-0">
                       <div className={`p-2 rounded-lg transition-all ${isSuspended ? 'bg-gray-500/10 text-gray-500' : 'bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20'}`}>
                        <Package size={18} />
                       </div>
                       <div className="min-w-0">
                         <h4 className={`font-bold text-sm leading-tight ${isSuspended ? 'line-through text-gray-500' : 'text-white'}`}>{service.name}</h4>
                         <span className="text-[10px] font-mono text-gray-500 uppercase">{service.code}</span>
                         {isSuspended && (
                           <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                             Suspendido
                           </span>
                         )}
                       </div>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      {/* Ver */}
                      <button
                        onClick={() => setViewingService(service)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all"
                        title="Ver"
                      >
                        <Eye size={14} />
                      </button>
                      {/* Editar */}
                      <button
                        onClick={() => { setEditingService(service); setIsFormOpen(true); }}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-amber-400 hover:bg-amber-500/10 transition-all"
                        title="Editar"
                      >
                        <Edit3 size={14} />
                      </button>
                      {/* Suspender/Reanudar */}
                      <button
                        onClick={() => handleToggleSuspend(service)}
                        className={`p-1.5 rounded-lg transition-all ${isSuspended ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-gray-400 hover:text-amber-400 hover:bg-amber-500/10'}`}
                        title={isSuspended ? 'Reanudar' : 'Suspender'}
                      >
                        {isSuspended ? <PlayCircle size={14} /> : <PauseCircle size={14} />}
                      </button>
                      {/* Eliminar */}
                      {confirmDelete === service.id ? (
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleDelete(service.id)} className="px-1.5 py-0.5 rounded text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/20">Eliminar</button>
                          <button onClick={() => setConfirmDelete(null)} className="px-1.5 py-0.5 rounded text-[10px] text-gray-400">Esc</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDelete(service.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                          title="Eliminar"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-gray-400 line-clamp-2 mb-4 h-8">
                    {service.description || 'Sin descripción'}
                  </p>

                  <div className="mt-auto pt-4 border-t border-white/5 grid grid-cols-2 gap-2">
                    <div className="space-y-0.5">
                      <p className="text-[10px] text-gray-500 uppercase">Venta</p>
                      <p className="text-sm font-bold text-white">{sym} {service.salePrice.toFixed(2)}</p>
                    </div>
                    <div className="space-y-0.5 text-right">
                      <p className="text-[10px] text-gray-500 uppercase">Costo</p>
                      <p className="text-sm font-medium text-gray-400">{sym} {service.costPrice.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${margin >= 40 ? 'bg-green-500/10 text-green-400' : 'bg-blue-500/10 text-blue-400'}`}>
                        {margin.toFixed(0)}% Margen
                      </span>
                    </div>
                    <span className="text-[10px] text-emerald-500 font-medium">
                      + {sym} {profit.toFixed(2)} utilidad
                    </span>
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

      {/* View Modal (Read-Only) */}
      <AnimatePresence>
        {viewingService && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-start justify-center p-4 overflow-y-auto"
            onClick={e => { if (e.target === e.currentTarget) setViewingService(null); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-[#111] border border-white/10 rounded-2xl shadow-2xl my-8"
            >
              <div className="p-5 border-b border-white/10 flex justify-between items-center">
                <h3 className="font-bold text-lg flex items-center gap-2"><Eye size={18} className="text-cyan-400" /> Datos del Servicio</h3>
                <button onClick={() => setViewingService(null)} className="p-1 text-gray-400 hover:text-white"><X size={18} /></button>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Nombre</p>
                    <p className="text-sm font-medium">{viewingService.name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Código</p>
                    <p className="text-sm font-mono">{viewingService.code}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Estado</p>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${viewingService.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                      {viewingService.status === 'active' ? 'Activo' : 'Suspendido'}
                    </span>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Moneda</p>
                    <p className="text-sm">{viewingService.currency}</p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Descripción</p>
                  <p className="text-sm text-gray-400">{viewingService.description || '—'}</p>
                </div>
                <div className="grid grid-cols-3 gap-4 pt-3 border-t border-white/5">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Precio Venta</p>
                    <p className="text-sm font-bold text-white">{CURRENCY_SYMBOLS[viewingService.currency]} {viewingService.salePrice.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Costo Base</p>
                    <p className="text-sm text-gray-400">{CURRENCY_SYMBOLS[viewingService.currency]} {viewingService.costPrice.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Utilidad</p>
                    <p className="text-sm text-emerald-400 font-bold">
                      {CURRENCY_SYMBOLS[viewingService.currency]} {(viewingService.salePrice - viewingService.costPrice).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <ServiceFormModal
            editing={editingService}
            existingServices={services}
            onClose={() => { setIsFormOpen(false); setEditingService(null); }}
            onSave={() => { setIsFormOpen(false); setEditingService(null); loadData(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function generateNextCode(existingServices: Service[]): string {
  const maxNum = existingServices.reduce((max, s) => {
    const match = s.code.match(/SRV-(\d+)/);
    if (match) return Math.max(max, parseInt(match[1], 10));
    return max;
  }, 0);
  return `SRV-${String(maxNum + 1).padStart(5, '0')}`;
}

function ServiceFormModal({ editing, existingServices, onClose, onSave }: { editing: Service | null; existingServices: Service[]; onClose: () => void; onSave: () => void; }) {
  const [name, setName] = useState(editing?.name || '');
  const [code] = useState(editing?.code || generateNextCode(existingServices));
  const [description, setDescription] = useState(editing?.description || '');
  const [salePrice, setSalePrice] = useState(editing?.salePrice || 0);
  const [costPrice, setCostPrice] = useState(editing?.costPrice || 0);
  const [currency, setCurrency] = useState<Currency>(editing?.currency || 'PEN');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) { alert('Nombre es requerido'); return; }

    const { serviceStore } = await import('../../lib/billing-store');
    const data = { name, code, description, salePrice, costPrice, currency, status: editing?.status || 'active' };

    if (editing) {
      serviceStore.update(editing.id, data);
    } else {
      serviceStore.create(data);
    }
    onSave();
  };

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all";
  const sym = CURRENCY_SYMBOLS[currency];

  // +/- button component for prices
  const PriceField = ({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) => (
    <div>
      <label className="text-xs text-gray-400 mb-1 block">{label}</label>
      <div className="flex items-center gap-1">
        <button type="button" onClick={() => onChange(Math.max(0, value - 10))} className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all shrink-0"><Minus size={14} /></button>
        <input
          type="number"
          value={value || ''}
          onChange={e => onChange(parseFloat(e.target.value) || 0)}
          className={`${inputClass} text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
          step="0.01"
          min={0}
        />
        <button type="button" onClick={() => onChange(value + 10)} className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all shrink-0"><Plus size={14} /></button>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-start justify-center p-4 overflow-y-auto"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-lg bg-[#111] border border-white/10 rounded-2xl shadow-2xl my-8 max-h-[90vh] flex flex-col"
      >
        <div className="p-5 border-b border-white/10 flex justify-between items-center shrink-0">
          <h3 className="font-bold text-lg">{editing ? 'Editar Servicio' : 'Nuevo Servicio'}</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="text-xs text-gray-400 mb-1 block">Nombre del Servicio *</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputClass} required placeholder="Ej: Consultoría DevOps" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Código</label>
              <input type="text" value={code} readOnly className={`${inputClass} opacity-60 cursor-not-allowed font-mono text-xs`} title="Auto-generado" />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">Descripción</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className={`${inputClass} resize-none`} placeholder="Detalla qué incluye el servicio..." />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <PriceField label="Precio Venta" value={salePrice} onChange={setSalePrice} />
            <PriceField label="Costo Base" value={costPrice} onChange={setCostPrice} />
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Moneda</label>
              <select value={currency} onChange={e => setCurrency(e.target.value as Currency)} className={`${inputClass} appearance-none`}>
                <option value="PEN">S/ PEN</option>
                <option value="USD">$ USD</option>
                <option value="EUR">€ EUR</option>
              </select>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
            <div className="flex items-center gap-2 mb-2 text-emerald-400">
               <Tag size={14} />
               <span className="text-xs font-bold uppercase tracking-wider">Análisis de Rentabilidad</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-gray-500 uppercase">Utilidad Proyectada</p>
                <p className="text-lg font-bold text-white">
                  {sym} {(salePrice - costPrice).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase">Margen de Ganancia</p>
                <p className="text-lg font-bold text-white">
                  {salePrice > 0 ? (((salePrice - costPrice) / salePrice) * 100).toFixed(1) : '0'}%
                </p>
              </div>
            </div>
          </div>

          <button type="submit" className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-sm hover:shadow-lg hover:shadow-emerald-500/25 transition-all">
            <Save size={16} /> {editing ? 'Guardar Cambios' : 'Crear Servicio'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
