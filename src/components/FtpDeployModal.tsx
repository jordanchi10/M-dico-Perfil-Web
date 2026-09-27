/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { MedicalLandingData } from "../types";
import FtpDeployForm from "./FtpDeployForm";
import { Server, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface FtpDeployModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: MedicalLandingData;
}

export default function FtpDeployModal({ isOpen, onClose, data }: FtpDeployModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div id="ftp-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          id="ftp-modal-container"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col text-slate-100 my-auto"
        >
          {/* Cabecera del Modal */}
          <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 px-6 py-4 border-b border-slate-700/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-white">Despliegue Directo a Hosting (FTP / FTPS)</h3>
                  <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    Sin Descarga Manual
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configura los accesos y sube directamente la landing page, imágenes y páginas a tu servidor.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Contenido con el Formulario */}
          <div className="p-6 max-h-[75vh] overflow-y-auto scrollbar-thin">
            <FtpDeployForm data={data} />
          </div>

          {/* Pie de Modal */}
          <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex items-center justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
