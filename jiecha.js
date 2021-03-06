const commandParts = require('telegraf-command-parts');
const session = require('telegraf/session');
const Stage = require('telegraf/stage');
const Scene = require('telegraf/scenes/base');
const fs = require('fs');

const jiechaBot = (bot) => {
    var textRules = [];
    var imageRules = [];
    var paused = false;
    var sender = 0;

    // load rules at start
    textRules = JSON.parse(fs.readFileSync('data/text.json', 'utf8'));
    imageRules = JSON.parse(fs.readFileSync('data/image.json', 'utf8'));

    // rewrite rules into files
    const writeInterval = setInterval(() => {
        fs.writeFileSync('data/text.json', JSON.stringify(textRules), 'utf8');
        fs.writeFileSync('data/image.json', JSON.stringify(imageRules), 'utf8');
    }, 1800*1000);

    // tidy rules every day
    const tidyInterval = setInterval(() => {
        textRules = tidyRules(textRules);
        imageRules = tidyRules(imageRules);
    }, 86400*1000);

    // tidy function, delete rules with 0 rate and with same trigger and same author
    const tidyRules = (ruleSet) => {
        let newSet = [];
        let validMap = new Map(); // to remove duplicate rules
        for (rule of ruleSet) {
            if (rule.rate !== 0 && !validMap.has(`${rule.trigger}@${rule.author}`)) {
                validMap.set(`${rule.trigger}@${rule.author}`, 1);
                newSet.push(rule);
            }
        }
        return newSet;
    }

    // add text rule
    var state = 0;
    var trigger, rate, reply;
    const textScene = new Scene('text');
    textScene.enter((ctx) => {
        state = 1;
        if (sender !== 0) ctx.scene.leave();;
        sender = ctx.message.from.id;
        ctx.reply('Adding rule for text ...\nPlease enter a key word as trigger for this rule. \nUse /cancel to cancel.');
    });
    textScene.leave((ctx) => {
        state = 0;
        sender = 0;
    });
    textScene.command('cancel', (ctx) => {
        state = 0;
        sender = 0;
        ctx.reply("Add text rule canceled.");
        ctx.scene.leave();
    });
    textScene.on('text', (ctx) => {
        if (sender === ctx.message.from.id) {
            if (ctx.message.text.length > 0 && ctx.message.text.length < 6) {
                if (state === 1) {
                    trigger = ctx.message.text;
                    state = 2;
                    ctx.reply(`Key word is ${trigger} \nPlease enter a trigger rate from 1 to 100(%).`);
                } else if(state === 2) {
                    rate = parseInt(ctx.message.text, 10) || 100;
                    state = 3;
                    ctx.reply(`Percentage is ${rate}% \nPlease send me a sticker.`);
                } else if (state === 3) {
                    ctx.reply("Please send me a sticker.");
                } else {
                    ctx.reply("Unknown error.");
                    state = 0;
                    sender = 0;
                    ctx.scene.leave();
                }
            } else {
                ctx.reply("Key word too long.");
            }
    //	} else {
    // 		ctx.reply("Someone else scared me. 溜了溜了");
    // 		sender = 0;
    // 		state = 0;
    // 		ctx.scene.leave();
        }
    });
    textScene.on('sticker', (ctx) => {
        if (sender === ctx.message.from.id) {
            if (state === 3) {
                reply = ctx.message.sticker.file_id;
                state = 4;
                //ctx.replyWithSticker(reply);
                ctx.reply(`Sticker received ${reply}`);
                const obj = {
                    trigger: trigger,
                    rate: Math.max(Math.min(parseInt(rate, 10), 100), 0),
                    reply: reply,
                    author: sender,
                    firstName: ctx.message.from.first_name,
                };
                textRules.push(obj);
                ctx.reply("Successfully added one rule.");
                ctx.scene.leave();
                //ctx.reply(textRules);
            } else if (state === 1) {
                ctx.reply("Please send key word (length < 6).");
            } else if (state === 2) {
                ctx.reply("Please enter a number from 1 to 100(%).");
            } else {
                ctx.reply("Unknown error.");
                state = 0;
                sender = 0;
                ctx.scene.leave();
            }
    //	} else {
    // 		ctx.reply("Someone else scared me. 溜了溜了");
    //                 sender = 0;
    //                 state = 0;
    //                 ctx.scene.leave();
        }
    });
    textScene.on('message', (ctx) => {
        if (state === 1) {
            ctx.reply("Please send key word (length < 6).");
        } else if (state === 2) {
            ctx.reply("Please enter a number from 1 to 100(%).");
        } else if (state === 3) {
            ctx.reply("Please send me a sticker.");
        } else {
            ctx.reply("Internal Error");
            state = 0;
            sender = 0;
            ctx.scene.leave();
        }
    });


    // add image rule
    const imageScene = new Scene('image');
    var state = 0;
    var trigger, rate, reply;
    imageScene.enter((ctx) => {
            state = 1;
            if (sender !== 0) ctx.scene.leave();;
            sender = ctx.message.from.id;
            ctx.reply("Adding rule for image ...\nPlease send a sticker as trigger for this rule. \nUse /cancel to cancel.");
    });
    imageScene.leave((ctx) => {
        state = 0;
        sender = 0;
    });
    imageScene.command('cancel', (ctx) => {
        state = 0;
        sender = 0;
        ctx.reply("Add image rule canceled.");
        ctx.scene.leave();;
    });
    imageScene.on('text', (ctx) => {
        if (sender === ctx.message.from.id) {
            if (state === 1) {
                ctx.reply("Please send me a sticker.");
            } else if(state === 2) {
                rate = parseInt(ctx.message.text, 10) || 100;
                state = 3;
                ctx.reply(`Percentage is ${rate} \nPlease send me a sticker.`);
            } else if (state === 3) {
                ctx.reply("Please send me a sticker.");
            } else {
                ctx.reply("Unknown error.");
                state = 0;
                sender = 0;
                ctx.scene.leave();
            }
    //	} else {
    // 		ctx.reply("Someone else scared me. 溜了溜了");
    // 		sender = 0;
    // 		state = 0;
    // 		ctx.scene.leave();
        }
    });
    imageScene.on('sticker', (ctx) => {
        if (sender === ctx.message.from.id) {
            if (state === 3) {
                reply = ctx.message.sticker.file_id;
                state = 4;
                ctx.reply(`Sticker received ${reply}`);
                const obj = {
                    trigger: trigger,
                    rate: Math.max(Math.min(parseInt(rate, 10), 100), 0),
                    reply: reply,
                    author: sender,
                    firstName: ctx.message.from.first_name,
                };
                imageRules.push(obj);
                ctx.reply("Successfully added one rule.");
                ctx.scene.leave();
                //ctx.reply(Rules);
            } else if (state === 1) {
                trigger = ctx.message.sticker.file_id;
                state = 2;
                ctx.reply(`Key word is ${trigger} \nPlease enter a trigger rate from 1 to 100(%).`);
            } else if (state === 2) {
                ctx.reply("Please enter a number from 1 to 100.");
            } else {
                ctx.reply("Unknown error.");
                state = 0;
                sender = 0;
                ctx.scene.leave();
            }
    //	} else {
    // 		ctx.reply("Someone else scared me. 溜了溜了");
    //                 sender = 0;
    //                 state = 0;
    //                 ctx.scene.leave();
        }
    });
    imageScene.on('message', (ctx) => {
        if (state === 1) {
            ctx.reply("Please send me a sticker.");
        } else if (state === 2) {
            ctx.reply("Please enter a number from 1 to 100(%).");
        } else if (state === 3) {
            ctx.reply("Please send me a sticker.");
        } else {
            ctx.reply("Internal Error");
            state = 0;
            sender = 0;
            ctx.scene.leave();
        }
    });


    const stage = new Stage([textScene, imageScene], { ttl: 30 });
    bot.use(session());
    bot.use(stage.middleware());
    bot.use(commandParts());

    bot.command('text', (ctx) => { if (!paused) ctx.scene.enter('text') });
    bot.command('image', (ctx) => { if (!paused) ctx.scene.enter('image') });
    bot.command('shutup', (ctx) => {
            paused = true;
            ctx.reply('FF shut up!');
    });
    bot.command('delete', (ctx) => {
        if (ctx.state.command.splitArgs.length !== 1) {
            ctx.reply("Please give me exactly one key word");
        } else {
            const keyWord = ctx.state.command.splitArgs[0];
            let foundOne = false;
            //ctx.reply(`Deleting rules with keyword ${keyWord} ...`);
            // text rules
            for (rule of textRules) {
                if (rule.trigger === keyWord) {
                    if (rule.author === ctx.message.from.id) { // lazy delete
                        rule.rate = 0;
                        ctx.reply("All related rules deleted");
                        foundOne = true;
                    } else {
                        ctx.reply(`You are not author. This rule belongs to ${rule.firstName}`);
                        foundOne = true;
                    }
                } 
            }
            // image rules
            for (rule of imageRules) {
                if (rule.trigger === keyWord) {
                    if (rule.author === ctx.message.from.id) { // lazy delete
                        rule.rate = 0;
                        ctx.reply("All related rules deleted");
                        foundOne = true;
                    } else {
                        ctx.reply(`You are not author. This rule belongs to ${rule.firstName}`);
                        foundOne = true;
                    }
                } 
            }
            !foundOne && ctx.reply("Rule not found");
        }
    });
    bot.command('start', (ctx) => {
            paused = false;
            ctx.reply('You can speak now, FF');
    });
    bot.command('clear', (ctx) => {
        ctx.reply("Clear feature has been removed temporarily");
    });
    // bot.command('clear', (ctx) => {
    // 	ctx.reply("Begin cleaning rules with keyword ... ");
    // 	textRules = [];
    // 	imageRules = [];
    // 	ctx.reply("All rules been cleared");
    // });

    // reply with text rules
    bot.on('text', (ctx) => {
            if (!paused && ctx.message.from.id !== sender) {
                    sender = 0;
                    //ctx.reply(ctx.message);
                    for (rule of textRules) {
                            if (ctx.message.text !== undefined && ctx.message.text.includes(rule.trigger)) {
                                    if (Math.random()*100 < rule.rate) {
                                        ctx.replyWithSticker(rule.reply);
                        break;
                                    }
                            }
                    };
            }
    });

    // reply with image rules
    bot.on('sticker', (ctx) => {
            if (!paused && ctx.message.from.id !== sender) {
                    sender = 0;
                    for (rule of imageRules) {
                            if (ctx.message.sticker !== undefined && ctx.message.sticker.file_id === rule.trigger) {
                                    if (Math.random()*100 < rule.rate) {
                                            ctx.replyWithSticker(rule.reply);
                        break;
                    }
                            }
                    };
            }
    });
}

module.exports = {
    jiechaBot: jiechaBot,
}