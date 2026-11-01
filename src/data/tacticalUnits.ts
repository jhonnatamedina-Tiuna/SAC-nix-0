import { TacticalUnit, PttChannelInfo } from '../types/tactical';

export const CANALES_PTT_DISPONIBLES: PttChannelInfo[] = [
  {
    id: 'CANAL_BASE_0',
    nombre: 'Canal Base 0 (General)',
    frecuenciaMhz: '146.520 MHz',
    descripcion: 'Enlace primario de coordinación general con Estación Ónix-0.',
    usoTáctico: 'Apresto en base, cierre y comunicaciones institucionales (CB-80, CB-86).'
  },
  {
    id: 'CANAL_TACTICO_1',
    nombre: 'Canal Táctico 1 (Desplazamiento)',
    frecuenciaMhz: '147.450 MHz',
    descripcion: 'Tránsito de convoyes, desplazamiento hacia escena y patrullaje.',
    usoTáctico: 'Unidades en ruta o retorno (CB-81, CB-85, patrullas GR-20).'
  },
  {
    id: 'CANAL_ESCENA_2',
    nombre: 'Canal Escena 2 (Operaciones SAR)',
    frecuenciaMhz: '147.500 MHz',
    descripcion: 'Puesto de comando avanzado, maniobras de rescate y empaque.',
    usoTáctico: 'Arribo y operaciones en teatro del incidente (CB-82, GR-27).'
  },
  {
    id: 'CANAL_SANITARIO_3',
    nombre: 'Canal Médico 3 (Enlace Hospital)',
    frecuenciaMhz: '155.340 MHz',
    descripcion: 'Telemetría médica, coordinación de guardia y recepción de emergencias.',
    usoTáctico: 'Traslado de pacientes y recepción hospitalaria (CB-83, CB-84).'
  }
];

export const UNIDADES_INICIALES: TacticalUnit[] = [
  {
    indicativo: 'Cobalto-1',
    tipo: 'AMBULANCIA',
    estadoSac: 'CB-80',
    canalPttActual: 'CANAL_BASE_0',
    latitud: 10.4900,
    longitud: -66.8900,
    rumbo: 90,
    velocidadKmh: 0,
    bateria: 94,
    operador: 'Paramédico M. Rangel (SVA)',
    ultimaActualizacion: new Date().toISOString()
  },
  {
    indicativo: 'Cobalto-2',
    tipo: 'AMBULANCIA',
    estadoSac: 'CB-81',
    canalPttActual: 'CANAL_TACTICO_1',
    latitud: 10.4780,
    longitud: -66.8450,
    rumbo: 45,
    velocidadKmh: 48,
    bateria: 82,
    operador: 'Paramédico L. Briceño (SVB)',
    ultimaActualizacion: new Date().toISOString()
  },
  {
    indicativo: 'Granito-1',
    tipo: 'RESCATISTA',
    estadoSac: 'GR-20',
    canalPttActual: 'CANAL_TACTICO_1',
    latitud: 10.5150,
    longitud: -66.8620,
    rumbo: 15,
    velocidadKmh: 4,
    bateria: 76,
    operador: 'Rescatista C. Mendoza (SAR)',
    ultimaActualizacion: new Date().toISOString()
  },
  {
    indicativo: 'Granito-2',
    tipo: 'K9',
    estadoSac: 'GR-22',
    canalPttActual: 'CANAL_TACTICO_1',
    latitud: 10.5280,
    longitud: -66.8850,
    rumbo: 310,
    velocidadKmh: 3,
    bateria: 68,
    operador: 'Guía Canino A. Silva + Can Titan',
    ultimaActualizacion: new Date().toISOString()
  },
  {
    indicativo: 'Ónix-0',
    tipo: 'BASE',
    estadoSac: 'NX-90',
    canalPttActual: 'CANAL_BASE_0',
    latitud: 10.4950,
    longitud: -66.8720,
    rumbo: 0,
    velocidadKmh: 0,
    bateria: 100,
    operador: 'Oficial de Guardia C4ISR Central',
    ultimaActualizacion: new Date().toISOString()
  }
];

// Polígono del Parque Nacional Waraira Repano (Cerca Virtual / Geofence)
export const GEOFENCE_WARAIRA_REPANO: [number, number][] = [
  [10.5050, -66.9300],
  [10.5250, -66.9350],
  [10.5450, -66.9000],
  [10.5500, -66.8500],
  [10.5350, -66.8100],
  [10.5100, -66.8200],
  [10.5000, -66.8700],
  [10.5050, -66.9300]
];
