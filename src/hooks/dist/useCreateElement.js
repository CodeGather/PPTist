"use strict";
exports.__esModule = true;
var vue_1 = require("vue");
var store_1 = require("@/store");
var common_1 = require("@/utils/common");
var image_1 = require("@/utils/image");
var canvas_1 = require("@/configs/canvas");
var useHistorySnapshot_1 = require("@/hooks/useHistorySnapshot");
exports["default"] = (function () {
    var store = store_1.useStore();
    var themeColor = vue_1.computed(function () { return store.state.theme.themeColor; });
    var fontColor = vue_1.computed(function () { return store.state.theme.fontColor; });
    var fontName = vue_1.computed(function () { return store.state.theme.fontName; });
    var viewportRatio = vue_1.computed(function () { return store.state.viewportRatio; });
    var creatingElement = vue_1.computed(function () { return store.state.creatingElement; });
    var addHistorySnapshot = useHistorySnapshot_1["default"]().addHistorySnapshot;
    // 创建（插入）一个元素并将其设置为被选中元素
    var createElement = function (element) {
        store.commit(store_1.MutationTypes.ADD_ELEMENT, element);
        store.commit(store_1.MutationTypes.SET_ACTIVE_ELEMENT_ID_LIST, [element.id]);
        if (creatingElement.value)
            store.commit(store_1.MutationTypes.SET_CREATING_ELEMENT, null);
        setTimeout(function () {
            store.commit(store_1.MutationTypes.SET_EDITORAREA_FOCUS, true);
        }, 0);
        addHistorySnapshot();
    };
    /**
     * 创建图片元素
     * @param src 图片地址
     */
    var createImageElement = function (src, keyName, position) {
        image_1.getImageSize(src).then(function (_a) {
            var width = _a.width, height = _a.height;
            var scale = height / width;
            if (scale < viewportRatio.value && width > canvas_1.VIEWPORT_SIZE) {
                width = canvas_1.VIEWPORT_SIZE;
                height = width * scale;
            }
            else if (height > canvas_1.VIEWPORT_SIZE * viewportRatio.value) {
                height = canvas_1.VIEWPORT_SIZE * viewportRatio.value;
                width = height / scale;
            }
            createElement({
                type: 'image',
                keyName: keyName,
                id: common_1.createRandomCode(),
                src: src,
                width: width,
                height: height,
                left: ((position === null || position === void 0 ? void 0 : position.left) || 0) || (canvas_1.VIEWPORT_SIZE - width) / 2,
                top: (canvas_1.VIEWPORT_SIZE * viewportRatio.value - height) / 2,
                fixedRatio: true,
                rotate: 0
            });
        });
    };
    /**
     * 创建图表元素
     * @param chartType 图表类型
     */
    var createChartElement = function (chartType) {
        createElement({
            type: 'chart',
            id: common_1.createRandomCode(),
            chartType: chartType,
            left: 300,
            top: 81.25,
            width: 400,
            height: 400,
            rotate: 0,
            themeColor: [themeColor.value],
            gridColor: fontColor.value,
            data: [{
                    labels: ['类别1', '类别2', '类别3', '类别4', '类别5'],
                    legends: ['系列1'],
                    series: [
                        [12, 19, 5, 2, 18],
                    ]
                }]
        });
    };
    /**
     * 创建表格元素
     * @param row 行数
     * @param col 列数
     */
    var createTableElement = function (row, col) {
        var style = {
            fontname: fontName.value,
            color: fontColor.value
        };
        var data = [];
        for (var i = 0; i < row; i++) {
            var rowCells = [];
            for (var j = 0; j < col; j++) {
                rowCells.push({ id: common_1.createRandomCode(), colspan: 1, rowspan: 1, text: '', style: style });
            }
            data.push(rowCells);
        }
        var DEFAULT_CELL_WIDTH = 100;
        var DEFAULT_CELL_HEIGHT = 36;
        var colWidths = new Array(col).fill(1 / col);
        var width = col * DEFAULT_CELL_WIDTH;
        var height = row * DEFAULT_CELL_HEIGHT;
        createElement({
            type: 'table',
            id: common_1.createRandomCode(),
            width: width,
            height: height,
            colWidths: colWidths,
            rotate: 0,
            data: data,
            left: (canvas_1.VIEWPORT_SIZE - width) / 2,
            top: (canvas_1.VIEWPORT_SIZE * viewportRatio.value - height) / 2,
            outline: {
                width: 2,
                style: 'solid',
                color: '#eeece1'
            },
            theme: {
                color: themeColor.value,
                rowHeader: true,
                rowFooter: false,
                colHeader: false,
                colFooter: false
            }
        });
    };
    /**
     * 创建文本元素
     * @param position 位置大小信息
     * @param content 文本内容
     */
    var createTextElement = function (position, content, keyName) {
        if (content === void 0) { content = '请输入内容'; }
        var left = position.left, top = position.top, width = position.width, height = position.height;
        createElement({
            type: 'text',
            keyName: keyName,
            id: common_1.createRandomCode(),
            left: left || (canvas_1.VIEWPORT_SIZE - width) / 2,
            top: top || (canvas_1.VIEWPORT_SIZE * viewportRatio.value - height + 150) / 2,
            width: width,
            height: height,
            content: content,
            rotate: 0,
            defaultFontName: fontName.value,
            defaultColor: fontColor.value
        });
    };
    /**
     * 创建形状元素
     * @param position 位置大小信息
     * @param data 形状路径信息
     */
    var createShapeElement = function (position, data) {
        var left = position.left, top = position.top, width = position.width, height = position.height;
        var newElement = {
            type: 'shape',
            id: common_1.createRandomCode(),
            left: left,
            top: top,
            width: width,
            height: height,
            viewBox: data.viewBox,
            path: data.path,
            fill: themeColor.value,
            fixedRatio: false,
            rotate: 0
        };
        if (data.special)
            newElement.special = true;
        createElement(newElement);
    };
    /**
     * 创建线条元素
     * @param position 位置大小信息
     * @param data 线条的路径和样式
     */
    var createLineElement = function (position, data) {
        var left = position.left, top = position.top, start = position.start, end = position.end;
        var newElement = {
            type: 'line',
            id: common_1.createRandomCode(),
            left: left,
            top: top,
            start: start,
            end: end,
            points: data.points,
            color: themeColor.value,
            style: data.style,
            width: 2
        };
        if (data.isBroken)
            newElement.broken = [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2];
        if (data.isCurve)
            newElement.curve = [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2];
        createElement(newElement);
    };
    /**
     * 创建LaTeX元素
     * @param svg SVG代码
     */
    var createLatexElement = function (data) {
        createElement({
            type: 'latex',
            id: common_1.createRandomCode(),
            width: data.w,
            height: data.h,
            rotate: 0,
            left: (canvas_1.VIEWPORT_SIZE - data.w) / 2,
            top: (canvas_1.VIEWPORT_SIZE * viewportRatio.value - data.h) / 2,
            path: data.path,
            latex: data.latex,
            color: fontColor.value,
            strokeWidth: 2,
            viewBox: [data.w, data.h],
            fixedRatio: true
        });
    };
    /**
     * 创建视频元素
     * @param src 视频地址
     */
    var createVideoElement = function (src, keyName) {
        createElement({
            type: 'video',
            keyName: keyName,
            id: common_1.createRandomCode(),
            width: 500,
            height: 300,
            rotate: 0,
            left: (canvas_1.VIEWPORT_SIZE - 500) / 2,
            top: (canvas_1.VIEWPORT_SIZE * viewportRatio.value - 300) / 2,
            src: src
        });
    };
    return {
        createImageElement: createImageElement,
        createChartElement: createChartElement,
        createTableElement: createTableElement,
        createTextElement: createTextElement,
        createShapeElement: createShapeElement,
        createLineElement: createLineElement,
        createLatexElement: createLatexElement,
        createVideoElement: createVideoElement
    };
});
