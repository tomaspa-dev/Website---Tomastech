/**
 * ConfigModule.tsx — Admin Panel v2
 * Configuración del emisor (Tomastech / Tomas Pozu):
 * nombre, RUC, dirección, serie de recibos, cuentas bancarias, retención IR.
 */

import React, { useState, useRef } from 'react';
import {
  Settings, Save, Building2, CreditCard, Percent,
  Plus, Trash2, User, Phone, Mail, Globe, Hash,
  CheckCircle2, AlertCircle, Database, RefreshCw,
} from 'lucide-react';
import {
  configStore, seedDemoData,
  type EmitterConfig, type BankAccount, type Currency,
  generateId, DEFAULT_CONFIG,
} from '../../../lib/admin-store';

// ── Field wrappers ────────────────────────────────────────────
function Section({ title, icon: Icon, children }: {
  title: string; icon: React.ComponentType<any>; children: React.ReactNode;
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-800">
        <Icon size={16} className="text-emerald-400" />
        <h3 className="text-white font-semibold text-sm">{title}</h3>
      </div>
      <div className="p-6 space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-slate-500 leading-relaxed">{hint}</p>}
    </div>
  );
}

function Input({ className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white
        placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500
        transition-colors ${className}`}
      {...props}
    />
  );
}

// ── Main ──────────────────────────────────────────────────────
export function ConfigModule() {
  const [config, setConfig] = useState<EmitterConfig>(configStore.get());
  const [saved, setSaved]   = useState(false);
  const [seeding, setSeeding] = useState(false);

  const logoInputRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof EmitterConfig>(key: K, value: EmitterConfig[K]) =>
    setConfig((prev) => ({ ...prev, [key]: value }));

  // Save
  const handleSave = () => {
    configStore.save(config);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  // Logo upload → base64
  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500_000) { alert('El logo debe pesar menos de 500 KB'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => set('logoData', ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  // Bank accounts
  const addBank = () =>
    set('bankAccounts', [
      ...config.bankAccounts,
      { id: generateId(), bankName: '', accountNumber: '', cci: '', accountHolder: config.fullName, currency: 'PEN' },
    ]);

  const updateBank = (id: string, field: keyof BankAccount, value: string) =>
    set('bankAccounts', config.bankAccounts.map((b) => (b.id === id ? { ...b, [field]: value } : b)));

  const removeBank = (id: string) =>
    set('bankAccounts', config.bankAccounts.filter((b) => b.id !== id));

  // Seed demo data
  const handleSeed = () => {
    if (!window.confirm('¿Cargar datos de demo? Esto reemplazará los datos actuales del panel.')) return;
    setSeeding(true);
    setTimeout(() => {
      seedDemoData();
      setSeeding(false);
      alert('✅ Datos de demo cargados. Recarga la página para verlos.');
      window.location.reload();
    }, 800);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-bold text-xl flex items-center gap-2">
            <Settings size={20} className="text-emerald-400" />
            Configuración
          </h2>
          <p className="text-slate-400 text-sm mt-0.5">Datos del emisor y ajustes del panel</p>
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            saved
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              : 'bg-emerald-500 hover:bg-emerald-400 text-white'
          }`}
        >
          {saved ? <CheckCircle2 size={16} /> : <Save size={16} />}
          {saved ? 'Guardado ✓' : 'Guardar Cambios'}
        </button>
      </div>

      {/* ── DATOS DEL EMISOR ───────────────────────────────── */}
      <Section title="Datos del Emisor" icon={User}>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Nombre Comercial">
            <Input
              value={config.businessName}
              onChange={(e) => set('businessName', e.target.value)}
              placeholder="Tomastech"
            />
          </Field>
          <Field label="Nombre Completo del Titular">
            <Input
              value={config.fullName}
              onChange={(e) => set('fullName', e.target.value)}
              placeholder="Tomas Eduardo Pozu Asalde"
            />
          </Field>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Field label="Tipo Doc.">
            <div className="flex bg-slate-800 border border-slate-700 rounded-lg p-0.5">
              {(['RUC', 'DNI'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => set('documentType', t)}
                  className={`flex-1 py-2 rounded-md text-xs font-bold transition-all ${
                    config.documentType === t ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Número de Documento" hint={config.documentType === 'RUC' ? 'RUC de persona natural: 10xxxxxxxxx' : undefined}>
            <Input
              value={config.documentNumber}
              onChange={(e) => set('documentNumber', e.target.value.replace(/\D/g, '').slice(0, config.documentType === 'RUC' ? 11 : 8))}
              placeholder={config.documentType === 'RUC' ? '10xxxxxxxxx' : 'xxxxxxxx'}
              maxLength={config.documentType === 'RUC' ? 11 : 8}
            />
          </Field>
          <Field label="Sitio Web">
            <Input
              value={config.website}
              onChange={(e) => set('website', e.target.value)}
              placeholder="tomastech.dev"
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Email">
            <Input
              type="email"
              value={config.email}
              onChange={(e) => set('email', e.target.value)}
              placeholder="hola@tomastech.dev"
            />
          </Field>
          <Field label="Teléfono">
            <Input
              value={config.phone}
              onChange={(e) => set('phone', e.target.value)}
              placeholder="+51 999 999 999"
            />
          </Field>
        </div>

        <Field label="Dirección">
          <Input
            value={config.address}
            onChange={(e) => set('address', e.target.value)}
            placeholder="Av. Principal 123, Lima, Perú"
          />
        </Field>

        {/* Logo */}
        <Field label="Logo (para PDFs)" hint="PNG o JPG, máximo 500 KB. Se incrustará en cotizaciones, recibos y contratos.">
          <div className="flex items-center gap-4">
            <div
              className="w-24 h-16 rounded-lg border-2 border-dashed border-slate-700 flex items-center justify-center overflow-hidden cursor-pointer hover:border-emerald-500/50 transition-colors"
              onClick={() => logoInputRef.current?.click()}
            >
              {config.logoData ? (
                <img src={config.logoData} alt="Logo" className="w-full h-full object-contain p-1" />
              ) : (
                <span className="text-slate-500 text-xs text-center px-1">Click para subir</span>
              )}
            </div>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors"
              >
                Subir Logo
              </button>
              {config.logoData && (
                <button
                  type="button"
                  onClick={() => set('logoData', '')}
                  className="text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                  Quitar logo
                </button>
              )}
            </div>
            <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogo} className="hidden" />
          </div>
        </Field>
      </Section>

      {/* ── NUMERACIÓN ────────────────────────────────────────── */}
      <Section title="Numeración de Documentos" icon={Hash}>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Prefijo Cotizaciones" hint="Ej: COT → COT-2026-0001">
            <Input
              value={config.quotationPrefix}
              onChange={(e) => set('quotationPrefix', e.target.value.toUpperCase().slice(0, 5))}
              placeholder="COT"
            />
          </Field>
          <Field label="Próximo Nº Cotización">
            <Input
              type="number"
              min={1}
              value={config.nextQuotationNumber}
              onChange={(e) => set('nextQuotationNumber', Math.max(1, parseInt(e.target.value) || 1))}
              className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Serie Recibos por Honorarios" hint="SUNAT: Emitidos electrónicos = E001">
            <Input
              value={config.receiptSeries}
              onChange={(e) => set('receiptSeries', e.target.value.toUpperCase().slice(0, 4))}
              placeholder="E001"
            />
          </Field>
          <Field label="Próximo Nº Correlativo">
            <Input
              type="number"
              min={1}
              value={config.nextReceiptCorrelative}
              onChange={(e) => set('nextReceiptCorrelative', Math.max(1, parseInt(e.target.value) || 1))}
              className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Vigencia Cotizaciones (días hábiles)">
            <Input
              type="number"
              min={1}
              value={config.quotationValidityDays}
              onChange={(e) => set('quotationValidityDays', Math.max(1, parseInt(e.target.value) || 15))}
              className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
            />
          </Field>
          <Field label="Prefijo Contratos" hint="Ej: CON → CON-2026-0001">
            <Input
              value={config.contractPrefix}
              onChange={(e) => set('contractPrefix', e.target.value.toUpperCase().slice(0, 5))}
              placeholder="CON"
            />
          </Field>
        </div>
      </Section>

      {/* ── RETENCIÓN IR ──────────────────────────────────────── */}
      <Section title="Retención IR — 4ta Categoría (SUNAT)" icon={Percent}>
        <div className="flex items-center gap-3 p-4 bg-amber-500/5 border border-amber-500/20 rounded-lg">
          <AlertCircle size={16} className="text-amber-400 shrink-0" />
          <p className="text-xs text-amber-300 leading-relaxed">
            Aplica cuando el <strong>cliente pagador tiene RUC que empieza en 20</strong> (empresa) y el
            monto supera S/ 1,500 en el mes. La empresa retiene el 8% y lo declarará a SUNAT por ti.
          </p>
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <div
            className={`relative w-10 h-5 rounded-full transition-colors ${config.retentionEnabled ? 'bg-emerald-500' : 'bg-slate-700'}`}
            onClick={() => set('retentionEnabled', !config.retentionEnabled)}
          >
            <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${config.retentionEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
          </div>
          <span className="text-slate-300 text-sm font-semibold">
            {config.retentionEnabled ? 'Retención activa — se calcula automáticamente' : 'Retención desactivada'}
          </span>
        </label>

        {config.retentionEnabled && (
          <div className="grid grid-cols-2 gap-4">
            <Field label="Porcentaje de Retención (%)" hint="SUNAT 4ta categoría: 8%">
              <Input
                type="number"
                min={0}
                max={30}
                value={config.retentionPercentage}
                onChange={(e) => set('retentionPercentage', Math.max(0, parseFloat(e.target.value) || 8))}
                className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
              />
            </Field>
            <Field label="Monto Mínimo para Retención (S/)" hint="Umbral mensual: S/ 1,500">
              <Input
                type="number"
                min={0}
                value={config.retentionThreshold}
                onChange={(e) => set('retentionThreshold', Math.max(0, parseFloat(e.target.value) || 1500))}
                className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
              />
            </Field>
          </div>
        )}
      </Section>

      {/* ── CUENTAS BANCARIAS ─────────────────────────────────── */}
      <Section title="Cuentas Bancarias" icon={CreditCard}>
        <p className="text-xs text-slate-500">Datos que aparecen al pie de cotizaciones y recibos PDF.</p>
        <div className="space-y-3">
          {config.bankAccounts.map((bank) => (
            <div key={bank.id} className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Banco">
                  <Input
                    value={bank.bankName}
                    onChange={(e) => updateBank(bank.id, 'bankName', e.target.value)}
                    placeholder="BCP, Interbank, Scotiabank..."
                  />
                </Field>
                <Field label="Moneda">
                  <div className="flex bg-slate-800 border border-slate-700 rounded-lg p-0.5">
                    {(['PEN', 'USD'] as Currency[]).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => updateBank(bank.id, 'currency', c)}
                        className={`flex-1 py-2 rounded-md text-xs font-bold transition-all ${
                          bank.currency === c ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {c === 'PEN' ? 'S/ Soles' : '$ Dólares'}
                      </button>
                    ))}
                  </div>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Número de Cuenta">
                  <Input
                    value={bank.accountNumber}
                    onChange={(e) => updateBank(bank.id, 'accountNumber', e.target.value)}
                    placeholder="123-456789-0-12"
                  />
                </Field>
                <Field label="CCI (Interbancario)">
                  <Input
                    value={bank.cci}
                    onChange={(e) => updateBank(bank.id, 'cci', e.target.value)}
                    placeholder="00212300456789012345"
                  />
                </Field>
              </div>
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <Field label="Titular de la Cuenta">
                    <Input
                      value={bank.accountHolder}
                      onChange={(e) => updateBank(bank.id, 'accountHolder', e.target.value)}
                      placeholder="Tomas Eduardo Pozu Asalde"
                    />
                  </Field>
                </div>
                <button
                  type="button"
                  onClick={() => removeBank(bank.id)}
                  className="p-2.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors shrink-0"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addBank}
            className="w-full py-3 border border-dashed border-slate-700 hover:border-emerald-500/50 rounded-xl text-slate-500 hover:text-emerald-400 text-sm font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={15} />
            Agregar Cuenta Bancaria
          </button>
        </div>
      </Section>

      {/* ── DATOS DE DEMO ─────────────────────────────────────── */}
      <Section title="Datos de Demostración" icon={Database}>
        <p className="text-xs text-slate-500 leading-relaxed">
          Carga clientes, servicios, cotizaciones, recibos y entradas de contabilidad de ejemplo
          para explorar el panel sin necesidad de ingresar datos manualmente.
        </p>
        <button
          onClick={handleSeed}
          disabled={seeding}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={seeding ? 'animate-spin' : ''} />
          {seeding ? 'Cargando...' : 'Cargar Datos de Demo'}
        </button>
      </Section>

      {/* Save (bottom) */}
      <button
        onClick={handleSave}
        className={`w-full py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
          saved
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
            : 'bg-emerald-500 hover:bg-emerald-400 text-white'
        }`}
      >
        {saved ? <CheckCircle2 size={16} /> : <Save size={16} />}
        {saved ? '¡Guardado exitosamente!' : 'Guardar Configuración'}
      </button>
    </div>
  );
}
