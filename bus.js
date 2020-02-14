const commandParts = require('telegraf-command-parts');
const fs = require('fs');
const request = require('request');
var parseString = require('xml2js').parseString;
const url = 'http://api.translink.ca/rttiapi/v1/stops/51862/estimates?apikey='+process.env.TRANSLINKTOKEN;

const busBot = (bot) => {
    bot.use(commandParts());
    bot.command('bus', (ctx) => {
        ctx.reply("Next buses at SCIENCE RD")
        request(url, function(error, response, body) {
            if(!error && response.statusCode == 200) {
                parseString(body, function (err, result) {
                    result.NextBuses.NextBus.forEach((bus) => {
                        ctx.reply('The next ' + bus.RouteNo + ':  ' + bus.Schedules[0].Schedule[0].ExpectedLeaveTime)
                    });
                });
            };
        });
    });
}

module.exports = {
    busBot: busBot,
} 
