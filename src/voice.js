import Observable from './observable'

const midiNoteToFrequency = (function() {
  var midiNoteFrequencies = [];
  for (var x = 0; x < 127; ++x) {
     midiNoteFrequencies[x] = (440 / 32) * (Math.pow(2, ((x - 9) / 12)));
  }
  return function(midiNoteNumber) {
    return midiNoteFrequencies[midiNoteNumber];
  }
})();

const SHAPES = {
  sine: 'sine',
  square: 'square',
  sawtooth: 'sawtooth',
  triangle: 'triangle',
}

export default class Voice extends Observable {
  static filterCutoff = 10000;
  constructor(audioCtx) {
    super();
    this.audioCtx = audioCtx;

    this.oscillatorNode = audioCtx.createOscillator();
    this.biquadFilter = audioCtx.createBiquadFilter();
    this.gainNode = audioCtx.createGain();

    this.oscillatorNode.type = SHAPES.sawtooth;
    
    this.biquadFilter.type = 'lowpass';
    
    this.oscillatorNode
    .connect(this.biquadFilter)
    .connect(this.gainNode)
    .connect(this.audioCtx.destination);
  }
  noteOn(midiNote, whenTime = this.audioCtx.currentTime) {
    whenTime = Math.max(whenTime, this.audioCtx.currentTime);
    this.biquadFilter.frequency
    .setValueAtTime(this.filterCutoff, whenTime)
    .exponentialRampToValueAtTime(1000, whenTime + 0.3);

    this.gainNode.gain
    .setValueAtTime(0.02, whenTime);
    this.oscillatorNode.frequency.setValueAtTime(midiNoteToFrequency(midiNote), whenTime);
    this.oscillatorNode.start(whenTime);
  }
  noteOff(whenTime = this.audioCtx.currentTime) {
    whenTime = Math.max(whenTime, this.audioCtx.currentTime);
    // https://alemangui.github.io/blog//2015/12/26/ramp-to-value.html
    // TODO: Trigger release envelope
    // Important! Setting a scheduled parameter value
    // this.gainNode.gain.cancelScheduledValues(whenTime);
    this.gainNode.gain.setValueAtTime(0.02, whenTime);
    this.gainNode.gain.exponentialRampToValueAtTime(0.00001, whenTime + 3);
    this.oscillatorNode.stop(whenTime + 3);
    window.setTimeout(() => {
      this.gainNode.disconnect();
      this.biquadFilter.disconnect();
      this.dispatchEvent('voiceDonePlaying');
    }, 3000);
  }
}