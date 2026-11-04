import {
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  limit
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { AuditAttempt } from '../types/tactical';

export interface SystemLogItem {
  id: string;
  tipo: string;
  unidad: string;
  mensaje: string;
  nivel: 'INFO' | 'WARN' | 'CRITICO';
  timestamp: string;
}

/**
 * Guarda un intento o evento de auditoría de seguridad en la nube (Firestore).
 */
export async function persistirAuditoriaFirestore(intento: AuditAttempt): Promise<void> {
  const docId = `audit_${intento.id}_${Math.random().toString(36).substring(2, 7)}`;
  const path = 'auditoria_seguridad';
  try {
    await setDoc(doc(db, path, docId), {
      id: docId,
      ipOrigen: intento.ipOrigen,
      endpoint: intento.endpoint,
      metodo: intento.metodo,
      motivo: intento.motivo,
      userAgent: intento.userAgent.slice(0, 250),
      timestamp: intento.timestamp
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/${docId}`);
  }
}

/**
 * Guarda un log operacional o de radiocomunicación en la nube (Firestore).
 */
export async function persistirLogSistemaFirestore(logItem: SystemLogItem): Promise<void> {
  const docId = logItem.id || `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const path = 'logs_sistema';
  try {
    await setDoc(doc(db, path, docId), {
      id: docId,
      tipo: logItem.tipo,
      unidad: logItem.unidad || 'Ónix-0',
      mensaje: logItem.mensaje,
      nivel: logItem.nivel,
      timestamp: logItem.timestamp
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/${docId}`);
  }
}

/**
 * Suscripción en tiempo real a la colección de auditoría de seguridad.
 */
export function suscribirAuditoriaEnTiempoReal(
  onUpdate: (intentos: AuditAttempt[]) => void
): () => void {
  const path = 'auditoria_seguridad';
  try {
    const q = query(collection(db, path), orderBy('timestamp', 'desc'), limit(30));
    return onSnapshot(
      q,
      (snapshot) => {
        const registros: AuditAttempt[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          registros.push({
            id: Number(data.id.replace(/\D/g, '').slice(0, 9)) || Date.now(),
            ipOrigen: data.ipOrigen || '0.0.0.0',
            endpoint: data.endpoint || '/',
            metodo: data.metodo || 'POST',
            motivo: data.motivo || 'No especificado',
            userAgent: data.userAgent || 'Desconocido',
            timestamp: data.timestamp || new Date().toISOString()
          });
        });
        if (registros.length > 0) {
          onUpdate(registros);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return () => {};
  }
}

/**
 * Suscripción en tiempo real a los logs del sistema.
 */
export function suscribirLogsSistemaEnTiempoReal(
  onUpdate: (logs: SystemLogItem[]) => void
): () => void {
  const path = 'logs_sistema';
  try {
    const q = query(collection(db, path), orderBy('timestamp', 'desc'), limit(30));
    return onSnapshot(
      q,
      (snapshot) => {
        const logs: SystemLogItem[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          logs.push({
            id: data.id,
            tipo: data.tipo,
            unidad: data.unidad,
            mensaje: data.mensaje,
            nivel: data.nivel,
            timestamp: data.timestamp
          });
        });
        if (logs.length > 0) {
          onUpdate(logs);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return () => {};
  }
}
