// src/components/SingleCard3D.jsx - CREAR ESTE ARCHIVO
import React, { useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Text } from '@react-three/drei';

const SingleCard3D = ({ card, index, selected, isCurrent, onClick, interactive }) => {
  const meshRef = useRef();
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);

  const getPosition = (index) => {
    const row = Math.floor(index / 4);
    const col = index % 4;
    return [col * 2.2 - 3.3, -row * 2.2 + 3.3, 0];
  };

  const position = getPosition(index);

  const modelPath = `/models/cartas/${card.toLowerCase().replace(/\s+/g, '-').replace('the-', '')}.glb`;
  let model = null;
  
  try {
    model = useGLTF(modelPath);
  } catch (error) {
    // Modelo genérico si no existe
  }

  useFrame((state) => {
    if (!interactive || !groupRef.current) return;
    
    groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    
    if (hovered || selected) {
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 3) * 0.05;
    }
  });

  const handleClick = () => {
    if (interactive) onClick();
  };

  return (
    <group ref={groupRef} position={position}>
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={() => interactive && setHovered(true)}
        onPointerOut={() => interactive && setHovered(false)}
        scale={interactive && hovered ? 1.1 : 1}
      >
        <boxGeometry args={[1.8, 2.2, 0.1]} />
        <meshStandardMaterial 
          color={selected ? '#ffd700' : isCurrent ? '#ff6b6b' : '#8B4513'}
          transparent
          opacity={interactive ? 1 : 0.8}
        />
        
        {model ? (
          <primitive 
            object={model.scene} 
            position={[0, 0, 0.1]}
            scale={0.5}
          />
        ) : (
          <Text
            position={[0, 0, 0.1]}
            fontSize={0.3}
            color="#000"
            anchorX="center"
            anchorY="center"
            maxWidth={1.5}
          >
            {card}
          </Text>
        )}
      </mesh>

      {selected && (
        <mesh position={[0.6, 0.8, 0.2]} scale={0.3}>
          <sphereGeometry args={[0.5, 8, 8]} />
          <meshStandardMaterial color="#ffd700" />
        </mesh>
      )}
    </group>
  );
};

export default SingleCard3D;