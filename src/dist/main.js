"use strict";
exports.__esModule = true;
/*
 * @Author: 21克的爱情
 * @Date: 2022-02-25 15:16:00
 * @Email: raohong07@163.com
 * @LastEditors: 21克的爱情
 * @LastEditTime: 2022-03-07 22:29:22
 * @Description:
 */
var vue_1 = require("vue");
var App_vue_1 = require("./App.vue");
var store_1 = require("./store");
require("@icon-park/vue-next/styles/index.css");
require("prosemirror-view/style/prosemirror.css");
require("animate.css");
require("@/assets/styles/prosemirror.scss");
require("@/assets/styles/global.scss");
require("@/assets/styles/antd.scss");
require("@/assets/styles/font.scss");
var icon_1 = require("@/plugins/icon");
var component_1 = require("@/plugins/component");
var directive_1 = require("@/plugins/directive");
var ant_design_vue_1 = require("ant-design-vue");
var app = vue_1.createApp(App_vue_1["default"]);
app.component('InputNumber', ant_design_vue_1.InputNumber);
app.component('Divider', ant_design_vue_1.Divider);
app.component('Button', ant_design_vue_1.Button);
app.component('ButtonGroup', ant_design_vue_1.Button.Group);
app.component('Tooltip', ant_design_vue_1.Tooltip);
app.component('Popover', ant_design_vue_1.Popover);
app.component('Slider', ant_design_vue_1.Slider);
app.component('Select', ant_design_vue_1.Select);
app.component('SelectOption', ant_design_vue_1.Select.Option);
app.component('SelectOptGroup', ant_design_vue_1.Select.OptGroup);
app.component('Switch', ant_design_vue_1.Switch);
app.component('Radio', ant_design_vue_1.Radio);
app.component('RadioGroup', ant_design_vue_1.Radio.Group);
app.component('RadioButton', ant_design_vue_1.Radio.Button);
app.component('Input', ant_design_vue_1.Input);
app.component('InputGroup', ant_design_vue_1.Input.Group);
app.component('TextArea', ant_design_vue_1.Input.TextArea);
app.component('Modal', ant_design_vue_1.Modal);
app.component('Dropdown', ant_design_vue_1.Dropdown);
app.component('Menu', ant_design_vue_1.Menu);
app.component('MenuItem', ant_design_vue_1.Menu.Item);
app.component('SubMenu', ant_design_vue_1.Menu.SubMenu);
app.component('Checkbox', ant_design_vue_1.Checkbox);
app.component('Drawer', ant_design_vue_1.Drawer);
app.component('Spin', ant_design_vue_1.Spin);
app.use(icon_1["default"]);
app.use(component_1["default"]);
app.use(directive_1["default"]);
app.use(store_1.store, store_1.key);
app.config.globalProperties.$message = ant_design_vue_1.message;
app.mount('#app');
