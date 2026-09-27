/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Code2, 
  ShieldCheck, 
  Zap, 
  Clock, 
  Server, 
  Layers, 
  CheckCircle2, 
  Sparkles, 
  Copy, 
  Check, 
  ExternalLink,
  Flame,
  AlertTriangle,
  FileCode,
  HardDrive,
  Cpu,
  RefreshCw,
  Award
} from "lucide-react";

export function FormTechnicalInfo() {
  const [copied, setCopied] = useState(false);

  const copyPitchText = () => {
    const pitch = `Ventajas Técnicas de tu Landing Page Médica en Código Puro (HTML5 / Vanilla JS):
1. Inmune al paso del tiempo: Desarrollada sin plugins ni temas vulnerables. Cero fallos por actualizaciones de WordPress o PHP.
2. Cero Mantenimiento: No requiere cuotas mensuales para parches de seguridad ni ajustes técnicos constantes.
3. Máxima Velocidad (95-100 en Google PageSpeed): Carga en milisegundos, reduciendo el rebote de pacientes y mejorando el posicionamiento local.
4. Máxima Seguridad: Al no tener base de datos ni panel editable en la nube, es 100% inmune a inyecciones SQL o hackeos.
5. Alojamiento Ultra Ligero: Funciona en cualquier hosting o cPanel estándar con consumo mínimo de recursos.`;

    navigator.clipboard.writeText(pitch);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6" id="form-technical-info-section">
      {/* CABECERA PRINCIPAL */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-md border border-slate-800 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 text-cyan-300 border border-cyan-500/30 flex items-center justify-center shadow-xs">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 block">Arquitectura Web Médica</span>
              <h3 className="text-base font-black text-white">Beneficios del Código Puro (HTML5 / CSS / Vanilla JS)</h3>
            </div>
          </div>
          <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Durabilidad Garantizada 3+ Años
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Esta plataforma compila y exporta la landing page en <strong>código puro estático de alto rendimiento</strong>. Diseñado específicamente para que puedas entregar el sitio al médico, subirlo a su cPanel o hosting y dejarlo funcionando <strong>durante 2, 3 o más años sin necesidad de mantenimiento técnico ni temor a que se desconfigure</strong>.
        </p>

        <div className="pt-2 flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={copyPitchText}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs transition-all shadow-sm cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "¡Copiado para tu Cliente!" : "Copiar Argumentario para el Médico"}</span>
          </button>
          <span className="text-[11px] text-slate-400">
            Úsalo en tus propuestas y reuniones comerciales para explicar el valor del desarrollo limpio.
          </span>
        </div>
      </div>

      {/* COMPARATIVA: CÓDIGO PURO VS WORDPRESS */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            Comparativa Técnica: Código Puro vs. WordPress Tradicional
          </h4>
          <span className="text-[10px] font-bold text-slate-500">¿Por qué es superior para landing pages médicas?</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tarjeta Código Puro */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/30 border-2 border-emerald-300/80 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-xs">
                  ⚡
                </div>
                <span className="text-sm font-black text-emerald-950">Tu Landing (Código Puro)</span>
              </div>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                100% Recomendado
              </span>
            </div>

            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Inmune al paso de los años:</strong> Los navegadores respetan el estándar HTML5 ("Don't break the web"). No caduca.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Cero Mantenimiento:</strong> Sin plugins que actualizar ni conflictos de compatibilidad de PHP.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Velocidad Extrema (95-100 en PageSpeed):</strong> Carga instantánea que reduce la tasa de rebote y mejora el SEO.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Seguridad Máxima:</strong> Sin panel administrativo expuesto ni base de datos MySQL vulnerable a inyecciones SQL.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Alojamiento Ultra Económico:</strong> Consumo de memoria RAM y procesador prácticamente nulo en cPanel.</span>
              </li>
            </ul>
          </div>

          {/* Tarjeta WordPress Tradicional */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-rose-50/60 via-white to-slate-50 border border-rose-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-slate-700 text-white flex items-center justify-center font-bold text-xs">
                  W
                </div>
                <span className="text-sm font-extrabold text-slate-900">WordPress / CMS Pesados</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
                Alto Mantenimiento
              </span>
            </div>

            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span><strong>Se rompe con el tiempo:</strong> Actualizaciones de PHP o plugins incompatibles causan pantallas blancas (Error 500).</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span><strong>Requiere parches mensuales:</strong> Vulnerabilidades frecuentes en plugins que exigen soporte técnico constante.</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span><strong>Lentitud y sobrecarga:</strong> Decenas de hojas de estilo y scripts de constructores visuales pesados (Elementor, Divi).</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span><strong>Riesgo de desconfiguración:</strong> Si el médico entra al panel puede alterar el diseño o romper el formulario.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* LOS 4 PILARES TÉCNICOS DE DURABILIDAD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Pilar 1 */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-black text-slate-900 uppercase">1. Principio "Don't Break The Web"</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            El consorcio internacional W3C y los navegadores web (Chrome, Safari, Edge, Firefox) garantizan compatibilidad retroactiva permanente. El código HTML5 y JavaScript estándar que construyes hoy seguirá ejecutándose exactamente igual en 5 o 10 años.
          </p>
        </div>

        {/* Pilar 2 */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <Server className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-black text-slate-900 uppercase">2. Cero Dependencia de Servidor PHP</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Al no procesar código en el servidor, tu web no depende de si el hosting actualiza de PHP 7.4 a PHP 8.3. El servidor web entrega el archivo instantáneamente sin procesar nada en backend.
          </p>
        </div>

        {/* Pilar 3 */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Zap className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-black text-slate-900 uppercase">3. Máxima Conversión de Pacientes</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Los pacientes que buscan un médico desde su celular necesitan respuestas inmediatas. Una página que carga en menos de 1 segundo genera hasta un <strong>40% más de clics al WhatsApp de agendamiento</strong> que una página lenta.
          </p>
        </div>

        {/* Pilar 4 */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-black text-slate-900 uppercase">4. Blindaje contra Hackeos</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            El 90% de los hackeos a sitios médicos ocurren por contraseñas débiles de WordPress o plugins desactualizados. Una landing en código puro es una superficie sin puertas traseras ni bases de datos atacables.
          </p>
        </div>
      </div>

      {/* GUÍA PRÁCTICA: LOS ÚNICOS PUNTOS EXTERNOS A TENER EN CUENTA */}
      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3.5">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-blue-600" />
          <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider">
            Recomendaciones para Dejar la Web 100% Autónoma por Años
          </h4>
        </div>
        <p className="text-xs text-slate-600">
          El código nunca se dañará solo. Para asegurar que la página se mantenga impecable sin que tengas que intervenir en 2-3 años, sigue estas buenas prácticas:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
            <span className="font-extrabold text-slate-900 block flex items-center gap-1.5">
              <span>🖼️</span> Fotos en el Mismo Hosting
            </span>
            <p className="text-slate-600">
              Guarda las fotos del doctor en la misma carpeta o hosting del proyecto para evitar que enlaces externos temporales dejen de cargar.
            </p>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
            <span className="font-extrabold text-slate-900 block flex items-center gap-1.5">
              <span>📱</span> Teléfono de WhatsApp
            </span>
            <p className="text-slate-600">
              La API universal de WhatsApp (<code className="text-blue-700 font-bold">wa.me</code>) es un estándar global que no caduca. Solo requerirá cambio si el médico cambia de línea.
            </p>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
            <span className="font-extrabold text-slate-900 block flex items-center gap-1.5">
              <span>🔒</span> Certificado SSL Automático
            </span>
            <p className="text-slate-600">
              En cPanel, el certificado gratuito (AutoSSL / Let's Encrypt) se renueva solo cada 90 días sin intervención manual.
            </p>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
            <span className="font-extrabold text-slate-900 block flex items-center gap-1.5">
              <span>🌐</span> Renovación de Dominio
            </span>
            <p className="text-slate-600">
              Aconseja al cliente activar la renovación automática de su dominio anual para evitar pérdidas de titularidad.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
