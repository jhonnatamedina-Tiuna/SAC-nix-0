#!/usr/bin/env bash
# ==============================================================================
# SISTEMA ÓXIN-0 - GRUPO DE RESCATE TIUNA
# SCRIPT DE DESPLIEGUE Y BLINDAJE PARA SERVIDOR LINUX (Ubuntu 22.04 / Debian 12)
# ==============================================================================
set -euo pipefail

INSTALL_DIR="/opt/onix0-server"
VENV_DIR="${INSTALL_DIR}/venv"
SERVICE_NAME="onix0-backend.service"
DB_NAME="onix0_central_db"
DB_USER="tiuna_admin"

log() {
    echo -e "\033[1;32m[TIUNA-LINUX-DEPLOY]\033[0m $1"
}

warn() {
    echo -e "\033[1;33m[TIUNA-ALERTA]\033[0m $1"
}

error() {
    echo -e "\033[1;31m[TIUNA-ERROR]\033[0m $1" >&2
}

install_system_deps() {
    log "Instalando paquetes base del sistema y extensiones de seguridad..."
    apt-get update -qq
    apt-get install -y -qq \
        python3-venv python3-dev build-essential libpq-dev \
        postgresql postgresql-contrib postgis postgresql-*-postgis-* \
        iptables-persistent netfilter-persistent net-tools \
        sqlite3 libsqlcipher-dev gnupg2 curl ufw
}

setup_python_env() {
    log "Configurando entorno virtual Python 3 en ${VENV_DIR}..."
    mkdir -p "${INSTALL_DIR}"
    mkdir -p "${INSTALL_DIR}/storage/maps"
    mkdir -p "${INSTALL_DIR}/storage/backups"
    
    if [ ! -d "${VENV_DIR}" ]; then
        python3 -m venv "${VENV_DIR}"
    fi

    "${VENV_DIR}/bin/pip" install --upgrade pip setuptools wheel
    
    # Dependencias backend con soporte PostgreSQL y SQLCipher
    "${VENV_DIR}/bin/pip" install \
        "fastapi==0.110.0" \
        "uvicorn[standard]==0.29.0" \
        "psycopg2-binary==2.9.9" \
        "asyncpg==0.29.0" \
        "pydantic-settings==2.2.1" \
        "pyjwt==2.8.0" \
        "python-telegram-bot==21.0.1" \
        "apscheduler==3.10.4"
}

setup_postgresql_postgis() {
    log "Configurando base de datos PostgreSQL y PostGIS..."
    sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='${DB_USER}'" | grep -q 1 || \
        sudo -u postgres psql -c "CREATE USER ${DB_USER} WITH PASSWORD 'ClaveMaestraPostgresSuperSegura2026!';"
    
    sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" | grep -q 1 || \
        sudo -u postgres psql -c "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};"

    # Habilitar PostGIS y funciones espaciales
    sudo -u postgres psql -d "${DB_NAME}" -c "CREATE EXTENSION IF NOT EXISTS postgis;"
    sudo -u postgres psql -d "${DB_NAME}" -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"

    if [ -f "init.sql" ]; then
        log "Aplicando esquema relacional y triggers LISTEN/NOTIFY..."
        PGPASSWORD="ClaveMaestraPostgresSuperSegura2026!" psql -h localhost -U "${DB_USER}" -d "${DB_NAME}" -f init.sql
    fi
}

configure_iptables_firewall() {
    log "Configurando cadena perimetral TIUNA-FIREWALL y listas blancas..."
    
    # Crear cadena si no existe
    iptables -N TIUNA-FIREWALL 2>/dev/null || true

    # Vincular al inicio de INPUT
    iptables -C INPUT -j TIUNA-FIREWALL 2>/dev/null || iptables -I INPUT 1 -j TIUNA-FIREWALL

    # Limpiar reglas previas en la subcadena
    iptables -F TIUNA-FIREWALL

    # 1. Reglas de Lista Blanca Protegida (NUNCA bloquear)
    iptables -A TIUNA-FIREWALL -s 127.0.0.1/32 -j ACCEPT -m comment --comment "TIUNA-LOOPBACK-SAFE"
    iptables -A TIUNA-FIREWALL -s 10.42.0.0/24 -j ACCEPT -m comment --comment "TIUNA-BASE-CENTRAL"
    iptables -A TIUNA-FIREWALL -s 10.42.10.0/23 -j ACCEPT -m comment --comment "TIUNA-AMBULANCIAS-COBALTO"
    iptables -A TIUNA-FIREWALL -s 192.168.100.0/24 -j ACCEPT -m comment --comment "TIUNA-MESH-RADIO"

    # 2. Retorno para tráfico normal
    iptables -A TIUNA-FIREWALL -j RETURN

    # Guardar estado persistente
    netfilter-persistent save || true
    log "[✓] Cadena TIUNA-FIREWALL configurada y lista."
}

setup_systemd_service() {
    log "Instalando servicio systemd ${SERVICE_NAME}..."
    cat <<EOF > /etc/systemd/system/${SERVICE_NAME}
[Unit]
Description=Servidor Central Ónix-0 - Grupo de Rescate Tiuna (C4ISR Backend)
After=network.target postgresql.service
Wants=postgresql.service

[Service]
Type=simple
User=root
WorkingDirectory=${INSTALL_DIR}
Environment="DATABASE_URL=postgresql://${DB_USER}:ClaveMaestraPostgresSuperSegura2026!@localhost:5432/${DB_NAME}"
Environment="JWT_SECRET_KEY=ONIX0_TIUNA_TACTICAL_SECRET_2026_SECURE"
Environment="MAPS_DIRECTORY=${INSTALL_DIR}/storage/maps"
ExecStart=${VENV_DIR}/bin/uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
Restart=always
RestartSec=3s
LimitNOFILE=65535
NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
EOF

    systemctl daemon-reload
    systemctl enable "${SERVICE_NAME}"
    systemctl restart "${SERVICE_NAME}" || true
    log "[✓] Servicio systemd instalado y activado."
}

test_firewall_mechanisms() {
    log "Ejecutando verificación de bloqueo preventivo de 5 fallos..."
    local TEST_IP="203.0.113.199" # IP de prueba RFC 5737
    log "Simulando inserción de baneo para ${TEST_IP} (Clave SAC NX-93)..."
    iptables -I TIUNA-FIREWALL 1 -s "${TEST_IP}" -j DROP -m comment --comment "TIUNA-AUTO-BAN-TEST-5-FAILURES"
    
    if iptables -L TIUNA-FIREWALL -v -n | grep -q "${TEST_IP}"; then
        log "[✓] Regla iptables insertada correctamente en la cadena TIUNA-FIREWALL."
        log "Limpiando regla de prueba..."
        iptables -D TIUNA-FIREWALL -s "${TEST_IP}" -j DROP
        log "[✓] Auto-test de firewall finalizado con éxito."
    else
        error "Fallo al verificar regla de prueba en iptables."
        exit 1
    fi
}

MODE="${1:---install-all}"

case "$MODE" in
    --build-only)
        log "Modo: Preparación y verificación de entorno de compilación."
        python3 --version
        echo "[✓] Verificación de runtime Python superada."
        ;;
    --install-all)
        log "Modo: Instalación y despliegue integral del Servidor Ónix-0."
        install_system_deps
        setup_python_env
        setup_postgresql_postgis
        configure_iptables_firewall
        setup_systemd_service
        ;;
    --test-firewall)
        test_firewall_mechanisms
        ;;
    *)
        echo "Uso: $0 [--build-only | --install-all | --test-firewall]"
        exit 1
        ;;
esac
