<template>
  <div :class="['scrollbar-container', `scrollbar-container-${orientation}`]" ref="scrollbarContainer">
    <div :class="['handle', `handle-${orientation}`, mode === MODES.move ? 'handle-active' : '']" ref="handle"
         @pointerdown="onPointerDown"
         @pointerup="onPointerUp"
         @pointermove="onPointerMove"
         :style="handleStyle">
         <div :class="['resize-handle', `resize-handle-${orientation}`]" ref="resizeStart"></div>
         <div :class="['resize-handle', `resize-handle-${orientation}`]" ref="resizeEnd"></div>
    </div>
  </div>
</template>
<script>
import clamp from 'clamp'

const MODES = {
  none: 0,
  move: 1,
  resizeStart: 2,
  resizeEnd: 3,
}

export default {
  name: 'ZoomScrollbar',
  props: {
    orientation: {
      type: String,
      default: 'horizontal',
      validator: value => ['horizontal', 'vertical'].indexOf(value) !== -1
    },
    min: {
      type: Number,
      default: 0,
    },
    max: {
      type: Number,
      default: 1,
    },
    low: {
      type: Number,
      default: 0.25,
    },
    high: {
      type: Number,
      default: 0.75,
    },
  },
  data: () => ({
    MODES,
    mode: MODES.none,
  }),
  methods: {
    onPointerDown (e) {
      if(e.target === this.$refs['handle']) {
        this.mode = MODES.move;
      } else if(e.target === this.$refs.resizeStart) {
        this.mode = MODES.resizeStart;
      } else if(e.target === this.$refs.resizeEnd) {
        this.mode = MODES.resizeEnd;
      }
      e.target.setPointerCapture(e.pointerId)
    },
    onPointerUp (e) {
      e.target.releasePointerCapture(e.pointerId)
      this.mode = MODES.none;
    },
    onPointerMove (e) {
      if (e.target.hasPointerCapture(e.pointerId)) {
        let d = this.orientation === 'horizontal'
                ? e.movementX / (this.width / (this.max - this.min))
                : e.movementY / (this.height / (this.max - this.min));
        (({
          [MODES.move]: () => {
            let newLow, newHigh;
            if(this.low + d < this.min) {
              newLow = this.min;
              newHigh = this.high - this.low;
            } else if(this.high + d > this.max) {
              newLow = this.low + (this.max - this.high);
              newHigh = this.max;
            } else {
              newLow = this.low + d;
              newHigh = this.high + d;
            }
            this.$emit('lowChanged', newLow);
            this.$emit('highChanged', newHigh);
          },
          [MODES.resizeStart]: () => {
            let newVal;
            if(this.low + d < this.min) {
              newVal = this.min;
            } else if(this.high - (this.low + d) > this.minDistance) {
              newVal = this.low + d;
            } else {
              newVal = this.high - this.minDistance;
            }
            this.$emit('lowChanged', newVal);
          },
          [MODES.resizeEnd]: () => {
            let newVal;
            if(this.high + d > this.max) {
              newVal = this.max;
            } else if((this.high + d) - this.low > this.minDistance) {
              newVal = this.high + d;
            } else {
              newVal = this.low + this.minDistance;
            }
            this.$emit('highChanged', newVal);
          },
        })[this.mode] || (() => null))();
      }
    },
  },
  computed: {
    width: self => parseInt(window.getComputedStyle(self.$refs.scrollbarContainer).width, 10),
    height: self => parseInt(window.getComputedStyle(self.$refs.scrollbarContainer).height, 10),
    handleStyle: self => {
      const low = `calc(${((self.low - self.min) / (self.max - self.min)) * 100}% - 1px)`;
      const high = `calc(${(self.high - self.low) / (self.max - self.min) * 100}% + 2px)`;
      return {
        horizontal: { left: low, width: high, },
        vertical: { top: low, height: high, },
      }[self.orientation];
    },
    minDistance: self => (self.max - self.min) * 0.1,
  }
}
</script>
<style lang="scss" scoped>
.scrollbar-container {
  border: 1px solid black;
  background: #484848;
  &-horizontal {
  }
  &-vertical {
  }
}
.handle {
  display: flex;
  justify-content: space-between;
  position: relative;
  background: #a0a0a0;
  box-sizing: border-box;
  transition: background 100ms linear;
  &-active {
    background: #8a8a8a;
  }
  &-horizontal {
    flex-direction: row;
    width: 20px;
    height: 100%;
    border-left: 1px solid black;
    border-right: 1px solid black;
  }
  &-vertical {
    flex-direction: column;
    width: 100%;
    height: 20px;
    border-top: 1px solid black;
    border-bottom: 1px solid black;
  }
}
.resize-handle {
  position: relative;
  &-horizontal {
    cursor: ew-resize;
    width: 10px;
    height: 100%;
    &:first-child {
      left: -5px;
      &::before {
        content: '';
        position: absolute;
        width: 100%;
        height: 100%;
        left: 2px;
        background: black;
        clip-path: polygon(100% 20%, 50% 50%, 100% 80%);
      }
    }
    &:last-child {
      right: -5px;
      &::before {
        content: '';
        position: absolute;
        width: 100%;
        height: 100%;
        right: 2px;
        background: black;
        clip-path: polygon(0% 20%, 50% 50%, 0% 80%);
      }
    }
  }
  &-vertical {
    cursor: ns-resize;
    height: 10px;
    width: 100%;
    &:first-child {
      top: -5px;
      &::before {
        content: '';
        position: absolute;
        width: 100%;
        height: 100%;
        top: 2px;
        background: black;
        clip-path: polygon(20% 100%, 50% 50%, 80% 100%);
      }
    }
    &:last-child {
      bottom: -5px;
      &::before {
        content: '';
        position: absolute;
        width: 100%;
        height: 100%;
        bottom: 2px;
        background: black;
        clip-path: polygon(20% 0%, 50% 50%, 80% 0%);
      }
    }
  }
  &:first-child {
    align-self: start;
  }
  &:last-child {
    align-self: end;
  }
}
</style>


