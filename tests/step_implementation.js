/* globals gauge*/
"use strict";
const puppeteer = require('puppeteer');
const assert = require("assert");
const { newPage, by } = require("./helper");

let page;
let browser;

beforeSuite(async function () {
  browser = await puppeteer.launch();
  page = await newPage(browser); // browser.newPage()
});

afterSuite(async function () {
  browser.close();
});

step("Navigate to Gauge homepage <query>", async function (query) {
  await page.goto(query);
});

step("Go to Gauge Get Started Page", async function () {
  await page.clickOn(by.text("Get Started")); // finding the element by text
});

step("Go to Gauge Documentation Page", async function () {
  await page.clickOn(by.xpath(`//*[text()="Documentation"]`)); // finding the element by xpath
});

step("Display the sub title <title>", async function(title) {
  await page.waitFor('.sub-title');
  const message = await page.$eval('.sub-title', e => e.innerText);
  assert.equal(message, title);
});

step("Display the Gauge version", async function() {
  await page.waitForNavigation();
  assert.equal(await page.exists('.gauge-version'), true); // Checking if the element exists on page with css selector
  assert.equal(await page.exists(by.containsText('0.9.3')), true); // Checking if the element exists on page with contains text selector.
});