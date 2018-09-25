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

step("Open Tab <arg0> with timeout <time>", async function(url, time) {
	await openTab(url,{timeout:time});
});

step("Close Tab", async function() {
	await closeTab()
});