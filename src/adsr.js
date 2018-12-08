export default class ADSR {
  constructor(amplitude, audioCtx) {
    this.ctx = audioCtx
    this.constantSource = audioCtx.createConstantSource()
    this.attack = 0
    this.decay = 0
    this.sustain = 1
    this.release = 0.5
    this.tension = 0.2
    this.amplitude = amplitude
    this.connect = this.constantSource.connect.bind(this.constantSource)
  }
  noteOn(whenTime) {    
    this.constantSource.offset.cancelScheduledValues(whenTime)
    this.constantSource.offset.setValueAtTime(0, whenTime)
    this.constantSource.offset.setTargetAtTime(this.amplitude, whenTime, this.tension * this.attack);
    this.constantSource.offset.setTargetAtTime(this.amplitude * this.sustain, whenTime + this.attack, this.tension * this.decay);
    this.constantSource.start(whenTime)
  }
  noteOff(whenTime) {
    this.constantSource.offset.cancelAndHoldAtTime(whenTime + 0.0001);
    this.constantSource.offset.setTargetAtTime(0, whenTime, this.tension * this.release);
    // Would it be good to stop? If so, figure out how long transition takes and fill in value
    // this.constantSource.stop(whenTime + this.release);
  }
}