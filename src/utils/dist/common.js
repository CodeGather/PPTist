"use strict";
exports.__esModule = true;
exports.getSearchPathValue = exports.getLocationHost = exports.fillDigit = exports.createRandomCode = void 0;
/*
 * @Author: 21克的爱情
 * @Date: 2022-02-25 15:16:00
 * @Email: raohong07@163.com
 * @LastEditors: 21克的爱情
 * @LastEditTime: 2022-03-03 11:27:41
 * @Description:
 */
var lodash_1 = require("lodash");
/**
 * 生成随机码
 * @param len 随机码长度
 */
exports.createRandomCode = function (len) {
    if (len === void 0) { len = 6; }
    var charset = "_0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    var maxLen = charset.length;
    var ret = '';
    for (var i = 0; i < len; i++) {
        var randomIndex = Math.floor(Math.random() * maxLen);
        ret += charset[randomIndex];
    }
    return ret;
};
/**
 * 补足数字位数
 * @param digit 数字
 * @param len 位数
 */
exports.fillDigit = function (digit, len) {
    return lodash_1.padStart('' + digit, len, '0');
};
/*
 * 获取路径的参数
 */
exports.getLocationHost = function (key) {
    var host = location.origin;
    if (location.origin.indexOf('localhost') > -1) {
        host = 'http://localhost:8090';
    }
    return host + '/jokui-dali-fast' + key;
};
/*
 * 获取路径的参数
 */
exports.getSearchPathValue = function (key) {
    var pathValue = location.search;
    if (!pathValue)
        return '';
    if (pathValue.indexOf('?') > -1) {
        pathValue = pathValue.slice(1);
    }
    var pathObjectData = pathValue.split('&').reduce(function (prev, next) {
        if (next.indexOf('=') > -1) {
            var itemValue = next.split('=');
            prev[itemValue[0]] = itemValue[1];
        }
        return prev;
    }, {});
    return pathObjectData[key] || '';
};
