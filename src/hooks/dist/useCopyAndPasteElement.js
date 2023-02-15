"use strict";
exports.__esModule = true;
/*
 * @Author: 21克的爱情
 * @Date: 2022-02-25 15:16:00
 * @Email: raohong07@163.com
 * @LastEditors: 21克的爱情
 * @LastEditTime: 2022-04-22 14:02:58
 * @Description:
 */
var vue_1 = require("vue");
var store_1 = require("@/store");
var clipboard_1 = require("@/utils/clipboard");
var crypto_1 = require("@/utils/crypto");
var ant_design_vue_1 = require("ant-design-vue");
var usePasteTextClipboardData_1 = require("@/hooks/usePasteTextClipboardData");
var useDeleteElement_1 = require("./useDeleteElement");
exports["default"] = (function () {
    var store = store_1.useStore();
    var activeElementIdList = vue_1.computed(function () { return store.state.activeElementIdList; });
    var activeElementList = vue_1.computed(function () { return store.getters.activeElementList; });
    var pasteTextClipboardData = usePasteTextClipboardData_1["default"]().pasteTextClipboardData;
    var deleteElement = useDeleteElement_1["default"]().deleteElement;
    // 将选中元素数据加密后复制到剪贴板
    var copyElement = function () {
        if (!activeElementIdList.value.length)
            return;
        var text = crypto_1.encrypt(JSON.stringify({
            type: 'elements',
            data: activeElementList.value
        }));
        clipboard_1.copyText(text).then(function () {
            store.commit(store_1.MutationTypes.SET_EDITORAREA_FOCUS, true);
        });
    };
    // 将选中元素复制后删除（剪切）
    var cutElement = function () {
        copyElement();
        deleteElement();
    };
    // 尝试将剪贴板元素数据解密后进行粘贴
    var pasteElement = function () {
        clipboard_1.readClipboard().then(function (text) {
            pasteTextClipboardData(text);
        })["catch"](function (err) { return ant_design_vue_1.message.warning(err); });
    };
    // 将选中元素复制后立刻粘贴
    var quickCopyElement = function () {
        copyElement();
        pasteElement();
    };
    return {
        copyElement: copyElement,
        cutElement: cutElement,
        pasteElement: pasteElement,
        quickCopyElement: quickCopyElement
    };
});
