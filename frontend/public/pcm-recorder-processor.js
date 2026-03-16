/**
 * pcm-recorder-processor.js
 * AudioWorklet processor that captures mic input as 16-bit PCM
 * and posts each chunk as an ArrayBuffer back to the main thread.
 */

class PCMRecorderProcessor extends AudioWorkletProcessor {
  process (inputs) {
    const input = inputs[0];
    if (!input || !input[0]) return true;

    const float32 = input[0];
    const int16   = new Int16Array(float32.length);

    for (let i = 0; i < float32.length; i++) {
      const clamped = Math.max(-1, Math.min(1, float32[i]));
      int16[i]      = clamped < 0 ? clamped * 0x8000 : clamped * 0x7FFF;
    }

    // Transfer ownership — zero-copy send to main thread
    this.port.postMessage(int16.buffer, [int16.buffer]);
    return true;
  }
}

registerProcessor('pcm-recorder-processor', PCMRecorderProcessor);
