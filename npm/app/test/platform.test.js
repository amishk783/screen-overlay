const test = require('node:test');
const assert = require('node:assert/strict');

const { selectAdapter } = require('../dist/platform');
const { createUnsupportedAdapter } = require('../dist/platform/unsupported');
const { createWindowsAdapter } = require('../dist/platform/win');

function createWindowMock(overrides = {}) {
  let focused = overrides.focused ?? true;
  let minimized = overrides.minimized ?? false;
  let visible = overrides.visible ?? true;

  return {
    id: overrides.id ?? 7,
    getTitle: () => overrides.title ?? 'Test Window',
    getBounds: () =>
      overrides.bounds ?? {
        x: 10,
        y: 20,
        width: 800,
        height: 600,
      },
    isDestroyed: () => overrides.destroyed ?? false,
    isMinimized: () => minimized,
    restore: () => {
      minimized = false;
    },
    isVisible: () => visible,
    show: () => {
      visible = true;
    },
    focus: () => {
      if (overrides.throwOnFocus) {
        throw new Error('focus failed');
      }

      focused = overrides.focusAfterFocus ?? true;
    },
    isFocused: () => focused,
    webContents: {
      getOSProcessId: () => overrides.pid ?? 4321,
    },
  };
}

test('selectAdapter chooses mac adapter for darwin', () => {
  assert.equal(selectAdapter('darwin').kind, 'mac');
});

test('selectAdapter chooses windows adapter for win32', () => {
  assert.equal(selectAdapter('win32').kind, 'win');
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

test('windows adapter returns null when the window is missing', async () => {
  const adapter = createWindowsAdapter({
    app: {},
    BrowserWindow: {
      fromId: () => null,
    },
  });

  assert.equal(await adapter.getWindowById(123), null);
});

test('windows adapter reports not_in_electron_main without Electron main APIs', async () => {
  const adapter = createWindowsAdapter(null);

  assert.deepEqual(await adapter.focusWindow(12), {
    success: false,
    stage: 'not_in_electron_main',
  });
});

test('windows adapter reports window_not_found when no BrowserWindow exists', async () => {
  const adapter = createWindowsAdapter({
    app: {},
    BrowserWindow: {
      fromId: () => null,
    },
  });

  assert.deepEqual(await adapter.focusWindow(55), {
    success: false,
    stage: 'window_not_found',
    window_id: 55,
  });
});

test('windows adapter restores and focuses minimized windows', async () => {
  const window = createWindowMock({ minimized: true, visible: false, focused: false });
  const adapter = createWindowsAdapter({
    app: {},
    BrowserWindow: {
      fromId: () => window,
    },
  });

  const result = await adapter.focusWindow(7);

  assert.deepEqual(result, {
    success: true,
    window_id: 7,
    pid: 4321,
    title: 'Test Window',
    x: 10,
    y: 20,
    width: 800,
    height: 600,
  });
  assert.equal(window.isMinimized(), false);
  assert.equal(window.isVisible(), true);
});

test('windows adapter normalizes WindowInfo shape', async () => {
  const adapter = createWindowsAdapter({
    app: {},
    BrowserWindow: {
      fromId: () =>
        createWindowMock({
          id: 99,
          title: 'Normalized',
          pid: 9988,
          bounds: { x: 1, y: 2, width: 3, height: 4 },
        }),
    },
  });

  assert.deepEqual(await adapter.getWindowById(99), {
    window_id: 99,
    pid: 9988,
    title: 'Normalized',
    x: 1,
    y: 2,
    width: 3,
    height: 4,
  });
});
