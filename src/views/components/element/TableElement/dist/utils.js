"use strict";
exports.__esModule = true;
exports.formatText = exports.getTextStyle = void 0;
/**
 * 计算单元格文本样式
 * @param style 单元格文本样式原数据
 */
exports.getTextStyle = function (style) {
    if (!style)
        return {};
    var bold = style.bold, em = style.em, underline = style.underline, strikethrough = style.strikethrough, color = style.color, backcolor = style.backcolor, fontsize = style.fontsize, fontname = style.fontname, align = style.align;
    var textDecoration = (underline ? 'underline' : '') + " " + (strikethrough ? 'line-through' : '');
    if (textDecoration === ' ')
        textDecoration = 'none';
    return {
        fontWeight: bold ? 'bold' : 'normal',
        fontStyle: em ? 'italic' : 'normal',
        textDecoration: textDecoration,
        color: color || '#000',
        backgroundColor: backcolor || '',
        fontSize: fontsize || '14px',
        fontFamily: fontname || '微软雅黑',
        textAlign: align || 'left'
    };
};
exports.formatText = function (text) {
    return text.replace(/\n/g, '</br>').replace(/ /g, '&nbsp;').replaceAll('&lt;', '<').replaceAll('&gt;', '>').replace('&quot;', '"');
};
