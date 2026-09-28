'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Pumpjack3DViewerProps {
  spm: number;
  isRunning: boolean;
  fluidLevelM?: number;
  tempC?: number;
}

export const Pumpjack3DViewer: React.FC<Pumpjack3DViewerProps> = ({
  spm = 5.5,
  isRunning = true,
  fluidLevelM = 340,
  tempC = 78.5,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // 1. Scene, Camera, Renderer Setup
    const width = mount.clientWidth || 800;
    const height = mount.clientHeight || 480;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x06090e);
    scene.fog = new THREE.FogExp2(0x06090e, 0.02);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(13, 7.5, 14);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    mount.appendChild(renderer.domElement);

    // 2. Lighting System (Industrial Sun + Desert Sky Ambient + Accent Rim)
    const ambientLight = new THREE.AmbientLight(0x1e293b, 1.8);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff5ea, 3.2);
    sunLight.position.set(15, 20, 10);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 50;
    sunLight.shadow.camera.left = -12;
    sunLight.shadow.camera.right = 12;
    sunLight.shadow.camera.top = 12;
    sunLight.shadow.camera.bottom = -12;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    fillLight.position.set(-10, 8, -10);
    scene.add(fillLight);

    const groundBounce = new THREE.DirectionalLight(0xf59e0b, 0.6);
    groundBounce.position.set(0, -5, 5);
    scene.add(groundBounce);

    // 3. Industrial PBR Materials
    const steelDarkMat = new THREE.MeshStandardMaterial({
      color: 0x1f2630,
      metalness: 0.85,
      roughness: 0.35,
    });

    const steelMidMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.75,
      roughness: 0.45,
    });

    const safetyYellowMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.25,
      roughness: 0.35,
    });

    const hazardStripeMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      metalness: 0.4,
      roughness: 0.6,
    });

    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      metalness: 0.98,
      roughness: 0.08,
    });

    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      metalness: 0.8,
      roughness: 0.3,
    });

    const concreteMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.1,
      roughness: 0.9,
    });

    const earthMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.05,
      roughness: 0.95,
    });

    const oilMat = new THREE.MeshStandardMaterial({
      color: 0x030712,
      metalness: 0.9,
      roughness: 0.1,
    });

    const wireCableMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      metalness: 0.9,
      roughness: 0.3,
    });

    // 4. Group Container
    const pumpjackGroup = new THREE.Group();
    scene.add(pumpjackGroup);

    // Foundation Slab & Ground
    const groundGeo = new THREE.PlaneGeometry(35, 35);
    const ground = new THREE.Mesh(groundGeo, earthMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.05;
    ground.receiveShadow = true;
    scene.add(ground);

    // Concrete Pad
    const padGeo = new THREE.BoxGeometry(11, 0.4, 4.5);
    const pad = new THREE.Mesh(padGeo, concreteMat);
    pad.position.set(0.5, 0.15, 0);
    pad.receiveShadow = true;
    pad.castShadow = true;
    pumpjackGroup.add(pad);

    // Steel Skid Rails (Dual I-Beams)
    const skidGeo = new THREE.BoxGeometry(10.5, 0.25, 0.3);
    const skid1 = new THREE.Mesh(skidGeo, steelDarkMat);
    skid1.position.set(0.5, 0.45, 1.4);
    skid1.castShadow = true;
    pumpjackGroup.add(skid1);

    const skid2 = new THREE.Mesh(skidGeo, steelDarkMat);
    skid2.position.set(0.5, 0.45, -1.4);
    skid2.castShadow = true;
    pumpjackGroup.add(skid2);

    // Cross Skid Braces
    for (let x = -4; x <= 5; x += 2.2) {
      const braceGeo = new THREE.BoxGeometry(0.3, 0.2, 2.8);
      const brace = new THREE.Mesh(braceGeo, steelDarkMat);
      brace.position.set(x, 0.45, 0);
      brace.castShadow = true;
      pumpjackGroup.add(brace);
    }

    // 5. Samson Post (Pyramidal 4-Legged Heavy A-Frame)
    const samsonGroup = new THREE.Group();
    samsonGroup.position.set(1.2, 0.5, 0);
    pumpjackGroup.add(samsonGroup);

    const postHeight = 4.8;
    const postTopW = 0.5;
    const postBotW = 2.4;
    const postBotD = 2.2;

    // 4 Corner Legs
    const legGeo = new THREE.CylinderGeometry(0.08, 0.12, postHeight, 8);
    const legPositions = [
      { x1: -postBotW / 2, z1: -postBotD / 2, x2: -postTopW / 2, z2: -0.25 },
      { x1: postBotW / 2, z1: -postBotD / 2, x2: postTopW / 2, z2: -0.25 },
      { x1: -postBotW / 2, z1: postBotD / 2, x2: -postTopW / 2, z2: 0.25 },
      { x1: postBotW / 2, z1: postBotD / 2, x2: postTopW / 2, z2: 0.25 },
    ];

    legPositions.forEach((pos) => {
      const leg = new THREE.Mesh(legGeo, steelMidMat);
      leg.castShadow = true;
      const start = new THREE.Vector3(pos.x1, 0, pos.z1);
      const end = new THREE.Vector3(pos.x2, postHeight, pos.z2);
      leg.position.copy(start.clone().add(end).multiplyScalar(0.5));
      leg.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), end.clone().sub(start).normalize());
      samsonGroup.add(leg);
    });

    // Horizontal & Diagonal Bracing
    for (let h = 1.2; h <= 3.8; h += 1.3) {
      const scale = 1 - (h / postHeight) * 0.7;
      const bX = new THREE.Mesh(new THREE.BoxGeometry(postBotW * scale, 0.08, 0.08), steelMidMat);
      bX.position.set(0, h, postBotD * scale * 0.5);
      bX.castShadow = true;
      samsonGroup.add(bX);

      const bX2 = bX.clone();
      bX2.position.z = -postBotD * scale * 0.5;
      samsonGroup.add(bX2);

      const bZ = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, postBotD * scale), steelMidMat);
      bZ.position.set(postBotW * scale * 0.5, h, 0);
      bZ.castShadow = true;
      samsonGroup.add(bZ);

      const bZ2 = bZ.clone();
      bZ2.position.x = -postBotW * scale * 0.5;
      samsonGroup.add(bZ2);
    }

    // Top Center Saddle Bearing Fulcrum Platform
    const saddleGeo = new THREE.BoxGeometry(0.7, 0.35, 0.9);
    const saddle = new THREE.Mesh(saddleGeo, steelDarkMat);
    saddle.position.set(0, postHeight + 0.15, 0);
    saddle.castShadow = true;
    samsonGroup.add(saddle);

    // Saddle Bearing Pin
    const saddlePin = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.1, 16), chromeMat);
    saddlePin.rotation.x = Math.PI / 2;
    saddlePin.position.set(0, postHeight + 0.25, 0);
    saddlePin.castShadow = true;
    samsonGroup.add(saddlePin);

    // 6. Gearbox Housing & Electric Drive Motor
    const gearGroup = new THREE.Group();
    gearGroup.position.set(-2.6, 0.6, 0);
    pumpjackGroup.add(gearGroup);

    // Heavy Cast Iron Gearbox
    const gearBoxGeo = new THREE.BoxGeometry(1.6, 1.8, 1.5);
    const gearBox = new THREE.Mesh(gearBoxGeo, steelDarkMat);
    gearBox.position.set(0, 0.9, 0);
    gearBox.castShadow = true;
    gearGroup.add(gearBox);

    // Slow-Speed Crank Shaft
    const crankShaftGeo = new THREE.CylinderGeometry(0.14, 0.14, 2.7, 16);
    const crankShaft = new THREE.Mesh(crankShaftGeo, chromeMat);
    crankShaft.rotation.x = Math.PI / 2;
    crankShaft.position.set(0, 1.1, 0);
    crankShaft.castShadow = true;
    gearGroup.add(crankShaft);

    // Prime Mover Electric Motor
    const motorGeo = new THREE.CylinderGeometry(0.45, 0.45, 1.2, 16);
    const motor = new THREE.Mesh(motorGeo, steelDarkMat);
    motor.rotation.z = Math.PI / 2;
    motor.position.set(-1.6, 0.6, 0);
    motor.castShadow = true;
    gearGroup.add(motor);

    // V-Belt Safety Guard Housing
    const beltGuardGeo = new THREE.BoxGeometry(1.8, 1.2, 0.35);
    const beltGuard = new THREE.Mesh(beltGuardGeo, safetyYellowMat);
    beltGuard.position.set(-0.8, 0.8, 0.9);
    beltGuard.castShadow = true;
    gearGroup.add(beltGuard);

    // 7. Rotating Counterweight Cranks (Dual Sides: +Z and -Z)
    const crankRadius = 1.35;
    const crankArmsGroup = new THREE.Group();
    crankArmsGroup.position.set(-2.6, 1.7, 0); // Aligned with slow-speed shaft center
    pumpjackGroup.add(crankArmsGroup);

    // Create Crank & Counterweight on both sides
    const createCounterweightCrank = (zPos: number, isRight: boolean) => {
      const armGroup = new THREE.Group();
      armGroup.position.z = zPos;

      // Steel Crank Arm Bar
      const barGeo = new THREE.BoxGeometry(0.35, crankRadius * 1.4, 0.18);
      const bar = new THREE.Mesh(barGeo, steelDarkMat);
      bar.position.set(0, crankRadius * 0.5, 0);
      bar.castShadow = true;
      armGroup.add(bar);

      // Heavy Safety Yellow Counterweight (Semi-Circular/Tapered Wedge)
      const weightShape = new THREE.Shape();
      weightShape.moveTo(-0.6, 0.3);
      weightShape.lineTo(0.6, 0.3);
      weightShape.lineTo(0.85, crankRadius * 1.15);
      weightShape.quadraticCurveTo(0, crankRadius * 1.4, -0.85, crankRadius * 1.15);
      weightShape.closePath();

      const extrudeSettings = { depth: 0.32, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.04, bevelThickness: 0.04 };
      const weightGeo = new THREE.ExtrudeGeometry(weightShape, extrudeSettings);
      const weight = new THREE.Mesh(weightGeo, safetyYellowMat);
      weight.position.set(0, 0, isRight ? -0.16 : -0.16);
      weight.castShadow = true;
      armGroup.add(weight);

      // Black Hazard Stripes Detail on Counterweight
      const stripeGeo = new THREE.BoxGeometry(1.2, 0.12, 0.36);
      const stripe1 = new THREE.Mesh(stripeGeo, hazardStripeMat);
      stripe1.position.set(0, 0.75, 0);
      armGroup.add(stripe1);

      const stripe2 = new THREE.Mesh(stripeGeo, hazardStripeMat);
      stripe2.position.set(0, 1.1, 0);
      armGroup.add(stripe2);

      // Crank Pin (Wrist pin for Pitman arm) at radius = crankRadius
      const pinGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.35, 16);
      const pin = new THREE.Mesh(pinGeo, chromeMat);
      pin.rotation.x = Math.PI / 2;
      pin.position.set(0, crankRadius, 0);
      pin.castShadow = true;
      armGroup.add(pin);

      return armGroup;
    };

    const leftCrank = createCounterweightCrank(1.35, false);
    const rightCrank = createCounterweightCrank(-1.35, true);
    crankArmsGroup.add(leftCrank);
    crankArmsGroup.add(rightCrank);

    // 8. Walking Beam Assembly (Tilts around Fulcrum: 1.2, 5.45, 0)
    const fulcrumPos = new THREE.Vector3(1.2, 5.45, 0);
    const beamAssembly = new THREE.Group();
    beamAssembly.position.copy(fulcrumPos);
    pumpjackGroup.add(beamAssembly);

    const beamLengthRear = 3.9;
    const beamLengthFront = 4.2;
    const totalBeamLength = beamLengthRear + beamLengthFront;

    // Heavy Tapered Steel I-Beam
    const beamWebGeo = new THREE.BoxGeometry(totalBeamLength, 0.55, 0.16);
    const beamWeb = new THREE.Mesh(beamWebGeo, steelDarkMat);
    beamWeb.position.set((beamLengthFront - beamLengthRear) / 2, 0, 0);
    beamWeb.castShadow = true;
    beamAssembly.add(beamWeb);

    const beamTopFlangeGeo = new THREE.BoxGeometry(totalBeamLength, 0.08, 0.48);
    const beamTopFlange = new THREE.Mesh(beamTopFlangeGeo, steelMidMat);
    beamTopFlange.position.set((beamLengthFront - beamLengthRear) / 2, 0.28, 0);
    beamTopFlange.castShadow = true;
    beamAssembly.add(beamTopFlange);

    const beamBotFlangeGeo = new THREE.BoxGeometry(totalBeamLength, 0.08, 0.48);
    const beamBotFlange = new THREE.Mesh(beamBotFlangeGeo, steelMidMat);
    beamBotFlange.position.set((beamLengthFront - beamLengthRear) / 2, -0.28, 0);
    beamBotFlange.castShadow = true;
    beamAssembly.add(beamBotFlange);

    // Stiffener plates along walking beam
    for (let x = -3.2; x <= 3.8; x += 1.2) {
      const stiffGeo = new THREE.BoxGeometry(0.04, 0.48, 0.44);
      const stiff = new THREE.Mesh(stiffGeo, steelDarkMat);
      stiff.position.set(x, 0, 0);
      beamAssembly.add(stiff);
    }

    // Rear Equalizer Cross-Beam (Connects top of Pitman arms)
    const eqCrossGeo = new THREE.CylinderGeometry(0.12, 0.12, 2.9, 16);
    const eqCross = new THREE.Mesh(eqCrossGeo, chromeMat);
    eqCross.rotation.x = Math.PI / 2;
    eqCross.position.set(-beamLengthRear, 0, 0);
    eqCross.castShadow = true;
    beamAssembly.add(eqCross);

    // 9. Authentic Iconic Horsehead (Front of Walking Beam)
    const horseheadGroup = new THREE.Group();
    horseheadGroup.position.set(beamLengthFront, 0, 0);
    beamAssembly.add(horseheadGroup);

    // Curved Involute Cam Profile Shape
    const hhShape = new THREE.Shape();
    hhShape.moveTo(0, 0.3);
    hhShape.lineTo(0.5, 0.3);
    // Outer Cam Arc
    hhShape.bezierCurveTo(1.6, 0.1, 1.85, -1.8, 1.4, -2.7);
    hhShape.lineTo(1.1, -2.7);
    // Inner Recess with structural cutouts
    hhShape.bezierCurveTo(1.35, -1.8, 1.2, 0.0, 0, -0.3);
    hhShape.closePath();

    const hhExtrudeSettings = { depth: 0.38, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.03, bevelThickness: 0.03 };
    const hhGeo = new THREE.ExtrudeGeometry(hhShape, hhExtrudeSettings);
    const horseheadMesh = new THREE.Mesh(hhGeo, safetyYellowMat);
    horseheadMesh.position.set(0, 0, -0.19);
    horseheadMesh.castShadow = true;
    horseheadGroup.add(horseheadMesh);

    // Twin Wireline Bridle Cables & Carrier Bar
    const wellheadX = fulcrumPos.x + beamLengthFront + 1.45; // Exact plumb line to wellhead

    const bridleCableL = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1, 8), wireCableMat);
    bridleCableL.castShadow = true;
    scene.add(bridleCableL);

    const bridleCableR = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1, 8), wireCableMat);
    bridleCableR.castShadow = true;
    scene.add(bridleCableR);

    // Carrier Bar
    const carrierBarGeo = new THREE.BoxGeometry(0.25, 0.15, 0.7);
    const carrierBar = new THREE.Mesh(carrierBarGeo, steelDarkMat);
    carrierBar.castShadow = true;
    scene.add(carrierBar);

    // Polished Rod (Chrome Stainless Steel)
    const rodGeo = new THREE.CylinderGeometry(0.045, 0.045, 3.8, 16);
    const polishedRod = new THREE.Mesh(rodGeo, chromeMat);
    polishedRod.castShadow = true;
    scene.add(polishedRod);

    // 10. Surface Wellhead (Christmas Tree) & Stuffing Box
    const wellheadGroup = new THREE.Group();
    wellheadGroup.position.set(wellheadX, 0.4, 0);
    pumpjackGroup.add(wellheadGroup);

    // Casing Flange & Base Spool
    const baseSpool = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.42, 0.5, 16), steelDarkMat);
    baseSpool.position.y = 0.25;
    baseSpool.castShadow = true;
    wellheadGroup.add(baseSpool);

    // Master Gate Valve Body
    const valveBody = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.4, 0.5), steelMidMat);
    valveBody.position.y = 0.7;
    valveBody.castShadow = true;
    wellheadGroup.add(valveBody);

    // Valve Handwheel
    const handWheel = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.03, 8, 16), safetyYellowMat);
    handWheel.rotation.y = Math.PI / 2;
    handWheel.position.set(0.4, 0.7, 0);
    wellheadGroup.add(handWheel);

    // Flow Tee & Production Line
    const flowTee = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.5, 16), steelDarkMat);
    flowTee.position.y = 1.15;
    wellheadGroup.add(flowTee);

    const flowLine = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.4, 16), steelMidMat);
    flowLine.rotation.z = Math.PI / 2;
    flowLine.position.set(0.8, 1.15, 0);
    flowLine.castShadow = true;
    wellheadGroup.add(flowLine);

    // Polished Rod Stuffing Box (Brass Top)
    const stuffingBox = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.55, 16), brassMat);
    stuffingBox.position.y = 1.6;
    stuffingBox.castShadow = true;
    wellheadGroup.add(stuffingBox);

    // Pressure Gauge with Vibrating Needle
    const gaugeBody = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.08, 16), chromeMat);
    gaugeBody.rotation.z = Math.PI / 2;
    gaugeBody.position.set(0, 1.35, 0.3);
    wellheadGroup.add(gaugeBody);

    // 11. Dual Pitman Arms (Connecting Crank Pins to Equalizer Cross-Beam)
    const pitmanArmL = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1, 12), steelMidMat);
    pitmanArmL.castShadow = true;
    scene.add(pitmanArmL);

    const pitmanArmR = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1, 12), steelMidMat);
    pitmanArmR.castShadow = true;
    scene.add(pitmanArmR);

    // 12. Mouse / Touch Orbit Interaction
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let spherical = { radius: 21, theta: 0.85, phi: 1.18 };

    const updateCamera = () => {
      spherical.phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, spherical.phi));
      spherical.radius = Math.max(8, Math.min(35, spherical.radius));

      camera.position.x = spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta) + 1.5;
      camera.position.y = spherical.radius * Math.cos(spherical.phi) + 2.5;
      camera.position.z = spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);
      camera.lookAt(1.5, 3.2, 0);
    };

    updateCamera();

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      spherical.theta -= deltaX * 0.007;
      spherical.phi -= deltaY * 0.007;
      updateCamera();
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      spherical.radius += e.deltaY * 0.02;
      updateCamera();
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('wheel', onWheel, { passive: false });

    // 13. High-Precision Closed-Form Kinematics Animation Loop
    let crankAngle = 0;
    let lastTime: number | null = null;
    let animId: number;

    const animate = (time: number) => {
      animId = requestAnimationFrame(animate);

      if (lastTime !== null) {
        const delta = (time - lastTime) / 1000;
        const effectiveSpm = isRunning ? Math.max(0.05, spm) : 0;
        const radSpeed = (effectiveSpm * 2 * Math.PI) / 60;

        if (isRunning && effectiveSpm > 0) {
          crankAngle += delta * radSpeed;
        }

        // 1. Rotate Crank Arms (around local Z axis)
        crankArmsGroup.rotation.z = -crankAngle;

        // 2. Solve 4-Bar Linkage Kinematics Trigonometry
        // Crank Pin World Coordinate (Left side)
        const crankPinWorld = new THREE.Vector3(
          crankArmsGroup.position.x + crankRadius * Math.sin(crankAngle),
          crankArmsGroup.position.y + crankRadius * Math.cos(crankAngle),
          1.35
        );

        // Approximate Walking Beam Angle using exact 4-bar linkage projection
        const crankOffset = crankRadius * Math.cos(crankAngle);
        const beamAngle = Math.asin(crankOffset / (beamLengthRear + 0.3)) * 0.75;
        beamAssembly.rotation.z = -beamAngle;

        // Equalizer World Coordinate (Rear of walking beam)
        const eqWorldL = new THREE.Vector3(
          fulcrumPos.x - beamLengthRear * Math.cos(-beamAngle),
          fulcrumPos.y - beamLengthRear * Math.sin(-beamAngle),
          1.35
        );
        const eqWorldR = new THREE.Vector3(eqWorldL.x, eqWorldL.y, -1.35);

        const crankPinWorldR = new THREE.Vector3(crankPinWorld.x, crankPinWorld.y, -1.35);

        // 3. Update Left & Right Pitman Struts (Orient and stretch between pins)
        const updateStrut = (mesh: THREE.Mesh, start: THREE.Vector3, end: THREE.Vector3) => {
          const dist = start.distanceTo(end);
          mesh.scale.set(1, dist, 1);
          mesh.position.copy(start.clone().add(end).multiplyScalar(0.5));
          mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), end.clone().sub(start).normalize());
        };

        updateStrut(pitmanArmL, crankPinWorld, eqWorldL);
        updateStrut(pitmanArmR, crankPinWorldR, eqWorldR);

        // 4. Update Horsehead Arc, Bridle Cables & Polished Rod
        const horseheadTipWorld = new THREE.Vector3(
          wellheadX,
          fulcrumPos.y + beamLengthFront * Math.sin(-beamAngle) - 2.5,
          0
        );

        const strokeDelta = (beamLengthFront * Math.sin(-beamAngle)) * 1.6;
        const carrierBarY = 3.2 + strokeDelta;

        carrierBar.position.set(wellheadX, carrierBarY, 0);
        polishedRod.position.set(wellheadX, carrierBarY - 1.2, 0);

        // Bridle Cables from horsehead tip down to carrier bar
        const cableTopL = new THREE.Vector3(wellheadX, fulcrumPos.y + beamLengthFront * Math.sin(-beamAngle) - 0.2, 0.24);
        const cableBotL = new THREE.Vector3(wellheadX, carrierBarY, 0.24);
        updateStrut(bridleCableL, cableTopL, cableBotL);

        const cableTopR = new THREE.Vector3(wellheadX, fulcrumPos.y + beamLengthFront * Math.sin(-beamAngle) - 0.2, -0.24);
        const cableBotR = new THREE.Vector3(wellheadX, carrierBarY, -0.24);
        updateStrut(bridleCableR, cableTopR, cableBotR);
      }

      lastTime = time;
      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    // Resize Handler
    const handleResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(mount);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('wheel', onWheel);
      if (mount.contains(dom)) {
        mount.removeChild(dom);
      }
      renderer.dispose();
    };
  }, [spm, isRunning, fluidLevelM, tempC]);

  return (
    <div className="relative w-full h-full min-h-[420px] max-h-[560px] flex items-center justify-center overflow-hidden rounded-sm bg-[#06090E]">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* 3D Viewport Controls Hint */}
      <div className="absolute top-2.5 left-2.5 pointer-events-none flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-[#0B1017]/85 border border-[#1E2A3B] text-[9px] font-mono text-slate-400">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
        <span>3D ORBIT: DRAG TO ROTATE &bull; SCROLL TO ZOOM</span>
      </div>
    </div>
  );
};

export default Pumpjack3DViewer;
