import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Users, FileText, Receipt, BookOpen,
  BarChart3, Settings, LogOut, Menu, X, FileSignature,
  ChevronLeft, ChevronRight, Briefcase, Zap,
} from 'lucide-react';

// Modules
import { DashboardModule }   from './modules/DashboardModule';
import { ClientsModule }     from './modules/ClientsModule';
import { QuotationsModule }  from './modules/QuotationsModule';
import { ReceiptsModule }    from './modules/ReceiptsModule';
import { ContractsModule }   from './modules/ContractsModule';
import { AccountingModule }  from './modules/AccountingModule';
import { ReportsModule }     from './modules/ReportsModule';
import { ConfigModule }      from './modules/ConfigModule';

// Security utils
import { checkAdminSession } from '../../lib/security';

type ModuleId =
  | 'dashboard'
  | 'clients'
  | 'quotations'
  | 'receipts'
  | 'contracts'
  | 'accounting'
  | 'reports'
  | 'config';

interface NavItem {
  id: ModuleId;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: number;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard',   label: 'Resumen',       icon: LayoutDashboard },
  { id: 'clients',     label: 'Clientes',       icon: Users },
  { id: 'quotations',  label: 'Cotizaciones',   icon: FileText },
  { id: 'receipts',    label: 'Recibos',        icon: Receipt },
  { id: 'contracts',   label: 'Contratos',      icon: FileSignature },
  { id: 'accounting',  label: 'Contabilidad',   icon: BookOpen },
  { id: 'reports',     label: 'Reportes',       icon: BarChart3 },
  { id: 'config',      label: 'Configuración',  icon: Settings },
];

export default function AdminApp() {
  const [activeModule, setActiveModule] = useState<ModuleId>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check auth on mount
  useEffect(() => {
    const ok = checkAdminSession();
    setIsAuthenticated(ok);
    setLoading(false);
    if (!ok) {
      window.location.href = '/client-access';
    }
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0f172a' }}>
        <div style={{ textAlign: 'center' }}>
          <Zap size={32} style={{ color: '#10b981', margin: '0 auto 12px' }} />
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>Verificando sesión...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const handleLogout = () => {
    localStorage.removeItem('tt_admin_session');
    localStorage.removeItem('tt_admin_session_expiry');
    window.location.href = '/login-admin';
  };

  const handleNavigate = (id: ModuleId) => {
    setActiveModule(id);
    setMobileOpen(false);
  };

  const activeItem = NAV_ITEMS.find((n) => n.id === activeModule);

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':   return <DashboardModule onNavigate={handleNavigate} />;
      case 'clients':     return <ClientsModule />;
      case 'quotations':  return <QuotationsModule />;
      case 'receipts':    return <ReceiptsModule />;
      case 'contracts':   return <ContractsModule />;
      case 'accounting':  return <AccountingModule />;
      case 'reports':     return <ReportsModule />;
      case 'config':      return <ConfigModule />;
      default:            return <DashboardModule onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950">

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── SIDEBAR ─────────────────────────────────────────── */}
      <aside
        className={[
          'fixed md:static inset-y-0 left-0 z-50 flex flex-col',
          'bg-slate-900 border-r border-slate-800',
          'transition-all duration-300 ease-in-out',
          sidebarCollapsed ? 'md:w-16' : 'md:w-60',
          'w-60',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        ].join(' ')}
      >
        {/* Logo */}
        <div className={`flex items-center border-b border-slate-800 h-14 shrink-0 ${sidebarCollapsed ? 'justify-center px-2' : 'px-4 gap-3'}`}>
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          {!sidebarCollapsed && (
            <div className="min-w-0">
              <p className="text-white font-bold text-sm leading-tight truncate">Tomastech</p>
              <p className="text-emerald-400 text-[10px] font-semibold uppercase tracking-widest leading-tight">Panel Admin</p>
            </div>
          )}
          {/* Mobile close */}
          <button
            onClick={() => setMobileOpen(false)}
            className="ml-auto md:hidden text-slate-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                title={sidebarCollapsed ? item.label : undefined}
                className={[
                  'w-full flex items-center rounded-lg transition-all duration-150',
                  sidebarCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5',
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 font-semibold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800',
                ].join(' ')}
              >
                <Icon size={18} className={isActive ? 'text-emerald-400' : ''} />
                {!sidebarCollapsed && (
                  <span className="text-sm truncate">{item.label}</span>
                )}
                {!sidebarCollapsed && item.badge ? (
                  <span className="ml-auto bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {item.badge}
                  </span>
                ) : null}
                {/* Active indicator */}
                {isActive && !sidebarCollapsed && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        <div className="shrink-0 border-t border-slate-800 p-2 space-y-1">
          {/* Go to public site */}
          {!sidebarCollapsed && (
            <a
              href="/"
              className="flex items-center gap-3 px-3 py-2 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors text-sm"
            >
              <Briefcase size={15} />
              <span>Ver sitio público</span>
            </a>
          )}
          {/* Logout */}
          <button
            onClick={handleLogout}
            title={sidebarCollapsed ? 'Cerrar sesión' : undefined}
            className={[
              'w-full flex items-center rounded-lg transition-colors text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300',
              sidebarCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5',
            ].join(' ')}
          >
            <LogOut size={18} />
            {!sidebarCollapsed && <span>Cerrar sesión</span>}
          </button>
        </div>

        {/* Desktop toggle collapse button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-800 border border-slate-700 rounded-full items-center justify-center text-slate-400 hover:text-white transition-colors z-10"
        >
          {sidebarCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>

      {/* ── MAIN CONTENT ─────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="shrink-0 h-14 bg-slate-900 border-b border-slate-800 flex items-center gap-3 px-4">
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden text-slate-400 hover:text-white"
          >
            <Menu size={20} />
          </button>

          {/* Page title */}
          <div className="flex items-center gap-2">
            {activeItem && <activeItem.icon size={18} className="text-emerald-400" />}
            <h1 className="text-white font-semibold text-base">
              {activeItem?.label ?? 'Panel Admin'}
            </h1>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Date/time */}
          <span className="hidden sm:block text-slate-400 text-xs">
            {new Date().toLocaleDateString('es-PE', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
            })}
          </span>
        </header>

        {/* Module content — scrollable */}
        <div className="flex-1 overflow-y-auto bg-slate-950">
          {renderModule()}
        </div>
      </main>
    </div>
  );
}
