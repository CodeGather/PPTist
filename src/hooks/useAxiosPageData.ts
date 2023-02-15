/*
 * @Author: 21克的爱情
 * @Date: 2022-02-28 15:42:30
 * @Email: raohong07@163.com
 * @LastEditors: 21克的爱情
 * @LastEditTime: 2022-08-05 11:08:49
 * @Description: 统一请求数据
 */

import axios from 'axios'
import { onMounted } from 'vue'
import { PrepareOrderInitData, OrderDataList, InitData } from '@/types/pageData'
import { PageDataStatus } from '@/types/pageDataStatus'
import { slides } from '@/mocks/slides'
import { MutationTypes, useStore } from '@/store'
import { getSearchPathValue, getLocationHost } from '@/utils/common'

export default () => {
  const store = useStore()

  const getPrepareOrderInitData = () => {
    store.commit(MutationTypes.PAGE_LOADING, PageDataStatus.LOADING)
    return new Promise<PrepareOrderInitData>((resolve, reject) => {
      axios.get(`${getLocationHost('/sys/report/getReportConfig')}`, {
        headers: {
          'token': getSearchPathValue('token')
        },
        params: {
          code: 'add',
          projectId: getSearchPathValue('projectId'),
          reportId: getSearchPathValue('reportId')
        }
      }).then(({ data }) => {
        resolve(data)
      }).catch(() => {
        reject(false)
      })
    })
  }
  // 进入页面时开始请求结构化数据
  const getPageInitData = async () => {
    const data: PrepareOrderInitData = await getPrepareOrderInitData()
    if (data && data.code === 0) {
      data.orderDataList = data.orderDataList?.filter((item:OrderDataList) => {
        return item.isMasterProcess && (item.isSub || item.isPhoto || item.isVideo)
      })
      // 插入固定选项物料记录
      data.orderAttributeValueList?.splice(0, 0, {
        attrId: 0,
        name: '物料记录',
        attrCode: 'material',
        attrName: '物料记录'
      })
      data.orderTypeDataTypeList = formatOrderTypeData(data.orderTypeDataTypeList || [])
      data.orderTypeList = data.orderTypeList?.map(item => {
        if (item['children']) {
          item['children'] = formatOrderTypeData(item['children'])
        }
        return item
      })

      if (data.reportData) {
        if (data.reportData['contents'] && typeof data.reportData['contents'] === 'string') {
          data.reportData.content = JSON.parse(data.reportData['contents'])
        }
        if (data.reportData.content instanceof Array && data.reportData.content.length === 0) {
          data.reportData.content = slides
        }
      }
      // 处理数据图片、文字、视频
      store.commit(MutationTypes.PAGE_DATA, data)
      store.commit(MutationTypes.PAGE_LOADING, PageDataStatus.SUCCESS)
    } 
    else {
      store.commit(MutationTypes.PAGE_LOADING, PageDataStatus.ERROR)
    }
    store.commit(MutationTypes.PAGE_SPINNING, false)
  }

  const formatOrderTypeData = (list: Array<InitData | any>) => {
    return list.map((t:any) => {
      if (typeof t['photosText'] === 'string') {
        t['photosText'] = JSON.parse(t['photosText'])
      }
      if (typeof t['optionsText'] === 'string') {
        t['optionsText'] = JSON.parse(t['optionsText'])
      }
      if (typeof t['videosText'] === 'string') {
        t['videosText'] = JSON.parse(t['videosText'])
      }
      return t
    })
  }

  const searchOrderType = (name:string) => {
    return new Promise<InitData[]>((resolve, reject) => {
      axios.get(`${getLocationHost('/orm/ormorderdatatype/listall')}`, {
        headers: {
          'token': getSearchPathValue('token')
        },
        params: {
          name: name
        }
      }).then(({ data }) => {
        resolve(data)
      }).catch(() => {
        reject(false)
      })
    })
  }

  onMounted(() => {
    getPageInitData()
  })
  return {
    getPageInitData,
    searchOrderType
  }
}