import { useOSCQuery } from 'react-oscquery'

function App() {
	const [node, loading, error] = useOSCQuery<"Float">({
		host: "127.0.0.1",
		port: 42000,
	}, "/customVariables/group/variables/flt/flt")

	if (loading) return <div>Loading...</div>
	if (error) return <div>Error: {error.message}</div>
	if (node === null) return <div>No data</div>
	
	const {
		value,
		info,
	} = node

	return <div>Value: {value.toFixed(2)} {info.range && `(${info.range.min} - ${info.range.max})`}</div>
}

export default App
