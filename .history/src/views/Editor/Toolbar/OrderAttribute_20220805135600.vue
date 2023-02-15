<template>
  <div class="multi-position-panel" v-if="orderPageData">
    <Dropdown 
      :trigger="['click']" 
      v-for="(item, index) in orderPageData.orderAttributeValueList" 
      :key="index" >
      <Button 
        size="small" 
        style="margin: 5px 5px 0 0;"
        >{{item.attrName}}</Button>
      <template #overlay>
        <Menu>
          <MenuItem @click="creatElement(item, 'text', 'pointKey')"><IconText /> 插文本</MenuItem>
          <MenuItem @click="creatElement(item, 'text')"><IconText /> 文件名</MenuItem>
        </Menu>
      </template>
    </Dropdown>
  </div>
</template>

<script lang="ts">
import { MutationTypes, useStore } from '@/store'
import { computed, defineComponent } from 'vue'
import { Slide } from '@/types/slides'
import useCreateElement from '@/hooks/useCreateElement'
import { PrepareOrderInitData, OrderAttributeValueList, PptxDataConfig } from '@/types/pageData'

export default defineComponent({
  name: 'order-attribute',
  setup() {
    const store = useStore()
    const currentSlide = computed<Slide>(() => store.getters.currentSlide)
    const { createTextElement, createTableElement } = useCreateElement()
    const orderPageData = computed<PrepareOrderInitData>(() => useStore().getters.getPageData)

    const fileDataConfig = computed<PptxDataConfig>(() => store.getters.getReportData)
    const creatElement = (item: OrderAttributeValueList, type: string, more?: string) => {
      switch (type) {
        case 'text':
          if (item.attrCode === 'material') {
            createTable()
            const header = ['序号', '点位', '物料', '数量', '记录问题', '记录问题图片']
            currentSlide.value.elements = currentSlide.value.elements.map(el => {
              if ('table' === el.type) {
                header.forEach((name, index) => {
                  el.data[0][index].text = name
                })
                el.top = 132
                el.left = 44.99
                el.width = 910
              }
              return el
            })
            currentSlide.value.keyName = 'material'
            console.log(currentSlide.value)
            store.commit(MutationTypes.SET_DISABLE_HOTKEYS_STATE, true)
            // store.commit(MutationTypes.UPDATE_SLIDE, currentSlide)
            // store.commit(MutationTypes.UPDATE_SLIDE, { keyName: '服务属性……统一点位' })
          } 
          else {
            if (more) {
              drawText(`@${item.attrName}`, item.attrName)
            }
            else {
              store.commit(MutationTypes.UPDATE_FILEDATA, { fileName: fileDataConfig.value.fileName + item.attrName })
            }
          }
          // 需要处理点位的标识
          break
        default:
          break
      }
    }

    // 绘制table范围
    const createTable = () => {
      createTableElement(5, 6)
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