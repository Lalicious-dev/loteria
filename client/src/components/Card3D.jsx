import React, { useEffect, useState, useRef } from 'react';
import {useFrame} from '@react-three/fiber';
import {Text} from '@react-three/drei';

const Card3D=({card, selected, onClick,position, isCurrent})=>{
    const meshRef=useRef();
    const groupRef=useRef();

    const [hovered, setHovered]=useState(false);

    //Animacion de flotación y rotación

    useFrame((state)=>{
        if(groupRef.current){
            //Flotación suave
            groupRef.current.position.y=position[1]+Math.sin(state.clock.elapsedTime*2)*0.2;

            //Rotacion sutil

            if(hovered||selected){
                groupRef.current.rotation.y=Math.sin(state.clock.elapsedTime*3)*0.1;
            }else{
                groupRef.current.rotation.y=Math.sin(state.clock.elapsedTime*0.5)*0.5;
            }
        }
    });

    const handleClick=(e)=>{
        e.stopPropagation();
        onClick();
    }
    return (
        <group ref={groupRef} position={position}>
            {/* Base de la carta */}
            <mesh ref={meshRef}
                onClick={handleClick}
                onPointerOver={(e)=>{
                    e.stopPropagation();
                    setHovered(true);
                }}
                onPointerOut={()=>setHovered(false)}
                scale={hovered ? [1.1,1.1,1.1]: [1,1,1]}
            >
                <boxGeometry args={[0.8,1.1,0.05]}/>
                <meshStandardMaterial
                    color={
                        selected ? '#ffd700':
                        isCurrent ? '#ff6b6b':
                        hovered ? '#87ceeb':'#8B4513'
                    }
                    roughness={0.7}
                    metalness={selected ? 0.8:0.3}
                />               
            </mesh>
            {/**Texto frontal de la carta */}
            <Text
                position={[0,0,0.3]}
                fontSize={0.1}
                color="#000"
                anchorX="center"
                anchorY="center"
                maxWidth={0.7}
                textAlign="center"
            >
                {card}
            </Text>

            {/**Maiz 3d cuando este seleccionado */}
            {select && (
                <mesh position={[0.25,0.35,0.1]} rotation={[0,0,Math.PI /6]}> 
                    <sphereGeometry args={[0.15,8,8]}/>
                    <meshStandardMaterial color="#ffd700" roughness={0.2} metalness={0.5} />
                </mesh>
            )}

            {/**Efecto de resplandor para la carta actual */}
            {isCurrent &&(
               <pointLight position={[0,0,0.2]} intensity={0.5} color="#ff4444" />
            )}


        </group>
    );

};

export default Card3D;