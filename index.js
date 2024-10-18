import init, { /* geo_json_from_coords, */ VirtualForest,/*  get_area_ratio, empty_function, SharedBuffer */ } from './pkg/geo_points_wasm.js';

let memory
let forest

window.addEventListener('DOMContentLoaded', async () => {

    const wasm = await init()

    memory = wasm.memory;

    const jsonState = localStorage.getItem('current_virtual_forest')
    if (jsonState) {
        
        forest = VirtualForest.from_json(jsonState)
        
    }

    const div = document.createElement('div')

    const button = document.createElement('button')

    button.textContent = 'hae tilat'

    button.addEventListener('click', () => {

        if (forest) {


            div.textContent = "tilat: " + forest.get_realestates().map(r => r.id).join('')

        }
    })

    const generateInput = document.createElement('textarea')



    const generateButton = document.createElement('button')

    generateButton.textContent = 'Generoi puut BBOX:n sisällä'



    generateButton.addEventListener('click', () => {

        if (forest) {

            console.log(generateInput.value)

            const [
                min_x,
                max_x,
                min_y,
                max_y
            ] = generateInput.value.split(',').map(val => +val.trim())

            console.log(min_x, max_x, min_y, max_y)
            if (min_x && max_x && min_y && max_y) {

                const trees = forest.generate_trees_bbox(
                    min_x,
                    max_x,
                    min_y,
                    max_y,
                )

                console.log(trees)
            }

        }
    })

    document.body.append(div, button, generateButton, generateInput)


    if (forest) {
        const min_x = 25.347136232586948;
        const max_x = 25.42651387476916;
        const min_y = 66.42980392068148;
        const max_y = 66.46850960846054;


        const result = await forest.geo_json_from_coords(min_x, max_x, min_y, max_y);

        console.log(result)
    }

})

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    a.download = filename || 'download';

    const clickHandler = () => {
        setTimeout(() => {
            URL.revokeObjectURL(url);
            removeEventListener('click', clickHandler);
        }, 150);
    };

    a.addEventListener('click', clickHandler, false);

    a.click()
    // return a;
}

async function handleFile(file) {
    const reader = new FileReader();

    reader.onload = async function (event) {
        const xmlContent = event.target.result;

        // Initialize the WebAssembly module
        /*         const wasm = await init();
        const memory = wasm.memory; */

        try {
            forest = new VirtualForest(xmlContent)

            await forest.get_infrastructure(xmlContent);

            const jsonState = forest.to_json()

            localStorage.setItem('current_virtual_forest', jsonState)

            console.log(jsonState)

            return

            const realEstates = forest.get_realestates()

            console.log(realEstates)

            const selected = forest.get_selected_realestate()

            console.log(selected)

            // Start timing

            const start = performance.now();

            // Example coordinates for the bounding box:

            const min_x = 25.347136232586948;
            const max_x = 25.42651387476916;
            const min_y = 66.42980392068148;
            const max_y = 66.46850960846054;

            /*  const min_x = 25.40816481024935;
             const max_x = 25.40907894043688;
             const min_y = 66.44532693892663;
             const max_y = 66.44629687395998;
             */
            /*  const min_x = 25.385360286471705;
             const max_x = 25.386342814842518;
             const min_y = 66.45444694596549;
             const max_y = 66.45536783229207;
  */
            // Call the WebAssembly function with the XML content
            const result = await forest.geo_json_from_coords(min_x, max_x, min_y, max_y);

            console.log(result)

            const min_x_trees = 25.385360286471705;
            const max_x_trees = 25.386342814842518;
            const min_y_trees = 66.45444694596549;
            const max_y_trees = 66.45536783229207;

            const trees2 = forest.generate_trees_bbox(
                min_x_trees,
                max_x_trees,
                min_y_trees,
                max_y_trees
            )

            const trees = forest.generate_trees_bbox(25.369502667296388, 25.41447876318668, 66.44457253971609, 66.46136389664892)
            console.log(trees)

            let arr = []
            for (let i = 0; i < trees.length; i += 7) {
                arr.push(Array(7).fill(0).map((_, v) => trees[i + v]).join(';'))
                // console.log(trees[i])
            }
            const csv = arr.join(';\n')

            const blobJson = new Blob([result], {
                type: "application/json",
            });

            const blob = new Blob([csv], {
                type: "text/csv",
            });
            downloadBlob(blobJson, 'map.json')

            downloadBlob(blob, 'trees.csv')

            //console.log(trees2)

            return
            /*             const geojson = result.geojson;
                        const treeCount = result.tree_count;
                        const maxTreeCount = result.max_tree_count;
                        const bufferPtr = result.buffer_pointer;
                         */
            // Cut 500 trees from the entire stand with id 920
            let treesToCut = 500;
            let standId = 920;

            // Get area ratio of the stand
            /*   let areaRatio = get_area_ratio(xmlContent, standId, min_x, max_x, min_y, max_y); */

            // Access the raw memory buffer directly using Float64Array
            //empty_function(xmlContent);
            /* const wasmMemory = new Float64Array(memory.buffer, Number(bufferPtr), maxTreeCount * 6); */

            /*             console.log('JAVASCRIPT Memory Contents Before empty_function:');
                        for (let i = 0; i < maxTreeCount * 6; i++) {
                            console.log(`JS Memory[${i}]:`, wasmMemory[i]);
                        }
             */
            /*          empty_function(xmlContent);
         
                     console.log('Memory Contents After empty_function:');
                     for (let i = 0; i < maxTreeCount * 6; i++) {
                         console.log(`JS Memory[${i}]:`, wasmMemory[i]);
                     }
          */
            // End timing
            const end = performance.now();
            const duration = end - start;
            console.log(`JAVASCRIPT Time elapsed: ${duration} ms`);

            // Log the GeoJSON and tree data
            console.log('JAVASCRIPT GeoJson:', geojson);
            console.log('JAVASCRIPT Max tree count:', maxTreeCount);
            console.log('JAVASCRIPT Tree count:', treeCount);
            console.log('JAVASCRIPT Buffer Pointer:', bufferPtr);
            /*             displayTrees(treeCount, wasmMemory); */

            // Create a SharedBuffer instance and set the pointer to the buffer
            const sharedBuffer = new SharedBuffer(maxTreeCount);
            sharedBuffer.set_ptr(bufferPtr);

            // Call the WebAssembly method to cut the trees
            console.log(`JAVASCRIPT Let\'s cut some trees! Cutting ${treesToCut} trees from stand...`);
            sharedBuffer.forest_clearing(standId, treesToCut, treeCount, areaRatio);

            console.log('JAVASCRIPT SharedBuffer from RUST log function:');
            sharedBuffer.log_buffer();

            // Log the updated tree data
            /*       displayTrees(treeCount, wasmMemory); */
        } catch (error) {
            console.error('JAVASCRIPT Error:', error);
        }
    };

    reader.readAsText(file);
}

function displayTrees(treeCount, wasmMemory) {
    for (let i = 0; i < treeCount; i++) {
        const base = i * 6; // Calculate base index for the tree data
        const standId = wasmMemory[base]; // stand id as f64
        const x = wasmMemory[base + 1];      // x coordinate
        const y = wasmMemory[base + 2];      // y coordinate
        const species = wasmMemory[base + 3]; // species as f64
        const treeHeight = wasmMemory[base + 4]; // height as f64
        const treeStatus = wasmMemory[base + 5]; // status as f64

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
