<template>
  <div>
    <canvas ref="canvas" width="400" height="200"></canvas>
  </div>
</template>
<script>
import ADSR from './adsr.js'

export default {
  data: () => ({
    audioCtx: new AudioContext(),
    noteOnTrigger: false,
  }),
  mounted() {
    this.adsr = new ADSR(1, this.audioCtx);
    this.analyser = this.audioCtx.createAnalyser();
    this.adsr.connect(this.analyser);



    let anal = this.audioCtx.createAnalyser();
    anal.fftSize = 2048;
    let bufferLength = anal.frequencyBinCount;
    let dataArray = new Uint8Array(bufferLength);
    let fullDataArray = new Uint8Array(bufferLength * 100);
    let adsr = new ADSR(100, this.audioCtx);
    anal.smoothingTimeConstant = 0.001
    adsr.attack = 5
    adsr.decay = 5
    adsr.sustain = 0.5
    adsr.release = 5
    window.setInterval(() => {
      if(this.noteOnTrigger) {
        adsr.noteOn(this.audioCtx.currentTime)
      } else {
        adsr.noteOff(this.audioCtx.currentTime)
      }
      this.noteOnTrigger = !this.noteOnTrigger;
    }, 5000);
    /**
     * @type {CanvasRenderingContext2D}
     */
    let ctx = this.$refs.canvas.getContext('2d');
    adsr.connect(anal);
    let w = this.$refs.canvas.width
    let h = this.$refs.canvas.height

    let i = 0;
    function loop() {
      anal.getByteTimeDomainData(dataArray);
      if(i < 100) {
        fullDataArray.set(dataArray, i * dataArray.length);
        i++;
      }
      ctx.clearRect(0, 0, w, h);
      ctx.beginPath()
      ctx.moveTo(0, dataArray[0]);
      for(let i = 0; i < fullDataArray.length; i += 1000) {
        let p = i / fullDataArray.length;
        let val = (fullDataArray[Math.floor(p * fullDataArray.length)] - 128) / 128 * h * 0.9;
        // ctx.lineTo(i * w, h - (queue[i] / 255) * (h - 10))
        ctx.lineTo(p * w, h * 0.95 - val)
      }
      ctx.strokeStyle = "red"
      ctx.stroke()
      // window.requestAnimationFrame(loop);
    }
    // window.requestAnimationFrame(loop);
    window.setInterval(loop, 2000)






  }
}
</script>
<style lang="scss" scoped>

</style>


