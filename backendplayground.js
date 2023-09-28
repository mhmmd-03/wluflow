const axios = require('axios');
const puppeteer = require('puppeteer');

//let cookies = null;

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://loris.wlu.ca/register/ssb/courseSearch/courseSearch');
    const cookie = await page.cookies();
    await browser.close();
    for (i in cookie) {
        console.log(cookie[i].name + '=' + cookie[i].value);
    }
})();

/*

const apiUrl = 'https://loris.wlu.ca/register/ssb/courseSearchResults/courseSearchResults';

const headers = {
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'en-US,en;q=0.9',
    'Cache-Control': 'max-age=0',
    'Connection': 'keep-alive',
    'Host': 'loris.wlu.ca',
    'Upgrade-Insecure-Requests': '1',
};

const cookies = [
    'f5avraaaaaaaaaaaaaaaa_session_=EJDIILIKLKFGDNFLAHFNOOPHGMKKNMBKEOICLODOEODBJNECHPNPCLKINNAKKAOIOBEDOFNJJHKGANLAEOEAMJHDPJMFIGMACHHOFKMKIPLBMPNBPLFBHPKENKOILMNN',
    'f5_cspm=1234',
    'JSESSIONID=2ACC264D7FFFDFBDACAD453365407D75',
    'BIGipServerpool_prodlorisregister=1079380490.24353.0000',
    'BIGipServerpool_prodlorisbanextension=1029048842.18213.0000'
];

const axiosInstance = axios.create({
    headers: {
        ...headers,
        Cookie: cookies.join('; '),
    },
});

axiosInstance.get(apiUrl)
    .then((response) => {
        console.log(response.data);
    })
    .catch((error) => {
        console.error(error);
    });

*/