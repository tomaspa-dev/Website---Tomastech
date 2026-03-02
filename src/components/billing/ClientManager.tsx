import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  FileText,
  Save,
  Download,
  Eye,
  PauseCircle,
  PlayCircle,
} from 'lucide-react';
import type { Client, DocumentType } from '../../lib/billing-store';
import Pagination from '../common/Pagination';

export default function ClientManager() {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [viewingClient, setViewingClient] = useState<Client | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  useEffect(() => { setCurrentPage(1); }, [searchQuery]);

  // Form state
  const [form, setForm] = useState({
    name: '',
    documentType: 'DNI' as DocumentType,
    documentNumber: '',
    email: '',
    phone: '',
    country: 'PE',
    address: '',
    notes: '',
  });

  useEffect(() => { loadClients(); }, []);

  const loadClients = async () => {
    const { clientStore } = await import('../../lib/billing-store');
    setClients(clientStore.getAll());
  };

  const resetForm = () => {
    setForm({ name: '', documentType: 'DNI', documentNumber: '', email: '', phone: '', country: 'PE', address: '', notes: '' });
    setEditingClient(null);
    setIsFormOpen(false);
  };

  const handleEdit = (client: Client) => {
    setForm({
      name: client.name,
      documentType: client.documentType,
      documentNumber: client.documentNumber,
      email: client.email,
      phone: client.phone,
      country: client.country,
      address: client.address,
      notes: client.notes,
    });
    setEditingClient(client);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { clientStore } = await import('../../lib/billing-store');
    if (editingClient) {
      clientStore.update(editingClient.id, form);
    } else {
      clientStore.create({ ...form, status: 'active' });
    }
    loadClients();
    resetForm();
  };

  const handleDelete = async (id: string) => {
    const { clientStore } = await import('../../lib/billing-store');
    clientStore.delete(id);
    setConfirmDelete(null);
    loadClients();
  };

  const handleToggleSuspend = async (client: Client) => {
    const { clientStore } = await import('../../lib/billing-store');
    const newStatus = (client.status || 'active') === 'active' ? 'suspended' : 'active';
    clientStore.update(client.id, { status: newStatus });
    loadClients();
  };

  const handleExport = async () => {
    const { exportClients } = await import('../../lib/billing-store');
    exportClients(clients);
  };

  // Smart document type options based on selected country
  const documentTypeOptions = useMemo(() => {
    if (form.country === 'PE') {
      return [
        { value: 'DNI', label: 'DNI' },
        { value: 'RUC', label: 'RUC' },
        { value: 'CE', label: 'Carné de Extranjería' },
        { value: 'PASAPORTE', label: 'Pasaporte' },
        { value: 'OTHER', label: 'Otro' },
      ];
    }
    return [
      { value: 'PASAPORTE', label: 'Pasaporte' },
      { value: 'TAX_ID', label: 'Tax ID / NIT' },
      { value: 'DOC_TRIB_NO_DOM', label: 'Doc. Tributario No Domiciliado' },
      { value: 'OTHER', label: 'Otro documento' },
    ];
  }, [form.country]);

  // Reset document type when country changes
  const handleCountryChange = (newCountry: string) => {
    const defaultDocType = newCountry === 'PE' ? 'DNI' : 'PASAPORTE';
    setForm({ ...form, country: newCountry, documentType: defaultDocType as DocumentType });
  };

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.documentNumber.includes(searchQuery) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const docTypeLabels: Record<string, string> = {
    DNI: 'DNI', RUC: 'RUC', PASAPORTE: 'Pasaporte', CE: 'Carné Ext.',
    DOC_TRIB_NO_DOM: 'Doc. No Dom.', TAX_ID: 'Tax ID', OTHER: 'Otro',
  };

  const countryLabels: Record<string, string> = {
    PE: '🇵🇪 Perú', US: '🇺🇸 EE.UU.', ES: '🇪🇸 España', MX: '🇲🇽 México',
    CO: '🇨🇴 Colombia', AR: '🇦🇷 Argentina', CL: '🇨🇱 Chile', BR: '🇧🇷 Brasil', OTHER: '🌍 Otro',
  };

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all";
  const selectClass = `${inputClass} appearance-none cursor-pointer`;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold">Clientes</h3>
          <p className="text-gray-400 text-sm">{clients.length} clientes registrados</p>
        </div>
        <div className="flex items-center gap-2">
          {clients.length > 0 && (
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 font-medium text-sm hover:bg-white/10 hover:text-white transition-all"
              title="Exportar a Excel"
            >
              <Download size={16} />
              Excel
            </button>
          )}
          <button
            onClick={() => { resetForm(); setIsFormOpen(true); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-sm hover:shadow-lg hover:shadow-emerald-500/25 transition-all hover:scale-[1.02]"
          >
            <Plus size={16} />
            Nuevo Cliente
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Buscar por nombre, documento o email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-all"
        />
      </div>

      {/* Client List */}
      {filteredClients.length === 0 ? (
        <div className="py-16 text-center text-gray-500">
          <User size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">{clients.length === 0 ? 'No hay clientes aún' : 'Sin resultados'}</p>
          <p className="text-xs mt-1">
            {clients.length === 0 ? 'Agrega tu primer cliente para comenzar' : 'Intenta con otro término de búsqueda'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-3">
            {paginatedClients.map((client) => {
              const isSuspended = client.status === 'suspended';
              return (
            <motion.div
              key={client.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-2xl border transition-all group ${isSuspended ? 'bg-white/[0.02] border-white/5 opacity-60' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`font-semibold text-sm truncate ${isSuspended ? 'line-through text-gray-500' : ''}`}>{client.name}</h4>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-gray-300 shrink-0">
                      {docTypeLabels[client.documentType] || client.documentType}: {client.documentNumber}
                    </span>
                    {isSuspended && (
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                        Suspendido
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
                    {client.email && (
                      <span className="flex items-center gap-1"><Mail size={11} /> {client.email}</span>
                    )}
                    {client.phone && (
                      <span className="flex items-center gap-1"><Phone size={11} /> {client.phone}</span>
                    )}
                    <span className="flex items-center gap-1"><Globe size={11} /> {countryLabels[client.country] || client.country}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Ver */}
                  <button
                    onClick={() => setViewingClient(client)}
                    className="p-2 rounded-lg text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all"
                    title="Ver"
                  >
                    <Eye size={15} />
                  </button>
                  {/* Editar */}
                  <button
                    onClick={() => handleEdit(client)}
                    className="p-2 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                    title="Editar"
                  >
                    <Edit3 size={15} />
                  </button>
                  {/* Suspender / Reanudar */}
                  <button
                    onClick={() => handleToggleSuspend(client)}
                    className={`p-2 rounded-lg transition-all ${isSuspended ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-gray-400 hover:text-amber-400 hover:bg-amber-500/10'}`}
                    title={isSuspended ? 'Reanudar' : 'Suspender'}
                  >
                    {isSuspended ? <PlayCircle size={15} /> : <PauseCircle size={15} />}
                  </button>
                  {/* Eliminar */}
                  {confirmDelete === client.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(client.id)}
                        className="px-2 py-1 rounded text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20"
                      >
                        Eliminar
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="px-2 py-1 rounded text-xs text-gray-400 hover:text-white"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(client.id)}
                      className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                      title="Eliminar"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
              );
            })}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredClients.length / pageSize)}
            onPageChange={setCurrentPage}
            totalRecords={filteredClients.length}
            pageSize={pageSize}
          />
        </>
      )}

      {/* View Modal (Read-Only) */}
      <AnimatePresence>
        {viewingClient && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-start justify-center p-4 overflow-y-auto"
            onClick={(e) => { if (e.target === e.currentTarget) setViewingClient(null); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-[#111] border border-white/10 rounded-2xl shadow-2xl my-8"
            >
              <div className="sticky top-0 bg-[#111] border-b border-white/10 p-5 flex justify-between items-center z-10">
                <h3 className="font-bold text-lg flex items-center gap-2"><Eye size={18} className="text-cyan-400" /> Datos del Cliente</h3>
                <button onClick={() => setViewingClient(null)} className="p-1 text-gray-400 hover:text-white"><X size={18} /></button>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Nombre / Razón Social</p>
                    <p className="text-sm font-medium">{viewingClient.name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Estado</p>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${(viewingClient.status || 'active') === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                      {(viewingClient.status || 'active') === 'active' ? 'Activo' : 'Suspendido'}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Tipo de Documento</p>
                    <p className="text-sm">{docTypeLabels[viewingClient.documentType]}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">N° Documento</p>
                    <p className="text-sm font-mono">{viewingClient.documentNumber}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Email</p>
                    <p className="text-sm">{viewingClient.email || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Teléfono</p>
                    <p className="text-sm">{viewingClient.phone || '—'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">País</p>
                    <p className="text-sm">{countryLabels[viewingClient.country] || viewingClient.country}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Dirección</p>
                    <p className="text-sm">{viewingClient.address || '—'}</p>
                  </div>
                </div>
                {viewingClient.notes && (
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Notas</p>
                    <p className="text-sm text-gray-400">{viewingClient.notes}</p>
                  </div>
                )}
                <div className="text-[10px] text-gray-600 pt-2 border-t border-white/5">
                  Creado: {new Date(viewingClient.createdAt).toLocaleString('es-PE')} · Actualizado: {new Date(viewingClient.updatedAt).toLocaleString('es-PE')}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-start justify-center p-4 overflow-y-auto"
            onClick={(e) => { if (e.target === e.currentTarget) resetForm(); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-[#111] border border-white/10 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto my-8"
            >
              <div className="sticky top-0 bg-[#111] border-b border-white/10 p-5 flex justify-between items-center z-10">
                <h3 className="font-bold text-lg">{editingClient ? 'Editar Cliente' : 'Nuevo Cliente'}</h3>
                <button onClick={resetForm} className="p-1 text-gray-400 hover:text-white"><X size={18} /></button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                {/* Name */}
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Nombre / Razón Social *</label>
                  <div className="relative">
                    <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-9 pr-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Country FIRST */}
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">País</label>
                  <div className="relative">
                    <Globe size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none z-10" />
                    <select
                      value={form.country}
                      onChange={(e) => handleCountryChange(e.target.value)}
                      className={`${selectClass} pl-9`}
                    >
                      <option value="PE">🇵🇪 Perú</option>
                      <option value="US">🇺🇸 Estados Unidos</option>
                      <option value="ES">🇪🇸 España</option>
                      <option value="MX">🇲🇽 México</option>
                      <option value="CO">🇨🇴 Colombia</option>
                      <option value="AR">🇦🇷 Argentina</option>
                      <option value="CL">🇨🇱 Chile</option>
                      <option value="BR">🇧🇷 Brasil</option>
                      <option value="OTHER">🌍 Otro</option>
                    </select>
                  </div>
                </div>

                {/* Document Row */}
                <div className="grid grid-cols-5 gap-3">
                  <div className="col-span-2">
                    <label className="text-xs text-gray-400 mb-1 block">Tipo Doc.</label>
                    <select
                      value={form.documentType}
                      onChange={(e) => setForm({ ...form, documentType: e.target.value as DocumentType })}
                      className={selectClass}
                    >
                      {documentTypeOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-3">
                    <label className="text-xs text-gray-400 mb-1 block">N° Documento *</label>
                    <div className="relative">
                      <FileText size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        type="text"
                        value={form.documentNumber}
                        onChange={(e) => setForm({ ...form, documentNumber: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-9 pr-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                        required
                        placeholder={form.documentType === 'DNI' ? '12345678' : form.documentType === 'RUC' ? '20XXXXXXXXX' : ''}
                      />
                    </div>
                  </div>
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Email</label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-9 pr-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Teléfono</label>
                    <div className="relative">
                      <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-9 pr-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                        placeholder="+51 999 999 999"
                      />
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Dirección</label>
                  <div className="relative">
                    <MapPin size={15} className="absolute left-3 top-3 text-gray-500" />
                    <input
                      type="text"
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-9 pr-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Notas</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    rows={2}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all resize-none"
                    placeholder="Notas internas sobre el cliente..."
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-sm hover:shadow-lg hover:shadow-emerald-500/25 transition-all"
                >
                  <Save size={16} />
                  {editingClient ? 'Guardar Cambios' : 'Crear Cliente'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
