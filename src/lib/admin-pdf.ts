/**
 * admin-pdf.ts — Panel Admin v2 PDF Generator
 * Uses jsPDF to generate professional PDFs for quotations, receipts and contracts.
 * Peru-centric: S/, PEN/USD, Retención IR 4ta Categoría.
 */

import { jsPDF } from 'jspdf';
import type { Quotation, Receipt, Contract, Client, EmitterConfig } from './admin-store';

// ── Palette ───────────────────────────────────────────────────
type RGB = [number, number, number];
const C = {
  dark:     [15, 23, 42]    as RGB,  // slate-900
  text:     [51, 65, 85]    as RGB,  // slate-700
  label:    [100, 116, 139] as RGB,  // slate-500
  line:     [203, 213, 225] as RGB,  // slate-300
  emerald:  [16, 185, 129]  as RGB,  // emerald-500
  red:      [239, 68, 68]   as RGB,  // red-500
  zebraRow: [248, 250, 252] as RGB,  // slate-50
  headerBg: [15, 23, 42]    as RGB,  // table header
};

const SYM: Record<string, string> = { PEN: 'S/', USD: 'US$', EUR: '€' };

const PAY_LABELS: Record<string, string> = {
  transfer:  'Transferencia Bancaria',
  cash:      'Efectivo',
  yape_plin: 'Yape / Plin',
  paypal:    'PayPal',
  card:      'Tarjeta',
  crypto:    'Criptomoneda',
  other:     'Otro',
};

// ── Timestamp for filenames ───────────────────────────────────
function ts(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}_${String(d.getHours()).padStart(2,'0')}-${String(d.getMinutes()).padStart(2,'0')}`;
}

// ── Download helper ───────────────────────────────────────────
function download(doc: jsPDF, fileName: string): void {
  // Ensure always .pdf extension
  const safe = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
  doc.save(safe);
}

// ── Format date ───────────────────────────────────────────────
function fmtDate(iso: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-PE', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
}

// ── Thin horizontal rule ──────────────────────────────────────
function thinLine(doc: jsPDF, y: number): void {
  doc.setDrawColor(...C.line);
  doc.setLineWidth(0.3);
  doc.line(15, y, 195, y);
}

// ── Logo loader ───────────────────────────────────────────────
async function loadLogo(config: EmitterConfig): Promise<string | null> {
  if (config.logoData) return config.logoData;
  return null;
}

// ── Shared header: logo + biz info + doc info ─────────────────
async function drawHeader(
  doc: jsPDF,
  config: EmitterConfig,
  docTitle: string,
  docNumber: string,
  docDate: string,
  docSubtitle?: string,
): Promise<number> {
  const L = 15, R = 195;
  let y = 15;

  const logo = await loadLogo(config);
  if (logo) {
    try { doc.addImage(logo, 'PNG', L, y, 30, 12); } catch {}
  }

  // Business info (left)
  const bizStartY = logo ? y + 16 : y;
  let by = bizStartY;

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.dark);
  doc.text(config.businessName || 'Tomastech', L, by);
  by += 5;

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...C.text);
  if (config.fullName) { doc.text(config.fullName, L, by); by += 4; }

  doc.setFontSize(7.5);
  doc.setTextColor(...C.label);
  if (config.documentNumber) { doc.text(`${config.documentType}: ${config.documentNumber}`, L, by); by += 3.5; }
  if (config.email)          { doc.text(config.email, L, by); by += 3.5; }
  if (config.phone)          { doc.text(`Tel: ${config.phone}`, L, by); by += 3.5; }
  if (config.address)        { doc.text(config.address, L, by); by += 3.5; }

  // Doc info (right)
  let ry = logo ? y : y;
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.emerald);
  doc.text(docTitle, R, ry, { align: 'right' });
  ry += 7;

  doc.setFontSize(12);
  doc.setTextColor(...C.dark);
  doc.text(docNumber, R, ry, { align: 'right' });
  ry += 5;

  if (docSubtitle) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...C.label);
    doc.text(docSubtitle, R, ry, { align: 'right' });
    ry += 4.5;
  }

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...C.label);
  doc.text(`Fecha: ${fmtDate(docDate)}`, R, ry, { align: 'right' });

  const endY = Math.max(by, ry) + 4;
  thinLine(doc, endY);
  return endY + 6;
}

// ── Client block ──────────────────────────────────────────────
function drawClientBlock(doc: jsPDF, client: Client | undefined, y: number): number {
  const L = 15;

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.emerald);
  doc.text('CLIENTE / USUARIO DEL SERVICIO', L, y);
  y += 4;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.dark);
  doc.text(client?.name || '—', L, y);
  y += 5;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...C.text);
  if (client?.documentType && client?.documentNumber) {
    doc.text(`${client.documentType}: ${client.documentNumber}`, L, y); y += 3.5;
  }
  if (client?.email)   { doc.text(client.email, L, y); y += 3.5; }
  if (client?.phone)   { doc.text(`Tel: ${client.phone}`, L, y); y += 3.5; }
  if (client?.address) { doc.text(client.address, L, y); y += 3.5; }

  y += 3;
  thinLine(doc, y);
  return y + 6;
}

// ── Footer ────────────────────────────────────────────────────
function drawFooter(doc: jsPDF, config: EmitterConfig): void {
  const R = 195;
  doc.setFontSize(6.5);
  doc.setTextColor(...C.label);
  doc.text(
    `Documento generado por ${config.businessName || 'Tomastech'} | ${config.website || 'tomastech.dev'}`,
    105, 290, { align: 'center' }
  );
}

// ── Bank accounts ─────────────────────────────────────────────
function drawBankAccounts(doc: jsPDF, config: EmitterConfig, y: number): number {
  if (!config.bankAccounts?.length) return y;
  y += 2;
  thinLine(doc, y);
  y += 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...C.emerald);
  doc.text('DATOS BANCARIOS PARA TRANSFERENCIA', 15, y);
  y += 4;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...C.text);
  doc.setFontSize(7.5);
  config.bankAccounts.forEach((b) => {
    const line = `${b.bankName} — Cta: ${b.accountNumber}${b.cci ? ` | CCI: ${b.cci}` : ''} | ${b.accountHolder} (${b.currency})`;
    doc.text(line, 15, y);
    y += 3.5;
  });
  return y;
}

// ════════════════════════════════════════════════════════════════
// QUOTATION PDF
// ════════════════════════════════════════════════════════════════

export async function generateQuotationPDF(
  quotation: Quotation,
  client: Client | undefined,
  config: EmitterConfig,
): Promise<void> {
  const doc = new jsPDF();
  const sym = SYM[quotation.currency] ?? 'S/';
  const L = 15, R = 195;

  let y = await drawHeader(
    doc, config,
    'COTIZACIÓN DE SERVICIOS',
    quotation.number,
    quotation.issueDate,
    `Válida hasta: ${fmtDate(quotation.expiresAt)}`
  );

  y = drawClientBlock(doc, client, y);

  // ── Items table ────────────────────────────────────────────
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.emerald);
  doc.text('DETALLE DE SERVICIOS', L + 2, y);
  y += 3;

  // Table header row
  const colW = { desc: 90, qty: 18, price: 28, sub: 30 };
  const startX = L;
  doc.setFillColor(...C.headerBg);
  doc.rect(startX, y - 2, R - L, 8, 'F');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('DESCRIPCIÓN', startX + 2, y + 3.5);
  doc.text('CANT.', startX + colW.desc + 2, y + 3.5);
  doc.text('P. UNIT.', startX + colW.desc + colW.qty + 2, y + 3.5);
  doc.text('SUBTOTAL', startX + colW.desc + colW.qty + colW.price + 2, y + 3.5);
  y += 8;

  // Items
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...C.dark);
  let zebra = false;
  for (const item of quotation.items) {
    const rowH = 8 + Math.max(0, doc.splitTextToSize(item.description, colW.desc - 4).length - 1) * 3.5;
    if (zebra) {
      doc.setFillColor(...C.zebraRow);
      doc.rect(startX, y - 1, R - L, rowH, 'F');
    }
    zebra = !zebra;

    doc.setFontSize(8);
    doc.setTextColor(...C.dark);
    const descLines = doc.splitTextToSize(item.description, colW.desc - 4);
    doc.text(descLines, startX + 2, y + 4);

    doc.setTextColor(...C.text);
    doc.text(String(item.quantity), startX + colW.desc + 2, y + 4);
    doc.text(`${sym} ${item.unitPrice.toFixed(2)}`, startX + colW.desc + colW.qty + 2, y + 4);
    doc.setTextColor(...C.dark);
    doc.setFont('helvetica', 'bold');
    doc.text(`${sym} ${item.subtotal.toFixed(2)}`, startX + colW.desc + colW.qty + colW.price + 2, y + 4);
    doc.setFont('helvetica', 'normal');

    y += rowH;
  }

  thinLine(doc, y);
  y += 6;

  // ── Totals ─────────────────────────────────────────────────
  const totX = 120;
  const totW = 75;

  function totRow(label: string, value: string, bold = false, color: RGB = C.text) {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(bold ? 9.5 : 8.5);
    doc.setTextColor(...C.text);
    doc.text(label, totX, y);
    doc.setTextColor(...color);
    doc.text(value, R, y, { align: 'right' });
    y += bold ? 7 : 5.5;
  }

  totRow('Subtotal:', `${sym} ${quotation.subtotal.toFixed(2)}`);

  if (quotation.discountAmount > 0) {
    totRow(`Descuento (${quotation.discountType === 'percentage' ? quotation.discountValue + '%' : 'fijo'}):`,
      `- ${sym} ${quotation.discountAmount.toFixed(2)}`, false, C.red);
  }

  doc.setDrawColor(...C.line);
  doc.setLineWidth(0.3);
  doc.line(totX, y, R, y);
  y += 4;

  totRow('Total al Cliente:', `${sym} ${quotation.total.toFixed(2)}`, true, C.dark);

  if (quotation.applyRetention && quotation.retentionAmount > 0) {
    y += 2;
    doc.setFillColor(254, 243, 199); // amber-100
    doc.setDrawColor(217, 119, 6);   // amber-600
    doc.roundedRect(totX - 2, y - 2, R - totX + 3, 18, 1, 1, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(146, 64, 14);   // amber-900
    doc.text('RETENCIÓN IR 4TA CATEGORÍA', totX + 1, y + 3);
    doc.setFont('helvetica', 'normal');
    doc.text(`(${quotation.retentionPercentage}% sobre S./ ${quotation.total.toFixed(2)} — pagada por ${client?.name ?? 'el cliente'} a SUNAT)`, totX + 1, y + 7);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(`Monto retenido: - ${sym} ${quotation.retentionAmount.toFixed(2)}`, totX + 1, y + 12);
    y += 22;

    doc.setDrawColor(...C.line);
    doc.setLineWidth(0.4);
    doc.line(totX, y, R, y);
    y += 4;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...C.dark);
    doc.text('NETO A RECIBIR:', totX, y);
    doc.setTextColor(...C.emerald);
    doc.text(`${sym} ${quotation.netToReceive.toFixed(2)}`, R, y, { align: 'right' });
    y += 8;
  }

  // ── Payment & delivery details ─────────────────────────────
  y += 4;
  thinLine(doc, y);
  y += 5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...C.emerald);
  doc.text('CONDICIONES', L, y);
  y += 4;

  const details = [
    ['Forma de pago', PAY_LABELS[quotation.paymentMethod] ?? quotation.paymentMethod],
    ['Términos de pago', quotation.paymentTerms || '—'],
    ['Tiempo de entrega', quotation.deliveryDays ? `${quotation.deliveryDays} días hábiles` : '—'],
    ['Validez de la cotización', `${quotation.validityDays} días hábiles desde la fecha de emisión`],
  ];

  doc.setFontSize(8);
  doc.setTextColor(...C.text);
  details.forEach(([label, value]) => {
    if (!value || value === '—') return;
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}:`, L, y);
    doc.setFont('helvetica', 'normal');
    const vLines = doc.splitTextToSize(value, 130);
    doc.text(vLines, L + 45, y);
    y += vLines.length * 4 + 1;
  });

  // Notes
  if (quotation.notes) {
    y += 2;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...C.emerald);
    doc.text('NOTAS', L, y);
    y += 3;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...C.text);
    const noteLines = doc.splitTextToSize(quotation.notes, R - L);
    doc.text(noteLines, L, y);
    y += noteLines.length * 4 + 2;
  }

  y = drawBankAccounts(doc, config, y);
  drawFooter(doc, config);

  const safe = quotation.number.replace(/[\/\\:*?"<>|]/g, '_');
  const clientSafe = (client?.name ?? 'Cliente').replace(/[\/\\:*?"<>|\s]+/g, '_').slice(0, 20);
  download(doc, `Cotizacion_${safe}_${clientSafe}_${ts()}.pdf`);
}

// ════════════════════════════════════════════════════════════════
// RECEIPT PDF (Recibo por Honorarios)
// ════════════════════════════════════════════════════════════════

export async function generateReceiptPDF(
  receipt: Receipt,
  client: Client | undefined,
  config: EmitterConfig,
): Promise<void> {
  const doc = new jsPDF();
  const sym = SYM[receipt.currency] ?? 'S/';
  const L = 15, R = 195;

  let y = await drawHeader(
    doc, config,
    'RECIBO POR HONORARIOS',
    receipt.number,
    receipt.issueDate,
    'Renta de Cuarta Categoría'
  );

  y = drawClientBlock(doc, client, y);

  // ── Service description ────────────────────────────────────
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.emerald);
  doc.text('POR LOS SERVICIOS DE', L + 3, y);
  y += 3;

  const svcLines = doc.splitTextToSize(receipt.serviceDescription, R - L - 10);
  const boxH = Math.max(14, 6 + svcLines.length * 4.5);
  doc.setFillColor(...C.zebraRow);
  doc.setDrawColor(...C.line);
  doc.roundedRect(L, y - 2, R - L, boxH, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(...C.dark);
  doc.text(svcLines, L + 5, y + 5);
  y += boxH + 8;

  // ── Amounts ────────────────────────────────────────────────
  function amtRow(label: string, value: string, color: RGB = C.dark, big = false) {
    doc.setFont('helvetica', big ? 'bold' : 'normal');
    doc.setFontSize(big ? 12 : 10);
    doc.setTextColor(...C.text);
    doc.text(label, L, y);
    doc.setTextColor(...color);
    doc.text(value, R, y, { align: 'right' });
    y += big ? 8 : 6;
  }

  amtRow('Monto de Honorarios:', `${sym} ${receipt.grossAmount.toFixed(2)}`);

  if (receipt.retentionAmount > 0) {
    amtRow(`Retención IR (${receipt.retentionPercentage}%):`, `- ${sym} ${receipt.retentionAmount.toFixed(2)}`, C.red);
  }

  doc.setDrawColor(...C.dark);
  doc.setLineWidth(0.4);
  doc.line(L, y, R, y);
  y += 6;

  amtRow('MONTO NETO RECIBIDO:', `${sym} ${receipt.netAmount.toFixed(2)}`, C.emerald, true);

  y += 4;
  thinLine(doc, y);
  y += 5;

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.text);
  doc.text('Forma de Pago:', L, y);
  doc.setFont('helvetica', 'normal');
  doc.text(PAY_LABELS[receipt.paymentMethod] ?? receipt.paymentMethod, L + 32, y);
  if (receipt.paymentReference) {
    doc.setFont('helvetica', 'bold');
    doc.text('Referencia:', 110, y);
    doc.setFont('helvetica', 'normal');
    doc.text(receipt.paymentReference, 130, y);
  }
  y += 5;

  const statuses: Record<string, string> = { pending: 'Pendiente', issued: 'Emitido', voided: 'Anulado' };
  doc.setFont('helvetica', 'bold');
  doc.text('Estado SUNAT:', L, y);
  doc.setFont('helvetica', 'normal');
  doc.text(statuses[receipt.sunatStatus] ?? receipt.sunatStatus, L + 32, y);

  if (receipt.notes) {
    y += 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...C.emerald);
    doc.text('NOTAS', L, y);
    y += 3;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...C.text);
    const nLines = doc.splitTextToSize(receipt.notes, R - L);
    doc.text(nLines, L, y);
  }

  y = drawBankAccounts(doc, config, y + 8);
  drawFooter(doc, config);

  const safe = receipt.number.replace(/[\/\\:*?"<>|]/g, '_');
  download(doc, `ReciboHonorarios_${safe}_${ts()}.pdf`);
}

// ════════════════════════════════════════════════════════════════
// EXCEL EXPORT (simple CSV approach, renamed to .xlsx)
// ════════════════════════════════════════════════════════════════

export function exportToCSV(rows: Record<string, string | number>[], fileName: string): void {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(','),
    ...rows.map((r) => headers.map((h) => `"${String(r[h] ?? '').replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' }); // BOM for Excel
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  const safeName = fileName.endsWith('.csv') ? fileName : `${fileName}.csv`;
  a.href = url;
  a.download = safeName;
  a.click();
  URL.revokeObjectURL(url);
}
