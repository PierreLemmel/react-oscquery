import { useChataigne } from 'react-chataigne'

const App = () => {


	const [data, loading, error] = useChataigne<"Float">("/customVariables/group/variables/flt/flt")

  	if (loading) return <div>Loading...</div>
	if (error) return <div>Error: {error.message}</div>
	if (data === null) return <div>No data</div>


	const {
		value,
		info,
		setValue
	} = data

	const min = info.range?.min ?? 0
	const max = info.range?.max ?? 1

	const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = Number(e.target.value)

		if (setValue) {
			setValue(info.fullPath, newValue)
		}
	}
	
  	return <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
		<div style={{ margin: "20px 0" }}>
			<label>
				Slider: 
				<input
					type="range"
					min={min}
					max={max}
					step="any"
					value={value}
					onChange={handleSliderChange}
					style={{ width: 200, margin: "0 10px" }}
				/>
				<span>{value}</span>
			</label>
		</div>
		<pre>{JSON.stringify(info, null, 2)}</pre>
    </div>
}


export default App
