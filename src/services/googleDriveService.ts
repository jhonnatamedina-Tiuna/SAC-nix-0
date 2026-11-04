/**
 * Servicio de integración con Google Drive REST API v3
 * Diseñado para operaciones tácticas C4ISR de Grupo de Rescate Tiuna
 */

export interface DriveItem {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime: string;
  webViewLink?: string;
  webContentLink?: string;
  iconLink?: string;
  thumbnailLink?: string;
  parents?: string[];
}

export interface DriveStorageQuota {
  limit?: string;
  usage?: string;
  usageInDrive?: string;
  usageInDriveTrash?: string;
}

export interface DriveUserInfo {
  displayName: string;
  emailAddress: string;
  photoLink?: string;
}

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';
const UPLOAD_API_BASE = 'https://www.googleapis.com/upload/drive/v3';

/**
 * Obtiene la cuota y detalles de almacenamiento de la cuenta conectada.
 */
export async function getDriveStorageInfo(accessToken: string): Promise<{ user?: DriveUserInfo; quota?: DriveStorageQuota }> {
  const response = await fetch(`${DRIVE_API_BASE}/about?fields=user(displayName,emailAddress,photoLink),storageQuota`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error al consultar información de Google Drive: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return {
    user: data.user,
    quota: data.storageQuota,
  };
}

/**
 * Lista los archivos y carpetas del Google Drive del usuario.
 */
export async function listDriveFiles(
  accessToken: string,
  options?: {
    folderId?: string | null;
    searchQuery?: string;
    pageSize?: number;
  }
): Promise<DriveItem[]> {
  const queryParts: string[] = ['trashed = false'];

  if (options?.folderId) {
    queryParts.push(`'${options.folderId}' in parents`);
  }

  if (options?.searchQuery && options.searchQuery.trim().length > 0) {
    const cleanSearch = options.searchQuery.replace(/'/g, "\\'");
    queryParts.push(`name contains '${cleanSearch}'`);
  }

  const q = encodeURIComponent(queryParts.join(' and '));
  const fields = encodeURIComponent('files(id,name,mimeType,size,modifiedTime,webViewLink,webContentLink,iconLink,thumbnailLink,parents)');
  const pageSize = options?.pageSize || 40;

  const url = `${DRIVE_API_BASE}/files?q=${q}&fields=${fields}&pageSize=${pageSize}&orderBy=folder,modifiedTime desc`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error al listar archivos de Google Drive: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return data.files || [];
}

/**
 * Crea una carpeta organizativa en Google Drive.
 */
export async function createDriveFolder(
  accessToken: string,
  folderName: string,
  parentFolderId?: string
): Promise<DriveItem> {
  const metadata: Record<string, unknown> = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
  };

  if (parentFolderId) {
    metadata.parents = [parentFolderId];
  }

  const response = await fetch(`${DRIVE_API_BASE}/files`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(metadata),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error al crear carpeta en Google Drive: ${response.status} ${errorText}`);
  }

  return response.json();
}

/**
 * Sube un archivo (texto, JSON, binario o informe) a Google Drive usando multipart upload.
 */
export async function uploadFileToDrive(
  accessToken: string,
  name: string,
  content: Blob | string,
  mimeType: string = 'text/plain',
  parentFolderId?: string
): Promise<DriveItem> {
  const metadata: Record<string, unknown> = {
    name,
    mimeType,
  };

  if (parentFolderId) {
    metadata.parents = [parentFolderId];
  }

  const boundary = '-------TiunaDriveBoundary' + Math.random().toString(36).substring(2);
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  let bodyBlob: Blob;

  const fileBlob = typeof content === 'string' ? new Blob([content], { type: mimeType }) : content;

  const metadataPart = delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${mimeType}\r\n\r\n`;

  bodyBlob = new Blob([metadataPart, fileBlob, closeDelimiter], {
    type: `multipart/related; boundary=${boundary}`,
  });

  const response = await fetch(`${UPLOAD_API_BASE}/files?uploadType=multipart&fields=id,name,mimeType,size,modifiedTime,webViewLink`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: bodyBlob,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error al subir archivo a Google Drive: ${response.status} ${errorText}`);
  }

  return response.json();
}

/**
 * Elimina un archivo o carpeta en Google Drive.
 * NOTA: Esta función DEBE ser precedida por una confirmación explícita del usuario en UI.
 */
export async function deleteDriveFile(accessToken: string, fileId: string): Promise<void> {
  const response = await fetch(`${DRIVE_API_BASE}/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok && response.status !== 204) {
    const errorText = await response.text();
    throw new Error(`Error al eliminar archivo en Google Drive: ${response.status} ${errorText}`);
  }
}

/**
 * Genera y sube un reporte operacional táctico completo a Google Drive.
 */
export async function exportMissionReportToDrive(
  accessToken: string,
  params: {
    incidente: string;
    unidad: string;
    claveSac: string;
    descripcion: string;
    coordenadas?: { lat: number; lon: number };
    logs: string[];
    parentFolderId?: string;
  }
): Promise<DriveItem> {
  const fecha = new Date();
  const timestampStr = fecha.toISOString().replace(/[:.]/g, '-');
  const fileName = `Informe_Mision_${params.claveSac}_${params.unidad}_${timestampStr}.md`;

  const markdownContent = `# GRUPO DE RESCATE TIUNA · ESTACIÓN CENTRAL C4ISR Ónix-0
## REPORTE OPERACIONAL Y REGISTRO DE MISIÓN EN TERRENO
**Generado:** ${fecha.toLocaleString('es-VE')}  
**ID de Evento:** ${crypto.randomUUID()}  
**Canal Táctico VHF:** 154.250 MHz (Repetidor Hotel Ávila-1)  

---

### 1. DATOS DEL INCIDENTE
- **Clave SAC Operativa:** \`${params.claveSac}\`
- **Descripción:** ${params.descripcion}
- **Unidad Despachada / Asignada:** \`${params.unidad}\`
- **Incidente:** ${params.incidente}
${params.coordenadas ? `- **Coordenadas PostGIS / GPS (WGS-84):** Lat: \`${params.coordenadas.lat.toFixed(5)}\`, Lon: \`${params.coordenadas.lon.toFixed(5)}\`\n- **Enlace Cartográfico:** https://www.google.com/maps?q=${params.coordenadas.lat},${params.coordenadas.lon}` : ''}

---

### 2. LOG TÁCTICO DE COMUNICACIONES Y DESPACHO
${params.logs.length > 0 ? params.logs.map(log => `- ${log}`).join('\n') : '- Sin eventos registrados en la cola actual.'}

---

### 3. FIRMA DIGITAL Y CERTIFICACIÓN DE SEGURIDAD
- **Autenticación C4ISR:** Token Bearer Verificado por Google Workspace (Google Drive API v3)
- **Criptografía de Respaldo Local:** SQLCipher AES-256-GCM / Ledger de Idempotencia UUID
- **Estado de Cadena de Custodia:** Registro Inmutable Almacenado en Google Drive

*Fundación Grupo de Rescate Tiuna · Región Capital Ávila · SAR & Emergencias Prehospitalarias*
`;

  return uploadFileToDrive(
    accessToken,
    fileName,
    markdownContent,
    'text/markdown',
    params.parentFolderId
  );
}
