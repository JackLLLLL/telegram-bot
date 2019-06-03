const commandParts = require('telegraf-command-parts');
const fs = require('fs');
const request = require('request');

const dotaBot = (bot) => {
    let playerMap = new Map();
    let heroMap = new Map();
    
    const savePlayers = (playerMap) => {
        let obj=[];
        for ([name, id] of playerMap) {
            obj.push({'name': name, 'id': id});
        }
        fs.writeFileSync('players.txt', JSON.stringify(obj), 'utf8');
    }

    const readPlayers = () => {
        let obj = JSON.parse(fs.readFileSync('players.txt', 'utf8'));
        playerMap.clear();
        for (player of obj) {
            playerMap.set(player.name, player.id);
        }
    }

    const readHeroes = () => {
        let obj = JSON.parse(fs.readFileSync('heroes.json', 'utf8'));
        for (hero of obj) {
            heroMap.set(hero.id, hero.localized_name);
        }
    }

    // load players
    readPlayers();
    // load heroes
    readHeroes();

    const createReply = (name, match) => {
        var win;
        if (match.player_slot < 128) {
            win = match.radiant_win;
        } else {
            win = !match.radiant_win;
        }
        return `玩家${name}最近在${new Date(match.start_time*1000).toLocaleString('zh-Hans-CN', { timeZone: 'America/Vancouver' })}进行了一场比赛，激战了${Math.ceil(match.duration/60)}分钟，终于，他${win?'赢':'输'}了！他玩的是${heroMap.get(match.hero_id)}，他杀了${match.kills}个人，死了${match.deaths}次，助攻了${match.assists}次，KDA为${((match.kills+match.assists)/ (match.deaths===0?1:match.deaths) ).toFixed(2)}，真的是太${((match.kills+match.assists)/match.deaths)>2?'屌':'菜'}了！他的GPM是${match.gold_per_min}，XPM是${match.xp_per_min}，补了${match.last_hits}个刀，总计对英雄造成了${match.hero_damage}点伤害，对塔造成了${match.tower_damage}点伤害，英雄治疗${match.hero_healing}点，（wy赞助）输出经济比为${(match.hero_damage/((match.duration/60)*match.gold_per_min)).toFixed(2)}。GGWP！`
    }

    const savePlayersInterval = setInterval(() => {
        savePlayers(playerMap);
    }, 3600*1000);

    bot.use(commandParts());
    bot.command('bind', (ctx) => {
        if (ctx.state.command.splitArgs.length !== 2) {
            ctx.reply("Please give me one name and dota2 id binded to it. e.g. 'bind ff 12345678'");
        } else {
            const name = ctx.state.command.splitArgs[0];
            const id = ctx.state.command.splitArgs[1];
            ctx.reply(`set ${name} --> ${id}`);
            playerMap.set(name, id);
        }
    });

    bot.command('showAllPlayers', (ctx) => {
        for (player of playerMap) {
            ctx.reply(player)
        }
    })

    bot.command('check', (ctx) => {
        if (ctx.state.command.splitArgs.length !== 1 || ctx.state.command.splitArgs[0] == '') {
            ctx.reply("Please give me one name.");
        } else {
            const name = ctx.state.command.splitArgs[0];
            if (playerMap.has(name)) {
                const id = playerMap.get(name);
                request.get(`https://api.opendota.com/api/players/${id}/recentMatches`, (err, res, body) => {

                    if (res.statusCode === 200) {
                        const match = JSON.parse(body)[0];
                        const reply = createReply(name, match);
                        // xg special case
                        if (name === 'xg') {
                            reply.replace('太菜了', 'tdl，还买了好多眼，梅肯也出的很棒。');
                        }
                        ctx.reply(reply);
                    } else {
                        ctx.reply('Failed. Maybe reached api limit.');
                    }
                })
            } else {
                ctx.reply('No dota2 id binded to this name.')
            }
        }
    });
}

module.exports = {
    dotaBot: dotaBot,
} 
