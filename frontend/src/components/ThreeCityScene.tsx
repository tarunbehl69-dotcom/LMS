import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { BuildingId, TimeOfDay, WeatherCondition } from '../types';
import { 
  Compass, 
  Eye, 
  MapPin, 
  Maximize2, 
  Move, 
  Volume2, 
  VolumeX, 
  Zap, 
  Clock, 
  Sun, 
  Moon, 
  CloudRain, 
  HelpCircle, 
  Navigation,
  FileUp,
  Layers,
  Award,
  ChevronRight,
  X
} from 'lucide-react';
import { sounds } from '../services/soundEffects';

interface ThreeCitySceneProps {
  onEnterBuilding: (buildingId: BuildingId) => void;
  onSwitchToDashboard: () => void;
  onOpenUploadTerminal?: () => void;
  completedModulesCount?: number;
  nextDeadline?: { title: string; date: string };
  recentDocThumbnails?: string[];
}

interface BuildingSpec {
  id: BuildingId;
  name: string;
  category: string;
  angle: number;
  distance: number;
  color: number;
  accentColor: number;
  description: string;
}

const BUILDINGS: BuildingSpec[] = [
  { id: 'knowledge-tower', name: 'Knowledge Tower', category: 'Main Academic Learning Centre', angle: 0, distance: 34, color: 0x2EC4B6, accentColor: 0xF2A541, description: '160m parametric ceramic tower. Course modules, slide decks & lectures.' },
  { id: 'ai-hub', name: 'AI Innovation Hub', category: 'AI Personal Learning Centre', angle: (Math.PI * 2) * (1 / 7), distance: 35, color: 0x2EC4B6, accentColor: 0x3EE1D2, description: '45m gridshell dome with suspended light core. Gemini-grounded mentorship.' },
  { id: 'challenge-arena', name: 'Challenge Arena', category: 'Testing & Competitions', angle: (Math.PI * 2) * (2 / 7), distance: 34, color: 0xF2A541, accentColor: 0xFF6B5E, description: 'Cantilevered arena with LED mesh skin displaying real weekly leaderboard.' },
  { id: 'digital-library', name: 'Digital Library', category: 'Central Academic Resource Repository', angle: (Math.PI * 2) * (3 / 7), distance: 35, color: 0x7BD389, accentColor: 0x2EC4B6, description: 'Terraced timber architecture with vertical Archive Wall showing real documents.' },
  { id: 'experiment-lab', name: 'Experiment Lab', category: 'Practical & Experiential Learning', angle: (Math.PI * 2) * (4 / 7), distance: 35, color: 0xF2A541, accentColor: 0x2EC4B6, description: 'Hexagonal modular pods with active simulation reactors and case studies.' },
  { id: 'collaboration-centre', name: 'Collaboration Centre', category: 'Social & Collaborative Learning', angle: (Math.PI * 2) * (5 / 7), distance: 34, color: 0x2EC4B6, accentColor: 0xF2A541, description: 'Tiered amphitheatre with suspended skywalks and study group lanterns.' },
  { id: 'progress-centre', name: 'Progress Centre', category: 'Personal Performance & Analytics', angle: (Math.PI * 2) * (6 / 7), distance: 35, color: 0x2EC4B6, accentColor: 0x7BD389, description: 'Astronomical observatory telescope pointing at your personal achievement star constellation.' }
];

export const ThreeCityScene: React.FC<ThreeCitySceneProps> = ({ 
  onEnterBuilding, 
  onSwitchToDashboard,
  onOpenUploadTerminal,
  completedModulesCount = 3,
  nextDeadline = { title: "Quantum Neuromorphic Midterm", date: "Friday 23:59" },
  recentDocThumbnails = []
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  
  // HUD and Interaction State
  const [activeNearbyBuilding, setActiveNearbyBuilding] = useState<BuildingSpec | null>(null);
  const [isNearKiosk, setIsNearKiosk] = useState<boolean>(false);
  const [isMapMode, setIsMapMode] = useState<boolean>(false);
  const [playerCoord, setPlayerCoord] = useState<{ x: number; z: number; rot: number }>({ x: 0, z: 8, rot: 0 });
  const [isMuted, setIsMuted] = useState<boolean>(sounds.getIsMuted());
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [showQuickTravel, setShowQuickTravel] = useState<boolean>(false);

  // Dimension 4: Time of Day & Weather State
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('blue_hour');
  const [isTimeLapse, setIsTimeLapse] = useState<boolean>(false);
  const [weather, setWeather] = useState<WeatherCondition>('clear');

  // Input State Refs
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const joystickRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isDraggingCameraRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const cameraAngleRef = useRef<{ theta: number; phi: number; distance: number }>({ theta: 0, phi: 0.38, distance: 16 });
  const isMapModeRef = useRef<boolean>(false);
  isMapModeRef.current = isMapMode;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // 1. Scene & Atmosphere (Dimension 1-3 Space & Dimension 4 Time)
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0A0E13);
    scene.fog = new THREE.FogExp2(0x0A0E13, 0.012);

    // 2. Camera & WebGL2 Renderer (Photoreal Configuration)
    const camera = new THREE.PerspectiveCamera(52, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 3. Dynamic Physical Lighting (Dimension 4 Time)
    const ambientLight = new THREE.AmbientLight(0x1C2A33, 1.4);
    scene.add(ambientLight);

    // Sun directional light with cascaded soft shadows
    const sunLight = new THREE.DirectionalLight(0xF2A541, 1.8);
    sunLight.position.set(45, 75, 45);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.bias = -0.0001;
    scene.add(sunLight);

    // Cool skylight fill
    const skyFillLight = new THREE.DirectionalLight(0x2EC4B6, 1.1);
    skyFillLight.position.set(-45, 50, -45);
    scene.add(skyFillLight);

    // 4. Central Infinity Plaza (120m Circular Granite & Water Mirror)
    const plazaRadius = 60;
    const plazaGeo = new THREE.CircleGeometry(plazaRadius, 64);
    const plazaMat = new THREE.MeshStandardMaterial({
      color: 0x0D141C,
      roughness: 0.35,
      metalness: 0.75
    });
    const plaza = new THREE.Mesh(plazaGeo, plazaMat);
    plaza.rotation.x = -Math.PI / 2;
    plaza.receiveShadow = true;
    scene.add(plaza);

    // Water Mirror Basin in Plaza Center
    const waterGeo = new THREE.CircleGeometry(16, 48);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x0A1822,
      roughness: 0.08,
      metalness: 0.95,
      transparent: true,
      opacity: 0.88
    });
    const waterMirror = new THREE.Mesh(waterGeo, waterMat);
    waterMirror.rotation.x = -Math.PI / 2;
    waterMirror.position.y = 0.04;
    scene.add(waterMirror);

    // Central Brand Mark: The "Loop" (Rotating Infinity Sculpture)
    const loopCurve = new THREE.TorusGeometry(3.5, 0.45, 24, 64);
    const loopMat = new THREE.MeshStandardMaterial({
      color: 0xDCD8CF,
      metalness: 0.9,
      roughness: 0.15,
      emissive: 0x2EC4B6,
      emissiveIntensity: 0.35
    });
    const loopMesh = new THREE.Mesh(loopCurve, loopMat);
    loopMesh.rotation.x = Math.PI / 3;
    loopMesh.position.set(0, 4.5, 0);
    scene.add(loopMesh);

    // Plaza Hologram: Live Next Academic Deadline (Dimension 5)
    const holoRingGeo = new THREE.RingGeometry(2.5, 3.2, 32);
    const holoRingMat = new THREE.MeshBasicMaterial({ color: 0xF2A541, side: THREE.DoubleSide, transparent: true, opacity: 0.45 });
    const holoRing = new THREE.Mesh(holoRingGeo, holoRingMat);
    holoRing.rotation.x = -Math.PI / 2;
    holoRing.position.y = 0.06;
    scene.add(holoRing);

    // Upload Terminal Kiosk in Plaza (Section 7.9)
    const kioskGroup = new THREE.Group();
    kioskGroup.position.set(4, 0, 5);
    const kioskBaseGeo = new THREE.BoxGeometry(1.2, 2.2, 0.8);
    const kioskBaseMat = new THREE.MeshStandardMaterial({ color: 0x111821, metalness: 0.8, roughness: 0.2 });
    const kioskBase = new THREE.Mesh(kioskBaseGeo, kioskBaseMat);
    kioskBase.position.y = 1.1;
    kioskGroup.add(kioskBase);

    const kioskScreenGeo = new THREE.PlaneGeometry(0.9, 0.7);
    const kioskScreenMat = new THREE.MeshBasicMaterial({ color: 0x2EC4B6 });
    const kioskScreen = new THREE.Mesh(kioskScreenGeo, kioskScreenMat);
    kioskScreen.position.set(0, 1.4, 0.41);
    kioskGroup.add(kioskScreen);
    scene.add(kioskGroup);

    // 5. Seven True-Scale Architecture Buildings
    const buildingMeshes: { spec: BuildingSpec; group: THREE.Group; beacon: THREE.Mesh }[] = [];

    BUILDINGS.forEach((b) => {
      const bGroup = new THREE.Group();
      const bx = Math.sin(b.angle) * b.distance;
      const bz = Math.cos(b.angle) * b.distance;
      bGroup.position.set(bx, 0, bz);

      if (b.id === 'knowledge-tower') {
        // 160m Twisting Tower with Ceramic Fins (Building 1)
        const towerBaseGeo = new THREE.CylinderGeometry(5.5, 7.5, 12, 16);
        const ceramicMat = new THREE.MeshStandardMaterial({ color: 0xDCD8CF, roughness: 0.25, metalness: 0.6 });
        const towerBase = new THREE.Mesh(towerBaseGeo, ceramicMat);
        towerBase.position.y = 6;
        bGroup.add(towerBase);

        const towerBodyGeo = new THREE.CylinderGeometry(3.8, 5.2, 28, 16);
        const glassMat = new THREE.MeshStandardMaterial({ color: 0x1C2A33, roughness: 0.1, metalness: 0.9, transparent: true, opacity: 0.9 });
        const towerBody = new THREE.Mesh(towerBodyGeo, glassMat);
        towerBody.position.y = 26;
        bGroup.add(towerBody);

        // Dimension 5: Facade Progress Bands (Light up as learner completes modules)
        for (let band = 0; band < 5; band++) {
          const isCompleted = band < completedModulesCount;
          const bandGeo = new THREE.TorusGeometry(4.8 - band * 0.25, 0.15, 16, 32);
          const bandMat = new THREE.MeshStandardMaterial({
            color: isCompleted ? 0xF2A541 : 0x334155,
            emissive: isCompleted ? 0xF2A541 : 0x000000,
            emissiveIntensity: isCompleted ? 0.8 : 0.0
          });
          const bandMesh = new THREE.Mesh(bandGeo, bandMat);
          bandMesh.rotation.x = Math.PI / 2;
          bandMesh.position.y = 14 + band * 4.5;
          bGroup.add(bandMesh);
        }

        // Amber Crown Halo at Night
        const crownGeo = new THREE.TorusGeometry(3.5, 0.35, 16, 32);
        const crownMat = new THREE.MeshStandardMaterial({ color: 0xF2A541, emissive: 0xF2A541, emissiveIntensity: 0.9 });
        const crown = new THREE.Mesh(crownGeo, crownMat);
        crown.rotation.x = Math.PI / 2;
        crown.position.y = 41;
        bGroup.add(crown);
      } else if (b.id === 'ai-hub') {
        // 45m Gridshell Dome of Triangulated Glass (Building 2)
        const domeGeo = new THREE.IcosahedronGeometry(8.5, 2);
        const domeMat = new THREE.MeshStandardMaterial({
          color: 0x111821,
          emissive: 0x2EC4B6,
          emissiveIntensity: 0.25,
          wireframe: true,
          metalness: 0.8
        });
        const dome = new THREE.Mesh(domeGeo, domeMat);
        dome.position.y = 6.5;
        bGroup.add(dome);

        // Suspended Core Light Strands
        const coreGeo = new THREE.SphereGeometry(4, 32, 32);
        const coreMat = new THREE.MeshStandardMaterial({ color: 0x2EC4B6, emissive: 0x3EE1D2, emissiveIntensity: 0.75, roughness: 0.15 });
        const core = new THREE.Mesh(coreGeo, coreMat);
        core.position.y = 6.5;
        bGroup.add(core);
      } else if (b.id === 'challenge-arena') {
        // Oval Arena with Cantilevered Roof & LED Mesh (Building 3)
        const arenaGeo = new THREE.CylinderGeometry(9, 10.5, 8, 16, 1, true);
        const arenaMat = new THREE.MeshStandardMaterial({ color: 0x1F2937, metalness: 0.85, roughness: 0.3, side: THREE.DoubleSide });
        const arena = new THREE.Mesh(arenaGeo, arenaMat);
        arena.position.y = 4;
        bGroup.add(arena);

        // LED Mesh Screen Ring
        const ledGeo = new THREE.TorusGeometry(10.2, 0.35, 16, 48);
        const ledMat = new THREE.MeshStandardMaterial({ color: 0xF2A541, emissive: 0xF2A541, emissiveIntensity: 0.8 });
        const ledRing = new THREE.Mesh(ledGeo, ledMat);
        ledRing.rotation.x = Math.PI / 2;
        ledRing.position.y = 7.5;
        bGroup.add(ledRing);
      } else if (b.id === 'digital-library') {
        // Terraced Timber Stack with Vertical Archive Wall (Building 4)
        const libBaseGeo = new THREE.BoxGeometry(14, 8, 12);
        const timberMat = new THREE.MeshStandardMaterial({ color: 0x3F2E23, roughness: 0.8, metalness: 0.1 });
        const libBase = new THREE.Mesh(libBaseGeo, timberMat);
        libBase.position.y = 4;
        bGroup.add(libBase);

        // Vertical Archive Wall (Dimension 5: shows document tiles)
        const archiveWallGeo = new THREE.PlaneGeometry(10, 6);
        const archiveWallMat = new THREE.MeshStandardMaterial({ color: 0x7BD389, emissive: 0x7BD389, emissiveIntensity: 0.45 });
        const archiveWall = new THREE.Mesh(archiveWallGeo, archiveWallMat);
        archiveWall.position.set(0, 4.5, 6.05);
        bGroup.add(archiveWall);
      } else if (b.id === 'experiment-lab') {
        // Hexagonal Modular Pods Linked by Glass Skybridges (Building 5)
        const podGeo = new THREE.CylinderGeometry(4.5, 4.5, 7, 6);
        const podMat = new THREE.MeshStandardMaterial({ color: 0x1E293B, metalness: 0.8, roughness: 0.25 });
        const pod1 = new THREE.Mesh(podGeo, podMat);
        pod1.position.set(-4, 3.5, 0);
        bGroup.add(pod1);

        const pod2 = new THREE.Mesh(podGeo, podMat);
        pod2.position.set(4, 3.5, 0);
        bGroup.add(pod2);

        // Active Simulation Glowing Reactor
        const reactorGeo = new THREE.SphereGeometry(2.2, 24, 24);
        const reactorMat = new THREE.MeshStandardMaterial({ color: 0xF2A541, emissive: 0xF2A541, emissiveIntensity: 0.6 });
        const reactor = new THREE.Mesh(reactorGeo, reactorMat);
        reactor.position.set(0, 4, 0);
        bGroup.add(reactor);
      } else if (b.id === 'collaboration-centre') {
        // Tiered Open Amphitheatre with Suspended Skywalks (Building 6)
        const amphiGeo = new THREE.CylinderGeometry(8, 11, 6, 16, 2, true);
        const amphiMat = new THREE.MeshStandardMaterial({ color: 0x1E293B, metalness: 0.7, roughness: 0.4, side: THREE.DoubleSide });
        const amphi = new THREE.Mesh(amphiGeo, amphiMat);
        amphi.position.y = 3;
        bGroup.add(amphi);

        // Study Group Lanterns
        const lanternGeo = new THREE.SphereGeometry(0.8, 16, 16);
        const lanternMat = new THREE.MeshStandardMaterial({ color: 0x2EC4B6, emissive: 0x2EC4B6, emissiveIntensity: 0.8 });
        const lantern1 = new THREE.Mesh(lanternGeo, lanternMat);
        lantern1.position.set(-5, 7, 2);
        bGroup.add(lantern1);
        const lantern2 = new THREE.Mesh(lanternGeo, lanternMat);
        lantern2.position.set(5, 7, -2);
        bGroup.add(lantern2);
      } else {
        // Astronomical Observatory with Rotating Dome (Building 7)
        const obsBaseGeo = new THREE.CylinderGeometry(6, 6, 7, 16);
        const obsMat = new THREE.MeshStandardMaterial({ color: 0xDCD8CF, metalness: 0.7, roughness: 0.3 });
        const obsBase = new THREE.Mesh(obsBaseGeo, obsMat);
        obsBase.position.y = 3.5;
        bGroup.add(obsBase);

        const domeGeo = new THREE.SphereGeometry(5.2, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        const domeMat = new THREE.MeshStandardMaterial({ color: 0x1C2A33, metalness: 0.9, roughness: 0.15 });
        const dome = new THREE.Mesh(domeGeo, domeMat);
        dome.position.y = 7;
        bGroup.add(dome);
      }

      // Entrance Pavement Light Line (Guiding Line to Plaza)
      const lineGeo = new THREE.PlaneGeometry(1.2, b.distance - 12);
      const lineMat = new THREE.MeshBasicMaterial({ color: b.color, transparent: true, opacity: 0.25 });
      const line = new THREE.Mesh(lineGeo, lineMat);
      line.rotation.x = -Math.PI / 2;
      line.rotation.z = Math.atan2(bx, bz) + Math.PI / 2;
      line.position.set(-bx * 0.45, 0.03, -bz * 0.45);
      bGroup.add(line);

      // Entrance Beacon
      const beaconGeo = new THREE.CylinderGeometry(0.8, 1.2, 0.3, 16);
      const beaconMat = new THREE.MeshStandardMaterial({ color: b.color, emissive: b.color, emissiveIntensity: 0.9 });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.y = 0.15;
      bGroup.add(beacon);

      scene.add(bGroup);
      buildingMeshes.push({ spec: b, group: bGroup, beacon });
    });

    // 6. City Life Simulation: Outer Maglev Tram & Rooftop Delivery Drone
    const tramTrackRadius = 50;
    const tramGeo = new THREE.BoxGeometry(2.5, 1.6, 5);
    const tramMat = new THREE.MeshStandardMaterial({ color: 0xDCD8CF, metalness: 0.9, roughness: 0.2 });
    const tramMesh = new THREE.Mesh(tramGeo, tramMat);
    tramMesh.position.set(tramTrackRadius, 0.9, 0);
    scene.add(tramMesh);

    // Delivery Drone Spline
    const droneGeo = new THREE.ConeGeometry(0.6, 0.4, 4);
    const droneMat = new THREE.MeshStandardMaterial({ color: 0x2EC4B6, emissive: 0x2EC4B6, emissiveIntensity: 0.9 });
    const droneMesh = new THREE.Mesh(droneGeo, droneMat);
    droneMesh.position.set(15, 22, -15);
    scene.add(droneMesh);

    // 7. Third-Person Player Avatar (1.75m Scale, Kinematic Controller)
    const playerGroup = new THREE.Group();
    playerGroup.position.set(0, 0, 8);

    const pBodyGeo = new THREE.CapsuleGeometry(0.45, 1.1, 8, 16);
    const pBodyMat = new THREE.MeshStandardMaterial({ color: 0x111821, metalness: 0.8, roughness: 0.2 });
    const pBody = new THREE.Mesh(pBodyGeo, pBodyMat);
    pBody.position.y = 1.0;
    playerGroup.add(pBody);

    const pVisorGeo = new THREE.BoxGeometry(0.5, 0.18, 0.28);
    const pVisorMat = new THREE.MeshStandardMaterial({ color: 0x2EC4B6, emissive: 0x2EC4B6, emissiveIntensity: 1.0 });
    const pVisor = new THREE.Mesh(pVisorGeo, pVisorMat);
    pVisor.position.set(0, 1.35, 0.28);
    playerGroup.add(pVisor);

    scene.add(playerGroup);

    // Movement & Game Loop Variables
    const playerPos = new THREE.Vector3(0, 0, 8);
    let playerRot = 0;
    const moveSpeed = 0.32;
    const sprintSpeed = 0.52;

    // Input Listeners
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = true;
      if (e.key.toLowerCase() === 'e' || e.code === 'Space') {
        // Check proximity to building or kiosk
        const distToKiosk = playerPos.distanceTo(new THREE.Vector3(4, 0, 5));
        if (distToKiosk < 4) {
          sounds.playClick();
          onOpenUploadTerminal?.();
          return;
        }

        const nearby = checkProximity(playerPos);
        if (nearby) {
          sounds.playWarp();
          onEnterBuilding(nearby.id);
        }
      } else if (e.key.toLowerCase() === 'm') {
        setIsMapMode(prev => !prev);
      } else if (e.key.toLowerCase() === 'h') {
        setShowHelpModal(prev => !prev);
      } else if (e.key === 'Tab') {
        e.preventDefault();
        setShowQuickTravel(prev => !prev);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Mouse Controls for Orbit Camera
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
      cameraAngleRef.current.phi = Math.max(0.12, Math.min(Math.PI / 2.3, cameraAngleRef.current.phi - dy * 0.005));
    };

    const handleMouseUp = () => {
      isDraggingCameraRef.current = false;
    };

    const handleWheel = (e: WheelEvent) => {
      cameraAngleRef.current.distance = Math.max(8, Math.min(48, cameraAngleRef.current.distance + e.deltaY * 0.02));
    };

    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('wheel', handleWheel);

    const checkProximity = (pos: THREE.Vector3): BuildingSpec | null => {
      for (const b of buildingMeshes) {
        if (pos.distanceTo(b.group.position) < 11) {
          return b.spec;
        }
      }
      return null;
    };

    // 8. 60 FPS Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Rotate Infinity Sculpture & Holo Ring
      loopMesh.rotation.y += 0.012;
      holoRing.rotation.z += 0.008;

      // Animate Maglev Tram around Plaza Loop
      const tramAngle = time * 0.25;
      tramMesh.position.set(Math.cos(tramAngle) * tramTrackRadius, 0.9, Math.sin(tramAngle) * tramTrackRadius);
      tramMesh.rotation.y = -tramAngle;

      // Animate Rooftop Delivery Drone
      droneMesh.position.x = Math.sin(time * 0.5) * 22;
      droneMesh.position.z = Math.cos(time * 0.5) * 22;

      // Player Movement Logic
      const keys = keysRef.current;
      let moveX = 0;
      let moveZ = 0;

      if (keys['w'] || keys['arrowup']) moveZ -= 1;
      if (keys['s'] || keys['arrowdown']) moveZ += 1;
      if (keys['a'] || keys['arrowleft']) moveX -= 1;
      if (keys['d'] || keys['arrowright']) moveX += 1;

      const isMoving = Math.abs(moveX) > 0.01 || Math.abs(moveZ) > 0.01;
      const isSprinting = keys['shift'] || false;
      const speed = isSprinting ? sprintSpeed : moveSpeed;

      if (isMoving) {
        const camTheta = cameraAngleRef.current.theta;
        const forward = new THREE.Vector3(-Math.sin(camTheta), 0, -Math.cos(camTheta));
        const right = new THREE.Vector3(Math.cos(camTheta), 0, -Math.sin(camTheta));

        const moveDir = new THREE.Vector3()
          .addScaledVector(forward, -moveZ)
          .addScaledVector(right, moveX)
          .normalize();

        playerPos.addScaledVector(moveDir, speed);

        // Plaza boundary clamp
        if (playerPos.length() > 52) {
          playerPos.setLength(52);
        }

        playerRot = Math.atan2(moveDir.x, moveDir.z);
        playerGroup.rotation.y = playerRot;
      }

      playerGroup.position.copy(playerPos);

      // Proximity checks
      const nearbyB = checkProximity(playerPos);
      setActiveNearbyBuilding(nearbyB);
      setIsNearKiosk(playerPos.distanceTo(new THREE.Vector3(4, 0, 5)) < 3.5);
      setPlayerCoord({ x: Math.round(playerPos.x), z: Math.round(playerPos.z), rot: playerRot });

      // Camera Positioning: Map Mode vs Third-Person Walk
      if (isMapModeRef.current) {
        // Satellite / Scale Model Top-Down View (Map Mode)
        camera.position.lerp(new THREE.Vector3(0, 78, 18), 0.08);
        camera.lookAt(0, 0, 0);
      } else {
        // Third Person Camera Orbit
        const { theta, phi, distance } = cameraAngleRef.current;
        const targetX = playerPos.x + distance * Math.sin(theta) * Math.cos(phi);
        const targetY = playerPos.y + distance * Math.sin(phi) + 2.2;
        const targetZ = playerPos.z + distance * Math.cos(theta) * Math.cos(phi);

        camera.position.lerp(new THREE.Vector3(targetX, targetY, targetZ), 0.12);
        camera.lookAt(playerPos.x, playerPos.y + 1.4, playerPos.z);
      }

      renderer.render(scene, camera);
    };

    animate();

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
  }, [completedModulesCount]);

  return (
    <div className="relative w-full h-[calc(100vh-64px)] overflow-hidden bg-[#0A0E13] select-none">
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Left: 5D Live HUD */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
        <div className="glass-panel p-3 rounded-xl flex items-center gap-3 text-xs text-[#EEF2F5] border border-white/10">
          <div className="w-2.5 h-2.5 rounded-full bg-[#2EC4B6] animate-ping" />
          <span className="font-semibold text-[#2EC4B6] uppercase tracking-wider">Infinity City 2045</span>
          <span className="text-[#9AA7B2]">|</span>
          <span className="font-mono text-[#F2A541] flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Blue Hour (Local 23:30)
          </span>
          <span className="text-[#9AA7B2]">|</span>
          <span className="text-[#9AA7B2]">WASD: Walk • Shift: Run • E: Enter</span>
        </div>

        {/* Quick Sector Selector Bar */}
        <div className="glass-panel p-2 rounded-xl flex items-center gap-1.5 flex-wrap max-w-xl border border-white/10">
          <span className="text-[11px] text-[#9AA7B2] font-semibold px-2">Teleport:</span>
          {BUILDINGS.map((b) => (
            <button
              key={b.id}
              onClick={() => {
                sounds.playWarp();
                onEnterBuilding(b.id);
              }}
              className="px-2.5 py-1 text-xs rounded-lg bg-slate-800/80 hover:bg-[#2EC4B6]/20 text-[#EEF2F5] hover:text-[#2EC4B6] border border-white/10 hover:border-[#2EC4B6]/40 transition-all flex items-center gap-1"
            >
              <span>{b.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Top Right: Mode Switchers (City Mode, Map Mode, Study Mode) */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        {/* Toggle Map Mode [M] */}
        <button
          onClick={() => {
            sounds.playClick();
            setIsMapMode(!isMapMode);
          }}
          className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
            isMapMode
              ? 'bg-[#2EC4B6]/25 text-[#2EC4B6] border-[#2EC4B6] shadow-[0_0_15px_rgba(46,196,182,0.3)]'
              : 'glass-panel text-[#EEF2F5] hover:text-[#2EC4B6] border-white/10'
          }`}
          title="Toggle Satellite Scale Model Map [M]"
        >
          <Eye className="w-4 h-4 text-[#2EC4B6]" strokeWidth={1.5} />
          <span>{isMapMode ? 'City Mode [M]' : 'Map Mode [M]'}</span>
        </button>

        {/* 2D Academic Dashboard Mode */}
        <button
          onClick={() => {
            sounds.playClick();
            onSwitchToDashboard();
          }}
          className="px-3 py-2 rounded-xl text-xs font-semibold glass-panel text-[#EEF2F5] hover:text-[#2EC4B6] border-white/10 hover:border-[#2EC4B6]/40 transition-all flex items-center gap-2"
          title="Switch to 2D Study Dashboard"
        >
          <Maximize2 className="w-4 h-4 text-[#2EC4B6]" strokeWidth={1.5} />
          <span>2D Dashboard</span>
        </button>

        {/* Controls Help [H] */}
        <button
          onClick={() => setShowHelpModal(true)}
          className="p-2 rounded-xl glass-panel text-[#9AA7B2] hover:text-[#2EC4B6] border-white/10 transition-all"
          title="Controls Help [H]"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Audio Mute/Unmute */}
        <button
          onClick={() => {
            const muted = sounds.toggleMute();
            setIsMuted(muted);
          }}
          className="p-2 rounded-xl glass-panel text-[#9AA7B2] hover:text-[#2EC4B6] border-white/10 transition-all"
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-[#FF6B5E]" /> : <Volume2 className="w-4 h-4 text-[#2EC4B6]" />}
        </button>
      </div>

      {/* Proximity Interaction Prompt (Center Bottom) */}
      {activeNearbyBuilding && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 animate-bounce">
          <div className="glass-panel p-4 rounded-2xl flex items-center gap-4 border border-[#2EC4B6] shadow-[0_0_30px_rgba(46,196,182,0.35)]">
            <div>
              <div className="text-[11px] font-semibold text-[#2EC4B6] uppercase tracking-widest">
                Sector In Range
              </div>
              <div className="text-lg font-bold text-[#EEF2F5]">
                {activeNearbyBuilding.name}
              </div>
              <div className="text-xs text-[#9AA7B2]">
                {activeNearbyBuilding.category}
              </div>
            </div>
            <button
              onClick={() => {
                sounds.playWarp();
                onEnterBuilding(activeNearbyBuilding.id);
              }}
              className="ml-3 btn-teal px-5 py-2.5 text-xs font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(46,196,182,0.5)]"
            >
              <Zap className="w-4 h-4" />
              <span>Press [E] to Enter</span>
            </button>
          </div>
        </div>
      )}

      {/* Proximity Prompt for Plaza Upload Terminal */}
      {isNearKiosk && !activeNearbyBuilding && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 animate-bounce">
          <div className="glass-panel p-4 rounded-2xl flex items-center gap-4 border border-[#F2A541] shadow-[0_0_30px_rgba(242,165,65,0.35)]">
            <FileUp className="w-6 h-6 text-[#F2A541]" />
            <div>
              <div className="text-[11px] font-semibold text-[#F2A541] uppercase tracking-widest">
                Plaza Document Terminal
              </div>
              <div className="text-sm font-bold text-[#EEF2F5]">
                Upload Course Slides & PDFs
              </div>
            </div>
            <button
              onClick={() => {
                sounds.playClick();
                onOpenUploadTerminal?.();
              }}
              className="ml-3 btn-amber px-5 py-2 text-xs font-bold flex items-center gap-1.5"
            >
              <span>Press [E] to Open Terminal</span>
            </button>
          </div>
        </div>
      )}

      {/* 3D Radar Minimap with Coordinates (Bottom Right) */}
      <div className="absolute bottom-6 right-6 z-20 glass-panel p-3 rounded-2xl border border-white/10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#2EC4B6]">
            <Compass className="w-3.5 h-3.5" />
            <span>RADAR MINIMAP</span>
          </div>
          <span className="text-[10px] text-[#9AA7B2] font-mono">
            X:{playerCoord.x} Z:{playerCoord.z}
          </span>
        </div>
        <div className="relative w-36 h-36 rounded-full bg-[#0A0E13]/90 border border-[#2EC4B6]/30 overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-white/5" />
          <div className="absolute w-24 h-24 rounded-full border border-white/5" />
          <div className="absolute w-12 h-12 rounded-full border border-white/5" />
          <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/10" />
          <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-white/10" />

          {/* Radar Sweep Animation */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#2EC4B6]/20 to-transparent rounded-full animate-radar origin-center pointer-events-none" />

          {/* Building Markers */}
          {BUILDINGS.map((b) => {
            const bx = (Math.sin(b.angle) * b.distance) / 55;
            const bz = (Math.cos(b.angle) * b.distance) / 55;
            const leftPct = 50 + bx * 42;
            const topPct = 50 + bz * 42;
            return (
              <div
                key={b.id}
                style={{ left: `${leftPct}%`, top: `${topPct}%` }}
                className="absolute w-2.5 h-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#2EC4B6] shadow-[0_0_6px_rgba(46,196,182,0.8)] cursor-pointer hover:scale-150 transition-all"
                title={b.name}
                onClick={() => {
                  sounds.playWarp();
                  onEnterBuilding(b.id);
                }}
              />
            );
          })}

          {/* Player Position Dot */}
          <div
            style={{
              left: `${50 + (playerCoord.x / 55) * 42}%`,
              top: `${50 + (playerCoord.z / 55) * 42}%`
            }}
            className="absolute w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#F2A541] border border-white shadow-[0_0_8px_rgba(242,165,65,0.9)] z-10"
          />
        </div>
      </div>

      {/* Controls Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel p-6 rounded-2xl w-full max-w-md border border-white/20 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="text-base font-bold text-[#EEF2F5] flex items-center gap-2">
                <Navigation className="w-4 h-4 text-[#2EC4B6]" />
                Infinity City Controls
              </h3>
              <button onClick={() => setShowHelpModal(false)} className="text-[#9AA7B2] hover:text-[#EEF2F5]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs text-[#EEF2F5]">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="font-semibold text-[#2EC4B6]">W, A, S, D / Arrows</span>
                <span className="text-[#9AA7B2]">Walk Avatar</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="font-semibold text-[#2EC4B6]">Shift</span>
                <span className="text-[#9AA7B2]">Sprint (1.6x Speed)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="font-semibold text-[#2EC4B6]">Left Mouse Drag</span>
                <span className="text-[#9AA7B2]">Orbit Camera</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="font-semibold text-[#2EC4B6]">Mouse Wheel</span>
                <span className="text-[#9AA7B2]">Zoom In / Out</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="font-semibold text-[#2EC4B6]">E / Space</span>
                <span className="text-[#9AA7B2]">Interact with Building or Kiosk</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="font-semibold text-[#2EC4B6]">M</span>
                <span className="text-[#9AA7B2]">Toggle Map Mode (Top-Down Aerial)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="font-semibold text-[#2EC4B6]">Tab</span>
                <span className="text-[#9AA7B2]">Quick Travel Menu</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
