import {
    BaseEvent
} from "../base/BaseEvent.js";
import {
    Message,
    MessageEmbed
} from "discord.js";
import Cheerio from 'cheerio';
import axios from 'axios';
//import data from '../../data.json' assert {type: 'json'};
import JSONdb from "simple-json-db";


const db = new JSONdb('./../data.json');

export class ReadyEvent extends BaseEvent {
    constructor(client) {
        super(client, "ready");
    }

    async execute() {
        scrapeNews(this.client)
        scrapeTheAU(this.client)
        setInterval(() => {
            scrapeNews(this.client)
            scrapeTheAU(this.client)
        }, 10000)

        this.client.logger.info(`${this.client.user.tag} is online on ${this.client.guilds.cache.size} guilds`);
    }
}

function scrapeNews(client) {
    if (!db.has('newsDB')) {
        db.set('newsDB', [])
        db.sync()
    }
    let newsDB = db.get('newsDB')
    //console.log(newsDB.length)
    let channel = client.channels.cache.get(process.env['CHANNEL'])
    var config = {
        method: 'get',
        url: 'https://www.afr.com/street-talk',
        headers: {
            'authority': 'www.afr.com',
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
            'accept-language': 'en-US,en;q=0.9,ar;q=0.8',
            'cache-control': 'max-age=0',
            'cookie': '_gcl_au=1.1.581909643.1666932843; optimizelyEndUserId=oeu1666932843557r0.7212394649700542; _sp_ses.0af9=*; _bsMode=false; ln_or=d; _ga=GA1.2.1992830533.1666932845; _gid=GA1.2.1741966458.1666932845; nol_fpid=lgjv73fem4bpdppi4syp5hlg33adj1666932845|1666932845369|1666932845369|1666932845369; AMCVS_BEB5C8A15492DB600A4C98BC%40AdobeOrg=1; _parsely_session={%22sid%22:1%2C%22surl%22:%22https://www.afr.com/street-talk%22%2C%22sref%22:%22%22%2C%22sts%22:1666932845556%2C%22slts%22:0}; _parsely_visitor={%22id%22:%22pid=5b91a9b4d2936b04e08e8f34ae46977e%22%2C%22session_count%22:1%2C%22last_session_ts%22:1666932845556}; AMCV_BEB5C8A15492DB600A4C98BC%40AdobeOrg=-1176276602%7CMCIDTS%7C19294%7CMCMID%7C23614221291793640134411089737326178838%7CMCAAMLH-1667537645%7C6%7CMCAAMB-1667537645%7CRKhpRz8krg2tLO6pguXWp5olkAcUniQYPHaMWWgdJ3xzPWQmdj0y%7CMCOPTOUT-1666940045s%7CNONE%7CMCAID%7CNONE; aam_uuid=23642372225858269904412779343327184405; DM_SitId1503=1; DM_SitId1503SecId12881=1; NUID=6537f5d3eb1b479586582f3dd388a4c1; _hjSessionUser_182799=eyJpZCI6IjljODExN2VhLWUyYjEtNWI4Ny04ZmY0LWQwNWVjNjkwNzgzOCIsImNyZWF0ZWQiOjE2NjY5MzI4NDUxNTQsImV4aXN0aW5nIjpmYWxzZX0=; _hjFirstSeen=1; _hjIncludedInSessionSample=1; _hjSession_182799=eyJpZCI6ImM2OWVmZWQ5LWVlYjgtNGU3YS1iMDQzLTk3MjVjODE2ZWEyZCIsImNyZWF0ZWQiOjE2NjY5MzI4NDk1NzEsImluU2FtcGxlIjp0cnVlfQ==; _hjAbsoluteSessionInProgress=0; _cb=CPoL1NLm6ftDnF51k; _chartbeat2=.1666932850537.1666932850537.1.D_W9GlWAYsdDW2WamDYQ4J_2IdsO.1; _cb_svref=null; _sp_id.0af9=3a67cf15-b687-49e6-bc4b-627274e45eb3.1666932844.1.1666933294.1666932844.84b0c69c-1497-48e1-ad4a-54364651bcdc',
            'if-none-match': 'W/"876b4-yr1TMdF8Um7rG0ZxUaaeTaS8g1M"',
            'sec-ch-ua': '"Chromium";v="106", "Google Chrome";v="106", "Not;A=Brand";v="99"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-model': '""',
            'sec-ch-ua-platform': '"Windows"',
            'sec-ch-ua-platform-version': '"10.0.0"',
            'sec-fetch-dest': 'document',
            'sec-fetch-mode': 'navigate',
            'sec-fetch-site': 'cross-site',
            'sec-fetch-user': '?1',
            'upgrade-insecure-requests': '1',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36'
        }
    };

    axios(config)
        .then(function (response) {
            const $ = Cheerio.load(response.data)
            //console.log($('._2slqK._3AC43')[0].children[0].children[0]);
            let news = $('._2slqK._3AC43')
            //console.log(news.length)
            let embeds = []
            let baseUrl = 'https://www.afr.com'
            for (let i = 0; i < news.length; i++) {
                let newsEach = $('._2slqK._3AC43')[i]
                let newsCategory = newsEach.children[0].children[0].children[0].data
                let newsCategoryLink = baseUrl + newsEach.children[0].children[0].attribs.href

                let newsHeaderTextLink = baseUrl + newsEach.children[1].children[0].attribs.href
                let newsHeaderText = newsEach.children[1].children[0].children[0].data

                let newsDescription = newsEach.children[2] ? newsEach.children[2].children[0].children[0].data : ''
                let newsDate = $(`#content > div > div._1u8Te > div:nth-child(${i+1}) > div > ul > li > time`).attr('datetime') ? $(`#content > div > div._1u8Te > div:nth-child(${i+1}) > div > ul > li > time`).attr('datetime') : '';


                let embed = new MessageEmbed()

                    .setTitle(newsHeaderText)
                    .setURL(newsHeaderTextLink)
                    .setColor('LIGHT_GREY')
                    .setDescription(`${newsDescription}`)

                    .setFooter(`${newsCategory} | ${newsDate}`)
                if (newsDate == '') {
                    embed.setFooter(`${newsCategory}`)

                }


                embeds.push(embed)

                //newsDB.push(embed)
                db.sync()
                //console.log(newsCategory, newsCategoryLink, newsHeaderText, newsHeaderTextLink, newsDescription, newsDate );

                if (i == news.length - 1) {
                    if (embeds.length > 10) {
                        var size = 10;
                        var arrayOfArrays = [];
                        //newsDB = embeds
                        let newsDbOld = db.get('newsDB')
                        db.set('newsDB', embeds)

                        for (var j = 0; j < embeds.length; j += size) {

                            arrayOfArrays.push(embeds.slice(j, j + size));

                            //console.log(j, embeds.length-size)
                            if (j >= embeds.length - size) {
                                newsDB = db.get('newsDB')
                                db.sync()

                                let changes = checkForChange(newsDbOld)
                                if (!changes) return //console.log('false changes');
                                //console.log(newsDB[0])
                                changes.forEach(a => {
                                    channel.send({
                                        embeds: [newsDB[a]]
                                    })
                                })
                            }


                            //interaction.editReply('Top 20 topics on https://www.afr.com/street-talk')


                        }
                    }
                    //return 
                }
            }
        })
        .catch(function (error) {
            //console.log(error);
        });
}

function checkForChange(nw) {
    let newsDB = db.get('newsDB')
    if (nw.length !== newsDB.length) return null
    let changes = []
    for (var i = 0; i < nw.length; i++) {
        let title = newsDB[i].title
        //console.log(title)
        let row = JSON.stringify(nw[i]) === JSON.stringify(newsDB[i])
        let total = JSON.stringify(nw).includes(title)
        //console.log(row, total)
        if (!row && !total ) {
            changes.push(i)
        }

        if (i == nw.length - 1) {
            if (changes.length === 0) return false
            //console.log('number of changes '+changes.length)
            return changes
        }
    }

}


function scrapeTheAU(client) {
    if (!db.has('newsAUDB')) {
        db.set('newsAUDB', [])
        db.sync()
    }
    let newsDB = db.get('newsAUDB')
    //console.log(newsDB.length)
    let channel = client.channels.cache.get(process.env['CHANNEL'])
    var config = {
        method: 'get',
        url: 'https://www.theaustralian.com.au/business/dataroom',
        headers: {
            'Cookie': 'nk=8b2775609cb7cfea2d7f2572b8790e59; ak_bmsc=D09B75B4D626C441BC419ED470196FE1~000000000000000000000000000000~YAAQHBRlX68pkhyEAQAAF7q0MRHwJveXmtDL24PKBmyYWiUgfKYnMnBBnXI7Qxl/Ly33/xFMyjqMCYGoIKHHl1cszuqU6WvZyJ85cwfuasGoRTUMrrofoKXiqiJXqlX7tFgdF8+yxhfgkuCR0xmquZ2Z9ftkPfmsNhcYWV8Ed10F9sx4MqZUVZPmA1ZQahR5rHP1gaR97aJDhZNZ2By0QW/YNmYx5O4XkYMKkABxS3t6rO9FpiSj80xzORJZK1AnBU8kFyL76S7ehuIQLy+ewgXe+N9dS34J5D5HJJNfN1cyFWq2gprKL93B3FY+Ecom5oxbVYzunHnQzST4QLIONaPagov2OEOU7kYm/dsZ506zMhErzUxJlyPvQ8VDRGSVVL+pEw==; bm_mi=81DF0FE151C49173A5534AA43AB7BC42~YAAQHBRlX7EpkhyEAQAAlLq0MRFTXU4egCiY5RVxyWe0eSyXaP8gaHTFXkgDXw5imUxjT4zH3VcQehwEgSyNfDPW0f1be45cCQ5HEG+TnqfIvMqVh2pp6f8rCVzxdvs/DOrp6Cyh1FKN2L3v5MQkWp1OzvPZsrUpZ12PYQ+V8Pt3l3R01vz4RxO3SrUwBOOxrI8mH7LO1xW98Sh0sziK4cqc4/s43MULLR3vZ4fHkIAXiBjv2ABEP19l4gmtKtG//dt4cLM5SMLRphaM95YJkLxH3g/js/cuZVnKvwE7UY766aNKLKU5WZk3/4VCOO6K5XsABDwjlI0ZxHtg6Jd64c7PLhS5F0E26g==~1; bm_sv=F0575C72BFACAA27BDB52FBA724ED342~YAAQHBRlX7MpkhyEAQAAZMK0MRGJJH22KRO3D/mRnMXG05DBV+I3UIkSj0yqfQf+YVaYb8ycj+4A77KP6Yho609yFW6+ax3xmBC6bbwgfSJtLJxVtMYjxgaGOrSk8DAQit+J/5hBMQT7whs5m/4/O4/BnMQ+8DhrBIYMDfBLKr2D/MS8666/z5Aiu90o/b3NHors5m9HTMCCJgIaArCZRrU9e2LXujDU2jqo2yfwlWU21P1Ft3mjwWTtSy+9CViQ4SQFOEcFtS2Dng==~1; n_regis=123456789; nk=8b2775609cb7cfea2d7f2572b8790e59; nk_debug=nk_set; nk_ts=1667281239'
        }
    };
    axios(config)
        .then(function (response) {
            const $ = Cheerio.load(response.data)
            //console.log(response.data);
            let news = $('.story-block.story-block--sb06')
            //console.log(news.length)
            console.log(news.length)
            let embeds = []
            let baseUrl = 'https://www.theaustralian.com.au/business/dataroom'
            for (let i = 0; i < news.length; i++) {
                let actualNews = $(`#newscorpau_query_posts_paginated-22 > div > div > div:nth-child(${i+1}) > div.story-block__region2 > h3 > a`)
                let date = $(`#newscorpau_query_posts_paginated-22 > div > div > div:nth-child(${i+1}) > div.story-block__region1 > div > span`)
                let description = $(`#newscorpau_query_posts_paginated-22 > div > div > div:nth-child(${i+1}) > div.story-block__region2 > p.story-block__standfirst`)
                let img = $(`#newscorpau_query_posts_paginated-22 > div > div > div:nth-child(${i+1}) > div.story-block__region2 > div.story-block__image > a > picture > img`).attr('data-src')
                let timestamp = $(`#newscorpau_query_posts_paginated-22 > div > div > div:nth-child(${i+1}) > div.story-block__region2 > div.story-block__info > span.story-block__timestamp.timestamp-red`).attr('title')
                let author = $(`#newscorpau_query_posts_paginated-22 > div > div > div:nth-child(${i+1}) > div.story-block__region2 > div.story-block__info > span.story-block__byline`).text()
                //console.log()






                let embed = new MessageEmbed()
                    .setColor('#041e2a')
                    .setImage('https://cdn.discordapp.com/attachments/1032375025279442944/1036922939855081472/logo.png')
                actualNews.text() ? embed.setTitle(actualNews.text()) : ''
                actualNews.attr('href') ? embed.setURL(actualNews.attr('href')) : ''
                description.text() ? embed.setDescription(description.text()) : ''
                img ? embed.setThumbnail(img) : ''
                timestamp ? embed.setTimestamp(Date.parse(timestamp)) : ''
                author ? embed.setFooter(author) : ''
                //embed.setFooter({ iconURL:'https://www.theaustralian.com.au/wp-content/themes/newscorpau-theaustralian-broadsheet/dist/images/logo.svg'})

                embeds.push(embed)

                if (i == news.length - 1) {
                    let newsDbOld = db.get('newsAUDB')
                    db.set('newsAUDB', embeds)

                    newsDB = db.get('newsAUDB')
                    db.sync()

                    let changes = checkForChange2(newsDbOld)
                    if (!changes) return console.log('false changes');
                    //console.log(newsDB[0])
                    changes.forEach((val, index) => {
                        channel.send({
                            embeds: [newsDB[index]]
                        })
                    })


                    //return 
                }




            }
        })
        .catch(function (error) {
            console.log(error);
        });
}



function checkForChange2(nw) {
    let newsDB = db.get('newsAUDB')
    if (nw.length !== newsDB.length) return null
    let changes = []
    for (var i = 0; i < nw.length; i++) {
        let title = newsDB[i].title
        let row = JSON.stringify(nw[i]) === JSON.stringify(newsDB[i])
        let total = JSON.stringify(nw).includes(title)
        //console.log(row, total)
        if (!row && !total) {
            changes.push(i)
        }

        if (i == nw.length - 1) {
            if (changes.length === 0) return false
            //console.log('number of changes '+changes.length)
            return changes
        }
    }

}