"use strict";
exports.__esModule = true;
exports.getters = void 0;
var tinycolor2_1 = require("tinycolor2");
var layout_1 = require("@/mocks/layout");
exports.getters = {
    currentSlide: function (state) {
        return state.slides[state.slideIndex] || null;
    },
    currentSlideAnimations: function (state) {
        var currentSlide = state.slides[state.slideIndex];
        if (!currentSlide)
            return null;
        var animations = currentSlide.animations;
        if (!animations)
            return null;
        var els = currentSlide.elements;
        var elIds = els.map(function (el) { return el.id; });
        return animations.filter(function (animation) { return elIds.includes(animation.elId); });
    },
    layouts: function (state) {
        var _a = state.theme, themeColor = _a.themeColor, fontColor = _a.fontColor, fontName = _a.fontName, backgroundColor = _a.backgroundColor;
        var subColor = tinycolor2_1["default"](fontColor).isDark() ? 'rgba(230, 230, 230, 0.5)' : 'rgba(180, 180, 180, 0.5)';
        var layoutsString = JSON.stringify(layout_1.layouts)
            .replaceAll('{{themeColor}}', themeColor)
            .replaceAll('{{fontColor}}', fontColor)
            .replaceAll('{{fontName}}', fontName)
            .replaceAll('{{backgroundColor}}', backgroundColor)
            .replaceAll('{{subColor}}', subColor);
        return JSON.parse(layoutsString);
    },
    activeElementList: function (state) {
        var currentSlide = state.slides[state.slideIndex];
        if (!currentSlide || !currentSlide.elements)
            return [];
        return currentSlide.elements.filter(function (element) { return state.activeElementIdList.includes(element.id); });
    },
    handleElement: function (state) {
        var currentSlide = state.slides[state.slideIndex];
        if (!currentSlide || !currentSlide.elements)
            return null;
        return currentSlide.elements.find(function (element) { return state.handleElementId === element.id; }) || null;
    },
    canUndo: function (state) {
        return state.snapshotCursor > 0;
    },
    canRedo: function (state) {
        return state.snapshotCursor < state.snapshotLength - 1;
    },
    ctrlOrShiftKeyActive: function (state) {
        return state.ctrlKeyState || state.shiftKeyState;
    },
    getPageData: function (state) {
        return state.pageData;
    },
    getReportData: function (state) {
        return state.fileDataConfig;
    }
};
