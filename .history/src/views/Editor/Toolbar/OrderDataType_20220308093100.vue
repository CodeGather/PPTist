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
        <Menu size="small" mode="inline">
          <MenuItem @click="creatElement(item, 'text', item.name)"><IconText /> 点位</MenuItem>
          <SubMenu key="photosText" v-if="item.photosText.length > 0">
            <template #title><IconPicture /> 图片</template>
            <SubMenu v-for="(t, i) in item.photosText" :key="'children_' + i" :title="t.name">
              <MenuItem @click="creatElement(item, 'text', item.name+ t.name)"><IconText /> 名称</MenuItem>
              <MenuItem @click="creatElement(item, 'image' )"><IconPicture /> 图片</MenuItem>
            </SubMenu>
          </SubMenu>
           <SubMenu key="videosText" v-if="item.videosText.length > 0">
             <template #title><IconVideoTwo /> 视频</template>
            <SubMenu v-for="(t, i) in item.videosText" :key="'children_' + i" :title="t.name">
              <MenuItem @click="creatElement(item, 'text', item.name+ t.name)"><IconText /> 名称</MenuItem>
              <MenuItem @click="creatElement(item, 'video' )"><IconVideoTwo /> 视频</MenuItem>
            </SubMenu>
          </SubMenu>
           <SubMenu key="optionsText" v-if="item.optionsText.length > 0">
             <template #title><IconText /> 选项</template>
            <SubMenu v-for="(t, i) in item.optionsText" :key="'children_' + i" :title="t.name">
              <MenuItem @click="creatElement(item, 'text', item.name+ t.name)"><IconText /> 名称</MenuItem>
              <MenuItem @click="creatElement(item, 'select' )"><IconPicture /> 选项</MenuItem>
            </SubMenu>
          </SubMenu>
        </Menu>
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