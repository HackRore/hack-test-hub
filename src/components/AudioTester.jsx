import React, { useState, useEffect, useRef } from 'react';
import useStore from '../store/useStore';
import { Volume2, Volume1, ArrowLeft, Activity, Speaker, VolumeX } from 'lucide-react';

const AudioTester = () => {
    const { setActiveTool } = useStore();
    const [activeChannel, setActiveChannel] = useState(null);
    const [testType, setTestType] = useState('tone'); // 'tone' or 'pink'
    const [frequency, setFrequency] = useState(440);

    // Refs for audio engine
    const audioCtxRef = useRef(null);
    const oscRef = useRef(null);
    const noiseRef = useRef(null);
    const analyzerRef = useRef(null);
    const canvasRef = useRef(null);
    const rafRef = useRef(null);

    // Visualizer Loop
    const startVisualizer = (ctx, source) => {
        const analyzer = ctx.createAnalyser();
        analyzer.fftSize = 256;
        source.connect(analyzer);
        analyzerRef.current = analyzer;

        const bufferLength = analyzer.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
            if (!canvasRef.current || !analyzerRef.current) return;
            const canvas = canvasRef.current;
            const c = canvas.getContext('2d');
            const width = canvas.width;
            const height = canvas.height;

            analyzerRef.current.getByteFrequencyData(dataArray);

            c.clearRect(0, 0, width, height);
            c.fillStyle = '#0a0f1c';
            c.fillRect(0, 0, width, height);

            const barWidth = (width / bufferLength) * 2.5;
            let barHeight;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                barHeight = dataArray[i] / 2;
                c.fillStyle = `rgb(0, ${barHeight + 100}, 65)`;
                c.fillRect(x, height - barHeight, barWidth, barHeight);
                x += barWidth + 1;
            }
            rafRef.current = requestAnimationFrame(draw);
        };
        draw();
    };

    const createPinkNoise = (ctx) => {
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = buffer.getChannelData(0);
        let b0, b1, b2, b3, b4, b5, b6;
        b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
            output[i] *= 0.11;
            b6 = white * 0.115926;
        }
        return buffer;
    };

    const playTone = (channel) => {
        stopTone();
        const Ctx = window.AudioContext || window.webkitAudioContext;
        const ctx = new Ctx();
        audioCtxRef.current = ctx;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const panner = ctx.createStereoPanner();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(frequency, ctx.currentTime);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);

        if (channel === 'left') panner.pan.value = -1;
        else if (channel === 'right') panner.pan.value = 1;
        else panner.pan.value = 0;

        osc.connect(panner);
        panner.connect(gain);
        gain.connect(ctx.destination);

        startVisualizer(ctx, osc);

        osc.start();
        oscRef.current = osc;
        setActiveChannel(channel);
        setTestType('tone');
    };

    const playPinkNoise = () => {
        stopTone();
        const Ctx = window.AudioContext || window.webkitAudioContext;
        const ctx = new Ctx();
        audioCtxRef.current = ctx;

        const buffer = createPinkNoise(ctx);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.3, ctx.currentTime);

        source.connect(gain);
        gain.connect(ctx.destination);

        startVisualizer(ctx, source);

        source.start();
        noiseRef.current = source;
        setActiveChannel('all');
        setTestType('pink');
    };

    const stopTone = () => {
        if (oscRef.current) {
            try { oscRef.current.stop(); } catch (e) { }
            oscRef.current = null;
        }
        if (noiseRef.current) {
            try { noiseRef.current.stop(); } catch (e) { }
            noiseRef.current = null;
        }
        if (audioCtxRef.current) {
            audioCtxRef.current.close();
            audioCtxRef.current = null;
        }
        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }
        setActiveChannel(null);
    };

    return (
        <div className="container mx-auto p-6 max-w-4xl font-sans">
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => { stopTone(); setActiveTool(null); }}
                    className="text-gray-400 hover:text-white flex items-center gap-2 font-bold uppercase text-xs tracking-widest transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" /> BACK TO DASHBOARD
                </button>
            </div>

            <div className="bg-[#1e293b] rounded-2xl p-10 shadow-2xl border border-gray-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                    <Volume2 className="h-64 w-64 text-primary" />
                </div>

                <div className="flex flex-col md:flex-row gap-12 relative z-10">
                    <div className="flex-1">
                        <h2 className="text-3xl font-black text-white mb-2 tracking-tighter uppercase">Audio Precision</h2>
                        <p className="text-gray-400 mb-8 border-l-2 border-primary pl-4">Verify signal isolation & speaker integrity.</p>

                        {/* Visualizer Display */}
                        <div className="mb-10 bg-black/40 rounded-xl border border-gray-700 h-[160px] relative overflow-hidden">
                            <canvas ref={canvasRef} width={600} height={160} className="w-full h-full opacity-80" />
                            <div className="absolute top-2 left-2 text-[10px] text-primary/50 font-mono font-bold uppercase tracking-widest">Spectral Analysis Active</div>
                        </div>

                        <div className="space-y-8">
                            {/* Tone Control */}
                            <div>
                                <div className="flex justify-between items-end mb-4">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Sine Frequency</label>
                                    <span className="text-primary font-mono font-bold">{frequency}Hz</span>
                                </div>
                                <input
                                    type="range" min="100" max="2000" step="10"
                                    value={frequency}
                                    onChange={(e) => setFrequency(Number(e.target.value))}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                            </div>

                            <div className="flex flex-col gap-4">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Channel Isolation</label>
                                <div className="grid grid-cols-3 gap-4">
                                    {['left', 'center', 'right'].map(ch => (
                                        <button
                                            key={ch}
                                            onMouseDown={() => playTone(ch)}
                                            onMouseUp={stopTone}
                                            onMouseLeave={stopTone}
                                            className={`py-6 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${activeChannel === ch
                                                    ? 'bg-primary border-primary text-black scale-95 shadow-[0_0_20px_rgba(0,255,65,0.3)]'
                                                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'
                                                }`}
                                        >
                                            {ch === 'center' ? <Speaker className="h-6 w-6" /> : <Volume2 className={`h-6 w-6 ${ch === 'right' ? 'scale-x-[-1]' : ''}`} />}
                                            <span className="text-[10px] font-black uppercase tracking-widest">{ch}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Secondary Tests */}
                    <div className="w-full md:w-64 flex flex-col gap-4">
                        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                            <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-widest">Rattle Check</h3>
                            <p className="text-xs text-gray-400 mb-6 leading-relaxed">Pink noise is ideal for identifying loose casing screws and membrane defects.</p>
                            <button
                                onMouseDown={playPinkNoise}
                                onMouseUp={stopTone}
                                onMouseLeave={stopTone}
                                className={`w-full py-4 rounded-lg font-black text-xs uppercase tracking-[0.2em] transition-all ${testType === 'pink' && activeChannel === 'all'
                                        ? 'bg-primary text-black shadow-[0_0_15px_rgba(0,255,65,0.3)]'
                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                            >
                                Run Pink Noise
                            </button>
                        </div>

                        <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 flex items-center gap-3">
                            <div className="p-2 bg-primary/20 rounded-full">
                                <Activity className="h-4 w-4 text-primary" />
                            </div>
                            <div className="text-[10px] text-primary uppercase font-bold tracking-tight">System Ready</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AudioTester;
