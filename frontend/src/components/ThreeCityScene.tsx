import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { BuildingId } from '../types';
import { Compass, Eye, MapPin, Maximize2, Move, Sparkles, Volume2, VolumeX, Zap } from 'lucide-react';
import { sounds } from '../services/soundEffects';

interface ThreeCitySceneProps {
  onEnterBuilding: (buildingId: BuildingId) => void;
  onSwitchToDashboard: () => void;
}

interface BuildingSpec {
  id: BuildingId;
  name: string;
  category: string;
  angle: number;
  distance: number;
  color: number;
  accentColor: number;
  icon: string;
}

const BUILDINGS: BuildingSpec[] = [
  { id: 'knowledge-tower', name: 'Knowledge Tower', category: 'Core LMS & Courses', angle: 0, distance: 32, color: 0x00F0FF, accentColor: 0x3B82F6, icon: '🏛️' },
  { id: 'ai-hub', name: 'AI Innovation Hub', category: 'Gemini Academic Mentor', angle: (Math.PI * 2) * (1 / 7), distance: 34, color: 0x8B5CF6, accentColor: 0xC084FC, icon: '🧠' },
  { id: 'challenge-arena', name: 'Challenge Arena', category: 'Quizzes & Competitions', angle: (Math.PI * 2) * (2 / 7), distance: 32, color: 0xF59E0B, accentColor: 0xEF4444, icon: '⚔️' },
  { id: 'digital-library', name: 'Digital Library', category: 'Research Archive & E-Books', angle: (Math.PI * 2) * (3 / 7), distance: 33, color: 0x10B981, accentColor: 0x06B6D4, icon: '📚' },
  { id: 'experiment-lab', name: 'Experiment Lab', category: 'Interactive Simulations', angle: (Math.PI * 2) * (4 / 7), distance: 34, color: 0xEC4899, accentColor: 0x8B5CF6, icon: '🔬' },
  { id: 'collaboration-centre', name: 'Collaboration Centre', category: 'Study Squads & Forums', angle: (Math.PI * 2) * (5 / 7), distance: 32, color: 0x3B82F6, accentColor: 0x60A5FA, icon: '🤝' },
  { id: 'progress-centre', name: 'Progress Centre', category: 'XP, Levels & Analytics', angle: (Math.PI * 2) * (6 / 7), distance: 33, color: 0x06B6D4, accentColor: 0x14B8A6, icon: '🏆' }
];

export const ThreeCityScene: React.FC<ThreeCitySceneProps> = ({ onEnterBuilding, onSwitchToDashboard }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activeNearbyBuilding, setActiveNearbyBuilding] = useState<BuildingSpec | null>(null);
  const [isAerialView, setIsAerialView] = useState<boolean>(false);
  const [playerCoord, setPlayerCoord] = useState<{ x: number; z: number; rot: number }>({ x: 0, z: 0, rot: 0 });
  const [isMuted, setIsMuted] = useState<boolean>(sounds.getIsMuted());

  // Input State Refs for smooth 60fps game loop
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const joystickRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isDraggingCameraRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const cameraAngleRef = useRef<{ theta: number; phi: number; distance: number }>({ theta: 0, phi: 0.35, distance: 18 });
  const isAerialRef = useRef<boolean>(false);
  isAerialRef.current = isAerialView;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // 1. Scene & Environment
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050B14);
    scene.fog = new THREE.FogExp2(0x050B14, 0.015);

    // 2. Camera & Renderer
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    renderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 3. Ambient & Directional Lighting
    const ambientLight = new THREE.AmbientLight(0x0E172A, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x00F0FF, 1.5);
    dirLight.position.set(30, 60, 40);
    scene.add(dirLight);

    const purpleLight = new THREE.DirectionalLight(0x8B5CF6, 1.2);
    purpleLight.position.set(-30, 40, -40);
    scene.add(purpleLight);

    // Central Plaza Energy Fountain
    const centralBeacon = new THREE.PointLight(0x00F0FF, 3, 40);
    centralBeacon.position.set(0, 10, 0);
    scene.add(centralBeacon);

    // 4. Ground Plaza with Cyber Grid
    const groundGeo = new THREE.CircleGeometry(65, 64);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x070D1B,
      roughness: 0.6,
      metalness: 0.8
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Plaza Concentric Cyber Rings
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00F0FF, transparent: true, opacity: 0.25, wireframe: true });
    for (let r = 10; r <= 55; r += 12) {
      const ringGeo = new THREE.RingGeometry(r - 0.2, r + 0.2, 64);
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = -Math.PI / 2;
      ringMesh.position.y = 0.05;
      scene.add(ringMesh);
    }

    // Grid Floor
    const gridHelper = new THREE.GridHelper(120, 60, 0x00F0FF, 0x1E293B);
    gridHelper.position.y = 0.02;
    (gridHelper.material as THREE.Material).transparent = true;
    (gridHelper.material as THREE.Material).opacity = 0.25;
    scene.add(gridHelper);

    // Central Plaza Monument
    const monumentGeo = new THREE.CylinderGeometry(2, 4, 1.5, 16);
    const monumentMat = new THREE.MeshStandardMaterial({ color: 0x0E172A, metalness: 0.9, roughness: 0.2 });
    const monument = new THREE.Mesh(monumentGeo, monumentMat);
    monument.position.y = 0.75;
    scene.add(monument);

    // Central Hologram Crystal
    const crystalGeo = new THREE.OctahedronGeometry(1.8, 0);
    const crystalMat = new THREE.MeshStandardMaterial({
      color: 0x00F0FF,
      emissive: 0x00F0FF,
      emissiveIntensity: 0.6,
      wireframe: true
    });
    const centralCrystal = new THREE.Mesh(crystalGeo, crystalMat);
    centralCrystal.position.set(0, 5, 0);
    scene.add(centralCrystal);

    // 5. Build Seven University Buildings
    const buildingMeshes: { spec: BuildingSpec; mesh: THREE.Group; enterPos: THREE.Vector3 }[] = [];

    BUILDINGS.forEach((b) => {
      const bGroup = new THREE.Group();
      const bx = Math.sin(b.angle) * b.distance;
      const bz = Math.cos(b.angle) * b.distance;
      bGroup.position.set(bx, 0, bz);

      // Unique Architecture based on building ID
      if (b.id === 'knowledge-tower') {
        // High cyber skyscraper with tiers and beacon
        const baseGeo = new THREE.CylinderGeometry(5, 7, 6, 8);
        const baseMat = new THREE.MeshStandardMaterial({ color: 0x0B192C, roughness: 0.3, metalness: 0.8 });
        const baseMesh = new THREE.Mesh(baseGeo, baseMat);
        baseMesh.position.y = 3;
        bGroup.add(baseMesh);

        const midGeo = new THREE.CylinderGeometry(3.5, 4.5, 14, 8);
        const midMesh = new THREE.Mesh(midGeo, baseMat);
        midMesh.position.y = 13;
        bGroup.add(midMesh);

        const spireGeo = new THREE.ConeGeometry(2.5, 12, 8);
        const spireMat = new THREE.MeshStandardMaterial({ color: 0x00F0FF, emissive: 0x00F0FF, emissiveIntensity: 0.4 });
        const spire = new THREE.Mesh(spireGeo, spireMat);
        spire.position.y = 26;
        bGroup.add(spire);

        // Holographic Rings
        const ringGeo = new THREE.TorusGeometry(5.5, 0.15, 16, 32);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x00F0FF, wireframe: true });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = 18;
        bGroup.add(ring);
      } else if (b.id === 'ai-hub') {
        // Geodesic neural sphere
        const domeGeo = new THREE.IcosahedronGeometry(7, 2);
        const domeMat = new THREE.MeshStandardMaterial({
          color: 0x1E1B4B,
          emissive: 0x8B5CF6,
          emissiveIntensity: 0.3,
          wireframe: true,
          metalness: 0.9
        });
        const dome = new THREE.Mesh(domeGeo, domeMat);
        dome.position.y = 5.5;
        bGroup.add(dome);

        // Core plasma orb
        const coreGeo = new THREE.SphereGeometry(3.5, 32, 32);
        const coreMat = new THREE.MeshStandardMaterial({ color: 0x8B5CF6, emissive: 0xC084FC, emissiveIntensity: 0.8, roughness: 0.1 });
        const core = new THREE.Mesh(coreGeo, coreMat);
        core.position.y = 5.5;
        bGroup.add(core);
      } else if (b.id === 'challenge-arena') {
        // Octagonal colosseum with glowing pillars
        const arenaGeo = new THREE.CylinderGeometry(8, 9, 7, 8, 1, true);
        const arenaMat = new THREE.MeshStandardMaterial({ color: 0x1F2937, metalness: 0.8, roughness: 0.4, side: THREE.DoubleSide });
        const arenaMesh = new THREE.Mesh(arenaGeo, arenaMat);
        arenaMesh.position.y = 3.5;
        bGroup.add(arenaMesh);

        // 8 Energy Pylons
        for (let p = 0; p < 8; p++) {
          const pAngle = (p / 8) * Math.PI * 2;
          const pylonGeo = new THREE.BoxGeometry(0.8, 12, 0.8);
          const pylonMat = new THREE.MeshStandardMaterial({ color: 0xF59E0B, emissive: 0xF59E0B, emissiveIntensity: 0.6 });
          const pylon = new THREE.Mesh(pylonGeo, pylonMat);
          pylon.position.set(Math.sin(pAngle) * 8.5, 6, Math.cos(pAngle) * 8.5);
          bGroup.add(pylon);
        }
      } else if (b.id === 'digital-library') {
        // Hypercube matrix with floating data blocks
        const libGeo = new THREE.BoxGeometry(11, 10, 11);
        const libMat = new THREE.MeshStandardMaterial({ color: 0x064E3B, metalness: 0.7, roughness: 0.3, transparent: true, opacity: 0.85 });
        const libMesh = new THREE.Mesh(libGeo, libMat);
        libMesh.position.y = 5;
        bGroup.add(libMesh);

        // Emerald Wireframe shell
        const shellGeo = new THREE.BoxGeometry(12.5, 11.5, 12.5);
        const shellMat = new THREE.MeshBasicMaterial({ color: 0x10B981, wireframe: true });
        const shell = new THREE.Mesh(shellGeo, shellMat);
        shell.position.y = 5;
        bGroup.add(shell);
      } else if (b.id === 'experiment-lab') {
        // High-tech modular facility with cylindrical reactors
        const mainGeo = new THREE.BoxGeometry(12, 6, 10);
        const mainMat = new THREE.MeshStandardMaterial({ color: 0x1E1B4B, metalness: 0.8, roughness: 0.3 });
        const mainMesh = new THREE.Mesh(mainGeo, mainMat);
        mainMesh.position.y = 3;
        bGroup.add(mainMesh);

        // Reactor chambers
        const r1Geo = new THREE.CylinderGeometry(3, 3, 10, 16);
        const rMat = new THREE.MeshStandardMaterial({ color: 0xEC4899, emissive: 0xEC4899, emissiveIntensity: 0.4, wireframe: true });
        const r1 = new THREE.Mesh(r1Geo, rMat);
        r1.position.set(-4, 5, 0);
        bGroup.add(r1);
        const r2 = new THREE.Mesh(r1Geo, rMat);
        r2.position.set(4, 5, 0);
        bGroup.add(r2);
      } else if (b.id === 'collaboration-centre') {
        // Twin connected cyber towers with skybridge
        const towerGeo = new THREE.BoxGeometry(4.5, 16, 4.5);
        const towerMat = new THREE.MeshStandardMaterial({ color: 0x1E293B, metalness: 0.8, roughness: 0.2 });
        const t1 = new THREE.Mesh(towerGeo, towerMat);
        t1.position.set(-4, 8, 0);
        bGroup.add(t1);

        const t2 = new THREE.Mesh(towerGeo, towerMat);
        t2.position.set(4, 8, 0);
        bGroup.add(t2);

        // Glowing Glass Skybridge
        const bridgeGeo = new THREE.BoxGeometry(6, 1.8, 2.5);
        const bridgeMat = new THREE.MeshStandardMaterial({ color: 0x3B82F6, emissive: 0x3B82F6, emissiveIntensity: 0.5, transparent: true, opacity: 0.8 });
        const bridge = new THREE.Mesh(bridgeGeo, bridgeMat);
        bridge.position.set(0, 10, 0);
        bGroup.add(bridge);
      } else {
        // Progress Centre: Quantum crystalline obelisk with tiered ascending rings
        const obeliskGeo = new THREE.ConeGeometry(3.5, 18, 4);
        const obeliskMat = new THREE.MeshStandardMaterial({ color: 0x06B6D4, emissive: 0x0891B2, emissiveIntensity: 0.5, metalness: 0.9, roughness: 0.1 });
        const obelisk = new THREE.Mesh(obeliskGeo, obeliskMat);
        obelisk.position.y = 9;
        bGroup.add(obelisk);

        for (let r = 0; r < 3; r++) {
          const ringG = new THREE.TorusGeometry(4 + r * 1.5, 0.1, 16, 32);
          const ringM = new THREE.MeshBasicMaterial({ color: 0x22D3EE, wireframe: true });
          const rMesh = new THREE.Mesh(ringG, ringM);
          rMesh.rotation.x = Math.PI / 2;
          rMesh.position.y = 4 + r * 4;
          bGroup.add(rMesh);
        }
      }

      // Entrance Beacon & Ground Glow Ring
      const beaconGeo = new THREE.CylinderGeometry(0.8, 1.4, 0.4, 16);
      const beaconMat = new THREE.MeshStandardMaterial({ color: b.color, emissive: b.color, emissiveIntensity: 0.8 });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.y = 0.2;
      bGroup.add(beacon);

      // Light stream from building to central plaza
      const pathGeo = new THREE.PlaneGeometry(1.5, b.distance);
      const pathMat = new THREE.MeshBasicMaterial({ color: b.color, transparent: true, opacity: 0.2 });
      const path = new THREE.Mesh(pathGeo, pathMat);
      path.rotation.x = -Math.PI / 2;
      path.rotation.z = Math.atan2(bx, bz) + Math.PI / 2;
      path.position.set(-bx / 2, 0.03, -bz / 2);
      bGroup.add(path);

      scene.add(bGroup);
      buildingMeshes.push({
        spec: b,
        mesh: bGroup,
        enterPos: new THREE.Vector3(bx * 0.8, 0, bz * 0.8)
      });
    });

    // 6. Ambient Particle Starfield / Cyber Dust
    const particleCount = 500;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePos[i] = (Math.random() - 0.5) * 120;
      particlePos[i + 1] = Math.random() * 35;
      particlePos[i + 2] = (Math.random() - 0.5) * 120;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x00F0FF,
      size: 0.35,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // 7. Third-Person Player Avatar (Cyber-Scholar)
    const playerGroup = new THREE.Group();
    playerGroup.position.set(0, 0, 8);

    // Player Body
    const pBodyGeo = new THREE.CapsuleGeometry(0.5, 1.2, 8, 16);
    const pBodyMat = new THREE.MeshStandardMaterial({ color: 0x0F172A, metalness: 0.8, roughness: 0.2 });
    const pBody = new THREE.Mesh(pBodyGeo, pBodyMat);
    pBody.position.y = 1.1;
    playerGroup.add(pBody);

    // Player Glowing Visor
    const pVisorGeo = new THREE.BoxGeometry(0.55, 0.2, 0.3);
    const pVisorMat = new THREE.MeshStandardMaterial({ color: 0x00F0FF, emissive: 0x00F0FF, emissiveIntensity: 1.0 });
    const pVisor = new THREE.Mesh(pVisorGeo, pVisorMat);
    pVisor.position.set(0, 1.45, 0.3);
    playerGroup.add(pVisor);

    // Player Direction Indicator & Light Ring
    const pRingGeo = new THREE.RingGeometry(0.8, 1.0, 24);
    const pRingMat = new THREE.MeshBasicMaterial({ color: 0x00F0FF, side: THREE.DoubleSide });
    const pRing = new THREE.Mesh(pRingGeo, pRingMat);
    pRing.rotation.x = -Math.PI / 2;
    pRing.position.y = 0.05;
    playerGroup.add(pRing);

    scene.add(playerGroup);

    // 8. Player Movement & Physics State
    const playerPos = new THREE.Vector3(0, 0, 8);
    let playerRot = 0;
    const moveSpeed = 0.32;
    const sprintMultiplier = 1.6;

    // 9. Input Listeners
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = true;
      if (e.key.toLowerCase() === 'e' || e.code === 'Space') {
        // Trigger enter nearby building if in range
        const nearby = checkProximity(playerPos);
        if (nearby) {
          sounds.playWarp();
          onEnterBuilding(nearby.id);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Mouse drag for camera rotation
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        isDraggingCameraRef.current = true;
        lastMousePosRef.current = { x: e.clientX, y: e.clientY };
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingCameraRef.current) return;
      const dx = e.clientX - lastMousePosRef.current.x;
      const dy = e.clientY - lastMousePosRef.current.y;
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };

      cameraAngleRef.current.theta -= dx * 0.005;
      cameraAngleRef.current.phi = Math.max(0.1, Math.min(Math.PI / 2.2, cameraAngleRef.current.phi - dy * 0.005));
    };

    const handleMouseUp = () => {
      isDraggingCameraRef.current = false;
    };

    const handleWheel = (e: WheelEvent) => {
      cameraAngleRef.current.distance = Math.max(8, Math.min(45, cameraAngleRef.current.distance + e.deltaY * 0.02));
    };

    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('wheel', handleWheel);

    // Check proximity helper
    const checkProximity = (pos: THREE.Vector3): BuildingSpec | null => {
      for (const b of buildingMeshes) {
        const dist = pos.distanceTo(b.mesh.position);
        if (dist < 10) {
          return b.spec;
        }
      }
      return null;
    };

    // 10. Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Rotate crystals and particles
      centralCrystal.rotation.y += 0.015;
      centralCrystal.position.y = 5 + Math.sin(time * 2) * 0.4;
      particleSystem.rotation.y += 0.0005;

      // Calculate Player Movement Vector
      const keys = keysRef.current;
      const joy = joystickRef.current;
      let moveX = 0;
      let moveZ = 0;

      if (keys['w'] || keys['arrowup']) moveZ -= 1;
      if (keys['s'] || keys['arrowdown']) moveZ += 1;
      if (keys['a'] || keys['arrowleft']) moveX -= 1;
      if (keys['d'] || keys['arrowright']) moveX += 1;

      // Virtual joystick
      if (Math.abs(joy.x) > 0.1 || Math.abs(joy.y) > 0.1) {
        moveX = joy.x;
        moveZ = -joy.y;
      }

      const isMoving = Math.abs(moveX) > 0.01 || Math.abs(moveZ) > 0.01;
      const isSprinting = keys['shift'] || false;
      const currentSpeed = moveSpeed * (isSprinting ? sprintMultiplier : 1.0);

      if (isMoving) {
        // Compute movement direction relative to camera angle
        const camTheta = cameraAngleRef.current.theta;
        const forward = new THREE.Vector3(-Math.sin(camTheta), 0, -Math.cos(camTheta));
        const right = new THREE.Vector3(Math.cos(camTheta), 0, -Math.sin(camTheta));

        const moveDir = new THREE.Vector3()
          .addScaledVector(forward, -moveZ)
          .addScaledVector(right, moveX)
          .normalize();

        playerPos.addScaledVector(moveDir, currentSpeed);

        // Clamp to Plaza Radius (55 units)
        if (playerPos.length() > 54) {
          playerPos.setLength(54);
        }

        playerRot = Math.atan2(moveDir.x, moveDir.z);
        playerGroup.rotation.y = playerRot;
      }

      playerGroup.position.copy(playerPos);

      // Check Nearby Building Proximity
      const nearby = checkProximity(playerPos);
      setActiveNearbyBuilding(nearby);
      setPlayerCoord({ x: Math.round(playerPos.x), z: Math.round(playerPos.z), rot: playerRot });

      // Update Camera Position
      if (isAerialRef.current) {
        // High Aerial View looking straight down at plaza
        camera.position.lerp(new THREE.Vector3(0, 75, 20), 0.05);
        camera.lookAt(0, 0, 0);
      } else {
        // Third Person Camera Orbit
        const { theta, phi, distance } = cameraAngleRef.current;
        const targetX = playerPos.x + distance * Math.sin(theta) * Math.cos(phi);
        const targetY = playerPos.y + distance * Math.sin(phi) + 2.5;
        const targetZ = playerPos.z + distance * Math.cos(theta) * Math.cos(phi);

        camera.position.lerp(new THREE.Vector3(targetX, targetY, targetZ), 0.12);
        camera.lookAt(playerPos.x, playerPos.y + 1.5, playerPos.z);
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-[calc(100vh-64px)] overflow-hidden bg-slate-950 select-none">
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Holographic Controls HUD (Top Left) */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
        <div className="glass-panel p-3 rounded-xl flex items-center gap-3 text-xs text-slate-300">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <span className="font-semibold text-cyan-400 uppercase tracking-wider">3D Campus Live</span>
          <span className="text-slate-500">|</span>
          <span>WASD / Arrows to Move</span>
          <span className="text-slate-500">|</span>
          <span>Shift to Sprint</span>
          <span className="text-slate-500">|</span>
          <span>Drag to Rotate View</span>
        </div>

        {/* Quick Teleport Sector Selector */}
        <div className="glass-panel p-2 rounded-xl flex items-center gap-1.5 flex-wrap max-w-xl">
          <span className="text-xs text-slate-400 font-medium px-2">Teleport:</span>
          {BUILDINGS.map((b) => (
            <button
              key={b.id}
              onClick={() => {
                sounds.playWarp();
                onEnterBuilding(b.id);
              }}
              className="px-2.5 py-1 text-xs rounded-lg bg-slate-800/80 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-slate-700/50 hover:border-cyan-500/40 transition-all flex items-center gap-1"
            >
              <span>{b.icon}</span>
              <span className="hidden sm:inline">{b.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* View Mode & Audio Controls (Top Right) */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <button
          onClick={() => {
            sounds.playClick();
            setIsAerialView(!isAerialView);
          }}
          className={`px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-2 border transition-all ${
            isAerialView
              ? 'bg-cyan-500/30 text-cyan-300 border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.3)]'
              : 'glass-panel text-slate-300 hover:text-cyan-300 border-cyan-500/20'
          }`}
        >
          <Eye className="w-4 h-4 text-cyan-400" />
          <span>{isAerialView ? 'Third Person View' : 'Aerial Overview'}</span>
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            onSwitchToDashboard();
          }}
          className="px-3 py-2 rounded-xl text-xs font-medium glass-panel text-slate-300 hover:text-cyan-300 border-cyan-500/20 hover:border-cyan-400 transition-all flex items-center gap-2"
        >
          <Maximize2 className="w-4 h-4 text-cyan-400" />
          <span>2D Dashboard Mode</span>
        </button>

        <button
          onClick={() => {
            const muted = sounds.toggleMute();
            setIsMuted(muted);
          }}
          className="p-2 rounded-xl glass-panel text-slate-300 hover:text-cyan-400 border-cyan-500/20 transition-all"
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
        </button>
      </div>

      {/* Proximity Interaction Prompt (Center Bottom) */}
      {activeNearbyBuilding && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 animate-bounce">
          <div className="glass-panel-glow px-6 py-4 rounded-2xl flex items-center gap-4 border border-cyan-400 shadow-[0_0_30px_rgba(0,240,255,0.4)]">
            <span className="text-3xl">{activeNearbyBuilding.icon}</span>
            <div>
              <div className="text-xs font-semibold text-cyan-400 uppercase tracking-widest">
                Sector In Range
              </div>
              <div className="text-lg font-bold text-white">
                {activeNearbyBuilding.name}
              </div>
              <div className="text-xs text-slate-300">
                {activeNearbyBuilding.category}
              </div>
            </div>
            <button
              onClick={() => {
                sounds.playWarp();
                onEnterBuilding(activeNearbyBuilding.id);
              }}
              className="ml-4 px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-sm shadow-[0_0_20px_rgba(0,240,255,0.6)] transition-all flex items-center gap-2"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>Press [E] or Enter</span>
            </button>
          </div>
        </div>
      )}

      {/* 3D Minimap Radar (Bottom Right) */}
      <div className="absolute bottom-6 right-6 z-20 glass-panel p-3 rounded-2xl border border-cyan-500/30">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400">
            <Compass className="w-3.5 h-3.5" />
            <span>RADAR MINIMAP</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            X:{playerCoord.x} Z:{playerCoord.z}
          </span>
        </div>
        <div className="relative w-36 h-36 rounded-full bg-slate-900/90 border border-cyan-500/40 overflow-hidden flex items-center justify-center">
          {/* Radar Sweep Line */}
          <div className="absolute inset-0 rounded-full border border-cyan-500/20" />
          <div className="absolute w-24 h-24 rounded-full border border-cyan-500/10" />
          <div className="absolute w-12 h-12 rounded-full border border-cyan-500/10" />
          <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-cyan-500/20" />
          <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-cyan-500/20" />

          {/* Rotating Radar Scanner */}
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-transparent rounded-full animate-radar origin-center pointer-events-none" />

          {/* Building Beacons on Radar */}
          {BUILDINGS.map((b) => {
            const bx = (Math.sin(b.angle) * b.distance) / 60; // normalized -1 to 1
            const bz = (Math.cos(b.angle) * b.distance) / 60;
            const leftPct = 50 + bx * 42;
            const topPct = 50 + bz * 42;
            return (
              <div
                key={b.id}
                style={{ left: `${leftPct}%`, top: `${topPct}%` }}
                className="absolute w-2.5 h-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(0,240,255,0.8)] cursor-pointer hover:scale-150 transition-all"
                title={b.name}
                onClick={() => {
                  sounds.playWarp();
                  onEnterBuilding(b.id);
                }}
              />
            );
          })}

          {/* Player Dot */}
          <div
            style={{
              left: `${50 + (playerCoord.x / 60) * 42}%`,
              top: `${50 + (playerCoord.z / 60) * 42}%`
            }}
            className="absolute w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-400 border border-white shadow-[0_0_8px_rgba(192,132,252,0.9)] z-10"
          />
        </div>
      </div>
    </div>
  );
};
