import { Observable } from './observable'
import ADSR from './adsr'

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
    this.filterADSR = new ADSR(Voice.filterCutoff, (22000 - Voice.filterCutoff) * Voice.adsrToFilterAmount, audioCtx);
    this.filterADSR.attack = Voice.filterAttack;
    this.filterADSR.decay = Voice.filterDecay;
    this.filterADSR.sustain = Voice.filterSustain;
    this.filterADSR.release = Voice.filterRelease;

    this.oscillatorNode.type = SHAPES.sawtooth;
    
    this.biquadFilter.type = 'lowpass';

    this.filterADSR.connect(this.biquadFilter.frequency);
    
    this.oscillatorNode
    .connect(this.biquadFilter)
    .connect(this.gainNode)
    .connect(this.audioCtx.destination);
  }
  noteOn(midiNote, whenTime = this.audioCtx.currentTime) {
    whenTime = Math.max(whenTime, this.audioCtx.currentTime);
    this.biquadFilter.frequency.setValueAtTime(1, whenTime);
    this.filterADSR.noteOn(whenTime);

    this.gainNode.gain.setValueAtTime(Voice.volume, whenTime);
    this.oscillatorNode.frequency.setValueAtTime(midiNoteToFrequency(midiNote), whenTime);
    this.oscillatorNode.start(whenTime);
  }
  noteOff(whenTime = this.audioCtx.currentTime) {
    whenTime = Math.max(whenTime, this.audioCtx.currentTime);
    // https://alemangui.github.io/blog//2015/12/26/ramp-to-value.html
    // TODO: Trigger release envelope
    // Important! Setting a scheduled parameter value
    // this.gainNode.gain.cancelScheduledValues(whenTime);
    this.filterADSR.noteOff(whenTime);
    this.gainNode.gain.setValueAtTime(Voice.volume, whenTime);
    this.gainNode.gain.exponentialRampToValueAtTime(0.00001, whenTime + 3);
    this.oscillatorNode.stop(whenTime + 3);
    window.setTimeout(() => {
      this.gainNode.disconnect();
      this.biquadFilter.disconnect();
      this.dispatchEvent('voiceDonePlaying');
    }, 3000);
  }
}

Voice.createObservableMember('filterCutoff', 1);
Voice.createObservableMember('volume', 0.1);
Voice.createObservableMember('adsrToFilterAmount', 1);
Voice.createObservableMember('filterAttack', 0);
Voice.createObservableMember('filterDecay', 0.5);
Voice.createObservableMember('filterSustain', 0.05);
Voice.createObservableMember('filterRelease', 0.5);