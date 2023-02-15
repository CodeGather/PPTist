"use strict";
exports.__esModule = true;
/*
 * @Author: 21克的爱情
 * @Date: 2022-02-25 15:16:00
 * @Email: raohong07@163.com
 * @LastEditors: 21克的爱情
 * @LastEditTime: 2022-02-28 14:24:43
 * @Description:
 */
var vue_1 = require("vue");
var store_1 = require("@/store");
var canvas_1 = require("@/configs/canvas");
exports["default"] = (function (canvasRef) {
    var viewportLeft = vue_1.ref(0);
    var viewportTop = vue_1.ref(0);
    var store = store_1.useStore();
    var canvasPercentage = vue_1.computed(function () { return store.state.canvasPercentage; });
    var viewportRatio = vue_1.computed(function () { return store.state.viewportRatio; });
    // 计算画布可视区域的位置
    var setViewportPosition = function () {
        if (!canvasRef.value)
            return;
        var canvasWidth = canvasRef.value.clientWidth;
        var canvasHeight = canvasRef.value.clientHeight;
        if (canvasHeight / canvasWidth > viewportRatio.value) {
            var viewportActualWidth = canvasWidth * (canvasPercentage.value / 100);
            store.commit(store_1.MutationTypes.SET_CANVAS_SCALE, viewportActualWidth / canvas_1.VIEWPORT_SIZE);
            viewportLeft.value = (canvasWidth - viewportActualWidth) / 2;
            viewportTop.value = (canvasHeight - viewportActualWidth * viewportRatio.value) / 2;
        }
        else {
            var viewportActualHeight = canvasHeight * (canvasPercentage.value / 100);
            store.commit(store_1.MutationTypes.SET_CANVAS_SCALE, viewportActualHeight / (canvas_1.VIEWPORT_SIZE * viewportRatio.value));
            viewportLeft.value = (canvasWidth - viewportActualHeight / viewportRatio.value) / 2;
            viewportTop.value = (canvasHeight - viewportActualHeight) / 2;
        }
    };
    // 可视区域缩放或比例变化时，更新可视区域的位置
    vue_1.watch([canvasPercentage, viewportRatio], setViewportPosition);
    // 画布可视区域位置和大小的样式
    var viewportStyles = vue_1.computed(function () { return ({
        width: canvas_1.VIEWPORT_SIZE,
        height: canvas_1.VIEWPORT_SIZE * viewportRatio.value,
        left: viewportLeft.value,
        top: viewportTop.value,
        radius: 200
    }); });
    // 监听画布尺寸发生变化时，更新可视区域的位置
    var resizeObserver = new ResizeObserver(setViewportPosition);
    vue_1.onMounted(function () {
        if (canvasRef.value)
            resizeObserver.observe(canvasRef.value);
    });
    vue_1.onUnmounted(function () {
        if (canvasRef.value)
            resizeObserver.unobserve(canvasRef.value);
    });
    return {
        viewportStyles: viewportStyles
    };
});
