const {
    switchTo,openTab,closeTab
} = require('taiko');

step("Switch to tab with title <title>",async function(title){
	await switchTo(title);
});

step("Open Tab <url>", async function(url) {
	await openTab(url);
});

step("Close Tab <url>", async function(url) {
	await closeTab(url);
});