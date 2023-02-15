<template>
  <div class="order-type" v-if="orderPageData">
    <Dropdown 
      :trigger="['click']" 
      v-for="(item, index) in orderPageData.orderTypeList" 
      :key="index" >
      <Button 
        size="small" 
        style="margin: 5px 5px 0 0;"
        ><IconSixPoints /> {{item.name}}</Button>
      <template #overlay>
         <Menu size="small">
          <MenuItem @click="creatElement(item, 'text', item.name)"><IconText /> 点位</MenuItem>
          
          <template v-if="item.serviceIds">
            <SubMenu v-for="(child, i) in item.serviceList" :key="'service_' + i">
              <template #title>{{child.name}}</template>
              <MenuItem @click="creatElement(item, 'text', child.name, '')"><IconText /> 名称</MenuItem>
              <SubMenu key="photosText" v-if="child.photosText.length > 0">
                <template #title><IconPicture /> 图片</template>
                <MenuItem v-for="(t, i) in child.photosText" :key="'photosText_' + i" @click="creatElement(item, 'image', child.name, t.name)"><IconPicture /> {{t.name}}</MenuItem>
              </SubMenu>

              <SubMenu key="videosText" v-if="child.videosText.length > 0">
                <template #title><IconVideoTwo /> 视频</template>
                <MenuItem v-for="(t, i) in child.videosText" :key="'videosText_' + i" @click="creatElement(item, 'video', child.name, t.name)"><IconVideoTwo /> {{t.name}}</MenuItem>
              </SubMenu>

              <SubMenu key="optionsText" v-if="child.optionsText.length > 0">
                <template #title><IconText /> 选项</template>
                <MenuItem v-for="(t, i) in child.optionsText" :key="'optionsText_' + i" @click="creatElement(item, 'select', child.name, t.name)"><IconText /> {{t.name}}</MenuItem>
              </SubMenu>
            </SubMenu>
          </template>
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

    const creatElement = (item: OrderDataList, type: string, child?: string, more?: string) => {
      drawText(more || child || item.name, more || child || item.name)
      // 需要处理点位的标识
      store.commit(MutationTypes.UPDATE_SLIDE, { keyName: `服务属性……${item.name}……${child}` })
      switch (type) {
        case 'image':
          drawShape(more || child || item.name)
          break
        default:
          drawVideo(more || child || item.name)
          break
      }
    }

    // 绘制图片范围
    const drawShape = (keyName: string) => {
      createImageElement(
        'https://dali-pord.oss-cn-shanghai.aliyuncs.com/static/image.png',
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
        'https://dali-pord.oss-cn-shanghai.aliyuncs.com/static/image.png',
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