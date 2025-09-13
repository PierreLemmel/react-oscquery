import { err, ok, type Result } from "../utils";
import { parseNode, sanitizeOSCPath, type NodeValue, type OSCQueryNode, type SerializedOSCQueryNode, type ValueMap } from "./oscquery";

export type OSCQueryClientOptions = {
    host: string;
    port: number;
}

type OSCQueryPathMessage<TCommand extends string, TData> = {
    COMMAND: TCommand;
    DATA: TData;
}

type SerializedOSCQueryPathMessage = OSCQueryPathMessage<"PATH_ADDED", string>
    | OSCQueryPathMessage<"PATH_REMOVED", string>
    | OSCQueryPathMessage<"PATH_RENAMED", {
        OLD: string;
        NEW: string;
    }>
    | OSCQueryPathMessage<"LOG", any>



export type EventType = "sync"|"error"|"log"
export type EventListener = (node: OSCQueryNode, data: NodeValue) => void;
export type ErrorListener = (error: Error) => void;
export type LogListener = (...args: any[]) => void;

export type OSCNodeValueInfo = {
    value: NodeValue;
    info: OSCQueryNode;
}

export type OSCQueryClientState = "idle"|"syncing"|"ready";

export class OSCQueryClient {
    private host: string;
    private port: number;

    private ws: WebSocket | null = null;

    private data: ValueMap = {};
    private metadata: Map<string, OSCQueryNode> = new Map();

    private syncListeners: Set<EventListener> = new Set();
    private errorListeners: Set<ErrorListener> = new Set();
    private logListeners: Set<LogListener> = new Set();

    private _state: OSCQueryClientState = "idle";

    public get state(): OSCQueryClientState {
        return this._state;
    }


    constructor(options: OSCQueryClientOptions) {
        this._state = "idle";
        this.host = options.host;
        this.port = options.port;
        this.wsSetup();
    }

    private wsSetup(): void {
        this.ws = new WebSocket(`ws://${this.host}:${this.port}`);
        this.ws.onopen = () => {
            console.log("WebSocket opened");
        }

        this.ws.onerror = (error) => {
            this.emit("error", error);
        }

        
        this.ws.onmessage = (event) => {

            if (event.data instanceof Blob) {
                this.handleOSCMessage(event.data);
                return;
            }

            const data = JSON.parse(event.data) as SerializedOSCQueryPathMessage;

            switch (data.COMMAND) {
                case "PATH_ADDED":
                    this.handlePathAdded(data.DATA);
                    break;
                case "PATH_REMOVED":
                    this.handlePathRemoved(data.DATA);
                    break;
                case "PATH_RENAMED":
                    this.handlePathChanged(data.DATA.OLD, data.DATA.NEW);
                    break;
                case "LOG":
                    this.emit("log", data.DATA);
                    break;
                default:
                    console.warn(`Unexpected message`, data);
            }
        }
    }


    public async syncData(): Promise<void> {

        this._state = "syncing";
        this.data = {};
        this.metadata.clear();
        
        const response = await fetch(`http://${this.host}:${this.port}/`);
        const data = await response.json() as SerializedOSCQueryNode;
        
        const { node, value } = parseNode(data);
        this.data = value as ValueMap;
        this.traverseNode(node);

        this.emit("sync", node, value);
        this._state = "ready";
    }

    public listen(path: string): void {

        const json = JSON.stringify({
            COMMAND: "LISTEN",
            DATA: sanitizeOSCPath(path)
        })

        this.send(json);
    }

    public ignore(path: string): void {
        this.send(JSON.stringify({
            command: "IGNORE",
            data: sanitizeOSCPath(path)
        }));
    }

    private send(json: string): void {
        if (this.ws?.readyState !== WebSocket.OPEN) {
            return;
        }
        this.ws.send(json);
    }

    public listenAll(): void {
        this.metadata.forEach(node => this.listen(node.fullPath));
    }

    public ignoreAll(): void {
        this.metadata.forEach(node => this.ignore(node.fullPath));
    }

    private traverseNode(nwv: OSCQueryNode): void {

        const sanitizedPath = sanitizeOSCPath(nwv.fullPath);
        this.metadata.set(sanitizedPath, nwv);
        if (nwv.type === "Container") {
            Object.values(nwv.contents).forEach(node => this.traverseNode(node));
        }
    }

    private handlePathAdded(path: string): void {
        console.log(`Path added: ${path}`);
    }

    private handlePathRemoved(path: string): void {
        console.log(`Path removed: ${path}`);
    }

    private handlePathChanged(oldPath: string, newPath: string): void {
        console.log(`Path changed: ${oldPath} -> ${newPath}`);
    }

    private handleOSCMessage(message: Blob): void {
        console.log("Received OSC message");
    }

    public on(event: "sync", listener: EventListener): void;
    public on(event: "error", listener: ErrorListener): void;
    public on(event: "log", listener: LogListener): void;
    public on(event: EventType, listener: EventListener|ErrorListener|LogListener): void {
    
        if (event === "sync") {
            this.syncListeners.add(listener as EventListener);
        }
        if (event === "error") {
            this.errorListeners.add(listener as ErrorListener);
        }
        if (event === "log") {
            this.logListeners.add(listener as LogListener);
        }

    }

    public off(event: "sync", listener: EventListener): void;
    public off(event: "error", listener: ErrorListener): void;
    public off(event: "log", listener: LogListener): void;
    public off(event: EventType, listener: EventListener|ErrorListener|LogListener): void {

        if (event === "sync") {
            const eventListener = listener as EventListener;
            if (!this.syncListeners.has(eventListener)) {
                return;
            }

            this.syncListeners.delete(eventListener);
        }

        if (event === "error") {
            const errorListener = listener as ErrorListener;
            if (!this.errorListeners.has(errorListener)) {
                return;
            }
            this.errorListeners.delete(errorListener);
        }

        if (event === "log") {
            const logListener = listener as LogListener;
            if (!this.logListeners.has(logListener)) {
                return;
            }
            this.logListeners.delete(logListener);
        }
    }

    private emit(event: EventType, ...args: any[]): void {
        if (event === "sync") {

            const [node, data] = args;
            this.syncListeners.forEach(listener => listener(node, data));
        }
        if (event === "error") {
            const [error] = args;
            this.errorListeners.forEach(listener => listener(error));
        }
        if (event === "log") {
            this.logListeners.forEach(listener => listener(...args));
        }
    }

    public getNode(path: string): Result<OSCNodeValueInfo> {

        path = sanitizeOSCPath(path);
        const chunks = path.split("/").filter(s => s.length > 0);
        
        let curr: NodeValue = this.data;
        for (const chunk of chunks) {

            if (typeof curr === "object" && curr !== null && chunk in curr) {
                curr = (curr as any)[chunk];
            } else {
                return err("Node value not found");
            }
        }

        const info = this.metadata.get(path);
        if (!info) {
            return err("Node metadata not found");
        }

        return ok({
            value: curr,
            info
        });
    }
}