// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getTransport,
  setTransport,
  MockTransportAdapter,
  NuiTransportAdapter,
  type ITransportAdapter,
} from './transport';

describe('Transport Abstraction Module', () => {
  beforeEach(() => {
    setTransport(null);
  });

  it('selects MockTransportAdapter in browser environment', () => {
    const transport = getTransport();
    expect(transport).toBeInstanceOf(MockTransportAdapter);
  });

  it('allows custom transport adapter injection via setTransport', async () => {
    const customAdapter: ITransportAdapter = {
      send: vi.fn().mockResolvedValue({ custom: true }),
      on: vi.fn().mockReturnValue(() => { }),
    };

    setTransport(customAdapter);

    const transport = getTransport();
    expect(transport).toBe(customAdapter);

    const result = await transport.send('testEvent', { payload: 123 });
    expect(result).toEqual({ custom: true });
    expect(customAdapter.send).toHaveBeenCalledWith('testEvent', { payload: 123 });
  });

  it('NuiTransportAdapter issues HTTP POST request', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      json: () => Promise.resolve({ success: true }),
    } as Response);

    const nuiTransport = new NuiTransportAdapter();
    const result = await nuiTransport.send('customNuiEvent', { foo: 'bar' });

    expect(fetchSpy).toHaveBeenCalledWith('https://gphone/customNuiEvent', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ foo: 'bar' }),
    }));
    expect(result).toEqual({ success: true });
  });

  it('NuiTransportAdapter.on listens to window message events and unbinds correctly', () => {
    const nuiTransport = new NuiTransportAdapter();
    const handlerSpy = vi.fn();

    const unsubscribe = nuiTransport.on('testAction', handlerSpy);

    window.postMessage({ action: 'testAction', data: { test: 1 } }, '*');
    window.postMessage({ action: 'ignoredAction', data: { test: 2 } }, '*');

    // Trigger message event manually in jsdom
    const event = new MessageEvent('message', {
      data: { action: 'testAction', data: { test: 1 } },
    });
    window.dispatchEvent(event);

    expect(handlerSpy).toHaveBeenCalledWith({ test: 1 });

    unsubscribe();

    handlerSpy.mockClear();
    window.dispatchEvent(event);
    expect(handlerSpy).not.toHaveBeenCalled();
  });
});
