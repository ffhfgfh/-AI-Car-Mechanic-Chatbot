'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Wrench, ShieldAlert, Sparkles, RotateCcw, Eye, Zap } from 'lucide-react';

interface Car3DViewerProps {
  onSelectComponent: (componentName: string, queryPrompt: string) => void;
  selectedComponent: string | null;
}

export const Car3DViewer: React.FC<Car3DViewerProps> = ({
  onSelectComponent,
  selectedComponent,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activePart, setActivePart] = useState<string | null>(selectedComponent);
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);

  const partsList = [
    {
      id: 'brakes',
      name: 'Brake System & Rotors',
      icon: '⚙️',
      color: '#ef4444',
      prompt: 'My brake pedal feels spongy and squeals when I press it down.',
      desc: 'Front/Rear brake pads, rotors, and hydraulic brake lines.',
    },
    {
      id: 'engine',
      name: 'Engine & Cooling System',
      icon: '🔥',
      color: '#f59e0b',
      prompt: 'My engine is overheating and steam is coming out from under the hood.',
      desc: 'Motor block, radiator, water pump, and thermostat assembly.',
    },
    {
      id: 'battery',
      name: 'Battery & Alternator',
      icon: '⚡',
      color: '#3b82f6',
      prompt: 'My car won\'t start and the dashboard battery light is flashing.',
      desc: '12V starter battery, alternator, and electrical wiring.',
    },
    {
      id: 'tires',
      name: 'Tires & Suspension',
      icon: '🛞',
      color: '#10b981',
      prompt: 'My steering wheel vibrates heavily at high speed and tires wear unevenly.',
      desc: 'Tire tread, wheel alignment, struts, and shocks.',
    },
    {
      id: 'exhaust',
      name: 'Exhaust & Catalytic Converter',
      icon: '💨',
      color: '#a855f7',
      prompt: 'Dark smoke and loud rattling noise coming from exhaust underneath car.',
      desc: 'Muffler, catalytic converter, and exhaust manifold.',
    },
  ];

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#090d16');
    scene.fog = new THREE.FogExp2('#090d16', 0.05);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(5, 3, 7);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    mountRef.current.appendChild(renderer.domElement);

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 2.5);
    dirLight1.position.set(10, 15, 10);
    dirLight1.castShadow = true;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xf59e0b, 1.8);
    dirLight2.position.set(-10, 10, -10);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0x38bdf8, 3, 10);
    pointLight.position.set(0, 2, 0);
    scene.add(pointLight);

    // 3. Reflective Grid Floor
    const gridHelper = new THREE.GridHelper(20, 20, 0x0284c7, 0x1e293b);
    gridHelper.position.y = -0.8;
    scene.add(gridHelper);

    // 4. Build 3D Stylized Vehicle Model
    const carGroup = new THREE.Group();

    // Body Chassis
    const bodyGeo = new THREE.BoxGeometry(3.6, 1.0, 1.8);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.8,
      roughness: 0.2,
    });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.position.y = 0.2;
    carGroup.add(bodyMesh);

    // Cabin Roof
    const roofGeo = new THREE.BoxGeometry(2.0, 0.8, 1.5);
    const roofMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.9,
      roughness: 0.1,
    });
    const roofMesh = new THREE.Mesh(roofGeo, roofMat);
    roofMesh.position.set(-0.2, 0.9, 0);
    carGroup.add(roofMesh);

    // Glass Windows
    const glassGeo = new THREE.BoxGeometry(1.9, 0.7, 1.52);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.5,
      roughness: 0.1,
    });
    const glassMesh = new THREE.Mesh(glassGeo, glassMat);
    glassMesh.position.set(-0.2, 0.9, 0);
    carGroup.add(glassMesh);

    // Interactive 3D Component Nodes (Hotspots)
    const interactables: { mesh: THREE.Mesh; id: string }[] = [];

    // Brakes (Front & Rear Wheels Rotors)
    const brakePositions = [
      { x: 1.2, z: 0.95 },
      { x: 1.2, z: -0.95 },
      { x: -1.2, z: 0.95 },
      { x: -1.2, z: -0.95 },
    ];
    const brakeGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.25, 24);
    brakePositions.forEach((pos) => {
      const brakeMat = new THREE.MeshStandardMaterial({
        color: activePart === 'brakes' ? 0xef4444 : 0x64748b,
        emissive: activePart === 'brakes' ? 0xef4444 : 0x000000,
        emissiveIntensity: 0.8,
        metalness: 0.9,
      });
      const brakeMesh = new THREE.Mesh(brakeGeo, brakeMat);
      brakeMesh.rotation.x = Math.PI / 2;
      brakeMesh.position.set(pos.x, -0.2, pos.z);
      carGroup.add(brakeMesh);
      interactables.push({ mesh: brakeMesh, id: 'brakes' });
    });

    // Engine Block (Hood region)
    const engineGeo = new THREE.BoxGeometry(1.0, 0.7, 1.2);
    const engineMat = new THREE.MeshStandardMaterial({
      color: activePart === 'engine' ? 0xf59e0b : 0xd97706,
      emissive: activePart === 'engine' ? 0xf59e0b : 0x000000,
      emissiveIntensity: 0.8,
      metalness: 0.7,
    });
    const engineMesh = new THREE.Mesh(engineGeo, engineMat);
    engineMesh.position.set(1.2, 0.4, 0);
    carGroup.add(engineMesh);
    interactables.push({ mesh: engineMesh, id: 'engine' });

    // Battery Node
    const battGeo = new THREE.BoxGeometry(0.5, 0.4, 0.5);
    const battMat = new THREE.MeshStandardMaterial({
      color: activePart === 'battery' ? 0x3b82f6 : 0x2563eb,
      emissive: activePart === 'battery' ? 0x3b82f6 : 0x000000,
      emissiveIntensity: 0.8,
    });
    const battMesh = new THREE.Mesh(battGeo, battMat);
    battMesh.position.set(1.0, 0.7, 0.4);
    carGroup.add(battMesh);
    interactables.push({ mesh: battMesh, id: 'battery' });

    // Exhaust Pipe Node
    const exhGeo = new THREE.CylinderGeometry(0.12, 0.12, 1.2, 16);
    const exhMat = new THREE.MeshStandardMaterial({
      color: activePart === 'exhaust' ? 0xa855f7 : 0x7e22ce,
      emissive: activePart === 'exhaust' ? 0xa855f7 : 0x000000,
      emissiveIntensity: 0.8,
    });
    const exhMesh = new THREE.Mesh(exhGeo, exhMat);
    exhMesh.rotation.z = Math.PI / 2;
    exhMesh.position.set(-1.8, -0.4, -0.4);
    carGroup.add(exhMesh);
    interactables.push({ mesh: exhMesh, id: 'exhaust' });

    scene.add(carGroup);

    // 5. Mouse Orbit Interaction & Raycasting
    let isMouseDown = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseDown = (e: MouseEvent) => {
      isMouseDown = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isMouseDown = false;
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (isMouseDown) {
        const deltaX = e.clientX - prevMouseX;
        const deltaY = e.clientY - prevMouseY;
        carGroup.rotation.y += deltaX * 0.01;
        carGroup.rotation.x += deltaY * 0.005;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
      } else {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(interactables.map((i) => i.mesh));
        if (intersects.length > 0) {
          const hit = interactables.find((i) => i.mesh === intersects[0].object);
          if (hit) setHoveredPart(hit.id);
        } else {
          setHoveredPart(null);
        }
      }
    };

    const onClick = () => {
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactables.map((i) => i.mesh));
      if (intersects.length > 0) {
        const hit = interactables.find((i) => i.mesh === intersects[0].object);
        if (hit) {
          setActivePart(hit.id);
          const partInfo = partsList.find((p) => p.id === hit.id);
          if (partInfo) {
            onSelectComponent(partInfo.name, partInfo.prompt);
          }
        }
      }
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    domEl.addEventListener('mousemove', onMouseMove);
    domEl.addEventListener('click', onClick);

    // 6. Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Auto slow spin when idle
      if (!isMouseDown) {
        carGroup.rotation.y += 0.003;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Clean up
    return () => {
      cancelAnimationFrame(animationFrameId);
      domEl.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      domEl.removeEventListener('mousemove', onMouseMove);
      domEl.removeEventListener('click', onClick);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [activePart]);

  const handleQuickSelect = (part: typeof partsList[0]) => {
    setActivePart(part.id);
    onSelectComponent(part.name, part.prompt);
  };

  return (
    <div className="relative w-full h-full min-h-[380px] bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden flex flex-col shadow-2xl">
      {/* 3D Canvas Top Control Overlay */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        <div className="bg-slate-900/90 border border-slate-700/80 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-2 pointer-events-auto">
          <Sparkles className="w-4 h-4 text-sky-400 animate-pulse" />
          <span className="text-xs font-bold text-slate-100">3D Interactive Vehicle Inspector</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-700/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] text-slate-400 pointer-events-auto flex items-center gap-1.5">
          <RotateCcw className="w-3 h-3 text-amber-400" />
          <span>Click & Drag to Rotate 3D Car</span>
        </div>
      </div>

      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="w-full flex-1 cursor-grab active:cursor-grabbing relative" />

      {/* Hovered / Active Part Notification Badge */}
      {hoveredPart && (
        <div className="absolute bottom-16 left-4 z-10 bg-sky-950/90 border border-sky-500 text-sky-200 px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md shadow-lg flex items-center gap-2 animate-bounce">
          <Eye className="w-4 h-4 text-sky-400" />
          <span>Click to Inspect {partsList.find((p) => p.id === hoveredPart)?.name}</span>
        </div>
      )}

      {/* Bottom Component Selector Hotspot Chips */}
      <div className="p-3 bg-slate-900/90 border-t border-slate-800 backdrop-blur-md flex items-center gap-2 overflow-x-auto">
        <span className="text-slate-400 text-xs font-semibold shrink-0">Inspect 3D Part:</span>
        {partsList.map((part) => {
          const isActive = activePart === part.id;
          return (
            <button
              key={part.id}
              onClick={() => handleQuickSelect(part)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all flex items-center gap-1.5 border ${
                isActive
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg scale-105'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:border-slate-600'
              }`}
            >
              <span>{part.icon}</span>
              <span>{part.name.split('&')[0]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
