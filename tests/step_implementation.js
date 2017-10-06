/* globals gauge*/
"use strict";
const puppeteer = require('puppeteer');
const assert = require("assert");
const {
    Page,
    contains,
    xpath,
    link,
    text,
    listItem,
    image
} = require("./helper");

let page, browser;

beforeSuite(async function () {
    // TODO: Puppeteer behind the scenes
    // _openBrowser();
    browser = await puppeteer.launch();
    page = await Page.create(browser); // browser.newPage()
});

afterSuite(async function () {
    browser.close();
//    _closeBrowser();
});

step("Navigate to Gauge homepage <query>", async function (query) {
    // The API does not deal with pages
    // await _goto(query);
    await page.goto(query);
});

step("Display the Gauge logo", async function() {
    assert.ok(await page.exists(image("Gauge logo"))); // Checking if the image with alt exists on page
});

step("Go to Gauge get started page", async function() {
    // Assuming you are on the page
    // Prefer without selectos only qualify as link when there are more than one elements.
    // await _click("Get Started"); 
    await page.click(link("Get Started")); // finding the element by text
    // OR await page.click("Get Started");
});

step("Display the sub title <title>", async function (title) {
    // Make this
    // assert.ok(_text(title).exists());
    assert.ok(await page.exists(title)); // Checking if the element with the text exists on page
});

step("Go to Gauge documentation page", async function() {
    // Remove this, not required at the moment.
    // there will be a wild card selector
    // either $() or _$("//blah") will assume it is an xpath becuase there is a //
    // _$('#') else any text will be a css selector.
    // example
    // await _click(_$(`//*[text()="Documentation"]`));
    await page.click(xpath(`//*[text()="Documentation"]`)); // finding the element by xpath
});

step("Display the Gauge version", async function () {
    // Link existence
    // assert.ok(await link("Quick start").exists());
    assert.ok(await page.exists(link("Quick start"))); // Checking if a link with the text exists on page
    assert.ok(await page.exists(link(contains("Quick")))); // Checking if a link containing the text exists on page

    // Text existence
    assert.ok(await page.exists("Welcome")); // Checking if any element with the text exists on page
    assert.ok(await page.exists(text("Welcome"))); // Checking if any element with the text exists on page
    assert.ok(await page.exists(contains("come"))); // Checking if any element with the text exists on page
    assert.ok(await page.exists(contains("0.9.3"))); // Checking if the element containing the text exists on page
});

step("Go to plugins page", async function() {
    await page.hover(link("Get Started")); // Hover on a link by text
    await page.click(link("Plugins")); // click on a link by text
});

step("Display the official plugins", async function() {
    assert.ok(await page.exists("Gauge Plugins")); // Checking if the element with the text exists on page

    // Checking if the li containing the text exists on page
    assert.ok(await page.exists(listItem(contains("Java runner"))));
    assert.ok(await page.exists(listItem(contains("C# runner"))));
    assert.ok(await page.exists(listItem(contains("Ruby runner"))));
    assert.ok(await page.exists(listItem(contains("Java runner"))));
});