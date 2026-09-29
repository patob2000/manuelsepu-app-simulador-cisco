const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync(require('node:path').join(__dirname, '../dist/app.js'), 'utf8');
const start = source.indexOf('const COURSE_CATALOG=');
const end = source.indexOf('function completionIndexFor(', start);
assert(start >= 0 && end > start);
const units = [{ id: 'unit-1' }, { id: 'unit-2' }, { id: 'unit-3' }];
const context = { UNIT_CATALOG: units };
vm.createContext(context);
vm.runInContext(source.slice(start, end) + '\nglobalThis.catalog=COURSE_CATALOG;', context);

const course = context.catalog[0];
assert.equal(course.examVersion, '200-301 v2.0');
assert.deepEqual(Array.from(course.modules[0].unitIds), units.map(unit => unit.id));
assert.throws(() => context.validateCourseCatalog(context.catalog, [...units, { id: 'unit-4' }]), /sin curso/);
assert.throws(() => context.validateCourseCatalog([{ ...course, modules: [{ ...course.modules[0], unitIds: ['unit-1', 'unit-1'] }] }], units), /repetida/);
const fortinet = { id: 'fortinet-nse-4', vendor: 'fortinet', title: 'Fortinet NSE 4', examVersion: 'FortiOS', modules: [{ id: 'fortigate', title: 'FortiGate', unitIds: ['fortinet-1'] }] };
context.validateCourseCatalog([course, fortinet], [...units, { id: 'fortinet-1' }]);
console.log('Catálogo CCNA: unidades y asignaciones válidas');
