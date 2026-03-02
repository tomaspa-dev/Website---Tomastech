/**
 * db.ts — Conexión compartida a Neon PostgreSQL
 * Se usa desde las Netlify Functions (API)
 */
import { neon } from '@neondatabase/serverless';

export function getDb() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  return neon(databaseUrl);
}

/**
 * Inicializa las tablas si no existen.
 * Se llama automáticamente en cada request (idempotente).
 */
export async function ensureSchema() {
  const sql = getDb();

  await sql`
    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      document_type TEXT NOT NULL DEFAULT 'DNI',
      document_number TEXT NOT NULL DEFAULT '',
      email TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      country TEXT DEFAULT 'PE',
      address TEXT DEFAULT '',
      notes TEXT DEFAULT '',
      status TEXT DEFAULT 'active',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL DEFAULT '',
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      cost_price NUMERIC(12,2) DEFAULT 0,
      sale_price NUMERIC(12,2) DEFAULT 0,
      currency TEXT DEFAULT 'PEN',
      status TEXT DEFAULT 'active',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      client_id TEXT REFERENCES clients(id) ON DELETE SET NULL,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      status TEXT DEFAULT 'planning',
      start_date TEXT DEFAULT '',
      end_date TEXT DEFAULT '',
      budget NUMERIC(12,2) DEFAULT 0,
      currency TEXT DEFAULT 'PEN',
      notes TEXT DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS quotations (
      id TEXT PRIMARY KEY,
      number TEXT NOT NULL,
      client_id TEXT REFERENCES clients(id) ON DELETE SET NULL,
      project_id TEXT DEFAULT '',
      status TEXT DEFAULT 'draft',
      currency TEXT DEFAULT 'PEN',
      subtotal NUMERIC(12,2) DEFAULT 0,
      discount_type TEXT DEFAULT 'fixed',
      discount_value NUMERIC(12,2) DEFAULT 0,
      discount_amount NUMERIC(12,2) DEFAULT 0,
      retention_percentage NUMERIC(5,2) DEFAULT 0,
      retention_amount NUMERIC(12,2) DEFAULT 0,
      total NUMERIC(12,2) DEFAULT 0,
      payment_method TEXT DEFAULT 'transfer',
      notes TEXT DEFAULT '',
      issue_date TEXT NOT NULL,
      due_date TEXT DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS quotation_items (
      id TEXT PRIMARY KEY,
      quotation_id TEXT REFERENCES quotations(id) ON DELETE CASCADE,
      description TEXT NOT NULL,
      quantity NUMERIC(10,2) DEFAULT 1,
      unit_price NUMERIC(12,2) DEFAULT 0,
      subtotal NUMERIC(12,2) DEFAULT 0
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS receipts (
      id TEXT PRIMARY KEY,
      series TEXT NOT NULL DEFAULT 'E001',
      correlative INT NOT NULL DEFAULT 1,
      number TEXT NOT NULL,
      quotation_id TEXT DEFAULT '',
      client_id TEXT REFERENCES clients(id) ON DELETE SET NULL,
      project_id TEXT DEFAULT '',
      service_description TEXT DEFAULT '',
      gross_amount NUMERIC(12,2) DEFAULT 0,
      retention_percentage NUMERIC(5,2) DEFAULT 0,
      retention_amount NUMERIC(12,2) DEFAULT 0,
      net_amount NUMERIC(12,2) DEFAULT 0,
      currency TEXT DEFAULT 'PEN',
      payment_method TEXT DEFAULT 'transfer',
      payment_reference TEXT DEFAULT '',
      issue_date TEXT NOT NULL,
      sunat_status TEXT DEFAULT 'pending',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      balance NUMERIC(12,2) DEFAULT 0,
      is_default BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS journal_entries (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      description TEXT NOT NULL,
      debit_account_id TEXT REFERENCES accounts(id) ON DELETE SET NULL,
      credit_account_id TEXT REFERENCES accounts(id) ON DELETE SET NULL,
      amount NUMERIC(12,2) DEFAULT 0,
      original_currency TEXT DEFAULT 'PEN',
      original_amount NUMERIC(12,2) DEFAULT 0,
      exchange_rate NUMERIC(10,4) DEFAULT 1,
      reference_type TEXT DEFAULT 'manual',
      reference_id TEXT DEFAULT '',
      notes TEXT DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS cash_movements (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      description TEXT NOT NULL,
      type TEXT NOT NULL,
      amount NUMERIC(12,2) DEFAULT 0,
      balance_before NUMERIC(12,2) DEFAULT 0,
      balance_after NUMERIC(12,2) DEFAULT 0,
      reference_type TEXT DEFAULT 'manual',
      reference_id TEXT DEFAULT '',
      notes TEXT DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS config (
      id TEXT PRIMARY KEY DEFAULT 'main',
      data JSONB NOT NULL DEFAULT '{}'::jsonb,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
}

// CORS headers for all API responses
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Content-Type': 'application/json',
};

// Helper: JSON response
export function jsonResponse(data: any, status = 200) {
  return {
    statusCode: status,
    headers: corsHeaders,
    body: JSON.stringify(data),
  };
}

// Helper: error response
export function errorResponse(message: string, status = 500) {
  return {
    statusCode: status,
    headers: corsHeaders,
    body: JSON.stringify({ error: message }),
  };
}

// Helper: generate ID (same as billing-store)
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
