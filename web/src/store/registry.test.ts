import { describe, it, expect } from 'vitest';
import { get } from 'svelte/store';
import { appRegistryStore, registeredApps, type AppManifest } from './registry';

describe('App Registry Store', () => {
  it('loads built-in manifests on startup', () => {
    const apps = get(appRegistryStore);
    expect(apps.length).toBeGreaterThan(0);
    expect(apps).toEqual(registeredApps);
  });

  it('allows dynamic registration of custom third-party apps', () => {
    const mockManifest: AppManifest = {
      id: 'crypto_app',
      name: 'Crypto',
      color: '#f59e0b',
      icon: null,
    };
    const mockComponent = {};

    appRegistryStore.registerApp(mockManifest, mockComponent);

    const apps = get(appRegistryStore);
    const registered = apps.find((a) => a.id === 'crypto_app');

    expect(registered).toBeDefined();
    expect(registered?.name).toBe('Crypto');
    expect(appRegistryStore.getComponent('crypto_app')).toBe(mockComponent);
  });

  it('allows unregistering dynamic apps', () => {
    appRegistryStore.unregisterApp('crypto_app');

    const apps = get(appRegistryStore);
    const registered = apps.find((a) => a.id === 'crypto_app');

    expect(registered).toBeUndefined();
    expect(appRegistryStore.getComponent('crypto_app')).toBeUndefined();
  });
});
