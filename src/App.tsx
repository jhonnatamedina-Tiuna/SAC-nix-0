import React, { useState } from 'react';
import { TacticalUnit, SacCode, PttChannelInfo, CriticalAlert, BlockedIp, TelegramMessage, OfflineQueueItem } from './types/tactical';
import { UNIDADES_INICIALES, CANALES_PTT_DISPONIBLES } from './data/tacticalUnits';
import { IPS_BLOQUEADAS_INICIALES } from './data/networkRules';
import { MAPEO_CANALES_PTT, SAC_MATRIX } from './data/sacMatrix';
import { tacticalAudio } from './utils/audio';
import { calcularDistanciaMetros, encontrarUnidadMasCercana } from './utils/geo';

// Componentes
import { TacticalMap } from './components/TacticalMap';
import { SacMatrixPanel } from './components/SacMatrixPanel';
import { PttConsole } from './components/PttConsole';
import { CyberDefensePanel } from './components/CyberDefensePanel';
import { TelegramConsole } from './components/TelegramConsole';
import { MobileTerminalSim } from './components/MobileTerminalSim';
import { BackendCodeViewer } from './components/BackendCodeViewer';
import { EmergencyAlertBanner } from './components/EmergencyAlertBanner';

// Iconos
import { Map, Shield, Radio, Terminal, Smartphone, FileCode, AlertTriangle, Activity, Bell } from 'lucide-react';

type TabView = 'C4ISR_CONSOLA' | 'MATRIZ_SAC' | 'RADIO_PTT' | 'CIBERDEFENSA' | 'TELEGRAM_BOT' | 'TERMINAL_MOVIL' | 'SCRIPTS_BACKEND';

export default function App() {
  const [tabActiva, setTabActiva] = useState<TabView>('C4ISR_CONSOLA');
  const [unidades, setUnidades] = useState<TacticalUnit[]>(UNIDADES_INICIALES);
  const [canalPttActivo, setCanalPttActivo] = useState<PttChannelInfo>(CANALES_PTT_DISPONIBLES[0]);
  const [ipsBloqueadas, setIpsBloqueadas] = useState<BlockedIp[]>(IPS_BLOQUEADAS_INICIALES);
  const [alertaCriticaActiva, setAlertaCriticaActiva] = useState<CriticalAlert | null>(null);

  // Incidente activo seleccionado en el mapa
  const [incidenteActivo, setIncidenteActivo] = useState<{
    lat: number;
    lon: number;
    descripcion: string;
    codigoSac: string;
  } | null>(null);

  // Mensajes del bot de Telegram
  const [mensajesTelegram, setMensajesTelegram] = useState<TelegramMessage[]>([
    {
      id: 'init-1',
      remitente: 'BOT_TIUNA',
      texto: '🤖 *Servicio Bot Táctico Inicializado*\n• Canales PostgreSQL LISTEN: `canal_urgencias_tiuna`, `canal_firewall_drop` activos.\n• Monitoreo de seguridad y despacho operacional listo.',
      timestamp: new Date().toLocaleTimeString(),
      tipo: 'INFO'
    }
  ]);

  // Manejar transmisión de clave SAC desde cualquier panel
  const handleTransmitirClave = (c: SacCode) => {
    // Si la clave es de Cobalto (CB-80..86), conmutar canal PTT y actualizar estado de Cobalto-1
    if (c.cambioCanalPtt && MAPEO_CANALES_PTT[c.codigo]) {
      const mapeo = MAPEO_CANALES_PTT[c.codigo];
      const canalEncontrado = CANALES_PTT_DISPONIBLES.find(item => item.id === mapeo.canalId);
      if (canalEncontrado) {
        setCanalPttActivo(canalEncontrado);
      }

      setUnidades(prev =>
        prev.map(u => (u.indicativo === 'Cobalto-1' ? { ...u, estadoSac: c.codigo, canalPttActual: mapeo.canalId } : u))
      );
    }

    // Si es alerta de máxima prioridad (P1), disparar alarma y mensaje push
    if (c.prioridad === 1) {
      tacticalAudio.playCriticalAlertChime();

      // Calcular unidad sugerida PostGIS
      const refLat = incidenteActivo ? incidenteActivo.lat : 10.4900;
      const refLon = incidenteActivo ? incidenteActivo.lon : -66.8900;
      const masCercana = encontrarUnidadMasCercana(refLat, refLon, unidades, 'AMBULANCIA');

      const nuevaAlerta: CriticalAlert = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        tipoEvento: c.codigo,
        unidadId: 'Cobalto-1',
        prioridad: 1,
        descripcion: c.descripcion,
        latitud: refLat,
        longitud: refLon,
        unidadSugerida: masCercana?.unidad.indicativo,
        distanciaMetros: masCercana?.distanciaMetros,
        atendida: false
      };

      setAlertaCriticaActiva(nuevaAlerta);

      // Notificar a canal Telegram (LISTEN/NOTIFY)
      const telegramAlertMsg: TelegramMessage = {
        id: crypto.randomUUID(),
        remitente: 'BOT_TIUNA',
        texto: (
          `🚨 *¡ALERTA TÁCTICA CRÍTICA EN CAMPO!* 🚨\n\n` +
          `• *Clave SAC:* \`${c.codigo}\`\n` +
          `• *Significado:* _${c.descripcion}_\n` +
          `• *Unidad Emisora:* \`Cobalto-1\`\n` +
          `• *Prioridad:* \`P1 (Crítica)\`\n` +
          (masCercana ? `\n📍 *Despacho Sugerido PostGIS:*\n• *Unidad:* \`${masCercana.unidad.indicativo}\` (${(masCercana.distanciaMetros / 1000).toFixed(2)} km)\n` : '')
        ),
        timestamp: new Date().toLocaleTimeString(),
        tipo: 'ALERTA'
      };

      setMensajesTelegram(prev => [...prev, telegramAlertMsg]);
    }
  };

  // Despacho de unidad a un incidente
  const handleDespacharUnidad = (
    indicativo: string,
    nuevoEstado: string,
    destinoLat: number,
    destinoLon: number
  ) => {
    setUnidades(prev =>
      prev.map(u => {
        if (u.indicativo === indicativo) {
          return {
            ...u,
            estadoSac: nuevoEstado,
            canalPttActual: 'CANAL_TACTICO_1',
            latitud: destinoLat,
            longitud: destinoLon,
            velocidadKmh: 45,
            ultimaActualizacion: new Date().toISOString()
          };
        }
        return u;
      })
    );

    // Cambiar PTT a canal táctico 1
    const canalTactico = CANALES_PTT_DISPONIBLES.find(c => c.id === 'CANAL_TACTICO_1');
    if (canalTactico) {
      setCanalPttActivo(canalTactico);
    }

    if (alertaCriticaActiva) {
      setAlertaCriticaActiva(prev => (prev ? { ...prev, atendida: true } : null));
    }

    // Notificación en Telegram
    const msg: TelegramMessage = {
      id: crypto.randomUUID(),
      remitente: 'BOT_TIUNA',
      texto: `📻 *DESPACHO CONFIRMADO*\n• Unidad: \`${indicativo}\`\n• Estado: \`${nuevoEstado}\` (En ruta hacia el incidente)\n• Canal de voz: \`Canal Táctico 1 (147.450 MHz)\``,
      timestamp: new Date().toLocaleTimeString(),
      tipo: 'INFO'
    };
    setMensajesTelegram(prev => [...prev, msg]);
  };

  // Notificación de Firewall Drop tras 5 fallos
  const handleAlertaDrop = (ip: string, motivo: string, fallos: number) => {
    const dropMsg: TelegramMessage = {
      id: crypto.randomUUID(),
      remitente: 'BOT_TIUNA',
      texto: (
        `🛡️ *ACTIVACIÓN AUTOMÁTICA DE FIREWALL (NX-93)* 🛡️\n\n` +
        `• *IP Aislada en iptables:* \`${ip}\`\n` +
        `• *Motivo:* \`${motivo}\`\n` +
        `• *Total de Intentos Fallidos:* \`${fallos}\`\n\n` +
        `Para levantar la sanción, use en este bot:\n\`/unblock ${ip}\``
      ),
      timestamp: new Date().toLocaleTimeString(),
      tipo: 'ALERTA'
    };
    setMensajesTelegram(prev => [...prev, dropMsg]);
  };

  // Desbloqueo de IP
  const handleDesbloquearIp = (ip: string) => {
    setIpsBloqueadas(prev => prev.filter(item => item.ip !== ip));
    tacticalAudio.playRogerBeep();
  };

  // Procesar ráfaga offline entregada a Ónix-0
  const handleSyncRafaga = (paquetes: OfflineQueueItem[]) => {
    const syncMsg: TelegramMessage = {
      id: crypto.randomUUID(),
      remitente: 'BOT_TIUNA',
      texto: `📥 *RÁFAGA OFFLINE SINCRONIZADA (NX-91)*\n• Paquetes recibidos e insertados: \`${paquetes.length}\`\n• Unidad: \`${paquetes[0]?.unidadId || 'Desconocida'}\`\n• Ledger: \`Idempotencia Verificada (UUID)\``,
      timestamp: new Date().toLocaleTimeString(),
      tipo: 'INFO'
    };
    setMensajesTelegram(prev => [...prev, syncMsg]);
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans">
      {/* ============================================================== */}
      {/* STRICT TOP BAR CONTRACT (§2): 3 Zones separated by gap-8       */}
      {/* ============================================================== */}
      <header className="flex items-center justify-between gap-8 px-6 py-3.5 bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
        {/* Zona 1: Wordmark limpio en una sola línea */}
        <div className="flex items-center gap-2 whitespace-nowrap shrink-0">
          <span className="text-base font-bold tracking-tight text-white font-mono">
            Ónix-0 · Rescate Tiuna
          </span>
          <span className="text-slate-600">/</span>
          <span className="text-xs text-amber-400 font-mono">C4ISR Central</span>
        </div>

        {/* Zona 2: Enlaces de navegación táctica concisos */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-slate-400">
          <button
            onClick={() => setTabActiva('C4ISR_CONSOLA')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              tabActiva === 'C4ISR_CONSOLA' ? 'text-amber-400 font-bold border-b border-amber-400 pb-0.5' : 'hover:text-slate-200'
            }`}
          >
            Consola C4ISR
          </button>
          <button
            onClick={() => setTabActiva('MATRIZ_SAC')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              tabActiva === 'MATRIZ_SAC' ? 'text-amber-400 font-bold border-b border-amber-400 pb-0.5' : 'hover:text-slate-200'
            }`}
          >
            Matriz SAC 01–99
          </button>
          <button
            onClick={() => setTabActiva('RADIO_PTT')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              tabActiva === 'RADIO_PTT' ? 'text-amber-400 font-bold border-b border-amber-400 pb-0.5' : 'hover:text-slate-200'
            }`}
          >
            Radio PTT
          </button>
          <button
            onClick={() => setTabActiva('CIBERDEFENSA')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              tabActiva === 'CIBERDEFENSA' ? 'text-amber-400 font-bold border-b border-amber-400 pb-0.5' : 'hover:text-slate-200'
            }`}
          >
            Firewall & Red
          </button>
          <button
            onClick={() => setTabActiva('TELEGRAM_BOT')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              tabActiva === 'TELEGRAM_BOT' ? 'text-amber-400 font-bold border-b border-amber-400 pb-0.5' : 'hover:text-slate-200'
            }`}
          >
            Bot Telegram
          </button>
          <button
            onClick={() => setTabActiva('TERMINAL_MOVIL')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              tabActiva === 'TERMINAL_MOVIL' ? 'text-amber-400 font-bold border-b border-amber-400 pb-0.5' : 'hover:text-slate-200'
            }`}
          >
            Motor Offline
          </button>
          <button
            onClick={() => setTabActiva('SCRIPTS_BACKEND')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              tabActiva === 'SCRIPTS_BACKEND' ? 'text-amber-400 font-bold border-b border-amber-400 pb-0.5' : 'hover:text-slate-200'
            }`}
          >
            Scripts Python/SQL
          </button>
        </nav>

        {/* Zona 3: 1 Acción Primaria */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => {
              const sacQz18 = SAC_MATRIX.find(c => c.codigo === 'QZ-18');
              if (sacQz18) {
                handleTransmitirClave(sacQz18);
              }
            }}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap shrink-0 font-mono shadow-md shadow-amber-500/20"
          >
            Alerta General QZ-18
          </button>
        </div>
      </header>

      {/* Selector móvil de vistas (en pantallas estrechas) */}
      <div className="lg:hidden bg-slate-950 border-b border-slate-800 px-4 py-2 flex items-center gap-2 overflow-x-auto scrollbar-none text-xs">
        {[
          { id: 'C4ISR_CONSOLA', label: 'C4ISR' },
          { id: 'MATRIZ_SAC', label: 'SAC 01-99' },
          { id: 'RADIO_PTT', label: 'Radio PTT' },
          { id: 'CIBERDEFENSA', label: 'Firewall' },
          { id: 'TELEGRAM_BOT', label: 'Telegram' },
          { id: 'TERMINAL_MOVIL', label: 'Motor Offline' },
          { id: 'SCRIPTS_BACKEND', label: 'Backend' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTabActiva(t.id as TabView)}
            className={`px-3 py-1 rounded whitespace-nowrap font-mono ${
              tabActiva === t.id ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-400'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Contenido Principal */}
      <main className="flex-1 p-4 md:p-6 max-w-[1720px] w-full mx-auto flex flex-col">
        {/* Banner de Emergencia Crítica HUD */}
        <EmergencyAlertBanner
          alerta={alertaCriticaActiva}
          onDespachar={(indicativo) => {
            if (alertaCriticaActiva?.latitud && alertaCriticaActiva?.longitud) {
              handleDespacharUnidad(
                indicativo,
                'CB-81',
                alertaCriticaActiva.latitud,
                alertaCriticaActiva.longitud
              );
            }
          }}
          onCerrar={() => setAlertaCriticaActiva(null)}
        />

        {/* Vista 1: Consola C4ISR Maestro Unificada */}
        {tabActiva === 'C4ISR_CONSOLA' && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1">
            {/* Columna Izquierda: Mapa Táctico PostGIS + Telemetría de Unidades (7 cols) */}
            <div className="xl:col-span-7 flex flex-col gap-6">
              <div className="h-[520px]">
                <TacticalMap
                  unidades={unidades}
                  onDespacharUnidad={handleDespacharUnidad}
                  onGenerarAlerta={(alerta) => {
                    const id = crypto.randomUUID();
                    const fullAlert = { ...alerta, id, timestamp: new Date().toISOString() };
                    setAlertaCriticaActiva(fullAlert);
                    const msg: TelegramMessage = {
                      id: crypto.randomUUID(),
                      remitente: 'BOT_TIUNA',
                      texto: `🚨 *ALERTA TÁCTICA GENERADA*\n• Clave: \`${alerta.tipoEvento}\`\n• Emisor: \`${alerta.unidadId}\`\n• Motivo: ${alerta.descripcion}`,
                      timestamp: new Date().toLocaleTimeString(),
                      tipo: 'ALERTA'
                    };
                    setMensajesTelegram(prev => [...prev, msg]);
                  }}
                  incidenteActivo={incidenteActivo}
                  setIncidenteActivo={setIncidenteActivo}
                />
              </div>

              {/* Tira de Unidades Tácticas en Servicio */}
              <div className="bg-[#0f172a] rounded-xl border border-slate-800 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-amber-400" />
                    <span>Unidades Tácticas y Frecuencias en Tiempo Real</span>
                  </h3>
                  <span className="text-[11px] font-mono text-slate-500">PostGIS Geometry WGS-84</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {unidades.map(u => {
                    const isBase = u.tipo === 'BASE';
                    return (
                      <div key={u.indicativo} className="bg-slate-950 p-3 rounded-lg border border-slate-850 text-xs font-mono">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-sm">{u.indicativo}</span>
                          <span className="text-amber-400 font-bold">{u.estadoSac}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">{u.operador}</div>
                        <div className="text-[10px] text-slate-500 mt-2 flex items-center justify-between">
                          <span>{u.canalPttActual}</span>
                          <span>Bat: {u.bateria}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Columna Derecha: Radio PTT + Matriz SAC Compacta (5 cols) */}
            <div className="xl:col-span-5 flex flex-col gap-6">
              <div className="h-[430px]">
                <PttConsole
                  canalActivo={canalPttActivo}
                  onCambiarCanal={setCanalPttActivo}
                  unidadVinculada="Cobalto-1"
                  estadoCobaltoActual={unidades.find(u => u.indicativo === 'Cobalto-1')?.estadoSac || 'CB-80'}
                />
              </div>

              <div className="h-[480px]">
                <SacMatrixPanel onTransmitirClave={handleTransmitirClave} />
              </div>
            </div>
          </div>
        )}

        {/* Vista 2: Matriz SAC 01-99 Completa */}
        {tabActiva === 'MATRIZ_SAC' && (
          <div className="h-[800px]">
            <SacMatrixPanel onTransmitirClave={handleTransmitirClave} />
          </div>
        )}

        {/* Vista 3: Radio PTT Transceiver */}
        {tabActiva === 'RADIO_PTT' && (
          <div className="max-w-3xl mx-auto w-full h-[650px]">
            <PttConsole
              canalActivo={canalPttActivo}
              onCambiarCanal={setCanalPttActivo}
              unidadVinculada="Cobalto-1"
              estadoCobaltoActual={unidades.find(u => u.indicativo === 'Cobalto-1')?.estadoSac || 'CB-80'}
            />
          </div>
        )}

        {/* Vista 4: Ciberdefensa y Firewall */}
        {tabActiva === 'CIBERDEFENSA' && (
          <div className="h-[750px]">
            <CyberDefensePanel
              ipsBloqueadas={ipsBloqueadas}
              setIpsBloqueadas={setIpsBloqueadas}
              onAlertaDrop={handleAlertaDrop}
            />
          </div>
        )}

        {/* Vista 5: Bot de Telegram */}
        {tabActiva === 'TELEGRAM_BOT' && (
          <div className="max-w-4xl mx-auto w-full h-[700px]">
            <TelegramConsole
              mensajes={mensajesTelegram}
              setMensajes={setMensajesTelegram}
              unidades={unidades}
              ipsBloqueadas={ipsBloqueadas}
              onDesbloquearIp={handleDesbloquearIp}
            />
          </div>
        )}

        {/* Vista 6: Motor Offline Móvil */}
        {tabActiva === 'TERMINAL_MOVIL' && (
          <div className="h-[750px]">
            <MobileTerminalSim onSyncRafaga={handleSyncRafaga} />
          </div>
        )}

        {/* Vista 7: Inspector de Scripts Backend */}
        {tabActiva === 'SCRIPTS_BACKEND' && (
          <div className="h-[750px]">
            <BackendCodeViewer />
          </div>
        )}
      </main>

      {/* Pie de página con sello institucional del Grupo Tiuna */}
      <footer className="px-6 py-4 bg-slate-950 border-t border-slate-900 text-xs text-slate-500 font-mono flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span>Estación Ónix-0 · Grupo de Rescate Tiuna</span>
          <span className="text-slate-700">·</span>
          <span>SAR & Emergencias Prehospitalarias</span>
        </div>
        <div>
          <span>Matriz SAC v2.4 (Minerales QZ·GR·AM·DM·CB·NX)</span>
        </div>
      </footer>
    </div>
  );
}
