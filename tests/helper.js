const puppeteer = require('puppeteer');
const { helper } = require('puppeteer/lib/helper');
const ElementHandle = require('puppeteer/lib/ElementHandle');

let page, browser;

const openBrowser = async(options) => {
    browser = await puppeteer.launch(options);
    page = await browser.newPage();
}

const closeBrowser = async(options) => await browser.close();

const goto = async(url, options) => await page.goto(url, options);

const click = async(selector, options = {}, waitForNavigation = true) => {
    const element = await getElement(selector);
    if (!element) return;
    const result = await element.click(options);
    await element.dispose();
    if (waitForNavigation) await page.waitForNavigation();
}

const doubleClick = async(selector, options = {}, waitForNavigation = true) => {
    await click(selector, { clickCount: 2 }, waitForNavigation);
}

const hover = async(selector) => {
    const element = await getElement(selector);
    if (!element) return;
    await element.hover();
    await element.dispose();
}

const focus = async(selector) => {
    const element = await getElement(selector);
    if (!element) return;
    await page.evaluate(e => e.focus(), element);
    await element.dispose();
}

const write = async(text, into) => {
    if (into) await focus(into);
    await page.type(text);
}

const press = async(key, options) => {
    await page.press("", { text: String.fromCharCode(key), delay: 0 });
}

const waitUntil = async(condition, options = { intervalTime: 1000, timeout: 10000 }) => {
    var start = new Date().getTime();
    while (true) {
        try {
            if (await condition()) break;
        } catch (e) {
            continue;
        }
        if ((new Date().getTime() - start) > options.timeout)
            throw new Error(`waiting failed: timeout ${options.timeout}ms exceeded`);
        sleep(options.intervalTime);
    }
}

const $ = (selector) => {
    const get = async() => await (selector.startsWith("//") ? xpath(selector) : page.$(selector));
    return { get: get, exists: exists(get), };
}

const image = (selector) => {
    assertType(selector);
    const get = async() => await page.$(`img[alt="${selector}"]`);
    return { get: get, exists: exists(get), };
}

const link = (selector) => {
    const get = async() => await getElementByTag(selector, "a");
    return { get: get, exists: exists(get), };
}

const listItem = (selector) => {
    const get = async() => await getElementByTag(selector, "li");
    return { get: get, exists: exists(get), };
}

const textField = (selector, attribute = "placeholder") => {
    assertType(selector);
    const get = async() => await page.$(`input[${attribute}="${selector}"]`);
    return { get: get, exists: exists(get), value: async() => await page.evaluate(e => e.value, await get()) }
}

const text = (text) => {
    assertType(text);
    const get = async(element = "*") => await xpath(`//*[text()="${text}"]`.replace("*", element));
    return { get: get, exists: exists(get), };
}

const contains = (text) => {
    assertType(text);
    const get = async(element = "*") => await xpath(`//*[contains(.,"${text}")]`.replace("*", element));
    return { get: get, exists: exists(get), };
}

const getElement = async(selector) => {
    if (isString(selector)) return await text(selector).get();
    else if (isSelector(selector)) return await selector.get();
    return null;
}

const getElementByTag = async(selector, tag) => {
    if (isString(selector)) return await text(selector).get(tag);
    else if (isSelector(selector)) return selector.get(tag);
    return null;
}

const isString = (obj) => typeof obj == 'string' || obj instanceof String;

const isSelector = (obj) => obj['get'] && obj['exists'];

const xpath = async(selector) => {
    const frame = page.mainFrame();
    const remoteObject = await page.mainFrame()._rawEvaluate(selector => {
        let node, results = [];
        let result = document.evaluate(selector, document, null, XPathResult.ANY_TYPE, null);
        while (node = result.iterateNext())
            results.push(node);
        return results;
    }, selector);
    const response = await frame._client.send('Runtime.getProperties', {
        objectId: remoteObject.objectId,
        ownProperties: true
    });
    const properties = response.result;
    const result = [];
    const releasePromises = [helper.releaseObject(frame._client, remoteObject)];
    for (const property of properties) {
        if (property.enumerable && property.value.subtype === 'node')
            result.push(new ElementHandle(frame, frame._client, property.value, frame._mouse, frame._touchscreen));
        else
            releasePromises.push(helper.releaseObject(frame._client, property.value));
    }
    await Promise.all(releasePromises);
    return result.length > 0 ? result[0] : null;
}

const assertType = (obj, condition = isString, message = "String parameter expected") => {
    if (!condition(obj)) throw new Error(message);
}

const sleep = (milliseconds) => {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++)
        if ((new Date().getTime() - start) > milliseconds) break;
}

const exists = (get) => async() => (await get()) != null;

const dummy = (e) => e;

module.exports = {
    goto,
    openBrowser,
    closeBrowser,
    $,
    link,
    listItem,
    textField,
    image,
    click,
    doubleClick,
    write,
    press,
    text,
    contains,
    hover,
    waitUntil,
    to: dummy,
    into: dummy,
    keys: { ENTER: 13, },
}