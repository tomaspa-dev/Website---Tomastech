/**
 * ReportsModule.tsx — Panel Admin v2
 * Exportación y resumen de todos los módulos.
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  BarChart3, Download, FileText, Receipt, Users,
  BookOpen, TrendingUp, TrendingDown, Calendar,
} from 'lucide-react';
import {
  clientStore, quotationStore, receiptStore, accountingStore,
  formatCurrency, formatDate,
  type Currency,
} from '../../../lib/admin-store';

const SYM: Record<Currency, string> = { PEN: 'S/', USD: 'US$', EUR: '€' };

// ── Report Card ───────────────────────────────────────────────

function ReportCard({
  title, subtitle, icon: Icon, accent, onExport, count,
}: {
  title: string; subtitle: string;
  icon: React.ComponentType<any>; accent: string;
  onExport: () => void; count: number;
}) {
  return (
    <div className={`bg-slate-900 border rounded-xl p-5 flex flex-col gap-4 ${accent}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-slate-800`}>
            <Icon size={18} className="text-slate-300" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">{title}</p>
            <p className="text-slate-400 text-xs">{subtitle}</p>
          </div>
        </div>
        <span className="text-2xl font-bold text-white">{count}</span>
      </div>
      <button
        onClick={onExport}
        className="flex items-center justify-center gap-2 w-full py-2.5 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg text-sm font-semibold transition-colors"
      >
        <Download size={14} />Exportar CSV
      </button>
    </div>
  );
}

// ── Export helpers ────────────────────────────────────────────

function downloadCSV(filename: string, rows: string[][]) {
  const csv  = rows.map((r) => r.map((v) => `"${(v ?? '').toString().replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const a    = document.createElement('a');
  a.href     = URL.createObjectURL(blob);
  a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

// ══════════════════════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════════════════════

export function ReportsModule() {
  const [period, setPeriod] = useState<'all' | '30' | '90' | '365'>('all');

  const cutoff = useMemo(() => {
    if (period === 'all') return null;
    const d = new Date();
    d.setDate(d.getDate() - parseInt(period));
    return d.toISOString().split('T')[0];
  }, [period]);

  const clients    = useMemo(() => clientStore.getAll(), []);
  const quotations = useMemo(() => quotationStore.getAll().filter((q) => !cutoff || q.issueDate >= cutoff), [cutoff]);
  const receipts   = useMemo(() => receiptStore.getAll().filter((r) => !cutoff || r.issueDate >= cutoff), [cutoff]);
  const entries    = useMemo(() => accountingStore.getAll().filter((e) => !cutoff || e.date >= cutoff), [cutoff]);

  const summary = useMemo(() => accountingStore.getSummary(), [entries]);

  // ── KPIs ──────────────────────────────────────────────────
  const totalBilled  = receipts.reduce((s, r) => s + r.grossAmount, 0);
  const totalNet     = receipts.reduce((s, r) => s + r.netAmount, 0);
  const totalRet     = receipts.reduce((s, r) => s + r.retentionAmount, 0);
  const quotAccepted = quotations.filter((q) => q.status === 'accepted').length;
  const convRate     = quotations.length > 0 ? (quotAccepted / quotations.length * 100).toFixed(0) : '0';

  // ── Export functions ───────────────────────────────────────
  const exportClients = () => {
    downloadCSV('Clientes_Tomastech', [
      ['Nombre', 'Tipo Doc', 'Nº Doc', 'Email', 'Teléfono', 'País', 'Dirección', 'Estado', 'Creado'],
      ...clients.map((c) => [c.name, c.documentType, c.documentNumber, c.email, c.phone, c.country, c.address, c.status, formatDate(c.createdAt)]),
    ]);
  };

  const exportQuotations = () => {
    downloadCSV('Cotizaciones_Tomastech', [
      ['Número', 'Cliente', 'Fecha', 'Estado', 'Moneda', 'Subtotal', 'Descuento', 'Total', 'Retención', 'Neto'],
      ...quotations.map((q) => {
        const client = clientStore.getById(q.clientId);
        return [q.number, client?.name ?? '', q.issueDate, q.status, q.currency, q.subtotal.toFixed(2), q.discountAmount.toFixed(2), q.total.toFixed(2), q.retentionAmount.toFixed(2), q.netToReceive.toFixed(2)];
      }),
    ]);
  };

  const exportReceipts = () => {
    downloadCSV('Recibos_Tomastech', [
      ['Número', 'Serie', 'Cliente', 'Servicio', 'Bruto', 'Retención', 'Neto', 'Fecha', 'Estado SUNAT', 'Referencia'],
      ...receipts.map((r) => {
        const client = clientStore.getById(r.clientId);
        return [r.number, r.series, client?.name ?? '', r.serviceDescription, r.grossAmount.toFixed(2), r.retentionAmount.toFixed(2), r.netAmount.toFixed(2), r.issueDate, r.sunatStatus, r.paymentReference];
      }),
    ]);
  };

  const exportAccounting = () => {
    downloadCSV('Contabilidad_Tomastech', [
      ['Fecha', 'Tipo', 'Categoría', 'Descripción', 'Monto', 'Moneda', 'Notas'],
      ...entries.map((e) => [e.date, e.type === 'income' ? 'Ingreso' : 'Gasto', e.category, e.description, e.amount.toFixed(2), e.currency, e.notes]),
    ]);
  };

  const exportAll = () => {
    exportClients();
    setTimeout(exportQuotations, 200);
    setTimeout(exportReceipts, 400);
    setTimeout(exportAccounting, 600);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
        <div>
          <h2 className="text-white font-semibold text-lg flex items-center gap-2">
            <BarChart3 size={20} className="text-amber-400" />Reportes y Exportación
          </h2>
          <p className="text-slate-400 text-sm mt-0.5">Descarga tus datos en formato CSV listo para Excel</p>
        </div>
        <button
          onClick={exportAll}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white rounded-lg text-sm font-semibold transition-colors"
        >
          <Download size={16} />Exportar Todo
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6 max-w-5xl mx-auto">

          {/* Period filter */}
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-slate-500" />
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Período:</span>
            <div className="flex bg-slate-800 rounded-lg p-0.5 gap-0.5">
              {([['all', 'Todos'], ['30', 'Últimos 30 días'], ['90', 'Últimos 90 días'], ['365', 'Último año']] as const).map(([val, label]) => (
                <button key={val} onClick={() => setPeriod(val)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${period === val ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Summary KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Facturado Bruto', value: `S/ ${totalBilled.toFixed(2)}`, sub: `${receipts.length} recibos`, color: 'text-white' },
              { label: 'Neto Recibido', value: `S/ ${totalNet.toFixed(2)}`, sub: `después de retención`, color: 'text-emerald-400' },
              { label: 'Retención IR', value: `S/ ${totalRet.toFixed(2)}`, sub: `retenido por clientes`, color: 'text-amber-400' },
              { label: 'Tasa Conversión', value: `${convRate}%`, sub: `${quotAccepted}/${quotations.length} cotizaciones`, color: 'text-sky-400' },
            ].map(({ label, value, sub, color }) => (
              <div key={label} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">{label}</p>
                <p className={`text-xl font-bold ${color}`}>{value}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{sub}</p>
              </div>
            ))}
          </div>

          {/* Export cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
            <ReportCard
              title="Clientes"
              subtitle="Listado completo con documentos y contacto"
              icon={Users}
              accent="border-emerald-500/20"
              onExport={exportClients}
              count={clients.length}
            />
            <ReportCard
              title="Cotizaciones"
              subtitle="Todas las cotizaciones con importes y estado"
              icon={FileText}
              accent="border-sky-500/20"
              onExport={exportQuotations}
              count={quotations.length}
            />
            <ReportCard
              title="Recibos por Honorarios"
              subtitle="Recibos emitidos con retención IR"
              icon={Receipt}
              accent="border-violet-500/20"
              onExport={exportReceipts}
              count={receipts.length}
            />
            <ReportCard
              title="Contabilidad"
              subtitle="Libro de ingresos y gastos"
              icon={BookOpen}
              accent="border-amber-500/20"
              onExport={exportAccounting}
              count={entries.length}
            />
          </div>

          {/* Income breakdown */}
          {entries.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
                <TrendingUp size={15} className="text-emerald-400" />
                Balance General del Período
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-3">Ingresos por Categoría</p>
                  {Object.entries(
                    entries.filter((e) => e.type === 'income').reduce<Record<string, number>>((acc, e) => {
                      acc[e.category] = (acc[e.category] ?? 0) + e.amount;
                      return acc;
                    }, {})
                  ).sort(([, a], [, b]) => b - a).slice(0, 5).map(([cat, amount]) => {
                    const max = entries.filter((e) => e.type === 'income').reduce((s, e) => s + e.amount, 0) || 1;
                    return (
                      <div key={cat} className="mb-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-300 truncate pr-2">{cat}</span>
                          <span className="text-emerald-400 font-semibold shrink-0">S/ {amount.toFixed(0)}</span>
                        </div>
                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${(amount / max) * 100}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-3">Gastos por Categoría</p>
                  {Object.entries(
                    entries.filter((e) => e.type === 'expense').reduce<Record<string, number>>((acc, e) => {
                      acc[e.category] = (acc[e.category] ?? 0) + e.amount;
                      return acc;
                    }, {})
                  ).sort(([, a], [, b]) => b - a).slice(0, 5).map(([cat, amount]) => {
                    const max = entries.filter((e) => e.type === 'expense').reduce((s, e) => s + e.amount, 0) || 1;
                    return (
                      <div key={cat} className="mb-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-300 truncate pr-2">{cat}</span>
                          <span className="text-red-400 font-semibold shrink-0">S/ {amount.toFixed(0)}</span>
                        </div>
                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-red-500 rounded-full transition-all" style={{ width: `${(amount / max) * 100}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
