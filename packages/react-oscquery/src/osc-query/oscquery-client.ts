import { err, ok, type Result } from "../utils";
import { parseNode, type MappedOSCQueryNode, type NodeType, type NodeTypeValue, type NodeValue, type OSCQueryContainerNode, type OSCQueryNode, type OSCQueryNodeBase, type ParseNodeResult, type SerializedOSCQueryNode, type ValueMap } from "./oscquery";
import { isOSCPath, parseOscMessage, sanitizeOSCPath, type OSCPath } from "./osc";
import { RGBA } from "./color";

export type SetValueCallback<TValue = NodeValue> = (path: string, value: TValue, ws?: WebSocket) => void;

export type OSCQueryClientOptions = {
    host: string;
    port: number;
    useWss: boolean;
    /**
     * Callback to set the value of the node.
     * OSCQu=ery spec expect the value to be set via UDP OSC messages that browser cannot send.
     * This callback is used to set the value of the node through a OSC Server or some other method.
     * @param path - The path of the node
     * @param value - The value to set
     * @param ws - The WebSocket instance
     */
    setValue?: SetValueCallback;
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



export type EventType = "sync"|"error"|"log"|"path-added"|"path-removed"|"path-changed"
export type SyncListener = (node: OSCQueryNode, data: NodeValue) => void;
export type ErrorListener = (error: Error) => void;
export type LogListener = (...args: any[]) => void;
export type PathAddedListener = (path: string, node: OSCQueryNode, data: NodeValue) => void;
export type PathRemovedListener = (path: string) => void;
export type PathChangedListener = (oldPath: string, newPath: string) => void;
export type NodeListener = (path: OSCPath, value: NodeValue) => void;

type AllListeners = SyncListener|ErrorListener|LogListener|PathAddedListener|PathRemovedListener|PathChangedListener|NodeListener;


export type OSCNodeValueInfo<TType extends NodeType> = {
    value: NodeTypeValue<TType>;
    info: MappedOSCQueryNode<TType>;
    setValue?: SetValueCallback<NodeTypeValue<TType>>;
}

export type OSCQueryClientState = "idle"|"syncing"|"ready";



export class OSCQueryClient {
    private host: string;
    private port: number;
    private useWss: boolean;

    public setValueCallback?: SetValueCallback;
    private ws: WebSocket | null = null;

    private data: ValueMap = {};
    private metadata: Map<string, OSCQueryNodeBase> = new Map();

    private syncListeners: Set<SyncListener> = new Set();
    private errorListeners: Set<ErrorListener> = new Set();
    private logListeners: Set<LogListener> = new Set();

    private pathAddedListeners: Set<PathAddedListener> = new Set();
    private pathRemovedListeners: Set<PathRemovedListener> = new Set();
    private pathChangedListeners: Set<PathChangedListener> = new Set();

    private nodeListeners: Map<string, Set<NodeListener>> = new Map();

    private _state: OSCQueryClientState = "idle";

    public get state(): OSCQueryClientState {
        return this._state;
    }


    constructor(options: OSCQueryClientOptions) {
        this._state = "idle";
        this.host = options.host;
        this.port = options.port;
        this.useWss = options.useWss;
        this.wsSetup();
    }

    private wsSetup(): void {
        this.ws = new WebSocket(`${this.useWss ? "wss" : "ws"}://${this.host}:${this.port}`);
        this.ws.onopen = () => {
            console.log("Connection to OSCQuery server established");
        }

        this.ws.onerror = (error) => {
            this.errorListeners.forEach(listener => listener(new Error(`WebSocket error: ${error.type}`)));
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
                    this.logListeners.forEach(listener => listener(data.DATA));
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

        const { node, value } = await this.getNodeData();
        this.data = value as ValueMap;
        this.traverseNode(node);

        this.syncListeners.forEach(listener => listener(node, value));
        this._state = "ready";
    }

    private async getNodeData(path: string = "/"): Promise<ParseNodeResult> {
        
        const response = await fetch(`http://${this.host}:${this.port}${path}`);
        const data = await response.json() as SerializedOSCQueryNode;
        
        return parseNode(data);
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

    public listenAll(start: string = "/"): void {
        const startPath = sanitizeOSCPath(start);
        this.metadata.forEach(node => {
            if (node.fullPath.startsWith(startPath)) {
                this.listen(node.fullPath);
            }
        });
    }

    public ignoreAll(start: string = "/"): void {
        const startPath = sanitizeOSCPath(start);
        this.metadata.forEach(node => {
            if (node.fullPath.startsWith(startPath)) {
                this.ignore(node.fullPath);
            }
        });
    }

    private traverseNode(nwv: OSCQueryNode): void {

        const sanitizedPath = sanitizeOSCPath(nwv.fullPath);
        this.metadata.set(sanitizedPath, nwv);
        if (nwv.type === "Container") {
            Object.values(nwv.contents).forEach(node => this.traverseNode(node));
        }
    }

    private async handlePathAdded(path: string): Promise<void> {
        const { node: newNode, value: newValue } = await this.getNodeData(path);

        const newPathParts = path.split("/");
        const newObjectKey = newPathParts.pop() as string;
        const parentPath = newPathParts.join("/");

        const parentNode = this.metadata.get(parentPath);
        if (parentNode) {
            (parentNode as OSCQueryContainerNode).contents[newObjectKey] = newNode;
        }

        this.traverseNode(newNode);

        this.pathAddedListeners.forEach(listener => listener(path, newNode, newValue));

        this.fireListenersForPath(path);
    }

    private async handlePathRemoved(path: string): Promise<void> {

        
        const keysToDelete = Array.from(this.metadata.keys()).filter(key => key.startsWith(path));
        keysToDelete.forEach(key => this.metadata.delete(key));


        const oldPathParts = path.split("/");
        const oldObjectKey = oldPathParts.pop() as string;
        
        const parentMap = this.getNodeValue(oldPathParts) as ValueMap;
        delete parentMap[oldObjectKey];
        
        this.pathRemovedListeners.forEach(listener => listener(path));

        this.fireListenersForPath(path);
    }

    private async handlePathChanged(oldPath: string, newPath: string): Promise<void> {

        const { node: newNode, value: newValue } = await this.getNodeData(newPath);

        const newPathParts = newPath.split("/");
        const newObjectKey = newPathParts.pop() as string;
        const parentPath = newPathParts.join("/");

        const parentNode = this.metadata.get(parentPath);
        if (parentNode && parentNode.type === "Container") {
            const foo = parentNode as OSCQueryContainerNode;
            foo.contents
            foo.contents[newObjectKey] = newNode;
        }
        
        const keysToDelete = Array.from(this.metadata.keys()).filter(key => key.startsWith(oldPath));
        keysToDelete.forEach(key => this.metadata.delete(key));

        this.traverseNode(newNode);


        const oldPathParts = oldPath.split("/");
        const oldObjectKey = oldPathParts.pop() as string;
        
        const parentMap = this.getNodeValue(oldPathParts) as ValueMap;
        delete parentMap[oldObjectKey];
        parentMap[newObjectKey] = newValue;

        this.pathChangedListeners.forEach(listener => listener(oldPath, newPath));

        this.fireListenersForPath(newPath);
    }

    private async handleOSCMessage(blobMessage: Blob): Promise<void> {
        
        const dataView = new DataView(await blobMessage.arrayBuffer());
        const msg = parseOscMessage(dataView);
        
        if (!msg) {
            console.warn("Invalid OSC message received, skipping");
            return;
        }
        const { address, args } = msg;

        const metadata = this.metadata.get(address);

        if (!metadata) {
            console.warn(`Metadata not found for address: ${address}, skipping`);
            return;
        }

        const containerAndAddress = this.getContainerAndAddressForPath(address);
        if (!containerAndAddress) {
            console.warn(`Container not found for address: ${address}, skipping`);
            return;
        }

        const [container, propKey] = containerAndAddress;

        switch (metadata.type) {
            case "Integer":
                container[propKey] = args[0] as number;
                break;
            case "Float":
                container[propKey] = args[0] as number;
                break;
            case "String":
                container[propKey] = args[0] as string;
                break;
            case "Color":
                const rgb = args[0] as RGBA;
                container[propKey] = rgb;
                break;
            case "Boolean":
                container[propKey] = args[0] as boolean;
                break;
            case "Point2D":
                container[propKey] = {
                    x: args[0] as number,
                    y: args[1] as number,
                }
                break;
            case "Point3D":
                container[propKey] = {
                    x: args[0] as number,
                    y: args[1] as number,
                    z: args[2] as number,
                }
                break;
            default:
                console.warn(`Unsupported type: ${metadata.type}, skipping`);
                return;
        }

        this.fireListenersForPath(address);
    }


    private fireListenersForPath(fullPath: string): void {
        
        const chunks = fullPath.split("/").filter(s => s.length > 0);

        let currentPath = "";
        let currentNode: NodeValue|null = this.data;

        const fireListeners = (path: string, node: NodeValue): void => {
            path = path != "" ? path : "/";
            const listeners = this.nodeListeners.get(path.toLowerCase());
            if (listeners && listeners.size > 0) {
                const val = structuredClone(node);
                listeners.forEach(listener => listener(path as OSCPath, val));
            }
        }

        if (currentNode) {
            fireListeners(currentPath != "" ? currentPath : "/", currentNode);
        }

        for (const chunk of chunks) {

            if (!currentNode) {
                break;
            }

            fireListeners(currentPath != "" ? currentPath : "/", currentNode);

            currentPath += `/${chunk.toLowerCase()}`;
            if (typeof currentNode === "object" && currentNode !== null && chunk in currentNode) {
                currentNode = (currentNode as any)[chunk];
            }
        }

        fireListeners(fullPath, currentNode!);
    }

    public on(event: "sync", listener: SyncListener): void;
    public on(event: "error", listener: ErrorListener): void;
    public on(event: "log", listener: LogListener): void;
    public on(event: "path-added", listener: PathAddedListener): void;
    public on(event: "path-removed", listener: PathRemovedListener): void;
    public on(event: "path-changed", listener: PathChangedListener): void;
    public on(event: OSCPath, listener: NodeListener): void;
    public on(event: EventType|OSCPath, listener: AllListeners): void {

        event = event.toLowerCase() as EventType|OSCPath;
    
        if (event === "sync") {
            this.syncListeners.add(listener as SyncListener);
        }

        if (event === "error") {
            this.errorListeners.add(listener as ErrorListener);
        }

        if (event === "log") {
            this.logListeners.add(listener as LogListener);
        }

        if (event === "path-added") {
            this.pathAddedListeners.add(listener as PathAddedListener);
        }

        if (event === "path-removed") {
            this.pathRemovedListeners.add(listener as PathRemovedListener);
        }

        if (event === "path-changed") {
            this.pathChangedListeners.add(listener as PathChangedListener);
        }

        if (isOSCPath(event)) {
            if (!this.nodeListeners.has(event)) {
                this.nodeListeners.set(event, new Set());
            }
            this.nodeListeners.get(event)!.add(listener as NodeListener);
        }
    }

    public off(event: "sync", listener: SyncListener): void;
    public off(event: "error", listener: ErrorListener): void;
    public off(event: "log", listener: LogListener): void;
    public off(event: "path-added", listener: PathAddedListener): void;
    public off(event: "path-removed", listener: PathRemovedListener): void;
    public off(event: "path-changed", listener: PathChangedListener): void;
    public off(event: OSCPath, listener: NodeListener): void;
    public off(event: EventType|OSCPath, listener: AllListeners): void {

        event = event.toLowerCase() as EventType|OSCPath;

        if (event === "sync") {
            const eventListener = listener as SyncListener;
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

        if (event === "path-added") {
            const pathAddedListener = listener as PathAddedListener;
            if (!this.pathAddedListeners.has(pathAddedListener)) {
                return;
            }
            this.pathAddedListeners.delete(pathAddedListener);
        }

        if (event === "path-removed") {
            const pathRemovedListener = listener as PathRemovedListener;
            if (!this.pathRemovedListeners.has(pathRemovedListener)) {
                return;
            }
            this.pathRemovedListeners.delete(pathRemovedListener);
        }

        if (event === "path-changed") {
            const pathChangedListener = listener as PathChangedListener;
            if (!this.pathChangedListeners.has(pathChangedListener)) {
                return;
            }
            this.pathChangedListeners.delete(pathChangedListener);
        }

        if (isOSCPath(event)) {
            const nodeListener = listener as NodeListener;
            if (this.nodeListeners.has(event)) {
                this.nodeListeners.get(event)!.delete(nodeListener);
            }
        }
    }


    public getNode<TType extends NodeType>(path: string): Result<OSCNodeValueInfo<TType>> {

        path = sanitizeOSCPath(path);
        const chunks = path.split("/");
        
        const value = this.getNodeValue(chunks);
        if (value === null) {
            return err("Node value not found");
        }

        const info = this.metadata.get(path);
        if (!info) {
            return err("Node metadata not found");
        }

        const resultValue = value as NodeTypeValue<TType>;
        const resultInfo = info as MappedOSCQueryNode<TType>;
        const resultSetValue = (path: string, value: NodeTypeValue<TType>) => {
            return this.setValueCallback?.(path, value, this.ws ?? undefined);
        };
        
        const nvi: OSCNodeValueInfo<TType> = {
            value: resultValue,
            info: resultInfo,
            setValue: resultSetValue
        }
        return ok(nvi);
    }

    private getContainerAndAddressForPath(path: string): [ValueMap, string]|null {
        const chunks = path.split("/");
        const address = chunks.pop() as string;
        const container = this.getNodeValue(chunks);
        return container ? [container as ValueMap, address] : null;
    }

    private getNodeValue(pathChunks: string[]): NodeValue|null {
        let curr: NodeValue = this.data;
        for (const chunk of pathChunks.filter(s => s.length > 0)) {
            if (typeof curr === "object" && curr !== null && chunk in curr) {
                curr = (curr as any)[chunk];
            }
            else {
                return null;
            }
        }

        return curr;
    }
}