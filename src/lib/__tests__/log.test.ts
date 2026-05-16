/* eslint-disable @typescript-eslint/no-var-requires */
jest.unmock('@/lib/log');

describe('log', () => {
  const originalDev = (global as { __DEV__?: boolean }).__DEV__ ?? false;

  afterEach(() => {
    (global as { __DEV__?: boolean }).__DEV__ = originalDev;
    jest.resetModules();
    jest.restoreAllMocks();
  });

  it('forwards info to console.info when __DEV__', () => {
    (global as { __DEV__?: boolean }).__DEV__ = true;
    const spy = jest.spyOn(console, 'info').mockImplementation(() => {});
    const { log } = require('@/lib/log');
    log.info('hello');
    expect(spy).toHaveBeenCalledWith('hello');
  });

  it('is a noop when not __DEV__', () => {
    (global as { __DEV__?: boolean }).__DEV__ = false;
    const spy = jest.spyOn(console, 'info').mockImplementation(() => {});
    const { log } = require('@/lib/log');
    log.info('hello');
    expect(spy).not.toHaveBeenCalled();
  });

  it('always forwards error regardless of __DEV__', () => {
    (global as { __DEV__?: boolean }).__DEV__ = false;
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const { log } = require('@/lib/log');
    log.error('boom');
    expect(spy).toHaveBeenCalledWith('boom');
  });
});
