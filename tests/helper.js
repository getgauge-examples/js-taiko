const helper = require('puppeteer/lib/helper');
const ElementHandle = require('puppeteer/lib/ElementHandle');

async function newPage(browser) {
    const page = await browser.newPage();
    
    page.clickOn = async (identifier) => {
        const element = await identifier(page);
        return element ? element.click() : null;
    }

    page.exists = async (selector) => {
        if (typeof selector == 'string') return !!(await page.$(selector));
        const element = await selector(page);
        return element != null;
    }

    return page;
}

const by = {
    text: (selector) => async (page) => await xpath(page, `//*[text()="${selector}"]`),
    containsText: (selector) => async (page) => await xpath(page, `//*[contains(text(),"${selector}")]`),
    xpath: (selector) => async (page) => await xpath(page, selector)
};

const xpath = async (page, selector) => {
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

module.exports = {
    newPage: newPage,
    by: by
};