# Proyecto Full-Stack To-Do List

Este es un proyecto de aplicación de lista de tareas (To-Do List) full-stack que incluye un backend con Node.js, un frontend con React y una base de datos PostgreSQL, todo orquestado con Docker.

## Tecnologías Utilizadas

### Backend
- **Node.js**: Entorno de ejecución para JavaScript.
- **Express**: Framework web para la creación de la API.
- **TypeScript**: Superset de JavaScript que añade tipado estático.
- **Prisma**: ORM para una interacción moderna y segura con la base de datos.
- **PostgreSQL**: Base de datos relacional.
- **JSON Web Tokens (JWT)**: Para la autenticación de usuarios.
- **bcrypt**: Para el hash de contraseñas.

### Frontend
- **React**: Biblioteca para construir interfaces de usuario.
- **Vite**: Herramienta de desarrollo frontend extremadamente rápida.
- **TypeScript**: Para un desarrollo más robusto y escalable.
- **Tailwind CSS**: Framework de CSS "utility-first" para un diseño rápido y personalizado.

### Entorno
- **Docker & Docker Compose**: Para la containerización y orquestación de todos los servicios, asegurando un entorno de desarrollo consistente.

---

## Estructura del Proyecto

El repositorio está organizado en dos carpetas principales:

- `backend/`: Contiene todo el código de la API REST, incluyendo la lógica de negocio, conexión a la base de datos y autenticación.
- `frontend/`: Contiene la aplicación de React que consume la API del backend.

---

## Requisitos Previos

Para poder ejecutar este proyecto, solo necesitas tener instalado:

- **Docker**: Descargar Docker
- **Docker Compose**: Generalmente viene incluido con Docker Desktop.

---

## Instalación y Ejecución

Gracias a Docker, poner en marcha todo el entorno es muy sencillo.

1.  Clona este repositorio en tu máquina local.
2.  Abre una terminal en la raíz del proyecto (`c:\ejercicio-fullstack`).
3.  Ejecuta el siguiente comando:

    ```bash
    docker-compose up --build
    ```

    - `docker-compose up`: Inicia todos los servicios (backend, frontend, db).
    - `--build`: Fuerza la reconstrucción de las imágenes de Docker, lo cual es necesario la primera vez o después de cambiar dependencias o archivos de configuración de Docker.

4.  ¡Listo! La aplicación estará disponible en las siguientes URLs:
    - **Frontend**: http://localhost:5173
    - **Backend API**: http://localhost:3000

---

## Puertos Expuestos

- `5173`: Puerto del servidor de desarrollo de Vite para el **frontend**.
- `3000`: Puerto del servidor de Express para el **backend**.
- `5433`: Puerto de la base de datos **PostgreSQL**, mapeado al puerto `5432` del contenedor. Puedes usarlo para conectarte con un cliente de base de datos externo.
- `5555`: Puerto expuesto por el backend, reservado para el **Prisma Studio** si se decide utilizar.

---

## Endpoints de la API

Todas las rutas están prefijadas con `/api`.

### Autenticación (`/api/auth`)
- `POST /auth/register`: Registra un nuevo usuario.
- `POST /auth/login`: Inicia sesión y devuelve un token JWT.

### Tareas (`/api/tasks`)
- `GET /tasks`: Obtiene todas las tareas del usuario autenticado.
- `POST /tasks`: Crea una nueva tarea.
- `PUT /tasks/:id`: Actualiza el título y/o descripción de una tarea.
- `PATCH /tasks/:id`: Cambia el estado (completada/pendiente) de una tarea.
- `DELETE /tasks/:id`: Elimina una tarea.

### Salud del Servicio
- `GET /api/health`: Endpoint para verificar que el servidor backend está funcionando.

---

## Desarrollo

El `docker-compose.yml` está configurado con volúmenes para el código fuente tanto del backend como del frontend. Esto significa que cualquier cambio que hagas en los archivos dentro de las carpetas `src/` se reflejará automáticamente en los contenedores en ejecución, proporcionando una experiencia de desarrollo con **hot-reloading**.

## Scripts Principales

- **Iniciar todo el entorno**:
  ```bash
  docker-compose up
  ```

- **Detener y eliminar los contenedores**:
  ```bash
  docker-compose down
  ```