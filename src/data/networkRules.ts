import { BlockedIp, AuditAttempt, CartographyRegion } from '../types/tactical';

export const REDES_PERMITIDAS_CONFIG = [
  { cidr: '127.0.0.1/32', nombre: 'Loopback Local del Sistema', uso: 'Servicios de servidor interno' },
  { cidr: '10.42.0.0/24', nombre: 'Base Central Ónix-0', uso: 'Consolas de despacho, switches de puesto de comando' },
  { cidr: '10.42.10.0/23', nombre: 'Ambulancias Cobalto y Rescatistas', uso: 'Terminales rugerizadas y radios VoIP' },
  { cidr: '192.168.100.0/24', nombre: 'Enlaces Mesh / Radiomódem', uso: 'Repetidoras tácticas y nodos LoRa / APRS' },
];

export const LISTA_BLANCA_PROTEGIDA = [
  '127.0.0.1',
  '10.42.0.1',   // Servidor Maestro Ónix-0
  '10.42.10.10', // Cobalto-1
  '10.42.10.11', // Cobalto-2
];

export const IPS_BLOQUEADAS_INICIALES: BlockedIp[] = [
  {
    ip: '198.51.100.44',
    motivo: 'Excedido umbral de 5 intentos fallidos (Auto: Fuerza bruta a /api/v1/sync)',
    totalFallos: 6,
    fechaBloqueo: new Date(Date.now() - 3600000 * 2).toISOString(),
    estado: 'BLOQUEADO',
    segmento: 'WAN Pública Externa'
  },
  {
    ip: '185.220.101.5',
    motivo: 'Escaneo masivo de puertos no autorizado (NX-92)',
    totalFallos: 8,
    fechaBloqueo: new Date(Date.now() - 3600000 * 5).toISOString(),
    estado: 'BLOQUEADO',
    segmento: 'Proxy Tor Anónimo'
  }
];

export const AUDITORIA_INICIAL: AuditAttempt[] = [
  {
    id: 101,
    ipOrigen: '198.51.100.44',
    endpoint: '/api/v1/sync',
    metodo: 'POST',
    motivo: 'Token JWT ausente o inválido',
    userAgent: 'python-requests/2.28.1',
    timestamp: new Date(Date.now() - 3600000 * 2 - 30000).toISOString()
  },
  {
    id: 102,
    ipOrigen: '198.51.100.44',
    endpoint: '/api/v1/unidades/estado',
    metodo: 'POST',
    motivo: 'IP fuera de segmento Mesh',
    userAgent: 'curl/7.88.1',
    timestamp: new Date(Date.now() - 3600000 * 2 - 15000).toISOString()
  },
  {
    id: 103,
    ipOrigen: '172.16.55.20',
    endpoint: '/firewall/unblock',
    metodo: 'POST',
    motivo: 'Rango operativo no autorizado (rol insuficiente)',
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64)',
    timestamp: new Date(Date.now() - 1800000).toISOString()
  }
];

export const REGIONES_CARTOGRAFICAS: CartographyRegion[] = [
  {
    id: 'waraira-repano',
    nombre: 'Parque Nacional Waraira Repano (El Ávila)',
    archivo: 'waraira_repano_vector_z16.mbtiles',
    tamanioMb: 142.5,
    zoomMax: 16,
    cobertura: 'Curvas de nivel 10m, senderos SAR, toponimia y helipuntos',
    estado: 'DESCARGADO'
  },
  {
    id: 'caracas-metropolitana',
    nombre: 'Distrito Capital y Área Metropolitana',
    archivo: 'caracas_metro_topo_z15.mbtiles',
    tamanioMb: 98.4,
    zoomMax: 15,
    cobertura: 'Red vial, hospitales, estaciones de bomberos y sedes SAR',
    estado: 'DISPONIBLE'
  },
  {
    id: 'guarenas-guatire',
    nombre: 'Eje Vial Guarenas - Guatire - Barlovento',
    archivo: 'guarenas_guatire_transporte_z14.mbtiles',
    tamanioMb: 64.2,
    zoomMax: 14,
    cobertura: 'Autopistas, puentes, puntos de control y helisuperficies',
    estado: 'DISPONIBLE'
  },
  {
    id: 'valle-del-tuy',
    nombre: 'Subregión Valles del Tuy',
    archivo: 'valles_tuy_sar_z14.mbtiles',
    tamanioMb: 52.8,
    zoomMax: 14,
    cobertura: 'Topografía rural, ríos y zonas de difícil acceso',
    estado: 'DISPONIBLE'
  }
];
