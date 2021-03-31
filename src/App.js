import React, { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import icon from '../assets/icon.svg';
import './App.global.css';
const THREE = require('three');
const dat = require('dat.gui');
import {
  getVertexShader,
  getFragmentShader8Bit,
  getFragmentShader16Bit,
  getFragmentShader32Bit,
} from './shader.js';
import { ImageLoader, CheckerLoader } from './Loader.js';

function Hello(props) {
  const mount = useRef();

  const fileUri =
    // 'E:\\Python-Tools\\TestFormats\\Cracked Nordic Beach Ground_vdymaajqx\\dasdsds_4K__vdymaajqx.tga';
    'E:\\Python-Tools\\TestFormats\\Huge Canyon Sandstone Mesa_vceicdsga\\test16RGBA_2K__vceicdsga.png';

  var isGrayScale = false;
  var isRGB = false;
  var isRGBA = false;

  var rChannel = true;
  var gChannel = true;
  var bChannel = true;
  var aChannel = true;

  var checkerBoard = true;

  var channels;
  var bitDepth;
  var scaleValue = 1.0;

  var isDragging = false;

  var previousMousePosition = {
    x: 0,
    y: 0,
  };

  const { renderer, scene, camera, sprite, borderSprite } = init();

  function init() {
    const canvas = document.createElement('canvas');

    const context = canvas.getContext('webgl2', {
      alpha: true,
      antialias: true,
    });

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      context: context,
      powerPreference: 'high-performance',
    });

    const scene = new THREE.Scene();

    const fov = 35;
    const aspect = 1;
    const near = 0.001;
    const far = 100.0;

    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

    camera.position.x = 0.0;
    camera.position.y = 0.0;
    camera.position.z = 1.7;

    const sprite = new THREE.Sprite(null);
    const borderSprite = new THREE.Sprite(
      new THREE.SpriteMaterial({ color: 0xffffff })
    );

    scene.add(sprite);

    window.addEventListener('resize', resizeCanvasToDisplaySize);
    renderer.domElement.addEventListener('wheel', mouseWheel, false);
    document.addEventListener('mouseup', mouseUp, false);
    document.addEventListener('mousemove', mouseMove, false);
    renderer.domElement.addEventListener('mousedown', mouseDown, false);

    return { renderer, scene, camera, sprite, borderSprite };
  }

  function initGUI() {
    var options = {
      'Reset Zoom': function () {
        camera.position.z = 1.7;

        scaleValue = getValue(camera.position.z);

        sprite.material.uniforms.tiling.value.x = sprite.scale.x * scaleValue;
        sprite.material.uniforms.tiling.value.y = sprite.scale.y * scaleValue;
        sprite.material.needsUpdate = true;

        animate();
      },
      'Reset Position': function () {
        camera.position.x = 0.0;
        camera.position.y = 0.0;

        animate();
      },
    };

    var gui = new dat.GUI();

    var parameters = {
      r: true,
      g: true,
      b: true,
      a: true,
      drawBorder: false,
      bg: 'Checkered',
    };

    var colorChannels = gui.addFolder('Color Channels');
    colorChannels
      .add(parameters, 'r')
      .name(isGrayScale ? 'Gray' : 'Red Channel')
      .listen()
      .onChange(() => {
        rChannel = parameters.r;
        updateShader();
      });
    !isGrayScale &&
      colorChannels
        .add(parameters, 'g')
        .name('Green Channel')
        .listen()
        .onChange(() => {
          gChannel = parameters.g;
          updateShader();
        });
    !isGrayScale &&
      colorChannels
        .add(parameters, 'b')
        .name('Blue Channel')
        .listen()
        .onChange(() => {
          bChannel = parameters.b;
          updateShader();
        });
    isRGBA &&
      colorChannels
        .add(parameters, 'a')
        .name('Alpha Channel')
        .listen()
        .onChange(() => {
          aChannel = parameters.a;
          updateShader();
        });

    var viewportOptions = gui.addFolder('Viewport Options');
    viewportOptions
      .add(parameters, 'drawBorder')
      .name('Draw Border')
      .listen()
      .onChange(() => {
        if (parameters.drawBorder) scene.add(borderSprite);
        else scene.remove(borderSprite);
        animate();
        updateShader();
      });
    viewportOptions
      .add(parameters, 'bg', ['Checkered', 'Solid Color'])
      .name('Background')
      .listen()
      .onChange(() => {
        if (parameters.bg == 'Checkered') {
          checkerBoard = true;
          updateShader();
        } else {
          checkerBoard = false;
          updateShader();
        }
      });
    viewportOptions.add(options, 'Reset Zoom');
    viewportOptions.add(options, 'Reset Position');

    gui.width = 205;
  }

  function resizeCanvasToDisplaySize() {
    const canvas = renderer.domElement;

    const desiredWidthInCSSPixels = window.innerWidth;
    const desiredHeightInCSSPixels = window.innerHeight;

    const devicePixelRatio = window.devicePixelRatio;

    mount.current.style.width = desiredWidthInCSSPixels + 'px';
    mount.current.style.height = desiredHeightInCSSPixels + 'px';

    mount.current.width = desiredWidthInCSSPixels;
    mount.current.height = desiredHeightInCSSPixels;

    canvas.style.width = desiredWidthInCSSPixels + 'px';
    canvas.style.height = desiredHeightInCSSPixels + 'px';

    canvas.width = desiredWidthInCSSPixels;
    canvas.height = desiredHeightInCSSPixels;

    renderer.setSize(desiredWidthInCSSPixels, desiredHeightInCSSPixels, false);
    renderer.setPixelRatio(devicePixelRatio);

    camera.aspect = desiredWidthInCSSPixels / desiredHeightInCSSPixels;
    camera.updateProjectionMatrix();

    animate();
  }

  function getRelevantFragmentShader() {
    const shaderChecks = {
      isGrayScale,
      rChannel,
      gChannel: !isGrayScale && gChannel,
      bChannel: !isGrayScale && bChannel,
      aChannel: isRGBA && aChannel,
      rView: !(gChannel || bChannel),
      gView: !(rChannel || bChannel),
      bView: !(rChannel || gChannel),
      aView: aChannel && isRGBA && !(rChannel || gChannel || bChannel),
      checkerBoard: isRGBA && checkerBoard,
    };

    return bitDepth === 8
      ? getFragmentShader8Bit(shaderChecks)
      : bitDepth === 16
      ? getFragmentShader16Bit(shaderChecks)
      : getFragmentShader32Bit(shaderChecks);
  }

  function animate() {
    renderer.render(scene, camera);
  }

  function onLoad() {
    if (scene.children[0].material.uniforms.checkerMap.value === null) {
      setTimeout(() => {
        onLoad();
      }, 100);
      return;
    }
    resizeCanvasToDisplaySize();
    window.requestAnimationFrame(animate);
  }

  function updateShader() {
    sprite.material.fragmentShader = getRelevantFragmentShader();
    sprite.material.needsUpdate = true;
    animate();
  }

  function mouseWheel(e) {
    e.preventDefault();
    const minDistance = 0.05;
    const maxDistance = 5;
    let zoomVal =
      ((camera.position.z - minDistance) / (maxDistance - minDistance)) *
        (0.2 - 0.04) +
      0.04;

    const speed = Math.sign(e.deltaY);

    if (speed == 1) {
      camera.position.z += 0.05;
      camera.position.z = Math.min(maxDistance, camera.position.z);
    }

    if (speed == -1) {
      camera.position.z -= 0.05;
      camera.position.z = Math.max(minDistance, camera.position.z);
    }

    scaleValue = getValue(camera.position.z);

    sprite.material.uniforms.tiling.value.x = sprite.scale.x * scaleValue;
    sprite.material.uniforms.tiling.value.y = sprite.scale.y * scaleValue;

    sprite.material.needsUpdate = true;

    animate();
  }

  function mouseUp(e) {
    isDragging = false;
  }

  function mouseDown(e) {
    isDragging = true;
    previousMousePosition = {
      x: e.clientX,
      y: e.clientY,
    };
    e.stopPropagation();
    e.preventDefault();
  }

  function mouseMove(e) {
    var deltaMove = {
      x: e.clientX - previousMousePosition.x,
      y: e.clientY - previousMousePosition.y,
    };

    if (deltaMove.x == 0 && deltaMove.y == 0) {
      return;
    }

    if (isDragging) {
      camera.position.x -=
        (deltaMove.x / renderer.domElement.width) *
        getDragValue(camera.position.z);
      camera.position.x = Math.min(0.5, camera.position.x);
      camera.position.x = Math.max(-0.5, camera.position.x);

      camera.position.y +=
        (deltaMove.y / renderer.domElement.height) *
        getDragValue(camera.position.z);
      camera.position.y = Math.min(0.5, camera.position.y);
      camera.position.y = Math.max(-0.5, camera.position.y);
      animate();
    }

    previousMousePosition = {
      x: e.clientX,
      y: e.clientY,
    };
  }

  function getDragValue(zoom) {
    var value = 1.0;

    if (zoom < 0.25) {
      value = 0.03;
    } else if (zoom < 0.5) {
      value = 0.05;
    } else if (zoom < 0.75) {
      value = 0.1;
    } else if (zoom < 1.0) {
      value = 0.2;
    } else if (zoom < 2.0) {
      value = 0.4;
    } else if (zoom < 3.0) {
      value = 0.8;
    } else if (zoom < 4.0) {
      value = 1.6;
    } else if (zoom < 5.0) {
      value = 3.2;
    }

    return value;
  }

  function getValue(zoom) {
    var value = 0.1;

    if (zoom < 0.125) {
      value = 18.0;
    } else if (zoom < 0.25) {
      value = 12.0;
    } else if (zoom < 0.5) {
      value = 8.0;
    } else if (zoom < 0.75) {
      value = 5.0;
    } else if (zoom < 1.0) {
      value = 3.0;
    } else if (zoom < 1.25) {
      value = 1.4;
    } else if (zoom < 1.5) {
      value = 1.2;
    } else if (zoom < 1.75) {
      value = 1.0;
    } else if (zoom < 2.0) {
      value = 0.8;
    } else if (zoom < 2.25) {
      value = 0.7;
    } else if (zoom < 2.5) {
      value = 0.6;
    } else if (zoom < 3.0) {
      value = 0.5;
    } else if (zoom < 3.5) {
      value = 0.4;
    } else if (zoom < 4.0) {
      value = 0.3;
    } else if (zoom < 4.5) {
      value = 0.2;
    } else if (zoom < 5.0) {
      value = 0.1;
    }

    return value;
  }

  useEffect(() => {
    mount.current.appendChild(renderer.domElement);

    const loader = new THREE.ImageBitmapLoader();
    loader.setOptions({ imageOrientation: 'flipY' });

    const material = new THREE.ShaderMaterial({
      uniforms: {
        map: { type: 't', value: null },
        checkerMap: { type: 't', value: null },
        tiling: { type: 'vec2', value: new THREE.Vector2(1.0, 1.0) },
      },
      vertexShader: getVertexShader(),
      fragmentShader: null,
    });

    sprite.material = material;

    CheckerLoader((texture) => {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      material.uniforms.checkerMap.value = texture;
    });

    ImageLoader(fileUri)
      .then((img) => {
        const { texture } = img;

        channels = img.channels;
        bitDepth = img.bitDepth;

        isGrayScale = channels === 1;
        isRGB = channels === 3;
        isRGBA = channels === 4;

        initGUI();

        texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
        texture.minFilter = texture.magFilter = THREE.LinearFilter;

        material.uniforms.map.value = texture;

        material.fragmentShader = getRelevantFragmentShader();

        sprite.material = material;

        sprite.scale.x = texture.image.width;
        sprite.scale.y = texture.image.height;

        let boundingBox = new THREE.Box3();
        boundingBox.setFromObject(sprite);

        let size = boundingBox.getSize();

        let maxDim = Math.max(size.x, size.y, size.z);

        sprite.scale.x = sprite.scale.x / maxDim;
        sprite.scale.y = sprite.scale.y / maxDim;
        sprite.scale.z = sprite.scale.z / maxDim;

        borderSprite.scale.x = sprite.scale.x + 0.01;
        borderSprite.scale.y = sprite.scale.y + 0.01;
        borderSprite.scale.z = sprite.scale.z + 0.01;

        borderSprite.position.z = -0.01;

        scaleValue = getValue(camera.position.z);

        sprite.material.uniforms.tiling.value.x = sprite.scale.x * scaleValue;
        sprite.material.uniforms.tiling.value.y = sprite.scale.y * scaleValue;

        onLoad();
      })
      .catch((err) => {
        console.error(err);
      });

    return () => {
      window.removeEventListener('resize', resizeCanvasToDisplaySize);
      renderer.domElement.removeEventListener('wheel', mouseWheel);
      document.removeEventListener('mouseup', mouseUp);
      document.removeEventListener('mousemove', mouseMove);
      renderer.domElement.removeEventListener('mousedown', mouseDown);
    };
  });

  return <div ref={mount} style={{ backgroundColor: '#202020' }} />;
}

export default function App() {
  return (
    <Router>
      <Switch>
        <Route path="/" component={Hello} />
      </Switch>
    </Router>
  );
}
