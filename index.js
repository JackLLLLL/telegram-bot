const Telegraf = require('telegraf');
const env = require('dotenv').load();
const { jiechaBot } = require('./jiecha');
const { kuakuaBot } = require('./kuakua');
const { dotaBot } = require('./dota');
const { movieBot } = require('./movie');
const { busBot } = require('./bus');
const { pingBot } = require('./ping');
const { streamBot } = require('./stream');

const bot = new Telegraf(process.env.BOTTOKEN);
dotaBot(bot);
movieBot(bot);
pingBot(bot);
busBot(bot);
kuakuaBot(bot);
streamBot(bot);
jiechaBot(bot);
bot.launch();
