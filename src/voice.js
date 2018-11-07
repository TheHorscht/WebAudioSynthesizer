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
  constructor(audioCtx) {
    super();
    this.audioCtx = audioCtx;

    this.oscillatorNode = audioCtx.createOscillator();
    this.biquadFilter = audioCtx.createBiquadFilter();
    this.gainNode = audioCtx.createGain();

    this.oscillatorNode.type = SHAPES.sawtooth;
    this.oscillatorNode.connect(this.biquadFilter);

    this.biquadFilter.type = 'lowpass';
    this.biquadFilter.frequency.setValueAtTime(20000, audioCtx.currentTime);
    this.biquadFilter.connect(this.gainNode);

    this.gainNode.gain.value = 0.2;
    this.gainNode.connect(this.audioCtx.destination);
  }
  noteOn(midiNote, delay = 0) {
    this.oscillatorNode.frequency.value = midiNoteToFrequency(midiNote);
    this.oscillatorNode.start(this.audioCtx.currentTime + delay);
    // this.oscillatorNode.stop(this.audioCtx.currentTime + 0.5);
    // this.biquadFilter.frequency.setValueAtTime(this.biquadFilter.frequency.value, this.audioCtx.currentTime);
    this.biquadFilter.frequency.exponentialRampToValueAtTime(1000, this.audioCtx.currentTime + 1);
  }
  noteOff(delay = 0) {
    // https://alemangui.github.io/blog//2015/12/26/ramp-to-value.html
    // TODO: Trigger release envelope
    // Important! Setting a scheduled parameter value
    this.oscillatorNode.stop(this.audioCtx.currentTime + delay);
    /* this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, this.audioCtx.currentTime);
    this.gainNode.gain.exponentialRampToValueAtTime(0.0000001, this.audioCtx.currentTime + 0.03 + delay); */
    window.setTimeout(() => {
      this.dispatchEvent('voiceDonePlaying')
    }, 50);
  }
}