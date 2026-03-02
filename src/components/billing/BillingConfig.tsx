import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Save,
  Plus,
  Trash2,
  User,
  Building2,
  CreditCard,
  Globe,
  Percent,
  Hash,
  RotateCcw,
  Shield,
  Key,
} from 'lucide-react';
import type { EmitterConfig, BankAccount, RetentionConfig, Currency } from '../../lib/billing-store';
import { hashPassword, SECURITY } from '../../lib/security';

export default function BillingConfig() {
  const [config, setConfig] = useState<EmitterConfig | null>(null);
  const [activeTab, setActiveTab] = useState<'emitter' | 'banks' | 'retention' | 'series' | 'security'>('emitter');
  const [saved, setSaved] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  
  // Security state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityError, setSecurityError] = useState('');
  const [securitySuccess, setSecuritySuccess] = useState('');

  useEffect(() => {
    import('../../lib/billing-store').then(({ configStore }) => {
      setConfig(configStore.get());
    });
  }, []);

  const handleSave = async () => {
    if (!config) return;
    const { configStore } = await import('../../lib/billing-store');
    configStore.update(config);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!config) return null;

  const tabs = [
    { id: 'emitter' as const, label: 'Datos Emisor', icon: User },
    { id: 'banks' as const, label: 'Cuentas Bancarias', icon: CreditCard },
    { id: 'retention' as const, label: 'Retenciones', icon: Percent },
    { id: 'series' as const, label: 'Series / Correlativos', icon: Hash },
    { id: 'security' as const, label: 'Seguridad', icon: Shield },
  ];

  const addBank = () => {
    setConfig({
      ...config,
      bankAccounts: [
        ...config.bankAccounts,
        { id: Date.now().toString(), bankName: '', accountNumber: '', cci: '', accountHolder: '', currency: 'PEN' },
      ],
    });
  };

  const updateBank = (index: number, field: keyof BankAccount, value: string) => {
    const banks = [...config.bankAccounts];
    banks[index] = { ...banks[index], [field]: value };
    setConfig({ ...config, bankAccounts: banks });
  };

  const removeBank = (index: number) => {
    setConfig({ ...config, bankAccounts: config.bankAccounts.filter((_, i) => i !== index) });
  };

  const addRetention = () => {
    setConfig({
      ...config,
      retentionConfigs: [
        ...config.retentionConfigs,
        { country: 'PE', percentage: 0, threshold: 0, currency: 'PEN', appliesToCompanies: true, label: '' },
      ],
    });
  };

  const updateRetention = (index: number, field: keyof RetentionConfig, value: any) => {
    const retentions = [...config.retentionConfigs];
    retentions[index] = { ...retentions[index], [field]: value };
    setConfig({ ...config, retentionConfigs: retentions });
  };

  const removeRetention = (index: number) => {
    setConfig({ ...config, retentionConfigs: config.retentionConfigs.filter((_, i) => i !== index) });
  };

  const handleUpdatePassword = async () => {
    setSecurityError('');
    setSecuritySuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setSecurityError('Todos los campos son obligatorios');
      return;
    }

    if (newPassword !== confirmPassword) {
      setSecurityError('Las contraseñas no coinciden');
      return;
    }

    if (newPassword.length < 6) {
      setSecurityError('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    const currentHash = localStorage.getItem(SECURITY.KEYS.hash) || SECURITY.KEYS.defaultHash;
    const inputHash = await hashPassword(currentPassword);

    if (inputHash !== currentHash) {
      setSecurityError('La contraseña actual es incorrecta');
      return;
    }

    const newHash = await hashPassword(newPassword);
    localStorage.setItem(SECURITY.KEYS.hash, newHash);
    
    setSecuritySuccess('Contraseña actualizada con éxito');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all";
  const labelClass = "text-xs text-gray-400 mb-1 block";

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold">Configuración</h3>
          <p className="text-gray-400 text-sm">Datos del emisor, cuentas bancarias y retenciones</p>
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
            saved
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-lg hover:shadow-emerald-500/25 hover:scale-[1.02]'
          }`}
        >
          <Save size={16} />
          {saved ? '¡Guardado!' : 'Guardar'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-white/5 rounded-xl border border-white/10 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Emitter Tab */}
      {activeTab === 'emitter' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 p-5 rounded-2xl bg-white/5 border border-white/10">
          {/* Logo Uploads */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Logo Fondo Claro */}
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-400 uppercase">Logo (Fondo Claro)</label>
                <div className="text-[10px] text-gray-500">Para PDF y Pre previa</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-32 h-16 rounded-xl bg-white flex items-center justify-center p-2 border border-black/5 shrink-0 overflow-hidden">
                  {(config.logoDataLight || config.logoData) ? (
                    <img src={config.logoDataLight || config.logoData} alt="Logo Light" className="max-w-full max-h-full object-contain" />
                  ) : (
                    <div className="text-[10px] text-gray-400">Sin logo</div>
                  )}
                </div>
                <div className="space-y-2 flex-1">
                  <label className="cursor-pointer block text-center py-2 px-3 rounded-xl bg-white/5 border border-white/10 text-xs font-medium hover:bg-white/10 transition-all">
                    Subir Logo Claro
                    <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => setConfig({ ...config, logoDataLight: reader.result as string });
                      reader.readAsDataURL(file);
                    }} />
                  </label>
                  {(config.logoDataLight || config.logoData) && (
                    <button onClick={() => setConfig({ ...config, logoDataLight: '', logoData: '' })} className="w-full text-center py-1 text-[10px] text-red-400 hover:text-red-300 transition-colors">
                      Quitar
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Logo Fondo Oscuro */}
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-400 uppercase">Logo (Fondo Oscuro)</label>
                <div className="text-[10px] text-gray-500">Para modo oscuro</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-32 h-16 rounded-xl bg-[#0a0a0a] flex items-center justify-center p-2 border border-white/5 shrink-0 overflow-hidden">
                  {config.logoDataDark ? (
                    <img src={config.logoDataDark} alt="Logo Dark" className="max-w-full max-h-full object-contain" />
                  ) : (
                    <div className="text-[10px] text-gray-500">Sin logo</div>
                  )}
                </div>
                <div className="space-y-2 flex-1">
                  <label className="cursor-pointer block text-center py-2 px-3 rounded-xl bg-white/5 border border-white/10 text-xs font-medium hover:bg-white/10 transition-all">
                    Subir Logo Oscuro
                    <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => setConfig({ ...config, logoDataDark: reader.result as string });
                      reader.readAsDataURL(file);
                    }} />
                  </label>
                  {config.logoDataDark && (
                    <button onClick={() => setConfig({ ...config, logoDataDark: '' })} className="w-full text-center py-1 text-[10px] text-red-400 hover:text-red-300 transition-colors">
                      Quitar
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelClass}>Nombre del Negocio / Marca</label>
              <input type="text" value={config.businessName || ''} onChange={(e) => setConfig({ ...config, businessName: e.target.value })} className={inputClass} placeholder="Ej: Tomastech" />
            </div>
            <div className="sm:col-span-1">
              <label className={labelClass}>Nombre Completo / Razón Social</label>
              <input type="text" value={config.fullName || ''} onChange={(e) => setConfig({ ...config, fullName: e.target.value })} className={inputClass} placeholder="Ej: Juan Pérez" />
            </div>
            <div>
              <label className={labelClass}>Tipo Documento</label>
              <select value={config.documentType} onChange={(e) => setConfig({ ...config, documentType: e.target.value as 'RUC' | 'DNI' })} className={`${inputClass} appearance-none`}>
                <option value="RUC">RUC</option>
                <option value="DNI">DNI</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>N° Documento</label>
              <input type="text" value={config.documentNumber} onChange={(e) => setConfig({ ...config, documentNumber: e.target.value })} className={inputClass} placeholder="20XXXXXXXXX" />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Dirección</label>
              <input type="text" value={config.address} onChange={(e) => setConfig({ ...config, address: e.target.value })} className={inputClass} placeholder="Av. / Jr. / Calle..." />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input type="email" value={config.email} onChange={(e) => setConfig({ ...config, email: e.target.value })} className={inputClass} placeholder="tu@email.com" />
            </div>
            <div>
              <label className={labelClass}>Teléfono</label>
              <input type="tel" value={config.phone} onChange={(e) => setConfig({ ...config, phone: e.target.value })} className={inputClass} placeholder="+51 999 999 999" />
            </div>
            <div>
              <label className={labelClass}>Moneda por Defecto</label>
              <select value={config.defaultCurrency} onChange={(e) => setConfig({ ...config, defaultCurrency: e.target.value as Currency })} className={`${inputClass} appearance-none`}>
                <option value="PEN">Soles (PEN)</option>
                <option value="USD">Dólares (USD)</option>
                <option value="EUR">Euros (EUR)</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Validez Cotización (días hábiles L-V)</label>
              <input type="number" min={1} max={90} value={config.quotationValidityDays || 15} onChange={(e) => setConfig({ ...config, quotationValidityDays: parseInt(e.target.value) || 15 })} className={inputClass} />
            </div>
          </div>
        </motion.div>
      )}

      {/* Banks Tab */}
      {activeTab === 'banks' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          {config.bankAccounts.map((bank, i) => (
            <div key={bank.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-300 flex items-center gap-2">
                  <Building2 size={14} /> Cuenta {i + 1}
                </span>
                <button onClick={() => removeBank(i)} className="p-1 text-gray-500 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Banco</label>
                  <input type="text" value={bank.bankName} onChange={(e) => updateBank(i, 'bankName', e.target.value)} className={inputClass} placeholder="BCP, Interbank, etc." />
                </div>
                <div>
                  <label className={labelClass}>Moneda</label>
                  <select value={bank.currency} onChange={(e) => updateBank(i, 'currency', e.target.value)} className={`${inputClass} appearance-none`}>
                    <option value="PEN">Soles</option>
                    <option value="USD">Dólares</option>
                    <option value="EUR">Euros</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>N° Cuenta</label>
                  <input type="text" value={bank.accountNumber} onChange={(e) => updateBank(i, 'accountNumber', e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>CCI</label>
                  <input type="text" value={bank.cci} onChange={(e) => updateBank(i, 'cci', e.target.value)} className={inputClass} />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Titular</label>
                  <input type="text" value={bank.accountHolder} onChange={(e) => updateBank(i, 'accountHolder', e.target.value)} className={inputClass} />
                </div>
              </div>
            </div>
          ))}
          <button onClick={addBank} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-white/20 text-gray-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all text-sm">
            <Plus size={16} /> Agregar Cuenta Bancaria
          </button>
        </motion.div>
      )}

      {/* Retention Tab */}
      {activeTab === 'retention' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
            <strong>Nota:</strong> Tú como freelancer emites recibos por honorarios (4ta categoría). La retención del IR (8%) la aplica tu <strong>cliente</strong> cuando es una empresa con RUC (que empiece con 20), y cuando el monto bruto supera S/ 1,500. Si tu cliente es persona natural (DNI), <strong>no retiene</strong>.
          </div>
          {config.retentionConfigs.map((ret, i) => (
            <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-300 flex items-center gap-2">
                  <Percent size={14} /> Retención {i + 1}
                </span>
                <button onClick={() => removeRetention(i)} className="p-1 text-gray-500 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className={labelClass}>Etiqueta</label>
                  <input type="text" value={ret.label} onChange={(e) => updateRetention(i, 'label', e.target.value)} className={inputClass} placeholder="IR 4ta Cat." />
                </div>
                <div>
                  <label className={labelClass}>País</label>
                  <select value={ret.country} onChange={(e) => updateRetention(i, 'country', e.target.value)} className={`${inputClass} appearance-none`}>
                    <option value="PE">🇵🇪 Perú</option>
                    <option value="US">🇺🇸 EE.UU.</option>
                    <option value="ES">🇪🇸 España</option>
                    <option value="OTHER">🌍 Global</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Porcentaje (%)</label>
                  <input type="number" value={ret.percentage} onChange={(e) => updateRetention(i, 'percentage', parseFloat(e.target.value) || 0)} className={inputClass} step="0.1" />
                </div>
                <div>
                  <label className={labelClass}>Monto mínimo</label>
                  <input type="number" value={ret.threshold} onChange={(e) => updateRetention(i, 'threshold', parseFloat(e.target.value) || 0)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Moneda</label>
                  <select value={ret.currency} onChange={(e) => updateRetention(i, 'currency', e.target.value as Currency)} className={`${inputClass} appearance-none`}>
                    <option value="PEN">PEN</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ret.appliesToCompanies}
                      onChange={(e) => updateRetention(i, 'appliesToCompanies', e.target.checked)}
                      className="rounded border-white/20 bg-white/5"
                    />
                    Solo si cliente tiene RUC
                  </label>
                </div>
              </div>
            </div>
          ))}
          <button onClick={addRetention} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-white/20 text-gray-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all text-sm">
            <Plus size={16} /> Agregar Retención
          </button>
        </motion.div>
      )}

      {/* Series Tab */}
      {activeTab === 'series' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Prefijo Cotizaciones</label>
              <input type="text" value={config.quotationPrefix} onChange={(e) => setConfig({ ...config, quotationPrefix: e.target.value })} className={inputClass} placeholder="COT" />
              <p className="text-[10px] text-gray-500 mt-1">Ej: {config.quotationPrefix}-{new Date().getFullYear()}-{String(config.nextQuotationNumber).padStart(4, '0')}</p>
            </div>
            <div>
              <label className={labelClass}>Próximo N° Cotización</label>
              <input type="number" value={config.nextQuotationNumber} onChange={(e) => setConfig({ ...config, nextQuotationNumber: parseInt(e.target.value) || 1 })} className={inputClass} min={1} />
            </div>
            <div>
              <label className={labelClass}>Serie Recibos</label>
              <input type="text" value={config.receiptSeries} onChange={(e) => setConfig({ ...config, receiptSeries: e.target.value })} className={inputClass} placeholder="E001" />
              <p className="text-[10px] text-gray-500 mt-1">Ej: {config.receiptSeries}-{String(config.nextReceiptCorrelative).padStart(5, '0')}</p>
            </div>
            <div>
              <label className={labelClass}>Próximo Correlativo RHE</label>
              <input type="number" value={config.nextReceiptCorrelative} onChange={(e) => setConfig({ ...config, nextReceiptCorrelative: parseInt(e.target.value) || 1 })} className={inputClass} min={1} />
            </div>
          </div>
        </motion.div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400">
                <Key size={18} />
              </div>
              <div>
                <h4 className="font-bold text-sm">Cambiar Contraseña</h4>
                <p className="text-xs text-gray-500">Actualiza tus credenciales de acceso al panel</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Contraseña Actual</label>
                <input 
                  type="password" 
                  value={currentPassword} 
                  onChange={(e) => setCurrentPassword(e.target.value)} 
                  className={inputClass} 
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className={labelClass}>Nueva Contraseña</label>
                <input 
                  type="password" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  className={inputClass} 
                  placeholder="Mín. 6 caracteres"
                />
              </div>
              <div>
                <label className={labelClass}>Confirmar Nueva Contraseña</label>
                <input 
                  type="password" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  className={inputClass} 
                  placeholder="••••••••"
                />
              </div>
            </div>

            {securityError && <p className="text-xs text-red-400">{securityError}</p>}
            {securitySuccess && <p className="text-xs text-emerald-400">{securitySuccess}</p>}

            <button
              onClick={handleUpdatePassword}
              className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition-all border border-white/10"
            >
              Actualizar Contraseña
            </button>
          </div>

          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/70">
            <strong>⚠️ Importante:</strong> La contraseña se guarda localmente en este navegador. Si borras el caché o usas otro dispositivo sin sincronizar, se restablecerá a la clave por defecto.
          </div>
        </motion.div>
      )}

      {/* Dev Tools */}
      <div className="pt-6 border-t border-white/5 space-y-3">
        <h4 className="text-xs font-bold text-gray-500 uppercase">Herramientas de desarrollo</h4>
        <div className="flex flex-wrap gap-2">
          <button
            disabled={isSeeding}
            onClick={async () => {
              if (!confirm('⚠️ Esto cargará data ficticia (clientes, cotizaciones, recibos, contabilidad). ¿Continuar?')) return;
              setIsSeeding(true);
              try {
                const { seedTestData } = await import('../../lib/billing-seed');
                const result = await seedTestData();
                alert(result);
                window.location.reload();
              } catch (err: any) {
                console.error('Error seeding data:', err);
                alert(`❌ Error al cargar datos de prueba:\n${err?.message || err}`);
                setIsSeeding(false);
              }
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-medium text-xs transition-all ${
              isSeeding
                ? 'bg-purple-500/20 border-purple-500/30 text-purple-300 cursor-wait'
                : 'bg-purple-500/10 border-purple-500/20 text-purple-400 hover:bg-purple-500/20'
            }`}
          >
            {isSeeding ? (
              <><span className="w-3.5 h-3.5 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" /> Cargando...</>
            ) : (
              <><Globe size={14} /> Cargar Data de Prueba</>
            )}
          </button>
          <button
            onClick={() => {
              if (!confirm('⚠️ ¿BORRAR TODOS los datos? (clientes, cotizaciones, recibos, proyectos, contabilidad)')) return;
              if (!confirm('🚨 ¿ESTÁS SEGURO? Esto NO se puede deshacer.')) return;
              ['tt_billing_clients', 'tt_billing_quotations', 'tt_billing_receipts', 'tt_billing_projects', 'tt_billing_accounts', 'tt_billing_journal', 'tt_billing_cash_register'].forEach(k => localStorage.removeItem(k));
              alert('✅ Todos los datos han sido borrados');
              window.location.reload();
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-medium text-xs hover:bg-red-500/20 transition-all"
          >
            <RotateCcw size={14} /> Borrar Todo
          </button>
          <button
            onClick={() => {
              if (!confirm('⚠️ Esto restablecerá el USUARIO y CONTRASEÑA a los valores por defecto y limpiará intentos de bloqueo. ¿Continuar?')) return;
              localStorage.removeItem(SECURITY.KEYS.usernameHash);
              localStorage.removeItem(SECURITY.KEYS.hash);
              localStorage.setItem(SECURITY.KEYS.attempts, '0');
              localStorage.removeItem(SECURITY.KEYS.lockUntil);
              localStorage.setItem(SECURITY.KEYS.lockCount, '0');
              alert('✅ Seguridad restablecida (Usuario: Unkh4$m3lo / Clave: pil3t8r7x5)');
              window.location.reload();
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 font-medium text-xs hover:bg-amber-500/20 transition-all"
          >
            <Shield size={14} /> Restablecer Seguridad (Dev)
          </button>
        </div>
      </div>
    </div>
  );
}
