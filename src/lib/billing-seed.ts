/**
 * Seed Data — Genera data ficticia para probar el sistema de facturación
 * Ejecutar desde la consola del navegador o integrar como botón en configuración
 */

import type { Currency, PaymentMethod } from './billing-store';

export async function seedTestData(): Promise<string> {
  const {
    clientStore, quotationStore, receiptStore, projectStore, serviceStore,
    generateAccountingFromReceipt, cashRegisterStore, journalStore, accountStore,
  } = await import('./billing-store');

  // Limpiar todos los datos para asegurar un estado limpio
  [
    'tt_billing_clients', 'tt_billing_quotations', 'tt_billing_receipts', 
    'tt_billing_projects', 'tt_billing_accounts', 'tt_billing_journal', 
    'tt_billing_cash_register', 'tt_billing_services'
  ].forEach(k => localStorage.removeItem(k));

  const log: string[] = [];

  // ============================================
  // CLIENTES (5 ficticios peruanos + 1 extranjero)
  // ============================================
  const clientsData = [
    { name: 'Carlos Mendoza Torres', documentType: 'DNI' as const, documentNumber: '45678912', email: 'carlos.mendoza@gmail.com', phone: '51987654321', country: 'PE', address: 'Av. Arequipa 1234, Miraflores, Lima', notes: 'Dueño de restaurante' },
    { name: 'María del Pilar Rojas', documentType: 'DNI' as const, documentNumber: '32165498', email: 'maria.rojas@hotmail.com', phone: '51956781234', country: 'PE', address: 'Jr. Cusco 567, Cercado de Lima', notes: 'Abogada independiente' },
    { name: 'Inversiones TechPeru SAC', documentType: 'RUC' as const, documentNumber: '20601234567', email: 'contacto@techperu.com', phone: '51014567890', country: 'PE', address: 'Av. El Sol 890, San Isidro, Lima', notes: 'Empresa de tecnología, contacto: Javier López' },
    { name: 'Ana Lucía Vargas', documentType: 'DNI' as const, documentNumber: '78945612', email: 'ana.vargas@outlook.com', phone: '51923456789', country: 'PE', address: 'Calle Los Pinos 321, Surco, Lima', notes: 'Influencer de moda, necesita web y branding' },
    { name: 'Distribuidora Norte EIRL', documentType: 'RUC' as const, documentNumber: '20509876543', email: 'ventas@distrinorte.pe', phone: '51044321098', country: 'PE', address: 'Av. Industrial 456, Trujillo', notes: 'Empresa de distribución, retención aplica' },
    { name: 'James Wilson', documentType: 'PASAPORTE' as const, documentNumber: 'US9876543', email: 'james.wilson@company.us', phone: '13055551234', country: 'US', address: '123 Main St, Miami, FL 33101', notes: 'Cliente extranjero, paga en USD' },
  ];

  const clients = clientsData.map(c => clientStore.create(c));
  log.push(`✅ ${clients.length} clientes creados`);

  // ============================================
  // PROYECTOS (4 ficticios)
  // ============================================
  const projectsData = [
    { clientId: clients[0].id, name: 'Web Restaurante El Sabor', description: 'Diseño y desarrollo de sitio web para restaurante con menú digital y reservas online', status: 'active' as const, startDate: '2026-01-15', endDate: '2026-03-15', budget: 3500, currency: 'PEN' as Currency, notes: 'Incluye hosting 1 año' },
    { clientId: clients[1].id, name: 'Landing Page Estudio Jurídico', description: 'Landing page profesional con formulario de contacto y blog de noticias legales', status: 'completed' as const, startDate: '2026-01-01', endDate: '2026-02-01', budget: 2000, currency: 'PEN' as Currency, notes: '' },
    { clientId: clients[2].id, name: 'Sistema Inventario TechPeru', description: 'Aplicación web de gestión de inventario con dashboard y reportes', status: 'active' as const, startDate: '2026-02-01', endDate: '2026-05-30', budget: 8000, currency: 'PEN' as Currency, notes: 'Fase 1 de 2' },
    { clientId: clients[5].id, name: 'E-commerce International', description: 'Tienda online en inglés con pasarela de pago Stripe', status: 'planning' as const, startDate: '2026-03-01', endDate: '2026-06-30', budget: 2500, currency: 'USD' as Currency, notes: 'Pago en USD, tipo de cambio al momento del cobro' },
  ];

  const projects = projectsData.map(p => projectStore.create(p));
  log.push(`✅ ${projects.length} proyectos creados`);

  // ============================================
  // SERVICIOS (Catálogo inicial)
  // ============================================
  const servicesData = [
    { code: 'WEB-01', name: 'Desarrollo Web Responsive', description: 'Sitio web profesional adaptable a móviles', costPrice: 800, salePrice: 1500, currency: 'PEN' as const, status: 'active' as const },
    { code: 'WEB-02', name: 'E-commerce Completo', description: 'Tienda online con pasarela de pagos', costPrice: 2000, salePrice: 4500, currency: 'PEN' as const, status: 'active' as const },
    { code: 'DSN-01', name: 'Diseño de Logotipo', description: 'Creación de marca e identidad visual', costPrice: 200, salePrice: 600, currency: 'PEN' as const, status: 'active' as const },
    { code: 'MKT-01', name: 'Campaña Ads (Mensual)', description: 'Gestión de publicidad en Google/Meta', costPrice: 300, salePrice: 800, currency: 'PEN' as const, status: 'active' as const },
    { code: 'SEO-01', name: 'Optimización SEO On-Page', description: 'Mejora de posicionamiento en buscadores', costPrice: 400, salePrice: 1200, currency: 'PEN' as const, status: 'active' as const },
  ];
  servicesData.forEach(s => serviceStore.create(s));
  log.push(`✅ ${servicesData.length} servicios agregados al catálogo`);

  // ============================================
  // COTIZACIONES (6 ficticias - distintos estados)
  // ============================================
  const quotationsData = [
    {
      clientId: clients[0].id, projectId: projects[0].id,
      items: [
        { description: 'Diseño UI/UX web restaurante', quantity: 1, unitPrice: 1200 },
        { description: 'Desarrollo frontend (React)', quantity: 1, unitPrice: 1500 },
        { description: 'Menú digital interactivo', quantity: 1, unitPrice: 500 },
        { description: 'Configuración hosting + dominio', quantity: 1, unitPrice: 300 },
      ],
      currency: 'PEN' as Currency, paymentMethod: 'transfer' as PaymentMethod,
      issueDate: '2026-01-10', dueDate: '2026-01-25',
      discountValue: 0, retentionPercentage: 0, status: 'paid' as const, notes: 'Incluye 2 rondas de revisiones',
    },
    {
      clientId: clients[1].id, projectId: projects[1].id,
      items: [
        { description: 'Landing page diseño + desarrollo', quantity: 1, unitPrice: 1500 },
        { description: 'Blog integrado', quantity: 1, unitPrice: 500 },
      ],
      currency: 'PEN' as Currency, paymentMethod: 'yape_plin' as PaymentMethod,
      issueDate: '2025-12-20', dueDate: '2026-01-05',
      discountValue: 0, retentionPercentage: 0, status: 'paid' as const, notes: '',
    },
    {
      clientId: clients[2].id, projectId: projects[2].id,
      items: [
        { description: 'Análisis y diseño del sistema', quantity: 1, unitPrice: 2000 },
        { description: 'Desarrollo backend (API REST)', quantity: 1, unitPrice: 3000 },
        { description: 'Frontend dashboard', quantity: 1, unitPrice: 2000 },
        { description: 'Testing y deploy', quantity: 1, unitPrice: 1000 },
      ],
      currency: 'PEN' as Currency, paymentMethod: 'transfer' as PaymentMethod,
      issueDate: '2026-02-01', dueDate: '2026-02-15',
      discountValue: 0, retentionPercentage: 8, status: 'accepted' as const, notes: 'Retención IR 4ta aplica (RUC empresa)',
    },
    {
      clientId: clients[3].id, projectId: '',
      items: [
        { description: 'Diseño de marca personal', quantity: 1, unitPrice: 800 },
        { description: 'Kit redes sociales (templates)', quantity: 1, unitPrice: 600 },
        { description: 'Landing bio-link', quantity: 1, unitPrice: 400 },
      ],
      currency: 'PEN' as Currency, paymentMethod: 'yape_plin' as PaymentMethod,
      issueDate: '2026-02-20', dueDate: '2026-03-05',
      discountValue: 10, retentionPercentage: 0, status: 'sent' as const, notes: 'Descuento 10% por referencia',
    },
    {
      clientId: clients[4].id, projectId: '',
      items: [
        { description: 'Rediseño web corporativo', quantity: 1, unitPrice: 3500 },
        { description: 'SEO on-page', quantity: 1, unitPrice: 1000 },
      ],
      currency: 'PEN' as Currency, paymentMethod: 'transfer' as PaymentMethod,
      issueDate: '2026-02-28', dueDate: '2026-03-15',
      discountValue: 0, retentionPercentage: 8, status: 'draft' as const, notes: 'Empresa EIRL, retención aplica',
    },
    {
      clientId: clients[5].id, projectId: projects[3].id,
      items: [
        { description: 'E-commerce design & development', quantity: 1, unitPrice: 1800 },
        { description: 'Stripe payment integration', quantity: 1, unitPrice: 400 },
        { description: 'Hosting setup (1 year)', quantity: 1, unitPrice: 300 },
      ],
      currency: 'USD' as Currency, paymentMethod: 'paypal' as PaymentMethod,
      issueDate: '2026-03-01', dueDate: '2026-03-20',
      discountValue: 0, retentionPercentage: 0, status: 'sent' as const, notes: 'Payment in USD via PayPal',
    },
  ];

  const quotations = quotationsData.map(q => {
    const items = q.items.map((item, i) => ({
      id: `item-${i}`,
      ...item,
      subtotal: item.quantity * item.unitPrice,
    }));
    const subtotal = items.reduce((s, item) => s + item.subtotal, 0);
    const discountAmount = subtotal * (q.discountValue / 100);
    const afterDiscount = subtotal - discountAmount;
    const retentionAmount = afterDiscount * (q.retentionPercentage / 100);
    const total = afterDiscount - retentionAmount;

    return quotationStore.create({
      clientId: q.clientId,
      projectId: q.projectId,
      items,
      subtotal,
      discountType: 'percentage' as const,
      discountValue: q.discountValue,
      discountAmount,
      retentionPercentage: q.retentionPercentage,
      retentionAmount,
      total,
      currency: q.currency,
      paymentMethod: q.paymentMethod,
      issueDate: q.issueDate,
      dueDate: q.dueDate,
      status: q.status,
      notes: q.notes,
    });
  });
  log.push(`✅ ${quotations.length} cotizaciones creadas`);

  // ============================================
  // RECIBOS (3 ficticios — de cotizaciones pagadas + 1 extra)
  // ============================================

  // Agregar capital inicial
  const accounts = accountStore.getAll();
  const cajaAcct = accounts.find(a => a.code === '101');
  const capitalAcct = accounts.find(a => a.code === '501');
  if (cajaAcct && capitalAcct) {
    journalStore.create({
      date: '2026-01-01', description: 'Aporte de Capital Inicial',
      debitAccountId: cajaAcct.id, creditAccountId: capitalAcct.id,
      amount: 500, originalCurrency: 'PEN', originalAmount: 500, exchangeRate: 1,
      referenceType: 'capital', referenceId: '', notes: 'Inversión inicial del negocio',
    });
    cashRegisterStore.addMovement({
      date: '2026-01-01', description: 'Aporte de Capital Inicial',
      type: 'income', amount: 500, referenceType: 'capital', referenceId: '', notes: '',
    });
  }
  log.push('✅ Capital inicial S/ 500.00 agregado');

  // Recibo 1: Restaurante (cotización pagada, transferencia)
  const receipt1 = receiptStore.create({
    quotationId: quotations[0].id,
    clientId: clients[0].id,
    projectId: projects[0].id,
    serviceDescription: 'Diseño y desarrollo web restaurante El Sabor - Sitio completo con menú digital',
    grossAmount: 3500,
    retentionPercentage: 0,
    retentionAmount: 0,
    netAmount: 3500,
    currency: 'PEN',
    paymentMethod: 'transfer',
    paymentReference: 'OP-20260125-001',
    issueDate: '2026-01-25',
    sunatStatus: 'issued',
  });
  generateAccountingFromReceipt(receipt1, clients[0], 1);

  // Recibo 2: Abogada (cotización pagada, Yape)
  const receipt2 = receiptStore.create({
    quotationId: quotations[1].id,
    clientId: clients[1].id,
    projectId: projects[1].id,
    serviceDescription: 'Landing page profesional Estudio Jurídico Rojas',
    grossAmount: 2000,
    retentionPercentage: 0,
    retentionAmount: 0,
    netAmount: 2000,
    currency: 'PEN',
    paymentMethod: 'yape_plin',
    paymentReference: 'YAPE-1234',
    issueDate: '2026-02-01',
    sunatStatus: 'issued',
  });
  generateAccountingFromReceipt(receipt2, clients[1], 1);

  // Recibo 3: TechPeru adelanto (empresa con retención)
  const receipt3 = receiptStore.create({
    quotationId: quotations[2].id,
    clientId: clients[2].id,
    projectId: projects[2].id,
    serviceDescription: 'Adelanto 50% - Sistema de Inventario TechPeru (Análisis + Diseño)',
    grossAmount: 4000,
    retentionPercentage: 8,
    retentionAmount: 320,
    netAmount: 3680,
    currency: 'PEN',
    paymentMethod: 'transfer',
    paymentReference: 'TRF-BCP-2026020501',
    issueDate: '2026-02-15',
    sunatStatus: 'issued',
  });
  generateAccountingFromReceipt(receipt3, clients[2], 1);

  log.push(`✅ 3 recibos creados con contabilidad automática`);

  // ============================================
  // GASTOS FICTICIOS
  // ============================================
  const gastosAccounts = accountStore.getAll();
  const getGastoAcct = (code: string) => gastosAccounts.find(a => a.code === code);
  const cajaId = getGastoAcct('101')?.id || '';
  const bancosId = getGastoAcct('102')?.id || '';

  const gastos = [
    { date: '2026-01-15', desc: 'Hosting anual Netlify Pro', accountCode: '803', amount: 190, payFrom: cajaId },
    { date: '2026-01-20', desc: 'Dominio .com renovación', accountCode: '803', amount: 55, payFrom: cajaId },
    { date: '2026-02-01', desc: 'Almuerzo reunión cliente Carlos', accountCode: '804', amount: 65, payFrom: cajaId },
    { date: '2026-02-10', desc: 'Comisión transferencia BCP', accountCode: '802', amount: 8.50, payFrom: bancosId },
    { date: '2026-02-15', desc: 'Uber a reunión San Isidro', accountCode: '806', amount: 18, payFrom: cajaId },
    { date: '2026-02-20', desc: 'Licencia Figma mensual', accountCode: '803', amount: 45, payFrom: cajaId },
  ];

  for (const g of gastos) {
    const expAcct = getGastoAcct(g.accountCode);
    if (expAcct) {
      journalStore.create({
        date: g.date, description: g.desc,
        debitAccountId: expAcct.id, creditAccountId: g.payFrom,
        amount: Math.round(g.amount * 100) / 100,
        originalCurrency: 'PEN', originalAmount: g.amount, exchangeRate: 1,
        referenceType: 'manual', referenceId: '', notes: '',
      });
      cashRegisterStore.addMovement({
        date: g.date, description: g.desc,
        type: 'expense', amount: Math.round(g.amount * 100) / 100,
        referenceType: 'manual', referenceId: '', notes: '',
      });
    }
  }
  log.push(`✅ ${gastos.length} gastos registrados`);

  const finalBalance = cashRegisterStore.getCurrentBalance();
  log.push(`\n💰 Saldo final en caja: S/ ${finalBalance.toFixed(2)}`);
  log.push(`\n📊 Resumen:`);
  log.push(`   Clientes: ${clients.length}`);
  log.push(`   Proyectos: ${projects.length}`);
  log.push(`   Cotizaciones: ${quotations.length}`);
  log.push(`   Recibos: 3`);
  log.push(`   Asientos contables: ${journalStore.getAll().length}`);
  log.push(`   Movimientos de caja: ${cashRegisterStore.getAll().length}`);

  return log.join('\n');
}
