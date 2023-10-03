const axios = require('axios');
const puppeteer = require('puppeteer');
const qs = require('qs');

const apiUrl = 'https://loris.wlu.ca/register/ssb/registration/';
const getCourseInfo1 = 'https://loris.wlu.ca/register/ssb/searchResults/searchResults?txt_subjectcoursecombo=BU111&txt_term=202405&pageOffset=0&pageMaxSize=50&sortColumn=subjectDescription&sortDirection=asc';
const getCourseInfo2 = 'https://loris.wlu.ca/register/ssb/searchResults/searchResults?txt_subjectcoursecombo=BU231&txt_term=202405&pageOffset=0&pageMaxSize=50&sortColumn=subjectDescription&sortDirection=asc';
const getCourses = 'https://loris.wlu.ca/register/ssb/courseSearchResults/courseSearchResults?txt_term=202405&startDatepicker=&endDatepicker=&uniqueSessionId=q87811696297527941&pageOffset=0&pageMaxSize=10&sortColumn=subjectDescription&sortDirection=asc';
const courseSearchURL = 'https://loris.wlu.ca/register/ssb/searchResults/searchResults';

// getCookies(page) takes a page from a puppeteer browser, and performs certain actions to get to the required LORIS pages.
// It then returns all browser cookies and returns them in a list
// Usage: getCookies(page)
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
//


// reset(axiosInstance) takes an axios axiosInstance, and resets the data form. This operation must be performed so that
// subsequent requests to get course information work as expected
// Usage: reset(axiosInstance)
async function reset(axiosInstance) {
    try {
        await axiosInstance.post('https://loris.wlu.ca/register/ssb/courseSearch/resetDataForm', 'resetCourses=false&resetSections=true')
    } catch (error) {
        console.error('Reset failed:', error);
    }
}
//

// getCourseInfo(courseCode, term, axiosInstance) takes in a string courseCode, string term, and axios axiosInstance.
// It initializes a payload accordingly, sends a request to get course information, and returns the response data.
// Usage: getCourseInfo('BU121', '202405', axiosInstance);
async function getCourseInfo(courseCode, term, axiosInstance) {
    await reset(axiosInstance);
    const payload = {
        txt_subjectcoursecombo: courseCode,
        txt_term: term,
        pageOffset: 0,
        pageMaxSize: 50,
        sortColumn: 'subjectDescription',
        sortDirection: 'asc'
    }

    const payloadString = qs.stringify(payload);

    const config = {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    };

    try {
        const response = await axiosInstance.post(courseSearchURL, payloadString, config);
        console.log(response.data);
    } catch (error) {
        console.error(error);
    }
}
//

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

    await getCourseInfo('BU111', '202405', axiosInstance);
    await getCourseInfo('BU121', '202405', axiosInstance);
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