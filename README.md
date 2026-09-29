# eClassVirtual Network Lab

Laboratorio web interactivo para practicar switching y conectividad con una terminal inspirada en Cisco IOS.

## Estado actual

- Unidad 1: VLAN y conectividad, 6 laboratorios.
- Unidad 2: VLAN y enlaces troncales, 6 laboratorios.
- Unidad 3: Enrutamiento entre VLAN, 6 laboratorios.
- Acceso integrado con la plataforma AulaSimple: SSO desde la tarjeta de la app o correo y contraseña de la plataforma. La app no crea cuentas ni recupera contraseñas.
- Progreso, borradores, XP, insignias y ranking persistidos en una base SQLite propia mediante la API del servidor (`/api`).
- Publicación como servicio Node (Docker) en EasyPanel, con un volumen para la base de datos. Ver [GUIA-PUBLICACION.md](GUIA-PUBLICACION.md).

## Punto de entrada para continuar el proyecto

Lee primero [docs/00-MANUAL-MAESTRO.md](docs/00-MANUAL-MAESTRO.md). Allí está el orden recomendado para crear una unidad sin perder funciones existentes.

Documentos principales:

- [Arquitectura](docs/01-ARQUITECTURA.md)
- [Crear una unidad](docs/02-CREAR-NUEVA-UNIDAD.md)
- [Contrato funcional obligatorio](docs/03-CONTRATO-FUNCIONAL.md)
- [Comandos soportados](docs/04-COMANDOS-IOS.md)
- [Modelo de datos](docs/05-MODELO-DE-DATOS.md)
- [Plan de pruebas](docs/06-PLAN-DE-PRUEBAS.md)
- [Historial de cambios](docs/07-HISTORIAL-DE-CAMBIOS.md)
- [Plantilla de unidad](templates/unit-template.js)

## Archivos de la aplicación

- `dist/index.html`: estructura de las vistas y diálogos.
- `dist/styles.css`: diseño visual y comportamiento adaptable.
- `dist/app.js`: unidades, simulador, progreso, acceso y llamadas a la API (`apiRequest`).
- `server/index.js`: servidor Express; sirve `dist/` y expone la API en `/api`.
- `server/config.js`: lectura de las variables de entorno.
- `server/db.js`: apertura de la base SQLite y ejecución automática de migraciones.
- `server/auth.js`: usuarios, sesiones, SSO con la plataforma y login.
- `server/labs.js`: perfiles, laboratorios publicados, finalizaciones, XP, borradores y ranking.
- `package.json`: dependencias y scripts (`start`, `dev`, `test`).
- `Dockerfile`: imagen de producción para EasyPanel.
- `.env.example`: variables de entorno de referencia.

## Ejecutar localmente

Requiere Node.js 22 o superior.

1. Instala las dependencias con `npm install`.
2. Copia `.env.example` a `.env` y completa `LMS_URL`, `APP_SLUG` y, si quieres un acceso sin plataforma, `APP_ADMIN_EMAIL` y `APP_ADMIN_PASSWORD`.
3. Inicia el servidor con `npm run dev` y abre `http://localhost:3000`. La base se crea sola en `data/app.db`.
4. Ejecuta las pruebas con `npm test`.

Sin `LMS_URL` solo puede entrar el administrador de prueba, y sin `APP_SLUG` no funciona el SSO; el servidor lo advierte al arrancar. El modo invitado permite explorar, pero no registra XP.

## Regla de oro

No agregues una unidad copiando íntegramente otra. Reutiliza el motor compartido y limita cada unidad nueva a su topología, estado, comandos especializados y objetivos declarativos.
