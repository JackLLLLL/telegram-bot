const Telegraf = require('telegraf');
const session = require('telegraf/session');
const Stage = require('telegraf/stage');
const Scene = require('telegraf/scenes/base');
const env = require('dotenv').load();
const fs = require('fs');
const { enter, leave } = Stage;

var textRules = [];
var imageRules = [];
var paused = false;
var sender = 0;


// load rules at start
textRules = JSON.parse(fs.readFileSync('text.json', 'utf8'));
imageRules = JSON.parse(fs.readFileSync('image.json', 'utf8'));

// rewrite rules into files
const interval = setInterval(() => {
	fs.writeFile('text.json', JSON.stringify(textRules), 'utf8');
	fs.writeFile('image.json', JSON.stringify(imageRules), 'utf8');
}, 3600*1000);

// add text rule
var state = 0;
var trigger, rate, reply;
const textScene = new Scene('text');
textScene.enter((ctx) => {
	state = 1;
	if (sender !== 0) leave();
	sender = ctx.message.from.id;
	ctx.reply('Adding rule for text ...\nPlease enter a key word as trigger for this rule. \nUse /cancel to cancel.');
});
textScene.leave((ctx) => {
	ctx.reply("Add text rule canceled.");
});
textScene.command('cancel', () => {
	state = 0;
	sender = 0;
	ctx.reply("Add text rule canceled.");
	leave();
});
textScene.on('text', (ctx) => {
	if (sender === ctx.message.from.id) {
		if (ctx.message.text.length > 0 && ctx.message.text.length < 6) {
			if (state === 1) {
				trigger = ctx.message.text;
				state = 2;
				ctx.reply(`Key word is ${trigger} \nPlease enter a number from 1 to 100.`);
			} else if(state === 2) {
				rate = ctx.message.text;
				state = 3;
				ctx.reply(`Percentage is ${rate} \nPlease send me a sticker.`);
			} else {
				ctx.reply("Error");
				state = 0;
				sender = 0;
				leave();
			}
		} else {
			ctx.reply("Key word too long.");
		}
	} else {
		ctx.reply("Error");
		sender = 0;
		state = 0;
		leave();
	}
});
textScene.on('sticker', (ctx) => {
	if (sender === ctx.message.from.id) {
		if (state === 3) {
			reply = ctx.message.sticker.file_id;
			state = 4;
			ctx.replyWithSticker(reply);

			const obj = {
				trigger: trigger,
				rate: parseInt(rate, 10),
				reply: reply
			};
			textRules.push(obj);
			ctx.reply("Successfully added one rule.");
			ctx.reply(textRules);
		} else {
			ctx.reply("Error");
			state = 0;
			sender = 0;
			leave();
		}
	} else {
		 ctx.reply("Error");
                sender = 0;
                state = 0;
                leave();
	}
});
textScene.on('message', (ctx) => {
	if (state === 1) {
		ctx.reply("Please send key word (length < 6).");
	} else if (state === 2) {
		ctx.reply("Please enter a number from 1 to 100.");
	} else if (state === 3) {
		ctx.reply("Please send me a sticker.");
	} else {
		ctx.reply("Error");
		state = 0;
		sender = 0;
		leave();
	}
});


// add image rule
const imageScene = new Scene('image');
var state = 0;
var trigger, rate, reply;
textScene.enter((ctx) => {
        state = 1;
        if (sender !== 0) leave();
        sender = ctx.message.from.id;
        ctx.reply("Adding rule for image ...\nPlease send a sticker as trigger for this rule. \nUse /cancel to cancel.");
});
textScene.leave((ctx) => {
        ctx.reply("Add text rule canceled.");
});

const bot = new Telegraf(process.env.BOTTOKEN);
const stage = new Stage([textScene, imageScene], { ttl: 10 });
bot.use(session());
bot.use(stage.middleware());

bot.command('text', enter('text'));
bot.command('image', enter('image'));
// pause or unpause bot
bot.command('shutup', (ctx) => {
        paused = true;
        ctx.reply('FF shut up!');
});

bot.command('start', (ctx) => {
        paused = false;
        ctx.reply('You can speak now, FF');
});


// reply with text rules
bot.on('text', (ctx) => {
        if (!paused && ctx.message.from.id !== sender) {
                sender = 0;
                //ctx.reply(ctx.message);
                textRules.forEach(rule => {
                        if (ctx.message.text !== undefined && ctx.message.text.includes(rule.trigger)) {
                                if (Math.random()*100 < rule.rate) {
                                        ctx.replyWithSticker(rule.reply);
                                }
                        }
                });
        }
});

// reply with image rules
bot.on('sticker', (ctx) => {
        if (!paused && ctx.message.from.id !== sender) {
                sender = 0;
                imageRules.forEach(rule => {
                        if (ctx.message.sticker !== undefined && ctx.message.sticker.file_id === rule.trigger) {
                                if (Math.random()*100 < rule.rate) {
                                        ctx.replyWithSticker(rule.reply);
                                }
                        }
                });
        }
});
bot.launch();
