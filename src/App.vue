<template>
  <div id="app">
    <knob :size="50"/>
    <knob :size="75"/>
    <knob :size="100" />
  </div>
</template>

<script>
import knob from './components/knob'

export default {
  name: 'app',
  components: {
    knob
  },
  data: () => ({
  }),
}
</script>

<style lang="scss">
</style>
