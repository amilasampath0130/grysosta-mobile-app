const canLog = typeof __DEV__ !== "undefined" ? __DEV__ : false;

export const logger = {
  debug: (...args: unknown[]) => {
    if (canLog) console.debug(...args);
  },
  info: (...args: unknown[]) => {
    if (canLog) console.info(...args);
  },
  warn: (...args: unknown[]) => {
    if (canLog) console.warn(...args);
  },
  error: (...args: unknown[]) => {
    if (canLog) console.error(...args);
  },
};
