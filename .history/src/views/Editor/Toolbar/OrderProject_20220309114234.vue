<template>
  <div class="multi-position-panel">
    <Tooltip :mouseLeaveDelay="0" :mouseEnterDelay="0.5" title="品牌LoGo">
      <Button block @click="drawText('@品牌名称')">品牌名称</Button>
    </Tooltip>
    <Tooltip :mouseLeaveDelay="0" :mouseEnterDelay="0.5" title="品牌LoGo">
      <Button block @click="drawShape('@品牌LoGo')">品牌LoGo</Button>
    </Tooltip>
    <Tooltip :mouseLeaveDelay="0" :mouseEnterDelay="0.5" title="项目名称">
      <Button block @click="drawText('@项目名称')">项目名称</Button>
    </Tooltip>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue'
import useCreateElement from '@/hooks/useCreateElement'

export default defineComponent({
  name: 'multi-position-panel',
  setup() {
    const { createTextElement, createImageElement } = useCreateElement()

    // 绘制文字范围
    const drawText = (lebel: string, keyName?: string, top?: number, left?: number) => {
      createTextElement({
        top: top || 0,
        left: left || 0,
        width: 250,
        height: 50,
      }, lebel, keyName)
    }

    // 绘制文字范围
    const drawShape = (keyName: string) => {
      createImageElement(
        'https://dali-pord.oss-cn-shanghai.aliyuncs.com/static/brandLogo.png',
        keyName,
      )
    }

    onMounted(() => {
      // getProjectDetails()
    }) 

    return {
      drawText,
      drawShape,
    }
  },
})
</script>

<style lang="scss" scoped>
.row {
  width: 100%;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
</style>