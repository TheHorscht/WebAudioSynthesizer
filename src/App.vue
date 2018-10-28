<template>
  <div id="app">
    <knob :size="50"/>
    <knob :size="75"/>
    <knob :size="100" />
    <div class="slider-container">
      <vue-slider v-bind="sliderConfig.vertical"/>
      <vue-slider v-bind="sliderConfig.vertical" ref="vert"/>
      <vue-slider v-bind="sliderConfig.horizontal" />
    </div>
  Boop
  </div>
</template>

<script>
import knob from './components/knob'
import vueSlider from 'vue-slider-component'
import sliderConfig from './slider-config'

export default {
  name: 'app',
  components: {
    knob,
    vueSlider,
  },
  data: () => ({
    sliderConfig
  }),
  mounted () {
    this.$nextTick(() => {
      this.$refs.vert.refresh()
    })
  },
}
</script>

<style lang="scss">
.slider-container {
  display: grid;
  grid-template-columns: 20px 20px;
  grid-template-rows: auto auto;
}
</style>
