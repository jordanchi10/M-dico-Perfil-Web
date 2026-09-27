import { useState, useEffect, useRef, useMemo } from "react";
import {
  Terminal,
  Copy,
  Check,
  Download,
  Trash2,
  Search,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  FileCode,
  FileCheck,
  Server,
  ArrowDown,
  RefreshCw,
  Sparkles,
  HelpCircle,
  Maximize2,
  Minimize2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export type FtpLogLevel = "info" | "file" | "success" | "warning" | "error";

export interface FtpLogEntry {
  id: string;
  timestamp: string;
  level: FtpLogLevel;
  message: string;
  details?: any;
  hint?: string;
  step?: string;
}

interface FtpLogsPanelProps {
  logs: FtpLogEntry[];
  onClearLogs?: () => void;
  isStreaming?: boolean;
  status?: "idle" | "testing" | "uploading" | "success" | "error";
  uploadProgress?: number;
  onRetry?: () => void;
  className?: string;
  maxHeight?: string;
}

export function FtpLogsPanel({
  logs,
  onClearLogs,
  isStreaming = false,
  status = "idle",
  uploadProgress = 0,
  onRetry,
  className = "",
  maxHeight = "360px"
}: FtpLogsPanelProps) {
  const [filterLevel, setFilterLevel] = useState<"all" | FtpLogLevel>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [autoScroll, setAutoScroll] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesLevel = filterLevel === "all" || log.level === filterLevel;
      const matchesQuery =
        searchQuery.trim() === "" ||
        log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.hint && log.hint.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (log.details && JSON.stringify(log.details).toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesLevel && matchesQuery;
    });
  }, [logs, filterLevel, searchQuery]);

  // Statistics counts
  const stats = useMemo(() => {
    let files = 0;
    let errors = 0;
    let successes = 0;
    let warnings = 0;

    logs.forEach((l) => {
      if (l.level === "file") files++;
      if (l.level === "error") errors++;
      if (l.level === "success") successes++;
      if (l.level === "warning") warnings++;
    });

    return { total: logs.length, files, errors, successes, warnings };
  }, [logs]);

  // Copy all formatted logs
  const handleCopyLogs = () => {
    if (logs.length === 0) return;
    const formattedText = logs
      .map((l) => `[${l.timestamp}] [${l.level.toUpperCase()}] ${l.message}${l.hint ? `\n   -> Sugerencia: ${l.hint}` : ""}`)
      .join("\n");

    navigator.clipboard.writeText(formattedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download log file
  const handleDownloadLogs = () => {
    if (logs.length === 0) return;
    const header = `=== REGISTRO DE DESPLIEGUE FTP - MEDICOEC ===\nFecha: ${new Date().toLocaleString("es-EC")}\nTotal registros: ${logs.length}\nArchivos: ${stats.files} | Errores: ${stats.errors} | Éxitos: ${stats.successes}\n\n`;
    const formattedText = header + logs
      .map((l) => `[${l.timestamp}] [${l.level.toUpperCase()}] ${l.message}${l.hint ? `\n   -> Diagnóstico: ${l.hint}` : ""}`)
      .join("\n");

    const blob = new Blob([formattedText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ftp-deploy-log-${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Badges styling
  const getLevelBadge = (level: FtpLogLevel) => {
    switch (level) {
      case "error":
        return {
          bg: "bg-rose-950/70 border-rose-700/60 text-rose-300",
          tag: "ERROR",
          icon: <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
        };
      case "warning":
        return {
          bg: "bg-amber-950/70 border-amber-700/60 text-amber-300",
          tag: "WARN",
          icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        };
      case "file":
        return {
          bg: "bg-teal-950/70 border-teal-700/60 text-teal-300",
          tag: "FILE",
          icon: <FileCode className="w-3.5 h-3.5 text-teal-400 shrink-0" />
        };
      case "success":
        return {
          bg: "bg-emerald-950/70 border-emerald-700/60 text-emerald-300",
          tag: "OK",
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        };
      case "info":
      default:
        return {
          bg: "bg-slate-900 border-slate-700 text-slate-300",
          tag: "INFO",
          icon: <Terminal className="w-3.5 h-3.5 text-blue-400 shrink-0" />
        };
    }
  };

  return (
    <div
      id="ftp-logs-panel"
      className={`bg-slate-950 rounded-2xl border border-slate-800 flex flex-col overflow-hidden shadow-2xl transition-all duration-300 ${
        isExpanded ? "fixed inset-4 z-50 shadow-2xl bg-slate-950" : ""
      } ${className}`}
    >
      {/* Barra Superior / Header de la Consola */}
      <div className="bg-slate-900/90 px-4 py-3 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Terminal className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-black text-white tracking-wide flex items-center gap-1.5">
                Logs de Despliegue FTP & Diagnóstico
              </h4>
              {isStreaming ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded-full animate-pulse font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Transmitiendo ({uploadProgress}%)
                </span>
              ) : status === "success" ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-700/60 px-2 py-0.5 rounded-full font-mono">
                  <Check className="w-2.5 h-2.5" /> Finalizado con éxito
                </span>
              ) : status === "error" ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-300 bg-rose-950/60 border border-rose-700/60 px-2 py-0.5 rounded-full font-mono">
                  <AlertCircle className="w-2.5 h-2.5" /> Error detectado
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {/* Acciones Rápidas: Copiar, Descargar, Limpiar, Expandir */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={handleCopyLogs}
            disabled={logs.length === 0}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 font-bold text-[11px] rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Copiar todos los logs al portapapeles"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
            <span>{copied ? "Copiado" : "Copiar"}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadLogs}
            disabled={logs.length === 0}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 font-bold text-[11px] rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Descargar archivo de registro .txt"
          >
            <Download className="w-3 h-3 text-slate-400" />
            <span>Descargar</span>
          </button>

          {onClearLogs && (
            <button
              type="button"
              onClick={onClearLogs}
              disabled={logs.length === 0}
              className="p-1.5 bg-slate-800 hover:bg-rose-900/40 hover:text-rose-300 disabled:opacity-40 text-slate-400 rounded-lg border border-slate-700 transition-colors cursor-pointer"
              title="Limpiar consola"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors cursor-pointer hidden sm:flex items-center justify-center"
            title={isExpanded ? "Reducir tamaño" : "Ver en pantalla completa"}
          >
            {isExpanded ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-slate-900/50 px-4 py-2 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2.5 text-xs">
        
        {/* Píldoras de Filtro por Nivel */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
          <button
            type="button"
            onClick={() => setFilterLevel("all")}
            className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold transition-all cursor-pointer ${
              filterLevel === "all"
                ? "bg-slate-700 text-white shadow-sm"
                : "bg-slate-900/80 text-slate-400 hover:text-slate-200"
            }`}
          >
            Todos ({stats.total})
          </button>

          <button
            type="button"
            onClick={() => setFilterLevel("file")}
            className={`px-2 py-1 rounded-md text-[10px] font-mono font-bold transition-all flex items-center gap-1 cursor-pointer ${
              filterLevel === "file"
                ? "bg-teal-900 text-teal-200 border border-teal-600/60"
                : "bg-slate-900/80 text-teal-400 hover:bg-slate-800"
            }`}
          >
            <FileCode className="w-3 h-3" /> Archivos ({stats.files})
          </button>

          <button
            type="button"
            onClick={() => setFilterLevel("success")}
            className={`px-2 py-1 rounded-md text-[10px] font-mono font-bold transition-all flex items-center gap-1 cursor-pointer ${
              filterLevel === "success"
                ? "bg-emerald-900 text-emerald-200 border border-emerald-600/60"
                : "bg-slate-900/80 text-emerald-400 hover:bg-slate-800"
            }`}
          >
            <Check className="w-3 h-3" /> Éxitos ({stats.successes})
          </button>

          {stats.warnings > 0 && (
            <button
              type="button"
              onClick={() => setFilterLevel("warning")}
              className={`px-2 py-1 rounded-md text-[10px] font-mono font-bold transition-all flex items-center gap-1 cursor-pointer ${
                filterLevel === "warning"
                  ? "bg-amber-900 text-amber-200 border border-amber-600/60"
                  : "bg-slate-900/80 text-amber-400 hover:bg-slate-800"
              }`}
            >
              <AlertTriangle className="w-3 h-3" /> Avisos ({stats.warnings})
            </button>
          )}

          {stats.errors > 0 && (
            <button
              type="button"
              onClick={() => setFilterLevel("error")}
              className={`px-2 py-1 rounded-md text-[10px] font-mono font-bold transition-all flex items-center gap-1 cursor-pointer ${
                filterLevel === "error"
                  ? "bg-rose-900 text-rose-200 border border-rose-600/60 animate-pulse"
                  : "bg-slate-900/80 text-rose-400 hover:bg-slate-800"
              }`}
            >
              <AlertCircle className="w-3 h-3" /> Errores ({stats.errors})
            </button>
          )}
        </div>

        {/* Buscador y Auto-scroll toggle */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3 h-3 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filtrar por archivo o texto..."
              className="bg-slate-950 border border-slate-800 rounded-lg pl-7 pr-2.5 py-1 text-[11px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 font-mono w-40 sm:w-48"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-[10px]"
              >
                ✕
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setAutoScroll(!autoScroll)}
            className={`px-2 py-1 rounded-lg border text-[10px] font-mono flex items-center gap-1 transition-colors cursor-pointer ${
              autoScroll
                ? "bg-emerald-950/60 border-emerald-800/60 text-emerald-300"
                : "bg-slate-900 border-slate-700 text-slate-500"
            }`}
            title="Desplazamiento automático al recibir nuevos eventos"
          >
            <ArrowDown className="w-2.5 h-2.5" />
            <span>Auto-scroll</span>
          </button>
        </div>
      </div>

      {/* Cuerpo Principal de la Consola (Logs Stream) */}
      <div
        ref={scrollContainerRef}
        style={{ height: isExpanded ? "calc(100vh - 170px)" : maxHeight }}
        className="p-3.5 font-mono text-[11px] overflow-y-auto space-y-1.5 scrollbar-thin bg-slate-950/95 leading-relaxed selection:bg-emerald-900 selection:text-white"
      >
        {filteredLogs.length === 0 ? (
          <div className="h-full min-h-[180px] flex flex-col items-center justify-center text-center text-slate-500 p-6 space-y-2">
            <Server className="w-8 h-8 text-slate-600 opacity-40" />
            <div className="text-xs font-bold text-slate-400">Consola de Despliegue en Espera</div>
            <p className="text-[11px] text-slate-500 max-w-sm">
              Aquí se registrarán en tiempo real la compresión de imágenes WebP, generación de HTML semántico, autenticación FTP y transferencia binaria archivo por archivo.
            </p>
          </div>
        ) : (
          filteredLogs.map((log, index) => {
            const badge = getLevelBadge(log.level);
            return (
              <div
                key={log.id || `log-${index}`}
                className={`p-2 rounded-lg border transition-all flex flex-col gap-1 ${
                  log.level === "error"
                    ? "bg-rose-950/40 border-rose-800/60 text-rose-200"
                    : log.level === "warning"
                    ? "bg-amber-950/30 border-amber-800/50 text-amber-200"
                    : log.level === "file"
                    ? "bg-teal-950/20 border-teal-900/40 text-teal-200 hover:bg-teal-950/30"
                    : log.level === "success"
                    ? "bg-emerald-950/20 border-emerald-900/40 text-emerald-200"
                    : "bg-slate-900/40 border-slate-800/40 text-slate-300"
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-[10px] text-slate-500 select-none shrink-0 pt-0.5">
                    {log.timestamp}
                  </span>

                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0 uppercase tracking-wider ${badge.bg}`}
                  >
                    {badge.tag}
                  </span>

                  <div className="flex-1 break-all">
                    <span>{log.message}</span>

                    {/* Metadatos extra de archivo si existen */}
                    {log.details && log.details.file && (
                      <span className="ml-2 text-[10px] text-teal-400 bg-teal-950/80 px-1.5 py-0.5 rounded border border-teal-800/40">
                        {log.details.bytes ? `${(log.details.bytes / 1024).toFixed(1)} KB` : ""}
                        {log.details.durationMs ? ` • ${log.details.durationMs}ms` : ""}
                      </span>
                    )}
                  </div>
                </div>

                {/* Tarjeta de Sugerencia / Diagnóstico de Error */}
                {log.hint && (
                  <div className="mt-1 ml-6 p-2 rounded bg-amber-950/60 border border-amber-800/50 text-[10px] text-amber-300 flex items-start gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-amber-200">Diagnóstico Sugerido: </strong>
                      {log.hint}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Indicador de transmisión activa al final */}
        {isStreaming && (
          <div className="flex items-center gap-2 text-emerald-400 text-[11px] p-2 bg-emerald-950/30 rounded-lg border border-emerald-800/40 animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400 shrink-0" />
            <span>Transfiriendo datos al hosting...</span>
          </div>
        )}
      </div>

      {/* Footer Resumen de la Consola */}
      {logs.length > 0 && (
        <div className="bg-slate-900/90 px-4 py-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2 shrink-0 font-mono">
          <div className="flex items-center gap-3">
            <span>
              Total eventos: <strong className="text-white">{stats.total}</strong>
            </span>
            <span>
              Archivos: <strong className="text-teal-300">{stats.files}</strong>
            </span>
            {stats.errors > 0 && (
              <span className="text-rose-400 font-bold flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {stats.errors} error{stats.errors > 1 ? "es" : ""}
              </span>
            )}
          </div>

          {status === "error" && onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" /> Reintentar Despliegue
            </button>
          )}
        </div>
      )}
    </div>
  );
}
