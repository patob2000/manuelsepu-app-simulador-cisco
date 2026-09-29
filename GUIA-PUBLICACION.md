# Publicar eClassVirtual Network Lab en EasyPanel e integrarlo con AulaSimple

La app es un servicio Node (Express) que sirve la interfaz de `dist/` y expone su API en `/api`. Guarda usuarios, sesiones, progreso, XP y borradores en una base SQLite propia (`app.db`). Las cuentas pertenecen a la plataforma AulaSimple: la app no crea cuentas ni recupera contraseñas.

## 1. Crear el servicio

En EasyPanel, crea un servicio de tipo **App** desde este directorio (o desde su repositorio) y usa el `Dockerfile` incluido como método de construcción. La imagen parte de `node:22-bookworm-slim`, instala solo las dependencias de producción con `npm ci --omit=dev`, copia `server/` y `dist/`, y escucha en el puerto 3000. La interfaz no necesita compilación.

Asigna un dominio con HTTPS que apunte al puerto 3000. Esa URL pública es la que registrarás después en la plataforma.

## 2. Configurar las variables de entorno

| Variable | Valor |
|---|---|
| `LMS_URL` | URL pública de la plataforma, por ejemplo `https://aula.cliente.com`, sin barra final. |
| `APP_SLUG` | Slug exacto con el que la app se registra en la plataforma. Si varias tarjetas apuntan a esta misma instancia, sepáralos con comas. |
| `APP_ADMIN_EMAIL` | Correo del administrador de prueba. Usa el mismo con el que esa persona entra a la plataforma. Déjala vacía si no quieres este acceso. |
| `APP_ADMIN_PASSWORD` | Clave del administrador de prueba. Genérala con `openssl rand -base64 24`. |
| `DATA_DIR` | Ya viene como `/app/data` en la imagen; no hace falta cambiarla. |
| `PORT` | Ya viene como `3000` en la imagen. |

El archivo `.env.example` tiene la misma lista como referencia. Si faltan `LMS_URL` o `APP_SLUG`, el servidor arranca igual pero lo advierte en el registro: sin `LMS_URL` solo puede entrar el administrador de prueba y sin `APP_SLUG` no funciona el acceso desde la tarjeta.

El administrador de prueba entra con `APP_ADMIN_EMAIL` y `APP_ADMIN_PASSWORD` sin consultar a la plataforma y siempre tiene rol de administrador. Sirve para revisar la app aunque la plataforma no responda. Si vacías las variables y vuelves a desplegar, ese correo pasa a validarse contra la plataforma como cualquier otro.

## 3. Montar el volumen de datos

Monta un volumen en **`/app/data`**. Allí vive la base (`app.db`, `app.db-wal` y `app.db-shm`). **Sin volumen, cada redespliegue borra la base sin mostrar ningún error**: los alumnos pierden XP, laboratorios y borradores.

Para respaldar, copia el volumen completo, incluidos `app.db-wal` y `app.db-shm`, no solo `app.db`. Para obtener una copia consistente, hazla con el servicio detenido.

Las migraciones de la base corren solas al arrancar y registran los laboratorios publicados. Las tablas de usuarios y progreso parten vacías: no se migró el progreso de alumnos de la versión anterior.

## 4. Registrar la app en AulaSimple

Un administrador de la plataforma debe entrar en `/admin/apps` y registrar la app con:

- el **slug**, idéntico a `APP_SLUG` (o a uno de ellos si configuraste varios);
- la **URL externa del servicio**, la del dominio HTTPS del paso 1.

Al abrir la tarjeta, la plataforma lanza la app con `?lmsToken=` en la URL. El servidor canjea ese token de un solo uso llamando a `LMS_URL/api/access/exchange-token` y abre la sesión del alumno. El token manda sobre cualquier sesión guardada en el navegador y se quita de la URL antes de canjearlo.

Los alumnos también pueden entrar directamente a la URL de la app con el correo y la contraseña de la plataforma; el servidor los valida contra `LMS_URL/api/access/login`. Las cuentas nuevas se crean y las contraseñas se recuperan en la plataforma. El diálogo de acceso muestra un enlace a la plataforma cuando `LMS_URL` está configurada.

## 5. Verificar

Comprueba primero que `https://<tu-dominio>/api/health` responda `{"ok":true}`. Después:

1. **Entrar desde la tarjeta.** Abre la app desde su tarjeta en la plataforma. Debe entrar sin pedir contraseña, con el nombre del alumno, y el botón debe decir «Salir». La URL ya no debe mostrar `lmsToken`.
2. **Login directo.** Cierra sesión, abre la URL de la app sin token y entra con el correo y la contraseña de la plataforma. Luego intenta con una clave equivocada: debe aparecer «Email o contraseña incorrectos.».
3. **Administrador de prueba.** Con las variables configuradas, entra con `APP_ADMIN_EMAIL` y `APP_ADMIN_PASSWORD`. Vacía las variables, vuelve a desplegar y confirma que esa clave ya no sirve.
4. **Misma persona por las dos puertas.** Completa un laboratorio entrando desde la tarjeta, cierra sesión y entra con login directo usando el mismo correo. Deben aparecer el mismo XP, los mismos laboratorios y el mismo borrador, y una sola fila en el ranking.
5. **Datos tras redespliegue.** Vuelve a desplegar el servicio y confirma que el XP y los laboratorios siguen ahí. Si desaparecieron, el volumen no está montado en `/app/data`.

## Problemas frecuentes

| Mensaje o síntoma | Causa probable |
|---|---|
| «Esta tarjeta de la plataforma no corresponde a esta app.» | El slug registrado en `/admin/apps` no coincide con `APP_SLUG`. |
| «La app no tiene configurado su slug (APP_SLUG).» | Falta `APP_SLUG`. |
| «La app no tiene configurada la URL de la plataforma (LMS_URL).» | Falta `LMS_URL`. |
| «Tu acceso venció o ya se usó…» | El token de la tarjeta ya se canjeó o expiró. Vuelve a entrar desde la tarjeta. |
| «La plataforma no respondió…» | `LMS_URL` es incorrecta o la plataforma no responde desde el servidor en 15 segundos. |
| «Demasiados intentos fallidos…» | Hubo 10 intentos de login fallidos desde la misma IP en 15 minutos. Espera y vuelve a intentarlo. |
| El progreso desaparece después de desplegar | No hay volumen en `/app/data`. |

## Archivos del proyecto

`dist/` contiene la interfaz que sirve el servidor. `server/` contiene la API, el acceso y la base. `Dockerfile`, `package.json` y `package-lock.json` construyen la imagen. `docs/` describe arquitectura, comandos, progreso y cómo añadir unidades. `templates/` y `tests/` ayudan a extender y revisar nuevas unidades; ejecuta `npm test` antes de publicar.
