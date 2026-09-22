import { useRef, useState } from 'react';

export function usePCMStream() {
    const audioContextRef = useRef(null);
    const mediaStreamRef = useRef(null);
    const processorRef = useRef(null);
    const sourceNodeRef = useRef(null);
    const [isStreaming, setIsStreaming] = useState(false);
    
    const chunkBufferRef = useRef(new Float32Array(0));
    const CHUNK_SIZE = 32000; // ~2 seconds at 16kHz

    const startStream = async (onDataAvailable) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            const AudioContext = window.AudioContext || window.webkitAudioContext;
            // Force downsampling to 16kHz
            const context = new AudioContext({ sampleRate: 16000 });
            audioContextRef.current = context;

            const source = context.createMediaStreamSource(stream);
            sourceNodeRef.current = source;

            // Use ScriptProcessorNode (buffer size 4096, 1 input channel, 1 output channel)
            const processor = context.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;
            
            chunkBufferRef.current = new Float32Array(0);

            processor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0); // Float32Array
                
                // Aggregate chunks to reach ~2 seconds
                const newBuffer = new Float32Array(chunkBufferRef.current.length + inputData.length);
                newBuffer.set(chunkBufferRef.current, 0);
                newBuffer.set(inputData, chunkBufferRef.current.length);
                chunkBufferRef.current = newBuffer;
                
                if (chunkBufferRef.current.length >= CHUNK_SIZE) {
                    if (onDataAvailable) {
                        onDataAvailable(chunkBufferRef.current.buffer);
                    }
                    chunkBufferRef.current = new Float32Array(0);
                }
            };

            source.connect(processor);
            processor.connect(context.destination);

            setIsStreaming(true);
        } catch (err) {
            console.error("PCM stream error:", err);
            setIsStreaming(false);
            throw err;
        }
    };

    const stopPCMStream = () => {
        if (processorRef.current) {
            processorRef.current.disconnect();
            processorRef.current = null;
        }
        if (sourceNodeRef.current) {
            sourceNodeRef.current.disconnect();
            sourceNodeRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
        setIsStreaming(false);
    };

    return { isStreaming, startStream, stopPCMStream };
}
