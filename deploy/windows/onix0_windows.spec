# -*- mode: python ; coding: utf-8 -*-
# ==============================================================================
# SISTEMA ÓXIN-0 - GRUPO DE RESCATE TIUNA
# ESPECIFICACIÓN PYINSTALLER PARA ESTACIÓN WINDOWS STANDALONE (x64)
# ==============================================================================

import os
import sys

block_cipher = None

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))

datas = [
    (os.path.join(project_root, 'public', 'assets', 'aistudio', 'Tiuna_Capital_Nativo_1920_8bfdc104.png'), 'assets'),
    (os.path.join(project_root, 'tiuna_deploy_manifest.json'), '.'),
]

binaries = []

hiddenimports = [
    'uvicorn.logging',
    'uvicorn.loops',
    'uvicorn.loops.auto',
    'uvicorn.protocols',
    'uvicorn.protocols.http',
    'uvicorn.protocols.http.auto',
    'uvicorn.protocols.websockets',
    'uvicorn.protocols.websockets.auto',
    'uvicorn.lifespan',
    'uvicorn.lifespan.on',
    'psycopg2',
    'pydantic_settings',
    'pyttsx3.drivers',
    'pyttsx3.drivers.sapi5',
    'win32timezone'
]

a = Analysis(
    ['../../main.py'],
    pathex=[project_root],
    binaries=binaries,
    datas=datas,
    hiddenimports=hiddenimports,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=['tkinter', 'matplotlib', 'scipy'],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='Onix0_Tactical_Station',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=False,  # Modo Estación de Operaciones Windowed
    disable_windowed_traceback=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    uac_admin=True, # Requerido para modificar reglas de Windows Firewall (netsh)
)
