// https://codepen.io/thehorscht/pen/gQwPXZ?editors=1010
export default class ADSR {
  constructor(base, amplitude, audioCtx) {
    this.ctx = audioCtx
    this.constantSource = audioCtx.createConstantSource()
    this.attack = 0
    this.decay = 0
    this.sustain = 1
    this.release = 0.5
    this.base = base
    this.amplitude = amplitude
    this.connect = this.constantSource.connect.bind(this.constantSource)
    this.constantSource.start()
  }
  noteOn(whenTime) {
    console.log(this.base, this.amplitude)
    this.constantSource.offset.setValueAtTime(this.base, whenTime)
    this.constantSource.offset.exponentialRampToValueAtTime(this.amplitude, whenTime + this.attack)
    this.constantSource.offset.exponentialRampToValueAtTime(this.base + (this.amplitude * this.sustain), whenTime + this.attack + this.decay)
  }
  noteOff(whenTime) {
    this.constantSource.offset.cancelAndHoldAtTime(whenTime);
    this.constantSource.offset.exponentialRampToValueAtTime(this.base, whenTime + this.release);
  }
}