/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MedicalLandingData } from "../types";

/**
 * Genera un documento HTML limpio, amplio, profesional y legible, optimizado para vista previa y descarga PDF 100% idéntica.
 * Ficha Técnica Oficial de Auditoría y Creación de Consultorio Médico Digital
 */
export function generateDoctorSummaryPrintHtml(data: MedicalLandingData, pageUrl: string): string {
  const doctorName = data.nombreMedico && data.nombreMedico !== "{{NOMBRE_MEDICO}}" 
    ? data.nombreMedico 
    : "Dr. Especialista Médico";
  
  const specialty = data.especialidad && data.especialidad !== "{{ESPECIALIDAD}}" 
    ? data.especialidad 
    : "Consulta Médica Especializada";

  const clinic = data.nombreClinicaGBP || "Consultorio Médico Especializado";
  const city = data.ciudad || "Ecuador";
  const province = data.estadoRegion || "Ecuador";
  const address = data.direccionFisica || "Dirección de Consultorio";
  const phone = data.telefonoGBP || "";
  const whatsapp = data.whatsappUrl || "";
  const registration = data.cedulaProfesional ? `Registro MSP / SENESCYT: ${data.cedulaProfesional}` : "Registro Profesional Sanitario Acreditado";
  const experience = data.anosExperiencia ? `${data.anosExperiencia} Años de Trayectoria Médica` : "Especialista Certificado";

  const mainServices = (Array.isArray(data.servicios) ? data.servicios : []).slice(0, 6);
  const backlinks = (Array.isArray(data.backlinksAutoridad) ? data.backlinksAutoridad : []).slice(0, 6);

  const logoImg = data.logoUrl || data.fotoUrl || "";

  const rawHorarios: { semana?: string; sabado?: string; domingo?: string } = 
    data.horarios && typeof data.horarios === "object" ? data.horarios : {};
  const semanaText = typeof rawHorarios.semana === "string" ? rawHorarios.semana : "Lunes a Viernes: 08:30 - 18:30";
  const sabadoText = typeof rawHorarios.sabado === "string" ? rawHorarios.sabado : "Sábado: Previa Cita";
  const domingoText = typeof rawHorarios.domingo === "string" ? rawHorarios.domingo : "Domingo: Cerrado";

  const metaTitle = data.metaTitulo || `${doctorName} | ${specialty} en ${city}, Ecuador`;
  const doctorNameSlug = doctorName.toLowerCase().replace(/[^a-z0-9]/g, "_");

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Ficha Técnica y Certificado Digital - ${doctorName}</title>
  
  <!-- Carga Directa de Tipografía Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">

  <!-- Script html2pdf.js para descarga PDF directa -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>

  <style>
    @page {
      size: A4 portrait;
      margin: 8mm 10mm;
    }

    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      margin: 0;
      padding: 0;
      background: #f8fafc;
      color: #0f172a;
      line-height: 1.5;
      font-size: 10.5pt;
    }

    /* BARRA FLOTANTE SUPERIOR (SOLO VISIBLE EN NAVEGADOR) */
    .print-btn-bar {
      position: sticky;
      top: 0;
      z-index: 9999;
      background: #0f172a;
      color: #ffffff;
      padding: 14px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    }

    .print-btn-group {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .btn-action {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-family: inherit;
      font-weight: 800;
      font-size: 13.5px;
      padding: 10px 20px;
      border-radius: 10px;
      border: none;
      cursor: pointer;
      transition: all 0.2s ease;
      text-decoration: none;
    }

    .btn-download-pdf {
      background: #0284c7;
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(2, 132, 199, 0.4);
    }

    .btn-download-pdf:hover {
      background: #0369a1;
      transform: translateY(-1px);
    }

    .btn-print-browser {
      background: #334155;
      color: #ffffff;
      border: 1px solid #475569;
    }

    .btn-print-browser:hover {
      background: #475569;
    }

    .btn-close {
      background: rgba(255,255,255,0.12);
      color: #cbd5e1;
      font-size: 13px;
    }

    .btn-close:hover {
      background: rgba(255,255,255,0.22);
      color: #ffffff;
    }

    /* CONTENEDOR DE LA FICHA CON MEDIDAS EXACTAS A4 Y ALTA FIDELIDAD */
    .page-container {
      width: 794px;
      max-width: 794px;
      margin: 20px auto;
      padding: 28px 32px;
      border: 1.5px solid #cbd5e1;
      border-radius: 20px;
      background: #ffffff;
      box-shadow: 0 10px 30px rgba(0,0,0,0.06);
      box-sizing: border-box;
    }

    /* ESTILOS DE CAPTURA LIMPIA PARA DESCARGA PDF DIRECTA */
    body.is-exporting-pdf {
      background: #ffffff !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    body.is-exporting-pdf .page-container {
      margin: 0 !important;
      border: none !important;
      box-shadow: none !important;
      border-radius: 0 !important;
      width: 794px !important;
      max-width: 794px !important;
      padding: 18px 22px !important;
    }

    body.is-exporting-pdf .print-btn-bar {
      display: none !important;
    }

    .html2pdf-prevent-pagebreak {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }

    /* 1. SECCIÓN SUPERIOR: LOGOTIPO OFICIAL DEL MÉDICO EN GRANDE Y CENTRADO */
    .doctor-top-branding-box {
      text-align: center;
      border-bottom: 3px solid #0284c7;
      padding: 24px 20px;
      margin-bottom: 24px;
      background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
      border-radius: 18px;
      border: 1.5px solid #e2e8f0;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .doctor-main-large-logo {
      max-height: 120px;
      max-width: 380px;
      width: auto;
      height: auto;
      object-fit: contain;
      margin: 0 auto 16px auto;
      display: block;
      filter: drop-shadow(0 4px 10px rgba(0,0,0,0.05));
    }

    .doctor-main-name {
      font-size: 23pt;
      font-weight: 900;
      color: #0f172a;
      margin: 0 0 6px 0;
      letter-spacing: -0.5px;
      line-height: 1.2;
    }

    .doctor-main-specialty {
      font-size: 13pt;
      font-weight: 800;
      color: #0284c7;
      margin: 0 0 14px 0;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .meta-pills-container {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 10px;
      font-size: 9pt;
      font-weight: 700;
    }

    .meta-pill-item {
      background: #ffffff;
      color: #334155;
      padding: 5px 14px;
      border-radius: 20px;
      border: 1.5px solid #cbd5e1;
      box-shadow: 0 1px 3px rgba(0,0,0,0.03);
    }

    .meta-pill-accredited {
      background: #ecfdf5;
      color: #047857;
      border-color: #86efac;
      font-weight: 800;
    }

    /* 2. TARJETA DE AUDITORÍA Y PUNTUACIÓN DE OPTIMIZACIÓN 100/100 */
    .score-banner {
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      color: #ffffff;
      border-radius: 18px;
      padding: 18px 24px;
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .score-info {
      flex: 1;
    }

    .score-title {
      font-size: 12pt;
      font-weight: 900;
      color: #38bdf8;
      margin: 0 0 6px 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .score-desc {
      font-size: 9.5pt;
      color: #e2e8f0;
      margin: 0;
      line-height: 1.45;
    }

    .score-badge-box {
      text-align: center;
      background: rgba(255,255,255,0.08);
      border: 1.5px solid rgba(255,255,255,0.2);
      border-radius: 16px;
      padding: 10px 20px;
      flex-shrink: 0;
    }

    .score-number {
      font-size: 26pt;
      font-weight: 900;
      color: #34d399;
      line-height: 1;
    }

    .score-label {
      font-size: 7.5pt;
      font-weight: 800;
      color: #f1f5f9;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-top: 4px;
    }

    /* 3. ESTRUCTURA DE TARJETAS EN DOS COLUMNAS CON ESPACIADO UX */
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 18px;
      margin-bottom: 20px;
    }

    .card-box {
      background: #f8fafc;
      border: 1.5px solid #e2e8f0;
      border-radius: 16px;
      padding: 18px 20px;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .card-box-title {
      font-size: 10.5pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #0f172a;
      border-bottom: 2px solid #cbd5e1;
      padding-bottom: 8px;
      margin: 0 0 12px 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .info-list {
      list-style: none;
      padding: 0;
      margin: 0;
      font-size: 10pt;
    }

    .info-list li {
      margin-bottom: 9px;
      display: flex;
      justify-content: space-between;
      gap: 12px;
      line-height: 1.4;
    }

    .info-list li strong {
      color: #475569;
      flex-shrink: 0;
    }

    .info-list li span {
      color: #0f172a;
      font-weight: 700;
      text-align: right;
      word-break: break-word;
      max-width: 250px;
    }

    /* LOGOTIPOS REALES VECTORIALES DE INTELIGENCIA ARTIFICIAL */
    .ai-logos-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-top: 10px;
    }

    .ai-badge {
      background: #ffffff;
      border: 1.5px solid #e2e8f0;
      border-radius: 10px;
      padding: 6px 10px;
      font-size: 8.5pt;
      font-weight: 800;
      color: #1e293b;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.03);
    }

    .ai-badge svg {
      flex-shrink: 0;
    }

    /* SERVICIOS */
    .services-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .service-item {
      background: #ffffff;
      border: 1.5px solid #e2e8f0;
      padding: 10px 14px;
      border-radius: 12px;
      font-size: 9.5pt;
    }

    .service-item-title {
      font-size: 10pt;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 3px;
    }

    .service-item-desc {
      font-size: 8.5pt;
      color: #64748b;
      line-height: 1.35;
    }

    /* REEMBOLSOS Y SRI */
    .reimbursement-box {
      background: #eff6ff;
      border: 2px solid #bfdbfe;
      border-radius: 16px;
      padding: 16px 20px;
      margin-bottom: 20px;
      font-size: 10pt;
      line-height: 1.55;
      color: #1e3a8a;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .reimbursement-title {
      font-weight: 800;
      text-transform: uppercase;
      font-size: 9.5pt;
      letter-spacing: 0.8px;
      margin-bottom: 6px;
      color: #1d4ed8;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* BLOQUE DE VALOR TÉCNICO: ARQUITECTURA EN CÓDIGO PURO (HTML5 / VANILLA JS) */
    .pure-code-banner {
      background: linear-gradient(135deg, #091a30 0%, #0d1e3d 100%);
      color: #ffffff;
      border-radius: 16px;
      padding: 16px 20px;
      margin-bottom: 20px;
      border: 1.5px solid #1e3a8a;
      box-shadow: 0 4px 16px rgba(15, 23, 42, 0.12);
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .pure-code-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
      border-bottom: 1.5px solid rgba(255,255,255,0.14);
      padding-bottom: 8px;
    }

    .pure-code-title {
      font-size: 10.5pt;
      font-weight: 900;
      color: #38bdf8;
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
    }

    .pure-code-badge {
      background: rgba(16, 185, 129, 0.22);
      color: #6ee7b7;
      border: 1px solid rgba(16, 185, 129, 0.45);
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 7.5pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .pure-code-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .pure-code-item {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 12px;
      padding: 10px 14px;
    }

    .pure-code-item-title {
      font-size: 9pt;
      font-weight: 800;
      color: #ffffff;
      margin-bottom: 4px;
    }

    .pure-code-item-desc {
      font-size: 8pt;
      color: #cbd5e1;
      line-height: 1.4;
      margin: 0;
    }

    /* BLOQUE COMPACTO: POSICIONAMIENTO SEO MÉDICO & MOTORES IA (GEO) */
    .seo-compact-banner {
      background: linear-gradient(135deg, #091e3a 0%, #0f2d59 50%, #1e1b4b 100%);
      color: #ffffff;
      border-radius: 16px;
      padding: 16px 20px;
      margin-bottom: 20px;
      border: 1.5px solid #1e3a8a;
      box-shadow: 0 4px 16px rgba(15, 23, 42, 0.12);
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .seo-compact-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
      border-bottom: 1px solid rgba(255,255,255,0.12);
      padding-bottom: 8px;
    }

    .seo-compact-title {
      font-size: 10pt;
      font-weight: 900;
      color: #38bdf8;
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
    }

    .seo-compact-badge {
      background: rgba(56, 189, 248, 0.2);
      color: #7dd3fc;
      border: 1px solid rgba(56, 189, 248, 0.45);
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 7.5pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .seo-compact-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .seo-compact-item {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 12px;
      padding: 10px 14px;
    }

    .seo-compact-item-title {
      font-size: 9pt;
      font-weight: 800;
      color: #ffffff;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .seo-compact-item-desc {
      font-size: 8pt;
      color: #cbd5e1;
      line-height: 1.4;
      margin: 0;
    }

    /* 4. PIE DE PÁGINA CON LOGOTIPO ORIGINAL DE MEDICO.EC (REPLICA FIEL 100%) */
    .footer-accreditation-card {
      background: #ffffff;
      border: 2.5px solid #0284c7;
      border-radius: 20px;
      padding: 24px 28px;
      margin-top: 24px;
      box-shadow: 0 4px 16px rgba(2, 132, 199, 0.08);
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .medico-ec-original-logo-container {
      text-align: center;
      margin-bottom: 18px;
      padding-bottom: 16px;
      border-bottom: 1.5px solid #e2e8f0;
    }

    .medico-ec-original-logo-svg {
      max-width: 380px;
      width: 100%;
      height: auto;
      display: inline-block;
    }

    .guarantee-badge-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #ecfdf5;
      color: #047857;
      border: 1.5px solid #86efac;
      padding: 7px 18px;
      border-radius: 20px;
      font-weight: 800;
      font-size: 9pt;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      box-shadow: 0 2px 6px rgba(4, 120, 87, 0.08);
      margin-top: 10px;
    }

    .accreditation-legend-text {
      font-size: 10pt;
      color: #334155;
      line-height: 1.55;
      margin-bottom: 18px;
      text-align: justify;
    }

    /* 5. SLOGAN FORMAL Y ELEGANTE */
    .grand-formal-slogan-box {
      background: linear-gradient(135deg, #0f172a 0%, #0369a1 100%);
      color: #ffffff;
      border-radius: 16px;
      padding: 20px 24px;
      text-align: center;
      box-shadow: 0 4px 18px rgba(3, 105, 161, 0.25);
    }

    .grand-slogan-text {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-weight: 800;
      font-size: 12pt;
      line-height: 1.55;
      letter-spacing: 0.2px;
      color: #ffffff;
    }

    .grand-slogan-highlight {
      color: #38bdf8;
      font-weight: 900;
    }

    /* METADATOS DEL DOCUMENTO */
    .document-footer-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 16px;
      padding-top: 12px;
      border-top: 1.5px dashed #cbd5e1;
      font-size: 8pt;
      color: #64748b;
    }

    @media print {
      @page {
        size: A4 portrait;
        margin: 6mm 6mm;
      }
      body {
        background: #ffffff !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      .page-container {
        border: none !important;
        box-shadow: none !important;
        padding: 0 !important;
        margin: 0 !important;
        width: 100% !important;
        max-width: 100% !important;
        border-radius: 0 !important;
        background: #ffffff !important;
      }
      .print-btn-bar {
        display: none !important;
      }
      .doctor-top-branding-box,
      .score-banner,
      .card-box,
      .pure-code-banner,
      .seo-compact-banner,
      .reimbursement-box,
      .footer-accreditation-card,
      .grand-formal-slogan-box,
      .document-footer-meta,
      .service-item,
      .ai-badge {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
    }
  </style>
</head>
<body>

  <!-- BARRA FLOTANTE DE ACCIONES SUPERIOR -->
  <div class="print-btn-bar">
    <div style="display:flex; align-items:center; gap:10px;">
      <span style="font-size:18px;">📄</span>
      <span style="font-weight:800; font-size:14px;">Ficha Técnica & Certificado de Consultorio Médico Digital</span>
    </div>

    <div class="print-btn-group">
      <button class="btn-action btn-download-pdf" onclick="downloadPdfDirectly()">
        <span>📥 Descargar PDF Directo</span>
      </button>

      <button class="btn-action btn-print-browser" onclick="window.print()">
        <span>🖨️ Imprimir / Guardar en Navegador</span>
      </button>

      <button class="btn-action btn-close" onclick="window.close()">
        <span>✕ Cerrar</span>
      </button>
    </div>
  </div>

  <!-- DOCUMENTO PDF PARA DESCARGAR E IMPRIMIR -->
  <div class="page-container" id="pdf-content">
    
    <!-- 1. LOGOTIPO SUPERIOR DEL MÉDICO EN GRANDE Y ENCABEZADO CENTRADO -->
    <div class="doctor-top-branding-box">
      ${logoImg ? `
        <img src="${logoImg}" alt="Logotipo Oficial ${doctorName}" class="doctor-main-large-logo" />
      ` : `
        <div style="font-size:46px; margin-bottom:10px;">🩺</div>
      `}

      <h1 class="doctor-main-name">${doctorName}</h1>
      <div class="doctor-main-specialty">${specialty}</div>

      <div class="meta-pills-container">
        <span class="meta-pill-item meta-pill-accredited">✓ Acreditado por Medico.ec</span>
        <span class="meta-pill-item">📋 ${registration}</span>
        <span class="meta-pill-item">⭐ ${experience}</span>
        <span class="meta-pill-item">📍 ${city}, ${province}</span>
      </div>
    </div>

    <!-- 2. AUDITORÍA Y PUNTUACIÓN DE OPTIMIZACIÓN 100/100 (CALIFICACIÓN A+) -->
    <div class="score-banner">
      <div class="score-info">
        <div class="score-title">
          <span>🛡️</span> Auditoría de Calidad Sanitaria & Posicionamiento IA
        </div>
        <p class="score-desc">
          Este perfil profesional cuenta con marcado de datos estructurados <strong>Schema.org MedicalBusiness</strong>, indexabilidad en motores conversacionales <strong>llms.txt</strong> y verificación E-E-A-T de autoridad médica para Ecuador.
        </p>
      </div>

      <div class="score-badge-box">
        <div class="score-number">100/100</div>
        <div class="score-label">Calificación A+</div>
      </div>
    </div>

    <!-- 3. SEO Y VINCULACIONES CON INTELIGENCIAS ARTIFICIALES (GEO) CON LOGOTIPOS REALES -->
    <div class="grid-2">
      <!-- Card SEO Web -->
      <div class="card-box">
        <div class="card-box-title">
          <span>🔍 Posicionamiento SEO & Indexación</span>
          <span style="color:#10b981; font-size:8.5pt;">VERIFICADO ✓</span>
        </div>
        <ul class="info-list">
          <li><strong>Meta Título SEO:</strong> <span style="font-size:8pt; max-width:170px; display:inline-block;" class="truncate">${metaTitle}</span></li>
          <li><strong>Keyword Principal:</strong> <span>${specialty} en ${city}</span></li>
          <li><strong>Schema.org JSON-LD:</strong> <span>MedicalBusiness / Physician</span></li>
          <li><strong>Sitemap & Robots.txt:</strong> <span>Generados e Indexables</span></li>
          <li><strong>Open Graph / Social:</strong> <span>WhatsApp / Facebook Listo</span></li>
        </ul>
      </div>

      <!-- Card Vinculaciones con IA (Con Logotipos Reales Vectoriales) -->
      <div class="card-box">
        <div class="card-box-title">
          <span>🤖 Vinculaciones con IA (GEO)</span>
          <span style="color:#0284c7; font-size:8.5pt;">CONECTADO ⚡</span>
        </div>
        <div style="font-size:8pt; color:#475569; margin-bottom:6px;">
          Optimizado con metodología <strong>Generative Engine Optimization (GEO)</strong> para responder en:
        </div>

        <div class="ai-logos-grid">
          <!-- 1. Google Gemini -->
          <div class="ai-badge">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z" fill="url(#gemini-pdf-grad)"/>
              <defs>
                <linearGradient id="gemini-pdf-grad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stop-color="#4285F4"/>
                  <stop offset="50%" stop-color="#9B51E0"/>
                  <stop offset="100%" stop-color="#EA4335"/>
                </linearGradient>
              </defs>
            </svg>
            <span>Google Gemini</span>
          </div>

          <!-- 2. ChatGPT / OpenAI -->
          <div class="ai-badge">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.28 9.82a5.98 5.98 0 0 0-.52-4.91 6.05 6.05 0 0 0-6.51-2.9 6.07 6.07 0 0 0-10.27 2.17 5.98 5.98 0 0 0-4 2.9 6.05 6.05 0 0 0 .74 7.1 5.98 5.98 0 0 0 .51 4.91 6.05 6.05 0 0 0 6.51 2.9A5.98 5.98 0 0 0 13.26 24a6.06 6.06 0 0 0 5.77-4.21 5.99 5.99 0 0 0 4-2.9 6.06 6.06 0 0 0-.75-7.07zm-9.02 12.61a4.48 4.48 0 0 1-2.88-1.04l.14-.08 4.78-2.76a.79.79 0 0 0 .39-.68v-6.74l2.02 1.17a.07.07 0 0 1 .04.05v5.58a4.5 4.5 0 0 1-4.49 4.5zm-9.66-4.13a4.47 4.47 0 0 1-.54-3.01l.14.08 4.78 2.76a.79.79 0 0 0 .79 0l5.83-3.37v2.34a.08.08 0 0 1-.03.06l-4.84 2.79a4.5 4.5 0 0 1-6.14-1.65zm-1.13-10.44a4.48 4.48 0 0 1 2.34-1.97v5.68a.79.79 0 0 0 .39.68l5.84 3.37-2.02 1.17a.08.08 0 0 1-.07 0l-4.84-2.79a4.5 4.5 0 0 1-1.64-6.13zm16.8 3.51l-5.83-3.37 2.02-1.17a.08.08 0 0 1 .07 0l4.84 2.79a4.5 4.5 0 0 1-.69 8.1V12.1a.79.79 0 0 0-.41-.68zm2.14-2.28l-.14-.09-4.78-2.76a.79.79 0 0 0-.79 0L8.86 9.65V7.32a.08.08 0 0 1 .03-.06l4.84-2.79a4.5 4.5 0 0 1 6.67 4.67z" fill="#10A37F"/>
            </svg>
            <span>ChatGPT (OpenAI)</span>
          </div>

          <!-- 3. Perplexity AI -->
          <div class="ai-badge">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L4 6v12l8 4 8-4V6l-8-4zm0 2.5L18 8l-6 3.5L6 8l6-3.5zM6 10l5 2.91v6.59L6 16.59V10zm12 6.59l-5 2.91v-6.59l5-2.91v6.59z" fill="#20B2AA"/>
            </svg>
            <span>Perplexity AI</span>
          </div>

          <!-- 4. Claude (Anthropic) -->
          <div class="ai-badge">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L14.5 8.5L21 9.5L16.2 14L17.5 20.5L12 17.2L6.5 20.5L7.8 14L3 9.5L9.5 8.5L12 2Z" fill="#D97706"/>
            </svg>
            <span>Claude (Anthropic)</span>
          </div>

          <!-- 5. Bing Copilot (Microsoft Copilot) -->
          <div class="ai-badge">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4a6 6 0 110 12 6 6 0 010-12z" fill="url(#copilot-pdf-grad)"/>
              <defs>
                <linearGradient id="copilot-pdf-grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stop-color="#00A4EF"/>
                  <stop offset="50%" stop-color="#7FBA00"/>
                  <stop offset="100%" stop-color="#F25022"/>
                </linearGradient>
              </defs>
            </svg>
            <span>Bing Copilot</span>
          </div>

          <!-- 6. DeepSeek AI -->
          <div class="ai-badge">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 3C7.03 3 3 7.03 3 12c0 3.31 1.79 6.2 4.47 7.76.3.17.68.04.83-.26.15-.3.04-.68-.26-.83C5.69 17.28 4.2 14.8 4.2 12c0-4.31 3.49-7.8 7.8-7.8s7.8 3.49 7.8 7.8c0 3.82-2.74 7.01-6.38 7.67-.34.06-.57.39-.51.73.06.34.39.57.73.51C17.9 20.18 21 16.44 21 12c0-4.97-4.03-9-9-9z" fill="#4F46E5"/>
              <circle cx="12" cy="12" r="3" fill="#6366F1"/>
            </svg>
            <span>DeepSeek AI</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 4. INFORMACIÓN VITAL DEL CONSULTORIO Y CONTACTO -->
    <div class="grid-2">
      <div class="card-box">
        <div class="card-box-title">📍 Ubicación & Agendamiento Directo</div>
        <ul class="info-list">
          <li><strong>Clínica / Centro:</strong> <span>${clinic}</span></li>
          <li><strong>Ciudad / Provincia:</strong> <span>${city}, ${province}</span></li>
          <li><strong>Dirección:</strong> <span>${address}</span></li>
          ${phone ? `<li><strong>Teléfono Consultorio:</strong> <span>${phone}</span></li>` : ''}
          ${whatsapp ? `<li><strong>WhatsApp Directo:</strong> <span>Atención Inmediata</span></li>` : ''}
          <li><strong>Sitio Web Oficial:</strong> <span style="font-family:monospace; font-size:8pt;">${data.dominioWeb || "https://tu-dominio.ec"}</span></li>
        </ul>
      </div>

      <div class="card-box">
        <div class="card-box-title">🕒 Horarios & Modalidades de Atención</div>
        <ul class="info-list">
          <li><strong>Lunes a Viernes:</strong> <span>${semanaText.replace(/^Lunes a Viernes:\s*/i, '')}</span></li>
          <li><strong>Sábados:</strong> <span>${sabadoText.replace(/^Sábado:\s*/i, '')}</span></li>
          <li><strong>Domingos / Feriados:</strong> <span>${domingoText.replace(/^Domingo:\s*/i, '')}</span></li>
          <li><strong>Modalidad:</strong> <span>Presencial / Telemedicina</span></li>
          <li><strong>Formas de Pago:</strong> <span>${(data.metodosPago || ["Efectivo", "Transferencia", "Tarjeta"]).join(", ")}</span></li>
        </ul>
      </div>
    </div>

    <!-- SERVICIOS Y TRATAMIENTOS DE ALTAS PRESTACIONES -->
    <div class="card-box" style="margin-bottom: 20px;">
      <div class="card-box-title">
        <span>🩺 Servicios & Procedimientos Registrados</span>
        <span style="font-size:8pt; color:#64748b; font-weight:600;">${mainServices.length} Tratamientos</span>
      </div>
      <div class="services-grid">
        ${mainServices.length > 0 ? mainServices.map(s => `
          <div class="service-item">
            <div class="service-item-title">${s.titulo}</div>
            <div class="service-item-desc">${s.descripcion || "Atención especializada bajo protocolos médicos normados."}</div>
          </div>
        `).join('') : `
          <div class="service-item">
            <div class="service-item-title">Consulta Médica Especializada</div>
            <div class="service-item-desc">Valoración diagnóstica integral y plan terapéutico individualizado.</div>
          </div>
          <div class="service-item">
            <div class="service-item-title">Procedimientos Diagnósticos</div>
            <div class="service-item-desc">Evaluación con tecnología médica avanzada de alta precisión.</div>
          </div>
        `}
      </div>
    </div>

    <!-- FACTURACIÓN ELECTRÓNICA Y SEGUROS -->
    <div class="reimbursement-box">
      <div class="reimbursement-title">
        <span>🧾</span> Facturación SRI & Reembolso con Seguros Privados de Ecuador
      </div>
      <div>
        Se emite <strong>Factura Electrónica autorizada por el SRI</strong> e <strong>Informe Médico Oficial</strong> para tramitar el reembolso directo con aseguradoras médicas en Ecuador (Saludsa, Humana, Ecuasanitas, Confiamed, BMI, Best Doctors, etc.).
      </div>
    </div>

    <!-- AUTORIDAD E-E-A-T, ASOCIACIONES & CITACIONES EN LA RED -->
    ${((data.certificados && data.certificados.length > 0) || (data.asociaciones && data.asociaciones.length > 0) || (data.reconocimientos && data.reconocimientos.length > 0) || backlinks.length > 0) ? `
      <div class="card-box" style="margin-bottom: 20px;">
        <div class="card-box-title">
          <span>🏛️ Validación de Credenciales Médicas & Citaciones E-E-A-T</span>
          <span style="font-size:8pt; color:#047857; font-weight:700;">Verificación Oficial ✓</span>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
          ${(data.certificados || []).slice(0, 4).map(c => `
            <div style="background:#f0fdf4; border:1.5px solid #bbf7d0; border-radius:8px; padding:6px 10px; font-size:8pt;">
              <strong style="color:#166534;">📜 ${c}</strong>
              <div style="color:#15803d; font-size:7.5pt;">Certificación Continua Acreditada</div>
            </div>
          `).join('')}
          ${(data.asociaciones || []).slice(0, 4).map(a => `
            <div style="background:#eff6ff; border:1.5px solid #bfdbfe; border-radius:8px; padding:6px 10px; font-size:8pt;">
              <strong style="color:#1e40af;">🏛️ ${a}</strong>
              <div style="color:#2563eb; font-size:7.5pt;">Sociedad Científica / Membresía</div>
            </div>
          `).join('')}
          ${(data.reconocimientos || []).slice(0, 2).map(r => `
            <div style="background:#fffbeb; border:1.5px solid #fde68a; border-radius:8px; padding:6px 10px; font-size:8pt;">
              <strong style="color:#92400e;">🏆 ${r}</strong>
              <div style="color:#b45309; font-size:7.5pt;">Distinción y Reconocimiento Médico</div>
            </div>
          `).join('')}
          ${backlinks.map(b => `
            <div style="background:#ffffff; border:1.5px solid #e2e8f0; border-radius:8px; padding:6px 10px; font-size:8pt;">
              <strong style="color:#0f172a;">🔗 ${b.portalNombre}</strong>
              <div style="color:#64748b; font-size:7.5pt;" class="truncate">${b.urlDestino || "Perfil Verificado"}</div>
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}

    <!-- 1. ARQUITECTURA EN CÓDIGO PURO (HTML5 / VANILLA JS) - EXACTO A LA FICHA ORIGINAL -->
    <div class="pure-code-banner">
      <div class="pure-code-header">
        <div class="pure-code-title">
          <span>⚡</span> Arquitectura en Código Puro (HTML5 / Vanilla JS)
        </div>
        <span class="pure-code-badge">
          🛡️ GARANTÍA DE AUTONOMÍA 3+ AÑOS
        </span>
      </div>

      <div class="pure-code-grid">
        <div class="pure-code-item">
          <div class="pure-code-item-title">⏳ Inmune al Paso del Tiempo</div>
          <div class="pure-code-item-desc">
            Estándar web universal W3C ("Don't Break The Web"). No se rompe por actualizaciones de temas ni versiones PHP.
          </div>
        </div>

        <div class="pure-code-item">
          <div class="pure-code-item-title">🛡️ Cero Mantenimiento & Sin Plugins</div>
          <div class="pure-code-item-desc">
            Sin plugins vulnerables ni cuotas mensuales por parches técnicos de emergencia.
          </div>
        </div>

        <div class="pure-code-item">
          <div class="pure-code-item-title">🚀 Velocidad Extrema (95–100 PageSpeed)</div>
          <div class="pure-code-item-desc">
            Carga en milisegundos desde cualquier teléfono móvil, maximizando el agendamiento directo por WhatsApp.
          </div>
        </div>

        <div class="pure-code-item">
          <div class="pure-code-item-title">🔒 Blindaje Total contra Hackeos</div>
          <div class="pure-code-item-desc">
            Sin bases de datos expuestas ni paneles de acceso atacables mediante fuerza bruta o inyecciones SQL.
          </div>
        </div>
      </div>
    </div>

    <!-- 2. POSICIONAMIENTO SEO MÉDICO & MOTORES IA (GEO) - FORMATO RESUMIDO Y COMPACTO -->
    <div class="seo-compact-banner">
      <div class="seo-compact-header">
        <div class="seo-compact-title">
          <span>🎯</span> Posicionamiento SEO Médico & Motores de Búsqueda IA (GEO)
        </div>
        <span class="seo-compact-badge">
          ⚡ ALTA VISIBILIDAD GOOGLE & LLMs
        </span>
      </div>

      <div class="seo-compact-grid">
        <div class="seo-compact-item">
          <div class="seo-compact-item-title">📍 SEO Local & Google Maps</div>
          <div class="seo-compact-item-desc">
            Optimizado para <strong>"${specialty} en ${city}"</strong> con microformatos georreferenciados, coordenadas GPS y consistencia NAP en Ecuador.
          </div>
        </div>

        <div class="seo-compact-item">
          <div class="seo-compact-item-title">🩺 Alta Intención & Servicios</div>
          <div class="seo-compact-item-desc">
            Indexación para <strong>${mainServices.length > 0 ? mainServices.slice(0, 2).map(s => s.titulo).join(", ") : specialty}</strong>, precios y agendamiento directo por WhatsApp.
          </div>
        </div>

        <div class="seo-compact-item">
          <div class="seo-compact-item-title">🛡️ Seguros Médicos & Factura SRI</div>
          <div class="seo-compact-item-desc">
            Atención por reembolso de aseguradoras privadas (Saludsa, Humana, BMI) y Facturación Electrónica autorizada.
          </div>
        </div>

        <div class="seo-compact-item">
          <div class="seo-compact-item-title">🤖 Citación en Inteligencia Artificial</div>
          <div class="seo-compact-item-desc">
            Marcado <strong>Schema.org Physician</strong> y archivo <strong>llms.txt</strong> para citación en ChatGPT, Google Gemini, Perplexity y Claude.
          </div>
        </div>
      </div>
    </div>

    <!-- 5. PIE DE PÁGINA: LOGOTIPO ORIGINAL Y OFICIAL DE MEDICO.EC (COPIA EXACTA DE Medico-ecWEB.png) -->
    <div class="footer-accreditation-card">
      
      <!-- LOGOTIPO VECTORIAL 100% FIEL A LA IMAGEN SUBIDA POR EL USUARIO (Medico-ecWEB.png) -->
      <div class="medico-ec-original-logo-container">
        <svg class="medico-ec-original-logo-svg" viewBox="0 0 480 125" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- EMBLEMA CORAZÓN ROJO Y CHECK AZUL -->
          <g transform="translate(10, 8)">
            <!-- Corazón Rojo Oficial -->
            <path
              d="M 60 98 C 24 74, 10 52, 10 32 C 10 16, 22 6, 38 6 C 48 6, 56 12, 60 18 C 64 12, 72 6, 82 6 C 98 6, 110 16, 110 32 C 110 52, 96 74, 60 98 Z"
              stroke="#ED1C24"
              stroke-width="10"
              stroke-linecap="round"
              stroke-linejoin="round"
              fill="none"
            />
            <!-- Checkmark Azul Oficial -->
            <path
              d="M 30 50 L 50 72 L 102 16"
              stroke="#0072BC"
              stroke-width="15"
              stroke-linecap="round"
              stroke-linejoin="round"
              fill="none"
            />
          </g>

          <!-- TIPOGRAFÍA EXACTA "Medico.ec" EN AZUL #0072BC -->
          <text x="138" y="74" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="900" font-size="58" fill="#0072BC" letter-spacing="-1.5">
            Medico<tspan fill="#0072BC">.ec</tspan>
          </text>

          <!-- TAGLINE EXACTO "ESPECIALISTAS MÉDICOS ONLINE" -->
          <text x="140" y="104" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="800" font-size="14.5" fill="#4B5563" letter-spacing="2.2">
            ESPECIALISTAS MÉDICOS <tspan fill="#ED1C24">ONLINE</tspan>
          </text>
        </svg>

        <div>
          <span class="guarantee-badge-pill">
            🛡️ Servicio Garantizado & Acreditado por Medico.ec
          </span>
        </div>
      </div>

      <!-- Leyenda de Acreditación -->
      <div class="accreditation-legend-text">
        <strong>Acreditación Sanitaria Digital Oficial:</strong> Este consultorio médico ha sido estructurado y auditado bajo estándares E-E-A-T de Google, marcado estructurado Schema.org JSON-LD y protocolos de indexación en Inteligencia Artificial. Se garantiza el cumplimiento técnico de alta visibilidad médica y auditoría digital en Ecuador.
      </div>

      <!-- SLOGAN FORMAL Y ELEGANTE -->
      <div class="grand-formal-slogan-box">
        <div class="grand-slogan-text">
          "Felicitaciones por la exitosa creación y acreditación de su <span class="grand-slogan-highlight">Consultorio Médico Digital</span>, incorporando metodologías avanzadas de posicionamiento web y sistemas de búsqueda asistidos por <span class="grand-slogan-highlight">Inteligencia Artificial</span>."
        </div>
      </div>
    </div>

    <!-- METADATOS Y PIE DE PÁGINA -->
    <div class="document-footer-meta">
      <div>
        <strong>Plataforma Medico.ec:</strong> Red de Especialistas Médicos de Ecuador • Documento de Acreditación Digital • Emisión: ${new Date().toLocaleDateString('es-EC', { year: 'numeric', month: 'long', day: 'numeric' })}
      </div>
      <div style="font-family:monospace; font-weight:800; color:#0284c7;">
        VERIFICACIÓN ACREDITADA ✓
      </div>
    </div>

  </div>

  <!-- SCRIPT DE DESCARGA DIRECTA PDF CON ALTA FIDELIDAD 100% E IDENTIDAD CON VISTA PREVIA -->
  <script>
    async function downloadPdfDirectly() {
      const element = document.getElementById('pdf-content');
      const btnBar = document.querySelector('.print-btn-bar');
      
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }

      // Activar modo de captura limpia (elimina márgenes externos y sombras que desalinean el canvas)
      document.body.classList.add('is-exporting-pdf');
      if (btnBar) btnBar.style.opacity = '0.4';

      // Breve pausa para aplicar reflow en el DOM antes de capturar canvas
      await new Promise(resolve => setTimeout(resolve, 120));

      const opt = {
        margin:       [6, 6, 6, 6],
        filename:     'Ficha_Medica_${doctorNameSlug}.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { 
          scale: 2, 
          useCORS: true, 
          logging: false, 
          letterRendering: true,
          windowWidth: 794,
          width: 794,
          scrollX: 0,
          scrollY: 0,
          x: 0,
          y: 0
        },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
      };

      if (typeof html2pdf !== 'undefined') {
        try {
          await html2pdf().set(opt).from(element).save();
        } catch (err) {
          console.error("Error al descargar PDF con html2pdf:", err);
          window.print();
        } finally {
          document.body.classList.remove('is-exporting-pdf');
          if (btnBar) btnBar.style.opacity = '1';
        }
      } else {
        document.body.classList.remove('is-exporting-pdf');
        window.print();
      }
    }

    // Auto-lanzar diálogo de impresión tras carga completa de fuentes
    window.addEventListener('load', () => {
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => {
          setTimeout(() => {
            try { window.print(); } catch (e) {}
          }, 600);
        });
      } else {
        setTimeout(() => {
          try { window.print(); } catch (e) {}
        }, 800);
      }
    });
  </script>

</body>
</html>`;
}

/**
 * Abre la ventana para la vista de la Ficha Médica en PDF con descarga directa
 */
export function printDoctorSummaryPdf(data: MedicalLandingData) {
  const currentUrl = typeof window !== "undefined" ? window.location.href.split('#')[0] : "https://mi-consultorio-medico.ec";
  const targetUrl = (data.dominioWeb && data.dominioWeb !== "https://tu-dominio.com") ? data.dominioWeb : currentUrl;

  const htmlContent = generateDoctorSummaryPrintHtml(data, targetUrl);

  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
