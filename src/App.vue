<template>
  <div id="app">
    <knob :size="50"/>
    <knob :size="75"/>
    <knob :size="100" />
    <div class="ASDR-container">
      <vue-slider v-bind="sliderConfig.verticalASDR" />
      <vue-slider v-bind="sliderConfig.verticalASDR" />
      <vue-slider v-bind="sliderConfig.verticalASDR" />
      <vue-slider v-bind="sliderConfig.verticalASDR" />
      <span>A</span>
      <span>S</span>
      <span>D</span>
      <span>R</span>
    </div>
    <vue-slider v-bind="sliderConfig.horizontal" />
    <vue-sequencer ref="sequencer" @noteon="noteon" @noteoff="noteoff" />
    <input type="button" value="Play/Pause" @click="togglePlaying">
  </div>
</template>

<script>
import knob from './components/knob'
import vueSlider from 'vue-slider-component'
import vueSequencer from './components/sequencer'
import sliderConfig from './slider-config'
import Voice from './voice'

const audioCtx = new AudioContext();
let voices = {};

export default {
  name: 'app',
  components: {
    knob,
    vueSlider,
    vueSequencer,
  },
  data: () => ({
    sliderConfig,
  }),
  mounted () {
    
  },
  methods: {
    noteon({ pitch, id }) {
      const voice = new Voice(audioCtx);
      voices[id] = voice;
      voice.play(pitch);
      voice.addEventListener('voiceDonePlaying', () => {
        console.log('Voice finished playing');
      });
      console.log(`Playing note with id ${id} and pitch ${pitch}`)
      console.log(`#Voices: `, voices)
    },
    noteoff({ pitch, id }) {
      // https://alemangui.github.io/blog//2015/12/26/ramp-to-value.html
      // stopSound(midiNoteToFrequency(pitch));
      // audioCtx.
      voices[id].stop();
    },
    togglePlaying() {
      if(this.$refs.sequencer.playing) {
        this.$refs.sequencer.stop();
      } else {
        this.$refs.sequencer.resume();
      } 
    }
  }
}
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css?family=Roboto');
body {
  user-select: none;
}
.ASDR-container {
  display: inline-grid;
  grid-template-columns: repeat(4, 25px);
  grid-template-rows: auto 20px;
  justify-items: center;
  font-family: 'Roboto', sans-serif;
}
</style>
