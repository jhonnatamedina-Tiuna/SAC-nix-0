import React, { useState, useEffect, useRef } from 'react';
import { TelegramMessage, TacticalUnit, BlockedIp } from '../types/tactical';
import { Send, Terminal, Bot, Trash2, Shield, Bell, CheckCircle2, Clock } from 'lucide-react';

interface TelegramConsoleProps {
  mensajes: TelegramMessage[];
  setMensajes: React.Dispatch<React.SetStateAction<TelegramMessage[]>>;
  unidades: TacticalUnit[];
  ipsBloqueadas: BlockedIp[];
  onDesbloquearIp: (ip: string) => void;
}

export const TelegramConsole: React.FC<TelegramConsoleProps> = ({
  mensajes,
  setMensajes,
  unidades,
  ipsBloqueadas,
  onDesbloquearIp,
}) => {
  const [comandoInput, setComandoInput] = useState<string>('');
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  const ejecutarComando = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comandoInput.trim()) return;

    const textoComando = comandoInput.trim();
    setComandoInput('');

    // Agregar mensaje del usuario al log
    const userMsg: TelegramMessage = {
      id: String(Date.now()),
      remitente: 'USUARIO',
      texto: textoComando,
      timestamp: new Date().toLocaleTimeString(),
      tipo: 'COMANDO'
    };

    setMensajes(prev => [...prev, userMsg]);

    // Procesar comando del bot táctico
    setTimeout(() => {
      let respuestaBot = '';

      if (textoComando === '/status') {
        const lineas = unidades.map(u => `• \`${u.indicativo}\`: ${u.estadoSac} (${u.canalPttActual}) · Bat: ${u.bateria}%`).join('\n');
        respuestaBot = `🟢 *ESTADO OPERACIONAL ÓXIN-0*\n\n${lineas}\n\nEnlace: *OPERACIONAL (NX-90)*`;
      } else if (textoComando.startsWith('/unblock')) {
        const partes = textoComando.split(' ');
        if (partes.length > 1) {
          const ip = partes[1].trim();
          onDesbloquearIp(ip);
          respuestaBot = `✅ IP \`${ip}\` desbloqueada con éxito en PostgreSQL y levantada en iptables kernel.`;
        } else {
          respuestaBot = `⚠️ Uso correcto del comando:\n\`/unblock <IP>\``;
        }
      } else if (textoComando === '/reporte') {
        respuestaBot = (
          `📋 *INFORME DIARIO DE OPERACIONES - ÓXIN-0 (APScheduler 23:00)*\n` +
          `Fecha: \`${new Date().toISOString().split('T')[0]} 23:00\`\n\n` +
          `• Unidades en apresto: \`${unidades.length}\`\n` +
          `• Direcciones IP en aislamiento (DROP): \`${ipsBloqueadas.length}\`\n` +
          `• Estado de Enlace: \`OPERACIONAL (NX-90)\`\n` +
          `• Red Mallada: \`SINCRONIZADA (NX-91)\``
        );
      } else if (textoComando === '/help') {
        respuestaBot = (
          `🤖 *COMANDOS DISPONIBLES EN BOT TÁCTICO TIUNA:*\n\n` +
          `• \`/status\` - Muestra estado de unidades tácticas y canales PTT.\n` +
          `• \`/unblock <IP>\` - Levanta la regla iptables DROP y habilita acceso.\n` +
          `• \`/reporte\` - Genera el informe diario nocturno (APScheduler).\n` +
          `• \`/help\` - Muestra esta ayuda táctica.`
        );
      } else {
        respuestaBot = `Comando no reconocido. Escribe \`/help\` para ver la lista de comandos disponibles.`;
      }

      const botMsg: TelegramMessage = {
        id: String(Date.now() + 1),
        remitente: 'BOT_TIUNA',
        texto: respuestaBot,
        timestamp: new Date().toLocaleTimeString(),
        tipo: 'INFO'
      };

      setMensajes(prev => [...prev, botMsg]);
    }, 200);
  };

  const handleDispararReporteNocturno = () => {
    const reporteMsg: TelegramMessage = {
      id: String(Date.now()),
      remitente: 'BOT_TIUNA',
      texto: (
        `📋 *INFORME DIARIO DE OPERACIONES - ÓXIN-0 (SIMULACIÓN APScheduler)*\n` +
        `Fecha: \`${new Date().toISOString().split('T')[0]} 23:00:00 UTC\`\n\n` +
        `• Paquetes Sincronizados (24h): \`142\`\n` +
        `• Direcciones IP Bloqueadas en iptables (24h): \`${ipsBloqueadas.length}\`\n` +
        `• Unidades Activas: \`${unidades.map(u => u.indicativo).join(', ')}\`\n` +
        `• Estado del Enlace: \`OPERACIONAL (NX-90)\``
      ),
      timestamp: new Date().toLocaleTimeString(),
      tipo: 'REPORTE'
    };
    setMensajes(prev => [...prev, reporteMsg]);
  };

  return (
    <div className="bg-[#0f172a] rounded-xl border border-slate-800 flex flex-col h-full overflow-hidden shadow-2xl">
      {/* Encabezado */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-sky-400" />
          <h2 className="text-sm font-bold text-white tracking-wide uppercase">
            Bot Táctico Telegram (LISTEN / NOTIFY)
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDispararReporteNocturno}
            className="px-2.5 py-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Simular APScheduler (23:00)</span>
          </button>
          <button
            onClick={() => setMensajes([])}
            title="Limpiar consola"
            className="p-1.5 text-slate-500 hover:text-slate-300 rounded hover:bg-slate-800 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Feed de mensajes y alertas */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#090d16] font-mono text-xs">
        {mensajes.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center p-6">
            <Bot className="w-8 h-8 text-slate-600 mb-2" />
            <p>Canal de eventos y consola de comandos activa.</p>
            <p className="text-[11px] text-slate-600 mt-1">Escribe <code className="text-sky-400">/help</code> o <code className="text-sky-400">/status</code> abajo para interactuar.</p>
          </div>
        ) : (
          mensajes.map((m) => {
            const isUser = m.remitente === 'USUARIO';
            const isAlert = m.tipo === 'ALERTA';
            const isReport = m.tipo === 'REPORTE';

            return (
              <div
                key={m.id}
                className={`p-3 rounded-lg border leading-relaxed ${
                  isUser
                    ? 'bg-slate-800/80 border-slate-700 text-slate-200 ml-8'
                    : isAlert
                    ? 'bg-red-950/40 border-red-800/80 text-red-200'
                    : isReport
                    ? 'bg-amber-950/30 border-amber-800/60 text-amber-200'
                    : 'bg-slate-900 border-slate-800 text-slate-300 mr-4'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1 border-b border-white/5 pb-1">
                  <span className="font-bold flex items-center gap-1.5">
                    {isUser ? (
                      <span className="text-slate-400">Oficial de Guardia</span>
                    ) : isAlert ? (
                      <span className="text-red-400 flex items-center gap-1">
                        <Bell className="w-3 h-3" />
                        <span>ALERTA POSTGRESQL LISTEN</span>
                      </span>
                    ) : (
                      <span className="text-sky-400 flex items-center gap-1">
                        <Bot className="w-3 h-3" />
                        <span>Bot Táctico @TiunaRescueBot</span>
                      </span>
                    )}
                  </span>
                  <span>{m.timestamp}</span>
                </div>
                <div className="whitespace-pre-wrap">{m.texto}</div>
              </div>
            );
          })
        )}
        <div ref={logEndRef} />
      </div>

      {/* Input de comandos */}
      <form onSubmit={ejecutarComando} className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
        <input
          type="text"
          value={comandoInput}
          onChange={(e) => setComandoInput(e.target.value)}
          placeholder="Escribe un comando (/status, /unblock <IP>, /reporte, /help)..."
          className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
        />
        <button
          type="submit"
          className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Enviar</span>
        </button>
      </form>
    </div>
  );
};
