import { treeStrataExample, areaPolygonsExample } from './testData.js';
import init, { VirtualForest, Trees } from './pkg/geo_points_wasm.js';

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

                printTrees(trees);
            }
            //25.38536028647170, 66.45444694596549, 25.386342814842518, 66.45536783229207
        }
    })

    const operationButton = document.createElement('button')

    operationButton.textContent = 'Create operation'

    operationButton.addEventListener('click', () => {

        if (forest) {
            // Define the parameters for the function call
            const standId = 2008; // Example stand ID
            const operationName = 2; // 1 for Cutting, 2 for Thinning, 3 for Simulation            
            const cuttingVolume = 50.0; // Example cutting volume
            const newStrata = treeStrataExample; // Example tree strata in TreeStrata format
            const areaPolygons = areaPolygonsExample; // Example polygons in PolygonGeometry format
            
            forest.set_operation(standId, operationName, areaPolygons, cuttingVolume, newStrata);

            const trees = forest.generate_trees_bbox(
                25.38536028647170, 
                66.45444694596549, 
                25.386342814842518, 
                66.45536783229207
            )

            printTrees(trees);
        }
    })

    document.body.append(div, button, generateButton, generateInput, operationButton)


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

function callback(treeArgs) {
    // Unpack the arguments from the array
    const x = treeArgs[0];
    const y = treeArgs[1];
    const z = treeArgs[2];
    const species = treeArgs[3];
    const height = treeArgs[4];
    const status = treeArgs[5];
    const stand_number = treeArgs[6];
    
    console.log(x, y, z, species, height, status, stand_number);
}

function printTrees(trees) {
    const xValues = trees.x();
    const yValues = trees.y();
    const zValues = trees.z();
    const speciesValues = trees.species();
    const heightValues = trees.height();
    const statusValues = trees.status();
    const standNumberValues = trees.stand_number();

    const treesObject = new Trees(xValues, yValues, zValues, speciesValues, heightValues, statusValues, standNumberValues);
    treesObject.for_each(callback);
}

async function handleFile(file) {
    const reader = new FileReader();

    reader.onload = async function (event) {
        const xmlContent = event.target.result;

        try {
            forest = new VirtualForest(xmlContent)

            await forest.get_infrastructure(xmlContent);

            const jsonState = forest.to_json()

            localStorage.setItem('current_virtual_forest', jsonState)

            //console.log(jsonState)
            
            const realEstates = forest.get_realestates()

            //console.log(realEstates)

            const selected = forest.get_selected_realestate()

            //console.log(selected)

            const stand = forest.get_stand_by_id("2553942")

            console.log(stand)

        } catch (error) {
            console.error('JAVASCRIPT Error:', error);
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

