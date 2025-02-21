import { defineStore } from 'pinia'
import api from '@/services'

export interface OrderState {
  list: any[],
  reportData: any,
  activte: any,
  progress: number
}

export const useOrderStore = defineStore('order', {
  state: (): OrderState => ({
    list: [],
    reportData: {},
    activte: {},
    progress: 0
  }),

  actions: {
    getReportData(reportId:string){
      return new Promise(async (resolve, reject) => {
        const { data } = await api.getReportData(reportId)
        data.content = data.content.map((item: any) => {
          item.elements = item.elements.map((t: any) => {
            if (JSON.stringify(t.shadow) === '{}') {
              t.shadow = null
            }
            if (JSON.stringify(t.gradient) === '{}') {
              t.gradient = null
            }
            if (t.viewBox.length === 0) {
              t.viewBox = null
            } else {
              t.viewBox = t.viewBox.concat(t.viewBox)
            }
            if (t.type === 'table') {
              t.cellMinHeight = 32
            }
            if (t.broken.length === 0) {
              t.broken = null
            }
            if (t.curve.length === 0) {
              t.curve = null
            }
            return t
          })
          return item
        })
        this.reportData = data
        resolve(data)
      })
    },
    getOrderList(params:any){
      return new Promise(async (resolve, reject) => {
        let currPage = 0
        let totalPage = 1
        for (let index = 1; currPage < totalPage; index++) {
          const { page } = await api.getOrderList(params.projectId, params.constructionId, index)
          currPage = page.currPage
          totalPage = page.totalPage
          this.progress = Math.floor((currPage / totalPage) * 100)
          const formatList = page.list.map((item: any) => {
            item.projectName = params.projectName
            item.dataList = item.dataList.map((t: any) => {
              if (t.isSub) {
                t.childrenData = this.FormatTextToJson(t.childrenData)
              }
              return t
            })
            return item
          })
          this.list = this.list.concat(formatList)
        }
        resolve(this.list)
      })
    },
    FormatTextToJson (list: any[]) {
      return list.map(item => {
        item['construGuide'] = JSON.parse(item['construGuide'] || '[]')
        item['descText'] = JSON.parse(item['descText'] || '[]')
        item['optionsText'] = JSON.parse(item['optionsText'] || '[]')
        item['photosText'] = JSON.parse(item['photosText'] || '[]')
        item['quoteOptions'] = JSON.parse(item['quoteOptions'] || '[]')
        item['specsOptions'] = JSON.parse(item['specsOptions'] || '[]')
        item['totalPriceFormula'] = JSON.parse(item['totalPriceFormula'] || '[]')
        item['videosText'] = JSON.parse(item['videosText'] || '[]')
        return item
      })
    },
    getParams(key?:string){
      let local = new URL(location.href)
      let params = Object.fromEntries(local.searchParams.entries())
      // let urlKey = 'JTdCJTIycmVwb3J0SWQlMjIlM0ElMjI2JTIyJTJDJTIyb3JkZXJJZCUyMiUzQSUyMiUyMiUyQyUyMnRva2VuJTIyJTNBJTIyZGM3ZThmNWJiNGE5ZjAyNmVlMjcyYmI4NzAxMmJjYmQlMjIlN0Q='
      let urlKey = params.key || localStorage.getItem("key") || null
      if (urlKey) {
        params = JSON.parse(decodeURIComponent(atob(urlKey)))
        if (params.reportId && params.orderId && params.token) {
          localStorage.setItem("key", urlKey)
        }
      }
      if (key) {
        return params[key]
      } else {
        return params
      }
    },
    setList(list: any[]) {
      this.list = list
    },
    setActivte(item: any) {
      this.activte = item
    }
  },
})