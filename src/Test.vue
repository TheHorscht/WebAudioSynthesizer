<template>
  <div>
    <canvas ref="canvas" width="400" height="200"></canvas>
  </div>
</template>
<script>
import ADSR from './adsr.js'

// Circular buffer storage. Externally-apparent 'length' increases indefinitely
// while any items with indexes below length-n will be forgotten (undefined
// will be returned if you try to get them, trying to set is an exception).
// n represents the initial length of the array, not a maximum
function CircularBuffer(n) {
    this._array= new Array(n);
    this.length= 0;
}
CircularBuffer.prototype.toString= function() {
    return '[object CircularBuffer('+this._array.length+') length '+this.length+']';
};
CircularBuffer.prototype.get= function(i) {
    if (i<0 || i<this.length-this._array.length)
        return undefined;
    return this._array[i%this._array.length];
};
CircularBuffer.prototype.set= function(i, v) {
    if (i<0 || i<this.length-this._array.length)
        throw CircularBuffer.IndexError;
    while (i>this.length) {
        this._array[this.length%this._array.length]= undefined;
        this.length++;
    }
    this._array[i%this._array.length]= v;
    if (i==this.length)
        this.length++;
};
CircularBuffer.IndexError= {};

export default {
  data: () => ({
    audioCtx: new AudioContext(),
    noteOnTrigger: false,
  }),
  mounted() {
    this.adsr = new ADSR(1, this.audioCtx);
    this.analyser = this.audioCtx.createAnalyser();
    //this.adsr.connect(this.analyser);

let node = null;
this.audioCtx.audioWorklet.addModule('./processor.js').then(() => {
  node = new MyWorkletNode(this.audioCtx);
  //console.log("Loaded!");
/*   node.port.onmessage = event => {
    console.log(event.data);
  }; */
  adsr.connect(node);
  node.connect(anal);
/*   window.setInterval(() => {
    node.getBuffer().then(console.log);
  }, 2000); */
}).catch(e => console.log(`${e.name}: ${e.message}`));



    let anal = this.audioCtx.createAnalyser();
    anal.fftSize = 32768; // 2048 * 16 * 3;
    let bufferLength = anal.frequencyBinCount;
    let dataArray = new Uint8Array(bufferLength);
    let adsr = new ADSR(100, this.audioCtx);
    // anal.smoothingTimeConstant = 0.001
    anal.smoothingTimeConstant = 0.001
    const speed = 1
    adsr.attack = speed
    adsr.decay = speed
    adsr.sustain = 0.5
    adsr.release = speed
    window.setInterval(() => {
      if(this.noteOnTrigger) {
        adsr.noteOn(this.audioCtx.currentTime)
      } else {
        adsr.noteOff(this.audioCtx.currentTime)
      }
      this.noteOnTrigger = !this.noteOnTrigger;
    }, 2000);
    /**
     * @type {CanvasRenderingContext2D}
     */
    let ctx = this.$refs.canvas.getContext('2d');
    //adsr.connect(anal);
    let w = this.$refs.canvas.width
    let h = this.$refs.canvas.height

    async function loop() {
      // const y = val => h * 0.95 - ((val - 128) / 128 * h * 0.9);
      const y = val => h * 0.99 - (val * h * 0.01);
      //anal.getByteTimeDomainData(dataArray);
      if(node) {
        let buffer = await node.getBuffer();
        ctx.clearRect(0, 0, w, h);
        ctx.beginPath()
        ctx.moveTo(0, y(buffer[0] || 0));
        for(let i = 0; i < buffer.length; i += 1) {
          //console.log(Math.floor(p * buffer.length));
          let p = i / buffer.length;
          let val = y(buffer[i] || 0);
          ctx.lineTo(i, val)
          //console.log('x: ' + p*w + ' y: ' + val);
          
        }
        ctx.strokeStyle = "red"
        ctx.stroke()
        //console.log(buffer);
        
      }
      // window.requestAnimationFrame(loop);
    }
    // window.requestAnimationFrame(loop);
    window.setInterval(loop, 16)
  }
}
</script>
<style lang="scss" scoped>
canvas {
  border: 1px solid black;
}
</style>


