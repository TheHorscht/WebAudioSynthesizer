<template>
  <div class="container">
    <input type="range" min="1" max="100" value="50"
           :width="width" :height="height" :orient="orient"
           class="slider"
           :style="style"
           list="tickmarks">
  </div>
</template>
<script>
import clamp from 'clamp'

export default {
  name: 'slider',
  props: {
    width: {
      type: Number,
      default: 40,
    },
    height: {
      type: Number,
      default: 200,
    },
    min: {
      type: Number,
      default: 0,
    },
    max: {
      type: Number,
      default: 100,
    },
    value: {
      type: Number,
      default: 0,
    },
    tickCount: {
      type: Number,
      default: 10,
    },
  },
  data: () => ({
    currentValue: 0,
  }),
  mounted () {
    this.currentValue = this.value
  },
  methods: {
    pointerDown (e) {
      e.target.setPointerCapture(e.pointerId)
    },
    pointerUp (e) {
      e.target.releasePointerCapture(e.pointerId)
    },
    pointerMove (e) {
      if (e.target.hasPointerCapture(e.pointerId)) {
        const newValue = this.currentValue - e.movementY * 0.5
        this.currentValue = clamp(newValue, this.min, this.max)
      }
    },
  },
  computed: {
    p: self => self.currentValue / self.max,
    line () {
      /*       const angle = deg2rad(180 + 45 + (this.p * 270) - 90)
      return {
        x1: 50 + Math.cos(angle) * 30,
        y1: 50 + Math.sin(angle) * 30,
        x2: 50 + Math.cos(angle) * 35,
        y2: 50 + Math.sin(angle) * 35,
      } */
      return {}
    },
    ticks () {
      const ticks = []
      for (let i = 0; i < this.tickCount; i++) {

      }
      return ticks
    },
    orient () {
      return this.width > this.height ? 'horizontal' : 'vertical'
    },
    style () {
      return {
        width: `${this.width}px`,
        height: `${this.height}px`
      }
    }
  },
  watch: {
    currentValue (newValue, oldValue) {
      this.$emit('input', newValue)
    }
  }
}
</script>
<style lang="scss" scoped>
.container {
  display: inline-block;
}
svg {
  user-select: none;
  overflow: visible;
  line {
    stroke:white;
    stroke-width: 5;
    pointer-events: none;
    stroke-linecap: round;
  }
  .tickLine {
    stroke:black;
    stroke-width: 3;
  }
}
input[type=range][orient=vertical]
{
  writing-mode: bt-lr; /* IE */
  -webkit-appearance: slider-vertical; /* WebKit */
  width: 16px;
  height: 80px;
}
</style>
