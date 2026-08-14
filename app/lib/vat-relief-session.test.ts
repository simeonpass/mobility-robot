import {describe, expect, it, beforeEach, afterEach} from 'vitest';
import {
  clearVatReliefRegistration,
  readVatReliefEnabled,
  saveVatReliefRegistration,
  VAT_RELIEF_SESSION_KEY,
} from '~/lib/vat-relief-session';

describe('vat-relief-session enabled flag', () => {
  beforeEach(() => {
    const store = new Map<string, string>();
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: {},
    });
    Object.defineProperty(globalThis, 'sessionStorage', {
      configurable: true,
      value: {
        getItem: (key: string) => store.get(key) ?? null,
        setItem: (key: string, value: string) => {
          store.set(key, value);
        },
        removeItem: (key: string) => {
          store.delete(key);
        },
      },
    });
  });

  afterEach(() => {
    clearVatReliefRegistration();
  });

  it('treats a saved declaration as enabled by default', () => {
    saveVatReliefRegistration({
      email: 'a@b.com',
      name: 'Ada',
      address: '1 High Street, London',
      condition: 'Mobility impairment',
      registeredAt: new Date().toISOString(),
    });
    expect(readVatReliefEnabled()).toBe(true);
  });

  it('returns false when relief was explicitly disabled', () => {
    saveVatReliefRegistration({
      email: 'a@b.com',
      name: 'Ada',
      address: '1 High Street, London',
      condition: 'Mobility impairment',
      registeredAt: new Date().toISOString(),
      enabled: false,
    });
    expect(readVatReliefEnabled()).toBe(false);
  });

  it('returns false after clearing registration', () => {
    saveVatReliefRegistration({
      email: 'a@b.com',
      name: 'Ada',
      address: '1 High Street, London',
      condition: 'Mobility impairment',
      registeredAt: new Date().toISOString(),
      enabled: true,
    });
    clearVatReliefRegistration();
    expect(sessionStorage.getItem(VAT_RELIEF_SESSION_KEY)).toBeNull();
    expect(readVatReliefEnabled()).toBe(false);
  });
});
