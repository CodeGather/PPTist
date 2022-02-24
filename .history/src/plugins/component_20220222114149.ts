/*
 * @Author: 21克的爱情
 * @Date: 2022-02-22 09:56:49
 * @Email: raohong07@163.com
 * @LastEditors: 21克的爱情
 * @LastEditTime: 2022-02-22 11:41:49
 * @Description: 
 */
import { App } from 'vue'

import FileInput from '@/components/FileInput.vue'
import CheckboxButton from '@/components/CheckboxButton.vue'
import CheckboxButtonGroup from '@/components/CheckboxButtonGroup.vue'
import ColorPicker from '@/components/ColorPicker/index.vue'
import FullscreenSpin from '@/components/FullscreenSpin.vue'

export default {
  install(app: App) {
    app.component('FileInput', FileInput)
    app.component('CheckboxButton', CheckboxButton)
    app.component('CheckboxButtonGroup', CheckboxButtonGroup)
    app.component('ColorPicker', ColorPicker)
    app.component('FullscreenSpin', FullscreenSpin)
  }
}
