# 🚀 Nibble

**Nibble** es una plataforma open-source de transferencia de archivos **P2P (Peer-to-Peer)** construida para maximizar **velocidad, privacidad y simplicidad**.

Usando **WebRTC**, los archivos se transfieren directamente entre navegadores, sin servidores intermedios para los datos.

> “Byte por byte, directo entre dispositivos.”

---

## ✨ Características

- ⚡ **P2P real:** conexión directa entre usuarios vía WebRTC
- 🔒 **Privacidad total:** los archivos no pasan por servidores centrales
- 📦 **Sin límites artificiales:** transferencias de cualquier tamaño (dependiendo del navegador)
- 🌐 **Sin cuentas:** solo conecta y transfiere
- 🧠 **Arquitectura ligera:** signaling server mínimo, toda la carga es P2P
- 🧩 **Modular:** monorepo preparado para escalar (web + signaling + packages)

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 14 + Tailwind CSS
- **Backend (Signaling):** Node.js + WebSockets (`ws`)
- **P2P Core:** WebRTC (DataChannels)
- **Monorepo:** pnpm workspaces (o Turborepo-ready)
- **Lenguaje:** TypeScript

---

## 📂 Estructura del proyecto

```text
bytex/
├── apps/
│   ├── web/              # Cliente web (UI + WebRTC)
│   └── signaling/        # Servidor WebSocket (handshake)
│
├── packages/
│   └── shared/           # Tipos e interfaces compartidas
│
├── docs/                 # Documentación del protocolo P2P
├── infra/                # Configuraciones de deploy (opcional)
├── package.json
├── pnpm-workspace.yaml
└── README.md
````

---

## 🚀 Inicio rápido

### Requisitos

* Node.js ≥ 18
* pnpm (`npm install -g pnpm`)

---

### Instalación

```bash
git clone https://github.com/tu-usuario/bytex.git
cd bytex
pnpm install
```

---

### Desarrollo

```bash
pnpm dev
```

Esto levantará:

* 🌐 Frontend: [http://localhost:3000](http://localhost:3000)
* 📡 Signaling server: [http://localhost:8080](http://localhost:8080)

---

## 🏗️ Arquitectura del sistema

Bytex funciona en 5 pasos:

1. **Conexión al signaling server**

   * Ambos usuarios se conectan vía WebSocket

2. **Intercambio de señalización**

   * Se envían `SDP Offer / Answer`
   * Se intercambian `ICE Candidates`

3. **Establecimiento P2P**

   * WebRTC crea conexión directa entre navegadores

4. **Transferencia de archivos**

   * El archivo se divide en *chunks*
   * Se envía por `RTCDataChannel`

5. **Reensamblado**

   * El receptor reconstruye el archivo usando `Blob API`

---

## 🔐 Importante

* El servidor **NO transfiere archivos**
* Solo actúa como puente de señalización
* La transferencia es 100% entre peers

---

## 🤝 Contribuir

Las contribuciones son bienvenidas 🚀

```bash
1. Fork del proyecto
2. Crea tu branch: git checkout -b feature/nueva-funcion
3. Commit: git commit -m "feat: nueva función"
4. Push: git push origin feature/nueva-funcion
5. Abre un Pull Request
```

---

## 📦 Ideas futuras

* 🌍 NAT traversal con TURN server (coturn)
* 📱 Versión mobile (React Native / Expo)
* 🔗 Links de transferencia tipo “invite code”
* 🔒 Cifrado E2E por archivo
* 📊 progreso en tiempo real + reanudación de archivos

---

## ⚖️ Licencia

MIT License © Bytex

---

## 📡 Contacto

**Ramiro Brandon Mamani Quisbert**
Proyecto: Bytex
Email: [proyecto@bytex.com](mailto:proyecto@bytex.com)
GitHub: [https://github.com/tu-usuario/bytex](https://github.com/tu-usuario/bytex)

---

## ❤️ Filosofía

> Software libre, transferencia directa, sin intermediarios.
> Porque los datos deberían viajar como las ideas: sin permisos.

