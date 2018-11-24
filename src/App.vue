<template>
  <div id="app">
    <fieldset class="oscillator-container" v-for="(osc, i) in oscillators" :key="'oscillator'+i">
      <legend>OSC {{ i + 1 }}</legend>
      <label>
        Active
        <input type="checkbox" v-model="osc.active">
      </label>
      <label>
        Shape
        <select v-model="osc.shape">
          <option v-for="shape in SHAPES"
                  :key="shape"
                  :value="shape">
            {{ shape }}
          </option>
        </select>
      </label>
      <label>
        Voices
        <select v-model="osc.voices">
          <option v-for="voiceCount in 4"
                  :key="'voiceSelect'+voiceCount"
                  :value="voiceCount">
            {{ voiceCount }}
          </option>
        </select>
      </label>
      <label>
        Detune
        <vue-slider v-bind="sliderConfig.horizontal"
                    v-model="osc.detune"
                    :min="0" :max="1200" />
      </label>
      <label>
        Octave
        <select v-model="osc.octave">
          <option v-for="octave in 5"
                  :key="'octaveSelect'+octave"
                  :value="octave - 3">
            <template v-if="octave - 3 > 0">+</template>
            {{ octave - 3 }}
          </option>
        </select>
      </label>
      <label>
        Pitch
        <select v-model="osc.pitch">
          <option v-for="pitch in 25"
                  :key="'pitchSelect'+pitch"
                  :value="pitch - 13">
            <template v-if="pitch - 13 > 0">+</template>
            {{ pitch - 13 }}
          </option>
        </select>
      </label>
    </fieldset>
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
      <vue-keyboard ref="keyboard" @noteOn="onKeyboardNoteOn" @noteOff="onKeyboardNoteOff"
                    :octaveStart="verticalLow" 
                    :octaveEnd="verticalHigh" />
      <zoom-scrollbar orientation="horizontal"
                      :min="0"
                      :max="2"
                      :low="horizontalLow"
                      :high="horizontalHigh"
                      @lowChanged="onScrollHorizontalLowChanged"
                      @highChanged="onScrollHorizontalHighChanged" />
      <zoom-scrollbar orientation="vertical"
                      :min="3"
                      :max="8"
                      :low="verticalLow"
                      :high="verticalHigh"
                      :reverse="true"
                      @lowChanged="onScrollVerticalLowChanged"
                      @highChanged="onScrollVerticalHighChanged" />
      <vue-sequencer ref="sequencer" @noteOn="onSequencerNoteOn" @noteOff="onSequencerNoteOff"
                    @stop="onSequencerStop"
                    :audioContext="audioCtx"
                    :bpm="bpm"
                    :viewportStart="horizontalLow"
                    :viewportEnd="horizontalHigh"
                    :octaveStart="verticalLow"
                    :octaveEnd="verticalHigh" />
    </div>
    <input type="button" value="Play/Pause" @click="togglePlaying">
  </div>
</template>

<script>
import knob from './components/knob'
import vueSlider from 'vue-slider-component'
import vueKeyboard from './components/keyboard'
import vueSequencer from './components/sequencer'
import zoomScrollbar from './components/zoom-scrollbar'
import sliderConfig from './slider-config'
import Voice, { SHAPES } from './voice'

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
    zoomScrollbar,
  },
  data: () => ({
    sliderConfig,
    SHAPES,
    audioCtx: new AudioContext(),
    bpm: 120,
    volume: 0.25,
    oscillators: [{
      shape: SHAPES.sawtooth,
      active: true,
      voices: 1,
      detune: 0,
      octave: 0,
      pitch: 0,
    }, {
      shape: SHAPES.square,
      active: false,
      voices: 1,
      detune: 0,
      octave: 0,
      pitch: 0,
    }],
    filterCutoff: 22000,
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
    horizontalLow: 0,
    horizontalHigh: 1,
    verticalLow: 4,
    verticalHigh: 5,
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

    link('osc1active', Voice, 'osc1active');
    link('osc1shape', Voice, 'osc1shape');
    link('osc1voices', Voice, 'osc1voices');
    link('osc1detune', Voice, 'osc1detune');
    link('osc1octave', Voice, 'osc1octave');
    link('osc1pitch', Voice, 'osc1pitch');

    link('osc2active', Voice, 'osc2active');
    link('osc2shape', Voice, 'osc2shape');
    link('osc2voices', Voice, 'osc2voices');
    link('osc2detune', Voice, 'osc2detune');
    link('osc2octave', Voice, 'osc2octave');
    link('osc2pitch', Voice, 'osc2pitch');

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
    onScrollHorizontalLowChanged(newVal) {
      this.horizontalLow = newVal;
    },
    onScrollHorizontalHighChanged(newVal) {
      this.horizontalHigh = newVal;
    },
    onScrollVerticalLowChanged(newVal) {
      this.verticalLow = newVal;
    },
    onScrollVerticalHighChanged(newVal) {
      this.verticalHigh = newVal;
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
  computed: {
    osc1active: self => self.oscillators[0].active,
    osc1shape: self => self.oscillators[0].shape,
    osc1voices: self => self.oscillators[0].voices,
    osc1detune: self => self.oscillators[0].detune,
    osc1octave: self => self.oscillators[0].octave,
    osc1pitch: self => self.oscillators[0].pitch,

    osc2active: self => self.oscillators[1].active,
    osc2shape: self => self.oscillators[1].shape,
    osc2voices: self => self.oscillators[1].voices,
    osc2detune: self => self.oscillators[1].detune,
    osc2octave: self => self.oscillators[1].octave,
    osc2pitch: self => self.oscillators[1].pitch,
  }
}
window.Voice = Voice
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css?family=Roboto');
body {
  user-select: none;
  font-family: 'Roboto', sans-serif;
}
.oscillator-container {
  label {
    display: block;
  }
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
  grid-template-columns: 100px 700px 20px;
  grid-template-rows: 20px 600px;
  > :nth-child(1) {
    grid-row: 2 / 3;
    grid-column: 1;
  }
  > :nth-child(2) {
    grid-row: 1;
    grid-column: 2;
  }
  > :nth-child(3) {
    grid-row: 2;
    grid-column: 3;
  }
  > :nth-child(4) {
    grid-row: 2;
    grid-column: 2;
  }
}
</style>
