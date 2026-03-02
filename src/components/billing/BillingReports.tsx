import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  DollarSign,
  FileText,
  Users,
  Calendar,
  Receipt,
  Download,
  PieChart,
} from 'lucide-react';
import type { Quotation, Receipt as ReceiptType, Client, Currency } from '../../lib/billing-store';

export default function BillingReports() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [receipts, setReceipts] = useState<ReceiptType[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [period, setPeriod] = useState<'all' | 'month' | 'year'>('all');

  useEffect(() => {
    import('../../lib/billing-store').then(({ quotationStore, receiptStore, clientStore }) => {
      setQuotations(quotationStore.getAll());
      setReceipts(receiptStore.getAll());
      setClients(clientStore.getAll());
    });
  }, []);

  const currencySymbol: Record<Currency, string> = { PEN: 'S/', USD: '$', EUR: '€' };
  const now = new Date();

  const filterByPeriod = <T extends { createdAt: string }>(items: T[]): T[] => {
    if (period === 'all') return items;
    return items.filter((item) => {
      const d = new Date(item.createdAt);
      if (period === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      if (period === 'year') return d.getFullYear() === now.getFullYear();
      return true;
    });
  };

  const filteredQuotations = filterByPeriod(quotations);
  const filteredReceipts = filterByPeriod(receipts);

  // Stats
  const totalRevenue = filteredReceipts.reduce((sum, r) => sum + r.netAmount, 0);
  const totalGross = filteredReceipts.reduce((sum, r) => sum + r.grossAmount, 0);
  const totalRetention = filteredReceipts.reduce((sum, r) => sum + r.retentionAmount, 0);
  const pendingQuotations = filteredQuotations.filter((q) => q.status === 'sent' || q.status === 'accepted');
  const pendingAmount = pendingQuotations.reduce((sum, q) => sum + q.total, 0);
  const paidQuotations = filteredQuotations.filter((q) => q.status === 'paid');

  // Revenue by month
  const revenueByMonth: Record<string, number> = {};
  filteredReceipts.forEach((r) => {
    const key = new Date(r.issueDate).toLocaleDateString('es-PE', { year: 'numeric', month: 'short' });
    revenueByMonth[key] = (revenueByMonth[key] || 0) + r.netAmount;
  });

  // Top clients
  const clientRevenue: Record<string, number> = {};
  filteredReceipts.forEach((r) => {
    clientRevenue[r.clientId] = (clientRevenue[r.clientId] || 0) + r.netAmount;
  });
  const topClients = Object.entries(clientRevenue)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([id, amount]) => ({
      name: clients.find((c) => c.id === id)?.name || 'N/A',
      amount,
    }));

  const maxRevenue = Math.max(...Object.values(revenueByMonth), 1);
  const maxClientRevenue = Math.max(...topClients.map((c) => c.amount), 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold">Reportes</h3>
          <p className="text-gray-400 text-sm">Resumen financiero de tu actividad</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={async () => {
              const { exportToExcel } = await import('../../lib/billing-store');
              const data = [
                { 'Métrica': 'Ingresos Netos', 'Valor': totalRevenue.toFixed(2), 'Moneda': 'PEN' },
                { 'Métrica': 'Monto Bruto', 'Valor': totalGross.toFixed(2), 'Moneda': 'PEN' },
                { 'Métrica': 'Retenciones', 'Valor': totalRetention.toFixed(2), 'Moneda': 'PEN' },
                { 'Métrica': 'Pendiente de Cobro', 'Valor': pendingAmount.toFixed(2), 'Moneda': 'PEN' },
                { 'Métrica': 'Cotizaciones Totales', 'Valor': filteredQuotations.length.toString(), 'Moneda': '' },
                { 'Métrica': 'Cotizaciones Pagadas', 'Valor': paidQuotations.length.toString(), 'Moneda': '' },
                { 'Métrica': 'Recibos Emitidos', 'Valor': filteredReceipts.length.toString(), 'Moneda': '' },
                { 'Métrica': 'Tasa de Conversión', 'Valor': `${filteredQuotations.length > 0 ? Math.round((paidQuotations.length / filteredQuotations.length) * 100) : 0}%`, 'Moneda': '' },
                ...topClients.map(c => ({ 'Métrica': `Top Cliente: ${c.name}`, 'Valor': c.amount.toFixed(2), 'Moneda': 'PEN' })),
              ];
              exportToExcel(data, 'reporte_financiero');
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 font-medium text-sm hover:bg-white/10 hover:text-white transition-all"
            title="Exportar Reporte"
          >
            <Download size={16} />
            Excel
          </button>
          <div className="flex gap-1 p-1 bg-white/5 rounded-xl border border-white/10">
            {[
              { id: 'all' as const, label: 'Todo' },
              { id: 'year' as const, label: 'Este Año' },
              { id: 'month' as const, label: 'Este Mes' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  period === p.id ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'text-gray-400 hover:text-white border border-transparent'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-400 text-xs">Ingresos Netos</span>
            <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400"><DollarSign size={16} /></div>
          </div>
          <h4 className="text-2xl font-bold">S/ {totalRevenue.toFixed(2)}</h4>
          <p className="text-xs text-gray-500 mt-1">Monto bruto: S/ {totalGross.toFixed(2)}</p>
        </div>

        <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-400 text-xs">Retenciones</span>
            <div className="p-2 rounded-lg bg-orange-500/15 text-orange-400"><TrendingUp size={16} /></div>
          </div>
          <h4 className="text-2xl font-bold">S/ {totalRetention.toFixed(2)}</h4>
          <p className="text-xs text-gray-500 mt-1">{filteredReceipts.length} recibos emitidos</p>
        </div>

        <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-400 text-xs">Pendiente de Cobro</span>
            <div className="p-2 rounded-lg bg-blue-500/15 text-blue-400"><FileText size={16} /></div>
          </div>
          <h4 className="text-2xl font-bold">S/ {pendingAmount.toFixed(2)}</h4>
          <p className="text-xs text-gray-500 mt-1">{pendingQuotations.length} cotizaciones pendientes</p>
        </div>

        <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-400 text-xs">Tasa de Conversión</span>
            <div className="p-2 rounded-lg bg-purple-500/15 text-purple-400"><Receipt size={16} /></div>
          </div>
          <h4 className="text-2xl font-bold">
            {filteredQuotations.length > 0 ? Math.round((paidQuotations.length / filteredQuotations.length) * 100) : 0}%
          </h4>
          <p className="text-xs text-gray-500 mt-1">{paidQuotations.length} de {filteredQuotations.length} cotizaciones</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue by Month */}
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
          <h4 className="font-semibold text-sm mb-4 flex items-center gap-2"><Calendar size={16} className="text-emerald-400" /> Ingresos por Mes</h4>
          {Object.keys(revenueByMonth).length === 0 ? (
            <p className="text-gray-500 text-sm py-8 text-center">Sin datos aún</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(revenueByMonth).map(([month, amount]) => (
                <div key={month} className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 w-20 shrink-0">{month}</span>
                  <div className="flex-1 h-6 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(amount / maxRevenue) * 100}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                    />
                  </div>
                  <span className="text-xs font-mono text-gray-300 w-24 text-right">S/ {amount.toFixed(0)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Clients */}
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
          <h4 className="font-semibold text-sm mb-4 flex items-center gap-2"><Users size={16} className="text-blue-400" /> Top Clientes</h4>
          {topClients.length === 0 ? (
            <p className="text-gray-500 text-sm py-8 text-center">Sin datos aún</p>
          ) : (
            <div className="space-y-2">
              {topClients.map((client, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 w-28 shrink-0 truncate">{client.name}</span>
                  <div className="flex-1 h-6 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(client.amount / maxClientRevenue) * 100}%` }}
                      transition={{ duration: 0.8, delay: i * 0.1 }}
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                    />
                  </div>
                  <span className="text-xs font-mono text-gray-300 w-24 text-right">S/ {client.amount.toFixed(0)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quotation Status Distribution */}
      <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
        <h4 className="font-semibold text-sm mb-4 flex items-center gap-2"><PieChart size={16} className="text-purple-400" /> Distribución de Cotizaciones</h4>
        {filteredQuotations.length === 0 ? (
          <p className="text-gray-500 text-sm py-8 text-center">Sin datos aún</p>
        ) : (
          <div className="space-y-2">
            {[
              { status: 'draft', label: 'Borrador', color: 'from-gray-500 to-gray-600' },
              { status: 'sent', label: 'Enviada', color: 'from-blue-500 to-blue-600' },
              { status: 'accepted', label: 'Aceptada', color: 'from-emerald-500 to-emerald-600' },
              { status: 'paid', label: 'Pagada', color: 'from-green-400 to-green-500' },
              { status: 'cancelled', label: 'Cancelada', color: 'from-red-500 to-red-600' },
            ].map(({ status, label, color }) => {
              const count = filteredQuotations.filter(q => q.status === status).length;
              if (count === 0 && status !== 'paid') return null;
              const pct = (count / filteredQuotations.length) * 100;
              return (
                <div key={status} className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 w-20 shrink-0">{label}</span>
                  <div className="flex-1 h-6 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className={`h-full bg-gradient-to-r ${color} rounded-full flex items-center justify-end pr-2`}
                    >
                      {pct > 15 && <span className="text-[10px] font-bold text-white">{count}</span>}
                    </motion.div>
                  </div>
                  <span className="text-xs font-mono text-gray-300 w-12 text-right">{Math.round(pct)}%</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
