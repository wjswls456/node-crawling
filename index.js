const { smtect } = require("./smtech.js");
const { creativekorea } = require("./creativekorea");
const { govsupport } = require("./govsupport");
const { bizinfo } = require("./bizinfo");
const cron = require("node-cron");

(async () => {
  cron.schedule("* * * * * *", async () => {
    //   smtech();
    await creativekorea();
    await govsupport();
    await bizinfo();
  });
})();
