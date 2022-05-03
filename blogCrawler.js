const cheerio = require("cheerio");
const models = require("./models");
const cron = require("node-cron");
const request = require("request");
const sleep = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

(async () => {
  let searchUrl = "https://search.naver.com/search.naver?query=";
  //headers에 부분에 User-Agent 추가 해야함 
  let customHeaderRequest = request.defaults({
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.81 Safari/537.36",
    },
  });

  let dataList = [];
  cron.schedule("50 23 * * *", async () => {
    let keywordList = await models.Blogkeyword.findAll({
      raw: true,
      where: {
        status: "Y",
      },
    });
    keywordList.forEach((idx, val) => {
      dataList.push(idx.keyword);
    });
    let time = 100;
    dataList.forEach(async (idx, val) => {
      let keyword = idx;

      let encodeURIdata = encodeURI(keyword);
      let encodeSearchUrlData =
        searchUrl + encodeURIdata + "&nso=&where=blog&sm=tab_opt";

      const getRequest = (encodeSearchUrlData) => {
        customHeaderRequest.get(
          encodeSearchUrlData,
          async (err, resp, html) => {
            const $ = cheerio.load(html);
            const lst_totalLi = $(".lst_total").find("li");

            for (let i = 0; i < 7; i++) {
              let blogName = $(lst_totalLi[i])
                .find(".elss.etc_dsc_inner")
                .text();
              let blogUrl = $(lst_totalLi[i])
                .find(".sub_txt.sub_name")
                .attr("href");
              let blogTitle = $(lst_totalLi[i])
                .find(".api_txt_lines.total_tit")
                .text();
              let blogLink = $(lst_totalLi[i])
                .find(".api_txt_lines.total_tit")
                .attr("href");

              let mobileBlogUrl = blogUrl.replace("blog.", "m.blog.");

              //  console.log("요청 전 ",new Date())
              //  console.log(mobileBlogUrl,blogName,keyword,i,encodeSearchUrlData)
              setTimeout(() => {
                customHeaderRequest.get(
                  mobileBlogUrl,
                  async (err, resp, html) => {
                    const $ = cheerio.load(html);
                    const count = $(".count__LOiMv").text();
                    const countArr = count.split(" ");
                    // console.log("요청 후 ",new Date())
                    // console.log(mobileBlogUrl,blogName,keyword,i+1)
                    const countToday = countArr[1].split(",").join("") * 1;
                    const countTotal = countArr[4].split(",").join("") * 1;
                    const countFriend =
                      $(".buddy___ckI_")
                        .text()
                        .split("명의 이웃")
                        .join("")
                        .split(",")
                        .join("") * 1;

                    await models.Blogger.create({
                      keyword: keyword,
                      rank: i + 1,
                      blogname: blogName,
                      url: mobileBlogUrl,
                      today: countToday,
                      total: countTotal,
                      friend: countFriend,
                      title: blogTitle,
                      titleurl: blogLink,
                    });
                  }
                );
              }, time * (i + 1));
            }
          }
        );
      };
      setTimeout(() => {
        getRequest(encodeSearchUrlData);
      }, time);
      time += 500;
    });
  });
})();
