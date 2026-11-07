/* ==========================================================================
   SUDHAN.DEV — Three.js scenes
   1) Hero: floating developer workstation, code screen, particles, holo symbols
   2) About: interactive profile object
   Optimised for mobile, paused off-screen, static under reduced motion.
   ========================================================================== */
(function () {
  'use strict';

  if (!window.THREE) {
    document.documentElement.classList.add('no-webgl');
    return;
  }

  var THREE = window.THREE;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  var heroCanvas = document.getElementById('heroCanvas');
  var aboutCanvas = document.getElementById('aboutCanvas');

  function supportsWebGL() {
    try {
      var test = document.createElement('canvas');
      return Boolean(window.WebGLRenderingContext && (test.getContext('webgl') || test.getContext('experimental-webgl')));
    } catch (error) {
      return false;
    }
  }

  if (!supportsWebGL() || !heroCanvas) {
    document.documentElement.classList.add('no-webgl');
    return;
  }

  var clock = new THREE.Clock();
  var hero = null;
  var about = null;
  var heroVisible = true;
  var aboutVisible = false;
  var pointer = { x: 0, y: 0 };
  var pointerTarget = { x: 0, y: 0 };
  var viewport = { w: window.innerWidth, h: window.innerHeight };
  var mobile = viewport.w < 720;
  var tablet = viewport.w >= 720 && viewport.w < 1080;

  /* ---------------------------------------------------------------------
     Shared helpers
     --------------------------------------------------------------------- */
  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }

  function roundedRectShape(width, height, radius) {
    var shape = new THREE.Shape();
    var x = -width / 2;
    var y = -height / 2;
    var r = Math.min(radius, width / 2, height / 2);
    shape.moveTo(x + r, y);
    shape.lineTo(x + width - r, y);
    shape.quadraticCurveTo(x + width, y, x + width, y + r);
    shape.lineTo(x + width, y + height - r);
    shape.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    shape.lineTo(x + r, y + height);
    shape.quadraticCurveTo(x, y + height, x, y + height - r);
    shape.lineTo(x, y + r);
    shape.quadraticCurveTo(x, y, x + r, y);
    return shape;
  }

  /* Returns a rounded box geometry with meaningful width / height / depth. */
  function roundedBox(width, height, depth, radius) {
    var shape = roundedRectShape(width, depth, radius);
    var geometry = new THREE.ExtrudeGeometry(shape, {
      depth: height,
      bevelEnabled: true,
      bevelSize: 0.012,
      bevelThickness: 0.012,
      bevelSegments: 2,
      curveSegments: 6
    });
    geometry.rotateX(-Math.PI / 2);
    geometry.center();
    return geometry;
  }

  function addEdges(mesh, color, opacity) {
    var edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(mesh.geometry),
      new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: opacity || 0.2, depthWrite: false })
    );
    mesh.add(edges);
    return edges;
  }

  function makeCanvasTexture(width, height, draw) {
    var canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    var ctx = canvas.getContext('2d');
    draw(ctx, width, height);
    var texture = new THREE.CanvasTexture(canvas);
    /* Canvas pixels are authored in sRGB. Without this the renderer treats
       them as linear and the whole scene washes out to pale blue. */
    texture.encoding = THREE.sRGBEncoding;
    texture.anisotropy = 4;
    return texture;
  }

  function roundRect(ctx, x, y, w, h, r) {
    var radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    ctx.lineTo(x + radius, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  /* ---------------------------------------------------------------------
     Hero textures
     --------------------------------------------------------------------- */
  function createScreenTexture() {
    return makeCanvasTexture(1024, 640, function (ctx, w, h) {
      var bg = ctx.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, '#061226');
      bg.addColorStop(0.55, '#040d1c');
      bg.addColorStop(1, '#020711');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      var glow = ctx.createRadialGradient(w * 0.82, h * 0.16, 0, w * 0.82, h * 0.16, w * 0.55);
      glow.addColorStop(0, 'rgba(34,211,238,0.16)');
      glow.addColorStop(1, 'rgba(34,211,238,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      /* top bar */
      ctx.fillStyle = 'rgba(8,19,37,0.96)';
      ctx.fillRect(0, 0, w, 52);
      ctx.fillStyle = '#f87171';
      ctx.beginPath(); ctx.arc(24, 26, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath(); ctx.arc(44, 26, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#4ade80';
      ctx.beginPath(); ctx.arc(64, 26, 6, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = '#27405f';
      roundRect(ctx, 100, 14, 190, 24, 6); ctx.fill();
      ctx.fillStyle = '#7dd3fc';
      ctx.font = '13px "JetBrains Mono", monospace';
      ctx.fillText('portfolio.js', 116, 30);

      ctx.fillStyle = '#27405f';
      roundRect(ctx, w - 190, 14, 158, 24, 6); ctx.fill();
      ctx.fillStyle = '#5b7ba3';
      ctx.fillText('main  ·  UTF-8', w - 172, 30);

      /* sidebar */
      ctx.fillStyle = 'rgba(6,15,30,0.88)';
      ctx.fillRect(0, 52, 154, h - 52);
      ctx.strokeStyle = 'rgba(137,174,255,0.1)';
      ctx.beginPath(); ctx.moveTo(154, 52); ctx.lineTo(154, h); ctx.stroke();

      ctx.fillStyle = '#22d3ee';
      ctx.font = '600 15px "JetBrains Mono", monospace';
      ctx.fillText('SR', 22, 92);
      ctx.fillStyle = '#334a6b';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillText('WORKSPACE', 22, 110);

      var nav = ['explorer', 'search', 'source control', 'extensions'];
      nav.forEach(function (item, index) {
        var y = 158 + index * 42;
        if (index === 0) {
          ctx.fillStyle = 'rgba(34,211,238,0.1)';
          roundRect(ctx, 12, y - 18, 130, 30, 5); ctx.fill();
          ctx.fillStyle = '#67e8f9';
        } else {
          ctx.fillStyle = '#3c5474';
        }
        ctx.font = '11px "JetBrains Mono", monospace';
        ctx.fillText(item, 24, y);
      });

      ctx.fillStyle = 'rgba(34,211,238,0.1)';
      roundRect(ctx, 12, 344, 130, 30, 5); ctx.fill();
      ctx.fillStyle = '#67e8f9';
      ctx.fillText('sudhan.js', 24, 364);

      /* code */
      var lines = [
        [{ t: 'const', c: '#c084fc' }, { t: ' developer ', c: '#93c5fd' }, { t: '= ', c: '#64748b' }, { t: '{', c: '#fbbf24' }],
        [{ t: '  name', c: '#67e8f9' }, { t: ': ', c: '#64748b' }, { t: "'Sudhan Raj M'", c: '#86efac' }, { t: ',', c: '#64748b' }],
        [{ t: '  role', c: '#67e8f9' }, { t: ': ', c: '#64748b' }, { t: "'Software Developer'", c: '#86efac' }, { t: ',', c: '#64748b' }],
        [{ t: '  stack', c: '#67e8f9' }, { t: ': ', c: '#64748b' }, { t: '[', c: '#fbbf24' }, { t: "'Node'", c: '#86efac' }, { t: ', ', c: '#64748b' }, { t: "'Express'", c: '#86efac' }, { t: ', ', c: '#64748b' }, { t: "'MySQL'", c: '#86efac' }, { t: ']', c: '#fbbf24' }, { t: ',', c: '#64748b' }],
        [{ t: '  focus', c: '#67e8f9' }, { t: ': ', c: '#64748b' }, { t: "'Building useful things'", c: '#86efac' }, { t: ',', c: '#64748b' }],
        [{ t: '  learn', c: '#67e8f9' }, { t: ': ', c: '#64748b' }, { t: '() ', c: '#93c5fd' }, { t: '=> ', c: '#f0abfc' }, { t: '{', c: '#fbbf24' }],
        [{ t: '    build();', c: '#dbeafe' }],
        [{ t: '    ship();', c: '#dbeafe' }],
        [{ t: '    repeat();', c: '#dbeafe' }],
        [{ t: '  }', c: '#fbbf24' }],
        [{ t: '};', c: '#fbbf24' }],
        [],
        [{ t: '// always learning — always building', c: '#3f5878' }]
      ];

      ctx.font = '16px "JetBrains Mono", monospace';
      lines.forEach(function (parts, index) {
        var y = 120 + index * 34;
        ctx.fillStyle = '#243a58';
        ctx.font = '11px "JetBrains Mono", monospace';
        ctx.fillText(String(index + 1).padStart(2, '0'), 176, y);
        var x = 214;
        parts.forEach(function (part) {
          ctx.fillStyle = part.c;
          ctx.font = '16px "JetBrains Mono", monospace';
          ctx.fillText(part.t, x, y);
          x += ctx.measureText(part.t).width;
        });
      });

      /* active cursor line */
      ctx.fillStyle = 'rgba(34,211,238,0.08)';
      ctx.fillRect(168, 524, w - 188, 34);
      ctx.fillStyle = '#22d3ee';
      ctx.fillRect(214, 531, 2, 20);

      /* status bar */
      ctx.fillStyle = 'rgba(5,14,29,0.96)';
      ctx.fillRect(0, h - 34, w, 34);
      ctx.fillStyle = '#22d3ee';
      ctx.fillRect(0, h - 34, w, 1);
      ctx.fillStyle = '#5b7ba3';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillText('main*', 18, h - 13);
      ctx.fillText('JavaScript', 120, h - 13);
      ctx.fillStyle = '#4ade80';
      ctx.fillText('● live', w - 160, h - 13);
      ctx.fillStyle = '#5b7ba3';
      ctx.fillText('Ln 14, Col 3', w - 82, h - 13);

      /* scanlines */
      ctx.fillStyle = 'rgba(103,232,249,0.018)';
      for (var y2 = 0; y2 < h; y2 += 4) ctx.fillRect(0, y2, w, 1);
    });
  }

  function createKeyboardTexture() {
    return makeCanvasTexture(1024, 420, function (ctx, w, h) {
      var bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, '#0a1526');
      bg.addColorStop(1, '#060d1a');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      var cols = 14;
      var rows = 4;
      var pad = 18;
      var gap = 8;
      var keyW = (w - pad * 2 - gap * (cols - 1)) / cols;
      var keyH = (h - pad * 2 - gap * (rows - 1)) / rows;

      for (var r = 0; r < rows; r++) {
        for (var c = 0; c < cols; c++) {
          var x = pad + c * (keyW + gap);
          var y = pad + r * (keyH + gap);
          ctx.fillStyle = r === 0 ? '#0c1a2e' : '#0a1628';
          roundRect(ctx, x, y, keyW, keyH, 5);
          ctx.fill();
          ctx.strokeStyle = 'rgba(103,232,249,0.1)';
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.fillStyle = 'rgba(125,211,252,0.18)';
          ctx.font = '9px "JetBrains Mono", monospace';
          ctx.fillText('·', x + keyW / 2 - 2, y + keyH / 2 + 3);
        }
      }

      /* spacebar */
      ctx.fillStyle = '#0b1729';
      roundRect(ctx, pad + keyW + gap, pad + 3 * (keyH + gap), keyW * 5 + gap * 4, keyH, 5);
      ctx.fill();
      ctx.strokeStyle = 'rgba(103,232,249,0.08)';
      ctx.stroke();

      /* subtle under-key glow */
      var glow = ctx.createRadialGradient(w * 0.5, h * 0.5, 10, w * 0.5, h * 0.5, w * 0.55);
      glow.addColorStop(0, 'rgba(34,211,238,0.07)');
      glow.addColorStop(1, 'rgba(34,211,238,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);
    });
  }

  function createGlowTexture() {
    return makeCanvasTexture(512, 512, function (ctx, w, h) {
      var gradient = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
      gradient.addColorStop(0, 'rgba(34,211,238,0.36)');
      gradient.addColorStop(0.35, 'rgba(34,211,238,0.12)');
      gradient.addColorStop(1, 'rgba(34,211,238,0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);
    });
  }

  function createSymbolSprite(text, color) {
    return makeCanvasTexture(256, 256, function (ctx, w, h) {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(5,14,29,0.46)';
      roundRect(ctx, 34, 54, 188, 148, 24);
      ctx.fill();
      ctx.strokeStyle = 'rgba(103,232,249,0.26)';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = color;
      ctx.shadowBlur = 26;
      ctx.fillStyle = color;
      ctx.font = '600 78px "Space Grotesk", "JetBrains Mono", monospace';
      ctx.fillText(text, w / 2, h / 2 + 2);
      ctx.shadowBlur = 0;
    });
  }

  /* ---------------------------------------------------------------------
     Hero scene
     --------------------------------------------------------------------- */
  function initHero() {
    var stage = heroCanvas.parentElement;
    var renderer = new THREE.WebGLRenderer({
      canvas: heroCanvas,
      alpha: true,
      antialias: !mobile,
      powerPreference: 'high-performance'
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.35 : 1.75));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !mobile && !reduceMotion;
    if (renderer.shadowMap.enabled) renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    var scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x040711, 0.026);

    var camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    var workstation = new THREE.Group();
    scene.add(workstation);

    /* Lights */
    scene.add(new THREE.AmbientLight(0x27466e, 0.9));
    var hemi = new THREE.HemisphereLight(0x3b82f6, 0x02040a, 0.62);
    scene.add(hemi);

    var keyLight = new THREE.DirectionalLight(0xa5e8ff, 1.35);
    keyLight.position.set(5, 7, 6);
    if (renderer.shadowMap.enabled) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.camera.near = 1;
      keyLight.shadow.camera.far = 20;
      keyLight.shadow.camera.left = -6;
      keyLight.shadow.camera.right = 6;
      keyLight.shadow.camera.top = 6;
      keyLight.shadow.camera.bottom = -4;
    }
    scene.add(keyLight);

    var cyanLight = new THREE.PointLight(0x22d3ee, 2.2, 14, 2);
    cyanLight.position.set(3.2, 1.4, 4.2);
    scene.add(cyanLight);

    var blueLight = new THREE.PointLight(0x3b82f6, 1.7, 16, 2);
    blueLight.position.set(-4.2, 0.2, 3.4);
    scene.add(blueLight);

    var violetLight = new THREE.PointLight(0x8b5cf6, 1.1, 14, 2);
    violetLight.position.set(1.4, 2.4, -3.2);
    scene.add(violetLight);

    /* Desk */
    var deskMaterial = new THREE.MeshStandardMaterial({
      color: 0x071120,
      metalness: 0.82,
      roughness: 0.32
    });
    var desk = new THREE.Mesh(roundedBox(5.9, 0.2, 3.2, 0.12), deskMaterial);
    desk.position.set(0, -1.44, 0);
    desk.castShadow = true;
    desk.receiveShadow = true;
    workstation.add(desk);
    addEdges(desk, 0x22d3ee, 0.16);

    var deskTopGlow = new THREE.Mesh(
      new THREE.PlaneGeometry(4.8, 2.2),
      new THREE.MeshBasicMaterial({
        map: createGlowTexture(),
        transparent: true,
        opacity: 0.36,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    deskTopGlow.rotation.x = -Math.PI / 2;
    deskTopGlow.position.set(0, -1.33, 0.15);
    workstation.add(deskTopGlow);

    var legMaterial = new THREE.MeshStandardMaterial({ color: 0x050c18, metalness: 0.7, roughness: 0.4 });
    [-2.45, 2.45].forEach(function (x) {
      var leg = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.3, 2.2), legMaterial);
      leg.position.set(x, -2.2, 0);
      workstation.add(leg);
    });

    /* Desk mug */
    var mug = new THREE.Group();
    var mugBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.17, 0.15, 0.32, 24),
      new THREE.MeshStandardMaterial({ color: 0x0a1a30, metalness: 0.5, roughness: 0.35 })
    );
    mugBody.castShadow = true;
    mug.add(mugBody);
    var mugRim = new THREE.Mesh(
      new THREE.TorusGeometry(0.167, 0.012, 8, 28),
      new THREE.MeshBasicMaterial({ color: 0x67e8f9 })
    );
    mugRim.rotation.x = Math.PI / 2;
    mugRim.position.y = 0.16;
    mug.add(mugRim);
    var mugHandle = new THREE.Mesh(
      new THREE.TorusGeometry(0.1, 0.022, 8, 20, Math.PI * 1.4),
      new THREE.MeshStandardMaterial({ color: 0x0a1a30, metalness: 0.5, roughness: 0.35 })
    );
    mugHandle.position.set(0.18, 0, 0);
    mugHandle.rotation.z = Math.PI / 2;
    mug.add(mugHandle);
    mug.position.set(-2.15, -1.18, 0.55);
    workstation.add(mug);

    /* Laptop */
    var laptop = new THREE.Group();
    laptop.position.set(0, 0, 0);
    workstation.add(laptop);

    var bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x0a1628,
      metalness: 0.86,
      roughness: 0.28
    });

    var base = new THREE.Mesh(roundedBox(3.42, 0.14, 2.18, 0.11), bodyMaterial);
    base.castShadow = true;
    base.receiveShadow = true;
    laptop.add(base);
    addEdges(base, 0x22d3ee, 0.22);

    var keyboard = new THREE.Mesh(
      new THREE.PlaneGeometry(2.9, 1.28),
      new THREE.MeshBasicMaterial({ map: createKeyboardTexture(), transparent: true, opacity: 0.94 })
    );
    keyboard.rotation.x = -Math.PI / 2;
    keyboard.position.set(0, 0.077, -0.06);
    laptop.add(keyboard);

    var trackpad = new THREE.Mesh(
      new THREE.PlaneGeometry(1.02, 0.62),
      new THREE.MeshStandardMaterial({ color: 0x081425, metalness: 0.9, roughness: 0.22 })
    );
    trackpad.rotation.x = -Math.PI / 2;
    trackpad.position.set(0, 0.079, 0.71);
    laptop.add(trackpad);

    var hinge = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.035, 2.95, 12),
      new THREE.MeshStandardMaterial({ color: 0x16324f, metalness: 0.9, roughness: 0.25 })
    );
    hinge.rotation.z = Math.PI / 2;
    hinge.position.set(0, 0.09, -1.02);
    laptop.add(hinge);

    var screenPivot = new THREE.Group();
    screenPivot.position.set(0, 0.08, -1.02);
    screenPivot.rotation.x = -0.22;
    laptop.add(screenPivot);

    var screenBody = new THREE.Mesh(roundedBox(3.24, 1.98, 0.09, 0.08), bodyMaterial);
    screenBody.position.set(0, 0.99, 0);
    screenBody.castShadow = true;
    screenPivot.add(screenBody);
    addEdges(screenBody, 0x22d3ee, 0.24);

    var screenTexture = createScreenTexture();
    var display = new THREE.Mesh(
      new THREE.PlaneGeometry(3.02, 1.76),
      new THREE.MeshBasicMaterial({ map: screenTexture, toneMapped: false })
    );
    /* Keep a clear gap in front of the screen body: a 0.005 offset caused
       z-fighting and the display plane lost against the metal bezel. */
    display.position.set(0, 0.99, 0.078);
    screenPivot.add(display);

    var screenGlow = new THREE.Mesh(
      new THREE.PlaneGeometry(3.9, 2.6),
      new THREE.MeshBasicMaterial({
        map: createGlowTexture(),
        transparent: true,
        opacity: 0.46,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    screenGlow.position.set(0, 0.99, -0.06);
    screenPivot.add(screenGlow);

    var scanline = new THREE.Mesh(
      new THREE.PlaneGeometry(3.0, 0.035),
      new THREE.MeshBasicMaterial({
        color: 0x67e8f9,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false
      })
    );
    scanline.position.set(0, 0.2, 0.088);
    screenPivot.add(scanline);

    var laptopGlow = new THREE.PointLight(0x22d3ee, 1.5, 4.5, 2);
    laptopGlow.position.set(0, 0.5, 1.1);
    laptop.add(laptopGlow);

    /* Holographic rings */
    var ringGroup = new THREE.Group();
    ringGroup.position.set(0, 0.2, 0);
    workstation.add(ringGroup);

    function makeRing(radius, tube, color, opacity, rotationX, rotationY) {
      var mesh = new THREE.Mesh(
        new THREE.TorusGeometry(radius, tube, 8, 160),
        new THREE.MeshBasicMaterial({
          color: color,
          transparent: true,
          opacity: opacity,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        })
      );
      mesh.rotation.x = rotationX;
      mesh.rotation.y = rotationY;
      ringGroup.add(mesh);
      return mesh;
    }

    var ringA = makeRing(2.25, 0.007, 0x22d3ee, 0.38, Math.PI / 2.35, 0.2);
    var ringB = makeRing(2.62, 0.005, 0x3b82f6, 0.24, Math.PI / 1.9, -0.4);
    var ringC = makeRing(1.9, 0.004, 0x8b5cf6, 0.2, Math.PI / 2.8, 0.6);

    /* Floating symbols */
    var symbolData = [
      { text: '{ }', color: '#67e8f9', x: -2.45, y: 1.5, z: 0.55, scale: 0.72, phase: 0.2 },
      { text: '</>', color: '#60a5fa', x: 2.9, y: 1.62, z: -0.55, scale: 0.78, phase: 1.4 },
      { text: ';', color: '#a78bfa', x: -2.85, y: -0.25, z: 0.85, scale: 0.54, phase: 2.2 },
      { text: '01', color: '#22d3ee', x: 2.62, y: -0.52, z: 0.75, scale: 0.58, phase: 3.1 },
      { text: '#', color: '#93c5fd', x: 0.85, y: 2.15, z: -1.05, scale: 0.54, phase: 4.2 },
      { text: '[ ]', color: '#67e8f9', x: -1.35, y: -1.0, z: 1.45, scale: 0.48, phase: 5.0 }
    ];

    var symbols = [];
    symbolData.forEach(function (data) {
      if (mobile && (data.text === '[ ]' || data.text === '#')) return;
      var sprite = new THREE.Sprite(new THREE.SpriteMaterial({
        map: createSymbolSprite(data.text, data.color),
        transparent: true,
        depthWrite: false,
        opacity: 0.96
      }));
      sprite.position.set(data.x, data.y, data.z);
      sprite.scale.setScalar(data.scale);
      sprite.userData.baseY = data.y;
      sprite.userData.baseScale = data.scale;
      sprite.userData.phase = data.phase;
      sprite.userData.hovered = false;
      sprite.userData.isSymbol = true;
      workstation.add(sprite);
      symbols.push(sprite);
    });

    /* Glowing symbols orbit accent */
    var nodeGroup = new THREE.Group();
    workstation.add(nodeGroup);
    for (var n = 0; n < 8; n++) {
      var angle = (n / 8) * Math.PI * 2;
      var node = new THREE.Mesh(
        new THREE.SphereGeometry(0.022, 10, 10),
        new THREE.MeshBasicMaterial({ color: n % 2 === 0 ? 0x67e8f9 : 0x8b5cf6 })
      );
      node.position.set(Math.cos(angle) * 2.35, Math.sin(angle * 1.6) * 0.55 + 0.25, Math.sin(angle) * 1.25);
      nodeGroup.add(node);
    }

    /* Particles */
    var particleCount = mobile ? 260 : 620;
    var positions = new Float32Array(particleCount * 3);
    var colors = new Float32Array(particleCount * 3);
    var colorChoices = [new THREE.Color(0x22d3ee), new THREE.Color(0x3b82f6), new THREE.Color(0x8b5cf6), new THREE.Color(0x93c5fd)];

    for (var i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 17;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 9;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 12 - 1;
      var color = colorChoices[Math.floor(Math.random() * colorChoices.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    var particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    var particleMaterial = new THREE.PointsMaterial({
      size: mobile ? 0.045 : 0.036,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.82,
      vertexColors: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    var particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    /* Distant stars */
    var starCount = mobile ? 120 : 280;
    var starPositions = new Float32Array(starCount * 3);
    for (var s = 0; s < starCount; s++) {
      starPositions[s * 3] = (Math.random() - 0.5) * 36;
      starPositions[s * 3 + 1] = (Math.random() - 0.5) * 22;
      starPositions[s * 3 + 2] = -8 - Math.random() * 14;
    }
    var starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    var stars = new THREE.Points(starGeometry, new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.028,
      transparent: true,
      opacity: 0.48,
      depthWrite: false
    }));
    scene.add(stars);

    /* Floor */
    var floor = new THREE.Mesh(
      new THREE.CircleGeometry(15, 64),
      new THREE.MeshStandardMaterial({
        color: 0x02060f,
        metalness: 0.94,
        roughness: 0.26,
        transparent: true,
        opacity: 0.72
      })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -2.95;
    floor.receiveShadow = true;
    scene.add(floor);

    var grid = new THREE.GridHelper(34, 34, 0x0b3b5d, 0x071b30);
    grid.position.y = -2.93;
    grid.material.transparent = true;
    grid.material.opacity = 0.48;
    scene.add(grid);

    /* Hover interaction */
    var raycaster = new THREE.Raycaster();
    var interactive = [base, screenBody, display].concat(symbols);
    var hoveredSymbol = null;
    var laptopHovered = false;

    function onPointerMove(event) {
      pointerTarget.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointerTarget.y = -(event.clientY / window.innerHeight) * 2 + 1;

      if (mobile || reduceMotion) return;
      raycaster.setFromCamera(pointerTarget, camera);
      var hits = raycaster.intersectObjects(interactive, false);
      var symbolHit = null;
      var laptopHit = false;

      for (var hIndex = 0; hIndex < hits.length; hIndex++) {
        var hitObject = hits[hIndex].object;
        if (hitObject.userData.isSymbol) {
          symbolHit = hitObject;
          break;
        }
        if (hitObject === base || hitObject === screenBody || hitObject === display) laptopHit = true;
      }

      if (hoveredSymbol && hoveredSymbol !== symbolHit) hoveredSymbol.userData.hovered = false;
      hoveredSymbol = symbolHit;
      if (hoveredSymbol) hoveredSymbol.userData.hovered = true;
      laptopHovered = laptopHit;
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true });

    var layout = { x: 2.1, y: -0.15, z: 0, scale: 1, cameraZ: 9.9, lookX: 0.55, lookY: -0.05 };
    var currentLayout = Object.assign({}, layout);

    function setLayout() {
      if (window.innerWidth < 620) {
        layout = { x: 1.0, y: -0.5, z: -0.55, scale: 0.76, cameraZ: 11.6, lookX: 0.18, lookY: 0.25 };
      } else if (window.innerWidth < 980) {
        layout = { x: 1.1, y: -0.05, z: -0.3, scale: 0.94, cameraZ: 10.4, lookX: 0.35, lookY: 0 };
      } else {
        layout = { x: 2.1, y: -0.15, z: 0, scale: 1, cameraZ: 9.9, lookX: 0.55, lookY: -0.05 };
      }
      currentLayout = Object.assign({}, layout);
      workstation.position.set(layout.x, layout.y, layout.z);
      workstation.scale.setScalar(layout.scale);
      camera.position.z = layout.cameraZ;
    }

    function resize() {
      var width = stage.clientWidth;
      var height = stage.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      viewport.w = width;
      viewport.h = height;
      setLayout();
    }

    setLayout();
    resize();
    window.addEventListener('resize', function () {
      mobile = window.innerWidth < 720;
      resize();
    }, { passive: true });

    var scrollProgress = 0;
    function readScroll() {
      var heroHeight = stage.clientHeight || window.innerHeight;
      scrollProgress = clamp((window.scrollY || window.pageYOffset) / heroHeight, 0, 1);
    }
    window.addEventListener('scroll', readScroll, { passive: true });
    readScroll();

    hero = {
      renderer: renderer,
      scene: scene,
      camera: camera,
      workstation: workstation,
      laptop: laptop,
      screenPivot: screenPivot,
      scanline: scanline,
      symbols: symbols,
      ringGroup: ringGroup,
      ringA: ringA,
      ringB: ringB,
      ringC: ringC,
      particles: particles,
      stars: stars,
      nodeGroup: nodeGroup,
      layout: layout,
      getScrollProgress: function () { return scrollProgress; },
      getLaptopHovered: function () { return laptopHovered; },
      getHoveredSymbol: function () { return hoveredSymbol; },
      resize: resize
    };

    heroCanvas.classList.add('is-ready');

    if (reduceMotion) {
      workstation.position.set(layout.x, layout.y, layout.z);
      camera.position.set(0, 0.7, layout.cameraZ);
      camera.lookAt(layout.lookX, layout.lookY, 0);
      renderer.render(scene, camera);
    }

    return hero;
  }

  /* ---------------------------------------------------------------------
     About scene
     --------------------------------------------------------------------- */
  function initAbout() {
    if (!aboutCanvas) return null;
    var stage = aboutCanvas.parentElement;
    var renderer = new THREE.WebGLRenderer({
      canvas: aboutCanvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.55));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(42, 1, 0.1, 30);
    camera.position.set(0, 0, 5.2);

    var group = new THREE.Group();
    scene.add(group);

    scene.add(new THREE.AmbientLight(0x2a4c78, 0.9));
    var key = new THREE.PointLight(0x67e8f9, 7, 12, 2);
    key.position.set(2.4, 2.6, 3.4);
    scene.add(key);
    var fill = new THREE.PointLight(0x8b5cf6, 4.5, 12, 2);
    fill.position.set(-2.8, -1.8, 2.2);
    scene.add(fill);

    var outer = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.34, 1),
      new THREE.MeshBasicMaterial({
        color: 0x22d3ee,
        wireframe: true,
        transparent: true,
        opacity: 0.26,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    group.add(outer);

    var shell = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.03, 2),
      new THREE.MeshPhysicalMaterial({
        color: 0x081a33,
        metalness: 0.32,
        roughness: 0.16,
        clearcoat: 1,
        clearcoatRoughness: 0.14,
        transparent: true,
        opacity: 0.85,
        emissive: 0x06243d,
        emissiveIntensity: 0.7
      })
    );
    group.add(shell);
    addEdges(shell, 0x22d3ee, 0.3);

    var core = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 24, 24),
      new THREE.MeshBasicMaterial({ color: 0x67e8f9, toneMapped: false })
    );
    group.add(core);

    var coreGlow = new THREE.Mesh(
      new THREE.SphereGeometry(0.52, 20, 20),
      new THREE.MeshBasicMaterial({
        color: 0x22d3ee,
        transparent: true,
        opacity: 0.16,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    group.add(coreGlow);

    var orbitA = new THREE.Mesh(
      new THREE.TorusGeometry(1.55, 0.006, 6, 160),
      new THREE.MeshBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.46, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    orbitA.rotation.x = Math.PI / 2.2;
    orbitA.rotation.y = 0.35;
    group.add(orbitA);

    var orbitB = new THREE.Mesh(
      new THREE.TorusGeometry(1.78, 0.005, 6, 160),
      new THREE.MeshBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.32, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    orbitB.rotation.x = Math.PI / 1.7;
    orbitB.rotation.z = 0.5;
    group.add(orbitB);

    var orbitC = new THREE.Mesh(
      new THREE.TorusGeometry(1.12, 0.004, 6, 120),
      new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.36, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    orbitC.rotation.x = Math.PI / 2.9;
    group.add(orbitC);

    var nodes = new THREE.Group();
    group.add(nodes);
    var nodeMaterial = new THREE.MeshBasicMaterial({ color: 0x67e8f9, toneMapped: false });
    for (var i = 0; i < 7; i++) {
      var node = new THREE.Mesh(new THREE.SphereGeometry(i % 2 ? 0.03 : 0.045, 12, 12), nodeMaterial);
      var angle = (i / 7) * Math.PI * 2;
      node.position.set(Math.cos(angle) * 1.62, Math.sin(angle * 1.4) * 0.7, Math.sin(angle) * 1.3);
      nodes.add(node);
    }

    var count = mobile ? 70 : 160;
    var positions = new Float32Array(count * 3);
    for (var p = 0; p < count; p++) {
      var radius = 1.55 + Math.random() * 1.2;
      var theta = Math.random() * Math.PI * 2;
      var phi = Math.acos(2 * Math.random() - 1);
      positions[p * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[p * 3 + 1] = radius * Math.cos(phi);
      positions[p * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }
    var particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    var particles = new THREE.Points(particleGeometry, new THREE.PointsMaterial({
      color: 0x67e8f9,
      size: 0.028,
      transparent: true,
      opacity: 0.67,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    }));
    group.add(particles);

    var resize = function () {
      var width = aboutCanvas.clientWidth || stage.clientWidth * 0.9;
      var height = aboutCanvas.clientHeight || stage.clientHeight * 0.9;
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      var scale = width < 340 ? 0.82 : 1;
      group.scale.setScalar(scale);
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    var aboutPointer = { x: 0, y: 0 };
    var aboutTarget = { x: 0, y: 0 };
    stage.addEventListener('pointermove', function (event) {
      var rect = stage.getBoundingClientRect();
      aboutTarget.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      aboutTarget.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    }, { passive: true });
    stage.addEventListener('pointerleave', function () {
      aboutTarget.x = 0;
      aboutTarget.y = 0;
    });

    if (reduceMotion) {
      group.rotation.set(0.1, 0.4, 0);
      renderer.render(scene, camera);
    }

    about = {
      renderer: renderer,
      scene: scene,
      camera: camera,
      group: group,
      outer: outer,
      shell: shell,
      core: core,
      coreGlow: coreGlow,
      orbitA: orbitA,
      orbitB: orbitB,
      orbitC: orbitC,
      nodes: nodes,
      particles: particles,
      pointer: aboutPointer,
      target: aboutTarget
    };

    return about;
  }

  /* ---------------------------------------------------------------------
     Render loop
     --------------------------------------------------------------------- */
  var elapsed = 0;

  function renderHero(dt, time) {
    if (!hero) return;
    var layout = hero.layout;
    var progress = hero.getScrollProgress();

    pointer.x = lerp(pointer.x, pointerTarget.x, 0.035);
    pointer.y = lerp(pointer.y, pointerTarget.y, 0.035);

    var cameraX = pointer.x * (mobile ? 0.18 : 0.42);
    var cameraY = 0.75 + pointer.y * (mobile ? 0.12 : 0.26);
    hero.camera.position.x = lerp(hero.camera.position.x, cameraX, 0.045);
    hero.camera.position.y = lerp(hero.camera.position.y, cameraY, 0.045);
    hero.camera.position.z = lerp(hero.camera.position.z, layout.cameraZ + progress * 1.25, 0.04);
    hero.camera.lookAt(layout.lookX + pointer.x * 0.24, layout.lookY + pointer.y * 0.16 - progress * 0.15, 0);

    hero.workstation.position.y = layout.y - progress * 1.1 + Math.sin(time * 0.52) * 0.035;
    hero.workstation.rotation.y = pointer.x * 0.085 + Math.sin(time * 0.14) * 0.022;
    hero.workstation.rotation.x = -pointer.y * 0.025 + progress * 0.05;

    hero.laptop.position.y = Math.sin(time * 0.78) * 0.055;
    hero.laptop.rotation.z = Math.sin(time * 0.36) * 0.008;

    hero.ringGroup.rotation.y = time * 0.08;
    hero.ringGroup.rotation.z = Math.sin(time * 0.2) * 0.04;
    hero.ringA.rotation.z = time * 0.16;
    hero.ringB.rotation.z = -time * 0.11;
    hero.ringC.rotation.z = time * 0.2;

    hero.nodeGroup.rotation.y = time * 0.22;
    hero.nodeGroup.rotation.x = Math.sin(time * 0.3) * 0.12;

    hero.symbols.forEach(function (symbol) {
      var data = symbol.userData;
      symbol.position.y = data.baseY + Math.sin(time * 0.7 + data.phase) * 0.13;
      var targetScale = data.hovered ? data.baseScale * 1.22 : data.baseScale;
      var currentScale = symbol.scale.x;
      var nextScale = lerp(currentScale, targetScale, 0.1);
      symbol.scale.setScalar(nextScale);
    });

    hero.laptop.scale.setScalar(lerp(hero.laptop.scale.x, hero.getLaptopHovered() ? 1.025 : 1, 0.08));

    var scan = ((time * 0.18) % 1);
    hero.scanline.position.y = 0.14 + scan * 1.68;
    hero.scanline.material.opacity = 0.16 + Math.sin(scan * Math.PI) * 0.22;

    hero.particles.rotation.y = time * 0.016;
    hero.particles.rotation.x = Math.sin(time * 0.05) * 0.03;
    hero.stars.rotation.y = -time * 0.004;

    hero.renderer.render(hero.scene, hero.camera);
  }

  function renderAbout(dt, time) {
    if (!about) return;
    about.pointer.x = lerp(about.pointer.x, about.target.x, 0.05);
    about.pointer.y = lerp(about.pointer.y, about.target.y, 0.05);

    about.group.rotation.y = time * 0.24 + about.pointer.x * 0.24;
    about.group.rotation.x = Math.sin(time * 0.3) * 0.08 + about.pointer.y * 0.14;
    about.outer.rotation.y = -time * 0.18;
    about.outer.rotation.z = Math.sin(time * 0.2) * 0.1;
    about.shell.rotation.y = time * 0.1;
    about.orbitA.rotation.z = time * 0.2;
    about.orbitB.rotation.z = -time * 0.16;
    about.orbitC.rotation.z = time * 0.25;
    about.nodes.rotation.y = time * 0.32;
    about.nodes.rotation.x = Math.sin(time * 0.26) * 0.18;
    about.core.scale.setScalar(1 + Math.sin(time * 1.4) * 0.055);
    about.coreGlow.scale.setScalar(1 + Math.sin(time * 1.4 + 0.5) * 0.08);
    about.particles.rotation.y = time * 0.04;
    about.particles.rotation.x = -time * 0.02;

    about.renderer.render(about.scene, about.camera);
  }

  function loop() {
    var dt = Math.min(clock.getDelta(), 0.05);
    elapsed += dt;

    if (!document.hidden && !reduceMotion) {
      if (heroVisible && hero) renderHero(dt, elapsed);
      if (aboutVisible && about) renderAbout(dt, elapsed);
    }

    window.requestAnimationFrame(loop);
  }

  function observeVisibility() {
    if (!('IntersectionObserver' in window)) return;

    var heroSection = document.getElementById('home');
    if (heroSection) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) { heroVisible = entry.isIntersecting; });
      }, { threshold: 0.02 }).observe(heroSection);
    }

    if (aboutCanvas) {
      new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          aboutVisible = true;
          if (!about) {
            try {
              initAbout();
            } catch (error) {
              document.documentElement.classList.add('no-webgl');
            }
          }
          observer.disconnect();
        });
      }, { rootMargin: '120px', threshold: 0.05 }).observe(aboutCanvas);
    }
  }

  /* ---------------------------------------------------------------------
     Boot
     --------------------------------------------------------------------- */
  try {
    initHero();
  } catch (error) {
    document.documentElement.classList.add('no-webgl');
  }

  if (!reduceMotion) window.requestAnimationFrame(loop);
  observeVisibility();

  /* Handle context loss gracefully. */
  ['webglcontextlost', 'webglcontextrestored'].forEach(function (eventName) {
    heroCanvas.addEventListener(eventName, function (event) {
      if (eventName === 'webglcontextlost') {
        event.preventDefault();
        document.documentElement.classList.add('no-webgl');
      }
    }, false);
  });

  /* Expose a tiny debug surface for local inspection. */
  window.PortfolioScene = {
    hero: function () { return hero; },
    about: function () { return about; },
    THREE: THREE
  };
})();
