<template>
  <div class="multi-position-panel">
    <ButtonGroup class="row">
    </ButtonGroup>
      <Tooltip :mouseLeaveDelay="0" :mouseEnterDelay="0.5" title="品牌LoGo">
        <Button @click="alignElement('top')">品牌LoGo</Button>
      </Tooltip>
      <Tooltip :mouseLeaveDelay="0" :mouseEnterDelay="0.5" title="项目名称">
        <Button @click="alignElement('vertical')">项目名称</Button>
      </Tooltip>
      <Tooltip :mouseLeaveDelay="0" :mouseEnterDelay="0.5" title="店铺名称">
        <Button @click="alignElement('bottom')">店铺名称</Button>
      </Tooltip>

    <Divider />

    <ButtonGroup class="row">
      <Button :disabled="!canCombine" @click="combineElements()" style="flex: 1;"><IconGroup style="margin-right: 3px;" />组合</Button>
      <Button :disabled="canCombine" @click="uncombineElements()" style="flex: 1;"><IconUngroup style="margin-right: 3px;" />取消组合</Button>
    </ButtonGroup>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue'
import { ElementAlignCommand } from '@/types/edit'
import useCombineElement from '@/hooks/useCombineElement'
import useAlignActiveElement from '@/hooks/useAlignActiveElement'
import useAlignElementToCanvas from '@/hooks/useAlignElementToCanvas'
import useUniformDisplayElement from '@/hooks/useUniformDisplayElement'

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

    onMounted(() => {
      getProjectDetails()
    }) 

    return {
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