/*
 * @Author: 21克的爱情
 * @Date: 2022-02-28 15:55:13
 * @Email: raohong07@163.com
 * @LastEditors: 21克的爱情
 * @LastEditTime: 2022-03-01 17:15:00
 * @Description: 初始化数据结构
 */
export interface OorderDataList {
  id: number;
  attrCode: string;
  attrName: string;
  goodsIsSelectComb: boolean;
  goodsNum: boolean;
  goodsStock: boolean;
  goodsUseStockNum: boolean;
  isCurrencyCny: boolean;
  isFileUpload: boolean;
  isLogistics: boolean;
  isMustUpload: boolean;
  isNumber: boolean;
  isSelect: boolean;
  isSelectMaster: boolean;
  isSelectMasterCurrency: boolean;
  isSelectShop: boolean;
  isSelectSupervisor: boolean;
  isSelectSupervisorCurrency: boolean;
  isSelectSupplier: boolean;
  isShowOnMaster: boolean;
  isShowOnSupplier: boolean;
  isShowOnTable: boolean;
  isTextDesc: boolean;
  isTime: boolean;
  isVideoUpload: boolean;
  remarks?: string;
  selectCombConfig?: string;
  tenantId: number;
  tenantName?: string;
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

export type InitData = OorderDataList | OrderConstructionTypeList | OrderAttributeDoList | OrderAttributeValueList | OrderTypeDataTypeList

/**
 * 项目点位初始化数据
 */
export interface PrepareOrderInitData {
  constructionTypeList: InitData[];
  orderAttributeDoList: InitData[];
  orderAttributeValueList: InitData[];
  orderTypeDataTypeList: InitData[];
  orderDataList:  InitData[];
}
