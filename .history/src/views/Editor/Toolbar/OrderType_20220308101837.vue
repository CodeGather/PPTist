<template>
  <div class="order-type" v-if="orderPageData">
    <Dropdown 
      :trigger="['click']" 
      v-for="(item, index) in orderPageData.orderTypeList" 
      :key="index" >
      <Button 
        size="small" 
        style="margin: 5px 5px 0 0;"
        >{{item.name}}</Button>
      <template #overlay>
        <Menu>
          <MenuItem @click="creatElement(item, 'text', 'childrenName')"><IconText /> 点位</MenuItem>
          <MenuItem @click="creatElement(item, 'text', 'photoName')"><IconText /> 点库</MenuItem>
          <MenuItem @click="creatElement(item, 'image' )"><IconPicture /> 图片</MenuItem>
          <MenuItem @click="creatElement(item, 'video' )"><IconVideoTwo /> 视频</MenuItem>
        </Menu>
      </template>
    </Dropdown>
  </div>
</template>

<script lang="ts">
import { MutationTypes, useStore } from '@/store'
import useCreateElement from '@/hooks/useCreateElement'
import { computed, defineComponent } from 'vue'
import { PrepareOrderInitData, OrderDataList } from '@/types/pageData'


export default defineComponent({
  name: 'order-type',
  setup() {
    const store = useStore()
    const { createTextElement, createVideoElement, createImageElement } = useCreateElement()
    const orderPageData = computed<PrepareOrderInitData>(() => useStore().getters.getPageData)

    const creatElement = (item: OrderDataList, type: string, more?: string) => {
      switch (type) {
        case 'text':
          drawText(more || item.name, 'pointKey')
          // 需要处理点位的标识
          store.commit(MutationTypes.UPDATE_SLIDE, { keyName: `服务属性-${item.name}` })
          break
        case 'image':
          drawShape('pointKey')
          break
        default:
          drawVideo('pointKey')
          break
      }
    }

    // 绘制图片范围
    const drawShape = (keyName: string) => {
      createImageElement(
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADIAQMAAACXljzdAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAADUExURXZ2djcFI0EAAAAcSURBVFjD7cGBAAAAAMOg+VNf4QBVAQAAAAB8BhRQAAEAnyMVAAAAAElFTkSuQmCC',
        keyName,
      )
    }

    // 绘制文字范围
    const drawText = (lebel: string, keyName?: string, top?: number, left?: number) => {
      createTextElement({
        top: top || 0,
        left: left || 0,
        width: 250,
        height: 50,
      }, lebel, keyName)
    }

    // 绘制视频
    const drawVideo = (lebel: string, keyName?: string) => {
      createVideoElement(
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADIAQMAAACXljzdAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAADUExURXZ2djcFI0EAAAAcSURBVFjD7cGBAAAAAMOg+VNf4QBVAQAAAAB8BhRQAAEAnyMVAAAAAElFTkSuQmCC',
        keyName,
      )
    }

    return {
      orderPageData,
      creatElement
    }
  },
})
</script>

<style lang="scss" scoped>
.order-type {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-evenly;
}
</style>