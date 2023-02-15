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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var vue_1 = require("vue");
var store_1 = require("@/store");
// import { createRandomCode } from '@/utils/common'
var clipboard_1 = require("@/utils/clipboard");
var crypto_1 = require("@/utils/crypto");
var element_1 = require("@/utils/element");
var hotkey_1 = require("@/configs/hotkey");
var ant_design_vue_1 = require("ant-design-vue");
var usePasteTextClipboardData_1 = require("@/hooks/usePasteTextClipboardData");
var useHistorySnapshot_1 = require("@/hooks/useHistorySnapshot");
exports["default"] = (function () {
    var store = store_1.useStore();
    var slideIndex = vue_1.computed(function () { return store.state.slideIndex; });
    var theme = vue_1.computed(function () { return store.state.theme; });
    var slides = vue_1.computed(function () { return store.state.slides; });
    var currentSlide = vue_1.computed(function () { return store.getters.currentSlide; });
    var selectedSlidesIndex = vue_1.computed(function () { return __spreadArrays(store.state.selectedSlidesIndex, [slideIndex.value]); });
    var selectedSlides = vue_1.computed(function () { return slides.value.filter(function (item, index) { return selectedSlidesIndex.value.includes(index); }); });
    var selectedSlidesId = vue_1.computed(function () { return selectedSlides.value.map(function (item) { return item.id; }); });
    var _a = usePasteTextClipboardData_1["default"](), pasteTextClipboardData = _a.pasteTextClipboardData, addSlidesFromClipboard = _a.addSlidesFromClipboard;
    var addHistorySnapshot = useHistorySnapshot_1["default"]().addHistorySnapshot;
    // 重置幻灯片
    var resetSlides = function () {
        var emptySlide = {
            id: '' + new Date().getTime(),
            elements: [],
            background: {
                type: 'solid',
                color: theme.value.backgroundColor
            }
        };
        store.commit(store_1.MutationTypes.UPDATE_SLIDE_INDEX, 0);
        store.commit(store_1.MutationTypes.SET_ACTIVE_ELEMENT_ID_LIST, []);
        store.commit(store_1.MutationTypes.SET_SLIDES, [emptySlide]);
    };
    /**
     * 移动页面焦点
     * @param command 移动页面焦点命令：上移、下移
     */
    var updateSlideIndex = function (command) {
        if (command === hotkey_1.KEYS.UP && slideIndex.value > 0) {
            store.commit(store_1.MutationTypes.UPDATE_SLIDE_INDEX, slideIndex.value - 1);
        }
        else if (command === hotkey_1.KEYS.DOWN && slideIndex.value < slides.value.length - 1) {
            store.commit(store_1.MutationTypes.UPDATE_SLIDE_INDEX, slideIndex.value + 1);
        }
    };
    // 将当前页面数据加密后复制到剪贴板
    var copySlide = function () {
        var text = crypto_1.encrypt(JSON.stringify({
            type: 'slides',
            data: selectedSlides.value
        }));
        clipboard_1.copyText(text).then(function () {
            store.commit(store_1.MutationTypes.SET_THUMBNAILS_FOCUS, true);
        });
    };
    // 尝试将剪贴板页面数据解密后添加到下一页（粘贴）
    var pasteSlide = function () {
        clipboard_1.readClipboard().then(function (text) {
            pasteTextClipboardData(text, { onlySlide: true });
        })["catch"](function (err) { return ant_design_vue_1.message.warning(err); });
    };
    // 创建一页空白页并添加到下一页
    var createSlide = function () {
        var emptySlide = {
            id: '' + new Date().getTime(),
            elements: [],
            background: {
                type: 'solid',
                color: theme.value.backgroundColor
            }
        };
        store.commit(store_1.MutationTypes.SET_ACTIVE_ELEMENT_ID_LIST, []);
        store.commit(store_1.MutationTypes.ADD_SLIDE, emptySlide);
        addHistorySnapshot();
    };
    // 根据模板创建新页面
    var createSlideByTemplate = function (slide) {
        var _a = element_1.createElementIdMap(slide.elements), groupIdMap = _a.groupIdMap, elIdMap = _a.elIdMap;
        for (var _i = 0, _b = slide.elements; _i < _b.length; _i++) {
            var element = _b[_i];
            element.id = elIdMap[element.id];
            if (element.groupId)
                element.groupId = groupIdMap[element.groupId];
        }
        var newSlide = __assign(__assign({}, slide), { id: '' + new Date().getTime() });
        store.commit(store_1.MutationTypes.SET_ACTIVE_ELEMENT_ID_LIST, []);
        store.commit(store_1.MutationTypes.ADD_SLIDE, newSlide);
        addHistorySnapshot();
    };
    // 将当前页复制一份到下一页
    var copyAndPasteSlide = function () {
        var slide = JSON.parse(JSON.stringify(currentSlide.value));
        addSlidesFromClipboard([slide]);
    };
    // 删除当前页，若将删除全部页面，则执行重置幻灯片操作
    var deleteSlide = function (targetSlidesId) {
        if (targetSlidesId === void 0) { targetSlidesId = selectedSlidesId.value; }
        if (slides.value.length === targetSlidesId.length)
            resetSlides();
        else
            store.commit(store_1.MutationTypes.DELETE_SLIDE, targetSlidesId);
        store.commit(store_1.MutationTypes.UPDATE_SELECTED_SLIDES_INDEX, []);
        addHistorySnapshot();
    };
    // 将当前页复制后删除（剪切）
    // 由于复制操作会导致多选状态消失，所以需要提前将需要删除的页面ID进行缓存
    var cutSlide = function () {
        var targetSlidesId = __spreadArrays(selectedSlidesId.value);
        copySlide();
        deleteSlide(targetSlidesId);
    };
    // 选中全部幻灯片
    var selectAllSlide = function () {
        var newSelectedSlidesIndex = Array.from(Array(slides.value.length), function (item, index) { return index; });
        store.commit(store_1.MutationTypes.SET_ACTIVE_ELEMENT_ID_LIST, []);
        store.commit(store_1.MutationTypes.UPDATE_SELECTED_SLIDES_INDEX, newSelectedSlidesIndex);
    };
    return {
        resetSlides: resetSlides,
        updateSlideIndex: updateSlideIndex,
        copySlide: copySlide,
        pasteSlide: pasteSlide,
        createSlide: createSlide,
        createSlideByTemplate: createSlideByTemplate,
        copyAndPasteSlide: copyAndPasteSlide,
        deleteSlide: deleteSlide,
        cutSlide: cutSlide,
        selectAllSlide: selectAllSlide
    };
});
