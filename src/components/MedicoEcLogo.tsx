/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";

interface MedicoEcLogoProps {
  className?: string;
  showTagline?: boolean;
  compact?: boolean;
}

export function MedicoEcLogo({ className = "h-10", showTagline = true, compact = false }: MedicoEcLogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Icono de Corazón con Checkmark Azul (Emblema Medico.ec) */}
      <div className="relative shrink-0 flex items-center justify-center">
        <svg viewBox="0 0 120 120" className="h-full w-auto aspect-square shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Corazón Rojo Elegante */}
          <path
            d="M60 102 C 22 75, 8 54, 8 34 C 8 18, 20 6, 36 6 C 47 6, 55 12, 60 19 C 65 12, 73 6, 84 6 C 100 6, 112 18, 112 34 C 112 54, 98 75, 60 102 Z"
            stroke="#EE2B38"
            strokeWidth="9"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Checkmark Azul Grueso Cruzando el Corazón */}
          <path
            d="M32 54 L52 76 L94 28"
            stroke="#0C62AC"
            strokeWidth="14"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Tipografía de la marca Medico.ec */}
      {!compact && (
        <div className="flex flex-col justify-center min-w-0">
          <div className="flex items-baseline font-black tracking-tight text-[#0C62AC] text-xl leading-none">
            <span className="font-sans font-black">Medico</span>
            <span className="font-sans font-extrabold text-[#0C62AC]">.ec</span>
          </div>
          {showTagline && (
            <span className="text-[8px] sm:text-[9px] font-extrabold tracking-wider text-slate-600 uppercase mt-1 leading-none whitespace-nowrap">
              ESPECIALISTAS MÉDICOS <span className="text-[#EE2B38]">ONLINE</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
