const helper = require('puppeteer/lib/helper');
const ElementHandle = require('puppeteer/lib/ElementHandle');

class Page {
    constructor(source) {
        this.source = source;
    }

    static async create(browser) {
        return new Page(await browser.newPage());
    }

    async goto(url, options) {
        return await this.source.goto(url, options);
    }

    url() {
        return this.source.url();
    }

    async click(selector, waitForNavigation = true) {
        return await this._click(selector, {}, waitForNavigation);
    }

    async doubleClick(selector, waitForPageToLoad = true) {
        return await this._click(selector, {
            clickCount: 2
        }, waitForPageToLoad)
    }

    async exists(selector) {
        return (await this._getElement(selector)) != null;
    }

    async write(text, options) {
        return this.source.type(text, options);
    }

    async press(key, options) {
        return this.source.press(key, options);
    }

    async hover(selector) {
        const element = await this._getElement(selector);
        if (!element) return null
        await element.hover();
        await element.dispose();
    }

    async _click(selector, options = {}, wait = true) {
        const element = await this._getElement(selector);
        if (!element) return null
        const result = await element.click(options)
        return wait ? await this.source.waitForNavigation() : result;
    }

    async _getElement(selector) {
        return await (selector instanceof CssSelectorToElement ? this.source.$(selector.selector()) : xpath(this.source, getSelector(selector)));
    }
}

class Converter {
    constructor(selector) {
        this.identifier = selector;
    }

    selector() {
        return this.identifier;
    }
}

class StringToSelector extends Converter {
    static create(selector) {
        assertType(selector);
        return new StringToSelector(selector);
    }
}

class SelectorToElement extends Converter {
    static create(selector) {
        assertType(selector,
            (obj) => obj instanceof StringToSelector || isString(obj),
            "String Selector or String parameter expected");
        return new SelectorToElement(selector);
    }
}

class CssSelectorToElement extends Converter {
    static create(selector) {
        assertType(selector, isString, "String parameter expected");
        return new CssSelectorToElement(selector);
    }
}

const getSelector = (selector) => (selector instanceof Converter ? selector : text(selector)).selector();

const isString = (obj) => typeof obj == 'string' || obj instanceof String;

const xpath = async(page, selector) => {
    const remoteObject = await page._frameManager.mainFrame()._rawEvaluate(selector => {
        let node, results = [];
        let result = document.evaluate(selector, document, null, XPathResult.ANY_TYPE, null);
        while (node = result.iterateNext())
            results.push(node);
        return results;
    }, selector);
    const response = await page._client.send('Runtime.getProperties', {
        objectId: remoteObject.objectId,
        ownProperties: true
    });
    const properties = response.result;
    const result = [];
    const releasePromises = [helper.releaseObject(page._client, remoteObject)];
    for (const property of properties) {
        if (property.enumerable && property.value.subtype === 'node')
            result.push(new ElementHandle(page._client, property.value, page._mouse, page._touchscreen));
        else
            releasePromises.push(helper.releaseObject(page._client, property.value));
    }
    await Promise.all(releasePromises);
    return result.length > 0 ? result[0] : null;
}

const assertType = (obj, condition = isString, message = "String parameter expected") => {
    if (!condition(obj)) throw new Error(message);
}

const text = (selector) => {
    assertType(selector);
    return new StringToSelector(`//*[text()="${selector}"]`);
}

const dummy = (e) => e;

module.exports = {
    Page: Page,
    text: text,
    into: dummy,
    to: dummy,
    contains: (selector) => StringToSelector.create(`//*[contains(.,"${selector}")]`),
    xpath: (selector) => StringToSelector.create(selector),
    link: (selector) => SelectorToElement.create(getSelector(selector).replace("*", "a")),
    listItem: (selector) => SelectorToElement.create(getSelector(selector).replace("*", "li")),
    button: (selector) => SelectorToElement.create(getSelector(selector).replace("*", "button")),
    image: (selector) => CssSelectorToElement.create(`img[alt="${selector}"]`),
};