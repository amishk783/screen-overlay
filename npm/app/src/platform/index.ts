import { createMacAdapter } from './mac';
import { createUnsupportedAdapter } from './unsupported';
import { createWindowsAdapter } from './win';
import type { WindowAdapter } from './types';

export function selectAdapter(platform = process.platform): WindowAdapter {
  if (platform === 'darwin') {
    return createMacAdapter();
  }

  if (platform === 'win32') {
    return createWindowsAdapter();
  }

  return createUnsupportedAdapter(platform);
}
