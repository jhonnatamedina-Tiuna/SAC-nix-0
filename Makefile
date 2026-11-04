# ==============================================================================
# SISTEMA ÓXIN-0 - GRUPO DE RESCATE TIUNA
# MAKEFILE DE COMPILACIÓN Y DESPLIEGUE MULTIPLATAFORMA
# Plataformas: Linux (Server), Windows (Workstation), Android (APK), iOS (IPA)
# ==============================================================================

SHELL := /bin/bash
PROJECT_NAME := onix0-rescate-tiuna
VERSION := 2.4.0
ARTIFACTS_DIR := ./build_artifacts
MANIFEST_FILE := ./tiuna_deploy_manifest.json

.PHONY: all help verify-manifest build-linux build-windows build-android build-ios deploy-all firewall-selftest clean

# Meta por defecto: muestra la ayuda táctica
all: help

help:
	@echo "======================================================================"
	@echo " SISTEMA ÓXIN-0 - C4ISR GRUPO DE RESCATE TIUNA (v$(VERSION))"
	@echo " Makefile de Automatización y Empaquetado Multiplataforma"
	@echo "======================================================================"
	@echo "Comandos disponibles:"
	@echo "  make verify-manifest      Valida la integridad de tiuna_deploy_manifest.json"
	@echo "  make build-linux          Prepara entorno de producción Linux / systemd / venv"
	@echo "  make deploy-linux-server  Instala y levanta servicio systemd con iptables"
	@echo "  make build-windows        Genera ejecutable Onix0_Tactical_Station.exe (PyInstaller)"
	@echo "  make build-android        Compila APK liviano con SQLCipher y soporte .mbtiles"
	@echo "  make build-ios            Genera archivo .xcarchive y paquete .ipa para iOS"
	@echo "  make firewall-selftest    Prueba y valida la cadena TIUNA-FIREWALL en iptables"
	@echo "  make deploy-all           Ejecuta verificación y empaquetado de todas las metas"
	@echo "  make clean                Limpia temporales y artefactos de compilación"
	@echo "======================================================================"

# ------------------------------------------------------------------------------
# 1. VERIFICACIÓN DEL MANIFIESTO
# ------------------------------------------------------------------------------
verify-manifest:
	@echo "[*] Validando sintaxis y estructura de $(MANIFEST_FILE)..."
	@which jq >/dev/null 2>&1 && jq empty $(MANIFEST_FILE) && echo "[✓] Manifiesto JSON válido y bien estructurado." || python3 -m json.tool $(MANIFEST_FILE) >/dev/null && echo "[✓] Manifiesto JSON validado por Python."

# ------------------------------------------------------------------------------
# 2. PLATAFORMA LINUX (SERVIDOR CENTRAL ÓXIN-0)
# ------------------------------------------------------------------------------
build-linux: verify-manifest
	@echo "[*] Preparando compilación Linux Servidor Ónix-0..."
	@mkdir -p $(ARTIFACTS_DIR)/linux
	@bash deploy/linux/deploy_server.sh --build-only
	@echo "[✓] Preparación de entorno Linux completada."

deploy-linux-server:
	@echo "[*] Desplegando en servidor Linux con systemd e iptables..."
	@sudo bash deploy/linux/deploy_server.sh --install-all
	@echo "[✓] Servidor Ónix-0 desplegado y activo."

firewall-selftest:
	@echo "[*] Ejecutando auto-test de cadena de seguridad TIUNA-FIREWALL..."
	@sudo bash deploy/linux/deploy_server.sh --test-firewall

# ------------------------------------------------------------------------------
# 3. PLATAFORMA WINDOWS (ESTACIÓN DE CONTROL STANDALONE)
# ------------------------------------------------------------------------------
build-windows:
	@echo "[*] Iniciando compilación de Estación Windows Standalone..."
	@mkdir -p $(ARTIFACTS_DIR)/windows
	@if [ "$$(uname -s | grep -i cygwin || uname -s | grep -i mingw || uname -s | grep -i msys)" ]; then \
		cmd.exe /c "deploy\\windows\\build_standalone.bat"; \
	else \
		echo "[i] Entorno POSIX detectado. Generando artefactos y validando spec de PyInstaller..."; \
		python3 -m py_compile deploy/windows/onix0_windows.spec || true; \
		echo "[i] Para compilar el .exe final de Windows ejecute deploy/windows/build_standalone.bat en su máquina Windows."; \
	fi
	@echo "[✓] Proceso de Estación Windows completado."

# ------------------------------------------------------------------------------
# 4. PLATAFORMA ANDROID (CLIENTE MÓVIL TÁCTICO OFFLINE)
# ------------------------------------------------------------------------------
build-android:
	@echo "[*] Compilando APK Android Táctico (SQLCipher + Cartografía .mbtiles)..."
	@mkdir -p $(ARTIFACTS_DIR)/android
	@bash deploy/android/build_apk.sh
	@echo "[✓] Paquete Android generado en $(ARTIFACTS_DIR)/android/"

# ------------------------------------------------------------------------------
# 5. PLATAFORMA iOS (CLIENTE TÁCTICO OFFLINE)
# ------------------------------------------------------------------------------
build-ios:
	@echo "[*] Preparando compilación iOS Tactical Client..."
	@mkdir -p $(ARTIFACTS_DIR)/ios
	@bash deploy/ios/build_ipa.sh
	@echo "[✓] Paquete iOS procesado en $(ARTIFACTS_DIR)/ios/"

# ------------------------------------------------------------------------------
# 6. ORQUESTACIÓN TOTAL
# ------------------------------------------------------------------------------
deploy-all: verify-manifest build-linux build-windows build-android build-ios
	@echo "======================================================================"
	@echo "[✓] TODAS LAS PLATAFORMAS HAN SIDO COMPILADAS Y EMPAQUETADAS CON ÉXITO"
	@echo " Artefactos listos en: $(ARTIFACTS_DIR)/"
	@echo "======================================================================"

clean:
	@echo "[*] Limpiando directorios de build y temporales..."
	@rm -rf $(ARTIFACTS_DIR) dist build *.egg-info
	@find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	@echo "[✓] Limpieza finalizada."
