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
        <Menu>
          <MenuItem @click="creatElement(item, 'text', item.name)"><IconText /> 点位</MenuItem>
          <MenuItem @click="creatElement(item, 'image' )"><IconPicture /> 图片</MenuItem>
          <MenuItem @click="creatElement(item, 'video' )"><IconVideoTwo /> 视频</MenuItem>
        </Menu>
      </template>
    </Dropdown>
  </div>
</template>

<script lang="ts">
import { useStore } from '@/store'
import { computed, defineComponent } from 'vue'
import { PrepareOrderInitData } from '@/types/pageData'

export default defineComponent({
  name: 'order-data-type',
  setup() {
    const orderPageData = computed<PrepareOrderInitData>(() => useStore().getters.getPageData)
    return {
      orderPageData
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