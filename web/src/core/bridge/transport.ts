import { isBrowser } from "../../utils/isBrowser";
import { MockRegistry } from "../../mocks/registry";

export interface ITransportAdapter {
  send<T = any>(event: string, data?: unknown): Promise<T>;
  on<T = any>(event: string, handler: (data: T) => void): () => void;
}

export class NuiTransportAdapter implements ITransportAdapter {
  private resourceName: string;

  constructor() {
    this.resourceName = (window as any).GetParentResourceName
      ? (window as any).GetParentResourceName()
      : "gphone";
  }

  async send<T = any>(event: string, data?: unknown): Promise<T> {
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify(data),
    };

    const resp = await fetch(`https://${this.resourceName}/${event}`, options);
    const respFormatted = await resp.json();
    return respFormatted;
  }

  on<T = any>(event: string, handler: (data: T) => void): () => void {
    const eventListener = (e: MessageEvent) => {
      const { action, data } = e.data || {};
      if (action === event) {
        handler(data);
      }
    };
    window.addEventListener("message", eventListener);
    return () => window.removeEventListener("message", eventListener);
  }
}

export class MockTransportAdapter implements ITransportAdapter {
  async send<T = any>(event: string, data?: unknown): Promise<T> {
    if (MockRegistry.has(event)) {
      return (await MockRegistry.handle(event, data)) as T;
    }
    return null as unknown as T;
  }

  on<T = any>(event: string, handler: (data: T) => void): () => void {
    const eventListener = (e: MessageEvent) => {
      const { action, data } = e.data || {};
      if (action === event) {
        handler(data);
      }
    };
    window.addEventListener("message", eventListener);
    return () => window.removeEventListener("message", eventListener);
  }
}

let activeTransport: ITransportAdapter | null = null;

export function getTransport(): ITransportAdapter {
  if (!activeTransport) {
    if (isBrowser()) {
      activeTransport = new MockTransportAdapter();
    } else {
      activeTransport = new NuiTransportAdapter();
    }
  }
  return activeTransport;
}

export function setTransport(transport: ITransportAdapter | null): void {
  activeTransport = transport;
}
