const commandParts = require('telegraf-command-parts');
const fs = require('fs');

const kuakuaBot = (bot) => {
    let lib = [];
    // var imageRules = [];
    const modifier = ['可爱的', '亲爱的', '牛逼的', '超棒的', '机智的'];

    // load reply libraries
    lib = fs.readFileSync('kuakua.txt', 'utf8').split('\n');
    // imageRules = JSON.parse(fs.readFileSync('image.json', 'utf8'));

    const getRandom = (max) => {
        return Math.floor(Math.random() * max);
    }

    const concatSen = (name) => {
        return `我${modifier[getRandom(modifier.length)]}${name}，${lib[getRandom(lib.length)]}`
    }

    bot.use(commandParts());
    bot.command('kuayixia', (ctx) => {
        if (ctx.state.command.splitArgs.length > 1 || ctx.state.command.splitArgs[0] === '') {
            ctx.reply("Please give me one name");
        } else {
            const name = ctx.state.command.splitArgs[0];

            ctx.reply(concatSen(name));
        }
    });
}

module.exports = {
    kuakuaBot: kuakuaBot,
} 