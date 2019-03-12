const Telegraf = require('telegraf');
const { jiechaBot } = require('./jiecha');
const { kuakuaBot } = require('./kuakua');


const bot = new Telegraf(process.env.BOTTOKEN);
kuakuaBot(bot);
jiechaBot(bot);
bot.launch();
