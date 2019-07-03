const commandParts = require('telegraf-command-parts');
const fs = require('fs');
const request = require('request');

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
    
    bot.command('chp', (ctx) => {
        if (ctx.state.command.splitArgs.length > 1) {
            ctx.reply("Please give me one name");
        } else if (ctx.state.command.splitArgs[0] === '') {
            request.get('https://chp.shadiao.app/api.php?form_fengfeng', (err, res, body) => {
                if (res.statusCode === 200) {
                    ctx.reply(body);
                } else {
                    ctx.reply('枫枫并不是很想理你');
                }
            })
        } else {
            request.get('https://chp.shadiao.app/api.php?form_fengfeng', (err, res, body) => {
                if (res.statusCode === 200) {
                    ctx.reply(`${ctx.state.command.splitArgs[0]}, ${body}`);
                } else {
                    ctx.reply('枫枫并不是很想理你');
                }
            })
        }
    });
}

module.exports = {
    kuakuaBot: kuakuaBot,
} 
