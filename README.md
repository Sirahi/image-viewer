<h1>Teeny-Tiny Image Viewer using THREEJS & Electron-React-BoilerPlate</h1>

<br>

## Installation

First, clone the repo via git and install dependencies:

```bash
git clone https://github.com/Sirahi/image-viewer.git your-project-name
cd your-project-name
yarn install
```

## Required Changes

Inside your project directory, Go to:

- `node_modules/tiff/lib-esm/tiffDecoder.js` and replace line **214** & **263** with <br>
`else if (bitDepth === 32 && (sampleFormat === 3 || sampleFormat[0] === 3)) {`

- `node_modules/jpeg-js/lib/decoder.js` and add following attribute in **image** object declared at line **1115** <br>
`channels: decoder.components.length`

## Starting Development

Start the app in the `dev` environment:

```bash
yarn start
```

## Packaging for Production

To package apps for the local platform:

```bash
yarn package
```
## Supported Formats & Bit-Depths per Channel

- JPG (8)
- TGA (8)
- PNG (8, 16)
- EXR (8, 16, 32)
- TIFF (8, 16, 32)
