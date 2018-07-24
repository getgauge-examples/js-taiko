const assert = require('assert');
var _selectors = require('./selectors')

step("Assert ok <table>", async function(table) {
	await assert.ok(_selectors.getElement(table))
});