/*
 * @Author: 21克的爱情
 * @Date: 2019-12-23 12:33:02
 * @Email: raohong07@163.com
 * @LastEditors: 21克的爱情
 * @LastEditTime: 2025-02-20 14:30:04
 * @Description: 文件工具
 */
'use strict'

import JSZip from 'jszip'
import axios from 'axios'
import { saveAs } from 'file-saver'
import { SVGPathData } from 'svg-pathdata'
import arcToBezier from 'svg-arc-to-cubic-bezier'
import PptxGenJS from 'pptxgenjs'
import tinycolor from 'tinycolor2'
import { startsWith, endsWith } from 'lodash'
// const moment = require('moment')

export default {
  characters: <String>'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
  PREFIX: <String>'data:image/svg+xml;base64,',
  typeMap: <any>{1: 'Z', 2: 'M', 4: 'H', 8: 'V', 16: 'L', 32: 'C', 64: 'S', 128: 'Q', 256: 'T', 512: 'A'},
  childlessTags: <String[]>['style', 'script', 'template'],
  closingTags: <String[]>['html', 'head', 'body', 'p', 'dt', 'dd', 'li', 'option', 'thead', 'th', 'tbody', 'tr', 'td', 'tfoot', 'colgroup'],
  closingTagAncestorBreakers: <any>{li: ['ul', 'ol', 'menu'], dt: ['dl'], dd: ['dl'], tbody: ['table'], thead: ['table'], tfoot: ['table'], tr: ['table'], td: ['table']},
  voidTags: <String[]>['!doctype', 'area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr'],
  logoUrl: <String>'https://dali-pord.oss-cn-shanghai.aliyuncs.com/static/brandLogo.png',
  pptx: <any>null,
  jsZip: <JSZip | null>null,
  pptxConfig: <any>{
    fileName: '',
    isNodeSide: false,
    content: []
  },
  imageData: new Map(),
  compressConfig: <any>{
    remark: '',
    ratio: 50,
    isCompress: false,
    isShowMuitl: false,
    type: 'jpg'
  },
  exporting: false,
  init (pptxConfig:any, compressConfig:any) {
    console.log('<<<<<<初始化PPTX插件>>>>>')
    this.pptx = new PptxGenJS()
    this.pptx.title = '自动生成系统报告'
    this.pptx.subject = '思预云提供报告自动生成'
    this.pptx.author = '21克的爱情-提示技术支持'
    this.pptx.company = '上海思预云智能科技有限公司'
    this.pptx.revision = '1'
    // PPTX 布局设置
    // this.pptx.layout = 'LAYOUT_WIDE'
    this.jsZip = new JSZip()

    // 对配置判断是否是字符串形式，否则需要格式化
    // if (pptxConfig.hasOwnProperty('content')) {
    //   if (typeof pptxConfig.content === 'string') {
    //     pptxConfig.content = JSON.parse(pptxConfig.content)
    //   }
    // }
    let replaceStr = JSON.stringify(pptxConfig)
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '\\"')
    
    this.pptxConfig = JSON.parse(replaceStr)
    console.log('配置信息', this.pptxConfig)

    // 合并配置参数
    Object.assign(this.compressConfig, compressConfig)
    // 开启压缩的时候进行参数配置
    if (this.compressConfig.ratio <= 0 || this.compressConfig.ratio >= 100) {
      // 超过1～100时重置为100不进行压缩操作
      this.compressConfig.ratio = 100
    }
    this.compressConfig.remark = `/quality,q_${this.compressConfig.ratio}/format,${this.compressConfig.type}`
    return this
  },
  async startDownloadPPTX (list:any, cellBack:any) {
    // 清空图片数据
    this.imageData = new Map()
    // 过滤掉不在报告显示的数据
    let formatList = this.formatData(list)
    console.log('数据源', list)
    console.log('图片源', this.imageData)
    console.log('数据处理', formatList)
    cellBack(formatList)
    return
    // 获取到图片的链接数据
    if (!Array.isArray(formatList[0].list)) throw new Error('数据类型不正确，请检查数据类型是否符合[[{},{}],[{},{}]]')
    const queryCount = 10
    const totalData = this.imageData.keys()
    // 批量请求图片的数据
    for (let index = 0; index < Math.ceil([...this.imageData.keys()].length / queryCount); index++) {
      const result = this.genIterator(queryCount, totalData)
      const list = await Promise.all(result)
      console.log(999, list)
      list.forEach((image:any, i) => {
        if (image) {
          this.imageData.set(image.key, image)
        } else {
          console.error('图片下载失败', result[i])
        }
      })
    }
    try {
      for (let i = 0; i < formatList.length; i++) {
        let formatItem = formatList[i]
        // 判断是否时合并PPTX
        // 合并时不对其单独生成文件
        if (this.pptxConfig.isMerge === 1) {
          let isLastData = this.pptxConfig.isMerge === 1 && formatList.length - 1 === i
          let pptxBolb:any = await this.exportPPTXItem({
            data: formatItem,
            type: false,
            isLastData
          })
          if (formatList.length > 0 && formatList.length - 1 === i) {
            saveAs(pptxBolb, `${list[0].projectSn}-${list[0].projectName}.pptx`)
          }
        } else {
          // 清除PPTX数据， 否则可能出现重复文件
          this.pptx!.slides.splice(0, this.pptx!.slides.length)
          this.pptx!.sections.splice(0, this.pptx!.sections.length)
          let pptxBolb:any = await this.exportPPTXItem({
            data: formatItem,
            type: false,
            isLastData: false
          })
          if (formatList.length === 1) {
            saveAs(pptxBolb, `${formatItem.name}.pptx`)
          } else {
            this.jsZip!.file(`${formatItem.name}.pptx`, pptxBolb)
          }
          /**
           * 当全部数据制作完成后，进行压缩包的处理
           */
          if (formatList.length > 1 && formatList.length - 1 === i) {
            this.jsZip!.generateAsync({type: 'blob'}).then((content) => {
              saveAs(content, '完工报告压缩包.zip')
            })
          }
        }
      }
    } catch (error) {
      console.log(error)
    } finally {
      cellBack && cellBack(false)
    }
  },
  formatData (list:any) {
    const that = this
    return list.map((item:any, listIndex:any) => {
      item = JSON.parse(JSON.stringify(item))
      let dataList:any = []
      let material:any = []
      let resultData:any = {
        name: that.pptxConfig.fileName
      }
      // 处理文件名称
      resultData.name = that.formatName(resultData.name, item)
      if (item.dataList instanceof Array) {
        // TODO 多次进店的操作修改 20240223
        // 将订单数据进行类型分组
        // 新增只导出一次进店数据
        const dataPathMap = item.dataList.filter((t:any) => (this.compressConfig.isShowMuitl && t.manyIndex === 1) || !this.compressConfig.isShowMuitl).reduce((prev:any, next:any) => {
          if (next.isSub) {
            // .sort((a,b) => a.manyIndex - b.manyIndex)
            (next.childrenData || []).filter((t:any) => (this.compressConfig.isShowMuitl && t.manyIndex === 1) || !this.compressConfig.isShowMuitl).forEach((n:any) => {
              if (n.photosText instanceof Array && n.photosText && n.photosText.length > 0) {
                (n.photosText || []).forEach((p:any) => {
                  // 20240910修改为二次没有图片数据时不对齐进行替换/最大次数进店会替换掉原来的数据
                  if (p.list instanceof Array && p.list.length > 0) {
                    prev.set(`${next.typeId}_${n.orderDataTypeId}_${p.name}`, {
                      guide: new Set(n.construGuide || []).values(),
                      guideCount: (n.construGuide || []).length,
                      data: new Set(p.list || []).values(),
                      dataCount: (p.list || []).length
                    })
                  }
                })
              }
            })
          } else {
            // 20240910修改为二次没有图片数据时不对齐进行替换
            if (next.photos instanceof Array && next.photos.length > 0) {
              prev.set(`${next.typeId}`, {
                guide: new Set(next.construGuide || []).values(),
                guideCount: (next.construGuide || []).length,
                data: new Set(next.photos || []).values(),
                dataCount: (next.photos || []).length
              })
            }
          }
          return prev
        }, new Map())
        console.log('数据列表', dataPathMap)
        // 新增只导出一次进店数据
        const dataListMap = item.dataList.filter((t:any) => (this.compressConfig.isShowMuitl && t.manyIndex === 1) || !this.compressConfig.isShowMuitl).reduce((prev:any, next:any) => {
          if (!prev.has(next.typeId)) { prev.set(next.typeId, next) }
          // 将子数据进行替换
          prev.get(next.typeId).childrenDataMap = (next.childrenData || []).filter((t:any) => (this.compressConfig.isShowMuitl && t.manyIndex === 1) || !this.compressConfig.isShowMuitl).sort((a:any, b:any) => a.manyIndex - b.manyIndex).reduce((p:any, n:any) => {
            console.log(n.manyIndex)
            const hasData = (n.photosText || []).find((tt:any) => {
              return tt.list instanceof Array && tt.list.length > 0
            })
            if (hasData) {
              p.set(n.orderDataTypeId, n)
            }
            return p
          }, prev.get(next.typeId).childrenDataMap || new Map())
          return prev
        }, new Map())
        // 处理后的数据
        const formatDataList = Array.from(dataListMap.keys()).map((key:any) => {
          const dataListItem = { ...dataListMap.get(key) }
          // 获取被替换的子数据
          const childrenItemData = Array.from(dataListItem.childrenDataMap.values())
          dataListItem.children = childrenItemData
          dataListItem.childrenData = childrenItemData
          if (dataListItem.childrenData instanceof Array && dataListItem.childrenData.length > 0) {
            // 处理物料信息
            dataListItem.childrenData.forEach((childrenData:any) => {
              if (childrenData.materialList instanceof Array && childrenData.materialList.length > 0) {
                childrenData.materialList.forEach((materialItem:any) => {
                  if (typeof materialItem.trouList === 'string') {
                    materialItem.trouList = JSON.parse(materialItem.trouList)
                  }
                  material.push(materialItem)
                })
              }
            })
          }
          return dataListItem
        })
        // TODO end
        console.log(111111111, dataListMap, formatDataList)

        // 获取配置参数
        let pptxConfig = that.pptxConfig.content
        // 判断是否是字符串否则转换——》用于字符串批量替换品牌LOGO
        if (pptxConfig instanceof Array) {
          pptxConfig = JSON.stringify(pptxConfig)
        }
        /**
         * 全局批量替换数据（下单属性中没有的数据需该操作）
         * 品牌logo、项目名称、品牌名称
         */
        pptxConfig = that.formatName(pptxConfig, item, 'YYYY-MM-DD HH:mm:ss')
        // 替换下单属性字段
        item.orderAttributeValueList.forEach((oav:any) => {
          if (oav.attrCode === 'isTime') {
            let timeValue = oav.attrValue1
            // let timeValue = moment().format('YYYY-MM-DD')
            // if (oav.attrValue1) {
            //   timeValue = moment(oav.attrValue1).format('YYYY-MM-DD')
            // }
            resultData.name = resultData.name.replaceAll(`@${oav.attrName}`, timeValue || '')
          } else {
            resultData.name = resultData.name.replaceAll(`@${oav.attrName}`, oav.attrValue1 || '')
          }

          // 替换使用的下单属性字段
          if (pptxConfig.indexOf(`@${oav.attrName}`) > -1) {
            pptxConfig = pptxConfig.replaceAll(`@${oav.attrName}`, oav.attrValue || '')
          }
        })
        // 批量替换完毕后对参数还原处理
        pptxConfig = JSON.parse(pptxConfig)
        // 开始循环配置参数
        pptxConfig.forEach((f:any) => {
          let cloneData = JSON.parse(JSON.stringify(f))
          console.log('配置信息', cloneData)
          if (cloneData.keyName) {
            // console.log('存在keyName：', f)
            /**
             * TODO: 专门处理物料记录
             */
            if (cloneData.keyName === 'material') {
              cloneData['sectionName'] = '物料记录'
              let tableElement:any = {}
              let itemElements:any = []
              cloneData.elements.forEach((ele:any, index:any) => {
                if (ele.type === 'table') {
                  // 根据图片的数量确定高度
                  tableElement = ele
                  let listItem = ele.data[1]
                  let listData = material.map((materialListItem:any) => {
                    return materialListItem.trouList.map((trouItem:any) => {
                      return trouItem.list.filter((trouItemList:any) => trouItemList.type === 'image' && trouItemList.list instanceof Array && trouItemList.list.length > 0).map((trouItemList:any) => {
                        return trouItemList.list
                      })
                    }).flat(Infinity)
                  })
                  console.log('物料记录数据', material, listData)
                  material.forEach((mater:any, materIndex:any) => {
                    console.log(mater, materIndex)
                    listItem[0]['text'] = materIndex + 1
                    // this.getChartCount(mater.point)
                    listItem[1]['text'] = mater.point
                    listItem[2]['text'] = mater.name
                    listItem[3]['text'] = mater.amount

                    // 物料问题列表
                    let trouList = mater.trouList.map((trouItem:any) => {
                      return trouItem.list.filter((trouItemList:any) => trouItemList.type !== 'image' && trouItemList.value).map((trouItemList:any) => {
                        return `${trouItemList.name}: ${trouItemList.value}`
                      }).join(',')
                      // return trouItem.list.filter(trouItemList => trouItemList.type !== 'image' && trouItemList.value).map(trouItemList => {
                      //   return `${trouItemList.name}: ${trouItemList.value}`
                      // })[0]
                    })

                    // let trouListImage = mater.trouList.map(trouItem => {
                    //   return trouItem.list.filter(trouItemList => trouItemList.type === 'image' && trouItemList.list instanceof Array && trouItemList.list.length > 0).map(trouItemList => {
                    //     return trouItemList.list
                    //   })
                    // }).flat(Infinity)

                    // console.log('图片数量', trouListImage.length)
                    let trouStr = trouList.filter((item:any) => item).join('/')
                    listItem[4]['text'] = trouStr

                    // 物料图片操作
                    // listItem[5]['text'] = new Array(Math.ceil(trouListImage.length / 3)).fill('\n\n\n').join('\n')
                    if (materIndex > 0) {
                      ele.data.push(JSON.parse(JSON.stringify(listItem)))
                    } else {
                      ele.data.splice(1, ele.data.length, JSON.parse(JSON.stringify(listItem)))
                    }

                    // // 重新排列表格的宽度
                    // let marge = ele.colWidths[4] + ele.colWidths[5]
                    // ele.colWidths[5] = tableElement.height / ((70 * 1.4) * 3)
                    // ele.colWidths[4] = marge - ele.colWidths[5]

                    // // 开始计算点位的间距
                    // let rowSping = 0
                    // if (materIndex > 0) {
                    //   let totalNum = listData.slice(0, materIndex).flat(Infinity)
                    //   rowSping = Math.ceil(totalNum.length / 3) * 80
                    // }
                    // 控制动态添加图片
                    // trouListImage.forEach((imageItem, imageIndex) => {
                    //   let left = tableElement.width * (1 - tableElement.colWidths[5]) + tableElement.left + 5
                    //   let top = tableElement.top + (12 * 1.5) + 15
                    //   // 新增数据
                    //   itemElements.push({
                    //     'id': Math.floor(Math.random() * 10000),
                    //     'keyName': 'material',
                    //     'type': 'image',
                    //     'left': left + (imageIndex % 3) * 70 + (imageIndex % 3) * 2,
                    //     'top': top + rowSping + (Math.floor(imageIndex / 3) * 70) + Math.floor(imageIndex / 3) * 2,
                    //     'width': 70,
                    //     'height': 70,
                    //     'lineHeight': 1.5,
                    //     'src': imageItem.url || ''
                    //   })
                    //   console.log('新增数据：', cloneData.elements)
                    // })
                  })
                }
                // 插入第一位将其置于底部
                itemElements.splice(0, 0, JSON.parse(JSON.stringify(ele)))
              })

              cloneData.elements = itemElements
              console.log('图片列表数据：', tableElement)
              console.log('物料记录初始化数据：', cloneData)
              dataList.push(JSON.parse(JSON.stringify(cloneData)))
            } else {
              let keyName = ''
              let genterData = []
              // 是否是统一模版
              let isUnified = cloneData.keyName.indexOf('统一点位') > -1
              // 区分数据类型
              if (cloneData.keyName.indexOf('服务属性') > -1) {
                genterData = formatDataList.filter(temp => {
                  if (typeof temp.photo === 'string') {
                    temp.photo = JSON.parse(temp.photo || '[]')
                  }
                  if (typeof temp.video === 'string') {
                    temp.video = JSON.parse(temp.video || '[]')
                  }
                  return (isUnified || cloneData.keyName.indexOf(temp.name) > -1) && temp.isSub && temp.isMasterProcess && temp.isReport
                })
              } else {
                // 判断服务属性是否开启报告功能
                genterData = formatDataList.filter(temp => {
                  return temp.isSub && temp.children instanceof Array && temp.children.length > 0 && temp.isMasterProcess && temp.isReport
                })
              }
              // 点位通用模版
              if (isUnified) {
                // dataList
                genterData.forEach(temp => {
                  let existDataType = pptxConfig.find((findTemp:any) => findTemp.keyName && findTemp.keyName.indexOf(temp.name) > -1)
                  console.log('是否存在相同的服务属性', existDataType)
                  if (!existDataType) {
                    if (cloneData.keyName === '服务属性……统一点位') {
                      console.log('开始处理服务属性数据')
                      /**
                       * TODO: 设置标题节
                       */
                      if (this.pptxConfig.isMerge !== 1) {
                        cloneData.sectionName = `${listIndex + 1}.${temp.name}`
                      } else {
                        cloneData.sectionName = `${listIndex + 1}.${item.shopName}`
                      }
                      if (temp.photo instanceof Array && temp.photo.length > 0) {
                        temp.photo.forEach((imageTemp:any, imageIndex:any) => {
                          let childCloneData = JSON.parse(JSON.stringify(cloneData))
                          childCloneData.elements = childCloneData.elements.map((m:any) => {
                            if (m.type === 'text') {
                              if (m.keyName === 'pointName') {
                                m.content = m.content.replace('点位名称', temp.name)
                                console.log('打印内容5', m.content)
                                m.width = this.getStringCount(m.content) + (m && (m.outline.width || 0)) * 2
                              } else if (m.keyName === '服务属性名') {
                                m.content = m.content.replaceAll('服务属性名', '上传图片')
                              } else {
                                // 判断没有对应指引的时候去除标题
                                m.content = temp.construGuide && temp.construGuide[imageIndex] ? m.content : ''
                              }
                            } else if (m.type === 'image' && m.keyName !== '品牌LoGo') {
                              // 图片类型的时候分别处理施工属性和施工指引
                              if (m.keyName === '服务属性名') {
                                m.src = imageTemp.url
                              } else if (m.keyName === '施工指引') {
                                m.src = temp.construGuide && temp.construGuide[imageIndex] ? temp.construGuide[imageIndex].url : ''
                              }
                              // 处理图片数据
                              if (m.src) {
                                this.imageData.set(m.src, true)
                              }
                            }
                            return m
                          })
                          // 该处表示新增pptx页面
                          dataList.push(JSON.parse(JSON.stringify(childCloneData)))
                        })
                      } else {
                        dataList.push(JSON.parse(JSON.stringify(cloneData)))
                      }
                    } else if (cloneData.keyName === '服务库……统一点位') {
                      console.log('开始处理服务库数据', cloneData, temp, formatDataList)
                      temp.children && temp.children.forEach((child:any) => {
                        let existChildren = pptxConfig.find((findTemp:any) => findTemp.keyName && findTemp.keyName.indexOf(child.name) > -1)
                        if (!existChildren) {
                          // TODO: 过滤掉不在报告显示的内容
                          let listFiterData = child.photosText.filter((listFiterItem:any) => listFiterItem.checked === true)
                          for (let index = 0; index < listFiterData.length; index++) {
                            const photo = listFiterData[index]
                            /**
                             * 需要处理掉为勾选在报告中显示的内容
                             */
                            if (!photo.checked) { continue }

                            let childCloneData = JSON.parse(JSON.stringify(cloneData))

                            let elementImage = childCloneData.elements.filter((m:any) => {
                              if (m.type === 'image' && m.keyName !== '品牌LoGo') {
                                if (childCloneData.construGuide && childCloneData.construGuide.length > 0) {
                                  return m.keyName === '施工指引'
                                } else {
                                  return true
                                }
                              }
                            }).sort((a:any, b:any) => a.left - b.left)
                            if (elementImage instanceof Array && elementImage.length === 0) {
                              dataList.push(JSON.parse(JSON.stringify(childCloneData)))
                              continue
                            }
                            console.log('获取到页面的图片element并且根据left由小到大排序：', elementImage)
                            /**
                             * TODO: 设置标题节
                             */
                            if (this.pptxConfig.isMerge !== 1) {
                              childCloneData.sectionName = `${listIndex + 1}.${child.name}`
                            } else {
                              childCloneData.sectionName = `${listIndex + 1}.${item.shopName}`
                            }
                            if (photo.list && photo.list.length > 0) {
                              /**
                               * TODO: 步骤一
                               * 判断参数isFill（控制是否填充施工指引）
                               * true 一> 1 不填充 过滤掉施工指引的参数
                               * false 一> 0 填充 忽略施工指引的参数
                               */
                              if (that.pptxConfig['isFill'] === 1) {
                                elementImage = elementImage.filter((filterItem:any) => filterItem.keyName !== '施工指引')
                              }

                              let elementImageCount = elementImage.length
                              // console.log(`点位图片数量：${photo.list.length}-过滤后的PPTX数量：${elementImageCount}-$施工指引数量：${child.construGuide.length}-准备分页数：${Math.ceil(photo.list.length / elementImageCount)}`)
                              for (let i = 0; i < Math.ceil(photo.list.length / elementImageCount); i++) {
                                // 处理归类后的图片元素赋值
                                let elementImageMap:any = {}
                                // 循环数据
                                for (let index = 0; index < elementImageCount; index++) {
                                  // 动态下表用于直接获取list的图片数据
                                  let currentIndex = i * elementImageCount + index
                                  elementImage[index].src = photo.list[currentIndex] ? photo.list[currentIndex].url : ''
                                  elementImageMap[elementImage[index]['id']] = elementImage[index]
                                  // 处理图片数据
                                  if (elementImage[index].src) {
                                    this.imageData.set(elementImage[index].src, true)
                                  }
                                  // console.log('图片下标--------------：', i, (i * elementImageCount + index), elementImageMap)
                                }

                                // 对页面数据进行最后的装载
                                childCloneData.elements = childCloneData.elements.map((m:any) => {
                                  if (m.type === 'text') {
                                    if (m.keyName === 'pointName') {
                                      m.content = m.content.replace('点位名称', child.name).replace('服务属性', temp.name)
                                      console.log('打印内容1', m.content)
                                      m.width = this.getStringCount(m.content) + (m && (m.outline.width || 0)) * 2
                                    } else if (m.keyName === '服务库名') {
                                      m.content = m.content.replaceAll('服务库名', photo.name)
                                      console.log('打印内容6', m.content)
                                    } else if (m.keyName === '服务库名_文本类型' && i === 0) {
                                      const filterList = (child.descText || []).filter((item:any) => item.checked)
                                      const content = filterList.map((text:any) => {
                                        return `${text.name}: ${text.value}`
                                      }).join('\r\n')
                                      m.content = content
                                      m.height = '100%'
                                    } else if (m.keyName === '选择店铺') {
                                    } else if (m.keyName === '施工指引') {
                                      /** 判断没有对应指引的时候去除标题 */
                                      // m.content = child.construGuide && child.construGuide[i] ? m.content : ''
                                      if (child.construGuide && child.construGuide.length === 0 && that.pptxConfig['isFill'] === 0) {
                                        m.content = ''
                                      }
                                    }
                                  } else if (m.type === 'image' && m.keyName !== '品牌LoGo') {
                                    if (m.keyName === '施工指引' && that.pptxConfig['isFill'] === 1) {
                                      m.src = child.construGuide[i] ? child.construGuide[i].url : ''
                                    } else {
                                      const srcUrl = elementImageMap[m.id] && elementImageMap[m.id].src ? that.buildImageUrl(elementImageMap[m.id].src, '') : ''
                                      m.src = srcUrl
                                      // console.error('获取到的链接', elementImageMap[m.id].src, srcUrl)
                                      // m.src = elementImageMap[m.id] && elementImageMap[m.id].src ? that.buildImageUrl(elementImageMap[m.id].src, `/resize,w_${parseInt(m.width) * 15},h_${parseInt(m.height) * 15},m_pad`) : ''
                                    }
                                    // 处理图片数据
                                    if (m.src) {
                                      this.imageData.set(m.src, true)
                                    }
                                  }
                                  return m
                                })
                                // 该处表示新增pptx页面
                                dataList.push(JSON.parse(JSON.stringify(childCloneData)))
                              }
                            } else {
                              childCloneData.elements = childCloneData.elements.map((m:any) => {
                                if (m.type === 'text') {
                                  if (m.keyName === 'pointName') {
                                    m.content = m.content.replace('点位名称', child.name).replace('服务属性', temp.name)
                                    console.log('打印内容2', m.content)
                                    m.width = this.getStringCount(m.content) + (m && (m.outline.width || 0)) * 2
                                  } else if (m.keyName === '服务库名') {
                                    m.content = m.content.replaceAll('服务库名', photo.name)
                                    console.log('打印内容4', m.content)
                                  }
                                } else if (m.type === 'image' && m.keyName !== '品牌LoGo') {
                                  // 在imageCount 中查找ID相同的进行赋值
                                  if (m.keyName === '施工指引') {
                                    m.src = child.construGuide[index] ? child.construGuide[index].url : ''
                                  } else {
                                    m.src = ''
                                  }
                                  // 处理图片数据
                                  if (m.src) {
                                    this.imageData.set(m.src, true)
                                  }
                                }
                                return m
                              })
                              console.error('没有数据，使用默认数据填充1！', childCloneData, photo.name)
                              // dataList.push(JSON.parse(JSON.stringify(childCloneData)))
                            }
                          }
                        }
                      })
                    }
                  }
                })
              } else {
                const findDataPath = (cloneData.elements || []).find((e:any) => e.dataPath)
                // 存在自定义的单独处理时
                if (findDataPath) {
                  // 图片查找到相同数据并且分组,获取ppt页面的图片element
                  let pageImageList = cloneData.elements.filter(
                    (temp:any) => temp.type === 'image' && temp.keyName !== '品牌LoGo'
                  )
                  // 将ppt页面的数组转换为对象
                  let pageImageListMap = pageImageList.reduce((prev:any, next:any) => {
                    if (dataPathMap.get(next.dataPath)) {
                      prev[next.dataPath] = (prev[next.dataPath] || {})
                      prev[next.dataPath].ele = (prev[next.dataPath].ele || []).concat([next])
                      // guide, data
                      console.log(888, dataPathMap.get(next.dataPath))
                      prev[next.dataPath] = {...prev[next.dataPath], ...dataPathMap.get(next.dataPath)}
                    }
                    return prev
                  }, {})
                  // 模版最大的下标 2
                  const maxData:any = Object.values(pageImageListMap).reduce((prev:any, next:any) => {
                    prev['maxEleCount'] = Math.max(prev['maxEleCount'] || 0, (next.ele instanceof Array ? next.ele.length : 0))
                    prev['maxImgCount'] = Math.max(prev['maxImgCount'] || 0, next.dataCount)
                    return prev
                  }, {})

                  for (let index = 0; index < Math.ceil(maxData.maxImgCount / maxData.maxEleCount); index++) {
                    let imageData:any = ''
                    cloneData.elements = cloneData.elements.map((temp:any) => {
                      console.log(9999, temp.dataPath)
                      if (temp.type === 'image') {
                        if (temp.dataPath && dataPathMap.get(temp.dataPath)) {
                          imageData = dataPathMap.get(temp.dataPath).data.next()
                          temp.src = imageData && imageData.value ? that.buildImageUrl(imageData.value.url, '') : ''
                        } else {
                          temp.src = ''
                        }
                      } else if (temp.type === 'text' && (!imageData || imageData.done)) {
                        // 解析HTML代码
                        // const div = document.createElement('div')
                        // div.innerHTML = temp.content
                        // temp.content = temp.content.replace(div.innerText, '')
                      }
                      return temp
                    })
                    dataList.push(JSON.parse(JSON.stringify(cloneData)))
                  }

                  console.log('获取到dataPath', cloneData, pageImageListMap, maxData, dataList)
                } else {
                  keyName = cloneData.keyName.replace('服务库……', '').replace('服务属性……', '')
                  if (genterData.length > 0) {
                    genterData = genterData.map(temp => {
                      keyName = keyName.replace(`${temp.name}……`, '')
                      return temp.isSub ? temp.children || [] : [temp]
                    }).flat(Infinity)
                  }

                  // 图片查找到相同数据并且分组,获取ppt页面的图片element
                  let pageImageList = cloneData.elements.filter(
                    (temp:any) => temp.type === 'image' && temp.keyName !== '品牌LoGo'
                  )
                  // 将ppt页面的数组转换为对象
                  let pageImageListMap = pageImageList.reduce((prev:any, next:any) => {
                    prev[next.keyName] = next
                    return prev
                  }, {})

                  // 查找服务库数据
                  let findObjectDataMap:any = {}
                  let findObjectData = genterData.find(temp => temp.name === keyName)
                  if (findObjectData) {
                    if (findObjectData.photosText instanceof Array && findObjectData.photosText.length > 0) {
                      console.info('-------服务库------')
                      // 获取当前页面不同类型的分组
                      findObjectDataMap = findObjectData.photosText.filter((filterItem:any) => {
                        console.warn(filterItem, findObjectData)
                        return pageImageListMap.hasOwnProperty(filterItem.name) && filterItem.checked
                      }).reduce((prev:any, next:any) => {
                        if (!prev.hasOwnProperty(next.name)) {
                          prev[next.name] = next.list || []
                        }
                        return prev
                      }, {})
                    } else if (findObjectData.photos instanceof Array && findObjectData.photos.length > 0) {
                      console.info('-------服务属性------')
                      // 获得最大数量时开始计算需要几页数据
                      findObjectDataMap = findObjectData.photos.filter((filterItem:any) => {
                        return pageImageListMap.hasOwnProperty(filterItem.name)
                      }).reduce((prev:any, next:any) => {
                        if (!prev.hasOwnProperty(next.name)) {
                          prev[next.name] = next.list || []
                        }
                        return prev
                      }, {})
                    }

                    // 计算不同属性的最大图片数量用于判断是否分页
                    let maxLength = Math.max.apply(
                      Math,
                      Object.values(findObjectDataMap).map((item:any) => item.length)
                    )
                    console.error('获取配置的最大图片长度以及数据中图片最大长度：', findObjectDataMap, pageImageList.length, maxLength)
                    /**
                     * TODO: 设置标题节
                     */
                    if (this.pptxConfig.isMerge !== 1) {
                      cloneData.sectionName = `${listIndex + 1}.${findObjectData.name}`
                    } else {
                      cloneData.sectionName = `${listIndex + 1}.${item.shopName}`
                    }
                    // console.log(`图片数量分为${maxLength}----几组数据${Math.ceil(maxLength / (pageImageList.length / Object.keys(pageImageListMap).length))}`)
                    // 获得最大数量时开始计算需要几页数据 最大数据类型的图片数量  / ppt页面的元素种类
                    if (pageImageList.length > 0 && Object.prototype.toString.call(pageImageListMap) === '[object Object]' && Object.keys(pageImageListMap).length > 0) {
                      if (maxLength > 0) {
                        const countSize = (pageImageList.length / Object.keys(pageImageListMap).length)
                        const forCount = Math.ceil(maxLength / countSize)
                        for (let i = 0; i < forCount; i++) {
                          // 对分组数据进行循环填充, 保留物料, 销毁物料
                          // 将pptx页面的数据进行分组
                          const groupData = pageImageList.reduce((prev:any, next:any) => {
                            prev[next.keyName] = (prev[next.keyName] || []).concat([next])
                            return prev
                          }, {})
                          // 将分组后的数据进行匹配图片
                          pageImageList = Object.values(groupData).map((group:any) => {
                            return group.map((clone:any, cloneIndex:any) => {
                              const cloneItem = findObjectDataMap[clone.keyName]
                              const nextIndex = cloneIndex + forCount * i
                              console.log('--------下标状态：', pageImageList, countSize, forCount, nextIndex, i)
                              clone.src = cloneItem ? (cloneItem[nextIndex] || cloneItem[i] || {}).url : ''
                              // 处理图片数据
                              if (clone.src) {
                                this.imageData.set(clone.src, true)
                              }
                              return clone
                            })
                          }).flat(Infinity)
                          console.log('---------处理后的数据列表', pageImageList)
                          // pageImageList = pageImageList.map((clone, cloneIndex) => {
                          //   const cloneItem = findObjectDataMap[clone.keyName]
                          //   const nextIndex = cloneIndex + forCount * i
                          //   console.log('--------下标状态：', pageImageList, countSize, forCount, nextIndex, i)
                          //   clone.src = cloneItem ? (cloneItem[i] || {}).url : ''
                          //   return clone
                          // })
                          pageImageListMap = pageImageList.reduce((prev:any, next:any) => {
                            prev[next.id] = next
                            return prev
                          }, {})

                          cloneData.elements = cloneData.elements.map((m:any) => {
                            if (m.type === 'text') {
                              console.log('打印内容：', m, m.content)
                              if (m.keyName) {
                                m.width = this.getStringCount(m.content) + (m && (m.outline.width || 0)) * 2
                              }
                            } else if (m.type === 'image' && m.keyName !== '品牌LoGo') {
                              // 在imageCount 中查找ID相同的进行赋值
                              m.src = pageImageListMap[m.id] && pageImageListMap[m.id].src ? that.buildImageUrl(pageImageListMap[m.id].src, '') : ''
                              // 处理图片数据
                              if (m.src) {
                                this.imageData.set(m.src, true)
                              }
                              // m.src = pageImageListMap[m.id] && pageImageListMap[m.id].src ? that.buildImageUrl(pageImageListMap[m.id].src, `/resize,w_${parseInt(m.width) * 15},h_${parseInt(m.height) * 15},m_pad`) : ''
                            }
                            return m
                          })
                          dataList.push(JSON.parse(JSON.stringify(cloneData)))
                        }
                      } else {
                        console.error('没有数据，使用默认数据填充！')
                        cloneData.elements = cloneData.elements.map((m:any) => {
                          if (m.type === 'text') {
                            console.log('打印内容3', m.content)
                            if (m.keyName) {
                              m.width = this.getStringCount(m.content) + (m && (m.outline.width || 0)) * 2
                            }
                          } else if (m.type === 'image' && m.keyName !== '品牌LoGo') {
                            // 在imageCount 中查找ID相同的进行赋值
                            m.src = ''
                          }
                          return m
                        })
                        // dataList.push(JSON.parse(JSON.stringify(cloneData)))
                      }
                    }
                  } else {
                    const childrenDataList = formatDataList.map(temp => {
                      return temp.childrenData || []
                    }).flat(Infinity)
                    childrenDataList.forEach((child) => {
                      // 对文本进行过滤，去除不显示的部分
                      const filterList = (child.descText || []).filter((item:any) => item.checked)
                      // 将数据按照名称的方式生成对象
                      const descMap = filterList.reduce((prev:any, next:any) => {
                        prev[next.name] = next.value
                        return prev
                      }, {})
                      if (keyName === '文本类型') {
                        // 对数据进行分割，美18个分一组
                        let count = filterList.length / 18
                        // 开始分组进行数据赋值
                        for (let index = 0; index < Math.ceil(count); index++) {
                          const sliceCount = filterList.slice(index * 18, (index + 1) * 18)
                          const content = sliceCount.map((text:any) => {
                            return `${text.name}: ${text.value}`
                          }).join('\r\n')
                          cloneData.elements = cloneData.elements.map((m:any) => {
                            if (m.type === 'text' && m.keyName.indexOf('文本类型') > -1) {
                              m.content = content
                            } else if (descMap[m.keyName]) {
                              m.content += ': ' + descMap[m.keyName]
                            }
                            m.height = '100%'
                            return m
                          })
                          dataList.push(JSON.parse(JSON.stringify(cloneData)))
                        }
                      } else if (child.name === keyName) {
                        cloneData.elements = cloneData.elements.map((m:any) => {
                          if (m.type === 'text' && descMap[m.keyName]) {
                            m.content += ': ' + descMap[m.keyName]
                          }
                          m.height = '100%'
                          return m
                        })
                        dataList.push(JSON.parse(JSON.stringify(cloneData)))
                      }
                    })
                  }
                }
              }
            }
          } else {
            let cloneListData = []
            for (let index = 0; index < cloneData.elements.length; index++) {
              const m:any = cloneData.elements[index]
              if (m.type === 'text') {
                if (m.keyName) {
                  let findData = item.orderAttributeValueList.find((oav:any) => oav.attrName === m.keyName)
                  if (findData) {
                    m.content = (m.content || '').replace(`@${m.keyName}`, findData.attrValue1 || '')
                  }
                }
              } else if (m.type === 'table') {
                let strData = JSON.stringify(m.data)
                item.orderAttributeValueList.forEach((oav:any) => {
                  strData = strData.replace(new RegExp(`@${oav.attrName}`, 'g'), oav.attrValue1 || '')
                  resultData.name = resultData.name.replaceAll(`${oav.attrName}`, oav.attrValue1 || '')
                })
                m.data = JSON.parse(strData)
              } else if (m.type === 'shape') {
                console.log('插入灯位图片', m.text, item.pointImage)
                if (m.text && m.text.content.indexOf('灯位图') > -1 && item.pointImage) {
                  let newElement = {
                    id: 'YaQQK3',
                    type: 'image',
                    width: 920.9790660225443,
                    height: 428.7879555192562,
                    left: 32.264090177133596,
                    top: 95.27130300590446,
                    src: item.pointImage
                  }
                  cloneListData.push(newElement)
                }
              }
              cloneListData.push(m)
            }
            cloneData.elements = cloneListData
            /**
             * TODO: 设置标题节
             */
            cloneData['sectionName'] = `${item.shopName}`
            dataList.push(JSON.parse(JSON.stringify(cloneData)))
            console.log('当前页码：', dataList.length)
          }
        })
      }
      resultData.list = dataList
      resultData.material = material
      return resultData
    })
  },
  formatName (str:any, item:any, format = 'YYYY-MM-DD') {
    const { name, brandLogo, brandName, shopSn, brandTypeName } = item.shopEntity
    const { requestDate, submissionData } = item
    str = str.replaceAll(this.logoUrl, brandLogo || '')
    str = str.replaceAll('@项目名称', item.projectName || '')
    str = str.replaceAll('@品牌名称', brandName || '')
    str = str.replaceAll('@店铺编号', shopSn || '')
    str = str.replaceAll('@店铺类型', brandTypeName || '')
    str = str.replaceAll('@选择店铺', name || '')
    // str = str.replaceAll('@完工时间', moment(submissionData || new Date()).format(format))
    // str = str.replaceAll('@计划完工', moment(requestDate || new Date()).format(format))
    if (brandLogo) {
      this.imageData.set(brandLogo, true)
    }
    return str
  },
  formatStr: (str:any, num:any) => {
    let initArray = [...str]
    let result = []
    let length = 0
    for (let index = 0; index < initArray.length; index++) {
      if (length >= num) {
        length = 0
        result.push('\n')
        result.push(initArray[index])
      } else {
        result.push(initArray[index])
        length += escape(initArray[index].charAt(0)).length
      }
    }
    return result.join('')
  },
  getChartCount: (str:any) => {
    return [...str].reduce((prev:any, next:any) => {
      prev += escape(next.charAt(0)).length
      return prev
    }, 0)
  },
  // 生产指定数量的请求数据
  genIterator (num:any, values:any) {
    return Array.from({length: num}).map(() => {
      const item = values.next()
      if (!item.done) {
        // return this.downloadFile(item.value)
        return this.downloadImageFile(item.value)
      }
    }).filter(item => item)
  },
  downloadFile (imageUrl:any) {
    return new Promise((resolve, reject) => {
      const formatUrl = imageUrl // .replace('dali-pord.oss-cn-shanghai.aliyuncs.com', 'assets.jokui.com')
      const imageValue = this.imageData.get(imageUrl)
      if (imageValue && imageValue.value && imageValue.value.url && imageValue.value.key) {
        resolve(imageValue.value)
      }
      let img:any = new Image()
      img.crossOrigin = 'Anonymous'
      img.onload = async () => {
        let canvas:any = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.height = img.height
        canvas.width = img.width
        ctx.drawImage(img, 0, 0)
        canvas.toBlob((blob:any) => {
          const url = URL.createObjectURL(blob)
          canvas = null
          resolve({
            url,
            key: imageUrl,
            w: img.width,
            h: img.height
          })
        }, 'image/png', 1)
      }
      img.error = () => {
        resolve(null)
      }
      img.src = formatUrl
    })
  },
  downloadImageFile (imageUrl:any) {
    return new Promise((resolve, reject) => {
      const formatUrl = imageUrl // .replace('dali-pord.oss-cn-shanghai.aliyuncs.com', 'assets.jokui.com')
      const imageValue = this.imageData.get(imageUrl)
      if (imageValue && imageValue.value && imageValue.value.url && imageValue.value.key) {
        resolve(imageValue.value)
      }
      axios({
        url: formatUrl,
        method: 'GET',
        responseType: 'blob',
        responseEncoding: 'utf8',
        headers: {
          'access-control-allow-origin': '*'
        }
      })
      .then((data) => {
        const url = window.URL.createObjectURL(data.data)
        var img:any = new Image()
        // 改变图片的src
        img.src = url
        img.crossOrigin = 'anonymous'
        img.onload = () => {
          resolve({
            url,
            key: imageUrl,
            w: img.width,
            h: img.height
          })
        }
        img.onerror = () => {
          resolve(null)
        }
      })
      .catch(() => {
        resolve(null)
      })
    })
  },
  downloadImageFile3: (url:any) => {
    if (!url) return
    return new Promise((resolve, reject) => {
      let img:any = new Image()
      // 改变图片的src
      img.src = (url.indexOf('?') === -1 ? url : url.substring(0, url.indexOf('?'))) + '?x-oss-process=image/quality,q_1/format,jpg'
      img.crossOrigin = 'anonymous'
      // 加载完成执行
      img.onload = () => {
        // let data = this.a.getBase64Image(img)
        resolve({
          // data: data,
          w: img.width,
          h: img.height
        })
        img = null
      }
      img.onerror = () => {
        resolve(null)
      }
    })
  },
  getBase64Image: (img:any) => {
    let canvas = document.createElement('canvas')
    let ctx:any = canvas.getContext('2d')
    canvas.width = img.width
    canvas.height = img.height
    ctx.drawImage(img, 0, 0, img.width, img.height)
    let url = img.src.split('?')[0]
    let ext = url.substring(url.lastIndexOf('.') + 1).toLowerCase()
    let dataURL = canvas.toDataURL('image/' + ext)
    return dataURL
  },
  downloadImageFile1: (url:any) => {
    return new Promise((resolve, reject) => {
      axios({
        url: url,
        method: 'GET',
        responseType: 'blob',
        responseEncoding: 'utf8'
      })
      .then((data) => {
        var oFileReader:any = new FileReader()
        //  至关重要
        oFileReader.onloadend = (e:any) => {
          console.log(e)
          var img:any = new Image()
          // 改变图片的src
          img.src = e.target.result
          img.crossOrigin = 'anonymous'
          resolve({
            data: e.target.result,
            w: img.width,
            h: img.height
          })
          img = null
        }
        oFileReader.readAsDataURL(data.data)
        oFileReader = null
      })
      .catch((error) => {
        console.log(error)
        resolve(null)
      })
    })
  },
  downloadImageFile2: (url:any) => {
    if (!url) return
    return new Promise((resolve, reject) => {
      axios({
        url: `${url.indexOf('?') === -1 ? url : url.substring(0, url.indexOf('?'))}?x-oss-process=image/info`,
        method: 'GET',
        headers: {
          'access-control-allow-origin': '*'
        }
      }).then((data) => {
        // var oFileReader = new FileReader()
        // //  至关重要
        // oFileReader.onloadend = (e) => {
        //   resolve(e.target.result)
        // }
        // oFileReader.readAsDataURL(data.data)
        resolve({
          w: data.data['ImageWidth']['value'],
          h: data.data['ImageHeight']['value']
        })
      }).catch((error) => {
        reject(error.response)
      })
    })
  },
  exportPPTXItem ({data, type = true, isLastData}:any) {
    let slides = data.list
    console.log('slides: ', data, slides, this.pptx!.sections)
    if (Array.isArray(slides[0])) throw new Error('不能是二维数组，请检查数据类型是否符合[{},{}]')
    return new Promise(async (resolve, reject) => {
      for (const slide of slides) {
        let pptxSlide = null
        // 判断是否有标题节名称
        console.log('节点开关是否打开', this.pptxConfig.isNodeSide === 1)
        if (slide.sectionName && this.pptxConfig.isNodeSide === 1) {
          let findSection = this.pptx!.sections.find((item:any) => item.title === slide.sectionName)
          if (!findSection) {
            this.pptx!.addSection({title: slide.sectionName})
          }
          pptxSlide = this.pptx!.addSlide({
            sectionTitle: slide.sectionName
          })
        } else {
          pptxSlide = this.pptx!.addSlide()
        }

        if (slide.background) {
          const background = slide.background
          if (background.type === 'image' && background.image) {
            pptxSlide.background = { data: background.image }
          } else if (background.type === 'solid' && background.color) {
            const c = this.formatColor(background.color)
            pptxSlide.background = { color: c.color, transparency: (1 - c.alpha) * 100 }
          } else if (background.type === 'gradient' && background.gradientColor) {
            const [color1, color2] = background.gradientColor
            const color = tinycolor.mix(color1, color2).toHexString()
            const c = this.formatColor(color)
            pptxSlide.background = { color: c.color, transparency: (1 - c.alpha) * 100 }
          }
        }

        if (!slide.elements) continue

        for (const el of slide.elements) {
          if (el.type === 'text') {
            const textProps = this.formatHTML(el.content)

            const options:any = {
              x: el.left / 100,
              y: el.top / 100,
              w: el.width / 100,
              h: typeof el.height === 'string' ? 1 : el.height / 100,
              fit: 'shrink',
              fontSize: 20 * 0.75,
              fontFace: '微软雅黑',
              color: '#000000',
              valign: el.valign || 'middle'
            }
            if (el.rotate) options.rotate = el.rotate
            if (el.wordSpace) options.charSpacing = el.wordSpace * 0.75
            if (el.lineHeight) options.lineSpacingMultiple = el.lineHeight * 0.75
            if (el.fill) {
              const c = this.formatColor(el.fill)
              const opacity = el.opacity === undefined ? 1 : el.opacity
              options.fill = { color: c.color, transparency: (1 - c.alpha * opacity) * 100 }
            }
            if (el.defaultColor) options.color = this.formatColor(el.defaultColor).color
            if (el.defaultFontName) options.fontFace = el.defaultFontName
            if (el.shadow && Object.keys(el.shadow).length > 0) {
              const c = this.formatColor(el.shadow.color)
              options.shadow = {
                type: 'outer',
                color: c.color.replace('#', ''),
                opacity: c.alpha,
                blur: el.shadow.blur * 0.75,
                offset: (el.shadow.h + el.shadow.v) / 2 * 0.75,
                angle: 45
              }
            }
            if (el.outline) {
              options.line = {
                color: el.outline.color,
                dashType: el.outline.style === 'solid' ? 'solid' : 'dash',
                width: el.outline.width
              }
            }
            if (el.link) options.hyperlink = { url: el.link }

            pptxSlide.addText(textProps, options)
          } else if (el.type === 'image') {
            let sizing = {}
            const options:any = {
              path: el.src,
              x: el.left / 100,
              y: el.top / 100,
              w: el.width / 100,
              h: el.height / 100,
              sizing: sizing
            }

            // 控制图片，重新计算图片的位置，目的为了解决图片白边问题
            if (el.src) {
              let urlInfo = this.imageData.get(el.src) ? this.imageData.get(el.src) : await this.downloadImageFile(el.src)
              if (urlInfo) {
                options.path = urlInfo.url
                // options['data'] = urlInfo.data
                let imgRatio = urlInfo.w / urlInfo.h
                let boxRatio = el.width / el.height
                // if (urlInfo) {
                //   sizing['type'] = 'cover'
                //   if (parseFloat(urlInfo.w) > parseFloat(urlInfo.h)) {
                //     sizing['w'] = el.width / 100
                //     sizing['h'] = urlInfo.h / (urlInfo.w / (el.width / 100))
                //   } else {
                //     sizing['h'] = el.height / 100
                //     sizing['w'] = urlInfo.w / (urlInfo.h / (el.height / 100))
                //   }
                // }
                // console.log(urlInfo)
                // 控制图片的位置
                if (boxRatio < imgRatio) {
                  options.h = options.w / imgRatio
                  options.y = (el.height / 100 - options.w / imgRatio) / 2 + options.y
                } else {
                  options.w = options.h * imgRatio
                  options.x = (el.width / 100 - options.h * imgRatio) / 2 + options.x
                }
                console.log(
                  `\n图片链接：${el.src}`,
                  `\n图片宽度：${urlInfo.w}`,
                  `\n图片高度：${urlInfo.h}`,
                  `\n图片高度：${imgRatio}`,
                  `\n盒子宽度：${el.width}`,
                  `\n盒子宽度：${el.height}`,
                  `\n盒子比例：${boxRatio}`,
                  `\n最后参数：`,
                  options
                )
              }
            }

            if (el.flipH) options.flipH = el.flipH
            if (el.flipV) options.flipV = el.flipV
            if (el.rotate) options.rotate = el.rotate
            if (el.clip && el.clip.shape === 'ellipse') options.rounding = true
            if (el.link) options.hyperlink = { url: el.link }
            // 必须有数据或者path才进行添加图片
            pptxSlide.addImage(options)
          } else if (el.type === 'shape') {
            if (el.special) {
              const svgRef = document.querySelector(`.thumbnail-list .base-element-${el.id} svg`)
              const base64SVG = this.svg2Base64(svgRef)

              const options:any = {
                data: base64SVG,
                x: el.left / 100,
                y: el.top / 100,
                w: el.width / 100,
                h: el.height / 100
              }
              if (el.rotate) options.rotate = el.rotate
              if (el.link) options.hyperlink = { url: el.link }

              pptxSlide.addImage(options)
            } else {
              const scale = {
                x: el.width / el.viewBox,
                y: el.height / el.viewBox
              }
              const points = this.formatPoints(this.toPoints(el.path), scale)

              const fillColor = this.formatColor(el.fill)
              const opacity = el.opacity === undefined ? 1 : el.opacity

              const options:any = {
                x: el.left / 100,
                y: el.top / 100,
                w: el.width / 100,
                h: el.height / 100,
                fill: { color: fillColor.color, transparency: (1 - fillColor.alpha * opacity) * 100 },
                points
              }
              if (el.flipH) options.flipH = el.flipH
              if (el.flipV) options.flipV = el.flipV
              if (el.outline && el.outline.width) {
                options.line = {
                  color: this.formatColor(el.outline.color || '#000000').color,
                  width: el.outline.width * 0.75,
                  dashType: el.outline.style === 'solid' ? 'solid' : 'dash'
                }
              }
              if (el.shadow && Object.keys(el.shadow).length > 0) {
                const c = this.formatColor(el.shadow.color)
                options.shadow = {
                  type: 'outer',
                  color: c.color.replace('#', ''),
                  opacity: c.alpha,
                  blur: el.shadow.blur * 0.75,
                  offset: (el.shadow.h + el.shadow.v) / 2 * 0.75,
                  angle: 45
                }
              }
              if (el.link) options.hyperlink = { url: el.link }

              pptxSlide.addShape('custGeom', options)
            }
            if (el.text) {
              const textProps = this.formatHTML(el.text.content)

              const options:any = {
                x: el.left / 100,
                y: el.top / 100,
                w: el.width / 100,
                h: el.height / 100,
                fontSize: 20 * 0.75,
                fontFace: '微软雅黑',
                color: '#000000',
                valign: el.text.align
              }
              if (el.rotate) options.rotate = el.rotate
              if (el.text.defaultColor) options.color = this.formatColor(el.text.defaultColor).color
              if (el.text.defaultFontName) options.fontFace = el.text.defaultFontName

              pptxSlide.addText(textProps, options)
            }
          } else if (el.type === 'line') {
            const path = this.getLineElementPath(el)
            const points = this.formatPoints(this.toPoints(path))
            const { minX, maxX, minY, maxY } = this.getElementRange(el)

            const options:any = {
              x: el.left / 100,
              y: el.top / 100,
              w: (maxX - minX) / 100,
              h: (maxY - minY) / 100,
              line: {
                color: this.formatColor(el.color).color,
                width: el.width * 0.75,
                dashType: el.style === 'solid' ? 'solid' : 'dash',
                beginArrowType: el.points[0] ? 'arrow' : 'none',
                endArrowType: el.points[1] ? 'arrow' : 'none'
              },
              points
            }
            pptxSlide.addShape('line', options)
          } else if (el.type === 'chart') {
            const chartData = []
            for (let i = 0; i < el.data.series.length; i++) {
              const item = el.data.series[i]
              chartData.push({
                name: `系列${i + 1}`,
                labels: el.data.labels,
                values: item
              })
            }

            let chartColors = []
            if (el.themeColor.length === 10) chartColors = el.themeColor.map((color:any) => this.formatColor(color).color)
            else if (el.themeColor.length === 1) chartColors = tinycolor(el.themeColor[0]).analogous(10).map(color => this.formatColor(color.toHexString()).color)
            else {
              const len = el.themeColor.length
              const supplement = tinycolor(el.themeColor[len - 1]).analogous(10 + 1 - len).map(color => color.toHexString())
              chartColors = [...el.themeColor.slice(0, len - 1), ...supplement].map(color => this.formatColor(color).color)
            }

            const options:any = {
              x: el.left / 100,
              y: el.top / 100,
              w: el.width / 100,
              h: el.height / 100,
              chartColors: el.chartType === 'pie' ? chartColors : chartColors.slice(0, el.data.series.length)
            }

            if (el.fill) options.fill = this.formatColor(el.fill).color
            if (el.legend) {
              options.showLegend = true
              options.legendPos = el.legend === 'top' ? 't' : 'b'
              options.legendColor = this.formatColor(el.gridColor || '#000000').color
              options.legendFontSize = 14 * 0.75
            }

            let type = this.pptx!.ChartType.bar
            if (el.chartType === 'bar') {
              type = this.pptx!.ChartType.bar
              options.barDir = el.options.horizontalBars ? 'bar' : 'col'
            } else if (el.chartType === 'line') {
              if (el.options.showArea) type = this.pptx!.ChartType.area
              else if (el.options.showLine === false) {
                type = this.pptx!.ChartType.scatter

                chartData.unshift({ name: 'X-Axis', values: Array(el.data.series[0].length).fill(0).map((v, i) => i) })
                options.lineSize = 0
              } else type = this.pptx!.ChartType.line

              if (el.options.lineSmooth) options.lineSmooth = true
            } else if (el.chartType === 'pie') {
              if (el.options.donut) {
                type = this.pptx!.ChartType.doughnut
                options.holeSize = 75
              } else type = this.pptx!.ChartType.pie
            }

            pptxSlide.addChart(type, chartData, options)
          } else if (el.type === 'table') {
            const hiddenCells = []
            for (let i = 0; i < el.data.length; i++) {
              const rowData = el.data[i]

              for (let j = 0; j < rowData.length; j++) {
                const cell = rowData[j]
                if (cell.colspan > 1 || cell.rowspan > 1) {
                  for (let row = i; row < i + cell.rowspan; row++) {
                    for (let col = row === i ? j + 1 : j; col < j + cell.colspan; col++) hiddenCells.push(`${row}_${col}`)
                  }
                }
              }
            }

            const tableData = []

            const theme = el.theme
            let themeColor = null
            let subThemeColors:any = []
            if (theme) {
              themeColor = this.formatColor(theme.color)
              subThemeColors = this.getTableSubThemeColor(theme.color).map(item => this.formatColor(item))
            }

            for (let i = 0; i < el.data.length; i++) {
              const row = el.data[i]
              const _row = []

              for (let j = 0; j < row.length; j++) {
                const cell = row[j]
                const cellOptions:any = {
                  // colspan: cell.colspan,
                  // rowspan: cell.rowspan,
                  bold: cell.style.bold || false,
                  italic: cell.style.em || false,
                  underline: { style: cell.style.underline ? 'sng' : 'none' },
                  align: cell.style.align || 'left',
                  valign: 'middle',
                  fontFace: cell.style.fontname || '微软雅黑',
                  fontSize: (cell.style.fontsize ? parseInt(cell.style.fontsize) : 14) * 0.75
                }
                if (theme && themeColor) {
                  let c:any = {}
                  if (i % 2 === 0) c = subThemeColors[1]
                  else c = subThemeColors[0]

                  if (theme.rowHeader && i === 0) c = themeColor
                  else if (theme.rowFooter && i === el.data.length - 1) c = themeColor
                  else if (theme.colHeader && j === 0) c = themeColor
                  else if (theme.colFooter && j === row.length - 1) c = themeColor

                  cellOptions.fill = { color: c.color, transparency: (1 - c.alpha) * 100 }
                }
                if (cell.style.backcolor) {
                  const c = this.formatColor(cell.style.backcolor)
                  cellOptions.fill = { color: c.color, transparency: (1 - c.alpha) * 100 }
                }
                if (cell.style.color) cellOptions.color = this.formatColor(cell.style.color).color

                if (!hiddenCells.includes(`${i}_${j}`)) {
                  _row.push({
                    text: cell.text,
                    options: cellOptions
                  })
                }
              }
              if (_row.length) tableData.push(_row)
            }

            const options:any = {
              autoPage: true,
              x: el.left / 100,
              y: el.top / 100,
              w: el.width / 100,
              autoPageRepeatHeader: true,
              newSlideStartY: el.top / 100,
              colW: el.colWidths.map((item:any) => el.width * item / 100)
            }

            if (el.rowHeights && el.rowHeights) {
              options['rowH'] = el.rowHeights
            } else if (el.height) {
              options['height'] = el.height / 100
            }

            if (el.outline.width && el.outline.color) {
              options.border = {
                type: el.outline.style === 'solid' ? 'solid' : 'dash',
                pt: el.outline.width * 0.75,
                color: this.formatColor(el.outline.color).color
              }
            }
            console.log('table数据和配置：', tableData, options)
            pptxSlide.addTable(tableData, JSON.parse(JSON.stringify(options)))
          } else if (el.type === 'latex') {
            const svgRef = document.querySelector(`.thumbnail-list .base-element-${el.id} svg`)
            const base64SVG = this.svg2Base64(svgRef)

            const options:any = {
              data: base64SVG,
              x: el.left / 100,
              y: el.top / 100,
              w: el.width / 100,
              h: el.height / 100
            }
            if (el.link) options.hyperlink = { url: el.link }

            pptxSlide.addImage(options)
          }
        }
      }
      console.log(this.pptx)
      // this.pptx.writeFile()
      this.pptx!.write().then((file:any) => {
        this.exporting = false
        if (this.pptxConfig.isMerge === 1) {
          if (isLastData) {
            resolve(file)
          } else {
            resolve(true)
          }
        } else {
          if (type) {
            // saveAs(file, `${false || moment().format('YYYY-MM-DD-HH-mm-ss')}.pptx`)
            saveAs(file, `${new Date().getTime()}.pptx`)
          } else {
            resolve(file)
          }
        }
      }).catch(() => {
        this.exporting = false
        // this.$message.error('导出失败')
      })
    })
  },
  buildImageUrl (url:any, config:any) {
    if (!url) {
      return url
    } else {
      if (url.indexOf('?x-oss-process=image') > -1) {
        url = url + config
      } else {
        url = url + `?x-oss-process=image${config || ''}`
      }
      return url + (this.compressConfig.isCompress ? this.compressConfig.remark : '/format,jpg')
    }
  },
  getStringCount (str:any) {
    const div = document.createElement('div')
    div.innerHTML = str
    return Array.from(div.innerText).reduce((prev:any, next:any) => {
      if (new RegExp(/[\u0391-\uFFE5]/).test(next)) {
        prev += 4 * 7.5
        // console.warn('汉字', next, prev)
      } else if (new RegExp(/[A-Z]/).test(next)) {
        prev += 4 * 7
        // console.warn('字母', next, prev)
      } else {
        prev += 2 * 7
        // console.warn('特殊', next, prev)
      }
      return prev
    }, 0)
  },
  utf8Encode (string:any) {
    string = string.replace(/\r\n/g, '\n')
    let utftext = ''
    for (let n = 0; n < string.length; n++) {
      const c = string.charCodeAt(n)
      if (c < 128) {
        utftext += String.fromCharCode(c)
      } else if (c > 127 && c < 2048) {
        utftext += String.fromCharCode((c >> 6) | 192)
        utftext += String.fromCharCode((c & 63) | 128)
      } else {
        utftext += String.fromCharCode((c >> 12) | 224)
        utftext += String.fromCharCode(((c >> 6) & 63) | 128)
        utftext += String.fromCharCode((c & 63) | 128)
      }
    }

    return utftext
  },
  encode (input:any) {
    let output = ''
    let chr1, chr2, chr3, enc1, enc2, enc3, enc4
    let i = 0
    input = this.utf8Encode(input)
    while (i < input.length) {
      chr1 = input.charCodeAt(i++)
      chr2 = input.charCodeAt(i++)
      chr3 = input.charCodeAt(i++)
      enc1 = chr1 >> 2
      enc2 = ((chr1 & 3) << 4) | (chr2 >> 4)
      enc3 = ((chr2 & 15) << 2) | (chr3 >> 6)
      enc4 = chr3 & 63
      if (isNaN(chr2)) enc3 = enc4 = 64
      else if (isNaN(chr3)) enc4 = 64
      output = output + this.characters.charAt(enc1) + this.characters.charAt(enc2) + this.characters.charAt(enc3) + this.characters.charAt(enc4)
    }
    return output
  },
  svg2Base64 (element:any) {
    const XMLS = new XMLSerializer()
    const svg = XMLS.serializeToString(element)
    return this.PREFIX + this.encode(svg)
  },
  getRectRotatedRange (element:any) {
    const { left, top, width, height, rotate = 0 } = element
    const radius = Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2)) / 2
    const auxiliaryAngle = Math.atan(height / width) * 180 / Math.PI
    const tlbraRadian = (180 - rotate - auxiliaryAngle) * Math.PI / 180
    const trblaRadian = (auxiliaryAngle - rotate) * Math.PI / 180
    const middleLeft = left + width / 2
    const middleTop = top + height / 2
    const xAxis = [
      middleLeft + radius * Math.cos(tlbraRadian),
      middleLeft + radius * Math.cos(trblaRadian),
      middleLeft - radius * Math.cos(tlbraRadian),
      middleLeft - radius * Math.cos(trblaRadian)
    ]
    const yAxis = [
      middleTop - radius * Math.sin(tlbraRadian),
      middleTop - radius * Math.sin(trblaRadian),
      middleTop + radius * Math.sin(tlbraRadian),
      middleTop + radius * Math.sin(trblaRadian)
    ]
    return {
      xRange: [Math.min(...xAxis), Math.max(...xAxis)],
      yRange: [Math.min(...yAxis), Math.max(...yAxis)]
    }
  },
  /**
   * 计算元素在画布中的矩形范围旋转后的新位置与旋转之前位置的偏离距离
   * @param element 元素的位置大小和旋转角度信息
   */
  getRectRotatedOffset (element:any) {
    const { xRange: originXRange, yRange: originYRange } = this.getRectRotatedRange({
      left: element.left,
      top: element.top,
      width: element.width,
      height: element.height,
      rotate: 0
    })
    const { xRange: rotatedXRange, yRange: rotatedYRange } = this.getRectRotatedRange({
      left: element.left,
      top: element.top,
      width: element.width,
      height: element.height,
      rotate: element.rotate
    })
    return {
      offsetX: rotatedXRange[0] - originXRange[0],
      offsetY: rotatedYRange[0] - originYRange[0]
    }
  },
  /**
   * 计算元素在画布中的位置范围
   * @param element 元素信息
   */
  getElementRange (element:any) {
    let minX, maxX, minY, maxY

    if (element.type === 'line') {
      minX = element.left
      maxX = element.left + Math.max(element.start[0], element.end[0])
      minY = element.top
      maxY = element.top + Math.max(element.start[1], element.end[1])
    } else if ('rotate' in element && element.rotate) {
      const { left, top, width, height, rotate } = element
      const { xRange, yRange } = this.getRectRotatedRange({ left, top, width, height, rotate })
      minX = xRange[0]
      maxX = xRange[1]
      minY = yRange[0]
      maxY = yRange[1]
    } else {
      minX = element.left
      maxX = element.left + element.width
      minY = element.top
      maxY = element.top + element.height
    }
    return { minX, maxX, minY, maxY }
  },
  /**
   * 计算一组元素在画布中的位置范围
   * @param elementList 一组元素信息
   */
  getElementListRange (elementList:any) {
    const leftValues:any = []
    const topValues:any = []
    const rightValues:any = []
    const bottomValues:any = []

    elementList.forEach((element:any) => {
      const { minX, maxX, minY, maxY } = this.getElementRange(element)
      leftValues.push(minX)
      topValues.push(minY)
      rightValues.push(maxX)
      bottomValues.push(maxY)
    })

    const minX = Math.min(...leftValues)
    const maxX = Math.max(...rightValues)
    const minY = Math.min(...topValues)
    const maxY = Math.max(...bottomValues)

    return { minX, maxX, minY, maxY }
  },
  /**
   * 将一组对齐吸附线进行去重：同位置的的多条对齐吸附线仅留下一条，取该位置所有对齐吸附线的最大值和最小值为新的范围
   * @param lines 一组对齐吸附线信息
   */
  uniqAlignLines (lines:any) {
    const uniqLines:any = []
    lines.forEach((line:any) => {
      const index = uniqLines.findIndex((_line:any) => _line.value === line.value)
      if (index === -1) uniqLines.push(line)
      else {
        const uniqLine = uniqLines[index]
        const rangeMin = Math.min(uniqLine.range[0], line.range[0])
        const rangeMax = Math.max(uniqLine.range[1], line.range[1])
        const range = [rangeMin, rangeMax]
        const _line = { value: line.value, range }
        uniqLines[index] = _line
      }
    })
    return uniqLines
  },
  /**
   * 以元素列表为基础，为每一个元素生成新的ID，并关联到旧ID形成一个字典
   * 主要用于复制元素时，维持数据中各处元素ID原有的关系
   * 例如：原本两个组合的元素拥有相同的groupId，复制后依然会拥有另一个相同的groupId
   * @param elements 元素列表数据
   */
  createElementIdMap (elements:any) {
    const groupIdMap:any = {}
    const elIdMap:any = {}
    for (const element of elements) {
      const groupId = element.groupId
      if (groupId && !groupIdMap[groupId]) {
        groupIdMap[groupId] = this.createRandomCode()
      }
      elIdMap[element.id] = this.createRandomCode()
    }
    return {
      groupIdMap,
      elIdMap
    }
  },
  /**
   * 生成随机码
   * @param len 随机码长度
   */
  createRandomCode (len = 6) {
    const charset = `_0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz`
    const maxLen = charset.length
    let ret = ''
    for (let i = 0; i < len; i++) {
      const randomIndex = Math.floor(Math.random() * maxLen)
      ret += charset[randomIndex]
    }
    return ret
  },
  /**
   * 根据表格的主题色，获取对应用于配色的子颜色
   * @param themeColor 主题色
   */
  getTableSubThemeColor (themeColor:any) {
    const rgba = tinycolor(themeColor).toRgb()
    const subRgba1 = { r: rgba.r, g: rgba.g, b: rgba.b, a: rgba.a * 0.3 }
    const subRgba2 = { r: rgba.r, g: rgba.g, b: rgba.b, a: rgba.a * 0.1 }
    return [
      `rgba(${[subRgba1.r, subRgba1.g, subRgba1.b, subRgba1.a].join(',')})`,
      `rgba(${[subRgba2.r, subRgba2.g, subRgba2.b, subRgba2.a].join(',')})`
    ]
  },
  /**
   * 获取线条元素路径字符串
   * @param element 线条元素
   */
  getLineElementPath (element:any) {
    const start = element.start.join(',')
    const end = element.end.join(',')
    if (element.broken instanceof Array && element.broken.length > 0) {
      const mid = element.broken.join(',')
      return `M${start} L${mid} L${end}`
    }
    if (element.curve instanceof Array && element.curve.length > 0) {
      const mid = element.curve.join(',')
      return `M${start} Q${mid} ${end}`
    }
    return `M${start} L${end}`
  },
  jumpPosition (state:any, end:any) {
    const len = end - state.position
    this.movePositopn(state, len)
  },
  movePositopn (state:any, len:any) {
    state.position = state.position + len
  },
  findTextEnd (str:any, index:any) {
    let isEnd = false
    while (!isEnd) {
      const textEnd = str.indexOf('<', index)
      if (textEnd === -1) {
        isEnd = true
        return textEnd
      }
      const char = str.charAt(textEnd + 1)
      if (char === '/' || char === '!' || /[A-Za-z0-9]/.test(char)) {
        isEnd = true
        return textEnd
      }
      index = textEnd + 1
    }
    return -1
  },
  lexText (state:any) {
    const { str } = state
    let textEnd = this.findTextEnd(str, state.position)
    if (textEnd === state.position) return
    if (textEnd === -1) {
      textEnd = str.length
    }

    const content = str.slice(state.position, textEnd)
    this.jumpPosition(state, textEnd)

    state.tokens.push({
      type: 'text',
      content
    })
  },
  lexComment (state:any) {
    const { str } = state

    this.movePositopn(state, 4)
    let contentEnd = str.indexOf('-->', state.position)
    let commentEnd = contentEnd + 3
    if (contentEnd === -1) {
      contentEnd = commentEnd = str.length
    }

    const content = str.slice(state.position, contentEnd)
    this.jumpPosition(state, commentEnd)

    state.tokens.push({
      type: 'comment',
      content
    })
  },
  lexTagName (state:any) {
    const { str } = state
    const len = str.length
    let start = state.position

    while (start < len) {
      const char = str.charAt(start)
      const isTagChar = !(/\s/.test(char) || char === '/' || char === '>')
      if (isTagChar) break
      start++
    }

    let end = start + 1
    while (end < len) {
      const char = str.charAt(end)
      const isTagChar = !(/\s/.test(char) || char === '/' || char === '>')
      if (!isTagChar) break
      end++
    }

    this.jumpPosition(state, end)
    const tagName = str.slice(start, end)
    state.tokens.push({
      type: 'tag',
      content: tagName
    })
    return tagName
  },
  lexTagAttributes (state:any) {
    const { str, tokens } = state
    let cursor = state.position
    let quote = null
    let wordBegin = cursor
    const words = []
    const len = str.length
    while (cursor < len) {
      const char = str.charAt(cursor)
      if (quote) {
        const isQuoteEnd = char === quote
        if (isQuoteEnd) quote = null
        cursor++
        continue
      }

      const isTagEnd = char === '/' || char === '>'
      if (isTagEnd) {
        if (cursor !== wordBegin) words.push(str.slice(wordBegin, cursor))
        break
      }

      const isWordEnd = /\s/.test(char)
      if (isWordEnd) {
        if (cursor !== wordBegin) words.push(str.slice(wordBegin, cursor))
        wordBegin = cursor + 1
        cursor++
        continue
      }

      const isQuoteStart = char === '\'' || char === '"'
      if (isQuoteStart) {
        quote = char
        cursor++
        continue
      }

      cursor++
    }
    this.jumpPosition(state, cursor)

    const type = 'attribute'
    for (let i = 0; i < words.length; i++) {
      const word = words[i]
      const isNotPair = word.indexOf('=') === -1
      if (isNotPair) {
        const secondWord = words[i + 1]
        if (secondWord && startsWith(secondWord, '=')) {
          if (secondWord.length > 1) {
            const newWord = word + secondWord
            tokens.push({ type, content: newWord })
            i += 1
            continue
          }
          const thirdWord = words[i + 2]
          i += 1
          if (thirdWord) {
            const newWord = word + '=' + thirdWord
            tokens.push({ type, content: newWord })
            i += 1
            continue
          }
        }
      }
      if (endsWith(word, '=')) {
        const secondWord = words[i + 1]
        if (secondWord && secondWord.indexOf('=') === -1) {
          const newWord = word + secondWord
          tokens.push({ type, content: newWord })
          i += 1
          continue
        }

        const newWord = word.slice(0, -1)
        tokens.push({ type, content: newWord })
        continue
      }

      tokens.push({ type, content: word })
    }
  },
  lexSkipTag (tagName:any, state:any) {
    const { str, tokens } = state
    const safeTagName = tagName.toLowerCase()
    const len = str.length
    let index = state.position

    while (index < len) {
      const nextTag = str.indexOf('</', index)
      if (nextTag === -1) {
        this.lexText(state)
        break
      }

      const tagState = {
        str,
        position: state.position,
        tokens: []
      }
      this.jumpPosition(tagState, nextTag)
      const name = this.lexTag(tagState)
      if (safeTagName !== name.toLowerCase()) {
        index = tagState.position
        continue
      }

      if (nextTag !== state.position) {
        const textStart = state.position
        this.jumpPosition(state, nextTag)
        tokens.push({
          type: 'text',
          content: str.slice(textStart, nextTag)
        })
      }

      tokens.push(...tagState.tokens)
      this.jumpPosition(state, tagState.position)
      break
    }
  },
  lexTag (state:any) {
    const { str } = state
    const secondChar = str.charAt(state.position + 1)
    const tagStartClose = secondChar === '/'
    this.movePositopn(state, tagStartClose ? 2 : 1)
    state.tokens.push({
      type: 'tag-start',
      close: tagStartClose
    })

    const tagName = this.lexTagName(state)
    this.lexTagAttributes(state)

    const firstChar = str.charAt(state.position)
    const tagEndClose = firstChar === '/'
    this.movePositopn(state, tagEndClose ? 2 : 1)
    state.tokens.push({
      type: 'tag-end',
      close: tagEndClose
    })
    return tagName
  },
  lex (state:any) {
    const str = state.str
    const len = str.length

    while (state.position < len) {
      const start = state.position
      this.lexText(state)

      if (state.position === start) {
        const isComment = startsWith(str, '!--', start + 1)
        if (isComment) this.lexComment(state)
        else {
          const tagName = this.lexTag(state)
          const safeTag = tagName.toLowerCase()
          if (this.childlessTags.includes(safeTag)) this.lexSkipTag(tagName, state)
        }
      }
    }
  },
  lexer (str:any) {
    const state = {
      str,
      position: 0,
      tokens: []
    }
    this.lex(state)
    return state.tokens
  },
  parser (tokens:any) {
    const root = { tagName: null, children: [] }
    const state = { tokens, cursor: 0, stack: [root] }
    this.parse(state)
    return root.children
  },
  parse (state:any) {
    const { stack, tokens } = state
    let { cursor } = state
    let nodes = stack[stack.length - 1].children
    const len = tokens.length

    while (cursor < len) {
      const token = tokens[cursor]
      if (token.type !== 'tag-start') {
        nodes.push(token)
        cursor++
        continue
      }

      const tagToken = tokens[++cursor]
      cursor++
      const tagName = tagToken.content.toLowerCase()
      if (token.close) {
        let index = stack.length
        let shouldRewind = false
        while (--index > -1) {
          if (stack[index].tagName === tagName) {
            shouldRewind = true
            break
          }
        }
        while (cursor < len) {
          if (tokens[cursor].type !== 'tag-end') break
          cursor++
        }
        if (shouldRewind) {
          this.rewindStack(stack, index)
          break
        } else continue
      }

      const isClosingTag = this.closingTags.includes(tagName)
      let shouldRewindToAutoClose = isClosingTag
      if (shouldRewindToAutoClose) {
        shouldRewindToAutoClose = !this.hasTerminalParent(tagName, stack)
      }

      if (shouldRewindToAutoClose) {
        let currentIndex = stack.length - 1
        while (currentIndex > 0) {
          if (tagName === stack[currentIndex].tagName) {
            this.rewindStack(stack, currentIndex)
            const previousIndex = currentIndex - 1
            nodes = stack[previousIndex].children
            break
          }
          currentIndex = currentIndex - 1
        }
      }

      const attributes = []
      let tagEndToken
      while (cursor < len) {
        const _token = tokens[cursor]
        if (_token.type === 'tag-end') {
          tagEndToken = _token
          break
        }
        attributes.push((_token).content)
        cursor++
      }

      if (!tagEndToken) break

      cursor++
      const children:any = []
      const elementNode = {
        type: 'element',
        tagName: tagToken.content,
        attributes,
        children
      }
      nodes.push(elementNode)

      const hasChildren = !(tagEndToken.close || this.voidTags.includes(tagName))
      if (hasChildren) {
        stack.push({tagName, children})
        const innerState = { tokens, cursor, stack }
        this.parse(innerState)
        cursor = innerState.cursor
      }
    }
    state.cursor = cursor
  },
  hasTerminalParent (tagName:any, stack:any) {
    const tagParents:any = this.closingTagAncestorBreakers[tagName]!
    if (tagParents) {
      let currentIndex = stack.length - 1
      while (currentIndex >= 0) {
        const parentTagName = stack[currentIndex].tagName
        if (parentTagName === tagName) break
        if (tagParents.includes(parentTagName)) return true
        currentIndex--
      }
    }
    return false
  },
  rewindStack (stack:any, newLength:any) {
    stack.splice(newLength)
  },
  splitHead (str:any, sep:any) {
    const idx = str.indexOf(sep)
    if (idx === -1) return [str]
    return [str.slice(0, idx), str.slice(idx + sep.length)]
  },
  unquote (str:any) {
    const car = str.charAt(0)
    const end = str.length - 1
    const isQuoteStart = car === '"' || car === "'"
    if (isQuoteStart && car === str.charAt(end)) {
      return str.slice(1, end)
    }
    return str
  },
  formatAttributes (attributes:any) {
    return attributes.map((attribute:any) => {
      const parts = this.splitHead(attribute.trim(), '=')
      const key = parts[0]
      const value = typeof parts[1] === 'string' ? this.unquote(parts[1]) : null
      return { key, value }
    })
  },
  format (nodes:any) {
    return nodes.map((node:any) => {
      if (node.type === 'element') {
        const children = this.format(node.children)
        const item = {
          type: 'element',
          tagName: node.tagName.toLowerCase(),
          attributes: this.formatAttributes(node.attributes),
          children
        }
        return item
      }

      const item = {
        type: node.type,
        content: node.content
      }
      return item
    })
  },
  toAST (str:any) {
    const tokens = this.lexer(str)
    const nodes = this.parser(tokens)
    return this.format(nodes)
  },
  formatHTML (html:any) {
    const ast = this.toAST(html)
    const slices:any = []
    const parse = (obj:any, baseStyleObj = {}) => {
      for (const item of obj) {
        if ('tagName' in item && ['div', 'ul', 'li', 'p'].includes(item.tagName) && slices.length) {
          const lastSlice = slices[slices.length - 1]
          if (!lastSlice.options) lastSlice.options = {}
          lastSlice.options.breakLine = true
        }

        const styleObj:any = { ...baseStyleObj }
        const styleAttr = 'attributes' in item ? item.attributes.find((attr:any) => attr.key === 'style') : null
        if (styleAttr && styleAttr.value) {
          const styleArr = styleAttr.value.split(';')
          for (const styleItem of styleArr) {
            const [_key, _value] = styleItem.split(': ')
            const [key, value] = [(_key || '').trim(), (_value || '').trim()]
            if (key && value) styleObj[key] = value
          }
        }

        if ('tagName' in item) {
          if (item.tagName === 'em') {
            styleObj['font-style'] = 'italic'
          }
          if (item.tagName === 'strong') {
            styleObj['font-weight'] = 'bold'
          }
          if (item.tagName === 'sup') {
            styleObj['vertical-align'] = 'super'
          }
          if (item.tagName === 'sub') {
            styleObj['vertical-align'] = 'sub'
          }
        }

        if ('tagName' in item && item.tagName === 'br') {
          slices.push({ text: '', options: { breakLine: true } })
        } else if ('content' in item) {
          const text = item.content.replace(/\n/g, '').replace(/&nbsp;/g, ' ')
          const options:any = {}

          if (styleObj['font-size']) {
            options.fontSize = parseInt(styleObj['font-size']) * 0.75
          }
          if (styleObj['color']) {
            options.color = this.formatColor(styleObj['color']).color
          }
          if (styleObj['background-color']) {
            options.highlight = this.formatColor(styleObj['background-color']).color
          }
          if (styleObj['text-decoration-line']) {
            if (styleObj['text-decoration-line'].indexOf('underline') !== -1) {
              options.underline = {
                color: options.color || '#000000',
                style: 'sng'
              }
            }
            if (styleObj['text-decoration-line'].indexOf('line-through') !== -1) {
              options.strike = 'sngStrike'
            }
          }
          if (styleObj['text-decoration']) {
            if (styleObj['text-decoration'].indexOf('underline') !== -1) {
              options.underline = {
                color: options.color || '#000000',
                style: 'sng'
              }
            }
            if (styleObj['text-decoration'].indexOf('line-through') !== -1) {
              options.strike = 'sngStrike'
            }
          }
          if (styleObj['vertical-align']) {
            if (styleObj['vertical-align'] === 'super') options.superscript = true
            if (styleObj['vertical-align'] === 'sub') options.subscript = true
          }
          if (styleObj['text-align']) options.align = styleObj['text-align']
          if (styleObj['font-weight']) options.bold = styleObj['font-weight'] === 'bold'
          if (styleObj['font-style']) options.italic = styleObj['font-style'] === 'italic'
          if (styleObj['font-family']) options.fontFace = styleObj['font-family']

          slices.push({ text, options })
        } else if ('children' in item) parse(item.children, styleObj)
      }
    }
    parse(ast)
    return slices
  },
  parseSvgPath (d:any) {
    const pathData = new SVGPathData(d)
    const ret = pathData.commands.map(item => {
      return { ...item, type: this.typeMap[item.type] }
    })
    return ret
  },
  toPoints (d:any) {
    const pathData = new SVGPathData(d)

    const points = []
    for (const item of pathData.commands) {
      const type = this.typeMap[item.type]

      if (item.type === 2 || item.type === 16) {
        points.push({
          x: item.x,
          y: item.y,
          relative: item.relative,
          type
        })
      }
      if (item.type === 32) {
        points.push({
          x: item.x,
          y: item.y,
          curve: {
            type: 'cubic',
            x1: item.x1,
            y1: item.y1,
            x2: item.x2,
            y2: item.y2
          },
          relative: item.relative,
          type
        })
      } else if (item.type === 128) {
        points.push({
          x: item.x,
          y: item.y,
          curve: {
            type: 'quadratic',
            x1: item.x1,
            y1: item.y1
          },
          relative: item.relative,
          type
        })
      } else if (item.type === 512) {
        const lastPoint = points[points.length - 1]
        if (!['M', 'L', 'Q', 'C'].includes(lastPoint.type)) continue
        const cubicBezierPoints = arcToBezier({
          px: lastPoint.x!,
          py: lastPoint.y!,
          cx: item.x,
          cy: item.y,
          rx: item.rX,
          ry: item.rY,
          xAxisRotation: item.xRot,
          largeArcFlag: item.lArcFlag,
          sweepFlag: item.sweepFlag
        })
        for (const cbPoint of cubicBezierPoints) {
          points.push({
            x: cbPoint.x,
            y: cbPoint.y,
            curve: {
              type: 'cubic',
              x1: cbPoint.x1,
              y1: cbPoint.y1,
              x2: cbPoint.x2,
              y2: cbPoint.y2
            },
            relative: false,
            type: 'C'
          })
        }
      } else if (item.type === 1) {
        points.push({ close: true, type })
      } else continue
    }
    return points
  },
  formatColor (_color:any) {
    const c = tinycolor(_color)
    const alpha = c.getAlpha()
    const color = alpha === 0 ? '#ffffff' : c.setAlpha(1).toHexString()
    return {
      alpha,
      color
    }
  },
  // 将SVG路径信息格式化为pptxgenjs所需要的格式
  formatPoints (points:any, scale = { x: 1, y: 1 }) {
    return points.map((point:any) => {
      if (point.close !== undefined) {
        return { close: true }
      } else if (point.type === 'M') {
        return {
          x: point.x / 100 * scale.x,
          y: point.y / 100 * scale.y,
          moveTo: true
        }
      } else if (point.curve) {
        if (point.curve.type === 'cubic') {
          return {
            x: point.x / 100 * scale.x,
            y: point.y / 100 * scale.y,
            curve: {
              type: 'cubic',
              x1: (point.curve.x1) / 100 * scale.x,
              y1: (point.curve.y1) / 100 * scale.y,
              x2: (point.curve.x2) / 100 * scale.x,
              y2: (point.curve.y2) / 100 * scale.y
            }
          }
        } else if (point.curve.type === 'quadratic') {
          return {
            x: point.x / 100 * scale.x,
            y: point.y / 100 * scale.y,
            curve: {
              type: 'quadratic',
              x1: (point.curve.x1) / 100 * scale.x,
              y1: (point.curve.y1) / 100 * scale.y
            }
          }
        }
      }
      return {
        x: point.x / 100 * scale.x,
        y: point.y / 100 * scale.y
      }
    })
  }
}
