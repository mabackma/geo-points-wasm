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

            // Example coordinates for the bounding box
            /*
            const min_x = 25.347136232586948;
            const max_x = 25.42651387476916;
            const min_y = 66.42980392068148;
            const max_y = 66.46850960846054;
            */
            const min_x = 25.37992580430022;
            const max_x = 25.39148329862563;
            const min_y = 66.4536396062254;
            const max_y = 66.45570515162402;

            // Call the WebAssembly function with the XML content
            const result = await geo_json_from_coords(min_x, max_x, min_y, max_y, xmlContent);
            const geojson = result.geojson;
            const treeCount = result.tree_count;
            const maxTreeCount = result.max_tree_count;
            const bufferPtr = result.buffer_pointer;

            // Access the raw memory buffer directly using Float64Array
            const wasmMemory = new Float64Array(memory.buffer, Number(bufferPtr), maxTreeCount * 3);

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
            for (let i = 0; i < wasmMemory.length / 3; i++) {
                const x = wasmMemory[i * 3];      // x coordinate
                const y = wasmMemory[i * 3 + 1];  // y coordinate
                const species = wasmMemory[i * 3 + 2]; // species as f64

                if (species !== 0) {
                    console.log(`JAVASCRIPT Tree ${i}: x=${x}, y=${y}, tree species=${species}`);
                    if (!Number.isInteger(species) || x < min_x || x > max_x || y < min_y || y > max_y) {
                        erroneousTrees++;
                    }   
                }             
            }

            console.log(`Done logging ${treeCount} trees`);
            console.log(`Erroneous trees: ${erroneousTrees}`);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    reader.readAsText(file);
}

document.getElementById('fileInput').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        handleFile(file);
    }
});
