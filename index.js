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
            const standId = 890; // Example stand ID
            const operationName = 1; // 1 for Cutting, 2 for Thinning, 3 for Simulation            
            const cuttingVolume = 50.0; // Example cutting volume
            const newStrata = null; // Example for no new strata

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

const areaPolygons = JSON.stringify(
    {
        "pointProperty": {
            "Point": {
                "coordinates": "428283.0164,7371032.3712"
            }
        },
        "polygonProperty": {
            "Polygon": {
                "exterior": {
                    "LinearRing": {
                        "coordinates": "428126.3826,7371086.9101 428130.3826,7371109.9101 428135.3826,7371134.9101 428143.3826,7371154.9101 428149.2554,7371170.7445 428210.9676,7371146.3844 428233.2396,7371127.8244 428244.3756,7371106.4803 428243.3793,7371094.816 428282.6128,7371095.0936 428302.4305,7371095.3106 428302.7691,7371095.0167 428313.1802,7371095.4283 428323.8257,7371095.5449 428336.0029,7371104.4979 428371.3456,7371099.8571 428384.3268,7371099.006 428386.684,7371030.027 428389.1444,7371012.6331 428381.0053,7370982.4565 428378.0703,7370973.5234 428365.0159,7370965.4239 428352.9519,7370958.9278 428341.2243,7370950.2382 428327.2753,7370940.8663 428313.7347,7370929.472 428300.227,7370913.3179 428287.5247,7370892.8691 428274.9835,7370881.4286 428263.7271,7370876.1894 428248.6887,7370870.3741 428231.4687,7370860.6526 428222.3012,7370851.8108 428215.1656,7370838.1166 428208.6996,7370822.6383 428204.7194,7370801.285 428201.3175,7370776.1484 428197.8928,7370750.512 428189.8579,7370728.0942 428180.5292,7370710.2441 428175.3582,7370695.7077 428172.4552,7370689.8071 428171.5272,7370682.383 428172.9192,7370676.351 428178.0232,7370668.463 428181.3213,7370661.9528 428181.5383,7370655.6023 428178.9512,7370650.8309 428174.9494,7370648.3942 428168.1004,7370646.4572 428162.4793,7370649.4721 428151.3068,7370662.511 428141.5321,7370678.7408 428141.5244,7370688.1516 428141.4464,7370700.3318 428147.685,7370714.7693 428157.8633,7370723.8148 428163.6456,7370729.8081 428170.9512,7370741.7414 428175.0544,7370754.8246 428173.9574,7370774.6598 428169.9066,7370790.1239 428163.47,7370802.6931 428160.6799,7370818.3492 428156.6049,7370827.8039 428146.7375,7370836.525 428131.9985,7370848.2262 428122.1096,7370861.957 428122.6005,7370872.703 428126.5552,7370882.5374 428133.3954,7370895.2435 428144.2117,7370912.7744 428154.8568,7370926.5566 428164.0242,7370935.3985 428173.907,7370943.4559 428179.4522,7370955.2202 428186.8035,7370968.1532 428193.2137,7370987.8914 428191.6259,7370996.9806 428186.677,7371009.2305 428178.7299,7371021.6192 428167.8187,7371034.8964 428153.4337,7371054.3448 428150.6778,7371070.7506 428151.9493,7371076.7908 428126.3826,7371086.9101"
                    }
                },
                "interior": [
                    {
                        "LinearRing": {
                            "coordinates": "428240.2155,7370915.0933 428246.9845,7370915.2809 428262.3413,7370922.5842 428277.0627,7370932.4213 428292.3067,7370942.735 428300.6675,7370950.362 428304.1211,7370954.71 428305.8144,7370958.8891 428306.5082,7370963.1144 428303.0457,7370969.5355 428296.7664,7370974.5844 428287.3288,7370976.2733 428269.7347,7370969.324 428253.003,7370959.3296 428242.2565,7370948.8077 428237.428,7370941.7685 428234.6315,7370930.8558 428234.2088,7370920.6305 428235.8436,7370918.0504 428240.2155,7370915.0933"
                        }
                    }
                ]
            }
        }
    }
); // Example polygons in PolygonGeometry format