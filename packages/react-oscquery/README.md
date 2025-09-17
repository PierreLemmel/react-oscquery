# React OSCQuery

This package provides a type-safe OSCQuery support for React.

```ts
const [data, loading, error] = useOSCQuery<"Float">({
    host: "127.0.0.1",
    port: 42000
}, "/customVariables/group/variables/flt/flt")

if (loading) return <Loading />
if (error) return <Error message={error.message} />
if (data === null) return <NoData />


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

return <FloatSlider
    value={data.value}
    range={[min, max]}
    setValue={setValue}
/>
```

In OSCQuery, setting a value in server is typically made with an OSC message sent through UDP. As UDP protocol is not supported in browser, you'll have to use another method depending on the server: sending through WebSocket connection or setup a bridge server that can send message through UDP.

Custom method can be passed to set the value in OSCQuery Client

```ts

function sendMessageThroughUDPBridge(path: string, value: NodeValue, ws?: WebSocket) {
    //...
}

const [data, loading, error] = useOSCQuery<"Float">({
    host: "127.0.0.1",
    port: 42000,
    setValue: sendMessageThroughUDPBridge
}, "/customVariables/group/variables/flt/flt")
```
