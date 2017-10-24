const puppeteer = require('puppeteer');
const { helper } = require('puppeteer/lib/helper');
const ElementHandle = require('puppeteer/lib/ElementHandle');

let page, browser;

const openBrowser = async(options) => {
    browser = await puppeteer.launch(options);
    page = await browser.newPage();
}

const closeBrowser = async(options) => browser.close();

const meta = () => ({ page, browser, });

const goto = async(url, options) => page.goto(url, options);

const reload = async(options) => page.reload(options);

const click = async(selector, options = { waitForNavigation: true }) => {
    const e = await getElement(selector);
    await e.click(options);
    await e.dispose();
    if (options.waitForNavigation) await page.waitForNavigation();
}

const doubleClick = async(selector, options = { waitForNavigation: true }) => {
    await click(selector, Object.assign({ clickCount: 2, }, options));
}

const rightClick = async(selector, options = { waitForNavigation: true }) => {
    await click(selector, Object.assign({ button: 'right', }, options));
}

const hover = async(selector) => {
    const e = await getElement(selector);
    await e.hover();
    await e.dispose();
}

const focus = async(selector, dispose = true) => (await _focus(selector)).dispose();

const write = async(text, into) => {
    const e = await _focus(into);
    await e.type(text);
    await e.dispose();
}

const upload = async(filepath, to) => {
    let e;
    if (isString(to)) e = await $xpath(`//input[@type='file'][@id=(//label[contains(text(),'${to}')]/@for)]`);
    else if (isSelector(to)) e = await to.get();
    else throw Error("Invalid element passed as paramenter");
    await e.uploadFile(filepath);
    await e.dispose();
}

const press = async(key, options) => await page.keyboard.press(key);

const highlight = async(selector) => evaluate(selector, e => e.style.border = '0.5em solid red');

const scrollTo = async(selector) => evaluate(selector, e => e.scrollIntoViewIfNeeded());

const scrollRight = async(selector, px = 100) => {
    Number.isInteger(selector) ? await page.evaluate(px => window.scrollBy(px, 0), px) :
        evaluate(selector, (e, px) => e.scrollLeft += px, px);
}

const scrollLeft = async(selector, px = 100) => {
    Number.isInteger(selector) ? await page.evaluate(px => window.scrollBy(px * -1, 0), px) :
        evaluate(selector, (e, px) => e.scrollLeft -= px, px);
}

const scrollUp = async(selector, px = 100) => {
    Number.isInteger(selector) ? await page.evaluate(px => window.scrollBy(0, px * -1), px) :
        evaluate(selector, (e, px) => e.scrollTop -= px, px);
}

const scrollDown = async(selector, px = 100) => {
    Number.isInteger(selector) ? await page.evaluate(px => window.scrollBy(0, px), px) :
        evaluate(selector, (e, px) => e.scrollTop += px, px);
}

const $ = (selector) => {
    const get = async() => selector.startsWith('//') ? $xpath(selector) : page.$(selector);
    return { get: get, exists: exists(get), };
}

const $$ = (selector) => {
    const get = async() => selector.startsWith('//') ? $$xpath(selector) : page.$$(selector);
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

const button = (selector) => {
    const get = async() => getElementByTag(selector, 'button');
    return { get: get, exists: exists(get), };
}

const inputField = (attribute, selector) => {
    assertType(selector);
    const get = async() => page.$(`input[${attribute}='${selector}']`);
    return { get: get, exists: exists(get), value: async() => page.evaluate(e => e.value, await get()), }
}

const textField = (selector) => {
    assertType(selector);
    const get = async() => $xpath(`//input[@type='text'][@id=(//label[contains(text(),'${selector}')]/@for)]`);
    return { get: get, exists: exists(get), value: async() => page.evaluate(e => e.value, await get()), }
}

const comboBox = (selector) => {
    assertType(selector);
    const get = async() => $xpath(`//select[@id=(//label[contains(text(),'${selector}')]/@for)]`);
    return {
        get: get,
        exists: exists(get),
        select: async(value) => {
            const box = await get();
            if (!box) throw new Error('Combo Box not found');
            await page.evaluate((box, value) => {
                Array.from(box.options).filter(o => o.text === value).forEach(o => o.selected = true);
            }, box, value)
        },
        value: async() => page.evaluate(e => e.value, await get())
    }
}

const checkBox = (selector) => {
    assertType(selector);
    const get = async() => $xpath(`//input[@type='checkbox'][@id=(//label[contains(text(),'${selector}')]/@for)]`);
    return {
        get: get,
        exists: exists(get),
        isChecked: async() => page.evaluate(e => e.checked, await get())
    }
}

const radioButton = (selector) => {
    assertType(selector);
    const get = async() => $xpath(`//input[@type='radio'][@id=(//label[contains(text(),'${selector}')]/@for)]`);
    return {
        get: get,
        exists: exists(get),
        isSelected: async() => page.evaluate(e => e.checked, await get())
    }
}

const text = (text) => {
    assertType(text);
    const get = async(element = '*') => $xpath(`//*[text()='${text}']`.replace('*', element));
    return { get: get, exists: exists(get), };
}

const contains = (text) => {
    assertType(text);
    const get = async(element = '*') => $xpath(`//*[contains(text(),'${text}')]`.replace('*', element));
    return { get: get, exists: exists(get), };
}

const getElement = async(selector) => {
    if (isString(selector)) return contains(selector).get();
    else if (isSelector(selector)) return selector.get();
    throw new Error("Element not found");
}

const getElementByTag = async(selector, tag) => {
    if (isString(selector)) return contains(selector).get(tag);
    else if (isSelector(selector)) return selector.get(tag);
    return null;
}

const _focus = async(selector) => {
    const e = await getElement(selector);
    await page.evaluate(e => e.focus(), e);
    return e;
}

const screenshot = async(options) => page.screenshot(options);

const isString = (obj) => typeof obj === 'string' || obj instanceof String;

const isSelector = (obj) => obj['get'] && obj['exists'];

const $xpath = async(selector) => {
    const result = await $$xpath(selector);
    return result.length > 0 ? result[0] : null;
}

const $$xpath = async(selector) => {
    const arrayHandle = await page.mainFrame()._context.evaluateHandle(selector => {
        let node, results = [];
        let result = document.evaluate(selector, document, null, XPathResult.ANY_TYPE, null);
        while (node = result.iterateNext())
            results.push(node);
        return results;
    }, selector);
    const properties = await arrayHandle.getProperties();
    await arrayHandle.dispose();
    const result = [];
    for (const property of properties.values()) {
        const elementHandle = property.asElement();
        if (elementHandle) result.push(elementHandle);
    }
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
        } catch (e) {}
        if ((new Date().getTime() - start) > options.timeout)
            throw new Error(`waiting failed: timeout ${options.timeout}ms exceeded`);
        sleep(options.intervalTime);
    }
}

const evaluate = async(selector, callback, ...args) => {
    const e = await getElement(selector);
    await page.evaluate(callback, e, ...args);
    await e.dispose();
}

const dummy = (e) => e;

module.exports = {
    openBrowser,
    closeBrowser,
    meta,
    goto,
    reload,
    $,
    $$,
    link,
    listItem,
    inputField,
    textField,
    image,
    button,
    comboBox,
    checkBox,
    radioButton,
    text,
    contains,
    click,
    doubleClick,
    rightClick,
    write,
    press,
    upload,
    highlight,
    scrollTo,
    scrollRight,
    scrollLeft,
    scrollUp,
    scrollDown,
    hover,
    screenshot,
    to: dummy,
    into: dummy,
}