import { Repository } from './Repository';

export interface ServerAppOptions {
    disableGet?: boolean;
    disableCreate?: boolean;
    disableUpdate?: boolean;
    disableDelete?: boolean;
}

export class ServerApp<T> {
    constructor(private appName: string, private repo: Repository<T>, private options: ServerAppOptions = {}) {
        this.registerCrudEvents();
    }

    private registerCrudEvents() {
        // Read (All or partial)
        if (!this.options.disableGet) {
            this.registerEvent('get', async (source: number, cbId: any, data: any, citizenid: string) => {
                const result = await this.repo.findAll({ ...data, citizenid } as any);
                return result;
            });
        }

        // Create
        if (!this.options.disableCreate) {
            this.registerEvent('create', async (source: number, cbId: any, data: any, citizenid: string) => {
                const newItem = { ...data, citizenid };
                const id = await this.repo.create(newItem);
                return { ...newItem, id };
            });
        }

        // Update
        if (!this.options.disableUpdate) {
            this.registerEvent('update', async (source: number, cbId: any, data: any, citizenid: string) => {
                if (!data.id) throw new Error("ID required for update");
                const success = await this.repo.update(data.id, data);
                return success;
            });
        }

        // Delete
        if (!this.options.disableDelete) {
            this.registerEvent('delete', async (source: number, cbId: any, data: any, citizenid: string) => {
                if (!data.id) throw new Error("ID required for delete");
                const success = await this.repo.delete(data.id);
                return success;
            });
        }
    }

    public registerEvent(action: string, handler: (source: number, cbId: any, data: any, citizenid: string, player: any) => Promise<any>) {
        const eventName = `gphone:server:${this.appName}:${action}`;
        const clientEventName = `gphone:client:${this.appName}:${action === 'get' ? 'receive' : action === 'create' ? 'created' : action === 'update' ? 'updated' : action === 'delete' ? 'deleted' : action}`;

        onNet(eventName, async (cbId: any, data: any) => {
            const src = source;
            try {
                const player = exports.qbx_core.GetPlayer(src);
                if (!player) {
                    emitNet(clientEventName, src, cbId, { error: 'Player not authenticated' });
                    return;
                }

                const citizenid = player.PlayerData.citizenid;
                const result = await handler(src, cbId, data, citizenid, player);

                if (result !== undefined) {
                    emitNet(clientEventName, src, cbId, result);
                }
            } catch (error) {
                console.error(`Error in ${eventName}:`, error);
                emitNet(clientEventName, src, cbId, { error: error instanceof Error ? error.message : 'Unknown error' });
            }
        });
    }
}
