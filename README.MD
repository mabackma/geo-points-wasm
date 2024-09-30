## Build WebAssembly Package from Rust

1. Place the `geo_points_wasm` and `geo_points` in the same folder
2. Run the following command to build the WebAssembly package:

   ```bash
   wasm-pack build --target web --release

## Run the Project Using Live Server

1. Install Live Server in VS Code
2. Click Go Live in VS Code. The project will be served at http://127.0.0.1:5500/