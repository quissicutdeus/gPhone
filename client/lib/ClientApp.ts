export class ClientApp {
    private pendingCallbacks = new Map<string, Function>();

    constructor(private appName: string) {
        this.registerDefaultResponseListeners();
    }

    private registerDefaultResponseListeners() {
        this.onResponse('receive', (cbId, data) => this.handleResponse(cbId, data));
        this.onResponse('created', (cbId, data) => this.handleResponse(cbId, data));
        this.onResponse('updated', (cbId, data) => this.handleResponse(cbId, data));
        this.onResponse('deleted', (cbId, data) => this.handleResponse(cbId, data));
    }

    private handleResponse(cbId: string, data: any) {
        if (this.pendingCallbacks.has(cbId)) {
            const cb = this.pendingCallbacks.get(cbId);
            if (cb) cb(data);
            this.pendingCallbacks.delete(cbId);
        }
    }

    public registerCallback(action: string, customServerEvent?: string) {
        const nuiEvent = action; // e.g. 'getContacts'
        // If appName is 'contacts', default server event: 'gphone:server:contacts:get'
        // But the NUI event action might be 'getContacts'.
        // Let's assume NUI sends action 'getContacts'.

        // We need a mapping or convention.
        // Convention: action = 'getContacts' -> server 'gphone:server:contacts:get'

        // Let's make it explicit for now to be safe.
        const serverEvent = customServerEvent || `gphone:server:${this.appName}:${action}`;

        RegisterNuiCallbackType(nuiEvent);
        on(`__cfx_nui:${nuiEvent}`, (data: any, cb: Function) => {
            const cbId = Math.random().toString(36).substring(7);
            this.pendingCallbacks.set(cbId, cb);
            emitNet(serverEvent, cbId, data);
        });
    }

    public onResponse(action: string, handler: (cbId: string, data: any) => void) {
        const clientEvent = `gphone:client:${this.appName}:${action}`;
        onNet(clientEvent, handler);
    }

    public registerResponseListener(action: string) {
        this.onResponse(action, (cbId, data) => this.handleResponse(cbId, data));
    }
}
