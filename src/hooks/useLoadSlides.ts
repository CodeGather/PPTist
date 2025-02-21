/*
 * @Author: 21克的爱情
 * @Date: 2025-02-20 09:56:48
 * @Email: raohong07@163.com
 * @LastEditors: 21克的爱情
 * @LastEditTime: 2025-02-21 14:04:32
 * @Description: 
 */
import { ref, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useSlidesStore } from '@/store'

export default () => {
  const { slides } = storeToRefs(useSlidesStore())

  const timer = ref<NodeJS.Timeout | number | null>(null)
  const slidesLoadLimit = ref(50)

  const loadSlide = () => {
    if (slides.value.length > slidesLoadLimit.value) {
      timer.value = setTimeout(() => {
        slidesLoadLimit.value = slidesLoadLimit.value + 20
        loadSlide()
      }, 600)
    }
    else slidesLoadLimit.value = 9999
  }

  onMounted(loadSlide)

  onUnmounted(() => {
    if (timer.value) clearTimeout(timer.value)
  })

  return {
    slidesLoadLimit,
  }
}