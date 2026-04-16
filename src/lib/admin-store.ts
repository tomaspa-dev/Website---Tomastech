/**
 * admin-store.ts — Admin Panel v2 Data Layer
 * Fresh, clean store for the new admin panel.
 * Uses localStorage in dev, ready for NeonDB API in production.
 * 
 * Module dependency tree:
 *   Config (emisor data)
 *     ↓
 *   Services (catalog)
 *     ↓
 *   Clients (client list)
 *     ↓
 *   Quotations (requires: clients + services)
 *     ↓
 *   Receipts / Recibos por Honorarios (requires: quotations + clients)
 *     ↓
 *   Contracts (requires: clients, can reference quotations)
 *     ↓
 *   Accounting (auto-fed from receipts, manual entries)
 *     ↓
 *   Reports (reads all)
 */

// ============================================================
// TYPES
// ============================================================

export type DocumentType = 'DNI' | 'RUC' | 'PASAPORTE' | 'CE';
export type Currency = 'PEN' | 'USD' | 'EUR';
export type PaymentMethod = 'transfer' | 'cash' | 'yape_plin' | 'paypal' | 'card' | 'crypto' | 'other';
export type QuotationStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
export type ReceiptStatus = 'pending' | 'issued' | 'voided';
export type ContractStatus = 'draft' | 'sent' | 'signed' | 'active' | 'completed' | 'cancelled';
export type ClientStatus = 'active' | 'suspended';

// ─── CLIENT ──────────────────────────────────────────────────

export interface Client {
  id: string;
  name: string;                // Nombres y apellidos / Razón social
  documentType: DocumentType;
  documentNumber: string;
  email: string;
  phone: string;
  country: string;             // Default: 'PE'
  address: string;
  notes: string;
  status: ClientStatus;
  createdAt: string;
  updatedAt: string;
}

// ─── SERVICE (catalog) ───────────────────────────────────────

export interface Service {
  id: string;
  name: string;                // Ej: "Desarrollo Web"
  description: string;
  defaultPrice: number;        // Precio sugerido
  currency: Currency;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

// ─── QUOTATION ───────────────────────────────────────────────

export interface QuotationItem {
  id: string;
  description: string;         // Puede ser servicio del catálogo o personalizado
  quantity: number;
  unitPrice: number;
  subtotal: number;            // quantity * unitPrice
}

export interface Quotation {
  id: string;
  number: string;              // COT-2026-0001
  clientId: string;
  status: QuotationStatus;
  currency: Currency;
  items: QuotationItem[];
  subtotal: number;            // Suma de items
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  discountAmount: number;
  // Retención 4ta Categoría (Perú):
  // Aplica cuando el PAGADOR (cliente) tiene RUC que empiece con 20
  // Y cuando el monto bruto supera S/ 1,500
  applyRetention: boolean;
  retentionPercentage: number; // Default 8%
  retentionAmount: number;
  total: number;               // subtotal - discountAmount (el cliente paga esto)
  netToReceive: number;        // total - retentionAmount (lo que recibo yo)
  paymentMethod: PaymentMethod;
  paymentTerms: string;        // Ej: "50% adelanto, 50% al entregar"
  deliveryDays: number;        // Días hábiles estimados
  validityDays: number;        // Días de validez de la cotización
  notes: string;
  issueDate: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

// ─── RECEIPT / RECIBO POR HONORARIOS ─────────────────────────

export interface Receipt {
  id: string;
  series: string;              // E001
  correlative: number;         // 1
  number: string;              // E001-00001
  quotationId?: string;        // Opcional: vinculado a cotización
  clientId: string;
  serviceDescription: string;
  grossAmount: number;         // Monto de honorarios (bruto)
  applyRetention: boolean;
  retentionPercentage: number; // 8%
  retentionAmount: number;
  netAmount: number;           // grossAmount - retentionAmount
  currency: Currency;
  paymentMethod: PaymentMethod;
  paymentReference: string;
  issueDate: string;
  sunatStatus: ReceiptStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// ─── CONTRACT ────────────────────────────────────────────────

export interface ContractClause {
  id: string;
  type: 'confidentiality' | 'ip_rights' | 'late_penalty' | 'payment_terms' | 'support' | 'custom';
  title: string;
  content: string;
  enabled: boolean;
}

export interface Contract {
  id: string;
  number: string;              // CON-2026-0001
  clientId: string;
  quotationId?: string;        // Opcional
  title: string;               // Ej: "Desarrollo de Plataforma E-Commerce"
  serviceScope: string;        // Descripción detallada del alcance
  value: number;               // Valor total del contrato
  currency: Currency;
  advancePercent: number;      // % de adelanto (0-100)
  paymentMethod: PaymentMethod;
  startDate: string;
  estimatedEndDate: string;
  status: ContractStatus;
  clauses: ContractClause[];
  // Digital Signature
  signerName: string;          // Nombre del prestador (desde config)
  signerDocument: string;      // DNI/RUC del prestador
  signatureData?: string;      // base64 PNG de la firma dibujada
  signedAt?: string;           // ISO timestamp del firmado
  // Storage: Para contratos firmados se genera PDF y se puede almacenar en NeonDB
  // TODO (production): Subir a NeonDB via Netlify Function al firmar
  pdfStorageKey?: string;      // Key en localStorage o URL en NeonDB
  createdAt: string;
  updatedAt: string;
}

// ─── ACCOUNTING ──────────────────────────────────────────────

export type MovementType = 'income' | 'expense';

export interface AccountingEntry {
  id: string;
  date: string;
  description: string;
  type: MovementType;
  amount: number;              // Siempre positivo
  currency: Currency;
  category: string;            // Ej: "Servicios Web", "Licencias", "Marketing"
  referenceType?: 'receipt' | 'manual';
  referenceId?: string;        // ID del recibo si es automático
  notes: string;
  createdAt: string;
}

// ─── EMITTER CONFIG (el dueño del panel) ─────────────────────

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  cci: string;                 // Código de Cuenta Interbancario (Perú)
  accountHolder: string;
  currency: Currency;
}

export interface EmitterConfig {
  businessName: string;        // Ej: 'Tomastech'
  fullName: string;            // Nombre completo del freelancer
  documentType: 'RUC' | 'DNI';
  documentNumber: string;
  address: string;
  email: string;
  phone: string;
  website: string;
  logoData: string;            // base64 del logo cargado
  bankAccounts: BankAccount[];
  // Retención IR 4ta Categoría (Perú)
  retentionEnabled: boolean;   // Si aplica la retención
  retentionPercentage: number; // Default 8%
  retentionThreshold: number;  // Default 1500 (PEN)
  // Numeración
  receiptSeries: string;       // E001
  nextReceiptCorrelative: number;
  quotationPrefix: string;     // COT
  nextQuotationNumber: number;
  contractPrefix: string;      // CON
  nextContractNumber: number;
  quotationValidityDays: number; // Default 15 días hábiles
  quotationDeliveryDays: number; // Default 30 días hábiles
}

// ============================================================
// STORAGE KEYS
// ============================================================

export const ADMIN_KEYS = {
  clients:    'tt_admin_clients',
  services:   'tt_admin_services',
  quotations: 'tt_admin_quotations',
  receipts:   'tt_admin_receipts',
  contracts:  'tt_admin_contracts',
  accounting: 'tt_admin_accounting',
  config:     'tt_admin_config',
} as const;

// ============================================================
// HELPERS
// ============================================================

export function generateId(): string {
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

export function now(): string {
  return new Date().toISOString();
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-PE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

export function formatCurrency(amount: number, currency: Currency = 'PEN'): string {
  const sym: Record<Currency, string> = { PEN: 'S/', USD: 'US$', EUR: '€' };
  return `${sym[currency]} ${amount.toFixed(2)}`;
}

/** Returns true if client has company RUC (starts with 20) */
export function isCompanyRUC(documentType: DocumentType, documentNumber: string): boolean {
  return documentType === 'RUC' && documentNumber.startsWith('20');
}

/** Calculate if retention applies for a given amount and client */
export function calcRetention(
  grossAmount: number,
  client: Pick<Client, 'documentType' | 'documentNumber'>,
  config: Pick<EmitterConfig, 'retentionEnabled' | 'retentionPercentage' | 'retentionThreshold'>
): { applies: boolean; amount: number; percentage: number } {
  const applies =
    config.retentionEnabled &&
    isCompanyRUC(client.documentType, client.documentNumber) &&
    grossAmount > config.retentionThreshold;

  const amount = applies ? grossAmount * (config.retentionPercentage / 100) : 0;
  return { applies, amount, percentage: config.retentionPercentage };
}

/** Add N business days (Mon-Fri) to a date */
export function addBusinessDays(start: Date, days: number): Date {
  const result = new Date(start);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    const dow = result.getDay();
    if (dow !== 0 && dow !== 6) added++;
  }
  return result;
}

// ============================================================
// DEFAULT CONFIG
// ============================================================

export const DEFAULT_CONFIG: EmitterConfig = {
  businessName: 'Tomastech',
  fullName: '',
  documentType: 'RUC',
  documentNumber: '',
  address: '',
  email: '',
  phone: '',
  website: 'tomastech.dev',
  logoData: '',
  bankAccounts: [],
  retentionEnabled: true,
  retentionPercentage: 8,
  retentionThreshold: 1500,
  receiptSeries: 'E001',
  nextReceiptCorrelative: 1,
  quotationPrefix: 'COT',
  nextQuotationNumber: 1,
  contractPrefix: 'CON',
  nextContractNumber: 1,
  quotationValidityDays: 15,
  quotationDeliveryDays: 30,
};

// ============================================================
// DEFAULT CONTRACT CLAUSES (templates)
// ============================================================

export const DEFAULT_CLAUSES: ContractClause[] = [
  {
    id: 'confidentiality',
    type: 'confidentiality',
    title: 'Confidencialidad',
    content: 'Ambas partes se comprometen a mantener estricta confidencialidad sobre toda información compartida durante la relación de servicios. Esta obligación permanece vigente por un período de 2 años después de la finalización del contrato.',
    enabled: true,
  },
  {
    id: 'ip_rights',
    type: 'ip_rights',
    title: 'Propiedad Intelectual',
    content: 'Una vez efectuado el pago total acordado, el CLIENTE adquiere todos los derechos sobre el producto final entregado. El PRESTADOR conserva el derecho de mencionar el proyecto en su portafolio, salvo indicación expresa del CLIENTE.',
    enabled: true,
  },
  {
    id: 'late_penalty',
    type: 'late_penalty',
    title: 'Penalidades por Retraso del Cliente',
    content: 'Si el CLIENTE no proporciona los materiales o feedback necesario dentro del plazo acordado, los plazos de entrega se extenderán proporcionalmente. El retraso por parte del CLIENTE no impone penalidad al PRESTADOR.',
    enabled: false,
  },
  {
    id: 'support',
    type: 'support',
    title: 'Soporte Post-Entrega',
    content: 'El PRESTADOR brindará soporte técnico gratuito de 15 días calendarios contados desde la entrega del proyecto. Cualquier modificación adicional o nueva funcionalidad será presupuestada por separado.',
    enabled: true,
  },
];

// ============================================================
// CONFIG OPERATIONS
// ============================================================

export const configStore = {
  get(): EmitterConfig {
    try {
      const data = localStorage.getItem(ADMIN_KEYS.config);
      return data ? { ...DEFAULT_CONFIG, ...JSON.parse(data) } : DEFAULT_CONFIG;
    } catch {
      return DEFAULT_CONFIG;
    }
  },
  save(config: EmitterConfig): void {
    localStorage.setItem(ADMIN_KEYS.config, JSON.stringify(config));
  },
};

// ============================================================
// CLIENT OPERATIONS
// ============================================================

export const clientStore = {
  getAll(): Client[] {
    return getStore<Client>(ADMIN_KEYS.clients);
  },
  getById(id: string): Client | undefined {
    return this.getAll().find((c) => c.id === id);
  },
  search(query: string): Client[] {
    const q = query.toLowerCase();
    return this.getAll().filter(
      (c) =>
        c.status === 'active' &&
        (c.name.toLowerCase().includes(q) ||
          c.documentNumber.includes(q) ||
          c.email.toLowerCase().includes(q))
    );
  },
  create(data: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Client {
    const client: Client = {
      ...data,
      id: generateId(),
      createdAt: now(),
      updatedAt: now(),
    };
    const all = this.getAll();
    setStore(ADMIN_KEYS.clients, [...all, client]);
    return client;
  },
  update(id: string, data: Partial<Client>): Client {
    const all = this.getAll();
    const idx = all.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error('Client not found');
    all[idx] = { ...all[idx], ...data, updatedAt: now() };
    setStore(ADMIN_KEYS.clients, all);
    return all[idx];
  },
  delete(id: string): void {
    setStore(ADMIN_KEYS.clients, this.getAll().filter((c) => c.id !== id));
  },
};

// ============================================================
// SERVICE OPERATIONS
// ============================================================

export const serviceStore = {
  getAll(): Service[] {
    return getStore<Service>(ADMIN_KEYS.services);
  },
  getActive(): Service[] {
    return this.getAll().filter((s) => s.status === 'active');
  },
  create(data: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>): Service {
    const service: Service = {
      ...data,
      id: generateId(),
      createdAt: now(),
      updatedAt: now(),
    };
    const all = this.getAll();
    setStore(ADMIN_KEYS.services, [...all, service]);
    return service;
  },
  update(id: string, data: Partial<Service>): Service {
    const all = this.getAll();
    const idx = all.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error('Service not found');
    all[idx] = { ...all[idx], ...data, updatedAt: now() };
    setStore(ADMIN_KEYS.services, all);
    return all[idx];
  },
  delete(id: string): void {
    setStore(ADMIN_KEYS.services, this.getAll().filter((s) => s.id !== id));
  },
};

// ============================================================
// QUOTATION OPERATIONS
// ============================================================

export const quotationStore = {
  getAll(): Quotation[] {
    return getStore<Quotation>(ADMIN_KEYS.quotations)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  getById(id: string): Quotation | undefined {
    return this.getAll().find((q) => q.id === id);
  },
  create(data: Omit<Quotation, 'id' | 'number' | 'createdAt' | 'updatedAt'>): Quotation {
    const config = configStore.get();
    const num = String(config.nextQuotationNumber).padStart(4, '0');
    const quotation: Quotation = {
      ...data,
      id: generateId(),
      number: `${config.quotationPrefix}-${new Date().getFullYear()}-${num}`,
      createdAt: now(),
      updatedAt: now(),
    };
    const all = this.getAll();
    setStore(ADMIN_KEYS.quotations, [...all, quotation]);
    // Increment counter
    configStore.save({ ...config, nextQuotationNumber: config.nextQuotationNumber + 1 });
    return quotation;
  },
  update(id: string, data: Partial<Quotation>): Quotation {
    const all = this.getAll();
    const idx = all.findIndex((q) => q.id === id);
    if (idx === -1) throw new Error('Quotation not found');
    all[idx] = { ...all[idx], ...data, updatedAt: now() };
    setStore(ADMIN_KEYS.quotations, all);
    return all[idx];
  },
  delete(id: string): void {
    setStore(ADMIN_KEYS.quotations, this.getAll().filter((q) => q.id !== id));
  },
};

// ============================================================
// RECEIPT OPERATIONS
// ============================================================

export const receiptStore = {
  getAll(): Receipt[] {
    return getStore<Receipt>(ADMIN_KEYS.receipts)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  getById(id: string): Receipt | undefined {
    return this.getAll().find((r) => r.id === id);
  },
  create(data: Omit<Receipt, 'id' | 'series' | 'correlative' | 'number' | 'createdAt' | 'updatedAt'>): Receipt {
    const config = configStore.get();
    const corr = config.nextReceiptCorrelative;
    const receipt: Receipt = {
      ...data,
      id: generateId(),
      series: config.receiptSeries,
      correlative: corr,
      number: `${config.receiptSeries}-${String(corr).padStart(5, '0')}`,
      createdAt: now(),
      updatedAt: now(),
    };
    const all = this.getAll();
    setStore(ADMIN_KEYS.receipts, [...all, receipt]);
    configStore.save({ ...config, nextReceiptCorrelative: corr + 1 });
    return receipt;
  },
  update(id: string, data: Partial<Receipt>): Receipt {
    const all = this.getAll();
    const idx = all.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error('Receipt not found');
    all[idx] = { ...all[idx], ...data, updatedAt: now() };
    setStore(ADMIN_KEYS.receipts, all);
    return all[idx];
  },
};

// ============================================================
// CONTRACT OPERATIONS
// ============================================================

export const contractStore = {
  getAll(): Contract[] {
    return getStore<Contract>(ADMIN_KEYS.contracts)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  getById(id: string): Contract | undefined {
    return this.getAll().find((c) => c.id === id);
  },
  create(data: Omit<Contract, 'id' | 'number' | 'createdAt' | 'updatedAt'>): Contract {
    const config = configStore.get();
    const num = String(config.nextContractNumber).padStart(4, '0');
    const contract: Contract = {
      ...data,
      id: generateId(),
      number: `${config.contractPrefix}-${new Date().getFullYear()}-${num}`,
      createdAt: now(),
      updatedAt: now(),
    };
    const all = this.getAll();
    setStore(ADMIN_KEYS.contracts, [...all, contract]);
    configStore.save({ ...config, nextContractNumber: config.nextContractNumber + 1 });
    return contract;
  },
  update(id: string, data: Partial<Contract>): Contract {
    const all = this.getAll();
    const idx = all.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error('Contract not found');
    all[idx] = { ...all[idx], ...data, updatedAt: now() };
    setStore(ADMIN_KEYS.contracts, all);
    return all[idx];
  },
  delete(id: string): void {
    setStore(ADMIN_KEYS.contracts, this.getAll().filter((c) => c.id !== id));
  },
};

// ============================================================
// ACCOUNTING OPERATIONS
// ============================================================

export const accountingStore = {
  getAll(): AccountingEntry[] {
    return getStore<AccountingEntry>(ADMIN_KEYS.accounting)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },
  create(data: Omit<AccountingEntry, 'id' | 'createdAt'>): AccountingEntry {
    const entry: AccountingEntry = { ...data, id: generateId(), createdAt: now() };
    const all = this.getAll();
    setStore(ADMIN_KEYS.accounting, [...all, entry]);
    return entry;
  },
  update(id: string, data: Partial<AccountingEntry>): AccountingEntry {
    const all = this.getAll();
    const idx = all.findIndex((e) => e.id === id);
    if (idx === -1) throw new Error('Entry not found');
    all[idx] = { ...all[idx], ...data };
    setStore(ADMIN_KEYS.accounting, all);
    return all[idx];
  },
  delete(id: string): void {
    setStore(ADMIN_KEYS.accounting, this.getAll().filter((e) => e.id !== id));
  },
  getSummary(): { totalIncome: number; totalExpenses: number; balance: number } {
    const all = this.getAll();
    const totalIncome = all.filter((e) => e.type === 'income').reduce((s, e) => s + e.amount, 0);
    const totalExpenses = all.filter((e) => e.type === 'expense').reduce((s, e) => s + e.amount, 0);
    return { totalIncome, totalExpenses, balance: totalIncome - totalExpenses };
  },
};

// ============================================================
// SEED DATA (for development testing)
// ============================================================

export function seedDemoData(): void {
  // Clear existing admin v2 data
  Object.values(ADMIN_KEYS).forEach((key) => localStorage.removeItem(key));

  // Config
  configStore.save({
    ...DEFAULT_CONFIG,
    businessName: 'Tomastech',
    fullName: 'Tomas Eduardo Pozu Asalde',
    documentType: 'RUC',
    documentNumber: '10xxxxxxxxx',  // User should fill their own
    email: 'hola@tomastech.dev',
    phone: '+51 999 999 999',
    website: 'tomastech.dev',
    bankAccounts: [
      {
        id: generateId(),
        bankName: 'BCP',
        accountNumber: '123-456789-0-12',
        cci: '00212300456789012345',
        accountHolder: 'Tomas Eduardo Pozu Asalde',
        currency: 'PEN',
      },
    ],
  });

  // Clients
  const c1 = clientStore.create({
    name: 'Empresa ABC SAC',
    documentType: 'RUC',
    documentNumber: '20123456789',
    email: 'contacto@empresaabc.com',
    phone: '+51 1 234-5678',
    country: 'PE',
    address: 'Av. Javier Prado Este 1234, San Isidro, Lima',
    notes: 'Cliente corporativo. Contacto: Gerente de TI',
    status: 'active',
  });
  const c2 = clientStore.create({
    name: 'Juan Pérez García',
    documentType: 'DNI',
    documentNumber: '12345678',
    email: 'juan.perez@gmail.com',
    phone: '+51 987 654 321',
    country: 'PE',
    address: 'Jr. Los Pinos 456, Miraflores, Lima',
    notes: 'Emprendedor. Proyecto de tienda online.',
    status: 'active',
  });
  clientStore.create({
    name: 'Tech Solutions EIRL',
    documentType: 'RUC',
    documentNumber: '20987654321',
    email: 'info@techsolutions.pe',
    phone: '+51 1 765-4321',
    country: 'PE',
    address: 'Av. Arequipa 789, Lince, Lima',
    notes: 'Startup tecnológica. Varios proyectos pendientes.',
    status: 'active',
  });

  // Services
  serviceStore.create({
    name: 'Desarrollo Web Completo',
    description: 'Sitio web responsive con diseño premium, animaciones y panel de administración',
    defaultPrice: 1200,
    currency: 'PEN',
    status: 'active',
  });
  serviceStore.create({
    name: 'Landing Page Premium',
    description: 'Página de aterrizaje optimizada para conversión, SEO y velocidad',
    defaultPrice: 500,
    currency: 'PEN',
    status: 'active',
  });
  serviceStore.create({
    name: 'Mantenimiento Mensual',
    description: 'Actualizaciones, backups, soporte técnico y monitoreo',
    defaultPrice: 200,
    currency: 'PEN',
    status: 'active',
  });

  // Quotations
  const issueDate = new Date().toISOString().split('T')[0];
  const q1 = quotationStore.create({
    clientId: c1.id,
    status: 'accepted',
    currency: 'PEN',
    items: [
      { id: generateId(), description: 'Desarrollo Web Completo', quantity: 2, unitPrice: 1200, subtotal: 2400 },
    ],
    subtotal: 2400,
    discountType: 'fixed',
    discountValue: 0,
    discountAmount: 0,
    applyRetention: true,        // RUC empresa, monto > 1500
    retentionPercentage: 8,
    retentionAmount: 192,        // 8% de 2400
    total: 2400,
    netToReceive: 2208,
    paymentMethod: 'transfer',
    paymentTerms: '50% adelanto (S/ 1,200) y 50% al entregar',
    deliveryDays: 30,
    validityDays: 15,
    notes: 'Incluye 2 revisiones por proyecto y 15 días de soporte post-entrega.',
    issueDate,
    expiresAt: addBusinessDays(new Date(), 15).toISOString().split('T')[0],
  });

  quotationStore.create({
    clientId: c2.id,
    status: 'sent',
    currency: 'PEN',
    items: [
      { id: generateId(), description: 'Landing Page Premium', quantity: 1, unitPrice: 500, subtotal: 500 },
    ],
    subtotal: 500,
    discountType: 'fixed',
    discountValue: 0,
    discountAmount: 0,
    applyRetention: false,       // DNI, no retención
    retentionPercentage: 8,
    retentionAmount: 0,
    total: 500,
    netToReceive: 500,
    paymentMethod: 'yape_plin',
    paymentTerms: 'Pago completo al inicio',
    deliveryDays: 14,
    validityDays: 15,
    notes: '',
    issueDate,
    expiresAt: addBusinessDays(new Date(), 15).toISOString().split('T')[0],
  });

  // Receipt
  receiptStore.create({
    quotationId: q1.id,
    clientId: c1.id,
    serviceDescription: 'Desarrollo Web Completo — Adelanto 50% (2 proyectos)',
    grossAmount: 1200,
    applyRetention: true,
    retentionPercentage: 8,
    retentionAmount: 96,
    netAmount: 1104,
    currency: 'PEN',
    paymentMethod: 'transfer',
    paymentReference: 'TRF-20260415-001',
    issueDate,
    sunatStatus: 'pending',
    notes: 'Adelanto del 50% según cotización COT-2026-0001',
  });

  // Accounting entries
  accountingStore.create({
    date: issueDate,
    description: 'Adelanto — Empresa ABC SAC (COT-2026-0001)',
    type: 'income',
    amount: 1104,               // Neto recibido (después de retención)
    currency: 'PEN',
    category: 'Servicios Web',
    referenceType: 'receipt',
    referenceId: 'receipt-seed',
    notes: 'Adelanto 50% del proyecto. Retención IR descontada.',
  });
  accountingStore.create({
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    description: 'Licencias de software — Abril 2026',
    type: 'expense',
    amount: 150,
    currency: 'PEN',
    category: 'Licencias y Software',
    referenceType: 'manual',
    notes: 'Figma, GitHub Pro, Vercel Pro',
  });

  console.log('✅ Tomastech Admin v2 — Demo data loaded successfully');
}
