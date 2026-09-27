/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { MedicalLandingData, SavedClientProfile } from "../types";
import { 
  getSavedProfiles, 
  saveProfile, 
  updateProfileTag,
  deleteProfile, 
  duplicateProfile, 
  parseImportFile, 
  downloadProfileAsJson, 
  downloadAllProfilesBackup, 
  importBatchProfiles,
  getActiveProfileId,
  setActiveProfileId,
  createNewBlankProfile
} from "../utils/profileStorage";
import { motion, AnimatePresence } from "motion/react";
import { 
  FolderArchive, 
  Upload, 
  Download, 
  Search, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  Users, 
  FileJson, 
  Stethoscope, 
  MapPin, 
  Building2, 
  Calendar, 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  X,
  Layers,
  Save,
  RotateCcw,
  ExternalLink,
  UserPlus,
  Tag,
  Clock,
  Edit3,
  Filter
} from "lucide-react";

interface ClientManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentData: MedicalLandingData;
  onLoadProfile: (data: MedicalLandingData, profileId?: string) => void;
}

type TabType = "import" | "catalog" | "export";

export function ClientManagerModal({
  isOpen,
  onClose,
  currentData,
  onLoadProfile
}: ClientManagerModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("catalog");
  const [savedProfiles, setSavedProfiles] = useState<SavedClientProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeProfileIdState, setActiveProfileIdState] = useState<string | null>(null);

  // Estados para filtro y edición de etiqueta de especialidad
  const [selectedSpecialtyFilter, setSelectedSpecialtyFilter] = useState<string>("todas");
  const [editingTagProfileId, setEditingTagProfileId] = useState<string | null>(null);
  const [editingTagValue, setEditingTagValue] = useState("");
  const [tagSaveSuccessId, setTagSaveSuccessId] = useState<string | null>(null);

  // Estados para Importación
  const [pastedJson, setPastedJson] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [importStatus, setImportStatus] = useState<{
    type: "success" | "error" | "info" | null;
    message: string;
    parsedData?: MedicalLandingData;
    parsedProfiles?: SavedClientProfile[];
    doctor?: string;
    especialidad?: string;
    ciudad?: string;
  }>({ type: null, message: "" });
  const [saveToCatalogOnImport, setSaveToCatalogOnImport] = useState(true);

  // Estados para Guardar Cliente Actual
  const [saveClientName, setSaveClientName] = useState("");
  const [saveClientSpecialtyTag, setSaveClientSpecialtyTag] = useState("");
  const [saveClientNotes, setSaveClientNotes] = useState("");
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");
  const [copiedJson, setCopiedJson] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<{ id: string; name: string } | null>(null);

  // Estado para modal de "Crear Cliente Nuevo desde Cero"
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [newClientForm, setNewClientForm] = useState({
    nombreMedico: "",
    especialidad: "",
    etiquetaEspecialidad: "",
    ciudad: "Quito",
    tipoEnfoque: "medico" as "medico" | "clinica",
    notas: ""
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const batchFileInputRef = useRef<HTMLInputElement>(null);

  // Formateadores de fecha y hora para auditoría visible
  const formatDateTimeShort = (isoString?: string) => {
    if (!isoString) return "--/--/----";
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return "--/--/----";
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, "0");
      const minutes = String(d.getMinutes()).padStart(2, "0");
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch {
      return "--/--/----";
    }
  };

  const formatFullDateTime = (isoString?: string) => {
    if (!isoString) return "";
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return "";
      return d.toLocaleString("es-EC", {
        dateStyle: "medium",
        timeStyle: "short"
      });
    } catch {
      return "";
    }
  };

  // Cargar lista de perfiles al abrir
  useEffect(() => {
    if (isOpen) {
      refreshProfiles();
      const currentActiveId = getActiveProfileId();
      setActiveProfileIdState(currentActiveId);
      
      const defaultName = `${currentData.nombreMedico || "Dr. Médico"} - ${currentData.especialidad || "Especialidad"} (${currentData.ciudad || "Ecuador"})`;
      setSaveClientName(defaultName);
      setSaveClientSpecialtyTag(currentData.especialidad || "Medicina General");
    }
  }, [isOpen, currentData]);

  const refreshProfiles = () => {
    const list = getSavedProfiles();
    setSavedProfiles(list);
  };

  // Manejadores para edición inline de etiqueta de especialidad en tarjeta
  const handleStartEditTag = (profile: SavedClientProfile) => {
    setEditingTagProfileId(profile.id);
    setEditingTagValue(profile.etiquetaEspecialidad || profile.especialidad || "");
  };

  const handleSaveTag = (profileId: string) => {
    const cleanTag = editingTagValue.trim();
    updateProfileTag(profileId, cleanTag);
    refreshProfiles();
    setEditingTagProfileId(null);
    setTagSaveSuccessId(profileId);
    setTimeout(() => setTagSaveSuccessId(null), 2500);
  };

  const handleCancelEditTag = () => {
    setEditingTagProfileId(null);
    setEditingTagValue("");
  };

  // Resumen estadístico agrupado de especialidades para organizar
  const specialtyStats = React.useMemo(() => {
    const counts: Record<string, number> = {};
    savedProfiles.forEach(p => {
      const tag = (p.etiquetaEspecialidad || p.especialidad || "Medicina General").trim();
      counts[tag] = (counts[tag] || 0) + 1;
    });
    return counts;
  }, [savedProfiles]);

  const uniqueSpecialties = Object.keys(specialtyStats).sort();

  // Manejador para cargar un archivo
  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (!content) return;
      processFileContent(content, file.name);
    };
    reader.readAsText(file);
  };

  const processFileContent = (content: string, fileName?: string) => {
    const result = parseImportFile(content, fileName);
    if (result.success) {
      if (result.tipo === "lote" && result.profiles) {
        setImportStatus({
          type: "success",
          message: result.message,
          parsedProfiles: result.profiles
        });
      } else if (result.data) {
        setImportStatus({
          type: "success",
          message: result.message,
          parsedData: result.data,
          doctor: result.doctorDetectado,
          especialidad: result.especialidadDetectada,
          ciudad: result.ciudadDetectada
        });
      }
    } else {
      setImportStatus({
        type: "error",
        message: result.message
      });
    }
  };

  // Aplicar datos importados
  const handleApplyImportedData = () => {
    if (importStatus.parsedData) {
      let newProfileId: string | undefined;
      if (saveToCatalogOnImport) {
        const saved = saveProfile(importStatus.parsedData);
        newProfileId = saved.id;
        setActiveProfileIdState(saved.id);
        refreshProfiles();
      }
      onLoadProfile(importStatus.parsedData, newProfileId);
      onClose();
    } else if (importStatus.parsedProfiles && importStatus.parsedProfiles.length > 0) {
      importBatchProfiles(importStatus.parsedProfiles, true);
      refreshProfiles();
      setActiveTab("catalog");
      setImportStatus({
        type: "info",
        message: `¡${importStatus.parsedProfiles.length} perfiles importados a la biblioteca! Puedes seleccionar cualquiera para cargarlo.`
      });
    }
  };

  // Guardar datos actuales del formulario como perfil en catálogo
  const handleSaveCurrentAsProfile = () => {
    const saved = saveProfile(
      currentData,
      saveClientName,
      undefined,
      saveClientNotes,
      saveClientSpecialtyTag
    );
    setActiveProfileIdState(saved.id);
    refreshProfiles();
    setSaveSuccessMsg("¡Cliente guardado exitosamente en tu catálogo local con su etiqueta!");
    setTimeout(() => setSaveSuccessMsg(""), 3500);
  };

  // Actualizar perfil existente si hay uno activo
  const handleUpdateActiveProfile = () => {
    if (!activeProfileIdState) return;
    const existing = savedProfiles.find(p => p.id === activeProfileIdState);
    if (!existing) return;

    saveProfile(
      currentData,
      existing.nombreCliente,
      activeProfileIdState,
      saveClientNotes || existing.notasInternas,
      saveClientSpecialtyTag || existing.etiquetaEspecialidad
    );
    refreshProfiles();
    setSaveSuccessMsg(`¡Cambios guardados en "${existing.nombreCliente}"!`);
    setTimeout(() => setSaveSuccessMsg(""), 3500);
  };

  // Cargar perfil desde la lista
  const handleSelectProfile = (profile: SavedClientProfile) => {
    setActiveProfileId(profile.id);
    setActiveProfileIdState(profile.id);
    onLoadProfile(profile.data, profile.id);
    onClose();
  };

  // Eliminar perfil
  const handleDeleteProfile = (id: string, name: string) => {
    setProfileToDelete({ id, name });
  };

  const handleConfirmDeleteProfile = () => {
    if (profileToDelete) {
      deleteProfile(profileToDelete.id);
      refreshProfiles();
      if (activeProfileIdState === profileToDelete.id) {
        setActiveProfileIdState(null);
      }
      setProfileToDelete(null);
    }
  };

  // Duplicar perfil
  const handleDuplicateProfile = (id: string) => {
    duplicateProfile(id);
    refreshProfiles();
  };

  // Crear Cliente Nuevo desde Cero
  const handleCreateNewClient = () => {
    const doctorName = newClientForm.nombreMedico.trim() || (newClientForm.tipoEnfoque === "clinica" ? "Centro Médico Especializado" : "Dr. Nuevo Médico");
    const especialidad = newClientForm.especialidad.trim() || (newClientForm.tipoEnfoque === "clinica" ? "Polivalente / Especialidades Médicas" : "Medicina General");
    const etiquetaEspecialidad = newClientForm.etiquetaEspecialidad.trim() || especialidad;
    const ciudad = newClientForm.ciudad.trim() || "Quito";

    const newSavedProfile = createNewBlankProfile({
      nombreMedico: doctorName,
      especialidad: especialidad,
      etiquetaEspecialidad: etiquetaEspecialidad,
      ciudad: ciudad,
      tipoEnfoque: newClientForm.tipoEnfoque,
      notas: newClientForm.notas.trim() || undefined
    });

    refreshProfiles();
    setActiveProfileIdState(newSavedProfile.id);
    setActiveProfileId(newSavedProfile.id);
    setIsNewClientModalOpen(false);

    // Cargar inmediatamente el nuevo perfil limpio en el formulario y la vista previa
    onLoadProfile(newSavedProfile.data, newSavedProfile.id);
    onClose();
  };

  // Filtrado de perfiles considerando búsqueda y organización por especialidad
  const filteredProfiles = savedProfiles.filter(p => {
    // Filtro por especialidad / etiqueta
    if (selectedSpecialtyFilter !== "todas") {
      const pTag = (p.etiquetaEspecialidad || p.especialidad || "").toLowerCase().trim();
      if (pTag !== selectedSpecialtyFilter.toLowerCase().trim()) {
        return false;
      }
    }

    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      p.nombreCliente.toLowerCase().includes(q) ||
      p.nombreMedico.toLowerCase().includes(q) ||
      p.especialidad.toLowerCase().includes(q) ||
      (p.etiquetaEspecialidad && p.etiquetaEspecialidad.toLowerCase().includes(q)) ||
      p.ciudad.toLowerCase().includes(q) ||
      p.clinica.toLowerCase().includes(q) ||
      (p.notasInternas && p.notasInternas.toLowerCase().includes(q))
    );
  });

  // Exportar JSON del actual
  const handleCopyCurrentJson = () => {
    const payload = {
      version: "1.0",
      tipoExportacion: "individual",
      fechaExportacion: new Date().toISOString(),
      data: currentData
    };
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2)).then(() => {
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2500);
    });
  };

  if (!isOpen) return null;

  return (
    <div 
      id="client-manager-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        id="client-manager-modal-container"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-slate-800 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* CABECERA DEL MODAL */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white p-5 sm:p-6 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300 shadow-inner shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                  Gestor de Clientes Médicos
                  <span className="text-[10px] font-extrabold uppercase bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded-full">
                    Multi-Perfil & Backup
                  </span>
                </h2>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Importa, edita y exporta configuraciones de más de 100 perfiles de doctores sin empezar de cero.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* SELECTOR DE PESTAÑAS */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 sm:px-6 pt-2 shrink-0 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("catalog")}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-extrabold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "catalog"
                  ? "border-blue-600 text-blue-600 bg-white rounded-t-lg shadow-2xs"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              <Users className="w-4 h-4 text-blue-600" />
              <span>Mis Clientes Guardados</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                {savedProfiles.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("import")}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-extrabold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "import"
                  ? "border-blue-600 text-blue-600 bg-white rounded-t-lg shadow-2xs"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              <Upload className="w-4 h-4 text-emerald-600" />
              <span>Importar Cliente (.json / .html)</span>
            </button>

            <button
              onClick={() => setActiveTab("export")}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-extrabold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "export"
                  ? "border-blue-600 text-blue-600 bg-white rounded-t-lg shadow-2xs"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              <Download className="w-4 h-4 text-indigo-600" />
              <span>Guardar / Exportar Actual</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-500 pb-2">
            {activeProfileIdState ? (
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Perfil Vinculado
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 bg-slate-200 text-slate-600 px-2.5 py-1 rounded-full font-semibold">
                Sin vincular
              </span>
            )}
          </div>
        </div>

        {/* CUERPO DEL CONTENIDO */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 bg-white">
          
          {/* =========================================================
              PESTAÑA 1: MIS CLIENTES GUARDADOS (CATÁLOGO MULTI-PERFIL)
              ========================================================= */}
          {activeTab === "catalog" && (
            <div className="space-y-5">
              {/* Barra de búsqueda y acciones masivas */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por médico, especialidad, ciudad (Quito, Guayaquil...) o clínica..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                    >
                      Limpiar
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      setNewClientForm({
                        nombreMedico: "",
                        especialidad: "",
                        etiquetaEspecialidad: "",
                        ciudad: "Quito",
                        tipoEnfoque: "medico",
                        notas: ""
                      });
                      setIsNewClientModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold shadow-xs transition-all cursor-pointer hover:scale-[1.02] active:scale-98"
                    title="Crear un nuevo médico o clínica desde cero con plantilla limpia"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>+ Nuevo Cliente (Desde Cero)</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("export")}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold shadow-xs transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Guardar Actual</span>
                  </button>

                  <button
                    onClick={() => downloadAllProfilesBackup()}
                    disabled={savedProfiles.length === 0}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold shadow-xs transition-all cursor-pointer disabled:opacity-40"
                    title="Descargar un único archivo JSON de Backup Total con todos tus clientes y sus etiquetas de especialidad incluidas"
                  >
                    <FolderArchive className="w-4 h-4 text-blue-400" />
                    <span className="hidden md:inline">Backup Total ({savedProfiles.length})</span>
                    <span className="md:hidden">Backup ({savedProfiles.length})</span>
                  </button>
                </div>
              </div>

              {/* BARRA DE ORGANIZACIÓN POR ESPECIALIDAD */}
              {savedProfiles.length > 0 && uniqueSpecialties.length > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 bg-slate-50 border border-slate-200/90 rounded-2xl shadow-2xs">
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs flex-1">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1 shrink-0 mr-1">
                      <Filter className="w-3.5 h-3.5 text-blue-600" />
                      <span>Organizar:</span>
                    </span>
                    <button
                      onClick={() => setSelectedSpecialtyFilter("todas")}
                      className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer text-xs ${
                        selectedSpecialtyFilter === "todas"
                          ? "bg-slate-900 text-white shadow-xs"
                          : "bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200"
                      }`}
                    >
                      Todas ({savedProfiles.length})
                    </button>
                    {uniqueSpecialties.map((esp) => {
                      const isSelected = selectedSpecialtyFilter.toLowerCase() === esp.toLowerCase();
                      return (
                        <button
                          key={esp}
                          onClick={() => setSelectedSpecialtyFilter(isSelected ? "todas" : esp)}
                          className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer text-xs flex items-center gap-1.5 ${
                            isSelected
                              ? "bg-blue-600 text-white shadow-xs ring-2 ring-blue-300"
                              : "bg-white text-blue-900 border border-blue-200 hover:bg-blue-50"
                          }`}
                          title={`Filtrar médicos con la etiqueta ${esp}`}
                        >
                          <Tag className="w-3 h-3 text-blue-500" />
                          <span>{esp}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                            isSelected ? "bg-blue-700 text-white" : "bg-blue-100 text-blue-800"
                          }`}>
                            {specialtyStats[esp]}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {selectedSpecialtyFilter !== "todas" && (
                    <div className="flex items-center gap-2 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                      <button
                        onClick={() => downloadAllProfilesBackup(selectedSpecialtyFilter)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
                        title={`Exportar backup JSON únicamente de la especialidad ${selectedSpecialtyFilter}`}
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Backup {selectedSpecialtyFilter} ({filteredProfiles.length})</span>
                      </button>
                      <button
                        onClick={() => setSelectedSpecialtyFilter("todas")}
                        className="text-[11px] text-slate-500 hover:text-slate-800 font-semibold underline cursor-pointer"
                      >
                        Ver todas
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Mensaje de estado info si existe */}
              {importStatus.type === "info" && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 flex items-center justify-between">
                  <span>{importStatus.message}</span>
                  <button 
                    onClick={() => setImportStatus({ type: null, message: "" })} 
                    className="text-blue-600 font-bold ml-2 hover:underline"
                  >
                    Entendido
                  </button>
                </div>
              )}

              {/* Lista de perfiles */}
              {savedProfiles.length === 0 ? (
                <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 rounded-2xl space-y-3 bg-slate-50/50">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 shadow-2xs">
                    <Users className="w-7 h-7" />
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-900">Aún no tienes perfiles guardados en tu catálogo</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Guarda la configuración del doctor actual o importa archivos .json de clientes anteriores para administrarlos rápidamente.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                    <button
                      onClick={() => {
                        setNewClientForm({
                          nombreMedico: "",
                          especialidad: "",
                          etiquetaEspecialidad: "",
                          ciudad: "Quito",
                          tipoEnfoque: "medico",
                          notas: ""
                        });
                        setIsNewClientModalOpen(true);
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Crear Cliente Nuevo desde Cero</span>
                    </button>
                    <button
                      onClick={() => setActiveTab("export")}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      Guardar configuración actual
                    </button>
                    <button
                      onClick={() => setActiveTab("import")}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Importar archivo .json
                    </button>
                  </div>
                </div>
              ) : filteredProfiles.length === 0 ? (
                <div className="text-center py-10 border border-slate-200 rounded-2xl bg-slate-50 text-slate-500 text-xs">
                  No se encontraron clientes que coincidan con "<strong>{searchQuery}</strong>" {selectedSpecialtyFilter !== "todas" ? `en la especialidad ${selectedSpecialtyFilter}` : ""}.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {filteredProfiles.map((p) => {
                    const isActive = p.id === activeProfileIdState;
                    return (
                      <div
                        key={p.id}
                        className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                          isActive
                            ? "bg-blue-50/70 border-blue-300 ring-2 ring-blue-500/20 shadow-xs"
                            : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs"
                        }`}
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                                {p.nombreMedico?.replace(/^Dr\.\s*|^Dra\.\s*/i, "").charAt(0) || "M"}
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-tight truncate">
                                  {p.nombreCliente}
                                </h4>
                                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                                  <Stethoscope className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span className="font-medium text-slate-600 truncate">{p.especialidad}</span>
                                </div>
                              </div>
                            </div>

                            {isActive && (
                              <span className="text-[10px] font-black uppercase tracking-wider bg-blue-600 text-white px-2 py-0.5 rounded-full shrink-0">
                                Activo
                              </span>
                            )}
                          </div>

                          {/* ETIQUETA EDITABLE DE ESPECIALIDAD */}
                          <div>
                            {editingTagProfileId === p.id ? (
                              <div className="p-2 bg-blue-50 border border-blue-300 rounded-xl space-y-1.5 animate-in fade-in duration-150">
                                <div className="flex items-center justify-between text-[10px] font-bold text-blue-800">
                                  <span className="flex items-center gap-1">
                                    <Tag className="w-3 h-3 text-blue-600" />
                                    <span>Editar etiqueta de especialidad:</span>
                                  </span>
                                  <span className="text-slate-400 font-normal">Enter para guardar</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="text"
                                    value={editingTagValue}
                                    onChange={(e) => setEditingTagValue(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") handleSaveTag(p.id);
                                      if (e.key === "Escape") handleCancelEditTag();
                                    }}
                                    placeholder="Ej. Dermatología, Pediatría..."
                                    className="flex-1 px-2.5 py-1 text-xs font-bold text-slate-800 bg-white border border-blue-300 rounded-lg outline-hidden focus:ring-2 focus:ring-blue-400"
                                    autoFocus
                                  />
                                  <button
                                    onClick={() => handleSaveTag(p.id)}
                                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                                    title="Guardar etiqueta"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Guardar</span>
                                  </button>
                                  <button
                                    onClick={handleCancelEditTag}
                                    className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors"
                                    title="Cancelar"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 flex-wrap">
                                <span
                                  onClick={() => handleStartEditTag(p)}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50/90 hover:bg-blue-100 border border-blue-200/80 text-blue-800 text-xs font-bold cursor-pointer transition-all group shadow-2xs"
                                  title="Haz clic para editar la etiqueta de especialidad de este médico"
                                >
                                  <Tag className="w-3 h-3 text-blue-600 group-hover:scale-110 transition-transform shrink-0" />
                                  <span>{p.etiquetaEspecialidad || p.especialidad}</span>
                                  <Edit3 className="w-3 h-3 text-blue-400 group-hover:text-blue-700 ml-0.5 opacity-70 group-hover:opacity-100 transition-opacity" />
                                </span>

                                {tagSaveSuccessId === p.id && (
                                  <span className="text-[11px] font-bold text-emerald-600 animate-in fade-in flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                    <Check className="w-3 h-3" /> ¡Etiqueta actualizada!
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Ubicación y Clínica */}
                          <div className="flex items-center gap-2 flex-wrap text-[11px] text-slate-600 pt-1 border-t border-slate-100">
                            <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                              <MapPin className="w-3 h-3 text-red-500" />
                              {p.ciudad}
                            </span>
                            <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md font-medium truncate max-w-[180px]">
                              <Building2 className="w-3 h-3 text-slate-400" />
                              {p.clinica}
                            </span>
                          </div>

                          {/* FECHAS: Creación y Última Actualización */}
                          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1.5 border-t border-slate-100 bg-slate-50/80 p-2 rounded-xl">
                            <div 
                              className="flex items-center gap-2 min-w-0" 
                              title={`Fecha de creación del perfil: ${formatFullDateTime(p.fechaCreacion)}`}
                            >
                              <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                                <Calendar className="w-3.5 h-3.5" />
                              </div>
                              <div className="min-w-0 leading-tight">
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Creación</span>
                                <span className="text-[11px] font-bold text-slate-700 truncate block">
                                  {formatDateTimeShort(p.fechaCreacion)}
                                </span>
                              </div>
                            </div>

                            <div 
                              className="flex items-center gap-2 min-w-0" 
                              title={`Última modificación o actualización: ${formatFullDateTime(p.fechaActualizacion)}`}
                            >
                              <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                                <Clock className="w-3.5 h-3.5" />
                              </div>
                              <div className="min-w-0 leading-tight">
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Actualizado</span>
                                <span className="text-[11px] font-bold text-slate-700 truncate block">
                                  {formatDateTimeShort(p.fechaActualizacion)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {p.notasInternas && (
                            <p className="text-[11px] text-slate-500 italic bg-amber-50/70 border border-amber-200/60 p-1.5 rounded-lg">
                              📝 {p.notasInternas}
                            </p>
                          )}
                        </div>

                        {/* Botones de acción del perfil */}
                        <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-slate-100">
                          <button
                            onClick={() => handleSelectProfile(p)}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-blue-600 text-white font-extrabold text-xs transition-colors cursor-pointer"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                            <span>Cargar en Editor</span>
                          </button>

                          <button
                            onClick={() => downloadProfileAsJson(p.data, `perfil-${p.nombreMedico.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.json`, p.etiquetaEspecialidad || p.especialidad)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                            title="Descargar archivo JSON individual con etiqueta de especialidad y fechas"
                          >
                            <FileJson className="w-4 h-4 text-indigo-600" />
                          </button>

                          <button
                            onClick={() => handleDuplicateProfile(p.id)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                            title="Duplicar / Clonar perfil"
                          >
                            <Copy className="w-4 h-4 text-slate-600" />
                          </button>

                          <button
                            onClick={() => handleDeleteProfile(p.id, p.nombreCliente)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-400 transition-colors cursor-pointer"
                            title="Eliminar perfil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* =========================================================
              PESTAÑA 2: IMPORTADOR (JSON / HTML / PEGAR)
              ========================================================= */}
          {activeTab === "import" && (
            <div className="space-y-6">
              
              {/* ZONA DRAG & DROP Y EXPLORADOR DE ARCHIVOS */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragActive(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleFileUpload(e.dataTransfer.files[0]);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`p-8 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all ${
                  dragActive 
                    ? "border-blue-500 bg-blue-50/70 scale-99" 
                    : "border-slate-300 hover:border-blue-400 hover:bg-slate-50/70"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,.html"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                />
                <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-3 shadow-2xs">
                  <Upload className="w-7 h-7" />
                </div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Arrastra o selecciona el archivo <span className="text-blue-600 font-mono">.json</span> o <span className="text-indigo-600 font-mono">.html</span> del cliente
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Compatible con archivos exportados previamente, backups individuales o paquetes masivos.
                </p>
                <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50">
                  <FolderArchive className="w-4 h-4 text-blue-600" />
                  Explorar archivo en mi computadora
                </div>
              </div>

              {/* O bien PEGAR JSON DIRECTO */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                  <span>O pega el contenido JSON directamente:</span>
                  {pastedJson && (
                    <button
                      onClick={() => {
                        setPastedJson("");
                        setImportStatus({ type: null, message: "" });
                      }}
                      className="text-[11px] text-red-500 hover:underline font-bold"
                    >
                      Limpiar
                    </button>
                  )}
                </label>
                <textarea
                  value={pastedJson}
                  onChange={(e) => {
                    setPastedJson(e.target.value);
                    if (e.target.value.trim()) {
                      processFileContent(e.target.value);
                    } else {
                      setImportStatus({ type: null, message: "" });
                    }
                  }}
                  rows={4}
                  placeholder='Pega aquí el JSON exportado (ej: { "nombreMedico": "Dr. Carlos...", "especialidad": "..." })'
                  className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
                />
              </div>

              {/* RESULTADO DE LA DETECCIÓN / VALIDACIÓN */}
              {importStatus.type && (
                <div
                  className={`p-4 rounded-2xl border flex flex-col gap-3 ${
                    importStatus.type === "success"
                      ? "bg-emerald-50/80 border-emerald-200 text-emerald-900"
                      : "bg-red-50/80 border-red-200 text-red-900"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {importStatus.type === "success" ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="text-xs font-bold leading-relaxed">{importStatus.message}</p>

                      {/* Detalles detectados */}
                      {importStatus.parsedData && (
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs bg-white/80 p-3 rounded-xl border border-emerald-200/70">
                          <div>
                            <span className="text-[10px] text-slate-500 uppercase font-extrabold block">Médico Detectado</span>
                            <strong className="text-slate-900 font-bold">{importStatus.doctor || "No especificado"}</strong>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 uppercase font-extrabold block">Especialidad</span>
                            <strong className="text-slate-900 font-bold">{importStatus.especialidad || "Medicina"}</strong>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 uppercase font-extrabold block">Ciudad / Ubicación</span>
                            <strong className="text-slate-900 font-bold">{importStatus.ciudad || "Ecuador"}</strong>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {importStatus.type === "success" && (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-emerald-200/60">
                      <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={saveToCatalogOnImport}
                          onChange={(e) => setSaveToCatalogOnImport(e.target.checked)}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                        />
                        <span>Guardar también en mi Biblioteca de Clientes</span>
                      </label>

                      <button
                        onClick={handleApplyImportedData}
                        className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>Cargar en el Editor Inmediatamente</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Botón para Restaurar Lote Masivo */}
              <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900">Restauración Masiva (Backup Completo)</h4>
                  <p className="text-[11px] text-slate-500">¿Tienes un backup con decenas de perfiles? Súbelo para restaurar tu catálogo.</p>
                </div>
                <button
                  onClick={() => batchFileInputRef.current?.click()}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer shrink-0"
                >
                  <FolderArchive className="w-4 h-4 text-indigo-600" />
                  <span>Restaurar Lote de Clientes</span>
                </button>
                <input
                  ref={batchFileInputRef}
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                />
              </div>

            </div>
          )}

          {/* =========================================================
              PESTAÑA 3: GUARDAR / EXPORTAR CLIENTE ACTUAL
              ========================================================= */}
          {activeTab === "export" && (
            <div className="space-y-6">
              
              {/* SECCIÓN 1: GUARDAR EN LA BIBLIOTECA LOCAL */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <Save className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">Guardar en Biblioteca Local</h3>
                    <p className="text-xs text-slate-500">Almacena esta configuración para volver a editarla en cualquier momento con 1 clic.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700">Nombre del Cliente / Doctor:</label>
                    <input
                      type="text"
                      value={saveClientName}
                      onChange={(e) => setSaveClientName(e.target.value)}
                      placeholder="ej: Dr. Alejandro Ruiz - Cardiología (Quito)"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:border-blue-500 outline-hidden"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <Tag className="w-3 h-3 text-blue-600" />
                      <span>Etiqueta de Especialidad:</span>
                    </label>
                    <input
                      type="text"
                      value={saveClientSpecialtyTag}
                      onChange={(e) => setSaveClientSpecialtyTag(e.target.value)}
                      placeholder="ej: Cardiología"
                      className="w-full p-2.5 bg-white border border-blue-200 rounded-xl text-xs font-bold text-blue-900 focus:border-blue-500 outline-hidden"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-3">
                    <label className="text-xs font-bold text-slate-700">Notas Internas de Agencia (Opcional):</label>
                    <input
                      type="text"
                      value={saveClientNotes}
                      onChange={(e) => setSaveClientNotes(e.target.value)}
                      placeholder="ej: Plan Pro, Dominio doctor-ruiz.ec, WhatsApp verificado"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs focus:border-blue-500 outline-hidden"
                    />
                  </div>
                </div>

                {saveSuccessMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{saveSuccessMsg}</span>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={handleSaveCurrentAsProfile}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Guardar como Nuevo Cliente</span>
                  </button>

                  {activeProfileIdState && (
                    <button
                      onClick={handleUpdateActiveProfile}
                      className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Save className="w-4 h-4 text-blue-400" />
                      <span>Sobrescribir Cliente Activo</span>
                    </button>
                  )}
                </div>
              </div>

              {/* SECCIÓN 2: DESCARGAR ARCHIVO JSON DE RESPALDO */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                    <FileJson className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">Exportar Archivo JSON Independiente</h3>
                    <p className="text-xs text-slate-500">Descarga la ficha completa de datos para enviarla, archivarla o importarla en otro equipo.</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                  <button
                    onClick={() => downloadProfileAsJson(currentData)}
                    className="flex-1 px-5 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Descargar perfil-{currentData.nombreMedico.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "cliente"}.json</span>
                  </button>

                  <button
                    onClick={handleCopyCurrentJson}
                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {copiedJson ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-700">¡JSON Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-slate-600" />
                        <span>Copiar JSON</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* PIE DEL MODAL */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Almacenamiento local persistente • Más de 100 perfiles soportados</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold transition-all cursor-pointer"
          >
            Cerrar
          </button>
        </div>

        {/* Modal de Confirmación para Eliminar Perfil */}
        {profileToDelete && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">¿Eliminar perfil de cliente?</h4>
                  <p className="text-xs text-slate-500 font-medium truncate max-w-[200px]">"{profileToDelete.name}"</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Esta acción eliminará el perfil del almacenamiento local de tu navegador. No se podrá recuperar.
              </p>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setProfileToDelete(null)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteProfile}
                  className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm shadow-rose-600/20 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Sí, Eliminar</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal para Crear Cliente Nuevo desde Cero */}
        {isNewClientModalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
              
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0 shadow-2xs">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">Agregar Cliente Nuevo</h3>
                    <p className="text-xs text-slate-500 font-medium">Empieza a construir la landing page médica desde cero</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsNewClientModalOpen(false)}
                  className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Formulario de Inicio Rápido */}
              <div className="space-y-3.5 text-left">
                
                {/* Tipo de Enfoque */}
                <div>
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 block mb-1.5">
                    Tipo de Enfoque Landing
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewClientForm(prev => ({ ...prev, tipoEnfoque: "medico" }))}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                        newClientForm.tipoEnfoque === "medico"
                          ? "bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-100"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <Stethoscope className="w-4 h-4 text-emerald-600" />
                      <span>Médico Especialista</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewClientForm(prev => ({ ...prev, tipoEnfoque: "clinica" }))}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                        newClientForm.tipoEnfoque === "clinica"
                          ? "bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-100"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <Building2 className="w-4 h-4 text-emerald-600" />
                      <span>Clínica / Centro</span>
                    </button>
                  </div>
                </div>

                {/* Nombre del Médico o Clínica */}
                <div>
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 block mb-1">
                    {newClientForm.tipoEnfoque === "clinica" ? "Nombre de la Clínica o Centro *" : "Nombre del Médico Especialista *"}
                  </label>
                  <input
                    type="text"
                    value={newClientForm.nombreMedico}
                    onChange={(e) => setNewClientForm(prev => ({ ...prev, nombreMedico: e.target.value }))}
                    placeholder={newClientForm.tipoEnfoque === "clinica" ? "Ej. Centro Médico MediSalud" : "Ej. Dra. Gabriela Morales"}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-hidden transition-all"
                    autoFocus
                  />
                </div>

                {/* Especialidad */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 block mb-1">
                      Especialidad Principal *
                    </label>
                    <input
                      type="text"
                      value={newClientForm.especialidad}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNewClientForm(prev => ({
                          ...prev,
                          especialidad: val,
                          etiquetaEspecialidad: prev.etiquetaEspecialidad ? prev.etiquetaEspecialidad : val
                        }));
                      }}
                      placeholder="Ej. Pediatría y Neonatología..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-hidden transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 block mb-1 flex items-center gap-1">
                      <Tag className="w-3 h-3 text-emerald-600" />
                      <span>Etiqueta Organización</span>
                    </label>
                    <input
                      type="text"
                      value={newClientForm.etiquetaEspecialidad}
                      onChange={(e) => setNewClientForm(prev => ({ ...prev, etiquetaEspecialidad: e.target.value }))}
                      placeholder="Ej. Pediatría, Estética..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-hidden transition-all"
                    />
                  </div>
                </div>

                {/* Ciudad en Ecuador */}
                <div>
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 block mb-1">
                    Ciudad (Ecuador)
                  </label>
                  <select
                    value={newClientForm.ciudad}
                    onChange={(e) => setNewClientForm(prev => ({ ...prev, ciudad: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-hidden transition-all cursor-pointer"
                  >
                    <option value="Quito">Quito (Pichincha)</option>
                    <option value="Guayaquil">Guayaquil (Guayas)</option>
                    <option value="Cuenca">Cuenca (Azuay)</option>
                    <option value="Santo Domingo">Santo Domingo</option>
                    <option value="Machala">Machala (El Oro)</option>
                    <option value="Manta">Manta (Manabí)</option>
                    <option value="Portoviejo">Portoviejo (Manabí)</option>
                    <option value="Ambato">Ambato (Tungurahua)</option>
                    <option value="Riobamba">Riobamba (Chimborazo)</option>
                    <option value="Loja">Loja</option>
                    <option value="Ibarra">Ibarra (Imbabura)</option>
                  </select>
                </div>

                {/* Notas internas / recordatorios */}
                <div>
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 block mb-1">
                    Notas Internas / Contacto (Opcional)
                  </label>
                  <input
                    type="text"
                    value={newClientForm.notas}
                    onChange={(e) => setNewClientForm(prev => ({ ...prev, notas: e.target.value }))}
                    placeholder="Ej. Teléfono del doctor, presupuesto, pendiente fotos del consultorio..."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-hidden transition-all"
                  />
                </div>

              </div>

              {/* Botones de acción del formulario */}
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewClientModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleCreateNewClient}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-sm shadow-emerald-600/30 flex items-center gap-1.5 hover:scale-[1.02] active:scale-98"
                >
                  <Sparkles className="w-4 h-4 text-emerald-200" />
                  <span>Empezar a Construir</span>
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
