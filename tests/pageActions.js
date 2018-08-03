var _selectors = require('./selectors')
const {
    scrollTo,scrollUp,press
} = require('taiko');

step("Scroll to <table>", async function(table) {
	await scrollTo(_selectors.getElement(table));
});

step("Scroll up <table>", async function(table) {
	await scrollUp(_selectors.getElement(table));
});

step("Press <key>", async function(key) {
	await press(key);
});