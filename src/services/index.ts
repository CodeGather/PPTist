import axios from './config'

export const SERVER_URL = (import.meta.env.MODE === 'development') ? '/api' : 'https://server.pptist.cn'
export const ASSET_URL = 'https://asset.pptist.cn'
export const SERVER_URL_HOST = 'https://dali.civiccloud.cn'


export default {
  getReportData(reportId: string): Promise<any> {
    return axios.get(`${SERVER_URL_HOST}/jokui-dali-fast/sys/report/info/${reportId}`)
  },
  getOrderList(projectId: string, constructionId: string, page = 1, limit = 10): Promise<any> {
    return axios.post(
      `${SERVER_URL_HOST}/jokui-dali-fast/orm/ormorder/listNew`,
      { page, limit, projectId, constructionId }
    )
  },
  getOrderDetail(orderId: string): Promise<any> {
    return axios.get(`${ASSET_URL}/data/.json`)
  },

  getMockData(filename: string): Promise<any> {
    return axios.get(`./mocks/${filename}.json`)
  },

  getFileData(filename: string): Promise<any> {
    return axios.get(`${ASSET_URL}/data/${filename}.json`)
  },

  AIPPT_Outline(
    content: string,
    language: string,
    model: string,
  ): Promise<any> {
    return fetch(`${SERVER_URL}/tools/aippt_outline`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content,
        language,
        model,
        stream: true,
      }),
    })
  },

  AIPPT(
    content: string,
    language: string,
    model: string,
  ) {
    return axios.post(`${SERVER_URL}/tools/aippt`, {
      content,
      language,
      model,
    })
  },
}