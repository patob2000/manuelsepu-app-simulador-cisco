# Modelo de datos

La base es un archivo SQLite, `DATA_DIR/app.db` (por defecto `./data/app.db`; en producción `/app/data/app.db`). `server/db.js` la abre con better-sqlite3 en modo WAL y con claves foráneas activas. Solo el servidor la lee y escribe; el navegador accede a ella mediante la API en `/api`.

## Tablas

### `users`

| Campo | Uso |
|---|---|
| `id` | PK entera |
| `email` | Único, en minúsculas y sin espacios; es la identidad de la persona |
| `name`, `avatar_url` | Datos que entrega la plataforma al entrar |
| `role` | `student` o `admin` |
| `created_at`, `last_login_at` | Auditoría |

No guarda contraseñas: la plataforma AulaSimple valida las credenciales. Como la identidad es el correo normalizado, la misma persona cae en la misma fila tanto si entra desde la tarjeta (SSO) como con login directo o como administrador de prueba. El administrador de prueba (`APP_ADMIN_EMAIL`) siempre tiene rol `admin`; los demás reciben `admin` solo si la plataforma los informa como administradores.

### `sessions`

| Campo | Uso |
|---|---|
| `token_hash` | PK; hash SHA-256 del token opaco de sesión |
| `user_id` | Referencia a `users` |
| `created_at` | Auditoría |
| `expires_at` | Vencimiento, 30 días después de entrar |

El token en claro solo lo conoce el navegador, que lo envía como `Authorization: Bearer <token>`. `POST /api/logout` borra la fila y las sesiones vencidas se eliminan al arrancar el servidor.

### `student_profiles`

| Campo | Uso |
|---|---|
| `user_id` | PK y referencia a `users` |
| `display_name` | Nombre visible, 2–30 caracteres |
| `total_xp` | Total global de todas las unidades |
| `streak` | Racha de días |
| `last_study_date` | Último día con finalización nueva |
| `created_at`, `updated_at` | Auditoría |

Se crea la primera vez que la persona entra, con el nombre que entrega la plataforma. `PATCH /api/profile` cambia el alias.

### `published_labs`

Registro administrativo con `lab_index` como clave estable, `course_id`, `unit_id`, `active` y `published_at`. Ninguna ruta de la API lo modifica: solo las migraciones publican un laboratorio. La migración inicial registra los índices 0–17 del curso `cisco-ccna-200-301-v2` (0–5 `unit-1`, 6–11 `unit-2`, 12–17 `unit-3`); U4 agregará sus índices en su propia migración. No añadir automáticamente los índices futuros para evitar XP por misiones aún inexistentes.

### `lab_completions`

| Campo | Uso |
|---|---|
| `user_id`, `lab_index` | PK compuesta; impide duplicar una finalización |
| `xp_awarded` | 100–150 |
| `attempts` | Intentos fallidos/reinicios |
| `used_help` | Si usó una ayuda |
| `duration_seconds` | Duración informativa |
| `completed_at` | Fecha de finalización |

`lab_index` es un entero no negativo, conserva su identidad histórica y referencia a `published_labs`. Solo se puede asignar XP a índices activos en `published_labs`.

### `lab_drafts`

| Campo | Uso |
|---|---|
| `user_id`, `lab_index` | PK compuesta; un borrador por estudiante **y por laboratorio** |
| `state` | Estado completo como JSON válido |
| `attempts`, `used_help` | Datos para XP |
| `started_at`, `updated_at` | Continuidad y auditoría |

`PUT /api/drafts/:labIndex` hace upsert por ambas columnas. `GET /api/drafts` devuelve los 50 borradores más recientes del usuario; al volver, el cliente restaura el borrador incompleto más reciente.

## Registro de finalización: `POST /api/completions`

Recibe índice, intentos, uso de ayuda y duración. Exige sesión, comprueba que el índice esté **activo en `published_labs`** y, dentro de una transacción:

1. calcula el XP: 100, más 20 si no hubo intentos, más 30 si no usó ayuda;
2. inserta la finalización ignorando el conflicto de `(user_id, lab_index)`;
3. solo si la inserción fue nueva, suma el XP al perfil, actualiza la racha y elimina el borrador de ese laboratorio; los demás borradores permanecen.

La respuesta indica si se entregó XP (`awarded`), cuánto (`xp`, 0 si ya estaba registrado), el total y la racha. La racha se mantiene si el último día de estudio es hoy, suma 1 si fue ayer y vuelve a 1 en cualquier otro caso; los días se cuentan en UTC.

Esta ruta es la autoridad de XP. El navegador no debe sumar XP por sí solo como fuente definitiva.

## Rutas de la API

| Ruta | Uso |
|---|---|
| `GET /api/health` | Comprobación del servicio |
| `GET /api/config` | URL de la plataforma para el enlace del diálogo de acceso |
| `POST /api/sso` | Canjea el `lmsToken` de la tarjeta contra la plataforma |
| `POST /api/login` | Correo y contraseña de la plataforma, o administrador de prueba |
| `GET /api/me` | Usuario de la sesión |
| `POST /api/logout` | Cierra la sesión |
| `GET /api/progress` | Perfil, finalizaciones propias y ranking (20 primeros) |
| `PATCH /api/profile` | Cambia el alias |
| `GET /api/drafts` | Borradores propios |
| `PUT /api/drafts/:labIndex` | Guarda el borrador de un laboratorio |
| `POST /api/completions` | Registra una finalización y entrega XP |

## Mapa de índices

| Índices | Unidad |
|---|---|
| 0–5 | U1 |
| 6–11 | U2 |
| 12–17 | U3 · Enrutamiento entre VLAN |

## Seguridad

- Las rutas de progreso, perfil, borradores y finalizaciones exigen una sesión válida; sin ella responden 401.
- Cada ruta filtra por el `user_id` de la sesión: un estudiante solo lee y escribe su perfil, sus finalizaciones y sus borradores. El ranking es la única lectura que incluye a otros estudiantes y solo expone identificador, alias, XP y racha.
- `published_labs` no se puede modificar desde la API; su contenido depende solo de las migraciones.
- El servidor calcula el XP; el cliente solo informa índice, intentos, uso de ayuda y duración.
- El login admite como máximo 10 intentos fallidos por IP cada 15 minutos. La clave del administrador de prueba se compara en tiempo constante.
- Las consultas a la plataforma (`/api/access/exchange-token` y `/api/access/login`) salen del servidor, con un límite de 15 segundos.

## Migraciones

Las migraciones son bloques SQL que corren solos al arrancar el servidor. `server/db.js` usa `PRAGMA user_version` para saber cuántas se aplicaron y ejecuta las pendientes, cada una en su propia transacción. El arreglo se arma en `server/index.js` y hoy es `[authMigration, labsMigration]`: la primera crea `users` y `sessions`; la segunda crea las tablas de progreso y publica los índices 0–17.

- Una migración nueva se **agrega al final** del arreglo. Nunca edites ni reordenes una migración ya publicada: las bases existentes no la volverían a ejecutar.
- Para publicar una unidad nueva, crea una migración (en `server/labs.js` o en un módulo nuevo) que inserte sus índices en `published_labs` con curso y unidad correctos, solo cuando sus laboratorios estén completos.
