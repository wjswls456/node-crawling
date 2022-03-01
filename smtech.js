var puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const models = require("./models");

(async () => {
  //페이지로 가라
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto("https://smtech.go.kr/front/log/loginDetail.do", {
    waitUntil: "load",
  });

  const smtechId = "gogofnd1";
  const smtechPw = "guswhdtmd1";

  //iframe 접근
  //   const elementHandle = await page.waitForSelector("iframe[name=member]");
  //   const frame = await elementHandle.contentFrame();
  await page.addScriptTag({
    url: "https://code.jquery.com/jquery-3.2.1.min.js",
  });
  await page.addScriptTag({
    path: "./sha256_enc.js",
  });

  const content = await page.content();
  const $ = cheerio.load(content);
  //접근한 iframe에서 로그인 하기

  const userId = await page.$("input[name=loginId]");
  const userpw = await page.$("input[name=loginPasswd]");
  const logBtn = await page.$(".btn_login");

  await userId.type(smtechId);
  await userpw.type(smtechPw);
  await logBtn.click();

  const finalResponse = await page.waitForResponse((response) => {
    return console.log(response.url());
  });

  // console.log(finalResponse);
  //   await logBtn.click();

  // let a = await page.evaluate(() => {
  //   loginProc("usual");
  // });

  //과제 신청 url

  //   const content = await page.content();

  //   const $ = cheerio.load(content);
  //   let dataList = new Array();

  //과제 신청 테이블 데이터 뽑기
  //   $(".tbl_type01 tbody tr").each(function (i, v) {
  //     dataList[i] = new Array();
  //     $(this)
  //       .children("td")
  //       .each(function (ii, vv) {
  //         let tdText = $(this).text();
  //         tdText = tdText.split("\n").join("");
  //         tdText = tdText.split("\t").join("");
  //         dataList[i][ii] = tdText;
  //       });
  //   });

  //   //db에 넣기
  //   dataList.forEach(async (val, index) => {
  //     await models.Govsupports.findOrCreate({
  //       where: { title: val[1] },
  //       defaults: {
  //         title: val[1],
  //         startDate: val[2],
  //         endDate: val[3].split("~")[1],
  //         siteName: "smTech",
  //       },
  //     });
  //   });
  browser.close();
})();
