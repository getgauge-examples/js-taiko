'use strict';
const assert = require('assert');
const {
    openBrowser, closeBrowser, goto, reload, $, $$, link, listItem, textField,
    image, click, doubleClick, rightClick, write, press, text, contains, hover,
    upload, to, into, keys,
} = require('./helper');

beforeSuite(async() => openBrowser());

afterSuite(async() => closeBrowser());

step('Navigate to Gauge homepage <query>', async query => goto(query));

step('Display the Gauge logo', async() => assert.ok(image('Gauge logo').exists()));

step('Go to Gauge get started page', async() => click('Get Started'));

step('Display the sub title <title>', async(title) => assert.ok(await text(title).exists()));

step('Go to Gauge documentation page', async() => click($(`//*[text()='Documentation']`)));

step('Display the Gauge version', async() => assert.ok(await contains('0.9.3').exists()));

step('Go to plugins page', async function() {
    assert.ok(await link('Get Started').exists());
    assert.ok(await link(text('Get Started')).exists());
    assert.ok(await link('Star').exists());
    assert.ok(await $$(`//a[text()='Get Started']`).exists());

    await hover('Get Started');
    await click('Plugins');
});

step('Display the official plugins', async function() {

    assert.ok(await text('Gauge Plugins').exists());

    assert.ok(await contains('Java runner').exists());
    assert.ok(await contains('C# runner').exists());
    assert.ok(await contains('Ruby runner').exists());
});

// click(first(link('Get Started')))
// click(first('Get Started'))

step('Search for Hooks', async function() {
    await write('Hooks', into(textField('Search docs')));
    assert.equal(await textField('Search docs').value(), 'Hooks')
    await press(keys.ENTER);

    assert.ok(await link('Language Features').exists());
});

step('Display the IDE plugins', async function() {
    await click('Using Gauge');
    assert.ok(await listItem('Intellij IDEA').exists());
    assert.ok(await listItem('Visual Studio').exists());
});