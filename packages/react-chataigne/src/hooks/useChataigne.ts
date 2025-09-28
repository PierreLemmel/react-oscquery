import { NodeType, NodeValue, useOSCQuery, UseOSCQueryResult } from 'react-oscquery';


function chataigneSetValue(path: string, value: NodeValue, ws?: WebSocket) {
	ws?.send(JSON.stringify({
		[path]: value
	}))
}

export type UseChataigneOptions = {
	host: string;
	port: number;
}

export type UseChataigneResult<TType extends NodeType> = UseOSCQueryResult<TType>

export function useChataigne<TType extends NodeType>(path: string, options?: Partial<UseChataigneOptions>): UseChataigneResult<TType> {
	const {
		host = "127.0.0.1",
		port = 42000,
	} = options || {}

	const [data, loading, error] = useOSCQuery<TType>({
		host,
		port,
		useWss: false,
		setValue: chataigneSetValue
	}, path)

	return [data, loading, error]
}