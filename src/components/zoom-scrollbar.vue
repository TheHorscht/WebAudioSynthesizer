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
    }
  },
  data: () => ({
    start: 0,
    end: 0.5,
    minDistance: 0.1,
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
                ? e.movementX / this.width
                : e.movementY / this.height;
        (({
          [MODES.move]: () => {
            if(this.start + d < 0) {
              this.end -= this.start;
              this.start = 0;
            } else if(this.end + d > 1) {
              this.start += 1 - this.end;
              this.end = 1;
            } else {
              this.start += d;
              this.end += d;
            }
          },
          [MODES.resizeStart]: () => {
            if(this.start + d < 0) {
              this.start = 0;
            } else if(this.end - (this.start + d) > this.minDistance) {
              this.start += d;
            } else {
              this.start = this.end - this.minDistance;
            }
          },
          [MODES.resizeEnd]: () => {
            if(this.end + d > 1) {
              this.end = 1;
            } else if((this.end + d) - this.start > this.minDistance) {
              this.end += d;
            } else {
              this.end = this.start + this.minDistance;
            }
          },
        })[this.mode] || (() => null))();
      }
    },
  },
  computed: {
    width: self => parseInt(window.getComputedStyle(self.$refs.scrollbarContainer).width, 10),
    height: self => parseInt(window.getComputedStyle(self.$refs.scrollbarContainer).height, 10),
    handleStyle: self => ({
      horizontal: {
        left: `calc(${self.start * 100}% - 1px)`,
        width: `calc(${(self.end - self.start) * 100}% + 2px)`,
      },
      vertical: {
        top: `calc(${self.start * 100}% - 1px)`,
        height: `calc(${(self.end - self.start) * 100}% + 2px)`,
      },
    }[self.orientation]),
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


