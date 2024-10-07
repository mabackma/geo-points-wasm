import init, { geo_json_from_coords, SharedBuffer } from './pkg/geo_points_wasm.js';

async function handleFile(file) {
    const reader = new FileReader();

    reader.onload = async function (event) {
        const xmlContent = event.target.result;

        // Initialize the WebAssembly module
        const wasm = await init();
        const memory = wasm.memory

        try {
            // Start timing
            const start = performance.now();

            // Example coordinates for the bounding box:
            /*
            const min_x = 25.347136232586948;
            const max_x = 25.42651387476916;
            const min_y = 66.42980392068148;
            const max_y = 66.46850960846054;
            */
            const min_x = 25.40816481024935;
            const max_x = 25.40907894043688;
            const min_y = 66.44532693892663;
            const max_y = 66.44629687395998;
            /*
            const min_x = 25.390573376834286;
            const max_x = 25.391519399031605;
            const min_y = 66.43538376067032;
            const max_y = 66.43631099825501;
            */
            // Call the WebAssembly function with the XML content
            const result = await geo_json_from_coords(min_x, max_x, min_y, max_y, xmlContent);
            const geojson = result.geojson;
            const treeCount = result.tree_count;
            const maxTreeCount = result.max_tree_count;
            const bufferPtr = result.buffer_pointer;

            // Access the raw memory buffer directly using Float64Array
            const wasmMemory = new Float64Array(memory.buffer, Number(bufferPtr), maxTreeCount * 7);

            // End timing
            const end = performance.now();
            const duration = end - start;
            console.log(`Time elapsed: ${duration} ms`);
            
            // Log the GeoJSON and tree data
            console.log('GeoJson:', geojson);
            console.log('Max tree count:', maxTreeCount);
            console.log('Tree count:', treeCount);
            console.log('Buffer Pointer:', bufferPtr);

            displayTrees(treeCount, wasmMemory);

            console.log('Let\'s cut some trees! Cutting 500 trees...');

            // Create a SharedBuffer instance and set the pointer to the buffer
            const sharedBuffer = new SharedBuffer(maxTreeCount);
            sharedBuffer.set_ptr(bufferPtr);

            // Call the WebAssembly method to cut the trees
            sharedBuffer.forest_clearing(500, treeCount);
            displayTrees(treeCount, wasmMemory);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    reader.readAsText(file);
}

function displayTrees(treeCount, wasmMemory) {
    for (let i = 0; i < treeCount; i++) {
        const standId = wasmMemory[i * 7]; // stand id as f64
        const x = wasmMemory[i * 7 + 1];      // x coordinate
        const y = wasmMemory[i * 7 + 2];  // y coordinate
        const species = wasmMemory[i * 7 + 3]; // species as f64
        const treeHeight = wasmMemory[i * 7 + 4]; // height as f64
        const treeStatus = wasmMemory[i * 7 + 5]; // status as f64
        const inBbox = wasmMemory[i * 7 + 6]; // inside_bbox as f64

        if (inBbox == 1) {
            console.log(`JAVASCRIPT Tree ${i}: stand=${standId}, x=${x}, y=${y}, species=${species}, height=${treeHeight}, status=${treeStatus}, inside_bbox=${inBbox}`);
        }
    }

    console.log(`Done logging ${treeCount} trees`);
}

document.getElementById('fileInput').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        handleFile(file);
    }
});
