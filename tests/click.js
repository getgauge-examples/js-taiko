'use strict';
const assert = require('assert');
var _selectors = require('./selectors')

const {
    link, click,below,contains,image,above
} = require('taiko');

step("Click link <userlink> below <table>", async function (userlink,table) {
    await click(link(userlink,below(_selectors.getElement(table))));
});

step("Click an element that contains <text>", async function (text) {
    await click(contains(text));
});

step("Click link <userlink>", async function(userlink) {
    await click(link(userlink));
});

step("Click <selector>", async function(selector) {
    await click(selector)
});

step("Click image above <table>", async function(table) {
    var element = _selectors.getElement(table)
    await click(image(above(element)))
});