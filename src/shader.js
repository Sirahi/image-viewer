export function getVertexShader() {
  return [
    `
      varying vec2 vUv;

      void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
      `,
  ].join('\n');
}

export function getFragmentShader8Bit(checks) {
  return [
    checks.isGrayScale ? '#define IS_GRAYSCALE' : '',
    checks.rChannel ? '#define RCHANNEL' : '',
    checks.gChannel ? '#define GCHANNEL' : '',
    checks.bChannel ? '#define BCHANNEL' : '',
    checks.aChannel ? '#define ACHANNEL' : '',
    !(checks.rView || checks.gView || checks.bView || checks.aView)
      ? '#define DVIEW'
      : '',
    checks.rView ? '#define RVIEW' : '',
    checks.gView ? '#define GVIEW' : '',
    checks.bView ? '#define BVIEW' : '',
    checks.aView ? '#define AVIEW' : '',
    checks.checkerBoard ? '#define CHECKERBOARD' : '',
    `
        varying vec2 vUv;
        uniform sampler2D map;
        uniform sampler2D checkerMap;
        uniform vec2 tiling;

        void main() {
          vec4 tex = texture2D(map, vUv, 0.0);
          
          float red = 0.0;
          float green = 0.0;
          float blue = 0.0;
          float alpha = 1.0;

          #ifdef RCHANNEL
            red = tex.r;
          #endif
          
          #ifdef GCHANNEL
            green = tex.g;
          #endif
          
          #ifdef BCHANNEL
            blue = tex.b;
          #endif
          
          #ifdef ACHANNEL
            alpha = tex.a;
          #endif
          
          #ifdef IS_GRAYSCALE
            green = red;
            blue = red;
          #endif

          #ifdef CHECKERBOARD
            vec3 checkerBoard = texture2D(checkerMap, vec2(vUv * tiling), 0.0).rgb;
          #else
            vec3 checkerBoard = vec3(0.0);
          #endif
          
          #ifdef DVIEW
            gl_FragColor = vec4((vec3(red, green, blue) * alpha) + (checkerBoard * (1.0 - alpha)), 1.0);
          #endif

          #ifdef RVIEW
            gl_FragColor = vec4((vec3(red) * alpha) + (checkerBoard * (1.0 - alpha)), 1.0);
          #endif

          #ifdef GVIEW
            gl_FragColor = vec4((vec3(green) * alpha) + (checkerBoard * (1.0 - alpha)), 1.0);
          #endif

          #ifdef BVIEW
            gl_FragColor = vec4((vec3(blue) * alpha) + (checkerBoard * (1.0 - alpha)), 1.0);
          #endif

          #ifdef AVIEW
            gl_FragColor = vec4(vec3(alpha), 1.0);
          #endif
        }
        `,
  ].join('\n');
}

export function getFragmentShader16Bit(checks) {
  return [
    checks.isGrayScale ? '#define IS_GRAYSCALE' : '',
    checks.rChannel ? '#define RCHANNEL' : '',
    checks.gChannel ? '#define GCHANNEL' : '',
    checks.bChannel ? '#define BCHANNEL' : '',
    checks.aChannel ? '#define ACHANNEL' : '',
    !(checks.rView || checks.gView || checks.bView || checks.aView)
      ? '#define DVIEW'
      : '',
    checks.rView ? '#define RVIEW' : '',
    checks.gView ? '#define GVIEW' : '',
    checks.bView ? '#define BVIEW' : '',
    checks.aView ? '#define AVIEW' : '',
    checks.checkerBoard ? '#define CHECKERBOARD' : '',
    `
        varying vec2 vUv;
        uniform sampler2D map;
        uniform sampler2D checkerMap;
        uniform vec2 tiling;

        void main() {
          vec4 tex = texture2D(map, vUv, 0.0) / 65535.0;
          
          float red = 0.0;
          float green = 0.0;
          float blue = 0.0;
          float alpha = 1.0;

          #ifdef RCHANNEL
            red = tex.r;
          #endif
          
          #ifdef GCHANNEL
            green = tex.g;
          #endif
          
          #ifdef BCHANNEL
            blue = tex.b;
          #endif
          
          #ifdef ACHANNEL
            alpha = tex.a;
          #endif
          
          #ifdef IS_GRAYSCALE
            green = red;
            blue = red;
          #endif

          #ifdef CHECKERBOARD
            vec3 checkerBoard = texture2D(checkerMap, vec2(vUv * tiling), 0.0).rgb;
          #else
            vec3 checkerBoard = vec3(0.0);
          #endif
          
          #ifdef DVIEW
            gl_FragColor = vec4((vec3(red, green, blue) * alpha) + (checkerBoard * (1.0 - alpha)), 1.0);
          #endif

          #ifdef RVIEW
            gl_FragColor = vec4((vec3(red) * alpha) + (checkerBoard * (1.0 - alpha)), 1.0);
          #endif

          #ifdef GVIEW
            gl_FragColor = vec4((vec3(green) * alpha) + (checkerBoard * (1.0 - alpha)), 1.0);
          #endif

          #ifdef BVIEW
            gl_FragColor = vec4((vec3(blue) * alpha) + (checkerBoard * (1.0 - alpha)), 1.0);
          #endif

          #ifdef AVIEW
            gl_FragColor = vec4(vec3(alpha), 1.0);
          #endif
        }
        `,
  ].join('\n');
}

export function getFragmentShader32Bit(checks) {
  return [
    checks.isGrayScale ? '#define IS_GRAYSCALE' : '',
    checks.rChannel ? '#define RCHANNEL' : '',
    checks.gChannel ? '#define GCHANNEL' : '',
    checks.bChannel ? '#define BCHANNEL' : '',
    checks.aChannel ? '#define ACHANNEL' : '',
    !(checks.rView || checks.gView || checks.bView || checks.aView)
      ? '#define DVIEW'
      : '',
    checks.rView ? '#define RVIEW' : '',
    checks.gView ? '#define GVIEW' : '',
    checks.bView ? '#define BVIEW' : '',
    checks.aView ? '#define AVIEW' : '',
    checks.checkerBoard ? '#define CHECKERBOARD' : '',
    `
        varying vec2 vUv;
        uniform sampler2D map;
        uniform sampler2D checkerMap;
        uniform vec2 tiling;

        void main() {
          vec4 tex = pow(texture2D(map, vUv, 0.0), vec4(1.0/2.2));
          
          float red = 0.0;
          float green = 0.0;
          float blue = 0.0;
          float alpha = 1.0;

          #ifdef RCHANNEL
            red = tex.r;
          #endif
          
          #ifdef GCHANNEL
            green = tex.g;
          #endif
          
          #ifdef BCHANNEL
            blue = tex.b;
          #endif
          
          #ifdef ACHANNEL
            alpha = tex.a;
          #endif
          
          #ifdef IS_GRAYSCALE
            green = red;
            blue = red;
          #endif

          #ifdef CHECKERBOARD
            vec3 checkerBoard = texture2D(checkerMap, vec2(vUv * tiling), 0.0).rgb;
          #else
            vec3 checkerBoard = vec3(0.0);
          #endif
          
          #ifdef DVIEW
            gl_FragColor = vec4((vec3(red, green, blue) * alpha) + (checkerBoard * (1.0 - alpha)), 1.0);
          #endif

          #ifdef RVIEW
            gl_FragColor = vec4((vec3(red) * alpha) + (checkerBoard * (1.0 - alpha)), 1.0);
          #endif

          #ifdef GVIEW
            gl_FragColor = vec4((vec3(green) * alpha) + (checkerBoard * (1.0 - alpha)), 1.0);
          #endif

          #ifdef BVIEW
            gl_FragColor = vec4((vec3(blue) * alpha) + (checkerBoard * (1.0 - alpha)), 1.0);
          #endif

          #ifdef AVIEW
            gl_FragColor = vec4(vec3(alpha), 1.0);
          #endif
        }
        `,
  ].join('\n');
}
