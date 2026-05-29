"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const R = 1.9;

// National gift-flow network — donors spread across the US → Central Valley hub
const COMMUNITIES = [
  { lat: 40.712, lng:  -74.006, label: "New York",    color: 0xe65c00, size: 0.058 }, // 0 East Coast
  { lat: 25.762, lng:  -80.192, label: "Miami",       color: 0xff8c42, size: 0.054 }, // 1 Southeast
  { lat: 41.878, lng:  -87.630, label: "Chicago",     color: 0xe65c00, size: 0.056 }, // 2 Midwest
  { lat: 32.779, lng:  -96.808, label: "Dallas",      color: 0xe65c00, size: 0.054 }, // 3 South-Central
  { lat: 36.778, lng: -119.417, label: "Fresno",      color: 0xcc4a00, size: 0.082 }, // 4 Recipient hub
  { lat: 47.608, lng: -122.335, label: "Seattle",     color: 0xffb380, size: 0.054 }, // 5 Pacific NW
] as const;

// Gift-flow connections: from → to, h = arc apex height above surface
const CONNECTIONS = [
  { from: 0, to: 4, h: 0.76 }, // New York → Fresno  (cross-country)
  { from: 1, to: 4, h: 0.68 }, // Miami    → Fresno  (long diagonal)
  { from: 2, to: 4, h: 0.62 }, // Chicago  → Fresno
  { from: 3, to: 4, h: 0.52 }, // Dallas   → Fresno
  { from: 5, to: 4, h: 0.38 }, // Seattle  → Fresno  (Pacific coast)
  { from: 0, to: 3, h: 0.56 }, // New York → Dallas  (cross-network)
] as const;

function geo(lat: number, lng: number, r: number): THREE.Vector3 {
  const phi   = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
     r * Math.cos(phi),
     r * Math.sin(phi) * Math.sin(theta),
  );
}

export default function Globe({ cameraZ = 3.6 }: { cameraZ?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cameraRef   = useRef<THREE.PerspectiveCamera | null>(null);

  // Live zoom — update camera whenever prop changes without rebuilding scene
  useEffect(() => {
    if (cameraRef.current) cameraRef.current.position.z = cameraZ;
  }, [cameraZ]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const W = el.clientWidth;
    const H = el.clientHeight;

    // ── Scene / Camera / Renderer ─────────────────────────────────────────
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(56, W / H, 0.1, 100);
    camera.position.z = cameraZ;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.setClearColor(0, 0);
    el.appendChild(renderer.domElement);

    // ── Globe group ───────────────────────────────────────────────────────
    const group = new THREE.Group();
    group.rotation.y =  0.18;  // center continental US toward viewer
    group.rotation.x = -0.10;
    scene.add(group);

    const sphereGeo = new THREE.SphereGeometry(R, 44, 44);

    // Wireframe lines
    group.add(new THREE.LineSegments(
      new THREE.WireframeGeometry(sphereGeo),
      new THREE.LineBasicMaterial({ color: 0xe65c00, transparent: true, opacity: 0.16 })
    ));

    // Vertex dot cloud
    group.add(new THREE.Points(
      sphereGeo,
      new THREE.PointsMaterial({ color: 0xe65c00, size: 0.020, transparent: true, opacity: 0.42 })
    ));

    // Atmospheric glow shell (back-face — warm limb effect)
    group.add(new THREE.Mesh(
      new THREE.SphereGeometry(R + 0.16, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0xffede0, transparent: true, opacity: 0.055, side: THREE.BackSide })
    ));

    // ── Community pins ────────────────────────────────────────────────────
    const pinPos = COMMUNITIES.map(c => geo(c.lat, c.lng, R + 0.04));

    interface PulseRing { mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial; phase: number }
    const pulseRings: PulseRing[] = [];

    COMMUNITIES.forEach((c, i) => {
      const p = pinPos[i];

      // Outer glow blob
      const glowMesh = new THREE.Mesh(
        new THREE.SphereGeometry(c.size * 3.8, 10, 10),
        new THREE.MeshBasicMaterial({ color: c.color, transparent: true, opacity: 0.065 })
      );
      glowMesh.position.copy(p);
      group.add(glowMesh);

      // Mid halo
      const haloMesh = new THREE.Mesh(
        new THREE.SphereGeometry(c.size * 2.0, 10, 10),
        new THREE.MeshBasicMaterial({ color: c.color, transparent: true, opacity: 0.18 })
      );
      haloMesh.position.copy(p);
      group.add(haloMesh);

      // Core dot
      const coreMesh = new THREE.Mesh(
        new THREE.SphereGeometry(c.size, 14, 14),
        new THREE.MeshBasicMaterial({ color: c.color })
      );
      coreMesh.position.copy(p);
      group.add(coreMesh);

      // Animated pulse ring
      const pulseMat  = new THREE.MeshBasicMaterial({ color: c.color, transparent: true, opacity: 0.12 });
      const pulseMesh = new THREE.Mesh(new THREE.SphereGeometry(c.size * 3.0, 10, 10), pulseMat);
      pulseMesh.position.copy(p);
      group.add(pulseMesh);
      pulseRings.push({ mesh: pulseMesh, mat: pulseMat, phase: i * 1.08 });
    });

    // ── Arcs + traveling signal dots ──────────────────────────────────────
    interface Traveler { mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial; t: number; speed: number }
    interface Arc { curve: THREE.QuadraticBezierCurve3; travelers: Traveler[] }
    const arcs: Arc[] = [];

    CONNECTIONS.forEach(({ from, to, h }) => {
      const a = pinPos[from].clone();
      const b = pinPos[to].clone();

      // Push arc control point outward by h
      const ctrl = a.clone().add(b).multiplyScalar(0.5);
      ctrl.normalize().multiplyScalar(R + h);

      const curve = new THREE.QuadraticBezierCurve3(a, ctrl, b);

      // Visible arc line
      group.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(curve.getPoints(80)),
        new THREE.LineBasicMaterial({ color: 0xe65c00, transparent: true, opacity: 0.48 })
      ));

      // Two travelers, offset by 0.5 in phase
      const travelers: Traveler[] = [0, 0.5].map(offset => {
        const mat  = new THREE.MeshBasicMaterial({ color: 0xffd4a8, transparent: true, opacity: 0.9 });
        const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.040, 8, 8), mat);
        mesh.position.copy(curve.getPoint(offset));
        group.add(mesh);
        return { mesh, mat, t: offset, speed: 0.0020 + Math.random() * 0.0014 };
      });

      arcs.push({ curve, travelers });
    });

    // ── Animation loop ────────────────────────────────────────────────────
    let raf: number;
    let clock = 0;

    function animate() {
      raf = requestAnimationFrame(animate);
      clock += 0.014;

      group.rotation.y += 0.0010;

      // Pulse each community ring
      for (const pr of pulseRings) {
        const s = (Math.sin(clock * 1.9 + pr.phase) + 1) / 2; // 0 → 1
        pr.mesh.scale.setScalar(1 + 0.48 * s);
        pr.mat.opacity = 0.12 * (1 - 0.80 * s);
      }

      // Advance travelers
      for (const arc of arcs) {
        for (const tv of arc.travelers) {
          tv.t = (tv.t + tv.speed) % 1;
          tv.mesh.position.copy(arc.curve.getPoint(tv.t));
          // Sine envelope — appear at source, dissolve at destination
          const env = Math.max(0, Math.sin(tv.t * Math.PI));
          tv.mat.opacity = 0.12 + 0.88 * env;
          tv.mesh.scale.setScalar(0.75 + 0.55 * env);
        }
      }

      renderer.render(scene, camera);
    }
    animate();

    // ── Responsive resize ─────────────────────────────────────────────────
    const ro = new ResizeObserver(() => {
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(el.clientWidth, el.clientHeight);
    });
    ro.observe(el);

    // ── Cleanup ───────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}
