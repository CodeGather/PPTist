/*
 * @Author: 21克的爱情
 * @Date: 2022-02-25 15:16:00
 * @Email: raohong07@163.com
 * @LastEditors: 21克的爱情
 * @LastEditTime: 2022-02-28 14:24:43
 * @Description: 
 */
import { ref, computed, onMounted, onUnmounted, Ref, watch } from 'vue'
import { MutationTypes, useStore } from '@/store'
import { VIEWPORT_SIZE } from '@/configs/canvas'

export default (canvasRef: Ref<HTMLElement | undefined>) => {
  const viewportLeft = ref(0)
  const viewportTop = ref(0)

  const store = useStore()
  const canvasPercentage = computed(() => store.state.canvasPercentage)
  const viewportRatio = computed(() => store.state.viewportRatio)

  // 计算画布可视区域的位置
  const setViewportPosition = () => {
    if (!canvasRef.value) return
    const canvasWidth = canvasRef.value.clientWidth
    const canvasHeight = canvasRef.value.clientHeight

    if (canvasHeight / canvasWidth > viewportRatio.value) {
      const viewportActualWidth = canvasWidth * (canvasPercentage.value / 100)
      store.commit(MutationTypes.SET_CANVAS_SCALE, viewportActualWidth / VIEWPORT_SIZE)
      viewportLeft.value = (canvasWidth - viewportActualWidth) / 2
      viewportTop.value = (canvasHeight - viewportActualWidth * viewportRatio.value) / 2
    }
    else {
      const viewportActualHeight = canvasHeight * (canvasPercentage.value / 100)
      store.commit(MutationTypes.SET_CANVAS_SCALE, viewportActualHeight / (VIEWPORT_SIZE * viewportRatio.value))
      viewportLeft.value = (canvasWidth - viewportActualHeight / viewportRatio.value) / 2
      viewportTop.value = (canvasHeight - viewportActualHeight) / 2
    }
  }

  // 可视区域缩放或比例变化时，更新可视区域的位置
  watch([canvasPercentage, viewportRatio], setViewportPosition)

  // 画布可视区域位置和大小的样式
  const viewportStyles = computed(() => ({
    width: VIEWPORT_SIZE,
    height: VIEWPORT_SIZE * viewportRatio.value,
    left: viewportLeft.value,
    top: viewportTop.value,
    radius: 200
  }))

  // 监听画布尺寸发生变化时，更新可视区域的位置
  const resizeObserver = new ResizeObserver(setViewportPosition)

  onMounted(() => {
    if (canvasRef.value) resizeObserver.observe(canvasRef.value)
  })
  onUnmounted(() => {
    if (canvasRef.value) resizeObserver.unobserve(canvasRef.value)
  })

  return {
    viewportStyles,
  }
}