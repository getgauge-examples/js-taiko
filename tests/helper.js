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

const click = async(selector, options = { waitForNavigation: true }) => {
    const element = await getElement(selector);
    if (!element) return;
    await element.click(options);
    await element.dispose();
    if (options.waitForNavigation) await page.waitForNavigation();
}

const doubleClick = async(selector, options = { waitForNavigation: true }) => {
    await click(selector, Object.assign({ clickCount: 2, }, options));
}

const rightClick = async(selector, options = { waitForNavigation: true }) => {
    await click(selector, Object.assign({ button: 'right', }, options));
}

const hover = async(selector) => {
    const element = await getElement(selector);
    if (!element) return;
    await element.hover();
    await element.dispose();
}

const focus = async(selector, dispose = true) => {
    const element = await _focus(selector);
    if (element) await element.dispose();
}

const write = async(text, into) => {
    const element = await _focus(into);
    await element.type(text);
    await element.dispose();
}

const upload = async(filepath, to) => {
    const element = await _focus(to, false);
    await element.uploadFile(filepath);
    await element.dispose();
}

const press = async(key, options) => {
    await page.keyboard.press('', { text: String.fromCharCode(key), delay: 0 });
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

const button = (selector) => {
    const get = async() => getElementByTag(selector, 'button');
    return { get: get, exists: exists(get), };
}

const textField = (selector, attribute = 'placeholder') => {
    assertType(selector);
    const get = async() => page.$(`input[${attribute}='${selector}']`);
    return { get: get, exists: exists(get), value: async() => page.evaluate(e => e.value, await get()), }
}

const comboBox = (selector) => {
    assertType(selector);
    const get = async() => xpath$(`//select[@id=(//label[contains(text(),'${selector}')]/@for)]`);
    return {
        get: get,
        exists: exists(get),
        select: async(value) => {
            const box = await get();
            if (!box) throw new Error('Combo Box not found');
            await page.evaluate((box, value) => {
                if (!box) return;
                for (var i = 0; i < box.options.length; i++) {
                    if (box.options[i].text === value) {
                        box.options[i].selected = true;
                        return;
                    }
                }
            }, box, value)
        },
        value: async() => page.evaluate(e => e.value, await get())
    }
}

const checkBox = (selector) => {
    assertType(selector);
    const get = async() => xpath$(`//input[@type='checkbox'][@id=(//label[contains(text(),'${selector}')]/@for)]`);
    return {
        get: get,
        exists: exists(get),
        isChecked: async() => page.evaluate(e => e.checked, await get())
    }
}

const radioButton = (selector) => {
    assertType(selector);
    const get = async() => xpath$(`//input[@type='radio'][@id=(//label[contains(text(),'${selector}')]/@for)]`);
    return {
        get: get,
        exists: exists(get),
        isSelected: async() => page.evaluate(e => e.checked, await get())
    }
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
    button,
    comboBox,
    checkBox,
    radioButton,
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