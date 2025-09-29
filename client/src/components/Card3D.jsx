// src/components/Card3D.jsx
import React, { useRef, useState, Suspense, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Center, Environment } from '@react-three/drei';
import { getCardInfo } from '../utils/loteriaNumbers';

// 🔹 Precargar imágenes de marcadores
const preloadMarkerImages = () => {
  const markers = ['/images/beand.png', '/images/granomaiz.png', '/images/ficha.png'];
  markers.forEach(src => {
    const img = new Image();
    img.src = src;
  });
};
preloadMarkerImages();

// 🔹 Hook para marcador
const useMarker = (markerType) => {
  const [markerImage, setMarkerImage] = useState('');

  useEffect(() => {
    let markerPath = '';
    switch (markerType) {
      case 'corn':
        markerPath = '/images/granomaiz.png';
        break;
      case 'token':
        markerPath = '/images/ficha.png';
        break;
      case 'bean':
      default:
        markerPath = '/images/beand.png';
        break;
    }

    const img = new Image();
    img.src = markerPath;
    img.onload = () => setMarkerImage(markerPath);
    img.onerror = () => {
      console.warn(`No se pudo cargar ${markerPath}, usando marcador por defecto`);
      setMarkerImage('/images/beand.png');
    };
  }, [markerType]);

  return markerImage;
};

// 🔹 Componente 3D interno
const CardModel = ({ card, isSelected, isCurrent }) => {
  const groupRef = useRef();

  // Normalizar nombre del archivo
  const normalizeCardName = (cardName) => {
    return cardName
      .toLowerCase()
      .replace(/\s+/g, '-')       // espacios → guiones
      .replace(/[^a-z0-9-]/g, '') // quitar caracteres especiales
      .replace('the-', '');       // opcional: quitar "the-"
  };

  const specificModelPath = `models/cartas/${normalizeCardName(card)}.glb`;
  const genericModelPath = 'models/cartas/cartag.glb';

  // Cargar modelo
  let model;
  try {
    model = useGLTF(specificModelPath);
  } catch {
    model = useGLTF(genericModelPath);
  }

  // Animación sutil
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      if (isSelected || isCurrent) {
        groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 3) * 0.02;
      }
    }
  });

  return (
    <group ref={groupRef}>
      <Center>
        <primitive object={model.scene} rotation={[0, 0, 0]} scale={0.72} />
      </Center>
    </group>
  );
};

// 🔹 Loading
const ModelLoading = () => (
  <mesh>
    <boxGeometry args={[1, 1, 0.1]} />
    <meshStandardMaterial color="#333" />
  </mesh>
);

// Precargar modelo genérico
useGLTF.preload('models/cartas/cartag.glb');

// 🔹 Componente principal
const Card3D = ({ card, selected, onClick, isCurrent, markerType = 'bean' }) => {
  const [hovered, setHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const cardInfo = getCardInfo(card);
  const markerImage = useMarker(markerType);

  // Precargar marcador
  useEffect(() => {
    if (markerImage && !imageLoaded) {
      const img = new Image();
      img.src = markerImage;
      img.onload = () => setImageLoaded(true);
    }
  }, [markerImage, imageLoaded]);

  return (
    <div onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} style={{ background: 'linear-gradient(135deg, #6e6e6eff 0%, #000000ff 100%)', borderRadius: '7px', padding: '1px', margin: '5px', textAlign: 'center', height: '140px', width: '100%', cursor: 'pointer', position: 'relative', transition: 'all 0.3s ease', transform: hovered ? 'scale(1.05)' : 'scale(1)', overflow: 'hidden', boxSizing: 'border-box', boxShadow: selected ? '0 0 5px #ffffff, 0 0 9px #ffffff, 0 0 13px #ffffff, 0 0 17px #ffffff' : isCurrent ? '0 0 5px #cccccc, 0 0 9px #cccccc, 0 0 13px #cccccc, 0 0 17px #cccccc' : '0 0 5px #dd0081ff, 0 0 9px #dd0081ff, 0 0 13px #dd0081ff, 0 0 17px #dd0081ff', }} >
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
          border: '1px solid #f80091'
        }}>
          {cardInfo.number}
        </div>
      )}

      {/* Canvas 3D */}
      <div style={{ height: '85px', width: '100%', margin: '5px 0' }}>
        <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
          <hemisphereLight intensity={0.5} />
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={1.2} />
          <Suspense fallback={<ModelLoading />}>
            <CardModel card={card} isSelected={selected} isCurrent={isCurrent} />
          </Suspense>
          <Environment preset="sunset" />
          <OrbitControls enableZoom={false} enablePan={false} />
        </Canvas>
      </div>

      {/* Nombre */}
      <div style={{
        fontSize: '11px',
        fontWeight: 'bold',
        color: '#fff',
        height: '16px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }}>
        {card}
      </div>

      {/* Marcador */}
      {selected && markerImage && imageLoaded && (
        <img
          src={markerImage}
          alt="Marker"
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
