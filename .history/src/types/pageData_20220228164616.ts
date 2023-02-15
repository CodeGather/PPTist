/*
 * @Author: 21克的爱情
 * @Date: 2022-02-28 15:55:13
 * @Email: raohong07@163.com
 * @LastEditors: 21克的爱情
 * @LastEditTime: 2022-02-28 16:44:26
 * @Description: 初始化数据结构
 */
export interface OrderAttributeDoList {
  id: number;
  attrCode: string;
  attrName: string;
  attrValue: any | null;
  mustUpload: boolean,
  showOnMaster: boolean,
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

export type InitData = OrderAttributeDoList | OrderAttributeValueList | OrderTypeDataTypeList

/**
 * 项目点位初始化数据
 */
export interface PrepareOrderInitData {
  orderAttributeDoList: InitData[];
  orderAttributeValueList: InitData[];
  orderTypeDataTypeList: InitData[];
}
