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
  ArrowLeft,
  X,
  Layers,
  Save,
  RotateCcw,
  ExternalLink,
  UserPlus,
  Tag,
  Clock,
  Edit3,
  Filter,
  Cloud,
  CloudUpload,
  CloudDownload,
  LogIn,
  LogOut,
  RefreshCw,
  ShieldCheck,
  Globe
} from "lucide-react";
import { 
  auth, 
  loginWithGoogle, 
  logoutUser, 
  saveDoctorToCloud, 
  fetchDoctorsFromCloud, 
  subscribeToCloudDoctors,
  deleteDoctorFromCloud,
  formatFirestoreErrorMessage
} from "../lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";

interface ClientManagerModalProps {
  isOpen?: boolean;
  onClose: () => void;
  currentData: MedicalLandingData;
  onLoadProfile: (data: MedicalLandingData, profileId?: string) => void;
  initialTab?: "import" | "catalog" | "export" | "cloud";
  isFirestoreSyncing?: boolean;
  firestoreSyncSuccess?: boolean;
}

type TabType = "import" | "catalog" | "export" | "cloud";

export function ClientManagerModal({
  isOpen,
  onClose,
  currentData,
  onLoadProfile,
  initialTab,
  isFirestoreSyncing = false,
  firestoreSyncSuccess = false
}: ClientManagerModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab || "catalog");
  const [savedProfiles, setSavedProfiles] = useState<SavedClientProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeProfileIdState, setActiveProfileIdState] = useState<string | null>(null);

  // Estados para Firebase Cloud
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isCloudLoading, setIsCloudLoading] = useState(false);
  const [cloudMessage, setCloudMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);
  const [cloudProfiles, setCloudProfiles] = useState<SavedClientProfile[]>([]);
  const [cloudSearchQuery, setCloudSearchQuery] = useState("");
  const [cloudSpecialtyFilter, setCloudSpecialtyFilter] = useState<string>("todas");
  const [cloudProfileToDelete, setCloudProfileToDelete] = useState<{ id: string; name: string } | null>(null);
  const [savedToLocalCloudId, setSavedToLocalCloudId] = useState<string | null>(null);
  const [copiedCloudProfileId, setCopiedCloudProfileId] = useState<string | null>(null);

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

  // Escuchar estado de autenticación de Firebase y sincronizar datos
  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = undefined;
      }
      if (user) {
        loadCloudDoctors(user.uid);
        try {
          unsubscribeSnapshot = subscribeToCloudDoctors(
            user.uid, 
            (doctors) => {
              setCloudProfiles(doctors);
            },
            (err) => {
              console.warn("Aviso suscripción en tiempo real:", err);
            }
          );
        } catch (e) {
          console.warn("No se pudo iniciar listener en tiempo real de Firebase:", e);
        }
      } else {
        setCloudProfiles([]);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  const loadCloudDoctors = async (uid: string) => {
    try {
      setIsCloudLoading(true);
      setCloudMessage(null);
      const doctors = await fetchDoctorsFromCloud(uid);
      setCloudProfiles(doctors);
    } catch (err: any) {
      console.warn("No se pudieron cargar perfiles de Firebase:", err);
      setCloudMessage({
        type: "error",
        text: "Error al consultar la base de datos de Google Firebase: " + (err.message || String(err))
      });
    } finally {
      setIsCloudLoading(false);
    }
  };

  const handleLoginGoogle = async () => {
    try {
      setIsCloudLoading(true);
      setCloudMessage(null);
      const user = await loginWithGoogle();
      setCloudMessage({
        type: "success",
        text: `¡Bienvenido, ${user.displayName || user.email}! Tu cuenta de Google Firebase está conectada.`
      });
      await loadCloudDoctors(user.uid);
    } catch (err: any) {
      setCloudMessage({
        type: "error",
        text: "No se pudo iniciar sesión con Google: " + (err.message || String(err))
      });
    } finally {
      setIsCloudLoading(false);
    }
  };

  const handleLogoutGoogle = async () => {
    try {
      setIsCloudLoading(true);
      await logoutUser();
      setCloudMessage({
        type: "info",
        text: "Has cerrado sesión de Google Firebase."
      });
      setCloudProfiles([]);
    } catch (err: any) {
      setCloudMessage({
        type: "error",
        text: "Error al cerrar sesión: " + (err.message || String(err))
      });
    } finally {
      setIsCloudLoading(false);
    }
  };

  const handleUploadAllToCloud = async () => {
    if (!currentUser) {
      setCloudMessage({ type: "error", text: "Inicia sesión con Google para respaldar tus médicos en la nube." });
      return;
    }
    if (savedProfiles.length === 0) {
      setCloudMessage({ type: "info", text: "No tienes perfiles locales para subir. Agrega o guarda un médico primero." });
      return;
    }

    try {
      setIsCloudLoading(true);
      setCloudMessage({ type: "info", text: `Optimizando y subiendo ${savedProfiles.length} perfiles a Google Firebase...` });
      
      let successCount = 0;
      let errorCount = 0;
      const errorDetails: string[] = [];

      for (let i = 0; i < savedProfiles.length; i++) {
        const p = savedProfiles[i];
        try {
          await saveDoctorToCloud(currentUser.uid, currentUser.email || "", p);
          successCount++;
        } catch (itemErr: any) {
          errorCount++;
          const friendlyErr = formatFirestoreErrorMessage(itemErr);
          errorDetails.push(`• ${p.nombreMedico || p.nombreCliente}: ${friendlyErr}`);
        }
      }

      await loadCloudDoctors(currentUser.uid);
      refreshProfiles();

      if (errorCount === 0) {
        setCloudMessage({
          type: "success",
          text: `¡Excelente! Se han respaldado y optimizado los ${successCount} perfiles médicos en Google Firebase exitosamente.`
        });
      } else if (successCount > 0) {
        setCloudMessage({
          type: "info",
          text: `Se respaldaron ${successCount} de ${savedProfiles.length} perfiles en Firebase. Observaciones:\n${errorDetails.join("\n")}`
        });
      } else {
        setCloudMessage({
          type: "error",
          text: `No se pudo respaldar ningún médico:\n${errorDetails.join("\n")}`
        });
      }
    } catch (err: any) {
      setCloudMessage({
        type: "error",
        text: "Error al sincronizar con la nube: " + formatFirestoreErrorMessage(err)
      });
    } finally {
      setIsCloudLoading(false);
    }
  };

  const handleUploadCurrentDoctorToCloud = async () => {
    if (!currentUser) {
      setActiveTab("cloud");
      setCloudMessage({ type: "info", text: "Inicia sesión con Google para respaldar este médico en la nube." });
      return;
    }

    try {
      setIsCloudLoading(true);
      const activeId = activeProfileIdState || `profile-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const profileToSave: SavedClientProfile = {
        id: activeId,
        nombreCliente: `${currentData.nombreMedico || "Dr. Especialista"} - ${currentData.especialidad || "Medicina"}`,
        nombreMedico: currentData.nombreMedico || "Dr. Especialista",
        especialidad: currentData.especialidad || "Medicina General",
        ciudad: currentData.ciudad || "Ecuador",
        clinica: currentData.nombreClinicaGBP || "",
        fechaCreacion: new Date().toISOString(),
        fechaActualizacion: new Date().toISOString(),
        etiquetaEspecialidad: currentData.especialidad || "Medicina General",
        data: currentData
      };

      await saveDoctorToCloud(currentUser.uid, currentUser.email || "", profileToSave);
      await loadCloudDoctors(currentUser.uid);
      refreshProfiles();
      setCloudMessage({
        type: "success",
        text: `¡Médico actual "${profileToSave.nombreMedico}" optimizado y guardado en Google Firestore exitosamente!`
      });
    } catch (err: any) {
      setCloudMessage({
        type: "error",
        text: "Error al guardar médico actual en la nube: " + formatFirestoreErrorMessage(err)
      });
    } finally {
      setIsCloudLoading(false);
    }
  };

  const handleDownloadAllFromCloud = async () => {
    if (!currentUser) return;
    try {
      setIsCloudLoading(true);
      const cloudList = await fetchDoctorsFromCloud(currentUser.uid);
      if (cloudList.length === 0) {
        setCloudMessage({ type: "info", text: "No se encontraron perfiles médicos en tu cuenta de Firebase." });
        return;
      }
      importBatchProfiles(cloudList, true);
      refreshProfiles();
      setCloudMessage({
        type: "success",
        text: `¡Sincronizado! Se descargaron e integraron ${cloudList.length} médicos desde Google Firebase a este dispositivo.`
      });
    } catch (err: any) {
      setCloudMessage({
        type: "error",
        text: "Error al descargar de la nube: " + formatFirestoreErrorMessage(err)
      });
    } finally {
      setIsCloudLoading(false);
    }
  };

  const handleSaveCloudToLocal = (profile: SavedClientProfile) => {
    try {
      saveProfile(
        profile.data,
        profile.nombreCliente,
        profile.id,
        profile.notasInternas,
        profile.etiquetaEspecialidad
      );
      refreshProfiles();
      setSavedToLocalCloudId(profile.id);
      setTimeout(() => setSavedToLocalCloudId(null), 2500);
      setCloudMessage({
        type: "success",
        text: `Médico "${profile.nombreMedico}" guardado en el catálogo local de este dispositivo.`
      });
      setTimeout(() => setCloudMessage(null), 3500);
    } catch (err: any) {
      setCloudMessage({
        type: "error",
        text: "Error al guardar en catálogo local: " + formatFirestoreErrorMessage(err)
      });
    }
  };

  const handleSyncSingleDoctor = async (profile: SavedClientProfile) => {
    if (!currentUser) {
      setActiveTab("cloud");
      setCloudMessage({ type: "info", text: "Inicia sesión con Google para respaldar este médico en Firebase." });
      return;
    }
    try {
      setIsCloudLoading(true);
      await saveDoctorToCloud(currentUser.uid, currentUser.email || "", profile);
      await loadCloudDoctors(currentUser.uid);
      refreshProfiles();
      setCloudMessage({
        type: "success",
        text: `Médico "${profile.nombreMedico}" optimizado y sincronizado en Google Firebase con éxito.`
      });
    } catch (err: any) {
      setCloudMessage({
        type: "error",
        text: "Error al sincronizar médico: " + formatFirestoreErrorMessage(err)
      });
    } finally {
      setIsCloudLoading(false);
    }
  };

  const handleDeleteDoctorFromCloud = (doctorId: string, doctorName: string) => {
    if (!currentUser) return;
    setCloudProfileToDelete({ id: doctorId, name: doctorName });
  };

  const handleConfirmDeleteCloudDoctor = async () => {
    if (!currentUser || !cloudProfileToDelete) return;
    const { id, name } = cloudProfileToDelete;
    try {
      setIsCloudLoading(true);
      await deleteDoctorFromCloud(currentUser.uid, id);
      await loadCloudDoctors(currentUser.uid);
      setCloudProfileToDelete(null);
      setCloudMessage({
        type: "info",
        text: `Perfil de "${name}" eliminado permanentemente de Google Firestore.`
      });
    } catch (err: any) {
      setCloudMessage({
        type: "error",
        text: "Error al eliminar de la nube: " + formatFirestoreErrorMessage(err)
      });
    } finally {
      setIsCloudLoading(false);
    }
  };

  // Resumen de especialidades únicas en la nube para filtros
  const uniqueCloudSpecialties = React.useMemo(() => {
    const set = new Set<string>();
    cloudProfiles.forEach(p => {
      const tag = (p.etiquetaEspecialidad || p.especialidad || "").trim();
      if (tag) set.add(tag);
    });
    return Array.from(set).sort();
  }, [cloudProfiles]);

  // Lista de médicos filtrada para la pestaña Cloud
  const filteredCloudProfiles = React.useMemo(() => {
    return cloudProfiles.filter((cp) => {
      const q = cloudSearchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        (cp.nombreMedico && cp.nombreMedico.toLowerCase().includes(q)) ||
        (cp.nombreCliente && cp.nombreCliente.toLowerCase().includes(q)) ||
        (cp.especialidad && cp.especialidad.toLowerCase().includes(q)) ||
        (cp.ciudad && cp.ciudad.toLowerCase().includes(q)) ||
        (cp.clinica && cp.clinica.toLowerCase().includes(q)) ||
        (cp.etiquetaEspecialidad && cp.etiquetaEspecialidad.toLowerCase().includes(q)) ||
        (cp.notasInternas && cp.notasInternas.toLowerCase().includes(q));

      const matchesSpecialty = cloudSpecialtyFilter === "todas" ||
        (cp.etiquetaEspecialidad || cp.especialidad || "").toLowerCase() === cloudSpecialtyFilter.toLowerCase();

      return matchesSearch && matchesSpecialty;
    });
  }, [cloudProfiles, cloudSearchQuery, cloudSpecialtyFilter]);

  // Cargar lista de perfiles al abrir
  useEffect(() => {
    if (isOpen) {
      if (initialTab) {
        setActiveTab(initialTab);
      }
      refreshProfiles();
      const currentActiveId = getActiveProfileId();
      setActiveProfileIdState(currentActiveId);
      
      const defaultName = `${currentData.nombreMedico || "Dr. Médico"} - ${currentData.especialidad || "Especialidad"} (${currentData.ciudad || "Ecuador"})`;
      setSaveClientName(defaultName);
      setSaveClientSpecialtyTag(currentData.especialidad || "Medicina General");
    }
  }, [isOpen, currentData, initialTab]);

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

  if (isOpen !== undefined && !isOpen) return null;

  return (
    <div 
      id="client-manager-page"
      className="min-h-screen w-full bg-slate-100 dark:bg-slate-950 flex flex-col text-slate-800 dark:text-slate-100 transition-colors duration-200"
    >
      {/* CABECERA PRINCIPAL DE LA PÁGINA INDEPENDIENTE */}
      <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            {/* BOTÓN VOLVER AL CONSTRUCTOR */}
            <button
              onClick={onClose}
              id="btn-back-to-builder"
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-extrabold text-xs shadow-md shadow-blue-600/25 transition-all hover:scale-105 cursor-pointer border border-blue-500 shrink-0"
              title="Volver a la vista del Constructor de Landing Page"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver al Constructor</span>
            </button>

            <div className="h-6 w-px bg-slate-800 hidden sm:block" />

            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-base sm:text-lg font-black tracking-tight text-white truncate">
                    Gestor de Clientes Médicos
                  </h1>
                  <span className="text-[10px] font-extrabold uppercase bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded-full">
                    Página Completa
                  </span>
                </div>
                <p className="text-xs text-slate-400 truncate hidden sm:block">
                  Catálogo multi-perfil, respaldos JSON y sincronización Google Cloud Firestore.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0 self-end md:self-auto">
            {/* ESTADO DEL DOCTOR EN EDICIÓN ACTIVA */}
            {currentData?.nombreMedico && (
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-slate-400 text-[11px]">En Constructor:</span>
                <span className="font-extrabold text-white truncate max-w-[170px]" title={currentData.nombreMedico}>
                  {currentData.nombreMedico}
                </span>
              </div>
            )}

            {/* INDICADOR DE SINCRONIZACIÓN AUTOMÁTICA EN FIRESTORE */}
            {currentUser && isFirestoreSyncing && (
              <div 
                id="cloud-manager-syncing-badge"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold animate-pulse shadow-xs"
                title="Sincronizando automáticamente perfil actual en Firestore..."
              >
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                <span className="hidden sm:inline">Sincronizando Firestore...</span>
              </div>
            )}
            {currentUser && !isFirestoreSyncing && firestoreSyncSuccess && (
              <div 
                id="cloud-manager-synced-badge"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold animate-in fade-in shadow-xs"
                title="Perfil guardado y sincronizado exitosamente con Firestore"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Sincronizado</span>
              </div>
            )}

            {/* BOTÓN CREAR NUEVO CLIENTE */}
            <button
              type="button"
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
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/25 cursor-pointer transition-all hover:scale-105 border border-emerald-500"
              title="Crear un nuevo perfil de médico desde cero"
            >
              <Plus className="w-4 h-4 text-emerald-200" />
              <span className="hidden sm:inline">Nuevo Médico</span>
              <span className="sm:hidden">Nuevo</span>
            </button>

            {/* BOTÓN CERRAR / VOLVER */}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-slate-700 shrink-0"
              title="Volver al Constructor"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* SELECTOR DE PESTAÑAS (BARRA SUB-CABECERA STICKY) */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-[61px] sm:top-[65px] z-20 shadow-xs transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 overflow-x-auto scrollbar-none pt-2">
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setActiveTab("catalog")}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-extrabold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "catalog"
                    ? "border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/40 rounded-t-lg"
                    : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                }`}
              >
                <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Mis Clientes Guardados</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {savedProfiles.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("import")}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-extrabold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "import"
                    ? "border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/40 rounded-t-lg"
                    : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                }`}
              >
                <Upload className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Importar Cliente (.json / .html)</span>
              </button>

              <button
                onClick={() => setActiveTab("export")}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-extrabold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "export"
                    ? "border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/40 rounded-t-lg"
                    : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                }`}
              >
                <Download className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Guardar / Exportar Actual</span>
              </button>

              <button
                onClick={() => setActiveTab("cloud")}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-extrabold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "cloud"
                    ? "border-amber-500 text-amber-700 dark:text-amber-400 bg-amber-50/60 dark:bg-amber-950/40 rounded-t-lg"
                    : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                }`}
              >
                <Cloud className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                <span>Nube Firebase</span>
                {currentUser ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    {cloudProfiles.length}
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    Google
                  </span>
                )}
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 pb-2">
              {activeProfileIdState ? (
                <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-full font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Perfil Vinculado
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2.5 py-1 rounded-full font-semibold">
                  Sin vincular
                </span>
              )}
              {currentUser && (
                <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 px-2.5 py-1 rounded-full font-bold text-[10px]">
                  <Cloud className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  Firebase Activo
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CUERPO DEL CONTENIDO PRINCIPAL A PÁGINA COMPLETA */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col">
          
          {/* =========================================================
              PESTAÑA 1: MIS CLIENTES GUARDADOS (CATÁLOGO MULTI-PERFIL)
              ========================================================= */}
          {activeTab === "catalog" && (
            <div className="space-y-5">

              {/* BARRA DE SINCRONIZACIÓN CON GOOGLE FIREBASE */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-blue-500/10 to-indigo-500/10 border border-amber-200/80 dark:border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Cloud className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-900 dark:text-slate-100">
                        {currentUser ? "Google Firebase Sincronizado" : "Sincronización en la Nube con Google"}
                      </span>
                      {currentUser && (
                        <span className="text-[10px] font-bold px-2 py-0.2 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 rounded-full border border-emerald-200 dark:border-emerald-800">
                          {currentUser.email}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      {currentUser
                        ? `Tienes ${cloudProfiles.length} perfiles respaldados en Cloud Firestore. Abre el constructor desde cualquier PC o móvil sin perder datos.`
                        : "Conéctate con tu cuenta de Google (gratis) para que tus médicos se guarden en la nube y estén disponibles desde cualquier dispositivo."}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {currentUser ? (
                    <>
                      <button
                        type="button"
                        onClick={handleUploadAllToCloud}
                        disabled={isCloudLoading}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-extrabold shadow-xs transition-all cursor-pointer disabled:opacity-50"
                        title="Subir todos tus perfiles locales a tu cuenta de Firebase"
                      >
                        <CloudUpload className="w-3.5 h-3.5" />
                        <span>Subir Todo a Nube</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleDownloadAllFromCloud}
                        disabled={isCloudLoading}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold shadow-xs transition-all cursor-pointer disabled:opacity-50"
                        title="Descargar los médicos guardados en Firebase a este navegador"
                      >
                        <CloudDownload className="w-3.5 h-3.5" />
                        <span>Descargar de Nube</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleLogoutGoogle}
                        className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Cerrar sesión de Google"
                      >
                        <LogOut className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={handleLoginGoogle}
                      disabled={isCloudLoading}
                      className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 text-white rounded-xl text-xs font-extrabold shadow-xs transition-all cursor-pointer hover:scale-105 active:scale-95"
                    >
                      <LogIn className="w-3.5 h-3.5 text-amber-400" />
                      <span>Conectar con Google</span>
                    </button>
                  )}
                </div>
              </div>

              {cloudMessage && (
                <div className={`p-3.5 rounded-xl text-xs flex items-start justify-between gap-2.5 animate-in fade-in shadow-xs ${
                  cloudMessage.type === "success" 
                    ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800" 
                    : cloudMessage.type === "error" 
                    ? "bg-rose-50 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200 border border-rose-300 dark:border-rose-800" 
                    : "bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 border border-blue-300 dark:border-blue-800"
                }`}>
                  <div className="flex items-start gap-2.5 min-w-0">
                    {cloudMessage.type === "success" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    ) : cloudMessage.type === "error" ? (
                      <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                    ) : (
                      <RefreshCw className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5 animate-spin" />
                    )}
                    <span className="whitespace-pre-line leading-relaxed font-semibold">{cloudMessage.text}</span>
                  </div>
                  <button onClick={() => setCloudMessage(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-0.5 shrink-0" title="Cerrar aviso">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Barra de búsqueda y acciones masivas */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por médico, especialidad, ciudad (Quito, Guayaquil...) o clínica..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 outline-hidden transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
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
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl text-xs font-extrabold shadow-xs transition-all cursor-pointer disabled:opacity-40"
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xs">
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs flex-1">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1 shrink-0 mr-1">
                      <Filter className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>Organizar:</span>
                    </span>
                    <button
                      onClick={() => setSelectedSpecialtyFilter("todas")}
                      className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer text-xs ${
                        selectedSpecialtyFilter === "todas"
                          ? "bg-slate-900 dark:bg-blue-600 text-white shadow-xs"
                          : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200/80 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
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
                              ? "bg-blue-600 text-white shadow-xs ring-2 ring-blue-300 dark:ring-blue-500"
                              : "bg-white dark:bg-slate-800 text-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-slate-700"
                          }`}
                          title={`Filtrar médicos con la etiqueta ${esp}`}
                        >
                          <Tag className="w-3 h-3 text-blue-500 dark:text-blue-400" />
                          <span>{esp}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                            isSelected ? "bg-blue-700 text-white" : "bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300"
                          }`}>
                            {specialtyStats[esp]}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {selectedSpecialtyFilter !== "todas" && (
                    <div className="flex items-center gap-2 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-200 dark:border-slate-800">
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
                        className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-semibold underline cursor-pointer"
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
                  {filteredProfiles.map((p) => {
                    const isActive = p.id === activeProfileIdState;
                    return (
                      <div
                        key={p.id}
                        className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                          isActive
                            ? "bg-blue-50/70 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 ring-2 ring-blue-500/20 shadow-xs"
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs"
                        }`}
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                                {p.nombreMedico?.replace(/^Dr\.\s*|^Dra\.\s*/i, "").charAt(0) || "M"}
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-slate-100 leading-tight truncate">
                                  {p.nombreCliente}
                                </h4>
                                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                  <Stethoscope className="w-3 h-3 text-slate-400 dark:text-slate-500 shrink-0" />
                                  <span className="font-medium text-slate-600 dark:text-slate-300 truncate">{p.especialidad}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {cloudProfiles.some(cp => cp.id === p.id) && (
                                <span className="text-[10px] font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <Cloud className="w-3 h-3 text-amber-500 dark:text-amber-400" />
                                  <span>Nube</span>
                                </span>
                              )}
                              {isActive && (
                                <span className="text-[10px] font-black uppercase tracking-wider bg-blue-600 text-white px-2 py-0.5 rounded-full shrink-0">
                                  Activo
                                </span>
                              )}
                            </div>
                          </div>

                          {/* ETIQUETA EDITABLE DE ESPECIALIDAD */}
                          <div>
                            {editingTagProfileId === p.id ? (
                              <div className="p-2 bg-blue-50 dark:bg-blue-950/50 border border-blue-300 dark:border-blue-700 rounded-xl space-y-1.5 animate-in fade-in duration-150">
                                <div className="flex items-center justify-between text-[10px] font-bold text-blue-800 dark:text-blue-300">
                                  <span className="flex items-center gap-1">
                                    <Tag className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                                    <span>Editar etiqueta de especialidad:</span>
                                  </span>
                                  <span className="text-slate-400 dark:text-slate-500 font-normal">Enter para guardar</span>
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
                                    className="flex-1 px-2.5 py-1 text-xs font-bold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-700 rounded-lg outline-hidden focus:ring-2 focus:ring-blue-400"
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
                                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
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
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50/90 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200/80 dark:border-blue-800 text-blue-800 dark:text-blue-300 text-xs font-bold cursor-pointer transition-all group shadow-2xs"
                                  title="Haz clic para editar la etiqueta de especialidad de este médico"
                                >
                                  <Tag className="w-3 h-3 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform shrink-0" />
                                  <span>{p.etiquetaEspecialidad || p.especialidad}</span>
                                  <Edit3 className="w-3 h-3 text-blue-400 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-200 ml-0.5 opacity-70 group-hover:opacity-100 transition-opacity" />
                                </span>

                                {tagSaveSuccessId === p.id && (
                                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 animate-in fade-in flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                                    <Check className="w-3 h-3" /> ¡Etiqueta actualizada!
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Ubicación y Clínica */}
                          <div className="flex items-center gap-2 flex-wrap text-[11px] text-slate-600 dark:text-slate-300 pt-1 border-t border-slate-100 dark:border-slate-800">
                            <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md font-medium">
                              <MapPin className="w-3 h-3 text-red-500" />
                              {p.ciudad}
                            </span>
                            <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md font-medium truncate max-w-[180px]">
                              <Building2 className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                              {p.clinica}
                            </span>
                          </div>

                          {/* FECHAS: Creación y Última Actualización */}
                          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 p-2 rounded-xl">
                            <div 
                              className="flex items-center gap-2 min-w-0" 
                              title={`Fecha de creación del perfil: ${formatFullDateTime(p.fechaCreacion)}`}
                            >
                              <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0">
                                <Calendar className="w-3.5 h-3.5" />
                              </div>
                              <div className="min-w-0 leading-tight">
                                <span className="text-[9px] text-slate-400 dark:text-slate-400 font-bold uppercase tracking-wider block">Creación</span>
                                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 truncate block">
                                  {formatDateTimeShort(p.fechaCreacion)}
                                </span>
                              </div>
                            </div>

                            <div 
                              className="flex items-center gap-2 min-w-0" 
                              title={`Última modificación o actualización: ${formatFullDateTime(p.fechaActualizacion)}`}
                            >
                              <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                                <Clock className="w-3.5 h-3.5" />
                              </div>
                              <div className="min-w-0 leading-tight">
                                <span className="text-[9px] text-slate-400 dark:text-slate-400 font-bold uppercase tracking-wider block">Actualizado</span>
                                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 truncate block">
                                  {formatDateTimeShort(p.fechaActualizacion)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {p.notasInternas && (
                            <p className="text-[11px] text-slate-600 dark:text-amber-200 italic bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/60 p-1.5 rounded-lg">
                              📝 {p.notasInternas}
                            </p>
                          )}
                        </div>

                        {/* Botones de acción del perfil */}
                        <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                          <button
                            onClick={() => handleSelectProfile(p)}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-slate-900 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-500 text-white font-extrabold text-xs transition-colors cursor-pointer"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                            <span>Cargar en Editor</span>
                          </button>

                          <button
                            onClick={() => downloadProfileAsJson(p.data, `perfil-${p.nombreMedico.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.json`, p.etiquetaEspecialidad || p.especialidad)}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                            title="Descargar archivo JSON individual con etiqueta de especialidad y fechas"
                          >
                            <FileJson className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          </button>

                          <button
                            onClick={() => handleSyncSingleDoctor(p)}
                            disabled={isCloudLoading}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              cloudProfiles.some(cp => cp.id === p.id)
                                ? "bg-amber-100 dark:bg-amber-950/60 hover:bg-amber-200 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300"
                                : "bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-amber-950/60 text-slate-700 dark:text-slate-300 hover:text-amber-700 dark:hover:text-amber-300"
                            }`}
                            title={
                              cloudProfiles.some(cp => cp.id === p.id)
                                ? "Sincronizado en Google Firebase (clic para volver a guardar)"
                                : "Subir este médico a Google Firebase"
                            }
                          >
                            <Cloud className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          </button>

                          <button
                            onClick={() => handleDuplicateProfile(p.id)}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                            title="Duplicar / Clonar perfil"
                          >
                            <Copy className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                          </button>

                          <button
                            onClick={() => handleDeleteProfile(p.id, p.nombreCliente)}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 dark:hover:text-red-400 text-slate-400 dark:text-slate-400 transition-colors cursor-pointer"
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

          {/* =========================================================
              PESTAÑA 4: NUBE FIREBASE (GOOGLE CLOUD FIRESTORE)
              ========================================================= */}
          {activeTab === "cloud" && (
            <div className="space-y-6">
              
              {/* ALERTA DE MENSAJES DE ESTADO */}
              {cloudMessage && (
                <div 
                  className={`p-4 rounded-2xl border text-xs flex items-center justify-between gap-3 shadow-2xs animate-in fade-in duration-200 ${
                    cloudMessage.type === "success" 
                      ? "bg-emerald-50/90 border-emerald-300 text-emerald-900" 
                      : cloudMessage.type === "error" 
                      ? "bg-rose-50/90 border-rose-300 text-rose-900" 
                      : "bg-blue-50/90 border-blue-300 text-blue-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {cloudMessage.type === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                    {cloudMessage.type === "error" && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                    {cloudMessage.type === "info" && <Cloud className="w-4 h-4 text-blue-600 shrink-0" />}
                    <span className="font-semibold">{cloudMessage.text}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {cloudMessage.type === "error" && currentUser && (
                      <button
                        type="button"
                        onClick={() => loadCloudDoctors(currentUser.uid)}
                        className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-rose-300 text-rose-800 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer"
                      >
                        Reintentar
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setCloudMessage(null)}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded-md transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* CABECERA DE LA NUBE Y ESTADO DE SESIÓN */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-slate-900/5 to-blue-500/10 border border-amber-300/80 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
                      <Cloud className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-black text-slate-900">Google Firebase Cloud Firestore</h3>
                        <span className="text-[10px] font-extrabold uppercase bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300">
                          Base de Datos Oficial Google
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Almacena y consulta todos tus médicos en la nube de Google. Abre tu constructor desde cualquier dispositivo o ubicación sin perder ningún perfil.
                      </p>
                    </div>
                  </div>

                  {currentUser ? (
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={handleLogoutGoogle}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Cerrar Sesión</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleLoginGoogle}
                      disabled={isCloudLoading}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95"
                    >
                      <LogIn className="w-4 h-4 text-amber-400" />
                      <span>Iniciar Sesión con Google</span>
                    </button>
                  )}
                </div>

                {/* TARJETA DE ESTADO DE CUENTA */}
                {currentUser ? (
                  <div className="p-3 bg-white/90 border border-emerald-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {currentUser.photoURL ? (
                        <img src={currentUser.photoURL} alt="Foto" className="w-8 h-8 rounded-full border border-emerald-300 shrink-0" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center text-xs shrink-0">
                          {currentUser.email?.charAt(0).toUpperCase() || "G"}
                        </div>
                      )}
                      <div className="min-w-0 truncate">
                        <span className="font-extrabold text-slate-900 block truncate">{currentUser.displayName || "Usuario de Google"}</span>
                        <span className="text-[11px] text-slate-500 truncate block">{currentUser.email}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-extrabold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                        Plan Gratuito Spark • 50,000 lecturas/día
                      </span>
                      <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-200 shrink-0 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Nube Conectada ({cloudProfiles.length} médicos)
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 bg-white/90 border border-amber-200 rounded-xl flex items-center gap-2.5 text-xs text-slate-700">
                    <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
                    <span>Inicia sesión con tu cuenta de Google para consultar, respaldar y sincronizar tus perfiles médicos en Firestore. 100% gratuito (Plan Spark de Google).</span>
                  </div>
                )}
              </div>

              {/* ACCIONES RÁPIDAS DE NUBE */}
              {currentUser && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* GUARDAR MÉDICO ACTUAL EN LA NUBE */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between gap-2.5 hover:border-amber-300 transition-colors">
                    <div>
                      <div className="flex items-center gap-1.5 text-slate-900 font-extrabold text-xs">
                        <CloudUpload className="w-4 h-4 text-emerald-600" />
                        <span>Subir Médico en Pantalla</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                        Guarda directamente a "{currentData.nombreMedico || "Dr. Especialista"}" en Google Firestore.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleUploadCurrentDoctorToCloud}
                      disabled={isCloudLoading}
                      className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-lg transition-all cursor-pointer disabled:opacity-50 shadow-2xs"
                    >
                      <CloudUpload className="w-3.5 h-3.5" />
                      <span>Respaldar Médico Actual</span>
                    </button>
                  </div>

                  {/* SUBIR TODO EL CATÁLOGO LOCAL */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between gap-2.5 hover:border-amber-300 transition-colors">
                    <div>
                      <div className="flex items-center gap-1.5 text-slate-900 font-extrabold text-xs">
                        <CloudUpload className="w-4 h-4 text-amber-600" />
                        <span>Subir Catálogo Local</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                        Copia todos los perfiles guardados en este navegador ({savedProfiles.length} médicos) a Firestore.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleUploadAllToCloud}
                      disabled={isCloudLoading || savedProfiles.length === 0}
                      className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-lg transition-all cursor-pointer disabled:opacity-50 shadow-2xs"
                    >
                      <CloudUpload className="w-3.5 h-3.5" />
                      <span>Subir {savedProfiles.length} Locales</span>
                    </button>
                  </div>

                  {/* DESCARGAR TODO DE LA NUBE */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between gap-2.5 hover:border-blue-300 transition-colors">
                    <div>
                      <div className="flex items-center gap-1.5 text-slate-900 font-extrabold text-xs">
                        <CloudDownload className="w-4 h-4 text-blue-600" />
                        <span>Sincronizar a este Equipo</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                        Descarga los {cloudProfiles.length} médicos de Firebase a la memoria local para trabajar offline.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleDownloadAllFromCloud}
                      disabled={isCloudLoading || cloudProfiles.length === 0}
                      className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-lg transition-all cursor-pointer disabled:opacity-50 shadow-2xs"
                    >
                      <CloudDownload className="w-3.5 h-3.5" />
                      <span>Descargar {cloudProfiles.length} a Local</span>
                    </button>
                  </div>
                </div>
              )}

              {/* BARRA DE HERRAMIENTAS: BÚSQUEDA, FILTRO Y CONSULTA A FIRESTORE */}
              {currentUser && (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                  {/* Buscador de médicos en la nube */}
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={cloudSearchQuery}
                      onChange={(e) => setCloudSearchQuery(e.target.value)}
                      placeholder="Buscar por nombre, especialidad, ciudad o clínica en la nube..."
                      className="w-full pl-9 pr-8 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                    />
                    {cloudSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setCloudSearchQuery("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Filtro por especialidad */}
                  {uniqueCloudSpecialties.length > 0 && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Filter className="w-3.5 h-3.5 text-slate-400" />
                      <select
                        value={cloudSpecialtyFilter}
                        onChange={(e) => setCloudSpecialtyFilter(e.target.value)}
                        className="py-2 px-3 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                      >
                        <option value="todas">Todas las Especialidades ({cloudProfiles.length})</option>
                        {uniqueCloudSpecialties.map((esp) => (
                          <option key={esp} value={esp}>
                            {esp}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Botón Consultar / Actualizar Firestore */}
                  <div className="flex items-center gap-2 shrink-0 justify-between md:justify-end">
                    <span className="text-[11px] font-bold text-slate-500">
                      Mostrando {filteredCloudProfiles.length} de {cloudProfiles.length}
                    </span>
                    <button
                      type="button"
                      onClick={() => loadCloudDoctors(currentUser.uid)}
                      disabled={isCloudLoading}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs hover:border-amber-400"
                      title="Ejecutar consulta en tiempo real a Google Cloud Firestore"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 text-amber-600 ${isCloudLoading ? "animate-spin" : ""}`} />
                      <span>Consultar Firestore</span>
                    </button>
                  </div>
                </div>
              )}

              {/* LISTA DE PERFILES MÉDICOS EN LA NUBE */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Cloud className="w-3.5 h-3.5 text-amber-600" />
                    <span>Perfiles Médicos Almacenados en Firestore ({filteredCloudProfiles.length})</span>
                  </h4>
                </div>

                {!currentUser ? (
                  <div className="p-10 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-2xs">
                      <Cloud className="w-6 h-6" />
                    </div>
                    <div className="max-w-md mx-auto space-y-1">
                      <h4 className="text-sm font-extrabold text-slate-900">Inicia sesión para consultar tus médicos en la nube</h4>
                      <p className="text-xs text-slate-500">
                        Conecta tu cuenta de Google para acceder a todos los perfiles que hayas guardado previamente desde cualquier computadora o navegador.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleLoginGoogle}
                      className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-md inline-flex items-center gap-2"
                    >
                      <LogIn className="w-4 h-4 text-amber-400" />
                      <span>Conectar con Google</span>
                    </button>
                  </div>
                ) : isCloudLoading && cloudProfiles.length === 0 ? (
                  /* Skeletons de carga */
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="p-4 bg-white border border-slate-200 rounded-xl animate-pulse space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                          <div className="h-4 bg-slate-100 rounded w-16"></div>
                        </div>
                        <div className="h-3 bg-slate-100 rounded w-3/4"></div>
                        <div className="flex gap-2 pt-2 border-t border-slate-100">
                          <div className="h-7 bg-slate-200 rounded flex-1"></div>
                          <div className="h-7 bg-slate-100 rounded w-8"></div>
                          <div className="h-7 bg-slate-100 rounded w-8"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : cloudProfiles.length === 0 ? (
                  /* Estado vacío: sin médicos aún */
                  <div className="p-10 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                      <CloudUpload className="w-6 h-6" />
                    </div>
                    <div className="max-w-md mx-auto space-y-1">
                      <h4 className="text-sm font-extrabold text-slate-900">Aún no has guardado médicos en Firestore</h4>
                      <p className="text-xs text-slate-500">
                        Puedes respaldar el médico que estás editando ahora mismo o subir todo tu catálogo local con un solo clic.
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-3 pt-1 flex-wrap">
                      <button
                        type="button"
                        onClick={handleUploadCurrentDoctorToCloud}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs inline-flex items-center gap-1.5"
                      >
                        <CloudUpload className="w-3.5 h-3.5" />
                        <span>Subir Médico Actual</span>
                      </button>
                      {savedProfiles.length > 0 && (
                        <button
                          type="button"
                          onClick={handleUploadAllToCloud}
                          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs inline-flex items-center gap-1.5"
                        >
                          <CloudUpload className="w-3.5 h-3.5" />
                          <span>Subir Catálogo Local ({savedProfiles.length})</span>
                        </button>
                      )}
                    </div>
                  </div>
                ) : filteredCloudProfiles.length === 0 ? (
                  /* Estado vacío por búsqueda */
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <p className="text-xs font-medium text-slate-600">
                      No se encontraron médicos en la nube que coincidan con "{cloudSearchQuery}".
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setCloudSearchQuery("");
                        setCloudSpecialtyFilter("todas");
                      }}
                      className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Limpiar filtros de búsqueda
                    </button>
                  </div>
                ) : (
                  /* Tarjetas de médicos en Cloud Firestore */
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
                    {filteredCloudProfiles.map((cp) => {
                      const isCurrentActive = activeProfileIdState === cp.id;
                      const wasJustSavedLocal = savedToLocalCloudId === cp.id;
                      const wasJustCopied = copiedCloudProfileId === cp.id;

                      return (
                        <div
                          key={cp.id}
                          className={`p-4 bg-white border rounded-2xl transition-all flex flex-col justify-between gap-3 shadow-2xs hover:shadow-md ${
                            isCurrentActive 
                              ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/20" 
                              : "border-slate-200 hover:border-amber-300"
                          }`}
                        >
                          {/* Cabecera de la tarjeta */}
                          <div className="space-y-1.5">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-50 to-indigo-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
                                  <Stethoscope className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                  <h5 className="text-xs font-black text-slate-900 truncate">
                                    {cp.nombreMedico || cp.nombreCliente}
                                  </h5>
                                  <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                                    <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 px-2 py-0.2 rounded-md border border-blue-200 truncate">
                                      {cp.etiquetaEspecialidad || cp.especialidad}
                                    </span>
                                    {cp.ciudad && (
                                      <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
                                        <MapPin className="w-2.5 h-2.5 text-slate-400" />
                                        {cp.ciudad}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <span className="text-[9px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1 border border-amber-200">
                                <Cloud className="w-2.5 h-2.5 text-amber-600" />
                                Firestore
                              </span>
                            </div>

                            {/* Clínica y fecha */}
                            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                              <span className="truncate max-w-[180px]">
                                {cp.clinica ? `🏥 ${cp.clinica}` : "Consultorio Especialista"}
                              </span>
                              <span className="shrink-0 text-[10px]">
                                📅 {formatDateTimeShort(cp.fechaActualizacion || cp.fechaCreacion)}
                              </span>
                            </div>
                          </div>

                          {/* Barra de Acciones */}
                          <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-slate-100 text-xs">
                            {/* Botón Cargar en Constructor */}
                            <button
                              type="button"
                              onClick={() => {
                                onLoadProfile(cp.data, cp.id);
                                setActiveProfileId(cp.id);
                                setActiveProfileIdState(cp.id);
                                onClose();
                              }}
                              className="flex-1 py-1.5 px-2.5 bg-slate-900 hover:bg-blue-600 text-white font-extrabold text-[11px] rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs hover:scale-[1.02] active:scale-[0.98]"
                              title="Abrir este médico en el constructor"
                            >
                              <ArrowRight className="w-3 h-3 text-amber-400" />
                              <span>Cargar en Constructor</span>
                            </button>

                            {/* Botón Descargar JSON */}
                            <button
                              type="button"
                              onClick={() => {
                                downloadProfileAsJson(
                                  cp.data, 
                                  `perfil-${cp.nombreMedico.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.json`, 
                                  cp.etiquetaEspecialidad || cp.especialidad
                                );
                                setCopiedCloudProfileId(cp.id);
                                setTimeout(() => setCopiedCloudProfileId(null), 2000);
                              }}
                              className={`p-2 rounded-xl transition-colors cursor-pointer border ${
                                wasJustCopied
                                  ? "bg-emerald-50 text-emerald-600 border-emerald-300"
                                  : "bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 border-slate-200"
                              }`}
                              title="Descargar archivo JSON independiente a tu computadora"
                            >
                              {wasJustCopied ? <Check className="w-3.5 h-3.5" /> : <FileJson className="w-3.5 h-3.5" />}
                            </button>

                            {/* Botón Guardar en Catálogo Local */}
                            <button
                              type="button"
                              onClick={() => handleSaveCloudToLocal(cp)}
                              className={`p-2 rounded-xl transition-colors cursor-pointer border ${
                                wasJustSavedLocal
                                  ? "bg-emerald-50 text-emerald-600 border-emerald-300"
                                  : "bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border-slate-200"
                              }`}
                              title="Guardar copia en el almacenamiento local de este navegador (offline)"
                            >
                              {wasJustSavedLocal ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                            </button>

                            {/* Botón Eliminar de Firestore */}
                            <button
                              type="button"
                              onClick={() => handleDeleteDoctorFromCloud(cp.id, cp.nombreMedico)}
                              className="p-2 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-300 rounded-xl transition-colors cursor-pointer"
                              title="Eliminar permanentemente de Google Cloud Firestore"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* NOTA DE CONSERVACIÓN DE JSON Y PORTABILIDAD */}
              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-start gap-3 text-xs text-blue-900 leading-relaxed">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">Portabilidad Total &amp; Cero Ataduras:</strong>
                  <span>
                    Tus perfiles están sincronizados en tu base de datos de Google Firebase Cloud Firestore. Sigues conservando al 100% las funciones de exportar archivos <strong>.json</strong> independientes, backup masivo y descarga en paquete <strong>ZIP</strong> para alojarlos en cualquier servidor web sin restricciones.
                  </span>
                </div>
              </div>

            </div>
          )}

        </main>

        {/* Modales de Confirmación Flotantes */}

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

        {/* Modal de Confirmación para Eliminar Perfil de Google Cloud Firestore */}
        {cloudProfileToDelete && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">¿Eliminar de Google Firestore?</h4>
                  <p className="text-xs text-slate-500 font-medium truncate max-w-[200px]">"{cloudProfileToDelete.name}"</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Esta acción eliminará permanentemente la copia respaldada de este médico en tu base de datos de <strong>Google Firebase</strong>. Si lo tienes guardado en tu catálogo local, esa copia seguirá existiendo.
              </p>
              <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCloudProfileToDelete(null)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteCloudDoctor}
                  disabled={isCloudLoading}
                  className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm shadow-rose-600/20 flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Sí, Eliminar de la Nube</span>
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

      {/* PIE DE PÁGINA INDEPENDIENTE */}
      <footer className="bg-white border-t border-slate-200 py-4 px-4 sm:px-6 lg:px-8 text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-800">Gestor de Clientes Médicos</span>
            <span>•</span>
            <span>Catálogo Local Seguro + Google Cloud Firestore</span>
          </div>
          <div className="flex items-center gap-4">
            <span>{savedProfiles.length} médicos guardados en este navegador</span>
            {currentUser && <span>• {cloudProfiles.length} en Google Cloud</span>}
            <button
              onClick={onClose}
              className="text-blue-600 hover:text-blue-700 font-extrabold flex items-center gap-1.5 cursor-pointer transition-colors hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver al Constructor de Landing</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export const ClientManagerPage = ClientManagerModal;
