/**
 * useThreeJsAvatar hook
 * Manages three.js scene and avatar rendering
 */

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { AVATAR_CONFIG } from '../utils/constants';

export function useThreeJsAvatar(containerRef: React.RefObject<HTMLDivElement>) {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.Camera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const avatarRef = useRef<THREE.Group | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    try {
      // Create scene
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xf0f0f0);

      // Create camera
      const camera = new THREE.PerspectiveCamera(
        75,
        containerRef.current.clientWidth / containerRef.current.clientHeight,
        0.1,
        1000
      );
      camera.position.z = 2.5;

      // Create renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      containerRef.current.appendChild(renderer.domElement);

      // Add lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(5, 5, 5);
      scene.add(directionalLight);

      // Load avatar model
      const loader = new GLTFLoader();
      loader.load(
        AVATAR_CONFIG.MODEL_PATH,
        (gltf: any) => {
          const avatar = gltf.scene;
          avatar.scale.set(AVATAR_CONFIG.SCALE, AVATAR_CONFIG.SCALE, AVATAR_CONFIG.SCALE);
          avatar.position.set(
            AVATAR_CONFIG.POSITION.x,
            AVATAR_CONFIG.POSITION.y,
            AVATAR_CONFIG.POSITION.z
          );
          scene.add(avatar);
          avatarRef.current = avatar;
          setIsReady(true);
        },
        undefined,
        (err: any) => {
          console.error('Failed to load avatar model:', err);
          
          let errorMsg = 'Unknown error';
          if (err instanceof Error) {
            errorMsg = err.message;
          } else if (err && typeof err === 'object') {
            // Some loaders return the error event
            errorMsg = 'Asset not found or network error (404)';
          }
          
          console.warn(`Failed to load avatar model: ${errorMsg}`);
          // Do not set error state so the placeholder can be shown
          
          // Create placeholder cube if model fails to load
          // Make it look like a simple "head"
          const geometry = new THREE.SphereGeometry(0.5, 32, 32);
          const material = new THREE.MeshStandardMaterial({ 
            color: AVATAR_CONFIG.PLACEHOLDER_COLOR,
            roughness: 0.7,
            metalness: 0.1
          });
          const head = new THREE.Mesh(geometry, material);
          head.position.set(0, 0, 0);
          
          // Add simple "eyes" to the placeholder
          const eyeGeo = new THREE.SphereGeometry(0.05, 16, 16);
          const eyeMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
          
          const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
          leftEye.position.set(-0.2, 0.1, 0.45);
          head.add(leftEye);
          
          const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
          rightEye.position.set(0.2, 0.1, 0.45);
          head.add(rightEye);

          scene.add(head);
          avatarRef.current = head as any;
          setIsReady(true);
        }
      );

      // Animation loop
      const animate = () => {
        animationFrameRef.current = requestAnimationFrame(animate);
        
        // Rotate avatar slightly for visibility
        if (avatarRef.current) {
          avatarRef.current.rotation.y += 0.005;
        }

        renderer.render(scene, camera);
      };

      animate();

      sceneRef.current = scene;
      cameraRef.current = camera;
      rendererRef.current = renderer;

      // Handle window resize
      const handleResize = () => {
        if (!containerRef.current) return;
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        
        (camera as THREE.PerspectiveCamera).aspect = width / height;
        (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
        renderer.setSize(width, height);
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        renderer.dispose();
        containerRef.current?.removeChild(renderer.domElement);
      };
    } catch (err) {
      setError(`Failed to initialize three.js: ${err}`);
      console.error('Three.js initialization error:', err);
    }
  }, [containerRef]);

  const applyBlendShapes = (morphTargets: Record<string, number>) => {
    if (!avatarRef.current) return;

    avatarRef.current.traverse((node: any) => {
      if (node.morphTargetInfluences) {
        Object.entries(morphTargets).forEach(([name, value]) => {
          const index = node.morphTargetDictionary?.[name];
          if (index !== undefined) {
            node.morphTargetInfluences[index] = value;
          }
        });
      }
    });
  };

  return {
    isReady,
    error,
    applyBlendShapes,
  };
}
