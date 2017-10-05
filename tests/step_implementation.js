/* globals gauge*/
"use strict";
const puppeteer = require('puppeteer');
const assert = require("assert");
const {
    Page,
    containsText,
    xpath,
    link,
    text
} = require("./helper");

let page, browser;

beforeSuite(async function() {
    browser = await puppeteer.launch();
    page = await Page.create(browser); // browser.newPage()
});

afterSuite(async function() {
    browser.close();
});

step("Navigate to Gauge homepage <query>", async function(query) {
    await page.goto(query);
});

step("Go to Gauge Get Started Page", async function() {
    await page.click(link("Get Started")); // finding the element by text
    // OR await page.click("Get Started");
});

step("Display the sub title <title>", async function(title) {
    assert.ok(await page.exists(title)); // Checking if the element with the text exists on page
});

step("Go to Gauge Documentation Page", async function() {
    await page.click(xpath(`//*[text()="Documentation"]`)); // finding the element by xpath
});

step("Display the Gauge version", async function() {
    // Link existence
    assert.ok(await page.exists(link("Quick start"))); // Checking if a link with the text exists on page
    assert.ok(await page.exists(link(containsText("Quick")))); // Checking if a link containing the text exists on page

    // Text existence
    assert.ok(await page.exists("Welcome")); // Checking if any element with the text exists on page
    assert.ok(await page.exists(text("Welcome"))); // Checking if any element with the text exists on page
    assert.ok(await page.exists(containsText("come"))); // Checking if any element with the text exists on page

    assert.ok(await page.exists(containsText("0.9.3"))); // Checking if the element containing the text exists on page
});