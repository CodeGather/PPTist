<template>
  <div style="display: flex;">
    <div class="filename">
      <div 
        class="resize-handler"
        @mousedown="$event => resize($event)"
      ></div>
      <textarea
        :value="fileDataConfig.fileName"
        placeholder="请输入PPTX文件名称规则"
        @input="$event => handleInput($event)"
      ></textarea>
    </div>
    <divider type="vertical" style="height: 60px;
    background-color: transparent;
    border-color: #7cb305;"/>
    <div class="filename">
      <div 
        class="resize-handler"
        @mousedown="$event => resize($event)"
      ></div>
      <textarea
        :value="fileDataConfig.name"
        placeholder="请输入报告名称"
        @input="$event => handleInput($event)"
      ></textarea>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { MutationTypes, useStore } from '@/store'
import { Slide } from '@/types/slides'

export default defineComponent({
  name: 'remark',
  emits: ['update:height'],
  props: {
    height: {
      type: Number,
      required: true,
    },
  },
  setup(props, { emit }) {
    const store = useStore()
    const fileDataConfig = computed(() => store.state.fileDataConfig)

    const handleInput = (e: InputEvent) => {
      const value = (e.target as HTMLTextAreaElement).value
      store.commit(MutationTypes.UPDATE_FILEDATA, { fileName: value })
    }

    const resize = (e: MouseEvent) => {
      let isMouseDown = true
      const startPageY = e.pageY
      const originHeight = props.height

      document.onmousemove = e => {
        if (!isMouseDown) return

        const currentPageY = e.pageY

        const moveY = currentPageY - startPageY
        let newHeight = -moveY + originHeight

        if (newHeight < 40) newHeight = 40
        if (newHeight > 120) newHeight = 120

        emit('update:height', newHeight)
      }

      document.onmouseup = () => {
        isMouseDown = false
        document.onmousemove = null
        document.onmouseup = null
      }
    }

    return {
      fileDataConfig,
      handleInput,
      resize,
    }
  },
})
</script>

<style lang="scss" scoped>
.filename {
  width: 100%;
  position: relative;
  border-bottom: 1px solid $borderColor;
  background-color: $lightGray;

  textarea {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    resize: none;
    border: 0;
    outline: 0;
    padding: 8px;
    font-size: 12px;
    background-color: transparent;
    line-height: initial;

    @include absolute-0();
  }
}
.resize-handler {
  height: 7px;
  position: absolute;
  top: -3px;
  left: 0;
  right: 0;
  cursor: n-resize;
  z-index: 2;
}
</style>