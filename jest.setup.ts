// Jest global setup.

jest.mock('expo-crypto', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const nodeCrypto = require('crypto');
  return {
    randomUUID: (): string => nodeCrypto.randomUUID(),
    getRandomBytes: (n: number): Uint8Array =>
      new Uint8Array(nodeCrypto.randomBytes(n)),
  };
});

jest.mock('@/lib/log', () => ({
  log: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));
