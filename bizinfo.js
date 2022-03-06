const cheerio = require("cheerio");
const models = require("../models");
var puppeteer = require("puppeteer");

module.exports = {
  bizinfo: async function () {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(
      "https://www.bizinfo.go.kr/web/lay1/bbs/S1T122C128/AS/74/list.do",
      { waitUntil: "load" }
    );

    const content = await page.content();
    const $ = cheerio.load(content);
    $("tbody tr").each(async (idx, el) => {
      let title = $(el).find("td:eq(2)").text();
      title = title.split(" ").join("");

      let date = $(el).find("td:eq(3)").text();
      date = date.split(" ").join("");

      let startDate = date.split("~")[0];
      let endDate = date.split("~")[1];

      let detailUrlDate = $(el).find("td:eq(2) a").attr("href");
      let detailUrl =
        "https://www.bizinfo.go.kr/web/lay1/bbs/S1T122C128/AS/74/" +
        detailUrlDate;
      await models.Govsupports.findOrCreate({
        where: { title: title },
        defaults: {
          title: title,
          startDate: startDate,
          endDate: endDate,
          detailUrl: detailUrl,
          siteName: "기업마당",
        },
      });
    });
    browser.close();
  },
};
