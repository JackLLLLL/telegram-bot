const commandParts = require('telegraf-command-parts');
const fs = require('fs');
const request = require('request');
const url = 'https://api.douban.com/v2/movie/in_theaters?apikey='+process.env.DOUBANKEY;

const movieInTheater = () => {
    return new Promise((resolve, reject) => {
        request(url, (err, res, body) => {
            if (!err && res.statusCode == 200) {
                var movielist = JSON.parse(body).subjects
                var topMovie = []
                for (var i in movielist) {
                    if (movielist[i].rating.average > 6.5) {
                        var movie = new Object()
                        movie['rating'] = movielist[i].rating.average
                        movie['title'] = movielist[i].title
                        topMovie.push(movie)
                    }
                }
                resolve(topMovie)
            }
        })
    })
}

const movieBot = (bot) => {
    bot.use(commandParts());
    bot.command('movie', (ctx) => {
        movieInTheater().then((val) => {
            var returnMessage = '最近可以看的大于6.5分的电影有' + val.map(v => `${v.title}(${v.rating})`).join(' ')
            ctx.reply(returnMessage)
        })
    });
}

module.exports = {
    movieBot: movieBot,
} 
