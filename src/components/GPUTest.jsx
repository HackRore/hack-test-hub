import React, { useState, useEffect, useRef } from 'react';
import useStore from '../store/useStore';
import { ArrowLeft, Cpu, Activity, Zap, Layers, Download } from 'lucide-react';
import * as THREE from 'three';

const GpuTest = () => {
    const { setActiveTool } = useStore();
    const containerRef = useRef(null);
    const [stats, setStats] = useState({ fps: 0, maxDelta: 0, particleCount: 15000 });
    const [rendererInfo, setRendererInfo] = useState('Detecting GPU...');
    const requestRef = useRef();
    const sceneRef = useRef();

    useEffect(() => {
        if (!containerRef.current) return;

        // --- THREE.JS SETUP ---
        const scene = new THREE.Scene();
        sceneRef.current = scene;
        scene.fog = new THREE.FogExp2(0x000000, 0.002);

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 50;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        containerRef.current.appendChild(renderer.domElement);

        // Debug Info
        const gl = renderer.getContext();
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
            setRendererInfo(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL));
        }

        // --- PARTICLE SYSTEMS ---
        // We create two systems: specific Points for core, and a surrounding field

        // 1. Core Vortex
        const geometry = new THREE.BufferGeometry();
        const count = stats.particleCount;
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);

        const color1 = new THREE.Color(0x00ff41); // Neon Green
        const color2 = new THREE.Color(0x008F11); // Darker Matrix Green

        for (let i = 0; i < count; i++) {
            // Spiral distribution
            const r = Math.random() * 100;
            const theta = Math.random() * Math.PI * 2 * 5; // multiple winds

            positions[i * 3] = r * Math.cos(theta); // x
            positions[i * 3 + 1] = (Math.random() - 0.5) * 50; // y spread
            positions[i * 3 + 2] = r * Math.sin(theta); // z

            // Mix colors
            const mixedColor = color1.clone().lerp(color2, Math.random());
            colors[i * 3] = mixedColor.r;
            colors[i * 3 + 1] = mixedColor.g;
            colors[i * 3 + 2] = mixedColor.b;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.2,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            transparent: true,
            opacity: 0.8
        });

        const particles = new THREE.Points(geometry, material);
        scene.add(particles);

        // --- ANIMATION LOOP ---
        let lastTime = performance.now();
        let frameCount = 0;
        let lastFpsUpdate = lastTime;
        let localMaxDelta = 0;

        const animate = () => {
            const time = performance.now();
            const delta = time - lastTime;
            lastTime = time;

            // Stats Logic
            frameCount++;
            if (time - lastFpsUpdate >= 1000) {
                setStats(prev => ({
                    ...prev,
                    fps: frameCount,
                    maxDelta: Math.round(localMaxDelta)
                }));
                frameCount = 0;
                lastFpsUpdate = time;
                localMaxDelta = 0; // Reset max delta tracking every sec
            }
            if (delta > localMaxDelta) localMaxDelta = delta;

            // Visual Updates
            particles.rotation.y += 0.002;
            particles.rotation.z += 0.001;

            // Pulse effect
            const scale = 1 + Math.sin(time * 0.002) * 0.1;
            particles.scale.set(scale, scale, scale);

            renderer.render(scene, camera);
            requestRef.current = requestAnimationFrame(animate);
        };

        requestRef.current = requestAnimationFrame(animate);

        // Resize Handler
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            if (containerRef.current) containerRef.current.removeChild(renderer.domElement);
            // Three.js cleanup
            geometry.dispose();
            material.dispose();
            renderer.dispose();
        };
    }, []);

    return (
        <div className="fixed inset-0 bg-black flex flex-col">
            <div ref={containerRef} className="absolute inset-0" />

            {/* HUD Overlay */}
            <div className="absolute top-0 left-0 w-full p-6 z-10 flex flex-col pointer-events-none">
                <div className="flex items-start justify-between mb-8 pointer-events-auto">
                    <div className="flex flex-col gap-4">
                        <button
                            onClick={() => setActiveTool(null)}
                            className="text-white hover:text-[#00ff41] bg-black/50 backdrop-blur px-4 py-2 rounded border border-gray-700 font-mono flex items-center gap-2 transition-colors w-fit"
                        >
                            <ArrowLeft className="h-4 w-4" /> STOP ENGINE
                        </button>

                        <a
                            href="https://sourceforge.net/projects/furmark/files/latest/download"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-500/50 px-4 py-2.5 rounded font-black font-mono tracking-widest flex items-center gap-2 transition-all shadow-xl group/furmark"
                        >
                            <Download className="h-3.5 w-3.5 group-hover/furmark:bounce" />
                            EXTERNAL_STRESSOR (FURMARK)
                        </a>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        <div className="text-[#00ff41] font-black text-5xl font-mono tracking-tighter drop-shadow-[0_0_15px_rgba(0,255,65,0.6)]">
                            {stats.fps} <span className="text-sm text-gray-500 font-bold">FPS</span>
                        </div>
                        <div className="flex items-center gap-4 bg-black/60 px-3 py-1 rounded border border-gray-800">
                            <div className="text-right">
                                <div className={`text-xl font-bold font-mono ${stats.maxDelta > 30 ? 'text-red-500' : 'text-gray-300'}`}>
                                    {stats.maxDelta}ms
                                </div>
                                <div className="text-[10px] text-gray-500 uppercase tracking-wider">Max Delta (Stutter)</div>
                            </div>
                            <div className="h-8 w-px bg-gray-700"></div>
                            <div className="text-right">
                                <div className="text-xl font-bold font-mono text-gray-300">
                                    {(stats.particleCount / 1000).toFixed(1)}k
                                </div>
                                <div className="text-[10px] text-gray-500 uppercase tracking-wider">Particles</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-black/60 backdrop-blur border-l-4 border-blue-500 p-6 max-w-md rounded-r-lg shadow-2xl mt-4">
                    <div className="flex items-center gap-3 mb-2">
                        <Layers className="h-6 w-6 text-blue-500" />
                        <h2 className="text-white font-bold font-mono tracking-wider">RENDERER INFO</h2>
                    </div>
                    <div className="text-gray-300 font-mono text-sm break-words leading-relaxed">
                        {rendererInfo}
                    </div>
                </div>
            </div>

            {/* Bottom Status */}
            <div className="absolute bottom-6 left-6 right-6 z-10 flex justify-center pointer-events-none">
                <div className="bg-black/80 backdrop-blur px-8 py-4 rounded-full border border-gray-800 flex items-center gap-6 shadow-2xl">
                    <Activity className="h-5 w-5 text-[#00ff41] animate-spin-slow" />
                    <span className="text-gray-400 text-xs font-mono uppercase tracking-widest">
                        Engine: <span className="text-white font-bold">THREE.JS (WebGL 2.0)</span>
                    </span>
                    <span className="text-gray-700">|</span>
                    <span className="text-gray-400 text-xs font-mono uppercase tracking-widest">
                        Test: <span className="text-white font-bold">PARTICLE VORTEX STRESS</span>
                    </span>
                </div>
            </div>
        </div>
    );
};

export default GpuTest;
