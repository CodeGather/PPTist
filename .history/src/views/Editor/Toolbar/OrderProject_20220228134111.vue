<template>
  <div class="multi-position-panel">
    <Tooltip :mouseLeaveDelay="0" :mouseEnterDelay="0.5" title="品牌LoGo">
      <Button block @click="drawShape()">品牌LoGo</Button>
    </Tooltip>
    <Tooltip :mouseLeaveDelay="0" :mouseEnterDelay="0.5" title="项目名称">
      <Button block @click="drawText('项目名称')">项目名称</Button>
    </Tooltip>
    <Tooltip :mouseLeaveDelay="0" :mouseEnterDelay="0.5" title="店铺名称">
      <Button block @click="drawText('店铺名称')">店铺名称</Button>
    </Tooltip>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue'
import { ElementAlignCommand } from '@/types/edit'
import useCombineElement from '@/hooks/useCombineElement'
import useAlignActiveElement from '@/hooks/useAlignActiveElement'
import useAlignElementToCanvas from '@/hooks/useAlignElementToCanvas'
import useUniformDisplayElement from '@/hooks/useUniformDisplayElement'
import useCreateElement from '@/hooks/useCreateElement'

import axios from 'axios'
import { Policy } from '@/types/policy'
import { getSearchPathValue } from '@/utils/common'

export default defineComponent({
  name: 'multi-position-panel',
  setup() {
    const { canCombine, combineElements, uncombineElements } = useCombineElement()
    const { alignActiveElement } = useAlignActiveElement()
    const { alignElementToCanvas } = useAlignElementToCanvas()
    const { displayItemCount, uniformHorizontalDisplay, uniformVerticalDisplay } = useUniformDisplayElement()
    const { createTextElement, createLatexElement } = useCreateElement()

    // 多选元素对齐，需要先判断当前所选中的元素状态：
    // 如果所选元素为一组组合元素，则将它对齐到画布；
    // 如果所选元素不是组合元素或不止一组元素（即当前为可组合状态），则将这多个（多组）元素相互对齐。
    const alignElement = (command: ElementAlignCommand) => {
      if (canCombine.value) alignActiveElement(command)
      else alignElementToCanvas(command)
    }

    const getProjectDetails = () => {
      return new Promise<Policy>((resolve, reject) => {
        axios.get(`http://localhost:8090/jokui-dali-fast//pms/pmsproject/detail/${getSearchPathValue('projectId')}`, {
          headers: {
            'token': getSearchPathValue('token')
          }
        }).then(({ data }) => {
          resolve(data.data)
        }).catch(() => {
          reject()
        })
      })
    }

    // 绘制文字范围
    const drawText = (lebel: string) => {
      createTextElement({
        left: 0,
        top: 0,
        width: 250,
        height: 50,
      }, lebel)
    }

    // 绘制文字范围
    const drawShape = () => {
      createLatexElement({
        left: 0,
        top: 0,
        path: 'M 0 0 L 200 0 L 200 200 L 0 200 Z',
        width: 250,
        height: 50,
      })
    }

    onMounted(() => {
      getProjectDetails()
    }) 

    return {
      drawText,
      drawShape,
      canCombine,
      displayItemCount,
      combineElements,
      uncombineElements,
      uniformHorizontalDisplay,
      uniformVerticalDisplay,
      alignElement,
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