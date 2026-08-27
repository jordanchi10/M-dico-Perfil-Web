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
  if (compact) {
    return (
      <div className={`relative shrink-0 flex items-center justify-center ${className}`}>
        <svg viewBox="0 0 120 120" className="h-full w-auto aspect-square shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Corazón Rojo Oficial Medico.ec */}
          <path
            d="M 60 102 C 22 75, 8 54, 8 34 C 8 18, 20 6, 36 6 C 47 6, 55 12, 60 19 C 65 12, 73 6, 84 6 C 100 6, 112 18, 112 34 C 112 54, 98 75, 60 102 Z"
            stroke="#ED1C24"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Checkmark Azul Oficial Atravesando el Corazón */}
          <path
            d="M 30 52 L 50 74 L 102 18"
            stroke="#0072BC"
            strokeWidth="15"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center ${className}`}>
      <svg viewBox="0 0 480 125" className="h-full w-auto max-w-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Emblema Corazón Rojo con Checkmark Azul */}
        <g transform="translate(10, 8)">
          <path
            d="M 60 98 C 24 74, 10 52, 10 32 C 10 16, 22 6, 38 6 C 48 6, 56 12, 60 18 C 64 12, 72 6, 82 6 C 98 6, 110 16, 110 32 C 110 52, 96 74, 60 98 Z"
            stroke="#ED1C24"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d="M 30 50 L 50 72 L 102 16"
            stroke="#0072BC"
            strokeWidth="15"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </g>

        {/* Texto Tipográfico Oficial: Medico.ec */}
        <text x="138" y="74" fontFamily="system-ui, -apple-system, 'Plus Jakarta Sans', Arial, sans-serif" fontWeight="900" fontSize="58" fill="#0072BC" letterSpacing="-1.5">
          Medico<tspan fill="#0072BC">.ec</tspan>
        </text>

        {/* Tagline Oficial: ESPECIALISTAS MÉDICOS ONLINE */}
        {showTagline && (
          <text x="140" y="104" fontFamily="system-ui, -apple-system, 'Plus Jakarta Sans', Arial, sans-serif" fontWeight="800" fontSize="14.5" fill="#4B5563" letterSpacing="2.2">
            ESPECIALISTAS MÉDICOS <tspan fill="#ED1C24">ONLINE</tspan>
          </text>
        )}
      </svg>
    </div>
  );
}
