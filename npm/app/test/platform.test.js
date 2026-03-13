const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const packageJson = require('../package.json');

const { selectAdapter } = require('../dist/platform');
const { resolveBundledBinaryPath } = require('../dist/platform/native');
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

test('resolver returns shipped binaries for bundled targets', () => {
  assert.equal(fs.existsSync(resolveBundledBinaryPath('darwin', 'arm64')), true);
  assert.equal(fs.existsSync(resolveBundledBinaryPath('win32', 'x64')), true);
});

test('resolver reports missing bundled binaries for declared but absent targets', () => {
  assert.throws(
    () => resolveBundledBinaryPath('darwin', 'x64'),
    /missing bundled binary for "darwin-x64"/i
  );
});

test('resolver rejects unsupported platforms that are not in the package contract', () => {
  assert.throws(
    () => resolveBundledBinaryPath('linux', 'x64'),
    /unsupported platform "linux-x64"/i
  );
});
