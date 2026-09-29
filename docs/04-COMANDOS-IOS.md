# Comandos soportados

Para especificar unidades nuevas, usar el [manual maestro de comandos](08-MANUAL-MAESTRO-COMANDOS.md), que incluye modos, `?`, abreviaciones, contratos de ampliación y pruebas. Esta página conserva la lista rápida de comandos actuales.

Esta lista describe el simulador actual. Una unidad nueva debe reutilizar estos comandos y documentar cualquier ampliación.

## Modos

| Modo | Prompt típico | Entrada/salida |
|---|---|---|
| Usuario | `SW1>` | `enable`, `exit` |
| Privilegiado | `SW1#` | `configure terminal`, `disable`, `exit` |
| Configuración | `SW1(config)#` | `vlan`, `interface`, `hostname`, `end`, `exit` |
| VLAN | `SW1(config-vlan)#` | `name`, `vlan`, `no vlan`, `end`, `exit` |
| Interfaz | `SW1(config-if)#` | `switchport`, `description`, `shutdown`, `end`, `exit` |

Se aceptan abreviaciones como `ena`, `conf t`, `sh run` y `int gi0/1` cuando cada palabra alcanza la longitud mínima no ambigua definida por el simulador.

## Configuración de switch

```text
enable
configure terminal
hostname <nombre>
vlan <1-4094>
name <nombre>
no vlan <id>
interface GigabitEthernet0/1
interface gi0/1
switchport mode access
switchport access vlan <id>
switchport mode trunk
switchport trunk allowed vlan 10,20,99
switchport trunk allowed vlan add 99
switchport trunk native vlan 99
no switchport trunk allowed vlan
no switchport trunk native vlan
description <texto>
no description
shutdown
no shutdown
default interface gi0/1
end
exit
disable
```

`no vlan <id>` funciona desde configuración global y desde modo VLAN. VLAN 1 no puede eliminarse.

## Verificación

```text
show vlan brief
show interfaces status
show interfaces switchport
show interfaces trunk
show running-config
show startup-config
show running-config interface gi0/1
```

Según el modo, los comandos operativos también pueden ejecutarse con `do`.

## Guardado y borrado

```text
write memory
wr
copy running-config startup-config
copy run start
erase startup-config
write erase
```

En U2 el guardado pertenece al switch activo. Para cumplir “Guardar ambos switches”, hay que guardar en SW1 y luego en SW2.

## Router de U3

```text
enable
configure terminal
interface GigabitEthernet0/0
no shutdown
interface GigabitEthernet0/0.10
encapsulation dot1Q 10
no encapsulation dot1Q
ip address 192.168.10.1 255.255.255.0
ip address 192.168.10.1/24
no ip address
show ip interface brief
show ip route
show running-config
show running-config interface g0/0.10
show startup-config
wr
copy running-config startup-config
erase startup-config
```

En U3, SW1 y R1 guardan sus configuraciones por separado. Las rutas conectadas aparecen cuando la subinterfaz tiene dirección, encapsulación dot1Q y la interfaz física G0/0 está habilitada.

R1 acepta abreviaciones habituales como `ena`, `conf t`, `int g0/0.30`, `encap dot1q 30`, `ip add 192.168.30.1 255.255.255.0`, `no shut`, `sho ip int brief`, `sh run`, `copy run start` y `wr`. La sintaxis de encapsulación no lleva la palabra `vlan`: se escribe `encapsulation dot1Q 30`.

El integrador de U3 parte desde R1 con G0/0 deshabilitada. Primero se ejecuta `no shutdown` en G0/0; luego se configura `encapsulation dot1Q` y la IP de gateway en cada subinterfaz.

## PC virtual

```text
ip 192.168.10.10/24 192.168.10.1
ip 192.168.10.10 255.255.255.0 192.168.10.1
ip dns 8.8.8.8
show ip
clear ip
ping 192.168.10.20
```

El formato requerido siempre incluye gateway. `?` y `help` muestran la ayuda disponible.

## Al ampliar comandos

Cada comando nuevo necesita:

- modos donde es válido;
- abreviaciones aceptadas;
- ayuda contextual;
- mensajes de comando incompleto e inválido;
- mutación exacta del estado;
- salida de `show running-config` y, si corresponde, startup-config;
- serialización en borradores;
- pruebas positivas, negativas y de restauración.
