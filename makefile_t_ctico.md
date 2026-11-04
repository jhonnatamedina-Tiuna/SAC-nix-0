# =====================================================================
# MAKEFILE MAESTRO - SISTEMA ALFANUMÉRICO DE COMUNICACIONES (SAC)
# Estación Central Ónix-0 | Grupo de Rescate Tiuna
# Automatización de despliegue basada en tiuna_deploy_manifest.json
# =====================================================================

.PHONY: help install-linux build-windows build-android build-ios backup clean

# Colorines para la consola táctica
GREEN = \033[1;32m
CYAN = \033[1;36m
YELLOW = \033[1;33m
RED = \033[1;31m
RESET = \033[0m

help:
	@echo "$(CYAN)======================================================"
	@echo "   SISTEMA ÓNIX-0 — GESTOR DE COMPILACIÓN Y DESPLIEGUE"
	@echo "======================================================$(RESET)"
	@echo "Comandos disponibles:"
	@echo "  $(GREEN)make install-linux$(RESET)  - Instala dependencias y configura Ónix-0 en Linux (Ubuntu/Debian)"
	@echo "  $(GREEN)make build-windows$(RESET)  - Genera el ejecutable standalone para Windows (PyInstaller)"
	@echo "  $(GREEN)make build-android$(RESET)  - Compila el paquete release para Android (Expo/React Native)"
	@echo "  $(GREEN)make build-ios$(RESET)      - Compila el paquete release para iOS (Xcode)"
	@echo "  $(GREEN)make backup$(RESET)         - Ejecuta el respaldo cifrado con GPG"
	@echo "  $(GREEN)make clean$(RESET)          - Limpia archivos temporales de compilación"

# 1. Despliegue en Servidor Linux (Ónix-0)
install-linux:
	@echo "$(YELLOW)[LINUX] Iniciando instalación en Estación Central Ónix-0...$(RESET)"
	@if [ -f "install.sh" ]; then \
		chmod +x install.sh; \
		sudo ./install.sh; \
	else \
		echo "$(RED)[ERROR] No se encontró el script install.sh en el directorio actual.$(RESET)"; \
		exit 1; \
	fi

# 2. Compilación para Windows (Estación de Monitoreo / Simulación)
build-windows:
	@echo "$(YELLOW)[WINDOWS] Empaquetando ejecutable con PyInstaller...$(RESET)"
	@python3 -m pip install --upgrade pyinstaller
	pyinstaller --noconsole --onefile main.py --name Onix0_Command_Center
	@echo "$(GREEN)[OK] Ejecutable generado en dist/Onix0_Command_Center.exe$(RESET)"

# 3. Compilación para Android (Dispositivos Tácticos de Rescatistas)
build-android:
	@echo "$(ANDROID] Compilando APK / App Bundle release para Android...$(RESET)"
	@if [ -f "package.json" ]; then \
		npx expo run:android --variant release; \
	else \
		echo "$(RED)[ERROR] No se detectó proyecto Expo/React Native en este directorio.$(RESET)"; \
		exit 1; \
	fi

# 4. Compilación para iOS (iPhone / iPad de Comando)
build-ios:
	@echo "$(YELLOW)[IOS] Compilando paquete release para iOS...$(RESET)"
	@if [ -f "package.json" ]; then \
		npx expo run:ios --configuration Release; \
	else \
		echo "$(RED)[ERROR] No se detectó proyecto Expo/React Native en este directorio.$(RESET)"; \
		exit 1; \
	fi

# 5. Respaldo Cifrado
backup:
	@echo "$(YELLOW)[BACKUP] Ejecutando resguardo seguro con GPG...$(RESET)"
	@if [ -f "backup_onix0.sh" ]; then \
		chmod +x backup_onix0.sh; \
		./backup_onix0.sh; \
	else \
		echo "$(RED)[ERROR] Script backup_onix0.sh no encontrado.$(RESET)"; \
	fi

# 6. Limpieza
clean:
	@echo "$(YELLOW)[CLEAN] Limpiando artefactos temporales de compilación...$(RESET)"
	@rm -rf build/ dist/ *.spec __pycache__/ .pytest_cache/
	@echo "$(GREEN)[OK] Entorno limpio.$(RESET)"