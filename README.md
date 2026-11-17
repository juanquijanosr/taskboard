# TaskBoard 📌

Aplicación web full-stack de gestión de tareas desarrollada como taller práctico, estructurada en capas independientes (Frontend, Backend y Base de Datos) y desplegada en producción en la plataforma **Render**.

---

## 🏗️ 1. Arquitectura del Proyecto

El sistema se compone de tres servicios independientes que interactúan mediante una API REST:

* **Frontend:** Desarrollado con **React + Vite** (`Static Site` en Render). Se comunica de forma asíncrona mediante peticiones `fetch`.
* **Backend:** Desarrollado con **Node.js + Express** (`Web Service` en Render). Gestiona las rutas de la API (`/api/tasks`), la lógica de negocio, las validaciones y el control de CORS.
* **Base de Datos:** **PostgreSQL** administrada en la nube de Render (`Render Postgres`), encargada de la persistencia permanente de las tareas.

---

## 🛠️ 2. Estructura del Repositorio (Monorepo)

```text
taskboard/
├── backend/          → API REST (Node.js + Express + PostgreSQL)
├── frontend/         → Interfaz de usuario (React + Vite)
└── README.md         → Documentación oficial del proyecto
🚀 3. Instrucciones de Ejecución Local
Prerrequisitos
Tener instalado Node.js (versión LTS) y Git.

Pasos para iniciar en local:
Clonar el repositorio:

Bash
git clone [https://github.com/juanquijanosr/taskboard.git](https://github.com/juanquijanosr/taskboard.git)
cd taskboard
Configurar y ejecutar el Backend:

Bash
cd backend
npm install
Crea un archivo .env en la carpeta backend con las siguientes variables:

Fragmento de código
PORT=3000
DATABASE_URL=tu_cadena_de_conexion_externa_de_postgres
DB_SSL=true
FRONTEND_URL=http://localhost:5173
Inicia el servidor:

Bash
npm start
Configurar y ejecutar el Frontend:

Bash
cd ../frontend
npm install
Crea un archivo .env en la carpeta frontend con:

Fragmento de código
VITE_API_URL=http://localhost:3000
Inicia el entorno de desarrollo:

Bash
npm run dev
🌐 4. Enlaces de Producción (Render)
Frontend (Static Site): https://taskboard-web-xgzl.onrender.com

Backend API (Web Service - Health Check): https://taskboard-api-ex59.onrender.com/api/health

📝 5. Historial de Commits del Desarrollo
El desarrollo del proyecto se estructuró de manera progresiva mediante los siguientes commits oficiales en el repositorio:

feat: estructura correcta de backend y frontend para taskboard — Inicialización del monorepo con la separación de carpetas y archivos base.

Initialize Express API with task management routes — Configuración inicial del servidor Node.js/Express y definición de las rutas principales.

Add initial HTML structure for TaskBoard — Creación de la estructura del documento HTML de la interfaz.

Initialize main.jsx with React entry point — Configuración del punto de montaje principal de React con Vite.

Refactor App component for better task handling — Implementación de la lógica de estados, consumo asíncrono y componentes interactivos para listar, crear y eliminar tareas.

Refactor backend API and add automatic DB setup — Integración de la conexión segura a PostgreSQL con SSL y la función automática de creación de tablas al arrancar el servidor.

🔒 6. Configuración Clave en Producción
CORS: El backend restringe las peticiones entrantes exclusivamente al dominio autorizado del frontend mediante la variable de entorno FRONTEND_URL.

Variables de Entorno:

DATABASE_URL y PORT gestionadas dinámicamente en Render.

VITE_API_URL inyectada en el momento de la compilación (build) del Static Site de Vite.

Persistencia: La tabla tasks se verifica y crea de forma automática en el arranque del servidor, asegurando que los datos se conserven entre reinicios.


---


