<template>
  <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
    <!-- White keys -->
    <rect v-for="i in 7" :key="'whiteKey'+i"
          :class="['white-key',isWhiteKeyDown_[7-i] ? 'white-key-down' : '']" vector-effect="non-scaling-stroke"
          x="1" :y="[0.1, 12.5, 29.5, 46.5, 58.25, 71, 88][i-1]"
          :height="[12.5, 17, 17, 11.75, 12.75, 17, 12][i-1]"
          @pointerdown="onWhiteKeyDown(7-i, $event)"
          @pointerup="onWhiteKeyUp(7-i, $event)" />
    <!-- Black keys -->
    <template v-for="(v, i) in [2, 4, 6, 9, 11]">
      <rect x="0" :y="(v-1) * (100 / 12)"
            width="65%" height="8.33%"
            fill="black" :key="'blackkey'+i"
            :class="[isBlackKeyDown_[4-i] ? 'black-key-down' : '']"
            @pointerdown="onBlackKeyDown(4-i, $event)"
            @pointerup="onBlackKeyUp(4-i, $event)" />
    </template>
  </svg>
</template>
<script>
export default {
  name: 'VueKeyboard',
  data: () => ({
    isWhiteKeyDown_: {},
    isBlackKeyDown_: {},
  }),
  mounted() {
  },
  methods: {
    onWhiteKeyDown(keyNumber, e) {
      e.target.setPointerCapture(e.pointerId);
      const note = {
        id: 'whiteKey' + keyNumber,
        pitch: 60 + [0,2,4,5,7,9,11][keyNumber],
      };
      this.$set(this.isWhiteKeyDown_, keyNumber, true);
      this.$emit('noteon', note);
    },
    onWhiteKeyUp(keyNumber, e) {
      e.target.releasePointerCapture(e.pointerId);
      const note = {
        id: 'whiteKey' + keyNumber,
        pitch: 60 + [0,2,4,5,7,9,11][keyNumber],
      };
      this.$set(this.isWhiteKeyDown_, keyNumber, false);
      this.$emit('noteoff', note);
    },
    onBlackKeyDown(keyNumber, e) {
      console.log(keyNumber)
      e.target.setPointerCapture(e.pointerId);
      const note = {
        id: 'blackKey' + keyNumber,
        pitch: 60 + [2, 4, 7, 9, 11][keyNumber] - 1,
      };
      this.$set(this.isBlackKeyDown_, keyNumber, true);
      this.$emit('noteon', note);
    },
    onBlackKeyUp(keyNumber, e) {
      e.target.releasePointerCapture(e.pointerId);
      const note = {
        id: 'blackKey' + keyNumber,
        pitch: 60 + [2, 4, 7, 9, 11][keyNumber] - 1,
      };
      this.$set(this.isBlackKeyDown_, keyNumber, false);
      this.$emit('noteoff', note);
    }
  },
}
</script>
<style lang="scss" scoped>
svg {
  shape-rendering: crispEdges;
}
.white-key {
  width: 100%;
  fill: white;
  stroke: black;
  stroke-width: 0.5;
  &-down {
    fill: red;
  }
}
.black-key-down {
  fill: red;
}
</style>
