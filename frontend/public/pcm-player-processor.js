/**
 * pcm-player-processor.js
 * AudioWorklet processor for gap-free PCM 16-bit playback at 24 kHz.
 * Receives Int16 ArrayBuffer chunks via port.postMessage and plays them
 * from a ring buffer so there are never gaps or glitches between chunks.
 */

const BUFFER_SECONDS = 180;        // 180 s ring buffer
const SAMPLE_RATE    = 24000;      // Gemini Live outputs 24 kHz
const RING_SIZE      = BUFFER_SECONDS * SAMPLE_RATE; // 4 320 000 samples

class PCMPlayerProcessor extends AudioWorkletProcessor {
  constructor () {
    super();
    this._ring          = new Float32Array(RING_SIZE);
    this._writeIdx      = 0;
    this._readIdx       = 0;
    this._buffered      = 0;

    this.port.onmessage = (e) => {
      if (!e.data) return;

      // Flush / end-of-audio signal
      if (e.data.command === 'endOfAudio') {
        this._writeIdx  = 0;
        this._readIdx   = 0;
        this._buffered  = 0;
        return;
      }

      // Incoming audio — expect an ArrayBuffer of Int16 PCM
      const int16 = new Int16Array(e.data);
      for (let i = 0; i < int16.length; i++) {
        this._ring[this._writeIdx] = int16[i] / 32768.0;
        this._writeIdx = (this._writeIdx + 1) % RING_SIZE;
        this._buffered = Math.min(this._buffered + 1, RING_SIZE);
      }
    };
  }

  process (_inputs, outputs) {
    const channel = outputs[0][0];
    for (let i = 0; i < channel.length; i++) {
      if (this._buffered > 0) {
        channel[i]      = this._ring[this._readIdx];
        this._readIdx   = (this._readIdx + 1) % RING_SIZE;
        this._buffered -= 1;
      } else {
        channel[i] = 0; // silence while waiting for data
      }
    }
    return true; // keep alive
  }
}

registerProcessor('pcm-player-processor', PCMPlayerProcessor);
