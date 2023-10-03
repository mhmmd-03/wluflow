const axios = require('axios');
const puppeteer = require('puppeteer');

const apiUrl = 'https://loris.wlu.ca/register/ssb/registration/';
const endpointUrl = 'https://loris.wlu.ca/register/ssb/searchResults/searchResults?txt_subjectcoursecombo=BU111&txt_term=202405&pageOffset=0&pageMaxSize=10&sortColumn=subjectDescription&sortDirection=asc';
const endpointUrl2 = 'https://loris.wlu.ca/register/ssb/searchResults/searchResults?txt_subjectcoursecombo=BU231&txt_term=202405&pageOffset=0&pageMaxSize=10&sortColumn=subjectDescription&sortDirection=asc';

(async () => {
    const browser = await puppeteer.launch({ headless: true });
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
    await page.waitForTimeout(4000);
    await page.click('button#search-go');
    await page.waitForTimeout(4000);
    let buttons = await page.$$('table#table1 button.form-button.search-section-button');
    await buttons[0].click();
    const hijackedCookies = await page.cookies();
    await browser.close();

    const cookies = [
        hijackedCookies[0].name + '=' + hijackedCookies[0].value,
        hijackedCookies[1].name + '=' + hijackedCookies[1].value,
        hijackedCookies[2].name + '=' + hijackedCookies[2].value,
        hijackedCookies[3].name + '=' + hijackedCookies[3].value,
        hijackedCookies[4].name + '=' + hijackedCookies[4].value,
    ];

    const headers = {
        'accept': '*/*',
        'accept-language': 'en-US,en;q=0.9',
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'sec-ch-ua': '"Google Chrome";v="117", "Not;A=Brand";v="8", "Chromium";v="117"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'x-requested-with': 'XMLHttpRequest',
        'x-synchronizer-token': '05a36d59-7fcb-48b5-a812-7aa10ff74e0d',
    };

    const axiosInstance = axios.create({
        headers: {
            ...headers,
            Cookie: cookies.join('; '),
        },
    });

    axiosInstance.post('https://loris.wlu.ca/register/ssb/courseSearch/resetDataForm', 'resetCourses=false&resetSections=true')
        .then((response) => {
            console.log(response.data);
        })
        .catch((error) => {
            console.error(error);
        });

    axiosInstance.get(endpointUrl)
        .then((response) => {
            console.log(response.data);
        })
        .catch((error) => {
            console.error(error);
        });

    axiosInstance.post('https://loris.wlu.ca/register/ssb/courseSearch/resetDataForm', 'resetCourses=false&resetSections=true')
        .then((response) => {
            console.log(response.data);
        })
        .catch((error) => {
            console.error(error);
        });

        axiosInstance.get(endpointUrl2)
        .then((response) => {
            console.log(response.data);
        })
        .catch((error) => {
            console.error(error);
        });

})();