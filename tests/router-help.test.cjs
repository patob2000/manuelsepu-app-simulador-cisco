const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync(require('node:path').join(__dirname, '../dist/app.js'), 'utf8');
const extract = (start, end) => source.slice(source.indexOf(start), source.indexOf(end, source.indexOf(start)));
const lines = [];
const context = {
  u3State: { router: { mode: 'priv' } },
  u3Line: line => lines.push(line),
  u3Prompt: () => 'R1#',
  expandU3RouterCommand: raw => raw,
  u3ExecuteRouter: () => { throw new Error('La ayuda contextual no debe ejecutar el comando'); }
};
vm.createContext(context);
vm.runInContext(extract('function u3RouterHelp(', 'function u3RouterInterfaceConfig(') +
  extract('function u3ExecuteRouterWithAbbreviations(', 'function u3Execute(raw)'), context);

function help(command) {
  lines.length = 0;
  context.u3ExecuteRouterWithAbbreviations(command);
  return lines.slice(1).map(line => line.trim());
}

assert(help('show ?').length > 0);
assert(help('show ?').every(line => line.startsWith('show ')));
assert(help('sh ?').every(line => line.startsWith('show ')));
assert.deepEqual(help('show ip ?'), ['show ip interface brief', 'show ip route']);
assert.deepEqual(help('show ip int ?'), ['show ip interface brief']);
assert(help('show running-config ?').every(line => line.startsWith('show running-config')));
assert(help('?').some(line => line.startsWith('copy ')));
assert(!help('show xyz ?').some(line => line.startsWith('show ')));
assert.equal(context.u3UsedHelp, true);
console.log('Ayuda contextual de R1: pruebas correctas');
