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
    this.volumeADSR = new ADSR(0.2, audioCtx);
    this.volumeADSR.attack = Voice.volumeAttack;
    this.volumeADSR.decay = Voice.volumeDecay;
    this.volumeADSR.sustain = Voice.volumeSustain;
    this.volumeADSR.release = Voice.volumeRelease;

    this.oscillatorNode.type = SHAPES.sawtooth;

    this.filterADSR = new ADSR((22000 - Voice.filterCutoff) * Voice.adsrToFilterAmount, audioCtx);
    this.filterADSR.attack = Voice.filterAttack;
    this.filterADSR.decay = Voice.filterDecay;
    this.filterADSR.sustain = Voice.filterSustain;
    this.filterADSR.release = Voice.filterRelease;

    this.biquadFilter.type = 'lowpass';
    
    this.gainNode.gain.setValueAtTime(0, audioCtx.currentTime);

    this.volumeADSR.connect(this.gainNode.gain);
    this.filterADSR.connect(this.biquadFilter.frequency);
    
    this.oscillatorNode
    .connect(this.biquadFilter)
    .connect(this.gainNode)
    .connect(this.audioCtx.destination);
  }
  noteOn(midiNote, whenTime = this.audioCtx.currentTime) {
    whenTime = Math.max(whenTime, this.audioCtx.currentTime);
    this.biquadFilter.frequency.setValueAtTime(Voice.filterCutoff, whenTime);

    this.oscillatorNode.frequency.setValueAtTime(midiNoteToFrequency(midiNote), whenTime);
    this.oscillatorNode.start(whenTime);
      
    this.volumeADSR.noteOn(whenTime);
    this.filterADSR.noteOn(whenTime);
  }
  noteOff(whenTime = this.audioCtx.currentTime) {
    whenTime = Math.max(whenTime, this.audioCtx.currentTime);
    // https://alemangui.github.io/blog//2015/12/26/ramp-to-value.html
    // TODO: Trigger release envelope
    // Important! Setting a scheduled parameter value
    // this.gainNode.gain.cancelScheduledValues(whenTime);
    this.volumeADSR.noteOff(whenTime);
    this.filterADSR.noteOff(whenTime);
    /* this.gainNode.gain.setValueAtTime(Voice.volume, whenTime);
    this.gainNode.gain.exponentialRampToValueAtTime(0.00001, whenTime + 3); */
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
Voice.createObservableMember('volumeAttack', 0);
Voice.createObservableMember('volumeDecay', 0.5);
Voice.createObservableMember('volumeSustain', 0.05);
Voice.createObservableMember('volumeRelease', 0.5);
Voice.createObservableMember('adsrToFilterAmount', 1);
Voice.createObservableMember('filterAttack', 0);
Voice.createObservableMember('filterDecay', 0.5);
Voice.createObservableMember('filterSustain', 0.05);
Voice.createObservableMember('filterRelease', 0.5);