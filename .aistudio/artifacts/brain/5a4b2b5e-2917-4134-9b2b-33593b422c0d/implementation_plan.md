# SAC Ónix-0 — Centro de Mando Táctico y C4ISR (Grupo de Rescate Tiuna)

Sistema de comando, control, comunicaciones, computación e inteligencia (C4ISR) para operaciones de emergencia y rescate agreste/urbano. Implementa la Matriz Operativa SAC (01–99) basada en minerales, despacho espacial PostGIS, máquina de estados PTT para conmutación de frecuencias, defensa de red mallada con bloqueo automático y emulación de motor offline de campo.

### User Review & Critical Decisions

> [!IMPORTANT]
> A continuación se resumen las elecciones confirmadas para la estación Ónix-0:

- **Confirmed Decision 1 (Estructura de Visualización)**: Consola C4ISR unificada de alta densidad táctica con mapa geoespacial interactivo, matriz mineral SAC completa (01–99), monitor de frecuencias PTT y terminal de operaciones.
- **Confirmed Decision 2 (Audio y Síntesis SAC)**: Síntesis de voz (Web Speech API en español neutro) complementada con generador de audio procedural (Web Audio API) que emula tonos Roger beep y ruido de conmutación (squelch) de radiocomunicaciones militares/SAR.
- **Confirmed Decision 3 (Terminal Táctica y Ciberdefensa)**: Consola integrada interactiva para comandos de Telegram (`/status`, `/unblock <IP>`) y visualizador del firewall con auditoría en tiempo real y reglas de aislamiento por umbral de 5 fallos.

---

### 1. Overview & Core Concept

- **What It Does**: Proporciona a los oficiales de guardia y despachadores de Ónix-0 una estación de comando táctica en tiempo real:
  - Supervisión de unidades en mapa táctico con cálculo espacial de proximidad (PostGIS).
  - Consulta y ejecución instantánea del diccionario maestro SAC (01–99) clasificado por minerales: Cuarzo (QZ 01–19), Granito (GR 20–39), Ámbar (AM 40–59), Diamante (DM 60–79), Cobalto (CB 80–89) y Ónix (NX 90–99).
  - Conmutador PTT dinámico que reasigna canales de radio (Base, Táctico 1, Escena 2, Sanitario 3) según el estado operacional de las ambulancias (`CB-80` a `CB-86`).
  - Motor de simulación de ciberdefensa: detección de accesos no autorizados, contador de reintentos y lista de bloqueo `iptables` con desbloqueo manual.
  - Simulador de terminal de campo móvil con almacenamiento offline, ráfaga de sincronización idempotente y descargas de teselas `.mbtiles`.
  - Simulador de bot de Telegram bidireccional para recepción de alertas críticas (`AM-41`, `GR-24`, `GR-25`, `NX-92/93`) y ejecución de comandos.
- **Target Audience / Persona**: Jefes de operaciones SAR, despachadores de ambulancia, médicos de enlace prehospitalario y técnicos de radiocomunicaciones del Grupo de Rescate Tiuna.
- **Key Value**: Resuelve la coordinación en entornos con pérdida de enlace celular o radial mediante codificación precisa SAC, ráfagas idempotentes y automatización del despacho por proximidad geográfica.

---

### 2. User Experience & Visual Design

- **Layout Structure**:
  - **Top Bar Contract (3 zonas strictly enforced)**:
    - *Zona Marca*: `Ónix-0 · Grupo de Rescate Tiuna` con indicativo de estación maestra en tipografía técnica clara.
    - *Zona Navegación*: Enlaces tácticos directos: `Mapa Táctico`, `Matriz SAC 01–99`, `Comando PTT`, `Ciberdefensa & Red`, `Terminal Móvil & Sync`, `Scripts & Backend`.
    - *Zona Acción Primaria*: Botón de emergencia rápida `Alerta General (QZ-18)` o selector de simulación activa.
  - **Paneles Principales C4ISR**:
    - **Panel Central Izquierdo / Superior**: Mapa táctico vectorial con marcadores georreferenciados de ambulancias (`Cobalto-1`), rescatistas de montaña (`Granito-1`), estación base (`Ónix-0`) y geocerca de seguridad con cálculo de ruta y distancia PostGIS.
    - **Panel Lateral Derecho**: Matriz Mineral SAC interactiva con filtro por código o mineral (Cuarzo, Granito, Ámbar, Diamante, Cobalto, Ónix), reproductor TTS y botón de transmisión inmediata.
    - **Panel PTT & Radiocomunicaciones**: Interfaz de hardware de radio con botón Push-To-Talk interactivo, selector de canal activo conmutado automáticamente por clave Cobalto, y osciloscopio visual de transmisión de voz.
    - **Módulo de Ciberdefensa y Red Mallada**: Registro de conexiones por segmento IP, contador de fallos de autenticación, lista de IPs bloqueadas (`DROP`) y herramienta de desbloqueo.
    - **Terminal de Telegram y Eventos Listen/Notify**: Feed de eventos en vivo con alertas críticas sonoras y consola interactiva de comandos (`/status`, `/unblock 192.168.1.100`).
    - **Inspector de Código Backend**: Visor de los scripts originales (`init.sql`, `main.py`, `bot_telegram.py`, `client_offline_engine.py`, `install.sh`, `backup_onix0.sh`) listos para descarga o copia rápida.
- **Visual Identity & Theme**:
  - *Estética*: Dark Slate Utilitario / Grado Militar SAR (inspirado en consolas C4ISR, aviónica Garmin y terminales tácticas rugerizadas).
  - *Paleta*:
    - Canvas principal: `#0B0F19` (Slate profundo de baja fatiga visual para operaciones nocturnas).
    - Superficies estructuradas: `#111827` con bordes sutiles `#1F2937`.
    - Acentos funcionales: Ámbar táctico (`#F59E0B`), Verde operacional (`#10B981`), Rojo emergencia (`#EF4444`), Azul Cobalto (`#3B82F6`), Púrpura Ónix (`#8B5CF6`).
  - *Tipografía*: `Plus Jakarta Sans` para textos de comando y títulos; `JetBrains Mono` con `tabular-nums` para coordenadas, claves SAC, frecuencias y marcas de tiempo.
  - *Sin AI Slop*: Sin píldoras flotantes estáticas ni puntuaciones arbitrarias; etiquetas limpias con separadores tipográficos (`·`, `/`).

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Motor Web Híbrido con Simulación Completa de Backend**:
  - *Enfoque*: Implementar una experiencia web de alto rendimiento en React + Tailwind + Vite que ejecuta la lógica real del sistema en memoria del navegador (PostGIS geodésico, triggers de eventos, red mallada y estado de radio), manteniendo a la vez un servidor Express API proxy y el visor completo de los archivos Python/Bash provistos por el usuario.
  - *Razón*: Permite probar todas las funcionalidades interactivamente sin requerir una instancia externa de PostgreSQL/iptables con privilegios de root en el sandbox del navegador, a la vez que entrega los archivos listos para producción.
- **Decision 2: Síntesis de Audio Procedural con Web Audio API + SpeechSynthesis**:
  - *Enfoque*: Generar un doble pitido de modulación de radiofrecuencia (880Hz y 1760Hz con decaimiento rápido) previo al TTS en español de la clave SAC, simulando el tono característico de un radiomódem o terminal PTT de campo.
  - *Razón*: Aporta el realismo táctico esencial solicitado para el entrenamiento y monitoreo de la estación de despacho.
- **Decision 3: Persistencia Local y Ledger de Ráfagas**:
  - *Enfoque*: Emular el comportamiento de SQLite mediante `IndexedDB` / `localStorage` para la terminal móvil, acumulando paquetes con UUID y procesando ráfagas con verificación de duplicados e idempotencia.
  - *Razón*: Garantiza que el flujo de sincronización offline funcione de extremo a extremo sin pérdida de datos.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                   ESTACIÓN CENTRAL ÓXIN-0 (WEB C4ISR)                   │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌───────────────────────┐  ┌─────────────────┐  ┌──────────────────┐  │
│  │ Mapa Táctico PostGIS  │  │ Matriz SAC 01-99│  │ Consola PTT Radio│  │
│  │ · Unidades Cobalto/GR │  │ · 6 Minerales   │  │ · Frecuencia Auto│  │
│  │ · Nearest-Neighbor SAR│  │ · Búsqueda & TTS│  │ · Squelch & PTT  │  │
│  └───────────┬───────────┘  └────────┬────────┘  └────────┬─────────┘  │
│              │                       │                    │            │
│  ┌───────────▼───────────────────────▼────────────────────▼─────────┐  │
│  │            MOTOR REACTIVO DE EVENTOS (LISTEN / NOTIFY)            │  │
│  │    Alertas Críticas: AM-41 (Rojo) · GR-25 (Caído) · NX-93 (Drop)   │  │
│  └───────────┬───────────────────────┬────────────────────┬──────────┘  │
│              │                       │                    │            │
│  ┌───────────▼───────────┐  ┌────────▼────────┐  ┌────────▼─────────┐  │
│  │ Ciberdefensa & IP Drop│  │ Bot de Telegram │  │ Terminal Móvil   │  │
│  │ · Red Mallada 10.42.x │  │ · /status       │  │ · SQLite Queue   │  │
│  │ · Umbral 5 Intentos   │  │ · /unblock <IP> │  │ · Ráfaga Sync    │  │
│  │ · Aislamiento Kernel  │  │ · Reporte 23:00 │  │ · Cartografía MB │  │
│  └───────────────────────┘  └─────────────────┘  └──────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

- **Data Models**:
  - `UnidadTactica`: Indicativo (`Cobalto-1`), tipo (`AMBULANCIA`), estado SAC actual (`CB-80`), canal PTT (`CANAL_BASE_0`), latitud/longitud, velocidad, rumbo y última transmisión.
  - `ClaveSAC`: Código (`QZ-01` a `NX-99`), bloque mineral (`Cuarzo`, `Granito`, `Ámbar`, `Diamante`, `Cobalto`, `Ónix`), descripción oficial, nivel de prioridad (1 a 5), acción automática asociada.
  - `AlertaCritica`: ID UUID, tipo de evento (`AM-41`, `GR-25`), unidad emisora, fecha UTC, coordenadas, unidad sugerida (PostGIS Nearest Neighbor) y distancia en metros.
  - `FirewallRegistro`: Dirección IP, segmento de red, contador de fallos en ventana de 15 min, estado (`PERMITIDO`, `CUARENTENA_DROPPED`), historial de solicitudes no autorizadas.
  - `PaqueteOffline`: UUID idempotente, unidad ID, clave SAC, prioridad, timestamp offline, payload de signos vitales/coordenadas, estado (`PENDIENTE`, `SINCRONIZADO`).
  - `CanalPTT`: Identificador (`CANAL_BASE_0`, `CANAL_TACTICO_1`, `CANAL_ESCENA_2`, `CANAL_SANITARIO_3`), frecuencia nominal, descripción y unidades conectadas.

---

### Step-by-Step Implementation Sequence

1. **Estructura Base & Metadatos**:
   - Actualizar `metadata.json` e `index.html` con títulos, descripciones y fuentes técnicas (`Plus Jakarta Sans`, `JetBrains Mono`).
   - Configurar variables globales en `src/index.css` respetando `@custom-variant dark`.
2. **Definiciones y Datos Maestros (`src/types/` & `src/data/`)**:
   - `src/data/sacMatrix.ts`: Diccionario completo 01 a 99 con sus 6 bloques de minerales, descripciones y prioridades tácticas.
   - `src/data/tacticalUnits.ts`: Configuración inicial de unidades (Cobalto-1, Cobalto-2, Granito-1, Granito-2, Ónix-0 Base).
   - `src/data/networkRules.ts`: Segmentos IP mallados permitidos, lista blanca estricta e intentos simulados.
3. **Servicios de Audio & Web Audio Procedural (`src/utils/audio.ts`)**:
   - Sintetizador de tonos PTT (frecuencias tácticas con envolvente ADSR) y síntesis de voz (Web Speech API) con pronunciación fonética de claves SAC.
4. **Módulos Visuales C4ISR**:
   - `src/components/TacticalMap.tsx`: Mapa SVG/Canvas georreferenciado con cuadrícula militar, unidades en tiempo real, geocerca perimetral y trazado de despacho a la unidad más cercana.
   - `src/components/SacMatrixPanel.tsx`: Navegador y buscador instantáneo de claves 01-99 por mineral, con reproducción TTS y emisión de evento.
   - `src/components/PttConsole.tsx`: Módulo de hardware de radio con visualizador de canal, conmutación dinámica según estado `CB-80..86` y control PTT interactivo.
   - `src/components/CyberDefensePanel.tsx`: Monitor de red mallada, auditoría de accesos denegados, contador de fallos (umbral 5) y control de bloqueo/desbloqueo `iptables`.
   - `src/components/TelegramConsole.tsx`: Consola en vivo del bot de Telegram con soporte de comandos (`/status`, `/unblock`) y avisos automáticos `LISTEN/NOTIFY`.
   - `src/components/MobileTerminalSim.tsx`: Simulador de la app móvil del rescatista (cola SQLite, botón de ráfaga, descarga de mapas `.mbtiles`).
   - `src/components/BackendCodeViewer.tsx`: Inspector organizado con los archivos de backend provistos (`config.py`, `init.sql`, `main.py`, `bot_telegram.py`, `client_offline_engine.py`, `install.sh`, `backup_onix0.sh`).
5. **Ensamblaje y Estado Global en `src/App.tsx`**:
   - Coordinación de eventos reactivos entre el mapa, la radio PTT, el firewall y las alertas críticas.
   - Alerta visual y sonora instantánea ante eventos de emergencia (`AM-41`, `GR-25`).
6. **Compilación y Verificación**:
   - Ejecutar `compile_applet` para certificar la compilación sin advertencias ni errores.
