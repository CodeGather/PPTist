<template>
  <div class="hotkey-doc">
    <div style="display: flex;justify-content: space-between;" v-for="(item,index) in list" :key="item.id">
        <div>{{index + 1}}、{{ item.shopName }} </div>
        <Button class="color-btn" :type="orderStore.activte.id===item.id?'primary':undefined" @click="switchOrder(item)">
          更换
        </Button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, ref, watch, type CSSProperties } from 'vue'
import Button from '@/components/Button.vue'
import { useSnapshotStore, useSlidesStore, useOrderStore } from '@/store'
const list = computed(() => {
  return orderStore.list
})


const slidesStore = useSlidesStore()
const snapshotStore = useSnapshotStore()
const orderStore = useOrderStore()

import PPTXUtil from '@/utils/formatOrderData'

function switchOrder(item:any){
  PPTXUtil.init(orderStore.reportData, {}).startDownloadPPTX([item], (status:any) => {
    console.log(status)
    orderStore.setActivte(item)
    slidesStore.setSlides(status[0].list)
    slidesStore.setTitle(status[0].name)
  })
}
</script>

<style lang="scss" scoped>
</style>