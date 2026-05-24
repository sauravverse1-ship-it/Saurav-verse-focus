import React, { useEffect, useRef, useState } from "react";
import { Mic, MicOff, X, Activity } from "lucide-react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial } from "@react-three/drei";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";

// Make the orb distort and rotate based on audio level
const OrbMesh = ({ audioLevel, state }: { audioLevel: number, state: "idle" | "listening" | "thinking" | "speaking" | "error" }) => {
  const meshRef = useRef<any>(null);

  useFrame((stateObj, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5 * (1 + audioLevel * 2);
      meshRef.current.rotation.x += delta * 0.2;
    }
  });

  const getColors = () => {
    switch(state) {
      case "listening": return ["#4ade80", "#22c55e"]; // Green
      case "thinking": return ["#a855f7", "#3b82f6"]; // Purple/Blue
      case "speaking": return ["#3b82f6", "#60a5fa"]; // Blue
      case "error": return ["#ef4444", "#dc2626"]; // Red
      default: return ["#aaaaaa", "#555555"]; // Gray
    }
  };

  const [color1] = getColors();

  return (
    <Sphere ref={meshRef} args={[1, 64, 64]} scale={1 + audioLevel * 0.5}>
      <MeshDistortMaterial 
        color={color1}
        attach="material"
        distort={state === "idle" ? 0.2 : 0.4 + audioLevel * 0.8}
        speed={state === "idle" ? 1 : 2 + audioLevel * 5}
        roughness={0.2}
      />
    </Sphere>
  );
};


export const JarvisOrb = ({ profile, tasks, habits }: { profile?: any, tasks?: any[], habits?: any[] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [state, setState] = useState<"idle" | "listening" | "thinking" | "speaking" | "error">("idle");
  const [audioLevel, setAudioLevel] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [transcript, setTranscript] = useState("");
  
  const wsRef = useRef<WebSocket | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const nextStartTimeRef = useRef(0);

  const startJarvis = async () => {
    try {
      setErrorMsg("");
      setTranscript("");
      setState("listening");

      const loc = window.location;
      let host = loc.host;
      // If running inside Capacitor (where hostname is localhost) or local developer app, connect to the Cloud Run server
      if (host.includes("localhost") || host.includes("127.0.0.1") || !host) {
        host = "ais-dev-4m224lwpwa7sbfnkqzxo4v-865131783853.asia-southeast1.run.app";
      }
      const wsProtocol = loc.protocol === "https:" || host.includes(".run.app") ? "wss:" : "ws:";
      const wsUrl = `${wsProtocol}//${host}/live`;
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      const audioCtx = new AudioContext({ sampleRate: 16000 });
      audioCtx.resume();
      audioCtxRef.current = audioCtx;
      nextStartTimeRef.current = 0; // reset scheduling

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });
      streamRef.current = stream;

      const source = audioCtx.createMediaStreamSource(stream);
      // Deprecated but simple for script processing
      const processor = audioCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      source.connect(processor);
      processor.connect(audioCtx.destination);

      processor.onaudioprocess = (e) => {
        if (ws.readyState === WebSocket.OPEN) {
          const channelData = e.inputBuffer.getChannelData(0);
          
          // Calculate audio level for visuals
          let sum = 0;
          for(let i=0; i<channelData.length; i++) sum += Math.abs(channelData[i]);
          setAudioLevel(Math.min((sum / channelData.length) * 5, 1)); // Normalize roughly

          const base64 = pcmToBase64(channelData);
          ws.send(JSON.stringify({ audio: base64 }));
        }
      };

      ws.onopen = () => {
        const setupStr = `User Name: ${profile?.displayName || 'Unknown'}. XP: ${profile?.xp || 0}. Tasks: ${tasks?.map(t => t.title).join(', ') || 'None'}.`;
        ws.send(JSON.stringify({ setup: setupStr }));
      };
      
      ws.onmessage = async (event) => {
        const msg = JSON.parse(event.data);
        if (msg.error) {
          setState("error");
          setErrorMsg(msg.error);
        } else if (msg.audio) {
          setState("speaking");
          playAudioChunk(audioCtxRef.current!, msg.audio);
        } else if (msg.textOutput) {
          setTranscript(prev => prev + msg.textOutput);
        } else if (msg.interrupted) {
           // Stop playback if interrupted
           nextStartTimeRef.current = audioCtxRef.current?.currentTime || 0;
        }
      };

      ws.onclose = () => {
        stopJarvis();
      };
    } catch (e: any) {
      setState("error");
      setErrorMsg(e.message);
    }
  };

  const stopJarvis = () => {
    setState("idle");
    setAudioLevel(0);
    if (processorRef.current && audioCtxRef.current) {
      processorRef.current.disconnect();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.close();
    }
  };

  // Function to convert float32 to base64 PCM16
  const pcmToBase64 = (float32Array: Float32Array): string => {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < float32Array.length; i++) {
      let s = Math.max(-1, Math.min(1, float32Array[i]));
      view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
    let binary = "";
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  const playAudioChunk = (audioCtx: AudioContext, base64: string) => {
    const binary = window.atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
    const int16Array = new Int16Array(bytes.buffer);
    const float32Array = new Float32Array(int16Array.length);
    let hasAudio = false;
    for (let i = 0; i < int16Array.length; i++) {
      float32Array[i] = int16Array[i] / 0x8000;
      if (Math.abs(float32Array[i]) > 0.01) hasAudio = true;
    }
    
    // Update visual orb for output speaking
    if (hasAudio && state !== "listening") {
        setState("speaking");
        setAudioLevel(0.3 + Math.random() * 0.2); // Fake level since we don't analyze output instantly
    }

    const audioBuffer = audioCtx.createBuffer(1, float32Array.length, 24000);
    audioBuffer.getChannelData(0).set(float32Array);

    const source = audioCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioCtx.destination);

    const currentTime = audioCtx.currentTime;
    if (nextStartTimeRef.current < currentTime) {
      nextStartTimeRef.current = currentTime;
    }
    source.start(nextStartTimeRef.current);
    nextStartTimeRef.current += audioBuffer.duration;
  };

  useEffect(() => {
    return () => { stopJarvis(); };
  }, []);

  return (
    <>
      {/* Mini trigger button */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => setIsOpen(true)}
          className="fixed top-24 right-6 md:top-28 md:right-8 z-[200] p-4 bg-black border border-white/20 rounded-full shadow-2xl overflow-hidden group hover:scale-110"
        >
          <div className="absolute inset-0 bg-blue-500/20 blur-xl group-hover:bg-blue-500/40 transition-colors" />
          <Activity className="w-6 h-6 text-blue-400 relative z-10" />
        </motion.button>
      )}

      {/* Main Full-screen or floating Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -50 }}
            className="fixed top-24 right-4 md:top-28 md:right-8 z-[200] w-[calc(100vw-32px)] md:w-96 glass-card bg-black/90 p-1 rounded-3xl border border-white/10 shadow-2xl overflow-hidden"
          >
            <div className="relative bg-zinc-900/50 rounded-[22px] overflow-hidden">
               {/* Controls Header */}
               <div className="absolute top-4 right-4 z-20 flex gap-2">
                 <button onClick={() => { stopJarvis(); setIsOpen(false); }} className="p-2 bg-black/50 hover:bg-white/10 rounded-full text-white/60 transition-colors backdrop-blur-md">
                   <X className="w-4 h-4" />
                 </button>
               </div>

               {/* Orb Canvas */}
               <div className="h-64 w-full bg-gradient-to-b from-black/0 to-blue-900/10">
                 <Canvas camera={{ position: [0, 0, 3] }}>
                    <ambientLight intensity={0.5} />
                    <directionalLight position={[10, 10, 10]} intensity={1} />
                    <OrbMesh audioLevel={audioLevel} state={state} />
                 </Canvas>
               </div>

               {/* Controls / Status */}
               <div className="p-6 text-center space-y-4">
                  <div>
                    <h3 className="text-xl font-black italic tracking-tight text-white uppercase">Jarvis</h3>
                    <p className="text-[10px] text-white/40 uppercase tracking-[0.2em]">{state}</p>
                  </div>

                  {errorMsg && (
                    <p className="text-xs text-red-400 p-2 bg-red-400/10 rounded-lg">{errorMsg}</p>
                  )}
                  {transcript && (
                    <div className="text-xs text-white/70 bg-black/40 p-3 rounded-xl max-h-24 overflow-y-auto w-full text-left">
                      <p className="italic">{transcript}</p>
                    </div>
                  )}

                  <button
                    onClick={state === "idle" || state === "error" ? startJarvis : stopJarvis}
                    className={cn(
                      "w-16 h-16 mx-auto rounded-full flex items-center justify-center transition-all",
                      state === "idle" || state === "error" 
                        ? "bg-blue-600 hover:bg-blue-500 text-white" 
                        : "bg-red-500/20 text-red-500 hover:bg-red-500/30"
                    )}
                  >
                    {state === "idle" || state === "error" ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                  </button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
