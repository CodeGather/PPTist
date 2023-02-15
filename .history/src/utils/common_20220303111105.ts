import { padStart } from 'lodash'

/**
 * 生成随机码
 * @param len 随机码长度
 */
export const createRandomCode = (len = 6) => {
  const charset = `_0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz`
  const maxLen = charset.length
  let ret = ''
  for (let i = 0; i < len; i++) {
    const randomIndex = Math.floor(Math.random() * maxLen)
    ret += charset[randomIndex]
  }
  return ret
}

/**
 * 补足数字位数
 * @param digit 数字
 * @param len 位数
 */
export const fillDigit = (digit: number, len: number) => {
  return padStart('' + digit, len, '0')
}

/*
 * 获取路径的参数
 */
export const getLocationHost = (key: string) => {
  return location.origin
}

/*
 * 获取路径的参数
 */
export const getSearchPathValue = (key: string) => {
  let pathValue = location.search
  if (!pathValue) return ''
  if (pathValue.indexOf('?') > -1) {
    pathValue = pathValue.slice(1)
  }
  const pathObjectData = pathValue.split('&').reduce((prev: any, next: string) => { 
    if (next.indexOf('=') > -1) {
      const itemValue = next.split('=')
      prev[itemValue[0]] = itemValue[1]
    }
    return prev
  }, {})
  return pathObjectData[key] || ''
}