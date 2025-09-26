import { useEffect, useRef } from "react"
import { useOSCQueryRef } from "react-oscquery"


function App() {
	const [nodeRef, loading, error] = useOSCQueryRef<"Float">({
		host: "127.0.0.1",
		port: 42000,
	}, "/customVariables/group/variables/value1/value1")
	const canvasRef = useRef<HTMLCanvasElement | null>(null);

	useEffect(() => {
		
		let animationFrameId: number;

		const draw = () => {
			render();

			animationFrameId = requestAnimationFrame(draw);
		};

		const render = () => {
			const canvas = canvasRef.current;
			if (!canvas) return;

			const ctx = canvas.getContext("2d");
			if (!ctx) return;

			const value = nodeRef.current?.value ?? 0;
			// Clear canvas
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			// Get the current value from the ref
			const currentValue = nodeRef.current?.value ?? 0;

			ctx.fillStyle = `rgba(255, 255, 255, ${value})`;
			ctx.fillRect(0, 0, canvas.width, canvas.height);
		}

		draw();

		return () => {
			cancelAnimationFrame(animationFrameId);
		};
	}, [nodeRef, canvasRef]);

	if (loading) return <div>Loading...</div>
	if (error) return <div>Error: {error.message}</div>
	if (nodeRef === null || nodeRef.current === null) return <div>No data</div>
	
	const {
		value,
		info,
	} = nodeRef.current

	return <div>
		<div>Value: {value.toFixed(2)} {info.range && `(${info.range.min} - ${info.range.max})`}</div>
		<canvas 
			style={{ backgroundColor: "black" }}
			ref={canvasRef} width={500} height={500}
		/>
	</div>
}

export default App