import { OSCQueryClient, type OSCQueryClientOptions } from "./oscquery-client";


class OSCQueryClientManager {
    private static instance: OSCQueryClientManager;
    private clients: Map<string, OSCQueryClient> = new Map();

    private constructor() {}

    public static getInstance(): OSCQueryClientManager {
        if (!OSCQueryClientManager.instance) {
            OSCQueryClientManager.instance = new OSCQueryClientManager();
        }
        return OSCQueryClientManager.instance;
    }

    public getClient(options: OSCQueryClientOptions): OSCQueryClient {
        const key = `${options.host}:${options.port}`;
        
        if (!this.clients.has(key)) {
            this.clients.set(key, new OSCQueryClient(options));
        }
        
        return this.clients.get(key)!;
    }


    public removeClient(options: OSCQueryClientOptions): void {
        const key = `${options.host}:${options.port}`;
        this.clients.delete(key);
    }


    public getActiveClients(): string[] {
        return Array.from(this.clients.keys());
    }


    public clearAll(): void {
        this.clients.clear();
    }
}

export const clientManager = OSCQueryClientManager.getInstance();
export type { OSCQueryClientOptions };
