import { remote } from 'electron';
import { LogOption, parseLog } from './parser/base';

export const logOption: LogOption = {
  path: '',
  start: undefined,
  end: undefined,
};

export async function openDialog() {
  const result = await remote.dialog.showOpenDialog({
    properties: ['openFile'],
  });
  if (!result || result.canceled) {
    return;
  }
  [logOption.path] = result.filePaths;
  console.log(parseLog(logOption));
}
