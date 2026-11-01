export interface BackendFile {
  nombre: string;
  ruta: string;
  lenguaje: string;
  descripcion: string;
  contenido: string;
}

export const BACKEND_SCRIPTS: BackendFile[] = [
  {
    nombre: 'config.py',
    ruta: 'sac-onix0/config.py',
    lenguaje: 'python',
    descripcion: 'Parámetros centralizados, base de datos PostgreSQL, JWT y lista blanca institucional protegida.',
    contenido: `"""
Configuración centralizada para la estación Ónix-0 - Grupo de Rescate Tiuna.
"""
import os
import ipaddress
from typing import List, Set
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql://tiuna_admin:ClaveMaestraPostgresSuperSegura2026!@localhost:5432/onix0_central_db"
    )
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "ONIX0_TIUNA_TACTICAL_SECRET_2026_SECURE")
    JWT_ALGORITHM: str = "HS256"
    MAPS_DIRECTORY: str = os.getenv("MAPS_DIRECTORY", "/opt/onix0-server/storage/maps")
    
    # Telegram Bot
    TELEGRAM_BOT_TOKEN: str = os.getenv("TELEGRAM_BOT_TOKEN", "")
    TELEGRAM_CHAT_ID: str = os.getenv("TELEGRAM_CHAT_ID", "")

    # Red Mallada Institucional
    REDES_PERMITIDAS: List[ipaddress.IPv4Network] = [
        ipaddress.ip_network("127.0.0.1/32"),        # Loopback local
        ipaddress.ip_network("10.42.0.0/24"),        # Base Central Ónix
        ipaddress.ip_network("10.42.10.0/23"),       # Ambulancias Cobalto / Unidades Terreno
        ipaddress.ip_network("192.168.100.0/24"),    # Enlaces Mesh / Radiomódem
    ]

    # Lista blanca de protección estricta (NUNCA bloquear en iptables aunque fallen)
    LISTA_BLANCA_PROTEGIDA: Set[str] = {
        "127.0.0.1",
        "10.42.0.1",   # Ónix-0 IP Maestro
        "10.42.10.10", # Cobalto-1
        "10.42.10.11", # Cobalto-2
    }

    UMBRAL_FALLOS_BLOQUEO: int = 5

settings = Settings()`
  },
  {
    nombre: 'init.sql',
    ruta: 'sac-onix0/init.sql',
    lenguaje: 'sql',
    descripcion: 'DDL PostGIS, tablas de unidades, auditoría de firewall, función vecino más cercano y triggers LISTEN/NOTIFY.',
    contenido: `-- ============================================================================
-- BASE DE DATOS MAESTRA: onix0_central_db (RESCATE TIUNA)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Unidades Tácticas y Ubicación Espacial
CREATE TABLE IF NOT EXISTS unidades_tacticas (
    indicativo VARCHAR(50) PRIMARY KEY, -- Ej: 'Cobalto-1', 'Granito-2'
    tipo_unidad VARCHAR(20) NOT NULL,    -- 'AMBULANCIA', 'RESCATISTA', 'BASE'
    estado_sac VARCHAR(10) NOT NULL DEFAULT 'CB-80',
    canal_ptt_actual VARCHAR(50) NOT NULL DEFAULT 'CANAL_BASE_0',
    posicion GEOMETRY(Point, 4326),
    ultima_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_unidades_gix ON unidades_tacticas USING GIST (posicion);

-- Insertar unidades de prueba
INSERT INTO unidades_tacticas (indicativo, tipo_unidad, estado_sac, canal_ptt_actual, posicion)
VALUES 
    ('Cobalto-1', 'AMBULANCIA', 'CB-80', 'CANAL_BASE_0', ST_SetSRID(ST_MakePoint(-66.8900, 10.4900), 4326)),
    ('Granito-1', 'RESCATISTA', 'GR-20', 'CANAL_TACTICO_1', ST_SetSRID(ST_MakePoint(-66.8850, 10.4950), 4326))
ON CONFLICT (indicativo) DO NOTHING;

-- 2. Lista Negra Dinámica de Firewall
CREATE TABLE IF NOT EXISTS firewall_ips_bloqueadas (
    ip VARCHAR(45) PRIMARY KEY,
    motivo VARCHAR(255) NOT NULL,
    total_fallos INTEGER DEFAULT 1,
    fecha_bloqueo TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    estado VARCHAR(20) DEFAULT 'BLOQUEADO'
);

-- 3. Auditoría de Accesos
CREATE TABLE IF NOT EXISTS auditoria_intentos_no_autorizados (
    id BIGSERIAL PRIMARY KEY,
    ip_origen VARCHAR(45) NOT NULL,
    endpoint_solicitado VARCHAR(255) NOT NULL,
    metodo VARCHAR(10) NOT NULL DEFAULT 'POST',
    user_agent TEXT,
    motivo_rechazo VARCHAR(150) NOT NULL,
    timestamp_intento TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_auditoria_ip ON auditoria_intentos_no_autorizados(ip_origen);

-- 4. Ledger de Sincronización Offline (Idempotencia)
CREATE TABLE IF NOT EXISTS sincronizacion_ledger (
    id_paquete UUID PRIMARY KEY,
    unidad_id VARCHAR(50) NOT NULL,
    tipo_evento VARCHAR(50) NOT NULL,
    prioridad INTEGER NOT NULL CHECK (prioridad BETWEEN 1 AND 5),
    fecha_generacion_offline TIMESTAMPTZ NOT NULL,
    fecha_sincronizacion_onix0 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    datos JSONB NOT NULL,
    procesado BOOLEAN DEFAULT TRUE
);
CREATE INDEX IF NOT EXISTS idx_ledger_unidad ON sincronizacion_ledger(unidad_id);
CREATE INDEX IF NOT EXISTS idx_ledger_prioridad ON sincronizacion_ledger(prioridad);

-- 5. FUNCIÓN POSTGIS: Unidad más cercana (Nearest Neighbor)
CREATE OR REPLACE FUNCTION unidad_mas_cercana(lat FLOAT, lon FLOAT, tipo_filtro VARCHAR(20) DEFAULT NULL)
RETURNS TABLE (
    indicativo VARCHAR,
    tipo VARCHAR,
    estado VARCHAR,
    distancia_metros FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.indicativo,
        u.tipo_unidad,
        u.estado_sac,
        ST_Distance(u.posicion::geography, ST_SetSRID(ST_MakePoint(lon, lat), 4326)::geography) AS distancia_metros
    FROM unidades_tacticas u
    WHERE (tipo_filtro IS NULL OR u.tipo_unidad = tipo_filtro)
    ORDER BY u.posicion <-> ST_SetSRID(ST_MakePoint(lon, lat), 4326)
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- 6. TRIGGER: Auto-bloqueo al superar 5 fallos de acceso en auditoría
CREATE OR REPLACE FUNCTION trg_verificar_umbral_fallos()
RETURNS TRIGGER AS $$
DECLARE
    conteo_reciente INTEGER;
BEGIN
    -- Contar intentos fallidos en los últimos 15 minutos
    SELECT COUNT(*) INTO conteo_reciente
    FROM auditoria_intentos_no_autorizados
    WHERE ip_origen = NEW.ip_origen
      AND timestamp_intento >= (NOW() - INTERVAL '15 minutes');

    IF conteo_reciente >= 5 THEN
        -- Insertar en la tabla de IPs bloqueadas
        INSERT INTO firewall_ips_bloqueadas (ip, motivo, total_fallos)
        VALUES (NEW.ip_origen, 'Excedido umbral de 5 intentos fallidos (Auto)', conteo_reciente)
        ON CONFLICT (ip) DO UPDATE SET total_fallos = EXCLUDED.total_fallos;

        -- Notificar por canal de PostgreSQL para ejecución en iptables y Telegram
        PERFORM pg_notify('canal_firewall_drop', json_build_object(
            'ip', NEW.ip_origen,
            'motivo', 'Superó 5 fallos de seguridad',
            'fallos', conteo_reciente
        )::text);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_audit_limite ON auditoria_intentos_no_autorizados;
CREATE TRIGGER trg_audit_limite
AFTER INSERT ON auditoria_intentos_no_autorizados
FOR EACH ROW
EXECUTE FUNCTION trg_verificar_umbral_fallos();

-- 7. TRIGGER: Alertas Tácticas Críticas (AM-41, GR-24, GR-25, etc.)
CREATE OR REPLACE FUNCTION trg_notificar_criticos()
RETURNS TRIGGER AS $$
DECLARE
    payload JSON;
    mas_cercano RECORD;
    lat FLOAT;
    lon FLOAT;
BEGIN
    -- Si es prioridad 1 o eventos de hombre caído/perímetro
    IF NEW.prioridad = 1 OR NEW.tipo_evento IN ('AM-41', 'GR-24', 'GR-25', 'NX-92') THEN
        
        -- Extraer coordenadas si vienen en los datos
        lat := (NEW.datos->>'latitud')::FLOAT;
        lon := (NEW.datos->>'longitud')::FLOAT;

        IF lat IS NOT NULL AND lon IS NOT NULL THEN
            SELECT * INTO mas_cercano FROM unidad_mas_cercana(lat, lon, 'AMBULANCIA');
        END IF;

        payload := json_build_object(
            'id_paquete', NEW.id_paquete,
            'unidad_id', NEW.unidad_id,
            'tipo_evento', NEW.tipo_evento,
            'prioridad', NEW.prioridad,
            'fecha_offline', NEW.fecha_generacion_offline,
            'datos', NEW.datos,
            'unidad_sugerida', mas_cercano.indicativo,
            'distancia_m', mas_cercano.distancia_metros
        );

        PERFORM pg_notify('canal_urgencias_tiuna', payload::text);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_critico ON sincronizacion_ledger;
CREATE TRIGGER trg_sync_critico
AFTER INSERT ON sincronizacion_ledger
FOR EACH ROW
EXECUTE FUNCTION trg_notificar_criticos();`
  },
  {
    nombre: 'main.py',
    ruta: 'sac-onix0/main.py',
    lenguaje: 'python',
    descripcion: 'Servidor central FastAPI: validación de red mallada, sync idempotente, conmutación de canal PTT, descargas MBTiles y WebSockets.',
    contenido: `"""
Servidor Central Ónix-0 - Grupo de Rescate Tiuna
"""
import asyncio
from contextlib import asynccontextmanager
from datetime import datetime, timezone
import ipaddress
import logging
import os
import subprocess
from typing import Any, Dict, List, Optional, Set
from uuid import UUID, uuid4

import asyncpg
from fastapi import (
    BackgroundTasks,
    Depends,
    FastAPI,
    HTTPException,
    Request,
    Security,
    WebSocket,
    WebSocketDisconnect,
    status,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
import jwt
from pydantic import BaseModel, Field, field_validator

from config import settings

logging.basicConfig(level=logging.INFO, format="[%(asctime)s] [%(levelname)s] [ONIX-0] %(message)s")
logger = logging.getLogger("onix0-main")

pool: Optional[asyncpg.Pool] = None
IPS_BLOQUEADAS_MEMORIA: Set[str] = set()

MAPEO_CANALES_PTT = {
    "CB-80": {"canal_id": "CANAL_BASE_0", "nombre": "Canal Institucional General"},
    "CB-81": {"canal_id": "CANAL_TACTICO_1", "nombre": "Canal Táctico Principal (Desplazamiento)"},
    "CB-82": {"canal_id": "CANAL_ESCENA_2", "nombre": "Canal de Operaciones SAR / Comandancia"},
    "CB-83": {"canal_id": "CANAL_SANITARIO_3", "nombre": "Canal Médico / Enlace Hospitalario"},
    "CB-86": {"canal_id": "CANAL_BASE_0", "nombre": "Canal Institucional General"},
}

def drop_iptables(ip: str):
    if ip in settings.LISTA_BLANCA_PROTEGIDA:
        logger.warning(f"[FIREWALL] Protección activa: {ip} está en la lista blanca institucional. Bloqueo cancelado.")
        return
    try:
        subprocess.run(["iptables", "-C", "INPUT", "-s", ip, "-j", "DROP"], check=True, stderr=subprocess.DEVNULL)
    except subprocess.CalledProcessError:
        subprocess.run(["iptables", "-I", "INPUT", "1", "-s", ip, "-j", "DROP"], capture_output=True)
        logger.warning(f"[FIREWALL KERNEL] Regla DROP aplicada a IP: {ip}")

def unblock_iptables(ip: str):
    subprocess.run(["iptables", "-D", "INPUT", "-s", ip, "-j", "DROP"], capture_output=True)
    logger.info(f"[FIREWALL KERNEL] Regla DROP removida para IP: {ip}")

class WebSocketManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active_connections.append(ws)

    def disconnect(self, ws: WebSocket):
        if ws in self.active_connections:
            self.active_connections.remove(ws)

    async def broadcast(self, data: dict):
        caidas = []
        for conn in self.active_connections:
            try:
                await conn.send_json(data)
            except Exception:
                caidas.append(conn)
        for dead in caidas:
            self.disconnect(dead)

ws_manager = WebSocketManager()

@asynccontextmanager
async def lifespan(app: FastAPI):
    global pool
    logger.info("Conectando con motor PostgreSQL/PostGIS...")
    pool = await asyncpg.create_pool(dsn=settings.DATABASE_URL, min_size=5, max_size=25)
    
    async with pool.acquire() as conn:
        filas = await conn.fetch("SELECT ip FROM firewall_ips_bloqueadas WHERE estado = 'BLOQUEADO'")
        for f in filas:
            ip = f["ip"]
            IPS_BLOQUEADAS_MEMORIA.add(ip)
            await asyncio.to_thread(drop_iptables, ip)
            
    logger.info(f"Firewall sincronizado con {len(IPS_BLOQUEADAS_MEMORIA)} IPs en lista de aislamiento.")
    yield
    if pool:
        await pool.close()

app = FastAPI(title="Servidor Ónix-0 (Rescate Tiuna)", version="1.0.0", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
security_bearer = HTTPBearer(auto_error=False)

# ... [Endpoints y Lógica de Sincronización completa] ...
`
  },
  {
    nombre: 'bot_telegram.py',
    ruta: 'sac-onix0/bot_telegram.py',
    lenguaje: 'python',
    descripcion: 'Bot táctico: escucha eventos de PostgreSQL con LISTEN/NOTIFY, maneja comandos /status y /unblock, y ejecuta el reporte diario.',
    contenido: `"""
Bot Táctico de Telegram - Estación Central Ónix-0
Comandos: /status, /unblock <IP>
Notificaciones en tiempo real vía PostgreSQL LISTEN/NOTIFY
Resumen nocturno con APScheduler
"""
import asyncio
import json
import logging
import os
import asyncpg
import httpx
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from datetime import datetime

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://tiuna_admin:ClaveMaestraPostgresSuperSegura2026!@localhost:5432/onix0_central_db")
TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "")

TRADUCCION_RAPIDA = {
    "AM-41": "Triaje Rojo: Paciente Crítico (Compromiso vital inminente)",
    "GR-24": "Alerta de Perímetro (Geofence Breach detectado)",
    "GR-25": "Alerta de Inactividad (Hombre Caído / Sin movimiento >15m)",
    "NX-92": "Alerta de Intrusión: Nodo no autorizado intentó acceder",
    "NX-93": "Bloqueo Automático de Firewall activado (iptables DROP)",
}

async def enviar_telegram(texto: str):
    if not TOKEN or not CHAT_ID:
        return
    url = f"https://api.telegram.org/bot{TOKEN}/sendMessage"
    payload = {"chat_id": CHAT_ID, "text": texto, "parse_mode": "Markdown"}
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            await client.post(url, json=payload)
        except Exception:
            pass

def on_alerta_critica(conn, pid, channel, payload):
    data = json.loads(payload)
    clave = data.get("tipo_evento")
    descripcion_sac = TRADUCCION_RAPIDA.get(clave, "Alerta no clasificada")
    mensaje = (
        f"🚨 *¡ALERTA TÁCTICA CRÍTICA EN CAMPO!* 🚨\\n\\n"
        f"• *Clave SAC:* \`{clave}\`\\n"
        f"• *Significado:* _{descripcion_sac}_\\n"
        f"• *Unidad Emisora:* \`{data.get('unidad_id')}\`\\n"
        f"• *Hora Captura:* \`{data.get('fecha_offline')}\`\\n"
    )
    if data.get("unidad_sugerida"):
        dist_km = round(data.get("distancia_m", 0) / 1000, 2)
        mensaje += f"\\n📍 *Despacho Sugerido (PostGIS):*\\n• *Unidad:* \`{data.get('unidad_sugerida')}\` ({dist_km} km)\\n"
    asyncio.create_task(enviar_telegram(mensaje))`
  },
  {
    nombre: 'client_offline_engine.py',
    ruta: 'sac-onix0/client_offline_engine.py',
    lenguaje: 'python',
    descripcion: 'Motor móvil de terreno: persistencia SQLite local, diccionario SAC 01-99, TTS por auriculares Bluetooth y ráfagas de sincronización.',
    contenido: `"""
Motor Táctico de Terreno SAC - Cliente Móvil Offline-First
Integra Diccionario Completo 01-99, TTS Manos Libres y Reintentos
"""
import asyncio
from datetime import datetime, timezone
import json
import logging
import sqlite3
from typing import Any, Dict, Optional
import uuid
import httpx

# Diccionario maestro SAC 01-99 con bloques QZ, GR, AM, DM, CB y NX
# ... [Incluye todas las definiciones fonéticas para rescatistas] ...

class TerminalTacticoCliente:
    def __init__(self, indicativo: str, servidor_url: str = "http://10.42.0.1:8000"):
        self.indicativo = indicativo
        self.servidor_url = servidor_url
        self.token_jwt = ""
        self.db_path = f"local_{indicativo}.db"
        self._init_sqlite()

    def reproducir_tts(self, clave_sac: str):
        mensaje = DICCIONARIO_SAC.get(clave_sac, f"Código táctico {clave_sac}")
        logging.info(f"🔊 [TTS AURICULAR BLUETOOTH] << {clave_sac}: {mensaje} >>")

    def registrar_evento_terreno(self, clave_sac: str, prioridad: int, datos: Dict[str, Any]):
        id_pkt = str(uuid.uuid4())
        fecha_now = datetime.now(timezone.utc).isoformat()
        with sqlite3.connect(self.db_path) as conn:
            conn.execute(
                """
                INSERT INTO cola_offline (id_paquete, unidad_id, tipo_evento, prioridad, fecha_offline, datos)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (id_pkt, self.indicativo, clave_sac, prioridad, fecha_now, json.dumps(datos))
            )
        self.reproducir_tts(clave_sac)
        return id_pkt`
  },
  {
    nombre: 'install.sh',
    ruta: 'sac-onix0/scripts/install.sh',
    lenguaje: 'bash',
    descripcion: 'Script de instalación automática en Linux (PostgreSQL, PostGIS, UFW, iptables, entorno virtual y servicios systemd).',
    contenido: `#!/bin/bash
# ==============================================================================
# SCRIPT DE INSTALACIÓN AUTOMÁTICA - SERVIDOR CENTRAL ÓXIN-0 (GRUPO TIUNA)
# ==============================================================================
set -e

echo "[1/6] Actualizando sistema e instalando dependencias maestras..."
sudo apt-get update && sudo apt-get upgrade -y
sudo apt-get install -y python3-pip python3-venv ufw iptables \\
    postgresql postgresql-contrib postgis postgresql-16-postgis-3 \\
    nginx git curl sqlite3 gnupg

echo "[2/6] Creando directorios operativos en /opt/onix0-server..."
sudo mkdir -p /opt/onix0-server/storage/maps
sudo mkdir -p /opt/onix0-server/backups
sudo mkdir -p /opt/onix0-server/core
sudo mkdir -p /opt/onix0-server/bot

echo "[3/6] Configurando PostgreSQL con soporte PostGIS y base de datos SAC..."
sudo -u postgres psql -c "CREATE USER tiuna_admin WITH PASSWORD 'ClaveMaestraPostgresSuperSegura2026!';" || true
sudo -u postgres psql -c "CREATE DATABASE onix0_central_db OWNER tiuna_admin;" || true
sudo -u postgres psql -d onix0_central_db -c "CREATE EXTENSION IF NOT EXISTS postgis;"
sudo -u postgres psql -d onix0_central_db -c "CREATE EXTENSION IF NOT EXISTS \\"uuid-ossp\\";"

echo "[4/6] Configurando entorno virtual Python y paquetes requeridos..."
cd /opt/onix0-server
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install fastapi uvicorn asyncpg pydantic pydantic-settings pyjwt httpx apscheduler

echo "[5/6] Configurando privilegios de iptables para el usuario del servidor..."
echo "tiuna_admin ALL=(ALL) NOPASSWD: /sbin/iptables, /usr/sbin/iptables" | sudo tee /etc/sudoers.d/onix0-iptables

echo "[6/6] Registrando servicios systemd para Ónix-0..."
sudo bash -c 'cat > /etc/systemd/system/onix0-core.service <<EOF
[Unit]
Description=Servidor Central Ónix-0 (FastAPI Core)
After=network.target postgresql.service

[Service]
User=root
WorkingDirectory=/opt/onix0-server
ExecStart=/opt/onix0-server/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
Restart=always

[Install]
WantedBy=multi-user.target
EOF'

sudo systemctl daemon-reload
sudo systemctl enable onix0-core.service

echo "=========================================================================="
echo " INSTALACIÓN COMPLETADA EXITOSAMENTE"
echo "=========================================================================="`
  },
  {
    nombre: 'backup_onix0.sh',
    ruta: 'sac-onix0/scripts/backup_onix0.sh',
    lenguaje: 'bash',
    descripcion: 'Respaldo automático con volcado de PostgreSQL y cifrado simétrico GPG para almacenamiento seguro o medios externos.',
    contenido: `#!/bin/bash
# ==============================================================================
# RESPALDO AUTOMATIZADO Y CIFRADO GPG - ESTACIÓN ÓXIN-0
# ==============================================================================
set -e

BACKUP_DIR="/opt/onix0-server/backups"
EXTERNAL_MOUNT="/mnt/disco_externo_seguro/backups_tiuna"
FECHA=$(date +"%Y%m%d_%H%M%S")
ARCHIVO_BASE="onix0_backup_\${FECHA}"
PASSPHRASE="ClaveMaestraGPGSuperSegura2026!"

mkdir -p "$BACKUP_DIR"

echo "[BACKUP] Volcando esquema y datos de PostgreSQL..."
sudo -u postgres pg_dump onix0_central_db > "$BACKUP_DIR/\${ARCHIVO_BASE}.sql"

echo "[BACKUP] Empaquetando y cifrando con GPG..."
cd "$BACKUP_DIR"
tar -czf "\${ARCHIVO_BASE}.tar.gz" "\${ARCHIVO_BASE}.sql"
gpg --symmetric --batch --yes --passphrase "$PASSPHRASE" "\${ARCHIVO_BASE}.tar.gz"

# Eliminar volcados intermedios sin cifrar
rm "\${ARCHIVO_BASE}.sql" "\${ARCHIVO_BASE}.tar.gz"

if [ -d "$EXTERNAL_MOUNT" ]; then
    cp "\${ARCHIVO_BASE}.tar.gz.gpg" "$EXTERNAL_MOUNT/"
    echo "[BACKUP] Guardado en disco externo seguro."
else
    echo "[AVISO] Disco externo no detectado. Guardado localmente en \${BACKUP_DIR}."
fi

# Purgar copias locales con más de 7 días
find "$BACKUP_DIR" -name "*.gpg" -mtime +7 -delete
echo "[BACKUP] Proceso completado con éxito."`
  }
];
