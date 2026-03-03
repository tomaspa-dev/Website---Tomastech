/**
 * Netlify Function: Unified API for Billing System
 * 
 * Handles CRUD for all billing entities via Neon PostgreSQL.
 * Route pattern: POST /.netlify/functions/api
 * Body: { action: 'entity.method', data?: {...} }
 */
import type { Handler, HandlerEvent } from '@netlify/functions';
import { getDb, ensureSchema, jsonResponse, errorResponse, generateId, corsHeaders } from './shared/db';

let schemaReady = false;

const handler: Handler = async (event: HandlerEvent) => {
  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return errorResponse('Method not allowed', 405);
  }

  try {
    // Ensure schema on first call
    if (!schemaReady) {
      await ensureSchema();
      schemaReady = true;
    }

    const sql = getDb();
    const { action, data } = JSON.parse(event.body || '{}');

    if (!action) return errorResponse('Missing action', 400);

    // ============================================
    // CLIENTS
    // ============================================
    if (action === 'clients.getAll') {
      const rows = await sql`SELECT * FROM clients ORDER BY created_at DESC`;
      return jsonResponse(rows.map(rowToClient));
    }
    if (action === 'clients.create') {
      const id = generateId();
      await sql`INSERT INTO clients (id, name, document_type, document_number, email, phone, country, address, notes, status)
        VALUES (${id}, ${data.name}, ${data.documentType || 'DNI'}, ${data.documentNumber || ''}, ${data.email || ''}, ${data.phone || ''}, ${data.country || 'PE'}, ${data.address || ''}, ${data.notes || ''}, ${data.status || 'active'})`;
      const [row] = await sql`SELECT * FROM clients WHERE id = ${id}`;
      return jsonResponse(rowToClient(row));
    }
    if (action === 'clients.update') {
      await sql`UPDATE clients SET
        name = ${data.name}, document_type = ${data.documentType}, document_number = ${data.documentNumber},
        email = ${data.email || ''}, phone = ${data.phone || ''}, country = ${data.country || ''},
        address = ${data.address || ''}, notes = ${data.notes || ''}, status = ${data.status || 'active'},
        updated_at = NOW()
        WHERE id = ${data.id}`;
      const [row] = await sql`SELECT * FROM clients WHERE id = ${data.id}`;
      return jsonResponse(row ? rowToClient(row) : null);
    }
    if (action === 'clients.delete') {
      await sql`DELETE FROM clients WHERE id = ${data.id}`;
      return jsonResponse({ success: true });
    }

    // ============================================
    // SERVICES
    // ============================================
    if (action === 'services.getAll') {
      const rows = await sql`SELECT * FROM services ORDER BY created_at DESC`;
      return jsonResponse(rows.map(rowToService));
    }
    if (action === 'services.create') {
      const id = generateId();
      await sql`INSERT INTO services (id, code, name, description, cost_price, sale_price, currency, status)
        VALUES (${id}, ${data.code || ''}, ${data.name}, ${data.description || ''}, ${data.costPrice || 0}, ${data.salePrice || 0}, ${data.currency || 'PEN'}, ${data.status || 'active'})`;
      const [row] = await sql`SELECT * FROM services WHERE id = ${id}`;
      return jsonResponse(rowToService(row));
    }
    if (action === 'services.update') {
      await sql`UPDATE services SET
        code = ${data.code || ''}, name = ${data.name}, description = ${data.description || ''},
        cost_price = ${data.costPrice || 0}, sale_price = ${data.salePrice || 0},
        currency = ${data.currency || 'PEN'}, status = ${data.status || 'active'}, updated_at = NOW()
        WHERE id = ${data.id}`;
      const [row] = await sql`SELECT * FROM services WHERE id = ${data.id}`;
      return jsonResponse(row ? rowToService(row) : null);
    }
    if (action === 'services.delete') {
      await sql`DELETE FROM services WHERE id = ${data.id}`;
      return jsonResponse({ success: true });
    }

    // ============================================
    // PROJECTS
    // ============================================
    if (action === 'projects.getAll') {
      const rows = await sql`SELECT * FROM projects ORDER BY created_at DESC`;
      return jsonResponse(rows.map(rowToProject));
    }
    if (action === 'projects.create') {
      const id = generateId();
      await sql`INSERT INTO projects (id, client_id, name, description, status, start_date, end_date, budget, currency, notes)
        VALUES (${id}, ${data.clientId || null}, ${data.name}, ${data.description || ''}, ${data.status || 'planning'}, ${data.startDate || ''}, ${data.endDate || ''}, ${data.budget || 0}, ${data.currency || 'PEN'}, ${data.notes || ''})`;
      const [row] = await sql`SELECT * FROM projects WHERE id = ${id}`;
      return jsonResponse(rowToProject(row));
    }
    if (action === 'projects.update') {
      await sql`UPDATE projects SET
        client_id = ${data.clientId || null}, name = ${data.name}, description = ${data.description || ''},
        status = ${data.status || 'planning'}, start_date = ${data.startDate || ''}, end_date = ${data.endDate || ''},
        budget = ${data.budget || 0}, currency = ${data.currency || 'PEN'}, notes = ${data.notes || ''}, updated_at = NOW()
        WHERE id = ${data.id}`;
      const [row] = await sql`SELECT * FROM projects WHERE id = ${data.id}`;
      return jsonResponse(row ? rowToProject(row) : null);
    }
    if (action === 'projects.delete') {
      await sql`DELETE FROM projects WHERE id = ${data.id}`;
      return jsonResponse({ success: true });
    }

    // ============================================
    // QUOTATIONS
    // ============================================
    if (action === 'quotations.getAll') {
      const rows = await sql`SELECT * FROM quotations ORDER BY created_at DESC`;
      const quotations = [];
      for (const row of rows) {
        const items = await sql`SELECT * FROM quotation_items WHERE quotation_id = ${row.id} ORDER BY id`;
        quotations.push(rowToQuotation(row, items));
      }
      return jsonResponse(quotations);
    }
    if (action === 'quotations.create') {
      const id = generateId();
      const number = data.number || `COT-${new Date().getFullYear()}-${String(data.correlative || 1).padStart(4, '0')}`;
      await sql`INSERT INTO quotations (id, number, client_id, project_id, status, currency, subtotal, discount_type, discount_value, discount_amount, retention_percentage, retention_amount, total, payment_method, notes, issue_date, due_date)
        VALUES (${id}, ${number}, ${data.clientId}, ${data.projectId || ''}, ${data.status || 'draft'}, ${data.currency || 'PEN'}, ${data.subtotal || 0}, ${data.discountType || 'fixed'}, ${data.discountValue || 0}, ${data.discountAmount || 0}, ${data.retentionPercentage || 0}, ${data.retentionAmount || 0}, ${data.total || 0}, ${data.paymentMethod || 'transfer'}, ${data.notes || ''}, ${data.issueDate}, ${data.dueDate || ''})`;
      // Insert items
      if (data.items && Array.isArray(data.items)) {
        for (const item of data.items) {
          const itemId = item.id || generateId();
          await sql`INSERT INTO quotation_items (id, quotation_id, description, quantity, unit_price, subtotal)
            VALUES (${itemId}, ${id}, ${item.description}, ${item.quantity || 1}, ${item.unitPrice || 0}, ${item.subtotal || 0})`;
        }
      }
      const [row] = await sql`SELECT * FROM quotations WHERE id = ${id}`;
      const items = await sql`SELECT * FROM quotation_items WHERE quotation_id = ${id}`;
      return jsonResponse(rowToQuotation(row, items));
    }
    if (action === 'quotations.update') {
      await sql`UPDATE quotations SET
        client_id = ${data.clientId}, project_id = ${data.projectId || ''}, status = ${data.status || 'draft'},
        currency = ${data.currency || 'PEN'}, subtotal = ${data.subtotal || 0},
        discount_type = ${data.discountType || 'fixed'}, discount_value = ${data.discountValue || 0},
        discount_amount = ${data.discountAmount || 0}, retention_percentage = ${data.retentionPercentage || 0},
        retention_amount = ${data.retentionAmount || 0}, total = ${data.total || 0},
        payment_method = ${data.paymentMethod || 'transfer'}, notes = ${data.notes || ''},
        issue_date = ${data.issueDate}, due_date = ${data.dueDate || ''}, updated_at = NOW()
        WHERE id = ${data.id}`;
      // Replace items
      await sql`DELETE FROM quotation_items WHERE quotation_id = ${data.id}`;
      if (data.items && Array.isArray(data.items)) {
        for (const item of data.items) {
          const itemId = item.id || generateId();
          await sql`INSERT INTO quotation_items (id, quotation_id, description, quantity, unit_price, subtotal)
            VALUES (${itemId}, ${data.id}, ${item.description}, ${item.quantity || 1}, ${item.unitPrice || 0}, ${item.subtotal || 0})`;
        }
      }
      const [row] = await sql`SELECT * FROM quotations WHERE id = ${data.id}`;
      const items = await sql`SELECT * FROM quotation_items WHERE quotation_id = ${data.id}`;
      return jsonResponse(row ? rowToQuotation(row, items) : null);
    }

    // ============================================
    // RECEIPTS
    // ============================================
    if (action === 'receipts.getAll') {
      const rows = await sql`SELECT * FROM receipts ORDER BY created_at DESC`;
      return jsonResponse(rows.map(rowToReceipt));
    }
    if (action === 'receipts.create') {
      const id = generateId();
      await sql`INSERT INTO receipts (id, series, correlative, number, quotation_id, client_id, project_id, service_description, gross_amount, retention_percentage, retention_amount, net_amount, currency, payment_method, payment_reference, issue_date, sunat_status)
        VALUES (${id}, ${data.series || 'E001'}, ${data.correlative || 1}, ${data.number}, ${data.quotationId || ''}, ${data.clientId}, ${data.projectId || ''}, ${data.serviceDescription || ''}, ${data.grossAmount || 0}, ${data.retentionPercentage || 0}, ${data.retentionAmount || 0}, ${data.netAmount || 0}, ${data.currency || 'PEN'}, ${data.paymentMethod || 'transfer'}, ${data.paymentReference || ''}, ${data.issueDate}, ${data.sunatStatus || 'pending'})`;
      const [row] = await sql`SELECT * FROM receipts WHERE id = ${id}`;
      return jsonResponse(rowToReceipt(row));
    }
    if (action === 'receipts.update') {
      await sql`UPDATE receipts SET
        sunat_status = ${data.sunatStatus || 'pending'}, updated_at = NOW()
        WHERE id = ${data.id}`;
      const [row] = await sql`SELECT * FROM receipts WHERE id = ${data.id}`;
      return jsonResponse(row ? rowToReceipt(row) : null);
    }

    // ============================================
    // ACCOUNTS
    // ============================================
    if (action === 'accounts.getAll') {
      const rows = await sql`SELECT * FROM accounts ORDER BY code`;
      if (rows.length === 0) {
        // Initialize default accounts
        await initDefaultAccounts(sql);
        const newRows = await sql`SELECT * FROM accounts ORDER BY code`;
        return jsonResponse(newRows.map(rowToAccount));
      }
      return jsonResponse(rows.map(rowToAccount));
    }
    if (action === 'accounts.create') {
      const id = generateId();
      await sql`INSERT INTO accounts (id, code, name, type, balance, is_default)
        VALUES (${id}, ${data.code}, ${data.name}, ${data.type}, ${data.balance || 0}, ${data.isDefault || false})`;
      const [row] = await sql`SELECT * FROM accounts WHERE id = ${id}`;
      return jsonResponse(rowToAccount(row));
    }
    if (action === 'accounts.updateBalance') {
      await sql`UPDATE accounts SET balance = balance + ${data.delta} WHERE id = ${data.id}`;
      return jsonResponse({ success: true });
    }
    if (action === 'accounts.delete') {
      const [acct] = await sql`SELECT * FROM accounts WHERE id = ${data.id}`;
      if (!acct || acct.is_default) return errorResponse('Cannot delete default account', 400);
      await sql`DELETE FROM accounts WHERE id = ${data.id}`;
      return jsonResponse({ success: true });
    }

    // ============================================
    // JOURNAL ENTRIES
    // ============================================
    if (action === 'journal.getAll') {
      const rows = await sql`SELECT * FROM journal_entries ORDER BY created_at DESC`;
      return jsonResponse(rows.map(rowToJournalEntry));
    }
    if (action === 'journal.create') {
      const id = generateId();
      await sql`INSERT INTO journal_entries (id, date, description, debit_account_id, credit_account_id, amount, original_currency, original_amount, exchange_rate, reference_type, reference_id, notes)
        VALUES (${id}, ${data.date}, ${data.description}, ${data.debitAccountId}, ${data.creditAccountId}, ${data.amount || 0}, ${data.originalCurrency || 'PEN'}, ${data.originalAmount || 0}, ${data.exchangeRate || 1}, ${data.referenceType || 'manual'}, ${data.referenceId || ''}, ${data.notes || ''})`;
      // Update account balances
      await sql`UPDATE accounts SET balance = balance + ${data.amount || 0} WHERE id = ${data.debitAccountId}`;
      await sql`UPDATE accounts SET balance = balance - ${data.amount || 0} WHERE id = ${data.creditAccountId}`;
      const [row] = await sql`SELECT * FROM journal_entries WHERE id = ${id}`;
      return jsonResponse(rowToJournalEntry(row));
    }

    // ============================================
    // CASH MOVEMENTS
    // ============================================
    if (action === 'cash.getAll') {
      const rows = await sql`SELECT * FROM cash_movements ORDER BY created_at`;
      return jsonResponse(rows.map(rowToCashMovement));
    }
    if (action === 'cash.getBalance') {
      const [row] = await sql`SELECT balance_after FROM cash_movements ORDER BY created_at DESC LIMIT 1`;
      return jsonResponse({ balance: row ? Number(row.balance_after) : 0 });
    }
    if (action === 'cash.addMovement') {
      const id = generateId();
      const [lastRow] = await sql`SELECT balance_after FROM cash_movements ORDER BY created_at DESC LIMIT 1`;
      const balanceBefore = lastRow ? Number(lastRow.balance_after) : 0;
      const signedAmount = data.type === 'expense' ? -Math.abs(data.amount) : Math.abs(data.amount);
      const balanceAfter = Math.round((balanceBefore + signedAmount) * 100) / 100;
      await sql`INSERT INTO cash_movements (id, date, description, type, amount, balance_before, balance_after, reference_type, reference_id, notes)
        VALUES (${id}, ${data.date}, ${data.description}, ${data.type}, ${Math.round(signedAmount * 100) / 100}, ${Math.round(balanceBefore * 100) / 100}, ${balanceAfter}, ${data.referenceType || 'manual'}, ${data.referenceId || ''}, ${data.notes || ''})`;
      const [row] = await sql`SELECT * FROM cash_movements WHERE id = ${id}`;
      return jsonResponse(rowToCashMovement(row));
    }

    // ============================================
    // CONFIG
    // ============================================
    if (action === 'config.get') {
      const [row] = await sql`SELECT * FROM config WHERE id = 'main'`;
      if (!row) return jsonResponse(null);
      return jsonResponse(row.data);
    }
    if (action === 'config.update') {
      await sql`
        INSERT INTO config (id, data, updated_at)
        VALUES ('main', ${JSON.stringify(data)}::jsonb, NOW())
        ON CONFLICT (id) DO UPDATE SET data = ${JSON.stringify(data)}::jsonb, updated_at = NOW()
      `;
      return jsonResponse(data);
    }

    // ============================================
    // BULK: Clear all data (dev tool)
    // ============================================
    if (action === 'bulk.clearAll') {
      await sql`DELETE FROM cash_movements`;
      await sql`DELETE FROM journal_entries`;
      await sql`DELETE FROM quotation_items`;
      await sql`DELETE FROM receipts`;
      await sql`DELETE FROM quotations`;
      await sql`DELETE FROM projects`;
      await sql`DELETE FROM services`;
      await sql`DELETE FROM clients`;
      await sql`DELETE FROM accounts`;
      return jsonResponse({ success: true });
    }

    // ============================================
    // INIT SCHEMA (explicit call)
    // ============================================
    if (action === 'schema.init') {
      schemaReady = false;
      await ensureSchema();
      schemaReady = true;
      return jsonResponse({ success: true, message: 'Schema initialized' });
    }

    return errorResponse(`Unknown action: ${action}`, 400);
  } catch (error: any) {
    console.error('API Error:', error);
    return errorResponse(error.message || 'Internal server error');
  }
};

// ============================================
// ROW MAPPERS (snake_case → camelCase)
// ============================================

function rowToClient(r: any) {
  return {
    id: r.id, name: r.name, documentType: r.document_type, documentNumber: r.document_number,
    email: r.email, phone: r.phone, country: r.country, address: r.address,
    notes: r.notes, status: r.status,
    createdAt: r.created_at?.toISOString?.() || r.created_at,
    updatedAt: r.updated_at?.toISOString?.() || r.updated_at,
  };
}

function rowToService(r: any) {
  return {
    id: r.id, code: r.code, name: r.name, description: r.description,
    costPrice: Number(r.cost_price), salePrice: Number(r.sale_price),
    currency: r.currency, status: r.status,
    createdAt: r.created_at?.toISOString?.() || r.created_at,
    updatedAt: r.updated_at?.toISOString?.() || r.updated_at,
  };
}

function rowToProject(r: any) {
  return {
    id: r.id, clientId: r.client_id, name: r.name, description: r.description,
    status: r.status, startDate: r.start_date, endDate: r.end_date,
    budget: Number(r.budget), currency: r.currency, notes: r.notes,
    createdAt: r.created_at?.toISOString?.() || r.created_at,
    updatedAt: r.updated_at?.toISOString?.() || r.updated_at,
  };
}

function rowToQuotation(r: any, items: any[]) {
  return {
    id: r.id, number: r.number, clientId: r.client_id, projectId: r.project_id,
    status: r.status, currency: r.currency, subtotal: Number(r.subtotal),
    discountType: r.discount_type, discountValue: Number(r.discount_value),
    discountAmount: Number(r.discount_amount), retentionPercentage: Number(r.retention_percentage),
    retentionAmount: Number(r.retention_amount), total: Number(r.total),
    paymentMethod: r.payment_method, notes: r.notes,
    issueDate: r.issue_date, dueDate: r.due_date,
    items: items.map(i => ({
      id: i.id, description: i.description, quantity: Number(i.quantity),
      unitPrice: Number(i.unit_price), subtotal: Number(i.subtotal),
    })),
    createdAt: r.created_at?.toISOString?.() || r.created_at,
    updatedAt: r.updated_at?.toISOString?.() || r.updated_at,
  };
}

function rowToReceipt(r: any) {
  return {
    id: r.id, series: r.series, correlative: r.correlative, number: r.number,
    quotationId: r.quotation_id, clientId: r.client_id, projectId: r.project_id,
    serviceDescription: r.service_description, grossAmount: Number(r.gross_amount),
    retentionPercentage: Number(r.retention_percentage), retentionAmount: Number(r.retention_amount),
    netAmount: Number(r.net_amount), currency: r.currency,
    paymentMethod: r.payment_method, paymentReference: r.payment_reference,
    issueDate: r.issue_date, sunatStatus: r.sunat_status,
    createdAt: r.created_at?.toISOString?.() || r.created_at,
    updatedAt: r.updated_at?.toISOString?.() || r.updated_at,
  };
}

function rowToAccount(r: any) {
  return {
    id: r.id, code: r.code, name: r.name, type: r.type,
    balance: Number(r.balance), isDefault: r.is_default,
    createdAt: r.created_at?.toISOString?.() || r.created_at,
  };
}

function rowToJournalEntry(r: any) {
  return {
    id: r.id, date: r.date, description: r.description,
    debitAccountId: r.debit_account_id, creditAccountId: r.credit_account_id,
    amount: Number(r.amount), originalCurrency: r.original_currency,
    originalAmount: Number(r.original_amount), exchangeRate: Number(r.exchange_rate),
    referenceType: r.reference_type, referenceId: r.reference_id, notes: r.notes,
    createdAt: r.created_at?.toISOString?.() || r.created_at,
    updatedAt: r.updated_at?.toISOString?.() || r.updated_at,
  };
}

function rowToCashMovement(r: any) {
  return {
    id: r.id, date: r.date, description: r.description, type: r.type,
    amount: Number(r.amount), balanceBefore: Number(r.balance_before),
    balanceAfter: Number(r.balance_after), referenceType: r.reference_type,
    referenceId: r.reference_id, notes: r.notes,
    createdAt: r.created_at?.toISOString?.() || r.created_at,
  };
}

// ============================================
// DEFAULT ACCOUNTS
// ============================================

async function initDefaultAccounts(sql: any) {
  const defaults = [
    { code: '101', name: 'Caja (Efectivo)', type: 'asset' },
    { code: '102', name: 'Bancos (Transferencia)', type: 'asset' },
    { code: '103', name: 'Yape / Plin', type: 'asset' },
    { code: '104', name: 'PayPal', type: 'asset' },
    { code: '105', name: 'Cripto / Bitcoin', type: 'asset' },
    { code: '121', name: 'Cuentas por Cobrar', type: 'asset' },
    { code: '401', name: 'IR por Pagar (Retención 4ta)', type: 'liability' },
    { code: '501', name: 'Capital', type: 'equity' },
    { code: '701', name: 'Ingresos por Servicios', type: 'income' },
    { code: '801', name: 'Gastos Operativos', type: 'expense' },
    { code: '802', name: 'Comisiones Bancarias', type: 'expense' },
    { code: '803', name: 'Herramientas / Software', type: 'expense' },
    { code: '804', name: 'Reuniones / Alimentación', type: 'expense' },
    { code: '805', name: 'Marketing / Publicidad', type: 'expense' },
    { code: '806', name: 'Transporte', type: 'expense' },
    { code: '899', name: 'Otros Gastos', type: 'expense' },
  ];
  for (const a of defaults) {
    const id = generateId();
    await sql`INSERT INTO accounts (id, code, name, type, balance, is_default)
      VALUES (${id}, ${a.code}, ${a.name}, ${a.type}, 0, true)`;
  }
}

export { handler };
