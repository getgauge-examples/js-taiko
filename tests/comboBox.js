'use strict';
const assert = require('assert');
var _selectors = require('./selectors')

const {
    link, comboBox,near,inputField
} = require('taiko');

step("Select <value> of Combo Box near <table>", async function(value, table) {
    var element = _selectors.getElement(table);
    await comboBox(near(element)).select("‪हिन्दी‬");
});