import pc from 'picocolors';

/* eslint-disable no-console */

/** @type {(namespace: string) => (...data: any[]) => void} */
export const error = (namespace) => (...args) =>
  console.error(pc.blueBright(String(namespace)), ...args);

/** @type {(...data: any[]) => void} */
export const log = (...data) => console.log(...data);
