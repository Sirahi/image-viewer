import { rejects } from 'assert';
import path from 'path';
const THREE = require('three');
const fs = require('fs');
const JPG = require('jpeg-js');
const PNG = require('fast-png');
const TIFF = require('tiff');
import { TGALoader } from './TGALoader.js';
import { EXRLoader } from './EXRLoader';

export function ImageLoader(url) {
  const ext = path.extname(url).toLowerCase();

  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return JPGTextureLoader(url, ext);
      break;
    case '.png':
      return PNGTextureLoader(url, ext);
      break;
    case '.tiff':
    case '.tif':
      return TIFFTextureLoader(url, ext);
      break;
    case '.tga':
      return TGATextureLoader(url, ext);
      break;
    case '.exr':
      return EXRTextureLoader(url, ext);
      break;
    default:
      return new Promise((resolve, reject) => {
        reject('File Format Not Supported');
      });
  }
}

function JPGTextureLoader(url, ext) {
  return new Promise((resolve, reject) => {
    fs.readFile(url, (err, data) => {
      if (err) reject(err);
      else {
        const {
          rawImgData,
          width,
          height,
          channels,
          bitDepth,
        } = getDataAndBitDepthAndChannels(JPG.decode(data));

        const texture = createDataTexture(
          rawImgData,
          width,
          height,
          channels,
          bitDepth,
          ext
        );

        texture.flipY = true;

        resolve({
          texture,
          channels,
          bitDepth,
          ext,
        });
      }
    });
  });
}

function PNGTextureLoader(url, ext) {
  return new Promise((resolve, reject) => {
    fs.readFile(url, (err, data) => {
      if (err) reject(err);
      else {
        const {
          rawImgData,
          width,
          height,
          channels,
          bitDepth,
        } = getDataAndBitDepthAndChannels(PNG.decode(data));

        const texture = createDataTexture(
          rawImgData,
          width,
          height,
          channels,
          bitDepth,
          ext
        );

        texture.flipY = true;

        resolve({
          texture,
          channels,
          bitDepth,
          ext,
        });
      }
    });
  });
}

function TIFFTextureLoader(url, ext) {
  return new Promise((resolve, reject) => {
    fs.readFile(url, (err, data) => {
      if (err) reject(err);
      else {
        const {
          rawImgData,
          width,
          height,
          channels,
          bitDepth,
        } = getDataAndBitDepthAndChannels(TIFF.decode(data)[0]);

        const texture = createDataTexture(
          rawImgData,
          width,
          height,
          channels,
          bitDepth,
          ext
        );

        texture.flipY = true;

        resolve({
          texture,
          channels,
          bitDepth,
          ext,
        });
      }
    });
  });
}

function TGATextureLoader(url, ext) {
  return new Promise((resolve, reject) => {
    const loader = new TGALoader();
    loader.load(
      url,
      (texture) => {
        resolve({
          texture,
          channels: texture.channels,
          bitDepth: texture.bitDepth,
          ext,
        });
      },
      undefined,
      (err) => {
        reject(err);
      }
    );
  });
}

function EXRTextureLoader(url, ext) {
  return new Promise((resolve, reject) => {
    const loader = new EXRLoader();
    loader.load(
      url,
      (texture) => {
        resolve({
          texture,
          channels: texture.channels,
          bitDepth: texture.bitDepth,
          ext,
        });
      },
      undefined,
      (err) => {
        reject(err);
      }
    );
  });
}

export function CheckerLoader(cbk) {
  const checkerLoader = new THREE.ImageBitmapLoader();
  checkerLoader.load(
    'E:\\Python-Tools\\ImageViewerJS\\checkerBoard.jpg',
    (texture) => {
      texture = new THREE.CanvasTexture(texture);
      cbk(texture);
    },
    undefined,
    (err) => {
      console.error('Error Loading Textures:', err);
    }
  );
}

function toHalfFloat(val) {
  var floatView = new Float32Array(1);

  floatView[0] = val;

  var int32View = new Int32Array(floatView.buffer);

  var x = int32View[0];

  var bits = (x >> 16) & 0x8000; /* Get the sign */
  var m = (x >> 12) & 0x07ff; /* Keep one extra bit for rounding */
  var e = (x >> 23) & 0xff; /* Using int is faster here */

  /* If zero, or denormal, or exponent underflows too much for a denormal
   * half, return signed zero. */
  if (e < 103) return bits;

  /* If NaN, return NaN. If Inf or exponent overflow, return Inf. */
  if (e > 142) {
    bits |= 0x7c00;
    /* If exponent was 0xff and one mantissa bit was set, it means NaN,
     * not Inf, so make sure we set one mantissa bit too. */
    bits |= (e == 255 ? 0 : 1) && x & 0x007fffff;
    return bits;
  }

  /* If exponent underflows but not too much, return a denormal */
  if (e < 113) {
    m |= 0x0800;
    /* Extra rounding may overflow and set mantissa to 0 and exponent
     * to 1, which is OK. */
    bits |= (m >> (114 - e)) + ((m >> (113 - e)) & 1);
    return bits;
  }

  bits |= ((e - 112) << 10) | (m >> 1);
  /* Extra rounding. An overflow will set mantissa to 0 and increment
   * the exponent, which is OK. */
  bits += m & 1;
  return bits;
}

function getDataAndBitDepthAndChannels(rawImg) {
  const rawImgData = rawImg.data;
  const width = rawImg.width || rawImg.imageWidth;
  const height = rawImg.height || rawImg.imageLength;
  const channels = rawImg.channels || rawImg.components;
  var bitDepth = 0;

  if (rawImg.data instanceof Uint8Array) {
    bitDepth = 8;
  } else if (rawImg.data instanceof Uint16Array) {
    bitDepth = 16;

    for (let i = 0; i < rawImg.data.length; i++) {
      rawImg.data[i] = toHalfFloat(rawImg.data[i]);
    }
  } else if (rawImg.data instanceof Float32Array) {
    bitDepth = 32;
  }

  return { rawImgData, width, height, channels, bitDepth };
}

function createDataTexture(data, width, height, channels, bitDepth, ext) {
  return new THREE.DataTexture(
    data,
    width,
    height,
    ext === '.jpg' || ext === '.jpeg'
      ? THREE.RGBAFormat
      : channels === 1
      ? THREE.RedFormat
      : channels === 3
      ? THREE.RGBFormat
      : THREE.RGBAFormat,
    bitDepth === 8
      ? THREE.UnsignedByteType
      : bitDepth === 16
      ? THREE.HalfFloatType
      : THREE.FloatType
  );
}
