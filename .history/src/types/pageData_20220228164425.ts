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
  msg: string;
  code: number;
  orderAttributeDoList: InitData[];
  orderAttributeValueList: InitData[];
  orderTypeDataTypeList: InitData[];
}