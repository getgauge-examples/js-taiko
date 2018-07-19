'use strict';
const assert = require('assert');
const {
    browser, page, openBrowser, closeBrowser, goto, reload, $, link, listItem,
    inputField, fileField, textField, image, button, comboBox, checkBox, radioButton, alert,
    prompt, confirm, beforeunload, text, contains, click, doubleClick, rightClick, write, press,
    attach, highlight, focus, scrollTo, scrollRight, scrollLeft, scrollUp, scrollDown,
    hover, screenshot, timeoutSecs, intervalSecs, waitForNavigation, to, into,
} = require('taiko');

beforeSuite(async() => openBrowser({args: ['--no-sandbox', '--disable-setuid-sandbox']}));

afterSuite(async() => closeBrowser());

step('Navigate to <url>', async url => goto(url));

step('Display the Gauge logo', async() => assert.ok(await link('Gauge').exists()));

step('Go to Gauge get started page', async() => click('Get Started'));

step("Click on Zip tab", async () => assert.ok(await click('Zip')));

step("Check <heading> exists", async (heading) => assert.ok(await text(heading).exists()));

step('Go to Gauge documentation page', async() => click($(`//*[text()='Documentation']`)));

step('Display quick start', async() => assert.ok(await contains('quick start').exists()));

step('Go to plugins page', async() => {
    assert.ok(await link('Get Started').exists());
    assert.ok(await link(text('Get Started')).exists());
    assert.ok(await $(`//a[text()='Get Started']`).exists());

    await hover('Get Started');
    await click('Plugins');
});

step('Display the language plugins', async() => {
    assert.ok(await text('Plugins').exists(intervalSecs(1), timeoutSecs(10)));

    assert.ok(await contains('Java Runner').exists());
    await highlight(contains('Java Runner'));

    assert.ok(await contains('Ruby runner').exists());
});

step('Search for Hooks', async() => {
    const field = inputField('placeholder', 'Search Docs');
    await write('Hooks', into(field));
    assert.equal(await field.value(), 'Hooks');
    await press('Enter');
    assert.ok(await link('CSharp').exists());
});

step('Click on IDE plugins', async() => {
    assert.ok(await listItem('IDE Plugins').exists());
    assert.ok(await click('IDE Plugins'));
});

step('Display the IDE plugins', async() => {
    assert.ok(await link('IntelliJ').exists());
    assert.ok(await link('Visual Studio Code').exists());
});

step('Combo Box', async() => {
    const box = comboBox('Cars');
    assert.ok(await box.exists());
    await box.select('Saab');
    assert.equal(await box.value(), 'saab');
});

step('Check Box', async() => {
    const box = checkBox('Vehicle');
    assert.ok(await box.exists());
    await checkBox('Vehicle').check();
    assert.ok(await box.isChecked());
});

step('Radio Button', async() => {
    const button = radioButton('Female');
    assert.ok(await button.exists());
    await button.select();
    assert.ok(await button.isSelected());
});

step('Attach file', async() => {
    const field = fileField('File');
    await attach('file.txt', to(field));
    assert.ok((await field.value()).endsWith('file.txt'));
});

step('Text Field', async() => {
    await focus('Username');
    await write('Gopher', into('Username'));
    const field = textField('Username');
    assert.ok(await field.exists());
    assert.equal(await field.value(), 'Gopher');
});

step('Scroll', async() => {
    await scrollTo($('#myDIV'));

    // Scrolling the page
    await scrollRight(200);
    await scrollLeft();
    await scrollLeft(100);
    await scrollDown(200);
    await scrollUp(100);
    await scrollUp();

    // Scrolling a specific element
    await scrollRight($('#myDIV'), 200);
    await scrollLeft($('#myDIV'), 100);
    await scrollLeft($('#myDIV'));
    await scrollDown($('#myDIV'), 200);
    await scrollUp($('#myDIV'));
    await scrollUp($('#myDIV'), 100);
});

step('Alert', async() => {
    alert('Message 1', async alert => await alert.dismiss());
    alert('Message 2', async alert => await alert.dismiss());

    await click(button("Alert"), waitForNavigation(false))
    await click(button("Alert1"), waitForNavigation(false))
});
