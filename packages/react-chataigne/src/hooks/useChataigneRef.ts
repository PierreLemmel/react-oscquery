import { NodeType, NodeValue, useOSCQueryRef, UseOSCQueryRefResult } from 'react-oscquery';


function chataigneSetValue(path: string, value: NodeValue, ws?: WebSocket) {
	ws?.send(JSON.stringify({
		[path]: value
	}))
}

export type UseChataigneRefOptions = {
	host: string;
	port: number;
}

export type UseChataigneRefResult<TType extends NodeType> = UseOSCQueryRefResult<TType>

export function useChataigneRef<TType extends NodeType>(path: string, options?: Partial<UseChataigneRefOptions>): UseChataigneRefResult<TType> {
	const {
		host = "127.0.0.1",
		port = 42000,
	} = options || {}

	const [dataRef, loading, error] = useOSCQueryRef<TType>({
		host,
		port,
		useWss: false,
		setValue: chataigneSetValue
	}, path)

	return [dataRef, loading, error]
}