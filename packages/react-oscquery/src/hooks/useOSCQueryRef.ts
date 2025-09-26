import { RefObject, useEffect, useMemo, useRef, useState } from "react"
import { type OSCNodeValueInfo, type SetValueCallback } from "../osc-query/oscquery-client";
import { clientManager } from "../osc-query/client-manager";
import { isOSCPath, type OSCPath } from "../osc-query/osc";
import type { NodeType, NodeTypeValue, NodeValue } from "../osc-query/oscquery";
import { OSCQueryOptions } from "./useOSCQuery";



export type UseOSCQueryRefResult<TType extends NodeType> = [
    RefObject<OSCNodeValueInfo<TType> | null>,
    boolean,
    Error | null
]


export function useOSCQueryRef<TType extends NodeType>(options: OSCQueryOptions, path: string = "/"): UseOSCQueryRefResult<TType> {

    const {
        host,
        port,
        useWss = false,
        setValue: setValueCallback = () => { throw new Error("setValue callback not set") },
    } = options

    const client = useMemo(() => clientManager.getClient({ host, port, useWss }), [host, port, useWss])

    const resultRef = useRef<OSCNodeValueInfo<TType> | null>(null)
    const valueSetterRef = useRef<SetValueCallback<NodeTypeValue<TType>> | undefined>(undefined)

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        client.setValueCallback = setValueCallback
    }, [client, setValueCallback])


    useEffect(() => {
        const errorListener = (error: Error) => {
            setError(error)
        }

        client.on("error", errorListener)

        return () => {
            client.off("error", errorListener)
        }
    }, [client])

    useEffect(() => {

        const onReady = () => {
            const nodeResult = client.getNode<TType>(path)
            if (nodeResult.ok) {
                const {
                    value,
                    info,
                    setValue: newValueSetter
                } = nodeResult.value

                resultRef.current = {
                    value,
                    info,
                    setValue: newValueSetter
                }
                valueSetterRef.current = newValueSetter
            }
            else {
                setError(new Error(nodeResult.error))
            }
            setLoading(false)

            client.listenAll(path)
        }

        if (client.state === "ready") {
            onReady()
        }
        
        else {
            resultRef.current = null
            setLoading(true)

            client.on("sync", onReady)
            if (client.state === "idle") {
                client.syncData()
            }

            return () => {
                client.off("sync", onReady)
            }
        }
                
    }, [client, path])

    useEffect(() => {
        if (isOSCPath(path)) {
            const nodeListener = (nodePath: OSCPath, value: NodeValue) => {
                const castedValue = value as NodeTypeValue<TType>
                if (resultRef.current) {
                    resultRef.current.value = castedValue
                }
            }
    
            client.on(path, nodeListener)
    
            return () => {
                client.off(path, nodeListener)
            }
        }
        else {
            setError(Error(`Path '${path}' is not a valid OSC path`))
        }
    }, [client, path])

    return [resultRef, loading, error]
}