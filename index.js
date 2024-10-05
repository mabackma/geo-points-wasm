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

            // Call the WebAssembly function with the XML content
            const result = await geo_json_from_coords(min_x, max_x, min_y, max_y, xmlContent);
            const geojson = result.geojson;
            const treeCount = result.tree_count;
            const maxTreeCount = result.max_tree_count;
            const bufferPtr = result.buffer_pointer;

            // Access the raw memory buffer directly using Float64Array
            const wasmMemory = new Float64Array(memory.buffer, Number(bufferPtr), maxTreeCount * 5);

            // End timing
            const end = performance.now();
            const duration = end - start;
            console.log(`Time elapsed: ${duration} ms`);
            
            // Log the GeoJSON and tree data
            console.log('GeoJson:', geojson);
            console.log('Max tree count:', maxTreeCount);
            console.log('Tree count:', treeCount);
            console.log('Buffer Pointer:', bufferPtr);

            let erroneousTrees = 0;
            for (let i = 0; i < treeCount; i++) {
                const x = wasmMemory[i * 5];      // x coordinate
                const y = wasmMemory[i * 5 + 1];  // y coordinate
                const species = wasmMemory[i * 5 + 2]; // species as f64
                const treeHeight = wasmMemory[i * 5 + 3]; // height as f64
                const treeStatus = wasmMemory[i * 5 + 4]; // status as f64

                if (species !== 0) {
                    console.log(`JAVASCRIPT Tree ${i}: x=${x}, y=${y}, species=${species}, height=${treeHeight}, status=${treeStatus}`);
                    if (!Number.isInteger(species) || x < min_x || x > max_x || y < min_y || y > max_y ) {
                        erroneousTrees++;
                    }   
                }             
            }

            console.log(`Done logging ${treeCount} trees`);
            console.log(`Erroneous trees: ${erroneousTrees}`);

            console.log('Let\'s cut some trees!');

            const sharedBuffer = new SharedBuffer(maxTreeCount);
            sharedBuffer.set_ptr(bufferPtr);
            cutTree(20, sharedBuffer, wasmMemory);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    reader.readAsText(file);
}

// Function to cut down a tree and mark it as a stump
function cutTree(index, sharedBuffer, wasmMemory) {
    // Call the WebAssembly method to cut the tree
    sharedBuffer.cut_tree(index);

    const x = wasmMemory[index * 5];
    const y = wasmMemory[index * 5 + 1];  
    const species = wasmMemory[index * 5 + 2];
    const treeHeight = wasmMemory[index * 5 + 3]; 
    const treeStatus = wasmMemory[index * 5 + 4]; // Get the updated tree status
    console.log(`JAVASCRIPT Tree ${index}: x=${x}, y=${y}, species=${species}, height=${treeHeight}, status=${treeStatus}`);
}

document.getElementById('fileInput').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        handleFile(file);
    }
});
