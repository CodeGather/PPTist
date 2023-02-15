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
var _a;
exports.__esModule = true;
exports.mutations = void 0;
var lodash_1 = require("lodash");
var slides_1 = require("@/mocks/slides");
var font_1 = require("@/configs/font");
var font_2 = require("@/utils/font");
exports.mutations = (_a = {},
    // editor
    _a["setActiveElementIdList" /* SET_ACTIVE_ELEMENT_ID_LIST */] = function (state, activeElementIdList) {
        if (activeElementIdList.length === 1)
            state.handleElementId = activeElementIdList[0];
        else
            state.handleElementId = '';
        state.activeElementIdList = activeElementIdList;
    },
    _a["setHandleElementId" /* SET_HANDLE_ELEMENT_ID */] = function (state, handleElementId) {
        state.handleElementId = handleElementId;
    },
    _a["setActiveGroupElementId" /* SET_ACTIVE_GROUP_ELEMENT_ID */] = function (state, activeGroupElementId) {
        state.activeGroupElementId = activeGroupElementId;
    },
    _a["setCanvasPercentage" /* SET_CANVAS_PERCENTAGE */] = function (state, percentage) {
        state.canvasPercentage = percentage;
    },
    _a["setCanvasScale" /* SET_CANVAS_SCALE */] = function (state, scale) {
        state.canvasScale = scale;
    },
    _a["setThumbnailsFocus" /* SET_THUMBNAILS_FOCUS */] = function (state, isFocus) {
        state.thumbnailsFocus = isFocus;
    },
    _a["setEditorAreaFocus" /* SET_EDITORAREA_FOCUS */] = function (state, isFocus) {
        state.editorAreaFocus = isFocus;
    },
    _a["setDisableHotkeysState" /* SET_DISABLE_HOTKEYS_STATE */] = function (state, disable) {
        state.disableHotkeys = disable;
    },
    _a["setGridLinesState" /* SET_GRID_LINES_STATE */] = function (state, show) {
        state.showGridLines = show;
    },
    _a["setCreatingElement" /* SET_CREATING_ELEMENT */] = function (state, element) {
        state.creatingElement = element;
    },
    _a["setAvailableFonts" /* SET_AVAILABLE_FONTS */] = function (state) {
        state.availableFonts = font_1.SYS_FONTS.filter(function (font) { return font_2.isSupportFont(font.value); });
    },
    _a["setToolbarState" /* SET_TOOLBAR_STATE */] = function (state, toolbarState) {
        state.toolbarState = toolbarState;
    },
    _a["setClipingImageElementId" /* SET_CLIPING_IMAGE_ELEMENT_ID */] = function (state, elId) {
        state.clipingImageElementId = elId;
    },
    _a["setRichTextAttrs" /* SET_RICHTEXT_ATTRS */] = function (state, attrs) {
        state.richTextAttrs = attrs;
    },
    _a["setSelectedTableCells" /* SET_SELECTED_TABLE_CELLS */] = function (state, cells) {
        state.selectedTableCells = cells;
    },
    _a["setScalingState" /* SET_SCALING_STATE */] = function (state, isScaling) {
        state.isScaling = isScaling;
    },
    _a["setEditingShapeElementId" /* SET_EDITING_SHAPE_ELEMENT_ID */] = function (state, ellId) {
        state.editingShapeElementId = ellId;
    },
    // slides
    _a["setTheme" /* SET_THEME */] = function (state, themeProps) {
        state.theme = __assign(__assign({}, state.theme), themeProps);
    },
    _a["setViewportRatio" /* SET_VIEWPORT_RATIO */] = function (state, viewportRatio) {
        state.viewportRatio = viewportRatio;
    },
    _a["setSlides" /* SET_SLIDES */] = function (state, slides) {
        state.slides = slides;
    },
    _a["addSlide" /* ADD_SLIDE */] = function (state, slide) {
        var _a;
        var slides = Array.isArray(slide) ? slide : [slide];
        var addIndex = state.slideIndex + 1;
        (_a = state.slides).splice.apply(_a, __spreadArrays([addIndex, 0], slides));
        state.slideIndex = addIndex;
    },
    _a["updateSlide" /* UPDATE_SLIDE */] = function (state, props) {
        var slideIndex = state.slideIndex;
        state.slides[slideIndex] = __assign(__assign({}, state.slides[slideIndex]), props);
    },
    _a["deleteSlide" /* DELETE_SLIDE */] = function (state, slideId) {
        var slidesId = Array.isArray(slideId) ? slideId : [slideId];
        var deleteSlidesIndex = [];
        var _loop_1 = function (i) {
            var index = state.slides.findIndex(function (item) { return item.id === slidesId[i]; });
            deleteSlidesIndex.push(index);
        };
        for (var i = 0; i < slidesId.length; i++) {
            _loop_1(i);
        }
        var newIndex = Math.min.apply(Math, deleteSlidesIndex);
        var maxIndex = state.slides.length - slidesId.length - 1;
        if (newIndex > maxIndex)
            newIndex = maxIndex;
        state.slideIndex = newIndex;
        state.slides = state.slides.filter(function (item) { return !slidesId.includes(item.id); });
    },
    _a["updateSlideIndex" /* UPDATE_SLIDE_INDEX */] = function (state, index) {
        state.slideIndex = index;
    },
    _a["updateSelectedSlidesIndex" /* UPDATE_SELECTED_SLIDES_INDEX */] = function (state, selectedSlidesIndex) {
        state.selectedSlidesIndex = selectedSlidesIndex;
    },
    _a["addElement" /* ADD_ELEMENT */] = function (state, element) {
        var elements = Array.isArray(element) ? element : [element];
        var currentSlideEls = state.slides[state.slideIndex].elements;
        var newEls = __spreadArrays(currentSlideEls, elements);
        state.slides[state.slideIndex].elements = newEls;
    },
    _a["updateElement" /* UPDATE_ELEMENT */] = function (state, data) {
        var id = data.id, props = data.props;
        var elIdList = typeof id === 'string' ? [id] : id;
        var slideIndex = state.slideIndex;
        var slide = state.slides[slideIndex];
        var elements = slide.elements.map(function (el) {
            return elIdList.includes(el.id) ? __assign(__assign({}, el), props) : el;
        });
        state.slides[slideIndex].elements = elements;
    },
    _a["removeElementProps" /* REMOVE_ELEMENT_PROPS */] = function (state, data) {
        var id = data.id, propName = data.propName;
        var propsNames = typeof propName === 'string' ? [propName] : propName;
        var slideIndex = state.slideIndex;
        var slide = state.slides[slideIndex];
        var elements = slide.elements.map(function (el) {
            return el.id === id ? lodash_1.omit(el, propsNames) : el;
        });
        state.slides[slideIndex].elements = elements;
    },
    // snapshot
    _a["setSnapshotCursor" /* SET_SNAPSHOT_CURSOR */] = function (state, cursor) {
        state.snapshotCursor = cursor;
    },
    _a["setSnapshotLength" /* SET_SNAPSHOT_LENGTH */] = function (state, length) {
        state.snapshotLength = length;
    },
    // keyboard
    _a["setCtrlKeyState" /* SET_CTRL_KEY_STATE */] = function (state, isActive) {
        state.ctrlKeyState = isActive;
    },
    _a["setShiftKeyState" /* SET_SHIFT_KEY_STATE */] = function (state, isActive) {
        state.shiftKeyState = isActive;
    },
    // screen
    _a["setScreening" /* SET_SCREENING */] = function (state, screening) {
        state.screening = screening;
    },
    // pageInitData
    _a["pageData" /* PAGE_DATA */] = function (state, pageData) {
        state.pageData = pageData;
        if (pageData.reportData) {
            if (typeof pageData.reportData.content === 'string') {
                pageData.reportData.content = JSON.parse(pageData.reportData.content);
            }
            // 如果有数据进行赋值否则使用初始化数据
            if (pageData.reportData.content && pageData.reportData.content instanceof Array) {
                // 处理shape数据的html代码
                pageData.reportData.content = pageData.reportData.content.map(function (item) {
                    item.elements = item.elements.map(function (element) {
                        if (element['text'] && element['text']['content']) {
                            element['text']['content'] = element['text']['content'].replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&quot;', '"');
                        }
                        return element;
                    });
                    return item;
                });
                state.slides = pageData.reportData.content;
            }
            else {
                state.slides = slides_1.slides;
            }
            state.fileDataConfig = pageData.reportData;
        }
        else {
            state.slides = slides_1.slides;
        }
    },
    // pageInitDataStatus
    _a["pageLoading" /* PAGE_LOADING */] = function (state, pageDataStatus) {
        state.pageDataStatus = pageDataStatus;
    },
    _a["updataFileData" /* UPDATE_FILEDATA */] = function (state, data) {
        state.fileDataConfig = __assign(__assign({}, state.fileDataConfig), data);
    },
    _a["spinning" /* PAGE_SPINNING */] = function (state, data) {
        state.spinning = data;
    },
    _a);
