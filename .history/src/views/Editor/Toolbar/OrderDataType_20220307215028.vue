<template>
  <div class="multi-position-panel" v-if="orderPageData">
    <Dropdown 
      :trigger="['click']" 
      v-for="(item, index) in orderPageData.orderTypeDataTypeList" 
      :key="index" >
      <Button 
        size="small" 
        style="margin: 5px 5px 0 0;"
        >{{item.name}}</Button>
      <template #overlay>
       <div>
          <Menu>
          <MenuItem @click="creatElement(item, 'text', item.name)"><IconText /> 点位</MenuItem>
          <MenuItem v-for="(t, i) in item.photosText" :key="i" @click="creatElement(item, 'image', item.name + t.name)"><IconText /> {{t.name}}</MenuItem>
          <MenuItem v-for="(t, i) in item.videosText" :key="i" @click="creatElement(item, 'video', item.name + t.name)"><IconText /> {{t.name}}</MenuItem>
          <MenuItem v-for="(t, i) in item.optionsText" :key="i" @click="creatElement(item, 'text', item.name + t.name)"><IconText /> {{t.name}}</MenuItem>
        </Menu>

        <Menu>
          <MenuItem @click="creatElement(item, 'text', item.name)"><IconText /> 点位</MenuItem>
          <MenuItem v-for="(t, i) in item.photosText" :key="i" @click="creatElement(item, 'image', item.name + t.name)"><IconText /> {{t.name}}</MenuItem>
          <MenuItem v-for="(t, i) in item.videosText" :key="i" @click="creatElement(item, 'video', item.name + t.name)"><IconText /> {{t.name}}</MenuItem>
          <MenuItem v-for="(t, i) in item.optionsText" :key="i" @click="creatElement(item, 'text', item.name + t.name)"><IconText /> {{t.name}}</MenuItem>
        </Menu>
       </div>
      </template>
    </Dropdown>
  </div>
</template>

<script lang="ts">
import { MutationTypes, useStore } from '@/store'
import { computed, defineComponent } from 'vue'
import useCreateElement from '@/hooks/useCreateElement'
import { PrepareOrderInitData, OrderDataList } from '@/types/pageData'

export default defineComponent({
  name: 'order-data-type',
  setup() {
    const store = useStore()
    const orderPageData = computed<PrepareOrderInitData>(() => useStore().getters.getPageData)
    const { createTextElement, createVideoElement, createImageElement } = useCreateElement()

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
    
    const creatElement = (item: OrderDataList, type: string, more?: string) => {
      switch (type) {
        case 'text':
          drawText(more || item.name, more || '')
          // 需要处理点位的标识
          store.commit(MutationTypes.UPDATE_SLIDE, { keyName: item.name })
          break
        case 'image':
          drawShape(more || '')
          break
        default:
          drawVideo(more || '')
          break
      }
    }

    return {
      orderPageData,
      creatElement
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