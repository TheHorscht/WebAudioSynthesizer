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

export const SHAPES = {
  sine: 'sine',
  square: 'square',
  sawtooth: 'sawtooth',
  triangle: 'triangle',
}

export default class Voice extends Observable {
  /**
   * @param {AudioContext} audioCtx
   */
  constructor(audioCtx) {
    super();
    this.audioCtx = audioCtx;

    this.osc1Nodes = [];
    for(let i = 0; i < Voice.osc1voices; i++) {
      this.osc1Nodes[i] = audioCtx.createOscillator();
      this.osc1Nodes[i].type = Voice.osc1shape;
    }
    this.osc2Nodes = [];
    if(Voice.osc2active) {
      for(let i = 0; i < Voice.osc2voices; i++) {
        this.osc2Nodes[i] = audioCtx.createOscillator();
        this.osc2Nodes[i].type = Voice.osc2shape;
      }
    }

    this.biquadFilter = audioCtx.createBiquadFilter();
    this.gainNode = audioCtx.createGain();
    this.volumeADSR = new ADSR(Voice.volume, audioCtx);
    this.volumeADSR.attack = Voice.volumeAttack;
    this.volumeADSR.decay = Voice.volumeDecay;
    this.volumeADSR.sustain = Voice.volumeSustain;
    this.volumeADSR.release = Voice.volumeRelease;

    this.filterADSR = new ADSR((22000 - Voice.filterCutoff) * Voice.filterEnvelopeAmount, audioCtx);
    this.filterADSR.attack = Voice.filterAttack;
    this.filterADSR.decay = Voice.filterDecay;
    this.filterADSR.sustain = Voice.filterSustain;
    this.filterADSR.release = Voice.filterRelease;

    this.biquadFilter.type = 'lowpass';
    this.biquadFilter.Q.setValueAtTime(Voice.filterResonance, audioCtx.currentTime);
    
    this.gainNode.gain.setValueAtTime(0, audioCtx.currentTime);

    this.volumeADSR.connect(this.gainNode.gain);
    this.filterADSR.connect(this.biquadFilter.frequency);
    this.filterADSR.tension = 0.5
    
    this.osc1Nodes.forEach(node => {
      node.connect(this.biquadFilter)
          .connect(this.gainNode)
          .connect(this.audioCtx.destination);
    });
    
    this.osc2Nodes.forEach(node => {
      node.connect(this.biquadFilter)
          .connect(this.gainNode)
          .connect(this.audioCtx.destination);
    });

    Voice.addEventListener('osc1shapeChanged', () => {

    });
  }
  noteOn(midiNote, whenTime = this.audioCtx.currentTime) {
    whenTime = Math.max(whenTime, this.audioCtx.currentTime);
    this.biquadFilter.frequency.setValueAtTime(Voice.filterCutoff, whenTime);

    for(let i = 0; i < this.osc1Nodes.length; i++) {
      let oct = Voice.osc1octave;
      let detune = Voice.osc1detune;
      let pitch = Voice.osc1pitch;
      let freq = midiNoteToFrequency(midiNote + 12 * oct + pitch);
      let evenOdd = i % 2 === 0 ? 1 : -1;
      freq += freq * detune * evenOdd * 0.00002;
      this.osc1Nodes[i].frequency.setValueAtTime(freq, whenTime);
      this.osc1Nodes[i].start(whenTime);
    }
    for(let i = 0; i < this.osc2Nodes.length; i++) {
      let oct = Voice.osc2octave;
      let detune = Voice.osc2detune;
      let pitch = Voice.osc2pitch;
      let freq = midiNoteToFrequency(midiNote + 12 * oct + pitch);
      let evenOdd = i % 2 === 0 ? 1 : -1;
      freq += freq * detune * evenOdd * 0.00002;
      this.osc2Nodes[i].frequency.setValueAtTime(freq, whenTime);
      this.osc2Nodes[i].start(whenTime);
    }
      
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
    for(let i = 0; i < this.osc1Nodes.length; i++) {
      this.osc1Nodes[i].stop(whenTime + Voice.volumeRelease);
    }
    for(let i = 0; i < this.osc2Nodes.length; i++) {
      this.osc2Nodes[i].stop(whenTime + Voice.volumeRelease);
    }
    // console.log("Stopping in: " + parseFloat(whenTime - this.audioCtx.currentTime));
    
    window.setTimeout(() => {
      this.gainNode.disconnect();
      this.biquadFilter.disconnect();
      this.dispatchEvent('voiceDonePlaying');
    }, ((whenTime + Voice.volumeRelease) - this.audioCtx.currentTime) * 1000);
  }
}

Voice.createObservableMember('filterCutoff', 1);
Voice.createObservableMember('filterResonance', 0);

Voice.createObservableMember('osc1shape', SHAPES.sawtooth);
Voice.createObservableMember('osc1active', true);
Voice.createObservableMember('osc1voices', 1);
Voice.createObservableMember('osc1detune', 0);
Voice.createObservableMember('osc1octave', 0);
Voice.createObservableMember('osc1pitch', 0);

Voice.createObservableMember('osc2shape', SHAPES.square);
Voice.createObservableMember('osc2active', false);
Voice.createObservableMember('osc2voices', 1);
Voice.createObservableMember('osc2detune', 0);
Voice.createObservableMember('osc2octave', 0);
Voice.createObservableMember('osc2pitch', 0);

Voice.createObservableMember('volume', 0.1);
Voice.createObservableMember('volumeAttack', 0);
Voice.createObservableMember('volumeDecay', 0.5);
Voice.createObservableMember('volumeSustain', 0.05);
Voice.createObservableMember('volumeRelease', 0.5);
Voice.createObservableMember('filterEnvelopeAmount', 1);
Voice.createObservableMember('filterAttack', 0);
Voice.createObservableMember('filterDecay', 0.5);
Voice.createObservableMember('filterSustain', 0.05);
Voice.createObservableMember('filterRelease', 0.5);