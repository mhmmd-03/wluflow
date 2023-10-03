const axios = require("axios");
const puppeteer = require("puppeteer");
const qs = require("qs");

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
async function getCourseInfo(courseCode, term, axiosInstance) {
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
    console.log(response.data);

    // Get the data
    const data = response.data.data;
    let courseRefNumber_courseCode = [];

    // Loop through the data
    data.forEach((element) => {
      // Get the course code
      const courseCode = `${element.subject}${element.courseNumber}`;
      // Add it to a list of maps that contains the CRN and associated course code
      courseRefNumber_courseCode.push({
        courseReferenceNumber: element.courseReferenceNumber,
        courseCode: courseCode,
      });
    });

    return courseRefNumber_courseCode; // Return the CRNs
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
    console.log(response.data);

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

  await getCourseInfo("BU111", "202405", axiosInstance);
  await getCourseInfo("BU121", "202405", axiosInstance);
  const data = await getCoursesByPage("202405", 0, 50, axiosInstance);

  // need to loop through the response from "data" and call getCourseInfo with the courseCodes but there is an issue doing so because we cant have an "await" within a forEach loop
})();

// const course50data = {
//   success: true,
//   totalCount: 7609,
//   data: [
//     {
//       id: 25484,
//       termEffective: "201509",
//       courseNumber: "491W",
//       subject: "AC",
//       subjectCode: "AC",
//       college: "Lazaridis School",
//       collegeCode: "LZ",
//       department: "*Department Not Declared",
//       departmentCode: "0000",
//       courseTitle: "Adv Financial Accounting",
//       durationUnit: null,
//       numberOfUnits: null,
//       attributes: null,
//       gradeModes: null,
//       ceu: null,
//       courseScheduleTypes: null,
//       courseLevels: null,
//       creditHourHigh: 0.5,
//       creditHourLow: 0,
//       creditHourIndicator: "OR",
//       lectureHourLow: 0,
//       lectureHourHigh: 12,
//       lectureHourIndicator: "TO",
//       billHourLow: 0,
//       billHourHigh: 1.5,
//       billHourIndicator: "TO",
//       labHourLow: null,
//       labHourHigh: null,
//       labHourIndicator: null,
//       otherHourLow: null,
//       otherHourHigh: null,
//       otherHourIndicator: null,
//       description: null,
//       subjectDescription: "Accounting",
//       courseDescription: null,
//       division: null,
//       termStart: "199809",
//       termEnd: "999999",
//       preRequisiteCheckMethodCde: "B",
//       anySections: null,
//     },
//     {
//       id: 31904,
//       termEffective: "202001",
//       courseNumber: "784W",
//       subject: "AC",
//       subjectCode: "AC",
//       college: "Lazaridis School",
//       collegeCode: "LZ",
//       department: "Business",
//       departmentCode: "BU",
//       courseTitle: "Directed Readings in Acct.",
//       durationUnit: null,
//       numberOfUnits: null,
//       attributes: null,
//       gradeModes: null,
//       ceu: null,
//       courseScheduleTypes: null,
//       courseLevels: null,
//       creditHourHigh: 0.5,
//       creditHourLow: 0,
//       creditHourIndicator: "OR",
//       lectureHourLow: 0,
//       lectureHourHigh: 3,
//       lectureHourIndicator: "TO",
//       billHourLow: 0,
//       billHourHigh: 0.5,
//       billHourIndicator: "TO",
//       labHourLow: null,
//       labHourHigh: null,
//       labHourIndicator: null,
//       otherHourLow: null,
//       otherHourHigh: null,
//       otherHourIndicator: null,
//       description: null,
//       subjectDescription: "Accounting",
//       courseDescription: null,
//       division: null,
//       termStart: "201501",
//       termEnd: "999999",
//       preRequisiteCheckMethodCde: "B",
//       anySections: null,
//     },
//     {
//       id: 36646,
//       termEffective: "202109",
//       courseNumber: "101R",
//       subject: "73",
//       subjectCode: "73",
//       college: "Faculty of Arts",
//       collegeCode: "AR",
//       department: "*Department Not Declared",
//       departmentCode: "0000",
//       courseTitle: "Amer. Sign Language 1",
//       durationUnit: null,
//       numberOfUnits: null,
//       attributes: null,
//       gradeModes: null,
//       ceu: false,
//       courseScheduleTypes: null,
//       courseLevels: null,
//       creditHourHigh: 0.5,
//       creditHourLow: 0,
//       creditHourIndicator: "OR",
//       lectureHourLow: 0,
//       lectureHourHigh: 3,
//       lectureHourIndicator: "TO",
//       billHourLow: 0,
//       billHourHigh: 0.5,
//       billHourIndicator: "OR",
//       labHourLow: null,
//       labHourHigh: null,
//       labHourIndicator: null,
//       otherHourLow: null,
//       otherHourHigh: null,
//       otherHourIndicator: null,
//       description: null,
//       subjectDescription: "American Sign Language",
//       courseDescription: null,
//       division: null,
//       termStart: "202109",
//       termEnd: "999999",
//       preRequisiteCheckMethodCde: "B",
//       anySections: null,
//     },
//     {
//       id: 21496,
//       termEffective: "201509",
//       courseNumber: "100",
//       subject: "AN",
//       subjectCode: "AN",
//       college: "Faculty of Arts",
//       collegeCode: "AR",
//       department: "Anthropology",
//       departmentCode: "AN",
//       courseTitle: "Cultures Today",
//       durationUnit: null,
//       numberOfUnits: null,
//       attributes: null,
//       gradeModes: null,
//       ceu: null,
//       courseScheduleTypes: null,
//       courseLevels: null,
//       creditHourHigh: 0.5,
//       creditHourLow: 0,
//       creditHourIndicator: "OR",
//       lectureHourLow: 0,
//       lectureHourHigh: 3,
//       lectureHourIndicator: "TO",
//       billHourLow: 0,
//       billHourHigh: 0.5,
//       billHourIndicator: "TO",
//       labHourLow: 0,
//       labHourHigh: 6,
//       labHourIndicator: "TO",
//       otherHourLow: "TO",
//       otherHourHigh: 6,
//       otherHourIndicator: "TO",
//       description: null,
//       subjectDescription: "Anthropology",
//       courseDescription:
//         " An introduction to the study of world cultures, focusing on the exploration of ethnographic case st",
//       division: null,
//       termStart: "197909",
//       termEnd: "999999",
//       preRequisiteCheckMethodCde: "B",
//       anySections: null,
//     },
//     {
//       id: 24440,
//       termEffective: "201705",
//       courseNumber: "100W",
//       subject: "AN",
//       subjectCode: "AN",
//       college: "Faculty of Arts",
//       collegeCode: "AR",
//       department: "Anthropology",
//       departmentCode: "AN",
//       courseTitle: "Intro to Anthropology",
//       durationUnit: null,
//       numberOfUnits: null,
//       attributes: null,
//       gradeModes: null,
//       ceu: null,
//       courseScheduleTypes: null,
//       courseLevels: null,
//       creditHourHigh: 0.5,
//       creditHourLow: 0,
//       creditHourIndicator: "OR",
//       lectureHourLow: 0,
//       lectureHourHigh: 3,
//       lectureHourIndicator: "TO",
//       billHourLow: 0,
//       billHourHigh: 0.5,
//       billHourIndicator: "OR",
//       labHourLow: null,
//       labHourHigh: null,
//       labHourIndicator: null,
//       otherHourLow: null,
//       otherHourHigh: null,
//       otherHourIndicator: null,
//       description: null,
//       subjectDescription: "Anthropology",
//       courseDescription: null,
//       division: null,
//       termStart: "201705",
//       termEnd: "999999",
//       preRequisiteCheckMethodCde: "B",
//       anySections: null,
//     },
//     {
//       id: 40927,
//       termEffective: "202209",
//       courseNumber: "106W",
//       subject: "AN",
//       subjectCode: "AN",
//       college: "Faculty of Arts",
//       collegeCode: "AR",
//       department: "Anthropology",
//       departmentCode: "AN",
//       courseTitle: "Technologies of Being Human",
//       durationUnit: null,
//       numberOfUnits: null,
//       attributes: null,
//       gradeModes: null,
//       ceu: false,
//       courseScheduleTypes: null,
//       courseLevels: null,
//       creditHourHigh: 0.5,
//       creditHourLow: 0,
//       creditHourIndicator: "OR",
//       lectureHourLow: 0,
//       lectureHourHigh: 3,
//       lectureHourIndicator: "TO",
//       billHourLow: 0,
//       billHourHigh: 0.5,
//       billHourIndicator: "OR",
//       labHourLow: null,
//       labHourHigh: null,
//       labHourIndicator: null,
//       otherHourLow: null,
//       otherHourHigh: null,
//       otherHourIndicator: null,
//       description: null,
//       subjectDescription: "Anthropology",
//       courseDescription: null,
//       division: null,
//       termStart: "202209",
//       termEnd: "999999",
//       preRequisiteCheckMethodCde: "B",
//       anySections: null,
//     },
//     {
//       id: 20771,
//       termEffective: "201509",
//       courseNumber: "110",
//       subject: "AN",
//       subjectCode: "AN",
//       college: "Faculty of Arts",
//       collegeCode: "AR",
//       department: "Anthropology",
//       departmentCode: "AN",
//       courseTitle: "Money Makes the World Go Round",
//       durationUnit: null,
//       numberOfUnits: null,
//       attributes: null,
//       gradeModes: null,
//       ceu: null,
//       courseScheduleTypes: null,
//       courseLevels: null,
//       creditHourHigh: 0.5,
//       creditHourLow: 0,
//       creditHourIndicator: "TO",
//       lectureHourLow: 0,
//       lectureHourHigh: 3,
//       lectureHourIndicator: "TO",
//       billHourLow: 0,
//       billHourHigh: 0.5,
//       billHourIndicator: "TO",
//       labHourLow: 0,
//       labHourHigh: 6,
//       labHourIndicator: "TO",
//       otherHourLow: "TO",
//       otherHourHigh: 6,
//       otherHourIndicator: "TO",
//       description: null,
//       subjectDescription: "Anthropology",
//       courseDescription:
//         "Introduces the cultural worlds of exchange and consumption by focusing on how and\n" +
//         "why people acquire",
//       division: null,
//       termStart: "201509",
//       termEnd: "999999",
//       preRequisiteCheckMethodCde: "B",
//       anySections: null,
//     },
//     {
//       id: 21336,
//       termEffective: "201509",
//       courseNumber: "120",
//       subject: "AN",
//       subjectCode: "AN",
//       college: "Faculty of Arts",
//       collegeCode: "AR",
//       department: "Anthropology",
//       departmentCode: "AN",
//       courseTitle: "Greatest Party in the World",
//       durationUnit: null,
//       numberOfUnits: null,
//       attributes: null,
//       gradeModes: null,
//       ceu: null,
//       courseScheduleTypes: null,
//       courseLevels: null,
//       creditHourHigh: 0.5,
//       creditHourLow: 0,
//       creditHourIndicator: "OR",
//       lectureHourLow: 0,
//       lectureHourHigh: 3,
//       lectureHourIndicator: "TO",
//       billHourLow: 0,
//       billHourHigh: 0.5,
//       billHourIndicator: "TO",
//       labHourLow: null,
//       labHourHigh: null,
//       labHourIndicator: null,
//       otherHourLow: null,
//       otherHourHigh: null,
//       otherHourIndicator: null,
//       description: null,
//       subjectDescription: "Anthropology",
//       courseDescription:
//         "Introduces students to global popular culture and cultural \n" +
//         "performance by exploring the social rele",
//       division: null,
//       termStart: "201509",
//       termEnd: "999999",
//       preRequisiteCheckMethodCde: "B",
//       anySections: null,
//     },
//     {
//       id: 21953,
//       termEffective: "201509",
//       courseNumber: "200",
//       subject: "AN",
//       subjectCode: "AN",
//       college: "Faculty of Arts",
//       collegeCode: "AR",
//       department: "Anthropology",
//       departmentCode: "AN",
//       courseTitle: "Theories of Culture",
//       durationUnit: null,
//       numberOfUnits: null,
//       attributes: null,
//       gradeModes: null,
//       ceu: null,
//       courseScheduleTypes: null,
//       courseLevels: null,
//       creditHourHigh: 0.5,
//       creditHourLow: 0,
//       creditHourIndicator: "OR",
//       lectureHourLow: 0,
//       lectureHourHigh: 3,
//       lectureHourIndicator: "TO",
//       billHourLow: 0,
//       billHourHigh: 0.5,
//       billHourIndicator: "TO",
//       labHourLow: 0,
//       labHourHigh: 6,
//       labHourIndicator: "TO",
//       otherHourLow: "TO",
//       otherHourHigh: 6,
//       otherHourIndicator: "TO",
//       description: null,
//       subjectDescription: "Anthropology",
//       courseDescription:
//         " An examination of the contested nature of cultural processes.\n" +
//         "Students will learn about the use of ",
//       division: null,
//       termStart: "197909",
//       termEnd: "999999",
//       preRequisiteCheckMethodCde: "B",
//       anySections: null,
//     },
//     {
//       id: 32329,
//       termEffective: "202009",
//       courseNumber: "201",
//       subject: "AN",
//       subjectCode: "AN",
//       college: "Faculty of Arts",
//       collegeCode: "AR",
//       department: "Anthropology",
//       departmentCode: "AN",
//       courseTitle: "Indig: Ethnohistorical Persp.",
//       durationUnit: null,
//       numberOfUnits: null,
//       attributes: null,
//       gradeModes: null,
//       ceu: null,
//       courseScheduleTypes: null,
//       courseLevels: null,
//       creditHourHigh: 0.5,
//       creditHourLow: 0,
//       creditHourIndicator: "TO",
//       lectureHourLow: 0,
//       lectureHourHigh: 3,
//       lectureHourIndicator: "TO",
//       billHourLow: 0,
//       billHourHigh: 1.5,
//       billHourIndicator: "TO",
//       labHourLow: 0,
//       labHourHigh: 6,
//       labHourIndicator: "TO",
//       otherHourLow: "TO",
//       otherHourHigh: 6,
//       otherHourIndicator: "TO",
//       description: null,
//       subjectDescription: "Anthropology",
//       courseDescription:
//         "A survey of the pre- and post-contact cultural patterns of First Nations, Inuit and M&eacute;tis Peoples of",
//       division: null,
//       termStart: "197909",
//       termEnd: "999999",
//       preRequisiteCheckMethodCde: "B",
//       anySections: null,
//     },
//   ],
//   pageOffset: 0,
//   pageMaxSize: 10,
//   coursesFetchedCount: 7609,
//   pathMode: "courseSearch",
//   courseSearchResultsConfigs: [
//     {
//       config: "courseTitle",
//       display: "Title",
//       title: "Title",
//       required: true,
//       width: "9%",
//     },
//     {
//       config: "subjectDescription",
//       display: "Subject Description",
//       title: "Subject Description",
//       required: false,
//       width: "5%",
//     },
//     {
//       config: "courseNumber",
//       display: "Course Number",
//       title: "Course Number",
//       required: false,
//       width: "3%",
//     },
//     {
//       config: "creditHours",
//       display: "Hours",
//       title: "Hours",
//       required: false,
//       width: "3%",
//     },
//     {
//       config: "courseDescription",
//       display: "Description",
//       title: "Description",
//       required: false,
//       width: "5%",
//     },
//   ],
//   displaySettings: {
//     enrollmentDisplay: "Y",
//     waitlistDisplay: "Y",
//     crossListDisplay: "Y",
//   },
//   isPlanByCrnSetForTerm: false,
// };

// const individualCourseData = {
//   success: true,
//   totalCount: 2,
//   data: [
//     {
//       id: 266716,
//       term: "202405",
//       termDesc: "Spring 2024",
//       courseReferenceNumber: "908",
//       partOfTerm: "1",
//       courseNumber: "111",
//       subject: "BU",
//       subjectDescription: "Business",
//       sequenceNumber: "OC1",
//       campusDescription: "Online Learning",
//       scheduleTypeDescription: "Lecture",
//       courseTitle: "Understanding Bus. Environment",
//       creditHours: 0.5,
//       maximumEnrollment: 60,
//       enrollment: 0,
//       seatsAvailable: 60,
//       waitCapacity: 0,
//       waitCount: 0,
//       waitAvailable: 0,
//       crossList: null,
//       crossListCapacity: null,
//       crossListCount: null,
//       crossListAvailable: null,
//       creditHourHigh: 0.5,
//       creditHourLow: 0,
//       creditHourIndicator: "OR",
//       openSection: true,
//       linkIdentifier: null,
//       isSectionLinked: false,
//       subjectCourse: "BU111",
//       faculty: [Array],
//       meetingsFaculty: [Array],
//       reservedSeatSummary: null,
//       sectionAttributes: [Array],
//       instructionalMethod: "M007",
//       instructionalMethodDescription: "Online",
//     },
//     {
//       id: 265824,
//       term: "202405",
//       termDesc: "Spring 2024",
//       courseReferenceNumber: "16",
//       partOfTerm: "1",
//       courseNumber: "111",
//       subject: "BU",
//       subjectDescription: "Business",
//       sequenceNumber: "T1",
//       campusDescription: "Waterloo",
//       scheduleTypeDescription: "Lecture",
//       courseTitle: "Understanding Bus. Environment",
//       creditHours: 0.5,
//       maximumEnrollment: 290,
//       enrollment: 0,
//       seatsAvailable: 290,
//       waitCapacity: 0,
//       waitCount: 0,
//       waitAvailable: 0,
//       crossList: null,
//       crossListCapacity: null,
//       crossListCount: null,
//       crossListAvailable: null,
//       creditHourHigh: 0.5,
//       creditHourLow: 0,
//       creditHourIndicator: "OR",
//       openSection: true,
//       linkIdentifier: null,
//       isSectionLinked: false,
//       subjectCourse: "BU111",
//       faculty: [Array],
//       meetingsFaculty: [Array],
//       reservedSeatSummary: null,
//       sectionAttributes: [Array],
//       instructionalMethod: "M001",
//       instructionalMethodDescription: "Lecture",
//     },
//   ],
//   pageOffset: 0,
//   pageMaxSize: 50,
//   sectionsFetchedCount: 2,
//   pathMode: "courseSearch",
//   searchResultsConfigs: [
//     {
//       config: "courseTitle",
//       display: "Title",
//       title: "Title",
//       required: true,
//       width: "9%",
//     },
//     {
//       config: "subjectDescription",
//       display: "Subject",
//       title: "Subject",
//       required: false,
//       width: "5%",
//     },
//     {
//       config: "courseNumber",
//       display: "Course Number",
//       title: "Course Number",
//       required: false,
//       width: "3%",
//     },
//     {
//       config: "sequenceNumber",
//       display: "Section",
//       title: "Section",
//       required: false,
//       width: "3%",
//     },
//     {
//       config: "creditHours",
//       display: "Credits",
//       title: "Credits",
//       required: false,
//       width: "3%",
//     },
//     {
//       config: "courseReferenceNumber",
//       display: "CRN",
//       title: "CRN",
//       required: false,
//       width: "3%",
//     },
//     {
//       config: "instructor",
//       display: "Instructor",
//       title: "Instructor",
//       required: false,
//       width: "8%",
//     },
//     {
//       config: "meetingTime",
//       display: "Meeting Times",
//       title: "Meeting Times",
//       required: false,
//       width: "15%",
//     },
//     {
//       config: "campus",
//       display: "Campus",
//       title: "Campus",
//       required: false,
//       width: "3%",
//     },
//     {
//       config: "status",
//       display: "Class Seats",
//       title: "Class Seats",
//       required: false,
//       width: "6%",
//     },
//     {
//       config: "reservedSeats",
//       display: "Reserved Seats",
//       title: "Reserved Seats",
//       required: false,
//       width: "5%",
//     },
//     {
//       config: "attribute",
//       display: "Attribute",
//       title: "Attribute",
//       required: false,
//       width: "14%",
//     },
//   ],
// };

// const data = course50data.data;

// let courseCodes = [];
// // data.forEach((element) => {
// //   //   console.log(element.courseNumber);
// //   //   console.log(element.departmentCode);
// //   courseCodes.push(`${element.departmentCode}${element.courseNumber}`);
// // });
// // console.log(courseCodes);

// const individualData = individualCourseData.data;

// let CRN_number_and_course_code = [];

// individualData.forEach((element) => {
//   const courseCode = `${element.subject}${element.courseNumber}`;
//   CRN_number_and_course_code.push({
//     courseReferenceNumber: element.courseReferenceNumber,
//     courseCode: courseCode,
//   });
// });
// console.log(CRN_number_and_course_code);
