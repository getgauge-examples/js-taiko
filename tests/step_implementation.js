/* globals gauge*/
"use strict";
const assert = require("assert");
const {
    goto, openBrowser, closeBrowser, $, link, listItem, textField, image, click,
    doubleClick, write, press, text, contains, hover, waitUntil, to, into, keys,
} = require("./helper");

beforeSuite(async() => await openBrowser());

afterSuite(async() => await closeBrowser());

step("Navigate to Gauge homepage <query>", async query => await goto(query));

step("Display the Gauge logo", async() => assert.ok(await image("Gauge logo").exists()));

step("Go to Gauge get started page", async() => await click("Get Started"));

step("Display the sub title <title>", async(title) => assert.ok(await text(title).exists()));

step("Go to Gauge documentation page", async() => await click($(`//*[text()="Documentation"]`)));

step("Display the Gauge version", async() => assert.ok(await contains("0.9.3").exists()));

step("Go to plugins page", async function() {
    await hover("Get Started");
    await click("Plugins");
});

step("Display the official plugins", async function() {
    assert.ok(await link("Get Started").exists());
    assert.ok(await link(contains("Star")).exists());

    assert.ok(await text("Gauge Plugins").exists());

    assert.ok(await listItem(contains("Java runner")).exists());
    assert.ok(await listItem(contains("C# runner")).exists());
    assert.ok(await listItem(contains("Ruby runner")).exists());
});

step("Search for Hooks", async function() {
    await write("Hooks", into(textField("Search docs")));
    assert.equal(await textField("Search docs").value(), "Hooks")
    await press(keys.ENTER);

    await waitUntil(link("Language Features").exists);
});