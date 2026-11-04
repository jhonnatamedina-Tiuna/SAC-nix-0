import React, { useState, useEffect, useCallback } from 'react';
import { 
  initAuth, 
  googleSignIn, 
  logout, 
  getAccessToken 
} from '../services/googleAuthService';
import { 
  listDriveFiles, 
  createDriveFolder, 
  uploadFileToDrive, 
  deleteDriveFile, 
  getDriveStorageInfo, 
  exportMissionReportToDrive,
  DriveItem, 
  DriveUserInfo, 
  DriveStorageQuota 
} from '../services/googleDriveService';
import { User } from 'firebase/auth';
import { 
  HardDrive, 
  FolderPlus, 
  FileUp, 
  FileText, 
  Search, 
  ExternalLink, 
  Trash2, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  Folder, 
  FileCode, 
  FileSpreadsheet, 
  FileImage, 
  File, 
  LogOut, 
  ShieldCheck, 
  DownloadCloud,
  ChevronRight,
  Database
} from 'lucide-react';

interface GoogleDrivePanelProps {
  onNotificarTelegram?: (texto: string) => void;
}

export const GoogleDrivePanel: React.FC<GoogleDrivePanelProps> = ({ onNotificarTelegram }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState<boolean>(true);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Drive data
  const [files, setFiles] = useState<DriveItem[]>([]);
  const [cargandoArchivos, setCargandoArchivos] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [folderHistory, setFolderHistory] = useState<{ id: string | null; name: string }[]>([
    { id: null, name: 'Mi Unidad' }
  ]);
  const [userInfo, setUserInfo] = useState<DriveUserInfo | null>(null);
  const [storageQuota, setStorageQuota] = useState<DriveStorageQuota | null>(null);

  // Modals & User Confirmation
  const [fileToDelete, setFileToDelete] = useState<DriveItem | null>(null);
  const [eliminandoArchivo, setEliminandoArchivo] = useState<boolean>(false);
  const [showNewFolderModal, setShowNewFolderModal] = useState<boolean>(false);
  const [newFolderName, setNewFolderName] = useState<string>('Tiuna-Operaciones-2026');
  const [creandoCarpeta, setCreandoCarpeta] = useState<boolean>(false);
  const [subiendoArchivo, setSubiendoArchivo] = useState<boolean>(false);

  // Initialize auth state
  useEffect(() => {
    const unsub = initAuth(
      (currentUser, currentToken) => {
        setUser(currentUser);
        setToken(currentToken);
        setNeedsAuth(false);
      },
      () => {
        setUser(null);
        setToken(null);
        setNeedsAuth(true);
      }
    );
    return () => unsub();
  }, []);

  // Fetch Drive files when token or folder changes
  const cargarArchivosDrive = useCallback(async (activeToken: string, folderId: string | null = null, query: string = '') => {
    setCargandoArchivos(true);
    setErrorMsg(null);
    try {
      const [lista, info] = await Promise.all([
        listDriveFiles(activeToken, { folderId, searchQuery: query }),
        getDriveStorageInfo(activeToken).catch(() => ({ user: undefined, quota: undefined }))
      ]);
      setFiles(lista);
      if (info.user) setUserInfo(info.user);
      if (info.quota) setStorageQuota(info.quota);
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg(err instanceof Error ? err.message : 'Error al conectar con Google Drive');
    } finally {
      setCargandoArchivos(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      cargarArchivosDrive(token, currentFolderId, searchQuery);
    }
  }, [token, currentFolderId, cargarArchivosDrive]);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setErrorMsg(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
        setNeedsAuth(false);
        setSuccessMsg(`Sesión iniciada como ${result.user.email} con permisos de Google Drive.`);
        setTimeout(() => setSuccessMsg(null), 4000);
        cargarArchivosDrive(result.accessToken, currentFolderId);
      }
    } catch (err: unknown) {
      console.error('Error de login Google:', err);
      setErrorMsg(err instanceof Error ? err.message : 'No se pudo completar la autenticación con Google.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setToken(null);
    setNeedsAuth(true);
    setFiles([]);
    setUserInfo(null);
    setStorageQuota(null);
  };

  const handleNavigateToFolder = (folder: DriveItem) => {
    setCurrentFolderId(folder.id);
    setFolderHistory(prev => [...prev, { id: folder.id, name: folder.name }]);
  };

  const handleNavigateBreadcrumb = (index: number) => {
    const target = folderHistory[index];
    setFolderHistory(folderHistory.slice(0, index + 1));
    setCurrentFolderId(target.id);
  };

  // Create tactical folder
  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newFolderName.trim()) return;
    setCreandoCarpeta(true);
    setErrorMsg(null);
    try {
      const nueva = await createDriveFolder(token, newFolderName.trim(), currentFolderId || undefined);
      setSuccessMsg(`Carpeta "${nueva.name}" creada exitosamente en Google Drive.`);
      setTimeout(() => setSuccessMsg(null), 4000);
      setShowNewFolderModal(false);
      setNewFolderName('');
      cargarArchivosDrive(token, currentFolderId, searchQuery);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Error al crear carpeta.');
    } finally {
      setCreandoCarpeta(false);
    }
  };

  // Upload local file
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!token || !fileList || fileList.length === 0) return;
    const file = fileList[0];
    setSubiendoArchivo(true);
    setErrorMsg(null);
    try {
      const subido = await uploadFileToDrive(token, file.name, file, file.type || 'application/octet-stream', currentFolderId || undefined);
      setSuccessMsg(`Archivo "${subido.name}" subido a Google Drive.`);
      setTimeout(() => setSuccessMsg(null), 4000);
      cargarArchivosDrive(token, currentFolderId, searchQuery);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Error al subir archivo.');
    } finally {
      setSubiendoArchivo(false);
      e.target.value = '';
    }
  };

  // Export tactical mission report directly to Drive
  const handleExportQuickReport = async () => {
    if (!token) return;
    setSubiendoArchivo(true);
    setErrorMsg(null);
    try {
      const reporte = await exportMissionReportToDrive(token, {
        incidente: 'Incidente de Simulación Táctica Ávila-Norte',
        unidad: 'Cobalto-1 (SVA Móvil)',
        claveSac: 'QZ-18',
        descripcion: 'Señal y Enlace Radial Nominal / Prueba Operativa C4ISR',
        coordenadas: { lat: 10.4900, lon: -66.8900 },
        logs: [
          `[${new Date().toLocaleTimeString()}] Transceptor VHF nominal 154.250 MHz`,
          `[${new Date().toLocaleTimeString()}] PostGIS Nearest Neighbor: Granito-1 despachado a 0.00 km`,
          `[${new Date().toLocaleTimeString()}] Respaldo de integridad certificado vía Google Drive Workspace API`
        ],
        parentFolderId: currentFolderId || undefined
      });

      setSuccessMsg(`¡Reporte de misión "${reporte.name}" guardado exitosamente en Google Drive!`);
      setTimeout(() => setSuccessMsg(null), 5000);
      if (onNotificarTelegram) {
        onNotificarTelegram(`📄 *INFORME RESPALDADO EN GOOGLE DRIVE*\n• Archivo: \`${reporte.name}\`\n• Unidad: \`Ónix-0 Central\``);
      }
      cargarArchivosDrive(token, currentFolderId, searchQuery);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Error al exportar reporte.');
    } finally {
      setSubiendoArchivo(false);
    }
  };

  // Confirm and Execute Destructive File Deletion (MANDATORY CONFIRMATION PATTERN)
  const handleConfirmDelete = async () => {
    if (!token || !fileToDelete) return;
    setEliminandoArchivo(true);
    setErrorMsg(null);
    try {
      await deleteDriveFile(token, fileToDelete.id);
      setSuccessMsg(`"${fileToDelete.name}" fue eliminado de Google Drive.`);
      setTimeout(() => setSuccessMsg(null), 4000);
      setFileToDelete(null);
      cargarArchivosDrive(token, currentFolderId, searchQuery);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Error al eliminar archivo de Drive.');
    } finally {
      setEliminandoArchivo(false);
    }
  };

  // Format file sizes
  const formatBytes = (bytesStr?: string) => {
    if (!bytesStr) return '—';
    const bytes = parseInt(bytesStr, 10);
    if (isNaN(bytes)) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType === 'application/vnd.google-apps.folder') {
      return <Folder className="w-4 h-4 text-amber-400" />;
    }
    if (mimeType.includes('spreadsheet') || mimeType.includes('csv')) {
      return <FileSpreadsheet className="w-4 h-4 text-emerald-400" />;
    }
    if (mimeType.includes('image')) {
      return <FileImage className="w-4 h-4 text-purple-400" />;
    }
    if (mimeType.includes('json') || mimeType.includes('code') || mimeType.includes('script')) {
      return <FileCode className="w-4 h-4 text-cyan-400" />;
    }
    if (mimeType.includes('document') || mimeType.includes('markdown') || mimeType.includes('text')) {
      return <FileText className="w-4 h-4 text-blue-400" />;
    }
    return <File className="w-4 h-4 text-slate-400" />;
  };

  return (
    <div className="bg-[#0f172a] rounded-xl border border-slate-800 flex flex-col h-full overflow-hidden shadow-2xl">
      {/* Encabezado del Módulo Google Drive */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide uppercase flex items-center gap-2">
              <span>Google Drive Táctico</span>
              <span className="text-slate-600">·</span>
              <span className="text-xs font-mono font-normal text-amber-400">Resguardo C4ISR & Auditoría</span>
            </h2>
            <p className="text-xs text-slate-400">
              Sincronización en la nube de bitácoras, órdenes de marcha, logs SAC y expedientes de misión.
            </p>
          </div>
        </div>

        {/* Zona de Estado de Autenticación / Botón Oficial de Login */}
        <div className="flex items-center gap-3">
          {needsAuth || !user ? (
            /* Botón oficial Sign in with Google (GSI) */
            <button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="flex items-center gap-2.5 px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 rounded-lg text-xs font-semibold shadow-md transition-all active:scale-95 disabled:opacity-60"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              <span>{isLoggingIn ? 'Conectando...' : 'Iniciar Sesión con Google'}</span>
            </button>
          ) : (
            /* Perfil conectado */
            <div className="flex items-center gap-3 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || 'Usuario'} className="w-6 h-6 rounded-full border border-emerald-400" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="text-left font-mono leading-tight">
                <div className="text-[11px] text-slate-200 font-bold flex items-center gap-1.5">
                  <span className="truncate max-w-[140px]">{user.displayName || user.email}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <div className="text-[9px] text-slate-500">Google Workspace Activo</div>
              </div>
              <button
                onClick={handleLogout}
                className="p-1 hover:bg-slate-800 text-slate-400 hover:text-red-400 rounded transition-colors ml-1"
                title="Cerrar sesión de Google Drive"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Notificaciones / Banners de estado */}
      {errorMsg && (
        <div className="p-3 bg-red-500/10 border-b border-red-500/30 text-red-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-3 bg-emerald-500/10 border-b border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Contenido Principal */}
      <div className="p-4 flex-1 flex flex-col gap-4 overflow-hidden">
        {needsAuth || !token ? (
          /* Pantalla de inicio de sesión requerida */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-950/50 rounded-xl border border-slate-800/80">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-4 shadow-lg shadow-blue-500/5">
              <HardDrive className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">
              Conectar Repositorio Táctico con Google Drive
            </h3>
            <p className="text-xs text-slate-400 max-w-md mb-6 leading-relaxed">
              Inicia sesión con tu cuenta de Google para habilitar el resguardo permanente en la nube de bitácoras de radiocomunicación, claves SAC 01-99, órdenes de marcha e informes de misión del Grupo de Rescate Tiuna.
            </p>
            <button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="flex items-center gap-3 px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-900 rounded-xl text-xs font-bold shadow-xl transition-transform active:scale-95 disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              <span>{isLoggingIn ? 'Iniciando autenticación...' : 'Iniciar Sesión con Google'}</span>
            </button>
            <div className="mt-6 flex items-center gap-4 text-[11px] text-slate-500 font-mono">
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> OAuth 2.0 Oficial</span>
              <span>•</span>
              <span>Tokens Seguros en Memoria</span>
              <span>•</span>
              <span>Protección Antideleción</span>
            </div>
          </div>
        ) : (
          /* Explorador de Archivos de Google Drive */
          <div className="flex-1 flex flex-col gap-3 min-h-0">
            {/* Barra de Acciones Tácticas y Respaldo */}
            <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportQuickReport}
                  disabled={subiendoArchivo}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-mono font-bold rounded flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-60"
                  title="Generar y subir informe de operaciones actual"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{subiendoArchivo ? 'Subiendo...' : 'Exportar Informe de Misión (.md)'}</span>
                </button>

                <button
                  onClick={() => setShowNewFolderModal(true)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono rounded flex items-center gap-1.5 border border-slate-700 transition-colors"
                >
                  <FolderPlus className="w-3.5 h-3.5 text-amber-400" />
                  <span>Nueva Carpeta</span>
                </button>

                <label className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono rounded flex items-center gap-1.5 border border-slate-700 cursor-pointer transition-colors">
                  <FileUp className="w-3.5 h-3.5 text-blue-400" />
                  <span>Subir Archivo</span>
                  <input type="file" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>

              {/* Botón de Refrescar */}
              <button
                onClick={() => token && cargarArchivosDrive(token, currentFolderId, searchQuery)}
                disabled={cargandoArchivos}
                className="p-1.5 bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white rounded border border-slate-800 transition-colors"
                title="Actualizar lista de archivos"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${cargandoArchivos ? 'animate-spin text-amber-400' : ''}`} />
              </button>
            </div>

            {/* Breadcrumb de navegación de carpetas y buscador */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
              {/* Breadcrumb */}
              <div className="flex items-center gap-1 text-xs font-mono text-slate-400 overflow-x-auto py-1">
                {folderHistory.map((item, idx) => (
                  <React.Fragment key={item.id || 'root'}>
                    {idx > 0 && <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />}
                    <button
                      onClick={() => handleNavigateBreadcrumb(idx)}
                      className={`hover:text-amber-400 transition-colors whitespace-nowrap ${
                        idx === folderHistory.length - 1 ? 'text-amber-400 font-bold' : ''
                      }`}
                    >
                      {item.name}
                    </button>
                  </React.Fragment>
                ))}
              </div>

              {/* Buscador */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar en Google Drive..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && token) {
                      cargarArchivosDrive(token, currentFolderId, searchQuery);
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 font-mono placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Tabla / Lista de Archivos */}
            <div className="flex-1 bg-slate-950 rounded-lg border border-slate-800 overflow-y-auto">
              {cargandoArchivos ? (
                <div className="p-8 text-center text-xs text-slate-500 font-mono flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                  <span>Consultando API v3 de Google Drive...</span>
                </div>
              ) : files.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-500 font-mono">
                  <Folder className="w-8 h-8 mx-auto text-slate-700 mb-2" />
                  <span>No se encontraron archivos en esta ubicación.</span>
                </div>
              ) : (
                <div className="divide-y divide-slate-850">
                  {files.map((file) => {
                    const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
                    return (
                      <div
                        key={file.id}
                        className="px-3 py-2.5 flex items-center justify-between gap-3 hover:bg-slate-900/60 transition-colors group text-xs"
                      >
                        <div
                          className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer"
                          onClick={() => {
                            if (isFolder) {
                              handleNavigateToFolder(file);
                            } else if (file.webViewLink) {
                              window.open(file.webViewLink, '_blank', 'noopener,noreferrer');
                            }
                          }}
                        >
                          <div className="shrink-0">{getFileIcon(file.mimeType)}</div>
                          <span
                            className={`truncate font-mono ${
                              isFolder ? 'text-amber-300 font-bold hover:underline' : 'text-slate-200'
                            }`}
                          >
                            {file.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-[11px] font-mono text-slate-500 shrink-0">
                          <span className="hidden md:inline">{formatBytes(file.size)}</span>
                          <span className="hidden sm:inline">
                            {new Date(file.modifiedTime).toLocaleDateString('es-VE', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })}
                          </span>

                          <div className="flex items-center gap-1">
                            {file.webViewLink && (
                              <a
                                href={file.webViewLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 text-slate-400 hover:text-cyan-400 rounded transition-colors"
                                title="Abrir en Google Drive"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                            <button
                              onClick={() => setFileToDelete(file)}
                              className="p-1 text-slate-500 hover:text-red-400 rounded transition-colors"
                              title="Eliminar de Google Drive (Requiere Confirmación)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Barra de pie: cuota de almacenamiento y metadatos */}
            {storageQuota && (
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 bg-slate-950 px-3 py-2 rounded-lg border border-slate-800">
                <div className="flex items-center gap-2">
                  <Database className="w-3.5 h-3.5 text-blue-400" />
                  <span>Almacenamiento de Google Drive:</span>
                  <strong className="text-slate-300">{formatBytes(storageQuota.usage)} en uso</strong>
                  {storageQuota.limit && (
                    <span>de {formatBytes(storageQuota.limit)}</span>
                  )}
                </div>
                <div>
                  Total en vista: <strong className="text-amber-400">{files.length}</strong> elementos
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* DIÁLOGO OBLIGATORIO DE CONFIRMACIÓN PARA OPERACIONES DESTRUCTIVAS */}
      {/* ============================================================== */}
      {fileToDelete && (
        <div 
          style={{ backgroundColor: 'rgba(3, 7, 18, 0.88)', zIndex: 110 }}
          className="fixed inset-0 flex items-center justify-center p-4 backdrop-blur-sm"
        >
          <div 
            style={{ backgroundColor: '#0f172a' }}
            className="border border-red-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl relative font-sans text-slate-200"
          >
            <div className="flex items-center gap-3 text-red-400 font-bold text-base mb-3 font-mono">
              <AlertTriangle className="w-6 h-6 text-red-400 shrink-0" />
              <span>Confirmar Eliminación en Google Drive</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              ¿Está completamente seguro de que desea eliminar permanentemente el archivo o carpeta{' '}
              <strong className="text-white font-mono bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                {fileToDelete.name}
              </strong>{' '}
              de su cuenta de Google Drive?
            </p>

            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-[11px] text-red-300 font-mono mb-5">
              ⚠️ Esta acción modificará los datos de su almacenamiento en la nube y no se puede deshacer de forma automática.
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setFileToDelete(null)}
                disabled={eliminandoArchivo}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={eliminandoArchivo}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-mono font-bold rounded-lg shadow-lg shadow-red-600/20 transition-colors disabled:opacity-50"
              >
                {eliminandoArchivo ? 'Eliminando...' : 'Sí, Eliminar de Drive'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nueva Carpeta */}
      {showNewFolderModal && (
        <div 
          style={{ backgroundColor: 'rgba(3, 7, 18, 0.88)', zIndex: 110 }}
          className="fixed inset-0 flex items-center justify-center p-4 backdrop-blur-sm"
        >
          <div 
            style={{ backgroundColor: '#0f172a' }}
            className="border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative font-sans text-slate-200"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2 text-amber-400 font-mono font-bold text-sm">
                <FolderPlus className="w-4 h-4" />
                <span>Crear Nueva Carpeta en Drive</span>
              </div>
              <button
                onClick={() => setShowNewFolderModal(false)}
                className="text-slate-400 hover:text-white text-xs font-mono px-2 py-1 rounded bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateFolder}>
              <div className="mb-4">
                <label className="block text-xs font-mono text-slate-300 mb-1.5">Nombre de la Carpeta:</label>
                <input
                  type="text"
                  required
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="ej: Tiuna-SAR-Misiones"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowNewFolderModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creandoCarpeta || !newFolderName.trim()}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-mono font-bold rounded-lg transition-colors disabled:opacity-50"
                >
                  {creandoCarpeta ? 'Creando...' : 'Crear Carpeta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
