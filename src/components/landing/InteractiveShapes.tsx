import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, ContactShadows, RoundedBox, Icosahedron, Cone, PresentationControls } from '@react-three/drei';
import * as THREE from 'three';

function Shape({ type, visible, color }: { type: string; visible: boolean; color: string }) {
  const mesh = useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
    if (!mesh.current) return;
    
    // Smooth transition for scale (Visibility)
    const targetScale = visible ? 1 : 0;
    // Lerp scale
    mesh.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 4);
    
    // Continuous rotation (idle)
    mesh.current.rotation.x += delta * 0.1;
    mesh.current.rotation.y += delta * 0.15;
  });

  // Optimized Material: Standard Metal (No Glass/Transmission)
  const material = (
    <meshStandardMaterial 
      color={color}
      roughness={0.3}
      metalness={0.8}
      emissive={color}
      emissiveIntensity={0.2}
    />
  );

  if (type === 'sphere') {
    // Reduced size: 1.3 -> 0.9
    return (
      <Icosahedron ref={mesh} args={[0.9, 4]}>
        {material}
      </Icosahedron>
    );
  }
  
  if (type === 'cube') {
    // Reduced size: 1.8 -> 1.2
    return (
      <RoundedBox ref={mesh} args={[1.2, 1.2, 1.2]} radius={0.1} smoothness={4}>
        {material}
      </RoundedBox>
    );
  }

  if (type === 'pyramid') {
    // Reduced size: 1.5 -> 1.0
    return (
      <Cone ref={mesh} args={[1.0, 1.4, 4]}>
        {material}
      </Cone>
    );
  }

  if (type === 'icosahedron') {
    // Reduced size: 1.5 -> 1.0
    return (
      <Icosahedron ref={mesh} args={[1.0, 0]}>
        {material}
      </Icosahedron>
    );
  }

  return null;
}

export default function InteractiveShapes() {
  const [activeShape, setActiveShape] = useState(0);

  useEffect(() => {
    // Dynamic import GSAP to avoid SSR issues
    import('gsap').then(({ gsap }) => {
      import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
        gsap.registerPlugin(ScrollTrigger);

        ScrollTrigger.create({
          trigger: "#expertise",
          start: "top top",
          end: "bottom bottom",
          onUpdate: (self) => {
            const progress = self.progress;
            // Map progress to 4 shapes
            if (progress < 0.25) setActiveShape(0); // Sphere
            else if (progress < 0.5) setActiveShape(1); // Cube
            else if (progress < 0.75) setActiveShape(2); // Pyramid
            else setActiveShape(3); // Icosahedron
          }
        });
      });
    });
  }, []);

  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 6], fov: 40 }} dpr={[1, 2]}>
        <Environment preset="city" />
        <ambientLight intensity={0.4} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        <PresentationControls
          global={false}
          cursor={true}
          snap={true}
          speed={1.5}
          zoom={1}
          rotation={[0, 0, 0]}
          polar={[-Math.PI / 4, Math.PI / 4]}
          azimuth={[-Math.PI / 4, Math.PI / 4]}
        >
          <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <group>
               {/* All shapes exist but scale in/out based on activeShape */}
               <Shape type="sphere" visible={activeShape === 0} color="#6366f1" />
               <Shape type="cube" visible={activeShape === 1} color="#8b5cf6" />
               <Shape type="pyramid" visible={activeShape === 2} color="#ec4899" />
               <Shape type="icosahedron" visible={activeShape === 3} color="#3b82f6" />
            </group>
          </Float>
        </PresentationControls>
        
        <ContactShadows position={[0, -2.5, 0]} opacity={0.4} scale={10} blur={2.5} far={4} />
      </Canvas>
    </div>
  );
}
