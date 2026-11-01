export type MineralType = 'CUARZO' | 'GRANITO' | 'AMBAR' | 'DIAMANTE' | 'COBALTO' | 'ONIX';

export interface SacCode {
  codigo: string;          // Ej: "AM-41"
  mineral: MineralType;    // "AMBAR"
  nombreMineral: string;   // "Ámbar"
  prefijo: string;         // "AM"
  rango: string;           // "40-59"
  dominio: string;         // "Triaje y Prehospitalaria"
  descripcion: string;     // "Triaje Rojo. Paciente crítico..."
  prioridad: 1 | 2 | 3 | 4 | 5; // 1 = Máxima / Crítica
  color: string;           // Tailwind color class / hex
  accionSugerida?: string;
  cambioCanalPtt?: string;
}

export interface TacticalUnit {
  indicativo: string;      // 'Cobalto-1'
  tipo: 'AMBULANCIA' | 'RESCATISTA' | 'BASE' | 'K9';
  estadoSac: string;       // 'CB-80'
  canalPttActual: string;  // 'CANAL_BASE_0'
  latitud: number;
  longitud: number;
  rumbo: number;           // 0-360 deg
  velocidadKmh: number;
  bateria: number;         // %
  operador: string;
  ultimaActualizacion: string;
}

export interface PttChannelInfo {
  id: string;
  nombre: string;
  frecuenciaMhz: string;
  descripcion: string;
  usoTáctico: string;
}

export interface CriticalAlert {
  id: string;
  timestamp: string;
  tipoEvento: string;      // 'AM-41', 'GR-25', etc.
  unidadId: string;
  prioridad: number;
  descripcion: string;
  latitud?: number;
  longitud?: number;
  unidadSugerida?: string;
  distanciaMetros?: number;
  datos?: Record<string, unknown>;
  atendida?: boolean;
}

export interface BlockedIp {
  ip: string;
  motivo: string;
  totalFallos: number;
  fechaBloqueo: string;
  estado: 'BLOQUEADO' | 'DESBLOQUEADO';
  segmento: string;
}

export interface AuditAttempt {
  id: number;
  ipOrigen: string;
  endpoint: string;
  metodo: string;
  motivo: string;
  userAgent: string;
  timestamp: string;
}

export interface OfflineQueueItem {
  idPaquete: string;
  unidadId: string;
  tipoEvento: string;
  prioridad: number;
  fechaOffline: string;
  datos: Record<string, unknown>;
  estado: 'PENDIENTE' | 'SINCRONIZADO';
}

export interface TelegramMessage {
  id: string;
  remitente: 'SISTEMA' | 'USUARIO' | 'BOT_TIUNA';
  texto: string;
  timestamp: string;
  tipo: 'COMANDO' | 'ALERTA' | 'REPORTE' | 'INFO';
}

export interface CartographyRegion {
  id: string;
  nombre: string;
  archivo: string;
  tamanioMb: number;
  zoomMax: number;
  cobertura: string;
  estado: 'DISPONIBLE' | 'DESCARGADO' | 'DESCARGANDO';
  progreso?: number;
}
