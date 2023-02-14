import fs from 'fs/promises';

/** @param {string} path */
export const isFileExists = (path) =>
  fs.access(path)
    .then(() => true)
    .catch(() => false);
