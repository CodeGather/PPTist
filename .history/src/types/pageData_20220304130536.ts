/*
 * @Author: 21克的爱情
 * @Date: 2022-02-28 15:55:13
 * @Email: raohong07@163.com
 * @LastEditors: 21克的爱情
 * @LastEditTime: 2022-03-04 13:05:20
 * @Description: 初始化数据结构
 */
import { Slide } from '@/types/slides'

export interface OrderDataList {
  children: string | null;
  isAppraise: boolean;
  isCaculateMethod: boolean;
  isCurrencyRmb: boolean;
  isMasterProcess: boolean;
  isMustUpload: boolean;
  isNumber: boolean;
  isPhoto: boolean;
  isPhotoLocation: boolean;
  isShowOnClient: boolean;
  isShowOnSupply: boolean;
  isSub: boolean;
  isTextDesc: boolean;
  isVideo: boolean;
  name: string;
  orderId?: null;
  photo?: null;
  remarks?: null;
  textDesc?: null;
  totalPriceFormula?: null;
  totalTax?: null;
  typeId: number;
  video?: null;
}

export interface OrderConstructionTypeList {
  id: number;
  name: string;
  isChildren: boolean;
  isMultiRow: boolean;
  isOrderQuote: boolean;
  isOrderToMaster: boolean;
  isShowOnMaster: boolean;
  isShowOnSupplier: boolean;
  isSupplierMultiRow: boolean;
  isVerify: boolean;
  parentId: number;
}

export interface OrderAttributeDoList {
  id: number;
  attrCode: string;
  attrName: string;
  attrValue: any | null;
  mustUpload: boolean;
  showOnMaster: boolean;
  propId?: string;
}

export interface OrderAttributeValueList {
  id?: number | null;
  attrId: number;
  name: string;
  attrCode: string;
  attrName: string;
  propId?: string;
}

export interface OrderTypeDataTypeList {
  id: number;
  name: string;
  isMustUpload: boolean;
  isPhotoLocation: boolean;
}

export type InitData = OrderDataList | OrderConstructionTypeList | OrderAttributeDoList | OrderAttributeValueList | OrderTypeDataTypeList

/**
 * 项目点位初始化数据
 */
export interface PrepareOrderInitData {
  code?: number;
  constructionTypeList?: InitData[];
  orderAttributeDoList?: InitData[];
  orderAttributeValueList?: InitData[];
  orderTypeDataTypeList?: InitData[];
  orderDataList?: OrderDataList[];
}


export interface PptxDataConfig {
  id?: number | null;
  name: string;
  fileName?: string;
  content: Slide[];
}

export const defaultPptxDataConfig: PptxDataConfig = {
  id: null,
  name: '',
  fileName: '',
  content: [],
}