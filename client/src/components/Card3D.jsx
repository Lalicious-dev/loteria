// src/components/Card3D.jsx
import React, { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Center, Environment } from '@react-three/drei';
import { getCardInfo } from '../utils/loteriaNumbers';

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
        <meshStandardMaterial
          color={'#000000ff'}
          emissive={isSelected ? "#ffd700" : isCurrent ? "#ff5722" : "#444"}
          emissiveIntensity={isSelected || isCurrent ? 0.6 : 0.2}
        />
      </mesh>
    );
  }

  return (
    <group ref={groupRef}>
      <Center>
        <primitive
          object={model.scene}
          rotation={[0, 0, 0]}
          scale={0.72}
        />
      </Center>
    </group>
  );
};

// Loading component mejorado
const ModelLoading = () => (
  <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
    <planeGeometry args={[10, 10]} />
    <shadowMaterial transparent opacity={0.2} />
  </mesh>
);

// Precargar modelos (fuera del componente)
useGLTF.preload('/models/cartas/cartag.glb');

// Componente principal de la carta MEJORADO
const Card3D = ({ card, selected, onClick, isCurrent }) => {
  const [hovered, setHovered] = useState(false);
  const cardInfo = getCardInfo(card);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'linear-gradient(135deg, #6e6e6eff 0%, #000000ff 100%)',
        borderRadius: '7px',
        padding: '1px',
        margin: '5px',
        textAlign: 'center',
        height: '140px',
        width: '100%',
        cursor: 'pointer',
        position: 'relative',
        transition: 'all 0.3s ease',
        transform: hovered ? 'scale(1.05)' : 'scale(1)',
        overflow: 'hidden',
        boxSizing: 'border-box',
        boxShadow: selected
          ? `0 0 5px #ffffff, 0 0 9px #ffffff, 0 0 13px #ffffff, 0 0 17px #ffffff`
          : isCurrent
          ? `0 0 5px #cccccc, 0 0 9px #cccccc, 0 0 13px #cccccc, 0 0 17px #cccccc`
          : `0 0 5px #dd0081ff, 0 0 9px #dd0081ff, 0 0 13px #dd0081ff, 0 0 17px #dd0081ff`,
      }}
    >
      {/* Número de lotería */}
      {cardInfo.number && (
        <div style={{
          position: 'absolute',
          top: 2,
          left: 2,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          borderRadius: '50%',
          width: '20px',
          height: '20px',
          fontSize: '10px',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 5,
          border: '1px solid #f80091ff'
        }}>
          {cardInfo.number}
        </div>
      )}

      {/* Canvas 3D integrado */}
      <div style={{
        height: '85px',
        width: '100%',
        marginBottom: '9px',
        marginTop: '5px'
      }}>
        <Canvas
          camera={{
            position: [0, 0, 4],
            fov: 45,
            near: 0.1,
            far: 100
          }}
          style={{
            borderRadius: '4px',
            background: 'transparent'
          }}
        >
          <hemisphereLight skyColor={"#ffffff"} groundColor={"#888888"} intensity={0.5} />
          <Environment preset="sunset" />
          <spotLight position={[0, 5, 5]} angle={0.3} penumbra={0.5} intensity={1.2} color="#e209d0ff" castShadow />
          <ambientLight intensity={0.6} color={"#888"} />
          <directionalLight position={[5, 5, 5]} intensity={1.2} />
          <pointLight position={[-5, -5, 5]} intensity={0.5} color="#ffd900a9" />

          <Suspense fallback={<ModelLoading />}>
            <CardModel card={card} isSelected={selected} isCurrent={isCurrent} />
          </Suspense>

          <OrbitControls
            enableZoom={false}
            enablePan={false}
            enableRotate={true}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 1.5}
            minAzimuthAngle={-Math.PI / 4}
            maxAzimuthAngle={Math.PI / 4}
            target={[0, 0, 0]}
          />
        </Canvas>
      </div>

      {/* Nombre de la carta */}
      <div style={{
        fontSize: '11px',
        fontWeight: 'bold',
        color: '#ffffffff',
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
        <img
          src="/images/beand.png"
          alt="Elote"
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            width: '28px',
            height: '28px'
          }}
        />
      )}
    </div>
  );
};

export default Card3D;