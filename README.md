# Xinapsis — Monorepo

```
Xinapsis/
├── backend/        ← Express + Prisma + TypeScript
├── frontend/       ← React + Vite + TypeScript
├── package.json    ← Raíz del monorepo (npm workspaces)
└── README.md
```

## Requisitos Previos
- Node.js 18+
- MySQL 8+ corriendo en localhost:3306

## Instalación

```bash
# Desde la carpeta raíz Xinapsis/
npm install
```

## Desarrollo (ambos servidores con un solo comando)

```bash
npm run dev
```

Esto levanta:
- **Backend** en http://localhost:3000
- **Frontend** en http://localhost:5173

## Primera vez (después de clonar o migrar)

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar el .env del backend
cp backend/.env.example backend/.env
# Editar backend/.env con tu DATABASE_URL

# 3. Ejecutar migraciones
npm run migrate

# 4. Crear el usuario SUPER_ADMIN (solo una vez)
npm run seed

# 5. Levantar el proyecto
npm run dev
```

## Credenciales por defecto del SUPER_ADMIN

- **Email:** superadmin@xinapsis.com
- **Contraseña:** Xinapsis2025!

> ⚠️ Cambia estas credenciales en `backend/prisma/seed.ts` antes de producción.

## Estructura del Backend (`backend/`)

```
src/
├── controllers/    ← Manejo de request/response HTTP
├── services/       ← Lógica de negocio y queries de Prisma
├── routes/         ← Definición de endpoints y middlewares RBAC
├── middlewares/    ← authMiddleware, roleMiddleware, superAdminMiddleware
└── db/             ← Cliente de Prisma
prisma/
├── schema.prisma   ← Esquema multi-tenant de la BD
├── migrations/     ← Historial de migraciones
└── seed.ts         ← Script de inicialización
```

## Jerarquía de Roles (RBAC)

```
SUPER_ADMIN  →  Gestiona TODAS las clínicas (tú, el dueño de Xinapsis)
    └── ADMIN       →  Gestiona su propia clínica
            ├── DOCTOR     →  Información clínica de su clínica
            └── ASSISTANT  →  Operaciones de su clínica
```
