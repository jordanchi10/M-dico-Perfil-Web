/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Icono / Avatar de Robot Humanoide Femenino Ultra Moderno
 * Diseño estilizado de alta definición con estética médica y futurista
 */

import React from "react";

interface FemaleRobotAvatarProps {
  className?: string;
  size?: number | string;
  showGlow?: boolean;
}

export const FemaleRobotAvatar: React.FC<FemaleRobotAvatarProps> = ({
  className = "w-10 h-10",
  size,
  showGlow = true
}) => {
  return (
    <div 
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}
      style={size ? { width: size, height: size } : undefined}
    >
      {showGlow && (
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-400/40 via-blue-500/30 to-indigo-500/40 blur-md pointer-events-none animate-pulse" />
      )}
      
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10 drop-shadow-sm transition-transform duration-300 hover:scale-105"
      >
        <defs>
          {/* Degradados principales */}
          <linearGradient id="robotFaceGrad" x1="20" y1="20" x2="80" y2="85" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="50%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>

          <linearGradient id="robotHairGrad" x1="15" y1="10" x2="85" y2="70" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="40%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>

          <linearGradient id="robotEyeGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>

          <linearGradient id="robotEarGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#4f46e5" />
          </linearGradient>

          <linearGradient id="robotChassisGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="50%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          <linearGradient id="blushGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Fondo circular de base */}
        <circle cx="50" cy="50" r="47" fill="url(#robotChassisGrad)" stroke="#38bdf8" strokeWidth="2" strokeOpacity="0.6" />

        {/* Halo / Aro superior de halo holográfico */}
        <path
          d="M26 22 C34 14 66 14 74 22"
          stroke="#06b6d4"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="4 3"
          opacity="0.85"
        />

        {/* Casco / Cabello estilizado cibernético femenino (Bob cut futurista) */}
        <path
          d="M22 46 C20 28 32 18 50 18 C68 18 80 28 78 46 C77 56 74 68 71 74 C69 70 68 56 68 48 C68 34 60 28 50 28 C40 28 32 34 32 48 C32 56 31 70 29 74 C26 68 23 56 22 46 Z"
          fill="url(#robotHairGrad)"
          opacity="0.95"
        />

        {/* Rostro estilizado suave / femenino */}
        <path
          d="M31 42 C31 34 39 30 50 30 C61 30 69 34 69 42 C69 57 62 72 50 75 C38 72 31 57 31 42 Z"
          fill="url(#robotFaceGrad)"
          stroke="#94a3b8"
          strokeWidth="1"
        />

        {/* Cejas sutiles y felices */}
        <path d="M37 40 C40 37 45 38 47 40" stroke="#64748b" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M53 40 C55 38 60 37 63 40" stroke="#64748b" strokeWidth="1.2" strokeLinecap="round" />

        {/* Líneas de ensamblaje sutiles en las sienes */}
        <path d="M33 46 C36 47 38 50 37 54" stroke="#0ea5e9" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
        <path d="M67 46 C64 47 62 50 63 54" stroke="#0ea5e9" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />

        {/* Ojos expresivos y felices (Brillo alegre y forma dulce) */}
        {/* Ojo Izquierdo Feliz */}
        <g>
          <ellipse cx="42" cy="47" rx="4.8" ry="5.8" fill="url(#robotEyeGrad)" />
          {/* Brillo ocular principal */}
          <circle cx="43.5" cy="45" r="2" fill="#ffffff" />
          <circle cx="40.5" cy="49.5" r="1" fill="#ffffff" opacity="0.9" />
          <circle cx="44.5" cy="48.5" r="0.6" fill="#ffffff" opacity="0.8" />
          {/* Delineado superior alegre */}
          <path d="M36 45 C38 41 45 41 48 44" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
        </g>

        {/* Ojo Derecho Feliz */}
        <g>
          <ellipse cx="58" cy="47" rx="4.8" ry="5.8" fill="url(#robotEyeGrad)" />
          {/* Brillo ocular principal */}
          <circle cx="59.5" cy="45" r="2" fill="#ffffff" />
          <circle cx="56.5" cy="49.5" r="1" fill="#ffffff" opacity="0.9" />
          <circle cx="60.5" cy="48.5" r="0.6" fill="#ffffff" opacity="0.8" />
          {/* Delineado superior alegre */}
          <path d="M52 44 C55 41 62 41 64 45" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
        </g>

        {/* Mejillas sonrosadas / Rubor alegre */}
        <ellipse cx="36" cy="53.5" rx="3.5" ry="2" fill="url(#blushGrad)" />
        <ellipse cx="64" cy="53.5" rx="3.5" ry="2" fill="url(#blushGrad)" />

        {/* Nariz minimalista */}
        <path d="M50 50.5 L50 52" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" />

        {/* Sonrisa alegre y radiante con hoyuelos */}
        <path d="M43.5 56.5 Q50 63.5 56.5 56.5" stroke="#0284c7" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        <path d="M44 57 C47 62 53 62 56 57 Z" fill="#38bdf8" opacity="0.25" />
        {/* Comisuras de sonrisa */}
        <path d="M42.5 56.5 C43 55.5 44 56 44.5 57" stroke="#0284c7" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M57.5 56.5 C57 55.5 56 56 55.5 57" stroke="#0284c7" strokeWidth="1.5" strokeLinecap="round" />

        {/* Gema / Sensor Médico en la frente */}
        <polygon points="50,33 52.5,36 50,39 47.5,36" fill="#38bdf8" />
        <circle cx="50" cy="36" r="1" fill="#ffffff" />

        {/* Auriculares / Nodos de comunicación en los laterales */}
        <g>
          {/* Oreja Izquierda */}
          <rect x="23" y="44" width="6" height="12" rx="3" fill="url(#robotEarGrad)" stroke="#38bdf8" strokeWidth="1" />
          <circle cx="26" cy="50" r="1.5" fill="#38bdf8" />
          
          {/* Oreja Derecha con micrófono estilizado */}
          <rect x="71" y="44" width="6" height="12" rx="3" fill="url(#robotEarGrad)" stroke="#38bdf8" strokeWidth="1" />
          <circle cx="74" cy="50" r="1.5" fill="#38bdf8" />
          {/* Micrófono hacia la boca */}
          <path d="M73 53 C73 60 68 64 61 64" stroke="#0ea5e9" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <circle cx="60.5" cy="64" r="1.5" fill="#38bdf8" />
        </g>

        {/* Cuello y armadura de pecho médica con cruz luminosa */}
        <path d="M44 75 L44 82 C44 84 46 86 50 86 C54 86 56 84 56 82 L56 75 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
        <path d="M30 84 C38 81 62 81 70 84 L72 94 C60 96 40 96 28 94 Z" fill="#1e293b" />
        
        {/* Cruz médica luminosa en el cuello/chasis */}
        <g transform="translate(50, 89) scale(0.7)">
          <rect x="-1" y="-5" width="2" height="10" rx="0.5" fill="#38bdf8" />
          <rect x="-5" y="-1" width="10" height="2" rx="0.5" fill="#38bdf8" />
        </g>
      </svg>
    </div>
  );
};
