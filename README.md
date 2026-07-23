# Autorizaciones Médicas 🏥

Sistema web de trazabilidad de autorizaciones médicas para la **Clínica Regional del San Jorge**, construido con Next.js 14, Prisma (SQLite), NextAuth.js, Tailwind CSS y shadcn/ui.

---

## Características

- 🔐 **Autenticación por roles** (Médico / Autorizador)
- 📄 **Subida y extracción automática de datos** desde PDFs de órdenes médicas (pdf-parse)
- 🏥 **Gestión de solicitudes de autorización** con flujo completo
- 🔖 **Sello digital en PDF** (pdf-lib) con los datos de la autorización estampados en la última hoja
- 📊 **Dashboard** para cada rol con estadísticas
- 💾 **Base de datos SQLite local** (no requiere instalación de servidor de base de datos)

---

## Flujo del sistema

```
Médico sube PDF → Sistema extrae datos → Solicitud queda "Pendiente" →
Autorizador revisa → Completa formulario de autorización →
Sistema estampa sello en el PDF → PDF descargable → Estado cambia a "Autorizado/Remisión"
```

---

## Requisitos

- **Node.js** v18 o superior → [nodejs.org](https://nodejs.org)
- **npm** v8 o superior (incluido con Node.js)

---

## Instalación y ejecución

### 1. Clonar el proyecto

```bash
git clone https://github.com/EmanuelRoyo/autorizaciones-medicas.git
cd autorizaciones-medicas
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copia el archivo de ejemplo:
```bash
cp .env.local.example .env
```

El `.env` generado incluye configuración por defecto para desarrollo local.

### 4. Crear la base de datos

```bash
npx prisma db push
```

### 5. Cargar datos de prueba

```bash
npm run db:seed
```

### 6. Iniciar el servidor de desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## Usuarios de prueba

| Rol | Email | Contraseña |
|-----|-------|------------|
| 🩺 Médico | `medico@clinica.com` | `medico123` |
| ✅ Autorizador | `autorizador@clinica.com` | `auth123` |

---

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo |
| `npm run build` | Construye para producción |
| `npm run start` | Inicia el servidor de producción |
| `npx prisma db push` | Sincroniza el esquema con la base de datos |
| `npm run db:seed` | Carga datos de prueba |
| `npx prisma studio` | Abre el explorador visual de base de datos |

---

## Stack tecnológico

| Tecnología | Uso |
|------------|-----|
| **Next.js 14** (App Router) | Framework fullstack |
| **TypeScript** | Tipado estático |
| **Prisma + SQLite** | Base de datos local |
| **NextAuth.js** | Autenticación con roles |
| **Tailwind CSS** | Estilos |
| **shadcn/ui** | Componentes UI |
| **pdf-parse** | Extracción de texto de PDFs |
| **pdf-lib** | Estampado del sello en PDFs |
| **bcryptjs** | Hash de contraseñas |
