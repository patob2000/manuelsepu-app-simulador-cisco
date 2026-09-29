# Contrato funcional obligatorio

Una unidad se considera compatible solamente si cumple todos estos puntos.

## Esquema de unidad

- Todas las unidades se crean con `defineUnit()` y usan `contractVersion: 1`.
- `id`, `number` y los códigos de laboratorio son únicos en todo el catálogo.
- `completionStart` es un entero no negativo y su rango no se superpone con otra unidad.
- `completionEnd` siempre es `completionStart + labs.length`.
- `devices` y `capabilities` son listas de identificadores únicos.
- Cada laboratorio declara `code`, `title`, `type`, `subtitle`, `mission`, `setup` y uno o más objetivos.
- Cada objetivo declara `label`, `detail` y una función pura `test(state)`.
- `badge`, `adapters.open` y `adapters.loadLab` son obligatorios.
- `validateUnitCatalog()` debe aprobar el catálogo completo antes de iniciar la app.
- Toda unidad publicada pertenece a un módulo de `COURSE_CATALOG` y registra `viewId`, `terminalDialect`, `saveDraft`, `restoreDraft`, `reset` y `focus`.

Las capacidades describen comportamiento disponible, no progreso. Ejemplos actuales: `ios`, `switching`, `access-vlan`, `ipv4`, `ping`, `startup-config`, `trunk`, `native-vlan`, `allowed-vlans` y `multi-switch`.

## Cuenta y aislamiento

- El progreso pertenece al `user_id` autenticado.
- Las claves locales incluyen el identificador del usuario.
- Cerrar sesión limpia el estado visible de la cuenta anterior.
- Un usuario nuevo comienza con 0 XP, 0 laboratorios y 0 insignias.
- Cada ruta de la API filtra por el usuario de la sesión; así se protegen perfiles, finalizaciones y borradores.
- La identidad es el correo normalizado: la misma persona ve el mismo progreso si entra desde la tarjeta de la plataforma o con login directo.

## Progreso y navegación

- Los laboratorios se desbloquean de forma secuencial.
- Un laboratorio revisable permanece accesible después de completarse.
- El porcentaje se basa en finalizaciones registradas.
- Preparar todos los objetivos no marca el laboratorio como completado: el alumno debe validar.
- Al completar aparece un diálogo con XP y botón al siguiente desafío.
- Al completar toda la unidad se obtiene exactamente una insignia de unidad.
- El inicio agrega XP, laboratorios e insignias de todas las unidades.

## XP

| Concepto | XP |
|---|---:|
| Completar misión | 100 |
| Primer intento | +20 |
| Sin ayudas | +30 |

- Máximo actual: 150 XP por laboratorio.
- El servidor calcula el XP.
- La clave `(user_id, lab_index)` hace que la asignación sea idempotente.
- Revalidar muestra que ya estaba registrado y entrega 0 XP adicional.

## Terminal

- Los dispositivos conservan configuraciones separadas.
- Cambiar de dispositivo no reinicia su estado.
- Flecha arriba recupera comandos anteriores y flecha abajo avanza en el historial.
- El historial se conserva dentro del borrador.
- Los modos y prompts cambian como en IOS: usuario, privilegiado, configuración, VLAN e interfaz.
- Se aceptan abreviaciones no ambiguas documentadas.
- `?` ofrece ayuda contextual.
- Los mensajes de IP muestran dirección/prefijo y gateway; las instrucciones educativas usan direcciones completas.

## Guardado

- Cada acción relevante guarda inmediatamente en local.
- El remoto se guarda con un retardo breve para evitar solicitudes excesivas y conserva un borrador por usuario y laboratorio.
- Salir de una unidad, cambiar de dispositivo u ocultar la pestaña fuerza/conserva el borrador.
- Al volver se restaura estado, laboratorio, dispositivo, intentos, uso de ayuda e historial.
- `wr` y `copy running-config startup-config` guardan el switch activo.
- En una topología con varios switches, cada uno debe guardarse por separado.
- Reiniciar laboratorio vuelve al estado inicial de esa misión y cuenta como intento.
- `POST /api/completions` solo asigna XP a índices activos en `published_labs`; las futuras unidades se registran en la base en su propia migración de SQLite.

## Contenido

- Misión, objetivos y validador describen el mismo resultado.
- Los detalles no abrevian IP: usar `192.168.20.10`, no `.20.10`.
- El ping valida la topología y configuración real simulada.
- Las insignias representan unidades completadas, no acciones genéricas.
