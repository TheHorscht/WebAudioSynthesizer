class MyWorkletProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.buffer = new CyclicBuffer(256, Array);
    this.lastUpdate = currentTime;
    this.port.onmessage = event => {
      (({
        'GetBuffer': () => {
          this.port.postMessage({
            cmd: event.data.cmd,
            id: event.data.id,
            result: this.buffer.buffer });
        }
      })[event.data.cmd] || (() => null))();
    };
  }

  process(inputs, outputs, parameters) {
    if(currentTime - this.lastUpdate > 0.05) {
      this.buffer.push(inputs[0][0][0]);
      this.lastUpdate = currentTime;
    }
    return true;
  }
}

class CyclicBuffer {
  constructor(capacity, type) {
    this.buffer = new type(capacity);
    this.pos = 0;
  }
  push(val) {
    this.buffer[this.pos++] = val;
    if(this.pos >= this.buffer.length) {
      this.pos = 0;
    }
  }
}

registerProcessor('my-worklet-processor', MyWorkletProcessor);