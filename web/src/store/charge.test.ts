import { describe, it, expect } from 'vitest';
import { charge } from './charge';
import { get } from 'svelte/store';

describe('charge store', () => {
  it('initializes charge to 100', () => {
    expect(get(charge)).toBe(100);
  });

  it('updates charge state', () => {
    charge.set(75);
    expect(get(charge)).toBe(75);
  });
});
