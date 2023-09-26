const axios = require('axios');
const puppeteer = require('puppeteer');

let cookies = null;

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://loris.wlu.ca/register/ssb/courseSearch/courseSearch');
    cookies = await page.cookies();
    await browser.close();

    console.log(cookies)
})();

/*
const apiUrl = 'https://loris.wlu.ca/register/ssb/courseSearchResults/courseSearchResults';

Define all the headers
const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'en-US,en;q=0.9',
    'Cache-Control': 'max-age=0',
    'Connection': 'keep-alive',
    'Host': 'loris.wlu.ca',
    'Upgrade-Insecure-Requests': '1',
};

Define all the cookies

const cookies = [
    'f5avraaaaaaaaaaaaaaaa_session_=GBDAMNBCMDJCFIADDMOKMJLLKIALCKFJGHNBKCALPFNMKGIMPMKNOLPGDNBHMBMFBAGDLLDHJPLGFIEOAACAJJHEPPOCFEMHBENLGNGGDECNKKNJBIOPDNGHLIPHJLEI',
    'f5_cspm=1234',
    'JSESSIONID=61F0980C745A1AD227F1F1AEAD3CB91E',
    'clive-visitor-tid-280=lmsi734pj78ayy817t4zzjhpionkkvomowv236un7ayv67hrlk97ftjphrsikpwh',
    '_gcl_au=1.1.94590767.1695260273',
    '_scid=600ffbb1-ffb1-4a9e-ac17-031dbe79d351',
    '_scid_r=600ffbb1-ffb1-4a9e-ac17-031dbe79d351',
    'wlu_ga_cid=ga4_633175718.1694625932',
    '_tt_enable_cookie=1',
    '_ttp=pG_M7BTk9J2qPxR409s6v30DJ4H',
    '_sctr=1%7C1695182400000',
    '_ce.s=v~821f027f73f8aae20903242a5260d8dfa4b32efc~lcw~1695260633083~vpv~0~v11.fhb~1695260273042~v11.lhb~1695260693096~lcw~1695260693097',
    '_ga_BTR8YRL0PP=GS1.1.1695260272.1.1.1695260739.0.0.0',
    '_ga_1K8Z95DTW0=GS1.1.1695260272.1.1.1695260739.0.0.0',
    '_ga=GA1.2.633175718.1694625932',
    '_gid=GA1.2.732080581.1695664163',
    'BIGipServerpool_ssbanner_9088=173279754.32803.0000',
    'IDMSESSID=98BF29852AAACD84E469E4D6085331CDEB6C6CF809BACFBC37630AAAF1AD2D539F7A24D7F7F514963ABEDD877C47437726FADD9A741919A3F1E812BDDFAB236B',
    'BIGipServerpool_ssbprod_https=190056970.47873.0000',
    '_ga_WG5QNJ3QLE=GS1.2.1695742976.5.1.1695742981.55.0.0',
    'BIGipServerpool_prodlorisregister=1045826058.24353.0000',
    'f5avraaaaaaaaaaaaaaaa_session_=MFMGACCFNGKOMHLBGNHIGDNEBBHHKKDPLGPPFNNEEOKBOAIDFLFJNFJIEMEJCPMGFGJDKNGHOLHKNNCGJANADJAFLPMDBOEOGPCMMAAAOKCMKKLLMKCJAMCFIGOLFKDP',
    'BIGipServerpool_prodlorisbanextension=1012271626.18213.0000',
];

Set the headers and cookies in Axios
const axiosInstance = axios.create({
    headers: {
        ...headers,
        Cookie: cookies.join('; '),
    },
});

Make the GET request
axiosInstance.get(apiUrl)
    .then((response) => {
        console.log(response.data);
    })
    .catch((error) => {
        console.error(error);
    });

*/
