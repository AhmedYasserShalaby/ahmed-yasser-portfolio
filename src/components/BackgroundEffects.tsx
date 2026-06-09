import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { useReducedMotion } from "../hooks/useReducedMotion";

export function BackgroundEffects() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reducedMotion = useReducedMotion();
  const touchDevice = useMediaQuery("(hover: none)");

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas || reducedMotion) {
      return;
    }

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true,
      powerPreference: "low-power"
    });
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.1, 100);
    const group = new THREE.Group();
    const pointer = new THREE.Vector2(0, 0);

    camera.position.z = 8;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const blueMaterial = new THREE.PointsMaterial({
      color: 0x2d6f9e,
      size: touchDevice ? 0.018 : 0.024,
      transparent: true,
      opacity: 0.42
    });

    const particleCount = touchDevice ? 120 : 220;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let index = 0; index < particleCount; index += 1) {
      const radius = 1.4 + Math.random() * 4.8;
      const angle = Math.random() * Math.PI * 2;
      particlePositions[index * 3] = Math.cos(angle) * radius;
      particlePositions[index * 3 + 1] = Math.sin(angle) * radius * 0.62;
      particlePositions[index * 3 + 2] = (Math.random() - 0.5) * 2.8;
    }

    const particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particles = new THREE.Points(particlesGeometry, blueMaterial);

    group.add(particles);
    group.position.set(1.9, -0.2, 0);
    scene.add(group);

    function resize() {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    }

    function onPointerMove(event: PointerEvent) {
      pointer.x = (event.clientX / window.innerWidth - 0.5) * 0.7;
      pointer.y = (event.clientY / window.innerHeight - 0.5) * 0.45;
    }

    let animationFrame = 0;
    function render() {
      group.rotation.z += 0.0017;
      group.rotation.x += (pointer.y - group.rotation.x) * 0.02;
      group.rotation.y += (pointer.x - group.rotation.y) * 0.02;
      particles.rotation.z -= 0.0009;
      renderer.render(scene, camera);
      animationFrame = window.requestAnimationFrame(render);
    }

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove);
    render();

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      scene.remove(group);
      particlesGeometry.dispose();
      blueMaterial.dispose();
      renderer.dispose();
    };
  }, [reducedMotion, touchDevice]);

  return (
    <>
      <div className="noise-layer" aria-hidden="true" />
      <div className="scanline-layer" aria-hidden="true" />
      <canvas ref={canvasRef} className="data-field" aria-hidden="true" />
    </>
  );
}
