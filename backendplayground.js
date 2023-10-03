const axios = require('axios');
const puppeteer = require('puppeteer');

const apiUrl = 'https://loris.wlu.ca/register/ssb/registration/registration';

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.setViewport({ width: 1800, height: 900 });
    await page.goto(apiUrl);
    await page.waitForSelector('#catalogSearchLink');
    await page.click('#catalogSearchLink');
    await page.waitForSelector('a.select2-choice');
    await page.click('a.select2-choice');
    await page.waitForTimeout(1000);
    await page.keyboard.press('Enter');
    await page.click('button#term-go');
    await page.waitForTimeout(1000);
    await page.click('button#search-go');
    await page.waitForTimeout(1000);
    let buttons = await page.$$('table#table1 button.form-button.search-section-button');

    //await buttons[0].click();

    // Output the text content of each button
    let i = 0
    while (i < buttons.length) {
        await page.waitForTimeout(1000);
        await buttons[i].click();
        await page.waitForTimeout(1000);
        await page.click('a.form-button.return-course-button');
        await page.waitForTimeout(1000);
        buttons = await page.$$('table#table1 button.form-button.search-section-button')
        i++;
    }
})();