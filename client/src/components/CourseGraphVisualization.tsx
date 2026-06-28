import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Topic {
  id: number;
  name: string;
  masteryScore: number;
  parentTopicId?: number;
  assetCount?: number;
  lastReviewedAt?: string;
}

interface CourseGraphVisualizationProps {
  topics: Topic[];
  onNodeClick?: (topic: Topic) => void;
  height?: number;
}

export const CourseGraphVisualization: React.FC<CourseGraphVisualizationProps> = ({
  topics,
  onNodeClick,
  height = 600,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const nodesRef = useRef<Map<number, THREE.Mesh>>(new Map());
  const [selectedNode, setSelectedNode] = useState<number | null>(null);

  // Isometric projection: convert 3D to 2D isometric view
  const toIsometric = (x: number, y: number, z: number) => {
    const angle = Math.PI / 6; // 30 degrees
    const scale = 1;
    
    const iso_x = (x - z) * Math.cos(angle) * scale;
    const iso_y = y + (x + z) * Math.sin(angle) * scale;
    
    return { x: iso_x, y: iso_y };
  };

  // Get mastery color (red -> yellow -> green)
  const getMasteryColor = (score: number): THREE.Color => {
    if (score < 33) return new THREE.Color(0xef4444); // red
    if (score < 66) return new THREE.Color(0xeab308); // yellow
    return new THREE.Color(0x22c55e); // green
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Three.js scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfafafa);
    sceneRef.current = scene;

    const width = containerRef.current.clientWidth;
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);

    // Create root topic node
    const rootTopic = topics.find((t) => !t.parentTopicId);
    if (rootTopic) {
      const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
      const material = new THREE.MeshPhongMaterial({
        color: getMasteryColor(rootTopic.masteryScore),
        emissive: 0x333333,
        shininess: 100,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(0, 0, 0);
      mesh.userData = { topicId: rootTopic.id, topic: rootTopic };
      scene.add(mesh);
      nodesRef.current.set(rootTopic.id, mesh);
    }

    // Create subtopic nodes in circular arrangement
    const subtopics = topics.filter((t) => t.parentTopicId);
    const radius = 4;
    const angleStep = (Math.PI * 2) / Math.max(subtopics.length, 1);

    subtopics.forEach((topic, index) => {
      const angle = angleStep * index;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = 0;

      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshPhongMaterial({
        color: getMasteryColor(topic.masteryScore),
        emissive: 0x222222,
        shininess: 80,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x, y, z);
      mesh.userData = { topicId: topic.id, topic };
      scene.add(mesh);
      nodesRef.current.set(topic.id, mesh);

      // Draw line from root to subtopic
      if (rootTopic) {
        const lineGeometry = new THREE.BufferGeometry();
        lineGeometry.setAttribute(
          'position',
          new THREE.BufferAttribute(
            new Float32Array([0, 0, 0, x, y, z]),
            3
          )
        );
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0xcccccc });
        const line = new THREE.Line(lineGeometry, lineMaterial);
        scene.add(line);
      }
    });

    // Mouse interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const meshes = Array.from(nodesRef.current.values());
      const intersects = raycaster.intersectObjects(meshes);

      if (intersects.length > 0) {
        const clickedMesh = intersects[0].object as THREE.Mesh;
        const topicId = clickedMesh.userData.topicId;
        const topic = clickedMesh.userData.topic;
        setSelectedNode(topicId);
        onNodeClick?.(topic);

        // Highlight effect
        (clickedMesh.material as THREE.MeshPhongMaterial).emissive.setHex(0x666666);
        setTimeout(() => {
          (clickedMesh.material as THREE.MeshPhongMaterial).emissive.setHex(0x333333);
        }, 200);
      }
    };

    renderer.domElement.addEventListener('click', onMouseClick);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Gentle rotation
      nodesRef.current.forEach((mesh) => {
        mesh.rotation.x += 0.001;
        mesh.rotation.y += 0.002;
      });

      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const newWidth = containerRef.current.clientWidth;
      camera.aspect = newWidth / height;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('click', onMouseClick);
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, [topics, height, onNodeClick]);

  return (
    <div className="w-full">
      <div
        ref={containerRef}
        style={{ height: `${height}px` }}
        className="w-full rounded-lg border border-border bg-background"
      />
      {selectedNode && (
        <div className="mt-4 p-4 rounded-lg border border-border bg-card">
          <p className="text-sm text-muted-foreground">Selected Topic</p>
          <p className="text-lg font-semibold">
            {topics.find((t) => t.id === selectedNode)?.name}
          </p>
        </div>
      )}
    </div>
  );
};
