@echo off
REM ==============================================================================
REM SISTEMA ONIX-0 - GRUPO DE RESCATE TIUNA
REM SCRIPT DE COMPILACION STANDALONE PARA WINDOWS (PyInstaller x64)
REM ==============================================================================
TITLE Compilador Onix-0 - Estacion Tactica Windows
COLOR 0A

echo ==============================================================================
echo  COMPILACION ONIX-0 TACTICAL WORKSTATION - RESCATE TIUNA
echo ==============================================================================

:: Verificar Python
python --version >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python 3.11+ no se encuentra en el PATH del sistema.
    pause
    exit /b 1
)

:: Crear entorno virtual de compilacion si no existe
IF NOT EXIST "venv_win" (
    echo [*] Creando entorno virtual Windows venv_win...
    python -m venv venv_win
)

echo [*] Activando entorno virtual...
CALL venv_win\Scripts\activate.bat

echo [*] Instalando dependencias de compilacion...
pip install --upgrade pip
pip install pyinstaller==6.5.0 fastapi==0.110.0 uvicorn==0.29.0 psycopg2-binary==2.9.9 pydantic-settings==2.2.1 pywin32==306 pyttsx3==2.90

echo [*] Ejecutando PyInstaller con configuracion onix0_windows.spec...
IF NOT EXIST "build_artifacts\windows" mkdir build_artifacts\windows

pyinstaller --noconfirm --clean --distpath "build_artifacts\windows\dist" --workpath "build_artifacts\windows\build" deploy\windows\onix0_windows.spec

IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] La compilacion con PyInstaller fallo.
    pause
    exit /b %ERRORLEVEL%
)

echo [*] Generando firma de integridad SHA256...
CertUtil -hashfile build_artifacts\windows\dist\Onix0_Tactical_Station.exe SHA256 > build_artifacts\windows\dist\Onix0_Tactical_Station.exe.sha256

echo ==============================================================================
echo [EXITO] Ejecutable standalone generado satisfactoriamente:
echo  Ubicacion: build_artifacts\windows\dist\Onix0_Tactical_Station.exe
echo ==============================================================================
pause
