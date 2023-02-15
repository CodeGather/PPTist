<template>
  <div class="multi-position-panel">
    <Tooltip :mouseLeaveDelay="0" :mouseEnterDelay="0.5" title="品牌LoGo">
      <Button block @click="drawShape('brandLogo')">品牌LoGo</Button>
    </Tooltip>
    <Tooltip :mouseLeaveDelay="0" :mouseEnterDelay="0.5" title="项目名称">
      <Button block @click="drawText('项目名称', 'projectName')">项目名称</Button>
    </Tooltip>
    <Tooltip :mouseLeaveDelay="0" :mouseEnterDelay="0.5" title="店铺名称">
      <Button block @click="drawText('店铺名称', 'shopName', 100, 100)">店铺名称</Button>
    </Tooltip>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue'
import useCreateElement from '@/hooks/useCreateElement'

import axios from 'axios'
import { Policy } from '@/types/policy'
import { getSearchPathValue } from '@/utils/common'

export default defineComponent({
  name: 'multi-position-panel',
  setup() {
    const { createTextElement, createImageElement } = useCreateElement()

    const getProjectDetails = () => {
      return new Promise<Policy>((resolve, reject) => {
        axios.get(`http://localhost:8090/jokui-dali-fast/pms/pmsproject/detail/${getSearchPathValue('projectId')}`, {
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
    const drawText = (lebel: string, keyName?: string, top?: number, left?: number) => {
      createTextElement({
        top: top || 0,
        left: left || 0,
        width: 250,
        keyName: keyName,
        height: 50,
      }, lebel)
    }

    // 绘制文字范围
    const drawShape = (keyName: string) => {
      createImageElement(
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADIAQMAAACXljzdAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAADUExURXZ2djcFI0EAAAAcSURBVFjD7cGBAAAAAMOg+VNf4QBVAQAAAAB8BhRQAAEAnyMVAAAAAElFTkSuQmCC',
        keyName: keyName,
      )
    }

    onMounted(() => {
      getProjectDetails()
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