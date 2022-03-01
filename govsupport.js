const cheerio = require("cheerio");
const axios = require("axios");

const cron = require("node-cron");
const models = require("./models");
const request = require("request");

(async () => {
  let searchUrl =
    "https://www.k-startup.go.kr/common/announcement/announcementList.do?mid=30004&bid=701&searchAppAt=A";
  let customHeaderRequest = request.defaults({
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.81 Safari/537.36",
      Cookie: "sortOrder=INSERT_DATE", // 최신순
    },
    //인증서 부분
    rejectUnauthorized: false,
  });

  customHeaderRequest.get(searchUrl, async (err, resp, html) => {
    const $ = cheerio.load(html);
    const bizPbancList = $("#bizPbancList");
    // const tagSort = $("#sort");
    // $(tagSort).find("option:eq(1)").prop("selected", true);
    const liList = $(bizPbancList).find("ul > li");

    liList.each(async (index, el) => {
      let title = $(el).find(".tit").text();
      let href = $(el).find(".middle > a").attr("href");
      let startDate = $(el).find(".bottom > span:eq(2)").text();
      let endDate = $(el).find(".bottom > span:eq(3)").text();

      endDate = endDate.split("\t").join("");
      endDate = endDate.split("\n").join("");
      endDate = endDate.split(" ")[1];

      startDate = startDate.split("\t").join("");
      startDate = startDate.split("\n").join("");
      startDate = startDate.split(" ")[1];
      var reg = /[`~!@#$%^&*()|+\-=?;:,.<>\{\}\[\]\\\/ ]/gim;
      href = href.replace(reg, "");
      href = href.replace("javascriptannouncement_itemSelect", "");
      let searchPrefixCode = href.split("'")[1];
      let searchPostSn = href.split("'")[3];

      let detailUrl = `https://k-startup.go.kr/common/announcement/announcementDetail.do?searchPostSn=${searchPostSn}&searchPrefixCode=${searchPrefixCode}`;

      await models.Govsupports.findOrCreate({
        where: { title: title },
        defaults: {
          title: title,
          startDate: startDate,
          endDate: endDate,
          detailUrl: detailUrl,
          siteName: "k-startup",
        },
      });
    });
  });
  // browser.close();
})();
