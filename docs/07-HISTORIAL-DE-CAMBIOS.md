# Historial de cambios

## 2026-09-28 — Integración con AulaSimple (SSO) y migración a SQLite

- La app dejó de ser un sitio estático: ahora es un servicio Node (Express) que sirve `dist/` y expone la API en `/api`. Se publica en EasyPanel desde el `Dockerfile`, con un volumen en `/app/data` para la base.
- Al abrir la tarjeta de la app en AulaSimple, el servidor canjea el `lmsToken` de la URL y abre la sesión sin pedir contraseña. El token manda sobre la sesión guardada en el navegador y se quita de la URL.
- El diálogo de acceso pide solo el correo y la contraseña de la plataforma. Se eliminaron «Crear cuenta» y «Olvidé mi contraseña»: las cuentas se crean y las contraseñas se recuperan en la plataforma, a la que enlaza el diálogo cuando `LMS_URL` está configurada.
- Se agregó un administrador de prueba opcional (`APP_ADMIN_EMAIL` y `APP_ADMIN_PASSWORD`) que entra sin consultar a la plataforma y siempre tiene rol de administrador.
- La identidad es el correo normalizado: la misma persona conserva su progreso si entra desde la tarjeta, con login directo o como administrador de prueba.
- Perfil, finalizaciones, XP, racha, borradores y ranking se guardan en SQLite (`users`, `sessions`, `student_profiles`, `published_labs`, `lab_completions`, `lab_drafts`). `POST /api/completions` reemplaza al RPC de Supabase y conserva el mismo cálculo de XP idempotente. El modo invitado se mantiene; validar misiones y registrar XP exige sesión.
- Migraciones: `authMigration` y `labsMigration`, aplicadas solas al arrancar mediante `PRAGMA user_version`. Las tablas de usuarios y progreso parten vacías: no se migraron alumnos, XP ni borradores desde Supabase. `published_labs` registra los mismos índices 0–17; no se agregaron índices ni comandos.
- Pruebas: `tests/sso.test.mjs` levanta una plataforma simulada y verifica SSO de un solo uso, login contra la plataforma, administrador de prueba, misma persona por las dos puertas, XP idempotente, cierre de sesión y persistencia tras reiniciar. `npm test` ejecuta además las tres pruebas previas.

## 2026-09-26 — Base para varios cursos y proveedores

- Se generalizó la selección de cursos y la vista de unidad; cada unidad registra adaptadores para apertura, guardado, restauración, reinicio y foco.
- La base usa `published_labs` para limitar el XP a laboratorios activos y `lab_drafts_v2` para conservar varios borradores por estudiante; la tabla anterior sigue disponible para clientes antiguos.
- Se migraron borradores sin borrar las finalizaciones o los XP, y se amplió `lab_index` de finalizaciones a entero.
- El catálogo admite nuevas rutas con proveedor propio; FortiOS requiere su propio intérprete antes de publicar NSE 4.

## 2026-09-26 — Preparación de la ruta CCNA 200-301 v2.0

- Se registró la matriz de todos los objetivos del PDF oficial v2.0, el estado parcial de U1–U3 y las unidades propuestas hasta completar la ruta.
- Se creó un catálogo de cursos/módulos para agrupar las unidades publicadas; el inicio identifica la ruta CCNA y evita presentar como completo el temario aún en construcción.
- Se mantienen los índices de laboratorio, XP, cuentas e insignias existentes. La guía de unidades enlaza el nuevo mapa.
- Se corrigió una interpretación de una fuente externa: LACP/EtherChannel permanece expresamente en el programa oficial v2.0.

## 2026-09-26 — Manual maestro de comandos

- Se documentó el contrato reutilizable de terminal para switches, R1 y PC: modos, ayuda contextual `?`, abreviaciones, observación, reversión, persistencia y pruebas para U4+.
- Se separaron explícitamente los comandos actuales de los requisitos futuros; no se presentan STP, EtherChannel, ACL, DHCP o enrutamiento dinámico como disponibles.
- La referencia rápida y la guía de creación de unidades enlazan el nuevo manual.

## 2026-09-25 — Corrección de abreviaciones e instrucciones de U3

- R1 acepta abreviaciones habituales de modos, interfaces, subinterfaces, encapsulación, IP, verificación y guardado.
- La terminal mantiene visible el comando escrito por el estudiante y señala que `encapsulation dot1Q` no lleva la palabra `vlan`.
- El integrador indica valores completos, habilitación de G0/0, encapsulación de cada subinterfaz y gateways; estos pasos aparecen como objetivos separados.
- Las etiquetas de PC1 y PC2 en el integrador muestran VLAN 30 y VLAN 40.
- Se repitieron los seis laboratorios y se probaron los comandos abreviados observados en las capturas.

## 2026-09-25 — Unidad 3 completa

- Se incorporó “Enrutamiento entre VLAN” con seis laboratorios en los índices globales 12–17.
- La topología incluye SW1, R1, PC1 y PC2, con historial y persistencia independientes por dispositivo.
- R1 soporta G0/0, subinterfaces, encapsulación 802.1Q, direcciones IPv4, estado administrativo, tabla de rutas y configuración de inicio.
- El ping de U3 valida el camino completo: VLAN de acceso, trunk, subinterfaces, gateways y rutas entre subredes.
- Se añadió navegación secuencial, recuperación local/remota, diálogo de finalización, XP e insignia propia de U3.
- Se probaron los seis laboratorios y el integrador de extremo a extremo, además de rangos, catálogo, IPv4 y `no vlan`.
- Se evitó que abrir una unidad sobrescriba un borrador local existente antes de restaurarlo.

## 2026-09-25 — Preparación de Supabase para U3

- Se reservaron los índices globales 12–17 para Enrutamiento entre VLAN.
- `lab_completions` y `lab_drafts` aceptan ahora el rango 0–17.
- `award_lab_completion` valida el mismo rango y conserva la entrega idempotente de XP.
- El RPC continúa exigiendo `auth.uid()`, utiliza `search_path` vacío y no permite ejecución anónima.
- La migración reproducible quedó registrada en `supabase/migrations`.

## 2026-09-25 — Refactorización escalable, bloque 7A

- Se formalizó el contrato versionado de unidades mediante `defineUnit`.
- El catálogo valida identificadores, textos, dispositivos, capacidades, laboratorios, objetivos, insignias, adaptadores y rangos de progreso.
- U1 y U2 conservan sus índices 0–5 y 6–11; el inicio de U2 ahora se deriva de la cantidad de laboratorios de U1.
- Los historiales de terminal se derivan de `devices` y la ayuda trunk consulta `capabilities`.
- La plantilla canónica y la documentación describen el mismo esquema exigido por la aplicación.

## 2026-09-25 — Refactorización escalable, bloque 6B

- U1 y U2 comparten el ciclo de carga, restauración y presentación de una misión.
- El estado inicial se captura antes de restaurar el borrador, evitando que “Reiniciar” conserve cambios parciales.
- El reinicio compartido restaura topología, registra el intento, limpia avisos y programa el guardado.
- U2 mantiene el bloqueo secuencial antes de guardar o cambiar el laboratorio activo.
- Los adaptadores específicos se limitan a construir la topología y actualizar sus variables de sesión.

## 2026-09-25 — Refactorización escalable, bloque 6A

- U1 y U2 comparten la evaluación y representación de objetivos.
- El estado listo para validar y su anuncio utilizan un controlador común sin mensajes duplicados.
- Contadores, porcentajes, bloqueos y filas de laboratorios se generan desde `UNIT_CATALOG`.
- Los encabezados de misión y el diálogo de instrucciones se cargan mediante funciones reutilizables.
- La creación y restauración del estado específico de cada topología se mantiene separada para reducir riesgo.

## 2026-09-25 — Refactorización escalable, bloque 5C

- U1 y U2 comparten los renderizadores de `show vlan`, interfaces, switchport, trunk y configuración.
- Running-config, startup-config y configuración de una interfaz utilizan el mismo generador.
- U1 conserva su salida extendida y U2 activa detalles de VLAN permitidas y VLAN nativa mediante opciones.
- Los comandos de observación de U2 siguen registrándose para validar las misiones de diagnóstico.
- Las VLAN se muestran ordenadas y un puerto trunk ya no aparece como puerto de acceso en `show vlan brief`.

## 2026-09-25 — Refactorización escalable, bloque 5B

- U1 y U2 comparten un núcleo de interpretación para los comandos IOS comunes.
- Se unificaron modos, navegación, VLAN, interfaces, descripciones, shutdown, comandos `show` y startup-config.
- La ayuda contextual IOS ahora proviene de una sola función y ofrece las opciones correctas según las capacidades trunk.
- U2 mantiene como extensión únicamente la lista de VLAN permitidas y la VLAN nativa del trunk.
- `exit` desde modo usuario ya no cambia accidentalmente el modo de configuración en U2.

## 2026-09-25 — Refactorización escalable, bloque 5A

- U1 y U2 comparten un único motor de comandos para PC.
- La configuración por CIDR o máscara completa, gateway, DNS, limpieza, ayuda y ping utiliza las mismas validaciones.
- Cada unidad conserva su propia evaluación de conectividad mediante una función inyectada al motor común.
- Los prompts de PC y modos IOS se generan desde una sola función.
- Los intérpretes específicos de switches se mantienen separados hasta el siguiente bloque para limitar regresiones.

## 2026-09-25 — Refactorización escalable, bloque 1

- Se creó `UNIT_CATALOG` como registro central de unidades.
- Las tarjetas del inicio ahora se generan desde el catálogo.
- Los totales de laboratorios y unidades ya no dependen de valores fijos.
- El progreso, botón de continuidad e insignias se derivan de cada definición de unidad.
- Se conservaron sin cambios los motores de terminal de U1 y U2 para reducir el riesgo de regresión.

## 2026-09-25 — Refactorización escalable, bloque 2

- U1 y U2 comparten el cálculo de índices, finalizaciones y desbloqueo.
- La asignación de XP y actualización de perfil utiliza un servicio común e idempotente.
- El avance al siguiente laboratorio se controla desde la definición de cada unidad.
- Se eliminó lógica duplicada de finalización sin cambiar objetivos ni comandos.

## 2026-09-25 — Refactorización escalable, bloque 3

- U1 y U2 utilizan un formato común de borrador local por usuario, unidad y laboratorio.
- El guardado remoto de ambas unidades pasa por el mismo servicio.
- U1 incorpora historial independiente para SW1, PC1 y PC2.
- Los borradores antiguos de U1 y U2 siguen siendo compatibles y se normalizan al recuperarlos.
- La restauración remota identifica la unidad mediante el catálogo central, sin rangos fijos en el flujo.

## 2026-09-25 — Refactorización escalable, bloque 4

- U1 y U2 comparten un controlador de entrada e historial de terminal.
- Enter, flecha arriba, flecha abajo, enfoque y limpieza utilizan el mismo comportamiento.
- Los selectores de dispositivos comparten el mismo enlace de eventos.
- Los mensajes iniciales de conexión de switches y PC se generan desde una función común.

## 2026-09-24 — Base estable U1/U2

- Se trasladaron XP, ranking e insignias globales a “Mis unidades”.
- Las insignias pasaron a representar unidades completas.
- Se completaron los seis laboratorios de U2.
- Se corrigieron avance, desbloqueo secuencial y ventanas de finalización en U2.
- Se agregó historial con flechas en terminales y persistencia por dispositivo.
- Se reforzó el guardado local y remoto de U2.
- SW1 y SW2 mantienen configuración y startup-config independientes.
- Se corrigió el aislamiento local por usuario para cuentas nuevas.
- Se incorporó `no vlan` en configuración global y modo VLAN.
- Se aclararon dirección/prefijo/gateway en PC y objetivos.
- Se corrigieron IP abreviadas en el integrador de U2.
- Se documentó el proyecto y se añadió una plantilla de unidad reutilizable.

## Convención futura

Cada cambio debe registrar fecha, comportamiento visible, migraciones, índices agregados, comandos nuevos y pruebas de regresión realizadas.
