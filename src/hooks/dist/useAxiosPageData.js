"use strict";
/*
 * @Author: 21克的爱情
 * @Date: 2022-02-28 15:42:30
 * @Email: raohong07@163.com
 * @LastEditors: 21克的爱情
 * @LastEditTime: 2022-08-05 11:08:49
 * @Description: 统一请求数据
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var axios_1 = require("axios");
var vue_1 = require("vue");
var pageDataStatus_1 = require("@/types/pageDataStatus");
var slides_1 = require("@/mocks/slides");
var store_1 = require("@/store");
var common_1 = require("@/utils/common");
exports["default"] = (function () {
    var store = store_1.useStore();
    var getPrepareOrderInitData = function () {
        store.commit(store_1.MutationTypes.PAGE_LOADING, pageDataStatus_1.PageDataStatus.LOADING);
        return new Promise(function (resolve, reject) {
            axios_1["default"].get("" + common_1.getLocationHost('/sys/report/getReportConfig'), {
                headers: {
                    'token': common_1.getSearchPathValue('token')
                },
                params: {
                    code: 'add',
                    projectId: common_1.getSearchPathValue('projectId'),
                    reportId: common_1.getSearchPathValue('reportId')
                }
            }).then(function (_a) {
                var data = _a.data;
                resolve(data);
            })["catch"](function () {
                reject(false);
            });
        });
    };
    // 进入页面时开始请求结构化数据
    var getPageInitData = function () { return __awaiter(void 0, void 0, void 0, function () {
        var data;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0: return [4 /*yield*/, getPrepareOrderInitData()];
                case 1:
                    data = _d.sent();
                    if (data && data.code === 0) {
                        data.orderDataList = (_a = data.orderDataList) === null || _a === void 0 ? void 0 : _a.filter(function (item) {
                            return item.isMasterProcess && (item.isSub || item.isPhoto || item.isVideo);
                        });
                        // 插入固定选项物料记录
                        (_b = data.orderAttributeValueList) === null || _b === void 0 ? void 0 : _b.splice(0, 0, {
                            attrId: 0,
                            name: '物料记录',
                            attrCode: 'material',
                            attrName: '物料记录'
                        });
                        data.orderTypeDataTypeList = formatOrderTypeData(data.orderTypeDataTypeList || []);
                        data.orderTypeList = (_c = data.orderTypeList) === null || _c === void 0 ? void 0 : _c.map(function (item) {
                            if (item['children']) {
                                item['children'] = formatOrderTypeData(item['children']);
                            }
                            return item;
                        });
                        if (data.reportData) {
                            if (data.reportData['contents'] && typeof data.reportData['contents'] === 'string') {
                                data.reportData.content = JSON.parse(data.reportData['contents']);
                            }
                            if (data.reportData.content instanceof Array && data.reportData.content.length === 0) {
                                data.reportData.content = slides_1.slides;
                            }
                        }
                        // 处理数据图片、文字、视频
                        store.commit(store_1.MutationTypes.PAGE_DATA, data);
                        store.commit(store_1.MutationTypes.PAGE_LOADING, pageDataStatus_1.PageDataStatus.SUCCESS);
                    }
                    else {
                        store.commit(store_1.MutationTypes.PAGE_LOADING, pageDataStatus_1.PageDataStatus.ERROR);
                    }
                    store.commit(store_1.MutationTypes.PAGE_SPINNING, false);
                    return [2 /*return*/];
            }
        });
    }); };
    var formatOrderTypeData = function (list) {
        return list.map(function (t) {
            if (typeof t['photosText'] === 'string') {
                t['photosText'] = JSON.parse(t['photosText']);
            }
            if (typeof t['optionsText'] === 'string') {
                t['optionsText'] = JSON.parse(t['optionsText']);
            }
            if (typeof t['videosText'] === 'string') {
                t['videosText'] = JSON.parse(t['videosText']);
            }
            return t;
        });
    };
    vue_1.onMounted(function () {
        getPageInitData();
    });
    return {
        getPageInitData: getPageInitData
    };
});
