import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { SymbolId, Grid, PaylineWin } from '../types/game';
import { SYMBOL_DEFINITIONS, PAYLINES } from '../engine/probability';
import { soundManager } from '../engine/audio';

interface SlotCanvasProps {
  isSpinning: boolean;
  reelStops: number[] | null;
  displayGrid: Grid;
  winningPaylines: PaylineWin[];
  isNeuralOverload: boolean;
  onSpinComplete: () => void;
  reducedMotion?: boolean;
}

// 20 segments on each cylinder reel
const SYMBOLS_PER_REEL = 20;
const SEGMENT_ANGLE = (Math.PI * 2) / SYMBOLS_PER_REEL;
const REEL_RADIUS = 3.6;
const REEL_WIDTH = 1.35;
const REEL_GAP = 0.28;
const NUM_REELS = 5;

export const SlotCanvas: React.FC<SlotCanvasProps> = ({
  isSpinning,
  reelStops,
  displayGrid,
  winningPaylines,
  isNeuralOverload,
  onSpinComplete,
  reducedMotion = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Three.js instances ref
  const threeRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    reelGroups: THREE.Group[];
    reelRotations: number[];
    reelTargetRotations: number[];
    reelVelocities: number[];
    reelStoppingStates: ('idle' | 'spinning' | 'stopping' | 'locked')[];
    reelStopTimers: number[];
    reelMeshTiles: { mesh: THREE.Mesh; symbolId: SymbolId }[][];
    neuralParticles: THREE.Points;
    spotlights: THREE.SpotLight[];
    pointLights: THREE.PointLight[];
    paylineLinesGroup: THREE.Group;
    textureMap: Map<SymbolId, THREE.CanvasTexture>;
    animationFrameId: number;
    clock: THREE.Clock;
    lastTickTime: number;
  } | null>(null);

  const [activeWinningPaylineIdx, setActiveWinningPaylineIdx] = useState<number>(0);

  // Cycling active payline highlight if multiple wins
  useEffect(() => {
    if (winningPaylines.length > 1) {
      const interval = setInterval(() => {
        setActiveWinningPaylineIdx((prev) => (prev + 1) % winningPaylines.length);
      }, 1800);
      return () => clearInterval(interval);
    } else {
      setActiveWinningPaylineIdx(0);
    }
  }, [winningPaylines]);

  // Generate crisp 512x512 procedural tile textures with official company logos
  const createSymbolTexture = useCallback((symbolId: SymbolId): THREE.CanvasTexture => {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    const def = SYMBOL_DEFINITIONS[symbolId];

    // Background: Dark obsidian glass
    const bgGrad = ctx.createRadialGradient(size / 2, size / 2, 40, size / 2, size / 2, size / 1.4);
    bgGrad.addColorStop(0, '#111827');
    bgGrad.addColorStop(0.7, '#080c14');
    bgGrad.addColorStop(1, '#030712');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, size, size);

    // Beveled frame
    ctx.lineWidth = 14;
    ctx.strokeStyle = '#1e293b';
    ctx.strokeRect(7, 7, size - 14, size - 14);

    // Inner glowing rim
    ctx.lineWidth = 6;
    ctx.strokeStyle = def.glowColor;
    ctx.strokeRect(18, 18, size - 36, size - 36);

    // Subtle corner circuit accents
    ctx.strokeStyle = def.color;
    ctx.lineWidth = 3;
    const drawCorner = (x: number, y: number, dx: number, dy: number) => {
      ctx.beginPath();
      ctx.moveTo(x, y + dy * 35);
      ctx.lineTo(x, y);
      ctx.lineTo(x + dx * 35, y);
      ctx.stroke();
    };
    drawCorner(28, 28, 1, 1);
    drawCorner(size - 28, 28, -1, 1);
    drawCorner(28, size - 28, 1, -1);
    drawCorner(size - 28, size - 28, -1, -1);

    // Center icon
    if (symbolId === 'BLANK') {
      // Procedural neural lattice for empty dark glass tile
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.4)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        const y = 140 + i * 60;
        ctx.moveTo(100, y);
        ctx.lineTo(412, y);
        ctx.stroke();
      }
      ctx.fillStyle = 'rgba(56, 189, 248, 0.3)';
      [140, 220, 300, 380].forEach((px) => {
        [170, 260, 350].forEach((py) => {
          ctx.beginPath();
          ctx.arc(px, py, 4, 0, Math.PI * 2);
          ctx.fill();
        });
      });
      // Subdued text
      ctx.font = '600 24px "Chakra Petch", monospace';
      ctx.fillStyle = 'rgba(148, 163, 184, 0.45)';
      ctx.textAlign = 'center';
      ctx.fillText('SUBSTRATE', size / 2, size / 2 + 8);
    } else {
      // Draw label badge at bottom
      ctx.font = '700 28px "Chakra Petch", sans-serif';
      ctx.fillStyle = def.color;
      ctx.textAlign = 'center';
      ctx.fillText(def.name.toUpperCase(), size / 2, size - 55);

      ctx.font = '500 18px "Inter", sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.fillText(def.company, size / 2, size - 32);

      // Load official logo image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = def.iconUrl;
      img.onload = () => {
        const iconSize = 250;
        const ix = (size - iconSize) / 2;
        const iy = (size - iconSize) / 2 - 25;

        // Soft logo glow
        ctx.save();
        ctx.shadowColor = def.glowColor;
        ctx.shadowBlur = 30;
        ctx.drawImage(img, ix, iy, iconSize, iconSize);
        ctx.restore();

        // Direct crisp logo pass
        ctx.drawImage(img, ix, iy, iconSize, iconSize);
        texture.needsUpdate = true;
      };
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    return texture;
  }, []);

  // Initialize Three.js scene
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 900;
    const height = containerRef.current.clientHeight || 550;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#030712');
    scene.fog = new THREE.FogExp2('#030712', 0.035);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 11.5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    // Ambient and volumetric spotlights
    const ambientLight = new THREE.AmbientLight('#1e293b', 1.6);
    scene.add(ambientLight);

    const spotCyan = new THREE.SpotLight('#06b6d4', 35);
    spotCyan.position.set(-6, 8, 9);
    spotCyan.angle = Math.PI / 4;
    spotCyan.penumbra = 0.8;
    scene.add(spotCyan);

    const spotViolet = new THREE.SpotLight('#a855f7', 35);
    spotViolet.position.set(6, 8, 9);
    spotViolet.angle = Math.PI / 4;
    spotViolet.penumbra = 0.8;
    scene.add(spotViolet);

    const topDownLight = new THREE.DirectionalLight('#ffffff', 1.8);
    topDownLight.position.set(0, 5, 6);
    scene.add(topDownLight);

    // Glowing point lights for dynamic chassis lighting
    const point1 = new THREE.PointLight('#38bdf8', 12, 14);
    point1.position.set(-4.5, -2, 4);
    scene.add(point1);

    const point2 = new THREE.PointLight('#ec4899', 12, 14);
    point2.position.set(4.5, -2, 4);
    scene.add(point2);

    // Build textures map
    const textureMap = new Map<SymbolId, THREE.CanvasTexture>();
    (['BLANK', 'GROK', 'CHATGPT', 'MUSE', 'ANTHROPIC', 'GEMINI'] as SymbolId[]).forEach((sym) => {
      textureMap.set(sym, createSymbolTexture(sym));
    });

    // Outer Machine Chassis (Titanium housing and beveled frame)
    const chassisGroup = new THREE.Group();

    // Brushed titanium top and bottom framing bars
    const barGeo = new THREE.BoxGeometry(9.6, 0.45, 1.2);
    const barMat = new THREE.MeshStandardMaterial({
      color: '#0f172a',
      metalness: 0.9,
      roughness: 0.25,
    });

    const topBar = new THREE.Mesh(barGeo, barMat);
    topBar.position.set(0, 3.45, 0);
    chassisGroup.add(topBar);

    const bottomBar = new THREE.Mesh(barGeo, barMat);
    bottomBar.position.set(0, -3.45, 0);
    chassisGroup.add(bottomBar);

    // Left and right chassis pillars
    const pillarGeo = new THREE.BoxGeometry(0.5, 7.3, 1.2);
    const leftPillar = new THREE.Mesh(pillarGeo, barMat);
    leftPillar.position.set(-4.7, 0, 0);
    chassisGroup.add(leftPillar);

    const rightPillar = new THREE.Mesh(pillarGeo, barMat);
    rightPillar.position.set(4.7, 0, 0);
    chassisGroup.add(rightPillar);

    // Neon edge trim strips
    const neonMatCyan = new THREE.MeshBasicMaterial({ color: '#38bdf8' });
    const neonMatViolet = new THREE.MeshBasicMaterial({ color: '#c084fc' });

    const trimGeoH = new THREE.BoxGeometry(9.4, 0.06, 0.08);
    const topTrim = new THREE.Mesh(trimGeoH, neonMatCyan);
    topTrim.position.set(0, 3.2, 0.55);
    chassisGroup.add(topTrim);

    const bottomTrim = new THREE.Mesh(trimGeoH, neonMatViolet);
    bottomTrim.position.set(0, -3.2, 0.55);
    chassisGroup.add(bottomTrim);

    // Curved front glass cover (translucent with soft specular highlights)
    const glassGeo = new THREE.CylinderGeometry(REEL_RADIUS + 0.5, REEL_RADIUS + 0.5, 9.2, 32, 1, true, -Math.PI / 6, Math.PI / 3);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: '#ffffff',
      transmission: 0.88,
      opacity: 0.35,
      transparent: true,
      roughness: 0.05,
      ior: 1.45,
      reflectivity: 0.9,
    });
    const frontGlass = new THREE.Mesh(glassGeo, glassMat);
    frontGlass.rotation.z = Math.PI / 2;
    frontGlass.position.set(0, 0, 0);
    chassisGroup.add(frontGlass);

    scene.add(chassisGroup);

    // Build 5 Cylindrical 3D Reels
    const reelGroups: THREE.Group[] = [];
    const reelRotations: number[] = [0, 0, 0, 0, 0];
    const reelTargetRotations: number[] = [0, 0, 0, 0, 0];
    const reelVelocities: number[] = [0, 0, 0, 0, 0];
    const reelStoppingStates: ('idle' | 'spinning' | 'stopping' | 'locked')[] = ['idle', 'idle', 'idle', 'idle', 'idle'];
    const reelStopTimers: number[] = [0, 0, 0, 0, 0];
    const reelMeshTiles: { mesh: THREE.Mesh; symbolId: SymbolId }[][] = [];

    // Reel cylinder separators / metallic rings
    for (let col = 0; col < NUM_REELS; col++) {
      const reelGroup = new THREE.Group();
      const xPos = (col - (NUM_REELS - 1) / 2) * (REEL_WIDTH + REEL_GAP);
      reelGroup.position.set(xPos, 0, 0);

      // Metallic interior drum
      const drumGeo = new THREE.CylinderGeometry(REEL_RADIUS - 0.05, REEL_RADIUS - 0.05, REEL_WIDTH, 36);
      const drumMat = new THREE.MeshStandardMaterial({
        color: '#090d16',
        metalness: 0.95,
        roughness: 0.2,
      });
      const drum = new THREE.Mesh(drumGeo, drumMat);
      drum.rotation.z = Math.PI / 2;
      reelGroup.add(drum);

      // Spacer ring on side
      const ringGeo = new THREE.CylinderGeometry(REEL_RADIUS + 0.08, REEL_RADIUS + 0.08, 0.06, 36);
      const ringMat = new THREE.MeshStandardMaterial({
        color: '#334155',
        metalness: 0.9,
        roughness: 0.3,
      });
      const ringLeft = new THREE.Mesh(ringGeo, ringMat);
      ringLeft.rotation.z = Math.PI / 2;
      ringLeft.position.set(REEL_WIDTH / 2, 0, 0);
      reelGroup.add(ringLeft);

      // Array of symbol tiles placed radially around the cylinder
      const tilesForReel: { mesh: THREE.Mesh; symbolId: SymbolId }[] = [];
      const symbolsList: SymbolId[] = ['BLANK', 'GROK', 'CHATGPT', 'MUSE', 'ANTHROPIC', 'GEMINI'];

      for (let s = 0; s < SYMBOLS_PER_REEL; s++) {
        // Pseudo distributed symbol assignment for the cylinder circumference
        const symId = symbolsList[s % symbolsList.length];

        // Slightly curved tile geometry matching reel radius
        const tileGeo = new THREE.PlaneGeometry(REEL_WIDTH * 0.94, (REEL_RADIUS * SEGMENT_ANGLE) * 0.94);
        const tileMat = new THREE.MeshStandardMaterial({
          map: textureMap.get(symId),
          roughness: 0.3,
          metalness: 0.2,
          emissive: new THREE.Color('#000000'),
          emissiveIntensity: 0.4,
        });

        const tileMesh = new THREE.Mesh(tileGeo, tileMat);
        const angle = s * SEGMENT_ANGLE;

        // Position on perimeter of cylinder
        tileMesh.position.y = Math.sin(angle) * REEL_RADIUS;
        tileMesh.position.z = Math.cos(angle) * REEL_RADIUS;
        tileMesh.rotation.x = angle;

        reelGroup.add(tileMesh);
        tilesForReel.push({ mesh: tileMesh, symbolId: symId });
      }

      scene.add(reelGroup);
      reelGroups.push(reelGroup);
      reelMeshTiles.push(tilesForReel);
    }

    // Floating Holographic Neural Impulse Particles
    const particleCount = 280;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const c1 = new THREE.Color('#38bdf8');
    const c2 = new THREE.Color('#a855f7');

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 11;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 4 + 1;

      const mixed = Math.random() > 0.5 ? c1 : c2;
      particleColors[i * 3] = mixed.r;
      particleColors[i * 3 + 1] = mixed.g;
      particleColors[i * 3 + 2] = mixed.b;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
    });

    const neuralParticles = new THREE.Points(particleGeo, particleMat);
    scene.add(neuralParticles);

    // Group for dynamic 3D payline laser lines
    const paylineLinesGroup = new THREE.Group();
    scene.add(paylineLinesGroup);

    threeRef.current = {
      scene,
      camera,
      renderer,
      reelGroups,
      reelRotations,
      reelTargetRotations,
      reelVelocities,
      reelStoppingStates,
      reelStopTimers,
      reelMeshTiles,
      neuralParticles,
      spotlights: [spotCyan, spotViolet],
      pointLights: [point1, point2],
      paylineLinesGroup,
      textureMap,
      animationFrameId: 0,
      clock: new THREE.Clock(),
      lastTickTime: 0,
    };

    // Responsive resize handler
    const handleResize = () => {
      if (!containerRef.current || !threeRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      threeRef.current.camera.aspect = w / h;
      threeRef.current.camera.updateProjectionMatrix();
      threeRef.current.renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (threeRef.current) {
        cancelAnimationFrame(threeRef.current.animationFrameId);
        threeRef.current.renderer.dispose();
      }
    };
  }, [createSymbolTexture]);

  // Update textures of visible tiles to match displayGrid when settled
  useEffect(() => {
    if (!threeRef.current || isSpinning) return;

    const { reelMeshTiles, textureMap } = threeRef.current;

    for (let col = 0; col < 5; col++) {
      const colGrid = displayGrid[col];
      if (!colGrid) continue;

      // When stopped at rotation angle = 0, segment 0 is centered, segment 1 is top, segment (N-1) is bottom
      // Row 0 = Top, Row 1 = Center, Row 2 = Bottom
      const centerTile = reelMeshTiles[col][0];
      const topTile = reelMeshTiles[col][1];
      const bottomTile = reelMeshTiles[col][SYMBOLS_PER_REEL - 1];

      if (topTile && colGrid[0]) {
        topTile.symbolId = colGrid[0];
        (topTile.mesh.material as THREE.MeshStandardMaterial).map = textureMap.get(colGrid[0]) || null;
        (topTile.mesh.material as THREE.MeshStandardMaterial).needsUpdate = true;
      }
      if (centerTile && colGrid[1]) {
        centerTile.symbolId = colGrid[1];
        (centerTile.mesh.material as THREE.MeshStandardMaterial).map = textureMap.get(colGrid[1]) || null;
        (centerTile.mesh.material as THREE.MeshStandardMaterial).needsUpdate = true;
      }
      if (bottomTile && colGrid[2]) {
        bottomTile.symbolId = colGrid[2];
        (bottomTile.mesh.material as THREE.MeshStandardMaterial).map = textureMap.get(colGrid[2]) || null;
        (bottomTile.mesh.material as THREE.MeshStandardMaterial).needsUpdate = true;
      }
    }
  }, [displayGrid, isSpinning]);

  // Handle spin state triggers
  useEffect(() => {
    if (!threeRef.current) return;

    const t = threeRef.current;

    if (isSpinning) {
      // Clear payline overlay
      while (t.paylineLinesGroup.children.length > 0) {
        t.paylineLinesGroup.remove(t.paylineLinesGroup.children[0]);
      }

      // Reset tile emissive highlights
      t.reelMeshTiles.forEach((reel) => {
        reel.forEach((tile) => {
          (tile.mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.2;
          (tile.mesh.material as THREE.MeshStandardMaterial).emissive.set('#000000');
        });
      });

      // Start spinning with staggered timings
      soundManager.playSpinStart();

      for (let col = 0; col < 5; col++) {
        t.reelStoppingStates[col] = 'spinning';
        t.reelVelocities[col] = reducedMotion ? 12 : 28 + Math.random() * 4;
        // Stagger stopping from Left (Reel 0) to Right (Reel 4)
        // Reel 0: ~1.8s, Reel 1: ~2.1s, Reel 2: ~2.4s, Reel 3: ~2.7s, Reel 4: ~3.0s
        t.reelStopTimers[col] = 1.8 + col * 0.32;
      }
    }
  }, [isSpinning, reducedMotion]);

  // Draw 3D glowing payline laser lines when not spinning and wins exist
  useEffect(() => {
    if (!threeRef.current || isSpinning || winningPaylines.length === 0) return;

    const t = threeRef.current;

    // Clear previous
    while (t.paylineLinesGroup.children.length > 0) {
      t.paylineLinesGroup.remove(t.paylineLinesGroup.children[0]);
    }

    const currentWin = winningPaylines[activeWinningPaylineIdx] || winningPaylines[0];
    if (!currentWin) return;

    const paylinePattern = PAYLINES[currentWin.paylineIndex];
    if (!paylinePattern) return;

    const def = SYMBOL_DEFINITIONS[currentWin.symbolId];
    const lineColor = new THREE.Color(def.color || '#38bdf8');

    // Create line points across the 5 reels
    const points: THREE.Vector3[] = [];
    for (let col = 0; col < 5; col++) {
      const row = paylinePattern[col];
      const x = (col - (NUM_REELS - 1) / 2) * (REEL_WIDTH + REEL_GAP);
      // Row 0 (top): y = +1.15, Row 1 (center): y = 0, Row 2 (bottom): y = -1.15
      const y = (1 - row) * 1.15;
      const z = REEL_RADIUS + 0.15;
      points.push(new THREE.Vector3(x, y, z));
    }

    // Multi-segment curve for smooth laser beam
    const curve = new THREE.CatmullRomCurve3(points);
    const tubeGeo = new THREE.TubeGeometry(curve, 48, 0.045, 8, false);
    const tubeMat = new THREE.MeshBasicMaterial({
      color: lineColor,
      transparent: true,
      opacity: 0.95,
    });
    const laserTube = new THREE.Mesh(tubeGeo, tubeMat);
    t.paylineLinesGroup.add(laserTube);

    // Glowing halos on winning positions
    currentWin.positions.forEach(({ col, row }) => {
      const x = (col - (NUM_REELS - 1) / 2) * (REEL_WIDTH + REEL_GAP);
      const y = (1 - row) * 1.15;
      const z = REEL_RADIUS + 0.18;

      const haloGeo = new THREE.RingGeometry(0.55, 0.65, 32);
      const haloMat = new THREE.MeshBasicMaterial({
        color: lineColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85,
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.position.set(x, y, z);
      t.paylineLinesGroup.add(halo);

      // Light up the tile emissive channel
      const tileIndex = row === 0 ? 1 : row === 1 ? 0 : SYMBOLS_PER_REEL - 1;
      const tile = t.reelMeshTiles[col][tileIndex];
      if (tile) {
        const mat = tile.mesh.material as THREE.MeshStandardMaterial;
        mat.emissive.set(def.color);
        mat.emissiveIntensity = 0.8;
      }
    });
  }, [winningPaylines, activeWinningPaylineIdx, isSpinning]);

  // Main Render & Animation Loop
  useEffect(() => {
    if (!threeRef.current) return;
    const t = threeRef.current;

    let allReelsLockedNotified = false;

    const animate = () => {
      t.animationFrameId = requestAnimationFrame(animate);

      const delta = Math.min(t.clock.getDelta(), 0.1);
      const time = t.clock.getElapsedTime();

      // Ambient neural particles drift
      const positions = t.neuralParticles.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] += Math.sin(time * 0.8 + positions[i]) * 0.003;
        if (positions[i + 1] > 4.5) positions[i + 1] = -4.5;
      }
      t.neuralParticles.geometry.attributes.position.needsUpdate = true;

      // Cinematic camera movement during Grand Win "Neural Overload"
      if (isNeuralOverload) {
        t.camera.position.x = Math.sin(time * 12) * 0.08;
        t.camera.position.y = Math.cos(time * 10) * 0.06;
        t.camera.position.z = 11.5 + Math.sin(time * 3) * 0.3;

        t.spotlights[0].intensity = 55 + Math.sin(time * 15) * 30;
        t.spotlights[1].intensity = 55 + Math.cos(time * 15) * 30;
      } else {
        // Subtle resting camera breath
        t.camera.position.x = THREE.MathUtils.lerp(t.camera.position.x, 0, 0.1);
        t.camera.position.y = THREE.MathUtils.lerp(t.camera.position.y, 0, 0.1);
        t.camera.position.z = THREE.MathUtils.lerp(t.camera.position.z, 11.5, 0.05);

        t.spotlights[0].intensity = 35;
        t.spotlights[1].intensity = 35;
      }

      // Reel Physics & Sequential Stopping
      let allLocked = true;

      for (let col = 0; col < 5; col++) {
        const state = t.reelStoppingStates[col];

        if (state === 'spinning') {
          allLocked = false;
          // Rotate reel group
          t.reelRotations[col] += t.reelVelocities[col] * delta;
          t.reelGroups[col].rotation.x = t.reelRotations[col];

          // Countdown stop timer
          t.reelStopTimers[col] -= delta;
          if (t.reelStopTimers[col] <= 0) {
            t.reelStoppingStates[col] = 'stopping';
            // Snap target to nearest multiple of full 2*PI + settled face
            const currentAngle = t.reelRotations[col];
            // Stop at exact integer multiple of 2*PI
            const currentTurns = Math.floor(currentAngle / (Math.PI * 2));
            t.reelTargetRotations[col] = (currentTurns + 1) * (Math.PI * 2);
          }

          // Spin tick sound
          if (Math.random() < 0.25) {
            soundManager.playReelTick(1.0 + col * 0.1);
          }
        } else if (state === 'stopping') {
          allLocked = false;
          // Smooth deceleration with spring overshoot
          const current = t.reelRotations[col];
          const target = t.reelTargetRotations[col];
          const diff = target - current;

          if (Math.abs(diff) > 0.02) {
            // Decelerating interpolation
            t.reelRotations[col] += diff * 12 * delta;
            t.reelGroups[col].rotation.x = t.reelRotations[col];
          } else {
            // Mechanical lock and slight spring rebound
            t.reelRotations[col] = target;
            t.reelGroups[col].rotation.x = target;
            t.reelStoppingStates[col] = 'locked';
            soundManager.playReelStop(col);
          }
        } else if (state === 'locked' || state === 'idle') {
          // Perfectly settled
          t.reelGroups[col].rotation.x = t.reelRotations[col];
        }
      }

      // Check if all reels have finished stopping
      if (allLocked && isSpinning && !allReelsLockedNotified) {
        allReelsLockedNotified = true;
        onSpinComplete();
      }

      t.renderer.render(t.scene, t.camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(t.animationFrameId);
    };
  }, [isSpinning, isNeuralOverload, onSpinComplete]);

  return (
    <div ref={containerRef} className="relative w-full h-full min-h-[420px] flex items-center justify-center overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Payline indicators badges along left and right frame */}
      <div className="absolute left-2 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 pointer-events-none z-10 hidden sm:flex">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
          const isWinning = winningPaylines.some((w) => w.paylineIndex === num - 1);
          return (
            <div
              key={num}
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold font-tech transition-all ${
                isWinning
                  ? 'bg-cyan-500 text-black shadow-[0_0_12px_#06b6d4] scale-110'
                  : 'bg-gray-900/80 text-gray-400 border border-white/10'
              }`}
            >
              {num}
            </div>
          );
        })}
      </div>

      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 pointer-events-none z-10 hidden sm:flex">
        {[11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map((num) => {
          const isWinning = winningPaylines.some((w) => w.paylineIndex === num - 1);
          return (
            <div
              key={num}
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold font-tech transition-all ${
                isWinning
                  ? 'bg-purple-500 text-white shadow-[0_0_12px_#a855f7] scale-110'
                  : 'bg-gray-900/80 text-gray-400 border border-white/10'
              }`}
            >
              {num}
            </div>
          );
        })}
      </div>
    </div>
  );
};
