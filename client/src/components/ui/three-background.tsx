import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const ThreeBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    
    // Instead of full window innerWidth, we can use the canvas's container if we want, 
    // but full window is standard for a full page background.
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    const setSize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    setSize();
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 20, 50);
    camera.lookAt(0, 0, 0);

    // Geometry: Large Plane for Terrain
    const geometry = new THREE.PlaneGeometry(400, 400, 70, 70);
    
    // Simple Vertex Displacement for 'Mountains'
    const vertices = geometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
        const x = vertices[i];
        const y = vertices[i+1];
        // Noise approximation using sine waves
        vertices[i+2] = Math.sin(x * 0.08) * Math.cos(y * 0.08) * 15 + 
                        Math.sin(x * 0.04) * 10;
    }
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();

    const material = new THREE.MeshBasicMaterial({
        color: 0x00FF41, // Neon Green accent
        wireframe: true,
        transparent: true,
        opacity: 0.15
    });

    const terrain = new THREE.Mesh(geometry, material);
    terrain.rotation.x = -Math.PI / 2;
    scene.add(terrain);

    // Constant Movement Speed
    const speed = 0.12;

    const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    let animationFrameId: number;
    const animate = () => {
        animationFrameId = requestAnimationFrame(animate);

        // Slow, steady forward movement (scrolling the terrain)
        terrain.position.z += speed;
        if (terrain.position.z > 50) {
            terrain.position.z = 0;
        }

        renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      // Clean up Three.js resources
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="three-hero-canvas"
      className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10 object-cover min-h-screen"
      style={{
        width: '100vw',
        height: '100vh',
      }}
    />
  );
};
