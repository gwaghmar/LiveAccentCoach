/**
 * Audio processing utility
 * Handles audio encoding and chunking for WebSocket transmission
 */

export class AudioProcessor {
  /**
   * Convert AudioBuffer to 16-bit PCM
   */
  static audioBufferToPCM(audioBuffer: AudioBuffer): Int16Array {
    const numberOfChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const length = audioBuffer.length * numberOfChannels;
    const leftChannel = audioBuffer.getChannelData(0);
    const rightChannel = numberOfChannels > 1 ? audioBuffer.getChannelData(1) : null;
    
    const pcm = new Int16Array(length);
    let index = 0;
    let inputIndex = 0;
    
    while (inputIndex < leftChannel.length) {
      const s = Math.max(-1, Math.min(1, leftChannel[inputIndex]));
      pcm[index++] = s < 0 ? s * 0x8000 : s * 0x7fff;
      
      if (rightChannel) {
        const s = Math.max(-1, Math.min(1, rightChannel[inputIndex]));
        pcm[index++] = s < 0 ? s * 0x8000 : s * 0x7fff;
      }
      inputIndex++;
    }
    
    return pcm;
  }
  
  /**
   * Create audio chunks from raw audio data
   */
  static createAudioChunks(
    audioData: Int16Array,
    chunkSize: number = 320
  ): Int16Array[] {
    const chunks: Int16Array[] = [];
    
    for (let i = 0; i < audioData.length; i += chunkSize) {
      const chunk = audioData.slice(i, i + chunkSize);
      chunks.push(chunk);
    }
    
    return chunks;
  }
  
  /**
   * Convert Int16Array to bytes
   */
  static int16ToBytes(data: Int16Array): Uint8Array {
    const bytes = new Uint8Array(data.buffer);
    return bytes;
  }
}

/**
 * ScriptProcessorNode is deprecated, but we need it for real-time audio capture
 * This utility helps manage it properly
 */
export class AudioWorkletProcessor {
  private audioContext: AudioContext;
  private mediaStream?: MediaStream;
  private source?: MediaStreamAudioSourceNode;
  private scriptProcessor: ScriptProcessorNode;
  private onAudioData: (data: Int16Array) => void;
  
  constructor(
    sampleRate: number = 16000,
    bufferSize: number = 4096,
    onAudioData: (data: Int16Array) => void
  ) {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
      sampleRate,
    });
    this.onAudioData = onAudioData;
    this.scriptProcessor = this.audioContext.createScriptProcessor(bufferSize, 1, 1);
    
    this.scriptProcessor.onaudioprocess = (event) => {
      const inputData = event.inputBuffer.getChannelData(0);
      const pcm = AudioProcessor.audioBufferToPCM(event.inputBuffer);
      this.onAudioData(pcm);
    };
  }
  
  async start(): Promise<void> {
    this.mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: { sampleRate: 16000 },
    });
    this.source = this.audioContext.createMediaStreamSource(this.mediaStream);
    this.source.connect(this.scriptProcessor);
    this.scriptProcessor.connect(this.audioContext.destination);
  }
  
  stop(): void {
    this.scriptProcessor.disconnect();
    this.source?.disconnect();
    this.mediaStream?.getTracks().forEach(track => track.stop());
  }
}
