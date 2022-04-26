const cheerio = require("cheerio");
const axios = require("axios");
const models = require("./models");
const cron = require("node-cron");
const moment = require("moment");
const request = require("request");



(async () => {
  let searchUrl = "https://search.naver.com/search.naver?ie=UTF-8&query=";
  let customHeaderRequest = request.defaults({
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.81 Safari/537.36",
    },
  });
  cron.schedule("30 */2 * * *", async () => {
    let dataList = [];
    let keyworkdList = await models.Keywords.findAll({
      attributes: { exclude: ["updatedAt"] },
    });
    keyworkdList.forEach((idx, val) => {
      dataList.push(idx.dataValues.keyword);
    });

    dataList.forEach((data, index) => {
      encodeURIdata = encodeURI(data);
      url = searchUrl + encodeURIdata;

      customHeaderRequest.get(url, async (err, resp, html) => {
        const $ = cheerio.load(html);
        const blogTitleList = $(".total_area");
        let blogName = "";
        let blogTitle = "";
        let selectedTitle = "";

        

        for (let i = 0; i < blogTitleList.length; i++) {
          blogName = $(blogTitleList[i]).find(".sub_txt.sub_name").text();
          blogTitle = $(blogTitleList[i])
            .find(".api_txt_lines.total_tit._cross_trigger")
            .text();
          if (blogNameList.indexOf(blogName) >= 0) {
            await models.Blog.create({
              title: blogTitle,
              blog: blogName,
              keyword: data,
              rank: i + 1,
            });
            idx[blogName] = i + 1;
          }
        }

        
      });
    });
  });
})();
