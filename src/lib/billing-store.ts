/**
 * billing-store.ts — Dual-mode persistence
 * - Development (localhost): localStorage
 * - Production (Netlify): Neon PostgreSQL via API
 */

import { apiCall, shouldUseAPI } from './billing-api';

// ============================================
// TYPES
// ============================================

// Tipos de documento según SUNAT + internacionales
export type DocumentType = 
  | 'DNI'           // Documento Nacional de Identidad (Perú)
  | 'RUC'           // Registro Único de Contribuyentes (Perú)
  | 'PASAPORTE'     // Pasaporte
  | 'CE'            // Carné de Extranjería (Perú)
  | 'DOC_TRIB_NO_DOM' // Doc. Tributario No Domiciliado (extranjeros sin RUC)
  | 'TAX_ID'        // Tax ID / NIT (internacional)
  | 'OTHER';        // Otro documento

export interface Client {
  id: string;
  name: string;
  documentType: DocumentType;
  documentNumber: string;
  email: string;
  phone: string;
  country: string;
  address: string;
  notes: string;
  status: 'active' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

export interface QuotationItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export type QuotationStatus = 'draft' | 'sent' | 'accepted' | 'paid' | 'cancelled';
export type ReceiptStatus = 'pending' | 'issued' | 'voided';
export type PaymentMethod = 'cash' | 'transfer' | 'yape_plin' | 'paypal' | 'card' | 'crypto' | 'other';
export type Currency = 'PEN' | 'USD' | 'EUR';
export type ProjectStatus = 'planning' | 'active' | 'paused' | 'completed' | 'cancelled';

export interface Project {
  id: string;
  clientId: string;
  name: string;
  description: string;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
  budget: number;
  currency: Currency;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  code: string;
  name: string;
  description: string;
  costPrice: number;    // Lo que me cuesta (horas, licencias, etc)
  salePrice: number;    // Precio de venta sugerido
  currency: Currency;
  status: 'active' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

// ============================================
// ACCOUNTING TYPES
// ============================================

export type AccountType = 'asset' | 'liability' | 'equity' | 'income' | 'expense';

export interface Account {
  id: string;
  code: string;        // Ej: 101, 401, 701
  name: string;        // Ej: Caja, Ingresos por Servicios
  type: AccountType;
  balance: number;     // Saldo actual en PEN
  isDefault: boolean;  // Cuenta predeterminada del sistema
  createdAt: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  description: string;
  debitAccountId: string;
  creditAccountId: string;
  amount: number;       // Monto en PEN
  originalCurrency: Currency;
  originalAmount: number;
  exchangeRate: number; // Tipo de cambio a PEN (1.00 si ya es PEN)
  referenceType: 'receipt' | 'manual' | 'adjustment' | 'capital';
  referenceId: string;  // ID del recibo si es automático
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface CashMovement {
  id: string;
  date: string;
  description: string;
  type: 'income' | 'expense' | 'adjustment';
  amount: number;        // Monto en PEN (positivo=ingreso, negativo=egreso)
  balanceBefore: number; // Saldo antes
  balanceAfter: number;  // Saldo después
  referenceType: 'receipt' | 'manual' | 'adjustment' | 'capital';
  referenceId: string;
  notes: string;
  createdAt: string;
}

export interface Quotation {
  id: string;
  number: string; // COT-2026-0001
  clientId: string;
  projectId: string; // Vinculado a un proyecto
  status: QuotationStatus;
  currency: Currency;
  items: QuotationItem[];
  subtotal: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  discountAmount: number;
  retentionPercentage: number;
  retentionAmount: number;
  total: number;
  paymentMethod: PaymentMethod;
  notes: string;
  issueDate: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Receipt {
  id: string;
  series: string; // E001
  correlative: number; // 00001
  number: string; // E001-00001
  quotationId: string;
  clientId: string;
  projectId: string; // Vinculado a un proyecto
  serviceDescription: string;
  grossAmount: number;
  retentionPercentage: number;
  retentionAmount: number;
  netAmount: number;
  currency: Currency;
  paymentMethod: PaymentMethod;
  paymentReference: string;
  issueDate: string;
  sunatStatus: ReceiptStatus;
  createdAt: string;
  updatedAt: string;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  cci: string;
  accountHolder: string;
  currency: Currency;
}

export interface RetentionConfig {
  country: string;
  percentage: number;
  threshold: number; // Monto mínimo para aplicar retención
  currency: Currency;
  appliesToCompanies: boolean; // Solo aplica si el PAGADOR (cliente) es empresa con RUC 20xxx
  label: string; // e.g. "Retención IR 4ta Categoría"
}

export interface EmitterConfig {
  businessName: string; // e.g. 'Tomastech'
  fullName: string;
  documentType: 'RUC' | 'DNI';
  documentNumber: string;
  address: string;
  email: string;
  phone: string;
  logoUrl: string;
  logoData: string; // base64 data URI of uploaded logo (legacy)
  logoDataLight?: string;
  logoDataDark?: string;
  bankAccounts: BankAccount[];
  retentionConfigs: RetentionConfig[];
  defaultCurrency: Currency;
  receiptSeries: string; // e.g. E001
  nextReceiptCorrelative: number;
  quotationPrefix: string; // e.g. COT
  nextQuotationNumber: number;
  quotationValidityDays: number; // business days (L-V), default 15
}

// ============================================
// STORAGE KEYS
// ============================================

const KEYS = {
  clients: 'tt_billing_clients',
  quotations: 'tt_billing_quotations',
  receipts: 'tt_billing_receipts',
  projects: 'tt_billing_projects',
  accounts: 'tt_billing_accounts',
  journal: 'tt_billing_journal',
  cashRegister: 'tt_billing_cash_register',
  config: 'tt_billing_config',
  services: 'tt_billing_services',
} as const;

// ============================================
// HELPERS
// ============================================

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function getStore<T>(key: string): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function setStore<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

function getConfig(): EmitterConfig | null {
  try {
    const data = localStorage.getItem(KEYS.config);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

// ============================================
// DEFAULT CONFIG
// ============================================

const DEFAULT_CONFIG: EmitterConfig = {
  businessName: 'Tomastech',
  fullName: '',
  documentType: 'RUC',
  documentNumber: '',
  address: '',
  email: '',
  phone: '',
  logoUrl: '/logo.png',
  logoData: '',
  logoDataLight: '',
  logoDataDark: '',
  bankAccounts: [],
  retentionConfigs: [
    {
      country: 'PE',
      percentage: 8,
      threshold: 1500,
      currency: 'PEN',
      appliesToCompanies: true,
      label: 'Retención IR 4ta Categoría',
    },
  ],
  defaultCurrency: 'PEN',
  receiptSeries: 'E001',
  nextReceiptCorrelative: 1,
  quotationPrefix: 'COT',
  nextQuotationNumber: 1,
  quotationValidityDays: 15,
};

/** Calculate a future date adding N business days (Mon-Fri) */
export function addBusinessDays(startDate: Date, days: number): Date {
  const result = new Date(startDate);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    const dow = result.getDay();
    if (dow !== 0 && dow !== 6) added++; // Skip Sat/Sun
  }
  return result;
}

// ============================================
// CLIENT OPERATIONS
// ============================================

export const clientStore = {
  getAll(): Client[] {
    return getStore<Client>(KEYS.clients);
  },
  async getAllAsync(): Promise<Client[]> {
    if (shouldUseAPI()) return apiCall('clients.getAll');
    return this.getAll();
  },

  getById(id: string): Client | undefined {
    return this.getAll().find((c) => c.id === id);
  },

  create(data: Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'status'> & { status?: 'active' | 'suspended' }): Client {
    const clients = this.getAll();
    const client: Client = {
      ...data,
      status: data.status || 'active',
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    clients.push(client);
    setStore(KEYS.clients, clients);
    if (shouldUseAPI()) apiCall('clients.create', data).catch(console.error);
    return client;
  },

  async createAsync(data: Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'status'> & { status?: 'active' | 'suspended' }): Promise<Client> {
    if (shouldUseAPI()) return apiCall('clients.create', data);
    return this.create(data);
  },

  update(id: string, data: Partial<Client>): Client | null {
    const clients = this.getAll();
    const index = clients.findIndex((c) => c.id === id);
    if (index === -1) return null;
    clients[index] = { ...clients[index], ...data, updatedAt: new Date().toISOString() };
    setStore(KEYS.clients, clients);
    if (shouldUseAPI()) apiCall('clients.update', { id, ...data }).catch(console.error);
    return clients[index];
  },

  delete(id: string): boolean {
    const clients = this.getAll();
    const filtered = clients.filter((c) => c.id !== id);
    if (filtered.length === clients.length) return false;
    setStore(KEYS.clients, filtered);
    if (shouldUseAPI()) apiCall('clients.delete', { id }).catch(console.error);
    return true;
  },
};

// ============================================
// QUOTATION OPERATIONS
// ============================================

export const quotationStore = {
  getAll(): Quotation[] {
    return getStore<Quotation>(KEYS.quotations);
  },
  async getAllAsync(): Promise<Quotation[]> {
    if (shouldUseAPI()) return apiCall('quotations.getAll');
    return this.getAll();
  },

  getById(id: string): Quotation | undefined {
    return this.getAll().find((q) => q.id === id);
  },

  generateNumber(): string {
    const config = configStore.get();
    const year = new Date().getFullYear();
    const num = String(config.nextQuotationNumber).padStart(4, '0');
    return `${config.quotationPrefix}-${year}-${num}`;
  },

  create(data: Omit<Quotation, 'id' | 'number' | 'createdAt' | 'updatedAt'>): Quotation {
    const quotations = this.getAll();
    const config = configStore.get();
    const quotation: Quotation = {
      ...data,
      id: generateId(),
      number: this.generateNumber(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    quotations.push(quotation);
    setStore(KEYS.quotations, quotations);
    configStore.update({ nextQuotationNumber: config.nextQuotationNumber + 1 });
    if (shouldUseAPI()) apiCall('quotations.create', { ...data, number: quotation.number, correlative: config.nextQuotationNumber }).catch(console.error);
    return quotation;
  },

  update(id: string, data: Partial<Quotation>): Quotation | null {
    const quotations = this.getAll();
    const index = quotations.findIndex((q) => q.id === id);
    if (index === -1) return null;
    quotations[index] = { ...quotations[index], ...data, updatedAt: new Date().toISOString() };
    setStore(KEYS.quotations, quotations);
    if (shouldUseAPI()) apiCall('quotations.update', quotations[index]).catch(console.error);
    return quotations[index];
  },

  delete(id: string): boolean {
    const quotations = this.getAll();
    const filtered = quotations.filter((q) => q.id !== id);
    if (filtered.length === quotations.length) return false;
    setStore(KEYS.quotations, filtered);
    return true;
  },
};

// ============================================
// SERVICES STORE
// ============================================

export const serviceStore = {
  getAll(): Service[] {
    return getStore<Service>(KEYS.services);
  },
  async getAllAsync(): Promise<Service[]> {
    if (shouldUseAPI()) return apiCall('services.getAll');
    return this.getAll();
  },

  getById(id: string): Service | undefined {
    return this.getAll().find((s) => s.id === id);
  },

  create(data: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>): Service {
    const services = this.getAll();
    const service: Service = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    services.push(service);
    setStore(KEYS.services, services);
    if (shouldUseAPI()) apiCall('services.create', data).catch(console.error);
    return service;
  },

  update(id: string, data: Partial<Service>): Service | null {
    const services = this.getAll();
    const index = services.findIndex((s) => s.id === id);
    if (index === -1) return null;
    services[index] = { ...services[index], ...data, updatedAt: new Date().toISOString() };
    setStore(KEYS.services, services);
    if (shouldUseAPI()) apiCall('services.update', services[index]).catch(console.error);
    return services[index];
  },

  delete(id: string): boolean {
    const services = this.getAll();
    const filtered = services.filter((s) => s.id !== id);
    if (filtered.length === services.length) return false;
    setStore(KEYS.services, filtered);
    if (shouldUseAPI()) apiCall('services.delete', { id }).catch(console.error);
    return true;
  },
};

// ============================================
// RECEIPT OPERATIONS
// ============================================

export const receiptStore = {
  getAll(): Receipt[] {
    return getStore<Receipt>(KEYS.receipts);
  },
  async getAllAsync(): Promise<Receipt[]> {
    if (shouldUseAPI()) return apiCall('receipts.getAll');
    return this.getAll();
  },

  getById(id: string): Receipt | undefined {
    return this.getAll().find((r) => r.id === id);
  },

  generateNumber(): string {
    const config = configStore.get();
    const correlative = String(config.nextReceiptCorrelative).padStart(5, '0');
    return `${config.receiptSeries}-${correlative}`;
  },

  create(data: Omit<Receipt, 'id' | 'number' | 'series' | 'correlative' | 'createdAt' | 'updatedAt'>): Receipt {
    const receipts = this.getAll();
    const config = configStore.get();
    const receipt: Receipt = {
      ...data,
      id: generateId(),
      series: config.receiptSeries,
      correlative: config.nextReceiptCorrelative,
      number: this.generateNumber(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    receipts.push(receipt);
    setStore(KEYS.receipts, receipts);
    configStore.update({ nextReceiptCorrelative: config.nextReceiptCorrelative + 1 });
    if (shouldUseAPI()) apiCall('receipts.create', { ...data, number: receipt.number, series: receipt.series, correlative: receipt.correlative }).catch(console.error);
    return receipt;
  },

  update(id: string, data: Partial<Receipt>): Receipt | null {
    const receipts = this.getAll();
    const index = receipts.findIndex((r) => r.id === id);
    if (index === -1) return null;
    receipts[index] = { ...receipts[index], ...data, updatedAt: new Date().toISOString() };
    setStore(KEYS.receipts, receipts);
    if (shouldUseAPI()) apiCall('receipts.update', { id, ...data }).catch(console.error);
    return receipts[index];
  },
};

// ============================================
// CONFIG OPERATIONS
// ============================================

export const configStore = {
  get(): EmitterConfig {
    return getConfig() || { ...DEFAULT_CONFIG };
  },
  async getAsync(): Promise<EmitterConfig> {
    if (shouldUseAPI()) {
      const data = await apiCall('config.get');
      return data || { ...DEFAULT_CONFIG };
    }
    return this.get();
  },

  update(data: Partial<EmitterConfig>): EmitterConfig {
    const current = this.get();
    const updated = { ...current, ...data };
    localStorage.setItem(KEYS.config, JSON.stringify(updated));
    if (shouldUseAPI()) apiCall('config.update', updated).catch(console.error);
    return updated;
  },

  reset(): void {
    localStorage.setItem(KEYS.config, JSON.stringify(DEFAULT_CONFIG));
  },
};

// ============================================
// PROJECT OPERATIONS
// ============================================

export const projectStore = {
  getAll(): Project[] {
    return getStore<Project>(KEYS.projects);
  },
  async getAllAsync(): Promise<Project[]> {
    if (shouldUseAPI()) return apiCall('projects.getAll');
    return this.getAll();
  },

  getById(id: string): Project | undefined {
    return this.getAll().find((p) => p.id === id);
  },

  getByClient(clientId: string): Project[] {
    return this.getAll().filter((p) => p.clientId === clientId);
  },

  create(data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Project {
    const projects = this.getAll();
    const project: Project = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    projects.push(project);
    setStore(KEYS.projects, projects);
    if (shouldUseAPI()) apiCall('projects.create', data).catch(console.error);
    return project;
  },

  update(id: string, data: Partial<Project>): Project | null {
    const projects = this.getAll();
    const index = projects.findIndex((p) => p.id === id);
    if (index === -1) return null;
    projects[index] = { ...projects[index], ...data, updatedAt: new Date().toISOString() };
    setStore(KEYS.projects, projects);
    if (shouldUseAPI()) apiCall('projects.update', projects[index]).catch(console.error);
    return projects[index];
  },

  delete(id: string): boolean {
    const projects = this.getAll();
    const filtered = projects.filter((p) => p.id !== id);
    if (filtered.length === projects.length) return false;
    setStore(KEYS.projects, filtered);
    if (shouldUseAPI()) apiCall('projects.delete', { id }).catch(console.error);
    return true;
  },
};

// ============================================
// CALCULATION HELPERS
// ============================================

export function calculateQuotationTotals(
  items: QuotationItem[],
  discountType: 'percentage' | 'fixed',
  discountValue: number,
  retentionPercentage: number
): { subtotal: number; discountAmount: number; retentionAmount: number; total: number } {
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const discountAmount = discountType === 'percentage' ? subtotal * (discountValue / 100) : discountValue;
  const afterDiscount = subtotal - discountAmount;
  const retentionAmount = afterDiscount * (retentionPercentage / 100);
  const total = afterDiscount - retentionAmount;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discountAmount: Math.round(discountAmount * 100) / 100,
    retentionAmount: Math.round(retentionAmount * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}

export function calculateReceiptAmounts(
  grossAmount: number,
  retentionPercentage: number
): { retentionAmount: number; netAmount: number } {
  const retentionAmount = grossAmount * (retentionPercentage / 100);
  return {
    retentionAmount: Math.round(retentionAmount * 100) / 100,
    netAmount: Math.round((grossAmount - retentionAmount) * 100) / 100,
  };
}

// ============================================
// NOTIFICATION HELPERS
// ============================================

export function generateWhatsAppLink(phone: string, message: string): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}

export function formatCurrency(amount: number, currency: Currency): string {
  const symbols: Record<Currency, string> = { PEN: 'S/', USD: '$', EUR: '€' };
  return `${symbols[currency]} ${amount.toFixed(2)}`;
}

export const CURRENCY_OPTIONS: { value: Currency; label: string }[] = [
  { value: 'PEN', label: 'Soles (PEN)' },
  { value: 'USD', label: 'Dólares (USD)' },
  { value: 'EUR', label: 'Euros (EUR)' },
];

export const PAYMENT_METHOD_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: 'transfer', label: 'Transferencia Bancaria' },
  { value: 'cash', label: 'Efectivo' },
  { value: 'yape_plin', label: 'Yape / Plin' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'card', label: 'Tarjeta de Crédito/Débito' },
  { value: 'crypto', label: 'Criptomoneda' },
  { value: 'other', label: 'Otro' },
];

export const DOCUMENT_TYPE_OPTIONS: { value: DocumentType; label: string; forCountry?: string[] }[] = [
  { value: 'DNI', label: 'DNI', forCountry: ['PE'] },
  { value: 'RUC', label: 'RUC', forCountry: ['PE'] },
  { value: 'PASAPORTE', label: 'Pasaporte' },
  { value: 'CE', label: 'Carné de Extranjería', forCountry: ['PE'] },
  { value: 'DOC_TRIB_NO_DOM', label: 'Doc. Tributario No Domiciliado' },
  { value: 'TAX_ID', label: 'Tax ID / NIT' },
  { value: 'OTHER', label: 'Otro documento' },
];

export const COUNTRY_OPTIONS = [
  { value: 'PE', label: '🇵🇪 Perú' },
  { value: 'US', label: '🇺🇸 Estados Unidos' },
  { value: 'ES', label: '🇪🇸 España' },
  { value: 'MX', label: '🇲🇽 México' },
  { value: 'CO', label: '🇨🇴 Colombia' },
  { value: 'AR', label: '🇦🇷 Argentina' },
  { value: 'CL', label: '🇨🇱 Chile' },
  { value: 'BR', label: '🇧🇷 Brasil' },
  { value: 'OTHER', label: '🌍 Otro' },
];

// ============================================
// EXCEL / CSV EXPORT
// ============================================

export function exportToExcel(data: Record<string, any>[], filename: string, sheetName?: string): void {
  if (data.length === 0) return;

  import('exceljs').then(async (ExcelJS) => {
    const wb = new ExcelJS.Workbook();
    wb.creator = 'Tomastech';
    wb.created = new Date();
    const ws = wb.addWorksheet(sheetName || 'Datos');
    
    const headers = Object.keys(data[0]);
    
    // Add header row
    const headerRow = ws.addRow(headers);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF065F46' } }; // Dark emerald
    headerRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    headerRow.height = 22;
    headerRow.eachCell(cell => {
      cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
    });

    // Zebra colors
    const zebraLight = 'FFD5F5E3';  // Visible mint green
    const zebraWhite = 'FFFFFFFF';  // White

    // Add data rows with formatting
    data.forEach((row, rowIndex) => {
      const values = headers.map(h => {
        const val = row[h];
        if (typeof val === 'number') return Math.round(val * 100) / 100;
        return val ?? '';
      });
      const dataRow = ws.addRow(values);
      
      // Zebra striping
      const bgColor = rowIndex % 2 === 0 ? zebraWhite : zebraLight;
      dataRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
      dataRow.alignment = { vertical: 'middle' };
      
      dataRow.eachCell((cell, colNumber) => {
        cell.border = { top: { style: 'thin', color: { argb: 'FFE5E7EB' } }, bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } }, left: { style: 'thin', color: { argb: 'FFE5E7EB' } }, right: { style: 'thin', color: { argb: 'FFE5E7EB' } } };
        // Number formatting: 2 decimals
        if (typeof cell.value === 'number') {
          cell.numFmt = '#,##0.00';
          cell.alignment = { vertical: 'middle', horizontal: 'right' };
        }
      });
    });

    // Auto column widths
    ws.columns.forEach((col, i) => {
      const headerLen = headers[i]?.length || 10;
      const maxDataLen = data.reduce((max, row) => Math.max(max, String(row[headers[i]] ?? '').length), 0);
      col.width = Math.min(Math.max(headerLen, maxDataLen, 10) + 3, 45);
    });

    // Freeze header row
    ws.views = [{ state: 'frozen', ySplit: 1, xSplit: 0, topLeftCell: 'A2' }];

    // Generate buffer and download
    const buffer = await wb.xlsx.writeBuffer();
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}-${String(now.getMinutes()).padStart(2,'0')}`;
    const fullFilename = `${filename}_${dateStr}.xlsx`;
    
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const reader = new FileReader();
    reader.onload = () => {
      const link = document.createElement('a');
      link.href = reader.result as string;
      link.setAttribute('download', fullFilename);
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => document.body.removeChild(link), 300);
    };
    reader.readAsDataURL(blob);
  });
}

// Formatted export helpers
export function exportClients(clients: Client[]): void {
  const data = clients.map(c => ({
    'Nombre': c.name,
    'Tipo Doc.': c.documentType,
    'N° Documento': c.documentNumber,
    'Email': c.email,
    'Teléfono': c.phone,
    'País': c.country,
    'Dirección': c.address,
    'Notas': c.notes,
    'Creado': new Date(c.createdAt).toLocaleString('es-PE'),
  }));
  exportToExcel(data, 'clientes');
}

export function exportQuotations(quotations: Quotation[], clients: Client[]): void {
  const data = quotations.map(q => {
    const client = clients.find(c => c.id === q.clientId);
    return {
      'N° Cotización': q.number,
      'Estado': q.status,
      'Cliente': client?.name || 'N/A',
      'Doc. Cliente': client?.documentNumber || '',
      'Moneda': q.currency,
      'Subtotal': q.subtotal,
      'Descuento': q.discountAmount,
      'Retención (%)': q.retentionPercentage,
      'Retención': q.retentionAmount,
      'Total': q.total,
      'Método Pago': q.paymentMethod,
      'Fecha Emisión': new Date(q.issueDate).toLocaleString('es-PE'),
      'Fecha Vencimiento': q.dueDate ? new Date(q.dueDate).toLocaleString('es-PE') : '',
      'Notas': q.notes,
    };
  });
  exportToExcel(data, 'cotizaciones');
}

export function exportReceipts(receipts: Receipt[], clients: Client[]): void {
  const data = receipts.map(r => {
    const client = clients.find(c => c.id === r.clientId);
    return {
      'N° Recibo': r.number,
      'Estado SUNAT': r.sunatStatus,
      'Cliente': client?.name || 'N/A',
      'Doc. Cliente': client?.documentNumber || '',
      'Servicio': r.serviceDescription,
      'Moneda': r.currency,
      'Monto Bruto': r.grossAmount,
      'Retención (%)': r.retentionPercentage,
      'Retención': r.retentionAmount,
      'Monto Neto': r.netAmount,
      'Método Pago': r.paymentMethod,
      'Ref. Pago': r.paymentReference,
      'Fecha Emisión': new Date(r.issueDate).toLocaleString('es-PE'),
    };
  });
  exportToExcel(data, 'recibos_honorarios');
}

// ============================================
// ACCOUNTING: DEFAULT ACCOUNTS
// ============================================

const DEFAULT_ACCOUNTS: Omit<Account, 'id' | 'createdAt'>[] = [
  { code: '101', name: 'Caja (Efectivo)', type: 'asset', balance: 0, isDefault: true },
  { code: '102', name: 'Bancos (Transferencia)', type: 'asset', balance: 0, isDefault: true },
  { code: '103', name: 'Yape / Plin', type: 'asset', balance: 0, isDefault: true },
  { code: '104', name: 'PayPal', type: 'asset', balance: 0, isDefault: true },
  { code: '105', name: 'Cripto / Bitcoin', type: 'asset', balance: 0, isDefault: true },
  { code: '121', name: 'Cuentas por Cobrar', type: 'asset', balance: 0, isDefault: true },
  { code: '401', name: 'IR por Pagar (Retención 4ta)', type: 'liability', balance: 0, isDefault: true },
  { code: '501', name: 'Capital', type: 'equity', balance: 0, isDefault: true },
  { code: '701', name: 'Ingresos por Servicios', type: 'income', balance: 0, isDefault: true },
  { code: '801', name: 'Gastos Operativos', type: 'expense', balance: 0, isDefault: true },
  { code: '802', name: 'Comisiones Bancarias', type: 'expense', balance: 0, isDefault: true },
  { code: '803', name: 'Herramientas / Software', type: 'expense', balance: 0, isDefault: true },
  { code: '804', name: 'Reuniones / Alimentación', type: 'expense', balance: 0, isDefault: true },
  { code: '805', name: 'Marketing / Publicidad', type: 'expense', balance: 0, isDefault: true },
  { code: '806', name: 'Transporte', type: 'expense', balance: 0, isDefault: true },
  { code: '899', name: 'Otros Gastos', type: 'expense', balance: 0, isDefault: true },
];

export const accountStore = {
  getAll(): Account[] {
    let accounts = getStore<Account>(KEYS.accounts);
    if (accounts.length === 0) {
      accounts = DEFAULT_ACCOUNTS.map(a => ({
        ...a,
        id: generateId(),
        createdAt: new Date().toISOString(),
      }));
      setStore(KEYS.accounts, accounts);
    }
    return accounts;
  },
  async getAllAsync(): Promise<Account[]> {
    if (shouldUseAPI()) return apiCall('accounts.getAll');
    return this.getAll();
  },
  getById(id: string): Account | undefined {
    return this.getAll().find(a => a.id === id);
  },
  create(data: Omit<Account, 'id' | 'createdAt'>): Account {
    const accounts = this.getAll();
    const account: Account = { ...data, id: generateId(), createdAt: new Date().toISOString() };
    accounts.push(account);
    setStore(KEYS.accounts, accounts);
    if (shouldUseAPI()) apiCall('accounts.create', data).catch(console.error);
    return account;
  },
  update(id: string, data: Partial<Account>): Account | null {
    const accounts = this.getAll();
    const idx = accounts.findIndex(a => a.id === id);
    if (idx === -1) return null;
    accounts[idx] = { ...accounts[idx], ...data };
    setStore(KEYS.accounts, accounts);
    return accounts[idx];
  },
  updateBalance(id: string, delta: number): void {
    const accounts = this.getAll();
    const idx = accounts.findIndex(a => a.id === id);
    if (idx === -1) return;
    accounts[idx].balance = Math.round((accounts[idx].balance + delta) * 100) / 100;
    setStore(KEYS.accounts, accounts);
    if (shouldUseAPI()) apiCall('accounts.updateBalance', { id, delta }).catch(console.error);
  },
  delete(id: string): boolean {
    const accounts = this.getAll();
    const acct = accounts.find(a => a.id === id);
    if (!acct || acct.isDefault) return false;
    setStore(KEYS.accounts, accounts.filter(a => a.id !== id));
    if (shouldUseAPI()) apiCall('accounts.delete', { id }).catch(console.error);
    return true;
  },
};

// ============================================
// JOURNAL ENTRY OPERATIONS
// ============================================

export const journalStore = {
  getAll(): JournalEntry[] {
    return getStore<JournalEntry>(KEYS.journal);
  },
  async getAllAsync(): Promise<JournalEntry[]> {
    if (shouldUseAPI()) return apiCall('journal.getAll');
    return this.getAll();
  },
  create(data: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>): JournalEntry {
    const entries = this.getAll();
    const entry: JournalEntry = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    entries.push(entry);
    setStore(KEYS.journal, entries);
    // Actualizar saldos de cuentas
    accountStore.updateBalance(data.debitAccountId, data.amount);
    accountStore.updateBalance(data.creditAccountId, -data.amount);
    if (shouldUseAPI()) apiCall('journal.create', data).catch(console.error);
    return entry;
  },
  update(id: string, data: Partial<JournalEntry>): JournalEntry | null {
    const entries = this.getAll();
    const idx = entries.findIndex(e => e.id === id);
    if (idx === -1) return null;
    entries[idx] = { ...entries[idx], ...data, updatedAt: new Date().toISOString() };
    setStore(KEYS.journal, entries);
    return entries[idx];
  },
  createAdjustment(originalId: string, description: string, debitAccountId: string, creditAccountId: string, amount: number): JournalEntry {
    return this.create({
      date: new Date().toISOString().split('T')[0],
      description: `[AJUSTE] ${description}`,
      debitAccountId,
      creditAccountId,
      amount: Math.round(amount * 100) / 100,
      originalCurrency: 'PEN',
      originalAmount: amount,
      exchangeRate: 1,
      referenceType: 'adjustment',
      referenceId: originalId,
      notes: `Ajuste del asiento ${originalId}`,
    });
  },
};

// ============================================
// CASH REGISTER OPERATIONS
// ============================================

export const cashRegisterStore = {
  getAll(): CashMovement[] {
    return getStore<CashMovement>(KEYS.cashRegister);
  },
  async getAllAsync(): Promise<CashMovement[]> {
    if (shouldUseAPI()) return apiCall('cash.getAll');
    return this.getAll();
  },
  getCurrentBalance(): number {
    const movements = this.getAll();
    if (movements.length === 0) return 0;
    return movements[movements.length - 1].balanceAfter;
  },
  addMovement(data: { date: string; description: string; type: 'income' | 'expense' | 'adjustment'; amount: number; referenceType: 'receipt' | 'manual' | 'adjustment' | 'capital'; referenceId: string; notes: string }): CashMovement {
    const movements = this.getAll();
    const balanceBefore = this.getCurrentBalance();
    const signedAmount = data.type === 'expense' ? -Math.abs(data.amount) : Math.abs(data.amount);
    const balanceAfter = Math.round((balanceBefore + signedAmount) * 100) / 100;
    const movement: CashMovement = {
      id: generateId(),
      date: data.date,
      description: data.description,
      type: data.type,
      amount: Math.round(signedAmount * 100) / 100,
      balanceBefore: Math.round(balanceBefore * 100) / 100,
      balanceAfter,
      referenceType: data.referenceType,
      referenceId: data.referenceId,
      notes: data.notes,
      createdAt: new Date().toISOString(),
    };
    movements.push(movement);
    setStore(KEYS.cashRegister, movements);
    if (shouldUseAPI()) apiCall('cash.addMovement', data).catch(console.error);
    return movement;
  },
  addAdjustment(description: string, amount: number, notes: string): CashMovement {
    return this.addMovement({
      date: new Date().toISOString().split('T')[0],
      description: `[AJUSTE] ${description}`,
      type: 'adjustment',
      amount,
      referenceType: 'adjustment',
      referenceId: '',
      notes,
    });
  },
};

// ============================================
// AUTO-GENERATE ACCOUNTING FROM RECEIPT
// ============================================

export function generateAccountingFromReceipt(
  receipt: Receipt,
  client: Client | undefined,
  exchangeRate: number = 1
): void {
  const accounts = accountStore.getAll();
  const getAcct = (code: string) => accounts.find(a => a.code === code);
  
  // Seleccionar cuenta según método de pago
  const paymentAccountMap: Record<string, string> = {
    cash: '101',        // Caja (Efectivo)
    transfer: '102',    // Bancos (Transferencia)
    yape_plin: '103',   // Yape / Plin
    paypal: '104',      // PayPal
    crypto: '105',      // Cripto / Bitcoin
    card: '102',        // Bancos
    other: '101',       // Caja por defecto
  };
  const paymentCode = paymentAccountMap[receipt.paymentMethod] || '101';
  const paymentAccount = getAcct(paymentCode) || getAcct('101');
  const incomeAccount = getAcct('701');
  const retentionAccount = getAcct('401');
  
  if (!paymentAccount || !incomeAccount) return;

  const amountPEN = Math.round(receipt.netAmount * exchangeRate * 100) / 100;
  const grossPEN = Math.round(receipt.grossAmount * exchangeRate * 100) / 100;
  const retentionPEN = Math.round(receipt.retentionAmount * exchangeRate * 100) / 100;
  const clientName = client?.name || 'Cliente';
  const tcNote = exchangeRate !== 1 ? ` (TC: ${exchangeRate.toFixed(4)})` : '';

  // Asiento 1: Ingreso bruto (Cuenta Pago → Ingresos)
  journalStore.create({
    date: receipt.issueDate,
    description: `Recibo ${receipt.number} — ${clientName} (Honorarios)${tcNote}`,
    debitAccountId: paymentAccount.id,
    creditAccountId: incomeAccount.id,
    amount: grossPEN,
    originalCurrency: receipt.currency,
    originalAmount: receipt.grossAmount,
    exchangeRate,
    referenceType: 'receipt',
    referenceId: receipt.id,
    notes: receipt.serviceDescription,
  });

  // Asiento 2: Retención IR (si aplica)
  if (retentionPEN > 0 && retentionAccount) {
    journalStore.create({
      date: receipt.issueDate,
      description: `Retención IR 4ta — Recibo ${receipt.number} (${receipt.retentionPercentage}%)`,
      debitAccountId: retentionAccount.id,
      creditAccountId: paymentAccount.id,
      amount: retentionPEN,
      originalCurrency: receipt.currency,
      originalAmount: receipt.retentionAmount,
      exchangeRate,
      referenceType: 'receipt',
      referenceId: receipt.id,
      notes: `Retención del ${receipt.retentionPercentage}% sobre S/ ${grossPEN.toFixed(2)}`,
    });
  }

  // Movimiento de caja: ingreso neto
  cashRegisterStore.addMovement({
    date: receipt.issueDate,
    description: `Cobro Recibo ${receipt.number} — ${clientName}`,
    type: 'income',
    amount: amountPEN,
    referenceType: 'receipt',
    referenceId: receipt.id,
    notes: exchangeRate !== 1 ? `TC: ${exchangeRate} (${receipt.currency} ${receipt.netAmount.toFixed(2)})` : '',
  });
}

// ============================================
// ACCOUNTING EXCEL EXPORTS
// ============================================

export function exportJournal(entries: JournalEntry[], accounts: Account[]): void {
  const getName = (id: string) => accounts.find(a => a.id === id)?.name || 'N/A';
  const getCode = (id: string) => accounts.find(a => a.id === id)?.code || '';
  const data = entries.map(e => ({
    'Fecha': new Date(e.date).toLocaleDateString('es-PE'),
    'Hora': new Date(e.createdAt).toLocaleTimeString('es-PE'),
    'Descripción': e.description,
    'Cuenta Debe': `${getCode(e.debitAccountId)} - ${getName(e.debitAccountId)}`,
    'Cuenta Haber': `${getCode(e.creditAccountId)} - ${getName(e.creditAccountId)}`,
    'Monto (S/)': `${e.referenceType === 'receipt' || e.referenceType === 'capital' || (e.referenceType === 'adjustment' && e.amount > 0) ? '+' : '-'} ${Math.abs(e.amount).toFixed(2)}`,
    'Moneda Original': e.originalCurrency,
    'Monto Original': e.originalAmount.toFixed(2),
    'T. Cambio': e.exchangeRate.toFixed(4),
    'Tipo': e.referenceType === 'receipt' ? 'Automático' : e.referenceType === 'adjustment' ? 'Ajuste' : e.referenceType === 'capital' ? 'Aporte' : 'Gasto',
    'Notas': e.notes,
  }));
  exportToExcel(data, 'libro_diario');
}

export function exportCashRegister(movements: CashMovement[]): void {
  const data = movements.map(m => ({
    'Fecha': new Date(m.date).toLocaleDateString('es-PE'),
    'Hora': new Date(m.createdAt).toLocaleTimeString('es-PE'),
    'Descripción': m.description,
    'Tipo': m.type === 'income' ? 'Ingreso' : m.type === 'expense' ? 'Egreso' : 'Ajuste',
    'Monto (S/)': `${m.amount >= 0 ? '+' : '-'} ${Math.abs(m.amount).toFixed(2)}`,
    'Saldo Antes (S/)': m.balanceBefore.toFixed(2),
    'Saldo Después (S/)': m.balanceAfter.toFixed(2),
    'Notas': m.notes,
  }));
  exportToExcel(data, 'caja_general');
}
