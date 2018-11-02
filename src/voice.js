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

export default class Voice extends Observable {
  constructor(audioCtx) {
    super();
    this.audioCtx = audioCtx;
    this.gainNode = audioCtx.createGain();
    this.gainNode.gain.value = 0.4;
    this.gainNode.connect(this.audioCtx.destination);
  }
  play(midiNote) {
    this.oscillatorNode = this.audioCtx.createOscillator();
    this.oscillatorNode.connect(this.gainNode);
    this.oscillatorNode.type = 'sine';
    this.oscillatorNode.frequency.value = midiNoteToFrequency(midiNote);
    this.oscillatorNode.start(this.audioCtx.currentTime);
    this.oscillatorNode.stop(this.audioCtx.currentTime + 0.5);
  }
  stop() {
    // Important! Setting a scheduled parameter value
    this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, this.audioCtx.currentTime); 

    this.gainNode.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 0.03);
    this.dispatchEvent('voiceDonePlaying');
  }
}