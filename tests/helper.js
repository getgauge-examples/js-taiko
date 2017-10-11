const puppeteer = require('puppeteer');
const { helper } = require('puppeteer/lib/helper');
const ElementHandle = require('puppeteer/lib/ElementHandle');

let page, browser;

const openBrowser = async(options) => {
    browser = await puppeteer.launch(options);
    page = await browser.newPage();
}

const closeBrowser = async(options) => browser.close();

const goto = async(url, options) => page.goto(url, options);

const reload = async(options) => page.reload(options);

const click = async(selector, options = {}, waitForNavigation = true) => {
    const element = await getElement(selector);
    if (!element) return;
    await element.click(options);
    await element.dispose();
    if (waitForNavigation) await page.waitForNavigation();
}

const doubleClick = async(selector, options = {}, waitForNavigation = true) => {
    await click(selector, { clickCount: 2 }, waitForNavigation);
}

const rightClick = async(selector, options = {}, waitForNavigation = true) => {
    await click(selector, { button: 'right' }, waitForNavigation);
}

const hover = async(selector) => {
    const element = await getElement(selector);
    if (!element) return;
    await element.hover();
    await element.dispose();
}

const focus = async(selector, dispose = true) => {
    const element = await _focus(selector)
    if (element) await element.dispose();
}

const write = async(text, into) => {
    if (into) await focus(into);
    await page.type(text);
}

const upload = async(filepath, to) => {
    const element = await _focus(to, false);
    await element.uploadFile(filepath);
    await element.dispose();
}

const press = async(key, options) => {
    await page.press('', { text: String.fromCharCode(key), delay: 0 });
}

const $ = (selector) => {
    const get = async() => selector.startsWith('//') ? xpath$(selector) : page.$(selector);
    return { get: get, exists: exists(get), };
}

const $$ = (selector) => {
    const get = async() => selector.startsWith('//') ? xpath$$(selector) : page.$$(selector);
    return { get: get, exists: async() => (await get()).length > 0, };
}

const image = (selector) => {
    assertType(selector);
    const get = async() => page.$(`img[alt='${selector}']`);
    return { get: get, exists: exists(get), };
}

const link = (selector) => {
    const get = async() => getElementByTag(selector, 'a');
    return { get: get, exists: exists(get), };
}

const listItem = (selector) => {
    const get = async() => getElementByTag(selector, 'li');
    return { get: get, exists: exists(get), };
}

const textField = (selector, attribute = 'placeholder') => {
    assertType(selector);
    const get = async() => page.$(`input[${attribute}='${selector}']`);
    return { get: get, exists: exists(get), value: async() => page.evaluate(e => e.value, await get()) }
}

const text = (text) => {
    assertType(text);
    const get = async(element = '*') => xpath$(`//*[text()='${text}']`.replace('*', element));
    return { get: get, exists: exists(get), };
}

const contains = (text) => {
    assertType(text);
    const get = async(element = '*') => xpath$(`//*[contains(text(),'${text}')]`.replace('*', element));
    return { get: get, exists: exists(get), };
}

const getElement = async(selector) => {
    if (isString(selector)) return contains(selector).get();
    else if (isSelector(selector)) return selector.get();
    return null;
}

const getElementByTag = async(selector, tag) => {
    if (isString(selector)) return contains(selector).get(tag);
    else if (isSelector(selector)) return selector.get(tag);
    return null;
}

const _focus = async(selector) => {
    const element = await getElement(selector);
    if (!element) return null;
    await page.evaluate(e => e.focus(), element);
    return element;
}

const isString = (obj) => typeof obj === 'string' || obj instanceof String;

const isSelector = (obj) => obj['get'] && obj['exists'];

const xpath$ = async(selector) => {
    const result = await xpath$$(selector);
    return result.length > 0 ? result[0] : null;
}

const xpath$$ = async(selector) => {
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
    return result;
}

const assertType = (obj, condition = isString, message = 'String parameter expected') => {
    if (!condition(obj)) throw new Error(message);
}

const sleep = (milliseconds) => {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++)
        if ((new Date().getTime() - start) > milliseconds) break;
}

const exists = (get) => {
    return async() => {
        try {
            await waitUntil(async() => (await get()) != null);
            return true;
        } catch (e) {
            return false;
        }
    }
};

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

const dummy = (e) => e;

module.exports = {
    openBrowser,
    closeBrowser,
    goto,
    reload,
    $,
    $$,
    link,
    listItem,
    textField,
    image,
    click,
    doubleClick,
    rightClick,
    write,
    press,
    upload,
    text,
    contains,
    hover,
    to: dummy,
    into: dummy,
    keys: { ENTER: 13, },
}