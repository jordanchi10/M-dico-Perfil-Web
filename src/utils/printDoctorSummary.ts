/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MedicalLandingData } from "../types";

/**
 * Genera un documento HTML limpio, profesional y optimizado para impresión (Guardar como PDF / Imprimir Ficha Médica)
 */
export function generateDoctorSummaryPrintHtml(data: MedicalLandingData, pageUrl: string): string {
  const doctorName = data.nombreMedico && data.nombreMedico !== "{{NOMBRE_MEDICO}}" 
    ? data.nombreMedico 
    : "Dr. Especialista Médico";
  
  const specialty = data.especialidad && data.especialidad !== "{{ESPECIALIDAD}}" 
    ? data.especialidad 
    : "Consulta Médica Especializada";

  const clinic = data.nombreClinicaGBP || "Consultorio Médico";
  const city = data.ciudad || "Ecuador";
  const address = data.direccionFisica || "Dirección de Consultorio";
  const phone = data.telefonoGBP || "";
  const whatsapp = data.whatsappUrl || "";
  const registration = data.cedulaProfesional ? `Registro/Cédula: ${data.cedulaProfesional}` : "Registro Profesional Sanitario / MSP";
  const experience = data.anosExperiencia ? `${data.anosExperiencia} Años de Trayectoria` : "";

  const mainServices = (Array.isArray(data.servicios) ? data.servicios : []).slice(0, 6);

  const rawHorarios: { semana?: string; sabado?: string; domingo?: string } = 
    data.horarios && typeof data.horarios === "object" ? data.horarios : {};
  const semanaText = typeof rawHorarios.semana === "string" ? rawHorarios.semana : "Lunes a Viernes: 08:30 - 18:30";
  const sabadoText = typeof rawHorarios.sabado === "string" ? rawHorarios.sabado : "Sábado: Previa Cita";
  const domingoText = typeof rawHorarios.domingo === "string" ? rawHorarios.domingo : "Domingo: Cerrado";

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Ficha Informativa del Consultorio - ${doctorName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap');
    
    @page {
      size: A4 portrait;
      margin: 15mm;
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
      background: #ffffff;
      color: #0f172a;
      line-height: 1.4;
      font-size: 11pt;
    }

    .page-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 24px;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
    }

    /* ENCABEZADO MÉDICO */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-b: 2.5px solid #0284c7;
      padding-bottom: 16px;
      margin-bottom: 20px;
    }

    .doctor-title-box {
      flex: 1;
    }

    .doctor-name {
      font-size: 20pt;
      font-weight: 900;
      color: #0f172a;
      margin: 0 0 4px 0;
      letter-spacing: -0.5px;
    }

    .specialty {
      font-size: 12pt;
      font-weight: 800;
      color: #0284c7;
      margin: 0 0 6px 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .meta-pills {
      display: flex;
      gap: 10px;
      font-size: 8.5pt;
      font-weight: 700;
      color: #475569;
    }

    .meta-pill {
      background: #f1f5f9;
      padding: 3px 8px;
      border-radius: 6px;
      border: 1px solid #e2e8f0;
    }

    .brand-badge {
      text-align: right;
      font-size: 8pt;
      font-weight: 800;
      color: #64748b;
      text-transform: uppercase;
    }

    .brand-badge strong {
      color: #0284c7;
      display: block;
      font-size: 10pt;
    }

    /* GRILLA PRINCIPAL */
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 20px;
    }

    .card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px;
    }

    .card-title {
      font-size: 9.5pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #0f172a;
      border-bottom: 1.5px solid #cbd5e1;
      padding-bottom: 6px;
      margin: 0 0 10px 0;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .info-list {
      list-style: none;
      padding: 0;
      margin: 0;
      font-size: 9.5pt;
    }

    .info-list li {
      margin-bottom: 6px;
      display: flex;
      justify-content: space-between;
    }

    .info-list li strong {
      color: #334155;
    }

    /* SERVICIOS */
    .services-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }

    .service-item {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 9pt;
    }

    .service-item-title {
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 2px;
    }

    .service-item-desc {
      font-size: 8pt;
      color: #64748b;
      line-height: 1.2;
    }

    /* BLOQUE INFORMATIVO Y REEMBOLSOS */
    .reimbursement-box {
      background: #eff6ff;
      border: 1.5px solid #bfdbfe;
      border-radius: 12px;
      padding: 14px 18px;
      margin-bottom: 20px;
      font-size: 9pt;
      color: #1e3a8a;
    }

    .reimbursement-title {
      font-weight: 800;
      text-transform: uppercase;
      font-size: 8.5pt;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
      color: #1d4ed8;
    }

    /* FOOTER CON QR Y CITA */
    .footer-qr {
      border-top: 2px dashed #cbd5e1;
      padding-top: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
    }

    .footer-text {
      flex: 1;
      font-size: 9pt;
      color: #475569;
    }

    .footer-text h4 {
      font-size: 11pt;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 4px 0;
    }

    .qr-box {
      text-align: center;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 12px;
      padding: 8px;
      shrink: 0;
    }

    .qr-box canvas, .qr-box img {
      width: 100px;
      height: 100px;
      display: block;
    }

    .qr-caption {
      font-size: 7.5pt;
      font-weight: 800;
      color: #0284c7;
      margin-top: 4px;
      text-transform: uppercase;
    }

    .print-btn-bar {
      margin-bottom: 20px;
      text-align: center;
    }

    .btn-print {
      background: #0284c7;
      color: #ffffff;
      font-weight: 800;
      font-size: 14px;
      border: none;
      padding: 12px 28px;
      border-radius: 12px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(2, 132, 199, 0.25);
    }

    @media print {
      .page-container {
        border: none;
        padding: 0;
      }
      .print-btn-bar {
        display: none !important;
      }
    }
  </style>
</head>
<body>

  <div class="print-btn-bar">
    <button class="btn-print" onclick="window.print()">🖨️ Imprimir / Guardar en PDF</button>
  </div>

  <div class="page-container">
    
    <!-- ENCABEZADO -->
    <div class="header">
      <div class="doctor-title-box">
        <h1 class="doctor-name">${doctorName}</h1>
        <div class="specialty">${specialty}</div>
        <div class="meta-pills">
          ${registration ? `<span class="meta-pill">📋 ${registration}</span>` : ''}
          ${experience ? `<span class="meta-pill">⭐ ${experience}</span>` : ''}
          <span class="meta-pill">📍 ${city}</span>
        </div>
      </div>
      <div class="brand-badge">
        Ficha de Consultorio
        <strong>Medico.ec</strong>
      </div>
    </div>

    <!-- DATOS DE ATENCIÓN Y UBICACIÓN -->
    <div class="grid">
      
      <div class="card">
        <div class="card-title">📍 Ubicación & Contacto</div>
        <ul class="info-list">
          <li><strong>Lugar:</strong> <span>${clinic}</span></li>
          <li><strong>Ciudad:</strong> <span>${city}</span></li>
          <li><strong>Dirección:</strong> <span>${address}</span></li>
          ${phone ? `<li><strong>Teléfono:</strong> <span>${phone}</span></li>` : ''}
          ${whatsapp ? `<li><strong>WhatsApp:</strong> <span>Citas directas por chat</span></li>` : ''}
        </ul>
      </div>

      <div class="card">
        <div class="card-title">🕒 Horarios & Modalidad</div>
        <ul class="info-list">
          <li><strong>Lunes a Viernes:</strong> <span>${semanaText.replace(/^Lunes a Viernes:\s*/i, '')}</span></li>
          <li><strong>Sábados:</strong> <span>${sabadoText.replace(/^Sábado:\s*/i, '')}</span></li>
          <li><strong>Domingos:</strong> <span>${domingoText.replace(/^Domingo:\s*/i, '')}</span></li>
          <li><strong>Modalidad:</strong> <span>Presencial / Telemedicina</span></li>
        </ul>
      </div>

    </div>

    <!-- SERVICIOS Y ESPECIALIDADES -->
    <div class="card" style="margin-bottom: 20px;">
      <div class="card-title">🩺 Servicios & Tratamientos Principales</div>
      <div class="services-grid">
        ${mainServices.length > 0 ? mainServices.map(s => `
          <div class="service-item">
            <div class="service-item-title">${s.titulo}</div>
            <div class="service-item-desc">${s.descripcion || "Atención especializada con protocolo clínico."}</div>
          </div>
        `).join('') : `
          <div class="service-item">
            <div class="service-item-title">Consulta Médica Especializada</div>
            <div class="service-item-desc">Valoración diagnóstica integral y plan terapéutico.</div>
          </div>
          <div class="service-item">
            <div class="service-item-title">Seguimiento de Pacientes</div>
            <div class="service-item-desc">Control continuo de evolución y respuesta al tratamiento.</div>
          </div>
        `}
      </div>
    </div>

    <!-- SEGUROS Y FACTURACIÓN SRI -->
    <div class="reimbursement-box">
      <div class="reimbursement-title">💳 Facturación SRI & Reembolso con Aseguradoras Privadas</div>
      <div>
        Emitimos <strong>Factura Electrónica autorizada por el SRI</strong> y el <strong>Informe Médico Oficial</strong> para el trámite de reembolso de gastos médicos con todas las aseguradoras privadas de Ecuador (Saludsa, Humana, Ecuasanitas, Confiamed, BMI, Best Doctors, etc.).
      </div>
    </div>

    <!-- QR Y AGENDAMIENTO -->
    <div class="footer-qr">
      <div class="footer-text">
        <h4>Escanee para agendar su cita médica</h4>
        <p style="margin: 0 0 6px 0;">Acceda directamente a la página web del médico, horarios disponibles y chat directo de WhatsApp.</p>
        <p style="margin: 0; font-size: 8pt; color: #94a3b8; font-family: monospace;">${pageUrl}</p>
      </div>

      <div class="qr-box">
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(pageUrl)}" alt="Código QR de Agendamiento" />
        <div class="qr-caption">Escanear Cita</div>
      </div>
    </div>

  </div>

</body>
</html>`;
}

/**
 * Abre una ventana limpia para la vista de impresión/PDF de la ficha informativa
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
