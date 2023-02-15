"use strict";
exports.__esModule = true;
exports.state = void 0;
var pageData_1 = require("@/types/pageData");
var slides_1 = require("@/mocks/slides");
var theme_1 = require("@/mocks/theme");
var utils_1 = require("@/utils/prosemirror/utils");
exports.state = {
    activeElementIdList: [],
    handleElementId: '',
    activeGroupElementId: '',
    canvasPercentage: 90,
    canvasScale: 1,
    thumbnailsFocus: false,
    editorAreaFocus: false,
    disableHotkeys: false,
    showGridLines: false,
    creatingElement: null,
    availableFonts: [],
    toolbarState: 'slideDesign',
    viewportRatio: 0.5625,
    theme: theme_1.theme,
    slides: slides_1.slides,
    slideIndex: 0,
    selectedSlidesIndex: [],
    snapshotCursor: -1,
    snapshotLength: 0,
    ctrlKeyState: false,
    shiftKeyState: false,
    screening: false,
    clipingImageElementId: '',
    richTextAttrs: utils_1.defaultRichTextAttrs,
    selectedTableCells: [],
    isScaling: false,
    editingShapeElementId: '',
    pageData: null,
    spinning: false,
    pageDataStatus: 'loading',
    fileDataConfig: pageData_1.defaultPptxDataConfig
};
