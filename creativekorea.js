const cheerio = require("cheerio");
const models = require("../models");
const request = require("request");
var puppeteer = require("puppeteer");

module.exports = {
  creativekorea: async function () {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(
      "https://ccei.creativekorea.or.kr/seoul/service/program_list.do?&page=1",
      {
        timeout: 6000,
        waitUntil: "load",
      }
    );

    await page.waitForNavigation({ waitUntil: "load" });
    const content = await page.content();
    const $ = cheerio.load(content);

    $("#list_body li").each(async (i, v) => {
      let title = $(v).find("div:eq(1) h4").text();
      let date = $(v).find("div:eq(1) .galdate").text();
      let detailUrlDate = $(v).find("a").attr("onclick");
      var reg = /[`~!@#$%^&*()|+\-=?;:<>\{\}\[\]\\\/ ]/gim;
      detailUrlDate = detailUrlDate.split("pageGo")[1];
      detailUrlDate = detailUrlDate.replace(reg, "");
      let no = detailUrlDate.split(",")[0];
      let rnum = detailUrlDate.split(",")[1];
      let pn = detailUrlDate.split(",")[2];
      let detailUrl = `https://ccei.creativekorea.or.kr/seoul/service/program_view.do?no=${no}&div_code=&rnum=${rnum}&pn=${pn}&kind=my&sPtime=now&sMenuType=00040001&pagePerContents=6&cmntySeqNum=&menuSeqNum=&storyList=&sdate=&edate=&programCode=&contents=&title=`;

      date = date.split("\t").join("");
      date = date.split(" ").join("");
      date = date.split(".").join("-");
      date = date.split("사업공고")[1];
      date = date.split("~");
      let startDate = date[0];
      let endDate = date[1];

      await models.Govsupports.findOrCreate({
        where: { title: title },
        defaults: {
          title: title,
          startDate: startDate,
          endDate: endDate,
          detailUrl: detailUrl,
          siteName: "서울창조경제혁신센터",
        },
      });
    });

    browser.close();
  },
};
