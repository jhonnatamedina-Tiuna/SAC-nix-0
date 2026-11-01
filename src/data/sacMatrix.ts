import { SacCode } from '../types/tactical';

export const SAC_MATRIX: SacCode[] = [
  // ==========================================
  // BLOQUE 01-19: CUARZO (QZ) — ENLACE Y COMMS
  // ==========================================
  {
    codigo: 'QZ-01',
    mineral: 'CUARZO',
    nombreMineral: 'Cuarzo',
    prefijo: 'QZ',
    rango: '01-19',
    dominio: 'Enlace y Conectividad de Radio',
    descripcion: 'Silencio de radio absoluto. Esperando tráfico de emergencia.',
    prioridad: 1,
    color: '#06B6D4',
    accionSugerida: 'Cesar toda transmisión radial no esencial en el canal activo.'
  },
  {
    codigo: 'QZ-02',
    mineral: 'CUARZO',
    nombreMineral: 'Cuarzo',
    prefijo: 'QZ',
    rango: '01-19',
    dominio: 'Enlace y Conectividad de Radio',
    descripcion: 'Canal saturado. Reducir tráfico al mínimo indispensable.',
    prioridad: 3,
    color: '#06B6D4'
  },
  {
    codigo: 'QZ-03',
    mineral: 'CUARZO',
    nombreMineral: 'Cuarzo',
    prefijo: 'QZ',
    rango: '01-19',
    dominio: 'Enlace y Conectividad de Radio',
    descripcion: 'Cambio a canal secundario. Frecuencia de respaldo local.',
    prioridad: 2,
    color: '#06B6D4',
    accionSugerida: 'Conmutar selectores a repetidora o simplex de contingencia.'
  },
  {
    codigo: 'QZ-04',
    mineral: 'CUARZO',
    nombreMineral: 'Cuarzo',
    prefijo: 'QZ',
    rango: '01-19',
    dominio: 'Enlace y Conectividad de Radio',
    descripcion: 'Comprobación de radio. Reporte de señal (5/5, 4/5, etc.).',
    prioridad: 4,
    color: '#06B6D4'
  },
  {
    codigo: 'QZ-05',
    mineral: 'CUARZO',
    nombreMineral: 'Cuarzo',
    prefijo: 'QZ',
    rango: '01-19',
    dominio: 'Enlace y Conectividad de Radio',
    descripcion: 'Mensaje recibido, comprendido y en ejecución. Copiado conforme.',
    prioridad: 4,
    color: '#06B6D4'
  },
  {
    codigo: 'QZ-06',
    mineral: 'CUARZO',
    nombreMineral: 'Cuarzo',
    prefijo: 'QZ',
    rango: '01-19',
    dominio: 'Enlace y Conectividad de Radio',
    descripcion: 'Repita el último mensaje. Ruido o interferencia en la línea.',
    prioridad: 3,
    color: '#06B6D4'
  },
  {
    codigo: 'QZ-07',
    mineral: 'CUARZO',
    nombreMineral: 'Cuarzo',
    prefijo: 'QZ',
    rango: '01-19',
    dominio: 'Enlace y Conectividad de Radio',
    descripcion: 'Estación en escucha permanente. Standby operativo.',
    prioridad: 4,
    color: '#06B6D4'
  },
  {
    codigo: 'QZ-08',
    mineral: 'CUARZO',
    nombreMineral: 'Cuarzo',
    prefijo: 'QZ',
    rango: '01-19',
    dominio: 'Enlace y Conectividad de Radio',
    descripcion: 'Fuera del área de cobertura de radio. Entrando en zona de sombra.',
    prioridad: 2,
    color: '#06B6D4',
    accionSugerida: 'Activar nodo repetidor mesh o almacenar datos offline.'
  },
  {
    codigo: 'QZ-09',
    mineral: 'CUARZO',
    nombreMineral: 'Cuarzo',
    prefijo: 'QZ',
    rango: '01-19',
    dominio: 'Enlace y Conectividad de Radio',
    descripcion: 'Transmisión en clave cifrada. Enlace seguro AES activado.',
    prioridad: 3,
    color: '#06B6D4'
  },
  {
    codigo: 'QZ-10',
    mineral: 'CUARZO',
    nombreMineral: 'Cuarzo',
    prefijo: 'QZ',
    rango: '01-19',
    dominio: 'Enlace y Conectividad de Radio',
    descripcion: 'Fin de transmisión. Canal libre para otro tráfico.',
    prioridad: 5,
    color: '#06B6D4'
  },
  {
    codigo: 'QZ-11',
    mineral: 'CUARZO',
    nombreMineral: 'Cuarzo',
    prefijo: 'QZ',
    rango: '01-19',
    dominio: 'Enlace y Conectividad de Radio',
    descripcion: 'Solicitud de relevo de operador en estación de radio.',
    prioridad: 4,
    color: '#06B6D4'
  },
  {
    codigo: 'QZ-12',
    mineral: 'CUARZO',
    nombreMineral: 'Cuarzo',
    prefijo: 'QZ',
    rango: '01-19',
    dominio: 'Enlace y Conectividad de Radio',
    descripcion: 'Batería de radio o dispositivo crítica. Menor a 20%.',
    prioridad: 2,
    color: '#06B6D4',
    accionSugerida: 'Cambio inmediato de paquete de baterías o conexión solar.'
  },
  {
    codigo: 'QZ-13',
    mineral: 'CUARZO',
    nombreMineral: 'Cuarzo',
    prefijo: 'QZ',
    rango: '01-19',
    dominio: 'Enlace y Conectividad de Radio',
    descripcion: 'Conectividad de red mallada restablecida. Sincronización correcta.',
    prioridad: 3,
    color: '#06B6D4'
  },
  {
    codigo: 'QZ-14',
    mineral: 'CUARZO',
    nombreMineral: 'Cuarzo',
    prefijo: 'QZ',
    rango: '01-19',
    dominio: 'Enlace y Conectividad de Radio',
    descripcion: 'Operador en descanso autorizado. Turno de radio relevado.',
    prioridad: 5,
    color: '#06B6D4'
  },
  {
    codigo: 'QZ-15',
    mineral: 'CUARZO',
    nombreMineral: 'Cuarzo',
    prefijo: 'QZ',
    rango: '01-19',
    dominio: 'Enlace y Conectividad de Radio',
    descripcion: 'Solicitud de verificación de estatus general de comisiones.',
    prioridad: 3,
    color: '#06B6D4'
  },
  {
    codigo: 'QZ-16',
    mineral: 'CUARZO',
    nombreMineral: 'Cuarzo',
    prefijo: 'QZ',
    rango: '01-19',
    dominio: 'Enlace y Conectividad de Radio',
    descripcion: 'Comunicación por canal de datos alterno. Texto fuera de línea.',
    prioridad: 4,
    color: '#06B6D4'
  },
  {
    codigo: 'QZ-17',
    mineral: 'CUARZO',
    nombreMineral: 'Cuarzo',
    prefijo: 'QZ',
    rango: '01-19',
    dominio: 'Enlace y Conectividad de Radio',
    descripcion: 'Interferencia electromagnética severa detectada en frecuencia.',
    prioridad: 2,
    color: '#06B6D4'
  },
  {
    codigo: 'QZ-18',
    mineral: 'CUARZO',
    nombreMineral: 'Cuarzo',
    prefijo: 'QZ',
    rango: '01-19',
    dominio: 'Enlace y Conectividad de Radio',
    descripcion: 'Llamada general de atención a todas las unidades en terreno.',
    prioridad: 1,
    color: '#06B6D4',
    accionSugerida: 'Todas las estaciones escuchar y acusar recibo en orden.'
  },
  {
    codigo: 'QZ-19',
    mineral: 'CUARZO',
    nombreMineral: 'Cuarzo',
    prefijo: 'QZ',
    rango: '01-19',
    dominio: 'Enlace y Conectividad de Radio',
    descripcion: 'Sistema sin novedad. Operación nominal en todos los repetidores.',
    prioridad: 5,
    color: '#06B6D4'
  },

  // ==========================================
  // BLOQUE 20-39: GRANITO (GR) — SAR Y TERRENO
  // ==========================================
  {
    codigo: 'GR-20',
    mineral: 'GRANITO',
    nombreMineral: 'Granito',
    prefijo: 'GR',
    rango: '20-39',
    dominio: 'SAR, Terreno y Geofencing',
    descripcion: 'Iniciando patrullaje o abanico de búsqueda en sector asignado.',
    prioridad: 3,
    color: '#10B981'
  },
  {
    codigo: 'GR-21',
    mineral: 'GRANITO',
    nombreMineral: 'Granito',
    prefijo: 'GR',
    rango: '20-39',
    dominio: 'SAR, Terreno y Geofencing',
    descripcion: 'Avistamiento positivo de indicios, rastros o huellas de interés.',
    prioridad: 2,
    color: '#10B981',
    accionSugerida: 'Fijar coordenadas GPS y fotografiar sin alterar el terreno.'
  },
  {
    codigo: 'GR-22',
    mineral: 'GRANITO',
    nombreMineral: 'Granito',
    prefijo: 'GR',
    rango: '20-39',
    dominio: 'SAR, Terreno y Geofencing',
    descripcion: 'Avistamiento negativo en sector asignado. Área despejada.',
    prioridad: 4,
    color: '#10B981'
  },
  {
    codigo: 'GR-23',
    mineral: 'GRANITO',
    nombreMineral: 'Granito',
    prefijo: 'GR',
    rango: '20-39',
    dominio: 'SAR, Terreno y Geofencing',
    descripcion: 'Obstáculo natural intransitable en la ruta (deslave, crecida, risco).',
    prioridad: 2,
    color: '#10B981'
  },
  {
    codigo: 'GR-24',
    mineral: 'GRANITO',
    nombreMineral: 'Granito',
    prefijo: 'GR',
    rango: '20-39',
    dominio: 'SAR, Terreno y Geofencing',
    descripcion: 'Alerta de perímetro. Salida involuntaria o ruptura de cerca virtual (Geofence Breach).',
    prioridad: 1,
    color: '#EF4444',
    accionSugerida: 'Localizar patrulla en mapa y ordenar rectificación de rumbo inmediata.'
  },
  {
    codigo: 'GR-25',
    mineral: 'GRANITO',
    nombreMineral: 'Granito',
    prefijo: 'GR',
    rango: '20-39',
    dominio: 'SAR, Terreno y Geofencing',
    descripcion: 'Alerta de inactividad. Posible lesión u hombre caído sin movimiento >15 minutos.',
    prioridad: 1,
    color: '#DC2626',
    accionSugerida: 'Disparar búsqueda inmediata y verificar telemetría del rescatista.'
  },
  {
    codigo: 'GR-26',
    mineral: 'GRANITO',
    nombreMineral: 'Granito',
    prefijo: 'GR',
    rango: '20-39',
    dominio: 'SAR, Terreno y Geofencing',
    descripcion: 'Solicitud de apoyo con equipo técnico especializado y caninos K9.',
    prioridad: 2,
    color: '#10B981'
  },
  {
    codigo: 'GR-27',
    mineral: 'GRANITO',
    nombreMineral: 'Granito',
    prefijo: 'GR',
    rango: '20-39',
    dominio: 'SAR, Terreno y Geofencing',
    descripcion: 'Estableciendo puesto de comando avanzado en terreno.',
    prioridad: 3,
    color: '#10B981'
  },
  {
    codigo: 'GR-28',
    mineral: 'GRANITO',
    nombreMineral: 'Granito',
    prefijo: 'GR',
    rango: '20-39',
    dominio: 'SAR, Terreno y Geofencing',
    descripcion: 'Solicitud de iluminación de emergencia en escena nocturna.',
    prioridad: 3,
    color: '#10B981'
  },
  {
    codigo: 'GR-29',
    mineral: 'GRANITO',
    nombreMineral: 'Granito',
    prefijo: 'GR',
    rango: '20-39',
    dominio: 'SAR, Terreno y Geofencing',
    descripcion: 'Extravío temporal de orientación de rescatista en niebla o selva.',
    prioridad: 1,
    color: '#EF4444',
    accionSugerida: 'Activar baliza sonora y triangular azimut con radio Ónix-0.'
  },
  {
    codigo: 'GR-30',
    mineral: 'GRANITO',
    nombreMineral: 'Granito',
    prefijo: 'GR',
    rango: '20-39',
    dominio: 'SAR, Terreno y Geofencing',
    descripcion: 'Clima adverso severo en escena (tormenta eléctrica, vientos huracanados).',
    prioridad: 2,
    color: '#10B981'
  },
  {
    codigo: 'GR-31',
    mineral: 'GRANITO',
    nombreMineral: 'Granito',
    prefijo: 'GR',
    rango: '20-39',
    dominio: 'SAR, Terreno y Geofencing',
    descripcion: 'Solicitud de extracción de personal por fatiga extrema o deshidratación.',
    prioridad: 2,
    color: '#10B981'
  },
  {
    codigo: 'GR-32',
    mineral: 'GRANITO',
    nombreMineral: 'Granito',
    prefijo: 'GR',
    rango: '20-39',
    dominio: 'SAR, Terreno y Geofencing',
    descripcion: 'Perímetro de seguridad de escena establecido y asegurado.',
    prioridad: 4,
    color: '#10B981'
  },
  {
    codigo: 'GR-33',
    mineral: 'GRANITO',
    nombreMineral: 'Granito',
    prefijo: 'GR',
    rango: '20-39',
    dominio: 'SAR, Terreno y Geofencing',
    descripcion: 'Hallazgo de pertenencias o equipo personal de la persona buscada.',
    prioridad: 2,
    color: '#10B981'
  },
  {
    codigo: 'GR-34',
    mineral: 'GRANITO',
    nombreMineral: 'Granito',
    prefijo: 'GR',
    rango: '20-39',
    dominio: 'SAR, Terreno y Geofencing',
    descripcion: 'Inicio de técnica de búsqueda en peine coordinada.',
    prioridad: 3,
    color: '#10B981'
  },
  {
    codigo: 'GR-35',
    mineral: 'GRANITO',
    nombreMineral: 'Granito',
    prefijo: 'GR',
    rango: '20-39',
    dominio: 'SAR, Terreno y Geofencing',
    descripcion: 'Suspensión temporal de búsqueda por riesgo inminente o caída de noche.',
    prioridad: 2,
    color: '#10B981'
  },
  {
    codigo: 'GR-36',
    mineral: 'GRANITO',
    nombreMineral: 'Granito',
    prefijo: 'GR',
    rango: '20-39',
    dominio: 'SAR, Terreno y Geofencing',
    descripcion: 'Reanudación de operaciones tras ventana de seguridad.',
    prioridad: 3,
    color: '#10B981'
  },
  {
    codigo: 'GR-37',
    mineral: 'GRANITO',
    nombreMineral: 'Granito',
    prefijo: 'GR',
    rango: '20-39',
    dominio: 'SAR, Terreno y Geofencing',
    descripcion: 'Zona de aterrizaje para helicóptero (helipunto) asegurada y señalizada.',
    prioridad: 2,
    color: '#10B981'
  },
  {
    codigo: 'GR-38',
    mineral: 'GRANITO',
    nombreMineral: 'Granito',
    prefijo: 'GR',
    rango: '20-39',
    dominio: 'SAR, Terreno y Geofencing',
    descripcion: 'Solicitud de baqueano o guía local conocedor del sector.',
    prioridad: 3,
    color: '#10B981'
  },
  {
    codigo: 'GR-39',
    mineral: 'GRANITO',
    nombreMineral: 'Granito',
    prefijo: 'GR',
    rango: '20-39',
    dominio: 'SAR, Terreno y Geofencing',
    descripcion: 'Búsqueda finalizada sin novedades pendientes. Sector limpio y cerrado.',
    prioridad: 4,
    color: '#10B981'
  },

  // ==========================================
  // BLOQUE 40-59: ÁMBAR (AM) — TRIAJE PREHOSPITALARIO
  // ==========================================
  {
    codigo: 'AM-40',
    mineral: 'AMBAR',
    nombreMineral: 'Ámbar',
    prefijo: 'AM',
    rango: '40-59',
    dominio: 'Triaje y Soporte Prehospitalario',
    descripcion: 'Inicio de evaluación primaria de escena (START / triage rápido).',
    prioridad: 3,
    color: '#F59E0B'
  },
  {
    codigo: 'AM-41',
    mineral: 'AMBAR',
    nombreMineral: 'Ámbar',
    prefijo: 'AM',
    rango: '40-59',
    dominio: 'Triaje y Soporte Prehospitalario',
    descripcion: 'Triaje Rojo. Paciente crítico con compromiso vital inminente.',
    prioridad: 1,
    color: '#EF4444',
    accionSugerida: 'Despacho prioritario de ambulancia SVA y alerta de trauma hospitalario.'
  },
  {
    codigo: 'AM-42',
    mineral: 'AMBAR',
    nombreMineral: 'Ámbar',
    prefijo: 'AM',
    rango: '40-59',
    dominio: 'Triaje y Soporte Prehospitalario',
    descripcion: 'Triaje Amarillo. Paciente urgente con lesiones moderadas o fracturas.',
    prioridad: 2,
    color: '#F59E0B'
  },
  {
    codigo: 'AM-43',
    mineral: 'AMBAR',
    nombreMineral: 'Ámbar',
    prefijo: 'AM',
    rango: '40-59',
    dominio: 'Triaje y Soporte Prehospitalario',
    descripcion: 'Triaje Verde. Paciente leve ambulatorio, sin riesgo vital.',
    prioridad: 4,
    color: '#F59E0B'
  },
  {
    codigo: 'AM-44',
    mineral: 'AMBAR',
    nombreMineral: 'Ámbar',
    prefijo: 'AM',
    rango: '40-59',
    dominio: 'Triaje y Soporte Prehospitalario',
    descripcion: 'Triaje Negro. Paciente sin signos vitales u óbito en escena.',
    prioridad: 3,
    color: '#6B7280'
  },
  {
    codigo: 'AM-45',
    mineral: 'AMBAR',
    nombreMineral: 'Ámbar',
    prefijo: 'AM',
    rango: '40-59',
    dominio: 'Triaje y Soporte Prehospitalario',
    descripcion: 'Paciente estabilizado. Iniciando empaque en camilla canastilla.',
    prioridad: 3,
    color: '#F59E0B'
  },
  {
    codigo: 'AM-46',
    mineral: 'AMBAR',
    nombreMineral: 'Ámbar',
    prefijo: 'AM',
    rango: '40-59',
    dominio: 'Triaje y Soporte Prehospitalario',
    descripcion: 'Aplicación de torniquete de emergencia por hemorragia exanguinante.',
    prioridad: 1,
    color: '#EF4444',
    accionSugerida: 'Anotar hora exacta de colocación en frente y registrar en bitácora.'
  },
  {
    codigo: 'AM-47',
    mineral: 'AMBAR',
    nombreMineral: 'Ámbar',
    prefijo: 'AM',
    rango: '40-59',
    dominio: 'Triaje y Soporte Prehospitalario',
    descripcion: 'Control de vía aérea avanzada en curso (dispositivo supraglótico o intubación).',
    prioridad: 1,
    color: '#EF4444'
  },
  {
    codigo: 'AM-48',
    mineral: 'AMBAR',
    nombreMineral: 'Ámbar',
    prefijo: 'AM',
    rango: '40-59',
    dominio: 'Triaje y Soporte Prehospitalario',
    descripcion: 'Administración de oxígeno suplementario a alto flujo.',
    prioridad: 3,
    color: '#F59E0B'
  },
  {
    codigo: 'AM-49',
    mineral: 'AMBAR',
    nombreMineral: 'Ámbar',
    prefijo: 'AM',
    rango: '40-59',
    dominio: 'Triaje y Soporte Prehospitalario',
    descripcion: 'Paciente con sospecha de lesión medular. Inmovilización total raquídea.',
    prioridad: 2,
    color: '#F59E0B'
  },
  {
    codigo: 'AM-50',
    mineral: 'AMBAR',
    nombreMineral: 'Ámbar',
    prefijo: 'AM',
    rango: '40-59',
    dominio: 'Triaje y Soporte Prehospitalario',
    descripcion: 'Paciente con cuadro de hipotermia severa. Manta térmica y recalentamiento pasivo.',
    prioridad: 2,
    color: '#F59E0B'
  },
  {
    codigo: 'AM-51',
    mineral: 'AMBAR',
    nombreMineral: 'Ámbar',
    prefijo: 'AM',
    rango: '40-59',
    dominio: 'Triaje y Soporte Prehospitalario',
    descripcion: 'Intoxicación o mordedura de serpiente (Bothrops / Crotalus) en escena.',
    prioridad: 1,
    color: '#EF4444',
    accionSugerida: 'Solicitar suero antiofídico polivalente a hospital de referencia.'
  },
  {
    codigo: 'AM-52',
    mineral: 'AMBAR',
    nombreMineral: 'Ámbar',
    prefijo: 'AM',
    rango: '40-59',
    dominio: 'Triaje y Soporte Prehospitalario',
    descripcion: 'Lesión por quemaduras térmicas o químicas de segundo/tercer grado.',
    prioridad: 2,
    color: '#F59E0B'
  },
  {
    codigo: 'AM-53',
    mineral: 'AMBAR',
    nombreMineral: 'Ámbar',
    prefijo: 'AM',
    rango: '40-59',
    dominio: 'Triaje y Soporte Prehospitalario',
    descripcion: 'Paro cardiorrespiratorio en curso. RCP avanzado y DEA conectado.',
    prioridad: 1,
    color: '#DC2626',
    accionSugerida: 'Continuar ciclos de compresión 30:2 y seguir instrucciones del DEA.'
  },
  {
    codigo: 'AM-54',
    mineral: 'AMBAR',
    nombreMineral: 'Ámbar',
    prefijo: 'AM',
    rango: '40-59',
    dominio: 'Triaje y Soporte Prehospitalario',
    descripcion: 'Paciente pediátrico o mujer gestante en trabajo de parto inminente.',
    prioridad: 2,
    color: '#F59E0B'
  },
  {
    codigo: 'AM-55',
    mineral: 'AMBAR',
    nombreMineral: 'Ámbar',
    prefijo: 'AM',
    rango: '40-59',
    dominio: 'Triaje y Soporte Prehospitalario',
    descripcion: 'Colocación de vía endovenosa periférica e infusión de fluidoterapia.',
    prioridad: 3,
    color: '#F59E0B'
  },
  {
    codigo: 'AM-56',
    mineral: 'AMBAR',
    nombreMineral: 'Ámbar',
    prefijo: 'AM',
    rango: '40-59',
    dominio: 'Triaje y Soporte Prehospitalario',
    descripcion: 'Inicio de extracción de paciente en terreno agreste (tirolesa / acarreo).',
    prioridad: 2,
    color: '#F59E0B'
  },
  {
    codigo: 'AM-57',
    mineral: 'AMBAR',
    nombreMineral: 'Ámbar',
    prefijo: 'AM',
    rango: '40-59',
    dominio: 'Triaje y Soporte Prehospitalario',
    descripcion: 'Solicitud de insumos médicos adicionales, férulas o tabla rígida.',
    prioridad: 3,
    color: '#F59E0B'
  },
  {
    codigo: 'AM-58',
    mineral: 'AMBAR',
    nombreMineral: 'Ámbar',
    prefijo: 'AM',
    rango: '40-59',
    dominio: 'Triaje y Soporte Prehospitalario',
    descripcion: 'Signos vitales completos registrados en planilla digital prehospitalaria.',
    prioridad: 4,
    color: '#F59E0B'
  },
  {
    codigo: 'AM-59',
    mineral: 'AMBAR',
    nombreMineral: 'Ámbar',
    prefijo: 'AM',
    rango: '40-59',
    dominio: 'Triaje y Soporte Prehospitalario',
    descripcion: 'Paciente entregado a centro médico receptor. Cierre de expediente.',
    prioridad: 3,
    color: '#F59E0B'
  },

  // ==========================================
  // BLOQUE 60-79: DIAMANTE (DM) — PROTOCOLOS MÉDICOS
  // ==========================================
  {
    codigo: 'DM-60',
    mineral: 'DIAMANTE',
    nombreMineral: 'Diamante',
    prefijo: 'DM',
    rango: '60-79',
    dominio: 'Protocolos y Dirección Médica',
    descripcion: 'Solicitud de enlace prioritario con médico director de guardia.',
    prioridad: 2,
    color: '#38BDF8'
  },
  {
    codigo: 'DM-61',
    mineral: 'DIAMANTE',
    nombreMineral: 'Diamante',
    prefijo: 'DM',
    rango: '60-79',
    dominio: 'Protocolos y Dirección Médica',
    descripcion: 'Autorización concedida. Procedimiento médico aprobado por dirección.',
    prioridad: 3,
    color: '#38BDF8'
  },
  {
    codigo: 'DM-62',
    mineral: 'DIAMANTE',
    nombreMineral: 'Diamante',
    prefijo: 'DM',
    rango: '60-79',
    dominio: 'Protocolos y Dirección Médica',
    descripcion: 'Alto inmediato. Orden médica de suspender procedimiento riesgoso.',
    prioridad: 1,
    color: '#EF4444',
    accionSugerida: 'Detener de inmediato maniobra invasiva y seguir contraorden.'
  },
  {
    codigo: 'DM-63',
    mineral: 'DIAMANTE',
    nombreMineral: 'Diamante',
    prefijo: 'DM',
    rango: '60-79',
    dominio: 'Protocolos y Dirección Médica',
    descripcion: 'Autorización para administración de fármaco analgésico controlado (opioide).',
    prioridad: 2,
    color: '#38BDF8'
  },
  {
    codigo: 'DM-64',
    mineral: 'DIAMANTE',
    nombreMineral: 'Diamante',
    prefijo: 'DM',
    rango: '60-79',
    dominio: 'Protocolos y Dirección Médica',
    descripcion: 'Autorización para fármaco vasoactivo o inducción para intubación rápida.',
    prioridad: 1,
    color: '#38BDF8'
  },
  {
    codigo: 'DM-65',
    mineral: 'DIAMANTE',
    nombreMineral: 'Diamante',
    prefijo: 'DM',
    rango: '60-79',
    dominio: 'Protocolos y Dirección Médica',
    descripcion: 'Protocolo de reanimación prolongada (más de 20 minutos) autorizado.',
    prioridad: 2,
    color: '#38BDF8'
  },
  {
    codigo: 'DM-66',
    mineral: 'DIAMANTE',
    nombreMineral: 'Diamante',
    prefijo: 'DM',
    rango: '60-79',
    dominio: 'Protocolos y Dirección Médica',
    descripcion: 'Criterio de certificación de fallecimiento evaluado y confirmado.',
    prioridad: 3,
    color: '#6B7280'
  },
  {
    codigo: 'DM-67',
    mineral: 'DIAMANTE',
    nombreMineral: 'Diamante',
    prefijo: 'DM',
    rango: '60-79',
    dominio: 'Protocolos y Dirección Médica',
    descripcion: 'Transmisión de telemetría y trazado electrocardiográfico (ECG) a base.',
    prioridad: 3,
    color: '#38BDF8'
  },
  {
    codigo: 'DM-68',
    mineral: 'DIAMANTE',
    nombreMineral: 'Diamante',
    prefijo: 'DM',
    rango: '60-79',
    dominio: 'Protocolos y Dirección Médica',
    descripcion: 'Consulta sobre interacción o priorización ante politraumatismo severo.',
    prioridad: 2,
    color: '#38BDF8'
  },
  {
    codigo: 'DM-69',
    mineral: 'DIAMANTE',
    nombreMineral: 'Diamante',
    prefijo: 'DM',
    rango: '60-79',
    dominio: 'Protocolos y Dirección Médica',
    descripcion: 'Aplicando criterio de estabilización base "Scoop and Run" / traslado inmediato.',
    prioridad: 2,
    color: '#38BDF8'
  },
  {
    codigo: 'DM-70',
    mineral: 'DIAMANTE',
    nombreMineral: 'Diamante',
    prefijo: 'DM',
    rango: '60-79',
    dominio: 'Protocolos y Dirección Médica',
    descripcion: 'Aprobación de traslado aeromédico por médico jefe de operaciones.',
    prioridad: 1,
    color: '#38BDF8'
  },
  {
    codigo: 'DM-71',
    mineral: 'DIAMANTE',
    nombreMineral: 'Diamante',
    prefijo: 'DM',
    rango: '60-79',
    dominio: 'Protocolos y Dirección Médica',
    descripcion: 'Verificación de consentimiento informado firmado por familiares.',
    prioridad: 4,
    color: '#38BDF8'
  },
  {
    codigo: 'DM-72',
    mineral: 'DIAMANTE',
    nombreMineral: 'Diamante',
    prefijo: 'DM',
    rango: '60-79',
    dominio: 'Protocolos y Dirección Médica',
    descripcion: 'Activación de protocolo de contención y primeros auxilios psicológicos.',
    prioridad: 3,
    color: '#38BDF8'
  },
  {
    codigo: 'DM-73',
    mineral: 'DIAMANTE',
    nombreMineral: 'Diamante',
    prefijo: 'DM',
    rango: '60-79',
    dominio: 'Protocolos y Dirección Médica',
    descripcion: 'Solicitud de historial médico previo o patologías de base del paciente.',
    prioridad: 3,
    color: '#38BDF8'
  },
  {
    codigo: 'DM-74',
    mineral: 'DIAMANTE',
    nombreMineral: 'Diamante',
    prefijo: 'DM',
    rango: '60-79',
    dominio: 'Protocolos y Dirección Médica',
    descripcion: 'Autorización de alta en sitio por negativa voluntaria de traslado.',
    prioridad: 4,
    color: '#38BDF8'
  },
  {
    codigo: 'DM-75',
    mineral: 'DIAMANTE',
    nombreMineral: 'Diamante',
    prefijo: 'DM',
    rango: '60-79',
    dominio: 'Protocolos y Dirección Médica',
    descripcion: 'Cierre de bitácora médico legal y resguardo de responsabilidades.',
    prioridad: 4,
    color: '#38BDF8'
  },
  {
    codigo: 'DM-76',
    mineral: 'DIAMANTE',
    nombreMineral: 'Diamante',
    prefijo: 'DM',
    rango: '60-79',
    dominio: 'Protocolos y Dirección Médica',
    descripcion: 'Alerta epidemiológica o riesgo biológico en escena (aislamiento Tipo 3).',
    prioridad: 1,
    color: '#EF4444'
  },
  {
    codigo: 'DM-77',
    mineral: 'DIAMANTE',
    nombreMineral: 'Diamante',
    prefijo: 'DM',
    rango: '60-79',
    dominio: 'Protocolos y Dirección Médica',
    descripcion: 'Solicitud de interconsulta con especialista (neurocirugía, toxicología).',
    prioridad: 2,
    color: '#38BDF8'
  },
  {
    codigo: 'DM-78',
    mineral: 'DIAMANTE',
    nombreMineral: 'Diamante',
    prefijo: 'DM',
    rango: '60-79',
    dominio: 'Protocolos y Dirección Médica',
    descripcion: 'Validación de cadena de custodia de evidencias y pertenencias del paciente.',
    prioridad: 4,
    color: '#38BDF8'
  },
  {
    codigo: 'DM-79',
    mineral: 'DIAMANTE',
    nombreMineral: 'Diamante',
    prefijo: 'DM',
    rango: '60-79',
    dominio: 'Protocolos y Dirección Médica',
    descripcion: 'Protocolo Diamante completado sin observaciones. Conforme.',
    prioridad: 4,
    color: '#38BDF8'
  },

  // ==========================================
  // BLOQUE 80-89: COBALTO (CB) — LOGÍSTICA Y PTT
  // ==========================================
  {
    codigo: 'CB-80',
    mineral: 'COBALTO',
    nombreMineral: 'Cobalto',
    prefijo: 'CB',
    rango: '80-89',
    dominio: 'Transporte, Vehículos y PTT',
    descripcion: 'Unidad móvil en apresto operacional en base central.',
    prioridad: 4,
    color: '#3B82F6',
    cambioCanalPtt: 'CANAL_BASE_0'
  },
  {
    codigo: 'CB-81',
    mineral: 'COBALTO',
    nombreMineral: 'Cobalto',
    prefijo: 'CB',
    rango: '80-89',
    dominio: 'Transporte, Vehículos y PTT',
    descripcion: 'Unidad en ruta hacia el teatro de operaciones (desplazamiento táctico).',
    prioridad: 2,
    color: '#3B82F6',
    cambioCanalPtt: 'CANAL_TACTICO_1'
  },
  {
    codigo: 'CB-82',
    mineral: 'COBALTO',
    nombreMineral: 'Cobalto',
    prefijo: 'CB',
    rango: '80-89',
    dominio: 'Transporte, Vehículos y PTT',
    descripcion: 'Arribo físico de la unidad al sitio del incidente (en escena).',
    prioridad: 2,
    color: '#3B82F6',
    cambioCanalPtt: 'CANAL_ESCENA_2'
  },
  {
    codigo: 'CB-83',
    mineral: 'COBALTO',
    nombreMineral: 'Cobalto',
    prefijo: 'CB',
    rango: '80-89',
    dominio: 'Transporte, Vehículos y PTT',
    descripcion: 'Iniciando traslado de paciente hacia centro hospitalario receptor.',
    prioridad: 1,
    color: '#3B82F6',
    cambioCanalPtt: 'CANAL_SANITARIO_3'
  },
  {
    codigo: 'CB-84',
    mineral: 'COBALTO',
    nombreMineral: 'Cobalto',
    prefijo: 'CB',
    rango: '80-89',
    dominio: 'Transporte, Vehículos y PTT',
    descripcion: 'Ingreso y transferencia física en emergencia del hospital.',
    prioridad: 3,
    color: '#3B82F6',
    cambioCanalPtt: 'CANAL_SANITARIO_3'
  },
  {
    codigo: 'CB-85',
    mineral: 'COBALTO',
    nombreMineral: 'Cobalto',
    prefijo: 'CB',
    rango: '80-89',
    dominio: 'Transporte, Vehículos y PTT',
    descripcion: 'Unidad disponible en ruta de retorno a base.',
    prioridad: 4,
    color: '#3B82F6',
    cambioCanalPtt: 'CANAL_TACTICO_1'
  },
  {
    codigo: 'CB-86',
    mineral: 'COBALTO',
    nombreMineral: 'Cobalto',
    prefijo: 'CB',
    rango: '80-89',
    dominio: 'Transporte, Vehículos y PTT',
    descripcion: 'Retorno de unidad a base central concluido. En servicio.',
    prioridad: 4,
    color: '#3B82F6',
    cambioCanalPtt: 'CANAL_BASE_0'
  },
  {
    codigo: 'CB-87',
    mineral: 'COBALTO',
    nombreMineral: 'Cobalto',
    prefijo: 'CB',
    rango: '80-89',
    dominio: 'Transporte, Vehículos y PTT',
    descripcion: 'Avería mecánica o ponchadura en vehículo de rescate en ruta.',
    prioridad: 2,
    color: '#3B82F6'
  },
  {
    codigo: 'CB-88',
    mineral: 'COBALTO',
    nombreMineral: 'Cobalto',
    prefijo: 'CB',
    rango: '80-89',
    dominio: 'Transporte, Vehículos y PTT',
    descripcion: 'Nivel bajo de combustible. Unidad requiere reabastecimiento urgente.',
    prioridad: 3,
    color: '#3B82F6'
  },
  {
    codigo: 'CB-89',
    mineral: 'COBALTO',
    nombreMineral: 'Cobalto',
    prefijo: 'CB',
    rango: '80-89',
    dominio: 'Transporte, Vehículos y PTT',
    descripcion: 'Convoy de unidades en desplazamiento coordinado bajo código.',
    prioridad: 3,
    color: '#3B82F6'
  },

  // ==========================================
  // BLOQUE 90-99: ÓXIN (NX) — COMANDO Y CIBERSEGURIDAD
  // ==========================================
  {
    codigo: 'NX-90',
    mineral: 'ONIX',
    nombreMineral: 'Ónix',
    prefijo: 'NX',
    rango: '90-99',
    dominio: 'Comando Central y Ciberseguridad',
    descripcion: 'Estación Central Ónix-0 en control total y escucha activa.',
    prioridad: 3,
    color: '#8B5CF6'
  },
  {
    codigo: 'NX-91',
    mineral: 'ONIX',
    nombreMineral: 'Ónix',
    prefijo: 'NX',
    rango: '90-99',
    dominio: 'Comando Central y Ciberseguridad',
    descripcion: 'Red mallada institucional estable con todos los nodos sincronizados.',
    prioridad: 4,
    color: '#8B5CF6'
  },
  {
    codigo: 'NX-92',
    mineral: 'ONIX',
    nombreMineral: 'Ónix',
    prefijo: 'NX',
    rango: '90-99',
    dominio: 'Comando Central y Ciberseguridad',
    descripcion: 'Alerta de intrusión: nodo no autorizado intentó acceder al servidor.',
    prioridad: 1,
    color: '#EF4444',
    accionSugerida: 'Verificar IP en auditoría e iniciar aislamiento.'
  },
  {
    codigo: 'NX-93',
    mineral: 'ONIX',
    nombreMineral: 'Ónix',
    prefijo: 'NX',
    rango: '90-99',
    dominio: 'Comando Central y Ciberseguridad',
    descripcion: 'Activación de bloqueo automático de firewall (iptables DROP tras 5 fallos).',
    prioridad: 1,
    color: '#DC2626',
    accionSugerida: 'Dirección IP aislada en kernel. Notificado a canal Telegram.'
  },
  {
    codigo: 'NX-94',
    mineral: 'ONIX',
    nombreMineral: 'Ónix',
    prefijo: 'NX',
    rango: '90-99',
    dominio: 'Comando Central y Ciberseguridad',
    descripcion: 'Solicitud de desbloqueo administrativo de dirección IP autenticada.',
    prioridad: 3,
    color: '#8B5CF6'
  },
  {
    codigo: 'NX-95',
    mineral: 'ONIX',
    nombreMineral: 'Ónix',
    prefijo: 'NX',
    rango: '90-99',
    dominio: 'Comando Central y Ciberseguridad',
    descripcion: 'Orden de emergencia de borrado criptográfico remoto de terminal extraviada.',
    prioridad: 1,
    color: '#DC2626'
  },
  {
    codigo: 'NX-96',
    mineral: 'ONIX',
    nombreMineral: 'Ónix',
    prefijo: 'NX',
    rango: '90-99',
    dominio: 'Comando Central y Ciberseguridad',
    descripcion: 'Respaldo automático de base de datos con cifrado GPG completado.',
    prioridad: 4,
    color: '#8B5CF6'
  },
  {
    codigo: 'NX-97',
    mineral: 'ONIX',
    nombreMineral: 'Ónix',
    prefijo: 'NX',
    rango: '90-99',
    dominio: 'Comando Central y Ciberseguridad',
    descripcion: 'Rotación programada de tokens JWT y llaves simétricas completada.',
    prioridad: 3,
    color: '#8B5CF6'
  },
  {
    codigo: 'NX-98',
    mineral: 'ONIX',
    nombreMineral: 'Ónix',
    prefijo: 'NX',
    rango: '90-99',
    dominio: 'Comando Central y Ciberseguridad',
    descripcion: 'Activación de nivel de alerta institucional máximo (Código Rojo SAR).',
    prioridad: 1,
    color: '#EF4444'
  },
  {
    codigo: 'NX-99',
    mineral: 'ONIX',
    nombreMineral: 'Ónix',
    prefijo: 'NX',
    rango: '90-99',
    dominio: 'Comando Central y Ciberseguridad',
    descripcion: 'Fin de comando y cierre formal de operaciones generales del día.',
    prioridad: 4,
    color: '#8B5CF6'
  }
];

export const MAPEO_CANALES_PTT: Record<string, { canalId: string; nombre: string; freq: string }> = {
  'CB-80': { canalId: 'CANAL_BASE_0', nombre: 'Canal Base 0 (General)', freq: '146.520 MHz' },
  'CB-81': { canalId: 'CANAL_TACTICO_1', nombre: 'Canal Táctico 1 (Desplazamiento)', freq: '147.450 MHz' },
  'CB-82': { canalId: 'CANAL_ESCENA_2', nombre: 'Canal Escena 2 (Operaciones SAR)', freq: '147.500 MHz' },
  'CB-83': { canalId: 'CANAL_SANITARIO_3', nombre: 'Canal Médico 3 (Enlace Hospital)', freq: '155.340 MHz' },
  'CB-84': { canalId: 'CANAL_SANITARIO_3', nombre: 'Canal Médico 3 (Enlace Hospital)', freq: '155.340 MHz' },
  'CB-85': { canalId: 'CANAL_TACTICO_1', nombre: 'Canal Táctico 1 (Desplazamiento)', freq: '147.450 MHz' },
  'CB-86': { canalId: 'CANAL_BASE_0', nombre: 'Canal Base 0 (General)', freq: '146.520 MHz' },
};
