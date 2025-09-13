import { useEffect, useMemo, useState } from "react"
import { OSCQueryClient, type OSCNodeValueInfo } from "../osc-query/oscquery-client";
import { clientManager } from "../osc-query/client-manager";


export type OSCQueryOptions = {
    host: string;
    port: number;
}


export function useOSCQuery(options: OSCQueryOptions, path: string = "/"): [OSCNodeValueInfo | null, boolean, Error | null] {

    const {
        host,
        port,
    } = options

    const client = useMemo(() => clientManager.getClient({ host, port }), [host, port])

    useEffect(() => {
        client.listenAll()
    }, [client])
    
  	const [data, setData] = useState<OSCNodeValueInfo | null>(null)

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)

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
            const nodeResult = client.getNode(path)
            if (nodeResult.ok) {
                setData(nodeResult.value)
            }
            else {
                setError(new Error(nodeResult.error))
            }
            setLoading(false)
        }

        if (client.state === "ready") {
            onReady()
        }

        else {
            setData(null)
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

    return [data, loading, error]
}