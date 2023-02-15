<template>
  <div class="multi-position-panel" v-if="orderPageData">
    <Button 
      size="small" 
      style="margin: 5px 5px 0 0;"
      >服务库名</Button>
    <Dropdown 
      :trigger="['click']" 
      v-for="(item, index) in orderPageData.orderTypeDataTypeList" 
      :key="index" >
      <Button 
        size="small" 
        style="margin: 5px 5px 0 0;"
        >{{item.name}}</Button>
      <template #overlay>
        <Menu size="small">
          <MenuItem @click="creatElement(item, 'text', item.name)"><IconText /> 点位</MenuItem>
          <SubMenu key="photosText" v-if="item.photosText.length > 0">
            <template #title><IconPicture /> 图片</template>
            <MenuItem v-for="(t, i) in item.photosText" :key="'children_' + i" @click="creatElement(item, 'image', t.name)"><IconPicture /> {{t.name}}</MenuItem>
          </SubMenu>
          <SubMenu key="videosText" v-if="item.videosText.length > 0">
            <template #title><IconVideoTwo /> 视频</template>
            <MenuItem v-for="(t, i) in item.videosText" :key="'children_' + i" @click="creatElement(item, 'video', t.name)"><IconVideoTwo /> {{t.name}}</MenuItem>
          </SubMenu>
          <SubMenu key="optionsText" v-if="item.optionsText.length > 0">
            <template #title><IconText /> 选项</template>
            <MenuItem v-for="(t, i) in item.optionsText" :key="'children_' + i" @click="creatElement(item, 'select', t.name)"><IconPicture /> {{t.name}}</MenuItem>
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
    const drawShape = (keyName: string, position?: any) => {
      createImageElement(
        'https://dali-pord.oss-cn-shanghai.aliyuncs.com/static/image.png',
        keyName,
        position
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
        'https://dali-pord.oss-cn-shanghai.aliyuncs.com/static/image.png',
        keyName,
      )
    }
    
    const creatElement = (item: OrderDataList, type: string, more?: string) => {
      drawText(`<p style="text-align: center;">${more || item.name}</p>`, more || '')
      // 需要处理点位的标识
      store.commit(MutationTypes.UPDATE_SLIDE, { keyName: `服务库……${item.name}` })
      switch (type) {
        case 'image':
          drawShape(more || '')
          break
        case 'video':
          drawVideo(more || '')
          break
        default:
          drawText('点位名称', 'pointName', 1, 1)
          drawText(`<p style="text-align: center;">服务库名`, '服务库名', 0, 100)
          drawShape('服务库名', {left: 100})

          drawText(`<p style="text-align: center;">施工指引</p>`, '施工指引', 0, 280)
          drawShape('施工指引', {left: 280})
          // 需要处理点位的标识
          store.commit(MutationTypes.UPDATE_SLIDE, { keyName: '服务库……统一点位' })
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