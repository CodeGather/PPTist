"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
var vue_1 = require("vue");
var store_1 = require("@/store");
var clipboard_1 = require("@/utils/clipboard");
// import { createRandomCode } from '@/utils/common'
var element_1 = require("@/utils/element");
var textParser_1 = require("@/utils/textParser");
var useHistorySnapshot_1 = require("@/hooks/useHistorySnapshot");
var useCreateElement_1 = require("@/hooks/useCreateElement");
exports["default"] = (function () {
    var store = store_1.useStore();
    var currentSlide = vue_1.computed(function () { return store.getters.currentSlide; });
    var addHistorySnapshot = useHistorySnapshot_1["default"]().addHistorySnapshot;
    var createTextElement = useCreateElement_1["default"]().createTextElement;
    /**
     * 粘贴元素（一组）
     * @param elements 元素列表数据
     */
    var addElementsFromClipboard = function (elements) {
        var _a = element_1.createElementIdMap(elements), groupIdMap = _a.groupIdMap, elIdMap = _a.elIdMap;
        var currentSlideElementIdList = currentSlide.value.elements.map(function (el) { return el.id; });
        for (var _i = 0, elements_1 = elements; _i < elements_1.length; _i++) {
            var element = elements_1[_i];
            var inCurrentSlide = currentSlideElementIdList.includes(element.id);
            element['autoId'] = null;
            element.id = elIdMap[element.id];
            if (inCurrentSlide) {
                element.left = element.left + 10;
                element.top = element.top + 10;
            }
            if (element.groupId)
                element.groupId = groupIdMap[element.groupId];
        }
        store.commit(store_1.MutationTypes.ADD_ELEMENT, elements);
        store.commit(store_1.MutationTypes.SET_ACTIVE_ELEMENT_ID_LIST, Object.values(elIdMap));
        addHistorySnapshot();
    };
    /**
     * 粘贴页面
     * @param slide 页面数据
     */
    var addSlidesFromClipboard = function (slides) {
        var newSlides = slides.map(function (slide) {
            var _a = element_1.createElementIdMap(slide.elements), groupIdMap = _a.groupIdMap, elIdMap = _a.elIdMap;
            var slidesId = '' + new Date().getTime();
            for (var _i = 0, _b = slide.elements; _i < _b.length; _i++) {
                var element = _b[_i];
                element.id = elIdMap[element.id];
                element['autoId'] = null;
                element['pageId'] = slidesId;
                if (element.groupId)
                    element.groupId = groupIdMap[element.groupId];
            }
            if (slide.animations) {
                for (var _c = 0, _d = slide.animations; _c < _d.length; _c++) {
                    var animation = _d[_c];
                    animation.elId = elIdMap[animation.elId];
                }
            }
            return __assign(__assign({}, slide), { id: slidesId, autoId: null });
        });
        store.commit(store_1.MutationTypes.ADD_SLIDE, newSlides);
        addHistorySnapshot();
    };
    /**
     * 粘贴普通文本：创建为新的文本元素
     * @param text 文本
     */
    var createTextElementFromClipboard = function (text) {
        createTextElement({
            left: 0,
            top: 0,
            width: 600,
            height: 50
        }, text);
    };
    /**
     * 解析剪贴板内容，根据解析结果选择合适的粘贴方式
     * @param text 剪贴板内容
     * @param options 配置项：onlySlide -- 仅处理页面粘贴；onlyElements -- 仅处理元素粘贴；
     */
    var pasteTextClipboardData = function (text, options) {
        var onlySlide = (options === null || options === void 0 ? void 0 : options.onlySlide) || false;
        var onlyElements = (options === null || options === void 0 ? void 0 : options.onlyElements) || false;
        var clipboardData = clipboard_1.pasteCustomClipboardString(text);
        // 元素或页面
        if (typeof clipboardData === 'object') {
            var type = clipboardData.type, data = clipboardData.data;
            if (type === 'elements' && !onlySlide)
                addElementsFromClipboard(data);
            else if (type === 'slides' && !onlyElements)
                addSlidesFromClipboard(data);
        }
        // 普通文本
        else if (!onlyElements && !onlySlide) {
            var string = textParser_1.parseText2Paragraphs(clipboardData);
            createTextElementFromClipboard(string);
        }
    };
    return {
        addSlidesFromClipboard: addSlidesFromClipboard,
        pasteTextClipboardData: pasteTextClipboardData
    };
});
