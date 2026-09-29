/*
 * Plantilla canónica para U4 y posteriores.
 * Copia esta definición junto al catálogo, completa los TODO y deja que
 * defineUnit() y validateUnitCatalog() apliquen el contrato compartido.
 */

const UNIT_4_LABS = [
  {
    code: 'LAB-401',
    title: 'TODO: primer laboratorio',
    type: 'Guiado',
    subtitle: 'TODO: explicación breve',
    mission: 'TODO: instrucción completa y verificable.',

    setup(state) {
      // Preparar solamente lo que el laboratorio entrega de antemano.
      return state;
    },

    goals: [
      {
        label: 'TODO: objetivo visible',
        detail: 'TODO: valor exacto esperado',
        test(state) {
          // Comprobar el estado final, no el texto de un comando.
          return Boolean(state);
        }
      }
    ]
  }

  // TODO: agregar los demás laboratorios, incluido el integrador.
];

// El inicio del rango se deriva del final de la unidad anterior.
// Ejemplo actual: U3 termina en 18, por lo tanto U4 comienza en 18.
const PREVIOUS_UNIT_END = 18;

const UNIT_TEMPLATE = defineUnit({
  id: 'unit-4',
  number: 4,
  title: 'TODO: título de la unidad',
  description: 'TODO: resultado de aprendizaje',
  emptyState: 'Nueva',
  featured: false,
  sequential: true,
  afterLast: 'home',

  completionStart: PREVIOUS_UNIT_END,
  devices: ['SW1', 'PC1', 'PC2'],
  capabilities: [
    'ios',
    'switching',
    'access-vlan',
    'ipv4',
    'ping',
    'startup-config'
    // TODO: agregar 'trunk', 'routing', 'stp', 'dhcp' u otras capacidades.
  ],

  badge: {
    icon: '🎓',
    name: 'Unidad 4 completada',
    detail: 'TODO: tema de la unidad'
  },

  labs: UNIT_4_LABS,

  adapters: {
    open() {
      // TODO: abrir la vista y cargar/restaurar la misión activa.
    },
    loadLab(index) {
      // TODO: cargar y restaurar UNIT_4_LABS[index].
      return index;
    }
  }
});

// Agrega 'unit-4' en un módulo de COURSE_CATALOG antes de validar el catálogo.
// U4 debe tener una vista <main id="unit4View" data-unit-view hidden>.
// Registra la sesión después de implementar el intérprete y el guardado propios:
// registerUnitSession('unit-4', {
//   viewId: 'unit4View', terminalDialect: 'ios',
//   saveDraft: saveUnit4Draft, restoreDraft: restoreUnit4RemoteDraft,
//   reset: resetUnit4, focus: () => document.getElementById('u4Input').focus()
// });
// El nuevo rango se inserta en published_labs SOLO al publicar la unidad.

const UNIT_INTEGRATION_CHECKLIST = Object.freeze([
  'validateUnitCatalog acepta el catálogo completo',
  'Índices publicados en published_labs antes de activar la unidad',
  'Unidad asignada a un curso, módulo y adaptadores de sesión completos',
  'Tarjeta y progreso derivados desde la definición',
  'Borradores aislados por usuario y laboratorio',
  'Estado e historial independientes por dispositivo',
  'ArrowUp y ArrowDown funcionan en todos los dispositivos',
  'XP entregado por POST /api/completions e idempotente',
  'Diálogo de éxito en cada laboratorio',
  'Insignia solo al completar la unidad',
  'Ranking y totales incluyen la unidad',
  'Direcciones IP y gateways se muestran completos',
  'Regresión completa de unidades anteriores aprobada'
]);

if (typeof module !== 'undefined') module.exports = { UNIT_4_LABS, UNIT_TEMPLATE, UNIT_INTEGRATION_CHECKLIST };
