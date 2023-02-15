<template>
  <div class="toolbar">
    <div class="tabs">
      <div 
        class="tab" 
        :class="{ 'active': tab.value === toolbarState }"
        v-for="tab in currentTabs" 
        :key="tab.value"
        @click="setToolbarState(tab.value)"
      >{{tab.label}}</div>
    </div>
    <div class="content">
      {{toolbarState}}
      <!-- <component :is="currentPanelComponent"></component>  在原来的基础上修改为一下方式，目标是在切换时不重新渲染界面加快切换速度，提升用户体验感-->
      <!-- 设计 -->
      <slide-design-panel v-show="toolbarState == 'slideDesign'"></slide-design-panel>
      <!-- 切换 -->
      <slide-animation-panel v-show="toolbarState == 'slideAnimation'"></slide-animation-panel>
      <!-- 动画 -->
      <element-animation-panel v-show="toolbarState == 'elAnimation'"></element-animation-panel>
      <!-- 样式 -->
      <element-style-panel v-show="toolbarState == 'elStyle'"></element-style-panel>
      <!-- 符号 -->
      <symbol-panel v-show="toolbarState == 'symbol'"></symbol-panel>
      <!-- 位置 -->
      <element-position-panel v-show="toolbarState == 'elPosition'"></element-position-panel>
      <!-- 项目信息 -->
      <order-project v-show="toolbarState == 'orderProject'"></order-project>
      <!-- 服务属性 -->
      <order-type v-show="toolbarState == 'orderType'"></order-type>
      <!-- 下单属性 -->
      <order-attribute v-show="toolbarState == 'orderAttribute'"></order-attribute>
      <!-- 服务库 -->
      <order-data-type v-show="toolbarState == 'orderDataType'"></order-data-type>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, watch } from 'vue'
import { MutationTypes, useStore } from '@/store'
import { PPTElement } from '@/types/slides'
import { ToolbarState, ToolbarStates } from '@/types/toolbar'

import ElementStylePanel from './ElementStylePanel/index.vue'
import ElementPositionPanel from './ElementPositionPanel.vue'
import ElementAnimationPanel from './ElementAnimationPanel.vue'
import SlideDesignPanel from './SlideDesignPanel.vue'
import SlideAnimationPanel from './SlideAnimationPanel.vue'
import MultiPositionPanel from './MultiPositionPanel.vue'
import SymbolPanel from './SymbolPanel.vue'

// 自定义
import OrderProject from './OrderProject.vue'
import OrderType from './OrderType.vue'
import OrderAttribute from './OrderAttribute.vue'
import OrderDataType from './OrderDataType.vue'
// end

export default defineComponent({
  name: 'toolbar',
  components: {
    ElementStylePanel,
    ElementAnimationPanel,
    SlideAnimationPanel,
    SlideDesignPanel,
    ElementPositionPanel,
    SymbolPanel,
    OrderProject,
    OrderType,
    OrderAttribute,
    OrderDataType,
  },
  setup() {
    const store = useStore()
    const toolbarState = computed(() => store.state.toolbarState)
    const handleElement = computed<PPTElement>(() => store.getters.handleElement)

    const elementTabs = computed(() => {
      if (handleElement.value?.type === 'text') {
        return [
          { label: '样式', value: ToolbarStates.EL_STYLE },
          { label: '符号', value: ToolbarStates.SYMBOL },
          { label: '位置', value: ToolbarStates.EL_POSITION },
          { label: '动画', value: ToolbarStates.EL_ANIMATION },
        ]
      }
      return [
        { label: '样式', value: ToolbarStates.EL_STYLE },
        { label: '位置', value: ToolbarStates.EL_POSITION },
        { label: '动画', value: ToolbarStates.EL_ANIMATION },
      ]
    })
    const slideTabs = [
      { label: '设计', value: ToolbarStates.SLIDE_DESIGN },
      { label: '切换', value: ToolbarStates.SLIDE_ANIMATION },
      { label: '动画', value: ToolbarStates.EL_ANIMATION },
    ]
    const multiSelectTabs = [
      { label: '位置', value: ToolbarStates.MULTI_POSITION },
      { label: '样式', value: ToolbarStates.EL_STYLE },
    ]

    const setToolbarState = (value: ToolbarState) => {
      store.commit(MutationTypes.SET_TOOLBAR_STATE, value)
    }

    const activeElementIdList = computed(() => store.state.activeElementIdList)
    const currentTabs = computed(() => {
      if (!activeElementIdList.value.length) return slideTabs
      else if (activeElementIdList.value.length > 1) return multiSelectTabs
      return elementTabs.value
    })

    watch(currentTabs, () => {
      const currentTabsValue = currentTabs.value.map(tab => tab.value)
      if (!currentTabsValue.includes(toolbarState.value)) {
        store.commit(MutationTypes.SET_TOOLBAR_STATE, currentTabsValue[0])
      }
    })

    const currentPanelComponent = computed(() => {
      const panelMap = {
        [ToolbarStates.EL_STYLE]: ElementStylePanel,
        [ToolbarStates.EL_POSITION]: ElementPositionPanel,
        [ToolbarStates.EL_ANIMATION]: ElementAnimationPanel,
        [ToolbarStates.SLIDE_DESIGN]: SlideDesignPanel,
        [ToolbarStates.SLIDE_ANIMATION]: SlideAnimationPanel,
        [ToolbarStates.MULTI_POSITION]: MultiPositionPanel,
        [ToolbarStates.SYMBOL]: SymbolPanel,
        [ToolbarStates.PROJECT]: OrderProject,
        [ToolbarStates.ORDRER_TYPE]: OrderType,
        [ToolbarStates.ORDRER_ATTRIBUTE]: OrderAttribute,
        [ToolbarStates.ORDRER_DATATYPE]: OrderDataType,
      }
      return panelMap[toolbarState.value] || null
    })

    return {
      toolbarState,
      currentTabs,
      setToolbarState,
      currentPanelComponent,
    }
  },
})
</script>

<style lang="scss" scoped>
.toolbar {
  border-left: solid 1px $borderColor;
  background-color: #fff;
  display: flex;
  flex-direction: column;
}
.tabs {
  height: 40px;
  font-size: 12px;
  flex-shrink: 0;
  display: flex;
  user-select: none;
  // overflow-x: scroll;
}
.tab {
  flex: 1;
  // flex-shrink: 0;
  padding: 0 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: $lightGray;
  border-bottom: 1px solid $borderColor;
  cursor: pointer;

  &.active {
    background-color: #fff;
    border-bottom-color: #fff;
  }

  & + .tab {
    border-left: 1px solid $borderColor;
  }
}
.content {
  padding: 12px;
  font-size: 13px;

  @include overflow-overlay();
}
</style>