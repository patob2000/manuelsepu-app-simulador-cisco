# Manual maestro

Este documento es el mapa para mantener y ampliar eClassVirtual Network Lab.

La ruta de contenido para el nuevo examen, con **todos los objetivos 200-301 v2.0**, se mantiene en [09-RUTA-CISCO-CCNA-V2.md](09-RUTA-CISCO-CCNA-V2.md). El catálogo de cursos agrupa unidades publicadas en módulos sin cambiar sus índices históricos de avance.

## Qué debe conservar toda unidad

Cada unidad nueva debe heredar autenticación, aislamiento por estudiante, guardado local y remoto, recuperación del borrador, terminal por dispositivo, historial con flechas, validación de objetivos, XP idempotente, avance secuencial, ventana de finalización, insignia de unidad y ranking global.

La definición completa está en [03-CONTRATO-FUNCIONAL.md](03-CONTRATO-FUNCIONAL.md).

## Flujo recomendado

1. Diseñar la unidad: tema, topología, dispositivos, seis laboratorios y objetivos verificables.
2. Reservar índices globales de laboratorio sin reutilizar índices anteriores.
3. Agregar al final del arreglo de migraciones del servidor una migración nueva que publique cada índice nuevo en `published_labs`.
4. Definir la unidad con el esquema de [templates/unit-template.js](../templates/unit-template.js).
5. Integrarla al motor compartido, inicio, insignias y navegación.
6. Ejecutar `npm test` y todas las pruebas de [06-PLAN-DE-PRUEBAS.md](06-PLAN-DE-PRUEBAS.md).
7. Probar especialmente con dos cuentas distintas de la plataforma (o una cuenta y el administrador de prueba) en el mismo navegador.
8. Publicar y registrar el cambio en [07-HISTORIAL-DE-CAMBIOS.md](07-HISTORIAL-DE-CAMBIOS.md).

## Situación técnica actual

El catálogo `UNIT_CATALOG` utiliza un contrato versionado y centraliza metadatos, dispositivos, capacidades, laboratorios, rangos de finalización, insignias y adaptadores de U1/U2/U3. La aplicación valida automáticamente el catálogo antes de iniciar.

U1, U2 y U3 comparten motores de PC, núcleo IOS, renderizadores `show`, evaluación visual, listas, carga, restauración y reinicio. U3 añade el intérprete de router, subinterfaces 802.1Q, rutas conectadas y ping entre subredes.

El guardado local usa un formato común identificado por usuario, unidad y laboratorio. `lab_drafts`, en la base SQLite del servidor, conserva un borrador remoto por estudiante y laboratorio. `COURSE_CATALOG` agrupa las unidades publicadas por ruta y módulo, y los adaptadores de sesión gestionan apertura, guardado, recuperación, reinicio y enfoque.

El servidor Node (`server/`) expone la API en `/api`, guarda el progreso en SQLite y valida el acceso contra la plataforma AulaSimple (SSO desde la tarjeta o correo y contraseña de la plataforma). Los detalles están en [01-ARQUITECTURA.md](01-ARQUITECTURA.md) y [05-MODELO-DE-DATOS.md](05-MODELO-DE-DATOS.md).

## Siguiente evolución recomendada

U3 está implementada en los índices 12–17. U4 comenzará en 18: se debe registrar su rango en `published_labs` **solo al tenerla completa**. La ruta futura CCNP o NSE 4 reutiliza el selector de cursos, pero necesitará contenidos y un intérprete propio para FortiOS.

La plantilla incluida describe el contrato obligatorio para nuevas unidades.

## Decisiones que no deben cambiar accidentalmente

- Seis laboratorios por unidad es la convención actual, no una restricción del producto.
- Los índices son globales: U1 usa 0–5, U2 usa 6–11 y U3 reserva 12–17.
- Una insignia representa una unidad completa, no una tarea o laboratorio.
- El ranking y el XP de inicio suman todas las unidades.
- El avance mostrado se calcula por laboratorios validados, no por objetivos preparados en la terminal.
- Una validación repetida no vuelve a entregar XP.
