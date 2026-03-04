import React, { useState, useEffect } from 'react';
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

function OverviewSection({ onNavigate }: { onNavigate: (s: Section) => void }) {
  const [stats, setStats] = useState({
    totalClients: 0,
    totalQuotations: 0,
    totalReceipts: 0,
    pendingQuotations: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    // Dynamic import to avoid SSR issues
    import('../../lib/billing-store').then(({ clientStore, quotationStore, receiptStore }) => {
      const clients = clientStore.getAll();
      const quotations = quotationStore.getAll();
      const receipts = receiptStore.getAll();

      setStats({
        totalClients: clients.length,
        totalQuotations: quotations.length,
        totalReceipts: receipts.length,
        pendingQuotations: quotations.filter((q) => q.status === 'sent' || q.status === 'accepted').length,
        totalRevenue: receipts.reduce((sum, r) => sum + r.netAmount, 0),
      });
    });
  }, []);

  const cards = [
    {
      label: 'Clientes',
      value: stats.totalClients,
      icon: Users,
      color: 'blue',
      onClick: () => onNavigate('clients'),
    },
    {
      label: 'Cotizaciones',
      value: stats.totalQuotations,
      sublabel: stats.pendingQuotations > 0 ? `${stats.pendingQuotations} pendientes` : 'Sin pendientes',
      icon: FileText,
      color: 'purple',
      onClick: () => onNavigate('quotations'),
    },
    {
      label: 'Recibos Emitidos',
      value: stats.totalReceipts,
      icon: Receipt,
      color: 'emerald',
      onClick: () => onNavigate('receipts'),
    },
    {
      label: 'Ingresos Totales',
      value: `S/ ${stats.totalRevenue.toFixed(2)}`,
      icon: BarChart3,
      color: 'amber',
      onClick: () => onNavigate('reports'),
    },
  ];

  const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
    blue: { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/20' },
    purple: { bg: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-500/20' },
    emerald: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/20' },
    amber: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/20' },
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold mb-1">Panel de Facturación</h3>
        <p className="text-gray-400 text-sm">Resumen general de tu actividad</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((card) => {
          const colors = colorClasses[card.color];
          return (
            <button
              key={card.label}
              onClick={card.onClick}
              className={`p-5 rounded-2xl bg-white/5 border border-white/10 hover:${colors.border} hover:bg-white/[0.07] transition-all duration-300 text-left group`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-400 text-sm">{card.label}</span>
                <div className={`p-2 rounded-lg ${colors.bg} ${colors.text}`}>
                  <card.icon size={18} />
                </div>
              </div>
              <h4 className="text-3xl font-bold">{card.value}</h4>
              {card.sublabel && (
                <p className="text-xs text-gray-500 mt-1">{card.sublabel}</p>
              )}
            </button>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
        <h4 className="font-semibold mb-4 text-sm text-gray-300">Acciones rápidas</h4>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => onNavigate('clients')}
            className="px-4 py-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 text-sm font-medium hover:bg-blue-500/20 transition-all"
          >
            + Nuevo Cliente
          </button>
          <button
            onClick={() => onNavigate('quotations')}
            className="px-4 py-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 text-sm font-medium hover:bg-purple-500/20 transition-all"
          >
            + Nueva Cotización
          </button>
          <button
            onClick={() => onNavigate('config')}
            className="px-4 py-2 rounded-xl bg-gray-500/10 text-gray-400 border border-gray-500/20 text-sm font-medium hover:bg-gray-500/20 transition-all"
          >
            ⚙ Configurar Datos
          </button>
        </div>
      </div>
    </div>
  );
}
