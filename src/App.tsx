import { useEffect, useMemo, useRef, useState } from 'react'
import { useOSCQuery } from './react-oscquery/hooks/useOSCQuery'
import { clientManager } from './react-oscquery/osc-query/client-manager'
import OSC from 'osc-js'

const App = () => {


	const [path, setPath] = useState("/")
	const [data, loading, error] = useOSCQuery({
		host: "127.0.0.1",
		port: 42000,
	}, path)

  	if (loading) return <div>Loading...</div>
	if (error) return <div>Error: {error.message}</div>
	if (!data) return <div>No data</div>

  	return <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      	<h1 style={{ textAlign: "center" }}>Chataigne Data</h1>
		<input type="text" value={path} onChange={(e) => setPath(e.target.value)} />
		<div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>

			<pre>{JSON.stringify(data.value, null, 2)}</pre>
			<pre>{JSON.stringify(data.info, null, 2)}</pre>
		</div>
    </div>
}

const App2 = () => {

	const client = useMemo(() => clientManager.getClient({ host: "127.0.0.1", port: 42000 }), [])

	useEffect(() => {
		client.syncData()
		
	}, [client])

	const [listenPath, setListenPath] = useState("/customVariables/group/variables/point2/point2")
	const [ignorePath, setIgnorePath] = useState("/customVariables/group/variables/point2/point2")

	const handleListen = () => {
		if (listenPath.trim()) {
			client.listen(listenPath.trim())
			setListenPath("")
		}
	}

	const handleIgnore = () => {
		if (ignorePath.trim()) {
			client.ignore(ignorePath.trim())
			setIgnorePath("")
		}
	}

	return <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "20px" }}>
		<h2>OSC Query Client Controls</h2>
		
		<div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
			<label>Listen to path:</label>
			<div style={{ display: "flex", gap: "5px" }}>
				<input 
					type="text" 
					value={listenPath} 
					onChange={(e) => setListenPath(e.target.value)}
					placeholder="Enter OSC path (e.g., /parameter/volume)"
					style={{ flex: 1 }}
				/>
				<button onClick={handleListen}>Listen</button>
			</div>
		</div>

		<div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
			<label>Ignore path:</label>
			<div style={{ display: "flex", gap: "5px" }}>
				<input 
					type="text" 
					value={ignorePath} 
					onChange={(e) => setIgnorePath(e.target.value)}
					placeholder="Enter OSC path to ignore"
					style={{ flex: 1 }}
				/>
				<button onClick={handleIgnore}>Ignore</button>
			</div>
		</div>

		<div style={{ display: "flex", gap: "10px" }}>
			<button onClick={() => client.listenAll()}>Listen All</button>
			<button onClick={() => client.ignoreAll()}>Ignore All</button>
		</div>
	</div>
} 

const App3 = () => {

	const ws = useMemo(() => new WebSocket("ws://127.0.0.1:12000/"), [])

	useEffect(() => {
		ws.onmessage = (event) => {
			console.log(event.data)
		}
	}, [ws])

	useEffect(() => {
		ws.onopen = () => {
			console.log("WebSocket opened")
		}
	}, [ws])

	useEffect(() => {
		ws.onclose = () => {
			console.log("WebSocket closed")
		}
	}, [ws])

	const [testMessage, setTestMessage] = useState("")
	const [testPath, setTestPath] = useState("/test")

	const sendTestMessage = () => {
		if (ws.readyState === WebSocket.OPEN) {
			ws.send(JSON.stringify({
				command: "TEST",
				data: {
					path: testPath,
					value: testMessage
				}
			}))
		} else {
			console.log("WebSocket not connected")
		}
	}

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "20px" }}>
			<h3>Test Message Sender</h3>
			
			<div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
				<label>Test Path:</label>
				<input 
					type="text" 
					value={testPath} 
					onChange={(e) => setTestPath(e.target.value)}
					placeholder="Enter OSC path (e.g., /test/parameter)"
					style={{ flex: 1 }}
				/>
			</div>

			<div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
				<label>Test Message:</label>
				<input 
					type="text" 
					value={testMessage} 
					onChange={(e) => setTestMessage(e.target.value)}
					placeholder="Enter test message value"
					style={{ flex: 1 }}
				/>
			</div>

			<button onClick={sendTestMessage} disabled={ws.readyState !== WebSocket.OPEN}>
				Send Test Message
			</button>

			<div style={{ fontSize: "12px", color: "#666" }}>
				WebSocket Status: {ws.readyState === WebSocket.OPEN ? "Connected" : "Disconnected"}
			</div>
		</div>
	)
}

const App4 = () => {

	const [ready, setReady] = useState(false)
	const osc = useMemo(() => {
		return new OSC({
			plugin: new OSC.WebsocketClientPlugin({
				port: 41000,
				host: "127.0.0.1",
				secure: false,
			}),
		})
	}, [])

	const openedRef = useRef(false)
	useEffect(() => {


		if (!openedRef.current) {
			osc.open()
			openedRef.current = true
		}


		const openId = osc.on('open', () => {
			console.log("OSC opened")
		})

		const onMessage = (message: OSC.Message) => {	
			console.log(message)
		}

		const subId = osc.on('*', onMessage)

		return () => {
			osc.off('*', subId)
			osc.off('open', openId)
		}
	}, [])


	return (
		<div>
			<button onClick={() => osc.open()}>
				Open OSC Connection
			</button>
		</div>
	)
}

export default App2
