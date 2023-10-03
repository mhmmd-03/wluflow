// INSTRUCTIONS:
// Adjust cookies is you are changing the term you want to get CRNs for
// You can adjust the term using the predefined constants, or add more constants
// As needed
// For support: contact qfaizaan@gmail.com

const axios = require("axios");
const puppeteer = require("puppeteer");
const qs = require("qs");
const fs = require("fs");

const FALL2023 = "202309"
const WINTER2024 = "202401"
const SPRING2024 = "202405"

const apiUrl = "https://loris.wlu.ca/register/ssb/registration/";
const coursesURL =
  "https://loris.wlu.ca/register/ssb/courseSearchResults/courseSearchResults/";
const courseDetailsURL =
  "https://loris.wlu.ca/register/ssb/searchResults/searchResults/";

// getCookies(page) takes a page from a puppeteer browser, and performs certain actions to get to the required LORIS pages.
// It then returns all browser cookies and returns them in a list
// Usage: getCookies(page)
async function getCookies(page) {
  await page.goto(apiUrl);
  await page.waitForSelector("#catalogSearchLink");
  await page.click("#catalogSearchLink");
  await page.waitForSelector("a.select2-choice");
  await page.click("a.select2-choice");
  await page.waitForTimeout(1000);
  // No arrows down for SPRING 2024 (Term After Next)
  // One arrow down for WINTER 2024 (Next Term)
  // Two arrow downs for SPRING 2024 (Current Term)
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  //
  await page.keyboard.press("Enter");
  await page.click("button#term-go");
  await page.waitForTimeout(2000);
  await page.click("button#search-go");
  await page.waitForTimeout(2000);
  let buttons = await page.$$(
    "table#table1 button.form-button.search-section-button"
  );
  await buttons[0].click();
  const hijackedCookies = await page.cookies();
  const cookies = [
    hijackedCookies[0].name + "=" + hijackedCookies[0].value,
    hijackedCookies[1].name + "=" + hijackedCookies[1].value,
    hijackedCookies[2].name + "=" + hijackedCookies[2].value,
    hijackedCookies[3].name + "=" + hijackedCookies[3].value,
    hijackedCookies[4].name + "=" + hijackedCookies[4].value,
  ];
  return cookies;
}
//

// reset(axiosInstance) takes an axios axiosInstance, and resets the data form. This operation must be performed so that
// subsequent requests to get course information work as expected
// Usage: reset(axiosInstance)
async function reset(axiosInstance) {
  try {
    await axiosInstance.post(
      "https://loris.wlu.ca/register/ssb/courseSearch/resetDataForm",
      "resetCourses=false&resetSections=true"
    );
  } catch (error) {
    console.error("Reset failed:", error);
  }
}
//

// getCourseInfo(courseCode, term, axiosInstance) takes in a string courseCode, string term, and axios axiosInstance.
// It initializes a payload accordingly, sends a request to get course information, and returns the response data.
// Usage: getCourseInfo('BU121', '202405', axiosInstance);
async function getCourseCRNs(courseCode, term, axiosInstance) {
  await reset(axiosInstance);
  const payload = {
    txt_subjectcoursecombo: courseCode,
    txt_term: term,
    pageOffset: 0,
    pageMaxSize: 50,
    sortColumn: "subjectDescription",
    sortDirection: "asc",
  };

  const payloadString = qs.stringify(payload);

  const config = {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };

  try {
    const response = await axiosInstance.post(
      courseDetailsURL,
      payloadString,
      config
    );

    // Get the data
    const data = response.data.data;
    let CRNs = [];

    // Loop through the data
    data.forEach((element) => {
      // Add it to a list of maps that contains the CRN and associated course code
      CRNs.push(element.courseReferenceNumber);
    });

    return CRNs; // Return the CRNs
  } catch (error) {
    console.error(error);
  }
}
//

// getCoursesByPage(term, pageOffset, pageMaxSize, axiosInstance), takes a string term, an int pageOffset to determine which page to get courses from,
// an int pageMaxSize to set how many courses are listed on each page, and an axios axiosInstance
// Usage: getCoursesByPage('202405', 0, 50, axiosInstance)
async function getCoursesByPage(term, pageOffset, pageMaxSize, axiosInstance) {
  await reset(axiosInstance);
  const payload = {
    txt_term: term,
    pageOffset: pageOffset,
    pageMaxSize: pageMaxSize,
    sortColumn: "subjectDescription",
    sortDirection: "asc",
  };

  const payloadString = qs.stringify(payload);

  const config = {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };

  try {
    const response = await axiosInstance.post(
      coursesURL,
      payloadString,
      config
    );

    // Get the data
    const data = response.data.data;
    const courseCodes = [];
    // Loop through the data
    data.forEach((element) => {
      courseCodes.push(`${element.departmentCode}${element.courseNumber}`);
    });
    // Return the course codes
    return courseCodes;
  } catch (error) {
    console.error(error);
  }
}
//

async function getCoursesTotalCount(term, axiosInstance) {
  await reset(axiosInstance);
  const payload = {
    txt_term: term,
    pageOffset: 0,
    pageMaxSize: 10,
    sortColumn: "subjectDescription",
    sortDirection: "asc",
  };

  const payloadString = qs.stringify(payload);

  const config = {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };

  try {
    const response = await axiosInstance.post(
      coursesURL,
      payloadString,
      config
    );

    return response.data.totalCount;
  } catch (error) {
    console.error(error);
  }
}

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  const cookies = await getCookies(page);
  await browser.close();

  const axiosInstance = axios.create({
    headers: {
      Cookie: cookies.join("; "),
    },
  });

  const totalCount = await getCoursesTotalCount(FALL2023, axiosInstance);
  const pages = Math.ceil(totalCount / 500);

  for (let i = 0; i <= pages; i++) {
    const data = await getCoursesByPage(FALL2023, i * 500, 500, axiosInstance);
    for (d in data) {
      const data2 = await getCourseCRNs(data[d], FALL2023, axiosInstance);
      console.log(data[d]);
      console.log(data2)
    }
  }

})();
