const Telegraf = require('telegraf');
const env = require('dotenv').load();
const { jiechaBot } = require('./jiecha');
const { kuakuaBot } = require('./kuakua');
const { dotaBot } = require('./dota');


const bot = new Telegraf(process.env.BOTTOKEN);
kuakuaBot(bot);
jiechaBot(bot);
dotaBot(bot);
bot.launch();
