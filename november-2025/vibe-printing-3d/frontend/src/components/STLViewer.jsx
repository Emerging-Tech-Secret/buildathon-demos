import { Suspense, useEffect, useState, useRef } from 'react';
import { Canvas, useLoader, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import * as THREE from 'three';
import { Eye, RotateCcw, Box } from 'lucide-react';

function Model({ url }) {
  const geometry = useLoader(STLLoader, url);
  const meshRef = useRef();
  
  useEffect(() => {
    if (geometry) {
      geometry.center();
      geometry.computeVertexNormals();
    }
  }, [geometry]);
  
  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshStandardMaterial 
        color="#f97316" 
        metalness={0.1}
        roughness={0.5}
      />
    </mesh>
  );
}

function GridFloor() {
  return (
    <gridHelper args={[200, 20, '#555555', '#333333']} rotation={[0, 0, 0]} />
  );
}

function Scene({ stlUrl, resetKey }) {
  const { camera } = useThree();
  
  useEffect(() => {
    camera.position.set(100, 80, 100);
    camera.lookAt(0, 0, 0);
  }, [resetKey, camera]);
  
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[50, 100, 50]} intensity={1} />
      <directionalLight position={[-50, -50, -50]} intensity={0.3} color="#f97316" />
      <pointLight position={[0, 100, 0]} intensity={0.5} />
      
      {stlUrl && (
        <Suspense fallback={null}>
          <Model url={stlUrl} />
        </Suspense>
      )}
      
      <GridFloor />
      <OrbitControls enableDamping dampingFactor={0.05} />
    </>
  );
}

function EmptyPlaceholder() {
  return (
    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
      <div className="text-center">
        <Box className="w-16 h-16 mx-auto mb-2 opacity-50" />
        <p>Gere um modelo para visualizar</p>
      </div>
    </div>
  );
}

export default function STLViewer({ stlUrl }) {
  const [resetKey, setResetKey] = useState(0);
  
  const handleReset = () => {
    setResetKey(prev => prev + 1);
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-orange-200 shadow-lg">
      <h3 className="text-lg font-semibold mb-4 flex items-center justify-between">
        <span className="flex items-center">
          <Eye className="w-5 h-5 mr-2 text-primary" />
          Pré-visualização 3D
        </span>
        <button
          onClick={handleReset}
          className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-lg transition flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" />
          Resetar
        </button>
      </h3>
      
      <div className="h-80 bg-gray-100 rounded-xl overflow-hidden relative">
        {!stlUrl && <EmptyPlaceholder />}
        <Canvas 
          camera={{ position: [100, 80, 100], fov: 50 }}
          style={{ background: 'linear-gradient(180deg, #e5e7eb 0%, #f3f4f6 100%)' }}
        >
          <Scene stlUrl={stlUrl} resetKey={resetKey} />
        </Canvas>
      </div>
    </div>
  );
}
