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
         <Menu size="small">
          <MenuItem @click="creatElement(item, 'text', item.name)"><IconText /> 点位</MenuItem>
          <SubMenu key="photosText" v-if="item.photosText && item.photosText.length > 0">
            <template #title><IconPicture /> 图片</template>
            <SubMenu v-for="(t, i) in item.photosText" :key="'children_' + i" :title="t.name">
              <MenuItem @click="creatElement(item, 'text', t.name)"><IconText /> 名称</MenuItem>
              <MenuItem @click="creatElement(item, 'image', t.name)"><IconPicture /> 图片</MenuItem>
            </SubMenu>
          </SubMenu>
           <SubMenu key="videosText" v-if="item.videosText && item.videosText.length > 0">
            <template #title><IconVideoTwo /> 视频</template>
            <SubMenu v-for="(t, i) in item.videosText" :key="'children_' + i" :title="t.name">
              <MenuItem @click="creatElement(item, 'text', t.name)"><IconText /> 名称</MenuItem>
              <MenuItem @click="creatElement(item, 'video', t.name)"><IconVideoTwo /> 视频</MenuItem>
            </SubMenu>
          </SubMenu>
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
          drawText(item.name, item.name)
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
        'https://dali-pord.oss-cn-shanghai.aliyuncs.com/static/brandLogo.png',
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
        'https://dali-pord.oss-cn-shanghai.aliyuncs.com/static/brandLogo.png',
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