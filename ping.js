const commandParts = require('telegraf-command-parts');

const pingBot = (bot) => {
    bot.use(commandParts());
    bot.command('ping', (ctx) => {
        ctx.reply('pong');
    });
}

module.exports = {
    pingBot: pingBot,
} 
