import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Edit3, Trash2, X, Save, Download,
  FolderOpen, Calendar, DollarSign, Eye, FileText,
  CheckCircle, Clock, PauseCircle, XCircle, PlayCircle,
} from 'lucide-react';
import type { Project, ProjectStatus, Client, Currency, Quotation, Receipt } from '../../lib/billing-store';
import Pagination from '../common/Pagination';
import SearchableSelect from '../common/SearchableSelect';

const STATUS_CONFIG: Record<ProjectStatus, { label: string; color: string; icon: any }> = {
  planning: { label: 'Planificación', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: Clock },
  active: { label: 'En Curso', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: PlayCircle },
  paused: { label: 'Pausado', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', icon: PauseCircle },
  completed: { label: 'Completado', color: 'bg-green-500/10 text-green-400 border-green-500/20', icon: CheckCircle },
  cancelled: { label: 'Cancelado', color: 'bg-red-500/10 text-red-400 border-red-500/20', icon: XCircle },
};

const CURRENCY_SYMBOLS: Record<Currency, string> = { PEN: 'S/', USD: '$', EUR: '€' };

export default function ProjectManager() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [viewProject, setViewProject] = useState<Project | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  useEffect(() => { setCurrentPage(1); }, [searchQuery, statusFilter]);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const mod = await import('../../lib/billing-store');
    setProjects(mod.projectStore.getAll());
    setClients(mod.clientStore.getAll());
    setQuotations(mod.quotationStore.getAll());
    setReceipts(mod.receiptStore.getAll());
  };

  const getClientName = (id: string) => clients.find(c => c.id === id)?.name || 'N/A';

  const handleDelete = async (id: string) => {
    const { projectStore } = await import('../../lib/billing-store');
    projectStore.delete(id);
    setConfirmDelete(null);
    loadData();
  };

  const handleStatusChange = async (id: string, status: ProjectStatus) => {
    const { projectStore } = await import('../../lib/billing-store');
    projectStore.update(id, { status });
    loadData();
  };

  const handleExport = async () => {
    const { exportToExcel } = await import('../../lib/billing-store');
    const data = projects.map(p => ({
      'Proyecto': p.name,
      'Cliente': getClientName(p.clientId),
      'Estado': STATUS_CONFIG[p.status].label,
      'Presupuesto': `${CURRENCY_SYMBOLS[p.currency]} ${p.budget.toFixed(2)}`,
      'Inicio': p.startDate ? new Date(p.startDate).toLocaleDateString('es-PE') : '',
      'Fin': p.endDate ? new Date(p.endDate).toLocaleDateString('es-PE') : '',
      'Descripción': p.description,
      'Notas': p.notes,
    }));
    exportToExcel(data, 'proyectos');
  };

  const getProjectQuotations = (projectId: string) => quotations.filter(q => q.projectId === projectId);
  const getProjectReceipts = (projectId: string) => receipts.filter(r => r.projectId === projectId);

  const filtered = projects
    .filter(p => statusFilter === 'all' || p.status === statusFilter)
    .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || getClientName(p.clientId).toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const paginated = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold">Proyectos</h3>
          <p className="text-gray-400 text-sm">{projects.length} proyectos</p>
        </div>
        <div className="flex items-center gap-2">
          {projects.length > 0 && (
            <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 font-medium text-sm hover:bg-white/10 hover:text-white transition-all" title="Exportar">
              <Download size={16} /> Excel
            </button>
          )}
          <button onClick={() => { setEditingProject(null); setIsFormOpen(true); }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-sm hover:shadow-lg hover:shadow-emerald-500/25 transition-all hover:scale-[1.02]">
            <Plus size={16} /> Nuevo Proyecto
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input type="text" placeholder="Buscar por nombre o cliente..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-all" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className={`${inputClass} appearance-none min-w-[150px]`}>
          <option value="all">Todos</option>
          {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="py-16 text-center text-gray-500">
          <FolderOpen size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">{projects.length === 0 ? 'No hay proyectos aún' : 'Sin resultados'}</p>
          <p className="text-xs mt-1">{projects.length === 0 ? 'Crea tu primer proyecto para organizar tu trabajo' : ''}</p>
        </div>
      ) : (
        <>
          <div className="grid gap-3">
            {paginated.map(project => {
              const statusCfg = STATUS_CONFIG[project.status];
              const sym = CURRENCY_SYMBOLS[project.currency];
              const pQuotations = getProjectQuotations(project.id);
              const pReceipts = getProjectReceipts(project.id);
              const totalInvoiced = pReceipts.reduce((s, r) => s + r.netAmount, 0);
              return (
                <motion.div key={project.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="font-semibold text-sm truncate">{project.name}</h4>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${statusCfg.color}`}>{statusCfg.label}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
                        <span>{getClientName(project.clientId)}</span>
                        <span>Presupuesto: {sym} {project.budget.toFixed(2)}</span>
                        {pQuotations.length > 0 && <span>{pQuotations.length} cotiz.</span>}
                        {pReceipts.length > 0 && <span className="text-emerald-400">Facturado: {sym} {totalInvoiced.toFixed(2)}</span>}
                        {project.startDate && <span><Calendar size={11} className="inline mr-1" />{new Date(project.startDate).toLocaleDateString('es-PE')}</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 flex-wrap">
                      {/* Status actions */}
                      {project.status === 'planning' && (
                        <button onClick={() => handleStatusChange(project.id, 'active')} className="px-2 py-1.5 rounded-lg text-xs font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 transition-all">Iniciar</button>
                      )}
                      {project.status === 'active' && (
                        <>
                          <button onClick={() => handleStatusChange(project.id, 'paused')} className="px-2 py-1.5 rounded-lg text-xs font-medium text-yellow-400 bg-yellow-500/10 hover:bg-yellow-500/20 transition-all">Pausar</button>
                          <button onClick={() => handleStatusChange(project.id, 'completed')} className="px-2 py-1.5 rounded-lg text-xs font-medium text-green-400 bg-green-500/10 hover:bg-green-500/20 transition-all">Completar</button>
                        </>
                      )}
                      {project.status === 'paused' && (
                        <button onClick={() => handleStatusChange(project.id, 'active')} className="px-2 py-1.5 rounded-lg text-xs font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 transition-all">Reanudar</button>
                      )}

                      <button onClick={() => setViewProject(project)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all" title="Ver detalle"><Eye size={15} /></button>
                      <button onClick={() => { setEditingProject(project); setIsFormOpen(true); }} className="p-1.5 rounded-lg text-gray-400 hover:text-amber-400 hover:bg-amber-500/10 transition-all" title="Editar"><Edit3 size={15} /></button>

                      {confirmDelete === project.id ? (
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleDelete(project.id)} className="px-2 py-1 rounded text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20">Sí</button>
                          <button onClick={() => setConfirmDelete(null)} className="px-2 py-1 rounded text-xs text-gray-400 hover:text-white">No</button>
                        </div>
                      ) : (
                        <button onClick={() => setConfirmDelete(project.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all" title="Eliminar"><Trash2 size={15} /></button>
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
          <ProjectFormModal clients={clients} editing={editingProject} onClose={() => { setIsFormOpen(false); setEditingProject(null); }} onSave={() => { setIsFormOpen(false); setEditingProject(null); loadData(); }} />
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      <AnimatePresence>
        {viewProject && (
          <ProjectDetailModal project={viewProject} client={clients.find(c => c.id === viewProject.clientId)} quotations={getProjectQuotations(viewProject.id)} receipts={getProjectReceipts(viewProject.id)} onClose={() => setViewProject(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// FORM MODAL
// ============================================

function ProjectFormModal({ clients, editing, onClose, onSave }: { clients: Client[]; editing: Project | null; onClose: () => void; onSave: () => void; }) {
  const [name, setName] = useState(editing?.name || '');
  const [clientId, setClientId] = useState(editing?.clientId || '');
  const [description, setDescription] = useState(editing?.description || '');
  const [status, setStatus] = useState<ProjectStatus>(editing?.status || 'planning');
  const [startDate, setStartDate] = useState(editing?.startDate || '');
  const [endDate, setEndDate] = useState(editing?.endDate || '');
  const [budget, setBudget] = useState(editing?.budget || 0);
  const [currency, setCurrency] = useState<Currency>(editing?.currency || 'PEN');
  const [notes, setNotes] = useState(editing?.notes || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !clientId) { alert('Nombre y cliente son requeridos'); return; }
    const { projectStore } = await import('../../lib/billing-store');
    const data = { name, clientId, description, status, startDate, endDate, budget, currency, notes };
    if (editing) { projectStore.update(editing.id, data); } else { projectStore.create(data); }
    onSave();
  };

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-start justify-center p-4 overflow-y-auto" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="w-full max-w-4xl bg-[#111] border border-white/10 rounded-2xl shadow-2xl my-8 max-h-[90vh] flex flex-col">
        <div className="sticky top-0 bg-[#111] border-b border-white/10 p-5 flex justify-between items-center z-10 rounded-t-2xl">
          <h3 className="font-bold text-lg">{editing ? 'Editar Proyecto' : 'Nuevo Proyecto'}</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Nombre del Proyecto *</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputClass} required placeholder="Ej: Rediseño Web Empresa XYZ" />
          </div>

          {/* Client — full width row with SearchableSelect */}
          <div className="z-[20]">
            <label className="text-xs text-gray-400 mb-1 block">Cliente *</label>
            <SearchableSelect
              options={clients.filter(c => (c as any).status !== 'suspended').map(c => ({ id: c.id, label: c.name, sublabel: `${c.documentType}: ${c.documentNumber}` }))}
              value={clientId}
              onChange={setClientId}
              placeholder="Buscar cliente por nombre o documento..."
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">Estado</label>
            <select value={status} onChange={e => setStatus(e.target.value as ProjectStatus)} className={`${inputClass} appearance-none`}>
              {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">Descripción / Alcance</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className={`${inputClass} resize-none`} placeholder="Detalla el alcance, entregables, tecnologías, etc." />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Fecha inicio</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Fecha fin (estimada)</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Presupuesto</label>
              <input type="number" value={budget || ''} onChange={e => setBudget(parseFloat(e.target.value) || 0)} className={`${inputClass} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`} step="0.01" min={0} />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Moneda</label>
              <select value={currency} onChange={e => setCurrency(e.target.value as Currency)} className={`${inputClass} appearance-none`}>
                <option value="PEN">Soles (PEN)</option>
                <option value="USD">Dólares (USD)</option>
                <option value="EUR">Euros (EUR)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">Notas internas</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className={`${inputClass} resize-none`} placeholder="Notas, recordatorios, URLs, etc." />
          </div>

          <button type="submit" className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-sm hover:shadow-lg hover:shadow-emerald-500/25 transition-all">
            <Save size={16} /> {editing ? 'Guardar Cambios' : 'Crear Proyecto'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ============================================
// DETAIL MODAL
// ============================================

function ProjectDetailModal({ project, client, quotations, receipts, onClose }: { project: Project; client?: Client; quotations: Quotation[]; receipts: Receipt[]; onClose: () => void; }) {
  const sym = CURRENCY_SYMBOLS[project.currency];
  const statusCfg = STATUS_CONFIG[project.status];
  const totalQuoted = quotations.reduce((s, q) => s + q.total, 0);
  const totalInvoiced = receipts.reduce((s, r) => s + r.netAmount, 0);
  const budgetUsed = project.budget > 0 ? Math.round((totalInvoiced / project.budget) * 100) : 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-start justify-center p-4 overflow-y-auto" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="w-full max-w-2xl bg-[#111] border border-white/10 rounded-2xl shadow-2xl my-8">
        <div className="p-6 border-b border-white/10">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold mb-1">{project.name}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span>{client?.name}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${statusCfg.color}`}>{statusCfg.label}</span>
              </div>
            </div>
            <button onClick={onClose} className="p-1 text-gray-400 hover:text-white"><X size={18} /></button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
              <p className="text-[10px] text-gray-500 uppercase">Presupuesto</p>
              <p className="text-lg font-bold">{sym} {project.budget.toFixed(2)}</p>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
              <p className="text-[10px] text-gray-500 uppercase">Cotizado</p>
              <p className="text-lg font-bold text-blue-400">{sym} {totalQuoted.toFixed(2)}</p>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
              <p className="text-[10px] text-gray-500 uppercase">Facturado</p>
              <p className="text-lg font-bold text-emerald-400">{sym} {totalInvoiced.toFixed(2)}</p>
            </div>
          </div>

          {/* Budget progress */}
          {project.budget > 0 && (
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Progreso de facturación</span>
                <span>{budgetUsed}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(budgetUsed, 100)}%` }} transition={{ duration: 0.8 }} className={`h-full rounded-full ${budgetUsed >= 100 ? 'bg-green-500' : 'bg-emerald-500'}`} />
              </div>
            </div>
          )}

          {/* Description */}
          {project.description && (
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold mb-2">Alcance / Descripción</p>
              <p className="text-sm text-gray-300 whitespace-pre-wrap">{project.description}</p>
            </div>
          )}

          {/* Dates */}
          <div className="flex gap-4 text-xs text-gray-400">
            {project.startDate && <span>Inicio: <strong className="text-white">{new Date(project.startDate).toLocaleDateString('es-PE')}</strong></span>}
            {project.endDate && <span>Fin estimado: <strong className="text-white">{new Date(project.endDate).toLocaleDateString('es-PE')}</strong></span>}
          </div>

          {/* Quotations */}
          <div>
            <p className="text-xs text-gray-500 uppercase font-bold mb-2">Cotizaciones ({quotations.length})</p>
            {quotations.length === 0 ? (
              <p className="text-sm text-gray-500">Sin cotizaciones vinculadas</p>
            ) : (
              <div className="space-y-1">
                {quotations.map(q => (
                  <div key={q.id} className="flex items-center justify-between p-2 rounded-lg bg-white/5 text-xs">
                    <span className="font-mono font-bold">{q.number}</span>
                    <span className="text-gray-400">{q.status}</span>
                    <span>{sym} {q.total.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Receipts */}
          <div>
            <p className="text-xs text-gray-500 uppercase font-bold mb-2">Recibos ({receipts.length})</p>
            {receipts.length === 0 ? (
              <p className="text-sm text-gray-500">Sin recibos vinculados</p>
            ) : (
              <div className="space-y-1">
                {receipts.map(r => (
                  <div key={r.id} className="flex items-center justify-between p-2 rounded-lg bg-white/5 text-xs">
                    <span className="font-mono font-bold">{r.number}</span>
                    <span className="text-gray-400">{r.sunatStatus}</span>
                    <span>{sym} {r.netAmount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          {project.notes && (
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold mb-2">Notas</p>
              <p className="text-sm text-gray-300 whitespace-pre-wrap">{project.notes}</p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-white/10 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-white/5 text-gray-300 text-sm font-medium hover:bg-white/10 transition-all">Cerrar</button>
        </div>
      </motion.div>
    </motion.div>
  );
}
