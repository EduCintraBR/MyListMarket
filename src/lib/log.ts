type LogFn = (...args: unknown[]) => void;

const isDev = (): boolean => Boolean((global as { __DEV__?: boolean }).__DEV__);

const devOnly =
  (fn: LogFn): LogFn =>
  (...args: unknown[]) => {
    if (isDev()) fn(...args);
  };

export const log = {
  info: devOnly((...args) => {
    // eslint-disable-next-line no-console
    console.info(...args);
  }),
  warn: devOnly((...args) => {
    console.warn(...args);
  }),
  error: ((...args: unknown[]) => {
    console.error(...args);
  }) as LogFn,
};
