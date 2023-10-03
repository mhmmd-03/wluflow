const axios = require('axios');
const puppeteer = require('puppeteer');

const apiUrl = 'https://loris.wlu.ca/register/ssb/registration/';
const getCourseInfo1 = 'https://loris.wlu.ca/register/ssb/searchResults/searchResults?txt_subjectcoursecombo=BU111&txt_term=202405&pageOffset=0&pageMaxSize=10&sortColumn=subjectDescription&sortDirection=asc';
const getCourseInfo2 = 'https://loris.wlu.ca/register/ssb/searchResults/searchResults?txt_subjectcoursecombo=BU231&txt_term=202405&pageOffset=0&pageMaxSize=10&sortColumn=subjectDescription&sortDirection=asc';
const getCourses = 'https://loris.wlu.ca/register/ssb/courseSearchResults/courseSearchResults?txt_term=202405&startDatepicker=&endDatepicker=&uniqueSessionId=q87811696297527941&pageOffset=0&pageMaxSize=10&sortColumn=subjectDescription&sortDirection=asc';

async function getCookies(page) {
    await page.goto(apiUrl);
    await page.waitForSelector('#catalogSearchLink');
    await page.click('#catalogSearchLink');
    await page.waitForSelector('a.select2-choice');
    await page.click('a.select2-choice');
    await page.waitForTimeout(1000);
    await page.keyboard.press('Enter');
    await page.click('button#term-go');
    await page.waitForTimeout(2000);
    await page.click('button#search-go');
    await page.waitForTimeout(2000);
    let buttons = await page.$$('table#table1 button.form-button.search-section-button');
    await buttons[0].click();
    const hijackedCookies = await page.cookies();
    const cookies = [
        hijackedCookies[0].name + '=' + hijackedCookies[0].value,
        hijackedCookies[1].name + '=' + hijackedCookies[1].value,
        hijackedCookies[2].name + '=' + hijackedCookies[2].value,
        hijackedCookies[3].name + '=' + hijackedCookies[3].value,
        hijackedCookies[4].name + '=' + hijackedCookies[4].value,
    ];
    return cookies;
}

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    const cookies = await getCookies(page);
    await browser.close();

    const axiosInstance = axios.create({
        headers: {
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

    axiosInstance.get(endpointUrl3)
        .then((response) => {
            console.log(response.data);
        })
        .catch((error) => {
            console.log(error);
        })


    /*
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
    */

})();