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
var lodash_1 = require("lodash");
var file_saver_1 = require("file-saver");
var pptxgenjs_1 = require("pptxgenjs");
var tinycolor2_1 = require("tinycolor2");
var element_1 = require("@/utils/element");
var htmlParser_1 = require("@/utils/htmlParser");
var svgPathParser_1 = require("@/utils/svgPathParser");
var svg2Base64_1 = require("@/utils/svg2Base64");
var store_1 = require("@/store");
var ant_design_vue_1 = require("ant-design-vue");
exports["default"] = (function () {
    var store = store_1.useStore();
    var slides = vue_1.computed(function () { return store.state.slides; });
    var exporting = vue_1.ref(false);
    // 导出JSON文件
    var exportJSON = function () {
        // console.log(slides.value)
        var blob = new Blob([JSON.stringify(slides.value)], { type: '' });
        file_saver_1.saveAs(blob, 'pptist_slides.json');
    };
    // 格式化颜色值为 透明度 + HexString，供pptxgenjs使用
    var formatColor = function (_color) {
        var c = tinycolor2_1["default"](_color);
        var alpha = c.getAlpha();
        var color = alpha === 0 ? '#ffffff' : c.setAlpha(1).toHexString();
        return {
            alpha: alpha,
            color: color
        };
    };
    // 将HTML字符串格式化为pptxgenjs所需的格式
    // 核心思路：将HTML字符串按样式分片平铺，每个片段需要继承祖先元素的样式信息，遇到块级元素需要换行
    var formatHTML = function (html) {
        var ast = htmlParser_1.toAST(html);
        var slices = [];
        var parse = function (obj, baseStyleObj) {
            if (baseStyleObj === void 0) { baseStyleObj = {}; }
            for (var _i = 0, obj_1 = obj; _i < obj_1.length; _i++) {
                var item = obj_1[_i];
                if ('tagName' in item && ['div', 'ul', 'li', 'p'].includes(item.tagName) && slices.length) {
                    var lastSlice = slices[slices.length - 1];
                    if (!lastSlice.options)
                        lastSlice.options = {};
                    lastSlice.options.breakLine = true;
                }
                var styleObj = __assign({}, baseStyleObj);
                var styleAttr = 'attributes' in item ? item.attributes.find(function (attr) { return attr.key === 'style'; }) : null;
                if (styleAttr && styleAttr.value) {
                    var styleArr = styleAttr.value.split(';');
                    for (var _a = 0, styleArr_1 = styleArr; _a < styleArr_1.length; _a++) {
                        var styleItem = styleArr_1[_a];
                        var _b = styleItem.split(': '), _key = _b[0], _value = _b[1];
                        var _c = [lodash_1.trim(_key), lodash_1.trim(_value)], key = _c[0], value = _c[1];
                        if (key && value)
                            styleObj[key] = value;
                    }
                }
                if ('tagName' in item) {
                    if (item.tagName === 'em') {
                        styleObj['font-style'] = 'italic';
                    }
                    if (item.tagName === 'strong') {
                        styleObj['font-weight'] = 'bold';
                    }
                    if (item.tagName === 'sup') {
                        styleObj['vertical-align'] = 'super';
                    }
                    if (item.tagName === 'sub') {
                        styleObj['vertical-align'] = 'sub';
                    }
                }
                if ('tagName' in item && item.tagName === 'br') {
                    slices.push({ text: '', options: { breakLine: true } });
                }
                else if ('content' in item) {
                    var text = item.content.replace(/\n/g, '').replace(/&nbsp;/g, ' ');
                    var options = {};
                    if (styleObj['font-size']) {
                        options.fontSize = parseInt(styleObj['font-size']) * 0.75;
                    }
                    if (styleObj['color']) {
                        options.color = formatColor(styleObj['color']).color;
                    }
                    if (styleObj['background-color']) {
                        options.highlight = formatColor(styleObj['background-color']).color;
                    }
                    if (styleObj['text-decoration-line']) {
                        if (styleObj['text-decoration-line'].indexOf('underline') !== -1) {
                            options.underline = {
                                color: options.color || '#000000',
                                style: 'sng'
                            };
                        }
                        if (styleObj['text-decoration-line'].indexOf('line-through') !== -1) {
                            options.strike = 'sngStrike';
                        }
                    }
                    if (styleObj['text-decoration']) {
                        if (styleObj['text-decoration'].indexOf('underline') !== -1) {
                            options.underline = {
                                color: options.color || '#000000',
                                style: 'sng'
                            };
                        }
                        if (styleObj['text-decoration'].indexOf('line-through') !== -1) {
                            options.strike = 'sngStrike';
                        }
                    }
                    if (styleObj['vertical-align']) {
                        if (styleObj['vertical-align'] === 'super')
                            options.superscript = true;
                        if (styleObj['vertical-align'] === 'sub')
                            options.subscript = true;
                    }
                    if (styleObj['text-align'])
                        options.align = styleObj['text-align'];
                    if (styleObj['font-weight'])
                        options.bold = styleObj['font-weight'] === 'bold';
                    if (styleObj['font-style'])
                        options.italic = styleObj['font-style'] === 'italic';
                    if (styleObj['font-family'])
                        options.fontFace = styleObj['font-family'];
                    slices.push({ text: text, options: options });
                }
                else if ('children' in item)
                    parse(item.children, styleObj);
            }
        };
        parse(ast);
        return slices;
    };
    // 将SVG路径信息格式化为pptxgenjs所需要的格式
    var formatPoints = function (points, scale) {
        if (scale === void 0) { scale = { x: 1, y: 1 }; }
        return points.map(function (point) {
            if (point.close !== undefined) {
                return { close: true };
            }
            else if (point.type === 'M') {
                return {
                    x: point.x / 100 * scale.x,
                    y: point.y / 100 * scale.y,
                    moveTo: true
                };
            }
            else if (point.curve) {
                if (point.curve.type === 'cubic') {
                    return {
                        x: point.x / 100 * scale.x,
                        y: point.y / 100 * scale.y,
                        curve: {
                            type: 'cubic',
                            x1: point.curve.x1 / 100 * scale.x,
                            y1: point.curve.y1 / 100 * scale.y,
                            x2: point.curve.x2 / 100 * scale.x,
                            y2: point.curve.y2 / 100 * scale.y
                        }
                    };
                }
                else if (point.curve.type === 'quadratic') {
                    return {
                        x: point.x / 100 * scale.x,
                        y: point.y / 100 * scale.y,
                        curve: {
                            type: 'quadratic',
                            x1: point.curve.x1 / 100 * scale.x,
                            y1: point.curve.y1 / 100 * scale.y
                        }
                    };
                }
            }
            return {
                x: point.x / 100 * scale.x,
                y: point.y / 100 * scale.y
            };
        });
    };
    // 导出PPTX文件
    var exportPPTX = function () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
        exporting.value = true;
        var pptx = new pptxgenjs_1["default"]();
        for (var _i = 0, _s = slides.value; _i < _s.length; _i++) {
            var slide = _s[_i];
            var pptxSlide = pptx.addSlide();
            if (slide.background) {
                var background = slide.background;
                if (background.type === 'image' && background.image) {
                    pptxSlide.background = { data: background.image };
                }
                else if (background.type === 'solid' && background.color) {
                    var c = formatColor(background.color);
                    pptxSlide.background = { color: c.color, transparency: (1 - c.alpha) * 100 };
                }
                else if (background.type === 'gradient' && background.gradientColor) {
                    var _t = background.gradientColor, color1 = _t[0], color2 = _t[1];
                    var color = tinycolor2_1["default"].mix(color1, color2).toHexString();
                    var c = formatColor(color);
                    pptxSlide.background = { color: c.color, transparency: (1 - c.alpha) * 100 };
                }
            }
            if (!slide.elements)
                continue;
            var _loop_1 = function (el) {
                if (el.type === 'text') {
                    var textProps = formatHTML(el.content);
                    var options = {
                        x: el.left / 100,
                        y: el.top / 100,
                        w: el.width / 100,
                        h: el.height / 100,
                        fontSize: 20 * 0.75,
                        fontFace: '微软雅黑',
                        color: '#000000',
                        valign: 'middle'
                    };
                    if (el.rotate)
                        options.rotate = el.rotate;
                    if (el.wordSpace)
                        options.charSpacing = el.wordSpace * 0.75;
                    if (el.lineHeight)
                        options.lineSpacingMultiple = el.lineHeight * 0.75;
                    if (el.fill) {
                        var c = formatColor(el.fill);
                        var opacity = el.opacity === undefined ? 1 : el.opacity;
                        options.fill = { color: c.color, transparency: (1 - c.alpha * opacity) * 100 };
                    }
                    if (el.defaultColor)
                        options.color = formatColor(el.defaultColor).color;
                    if (el.defaultFontName)
                        options.fontFace = el.defaultFontName;
                    if (el.shadow) {
                        var c = formatColor(el.shadow.color);
                        options.shadow = {
                            type: 'outer',
                            color: c.color.replace('#', ''),
                            opacity: c.alpha,
                            blur: el.shadow.blur * 0.75,
                            offset: (el.shadow.h + el.shadow.v) / 2 * 0.75,
                            angle: 45
                        };
                    }
                    if (el.link)
                        options.hyperlink = { url: el.link };
                    pptxSlide.addText(textProps, options);
                }
                else if (el.type === 'image') {
                    var options = {
                        path: el.src,
                        x: el.left / 100,
                        y: el.top / 100,
                        w: el.width / 100,
                        h: el.height / 100
                    };
                    if (el.flipH)
                        options.flipH = el.flipH;
                    if (el.flipV)
                        options.flipV = el.flipV;
                    if (el.rotate)
                        options.rotate = el.rotate;
                    if (el.clip && el.clip.shape === 'ellipse')
                        options.rounding = true;
                    if (el.link)
                        options.hyperlink = { url: el.link };
                    pptxSlide.addImage(options);
                }
                else if (el.type === 'shape') {
                    if (el.special) {
                        var svgRef = document.querySelector(".thumbnail-list .base-element-" + el.id + " svg");
                        var base64SVG = svg2Base64_1.svg2Base64(svgRef);
                        var options = {
                            data: base64SVG,
                            x: el.left / 100,
                            y: el.top / 100,
                            w: el.width / 100,
                            h: el.height / 100
                        };
                        if (el.rotate)
                            options.rotate = el.rotate;
                        if (el.link)
                            options.hyperlink = { url: el.link };
                        pptxSlide.addImage(options);
                    }
                    else {
                        var scale = {
                            x: el.width / el.viewBox[0],
                            y: el.height / el.viewBox[0]
                        };
                        var points = formatPoints(svgPathParser_1.toPoints(el.path), scale);
                        var fillColor = formatColor(el.fill);
                        var opacity = el.opacity === undefined ? 1 : el.opacity;
                        var options = {
                            x: el.left / 100,
                            y: el.top / 100,
                            w: el.width / 100,
                            h: el.height / 100,
                            fill: { color: fillColor.color, transparency: (1 - fillColor.alpha * opacity) * 100 },
                            points: points
                        };
                        if (el.flipH)
                            options.flipH = el.flipH;
                        if (el.flipV)
                            options.flipV = el.flipV;
                        if ((_a = el.outline) === null || _a === void 0 ? void 0 : _a.width) {
                            options.line = {
                                color: formatColor(((_b = el.outline) === null || _b === void 0 ? void 0 : _b.color) || '#000000').color,
                                width: el.outline.width * 0.75,
                                dashType: el.outline.style === 'solid' ? 'solid' : 'dash'
                            };
                        }
                        if (el.shadow) {
                            var c = formatColor(el.shadow.color);
                            options.shadow = {
                                type: 'outer',
                                color: c.color.replace('#', ''),
                                opacity: c.alpha,
                                blur: el.shadow.blur * 0.75,
                                offset: (el.shadow.h + el.shadow.v) / 2 * 0.75,
                                angle: 45
                            };
                        }
                        if (el.link)
                            options.hyperlink = { url: el.link };
                        pptxSlide.addShape('custGeom', options);
                    }
                    if (el.text) {
                        var textProps = formatHTML(el.text.content);
                        var options = {
                            x: el.left / 100,
                            y: el.top / 100,
                            w: el.width / 100,
                            h: el.height / 100,
                            fontSize: 20 * 0.75,
                            fontFace: '微软雅黑',
                            color: '#000000',
                            valign: el.text.align
                        };
                        if (el.rotate)
                            options.rotate = el.rotate;
                        if (el.text.defaultColor)
                            options.color = formatColor(el.text.defaultColor).color;
                        if (el.text.defaultFontName)
                            options.fontFace = el.text.defaultFontName;
                        pptxSlide.addText(textProps, options);
                    }
                }
                else if (el.type === 'line') {
                    var path = element_1.getLineElementPath(el);
                    var points = formatPoints(svgPathParser_1.toPoints(path));
                    var _a = element_1.getElementRange(el), minX = _a.minX, maxX = _a.maxX, minY = _a.minY, maxY = _a.maxY;
                    var options = {
                        x: el.left / 100,
                        y: el.top / 100,
                        w: (maxX - minX) / 100,
                        h: (maxY - minY) / 100,
                        line: {
                            color: formatColor(el.color).color,
                            width: el.width * 0.75,
                            dashType: el.style === 'solid' ? 'solid' : 'dash',
                            beginArrowType: el.points[0] ? 'arrow' : 'none',
                            endArrowType: el.points[1] ? 'arrow' : 'none'
                        },
                        points: points
                    };
                    pptxSlide.addShape('custGeom', options);
                }
                else if (el.type === 'chart') {
                    var chartData = [];
                    for (var i = 0; i < el.data[0].series.length; i++) {
                        var item = el.data[0].series[i];
                        chartData.push({
                            name: "\u7CFB\u5217" + (i + 1),
                            labels: el.data[0].labels,
                            values: item
                        });
                    }
                    var chartColors = [];
                    if (el.themeColor.length === 10)
                        chartColors = el.themeColor.map(function (color) { return formatColor(color).color; });
                    else if (el.themeColor.length === 1)
                        chartColors = tinycolor2_1["default"](el.themeColor[0]).analogous(10).map(function (color) { return formatColor(color.toHexString()).color; });
                    else {
                        var len = el.themeColor.length;
                        var supplement = tinycolor2_1["default"](el.themeColor[len - 1]).analogous(10 + 1 - len).map(function (color) { return color.toHexString(); });
                        chartColors = __spreadArrays(el.themeColor.slice(0, len - 1), supplement).map(function (color) { return formatColor(color).color; });
                    }
                    var options = {
                        x: el.left / 100,
                        y: el.top / 100,
                        w: el.width / 100,
                        h: el.height / 100,
                        chartColors: el.chartType === 'pie' ? chartColors : chartColors.slice(0, el.data[0].series.length)
                    };
                    if (el.fill)
                        options.fill = formatColor(el.fill).color;
                    if (el.legend) {
                        options.showLegend = true;
                        options.legendPos = el.legend === 'top' ? 't' : 'b';
                        options.legendColor = formatColor(el.gridColor || '#000000').color;
                        options.legendFontSize = 14 * 0.75;
                    }
                    var type = pptx.ChartType.bar;
                    if (el.chartType === 'bar') {
                        type = pptx.ChartType.bar;
                        options.barDir = ((_c = el.options) === null || _c === void 0 ? void 0 : _c.horizontalBars) ? 'bar' : 'col';
                    }
                    else if (el.chartType === 'line') {
                        if ((_d = el.options) === null || _d === void 0 ? void 0 : _d.showArea)
                            type = pptx.ChartType.area;
                        else if (((_e = el.options) === null || _e === void 0 ? void 0 : _e.showLine) === false) {
                            type = pptx.ChartType.scatter;
                            chartData.unshift({ name: 'X-Axis', values: Array(el.data[0].series[0].length).fill(0).map(function (v, i) { return i; }) });
                            options.lineSize = 0;
                        }
                        else
                            type = pptx.ChartType.line;
                        if ((_f = el.options) === null || _f === void 0 ? void 0 : _f.lineSmooth)
                            options.lineSmooth = true;
                    }
                    else if (el.chartType === 'pie') {
                        if ((_g = el.options) === null || _g === void 0 ? void 0 : _g.donut) {
                            type = pptx.ChartType.doughnut;
                            options.holeSize = 75;
                        }
                        else
                            type = pptx.ChartType.pie;
                    }
                    pptxSlide.addChart(type, chartData, options);
                }
                else if (el.type === 'table') {
                    var hiddenCells = [];
                    for (var i = 0; i < el.data.length; i++) {
                        var rowData = el.data[i];
                        for (var j = 0; j < rowData.length; j++) {
                            var cell = rowData[j];
                            if (cell.colspan > 1 || cell.rowspan > 1) {
                                for (var row = i; row < i + cell.rowspan; row++) {
                                    for (var col = row === i ? j + 1 : j; col < j + cell.colspan; col++)
                                        hiddenCells.push(row + "_" + col);
                                }
                            }
                        }
                    }
                    var tableData = [];
                    var theme = el.theme;
                    var themeColor = null;
                    var subThemeColors = [];
                    if (theme) {
                        themeColor = formatColor(theme.color);
                        subThemeColors = element_1.getTableSubThemeColor(theme.color).map(function (item) { return formatColor(item); });
                    }
                    for (var i = 0; i < el.data.length; i++) {
                        var row = el.data[i];
                        var _row = [];
                        for (var j = 0; j < row.length; j++) {
                            var cell = row[j];
                            var cellOptions = {
                                colspan: cell.colspan,
                                rowspan: cell.rowspan,
                                bold: ((_h = cell.style) === null || _h === void 0 ? void 0 : _h.bold) || false,
                                italic: ((_j = cell.style) === null || _j === void 0 ? void 0 : _j.em) || false,
                                underline: { style: ((_k = cell.style) === null || _k === void 0 ? void 0 : _k.underline) ? 'sng' : 'none' },
                                align: ((_l = cell.style) === null || _l === void 0 ? void 0 : _l.align) || 'left',
                                valign: 'middle',
                                fontFace: ((_m = cell.style) === null || _m === void 0 ? void 0 : _m.fontname) || '微软雅黑',
                                fontSize: (((_o = cell.style) === null || _o === void 0 ? void 0 : _o.fontsize) ? parseInt((_p = cell.style) === null || _p === void 0 ? void 0 : _p.fontsize) : 14) * 0.75
                            };
                            if (theme && themeColor) {
                                var c = void 0;
                                if (i % 2 === 0)
                                    c = subThemeColors[1];
                                else
                                    c = subThemeColors[0];
                                if (theme.rowHeader && i === 0)
                                    c = themeColor;
                                else if (theme.rowFooter && i === el.data.length - 1)
                                    c = themeColor;
                                else if (theme.colHeader && j === 0)
                                    c = themeColor;
                                else if (theme.colFooter && j === row.length - 1)
                                    c = themeColor;
                                cellOptions.fill = { color: c.color, transparency: (1 - c.alpha) * 100 };
                            }
                            if ((_q = cell.style) === null || _q === void 0 ? void 0 : _q.backcolor) {
                                var c = formatColor(cell.style.backcolor);
                                cellOptions.fill = { color: c.color, transparency: (1 - c.alpha) * 100 };
                            }
                            if ((_r = cell.style) === null || _r === void 0 ? void 0 : _r.color)
                                cellOptions.color = formatColor(cell.style.color).color;
                            if (!hiddenCells.includes(i + "_" + j)) {
                                _row.push({
                                    text: cell.text,
                                    options: cellOptions
                                });
                            }
                        }
                        if (_row.length)
                            tableData.push(_row);
                    }
                    var options = {
                        x: el.left / 100,
                        y: el.top / 100,
                        w: el.width / 100,
                        h: el.height / 100,
                        colW: el.colWidths.map(function (item) { return el.width * item / 100; })
                    };
                    if (el.outline.width && el.outline.color) {
                        options.border = {
                            type: el.outline.style === 'solid' ? 'solid' : 'dash',
                            pt: el.outline.width * 0.75,
                            color: formatColor(el.outline.color).color
                        };
                    }
                    pptxSlide.addTable(tableData, options);
                }
                else if (el.type === 'latex') {
                    var svgRef = document.querySelector(".thumbnail-list .base-element-" + el.id + " svg");
                    var base64SVG = svg2Base64_1.svg2Base64(svgRef);
                    var options = {
                        data: base64SVG,
                        x: el.left / 100,
                        y: el.top / 100,
                        w: el.width / 100,
                        h: el.height / 100
                    };
                    if (el.link)
                        options.hyperlink = { url: el.link };
                    pptxSlide.addImage(options);
                }
            };
            for (var _u = 0, _v = slide.elements; _u < _v.length; _u++) {
                var el = _v[_u];
                _loop_1(el);
            }
        }
        // console.log(pptx)
        pptx.writeFile({ fileName: "pptist.pptx" }).then(function () { return exporting.value = false; })["catch"](function () {
            exporting.value = false;
            ant_design_vue_1.message.error('导出失败');
        });
    };
    return {
        exporting: exporting,
        exportJSON: exportJSON,
        exportPPTX: exportPPTX
    };
});
