# Ruta Cisco CCNA 200-301 v2.0 — cobertura completa

Estado: planificación curricular, 26 de septiembre de 2026. Primer examen v2.0 anunciado para el **3 de febrero de 2027**. Fuentes: [temario oficial de Cisco v2.0](https://learningcontent.cisco.com/documents/marketing/exam-topics/200-301_CCNA_v2.0_Exam_Topics_PDF.pdf), [temario oficial v1.1](https://learningcontent.cisco.com/documents/marketing/exam-topics/200-301-CCNA-v1.1.pdf) y [comparación facilitada por el usuario](https://www.edutek.edu.gt/blog/ccna-guatemala-2026). Ante diferencias, manda el PDF oficial v2.0. Los códigos y pesos son del programa Cisco; títulos y propuestas didácticas son nuestros.

## Objetivo de producto

Cubrir **todos los objetivos publicados de v2.0**, con una experiencia adecuada al verbo de Cisco: diagnosticar con incidentes, configurar en CLI cuando lo pida, interpretar salidas, y explicar conceptos mediante actividades breves. Un laboratorio virtual no debe inventar capacidades IOS ni presentar teoría evaluada como si fuera configuración real. Tener un laboratorio relacionado con un código no significa que ese objetivo esté cubierto completamente; la cobertura se marca solo tras comprobar sus subpuntos y evaluaciones.

La ruta se modela `curso → módulo → unidad → actividad/laboratorio`. El curso contiene la versión oficial del examen y su matriz de objetivos. Los índices de finalización y XP de U1 (0–5), U2 (6–11) y U3 (12–17) son permanentes. El porcentaje actual del inicio representa **unidades publicadas**: nunca debe titularse «100 % del CCNA» antes de cubrir todos los objetivos. Una futura ruta CCNP podrá compartir bases como requisito o enlace, sin duplicar la finalización ni el XP.

## Dominios oficiales y estado actual

| Dominio v2.0 | Peso | Trabajo actual | Unidades previstas |
|---|---:|---|---|
| 1. Infraestructura y conectividad | 25 % | U1–U3 trabajan IPv4 simple; cobertura completa pendiente. | U4–U6 |
| 2. Switching y acceso | 25 % | U1 VLAN/access, U2 trunk, U3 switch-router; el resto pendiente. | U1–U3, U7–U9 |
| 3. Routing IP | 20 % | U3 introduce rutas conectadas; faltan estáticas, OSPF y FHRP. | U10–U12 |
| 4. Servicios y seguridad | 20 % | Sin cobertura suficiente para declarar objetivos completos. | U13–U16 |
| 5. IA, operaciones y gestión | 10 % | Pendiente. | U17 |

U18 será un integrador transversal de diagnóstico y configuración. Los pesos corresponden al **examen**, no se usarán para adjudicar XP arbitrariamente. U4–U18 son propuestas de planificación: no aparecerán como unidades disponibles ni reservarán índices de base hasta tener misión, estado, comandos, evaluación y persistencia completos.

## Matriz exhaustiva de los objetivos v2.0

### 1. Infraestructura y conectividad · 25 %

| Código | Alcance educativo (paráfrasis del programa) | Actividad prevista | Estado |
|---|---|---|---|
| 1.1 | Diagnóstico de cableado cobre/fibra, errores, colisiones, velocidad, dúplex, distancia, señal, pinout y tipo de cable. | U4: incidentes y salidas de interfaz, medios físicos visuales. | Pendiente |
| 1.2 | Función de hipervisores, VM y contenedores. | U4: decisiones de topología y casos cortos. | Pendiente |
| 1.3 | Solución de fallas IPv4, asignación, subnetting y direcciones públicas/privadas. | U5: cálculo, IP/máscara/gateway y síntomas de subred. | Parcial: U1–U3 configuran IPv4 |
| 1.4 | Solución de fallas IPv6, prefijos, unicast y EUI-64 modificado. | U6: direccionamiento y diagnóstico IPv6. | Pendiente |
| 1.5 | Wi-Fi: bandas/canales, RF, seguridad e interferencia. | U4: diagnósticos conceptuales de clientes/AP. | Pendiente |
| 1.6 | Conectividad de clientes cableados/inalámbricos en Windows, macOS y Linux: IP, alcance y seguridad Wi-Fi. | U4: escenarios con salidas de sistema y causa raíz. | Parcial: PC simulado IPv4/ping |
| 1.7 | Problemas de cliente, servidor y relay DHCPv4 en IOS. | U5: servidor/relay, arrendamiento y diagnóstico. | Pendiente |

### 2. Switching y acceso · 25 %

| Código | Alcance educativo | Actividad prevista | Estado |
|---|---|---|---|
| 2.1.a–b | Conexión entre switches y hacia routers; interfaces L2/L3 y trunks 802.1Q. | U1–U3 + nuevos casos de troubleshooting. | Parcial: U1–U3 |
| 2.1.c | Port-channel/EtherChannel L2/L3 usando **LACP**. | U7: negociación, miembros, fallas, verificación. | Pendiente |
| 2.1.d | SVI, direccionamiento y operatividad. | U7: VLAN de administración e interfaz virtual. | Pendiente |
| 2.2 | Atributos de puertos para escritorio, impresoras, IoT, AP, teléfonos IP, hosts virtualizados y appliances; VLAN, PoE, LACP/port-channel. | U1 y U7: casos por tipo de equipo, limitaciones de PoE y estado de enlace. | Parcial: U1 access |
| 2.3 | Comprobar documentación de red con CDP y LLDP. | U8: vecinos y contraste con diagrama. | Pendiente |
| 2.4 | Diagnóstico L2/L3 con `show` (incluidos logs), ping extendido, traceroute y lectura de captura de paquetes. | U8: fallas guiadas; reutilizar U1–U3. | Parcial: `show` y ping básicos |
| 2.5.a–d | Rapid PVST+: root bridge/puertos/roles/estados, PortFast, root guard, loop guard y BPDU guard. | U9: topología redundante, elección, protecciones y fallo simulado. | Pendiente |

**Corrección del artículo externo:** LACP/EtherChannel **sí aparece** en los puntos 2.1.c y 2.2 del PDF oficial v2.0; no se elimina de esta ruta. Tampoco se infiere que Cisco prohíba Packet Tracer porque no figure como objetivo examinable. Seleccionaremos simulación, imágenes de salida o prácticas complementarias según lo que cada objetivo necesite.

### 3. Routing IP · 20 %

| Código | Alcance educativo | Actividad prevista | Estado |
|---|---|---|---|
| 3.1 | Interpretar next hop, código de protocolo, prefijo, máscara, distancia administrativa, métrica y default. | U10: decisiones de reenvío y lectura de tabla. | Parcial: U3 muestra rutas conectadas |
| 3.2.a–d | Diagnóstico de rutas estáticas IPv4/IPv6: default, red, host y ruta flotante. | U10: topología con al menos dos routers, fallas de next hop y preferencia. | Pendiente |
| 3.3.a–d | OSPFv2 para IPv4 y OSPFv3 para IPv6 en área única; vecinos, punto a punto, broadcast DR/BDR y router ID. | U11: configuración y fallas de vecindad. | Pendiente |
| 3.4 | Interpretar estado operativo de HSRP y VRRP. | U12: diagnóstico y failover; no exigir configuración si el objetivo oficial solo pide interpretar. | Pendiente |

### 4. Servicios y seguridad · 20 %

| Código | Alcance educativo | Actividad prevista | Estado |
|---|---|---|---|
| 4.1 | Usuarios locales y clientes AAA TACACS+/RADIUS para gestión. | U13: acceso administrativo, autenticación y fallas. | Pendiente |
| 4.2 | Gestión de configuraciones/archivos con SFTP/SCP. | U13: transferencia segura simulada y verificación. | Pendiente |
| 4.3 | NAT/PAT en routers IOS XE. | U14: inside/outside, traducciones y diagnóstico. | Pendiente |
| 4.4 | Diagnóstico DNS: A, AAAA, CNAME, MX, NS y PTR. | U14: resolución y registros erróneos, sin convertirlo artificialmente en comando de switch. | Pendiente |
| 4.5 | Conceptos de VPN IPsec remota y sitio a sitio, protocolos y modos. | U14: comparación visual y casos de interpretación. | Pendiente |
| 4.6 | ACL IPv4 estándar, extendida, numerada y nombrada. | U15: órdenes, direcciones, wildcard y validación de tráfico. | Pendiente |
| 4.7.a–e | DHCP snooping, inspección ARP dinámica, storm control, RA guard y port security. | U16: configuración y síntomas L2/IPv6. | Pendiente |

### 5. IA, operaciones y gestión · 10 %

| Código | Alcance educativo | Actividad prevista | Estado |
|---|---|---|---|
| 5.1 | Papel de IA agéntica en operaciones de red. | U17: casos con decisiones, supervisión y límites. | Pendiente |
| 5.2 | Elegir prompts por clasificación de datos, formato, rol e instrucciones. | U17: decisiones de prompt y revisión de salida. | Pendiente |
| 5.3 | Enfoques de gestión: dispositivo, nube, controladores, automatización e infraestructura como código. | U17: escenarios comparativos. | Pendiente |
| 5.4 | Propósito de SNMP en operaciones. | U17: lectura conceptual de monitoreo. | Pendiente |
| 5.5 | Uso de Ansible para ejecutar comandos. | U17: playbook guiado y salida verificable. | Pendiente |
| 5.6 | Interpretación de syslog: mensaje, severidad y facility. | U17: clasificación de eventos e incidente. | Pendiente |

## Secuencia de implementación sin perder avance

1. **Ahora:** curso `cisco-ccna-200-301-v2` y módulo publicado con U1–U3. Mantener XP y badges existentes, identidad de unidad y los índices 0–17. Mostrar «Ruta en construcción»; no entregar una insignia CCNA prematura. El selector admite futuras rutas sin mostrarlas mientras estén vacías.
2. **Antes de cada unidad nueva:** diseño de seis laboratorios *solo si el tema lo justifica*; ficha de comandos y `?` según [manual maestro](08-MANUAL-MAESTRO-COMANDOS.md); topología, estado, objetivos y una migración de SQLite, agregada al final del arreglo de migraciones del servidor, que registre sus índices en `published_labs`. Primero completar contenidos y pruebas, luego publicarla.
3. **Progreso de curso:** `lab_completions` sigue por usuario/índice estable. El progreso de módulo y curso se deriva de unidades publicadas, pero la cobertura de examen se audita por **código oficial** separado, sin atribuir «100 % CCNA» por acabar solo las disponibles.
4. **Actividades no CLI:** disponer de tipos `diagnóstico`, `interpretación`, `decisión visual` y `práctica guiada` cuando corresponda; su evaluación y accesibilidad deben seguir el contrato de guardado, progreso y XP. No simular como IOS comandos que nunca existirían.
5. **Al completar toda v2.0:** verificar matriz 1.1–5.6 con subpuntos, evaluaciones, temario y versión revisados; entonces habilitar insignia de ruta CCNA y porcentajes globales completos.
6. **Cuando exista CCNP:** crear otro curso con módulos propios. Un requisito de repaso puede enlazar a U1–U3 sin duplicar XP; el avance CCNP contabiliza únicamente sus propias unidades.

Esta matriz es un plan de **cobertura**, no contenido ya publicado. Cambios posteriores del blueprint oficial deben actualizar su fecha, versión y mapeo sin reescribir finalizaciones históricas.
