// @LEGACY - Panel Admin v1 - DO NOT USE in new code
// Preserved for reference. See /components/admin/ for v2
// Tracked for possible deletion in future.

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  FileText,
  Receipt,
  Settings,
  BarChart3,
  LogOut,
  Menu,
  X,
  Lock,
  ArrowRight,
  Loader2,
  Shield,
  FolderKanban,
  Calculator,
  Briefcase,
} from 'lucide-react';
import ClientManager from './ClientManager';
import QuotationList from './QuotationList';
import ReceiptList from './ReceiptList';
import BillingConfig from './BillingConfig';
import BillingReports from './BillingReports';
import ProjectManager from './ProjectManager';
import AccountingModule from './AccountingModule';
import ServicesModule from './ServicesModule';
import { 
  SECURITY, 
  hashPassword, 
  hashUsername,
  getDefaultUserHash,
  getAttempts, 
  getLockUntil, 
  isLocked, 
  recordFailedAttempt, 
  resetSecurityOnSuccess 
} from '../../lib/security';

// ============================================
// TYPES
// ============================================

type Section = 'overview' | 'clients' | 'projects' | 'services' | 'quotations' | 'receipts' | 'accounting' | 'config' | 'reports';

interface NavItem {
  id: Section;
  label: string;
  icon: any;
}

// SECURITY logic moved to src/lib/security.ts


// ============================================
// AUTH COMPONENT
// ============================================

function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [remainingAttempts, setRemainingAttempts] = useState(SECURITY.MAX_ATTEMPTS - getAttempts());
  const [lockCountdown, setLockCountdown] = useState(0);

  // Verificar si ya hay un bloqueo activo al montar
  useEffect(() => {
    const checkLock = () => {
      const lockUntil = getLockUntil();
      if (lockUntil && Date.now() < lockUntil) {
        setLockCountdown(Math.ceil((lockUntil - Date.now()) / 1000));
      } else {
        setLockCountdown(0);
      }
    };
    checkLock();
    const interval = setInterval(checkLock, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatCountdown = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verificar bloqueo
    if (isLocked()) {
      const remaining = Math.ceil((getLockUntil() - Date.now()) / 1000);
      setLockCountdown(remaining);
      setError(`🔒 Cuenta bloqueada. Espera ${formatCountdown(remaining)}`);
      return;
    }

    setIsLoading(true);
    setError('');

    // Anti-bot: delay artificial proporcional a intentos fallidos
    const delay = 1000 + (getAttempts() * 500);
    await new Promise(resolve => setTimeout(resolve, delay));

    try {
      // Validate username first
      const usernameHash = await hashUsername(username);
      const storedUserHash = localStorage.getItem(SECURITY.KEYS.usernameHash);
      const defaultUserHash = await getDefaultUserHash();
      const currentUserHash = storedUserHash || defaultUserHash;

      if (!storedUserHash) {
        localStorage.setItem(SECURITY.KEYS.usernameHash, defaultUserHash);
      }

      // Validate password
      const passwordHash = await hashPassword(password);
      const storedHash = localStorage.getItem(SECURITY.KEYS.hash);
      const oldHash = localStorage.getItem('tt_admin_hash');
      let currentHash = storedHash || oldHash;
      
      if (!currentHash) {
        localStorage.setItem(SECURITY.KEYS.hash, SECURITY.KEYS.defaultHash);
        currentHash = SECURITY.KEYS.defaultHash;
      }

      const userOk = usernameHash === currentUserHash;
      const passOk = passwordHash === currentHash || (oldHash && btoa(password) === oldHash);

      if (userOk && passOk) {
        // Login exitoso
        if (oldHash && btoa(password) === oldHash) {
          localStorage.setItem(SECURITY.KEYS.hash, passwordHash);
          localStorage.removeItem('tt_admin_hash');
        }
        localStorage.setItem(SECURITY.KEYS.session, Date.now().toString());
        resetSecurityOnSuccess();
        onLogin();
      } else {
        // Fallo
        const result = recordFailedAttempt();
        setRemainingAttempts(result.remainingAttempts);
        if (result.locked) {
          const lockSecs = Math.ceil((getLockUntil() - Date.now()) / 1000);
          setLockCountdown(lockSecs);
          setError(`🔒 Demasiados intentos. Bloqueado por ${formatCountdown(lockSecs)}`);
        } else {
          setError(`Contraseña incorrecta. ${result.remainingAttempts} intento${result.remainingAttempts !== 1 ? 's' : ''} restante${result.remainingAttempts !== 1 ? 's' : ''}.`);
        }
        setIsLoading(false);
      }
    } catch {
      setError('Error de autenticación');
      setIsLoading(false);
    }
  };

  const isLockedOut = lockCountdown > 0;

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-emerald-600/8 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-600/8 rounded-full blur-[150px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="p-8 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center shadow-lg ${isLockedOut ? 'bg-gradient-to-br from-red-500 to-red-700 shadow-red-500/20' : 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/20'}`}>
              <Shield size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1 tracking-tight">Panel Admin</h1>
            <p className="text-gray-400 text-sm">Tomastech — Sistema de Facturación</p>
          </div>

          {isLockedOut ? (
            <div className="text-center space-y-4">
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                <p className="text-red-400 text-sm font-medium mb-2">🔒 Acceso bloqueado temporalmente</p>
                <p className="text-3xl font-mono font-bold text-red-400">{formatCountdown(lockCountdown)}</p>
                <p className="text-xs text-gray-500 mt-2">Demasiados intentos fallidos</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username field */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-400 transition-colors">
                  <Shield size={18} />
                </div>
                <input
                  type="text"
                  placeholder="Usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                  required
                  autoFocus
                  autoComplete="off"
                />
              </div>

              {/* Password field */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-400 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                  required
                  minLength={6}
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm text-center"
                >
                  {error}
                </motion.p>
              )}

              {remainingAttempts < SECURITY.MAX_ATTEMPTS && !error && (
                <p className="text-xs text-yellow-400/70 text-center">
                  {remainingAttempts} intento{remainingAttempts !== 1 ? 's' : ''} restante{remainingAttempts !== 1 ? 's' : ''}
                </p>
              )}

              <motion.button
                type="submit"
                disabled={isLoading || !username || !password || password.length < 6}
                className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-3.5 font-semibold text-base transition-all hover:shadow-lg hover:shadow-emerald-500/25 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <span>Acceder</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </motion.button>


            </form>
          )}
        </div>


        {/* Back link */}
        <div className="text-center mt-6">
          <a
            href="/"
            className="text-gray-500 hover:text-white text-sm transition-colors"
          >
            ← Volver al sitio
          </a>
        </div>
      </motion.div>
    </div>
  );
}

// ============================================
// MAIN BILLING APP
// ============================================

export default function BillingApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeSection, setActiveSection] = useState<Section>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Verificar sesión activa (dentro de la ventana de SECURITY.SESSION_DURATION_MS)
    const session = localStorage.getItem(SECURITY.KEYS.session);
    if (session) {
      const elapsed = Date.now() - parseInt(session);
      if (elapsed < SECURITY.SESSION_DURATION_MS) {
        setIsAuthenticated(true);
      }
    }
  }, []);

  if (!isAuthenticated) {
    return <AdminLogin onLogin={() => setIsAuthenticated(true)} />;
  }

  const navItems: NavItem[] = [
    { id: 'overview', label: 'Resumen', icon: LayoutDashboard },
    { id: 'clients', label: 'Clientes', icon: Users },
    { id: 'projects', label: 'Proyectos', icon: FolderKanban },
    { id: 'services', label: 'Servicios', icon: Briefcase },
    { id: 'quotations', label: 'Cotizaciones', icon: FileText },
    { id: 'receipts', label: 'Recibos', icon: Receipt },
    { id: 'accounting', label: 'Contabilidad', icon: Calculator },
    { id: 'reports', label: 'Reportes', icon: BarChart3 },
    { id: 'config', label: 'Configuración', icon: Settings },
  ];

  const handleLogout = () => {
    localStorage.removeItem('tt_admin_session');
    setIsAuthenticated(false);
  };

  const handleNavClick = (section: Section) => {
    setActiveSection(section);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-[#050505] text-white font-sans overflow-hidden">
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-black/90 lg:bg-[#0a0a0a] border-r border-white/10 flex flex-col transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Receipt size={18} className="text-white" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-white block">Facturación</span>
              <span className="text-[10px] text-gray-500 uppercase tracking-wider">Tomastech</span>
            </div>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeSection === item.id
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
              }`}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
          >
            <LogOut size={18} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col w-full min-w-0">
        {/* Top bar */}
        <header className="h-16 border-b border-white/10 flex items-center justify-between px-4 lg:px-6 bg-[#050505]/80 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all"
            >
              <Menu size={20} />
            </button>
            <h2 className="text-lg font-bold capitalize">
              {navItems.find((n) => n.id === activeSection)?.label}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/"
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors hidden sm:block"
            >
              ← Ir al sitio
            </a>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Background glow */}
          <div className="fixed top-0 right-0 w-full h-full overflow-hidden pointer-events-none z-0">
            <div className="absolute top-[-20%] right-[-10%] w-[400px] h-[400px] bg-emerald-600/5 rounded-full blur-[150px]" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] bg-teal-600/5 rounded-full blur-[150px]" />
          </div>

          <div className="relative z-10 p-4 lg:p-6 max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
              >
                {activeSection === 'overview' && <OverviewSection onNavigate={handleNavClick} />}
                {activeSection === 'clients' && <ClientManager />}
                {activeSection === 'projects' && <ProjectManager />}
                {activeSection === 'services' && <ServicesModule />}
                {activeSection === 'quotations' && <QuotationList />}
                {activeSection === 'receipts' && <ReceiptList />}
                {activeSection === 'accounting' && <AccountingModule />}
                {activeSection === 'config' && <BillingConfig />}
                {activeSection === 'reports' && <BillingReports />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}

// ============================================
// OVERVIEW SECTION
// ============================================

const STATUS_BADGE: Record<string, string> = {
  draft:    'bg-gray-500/10 text-gray-400 border-gray-500/20',
  sent:     'bg-blue-500/10 text-blue-400 border-blue-500/20',
  accepted: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  paid:     'bg-green-500/10 text-green-400 border-green-500/20',
  cancelled:'bg-red-500/10 text-red-400 border-red-500/20',
};
const STATUS_LABEL: Record<string, string> = {
  draft: 'Borrador', sent: 'Enviada', accepted: 'Aceptada', paid: 'Pagada', cancelled: 'Cancelada',
};
const PROJECT_STATUS_LABEL: Record<string, string> = {
  planning: 'Planificación', active: 'Activo', paused: 'Pausado', completed: 'Completado', cancelled: 'Cancelado',
};
const CURR: Record<string, string> = { PEN: 'S/', USD: '$', EUR: '€' };

function OverviewSection({ onNavigate }: { onNavigate: (s: Section) => void }) {
  const [data, setData] = useState({
    totalClients: 0,
    totalQuotations: 0,
    totalReceipts: 0,
    pendingQuotations: 0,
    monthRevenue: 0,
    totalRevenue: 0,
    recentQuotations: [] as any[],
    activeProjects: [] as any[],
    clientMap: {} as Record<string, string>,
    hasData: false,
    seeding: false,
    seedLog: '',
  });

  const load = useCallback(() => {
    import('../../lib/billing-store').then(({ clientStore, quotationStore, receiptStore, projectStore }) => {
      const clients    = clientStore.getAll();
      const quotations = quotationStore.getAll();
      const receipts   = receiptStore.getAll();
      const projects   = projectStore.getAll();

      const now   = new Date();
      const month = now.getMonth();
      const year  = now.getFullYear();

      const monthReceipts = receipts.filter(r => {
        if (r.sunatStatus === 'voided') return false;
        const d = new Date(r.issueDate);
        return d.getMonth() === month && d.getFullYear() === year;
      });

      const clientMap: Record<string, string> = {};
      clients.forEach(c => { clientMap[c.id] = c.name; });

      setData(d => ({
        ...d,
        totalClients: clients.filter(c => c.status === 'active').length,
        totalQuotations: quotations.length,
        totalReceipts: receipts.length,
        pendingQuotations: quotations.filter(q => q.status === 'sent' || q.status === 'accepted').length,
        monthRevenue: monthReceipts.reduce((s, r) => s + r.netAmount, 0),
        totalRevenue: receipts.filter(r => r.sunatStatus !== 'voided').reduce((s, r) => s + r.netAmount, 0),
        recentQuotations: [...quotations].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5),
        activeProjects: projects.filter(p => p.status === 'active' || p.status === 'planning'),
        clientMap,
        hasData: clients.length > 0 || quotations.length > 0,
      }));
    });
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSeed = async () => {
    setData(d => ({ ...d, seeding: true, seedLog: 'Generando datos...' }));
    try {
      const { seedTestData } = await import('../../lib/billing-seed');
      const log = await seedTestData();
      setData(d => ({ ...d, seedLog: log, seeding: false }));
      load();
    } catch (e: any) {
      setData(d => ({ ...d, seedLog: 'Error: ' + e.message, seeding: false }));
    }
  };

  const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
    blue:   { bg: 'bg-blue-500/15',   text: 'text-blue-400',   border: 'border-blue-500/30' },
    purple: { bg: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-500/30' },
    emerald:{ bg: 'bg-emerald-500/15',text: 'text-emerald-400',border: 'border-emerald-500/30' },
    amber:  { bg: 'bg-amber-500/15',  text: 'text-amber-400',  border: 'border-amber-500/30' },
  };

  const cards = [
    { label: 'Clientes activos', value: data.totalClients, icon: Users,       color: 'blue',    onClick: () => onNavigate('clients') },
    { label: 'Cotizaciones',     value: data.totalQuotations, sublabel: data.pendingQuotations > 0 ? `${data.pendingQuotations} pendientes` : 'Al día', icon: FileText, color: 'purple', onClick: () => onNavigate('quotations') },
    { label: 'Recibos emitidos', value: data.totalReceipts,   icon: Receipt,    color: 'emerald', onClick: () => onNavigate('receipts') },
    { label: 'Ingresos del mes', value: `S/ ${data.monthRevenue.toFixed(2)}`, sublabel: `Total: S/ ${data.totalRevenue.toFixed(2)}`, icon: BarChart3, color: 'amber', onClick: () => onNavigate('reports') },
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-xl font-bold mb-0.5">Panel de Facturación</h3>
          <p className="text-gray-400 text-sm">Resumen general · {new Date().toLocaleDateString('es-PE', { month: 'long', year: 'numeric' })}</p>
        </div>
        {!data.hasData && (
          <button
            onClick={handleSeed}
            disabled={data.seeding}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 text-sm font-medium hover:bg-amber-500/20 transition-all disabled:opacity-50"
          >
            {data.seeding ? <Loader2 size={14} className="animate-spin" /> : <span>🌱</span>}
            Cargar datos de prueba
          </button>
        )}
      </div>

      {data.seedLog && (
        <pre className="p-3 rounded-xl bg-black/40 border border-white/10 text-xs text-emerald-400 whitespace-pre-wrap max-h-32 overflow-y-auto font-mono">{data.seedLog}</pre>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((card) => {
          const colors = colorClasses[card.color];
          return (
            <button
              key={card.label}
              onClick={card.onClick}
              className={`p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/[0.07] transition-all duration-200 text-left group active:scale-[0.99]`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-400 text-xs font-medium uppercase tracking-wide">{card.label}</span>
                <div className={`p-2 rounded-lg ${colors.bg} ${colors.text} group-hover:scale-110 transition-transform`}>
                  <card.icon size={16} />
                </div>
              </div>
              <h4 className="text-2xl font-bold tracking-tight">{card.value}</h4>
              {(card as any).sublabel && (
                <p className="text-xs text-gray-500 mt-1">{(card as any).sublabel}</p>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom row: Recent Quotations + Active Projects */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

        {/* Recent Quotations */}
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-sm">Últimas Cotizaciones</h4>
            <button onClick={() => onNavigate('quotations')} className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">Ver todas →</button>
          </div>
          {data.recentQuotations.length === 0 ? (
            <div className="py-8 text-center">
              <FileText size={28} className="mx-auto mb-2 text-gray-600" />
              <p className="text-gray-500 text-sm">Sin cotizaciones aún</p>
              <button onClick={() => onNavigate('quotations')} className="mt-3 px-4 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium hover:bg-emerald-500/20 transition-all">+ Nueva cotización</button>
            </div>
          ) : (
            <div className="space-y-2">
              {data.recentQuotations.map(q => (
                <div key={q.id} className="flex items-center justify-between gap-3 py-2.5 border-b border-white/5 last:border-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-white font-bold">{q.number}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${STATUS_BADGE[q.status] || STATUS_BADGE.draft}`}>{STATUS_LABEL[q.status] || q.status}</span>
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{data.clientMap[q.clientId] || 'Cliente'}</p>
                  </div>
                  <span className="text-sm font-bold text-white shrink-0">{CURR[q.currency] || ''} {q.total.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Projects */}
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-sm">Proyectos Activos</h4>
            <button onClick={() => onNavigate('projects')} className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">Ver todos →</button>
          </div>
          {data.activeProjects.length === 0 ? (
            <div className="py-8 text-center">
              <FolderKanban size={28} className="mx-auto mb-2 text-gray-600" />
              <p className="text-gray-500 text-sm">Sin proyectos activos</p>
              <button onClick={() => onNavigate('projects')} className="mt-3 px-4 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-medium hover:bg-blue-500/20 transition-all">+ Nuevo proyecto</button>
            </div>
          ) : (
            <div className="space-y-3">
              {data.activeProjects.slice(0, 4).map(p => {
                const start = new Date(p.startDate).getTime();
                const end   = new Date(p.endDate || p.startDate).getTime();
                const now   = Date.now();
                const pct   = (end > start) ? Math.min(100, Math.max(0, Math.round(((now - start) / (end - start)) * 100))) : 0;
                return (
                  <div key={p.id} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-white truncate">{p.name}</span>
                      <span className="text-xs text-gray-500 shrink-0">{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-[10px] text-gray-600">{data.clientMap[p.clientId] || ''} · {PROJECT_STATUS_LABEL[p.status] || p.status}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/8 flex flex-wrap gap-2">
        <button onClick={() => onNavigate('clients')}    className="px-4 py-2 rounded-xl bg-blue-500/10   text-blue-400   border border-blue-500/20   text-sm font-medium hover:bg-blue-500/20   transition-all">+ Nuevo Cliente</button>
        <button onClick={() => onNavigate('quotations')} className="px-4 py-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 text-sm font-medium hover:bg-purple-500/20 transition-all">+ Nueva Cotización</button>
        <button onClick={() => onNavigate('receipts')}   className="px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-sm font-medium hover:bg-emerald-500/20 transition-all">+ Nuevo Recibo</button>
        <button onClick={() => onNavigate('config')}     className="px-4 py-2 rounded-xl bg-gray-500/10  text-gray-400  border border-gray-500/20  text-sm font-medium hover:bg-gray-500/20  transition-all">⚙ Configuración</button>
      </div>
    </div>
  );
}
