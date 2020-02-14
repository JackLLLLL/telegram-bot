const commandParts = require('telegraf-command-parts');
const fetch = require("node-fetch");

const checkTwitchStatus = (ctx) => {
    fetch("https://api.twitch.tv/helix/streams?user_login=littleaprilfoool&user_login=leeleo3x&user_login=paaaatrickkk&user_login=ruochenj", {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Client-ID': process.env.TWITCH_ID,
        },
    })
    .then((response)=> response.json())
    .then((data)=>{
        const userList = data.data;
        if(userList.length === 0) {
                 ctx.reply('没有人在直播')
        }
        else {
            userList.forEach(user=>{
                const message = user.user_name + '开播啦！' + user.title + ':https://www.twitch.tv/'+user.user_name;
                ctx.reply(message);
            })
        }
    })
    .catch((error)=> {
        console.log('Error:', error)
    });
}

const streamBot = (bot) => {
    bot.use(commandParts());
    // startTwitchNotification();
    bot.command('stream', (ctx) => {
        checkTwitchStatus(ctx);
    });
}

module.exports = {
    streamBot: streamBot,
} 
