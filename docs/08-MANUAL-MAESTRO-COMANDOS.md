# Manual maestro de comandos — eClassVirtual Network Lab

Versión: 26-09-2026. Base para U4 y siguientes, derivada de los intérpretes de U1–U3. Este es un **simulador educativo**, no una implementación completa de Cisco IOS. «Actual» significa que el comando está reconocido en el proyecto hoy; «requisito futuro» exige programación y pruebas antes de anunciarlo.

## 1. Contrato común de la terminal

- Cada dispositivo conserva running-config, startup-config, modo, contexto e historial de comandos independientes. Cambiar de SW1 a SW2 o R1 no reinicia sus configuraciones. Salir y volver restaura el borrador de ese alumno aunque no haya escrito `wr`.
- `↑` y `↓` recorren el historial del dispositivo actual. Enter ejecuta. El prompt identifica equipo y modo; la línea mostrada conserva lo que escribió el estudiante, aun cuando el intérprete expanda una abreviación.
- Las palabras clave se comparan sin distinguir mayúsculas; parámetros, rangos e interfaces se validan. No se crean puertos inexistentes. Un comando erróneo o escrito en el modo incorrecto no cambia estado.
- `end` regresa a privilegiado; `exit` sube un nivel; `no ...` revierte el aspecto especificado. `wr`/`copy run start` guardan solamente el equipo activo, no toda la topología. `erase startup-config` no borra running-config.
- Los objetivos evalúan estado y verificaciones reales, no una cadena en el historial. `show` consulta configuración (y puede dejar registro de una verificación de misión) sin reconfigurar el equipo.

| Equipo | Modo | Prompt ejemplo | Entrada/salida |
|---|---|---|---|
| Switch/router | Usuario | `SW1>` / `R1>` | `enable` a privilegiado. |
| Switch/router | Privilegiado | `SW1#` / `R1#` | `configure terminal` a global; `disable` a usuario. |
| Switch/router | Global | `SW1(config)#` / `R1(config)#` | `interface` a interfaz; `exit` a privilegiado. |
| Switch | VLAN | `SW1(config-vlan)#` | `name`; `exit` a global. |
| Switch/router | Interfaz | `SW1(config-if)#` / `R1(config-if)#` | `exit` a global; `end` a privilegiado. |
| PC virtual | PC | `PC1>` | Sintaxis propia, sin modos IOS. |

## 2. Signo de interrogación y abreviaciones

La consulta `?` nunca debe ejecutar ni modificar configuración. `help` muestra ayuda general. La ayuda debe respetar **equipo, modo, capacidad, prefijo y posición del cursor**; una consulta `show ?` jamás debe incluir `no shutdown`, `copy` o `configure`.

| Entrada | Resultado esperado | Situación actual |
|---|---|---|
| `?` | Raíces válidas en el modo actual. | Switch, R1 y PC tienen ayuda. |
| `sh?` | Completar palabra parcial: `show` si es la única. | **Pendiente de estandarizar**; no garantizarlo en U1–U3. |
| `sh ?` o `show ?` | Solo familia `show`. | Switch muestra próximos términos; R1 muestra comandos completos que empiezan por `show`. |
| `show ip ?` en R1 | Solo `show ip interface brief` y `show ip route`. | Implementado. |
| `show ip int ?` en R1 | Solo `show ip interface brief`. | Implementado. |
| `show interfaces ?` en switch | `status`, `switchport`, `trunk` según capacidades. | Implementado con diferencias por unidad. |
| `interface ?` en switch | Tipo/número de puerto que puede configurarse. | Pista actual; debe adaptarse al inventario de U4. |
| `switchport trunk ?` | Solo términos válidos de trunk. | Ayuda actual; probar casos de múltiples términos. |
| `ip ?` / `ping ?` en PC | Sintaxis IP/prefijo/gateway o destino. | Implementado. |

**Contrato futuro:** `com?` completa la palabra actual y `com ?` pregunta por la palabra/argumento siguiente; filtrar por prefijo, dar parámetros (`<1-4094>`, `<dirección>`, `<máscara>`), mostrar `<cr>` solamente si Enter es válido y no sugerir comandos inexistentes. No confundir la ayuda con el motor ejecutor: deben reconocer el mismo vocabulario. Registrar si el alumno usó `?`/`help` para el cálculo del bono «sin ayudas».

Abreviaciones actuales de referencia:

| Alias | Forma completa | Equipo/modo |
|---|---|---|
| `ena` | `enable` | Switch/R1, usuario. |
| `conf t` | `configure terminal` | Switch/R1, privilegiado. |
| `int gi0/1`, `int g0/1` | `interface GigabitEthernet0/1` | Switch con ese puerto. |
| `int g0/0.10` | `interface GigabitEthernet0/0.10` | R1. |
| `sw mo tr` | `switchport mode trunk` | Interfaz de switch. |
| `sh vlan br` | `show vlan brief` | Switch. |
| `sh int tr` | `show interfaces trunk` | Switch. |
| `sh run` | `show running-config` | Switch/R1. |
| `sho ip int br` | `show ip interface brief` | R1. |
| `encap dot1q 10` | `encapsulation dot1Q 10` | Subinterfaz de R1. |
| `ip add 192.168.10.1 255.255.255.0` | `ip address ...` | Interfaz de R1. |
| `no shut` | `no shutdown` | Interfaz. |
| `wr`, `copy run start` | `write memory`, `copy running-config startup-config` | Privilegiado. |

Las longitudes mínimas varían: `configure` requiere al menos `conf`, `interface` al menos `int`, `shutdown` al menos `shut`, `show` al menos `sh`. El intérprete actual define abreviaturas por instrucción; **no** ofrece un analizador IOS universal. Rechazar prefijos ambiguos, sin escoger un comando arbitrario. Cada alias nuevo exige prueba positiva y prueba de ambigüedad.

## 3. Switches — núcleo común U1/U2/U3

| Modo | Comando canónico | Resultado |
|---|---|---|
| Usuario | `enable` | Accede a privilegiado. |
| Privilegiado | `configure terminal`, `disable`, `exit` | Cambia modo. |
| Global | `hostname SW1` | Define hostname alfanumérico o con guiones. |
| Global/VLAN | `vlan 10` | Crea/abre VLAN 1–4094 y entra a `config-vlan`. |
| VLAN | `name USERS` | Nombre de hasta 32 caracteres; se muestra en mayúsculas. |
| Global/VLAN | `no vlan 30` | Borra VLAN existente; VLAN 1 no se borra. |
| Global/VLAN/interfaz | `interface gi0/1` | Entra a un puerto existente. |
| Interfaz | `description Enlace a PC1`, `no description` | Define/borra descripción. |
| Interfaz | `switchport mode access` | Puerto access. |
| Interfaz | `switchport access vlan 10` | Asigna ID 1–4094; crear VLAN aparte si se exige. |
| Interfaz | `switchport mode trunk` | Puerto trunk. |
| Interfaz | `shutdown`, `no shutdown` | Apaga/habilita administrativamente. |
| Global | `default interface gi0/1` | Restaura ese puerto al estado inicial. |

**Puertos reales del simulador:** Gi0/1 y Gi0/2 según la topología; SW1 de U3 dispone además de Gi0/3. El intérprete de U1/U2 no debe presumir la existencia de Gi0/3. No equivale a soportar cualquier modelo Cisco.

Ampliaciones trunk disponibles en U2 y SW1 de U3 (en modo interfaz):

| Comando | Efecto |
|---|---|
| `switchport trunk allowed vlan 10,20,99` | Reemplaza lista permitida; IDs 1–4094 separados por comas. |
| `switchport trunk allowed vlan add 99` | Añade sin duplicar. |
| `no switchport trunk allowed vlan` | Restaura lista sin restricción. |
| `switchport trunk native vlan 99` | Define VLAN nativa. |
| `no switchport trunk native vlan` | Restablece nativa a VLAN 1. |

La VLAN permitida no crea la VLAN. `no vlan 30` elimina definición VLAN; `no switchport trunk allowed vlan` restablece lista en un puerto, **no** elimina VLAN. U1 tiene `switchport mode trunk` en el núcleo, pero no todos los comandos de nativa/permitidas.

### Consultas y guardado de switch

| Modo | Comando | Qué muestra / hace |
|---|---|---|
| Usuario/privilegiado | `show vlan brief` | VLAN y puertos access asociados. |
| Usuario/privilegiado | `show interfaces status` | Estado y modo/VLAN de puertos. |
| Usuario/privilegiado | `show interfaces switchport` | Modo y VLAN; U2/U3 incluyen nativa y permitidas. |
| Usuario/privilegiado | `show interfaces trunk` | Trunks; U2/U3 incluyen nativa y permitidas. |
| Privilegiado | `show running-config` / `show run` | Configuración activa. |
| Privilegiado | `show running-config interface gi0/1` | Configuración activa del puerto. |
| Privilegiado | `show startup-config` / `show start` | Última configuración guardada, si existe. |
| Privilegiado | `write memory` / `wr` | Copia running a startup del switch activo. |
| Privilegiado | `copy running-config startup-config` / `copy run start` | Mismo guardado simulado. |
| Privilegiado | `erase startup-config` / `write erase` | Borra solo startup del switch activo. |

El switch admite `do` **para consultas `show`** en modos de configuración; no prometer `do` para cualquier comando. Para una misión «guardar ambos switches» hay que guardar primero SW1 y luego SW2 (o viceversa), y verificar cada `show startup-config`.

## 4. R1 — router de U3

**Actual:** interfaz física `GigabitEthernet0/0` y subinterfaces `GigabitEthernet0/0.<VLAN>` con VLAN 1–4094. `g0/0`, `gi0/0` y forma completa se normalizan; no se admiten interfaces físicas arbitrarias.

| Modo | Comando | Resultado |
|---|---|---|
| Usuario | `enable` | Accede a privilegiado. |
| Privilegiado | `disable`, `configure terminal` | Cambia modo. |
| Global | `hostname R1` | Cambia nombre. |
| Global/interfaz | `interface g0/0` | Entra a interfaz física. |
| Global/interfaz | `interface g0/0.10` | Crea/entra a subinterfaz. |
| Subinterfaz | `encapsulation dot1Q 10` | Asigna etiqueta 802.1Q; **no** escribir `vlan` entre palabras. |
| Subinterfaz | `no encapsulation dot1Q` | Quita encapsulación. |
| Interfaz | `ip address 192.168.10.1 255.255.255.0` | Configura IPv4 y máscara. |
| Interfaz | `ip address 192.168.10.1/24` | Forma CIDR alternativa. |
| Interfaz | `no ip address` | Quita IP y máscara. |
| Interfaz | `shutdown`, `no shutdown` | Estado administrativo; **habilitar G0/0** para Router-on-a-Stick. |
| Consulta | `show ip interface brief` | IP y estado administrativo/operativo. |
| Consulta | `show ip route` | Rutas conectadas cuando las subinterfaces están operativas. |
| Consulta | `show running-config` / `sh run` | Running del R1. |
| Consulta | `show running-config interface g0/0.10` | Running de la interfaz indicada. |
| Consulta | `show startup-config` | Último guardado de R1, si existe. |
| Privilegiado | `wr`, `write memory`, `copy run start` | Copia running a startup de R1. |
| Privilegiado | `erase startup-config`, `write erase` | Borra startup de R1. |

**Límite actual:** el intérprete de R1 permite varios `show` aun en modos donde el switch los restringe. Tampoco admite `do show` de forma uniforme. Alinear permisos y ayuda de R1 y switch queda pendiente, no se debe describir como ya corregido. R1 no implementa `show vlan`, `switchport`, DHCP, rutas estáticas, OSPF ni ACL.

Ejemplo comprobable de sintaxis (asumiendo VLAN 10/20, SW1 y PC correctamente configurados):

```text
ena
conf t
int g0/0
no shut
int g0/0.10
encap dot1q 10
ip add 192.168.10.1 255.255.255.0
int g0/0.20
encap dot1q 20
ip add 192.168.20.1 255.255.255.0
end
sho ip int brief
sh ip route
sh run
copy run start
show startup-config
```

Las rutas conectadas requieren IP/máscara, dot1Q, subinterfaz activa y G0/0 activa. Para ping entre VLAN también se necesitan VLAN access, trunk, IP y gateway de los PC.

## 5. PC virtual (necesario para pruebas de switch/router)

| Comando | Resultado |
|---|---|
| `ip 192.168.10.10/24 192.168.10.1` | IP/prefijo y gateway obligatorio. |
| `ip 192.168.10.10 255.255.255.0 192.168.10.1` | Equivalente con máscara decimal. |
| `ip dns 8.8.8.8` | Define DNS simulado. |
| `show ip` / `sh ip` | Muestra IP/máscara/gateway/DNS. |
| `clear ip` | Limpia IPv4. |
| `ping 192.168.20.20` | Evalúa conectividad según estado de la topología. |
| `?`, `help`, `ip ?`, `ping ?` | Ayuda general/contextual. |

`ip` de PC no es `ip address` de R1. Las instrucciones usan IP completas (`192.168.20.10`, no `.20.10`).

## 6. Ampliación para U4 y posteriores

| Familia | Estado |
|---|---|
| Modos, ayuda, historial, guardado por dispositivo, VLAN y comandos anteriores | Contrato heredado obligatorio; mantener regresiones de U1–U3. |
| STP, EtherChannel, port-security, DHCP, ACL, rutas estáticas, OSPF, NAT | **No implementados**. Solo agregar si la unidad los necesita, con estado, comandos, ayuda y pruebas. |
| Tab/autocompletado, todo IOS real, mismo formato visual de `show ?` para todos los equipos | **No garantizados**. No anunciar sin desarrollo específico. |

### Ficha obligatoria de cada familia nueva

```text
Propósito y capacidad:
Equipo(s), interfaces y modos válidos:
Comandos completos y parámetros (rangos, valores por defecto):
Abreviaciones admitidas y ambigüedades:
Ayuda: ?, prefijo?, comando ? y parámetros sucesivos:
Estado modificado; comandos no/default que lo revierten:
Salidas de show, running-config y startup-config:
Efecto en topología, ping y objetivos:
Borrador, recarga y guardado independiente por equipo:
Errores: incompleto, modo equivocado, ambigüedad, valor inválido:
Pruebas positivas/negativas y regresiones de U1–U3:
```

### Pruebas mínimas por unidad

1. Probar `?`, `show ?`, prefijos y `comando ?` por modo/dispositivo; nunca mezclar familias. Confirmar que ayuda no configura y que se registra para XP cuando corresponda.
2. Ejecutar forma completa y todos los alias documentados; rechazar abreviaturas ambiguas, comandos incompletos, interfaces inexistentes y valores fuera de rango sin alterar estado.
3. Aplicar comando y `no`/`default`, comprobar `show`, `show running-config` y objetivos. Comparar running/startup antes y después de `wr` o `copy run start` en **cada dispositivo**.
4. Cambiar dispositivo, misión, unidad y pestaña; restaurar configuración e historial en el usuario correcto. Un usuario nuevo comienza sin progresos.
5. Probar ping exitoso y fallos por VLAN, trunk, gateway, IP, encapsulación, estado administrativo o ruta según la topología.
6. Validar misión una sola vez, XP idempotente, desbloqueo del siguiente laboratorio e insignia únicamente al completar toda la unidad.

Complementos obligatorios: [Cómo crear una unidad](02-CREAR-NUEVA-UNIDAD.md), [Contrato funcional](03-CONTRATO-FUNCIONAL.md) y [Plan de pruebas](06-PLAN-DE-PRUEBAS.md). Al agregar U4, actualizar este manual y el historial de cambios en el mismo cambio.
