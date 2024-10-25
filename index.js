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

                const xValues = trees.x();
                const yValues = trees.y();
                const zValues = trees.z();
                const speciesValues = trees.species();
                const heightValues = trees.height();
                const statusValues = trees.status();
                const standNumberValues = trees.stand_number();

                const treeObject = new Trees(xValues, yValues, zValues, speciesValues, heightValues, statusValues, standNumberValues);
                treeObject.for_each(callback);
            }
            //25.38536028647170, 66.45444694596549, 25.386342814842518, 66.45536783229207
        }
    })

    const operationButton = document.createElement('button')

    operationButton.textContent = 'Create operation'

    operationButton.addEventListener('click', () => {

        if (forest) {
            // Define the parameters for the function call
            const standId = 1; // Example stand ID
            const operationName = 1; // 1 for Cutting, 2 for Thinning, 3 for Simulation

            const areaPolygons = JSON.stringify(
                {
                    "pointProperty": {
                        "Point": {
                            "coordinates": "427071.8189,7372655.762"
                        }
                    },
                    "polygonProperty": {
                        "Polygon": {
                            "exterior": {
                                "LinearRing": {
                                    "coordinates": "427419.21,7372458.78 427417.3,7372444.11 427420.29,7372426.7 427426.22,7372407.91 427435.42,7372389.46 427452.81,7372369.12 427460.26,7372361.76 427445.88,7372365.44 427423.94,7372373.73 427401.27,7372382.56 427378.79,7372390.13 427365.73,7372395.25 427359.68,7372400.04 427348.14,7372411.09 427332.13,7372434.37 427325.24,7372448.46 427316.05,7372461.65 427309.07,7372468.24 427299.82,7372474.43 427290.23,7372478.64 427279.49,7372479.4 427275.61,7372476.83 427267.61,7372482.96 427260.04,7372487.32 427252.54,7372487.93 427226.32,7372473.4 427202.17,7372460.28 427190.32,7372453.08 427168.22,7372446.62 427133.08,7372440.02 427101.19,7372433.27 427064.24,7372425.51 427046.79,7372422.08 427035.05,7372423.14 427027.22,7372427.26 427019.98,7372433.61 427015.03,7372440.6 427009.89,7372449.1 427003.15,7372455.42 426992.41,7372461.93 426982.07,7372466.17 426974.34,7372467.04 426967.95,7372464.34 426961.58,7372456.38 426957.15,7372447.08 426950.57,7372439.89 426944.58,7372434.92 426938.32,7372435.21 426929.2,7372438.65 426917.43,7372444.46 426904.82,7372454.06 426891.86,7372461.43 426880.98,7372464.7 426871.07,7372467.42 426864.33,7372467.98 426859.41,7372464.46 426854.84,7372457.67 426852.84,7372448.14 426852.84,7372438.86 426855.71,7372432.11 426847.33,7372429.75 426843.44,7372426.93 426840.52,7372423.32 426839.07,7372418.88 426838.49,7372411.4 426836.53,7372401.24 426833.89,7372398.36 426830.3,7372396.53 426823.23,7372395.36 426805.74,7372396.69 426779.95,7372397.41 426763.42,7372397.69 426754.92,7372398.34 426745.46,7372399.79 426739.74,7372400.81 426731.56,7372402.95 426725.14,7372405 426716.5,7372408.16 426703.06,7372415.8 426691.25,7372420.86 426681.36,7372418.33 426682.68,7372425.52 426687.09,7372434.32 426695.53,7372449.44 426696.08,7372456.17 426693.1,7372462.31 426685.79,7372467.16 426678.91,7372470.24 426675.46,7372471.65 426668.49,7372472.73 426661.3,7372474.57 426657.85,7372475.74 426649.58,7372481.38 426640.6,7372493.82 426637.37,7372499.98 426634.23,7372508.38 426630.25,7372520.33 426630.34,7372527.83 426633.12,7372533.96 426639.08,7372543.94 426649.19,7372556.97 426656.13,7372566.4 426665.82,7372570.2 426676.3,7372568.95 426683.87,7372570.09 426690.88,7372575.52 426693.69,7372582.39 426693.06,7372590.68 426688.85,7372597.38 426683.16,7372604.66 426674.25,7372607.33 426663.76,7372608.33 426652.4,7372606.36 426638.85,7372606.25 426624.16,7372608.45 426612.8,7372612.24 426603.39,7372620.44 426596.58,7372630.77 426589.46,7372645.37 426585.85,7372660.05 426588.4,7372666.69 426591.07,7372675.82 426594.25,7372690.93 426598.98,7372712.73 426605.43,7372733.69 426610.22,7372745.48 426619.91,7372760.28 426637.4,7372781.47 426640.68,7372782.07 426646.33,7372785.06 426653.84,7372795.96 426672.8,7372822.09 426681.05,7372815.94 426685.58,7372810.72 426691.29,7372803.7 426699.15,7372794.57 426707.8,7372786.15 426717.41,7372782.45 426728.88,7372780.9 426740.4,7372786.37 426751.4,7372796.86 426767.7,7372813.85 426787.82,7372832.17 426806.63,7372849.04 426821.53,7372857.1 426832.08,7372857.6 426838.2,7372854.31 426841.74,7372849.39 426843.43,7372842.3 426845.41,7372830.45 426847.19,7372819.85 426851.25,7372815.41 426860.3,7372815.98 426870.12,7372822.52 426875.83,7372832.51 426881.33,7372849.02 426888.36,7372860.45 426894.46,7372862.41 426898.67,7372861.21 426903.23,7372856.49 426905.97,7372850.61 426906.18,7372844.09 426904.31,7372835.92 426896.44,7372811.27 426898.33,7372808.68 426902.06,7372808 426905.2,7372810.86 426909.57,7372818.91 426914.86,7372830.67 426923.29,7372845.53 426935.68,7372870.22 426961.32,7372915.69 427006.33,7372896.91 427020.93,7372890.93 427387.51,7372752.05 427359.16,7372691.82 427356.95,7372675.91 427362.76,7372665.63 427377.18,7372651.69 427407.36,7372637 427433.67,7372625.5 427451.87,7372617.63 427467.31,7372609 427441.01,7372610.14 427422.24,7372611.02 427402.84,7372608.69 427387.28,7372608.42 427372.45,7372607.62 427359.16,7372607.5 427346.74,7372604.33 427342.28,7372600.04 427335.13,7372585.86 427326.01,7372566.78 427321.93,7372553.96 427322.27,7372544.93 427325.69,7372531.51 427334.6,7372517.83 427347.59,7372505.45 427367.43,7372489.5 427385.72,7372477.88 427398.24,7372472.03 427401.93,7372470.36 427419.21,7372458.78"
                                }
                            },
                            "interior": [
                                {
                                    "LinearRing": {
                                        "coordinates": "427118.643,7372647.5437 427088.27,7372653.45 427070.98,7372654.19 427060.98,7372579.19 427096.8314,7372573.4538 427118.643,7372647.5437"
                                    }
                                },
                                {
                                    "LinearRing": {
                                        "coordinates": "426872.26,7372701.82 426854.92,7372706.64 426835.4,7372707.31 426820.57,7372706.51 426813.39,7372702.85 426808.37,7372697.08 426805.41,7372686.96 426805.65,7372675.44 426809.44,7372665 426810.69,7372659.19 426809.18,7372653.5 426804.61,7372646.71 426796.13,7372636.35 426789.15,7372631.68 426779.96,7372627.86 426766,7372624.01 426757.3,7372620.17 426748.01,7372614.1 426743.53,7372609.31 426739.39,7372600.75 426738.56,7372593.53 426739.22,7372585.74 426742.19,7372579.35 426747.46,7372573.85 426754.58,7372570.51 426773.13,7372564.88 426794.04,7372555.88 426803.54,7372549.68 426806.17,7372541.04 426806.78,7372532.26 426811.17,7372524.04 426817.68,7372518.23 426828.47,7372512.72 426845.15,7372510.18 426862.36,7372513.87 426877.2,7372520.42 426895.13,7372523.33 426906.13,7372528.31 426910.33,7372532.62 426919.89,7372561.44 426925.77,7372569.67 426931.13,7372571.67 426938.92,7372572.06 426947.4,7372571.15 426969.47,7372565.86 426985.28,7372566.11 426992.74,7372570.26 426998.21,7372575.01 427003.14,7372584.28 427005.96,7372596.91 427007.47,7372613.86 427003.76,7372620.79 426996.98,7372626.11 426981,7372633.12 426972.17,7372637.54 426966.16,7372643.33 426955.59,7372659.09 426944.51,7372669.38 426935.9,7372673.04 426916.19,7372680.72 426901.88,7372685.9 426894.22,7372688.52 426891.8,7372690.38 426886.01,7372695.41 426872.26,7372701.82"
                                    }
                                }
                            ]
                        }
                    }
                }
            ); // Example polygons in PolygonGeometry format
            
            const cuttingVolume = 15.5; // Example cutting volume
            const newStrata = null; // Example for no new strata

            forest.set_operation(standId, operationName, areaPolygons, cuttingVolume, newStrata);
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
