const {
    switchTo
} = require('taiko');

step("Switch to tab with title <title>",async function(title){
	await switchTo(title);
});