<template>
  <template v-if="slides.length">
    <Screen v-if="screening" />
    <Editor v-else-if="_isPC" />
    <Mobile v-else />
  </template>
  <FullscreenSpin :tip="`数据初始化中，请稍等 ...${orderStore.progress}%`" v-else  loading :mask="false" />
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useScreenStore, useMainStore, useSnapshotStore, useSlidesStore, useOrderStore } from '@/store'
import { LOCALSTORAGE_KEY_DISCARDED_DB } from '@/configs/storage'
import { deleteDiscardedDB } from '@/utils/database'
import { isPC } from '@/utils/common'
import type { Slide } from '@/types/slides'
import message from './utils/message'
import api from '@/services'

import Editor from './views/Editor/index.vue'
import Screen from './views/Screen/index.vue'
import Mobile from './views/Mobile/index.vue'
import FullscreenSpin from '@/components/FullscreenSpin.vue'

const _isPC = isPC()

const mainStore = useMainStore()
const slidesStore = useSlidesStore()
const snapshotStore = useSnapshotStore()
const orderStore = useOrderStore()
const { databaseId } = storeToRefs(mainStore)
const { slides } = storeToRefs(slidesStore)
const { screening } = storeToRefs(useScreenStore())

if (import.meta.env.MODE !== 'development') {
  window.onbeforeunload = () => false
}

import PPTXUtil from '@/utils/formatOrderData'
onMounted(async () => {
  const params:any = orderStore.getParams()
  if (params.token && params.reportId) {
    Promise.all([
      orderStore.getReportData(params.reportId),
      orderStore.getOrderList(params)
    ]).then(async (list: any[]) => {
      console.log(list)
      if (params.orderId) {
        const findData = list[1].find((item:any) => params.orderId === item.id)
        PPTXUtil.init(list[0], {}).startDownloadPPTX([findData], (status:any) => {
          console.log(status)
          orderStore.setActivte(findData)
          slidesStore.setSlides(status[0].list)
          slidesStore.setTitle(status[0].name)
        })
      } else {
        slidesStore.setSlides([{
          id: crypto.randomUUID(),
          elements: []
        }])
      }
      await deleteDiscardedDB()
      snapshotStore.initSnapshotDatabase()
    }).catch((error) => {
      message.error(error, { duration: 0, closable: true })
    })
  }
  // if (location.hostname === '127.0.0.1') {
  //   // message.error('本地开发请访问 http://127.0.0.1:5173，否则不保证数据可靠性', { duration: 0, closable: true })
  //   api.getMockData('slides').then((slides: Slide[]) => {
  //     PPTXUtil.init(reportEntity, {}).startDownloadPPTX([data], (status:any) => {
  //       // slides = slides.concat(status)
  //       console.log(status)
  //       slidesStore.setSlides(status[0].list)
  //       slidesStore.setTitle(status[0].name)
  //     })
  //   })
  // }
  // else {
  //   api.getFileData('slides').then((slides: Slide[]) => {
  //     slidesStore.setSlides(slides)
  //   })
  // }

  await deleteDiscardedDB()
  snapshotStore.initSnapshotDatabase()
})

// 应用注销时向 localStorage 中记录下本次 indexedDB 的数据库ID，用于之后清除数据库
window.addEventListener('unload', () => {
  const discardedDB = localStorage.getItem(LOCALSTORAGE_KEY_DISCARDED_DB)
  const discardedDBList: string[] = discardedDB ? JSON.parse(discardedDB) : []

  discardedDBList.push(databaseId.value)

  const newDiscardedDB = JSON.stringify(discardedDBList)
  localStorage.setItem(LOCALSTORAGE_KEY_DISCARDED_DB, newDiscardedDB)
})
</script>

<style lang="scss">
#app {
  height: 100%;
}
</style>