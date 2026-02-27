#!/usr/bin/env node

import { execFile, spawnSync } from 'child_process';
/**
 * Returns the executable path which is located inside `node_modules`
 * The naming convention is app-${os}-${arch}
 * If the platform is `win32` or `cygwin`, executable will include a `.exe` extension.
 * @see https://nodejs.org/api/os.html#osarch
 * @see https://nodejs.org/api/os.html#osplatform
 * @example "x/xx/node_modules/app-darwin-arm64"
 */
function getExePath() {
  const arch = process.arch;
  let os = process.platform as string;
  let extension = '';
  if (['win32', 'cygwin'].includes(process.platform)) {
    os = 'windows';
    extension = '.exe';
  }

  try {
    // Since the binary will be located inside `node_modules`, we can simply call `require.resolve`
    return require.resolve(`app-${os}-${arch}/bin/app${extension}`);
  } catch (e) {
    throw new Error(
      `Couldn't find application binary inside node_modules for ${os}-${arch}`,
    );
  }
}

/**
 * Runs the application with args using nodejs spawn
 */
function run2() {
  const args = process.argv.slice(2);
  const processResult = spawnSync(getExePath(), args, { stdio: 'inherit' });
  process.exit(processResult.status ?? 0);
}

run2();

function run(args) {
  return new Promise((resolve, reject) => {
    const binary = getExePath();

    execFile(binary, args, (err, stdout, stderr) => {
      if (err) return reject(err);
      resolve(stdout);
    });
  });
}

exports.getWindows = () => run(['get-windows']);
exports.focusWindow = (pid, title) => run(['focus', String(pid), title]);
