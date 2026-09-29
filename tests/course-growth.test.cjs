const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname, '../dist/app.js'), 'utf8');
const extract = (start, end) => source.slice(source.indexOf(start), source.indexOf(end, source.indexOf(start)));

const calls = [];
const futureUnit = { number: 4, completionStart: 18, labs: [{}, {}], adapters: {
  saveDraft: async () => calls.push('save-4'),
  restoreDraft: (draft, index) => calls.push(['restore-4', index])
}, loadLab: index => calls.push(['load-4', index]) };
const legacyUnit = { number: 2, completionStart: 6, labs: [{}, {}], adapters: {
  restoreDraft: (draft, index) => calls.push(['restore-2', index])
}, loadLab: index => calls.push(['load-2', index]) };
let drafts = [];
const context = {
  authSession: { user: { id: 'example-user' } }, restoringDraft: false, currentUnit: 4,
  activeCourseId: 'cisco-ccna-200-301-v2', completedLabs: new Set(), UNIT_CATALOG: [legacyUnit, futureUnit],
  unitByNumber: number => number === 4 ? futureUnit : legacyUnit,
  unitForCompletionIndex: index => index >= 18 ? futureUnit : legacyUnit,
  courseForUnit: unit => ({ id: unit === futureUnit ? 'future-route' : 'cisco-ccna-200-301-v2' }),
  apiRequest: async path => path === '/drafts' ? drafts : null,
  unitIsComplete: () => false, isLabComplete: () => false,
  showUnitsHome: () => calls.push('home')
};
vm.createContext(context);
vm.runInContext(extract('async function saveDraft()', 'function restoreU1RemoteDraft(') +
  extract('async function restoreRemoteDraft()', 'function authMessage('), context);

(async () => {
  await context.saveDraft();
  assert.deepEqual(calls.splice(0), ['save-4']);

  drafts = [{ lab_index: 18, updated_at: '2026-09-26T10:00:00Z' },
    { lab_index: 7, updated_at: '2026-09-26T12:00:00Z' },
    { lab_index: 6, updated_at: '2026-09-25T12:00:00Z' }];
  await context.restoreRemoteDraft();
  assert.deepEqual(calls.splice(0), [['restore-2', 1]]);
  assert.equal(context.restoringDraft, false);

  context.completedLabs.add(7);
  await context.restoreRemoteDraft();
  assert.deepEqual(calls.splice(0), [['restore-4', 0]]);
  assert.equal(context.activeCourseId, 'future-route');

  drafts = [];
  await context.restoreRemoteDraft();
  assert.deepEqual(calls.splice(0), [['load-2', 0], 'home']);
  assert.equal(context.restoringDraft, false);
  console.log('Rutas y borradores: pruebas correctas');
})().catch(error => { console.error(error); process.exitCode = 1 });
