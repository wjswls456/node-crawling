const cheerio = require("cheerio");
const models = require("./models");
const cron = require("node-cron");
const request = require("request");
const sleep = (ms) => {
  return new Promise(resolve=>{
      setTimeout(resolve,ms)
  })
}



(async ()=>{

let searchUrl = "https://search.naver.com/search.naver?query=";
let customHeaderRequest = request.defaults({
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.81 Safari/537.36",
    },
  });
let keywordList = await models.Blogkeyword.findAll({
  raw:true,
  where:{
    status:"Y"
  }
})
keywordList.forEach((idx,val)=>{

  let keyword = idx.keyword

let encodeURIdata = encodeURI(keyword);
searchUrl += encodeURIdata+"&nso=&where=blog&sm=tab_opt";


 customHeaderRequest.get(searchUrl,async (err,resp,html)=>{
     const $ = cheerio.load(html)
     const lst_totalLi = $(".lst_total").find("li");

     for(let i =0; i < 7;i++){
        let blogName = $(lst_totalLi[i]).find(".elss.etc_dsc_inner").text()
        let blogUrl = $(lst_totalLi[i]).find(".sub_txt.sub_name").attr("href")
        let mobileBlogUrl = blogUrl.replace("blog.","m.blog.")
        await sleep(1000)
        customHeaderRequest.get(mobileBlogUrl,async(err,resp,html)=>{
            const $ = cheerio.load(html)
            const count = $(".count__LOiMv").text()
            const countArr = count.split(" ");

            await sleep(1000)
            const countToday = countArr[1].split(",").join("")*1
            const countTotal = countArr[4].split(",").join("")*1
            const countFriend = $(".buddy___ckI_").text().split("명의 이웃").join("").split(",").join("")*1

            await models.Blogger.create({
              keyword :keyword,
              rank:i+1,
              url:mobileBlogUrl,
              today : countToday,
              total:countTotal,
              friend:countFriend
                })
            })
        }         
    })
  })
})();
