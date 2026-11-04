import React, { useState, useEffect } from 'react';
import { BlockedIp, AuditAttempt } from '../types/tactical';
import { REDES_PERMITIDAS_CONFIG, LISTA_BLANCA_PROTEGIDA, IPS_BLOQUEADAS_INICIALES, AUDITORIA_INICIAL } from '../data/networkRules';
import { tacticalAudio } from '../utils/audio';
import { persistirAuditoriaFirestore, suscribirAuditoriaEnTiempoReal } from '../services/firestoreService';
import { Shield, ShieldAlert, ShieldCheck, Lock, Unlock, AlertTriangle, Terminal, Play, RotateCcw, Activity, Cloud } from 'lucide-react';

interface CyberDefensePanelProps {
  ipsBloqueadas: BlockedIp[];
  setIpsBloqueadas: React.Dispatch<React.SetStateAction<BlockedIp[]>>;
  onAlertaDrop: (ip: string, motivo: string, fallos: number) => void;
}

export const CyberDefensePanel: React.FC<CyberDefensePanelProps> = ({
  ipsBloqueadas,
  setIpsBloqueadas,
  onAlertaDrop,
}) => {
  const [auditoria, setAuditoria] = useState<AuditAttempt[]>(AUDITORIA_INICIAL);
  const [ipPrueba, setIpPrueba] = useState<string>('198.51.100.88');
  const [conteoPrueba, setConteoPrueba] = useState<number>(3);
  const [motivoPrueba, setMotivoPrueba] = useState<string>('Token JWT inválido (Firma no fidedigna)');
  const [logMensaje, setLogMensaje] = useState<string | null>(null);
  const [cloudConectado, setCloudConectado] = useState<boolean>(true);

  // Suscripción en tiempo real a Firebase Firestore
  useEffect(() => {
    const desuscribir = suscribirAuditoriaEnTiempoReal((intentosCloud) => {
      setAuditoria(prev => {
        // Combinar manteniendo únicos por id o timestamp
        const ids = new Set(intentosCloud.map(i => i.id));
        const locales = prev.filter(p => !ids.has(p.id));
        return [...intentosCloud, ...locales].slice(0, 30);
      });
      setCloudConectado(true);
    });

    return () => desuscribir();
  }, []);

  // Desbloqueo de IP (iptables -D)
  const handleDesbloquear = (ip: string) => {
    setIpsBloqueadas(prev => prev.filter(item => item.ip !== ip));
    setLogMensaje(`[FIREWALL] Regla DROP removida para IP: ${ip} (iptables -D INPUT -s ${ip} -j DROP)`);
    tacticalAudio.playRogerBeep();
  };

  // Simular intento fallido
  const handleSimularIntento = () => {
    // Si la IP está en la lista blanca estricta
    if (LISTA_BLANCA_PROTEGIDA.includes(ipPrueba)) {
      setLogMensaje(`[AVISO] La IP ${ipPrueba} pertenece a la lista blanca protegida institucional. Nunca será bloqueada.`);
      return;
    }

    const nuevoConteo = conteoPrueba + 1;
    setConteoPrueba(nuevoConteo);

    // Agregar registro de auditoría local y en Firestore
    const nuevoIntento: AuditAttempt = {
      id: Date.now(),
      ipOrigen: ipPrueba,
      endpoint: '/api/v1/sync',
      metodo: 'POST',
      motivo: motivoPrueba,
      userAgent: 'Mozilla/5.0 (Táctico no registrado)',
      timestamp: new Date().toISOString()
    };
    setAuditoria(prev => [nuevoIntento, ...prev.slice(0, 19)]);

    // Persistencia asíncrona en la nube (Firestore)
    persistirAuditoriaFirestore(nuevoIntento).catch(() => {});

    if (nuevoConteo >= 5) {
      // Superó umbral de 5: TRIGGER trg_verificar_umbral_fallos activa bloqueo en iptables
      tacticalAudio.playCriticalAlertChime();
      const yaBloqueada = ipsBloqueadas.some(b => b.ip === ipPrueba);
      if (!yaBloqueada) {
        const nuevoBloqueo: BlockedIp = {
          ip: ipPrueba,
          motivo: 'Excedido umbral de 5 intentos fallidos (Auto: Kernel iptables)',
          totalFallos: nuevoConteo,
          fechaBloqueo: new Date().toISOString(),
          estado: 'BLOQUEADO',
          segmento: 'WAN Externa no Autorizada'
        };
        setIpsBloqueadas(prev => [nuevoBloqueo, ...prev]);
        onAlertaDrop(ipPrueba, 'Superó 5 fallos de seguridad en 15 minutos', nuevoConteo);
        setLogMensaje(`🚨 [FIREWALL KERNEL] Regla DROP aplicada automáticamente a IP: ${ipPrueba} tras 5 intentos fallidos.`);
      }
    } else {
      setLogMensaje(`[AUDITORÍA CLOUD] Intento fallido registrado para ${ipPrueba} y guardado en Firestore. Total en ventana: ${nuevoConteo}/5.`);
    }
  };

  return (
    <div className="bg-[#0f172a] rounded-xl border border-slate-800 flex flex-col h-full overflow-hidden shadow-2xl">
      {/* Encabezado */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm font-bold text-white tracking-wide uppercase">
            Ciberdefensa, Red Mallada y Firewall Ónix-0
          </h2>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 font-bold rounded border border-blue-500/30 flex items-center gap-1.5">
            <Cloud className="w-3.5 h-3.5 text-blue-400" />
            <span>Firestore Sync (/auditoria_seguridad)</span>
          </span>
          <span className="text-slate-400">·</span>
          <span className="px-2 py-0.5 bg-red-500/20 text-red-300 font-bold rounded border border-red-500/30">
            Umbral: 5 Fallos / 15 min
          </span>
        </div>
      </div>

      <div className="p-4 flex-1 overflow-y-auto space-y-4">
        {/* Notificación de estado de firewall */}
        {logMensaje && (
          <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-amber-300 flex items-center justify-between">
            <span>{logMensaje}</span>
            <button onClick={() => setLogMensaje(null)} className="text-slate-500 hover:text-slate-300 ml-2">×</button>
          </div>
        )}

        {/* Segmentos de Red Permitidos y Lista Blanca Protegida */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-950 rounded-lg p-3 border border-slate-800">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Redes Malladas Autorizadas (CIDR)</span>
            </div>
            <div className="space-y-1.5">
              {REDES_PERMITIDAS_CONFIG.map(r => (
                <div key={r.cidr} className="flex items-center justify-between text-xs font-mono p-1.5 rounded bg-slate-900/60 border border-slate-850">
                  <span className="font-bold text-emerald-400">{r.cidr}</span>
                  <span className="text-slate-400 text-[11px]">{r.nombre}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-950 rounded-lg p-3 border border-slate-800">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-blue-400" />
              <span>Lista Blanca Protegida (Inmunidad Estricta)</span>
            </div>
            <p className="text-[11px] text-slate-400 mb-2 leading-relaxed">
              Direcciones IP institucionales protegidas contra aislamiento automático en iptables, incluso si superan 5 fallos.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {LISTA_BLANCA_PROTEGIDA.map(ip => (
                <span key={ip} className="px-2 py-1 bg-blue-500/10 text-blue-300 border border-blue-500/30 rounded text-xs font-mono">
                  {ip}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Simulador de Ataques / Intentos Fallidos para verificar Auto-bloqueo */}
        <div className="bg-slate-900/80 rounded-lg p-4 border border-slate-800">
          <div className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-amber-400" />
            <span>Simulador de Detección de Intrusión (Trigger trg_audit_limite)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1 font-mono">IP de Origen a Probar:</label>
              <input
                type="text"
                value={ipPrueba}
                onChange={(e) => setIpPrueba(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1 font-mono">Intentos Registrados ({conteoPrueba}/5):</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800">
                  <div
                    className={`h-full transition-all ${
                      conteoPrueba >= 5 ? 'bg-red-500' : conteoPrueba >= 3 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, (conteoPrueba / 5) * 100)}%` }}
                  />
                </div>
                <span className="text-xs font-mono font-bold text-slate-300">{conteoPrueba}/5</span>
              </div>
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={handleSimularIntento}
                className="flex-1 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Inyectar Intento Fallido</span>
              </button>
              <button
                onClick={() => setConteoPrueba(0)}
                title="Reiniciar contador"
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Tabla de IPs Bloqueadas en Kernel (iptables DROP) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-red-400" />
              <span>Direcciones IP Aisladas en Kernel (iptables DROP)</span>
            </h3>
            <span className="text-xs font-mono text-slate-500">{ipsBloqueadas.length} bloqueos activos</span>
          </div>

          {ipsBloqueadas.length === 0 ? (
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-center text-xs text-slate-500">
              No hay direcciones IP en cuarentena actualmente.
            </div>
          ) : (
            <div className="bg-slate-950 rounded-lg border border-slate-800 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Dirección IP</th>
                    <th className="py-2.5 px-3">Total Fallos</th>
                    <th className="py-2.5 px-3">Motivo de Bloqueo</th>
                    <th className="py-2.5 px-3">Fecha y Hora</th>
                    <th className="py-2.5 px-3 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 font-mono text-slate-300">
                  {ipsBloqueadas.map((b) => (
                    <tr key={b.ip} className="hover:bg-slate-900/50">
                      <td className="py-2 px-3 font-bold text-red-400 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                        <span>{b.ip}</span>
                      </td>
                      <td className="py-2 px-3 font-bold text-amber-300">{b.totalFallos}</td>
                      <td className="py-2 px-3 text-slate-300">{b.motivo}</td>
                      <td className="py-2 px-3 text-slate-400 text-[11px]">
                        {new Date(b.fechaBloqueo).toLocaleTimeString()}
                      </td>
                      <td className="py-2 px-3 text-right">
                        <button
                          onClick={() => handleDesbloquear(b.ip)}
                          className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded text-[11px] font-sans font-medium hover:bg-emerald-500/30 transition-colors inline-flex items-center gap-1"
                        >
                          <Unlock className="w-3 h-3" />
                          <span>Desbloquear (/unblock)</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Registro de Auditoría de Intentos Rechazados */}
        <div>
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span>Auditoría de Accesos Denegados (Tabla auditoria_intentos_no_autorizados)</span>
          </h3>
          <div className="bg-slate-950 rounded-lg border border-slate-800 max-h-48 overflow-y-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 text-[10px] sticky top-0">
                <tr>
                  <th className="py-1.5 px-3">Hora</th>
                  <th className="py-1.5 px-3">IP Origen</th>
                  <th className="py-1.5 px-3">Endpoint</th>
                  <th className="py-1.5 px-3">Motivo de Rechazo</th>
                  <th className="py-1.5 px-3">User-Agent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-slate-400 text-[11px]">
                {auditoria.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-900/30">
                    <td className="py-1.5 px-3 text-slate-500">{new Date(a.timestamp).toLocaleTimeString()}</td>
                    <td className="py-1.5 px-3 text-amber-300">{a.ipOrigen}</td>
                    <td className="py-1.5 px-3 text-slate-300">{a.metodo} {a.endpoint}</td>
                    <td className="py-1.5 px-3 text-red-400">{a.motivo}</td>
                    <td className="py-1.5 px-3 text-slate-500 truncate max-w-xs">{a.userAgent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
