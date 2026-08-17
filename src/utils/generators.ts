/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MedicalLandingData } from "../types";
import { getMedicalIconSvg } from "./medicalIcons";
import { getActiveColorScale } from "./colorUtils";
import { generateOpeningHoursSchema, getLiveConsultationStatus } from "./scheduleUtils";
import { getActiveLandingStyle, generateLandingStyleCssVariables } from "./stylePresets";

/**
 * Genera el script JSON-LD de SEO Local (MedicalBusiness + Physician + FAQPage) multicapa enriquecido
 */
export function generateJsonLd(data: MedicalLandingData, appUrl: string = "https://tu-dominio.com"): string {
  const cleanAppUrl = appUrl.replace(/\/$/, "");
  
  // Mapeo de asociaciones para Schema
  const memberOrganizations = data.asociaciones.map(asoc => ({
    "@type": "MedicalOrganization",
    "name": asoc
  }));

  // Mapeo de FAQs para el marcado Schema FAQPage
  const faqEntities = (data.faqs || []).map(faq => ({
    "@type": "Question",
    "name": faq.pregunta,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.respuesta
    }
  }));

  // Reseñas de pacientes válidas
  const validReviews = (data.resenas || []).filter(r => r && r.paciente?.trim() && r.comentario?.trim());
  const reviewEntities = validReviews.map(r => ({
    "@type": "Review",
    "author": {
      "@type": "Person",
      "name": r.paciente
    },
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": Number(r.estrellas) || 5,
      "bestRating": "5",
      "worstRating": "1"
    },
    "reviewBody": r.comentario
  }));

  // Calificación agregada (prioriza Google Reviews GBP si está configurado, o calcula de las reseñas locales)
  let aggregateRating: any = undefined;
  if (data.googleReviewsRating && data.googleReviewsTotalCount) {
    aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": Number(data.googleReviewsRating).toFixed(1),
      "reviewCount": Number(data.googleReviewsTotalCount),
      "bestRating": "5",
      "worstRating": "1"
    };
  } else if (validReviews.length > 0) {
    const avg = (validReviews.reduce((acc, curr) => acc + (Number(curr.estrellas) || 5), 0) / validReviews.length).toFixed(1);
    aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": avg,
      "reviewCount": validReviews.length,
      "bestRating": "5",
      "worstRating": "1"
    };
  }

  // Catálogo de servicios / tratamientos ofrecidos
  const offerCatalog = {
    "@type": "OfferCatalog",
    "name": `Tratamientos y Procedimientos de ${data.especialidad}`,
    "itemListElement": (data.servicios || []).map((s, idx) => ({
      "@type": "Offer",
      "itemOffered": {
        "@type": "MedicalProcedure",
        "name": s.titulo,
        "description": s.descripcion
      }
    }))
  };

  const paymentAcceptedText = data.metodosPago && data.metodosPago.length > 0
    ? data.metodosPago.join(", ")
    : "Efectivo, Tarjeta de Crédito, Transferencia Bancaria Directa (Banco Pichincha, Banco Guayaquil, Produbanco, DeUna), Seguro Privado Reembolso (Saludsa, Humana, Ecuasanitas, Confiamed, Latina, Equinoccial, Best Doctors, BMI)";

  const medicalBusinessObject: Record<string, any> = {
    "@type": ["MedicalBusiness", "Physician"],
    "@id": `${cleanAppUrl}/#medicalbusiness`,
    "name": data.nombreMedico,
    "legalName": data.nombreClinicaGBP || data.nombreMedico,
    "image": data.fotoUrl,
    ...(data.logoUrl ? { "logo": data.logoUrl } : {}),
    "telephone": data.telefonoGBP,
    "email": data.emailContacto || undefined,
    "url": cleanAppUrl,
    "hasMap": `https://maps.google.com/maps?q=${data.latitud},${data.longitud}`,
    "medicalSpecialty": data.especialidad,
    "description": data.filosofia,
    "priceRange": data.precioConsulta || "$$$",
    "currenciesAccepted": "USD",
    "paymentAccepted": paymentAcceptedText,
    "isAcceptingNewPatients": true,
    "healthPlanNetworkId": data.aseguradoras || [],
    "address": {
      "@type": "PostalAddress",
      "streetAddress": data.direccionFisica,
      "addressLocality": data.ciudad,
      "addressRegion": data.estadoRegion,
      "postalCode": data.codigoPostal,
      "addressCountry": "EC"
    },
    "areaServed": {
      "@type": "AdministrativeArea",
      "name": `${data.ciudad}, ${data.estadoRegion}, Ecuador`
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": data.latitud,
      "longitude": data.longitud
    },
    "openingHoursSpecification": generateOpeningHoursSchema(data.horarios),
    "memberOf": memberOrganizations,
    "hasOfferCatalog": offerCatalog,
    "knowsAbout": [data.especialidad, ...data.servicios.map(s => s.titulo)],
    "sameAs": [
      data.whatsappUrl,
      data.facebookUrl,
      data.instagramUrl,
      data.tiktokUrl,
      data.doctoraliaUrl,
      data.googleMapsReviewsUrl
    ].filter(Boolean)
  };

  if (aggregateRating) {
    medicalBusinessObject.aggregateRating = aggregateRating;
  }
  if (reviewEntities.length > 0) {
    medicalBusinessObject.review = reviewEntities;
  }

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      medicalBusinessObject,
      {
        "@type": "FAQPage",
        "@id": `${cleanAppUrl}/#faq`,
        "mainEntity": faqEntities
      }
    ]
  };

  return JSON.stringify(schema, null, 2);
}

/**
 * Genera el archivo index.html completo e independiente de marca blanca listo para producción.
 */
export function generateHtmlFile(data: MedicalLandingData, appUrl: string = "https://tu-dominio.com"): string {
  const cleanAppUrl = appUrl.replace(/\/$/, "");
  const jsonLd = generateJsonLd(data, appUrl);

  const selectedPalette = getActiveColorScale(data.paletaColor, data.colorPrimarioHex);
  const selectedStylePreset = getActiveLandingStyle(data.estiloLanding);
  
  // Render de aseguradoras
  const aseguradorasHtml = data.aseguradoras.map(aseg => 
    `<span class="inline-flex items-center justify-center px-4 py-2 rounded-full text-sm font-semibold bg-blue-50 text-blue-700 border border-blue-100">${aseg}</span>`
  ).join("\n        ");

  // Render de hospitales
  const hospitalesHtml = data.hospitalesdondeOpera.map(hosp => 
    `<div class="flex items-center gap-3 p-4 rounded-xl border border-gray-100 bg-white shadow-sm">
      <div class="p-2 rounded-lg bg-emerald-50 text-emerald-600">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
      </div>
      <div>
        <p class="font-bold text-gray-900">${hosp}</p>
        <p class="text-xs text-gray-500">Hospital con quirófano e instalaciones certificadas</p>
      </div>
    </div>`
  ).join("\n        ");

  // Render de asociaciones
  const asociacionesHtml = data.asociaciones.map(asoc => 
    `<li class="flex items-start gap-2.5 text-sm text-gray-600">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-blue-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
      <span>${asoc}</span>
    </li>`
  ).join("\n          ");

  const serviciosHtml = (data.servicios || []).map((srv, idx) => {
    return `<div class="p-6 rounded-2xl bg-white shadow-sm border border-gray-100 hover:border-clinical-200 hover:shadow-md transition-all duration-300 group flex flex-col justify-between">
      <div>
        <div class="w-12 h-12 rounded-xl bg-clinical-50 text-clinical-600 flex items-center justify-center mb-5 group-hover:bg-clinical-600 group-hover:text-white transition-colors duration-300 shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            ${getMedicalIconSvg(srv.icono)}
          </svg>
        </div>
        <h3 class="text-lg font-bold text-gray-900 mb-2 leading-snug">${srv.titulo}</h3>
        <p class="text-gray-600 text-sm leading-relaxed">${srv.descripcion}</p>
      </div>
      <div class="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-xs text-clinical-600 font-bold">
        <span>Protocolo Especializado #${idx + 1}</span>
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" /></svg>
      </div>
    </div>`;
  }).join("\n        ");

  // Render de Casos Antes/Después (Multi-slider interactivo)
  const casosHtml = (data.casosAntesDespues || []).map((caso, idx) => 
    `<div class="p-6 rounded-3xl bg-white shadow-lg border border-gray-100 flex flex-col justify-between">
      <div class="mb-4">
        <div class="flex items-center gap-2 mb-2">
          <span class="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">${idx + 1}</span>
          <h3 class="text-lg font-bold text-gray-900">${caso.titulo}</h3>
        </div>
        <p class="text-gray-600 text-xs leading-relaxed line-clamp-2">${caso.descripcion}</p>
      </div>
      
      <!-- Slider Comparador Antes/Después Interactivo con Lazy Loading -->
      <div class="relative w-full aspect-[4/3] rounded-2xl overflow-hidden select-none bg-slate-100 clinical-slider-container cursor-ew-resize border border-slate-100 shadow-inner" data-slider-idx="${idx}">
        <!-- Imagen de Después (Fondo) -->
        <img src="${caso.imgAfter}" alt="Resultado Después - ${caso.titulo}" width="800" height="600" class="absolute inset-0 w-full h-full object-cover pointer-events-none" loading="lazy" decoding="async" referrerPolicy="no-referrer" />
        
        <!-- Imagen de Antes (Superposición con clip-path) -->
        <div class="absolute inset-0 w-full h-full overflow-hidden before-image-wrapper pointer-events-none" style="clip-path: polygon(0 0, 50% 0, 50% 100%, 0 100%)">
          <img src="${caso.imgBefore}" alt="Estado Antes - ${caso.titulo}" width="800" height="600" class="absolute inset-0 w-full h-full object-cover" loading="lazy" decoding="async" referrerPolicy="no-referrer" />
          <span class="absolute top-3 left-3 bg-red-600/90 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm pointer-events-auto">Antes</span>
        </div>
        
        <span class="absolute top-3 right-3 bg-emerald-600/90 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm pointer-events-auto">Después</span>

        <!-- Línea y Manilla del Slider -->
        <div class="absolute top-0 bottom-0 w-0.5 bg-white cursor-ew-resize flex items-center justify-center will-change-transform slider-handle" style="left: 50%; transform: translateX(-50%)">
          <div class="w-8 h-8 rounded-full bg-white text-clinical-600 shadow-xl flex items-center justify-center border border-gray-200 pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 9l-4 4 4 4m8 0l4-4-4-4" />
            </svg>
          </div>
        </div>
      </div>
    </div>`
  ).join("\n        ");

  // Render de FAQs
  const faqsHtml = (data.faqs || []).map((faq, index) => 
    `<div class="border-b border-gray-100 last:border-0 py-4">
      <button class="flex items-center justify-between w-full text-left font-semibold text-gray-900 hover:text-blue-600 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100 rounded-lg px-2 transition-colors"
              aria-expanded="false" 
              aria-controls="faq-answer-${index}"
              onclick="toggleFaq(${index})">
        <span>${faq.pregunta}</span>
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-500 transform transition-transform duration-300" id="faq-icon-${index}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div id="faq-answer-${index}" class="hidden mt-2 px-2 text-gray-600 text-sm leading-relaxed" aria-hidden="true">
        <p>${faq.respuesta}</p>
      </div>
    </div>`
  ).join("\n        ");

  // Render de Testimonios/Reseñas
  const googleWidgetHtml = (data.habilitarGoogleReviewsWidget ?? true) ? `
    <div id="google-reviews-widget" class="w-full mb-8 p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all">
      <div class="flex items-center gap-3.5 sm:gap-4">
        <div class="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-2xs flex items-center justify-center shrink-0">
          <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
          </svg>
        </div>
        <div>
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-xs sm:text-sm font-extrabold text-slate-900">Google Business Profile</span>
            <span class="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200/70 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
              <svg class="w-3 h-3 text-blue-600 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
              Perfil Verificado
            </span>
          </div>
          <div class="flex items-center gap-2 mt-1 flex-wrap">
            <span class="text-base sm:text-lg font-black text-slate-950 tabular-nums">${data.googleReviewsRating ?? 4.9}</span>
            <div class="flex text-amber-400 text-xs sm:text-sm tracking-tighter">★★★★★</div>
            <span class="text-xs text-slate-500 font-medium">(${data.googleReviewsTotalCount ?? 148} opiniones verificadas en Google)</span>
          </div>
        </div>
      </div>
      ${data.googleMapsReviewsUrl ? `
        <a href="${data.googleMapsReviewsUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs sm:text-sm font-bold shadow-2xs hover:border-slate-300 transition-all shrink-0 self-start md:self-auto">
          <span>Ver ficha en Google Maps</span>
          <svg class="w-4 h-4 text-blue-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
        </a>
      ` : ''}
    </div>
  ` : '';

  const resenasHtml = (data.resenas || []).map(res => {
    const starVal = Math.max(1, Math.min(5, Number(res.estrellas) || 5));
    const estrellasHtml = Array.from({ length: 5 }).map((_, i) => {
      const isFilled = i < starVal;
      return `<svg class="w-4 h-4 ${isFilled ? "text-amber-400 fill-current" : "text-gray-200 fill-current"} shrink-0" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>`;
    }).join("");

    return `<div class="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all flex flex-col justify-between h-full group">
      <div class="flex-1 flex flex-col">
        <div class="flex items-center justify-between gap-2 mb-3 shrink-0">
          <div class="flex items-center gap-1">
            ${estrellasHtml}
            <span class="text-xs font-bold text-slate-700 ml-1.5">${starVal}.0</span>
          </div>
          <span class="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full inline-flex items-center gap-1 shrink-0">
            <svg class="w-2.5 h-2.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
            Verificado
          </span>
        </div>
        <div class="flex-1 flex flex-col justify-start my-1">
          <p class="text-slate-600 italic text-xs sm:text-sm leading-relaxed">"${res.comentario || ""}"</p>
        </div>
      </div>
      <div class="flex items-center justify-between border-t border-slate-100 pt-3.5 mt-3.5 shrink-0">
        <span class="text-xs sm:text-sm font-bold text-slate-900 truncate pr-2">${res.paciente || "Paciente"}</span>
        <span class="text-[11px] text-slate-400 font-medium shrink-0">${res.fecha || "Reciente"}</span>
      </div>
    </div>`;
  }).join("\n        ");

  // Render de Blog Médico (SEO Long-Tail con Lazy Loading & CLS Prevention)
  const blogPostsHtml = (data.blogPosts || []).map((post, idx) => {
    return `<article class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col group hover:border-clinical-200 hover:shadow-md transition-all duration-300">
      <!-- Imagen de portada con zoom effect y lazy loading nativo -->
      <div class="relative overflow-hidden aspect-[16/10] bg-slate-100">
        <img src="${post.imagenUrl}" alt="${post.titulo}" width="600" height="375" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" decoding="async" referrerPolicy="no-referrer" />
        <span class="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-clinical-700 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">${post.categoria}</span>
      </div>
      
      <!-- Cuerpo del post -->
      <div class="p-6 flex-1 flex flex-col justify-between">
        <div class="space-y-3">
          <div class="flex items-center gap-2 text-xs text-gray-400 font-medium">
            <span>${post.fecha}</span>
            <span class="w-1 h-1 rounded-full bg-gray-300"></span>
            <span>${post.tiempoLectura}</span>
          </div>
          <h3 class="text-lg font-bold text-gray-900 group-hover:text-clinical-600 transition-colors line-clamp-2">${post.titulo}</h3>
          <p class="text-gray-600 text-xs leading-relaxed line-clamp-3">${post.extracto}</p>
        </div>
        
        <div class="pt-5 mt-5 border-t border-slate-100">
          <button onclick="openBlogModal(${idx})" class="text-clinical-600 hover:text-clinical-700 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1 cursor-pointer">
            Leer artículo completo
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
    </article>`;
  }).join("\n        ");

  // Obtener estado en tiempo real inicial
  const initialLiveStatus = getLiveConsultationStatus(data.horarios);

  return `<!DOCTYPE html>
<html lang="es" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.nombreMedico} | ${data.especialidad} en ${data.ciudad}, Ecuador</title>
  <meta name="description" content="Consulta médica con ${data.nombreMedico}, especialista en ${data.especialidad} en ${data.ciudad}, Ecuador (${data.estadoRegion}). Registro MSP y SENESCYT. Facturación SRI y seguros médicos.">
  
  <!-- SEO Local & Geo Tags para Ecuador -->
  <meta name="geo.region" content="EC">
  <meta name="geo.placename" content="${data.ciudad}, ${data.estadoRegion}, Ecuador">
  <meta name="geo.position" content="${data.latitud};${data.longitud}">
  <meta name="ICBM" content="${data.latitud}, ${data.longitud}">
  
  <!-- Open Graph / Redes Sociales -->
  <meta property="og:title" content="${data.nombreMedico} | ${data.especialidad} en ${data.ciudad}, Ecuador">
  <meta property="og:description" content="Agenda tu consulta médica con un especialista certificado en ${data.ciudad}, Ecuador. Más de ${data.anosExperiencia} años de trayectoria médica.">
  <meta property="og:url" content="${cleanAppUrl}">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="es_EC">
  <meta property="og:image" content="${data.fotoUrl}">
  
  <!-- CSS Framework (Tailwind CSS CDN para portabilidad e independencia) -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            clinical: {
              50: 'var(--clinical-50)',
              100: 'var(--clinical-100)',
              200: 'var(--clinical-200)',
              500: 'var(--clinical-500)',
              600: 'var(--clinical-600)',
              700: 'var(--clinical-700)',
              800: 'var(--clinical-800)',
              900: 'var(--clinical-900)'
            }
          },
          borderRadius: {
            'clinical-sm': 'var(--landing-radius-sm)',
            'clinical': 'var(--landing-radius)',
            'clinical-lg': 'var(--landing-radius-lg)',
            'clinical-xl': 'var(--landing-radius-xl)',
            'clinical-btn': 'var(--landing-radius-btn)',
            'clinical-badge': 'var(--landing-badge-radius)'
          }
        }
      }
    }
  </script>

  <!-- DNS Prefetch & Preconnect para Recursos e Imágenes Externas -->
  <link rel="preconnect" href="https://images.unsplash.com" crossorigin>
  <link rel="dns-prefetch" href="https://images.unsplash.com">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  
  <!-- LCP (Largest Contentful Paint) Optimization: Preload de imagen Hero Prioritaria -->
  <link rel="preload" as="image" href="${data.fotoUrl}" fetchpriority="high">
  
  <!-- Tipografía Google Fonts según Estilo Seleccionado (${selectedStylePreset.name}) -->
  <link href="${selectedStylePreset.googleFontsUrl}" rel="stylesheet">
  
  <style>
    :root {
      --clinical-50: ${selectedPalette["50"]};
      --clinical-100: ${selectedPalette["100"]};
      --clinical-200: ${selectedPalette["200"]};
      --clinical-500: ${selectedPalette["500"]};
      --clinical-600: ${selectedPalette["600"]};
      --clinical-700: ${selectedPalette["700"]};
      --clinical-800: ${selectedPalette["800"]};
      --clinical-900: ${selectedPalette["900"]};

${generateLandingStyleCssVariables(selectedStylePreset)}
    }
    body {
      font-family: var(--landing-font-body);
      letter-spacing: var(--landing-letter-spacing);
      text-rendering: optimizeLegibility;
      -webkit-font-smoothing: antialiased;
    }
    h1, h2, h3, h4, h5, h6, .font-display {
      font-family: var(--landing-font-display);
      letter-spacing: var(--landing-letter-spacing);
    }
    /* Adaptación Dinámica de Bordes y Radios según Preset de Estilo */
    .rounded-3xl, .rounded-2xl, .rounded-\\[2\\.5rem\\], .rounded-\\[2rem\\] {
      border-radius: var(--landing-radius-lg) !important;
    }
    .rounded-xl {
      border-radius: var(--landing-radius) !important;
    }
    .rounded-lg {
      border-radius: var(--landing-radius-sm) !important;
    }
    .rounded-md {
      border-radius: var(--landing-radius-sm) !important;
    }
    /* Elevación y Sombras Adaptativas */
    .shadow-lg, .shadow-xl, .shadow-2xl {
      box-shadow: var(--landing-shadow) !important;
    }
    /* Optimizaciones de Renderizado Core Web Vitals (INP / TBT / FCP) */
    .cv-auto {
      content-visibility: auto;
      contain-intrinsic-size: 1px 700px;
    }
    .will-change-transform {
      will-change: transform;
    }
  </style>

  <!-- PWA Support -->
  <link rel="manifest" href="/manifest.json">
  <meta name="theme-color" content="${selectedPalette["600"]}">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="default">
  <meta name="apple-mobile-web-app-title" content="${data.especialidad}">

  <!-- Schema Markup Multicapa (Physician + FAQPage) -->
  <script type="application/ld+json">
${jsonLd}
  </script>
</head>
<body class="bg-[#fafbfc] text-[#2c333a] min-h-screen relative pb-16 md:pb-0">

  <!-- ACCESIBILIDAD: Saltar al contenido principal -->
  <a href="#inicio" class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-clinical-600 text-white px-4 py-2 rounded-lg font-bold z-50">
    Saltar al contenido principal
  </a>

  <!-- HEADER / STICKY NAV (Optimizada para dedos) -->
  <header class="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-100 z-40 transition-all shadow-sm" id="main-header">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between">
      <div class="flex items-center gap-3">
        ${data.logoUrl ? `
          <img 
            src="${data.logoUrl}" 
            alt="Logo ${data.nombreMedico}" 
            class="max-h-10 max-w-[120px] object-contain bg-transparent shrink-0"
          />
        ` : ''}
        <div class="flex flex-col">
          <span class="text-lg md:text-xl font-bold text-gray-900 tracking-tight flex items-center gap-1.5 font-display">
            ${!data.logoUrl ? `<span class="w-3 h-3 rounded-full bg-clinical-600"></span>` : ''}
            ${data.nombreMedico}
          </span>
          <span class="text-xs md:text-sm text-clinical-600 font-bold tracking-wider uppercase">${data.especialidad}</span>
        </div>
      </div>
      
      <!-- Navegación Escritorio -->
      <nav class="hidden md:flex items-center gap-6 text-sm font-semibold text-gray-600">
        <a href="#inicio" class="hover:text-clinical-600 transition-colors">Inicio</a>
        <a href="#nosotros" class="hover:text-clinical-600 transition-colors">Nosotros</a>
        <a href="#servicios" class="hover:text-clinical-600 transition-colors">Tratamientos</a>
        <a href="#faq" class="hover:text-clinical-600 transition-colors">Preguntas</a>
        <a href="#resenas" class="hover:text-clinical-600 transition-colors">Opiniones</a>
        <a href="#blog" class="hover:text-clinical-600 transition-colors">Blog</a>
      </nav>

      <div class="flex items-center gap-2">
        <a href="#agendar" aria-label="Agendar Cita" title="Agendar Cita" class="w-10 h-10 sm:w-11 sm:h-11 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 text-center shrink-0 hover:scale-105">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
        </a>
      </div>
    </div>
  </header>

  <!-- HERO SECTION (Lo primero tras el menú: Logotipo y Foto en relación 1:1) -->
  <section id="inicio" class="relative py-10 md:py-20 overflow-hidden bg-gradient-to-br from-clinical-50 via-white to-[#fcfdfd]">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center">
      
      <!-- LOGOTIPO CON FONDO TRANSPARENTE (Arriba de la foto) -->
      ${data.logoUrl ? `
        <div class="w-full flex justify-center mb-5">
          <img 
            src="${data.logoUrl}" 
            alt="Logotipo ${data.nombreMedico}" 
            class="max-h-16 md:max-h-20 max-w-[260px] md:max-w-[320px] object-contain bg-transparent filter drop-shadow-xs" 
            loading="eager"
          />
        </div>
      ` : ''}

      <!-- FOTO PROFESIONAL EN RELACIÓN DE ASPECTO 1:1 (CUADRADA) -->
      <div class="relative w-full max-w-[320px] sm:max-w-[380px] aspect-square rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl bg-slate-100 mb-8 group mx-auto">
        <img 
          src="${data.fotoUrl}" 
          alt="${data.nombreMedico} - Especialista en ${data.especialidad}" 
          width="500" 
          height="500" 
          class="w-full h-full aspect-square object-cover transition-transform duration-500 group-hover:scale-105" 
          loading="eager" 
          fetchpriority="high" 
          decoding="async" 
          referrerPolicy="no-referrer" 
        />
        <div class="absolute bottom-0 inset-x-0 p-4 sm:p-5 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent text-white flex items-end justify-between text-left">
          <div>
            <p class="text-xs font-bold uppercase tracking-widest text-clinical-100">Cédula Profesional</p>
            <p class="text-sm sm:text-base font-extrabold text-white">${data.cedulaProfesional}</p>
          </div>
          <span class="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500 text-white flex items-center gap-1 shadow-xs">
            <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
            Verificado
          </span>
        </div>
      </div>

      <!-- Badge de Certificación y Estado de Atención en Tiempo Real -->
      <div class="flex flex-wrap items-center justify-center gap-2 mb-5">
        <div class="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-clinical-100 text-clinical-700 text-xs font-bold uppercase tracking-wider">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 fill-current" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M6.267 3.455a.75.75 0 00-.708-.523H4.5a2 2 0 00-2 2v3a2 2 0 002 2h.1l2.222 3.333a2 2 0 001.666.889h5.137a2 2 0 001.665-.889L17.4 9.5a2 2 0 002-2v-3a2 2 0 00-2-2h-1.059a.75.75 0 00-.707.523l-1.045 3.398a.75.75 0 01-.707.523H6.974a.75.75 0 01-.707-.523L6.267 3.455z" clip-rule="evenodd" /></svg>
          Consulta Médica Certificada
        </div>

        <!-- Indicador Dinámico en Tiempo Real (Abierto / Cerrado ahora) -->
        <div id="hero-live-status-pill" class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-2xs text-xs font-bold text-slate-800 transition-all">
          <span class="relative flex h-2.5 w-2.5">
            <span id="hero-status-ping" class="animate-ping absolute inline-flex h-full w-full rounded-full ${initialLiveStatus.dotColor === 'emerald' ? 'bg-emerald-400' : initialLiveStatus.dotColor === 'amber' ? 'bg-amber-400' : 'bg-slate-400'} opacity-75"></span>
            <span id="hero-status-dot" class="relative inline-flex rounded-full h-2.5 w-2.5 ${initialLiveStatus.dotColor === 'emerald' ? 'bg-emerald-500' : initialLiveStatus.dotColor === 'amber' ? 'bg-amber-500' : 'bg-slate-500'}"></span>
          </span>
          <span id="hero-status-text">${initialLiveStatus.badgeText}</span>
          <span class="text-slate-300">•</span>
          <span id="hero-status-detail" class="text-slate-500 font-medium text-[11px]">${initialLiveStatus.badgeDetail}</span>
        </div>
      </div>
      
      <!-- Titular Principal -->
      <h1 class="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-5 max-w-3xl">
        Atención de primer nivel en <span class="text-clinical-600 block sm:inline">${data.especialidad}</span> en la ciudad de <span class="underline decoration-clinical-600/30">${data.ciudad}</span>
      </h1>
      
      <!-- Subtítulo / Filosofía -->
      <p class="text-base sm:text-lg text-gray-600 leading-relaxed mb-8 max-w-2xl">
        ${data.filosofia} Recupera tu salud de la mano de un especialista con amplia trayectoria, ética intachable y técnicas certificadas.
      </p>

      <!-- Botones de Acción Inmediata -->
      <div class="flex flex-col items-center gap-3.5 w-full">
        <a href="#agendar" class="w-[80%] max-w-md bg-clinical-600 hover:bg-clinical-700 text-white px-6 py-4 rounded-2xl text-sm sm:text-base font-extrabold shadow-md hover:shadow-xl transition-all duration-300 text-center flex items-center justify-center gap-2.5">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          <span>Agendar Consulta</span>
        </a>
        <a href="tel:${data.telefonoGBP}" class="w-[80%] max-w-md border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800 px-6 py-4 rounded-2xl text-sm sm:text-base font-extrabold transition-all duration-300 text-center flex items-center justify-center gap-2.5 bg-white shadow-2xs">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-slate-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
          <span>Llamar al Consultorio</span>
        </a>
      </div>

    </div>
  </section>

  <!-- SECCIÓN NOSOTROS (Resumen Curricular & Filosofía - Renderizado Optimizado) -->
  <section id="nosotros" class="py-16 md:py-24 bg-white cv-auto">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
      
      <!-- Columna Información -->
      <div>
        <h2 class="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-6 leading-tight">
          Formación Médica de Vanguardia con Sensibilidad Humana
        </h2>
        <p class="text-gray-600 leading-relaxed mb-6">
          ${data.biografiaCurta}
        </p>
        <p class="text-gray-600 leading-relaxed mb-8">
          Creemos firmemente en el trato personalizado: cada paciente tiene necesidades individuales y merece ser escuchado. Nuestras intervenciones se diseñan con base en las técnicas médicas más avanzadas y con un riguroso compromiso con la ética médica.
        </p>

        <!-- Stats Rápidos (Sin exceso de anidamiento) -->
        <div class="grid grid-cols-3 gap-6 pt-6 border-t border-gray-100 text-center sm:text-left">
          <div>
            <p class="text-3xl md:text-4xl font-extrabold text-clinical-600">+${data.anosExperiencia}</p>
            <p class="text-xs font-bold text-gray-500 uppercase tracking-wide">Años de Trayectoria</p>
          </div>
          <div>
            <p class="text-3xl md:text-4xl font-extrabold text-clinical-600">100%</p>
            <p class="text-xs font-bold text-gray-500 uppercase tracking-wide">Material Certificado</p>
          </div>
          <div>
            <p class="text-3xl md:text-4xl font-extrabold text-clinical-600">4.9/5</p>
            <p class="text-xs font-bold text-gray-500 uppercase tracking-wide">Calificación Pacientes</p>
          </div>
        </div>
      </div>

      <!-- Columna Certificaciones / Asociaciones -->
      <div class="bg-slate-50 p-8 rounded-3xl border border-slate-100 flex flex-col gap-6">
        <h3 class="text-xl font-bold text-gray-900">Hospitales de Operación & Membresías Clínicas</h3>
        
        <!-- Hospitales -->
        <div class="flex flex-col gap-3">
          ${hospitalesHtml}
        </div>

        <hr class="border-slate-200">

        <!-- Asociaciones Médicas -->
        <div>
          <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Consejos y Asociaciones a las que pertenece</p>
          <ul class="space-y-3">
            ${asociacionesHtml}
          </ul>
        </div>
      </div>

    </div>
  </section>

  <!-- SECCIÓN SERVICIOS / TRATAMIENTOS (Renderizado Optimizado) -->
  <section id="servicios" class="py-16 md:py-24 bg-gradient-to-b from-white to-slate-50/50 cv-auto">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-12">
      <span class="text-xs font-bold text-clinical-600 uppercase tracking-widest bg-clinical-50 px-3 py-1 rounded-full mb-3 inline-block">Portafolio Médico</span>
      <h2 class="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-2">Procedimientos y Tratamientos Especializados</h2>
      <p class="text-gray-500 max-w-2xl mx-auto mt-3 text-sm md:text-base">Servicios integrales diseñados bajo estándares internacionales para garantizar la seguridad, máxima precisión y resultados funcionales excelentes.</p>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      ${serviciosHtml}
    </div>
  </section>

  <!-- SECCIÓN CASOS COMPARATIVOS ANTES/DESPUÉS (Renderizado Optimizado) -->
  <section id="casos" class="py-16 md:py-24 bg-slate-50 cv-auto">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-12">
      <span class="text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full mb-3 inline-block">Casos Clínicos</span>
      <h2 class="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-2">Resultados Médicos Comprobados</h2>
      <p class="text-gray-500 max-w-2xl mx-auto mt-3 text-sm md:text-base">Visualiza la evolución y los cambios clínicos logrados con un plan de tratamiento adecuado. Arrastra la manilla del slider de izquierda a derecha en cualquiera de los casos.</p>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-8">
      ${casosHtml}
    </div>
  </section>

  <!-- SECCIÓN PREGUNTAS FRECUENTES (FAQ - Renderizado Optimizado) -->
  <section id="faq" class="py-16 md:py-24 bg-white cv-auto">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-12">
        <span class="text-xs font-bold text-clinical-600 uppercase tracking-widest bg-clinical-50 px-3 py-1 rounded-full mb-3 inline-block">FAQ Pacientes</span>
        <h2 class="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-2">Preguntas Frecuentes de la Consulta</h2>
        <p class="text-gray-500 mt-3 text-sm">Respuestas claras de un especialista para disipar tus dudas previas a la cita médica.</p>
      </div>

      <div class="divide-y divide-gray-100 border-t border-b border-gray-100">
        ${faqsHtml}
      </div>
    </div>
  </section>

  <!-- SECCIÓN TESTIMONIOS (Reseñas - Renderizado Optimizado) -->
  <section id="resenas" class="py-16 md:py-24 bg-gradient-to-b from-white via-slate-50/40 to-slate-50 border-t border-slate-100 cv-auto" aria-label="Reseñas y opiniones de pacientes">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center max-w-2xl mx-auto mb-10">
        <span class="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-3 py-1 rounded-full uppercase tracking-wider">Opinión Médica & Testimonios</span>
        <h2 class="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mt-3">Qué Dicen Nuestros Pacientes</h2>
        <p class="text-gray-500 mt-2 text-sm md:text-base leading-relaxed">Opiniones verificadas de pacientes atendidos con los más altos estándares éticos y clínicos.</p>
      </div>

      <!-- Widget de Calificación y Google Reviews -->
      ${googleWidgetHtml}

      <!-- Cuadrícula Responsiva de Testimonios con CSS Grid minmax -->
      <div class="grid gap-6 items-stretch" style="grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));">
        ${resenasHtml}
      </div>
    </div>
  </section>

  <!-- SECCIÓN BLOG MÉDICO (SEO Long-Tail con Renderizado Optimizado) -->
  <section id="blog" class="py-16 md:py-24 bg-slate-50 border-y border-slate-100 cv-auto">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-12">
        <span class="text-xs font-bold text-clinical-600 uppercase tracking-widest bg-clinical-100 px-3 py-1 rounded-full mb-3 inline-block">Blog de Salud</span>
        <h2 class="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-2">Artículos de Interés y Prevención</h2>
        <p class="text-gray-500 max-w-2xl mx-auto mt-3 text-sm md:text-base">Información confiable, respaldada por la ciencia y redactada para tu bienestar cotidiano por especialistas.</p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        ${blogPostsHtml}
      </div>
    </div>
  </section>

  <!-- SECCIÓN AGENDAR / CONTACTO Y LOCALIZACIÓN (Renderizado Optimizado) -->
  <section id="agendar" class="py-16 md:py-24 bg-white cv-auto">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
      
      <!-- Columna Dirección, NAP y Horarios -->
      <div class="lg:col-span-5 flex flex-col justify-between">
        <div>
          <span class="text-xs font-bold text-clinical-600 uppercase tracking-widest bg-clinical-50 px-3 py-1 rounded-full mb-4 inline-block">Ubicación y Horarios</span>
          <h2 class="text-3xl font-extrabold text-gray-900 mb-6 font-display">Visita Nuestro Consultorio</h2>
          
          <div class="space-y-6 text-sm mb-8">
            <!-- Dirección (NAP) -->
            <div class="flex gap-4">
              <div class="p-3 rounded-xl bg-slate-50 text-clinical-600 h-11 w-11 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <div>
                <p class="font-bold text-gray-900">Ubicación de Consulta</p>
                <address class="text-gray-600 not-italic mt-1 leading-relaxed">
                  ${data.nombreClinicaGBP}<br>
                  ${data.direccionFisica},<br>
                  CP ${data.codigoPostal}, ${data.ciudad}, ${data.estadoRegion}
                </address>
              </div>
            </div>

            <!-- Teléfono (NAP) -->
            <div class="flex gap-4">
              <div class="p-3 rounded-xl bg-slate-50 text-clinical-600 h-11 w-11 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              </div>
              <div>
                <p class="font-bold text-gray-900">Teléfono Directo Consultorio</p>
                <p class="text-gray-600 mt-1">${data.telefonoGBP}</p>
              </div>
            </div>

            <!-- Horarios Clínicos y Estado en Tiempo Real -->
            <div class="flex gap-4">
              <div class="p-3 rounded-xl bg-slate-50 text-clinical-600 h-11 w-11 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div class="flex-1">
                <div class="flex items-center justify-between gap-2 flex-wrap mb-1.5">
                  <p class="font-bold text-gray-900">Horarios de Atención</p>
                  <span id="loc-status-pill" class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${initialLiveStatus.dotColor === 'emerald' ? 'bg-emerald-100 text-emerald-800' : initialLiveStatus.dotColor === 'amber' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'}">
                    <span id="loc-status-dot" class="w-2 h-2 rounded-full ${initialLiveStatus.dotColor === 'emerald' ? 'bg-emerald-500 animate-pulse' : initialLiveStatus.dotColor === 'amber' ? 'bg-amber-500' : 'bg-slate-400'}"></span>
                    <span id="loc-status-text">${initialLiveStatus.badgeText}</span>
                  </span>
                </div>
                <ul class="text-gray-600 text-xs sm:text-sm space-y-1">
                  <li id="sch-semana" class="flex items-center justify-between py-0.5 border-b border-slate-100/80">
                    <span class="font-medium text-slate-600">Lunes a Viernes:</span>
                    <span class="font-bold text-slate-800">${data.horarios.semana.replace(/^Lunes a Viernes:\s*/i, '')}</span>
                  </li>
                  <li id="sch-sabado" class="flex items-center justify-between py-0.5 border-b border-slate-100/80">
                    <span class="font-medium text-slate-600">Sábados:</span>
                    <span class="font-bold text-slate-800">${data.horarios.sabado.replace(/^Sábado:\s*/i, '')}</span>
                  </li>
                  <li id="sch-domingo" class="flex items-center justify-between py-0.5">
                    <span class="font-medium text-slate-600">Domingos:</span>
                    <span class="font-bold text-slate-800">${data.horarios.domingo.replace(/^Domingo:\s*/i, '')}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Tarifa de Consulta y Métodos de Pago -->
          <div class="p-5 rounded-2xl bg-gradient-to-br from-emerald-50/90 via-white to-slate-50 border border-emerald-100 shadow-xs space-y-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2.5">
                <div class="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                  <span class="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider block">Valor de la Consulta</span>
                  <span class="text-xl font-black text-slate-900">${data.precioConsulta || "$50 USD"}</span>
                </div>
              </div>
              <span class="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-100/80 text-emerald-800 border border-emerald-200">
                Tarifa Transparente
              </span>
            </div>

            <div class="border-t border-slate-100/90 pt-2.5">
              <span class="text-[10px] font-extrabold text-slate-500 uppercase tracking-wide block mb-1.5">
                Métodos de pago aceptados:
              </span>
              <div class="flex flex-wrap gap-1.5">
                ${(data.metodosPago || ["Efectivo", "Transferencia bancaria", "Tarjetas de crédito"]).map(mp => `
                  <span class="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 shadow-2xs">
                    ${mp.toLowerCase().includes("efectivo") ? `<svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>` : ''}
                    ${mp.toLowerCase().includes("transferencia") ? `<svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>` : ''}
                    ${mp.toLowerCase().includes("tarjeta") ? `<svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>` : ''}
                    <span>${mp}</span>
                  </span>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- Mini Formulario de Agendamiento de Cita -->
          <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3.5">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-clinical-100 text-clinical-700 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <div>
                <h4 class="text-sm font-extrabold text-slate-900">Selecciona el día de tu cita médica</h4>
                <p class="text-[11px] text-slate-500">Elige la fecha y horario estimado para coordinar tu consulta directamente.</p>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <!-- Selector de Fecha -->
              <div class="flex flex-col gap-1">
                <label for="agenda-date" class="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                  <span>Fecha preferida</span>
                </label>
                <input
                  id="agenda-date"
                  type="date"
                  class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none bg-slate-50/60 font-semibold text-slate-800"
                />
              </div>

              <!-- Selector de Horario -->
              <div class="flex flex-col gap-1">
                <label for="agenda-time" class="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                  <span>Horario preferido</span>
                </label>
                <select
                  id="agenda-time"
                  class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none bg-slate-50/60 font-semibold text-slate-800 cursor-pointer"
                >
                  <option value="09:00 AM">09:00 AM (Mañana)</option>
                  <option value="10:30 AM" selected>10:30 AM (Mañana)</option>
                  <option value="12:00 PM">12:00 PM (Mediodía)</option>
                  <option value="03:00 PM">03:00 PM (Tarde)</option>
                  <option value="04:30 PM">04:30 PM (Tarde)</option>
                  <option value="06:00 PM">06:00 PM (Tarde/Noche)</option>
                </select>
              </div>
            </div>

            <!-- Nombre opcional del paciente -->
            <div class="flex flex-col gap-1">
              <label for="agenda-name" class="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                <span>Nombre del paciente (opcional)</span>
              </label>
              <input
                id="agenda-name"
                type="text"
                placeholder="ej. María Gómez"
                class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none bg-slate-50/60 font-medium text-slate-800"
              />
            </div>
          </div>
        </div>

        <div class="pt-6 border-t border-gray-100 flex flex-col items-center gap-3.5 w-full">
          <a id="agenda-whatsapp-btn" href="${data.whatsappUrl}" target="_blank" rel="noopener noreferrer" class="w-[80%] max-w-md bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-4 rounded-2xl font-extrabold text-sm sm:text-base text-center flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg transition-all duration-300">
            <svg class="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.717-1.454L0 24zm6.59-2.635c1.6.95 3.51 1.45 5.48 1.45 5.86 0 10.63-4.77 10.63-10.63 0-2.84-1.1-5.51-3.11-7.51a10.522 10.522 0 00-7.52-3.12c-5.87 0-10.64 4.77-10.64 10.64 0 2.05.54 4.05 1.56 5.81L1.92 22.2l4.727-1.242c1.7.93 3.59 1.41 5.4 1.41z" /></svg>
            <span>Agendar vía WhatsApp</span>
          </a>
          <a href="${data.doctoraliaUrl}" target="_blank" rel="noopener noreferrer" class="w-[80%] max-w-md bg-clinical-600 hover:bg-clinical-700 text-white px-6 py-4 rounded-2xl font-extrabold text-sm sm:text-base text-center flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg transition-all duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <span>Agendar en Doctoralia</span>
          </a>
        </div>
      </div>

      <!-- Columna Mapa Embebido Simulado de Alta Calidad o Iframe de Google Maps -->
      <div class="lg:col-span-7 h-[400px] lg:h-auto rounded-3xl overflow-hidden border border-gray-100 shadow-lg relative bg-slate-100">
        <!-- Mapa interactivo usando iframe de Google Maps con lazy loading nativo -->
        <iframe 
          title="Ubicación de Consulta de ${data.nombreMedico}"
          width="600"
          height="450"
          class="w-full h-full border-0 grayscale hover:grayscale-0 transition-all duration-500" 
          src="https://maps.google.com/maps?q=${data.latitud},${data.longitud}&hl=es&z=15&amp;output=embed"
          allowfullscreen="" 
          loading="lazy">
        </iframe>
      </div>

    </div>
  </section>

  <!-- 1. SECCIÓN ASEGURADORAS Y CONVENIOS (Al final, arriba del pie de página) -->
  <section id="autoridad" class="py-12 bg-slate-50 border-t border-slate-200/80 text-center" aria-label="Aseguradoras y convenios médicos">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="mb-6 space-y-2">
        <span class="text-xs font-bold text-clinical-600 uppercase tracking-widest bg-clinical-100 px-3.5 py-1 rounded-full inline-block">Cobertura Médica & Convenios</span>
        <h2 class="text-2xl sm:text-3xl font-extrabold text-gray-900">Aseguradoras y Planes Médicos Aceptados</h2>
        <p class="text-gray-500 text-sm max-w-xl mx-auto">Atención con cobertura directa o trámite de reembolso con las principales compañías aseguradoras médicas del país.</p>
      </div>
      <div class="flex flex-wrap items-center justify-center gap-3 md:gap-4 max-w-4xl mx-auto">
        ${aseguradorasHtml}
      </div>
    </div>
  </section>

  <!-- 2. SECCIÓN CANALES PRINCIPALES DE REDES SOCIALES (Abajo de Aseguradoras y arriba del Footer) -->
  <section id="canales-sociales" class="py-12 bg-slate-900 text-white border-t border-slate-800 text-center" aria-label="Canales oficiales y redes sociales">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <div class="space-y-2">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-emerald-400 text-xs font-bold">
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Canales Oficiales del Especialista
        </div>
        <h2 class="text-2xl sm:text-3xl font-extrabold text-white">Redes Sociales y Contacto Directo</h2>
        <p class="text-slate-300 text-sm max-w-lg mx-auto">Conéctate y sigue las publicaciones médicas, artículos de salud y consultas en nuestras plataformas oficiales.</p>
      </div>

      <div class="flex items-center justify-center gap-3 sm:gap-4 flex-wrap pt-2 max-w-xl mx-auto">
        <!-- WhatsApp -->
        <a
          href="${data.whatsappUrl || '#'}"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contactar vía WhatsApp"
          title="WhatsApp Oficial"
          class="w-12 h-12 rounded-2xl bg-emerald-500/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 flex items-center justify-center transition-all shadow-2xs hover:scale-110 group cursor-pointer"
        >
          <svg class="w-5 h-5 fill-current transition-transform group-hover:scale-110" viewBox="0 0 24 24">
            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.969.53 1.771.815 2.796.815 3.181 0 5.767-2.586 5.768-5.766 0-3.18-2.587-5.767-5.768-5.767zm3.385 8.169c-.144.405-.837.774-1.17.824-.312.045-.694.077-2.228-.557-1.782-.738-2.909-2.553-2.997-2.671-.088-.118-.72-1.026-.72-1.956 0-.93.486-1.387.659-1.579.173-.191.381-.239.508-.239.127 0 .254.001.365.006.118.006.275-.045.431.33.161.385.55 1.341.599 1.439.048.098.081.213.016.342-.066.129-.098.21-.196.326-.098.116-.207.26-.296.349-.099.098-.202.205-.087.402.115.197.511.843 1.096 1.364.754.672 1.389.88 1.587.978.197.098.313.082.427-.049.115-.131.492-.574.623-.77.131-.197.262-.164.443-.098.181.066 1.147.541 1.344.64.197.098.328.147.377.23.049.082.049.475-.095.88z"/>
          </svg>
        </a>

        <!-- Facebook -->
        <a
          href="${data.facebookUrl || '#'}"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Página de Facebook"
          title="Facebook Oficial"
          class="w-12 h-12 rounded-2xl bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/40 flex items-center justify-center transition-all shadow-2xs hover:scale-110 group cursor-pointer"
        >
          <svg class="w-5 h-5 fill-current transition-transform group-hover:scale-110" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        </a>

        <!-- Instagram -->
        <a
          href="${data.instagramUrl || '#'}"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Perfil de Instagram"
          title="Instagram Oficial"
          class="w-12 h-12 rounded-2xl bg-pink-500/20 hover:bg-gradient-to-tr hover:from-purple-600 hover:to-pink-600 text-pink-300 hover:text-white border border-pink-500/40 flex items-center justify-center transition-all shadow-2xs hover:scale-110 group cursor-pointer"
        >
          <svg class="w-5 h-5 fill-current transition-transform group-hover:scale-110" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
        </a>

        <!-- TikTok -->
        <a
          href="${data.tiktokUrl || '#'}"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Perfil de TikTok"
          title="TikTok Oficial"
          class="w-12 h-12 rounded-2xl bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white border border-slate-700 flex items-center justify-center transition-all shadow-2xs hover:scale-110 group cursor-pointer"
        >
          <svg class="w-5 h-5 fill-current transition-transform group-hover:scale-110" viewBox="0 0 24 24">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298 0 .59.043.87.126V9.4a6.33 6.33 0 0 0-.87-.06A6.34 6.34 0 0 0 3 15.68a6.34 6.34 0 0 0 10.82 4.48c.18-.18.34-.37.49-.57V10.7a8.28 8.28 0 0 0 5.28 1.93v-3.45a4.84 4.84 0 0 1-3.23-.97c-.01-.01-.02-.02-.04-.03l3.27-1.49z"/>
          </svg>
        </a>

        <!-- Correo Electrónico -->
        <a
          href="mailto:${data.emailContacto || 'contacto@consultoriomedico.com'}"
          aria-label="Enviar Correo Electrónico"
          title="Enviar Correo Electrónico"
          class="w-12 h-12 rounded-2xl bg-amber-500/20 hover:bg-amber-600 text-amber-300 hover:text-white border border-amber-500/40 flex items-center justify-center transition-all shadow-2xs hover:scale-110 group cursor-pointer"
        >
          <svg class="w-5 h-5 fill-none stroke-current group-hover:scale-110 transition-transform" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
          </svg>
        </a>
      </div>
    </div>
  </section>

  <!-- FOOTER -->
  <footer class="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 border-b border-gray-800 pb-8">
        
        <div>
          <span class="text-white font-bold text-lg block mb-3 font-display">${data.nombreMedico}</span>
          <p class="text-sm text-gray-400 leading-relaxed max-w-xs">${data.especialidad} en ${data.ciudad}. Consulta médica certificada, segura y ética.</p>
        </div>

        <div>
          <span class="text-white font-bold text-sm block mb-3 uppercase tracking-wider">Enlaces Legales</span>
          <ul class="text-sm space-y-2">
            <li><a href="#" class="hover:text-white transition-colors">Aviso de Privacidad Médica</a></li>
            <li><a href="#" class="hover:text-white transition-colors">Términos y Condiciones de Uso</a></li>
            <li><a href="#" class="hover:text-white transition-colors">Consentimiento Informado</a></li>
          </ul>
        </div>

        <div>
          <span class="text-white font-bold text-sm block mb-3 uppercase tracking-wider">Contacto NAP</span>
          <address class="text-sm not-italic space-y-1">
            <p class="text-white font-semibold">${data.nombreClinicaGBP}</p>
            <p>${data.direccionFisica}, ${data.ciudad}</p>
            <p>Tel: ${data.telefonoGBP}</p>
          </address>
        </div>

      </div>

      <div class="flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500">
        <p>&copy; ${new Date().getFullYear()} ${data.nombreMedico}. Todos los derechos reservados. Cédula Profesional: ${data.cedulaProfesional}</p>
        <p class="mt-2 sm:mt-0">Landing page médica marca blanca optimizada para SEO Local y PWA.</p>
      </div>
    </div>
  </footer>

  <!-- BOTÓN FLOTANTE WHATSAPP (FAB PERSISTENTE) -->
  <a href="${data.whatsappUrl}" 
     target="_blank" 
     rel="noopener noreferrer" 
     class="fixed bottom-20 md:bottom-6 right-6 bg-emerald-500 text-white p-4 rounded-full shadow-2xl hover:bg-emerald-600 transition-all transform hover:scale-110 z-50 flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-emerald-200"
     aria-label="Contactar a la clínica vía WhatsApp para agendar una cita">
    <svg class="w-7 h-7 fill-current" viewBox="0 0 24 24">
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.717-1.454L0 24zm6.59-2.635c1.6.95 3.51 1.45 5.48 1.45 5.86 0 10.63-4.77 10.63-10.63 0-2.84-1.1-5.51-3.11-7.51a10.522 10.522 0 00-7.52-3.12c-5.87 0-10.64 4.77-10.64 10.64 0 2.05.54 4.05 1.56 5.81L1.92 22.2l4.727-1.242c1.7.93 3.59 1.41 5.4 1.41z" />
    </svg>
  </a>

  <!-- MENÚ INFERIOR MÓVIL (Barra de Navegación Ergonómica con Iconos de Alto Contraste y Estados de Color Distintivos) -->
  <nav aria-label="Navegación Móvil Principal" class="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-xl border-t border-slate-200/90 py-2 px-3 flex justify-around items-center md:hidden z-40 shadow-[0_-6px_20px_rgba(0,0,0,0.08)] pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
    
    <!-- Inicio (Azul Zafiro / Clínico) -->
    <a href="#inicio" class="flex flex-col items-center gap-1 py-1 px-2 rounded-xl text-slate-700 hover:text-blue-700 hover:bg-blue-50/80 transition-all duration-200 transform active:scale-95 group focus:outline-none focus:ring-2 focus:ring-blue-400/50" aria-label="Ir al inicio de la página">
      <div class="w-8 h-8 rounded-xl bg-blue-100/80 text-blue-700 border border-blue-200/70 flex items-center justify-center shadow-xs group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all duration-200">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      </div>
      <span class="text-[10px] font-extrabold tracking-tight">Inicio</span>
    </a>

    <!-- Especialista / Doctor (Índigo / Púrpura) -->
    <a href="#nosotros" class="flex flex-col items-center gap-1 py-1 px-2 rounded-xl text-slate-700 hover:text-indigo-700 hover:bg-indigo-50/80 transition-all duration-200 transform active:scale-95 group focus:outline-none focus:ring-2 focus:ring-indigo-400/50" aria-label="Conocer trayectoria del especialista">
      <div class="w-8 h-8 rounded-xl bg-indigo-100/80 text-indigo-700 border border-indigo-200/70 flex items-center justify-center shadow-xs group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all duration-200">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 11a2 2 0 012 2v1a2 2 0 01-2 2h-1a2 2 0 01-2-2v-1a2 2 0 012-2h1z" />
        </svg>
      </div>
      <span class="text-[10px] font-extrabold tracking-tight">Doctor</span>
    </a>

    <!-- Tratamientos / Servicios (Teal / Esmeralda Claro) -->
    <a href="#servicios" class="flex flex-col items-center gap-1 py-1 px-2 rounded-xl text-slate-700 hover:text-teal-700 hover:bg-teal-50/80 transition-all duration-200 transform active:scale-95 group focus:outline-none focus:ring-2 focus:ring-teal-400/50" aria-label="Ver tratamientos y procedimientos médicos">
      <div class="w-8 h-8 rounded-xl bg-teal-100/80 text-teal-700 border border-teal-200/70 flex items-center justify-center shadow-xs group-hover:bg-teal-600 group-hover:text-white group-hover:border-teal-600 transition-all duration-200">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-3-3v6m-7 5h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <span class="text-[10px] font-extrabold tracking-tight">Servicios</span>
    </a>

    <!-- Opiniones de Pacientes (Ámbar / Oro) -->
    <a href="#opiniones" class="flex flex-col items-center gap-1 py-1 px-2 rounded-xl text-slate-700 hover:text-amber-700 hover:bg-amber-50/80 transition-all duration-200 transform active:scale-95 group focus:outline-none focus:ring-2 focus:ring-amber-400/50" aria-label="Ver reseñas y testimonios de pacientes">
      <div class="w-8 h-8 rounded-xl bg-amber-100/80 text-amber-700 border border-amber-200/70 flex items-center justify-center shadow-xs group-hover:bg-amber-500 group-hover:text-white group-hover:border-amber-500 transition-all duration-200">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      </div>
      <span class="text-[10px] font-extrabold tracking-tight">Opiniones</span>
    </a>

    <!-- Agendar Cita (Verde Esmeralda / CTA de Alta Conversión) -->
    <a href="#agendar" class="flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl bg-emerald-500/15 border border-emerald-300 text-emerald-800 shadow-xs hover:bg-emerald-600 hover:text-white transition-all duration-200 transform active:scale-95 group focus:outline-none focus:ring-2 focus:ring-emerald-400/60" aria-label="Agendar cita con el médico">
      <div class="relative w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span class="absolute -top-0.5 -right-0.5 flex h-2 w-2">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-300"></span>
        </span>
      </div>
      <span class="text-[10px] font-black tracking-tight">Cita</span>
    </a>

  </nav>

  <!-- MODAL DE ARTÍCULO DE BLOG (Estilo Modal Centrado con Lazy Loading) -->
  <div id="blog-modal" class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
      <!-- Cabecera con Imagen -->
      <div class="relative h-48 sm:h-64 bg-slate-100 shrink-0">
        <img id="modal-blog-img" src="" alt="" width="800" height="400" class="w-full h-full object-cover" loading="lazy" decoding="async" referrerPolicy="no-referrer" />
        <button onclick="closeBlogModal()" class="absolute top-4 right-4 bg-white/95 backdrop-blur-sm p-2 rounded-full text-gray-700 hover:text-gray-950 hover:scale-105 shadow-md transition-all cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      <!-- Contenido Escrito -->
      <div class="p-6 sm:p-8 overflow-y-auto flex-1 space-y-4">
        <div class="flex items-center gap-2 text-xs text-gray-400 font-semibold">
          <span id="modal-blog-category" class="text-clinical-700 bg-clinical-50 px-2.5 py-1 rounded-full uppercase tracking-wider text-[10px]"></span>
          <span id="modal-blog-date"></span>
          <span>•</span>
          <span id="modal-blog-time"></span>
        </div>
        <h2 id="modal-blog-title" class="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight font-display"></h2>
        <div id="modal-blog-content" class="text-sm sm:text-base text-gray-600 leading-relaxed space-y-4"></div>
      </div>
    </div>
  </div>

  <!-- CHATBOT VIRTUAL DE CONSULTA -->
  <div id="chatbot-wrapper" class="fixed bottom-24 md:bottom-28 right-6 z-40 font-sans">
    <!-- Chat Button -->
    <button id="chatbot-trigger" onclick="toggleChatbot()" class="flex items-center justify-center w-14 h-14 rounded-full text-white shadow-2xl transform hover:scale-110 active:scale-95 transition-all duration-300 bg-clinical-600 hover:bg-clinical-700 focus:outline-none">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    </button>

    <!-- Chat Panel -->
    <div id="chatbot-panel" class="hidden absolute bottom-16 right-0 w-80 h-[400px] bg-white rounded-3xl border border-gray-100 shadow-2xl flex flex-col overflow-hidden transition-all duration-300">
      <!-- Header -->
      <div class="bg-clinical-600 p-4 text-white flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 bg-emerald-400 rounded-full border border-white shrink-0 animate-pulse"></span>
          <div>
            <p class="text-xs font-bold leading-tight">Asistente Médico</p>
            <p class="text-[9px] text-blue-100/90 leading-none">Responde tus dudas</p>
          </div>
        </div>
        <button onclick="toggleChatbot()" class="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <!-- Suggestion Bar -->
      <div class="bg-gray-50 border-b border-gray-100 p-2 flex gap-1.5 overflow-x-auto scrollbar-none">
        ${data.faqs.slice(0, 3).map((faq) => `
          <button onclick="sendChatbotMessage('${faq.pregunta.replace(/'/g, "\\'")}')" class="text-[9px] font-bold px-2.5 py-1 rounded-full bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 shrink-0 max-w-[130px] truncate transition-colors">
            ${faq.pregunta}
          </button>
        `).join('')}
      </div>

      <!-- Messages Body -->
      <div id="chatbot-messages" class="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50/50">
        <div class="flex flex-col max-w-[85%] mr-auto items-start">
          <div class="p-3 rounded-2xl text-[11px] leading-relaxed bg-white text-gray-800 border border-gray-100 rounded-tl-none shadow-xs">
            ¡Hola! Soy el asistente virtual de la consulta del ${data.nombreMedico}. ¿Tienes alguna duda sobre nuestros servicios, horarios o cómo agendar tu cita?
          </div>
        </div>
      </div>

      <!-- Input Form -->
      <form id="chatbot-form" onsubmit="handleChatbotSubmit(event)" class="p-2.5 bg-white border-t border-gray-100 flex gap-1.5">
        <input id="chatbot-input" type="text" placeholder="Haz una pregunta clínica..." class="flex-1 border border-gray-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-clinical-600" autocomplete="off" />
        <button type="submit" class="p-2 rounded-xl text-white bg-clinical-600 hover:bg-clinical-700 active:scale-95 transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9-2-9-18-9 18 9-2zm0 0v-8" /></svg>
        </button>
      </form>
    </div>
  </div>

  <!-- SCRIPTING (Interacciones Fluidas y Vanilla JS) -->
  <script>
    // 1. Registro del Service Worker para PWA (Estrategia Offline-first)
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
          .then(reg => console.log('Service Worker registrado correctamente.', reg.scope))
          .catch(err => console.error('Fallo en el registro del Service Worker:', err));
      });
    }

    // 2. Acordeón Interactivo de FAQs con atributos ARIA para Accesibilidad
    function toggleFaq(index) {
      const answerElement = document.getElementById('faq-answer-' + index);
      const iconElement = document.getElementById('faq-icon-' + index);
      const buttonElement = answerElement.previousElementSibling;
      const isExpanded = buttonElement.getAttribute('aria-expanded') === 'true';

      if (isExpanded) {
        // Colapsar
        answerElement.classList.add('hidden');
        buttonElement.setAttribute('aria-expanded', 'false');
        answerElement.setAttribute('aria-hidden', 'true');
        iconElement.classList.remove('rotate-180');
      } else {
        // Expandir
        answerElement.classList.remove('hidden');
        buttonElement.setAttribute('aria-expanded', 'true');
        answerElement.setAttribute('aria-hidden', 'false');
        iconElement.classList.add('rotate-180');
      }
    }

    // 4. Modal de Blog Médico
    const blogPostsData = ${JSON.stringify(data.blogPosts || [])};
    
    function openBlogModal(index) {
      const post = blogPostsData[index];
      if (!post) return;
      
      document.getElementById('modal-blog-img').src = post.imagenUrl;
      document.getElementById('modal-blog-img').alt = post.titulo;
      document.getElementById('modal-blog-category').innerText = post.categoria;
      document.getElementById('modal-blog-date').innerText = post.fecha;
      document.getElementById('modal-blog-time').innerText = post.tiempoLectura;
      document.getElementById('modal-blog-title').innerText = post.titulo;
      document.getElementById('modal-blog-content').innerHTML = post.contenido;
      
      const modal = document.getElementById('blog-modal');
      modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }
    
    function closeBlogModal() {
      const modal = document.getElementById('blog-modal');
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    }

    // 3. Sliders Comparativos de Antes/Después (Optimizado con requestAnimationFrame & Passive Listeners)
    document.querySelectorAll('.clinical-slider-container').forEach((slider) => {
      const beforeWrapper = slider.querySelector('.before-image-wrapper');
      const handle = slider.querySelector('.slider-handle');
      if (!beforeWrapper || !handle) return;

      let isDragging = false;
      let rafId = null;

      const updateSlider = (clientX) => {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          const rect = slider.getBoundingClientRect();
          let position = ((clientX - rect.left) / rect.width) * 100;
          
          // Mantener dentro de los límites
          if (position < 0) position = 0;
          if (position > 100) position = 100;

          beforeWrapper.style.clipPath = \`polygon(0 0, \${position}% 0, \${position}% 100%, 0 100%)\`;
          handle.style.left = \`\${position}%\`;
        });
      };

      // Eventos de Mouse
      handle.addEventListener('mousedown', () => { isDragging = true; });
      window.addEventListener('mouseup', () => { isDragging = false; });
      window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        updateSlider(e.clientX);
      });

      // Eventos Táctiles (Optimizados con { passive: true } para evitar bloqueo de scroll)
      handle.addEventListener('touchstart', () => { isDragging = true; }, { passive: true });
      window.addEventListener('touchend', () => { isDragging = false; }, { passive: true });
      window.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        if (e.touches.length > 0) {
          updateSlider(e.touches[0].clientX);
        }
      }, { passive: true });

      // Permitir hacer click en cualquier parte del slider
      slider.addEventListener('click', (e) => {
        if (e.target !== handle && !handle.contains(e.target)) {
          updateSlider(e.clientX);
        }
      });
    });

    // 5. Chatbot Virtual Interactivo
    const chatbotFaqs = ${JSON.stringify(data.faqs || [])};
    const medicoNombre = "${data.nombreMedico}";
    const whatsappUrl = "${data.whatsappUrl}";

    function toggleChatbot() {
      const panel = document.getElementById('chatbot-panel');
      panel.classList.toggle('hidden');
    }

    function sendChatbotMessage(text) {
      if (!text.trim()) return;

      // Agregar mensaje del usuario
      appendChatMessage('user', text);

      // Procesar respuesta del bot con retraso realista
      setTimeout(() => {
        const query = text.toLowerCase().trim();
        let match = chatbotFaqs.find(faq => {
          const question = faq.pregunta.toLowerCase();
          if (question.includes(query) || query.includes(question)) return true;
          
          // Coincidencia de palabras clave
          const queryWords = query.split(/\s+/).filter(w => w.length > 3);
          if (queryWords.length > 0) {
            const matchedCount = queryWords.filter(word => question.includes(word)).length;
            if (matchedCount >= Math.min(2, queryWords.length)) return true;
          }
          return false;
        });

        if (match) {
          appendChatMessage('bot', match.respuesta);
        } else {
          const fallbackText = "Entiendo tu consulta. No tengo una respuesta exacta registrada en este momento, pero puedes agendar una cita de valoración o escribirnos directamente por WhatsApp.";
          const actions = [
            { label: "Agendar Cita", url: "#agendar", type: "agenda" },
            { label: "Enviar WhatsApp", url: whatsappUrl, type: "whatsapp" }
          ];
          appendChatMessage('bot', fallbackText, actions);
        }
      }, 500);
    }

    function handleChatbotSubmit(event) {
      event.preventDefault();
      const input = document.getElementById('chatbot-input');
      const text = input.value;
      if (!text.trim()) return;
      sendChatbotMessage(text);
      input.value = '';
    }

    function appendChatMessage(sender, text, actions = null) {
      const container = document.getElementById('chatbot-messages');
      const msgDiv = document.createElement('div');
      msgDiv.className = 'flex flex-col max-w-[85%] ' + (sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start');

      let html = '<div class="p-3 rounded-2xl text-[11px] leading-relaxed ' +
        (sender === 'user'
          ? 'bg-clinical-600 text-white rounded-tr-none shadow-sm'
          : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none shadow-xs') +
        '">' + text + '</div>';

      if (actions) {
        html += '<div class="flex flex-col gap-1 w-full mt-1.5">';
        actions.forEach(function(act) {
          const isWhatsapp = act.type === 'whatsapp';
          const classes = isWhatsapp 
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
            : 'bg-clinical-50 text-clinical-700 border-clinical-100 hover:bg-clinical-100';
          
          const clickAttr = act.url.startsWith('#') ? 'onclick="toggleChatbot()"' : 'target="_blank"';
          
          html += '<a href="' + act.url + '" ' + clickAttr + ' class="text-[10px] font-bold py-1.5 px-2.5 rounded-lg border text-center flex items-center justify-center gap-1 transition-all ' + classes + '">';
          if (isWhatsapp) {
            html += '<svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.717-1.454L0 24zm6.59-2.635c1.6.95 3.51 1.45 5.4 1.45 5.86 0 10.63-4.77 10.63-10.63 0-2.84-1.1-5.51-3.11-7.51a10.522 10.522 0 00-7.52-3.12c-5.87 0-10.64 4.77-10.64 10.64 0 2.05.54 4.05 1.56 5.81L1.92 22.2l4.727-1.242c1.7.93 3.59 1.41 5.4 1.41z" /></svg>';
          } else {
            html += '<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>';
          }
          html += ' ' + act.label + '</a>';
        });
        html += '</div>';
      }

      msgDiv.innerHTML = html;
      container.appendChild(msgDiv);
      container.scrollTop = container.scrollHeight;
    }

    // 6. Formulario de Selección de Fecha de Cita y WhatsApp Dinámico
    (function initAppointmentForm() {
      const dateInput = document.getElementById('agenda-date');
      const timeSelect = document.getElementById('agenda-time');
      const nameInput = document.getElementById('agenda-name');
      const whatsappBtn = document.getElementById('agenda-whatsapp-btn');

      if (!dateInput || !whatsappBtn) return;

      // Configurar fecha mínima como hoy
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const yyyy = tomorrow.getFullYear();
      const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
      const dd = String(tomorrow.getDate()).padStart(2, '0');
      const tomorrowStr = yyyy + '-' + mm + '-' + dd;
      
      dateInput.min = today.toISOString().split('T')[0];
      dateInput.value = tomorrowStr;

      const rawWhatsappBase = "${data.whatsappUrl || 'https://wa.me/593991234567'}".split('?')[0];
      const medicoName = ${JSON.stringify(data.nombreMedico || '')};
      const especialidadName = ${JSON.stringify(data.especialidad || '')};
      const ciudadName = ${JSON.stringify(data.ciudad || '')};
      const clinicaName = ${JSON.stringify(data.nombreClinicaGBP || '')};
      const plantillaMsg = ${JSON.stringify(data.whatsappMensajePlantilla || "Hola Dr(a). {{medico}}, deseo agendar una consulta médica de {{especialidad}} para el día {{fecha}} a las {{hora}}.{{nombre}} Por favor me confirma disponibilidad.")};

      function updateWhatsAppLink() {
        const valDate = dateInput.value;
        const valTime = timeSelect ? timeSelect.value : '10:30 AM';
        const valName = nameInput && nameInput.value.trim() ? ' Mi nombre es ' + nameInput.value.trim() + '.' : '';

        let fechaTexto = 'los próximos días';
        if (valDate) {
          try {
            const parts = valDate.split('-');
            if (parts.length === 3) {
              const dObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
              fechaTexto = dObj.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            }
          } catch(e) {
            fechaTexto = valDate;
          }
        }

        let msg = plantillaMsg;
        // Reemplazar marcadores dinámicos
        msg = msg.replace(/\{\{medico\}\}/gi, medicoName)
                 .replace(/\{\{especialidad\}\}/gi, especialidadName)
                 .replace(/\{\{ciudad\}\}/gi, ciudadName)
                 .replace(/\{\{clinica\}\}/gi, clinicaName)
                 .replace(/\{\{fecha\}\}/gi, fechaTexto)
                 .replace(/\{\{hora\}\}/gi, valTime)
                 .replace(/\{\{nombre\}\}/gi, valName);

        // Fallback si la plantilla no incluía tags
        if (valName && !plantillaMsg.includes('{{nombre}}') && !msg.includes(valName)) {
          msg += valName;
        }

        whatsappBtn.href = rawWhatsappBase + '?text=' + encodeURIComponent(msg);
      }

      dateInput.addEventListener('change', updateWhatsAppLink);
      if (timeSelect) timeSelect.addEventListener('change', updateWhatsAppLink);
      if (nameInput) nameInput.addEventListener('input', updateWhatsAppLink);

      updateWhatsAppLink();
    })();

    // 7. Horarios de Atención Dinámicos (Abierto / Cerrado en tiempo real)
    (function initLiveSchedule() {
      const horariosConfig = ${JSON.stringify(data.horarios)};

      function parseRange(str) {
        if (!str) return { opens: 0, closes: 0, isClosed: true };
        const s = str.toLowerCase();
        if (s.includes('cerrado') || s.includes('no atiende')) {
          return { opens: 0, closes: 0, isClosed: true };
        }
        const m = str.match(/(\d{1,2}:\d{2})/g);
        if (m && m.length >= 2) {
          const p1 = m[0].split(':').map(Number);
          const p2 = m[1].split(':').map(Number);
          return { opens: p1[0] * 60 + p1[1], closes: p2[0] * 60 + p2[1], isClosed: false, opensText: m[0], closesText: m[1] };
        }
        return { opens: 9 * 60, closes: 18 * 60, isClosed: false, opensText: '09:00', closesText: '18:00' };
      }

      function evaluateStatus() {
        const now = new Date();
        const day = now.getDay(); // 0 = Dom, 1-5 = Lun-Vie, 6 = Sab
        const currentMins = now.getHours() * 60 + now.getMinutes();

        let dayText = '';
        let rowId = '';
        if (day >= 1 && day <= 5) {
          dayText = horariosConfig.semana || '09:00 - 18:00';
          rowId = 'sch-semana';
        } else if (day === 6) {
          dayText = horariosConfig.sabado || '09:00 - 14:00';
          rowId = 'sch-sabado';
        } else {
          dayText = horariosConfig.domingo || 'Cerrado';
          rowId = 'sch-domingo';
        }

        // Resaltar día actual en la lista
        ['sch-semana', 'sch-sabado', 'sch-domingo'].forEach(id => {
          const el = document.getElementById(id);
          if (el) {
            if (id === rowId) {
              el.classList.add('bg-clinical-50/80', 'px-2', 'rounded-lg', 'font-extrabold', 'text-clinical-900');
            } else {
              el.classList.remove('bg-clinical-50/80', 'px-2', 'rounded-lg', 'font-extrabold', 'text-clinical-900');
            }
          }
        });

        const parsed = parseRange(dayText);
        let badgeText = 'Cerrado hoy';
        let badgeDetail = 'Horarios presenciales';
        let color = 'slate';

        if (parsed.isClosed) {
          badgeText = 'Cerrado hoy';
          badgeDetail = 'Próxima atención: Lunes 09:00';
          color = 'slate';
        } else if (currentMins >= parsed.opens && currentMins < parsed.closes) {
          if (parsed.closes - currentMins <= 45) {
            badgeText = 'Abierto ahora';
            badgeDetail = 'Cierra pronto (' + parsed.closesText + ')';
            color = 'amber';
          } else {
            badgeText = 'Atendiendo ahora';
            badgeDetail = 'Abierto hoy hasta las ' + parsed.closesText;
            color = 'emerald';
          }
        } else if (currentMins < parsed.opens) {
          badgeText = 'Abre hoy';
          badgeDetail = 'Atención desde las ' + parsed.opensText;
          color = 'amber';
        } else {
          badgeText = 'Cerrado por hoy';
          badgeDetail = 'Horario regular hasta las ' + parsed.closesText;
          color = 'slate';
        }

        // Actualizar Hero Badge
        const heroText = document.getElementById('hero-status-text');
        const heroDetail = document.getElementById('hero-status-detail');
        const heroDot = document.getElementById('hero-status-dot');
        const heroPing = document.getElementById('hero-status-ping');

        if (heroText) heroText.textContent = badgeText;
        if (heroDetail) heroDetail.textContent = badgeDetail;
        if (heroDot) {
          heroDot.className = 'relative inline-flex rounded-full h-2.5 w-2.5 ' + (color === 'emerald' ? 'bg-emerald-500' : color === 'amber' ? 'bg-amber-500' : 'bg-slate-400');
        }
        if (heroPing) {
          heroPing.className = 'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ' + (color === 'emerald' ? 'bg-emerald-400' : color === 'amber' ? 'bg-amber-400' : 'bg-slate-300');
        }

        // Actualizar Location Badge
        const locText = document.getElementById('loc-status-text');
        const locDot = document.getElementById('loc-status-dot');
        const locPill = document.getElementById('loc-status-pill');

        if (locText) locText.textContent = badgeText;
        if (locDot) {
          locDot.className = 'w-2 h-2 rounded-full ' + (color === 'emerald' ? 'bg-emerald-500 animate-pulse' : color === 'amber' ? 'bg-amber-500' : 'bg-slate-400');
        }
        if (locPill) {
          locPill.className = 'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ' + 
            (color === 'emerald' ? 'bg-emerald-100 text-emerald-800' : color === 'amber' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700');
        }
      }

      evaluateStatus();
      // Reevaluar automáticamente cada 30 minutos según la hora del dispositivo del paciente
      setInterval(evaluateStatus, 30 * 60 * 1000);
    })();

  </script>
</body>
</html>`;
}

/**
 * Genera el manifest.json personalizado
 */
export function generateManifestJson(data: MedicalLandingData): string {
  const manifest = {
    "short_name": data.especialidad.slice(0, 12),
    "name": `${data.nombreMedico} | ${data.especialidad}`,
    "description": data.filosofia,
    "icons": [
      {
        "src": "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=192&auto=format&fit=crop",
        "type": "image/png",
        "sizes": "192x192",
        "purpose": "any maskable"
      },
      {
        "src": "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=512&auto=format&fit=crop",
        "type": "image/png",
        "sizes": "512x512",
        "purpose": "any maskable"
      }
    ],
    "start_url": "/",
    "background_color": "#ffffff",
    "display": "standalone",
    "theme_color": "#1e6fd9",
    "orientation": "portrait-primary"
  };

  return JSON.stringify(manifest, null, 2);
}

/**
 * Genera el service-worker.js offline-first
 */
export function generateServiceWorkerJs(data: MedicalLandingData): string {
  return `/**
 * Service Worker de la Landing Page de ${data.nombreMedico}
 * Estrategia: Offline-first con cacheo inteligente y base para recordatorios Push.
 */

const CACHE_NAME = 'med-landing-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;1,400&display=swap'
];

// 1. Instalación del Service Worker e inicio del cacheo
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Abriendo caché médica e incorporando recursos estáticos...');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// 2. Activación del Service Worker y limpieza de cachés antiguas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Eliminando caché médica antigua obsoleta:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Estrategia de Fetch: Cache Falling Back to Network (Offline-First)
self.addEventListener('fetch', (event) => {
  // Omitir peticiones externas no seguras o de esquemas que no sean HTTP/HTTPS (como chrome-extension, etc.)
  if (!event.request.url.startsWith(self.location.origin) && !event.request.url.startsWith('https://')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // Devolver el recurso cacheado si existe
          return cachedResponse;
        }

        // Si no está en caché, realizar la petición de red
        return fetch(event.request).then((response) => {
          // Verificar respuesta válida antes de cachear
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clonar respuesta y guardar en caché para futuras visitas offline
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        }).catch(() => {
          // Fallback offline en caso de fallo absoluto de red (pág index)
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
      })
  );
});

// 4. Base para recibir Notificaciones Push de Recordatorios de Citas
self.addEventListener('push', (event) => {
  let notificationData = {
    title: 'Recordatorio de Consulta Médica',
    body: 'Mañana tienes una consulta programada. Haz clic para ver detalles y ubicación.',
    icon: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=192&auto=format&fit=crop',
    badge: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=96&auto=format&fit=crop'
  };

  if (event.data) {
    try {
      const dataText = event.data.text();
      notificationData = JSON.parse(dataText);
    } catch (e) {
      notificationData.body = event.data.text();
    }
  }

  const options = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    },
    actions: [
      { action: 'explore', title: 'Ver Ubicación', icon: '' },
      { action: 'close', title: 'Cerrar', icon: '' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );
});

// Manejo del click en las notificaciones
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    // Abrir la landing page en la sección de agendar/ubicación
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((windowClients) => {
        for (var i = 0; i < windowClients.length; i++) {
          var client = windowClients[i];
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/#agendar');
        }
      })
    );
  }
});
`;
}
