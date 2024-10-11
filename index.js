import init, { geo_json_from_coords, SharedBuffer } from './pkg/geo_points_wasm.js';

async function handleFile(file) {
    const reader = new FileReader();

    reader.onload = async function (event) {
        const xmlContent = event.target.result;

        // Initialize the WebAssembly module
        const wasm = await init();
        const memory = wasm.memory;

        try {
            // Start timing
            const start = performance.now();

            // Example coordinates for the bounding box:
            /*
            const min_x = 25.347136232586948;
            const max_x = 25.42651387476916;
            const min_y = 66.42980392068148;
            const max_y = 66.46850960846054;
            
            const min_x = 25.40816481024935;
            const max_x = 25.40907894043688;
            const min_y = 66.44532693892663;
            const max_y = 66.44629687395998;
            */
            const min_x = 25.385360286471705;
            const max_x = 25.386342814842518;
            const min_y = 66.45444694596549;
            const max_y = 66.45536783229207;

            // Call the WebAssembly function with the XML content
            const result = await geo_json_from_coords(min_x, max_x, min_y, max_y, xmlContent);
            const geojson = result.geojson;
            const treeCount = result.tree_count;
            const maxTreeCount = result.max_tree_count;
            const bufferPtr = result.buffer_pointer;

            // Access the raw memory buffer directly using Float64Array
            //empty_function(xmlContent);
            const wasmMemory = new Float64Array(memory.buffer, Number(bufferPtr), maxTreeCount * 7);

            // End timing
            const end = performance.now();
            const duration = end - start;
            console.log(`JAVASCRIPT Time elapsed: ${duration} ms`);
            
            // Log the GeoJSON and tree data
            console.log('JAVASCRIPT GeoJson:', geojson);
            console.log('JAVASCRIPT Max tree count:', maxTreeCount);
            console.log('JAVASCRIPT Tree count:', treeCount);
            console.log('JAVASCRIPT Buffer Pointer:', bufferPtr);
            displayTrees(treeCount, wasmMemory);

            // Create a SharedBuffer instance and set the pointer to the buffer
            const sharedBuffer = new SharedBuffer(maxTreeCount);
            sharedBuffer.set_ptr(bufferPtr);

            // Cut 500 trees from the entire stand with id 920
            let treesToCut = 500;
            let standId = 920;
            
            // Call the WebAssembly method to cut the trees
            console.log(`JAVASCRIPT Let\'s cut some trees! Cutting ${treesToCut} trees from stand...`);
            sharedBuffer.forest_clearing(standId, treesToCut, treeCount);

            // Log the updated tree data
            displayTrees(treeCount, wasmMemory);
        } catch (error) {
            console.error('JAVASCRIPT Error:', error);
        }
    };

    reader.readAsText(file);
}

function displayTrees(treeCount, wasmMemory) {
    for (let i = 0; i < treeCount; i++) {
        const base = i * 7; // Calculate base index for the tree data
        const standId = wasmMemory[base]; // stand id as f64
        const x = wasmMemory[base + 1];      // x coordinate
        const y = wasmMemory[base + 2];      // y coordinate
        const species = wasmMemory[base + 3]; // species as f64
        const treeHeight = wasmMemory[base + 4]; // height as f64
        const treeStatus = wasmMemory[base + 5]; // status as f64
        const inBbox = wasmMemory[base + 6]; // inside_bbox as f64

        // Log only if the values are defined
        if (standId !== undefined && x !== undefined && y !== undefined && species !== undefined) {
            console.log(`JAVASCRIPT Tree ${i}: stand=${standId}, x=${x}, y=${y}, species=${species}, height=${treeHeight}, status=${treeStatus}`);
        } else {
            console.warn(`JAVASCRIPT Tree ${i} has undefined values.`);
        }
    }

    console.log(`JAVASCRIPT Done logging ${treeCount} trees`);
}

document.getElementById('fileInput').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        handleFile(file);
    }
});
