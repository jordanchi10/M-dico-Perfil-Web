/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDocFromServer, 
  collection, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  query 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { SavedClientProfile } from '../types';
import { prepareProfileForCloudStorage } from '../utils/imageCompressor';
import { updateProfileMedicalData } from '../utils/profileStorage';

// Inicialización de la aplicación Firebase con la configuración oficial
const app = initializeApp(firebaseConfig);

// CRITICAL: The app will break without this line
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Configuración adicional del proveedor de Google
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Prueba de conexión inicial obligatoria según especificaciones
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Aviso Firebase: La conexión se encuentra fuera de línea o verificando configuración.");
    }
  }
}
testConnection();

// Tipos de operaciones para registro y manejo estandarizado de errores
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Iniciar sesión con Google (Popup)
export async function loginWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (err: any) {
    console.error("Error al iniciar sesión con Google:", err);
    throw err;
  }
}

// Cerrar sesión
export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (err: any) {
    console.error("Error al cerrar sesión:", err);
    throw err;
  }
}

// Estructura de registro en la nube para un médico
export interface CloudDoctorRecord {
  id: string;
  userId: string;
  userEmail: string;
  nombreMedico: string;
  especialidad: string;
  ciudad: string;
  configData: string; // JSON serializado de MedicalLandingData
  createdAt: string;
  updatedAt: string;
  nombreCliente?: string;
  clinica?: string;
  notasInternas?: string;
  etiquetaEspecialidad?: string;
}

// Formateador amigable de errores de Firestore para la interfaz de usuario
export function formatFirestoreErrorMessage(error: unknown): string {
  if (!error) return "Error desconocido al comunicar con Firestore.";
  
  let raw = "";
  if (error instanceof Error) {
    raw = error.message;
  } else if (typeof error === "string") {
    raw = error;
  } else {
    raw = JSON.stringify(error);
  }

  // Si contiene el objeto estructurado JSON de handleFirestoreError
  if (raw.includes('"error":')) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed.error) {
        raw = parsed.error;
      }
    } catch {
      // Ignorar si no es JSON válido
    }
  }

  const lower = raw.toLowerCase();

  if (lower.includes("cannot be written because its size") || lower.includes("exceeds the maximum allowed size")) {
    return "El perfil contenía imágenes de alta resolución que superaban el límite de 1 MB de Firestore. Se han optimizado automáticamente para respaldarlo en la nube.";
  }
  if (lower.includes("permission-denied") || lower.includes("permission denied")) {
    return "Permiso denegado en Firestore. Verifica que tu sesión de Google esté activa y vuelve a intentarlo.";
  }
  if (lower.includes("unauthenticated")) {
    return "Sesión no autenticada. Inicia sesión con Google para sincronizar tus perfiles médicos en la nube.";
  }
  if (lower.includes("quota exceeded") || lower.includes("resource_exhausted") || lower.includes("resource-exhausted")) {
    return "Límite temporal de cuota en Firestore. Por favor espera unos momentos e inténtalo de nuevo.";
  }
  if (lower.includes("unavailable") || lower.includes("network")) {
    return "Error de conexión con Google Firebase. Verifica tu conexión a internet.";
  }

  return raw;
}

// Guardar o actualizar un médico en Cloud Firestore (con compresión y optimización automática para cumplir con el límite de 1MB)
export async function saveDoctorToCloud(
  userId: string, 
  userEmail: string, 
  profile: SavedClientProfile
): Promise<void> {
  const safeId = (profile.id || `profile-${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 120);
  const docPath = `users/${userId}/doctors/${safeId}`;
  try {
    // 1. Extraer datos médicos
    let medicalDataObj = typeof profile.data === "string" 
      ? JSON.parse(profile.data) 
      : profile.data;

    // 2. Optimizar cualquier imagen en Base64 para que el payload nunca exceda 1 MiB (1,048,576 bytes)
    const optimizedData = await prepareProfileForCloudStorage(medicalDataObj);
    const configDataStr = JSON.stringify(optimizedData);

    // 3. Sincronizar versión optimizada en memoria y en localStorage local
    profile.data = optimizedData;
    if (profile.id) {
      updateProfileMedicalData(profile.id, optimizedData);
    }

    const payload: CloudDoctorRecord = {
      id: safeId,
      userId,
      userEmail: userEmail || auth.currentUser?.email || "",
      nombreMedico: (profile.nombreMedico || optimizedData?.nombreMedico || "Dr. Especialista").substring(0, 200),
      especialidad: (profile.especialidad || optimizedData?.especialidad || "Medicina General").substring(0, 200),
      ciudad: (profile.ciudad || optimizedData?.ciudad || "Ecuador").substring(0, 100),
      configData: configDataStr,
      createdAt: profile.fechaCreacion || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      nombreCliente: profile.nombreCliente || "",
      clinica: profile.clinica || optimizedData?.nombreClinicaGBP || "",
      notasInternas: profile.notasInternas || "",
      etiquetaEspecialidad: profile.etiquetaEspecialidad || profile.especialidad || ""
    };

    const docRef = doc(db, 'users', userId, 'doctors', safeId);
    await setDoc(docRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}

// Obtener todos los médicos del usuario desde Cloud Firestore
export async function fetchDoctorsFromCloud(userId: string): Promise<SavedClientProfile[]> {
  const collectionPath = `users/${userId}/doctors`;
  try {
    const doctorsRef = collection(db, 'users', userId, 'doctors');
    const snapshot = await getDocs(doctorsRef);
    
    const profiles: SavedClientProfile[] = [];
    snapshot.forEach(docSnap => {
      const data = docSnap.data() as CloudDoctorRecord;
      try {
        const medicalData = typeof data.configData === "string" 
          ? JSON.parse(data.configData) 
          : data.configData;

        profiles.push({
          id: data.id || docSnap.id,
          nombreCliente: data.nombreCliente || `${data.nombreMedico} - ${data.especialidad}`,
          nombreMedico: data.nombreMedico,
          especialidad: data.especialidad,
          ciudad: data.ciudad,
          clinica: data.clinica || "",
          fechaCreacion: data.createdAt,
          fechaActualizacion: data.updatedAt,
          notasInternas: data.notasInternas || "",
          etiquetaEspecialidad: data.etiquetaEspecialidad || data.especialidad,
          data: medicalData
        });
      } catch (parseErr) {
        console.warn("No se pudo parsear datos del médico:", data.id, parseErr);
      }
    });

    // Ordenar de forma descendente por última fecha de modificación o creación
    profiles.sort((a, b) => {
      const timeB = new Date(b.fechaActualizacion || b.fechaCreacion || 0).getTime();
      const timeA = new Date(a.fechaActualizacion || a.fechaCreacion || 0).getTime();
      return timeB - timeA;
    });

    return profiles;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, collectionPath);
  }
}

// Suscripción en tiempo real a los perfiles de médicos del usuario en Cloud Firestore
export function subscribeToCloudDoctors(
  userId: string,
  onUpdate: (profiles: SavedClientProfile[]) => void,
  onError?: (err: unknown) => void
): () => void {
  const collectionPath = `users/${userId}/doctors`;
  const doctorsRef = collection(db, 'users', userId, 'doctors');

  return onSnapshot(
    doctorsRef,
    (snapshot) => {
      const profiles: SavedClientProfile[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data() as CloudDoctorRecord;
        try {
          const medicalData = typeof data.configData === "string"
            ? JSON.parse(data.configData)
            : data.configData;

          profiles.push({
            id: data.id || docSnap.id,
            nombreCliente: data.nombreCliente || `${data.nombreMedico} - ${data.especialidad}`,
            nombreMedico: data.nombreMedico,
            especialidad: data.especialidad,
            ciudad: data.ciudad,
            clinica: data.clinica || "",
            fechaCreacion: data.createdAt,
            fechaActualizacion: data.updatedAt,
            notasInternas: data.notasInternas || "",
            etiquetaEspecialidad: data.etiquetaEspecialidad || data.especialidad,
            data: medicalData
          });
        } catch (parseErr) {
          console.warn("Error al procesar médico en snapshot:", docSnap.id, parseErr);
        }
      });

      profiles.sort((a, b) => {
        const timeB = new Date(b.fechaActualizacion || b.fechaCreacion || 0).getTime();
        const timeA = new Date(a.fechaActualizacion || a.fechaCreacion || 0).getTime();
        return timeB - timeA;
      });

      onUpdate(profiles);
    },
    (error) => {
      if (onError) {
        onError(error);
      }
      handleFirestoreError(error, OperationType.LIST, collectionPath);
    }
  );
}

// Eliminar un médico de Cloud Firestore
export async function deleteDoctorFromCloud(userId: string, doctorId: string): Promise<void> {
  const docPath = `users/${userId}/doctors/${doctorId}`;
  try {
    const docRef = doc(db, 'users', userId, 'doctors', doctorId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}
