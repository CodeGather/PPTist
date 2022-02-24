"use strict";
exports.__esModule = true;
var FileInput_vue_1 = require("@/components/FileInput.vue");
var CheckboxButton_vue_1 = require("@/components/CheckboxButton.vue");
var CheckboxButtonGroup_vue_1 = require("@/components/CheckboxButtonGroup.vue");
var index_vue_1 = require("@/components/ColorPicker/index.vue");
var FullscreenSpin_vue_1 = require("@/components/FullscreenSpin.vue");
exports["default"] = {
    install: function (app) {
        app.component('FileInput', FileInput_vue_1["default"]);
        app.component('CheckboxButton', CheckboxButton_vue_1["default"]);
        app.component('CheckboxButtonGroup', CheckboxButtonGroup_vue_1["default"]);
        app.component('ColorPicker', index_vue_1["default"]);
        app.component('FullscreenSpin', FullscreenSpin_vue_1["default"]);
    }
};
