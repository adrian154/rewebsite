const canvas = document.getElementById("canvas");

const fetchCode = async path => (await fetch(path)).text();

const init = async () => {

    // get adapter
    const adapter = await navigator.gpu.requestAdapter();
    if(!adapter) {
        throw new Error("WebGPU not supported (couldn't retrieve GPU adapter)");
    }

    // set up device and context
    const device = await adapter.requestDevice();
    const context = canvas.getContext("webgpu");
    context.configure({
        device,
        format: context.getPreferredFormat(adapter)
    });

    // create a pipeline
    const pipeline = device.createRenderPipeline({
        vertex: {
            module: device.createShaderModule({code: fetchCode("/shaders/vert.wgsl")}),
            entryPoint: "main"
        },
        fragment: {
            module: device.createShaderModule({code: fetchCode("/shaders/frag.wgsl")}),
            entryPoint: "main",
            targets: [
                {format: 1}
            ]
        },
        primitive: {
            topology: "triangle-list"
        }
    });

    // create command encoder and texture view
    const commandEncoder = device.createCommandEncoder();
    const textureView = context.getCurrentTexture().createView();
    const passEncoder = commandEncoder.beginRenderPass({

    });

    const redraw = () => {
        
    };

};