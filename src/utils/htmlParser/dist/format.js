"use strict";
exports.__esModule = true;
exports.format = exports.splitHead = void 0;
exports.splitHead = function (str, sep) {
    var idx = str.indexOf(sep);
    if (idx === -1)
        return [str];
    return [str.slice(0, idx), str.slice(idx + sep.length)];
};
var unquote = function (str) {
    var car = str.charAt(0);
    var end = str.length - 1;
    var isQuoteStart = car === '"' || car === "'";
    if (isQuoteStart && car === str.charAt(end)) {
        return str.slice(1, end);
    }
    return str;
};
var formatAttributes = function (attributes) {
    return attributes.map(function (attribute) {
        var parts = exports.splitHead(attribute.trim(), '=');
        var key = parts[0];
        var value = typeof parts[1] === 'string' ? unquote(parts[1]) : null;
        return { key: key, value: value };
    });
};
exports.format = function (nodes) {
    return nodes.map(function (node) {
        if (node.type === 'element') {
            var children = exports.format(node.children);
            console.log(formatAttributes(node.attributes));
            var item_1 = {
                type: 'element',
                tagName: node.tagName.toLowerCase(),
                attributes: formatAttributes(node.attributes),
                children: children
            };
            return item_1;
        }
        var item = {
            type: node.type,
            content: node.content
        };
        return item;
    });
};
