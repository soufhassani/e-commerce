// jest.polyfill.ts  (runs first because it's in setupFiles)
import "whatwg-fetch";
import { TextEncoder, TextDecoder } from "util";
import { TransformStream } from "node:stream/web"; // ✅ Node’s native impl.

// attach globals for the JSDOM test environment
(globalThis as any).TextEncoder = TextEncoder;
(globalThis as any).TextDecoder = TextDecoder;
(globalThis as any).TransformStream = TransformStream;

// stub BroadcastChannel (still needed in JSDOM)
class StubBroadcastChannel {
  name: string;
  onmessage: ((ev: any) => unknown) | null = null;
  constructor(name: string) {
    this.name = name;
  }
  postMessage(_msg: any) {}
  close() {}
  addEventListener() {}
  removeEventListener() {}
}
(globalThis as any).BroadcastChannel = StubBroadcastChannel;
