# Crear una nueva unidad

## 1. Diseñar el contenido

Define antes de programar:

- número, título, descripción e icono de insignia;
- topología y dispositivos;
- habilidades de terminal necesarias;
- laboratorios, estado inicial, misión y objetivos;
- comandos nuevos y respuestas esperadas;
- compatibilidad con el [manual maestro de comandos](08-MANUAL-MAESTRO-COMANDOS.md): modos, ayuda `?`, abreviaciones, guardado y comandos de reversión;
- mapeo de objetivos oficiales en la [ruta CCNA v2.0](09-RUTA-CISCO-CCNA-V2.md) y módulo del curso donde se publicará la unidad;
- dependencias entre laboratorios.

Los objetivos deben comprobar estado, no texto escrito. Por ejemplo, un objetivo de trunk debe revisar `mode`, `nativeVlan` y `allowedVlans`, no que el alumno haya tecleado una secuencia específica.

## 2. Reservar índices

| Unidad | Índices actuales/propuestos |
|---|---|
| U1 | 0–5 |
| U2 | 6–11 |
| U3 | 12–17 |
| U4 siguiente | 18–23 |

Nunca reutilices un índice: es la identidad persistente del laboratorio y forma parte de la clave de `lab_completions`.

El rango se declara con `completionStart`; `defineUnit()` calcula `completionEnd`. Para una unidad nueva usa como inicio el `completionEnd` de la anterior y ejecuta `validateUnitCatalog(UNIT_CATALOG)`. La validación detiene el arranque si detecta rangos superpuestos.

## 3. Actualizar la base antes del frontend

Antes de publicar una unidad nueva, crea una migración nueva de SQLite (en `server/labs.js` o en un módulo nuevo) y agrégala **al final** del arreglo de migraciones de `server/index.js`. La migración debe:

1. registrar cada nuevo índice en `published_labs` con curso y unidad correctos, solo al publicar laboratorios completos;
2. preservar índices históricos y la unicidad de `(user_id, lab_index)`;
3. mantener el cálculo de XP y la autorización de `POST /api/completions`;
4. mantener el filtro por el usuario de la sesión en las rutas de borradores y finalizaciones, para que cada estudiante solo gestione sus filas.

Nunca edites una migración ya publicada: las bases existentes no la volverían a ejecutar. No hagas este cambio a mano sobre `app.db`: guarda el SQL como migración reproducible; se aplica sola al arrancar el servidor.

## 4. Completar la plantilla

Copia [unit-template.js](../templates/unit-template.js), reemplaza todos los `TODO` y valida:

- identificadores únicos;
- detalles con direcciones IP completas;
- pruebas puras y deterministas;
- estado inicial nuevo por laboratorio, sin referencias compartidas;
- XP y reglas de finalización heredadas del motor, no redefinidas.

Cada entrada del catálogo debe crearse con `defineUnit({...})` y declarar este contrato:

| Campo | Uso |
|---|---|
| `id`, `number` | Identidad estable y número visible, ambos únicos |
| `title`, `description`, `emptyState` | Textos de la tarjeta y estado inicial |
| `completionStart` | Primer índice global reservado |
| `devices` | IDs únicos usados por estado, selector e historial |
| `capabilities` | Funciones habilitadas, por ejemplo `trunk` o `ipv4` |
| `labs` | Misiones con `code`, textos, `setup` y objetivos verificables |
| `badge` | Insignia única entregada al completar toda la unidad |
| `sequential`, `featured`, `afterLast` | Navegación y presentación |
| `adapters.open`, `adapters.loadLab` | Puente temporal hacia la vista y estado específicos |

La unidad debe estar incluida en **un módulo de `COURSE_CATALOG`** y registrar una sesión con `viewId`, `terminalDialect`, `saveDraft`, `restoreDraft`, `reset` y `focus`. La vista nueva declara `data-unit-view`; el intérprete de comandos se conecta según su dialecto. El catálogo comprueba que ninguna unidad publicada quede fuera de curso o repetida dentro del mismo.

`defineUnit()` añade la versión del contrato, los valores por defecto, `completionEnd` y los alias usados por el motor actual. No agregues una unidad directamente como un objeto sin normalizar.

## 5. Integrar la interfaz

El inicio debe derivar automáticamente:

- total de laboratorios terminados;
- total y porcentaje de cada unidad;
- siguiente laboratorio pendiente;
- tarjeta de unidad;
- insignia bloqueada u obtenida;
- total de unidades completadas.

No codifiques números como `2`, `6` o `12` en el renderizado. Usa `UNITS.length`, `unit.labs.length` e índices calculados.

## 6. Integrar terminal y guardado

Cada dispositivo necesita:

- estado independiente;
- historial independiente con `ArrowUp` y `ArrowDown`;
- cambio de dispositivo sin perder configuración;
- guardado local inmediato;
- sincronización remota después de cambios;
- restauración del dispositivo activo, comandos e intentos.

## 7. Integrar finalización

La validación debe:

1. exigir autenticación;
2. volver a comprobar objetivos;
3. llamar a `POST /api/completions` una sola vez de forma segura;
4. actualizar finalizaciones, XP, racha e insignias desde el servidor;
5. mostrar el diálogo de laboratorio completado;
6. desbloquear y abrir el siguiente laboratorio;
7. impedir XP duplicado al revalidar.

## 8. Probar y publicar

Ejecuta `npm test` y el plan completo. No basta con terminar la unidad con una cuenta que ya tiene progreso. La app no crea cuentas: entra en el mismo navegador con otra cuenta de la plataforma que nunca haya usado la app (o con el administrador de prueba, si aún no tiene progreso) y confirma que comienza con 0 XP y 0 laboratorios.
