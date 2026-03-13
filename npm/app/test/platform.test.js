const test = require('node:test');
const assert = require('node:assert/strict');
const packageJson = require('../package.json');

const { selectAdapter } = require('../dist/platform');
const { createUnsupportedAdapter } = require('../dist/platform/unsupported');

test('selectAdapter chooses mac adapter for darwin', () => {
  assert.equal(selectAdapter('darwin').kind, 'mac');
});

test('selectAdapter chooses windows adapter for win32', () => {
  assert.equal(selectAdapter('win32').kind, 'win');
});

test('package publishes as a single cross-platform package', () => {
  assert.equal(packageJson.optionalDependencies, undefined);
});

test('unsupported adapter throws clear runtime errors', async () => {
  const adapter = createUnsupportedAdapter('linux');

  await assert.rejects(
    adapter.getWindowById(1),
    /unsupported platform "linux"/i
  );
  await assert.rejects(
    adapter.focusWindow(1),
    /supports macOS and Windows only/i
  );
});
