# Plan de pruebas

## Matriz obligatoria por laboratorio

| Caso | Resultado esperado |
|---|---|
| Abrir laboratorio desbloqueado | Carga misión y estado inicial correctos |
| Abrir laboratorio bloqueado | No permite entrar |
| Cumplir un objetivo | Se marca solamente ese objetivo |
| Preparar todos los objetivos | Habilita validar, pero no aumenta avance aún |
| Validar | Registra finalización, XP y muestra diálogo |
| Revalidar | No duplica XP |
| Siguiente desafío | Abre y desbloquea el siguiente laboratorio |
| Reiniciar | Restaura el estado inicial y suma intento |
| Usar ayuda | Persiste `used_help` y no entrega el bono correspondiente |

## Controlador visual compartido

- Confirmar que cada objetivo se evalúe una sola vez por actualización.
- Comprobar que el botón se habilite solamente cuando todos los objetivos estén listos.
- Confirmar que el aviso de configuración completa aparezca una vez y vuelva a habilitarse si un objetivo deja de cumplirse.
- Verificar contador, porcentaje, bloqueo secuencial y estado completado en U1, U2 y U3.
- Verificar título, subtítulo, misión e instrucciones del primer laboratorio y del integrador de cada unidad.

## Terminal y dispositivos

- Probar comandos completos y abreviados.
- Probar las transiciones `enable`, `configure terminal`, `disable`, `end` y `exit` en U1, U2 y U3.
- Probar `?`, comandos incompletos e inválidos en cada modo.
- Probar `no vlan` desde config y config-vlan.
- Probar flechas arriba/abajo en cada dispositivo.
- Configurar SW1, cambiar a SW2 y confirmar que ambos estados son independientes.
- Volver a SW1 y comprobar que su configuración permanece.
- Guardar solo SW1 y confirmar que el objetivo de ambos switches sigue pendiente.
- Guardar SW2 y confirmar que el objetivo se completa.
- Verificar running-config y startup-config por separado.
- Verificar que `show vlan brief` muestre solo puertos access y ordene las VLAN por ID.
- Verificar en U2 que `show interfaces trunk`, `show interfaces switchport` y `show run interface` incluyan VLAN nativa y permitidas.
- Confirmar que ejecutar los comandos `show` requeridos marque las observaciones del laboratorio correspondiente.
- Confirmar que las extensiones trunk de U2 no modifiquen el estado del otro switch.
- En U3, confirmar que SW1 y R1 conservan configuraciones, startup-config e historiales independientes al alternar dispositivos.
- Probar creación y corrección de subinterfaces, `encapsulation dot1Q`, direcciones de gateway, `show ip interface brief` y `show ip route`.
- Probar en R1 `ena`, `conf t`, `int gi0/0.10`, `encap dot1q 10`, `ip add`, `no shut`, `sho ip int brief`, `sh run`, `copy run start` y `wr`; confirmar el mismo estado que con los comandos completos.
- Confirmar que el integrador explique `no shutdown` en G0/0 y `encapsulation dot1Q 30/40`, y que ambos sean objetivos independientes.
- Confirmar que un ping entre subredes falla si falta VLAN, trunk, subinterfaz, encapsulación, gateway o `no shutdown`.

## Motor compartido de PC

- Probar `ip <dirección>/<prefijo> <gateway>` en U1, U2 y U3.
- Probar `ip <dirección> <máscara> <gateway>` en U1, U2 y U3.
- Rechazar dirección inválida, prefijo inválido, máscara no contigua, gateway ausente y argumentos adicionales.
- Probar `ip dns`, `show ip`, `clear ip`, `?` y `help` en ambas unidades.
- Confirmar que un ping solo sea exitoso cuando la evaluación de conectividad propia de la unidad lo permita.
- Confirmar que el prompt muestre correctamente PC, modo usuario, privilegiado, configuración, VLAN e interfaz.

## Persistencia

1. Escribir varios comandos y configurar parcialmente un laboratorio.
2. Cambiar de dispositivo.
3. Volver al inicio.
4. Ir a otra unidad.
5. Recargar la página.
6. Volver al laboratorio.
7. Confirmar estado, dispositivo, historial, intentos y ayudas.

## Carga y reinicio compartidos

- Recuperar un borrador parcial de U1, U2 y U3 mediante el controlador común.
- Reiniciar y confirmar que desaparezcan solamente los cambios de la misión actual.
- Confirmar que cada reinicio incremente exactamente un intento.
- Confirmar que el estado inicial usado por reinicio no sea el borrador recuperado.
- Intentar abrir un laboratorio secuencial bloqueado y confirmar que no cambien índice ni estado.
- Cambiar entre laboratorios y verificar que los borradores permanezcan aislados por unidad e índice.

## Cuenta y aislamiento — regresión crítica

1. Iniciar sesión como usuario A y completar laboratorios.
2. Cerrar sesión.
3. Entrar como usuario B en el mismo navegador, con otra cuenta de la plataforma que nunca haya usado la app (o con el administrador de prueba, si aún no tiene progreso). La app no crea cuentas.
4. Confirmar para B: 0 XP, 0 laboratorios, 0 unidades e insignias bloqueadas.
5. Volver a A y confirmar que conserva solamente su propio progreso.

## Inicio global

- XP coincide con la suma de `lab_completions` del usuario.
- Laboratorios terminados suman todas las unidades.
- Cada porcentaje usa finalizaciones de su propia unidad.
- La insignia aparece solo al completar todos los laboratorios de la unidad.
- El ranking refleja `student_profiles.total_xp`.
- “Continuar aprendizaje” dirige al primer laboratorio pendiente correcto.

## Prueba específica de una unidad nueva

- `validateUnitCatalog()` acepta el catálogo correcto.
- Rechaza IDs, números o códigos duplicados, campos obligatorios incompletos y rangos superpuestos.
- `completionEnd` coincide con `completionStart + labs.length`.
- Los historiales se crean desde `devices` y las extensiones consultan `capabilities`.
- Sus índices no se superponen con unidades existentes.
- La API acepta borradores y finalizaciones de todos sus índices (su migración los publicó en `published_labs`).
- La última finalización concede la insignia nueva.
- U1, U2 y U3 conservan comportamiento, XP y datos existentes.
- Las direcciones, prefijos y gateways se muestran completos.

## Pruebas automáticas

Ejecutar `npm test` (`node --test`). Incluye las pruebas del catálogo de cursos, de rutas y borradores para unidades futuras y de la ayuda contextual de R1. Además, `tests/sso.test.mjs` levanta una plataforma simulada y verifica SSO de un solo uso, login contra la plataforma, administrador de prueba, misma persona por las dos puertas, XP idempotente, cierre de sesión y persistencia tras reiniciar el servidor.

## Criterio de publicación

No publicar si falla `npm test` o una prueba crítica de aislamiento, idempotencia de XP, restauración del borrador, independencia de dispositivos o compatibilidad con U1/U2.
