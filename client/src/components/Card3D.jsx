// src/components/Card3D.jsx
import React, { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Center } from '@react-three/drei';

// Componente 3D interno MEJORADO
const CardModel = ({ card, isSelected, isCurrent }) => {
  const meshRef = useRef();
  const groupRef = useRef();
  
  // Normalizar nombre del archivo
  const normalizeCardName = (cardName) => {
    return cardName.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace('the-', '');
  };

  // Cargar modelo específico o genérico
  const specificModelPath = `/models/cartas/${normalizeCardName(card)}.glb`;
  const genericModelPath = '/models/cartas/cartag.glb';
  
  let model = null;
  try {
    model = useGLTF(specificModelPath);
  } catch (error) {
    try {
      model = useGLTF(genericModelPath);
    } catch (e) {
      console.log('No se pudo cargar ningún modelo 3D');
    }
  }

  useFrame((state) => {
    if (groupRef.current) {
      // Animación sutil
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      
      if (isSelected || isCurrent) {
        groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 3) * 0.02;
      }
    }
  });

  if (!model) {
    return (
      <mesh ref={meshRef}>
        <boxGeometry args={[1, 1, 0.1]} />
        <meshStandardMaterial color={isSelected ? '#ffd700' : isCurrent ? '#ff6b6b' : '#8B4513'} />
      </mesh>
    );
  }

  return (
    <group ref={groupRef}>
      <Center> {/* 🔥 ESTA ES LA CLAVE - CENTRA EL MODELO */}
        <primitive 
          object={model.scene} 
          rotation={[0, 0, 0]}
          scale={0.72} // Ajustar escala según necesidad
        />
      </Center>
    </group>
  );
};

// Loading component mejorado
const ModelLoading = () => (
  <mesh>
    <boxGeometry args={[1, 1, 0.1]} />
    <meshStandardMaterial color="#cccccc" />
  </mesh>
);

// Componente principal de la carta MEJORADO
const Card3D = ({ card, selected, onClick, isCurrent, cardId, index }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: selected ? '#ffe0b2' : isCurrent ? '#79db9f9d' : '#ffd900ff',
        border: isCurrent ? '10px solid #ff9800' : selected ? '10px solid #ff9800' : '9px solid #494949ff',
        borderRadius: '10px',
        padding: '1px', // Reducir padding para dar más espacio al 3D
        textAlign: 'center',
        height: '140px',
        width: '100%',
        cursor: 'pointer',
        position: 'relative',
        transition: 'all 0.3s ease',
        transform: hovered ? 'scale(1.05)' : 'scale(1)',
        overflow: 'hidden',
        boxSizing: 'border-box'
      }}
    >
      {/* Canvas 3D integrado - CONFIGURACIÓN MEJORADA */}
      <div style={{ 
        height: '80px', // Más altura para el área 3D
        width: '100%', 
        marginBottom: '9px' 
      }}>
        <Canvas 
          camera={{ 
            position: [0, 0, 4], // Alejar más la cámara
            fov: 45, // Reducir field of view
            near: 0.1,
            far: 100 
          }}
          style={{ 
            borderRadius: '4px',
            background: 'transparent'
          }}
        >
          <ambientLight intensity={0.8} />
          <directionalLight position={[5, 5, 5]} intensity={0.6} />
          <pointLight position={[-5, -5, 5]} intensity={0.4} />
          
          <Suspense fallback={<ModelLoading />}>
            <CardModel card={card} isSelected={selected} isCurrent={isCurrent} />
          </Suspense>
          
          {/* Controles de cámara MEJORADOS */}
          <OrbitControls 
            enableZoom={false}
            enablePan={false}
            enableRotate={true}
            minPolarAngle={Math.PI / 3}   // 60 grados
            maxPolarAngle={Math.PI / 1.5} // 120 grados
            minAzimuthAngle={-Math.PI / 4} // -45 grados
            maxAzimuthAngle={Math.PI / 4}  // 45 grados
            target={[0, 0, 0]} // 🔥 CENTRAR EL OBJETIVO
          />
        </Canvas>
      </div>

      {/* Nombre de la carta - MEJORADO */}
      <div style={{ 
        fontSize: '11px', 
        fontWeight: 'bold',
        color: selected || isCurrent ? '#000' : '#030303ff',
        height: '16px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        padding: '0 2px'
      }}>
        {card}
      </div>

      {/* Indicadores */}
      {selected && (
        <div style={{ 
          position: 'absolute', 
          top: 3, 
          right: 3, 
          fontSize: '1rem',
          filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.5))',
          zIndex: 10
        }}>
          🌽
        </div>
      )}
      
      {isCurrent && (
        <div style={{ 
          position: 'absolute', 
          top: 3, 
          left: 3, 
          fontSize: '0.7rem',
          filter: 'drop-shadow(0 0 2px rgba(0, 0, 0, 0.5))',
          zIndex: 10
        }}>
          🔥
        </div>
      )}
    </div>
  );
};

// Precargar modelos
useGLTF.preload('/models/cartas/cartag.glb');

export default Card3D;