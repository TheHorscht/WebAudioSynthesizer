<template>
  <div id="app">
    <fieldset>
      <legend>Filter</legend>
      <div class="filter-envelope-container">
        <knob :size="75" label="Cutoff" v-model="filterCutoff" :min="5" :max="22000" scale="log" />
        <knob :size="75" label="Resonance" v-model="filterResonance" :min="0" :max="10" />
        <vue-slider v-bind="sliderConfig.verticalADSR" v-model="filterEnvelopeAmount" :min="0" :max="1" :interval="0.01" />
        <vue-slider v-bind="sliderConfig.verticalADSR" v-model="filterA" :min="0" :max="1" :interval="0.01" />
        <vue-slider v-bind="sliderConfig.verticalADSR" v-model="filterD" :min="0" :max="1" :interval="0.01" />
        <vue-slider v-bind="sliderConfig.verticalADSR" v-model="filterS" :min="0" :max="1" :interval="0.01" />
        <vue-slider v-bind="sliderConfig.verticalADSR" v-model="filterR" :min="0.01" :max="1" :interval="0.01" />
        <span>Env</span>
        <span>A</span>
        <span>D</span>
        <span>S</span>
        <span>R</span>
      </div>
    </fieldset>
    <fieldset>
      <legend>Amplitude</legend>
      <div class="ASDR-container">
        <vue-slider v-bind="sliderConfig.verticalADSR" v-model="volumeA" :min="0" :max="1" :interval="0.01" />
        <vue-slider v-bind="sliderConfig.verticalADSR" v-model="volumeD" :min="0" :max="1" :interval="0.01" />
        <vue-slider v-bind="sliderConfig.verticalADSR" v-model="volumeS" :min="0" :max="1" :interval="0.01" />
        <vue-slider v-bind="sliderConfig.verticalADSR" v-model="volumeR" :min="0.01" :max="1" :interval="0.01" />
        <span>A</span>
        <span>D</span>
        <span>S</span>
        <span>R</span>
      </div>
    </fieldset>
    <div>
      <vue-slider v-bind="sliderConfig.horizontal" :min="0" :max="0.5" :interval="0.01" v-model="volume"/>
      Volume: {{ volume }}
      <vue-slider v-bind="sliderConfig.horizontal" :min="80" :max="200" v-model="bpm"/>
      BPM: {{ bpm }}
    </div>
    <div class="kb-and-sequencer">
      <vue-keyboard ref="keyboard" @noteOn="onKeyboardNoteOn" @noteOff="onKeyboardNoteOff"/>
      <vue-sequencer ref="sequencer" @noteOn="onSequencerNoteOn" @noteOff="onSequencerNoteOff"
                     @stop="onSequencerStop"
                     :audioContext="audioCtx"
                     :bpm="bpm" />
    </div>
    <input type="button" value="Play/Pause" @click="togglePlaying">
  </div>
</template>

<script>
import knob from './components/knob'
import vueSlider from 'vue-slider-component'
import vueKeyboard from './components/keyboard'
import vueSequencer from './components/sequencer'
import sliderConfig from './slider-config'
import Voice from './voice'

const voices = {};
const generateNewId = (() => {
  let c = 0;
  return () => c++;
})();

let keyboardTimeouts = [];

window.voices = voices;

export default {
  name: 'app',
  components: {
    knob,
    vueSlider,
    vueKeyboard,
    vueSequencer,
  },
  data: () => ({
    sliderConfig,
    audioCtx: new AudioContext(),
    bpm: 120,
    volume: 0.02,
    filterCutoff: 220,
    filterResonance: 0,
    volumeA: 0,
    volumeD: 0,
    volumeS: 1,
    volumeR: 0.01,
    filterEnvelopeAmount: 0,
    filterA: 0,
    filterD: 0.5,
    filterS: 0,
    filterR: 0.01,
  }),
  mounted () {
    const link = (sourceField, cls, destinationField, transformFunction) => {
      this.$watch(() => this[sourceField], () => {
        if(transformFunction) {
          cls[destinationField] = transformFunction(this[sourceField]);
        } else {
          cls[destinationField] = this[sourceField];
        }
      }, { immediate: true });
    }
    link('volumeA', Voice, 'volumeAttack');
    link('volumeD', Voice, 'volumeDecay');
    link('volumeS', Voice, 'volumeSustain');
    link('volumeR', Voice, 'volumeRelease');
    link('filterCutoff', Voice, 'filterCutoff');
    link('filterResonance', Voice, 'filterResonance');
    link('filterEnvelopeAmount', Voice, 'filterEnvelopeAmount');
    link('filterA', Voice, 'filterAttack', val => Math.pow(val, 2));
    link('filterD', Voice, 'filterDecay', val => Math.pow(val, 2));
    link('filterS', Voice, 'filterSustain', val => Math.pow(val, 2));
    link('filterR', Voice, 'filterRelease', val => Math.pow(val, 2));
    link('volume', Voice, 'volume');
  },
  methods: {
    onKeyboardNoteOn({ pitch, id }) {
      this.noteOn(id, pitch);
    },
    onKeyboardNoteOff({ pitch, id }) {
      this.noteOff(id, pitch);
    },
    onSequencerNoteOn({ note, whenTime }) {
      const { pitch, id } = note;
      const delay = whenTime - this.audioCtx.currentTime;

      const timeout = window.setTimeout(() => {
        this.$refs.keyboard.keyDown(pitch, false);
        let index = keyboardTimeouts.indexOf(timeout);
        keyboardTimeouts.splice(index, 1);
      }, delay * 1000);
      keyboardTimeouts.push(timeout);

      this.noteOn(id, pitch, whenTime);
    },
    onSequencerNoteOff({ note, whenTime }) {
      const { pitch, id } = note;
      const delay = whenTime - this.audioCtx.currentTime;

      const timeout = window.setTimeout(() => {
        this.$refs.keyboard.keyUp(pitch, false);
        let index = keyboardTimeouts.indexOf(timeout);
        keyboardTimeouts.splice(index, 1);
      }, delay * 1000);
      keyboardTimeouts.push(timeout);

      this.noteOff(id, pitch, whenTime);
    },
    onSequencerStop() {
      this.stopAllNotes();
    },
    stopAllNotes() {
      this.$refs.keyboard.releaseAllKeys();
      keyboardTimeouts.forEach(timeout => {
        window.clearTimeout(timeout);
      })
      keyboardTimeouts = [];
      Object.values(voices).forEach(voiceArray => {
        voiceArray.forEach(voice => voice.noteOff());
        voiceArray.length = 0;
      });
    },
    noteOn(id, pitch, whenTime) {
      const voice = new Voice(this.audioCtx);
      if(id in voices) {
        voices[id].push(voice);
      } else {
        voices[id] = [voice];
      }
      voice.noteOn(pitch, whenTime);
      voice.addEventListener('voiceDonePlaying', () => {
        // voices[id].pop();
      });
    },
    noteOff(id, pitch, whenTime) {
      if(id in voices && voices[id].length > 0) {
        let voice = voices[id].pop();
        voice.noteOff(whenTime);
      }
    },
    togglePlaying() {
      if(this.$refs.sequencer.playing) {
        this.$refs.sequencer.stop();
      } else {
        this.$refs.sequencer.play();
      } 
    }
  },
}
window.Voice = Voice
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css?family=Roboto');
body {
  user-select: none;
  font-family: 'Roboto', sans-serif;
}
fieldset {
  display: inline-block;
  vertical-align: middle; // Why is this necessary?
}
.ASDR-container {
  display: inline-grid;
  grid-template-columns: repeat(4, 25px);
  grid-template-rows: auto 20px;
  justify-items: center;
}
.filter-envelope-container {
  display: inline-grid;
  grid-template-columns: 90px 90px 60px repeat(4, 25px);
  grid-template-rows: auto 20px;
  justify-items: center;
  :nth-child(1), :nth-child(2) {
    grid-row: 1 / 3;
    align-self: center;
  }
}
.kb-and-sequencer {
  display: grid;
  grid-template-columns: 100px auto;
  resize: both;
  overflow: scroll;
  
  min-width: 400px;
  min-height: 400px;
  max-width: 800px;
  max-height: 800px;
}
</style>
