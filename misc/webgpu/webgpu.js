(async () => {

    const adapter = await navigator.gpu?.requestAdapter();
    if(!adapter) {
        throw new Error("WebGPU not available");
    }

    const device = await adapter.requestDevice();
    console.log(device);

})().catch(error => alert(error));