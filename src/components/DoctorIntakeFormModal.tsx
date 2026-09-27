/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  FileText, 
  X, 
  Copy, 
  Check, 
  Download, 
  Printer, 
  MessageSquare, 
  Mail, 
  Sparkles, 
  User, 
  MapPin, 
  Stethoscope, 
  Share2, 
  Image as ImageIcon, 
  ShieldCheck, 
  ArrowRight,
  ClipboardList
} from "lucide-react";

interface DoctorIntakeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAiIngestion?: () => void;
  isClinica?: boolean;
}

export function DoctorIntakeFormModal({
  isOpen,
  onClose,
  onOpenAiIngestion,
  isClinica = false
}: DoctorIntakeFormModalProps) {
  const [activeFormat, setActiveFormat] = useState<"whatsapp" | "email" | "document">("whatsapp");
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  if (!isOpen) return null;

  // 1. Plantilla optimizada para WhatsApp
  const whatsappTemplate = isClinica 
    ? `*FORMULARIO DE TOMA DE DATOS PARA TU LANDING PAGE DE CENTRO MÉDICO* 🏥✨

¡Hola! 👋 Para construir el sitio web profesional de su Centro Médico / Clínica, optimizado para posicionamiento en Google (SEO Local en Ecuador) y agendamiento directo de pacientes, por favor responda las siguientes preguntas con la información institucional de su centro:

*1. PERFIL INSTITUCIONAL DEL CENTRO MÉDICO Y DIRECCIÓN CLÍNICA (E-E-A-T)* 🏢
• Nombre comercial de la Clínica o Centro Médico:
• Director(a) Médico(a) o Representante Clínico (Nombre completo, especialidad y registro SENESCYT/MSP):
• Especialidades médicas y departamentos clínicos del centro (ej. Cardiología, Pediatría, Traumatología, Cirugía, Laboratorio, etc.):
• Permiso de Funcionamiento MSP / Código de Habilitación Sanitaria ACESS (Ecuador):
• Registro SENESCYT de la Dirección Médica o Acreditación Sanitaria Institucional:
• Universidades y centros hospitalarios de formación del staff médico principal:
• Años de trayectoria del centro médico en Ecuador:
• Misión del Centro Médico (Propósito de servicio y compromiso con la salud):
• Visión Institucional (Proyección a futuro y liderazgo clínico):
• Valores Fundamentales de la clínica (ej. Calidez Humana, Ética, Innovación, Rigor Científico):
• Reseña institucional, infraestructura, quirófanos, salas de recuperación y tecnología disponible (2-3 párrafos):

*2. UBICACIÓN, CONTACTO Y AGENDA LOCAL* 📍
• Nombre de la sede, edificio o campus médico (si aplica):
• Dirección exacta (Edificio, piso, números de salas / consultorios, calles principales y secundarias):
• Ciudad y Provincia (Ecuador):
• Teléfono fijo de la recepción o central telefónica:
• WhatsApp exclusivo para agendamiento de citas de pacientes:
• Correo electrónico institucional de contacto para pacientes:
• Horarios de atención (Lunes-Viernes, Sábados, Domingos y si dispone de urgencias o emergencias 24/7):
• Dominio web personalizado deseado (ej. clinicasantacruz.ec / centromedico.com):
• Enlace a Ficha de Google Business Profile / Google Maps (para integrar mapa de ubicación):

*3. CATÁLOGO DE SERVICIOS Y PROCEDIMIENTOS PRINCIPALES (8 a 12 servicios clave)* 🩺
Por favor detalle de 8 a 12 de sus principales servicios, tratamientos, cirugías o exámenes de diagnóstico. Es fundamental indicar el *tiempo estimado del procedimiento (duración)* y el *tiempo de recuperación postoperatoria o reposo*:
- Servicio 1: [Nombre del servicio o procedimiento] | [Especialidad o Departamento] | [Descripción y beneficios clínicos] | [Precio o rango tarifario aprox ($ USD)] | [Tiempo del procedimiento (duración)] | [Recuperación postoperatoria / reposo] | [Modalidad: Ambulatorio en consultorio / Quirófano / Hospitalización] | [Aplica Reembolso Seguro SRI: Sí/No] | [Distintivo ej. "Más Solicitado"]
- Servicio 2: [Nombre del servicio o procedimiento] | [Especialidad o Departamento] | [Descripción y beneficios clínicos] | [Precio o rango tarifario aprox ($ USD)] | [Tiempo del procedimiento (duración)] | [Recuperación postoperatoria / reposo] | [Modalidad: Ambulatorio en consultorio / Quirófano / Hospitalización] | [Aplica Reembolso Seguro SRI: Sí/No] | [Distintivo ej. "Tecnología Avanzada"]
- Servicio 3: [Nombre del servicio o procedimiento] | [Especialidad o Departamento] | [Descripción y beneficios clínicos] | [Precio o rango tarifario aprox ($ USD)] | [Tiempo del procedimiento (duración)] | [Recuperación postoperatoria / reposo] | [Modalidad: Ambulatorio en consultorio / Quirófano / Hospitalización] | [Aplica Reembolso Seguro SRI: Sí/No] | [Distintivo ej. "Procedimiento de Un Día"]
- Servicio 4: [Nombre del servicio o procedimiento] | [Especialidad o Departamento] | [Descripción y beneficios clínicos] | [Precio o rango tarifario aprox ($ USD)] | [Tiempo del procedimiento (duración)] | [Recuperación postoperatoria / reposo] | [Modalidad: Ambulatorio en consultorio / Quirófano / Hospitalización] | [Aplica Reembolso Seguro SRI: Sí/No] | [Distintivo ej. "Chequeo Preventivo"]
- Servicio 5: [Nombre del servicio o procedimiento] | [Especialidad o Departamento] | [Descripción y beneficios clínicos] | [Precio o rango tarifario aprox ($ USD)] | [Tiempo del procedimiento (duración)] | [Recuperación postoperatoria / reposo] | [Modalidad] | [Aplica Reembolso SRI: Sí/No] | [Distintivo]
- Servicio 6: [Nombre del servicio o procedimiento] | [Especialidad o Departamento] | [Descripción y beneficios clínicos] | [Precio o rango tarifario aprox ($ USD)] | [Tiempo del procedimiento (duración)] | [Recuperación postoperatoria / reposo] | [Modalidad] | [Aplica Reembolso SRI: Sí/No] | [Distintivo]
- Servicio 7: [Nombre del servicio o procedimiento] | [Especialidad o Departamento] | [Descripción y beneficios clínicos] | [Precio o rango tarifario aprox ($ USD)] | [Tiempo del procedimiento (duración)] | [Recuperación postoperatoria / reposo] | [Modalidad] | [Aplica Reembolso SRI: Sí/No] | [Distintivo]
- Servicio 8: [Nombre del servicio o procedimiento] | [Especialidad o Departamento] | [Descripción y beneficios clínicos] | [Precio o rango tarifario aprox ($ USD)] | [Tiempo del procedimiento (duración)] | [Recuperación postoperatoria / reposo] | [Modalidad] | [Aplica Reembolso SRI: Sí/No] | [Distintivo]
_(Puede continuar la lista hasta completar 12 servicios)_

*4. CONSULTAS VIRTUALES Y TELEMEDICINA INSTITUCIONAL* 💻
• ¿Dispone de atención por Telemedicina con sus especialistas?: [Sí / No]
• Valor referencial de la teleconsulta ($ USD):
• Plataformas que utilizan (Zoom, Google Meet, WhatsApp Video):
• Requisitos para el paciente (conexión a internet, exámenes o historias previas digitales en PDF o fotos):
• Beneficios incluidos (Receta Médica Digital con firma electrónica oficial, órdenes de exámenes y laboratorio en PDF):

*5. PREGUNTAS FRECUENTES (FAQs) Y DUDAS HABITUALES DE PACIENTES* ❓
💡 *Nota importante:* Las preguntas a continuación son consultas habituales de referencia. Sin embargo, para brindar la máxima tranquilidad a sus futuros pacientes y potenciar el posicionamiento web, *le solicitamos que nos ayuden completando al menos 8 preguntas frecuentes (con sus respectivas respuestas)* que más le formulen sus pacientes a diario en recepción o consulta (sobre síntomas, preparación previa, costos, tiempos de recuperación postoperatoria, cobertura de seguros privados o agendamiento de citas):
- Pregunta 1: ¿Cómo funciona el convenio o trámite de reembolso con seguros médicos privados en la clínica?
  Respuesta 1: 
- Pregunta 2: ¿Qué preparación previa, ayuno o requisitos se necesitan para los exámenes de laboratorio o imagen?
  Respuesta 2: 
- Pregunta 3: ¿Cómo agendar o solicitar una cita médica con un especialista de manera ágil por WhatsApp o teléfono?
  Respuesta 3: 
- Pregunta 4: ¿Cuáles son las formas de pago aceptadas y entregan factura electrónica autorizada por el SRI?
  Respuesta 4: 
- Pregunta 5: ¿Cuáles son los tiempos estimados de recuperación postoperatoria o reposo para los procedimientos de la clínica?
  Respuesta 5: 
- Pregunta 6: ¿Qué documentos o estudios médicos previos debe presentar el paciente el día de su valoración?
  Respuesta 6: 
- Pregunta 7: [Escriba aquí la séptima pregunta frecuente habitual de sus pacientes]
  Respuesta 7: 
- Pregunta 8: [Escriba aquí la octava pregunta frecuente habitual de sus pacientes]
  Respuesta 8: 
_(Si desea agregar más preguntas frecuentes, puede continuar enumerándolas)_

*6. REDES SOCIALES, VIDEOS Y CANALES DIGITALES* 📱
• Instagram (@usuario o enlace):
• Facebook:
• TikTok:
• YouTube / LinkedIn:
• Enlaces a Reels, videos institucionales o educativos destacados (Instagram Reels, TikToks, Shorts):
• Enlace a perfiles en directorios médicos o Ficha de Google Maps:

*7. CONVENIOS, ASEGURADORAS, HOSPITALES Y SOCIEDADES (E-E-A-T)* 🛡️
• Aseguradoras privadas aliadas para reembolso o convenio directo (ej. Saludsa, Humana, Ecuasanitas, Confiamed, BMI, Bupa, etc.):
• ¿Entregan Factura Electrónica SRI oficial y Formulario de Reclamo Médico firmado con código CIE-10?: [Sí / No]
• Hospitales de referencia, clínicas aliadas o convenios interinstitucionales de tercer nivel:
• Sociedades médicas, colegios profesionales o asociaciones a las que pertenece el centro médico o su staff:
• Acreditaciones sanitarias, certificaciones de calidad o programas de actualización médica continua del personal:
• Premios, distinciones institucionales o reconocimientos a la calidad médica y servicio clínico:

*8. VALOR DE CONSULTAS Y MÉTODOS DE PAGO* 💳
• Costo promedio de consultas médicas de especialidad y telemedicina:
• Métodos de pago aceptados en caja y recepción (Efectivo, Transferencia Banco Pichincha/Guayaquil/Produbanco, Tarjetas de Crédito/Débito, Deuna, Facturación SRI):

*9. PREFERENCIAS DE IDENTIDAD VISUAL Y COLORES* 🎨
• Paleta de color preferida para la web institucional (Azul Clínico, Verde Salud, Turquesa/Teal, Índigo Moderno, etc.):
• Estilo deseado (Institucional moderno, Profesional sobrio, Tecnológico de vanguardia, Cálido y humanitario):

*10. RECURSOS EDUCATIVOS, GUÍAS Y PREPARATIVOS DE EXÁMENES (Material Digital)* 📚
⚠️ *Nota de omisión:* Si en este momento no cuenta con material digital (guías en PDF, ebooks, fichas imprimibles) para compartir o vender a sus pacientes, *puede omitir llenar esta información sin ningún inconveniente.*
• Título de Guías, Fichas de Preparación o Folletos del Centro (ej. "Preparación para Exámenes de Laboratorio e Imagen", "Guía de Cuidados Postoperatorios"):
• Formato preferido (PDF, Ficha Imprimible, Checklist, Ebook):
• Método de entrega preferido (Descarga Directa en web, Envío por WhatsApp o Email):

*11. MATERIAL MULTIMEDIA REQUERIDO* 📸
• Logotipo institucional del centro médico (PNG transparente de alta resolución).
• Fotos de las instalaciones del centro (fachada, recepción, salas de espera, consultorios, quirófanos, equipos médicos y tecnología: 5 a 10 imágenes).
• Fotos del equipo médico, directores o especialistas del staff (opcional).
• Portadas o documentos de guías descargables (si dispone de material).

---
*Instrucciones:* Puede responder directamente este mensaje, enviar una nota de voz o adjuntar un documento con la información. ¡Procesaremos los datos para generar su Landing Page automáticamente en minutos! 🚀`
    : `*FORMULARIO DE TOMA DE DATOS PARA TU LANDING PAGE MÉDICA* 🩺✨

¡Hola Doctor(a)! 👋 Para construir su sitio web médico profesional, optimizado para posicionamiento en Google (SEO Local en Ecuador) y agendamiento directo de pacientes, por favor responda las siguientes preguntas con la información de su consulta:

*1. DATOS PERSONALES, REGISTRO PROFESIONAL Y AVALES (E-E-A-T)* 👤
• Nombre completo con Título (Dr./Dra.):
• Especialidad médica / Subespecialidad:
• Registro MSP / Código de Habilitación Sanitaria ACESS (Ecuador):
• Registro de Título SENESCYT:
• Universidad de graduación (Pregrado y Posgrado / Residencia):
• Años de experiencia clínica:
• Misión Profesional (Propósito de su práctica médica):
• Visión Profesional (A dónde proyecta su práctica médica):
• Valores de atención (ej. Ética, Calidez Humana, Rigor Científico):
• Breve biografía o filosofía de atención al paciente (2-3 párrafos):

*2. UBICACIÓN, CONSULTORIO Y AGENDA LOCAL* 🏥
• Nombre de la Clínica, Edificio o Consultorio donde atiende:
• Dirección exacta (Edificio, piso, número de consultorio, calles):
• Ciudad y Provincia (Ecuador):
• Teléfono fijo del consultorio:
• WhatsApp exclusivo para citas de pacientes:
• Correo electrónico de contacto:
• Horarios de atención (Lunes-Viernes, Sábados, Domingos):
• Dominio web personalizado deseado (ej. drmedico.ec / drjuanperez.com):
• Enlace a Ficha de Google Business Profile / Google Maps:

*3. SERVICIOS Y PROCEDIMIENTOS CLAVE (8 a 12 servicios principales)* 🩺
Por favor detalle de 8 a 12 de sus principales consultas, tratamientos o procedimientos quirúrgicos. Es indispensable incluir el *tiempo estimado del procedimiento (duración)* y el *tiempo de recuperación postoperatoria o reposo*:
- Servicio 1: [Nombre del procedimiento] | [Breve descripción y beneficios] | [Precio aprox ($ USD)] | [Tiempo del procedimiento (duración)] | [Recuperación postoperatoria / reposo] | [Modalidad: En consultorio / Quirófano] | [Aplica Reembolso Seguro SRI: Sí/No] | [Distintivo ej. "Más Solicitado"]
- Servicio 2: [Nombre del procedimiento] | [Breve descripción y beneficios] | [Precio aprox ($ USD)] | [Tiempo del procedimiento (duración)] | [Recuperación postoperatoria / reposo] | [Modalidad: En consultorio / Quirófano] | [Aplica Reembolso Seguro SRI: Sí/No] | [Distintivo ej. "Técnica Mínimamente Invasiva"]
- Servicio 3: [Nombre del procedimiento] | [Breve descripción y beneficios] | [Precio aprox ($ USD)] | [Tiempo del procedimiento (duración)] | [Recuperación postoperatoria / reposo] | [Modalidad: En consultorio / Quirófano] | [Aplica Reembolso Seguro SRI: Sí/No] | [Distintivo ej. "Procedimiento Ambulatorio"]
- Servicio 4: [Nombre del procedimiento] | [Breve descripción y beneficios] | [Precio aprox ($ USD)] | [Tiempo del procedimiento (duración)] | [Recuperación postoperatoria / reposo] | [Modalidad: En consultorio / Quirófano] | [Aplica Reembolso Seguro SRI: Sí/No] | [Distintivo ej. "Diagnóstico de Alta Precisión"]
- Servicio 5: [Nombre del procedimiento] | [Breve descripción y beneficios] | [Precio aprox ($ USD)] | [Tiempo del procedimiento (duración)] | [Recuperación postoperatoria / reposo] | [Modalidad] | [Aplica Reembolso SRI: Sí/No] | [Distintivo]
- Servicio 6: [Nombre del procedimiento] | [Breve descripción y beneficios] | [Precio aprox ($ USD)] | [Tiempo del procedimiento (duración)] | [Recuperación postoperatoria / reposo] | [Modalidad] | [Aplica Reembolso SRI: Sí/No] | [Distintivo]
- Servicio 7: [Nombre del procedimiento] | [Breve descripción y beneficios] | [Precio aprox ($ USD)] | [Tiempo del procedimiento (duración)] | [Recuperación postoperatoria / reposo] | [Modalidad] | [Aplica Reembolso SRI: Sí/No] | [Distintivo]
- Servicio 8: [Nombre del procedimiento] | [Breve descripción y beneficios] | [Precio aprox ($ USD)] | [Tiempo del procedimiento (duración)] | [Recuperación postoperatoria / reposo] | [Modalidad] | [Aplica Reembolso SRI: Sí/No] | [Distintivo]
_(Puede continuar la lista hasta completar 12 servicios)_

*4. MODALIDAD DE ATENCIÓN VIRTUAL & TELECONSULTA (Si aplica)* 💻
• ¿Ofrece telemedicina / consultas online para pacientes de otras provincias o el exterior?: [Sí / No]
• Valor de la teleconsulta ($ USD):
• Plataformas utilizadas (Zoom, Google Meet, WhatsApp Video):
• Requisitos para el paciente (conexión a internet, exámenes o historias previas digitales en PDF o fotos):
• Beneficios incluidos (Receta Médica Digital con firma electrónica oficial, órdenes de exámenes y laboratorio en PDF):

*5. PREGUNTAS FRECUENTES (FAQs) Y DUDAS HABITUALES DE PACIENTES* ❓
💡 *Nota importante:* Las preguntas a continuación son consultas habituales de referencia. Sin embargo, para brindar la máxima tranquilidad a sus futuros pacientes y potenciar el posicionamiento web, *le solicitamos que nos ayuden completando al menos 8 preguntas frecuentes (con sus respectivas respuestas)* que más le formulen sus pacientes a diario en su consulta (sobre síntomas, preparación previa, costos, tiempos de recuperación postoperatoria, cobertura de seguros o agendamiento):
- Pregunta 1: ¿Cómo tramito el reembolso de la consulta o procedimiento con mi seguro médico privado (Saludsa, Humana, BMI, Confiamed)?
  Respuesta 1: 
- Pregunta 2: ¿Qué documentos o exámenes previos debo llevar a mi primera cita de valoración?
  Respuesta 2: 
- Pregunta 3: ¿Se requiere preparación previa, ayuno o indicaciones especiales antes de la valoración o tratamiento?
  Respuesta 3: 
- Pregunta 4: ¿Cuáles son los tiempos estimados de recuperación postoperatoria o reposo para los tratamientos principales?
  Respuesta 4: 
- Pregunta 5: ¿Cómo agendar o reprogramar una cita de manera ágil por WhatsApp?
  Respuesta 5: 
- Pregunta 6: ¿Cuáles son las formas de pago aceptadas y entregan factura electrónica autorizada por el SRI?
  Respuesta 6: 
- Pregunta 7: [Escriba aquí la séptima pregunta frecuente habitual de sus pacientes]
  Respuesta 7: 
- Pregunta 8: [Escriba aquí la octava pregunta frecuente habitual de sus pacientes]
  Respuesta 8: 
_(Si desea agregar más preguntas frecuentes, puede continuar enumerándolas)_

*6. REDES SOCIALES, VIDEOS Y CONTENIDO DIGITAL* 📱
• Instagram (@usuario o enlace):
• Facebook:
• TikTok:
• YouTube / LinkedIn:
• Enlaces a Reels o videos educativos destacados (Instagram Reels, TikToks, Shorts):
• Enlace a perfil de Doctoralia, TopDoctors o Ficha de Google Maps:

*7. CONVENIOS, ASEGURADORAS, HOSPITALES Y SOCIEDADES (E-E-A-T)* 🛡️
• Aseguradoras privadas aceptadas para reembolso (ej. Saludsa, Humana, Ecuasanitas, Confiamed, BMI, Bupa, etc.):
• ¿Emite Factura Electrónica SRI oficial y Formulario de Reclamo Médico firmado con código CIE-10?: [Sí / No]
• Hospitales o clínicas de 3er nivel donde opera o atiende:
• Sociedades médicas, colegios profesionales o certificaciones a las que pertenece:
• Cursos de posgrado, diplomados o certificaciones de actualización médica reciente:
• Premios, reconocimientos o distinciones académicas al mérito clínico:

*8. VALOR DE CONSULTA Y MÉTODOS DE PAGO* 💳
• Valor aproximado de la consulta médica presencial y telemedicina:
• Métodos de pago aceptados (Efectivo, Transferencia Banco Pichincha/Guayaquil/Produbanco, Tarjetas de Crédito, Deuna, Facturación SRI):

*9. PREFERENCIAS DE IDENTIDAD VISUAL Y COLORES* 🎨
• Paleta de color preferida para su web (Azul Clínico, Verde Salud, Turquesa/Teal, Índigo Moderno, etc.):
• Estilo deseado (Profesional sobrio, Moderno tecnológico, Cálido y humanitario):

*10. RECURSOS MÉDICOS, EBOOKS Y MATERIAL EDUCATIVO PARA PACIENTES (Material Digital)* 📚
⚠️ *Nota de omisión:* Si actualmente no cuenta con material digital (guías descargables en PDF, ebooks, fichas de cuidados) para compartir o vender a sus pacientes, *puede omitir llenar esta información sin ningún inconveniente.*
• Título de Guías / Ebooks / Fichas de Cuidados (ej. "Cuidados Postoperatorios en Casa", "Guía Nutricional para Pacientes"):
• Formato preferido (PDF, Ficha Imprimible, Checklist, Ebook):
• Método de entrega preferido (Descarga Directa en web, Envío por WhatsApp o Email):

*11. MATERIAL MULTIMEDIA ADJUNTO* 📸
• Foto de perfil profesional (alta resolución, formato retrato/portrait 1:1 o 3:4, fondo clínico o neutro).
• Logotipo de su consultorio o marca personal (PNG transparente si dispone).
• Fotos de sus instalaciones / consultorio / sala de espera (3 a 8 imágenes).
• Portada o documento de Guías descargables (si dispone de material).

---
*Instrucciones:* Puede responder directamente este mensaje, enviar una nota de voz o adjuntar un documento Word con la información. ¡Procesaremos los datos para generar su Landing Page automáticamente en minutos! 🚀`;

  // 2. Plantilla formal para Correo Electrónico
  const emailTemplate = isClinica 
    ? `Asunto: Formulario de Toma de Datos para Sitio Web de Centro Médico / Clínica

Estimados directivos y equipo médico,

Con el fin de desarrollar el sitio web profesional e institucional para su Centro Médico o Clínica, optimizado para posicionamiento en Google (SEO Local en Ecuador) y agendamiento directo de pacientes, les solicitamos completar los siguientes datos clínicos, institucionales y operativos:

==================================================
FORMULARIO DE INGESTA DE INFORMACIÓN DE CENTRO MÉDICO
==================================================

1. PERFIL INSTITUCIONAL DEL CENTRO MÉDICO Y DIRECCIÓN CLÍNICA (E-E-A-T)
--------------------------------------------------
- Nombre comercial de la Clínica / Centro Médico:
- Director(a) Médico(a) o Representante Clínico (Nombre completo con título, especialidad y registro SENESCYT/MSP):
- Especialidades médicas y departamentos clínicos del centro (ej. Cardiología, Pediatría, Traumatología, Cirugía, Laboratorio, etc.):
- Permiso de Funcionamiento del Ministerio de Salud Pública (MSP - Ecuador):
- Código de Habilitación Sanitaria ACESS:
- Registro SENESCYT institucional o de la Dirección Médica:
- Universidades y hospitales de formación del Staff Médico principal (Pregrado / Posgrado / Especialidades):
- Años de trayectoria del centro médico en Ecuador:
- Misión del Centro Médico (Propósito de servicio y compromiso con la salud):
- Visión Institucional (Proyección a futuro y liderazgo clínico):
- Valores Fundamentales de la clínica (ej. Calidez Humana, Ética, Innovación, Rigor Científico):
- Reseña institucional, infraestructura, quirófanos, salas de recuperación y tecnología médica disponible (2-3 párrafos):

2. UBICACIÓN, DIRECCIÓN Y CONTACTO LOCAL
--------------------------------------------------
- Nombre de la sede, edificio o campus médico (si aplica):
- Dirección exacta (Edificio, piso, números de salas / consultorios, calles principales y secundarias):
- Ciudad y Provincia (Ecuador):
- Teléfono directo de recepción o centralita telefónica:
- Teléfono celular / WhatsApp exclusivo para agendamiento de citas de pacientes:
- Correo electrónico institucional de contacto para pacientes:
- Horarios de atención habituales (Lunes a Viernes, Sábados, Domingos y si dispone de urgencias o emergencias 24/7):
- Dominio web personalizado preferido (ej. clinicasantacruz.ec / centromedico.com):
- Enlace a Ficha de Google Business Profile (Google Maps):

3. CATÁLOGO DE SERVICIOS Y PROCEDIMIENTOS PRINCIPALES (8 a 12 servicios clave)
--------------------------------------------------
Por favor liste entre 8 y 12 de sus principales servicios médicos, quirúrgicos o exámenes de diagnóstico. Es fundamental indicar el tiempo estimado del procedimiento (duración) y el tiempo de recuperación postoperatoria o reposo:

[Servicio 1]
- Título del servicio o procedimiento:
- Especialidad / Departamento clínico:
- Descripción detallada del procedimiento y beneficios para el paciente:
- Precio estimado o rango tarifario ($ USD):
- Tiempo de duración del procedimiento:
- Tiempo estimado de recuperación postoperatoria o reposo:
- Modalidad (En consultorio ambulatorio / Quirófano / Hospitalización):
- Aplica reembolso con seguros privados (Factura SRI y Formulario CIE-10): [Sí / No]
- Distintivo o Badge (ej. "Más Solicitado", "Tecnología Avanzada", "Mínimamente Invasivo"):

[Servicio 2]
- Título del servicio o procedimiento:
- Especialidad / Departamento clínico:
- Descripción detallada:
- Precio estimado ($ USD):
- Tiempo de duración del procedimiento:
- Tiempo estimado de recuperación postoperatoria o reposo:
- Modalidad:
- Aplica reembolso con seguros:
- Distintivo:

[Servicios 3 al 8]
- Por favor agregue de forma similar los servicios hasta completar entre 8 y 12 procedimientos principales.

4. TELEMEDICINA Y CONSULTAS VIRTUALES INSTITUCIONALES
--------------------------------------------------
- ¿Dispone de servicio de telemedicina con sus especialistas?: [Sí / No]
- Precio estimado de teleconsulta ($ USD):
- Plataformas utilizadas (Zoom, Google Meet, WhatsApp Video):
- Requisitos para el paciente (conexión a internet, exámenes o historias previas digitales en PDF o fotos):
- Beneficios incluidos (Receta Médica Digital con firma electrónica oficial, órdenes médicas y laboratorio en PDF):

5. PREGUNTAS FRECUENTES (FAQs) Y DUDAS FRECUENTES DE PACIENTES
--------------------------------------------------
*Nota:* Las preguntas mostradas son de referencia. Con el objetivo de brindar la máxima transparencia a los pacientes y mejorar el posicionamiento en buscadores, les solicitamos responder al menos ocho (8) preguntas frecuentes con sus respuestas que sus pacientes suelan consultar en recepción o consulta:
- Pregunta 1: ¿Cómo funciona el reembolso o convenio con seguros médicos privados en la clínica?
  Respuesta:
- Pregunta 2: ¿Qué preparación previa o ayuno se requiere para exámenes de laboratorio o imagen?
  Respuesta:
- Pregunta 3: ¿Cómo agendar o solicitar una cita médica con un especialista de forma rápida por WhatsApp o teléfono?
  Respuesta:
- Pregunta 4: ¿Cuáles son las formas de pago aceptadas y entregan factura electrónica SRI para reembolso?
  Respuesta:
- Pregunta 5: ¿Cuáles son los tiempos estimados de recuperación postoperatoria o reposo para cirugías y procedimientos?
  Respuesta:
- Pregunta 6: ¿Qué documentos o estudios médicos previos debe presentar el paciente al acudir a su cita de valoración?
  Respuesta:
- Pregunta 7: [Escriba aquí la séptima pregunta frecuente habitual de sus pacientes]
  Respuesta:
- Pregunta 8: [Escriba aquí la octava pregunta frecuente habitual de sus pacientes]
  Respuesta:

6. REDES SOCIALES, VIDEOS Y CANALES DIGITALES
--------------------------------------------------
- Enlace o usuario de Instagram:
- Enlace o usuario de Facebook:
- Perfil de TikTok:
- Canal de YouTube / Perfil de LinkedIn:
- Enlaces a Reels o videos institucionales/educativos destacados (Instagram Reels, TikToks, Shorts):
- Enlace a perfiles en directorios médicos o Ficha de Google Maps:

7. CONVENIOS, ASEGURADORAS, HOSPITALES Y SOCIEDADES (E-E-A-T)
--------------------------------------------------
- Aseguradoras médicas privadas asociadas por reembolso o convenio directo (ej. Saludsa, Humana, Ecuasanitas, Confiamed, BMI, Bupa, etc.):
- ¿Entregan Factura Electrónica oficial autorizada por el SRI y Formulario de Reclamo Médico CIE-10 firmado?: [Sí / No]
- Hospitales de referencia, clínicas aliadas o convenios interinstitucionales de tercer nivel:
- Sociedades médicas, colegios profesionales o asociaciones a las que pertenece el centro o su staff:
- Acreditaciones sanitarias, certificaciones de calidad o programas de actualización médica continua del personal:
- Premios, distinciones institucionales o reconocimientos a la calidad médica y servicio clínico:

8. VALORES DE CONSULTA Y FORMAS DE PAGO
--------------------------------------------------
- Precio estimado de consulta médica de especialidad y telemedicina:
- Métodos de pago aceptados en caja y recepción (Efectivo, Transferencias Banco Pichincha/Guayaquil/Produbanco, Tarjetas de Crédito/Débito, DeUna, Factura electrónica SRI):

9. PREFERENCIAS DE IDENTIDAD VISUAL Y ESTILO
--------------------------------------------------
- Paleta cromática preferida para la web (Azul Clínico, Verde Salud, Turquesa/Teal, Índigo Moderno):
- Estilo general deseado (Institucional moderno, Profesional sobrio, Tecnológico de vanguardia, Cálido y humanitario):

10. GUÍAS, EBOOKS Y RECURSOS EDUCATIVOS PARA PACIENTES (Material Digital)
--------------------------------------------------
*(Opcional: Si en este momento no cuentan con material digital descargable para compartir o vender a los pacientes, como guías en PDF, ebooks o fichas de preparación, pueden omitir llenar esta sección sin ningún problema)*:
- Título de Guías / Fichas de Preparación (ej. "Preparación para Ecografía y Laboratorio", "Guía de Cuidados Postoperatorios"):
- Formato sugerido (PDF, Ficha Imprimible, Checklist, Ebook):
- Método de entrega deseado (Descarga Directa, Envío automático por WhatsApp o Email):

11. ARCHIVOS ADJUNTOS REQUERIDOS
--------------------------------------------------
Por favor adjunte a este correo:
1. Logotipo institucional con fondo transparente (PNG o vectorial de alta resolución).
2. Fotografías de las instalaciones (fachada, recepción, consultorios, quirófanos, salas de espera, equipos médicos: 5 a 10 imágenes).
3. Fotos del equipo médico, directores o especialistas del staff (opcional).
4. Portada o documentos de Guías descargables (si dispone de archivos).

Quedamos atentos a sus respuestas para proceder con el montaje de su sitio web.

Atentamente,
Su Equipo de Desarrollo Web y Marketing Médico`
    : `Asunto: Formulario de Toma de Datos para su Landing Page Médica Profesional

Estimado(a) Doctor(a),

Con el fin de desarrollar su sitio web médico personalizado, optimizado para posicionamiento en Google (SEO Local en Ecuador) y agendamiento directo de pacientes, le solicitamos completar los siguientes datos clínicos y profesionales:

==================================================
FORMULARIO DE INGESTA DE INFORMACIÓN MÉDICA
==================================================

1. DATOS PERSONALES Y PROFESIONALES (E-E-A-T)
--------------------------------------------------
- Nombre completo del médico con título (Dr./Dra.):
- Especialidad / Subespecialidad principal:
- Registro del Ministerio de Salud Pública (MSP - Ecuador):
- Código de Habilitación Sanitaria ACESS:
- Registro SENESCYT:
- Universidad de Egreso (Pregrado / Posgrado / Residencia):
- Años de Experiencia Clínica:
- Misión Profesional (Propósito de su práctica médica):
- Visión Profesional (A dónde proyecta su práctica médica):
- Valores de atención (ej. Ética, Calidez Humana, Rigor Científico):
- Resumen biográfico / Filosofía de atención al paciente (2-3 párrafos):

2. UBICACIÓN Y DIRECCIÓN DEL CONSULTORIO
--------------------------------------------------
- Nombre comercial de la Clínica / Edificio / Consultorio:
- Dirección exacta (Calle principal, intersección, edificio, piso, consultorio):
- Ciudad y Provincia (Ecuador):
- Teléfono directo del consultorio:
- Teléfono celular / WhatsApp exclusivo para citas:
- Correo electrónico de contacto para pacientes:
- Horarios de atención habituales (Lunes a Viernes, Sábados, Domingos):
- Dominio web personalizado preferido (ej. drjuanperez.ec / drmedico.com):
- Enlace a Ficha de Google Business Profile (Google Maps):

3. CATÁLOGO DE SERVICIOS Y PROCEDIMIENTOS (8 a 12 servicios principales)
--------------------------------------------------
Por favor liste entre 8 y 12 de sus principales servicios médicos o quirúrgicos. Es indispensable incluir el tiempo del procedimiento (duración) y el tiempo de recuperación postoperatoria / reposo:

[Servicio 1]
- Título del servicio:
- Descripción detallada del procedimiento y beneficios para el paciente:
- Precio estimado o rango tarifario ($ USD):
- Tiempo de duración del procedimiento:
- Tiempo estimado de recuperación postoperatoria o reposo:
- Modalidad (En consultorio presencial / Quirófano / Hospitalario):
- Aplica reembolso con seguros privados (Factura SRI y Formulario CIE-10): [Sí / No]
- Distintivo o Badge (ej. "Más Solicitado", "Técnica Mínimamente Invasiva"):

[Servicio 2]
- Título del servicio:
- Descripción detallada:
- Precio estimado ($ USD):
- Tiempo de duración del procedimiento:
- Tiempo estimado de recuperación postoperatoria o reposo:
- Modalidad:
- Aplica reembolso con seguros:
- Distintivo:

[Servicio 3 al 8]
- Por favor agregue de forma similar los servicios hasta completar entre 8 y 12 procedimientos principales.

4. MODALIDAD DE ATENCIÓN VIRTUAL & TELECONSULTA
--------------------------------------------------
- ¿Ofrece telemedicina / consultas online para pacientes de otras provincias o exterior?: [Sí / No]
- Precio estimado de teleconsulta ($ USD):
- Plataformas utilizadas (Zoom, Google Meet, WhatsApp Video):
- Requisitos para el paciente (conexión a internet, exámenes previos en PDF o fotos):
- Beneficios incluidos (Receta digital con firma electrónica oficial, órdenes médicas en PDF):

5. PREGUNTAS FRECUENTES (FAQs) Y DUDAS COMUNES DE PACIENTES
--------------------------------------------------
*Nota:* Las preguntas a continuación son de referencia común. Con el propósito de brindar la máxima transparencia a sus pacientes y optimizar el posicionamiento, le solicitamos que nos ayude completando al menos ocho (8) preguntas frecuentes con sus respuestas que más le formulen a diario:
- Pregunta 1: ¿Cómo tramito el reembolso con mi seguro privado (Saludsa, Humana, BMI, Confiamed)?
  Respuesta:
- Pregunta 2: ¿Qué documentos o estudios previos debo llevar a mi primera cita?
  Respuesta:
- Pregunta 3: ¿Se requiere preparación previa, ayuno o indicaciones especiales?
  Respuesta:
- Pregunta 4: ¿Cuáles son los tiempos estimados de recuperación postoperatoria o reposo?
  Respuesta:
- Pregunta 5: ¿Cómo agendar o reprogramar una cita ágilmente por WhatsApp?
  Respuesta:
- Pregunta 6: ¿Cuáles son las formas de pago aceptadas y entregan factura electrónica SRI para reembolso?
  Respuesta:
- Pregunta 7: [Escriba aquí la séptima duda frecuente habitual de sus pacientes]
  Respuesta:
- Pregunta 8: [Escriba aquí la octava duda frecuente habitual de sus pacientes]
  Respuesta:

6. REDES SOCIALES Y CONTENIDO DIGITAL
--------------------------------------------------
- Enlace o usuario de Instagram:
- Enlace o usuario de Facebook:
- Perfil de TikTok:
- Canal de YouTube / Perfil de LinkedIn:
- Enlaces de Reels o Videos educativos (Instagram Reels, TikToks, Shorts):
- Enlace a perfil de Doctoralia, TopDoctors o Ficha de Google Maps:

7. ASEGURADORAS, HOSPITALES Y SOCIEDADES (E-E-A-T)
--------------------------------------------------
- Aseguradoras médicas asociadas por reembolso (ej. Saludsa, Humana, Ecuasanitas, Confiamed, BMI, Bupa, etc.):
- ¿Emite Factura Electrónica oficial del SRI y Formulario de Reclamo Médico CIE-10 firmado?: [Sí / No]
- Hospitales o sanatorios de tercer nivel donde opera o atiende:
- Asociaciones, colegios médicos o certificaciones nacionales/internacionales:
- Cursos de posgrado, diplomados o certificaciones de actualización médica reciente:
- Premios, distinciones o reconocimientos al mérito clínico:

8. VALORES DE CONSULTA Y FORMAS DE PAGO
--------------------------------------------------
- Precio estimado de consulta médica (Presencial / Telemedicina):
- Métodos de pago aceptados en consultorio (Efectivo, Transferencia Banco Pichincha / Guayaquil / Produbanco, Tarjeta de Crédito, DeUna, Factura electrónica SRI):

9. PREFERENCIAS DE IDENTIDAD VISUAL Y ESTILO
--------------------------------------------------
- Paleta cromática preferida para su web (Azul Clínico, Verde Salud, Turquesa/Teal, Índigo Moderno):
- Estilo general deseado (Profesional sobrio, Moderno tecnológico, Cálido y humanitario):

10. GUÍAS, EBOOKS Y MATERIAL EDUCATIVO PARA PACIENTES (Material Digital)
--------------------------------------------------
*(Opcional: Si en este momento no cuenta con material digital para compartir o vender, como guías en PDF, ebooks o fichas de cuidados, puede omitir llenar esta información sin ningún problema)*:
- Título de Guías / Ebooks / Fichas de cuidados (ej. "Cuidados Postoperatorios en Casa", "Guía Nutricional"):
- Formato sugerido (PDF, Ficha Imprimible, Checklist, Ebook):
- Método de entrega deseado (Descarga Directa, Envío automático por WhatsApp o Email):

11. ARCHIVOS ADJUNTOS REQUERIDOS
--------------------------------------------------
Por favor adjunte a este correo:
1. Fotografía profesional en alta resolución (formato portrait 1:1 o vertical 3:4, fondo clínico o neutro).
2. Logotipo con fondo transparente (PNG o vectorial si dispone).
3. Fotografías de las instalaciones de su consultorio, sala de recepción o equipos (3 a 8 imágenes).
4. Portada o documentos de Guías / Ebooks (si dispone de imágenes o archivos).

Quedamos atentos a sus respuestas para proceder con el montaje de su sitio web.

Atentamente,
Su Equipo de Desarrollo Web y Marketing Médico`;

  // 3. Documento estructurado Markdown / Texto Plano
  const documentTemplate = isClinica 
    ? `# FORMULARIO DE TOMA DE DATOS - CENTRO MÉDICO / CLÍNICA
  
Utilice este formulario estructurado para recopilar todos los datos requeridos para la creación automatizada de la Landing Page del Centro Médico.

## SECCIÓN 1: PERFIL INSTITUCIONAL DEL CENTRO MÉDICO Y DIRECCIÓN CLÍNICA (E-E-A-T)
- Nombre Comercial de la Clínica/Centro: 
- Director(a) Médico(a) o Representante Clínico: [Nombre, Especialidad, Reg. SENESCYT/MSP]
- Especialidades / Departamentos Clínicos: 
- Registro MSP / Permiso de Funcionamiento / Código ACESS: 
- Registro SENESCYT Institucional o de Dirección Médica: 
- Universidades y Hospitales de Formación del Staff Médico Principal: 
- Años de Trayectoria en Ecuador: 
- Misión del Centro Médico (Propósito y Compromiso de Salud): 
- Visión Institucional (Proyección y Liderazgo Clínico): 
- Valores de la Clínica (ej. Calidez, Ética, Innovación, Rigor): 
- Reseña Histórica, Quirófanos, Salas y Tecnología Médica: 

## SECCIÓN 2: UBICACIÓN Y CONTACTO LOCAL
- Sede / Campus Médico (si aplica): 
- Dirección Física (Edificio, Piso, Salas/Consultorios, Calles): 
- Ciudad / Provincia: 
- Teléfono Fijo Recepción / Centralita: 
- WhatsApp Citas: 
- Email Institucional: 
- Horario Semana: 
- Horario Sábado: 
- Horario Domingo / Urgencias 24/7: 
- Dominio Web Deseado: 
- Enlace Ficha Google Maps: 

## SECCIÓN 3: CATÁLOGO DE SERVICIOS Y PROCEDIMIENTOS (8 a 12 Servicios Principales)
Indique el tiempo estimado del procedimiento (duración) y el tiempo de recuperación postoperatoria / reposo:
- Servicio 1: [Título] | [Especialidad] | [Descripción] | [Precio $ USD] | [Tiempo Procedimiento (Duración)] | [Recuperación Postoperatoria / Reposo] | [Modalidad: Consultorio/Quirófano/Hospitalización] | [Reembolso SRI: Sí/No] | [Badge ej. Más Solicitado]
- Servicio 2: [Título] | [Especialidad] | [Descripción] | [Precio $ USD] | [Tiempo Procedimiento (Duración)] | [Recuperación Postoperatoria / Reposo] | [Modalidad: Consultorio/Quirófano/Hospitalización] | [Reembolso SRI: Sí/No] | [Badge]
- Servicio 3: [Título] | [Especialidad] | [Descripción] | [Precio $ USD] | [Tiempo Procedimiento (Duración)] | [Recuperación Postoperatoria / Reposo] | [Modalidad: Consultorio/Quirófano/Hospitalización] | [Reembolso SRI: Sí/No] | [Badge]
- Servicio 4: [Título] | [Especialidad] | [Descripción] | [Precio $ USD] | [Tiempo Procedimiento (Duración)] | [Recuperación Postoperatoria / Reposo] | [Modalidad: Consultorio/Quirófano/Hospitalización] | [Reembolso SRI: Sí/No] | [Badge]
- Servicio 5: [Título] | [Especialidad] | [Descripción] | [Precio $ USD] | [Tiempo Procedimiento] | [Recuperación Postoperatoria] | [Modalidad] | [Reembolso SRI: Sí/No] | [Badge]
- Servicio 6: [Título] | [Especialidad] | [Descripción] | [Precio $ USD] | [Tiempo Procedimiento] | [Recuperación Postoperatoria] | [Modalidad] | [Reembolso SRI: Sí/No] | [Badge]
- Servicio 7: [Título] | [Especialidad] | [Descripción] | [Precio $ USD] | [Tiempo Procedimiento] | [Recuperación Postoperatoria] | [Modalidad] | [Reembolso SRI: Sí/No] | [Badge]
- Servicio 8: [Título] | [Especialidad] | [Descripción] | [Precio $ USD] | [Tiempo Procedimiento] | [Recuperación Postoperatoria] | [Modalidad] | [Reembolso SRI: Sí/No] | [Badge]
(Puede completar hasta 12 servicios)

## SECCIÓN 4: TELEMEDICINA Y CONSULTAS VIRTUALES
- ¿Dispone de Telemedicina?: [Sí / No]
- Precio Teleconsulta ($ USD): 
- Plataformas (Zoom / Google Meet / WhatsApp Video): 
- Requisitos para el Paciente (conexión, estudios previos en PDF): 
- Beneficios (Receta Digital SRI con Firma Electrónica / Órdenes en PDF): 

## SECCIÓN 5: PREGUNTAS FRECUENTES (FAQs) Y DUDAS DE PACIENTES
(Nota: Se solicita completar al menos 8 preguntas frecuentes con sus respuestas que más hagan sus pacientes):
- FAQ 1: [Pregunta y Respuesta sobre Convenios y Reembolso de Seguros Privados SRI]
- FAQ 2: [Pregunta y Respuesta sobre Preparación previa o Ayuno para Exámenes de Laboratorio o Imagen]
- FAQ 3: [Pregunta y Respuesta sobre Agendamiento ágil de Citas por WhatsApp o Teléfono]
- FAQ 4: [Pregunta y Respuesta sobre Métodos de Pago Aceptados y Facturación Electrónica SRI]
- FAQ 5: [Pregunta y Respuesta sobre Tiempos de Recuperación Postoperatoria o Reposo]
- FAQ 6: [Pregunta y Respuesta sobre Requisitos o Documentos Médicos para la Cita]
- FAQ 7: [Séptima Pregunta Frecuente y Respuesta habitual]
- FAQ 8: [Octava Pregunta Frecuente y Respuesta habitual]

## SECCIÓN 6: REDES SOCIALES, VIDEOS & DIGITAL
- Instagram: 
- Facebook: 
- TikTok: 
- YouTube / LinkedIn: 
- Enlaces a Reels o Videos Institucionales: 
- Ficha Google Maps / Directorios Médicos: 

## SECCIÓN 7: CONVENIOS, HOSPITALES Y AVALES INSTITUCIONALES (E-E-A-T)
- Aseguradoras Privadas por Reembolso / Convenio Directo: 
- Emisión de Factura SRI y Formulario CIE-10: [Sí / No]
- Hospitales de Referencia / Clínicas Aliadas / Convenios de Tercer Nivel: 
- Sociedades Médicas y Colegios Profesionales del Staff: 
- Acreditaciones Sanitarias y Programas de Educación Médica Continua: 
- Premios y Distinciones Institucionales al Mérito Clínico: 

## SECCIÓN 8: VALORES DE CONSULTA Y PAGO
- Valor promedio de Consultas y Procedimientos: 
- Formas de Pago Aceptadas (Efectivo, Pichincha, Guayaquil, Deuna, Tarjeta, SRI): 

## SECCIÓN 9: IDENTIDAD VISUAL Y COLORES
- Paleta cromática preferida (Azul Clínico / Verde Salud / Teal / Índigo): 
- Estilo (Institucional moderno / Profesional sobrio / Tecnológico de vanguardia / Cálido): 

## SECCIÓN 10: GUÍAS, EBOOKS Y RECURSOS EDUCATIVOS (Material Digital)
(Opcional: Si no cuenta con material digital para compartir o vender, como guías o fichas, puede omitir llenar esta sección):
- Guía / Ebook 1: [Título, Formato PDF/Ficha, Método de Entrega]

## SECCIÓN 11: ARCHIVOS MULTIMEDIA REQUERIDOS
- Logotipo del Centro Médico (PNG Transparente de alta resolución)
- Fotos de Instalaciones / Recepción / Quirófanos / Tecnología (5-10 imágenes)
- Fotos del Staff Médico o Directores (Opcional)
- Portadas o documentos de Guías Descargables (si dispone)
`
    : `# FORMULARIO DE TOMA DE DATOS - CLIENTE MÉDICO ESPECIALISTA
  
Utilice este formulario para recopilar los datos requeridos para la creación automatizada de la Landing Page Médica.

## SECCIÓN 1: DATOS PERSONALES Y REGISTRO PROFESIONAL (E-E-A-T)
- Nombre Médico con Título: 
- Especialidad / Subespecialidad: 
- Reg. MSP / Código Habilitación Sanitaria ACESS: 
- Reg. SENESCYT: 
- Universidad (Pregrado y Posgrado / Residencia): 
- Años de Experiencia Clínica: 
- Misión Profesional:
- Visión Profesional:
- Valores de Atención:
- Biografía Corta / Filosofía de Atención: 

## SECCIÓN 2: UBICACIÓN Y CONTACTO LOCAL
- Nombre Clínica / Consultorio: 
- Dirección Física (Edificio, Piso, Consultorio, Calles): 
- Ciudad / Provincia: 
- Teléfono Fijo: 
- WhatsApp Citas: 
- Email: 
- Horario Semana: 
- Horario Sábado: 
- Horario Domingo: 
- Dominio Web Deseado: 
- Enlace Ficha Google Maps: 

## SECCIÓN 3: SERVICIOS Y PROCEDIMIENTOS CLAVE (8 a 12 Servicios Principales)
Indique el tiempo estimado del procedimiento (duración) y el tiempo de recuperación postoperatoria / reposo:
- Servicio 1: [Título] | [Descripción] | [Precio $ USD] | [Tiempo Procedimiento (Duración)] | [Recuperación Postoperatoria / Reposo] | [Modalidad] | [Reembolso SRI: Sí/No] | [Badge]
- Servicio 2: [Título] | [Descripción] | [Precio $ USD] | [Tiempo Procedimiento (Duración)] | [Recuperación Postoperatoria / Reposo] | [Modalidad] | [Reembolso SRI: Sí/No] | [Badge]
- Servicio 3: [Título] | [Descripción] | [Precio $ USD] | [Tiempo Procedimiento (Duración)] | [Recuperación Postoperatoria / Reposo] | [Modalidad] | [Reembolso SRI: Sí/No] | [Badge]
- Servicio 4: [Título] | [Descripción] | [Precio $ USD] | [Tiempo Procedimiento (Duración)] | [Recuperación Postoperatoria / Reposo] | [Modalidad] | [Reembolso SRI: Sí/No] | [Badge]
- Servicio 5: [Título] | [Descripción] | [Precio $ USD] | [Tiempo Procedimiento] | [Recuperación Postoperatoria] | [Modalidad] | [Reembolso SRI: Sí/No] | [Badge]
- Servicio 6: [Título] | [Descripción] | [Precio $ USD] | [Tiempo Procedimiento] | [Recuperación Postoperatoria] | [Modalidad] | [Reembolso SRI: Sí/No] | [Badge]
- Servicio 7: [Título] | [Descripción] | [Precio $ USD] | [Tiempo Procedimiento] | [Recuperación Postoperatoria] | [Modalidad] | [Reembolso SRI: Sí/No] | [Badge]
- Servicio 8: [Título] | [Descripción] | [Precio $ USD] | [Tiempo Procedimiento] | [Recuperación Postoperatoria] | [Modalidad] | [Reembolso SRI: Sí/No] | [Badge]
(Puede completar hasta 12 servicios)

## SECCIÓN 4: MODALIDAD VIRTUAL & TELECONSULTA
- ¿Ofrece Telemedicina?: [Sí / No]
- Valor Teleconsulta ($ USD): 
- Plataformas (Zoom / Google Meet / WhatsApp Video): 
- Requisitos para el Paciente: 
- Beneficios (Receta Digital SRI / Órdenes en PDF): 

## SECCIÓN 5: PREGUNTAS FRECUENTES (FAQs) Y DUDAS COMUNES
(Nota: Se solicita completar al menos 8 preguntas frecuentes con sus respuestas que más hagan sus pacientes):
- FAQ 1: [Pregunta y Respuesta sobre Reembolso con Seguros Privados]
- FAQ 2: [Pregunta y Respuesta sobre Documentos o Exámenes para la Cita]
- FAQ 3: [Pregunta y Respuesta sobre Preparación previa o Ayuno]
- FAQ 4: [Pregunta y Respuesta sobre Tiempos de Recuperación Postoperatoria o Reposo]
- FAQ 5: [Pregunta y Respuesta sobre Agendamiento por WhatsApp]
- FAQ 6: [Pregunta y Respuesta sobre Facturación SRI y Formas de Pago]
- FAQ 7: [Séptima Pregunta Frecuente y Respuesta]
- FAQ 8: [Octava Pregunta Frecuente y Respuesta]

## SECCIÓN 6: REDES SOCIALES & DIGITAL
- Instagram: 
- Facebook: 
- TikTok: 
- YouTube / LinkedIn: 
- Enlaces de Reels o Videos Educativos: 
- Ficha Google Maps / Doctoralia: 

## SECCIÓN 7: ASEGURADORAS, HOSPITALES Y SOCIEDADES (E-E-A-T)
- Aseguradoras Privadas por Reembolso: 
- Emisión de Factura SRI y Formulario CIE-10: [Sí / No]
- Hospitales donde opera: 
- Certificaciones y Colegios Médicos: 
- Cursos y Diplomados de Actualización: 
- Premios y Reconocimientos al Mérito: 

## SECCIÓN 8: VALOR DE CONSULTA Y MÉTODOS DE PAGO
- Valor Consulta Presencial / Telemedicina: 
- Formas de Pago Aceptadas (Efectivo, Pichincha, Guayaquil, Deuna, Tarjeta, SRI): 

## SECCIÓN 9: PREFERENCIAS DE IDENTIDAD VISUAL Y COLORES
- Paleta cromática preferida (Azul Clínico / Verde Salud / Teal / Índigo): 
- Estilo (Profesional sobrio / Moderno tecnológico / Cálido y humanitario): 

## SECCIÓN 10: GUÍAS Y RECURSOS EDUCATIVOS PARA PACIENTES (Material Digital)
(Opcional: Si no cuenta con material digital para compartir o vender, como guías o ebooks, puede omitir llenar esta sección):
- Guía / Ebook 1: [Título, Formato PDF/Ficha, Método de Entrega]

## SECCIÓN 11: ARCHIVOS MULTIMEDIA REQUERIDOS
- Foto Profesional (Portrait en alta resolución)
- Logotipo del Consultorio (PNG Transparente)
- Fotos de Instalaciones / Consultorio (3-8 imágenes)
- Portadas o documentos de Guías Descargables (si dispone)
`;

  const getCurrentText = () => {
    if (activeFormat === "whatsapp") return whatsappTemplate;
    if (activeFormat === "email") return emailTemplate;
    return documentTemplate;
  };

  const handleCopy = () => {
    const text = getCurrentText();
    navigator.clipboard.writeText(text);
    setCopiedFormat(activeFormat);
    setTimeout(() => setCopiedFormat(null), 2500);
  };

  const handleDownload = () => {
    const text = getCurrentText();
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Formulario_Toma_Datos_Medico_${activeFormat.toUpperCase()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${isClinica ? "Formulario de Toma de Datos para Clínica / Centro Médico" : "Formulario de Toma de Datos para Clientes Médicos"}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 30px; line-height: 1.6; color: #1e293b; }
            h1 { font-size: 20px; color: #0f172a; border-bottom: 2px solid #2563eb; padding-bottom: 8px; margin-bottom: 16px; }
            pre { font-family: inherit; white-space: pre-wrap; word-wrap: break-word; background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 13px; }
            .footer { margin-top: 30px; font-size: 11px; color: #64748b; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 10px; }
          </style>
        </head>
        <body>
          <h1>${isClinica ? "Formulario de Toma de Datos para Clínica / Centro Médico" : "Formulario de Toma de Datos para Landing Page Médica"}</h1>
          <p>${isClinica ? "Complete o envíe este documento para recopilar la información estructurada de la clínica. Una vez completado, copie y pegue el texto en la herramienta \"Organizar con IA\" del sistema." : "Envíe este documento a su cliente médico para recopilar su información estructurada. Una vez completado, copie y pegue el texto en la herramienta \"Organizar con IA\" del sistema."}</p>
          <pre>${getCurrentText()}</pre>
          <div class="footer">Medico.ec - Creador de Consultorio Digital 3.0</div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* CABECERA DEL MODAL */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white flex items-start justify-between gap-4 shrink-0 border-b border-slate-700">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="p-2 rounded-xl bg-blue-600/30 text-blue-300 border border-blue-400/30 shrink-0">
                <ClipboardList className="w-5 h-5 text-blue-300" />
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold text-white leading-snug">
                {isClinica 
                  ? "Formulario de Toma de Datos para Clínicas y Centros Médicos" 
                  : "Formulario de Toma de Datos para Especialistas Médicos"}
              </h2>
              <span className="text-[10px] font-black text-amber-300 bg-amber-500/20 border border-amber-400/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {isClinica ? "Perfil Institucional" : "Perfil Especialista"}
              </span>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              {isClinica 
                ? "Descarga o copia este formulario de datos estructurados para tu Centro Médico. Una vez que lo completes, pégalo en la herramienta \"Organizar con IA\" para autocompletar toda la landing page clínica en segundos."
                : "Descarga o copia este formulario listo para enviar a tus médicos clientes por WhatsApp o Email. Una vez que te devuelvan el texto respondido, solo pégalo en la herramienta \"Organizar con IA\" para generar su Landing Page automáticamente en segundos."}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all cursor-pointer shrink-0"
            title="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SELECTOR DE FORMATO */}
        <div className="p-3 sm:p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1.5 bg-slate-200/80 p-1 rounded-2xl w-full sm:w-auto">
            <button
              onClick={() => setActiveFormat("whatsapp")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeFormat === "whatsapp"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-700 hover:bg-slate-300/60"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Plantilla WhatsApp</span>
            </button>

            <button
              onClick={() => setActiveFormat("email")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeFormat === "email"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-700 hover:bg-slate-300/60"
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>Plantilla Correo / Word</span>
            </button>

            <button
              onClick={() => setActiveFormat("document")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeFormat === "document"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-700 hover:bg-slate-300/60"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Estructura Texto Plano</span>
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleCopy}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-xs transition-all cursor-pointer"
              title="Copiar plantilla al portapapeles"
            >
              {copiedFormat === activeFormat ? (
                <>
                  <Check className="w-4 h-4 text-amber-300" />
                  <span>¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar Texto</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-xs transition-all cursor-pointer"
              title="Descargar archivo de texto .txt"
            >
              <Download className="w-4 h-4 text-blue-400" />
              <span>Descargar .TXT</span>
            </button>

            <button
              onClick={handlePrint}
              className="p-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 transition-all cursor-pointer hidden md:flex items-center justify-center"
              title="Imprimir o guardar como PDF"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* CONTENIDO DEL FORMULARIO */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 bg-slate-100/50">
          
          {/* BANNER DE PASO A PASO */}
          <div className="p-3.5 bg-blue-50/90 border border-blue-200/90 rounded-2xl flex items-start gap-3">
            <span className="p-2 bg-blue-600 text-white rounded-xl shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </span>
            <div className="space-y-1 text-xs">
              <p className="font-extrabold text-blue-950">
                Flujo de Trabajo Ultrarrápido para Agencias y Desarrolladores:
              </p>
              <ol className="list-decimal list-inside text-blue-900/90 space-y-0.5 text-[11px] leading-relaxed">
                <li>Haz clic en <strong>"Copiar Texto"</strong> o <strong>"Descargar .TXT"</strong> y envíaselo a tu cliente médico.</li>
                <li>Cuando el médico te devuelva el mensaje con sus respuestas, copia todo el texto.</li>
                <li>Abre el botón <strong>"Organizar con IA"</strong> en este panel, pega el texto respondido y presiona <strong>"Autocompletar Landing Page"</strong>.</li>
              </ol>
            </div>
          </div>

          {/* VISTA PREVIA DEL TEXTO A ENVIAR */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-300 shadow-inner bg-slate-950 text-slate-100">
            <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono text-[11px] flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                Vista previa del formato ({activeFormat.toUpperCase()})
              </span>
              <span className="text-[10px] bg-slate-800 px-2.5 py-0.5 rounded-full text-slate-300">
                Listo para enviar
              </span>
            </div>

            <pre className="p-4 sm:p-5 font-mono text-xs leading-relaxed text-slate-200 whitespace-pre-wrap max-h-[380px] overflow-y-auto selection:bg-blue-600 selection:text-white">
              {getCurrentText()}
            </pre>
          </div>
        </div>

        {/* PIE DEL MODAL CON ACCIÓN DIRECTA A IA */}
        <div className="p-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 font-medium text-center sm:text-left">
            💡 Consejo: Si el médico te envía un PDF o documento Word, también puedes subirlo directamente en la Ingesta de IA.
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onOpenAiIngestion && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAiIngestion();
                }}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs shadow-md transition-all cursor-pointer hover:scale-102"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Tengo las respuestas → Ir a Ingesta con IA</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
