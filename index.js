const Telegraf = require('telegraf');
const { jiechaBot } = require('./jiecha');
const { kuakuaBot } = require('./kuakua');


const bot = new Telegraf(process.env.BOTTOKEN);
jiechaBot(bot) && console.log('Launching Jie Cha Wang ...\n');
kuakuaBot(bot) && console.log('Launching Kua Kua Bot ...\n');
bot.launch();
