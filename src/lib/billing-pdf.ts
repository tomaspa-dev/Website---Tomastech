/**
 * Professional PDF generation for Cotizaciones and Recibos por Honorarios
 * Layout: Logo → Business LEFT ║ Doc info RIGHT → separator → Client → Content
 */
import { jsPDF } from 'jspdf';
import type { Quotation, Receipt, Client, EmitterConfig, Currency, PaymentMethod } from './billing-store';
import { addBusinessDays } from './billing-store';

const SYM: Record<Currency, string> = { PEN: 'S/', USD: '$', EUR: '€' };
const PAY: Record<PaymentMethod, string> = {
  transfer: 'Transferencia Bancaria', cash: 'Efectivo', yape_plin: 'Yape / Plin',
  paypal: 'PayPal', card: 'Tarjeta', crypto: 'Criptomoneda', other: 'Otro',
};

// Colors
const C = {
  emerald: [6, 95, 70] as const,
  dark: [33, 33, 33] as const,
  text: [55, 55, 55] as const,
  label: [100, 100, 100] as const,
  light: [160, 160, 160] as const,
  line: [200, 200, 200] as const,
  white: [255, 255, 255] as const,
  zebraRow: [245, 248, 245] as const,
  red: [185, 28, 28] as const,
  orange: [180, 100, 30] as const,
  tableHead: [6, 95, 70] as const,
};

function ts(): string {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}_${String(n.getHours()).padStart(2,'0')}-${String(n.getMinutes()).padStart(2,'0')}`;
}

function download(doc: jsPDF, name: string): void {
  const b = doc.output('blob');
  const r = new FileReader();
  r.onload = () => {
    const a = document.createElement('a');
    a.href = r.result as string;
    a.setAttribute('download', name);
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => document.body.removeChild(a), 300);
  };
  r.readAsDataURL(b);
}

/** Load logo from config or fallback */
async function loadLogo(config: EmitterConfig): Promise<string | null> {
  if (config.logoData) return config.logoData;
  try {
    const res = await fetch('/logo.png');
    if (!res.ok) return null;
    const blob = await res.blob();
    return new Promise(resolve => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.onerror = () => resolve(null);
      r.readAsDataURL(blob);
    });
  } catch { return null; }
}

function thinLine(doc: jsPDF, y: number, x1 = 15, x2 = 195) {
  doc.setDrawColor(...C.line);
  doc.setLineWidth(0.25);
  doc.line(x1, y, x2, y);
}

function fmtDate(d: string): string {
  return new Date(d).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// ───────────────── COTIZACIÓN ─────────────────

export async function generateQuotationPDF(
  quotation: Quotation, client: Client | undefined, config: EmitterConfig
): Promise<void> {
  const doc = new jsPDF();
  const sym = SYM[quotation.currency];
  const logo = await loadLogo(config);
  const L = 15;
  const R = 195;
  let y = 15;

  // ═══ ROW 1: LOGO (own row) ═══
  if (logo) {
    try { doc.addImage(logo, 'PNG', L, y, 35, 14); } catch {}
  }
  y += 20;

  // ═══ ROW 2: BUSINESS DATA (left) ║ DOC INFO (right) — ALIGNED ═══
  const bizStartY = y;

  // LEFT: Business name + emitter data
  const bizName = config.businessName || 'Tomastech';
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.dark);
  doc.text(bizName, L, y);
  y += 5.5;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...C.text);
  if (config.fullName) { doc.text(config.fullName, L, y); y += 4; }

  doc.setFontSize(7.5);
  doc.setTextColor(...C.label);
  if (config.documentNumber) { doc.text(`${config.documentType}: ${config.documentNumber}`, L, y); y += 3.5; }
  if (config.email) { doc.text(config.email, L, y); y += 3.5; }
  if (config.phone) { doc.text(`Tel: ${config.phone}`, L, y); y += 3.5; }
  if (config.address) { doc.text(config.address, L, y); y += 3.5; }
  const bizEndY = y;

  // RIGHT: Document info (starting at same Y as business name)
  let ry = bizStartY;
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.emerald);
  doc.text('COTIZACIÓN', R, ry, { align: 'right' });
  ry += 7;

  doc.setFontSize(11);
  doc.setTextColor(...C.dark);
  doc.text(quotation.number, R, ry, { align: 'right' });
  ry += 6;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...C.label);
  doc.text(`Emisión: ${fmtDate(quotation.issueDate)}`, R, ry, { align: 'right' });
  ry += 4;

  const validityDays = config.quotationValidityDays || 15;
  const dueDate = quotation.dueDate
    ? new Date(quotation.dueDate)
    : addBusinessDays(new Date(quotation.issueDate), validityDays);
  doc.text(`Válida: ${validityDays} días hábiles`, R, ry, { align: 'right' });
  ry += 4;
  doc.text(`Vence: ${dueDate.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })}`, R, ry, { align: 'right' });

  y = Math.max(bizEndY, ry) + 4;

  // ═══ SEPARATOR ═══
  thinLine(doc, y);
  y += 6;

  // ═══ ROW 3: CLIENT DATA ═══
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.emerald);
  doc.text('CLIENTE', L, y);
  y += 4;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.dark);
  doc.text(client?.name || 'N/A', L, y);
  y += 5;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...C.text);
  if (client?.documentNumber) { doc.text(`${client.documentType}: ${client.documentNumber}`, L, y); y += 3.5; }
  if (client?.email) { doc.text(client.email, L, y); y += 3.5; }
  if (client?.phone) { doc.text(`Tel: ${client.phone}`, L, y); y += 3.5; }
  if (client?.address) { doc.text(client.address, L, y); y += 3.5; }
  y += 3;

  thinLine(doc, y);
  y += 6;

  // ═══ ITEMS TABLE ═══
  doc.setFillColor(...C.tableHead);
  doc.rect(L, y - 3.5, R - L, 7.5, 'F');
  doc.setTextColor(...C.white);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('DESCRIPCIÓN', L + 3, y + 1);
  doc.text('CANT.', 120, y + 1, { align: 'center' });
  doc.text('P. UNIT.', 152, y + 1, { align: 'right' });
  doc.text('SUBTOTAL', R - 3, y + 1, { align: 'right' });
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  quotation.items.forEach((item, i) => {
    if (y > 260) { doc.addPage(); y = 20; }
    if (i % 2 === 1) {
      doc.setFillColor(...C.zebraRow);
      doc.rect(L, y - 3, R - L, 7, 'F');
    }
    doc.setTextColor(...C.text);
    const desc = doc.splitTextToSize(item.description, 84);
    doc.text(desc, L + 3, y);
    doc.text(String(item.quantity), 120, y, { align: 'center' });
    doc.text(`${sym} ${item.unitPrice.toFixed(2)}`, 152, y, { align: 'right' });
    doc.setFont('helvetica', 'bold');
    doc.text(`${sym} ${(item.quantity * item.unitPrice).toFixed(2)}`, R - 3, y, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    y += Math.max(desc.length * 3.5, 7);
  });
  y += 3;
  thinLine(doc, y);
  y += 5;

  // ═══ TOTALS ═══
  const tx = 138;
  doc.setFontSize(9);
  doc.setTextColor(...C.text);
  doc.text('Subtotal:', tx, y);
  doc.text(`${sym} ${quotation.subtotal.toFixed(2)}`, R - 3, y, { align: 'right' });
  y += 5;

  if (quotation.discountAmount > 0) {
    doc.setTextColor(...C.orange);
    doc.text('Descuento:', tx, y);
    doc.text(`- ${sym} ${quotation.discountAmount.toFixed(2)}`, R - 3, y, { align: 'right' });
    y += 5;
  }
  if (quotation.retentionAmount > 0) {
    doc.setTextColor(...C.red);
    doc.text(`Retención (${quotation.retentionPercentage}%):`, tx, y);
    doc.text(`- ${sym} ${quotation.retentionAmount.toFixed(2)}`, R - 3, y, { align: 'right' });
    y += 5;
  }

  doc.setDrawColor(...C.dark);
  doc.setLineWidth(0.3);
  doc.line(tx, y, R, y);
  y += 5;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.dark);
  doc.text('TOTAL:', tx, y);
  doc.text(`${sym} ${quotation.total.toFixed(2)}`, R - 3, y, { align: 'right' });
  y += 10;

  // ═══ PAYMENT ═══
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.text);
  doc.text('Método de Pago:', L, y);
  doc.setFont('helvetica', 'normal');
  doc.text(PAY[quotation.paymentMethod], L + 32, y);
  y += 6;

  if (quotation.notes) {
    doc.setFont('helvetica', 'bold');
    doc.text('Notas:', L, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...C.label);
    const nl = doc.splitTextToSize(quotation.notes, 160);
    doc.text(nl, L + 14, y);
    y += nl.length * 3.5 + 3;
  }

  // ═══ BANK ACCOUNTS ═══
  if (config.bankAccounts?.length > 0) {
    y += 2;
    thinLine(doc, y);
    y += 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...C.emerald);
    doc.text('DATOS BANCARIOS', L, y);
    y += 4;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...C.text);
    doc.setFontSize(7.5);
    config.bankAccounts.forEach(b => {
      doc.text(`${b.bankName} — Cta: ${b.accountNumber}${b.cci ? ` | CCI: ${b.cci}` : ''} | ${b.accountHolder}`, L, y);
      y += 3.5;
    });
  }

  // Footer
  doc.setFontSize(6.5);
  doc.setTextColor(...C.line);
  doc.text('Documento generado por Tomastech — Sistema de Facturación', 105, 290, { align: 'center' });

  const safe = quotation.number.replace(/[\/\\:*?"<>|]/g, '_');
  download(doc, `Cotizacion_${safe}_${ts()}.pdf`);
}

// ───────────────── RECIBO POR HONORARIOS ─────────────────

export async function generateReceiptPDF(
  receipt: Receipt, client: Client | undefined, config: EmitterConfig
): Promise<void> {
  const doc = new jsPDF();
  const sym = SYM[receipt.currency];
  const logo = await loadLogo(config);
  const L = 15;
  const R = 195;
  let y = 15;

  // ═══ ROW 1: LOGO ═══
  if (logo) {
    try { doc.addImage(logo, 'PNG', L, y, 35, 14); } catch {}
  }
  y += 20;

  // ═══ ROW 2: BUSINESS DATA (left) ║ DOC INFO (right) — ALIGNED ═══
  const bizStartY = y;

  const bizName = config.businessName || 'Tomastech';
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.dark);
  doc.text(bizName, L, y);
  y += 5.5;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...C.text);
  if (config.fullName) { doc.text(config.fullName, L, y); y += 4; }

  doc.setFontSize(7.5);
  doc.setTextColor(...C.label);
  if (config.documentNumber) { doc.text(`${config.documentType}: ${config.documentNumber}`, L, y); y += 3.5; }
  if (config.email) { doc.text(config.email, L, y); y += 3.5; }
  if (config.phone) { doc.text(`Tel: ${config.phone}`, L, y); y += 3.5; }
  if (config.address) { doc.text(config.address, L, y); y += 3.5; }
  const bizEndY = y;

  // RIGHT: Document info at SAME level as business name
  let ry = bizStartY;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.emerald);
  doc.text('RECIBO POR HONORARIOS', R, ry, { align: 'right' });
  ry += 6;

  doc.setFontSize(11);
  doc.setTextColor(...C.dark);
  doc.text(receipt.number, R, ry, { align: 'right' });
  ry += 5;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...C.label);
  doc.text('Renta de Cuarta Categoría', R, ry, { align: 'right' });
  ry += 4;
  doc.text(`Fecha: ${fmtDate(receipt.issueDate)}`, R, ry, { align: 'right' });

  y = Math.max(bizEndY, ry) + 4;

  // ═══ SEPARATOR ═══
  thinLine(doc, y);
  y += 6;

  // ═══ ROW 3: CLIENT ═══
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.emerald);
  doc.text('USUARIO DEL SERVICIO', L, y);
  y += 4;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.dark);
  doc.text(client?.name || 'N/A', L, y);
  y += 5;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...C.text);
  if (client?.documentNumber) { doc.text(`${client.documentType}: ${client.documentNumber}`, L, y); y += 3.5; }
  if (client?.email) { doc.text(client.email, L, y); y += 3.5; }
  if (client?.phone) { doc.text(`Tel: ${client.phone}`, L, y); y += 3.5; }
  if (client?.address) { doc.text(client.address, L, y); y += 3.5; }
  y += 3;

  thinLine(doc, y);
  y += 6;

  // ═══ SERVICE DESCRIPTION ═══
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.emerald);
  doc.text('DESCRIPCIÓN DEL SERVICIO', L + 3, y);
  y += 3;

  const svcLines = doc.splitTextToSize(receipt.serviceDescription, 164);
  const boxH = Math.max(12, 5 + svcLines.length * 4);
  doc.setFillColor(...C.zebraRow);
  doc.setDrawColor(...C.line);
  doc.roundedRect(L, y - 2, R - L, boxH, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...C.dark);
  doc.text(svcLines, L + 5, y + 3);
  y += boxH + 6;

  // ═══ AMOUNTS ═══
  doc.setFontSize(10);
  doc.setTextColor(...C.text);
  doc.setFont('helvetica', 'normal');
  doc.text('Monto de Honorarios:', L, y);
  doc.setFont('helvetica', 'bold');
  doc.text(`${sym} ${receipt.grossAmount.toFixed(2)}`, R, y, { align: 'right' });
  y += 6;

  if (receipt.retentionAmount > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...C.red);
    doc.text(`Retención IR (${receipt.retentionPercentage}%):`, L, y);
    doc.text(`- ${sym} ${receipt.retentionAmount.toFixed(2)}`, R, y, { align: 'right' });
    y += 6;
  }

  doc.setDrawColor(...C.dark);
  doc.setLineWidth(0.3);
  doc.line(L, y, R, y);
  y += 6;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.dark);
  doc.text('MONTO NETO RECIBIDO:', L, y);
  doc.text(`${sym} ${receipt.netAmount.toFixed(2)}`, R, y, { align: 'right' });
  y += 10;

  // ═══ PAYMENT INFO ═══
  thinLine(doc, y);
  y += 5;

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.text);
  doc.text('Forma de Pago:', L, y);
  doc.setFont('helvetica', 'normal');
  doc.text(PAY[receipt.paymentMethod], L + 30, y);

  if (receipt.paymentReference) {
    doc.setFont('helvetica', 'bold');
    doc.text('Ref:', 110, y);
    doc.setFont('helvetica', 'normal');
    doc.text(receipt.paymentReference, 118, y);
  }
  y += 5;

  doc.setFont('helvetica', 'bold');
  doc.text('Estado SUNAT:', L, y);
  doc.setFont('helvetica', 'normal');
  const st: Record<string, string> = { pending: 'Pendiente', issued: 'Emitido', voided: 'Anulado' };
  doc.text(st[receipt.sunatStatus] || receipt.sunatStatus, L + 30, y);

  // ═══ BANK ACCOUNTS ═══
  if (config.bankAccounts?.length > 0) {
    y += 8;
    thinLine(doc, y);
    y += 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...C.emerald);
    doc.text('DATOS BANCARIOS', L, y);
    y += 4;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...C.text);
    doc.setFontSize(7.5);
    config.bankAccounts.forEach(b => {
      doc.text(`${b.bankName} — Cta: ${b.accountNumber}${b.cci ? ` | CCI: ${b.cci}` : ''} | ${b.accountHolder}`, L, y);
      y += 3.5;
    });
  }

  // Footer
  doc.setFontSize(6.5);
  doc.setTextColor(...C.line);
  doc.text('Documento generado por Tomastech — Sistema de Facturación', 105, 290, { align: 'center' });

  const safe = receipt.number.replace(/[\/\\:*?"<>|]/g, '_');
  download(doc, `ReciboHonorarios_${safe}_${ts()}.pdf`);
}
