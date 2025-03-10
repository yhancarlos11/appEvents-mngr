# Event Management Application

## Descripción del Proyecto

Esta es una aplicación web para la gestión de eventos, donde los usuarios pueden crear, leer, actualizar y eliminar eventos. La aplicación incluye un frontend en Angular y un backend en Express (Node.js). El objetivo de este proyecto es demostrar habilidades básicas de desarrollo fullstack, incluyendo la implementación de pruebas unitarias, manejo de datos estructurados y funcionalidades CRUD.

## Funcionalidades

### Frontend
- **Interfaz de Usuario:**
  - Ver una lista de eventos.
  - Agregar nuevos eventos.
  - Editar eventos existentes.
  - Eliminar eventos.
- **Formulario de Eventos:**
  - Título del evento.
  - Fecha y hora.
  - Descripción.
  - Ubicación.
  - Validación de campos.

### Backend
- **API Básica:**
  - `POST /events`: Crear un nuevo evento.
  - `GET /events`: Listar todos los eventos.
  - `GET /events/:id`: Ver detalles de un evento específico.
  - `PUT /events/:id`: Actualizar un evento existente.
  - `DELETE /events/:id`: Eliminar un evento.
- **Autenticación:**
  - `POST /register`: Registrar un nuevo usuario.
  - `POST /login`: Iniciar sesión.

## Requisitos

- Node.js
- Angular CLI
- SQLite (opcional, se puede usar una base de datos en memoria)

## Instalación

### Clonar el Repositorio

```sh
git clone https://github.com/tu-usuario/event-management-app.git
cd event-management-app

event-management-app/
├── backend/
│   ├── server.js
│   ├── package.json
│   └── ...
├── events-mngr/
│   ├── src/
│   │   ├── app/
│   │   │   ├── login/
│   │   │   │   ├── login.component.ts
│   │   │   │   ├── login.component.html
│   │   │   │   └── ...
│   │   │   ├── register/
│   │   │   │   ├── register.component.ts
│   │   │   │   ├── register.component.html
│   │   │   │   └── ...
│   │   │   ├── event-list/
│   │   │   │   ├── event-list.component.ts
│   │   │   │   ├── event-list.component.html
│   │   │   │   └── ...
│   │   │   ├── event-form/
│   │   │   │   ├── event-form.component.ts
│   │   │   │   ├── event-form.component.html
│   │   │   │   └── ...
│   │   │   ├── app.module.ts
│   │   │   ├── app-routing.module.ts
│   │   │   └── ...
│   ├── angular.json
│   ├── package.json
│   └── ...
└── README.md