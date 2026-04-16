import React, { useState, useEffect } from 'react';
import {
  TrendingUp, Users, FileText, Receipt as ReceiptIcon, FileSignature,
  BookOpen, Plus, ArrowRight, AlertCircle, CheckCircle2,
  Clock, Activity,
} from 'lucide-react';
import {
  clientStore, quotationStore, receiptStore, contractStore,
  accountingStore, formatCurrency, formatDate,
  type Quotation, type Receipt as AdminReceipt, type Contract,
} from '../../../lib/admin-store';

type ModuleId = 'clients' | 'quotations' | 'receipts' | 'contracts' | 'accounting' | 'reports' | 'config' | 'dashboard';

interface Props { onNavigate?: (id: ModuleId) => void; }

// ── KPI card ─────────────────────────────────────────────────
function KpiCard({
  label, value, sub, icon: Icon, accent, onClick,
}: {
  label: string; value: string; sub: string;
  icon: React.ComponentType<any>; accent: string; onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all group ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${accent}`}>
          <Icon size={18} className="text-white" />
        </div>
        {onClick && <ArrowRight size={14} className="text-slate-600 group-hover:text-slate-400 transition-colors mt-1" />}
      </div>
      <p className="text-2xl font-bold text-white mb-0.5">{value}</p>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="text-xs text-slate-500 mt-1">{sub}</p>
    </button>
  );
}

// ── Status pill ───────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  draft:    'bg-slate-700 text-slate-300',
  sent:     'bg-sky-500/20 text-sky-400',
  accepted: 'bg-emerald-500/20 text-emerald-400',
  rejected: 'bg-red-500/20 text-red-400',
  expired:  'bg-amber-500/20 text-amber-400',
  pending:  'bg-amber-500/20 text-amber-400',
  issued:   'bg-emerald-500/20 text-emerald-400',
  voided:   'bg-red-500/20 text-red-400',
  signed:   'bg-emerald-500/20 text-emerald-400',
  active:   'bg-sky-500/20 text-sky-400',
  completed:'bg-slate-500/20 text-slate-400',
  cancelled:'bg-red-500/20 text-red-400',
};

function StatusPill({ status }: { status: string }) {
  const labels: Record<string, string> = {
    draft: 'Borrador', sent: 'Enviada', accepted: 'Aceptada',
    rejected: 'Rechazada', expired: 'Vencida',
    pending: 'Pendiente', issued: 'Emitido', voided: 'Anulado',
    signed: 'Firmado', active: 'Vigente',
    completed: 'Completado', cancelled: 'Cancelado',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${STATUS_COLORS[status] ?? 'bg-slate-700 text-slate-300'}`}>
      {labels[status] ?? status}
    </span>
  );
}

// ── Main ──────────────────────────────────────────────────────
export function DashboardModule({ onNavigate }: Props) {
  const [data, setData] = useState({
    clients: 0, activeClients: 0,
    quotations: [] as Quotation[],
    receipts: [] as AdminReceipt[],
    contracts: [] as Contract[],
    income: 0, expenses: 0, balance: 0,
    pendingAmount: 0,
  });

  useEffect(() => {
    const clients   = clientStore.getAll();
    const quotations = quotationStore.getAll();
    const receipts  = receiptStore.getAll();
    const contracts = contractStore.getAll();
    const acct      = accountingStore.getSummary();

    const pendingAmount = quotations
      .filter((q) => q.status === 'sent')
      .reduce((s, q) => s + q.total, 0);

    setData({
      clients: clients.length,
      activeClients: clients.filter((c) => c.status === 'active').length,
      quotations,
      receipts,
      contracts,
      income:   acct.totalIncome,
      expenses: acct.totalExpenses,
      balance:  acct.balance,
      pendingAmount,
    });
  }, []);

  const recentQuotations = data.quotations.slice(0, 4);
  const recentReceipts   = data.receipts.slice(0, 3);
  const pendingQuotations = data.quotations.filter((q) => q.status === 'sent').length;
  const unsignedContracts = data.contracts.filter((c) => c.status === 'draft' || c.status === 'sent').length;

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">

      {/* Page header */}
      <div>
        <h2 className="text-white font-bold text-xl">Resumen General</h2>
        <p className="text-slate-400 text-sm mt-0.5">
          {new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Alerts */}
      {(pendingQuotations > 0 || unsignedContracts > 0) && (
        <div className="flex flex-wrap gap-3">
          {pendingQuotations > 0 && (
            <button
              onClick={() => onNavigate?.('quotations')}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400 text-sm hover:bg-amber-500/20 transition-colors"
            >
              <AlertCircle size={15} />
              <span className="font-semibold">{pendingQuotations} cotización{pendingQuotations > 1 ? 'es' : ''} esperando respuesta</span>
              <ArrowRight size={13} />
            </button>
          )}
          {unsignedContracts > 0 && (
            <button
              onClick={() => onNavigate?.('contracts')}
              className="flex items-center gap-2 px-4 py-2.5 bg-sky-500/10 border border-sky-500/30 rounded-lg text-sky-400 text-sm hover:bg-sky-500/20 transition-colors"
            >
              <Clock size={15} />
              <span className="font-semibold">{unsignedContracts} contrato{unsignedContracts > 1 ? 's' : ''} sin firma</span>
              <ArrowRight size={13} />
            </button>
          )}
        </div>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Clientes Activos"
          value={String(data.activeClients)}
          sub={`${data.clients} clientes en total`}
          icon={Users}
          accent="bg-violet-500"
          onClick={() => onNavigate?.('clients')}
        />
        <KpiCard
          label="Cotizaciones"
          value={String(data.quotations.length)}
          sub={`S/ ${data.pendingAmount.toFixed(0)} por cobrar`}
          icon={FileText}
          accent="bg-sky-500"
          onClick={() => onNavigate?.('quotations')}
        />
        <KpiCard
          label="Recibos Emitidos"
          value={String(data.receipts.length)}
          sub={`${data.receipts.filter((r) => r.sunatStatus === 'pending').length} pendientes SUNAT`}
          icon={ReceiptIcon}
          accent="bg-emerald-500"
          onClick={() => onNavigate?.('receipts')}
        />
        <KpiCard
          label="Balance Neto"
          value={`S/ ${data.balance.toFixed(0)}`}
          sub={`Ingr. S/ ${data.income.toFixed(0)} · Egr. S/ ${data.expenses.toFixed(0)}`}
          icon={TrendingUp}
          accent="bg-amber-500"
          onClick={() => onNavigate?.('accounting')}
        />
      </div>

      {/* Content: Recent activity + Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Quotations */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
            <h3 className="text-white font-semibold text-sm flex items-center gap-2">
              <FileText size={15} className="text-sky-400" />
              Cotizaciones Recientes
            </h3>
            <button
              onClick={() => onNavigate?.('quotations')}
              className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1"
            >
              Ver todas <ArrowRight size={12} />
            </button>
          </div>

          {recentQuotations.length === 0 ? (
            <div className="py-10 text-center text-slate-500 text-sm">
              No hay cotizaciones aún —{' '}
              <button onClick={() => onNavigate?.('quotations')} className="text-sky-400 hover:underline">
                crea la primera
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/50">
              {recentQuotations.map((q) => {
                const client = clientStore.getById(q.clientId);
                return (
                  <div key={q.id} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-800/30 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-sky-500/10 flex items-center justify-center shrink-0">
                      <FileText size={13} className="text-sky-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{q.number}</p>
                      <p className="text-slate-500 text-xs truncate">{client?.name ?? 'Cliente eliminado'}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-white text-sm font-semibold">{formatCurrency(q.total, q.currency)}</p>
                      <StatusPill status={q.status} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right column: Quick actions + Recent receipts */}
        <div className="space-y-4">

          {/* Quick actions */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
              <Activity size={15} className="text-emerald-400" />
              Acciones Rápidas
            </h3>
            <div className="space-y-2">
              {[
                { label: 'Nueva Cotización',  icon: FileText,      id: 'quotations',  color: 'text-sky-400'     },
                { label: 'Nuevo Recibo',       icon: ReceiptIcon,   id: 'receipts',    color: 'text-emerald-400' },
                { label: 'Nuevo Contrato',     icon: FileSignature, id: 'contracts',   color: 'text-violet-400'  },
                { label: 'Nuevo Cliente',      icon: Users,         id: 'clients',     color: 'text-amber-400'   },
              ].map(({ label, icon: Icon, id, color }) => (
                <button
                  key={id}
                  onClick={() => onNavigate?.(id as ModuleId)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 transition-colors text-left group"
                >
                  <div className="w-7 h-7 rounded-md bg-slate-800 group-hover:bg-slate-700 flex items-center justify-center transition-colors">
                    <Icon size={13} className={color} />
                  </div>
                  <span className="text-slate-300 text-sm group-hover:text-white transition-colors">{label}</span>
                  <Plus size={13} className="ml-auto text-slate-600 group-hover:text-slate-400 transition-colors" />
                </button>
              ))}
            </div>
          </div>

          {/* Recent receipts */}
          {recentReceipts.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800">
                <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                  <ReceiptIcon size={14} className="text-emerald-400" />
                  Recibos Recientes
                </h3>
              </div>
              <div className="divide-y divide-slate-800/50">
                {recentReceipts.map((r) => (
                  <div key={r.id} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <p className="text-white text-xs font-semibold">{r.number}</p>
                      <p className="text-slate-500 text-[11px]">{formatDate(r.issueDate)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-emerald-400 text-sm font-bold">{formatCurrency(r.netAmount, r.currency)}</p>
                      <StatusPill status={r.sunatStatus} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
