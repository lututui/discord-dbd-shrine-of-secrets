const Discord = require('discord.js');
const RequestPromise = require('request-promise');
const Cheerio = require('cheerio');

const Perk = require('./src/Perk.js');

const DBD_WIKI_PREFIX = 'https://deadbydaylight.gamepedia.com/';
const DBD_WIKI_SOS_PAGE = DBD_WIKI_PREFIX + 'Shrine_of_Secrets';
const REFRESH_PREFIX = 'The Shrine of Secrets refreshes in ';

function create() {
    const Client = new Discord.Client();

    Client.login(process.env.SESSION_DISCORD_TOKEN);

    Client.on('ready', () => onReady(Client));
    Client.on('message', (message) => onMessage(message, Client));
}

let perk_list = [];
let refresh_timer;

function processHTML(html) {
    const tag_tr = Cheerio('tr', html);

    const text_base = Cheerio('td', tag_tr);
    const images = Cheerio('th > div > div > a > img', tag_tr);

    const text1 = Cheerio('a', text_base);
    const text2 = Cheerio('b > span', text_base);

    for (let i = 0; i < 4; i++) {
        perk_list[i] = new Perk(
            name=Cheerio(text1[3 * i]).text(),
            owner=Cheerio(text1[3 * i + 2]).text(),
            cost=Cheerio(text2[i]).text(),
            teachable_image=Cheerio(images[2 * i]).attr('src'),
            owner_image=Cheerio(images[2 * i + 1]).attr('src')
        );
    }
}

function calculateRefreshTime() {
    const weekDay = new Date().getUTCDay();

    // Tuesday
    if (weekDay == 2) {
        refresh_timer = (24 - new Date().getUTCHours()) + " hours";
    } else if (weekDay > 2) {
        refresh_timer = (10 - weekDay) + " days";
    } else {
        refresh_timer = (2 - weekDay) + " days";
    }
}

function errorHandler(error) {
    console.log(error);
    process.exit(1);
}

function refresh() {
    RequestPromise(DBD_WIKI_SOS_PAGE)
        .then(processHTML)
        .catch(errorHandler);
    calculateRefreshTime();
}

function onMessage(message, Client) {
    const command = message.content.split(Client.user.toString()).slice(1).join().trim();

    if (!command) return;
    
    if (refresh_timer === undefined || perk_list.length === 0) {
        message.channel.send("Not available right now, try again in a minute or so");
        return;
    }

    let mb = new Discord.RichEmbed();

    if (command === "help") {
        mb.setTitle("Shrine of Secrets Bot Help");
        mb.setThumbnail(Client.user.avatarURL);
        mb.setDescription("Command list and descriptions. If you have any issues, report [here](https://github.com/lututui/discord-dbd-shrine-of-secrets/issues)");
        mb.addBlankField();

        mb.addField("help", "Shows help");
        mb.addField("shrine", "Displays shrine of secrets content and refresh timer");
        mb.addField("refresh", "Displays shrine of secrets refresh timer");

        message.channel.send(mb);
        return;
    }

    if (command === "shrine") {
        mb.addField("Shrine of Secrets", REFRESH_PREFIX + refresh_timer, false);
        message.channel.send(mb);

        perk_list.forEach(perk => {
            mb = new Discord.RichEmbed();

            mb.setImage(perk.getTeachableImage(), true);
            mb.addField("Perk", attachWikiLink(perk.getName()), true);
            mb.addField("Cost", perk.getCost(), true);
            mb.addField("Unique Of", attachWikiLink(perk.getOwner()), true);
            
            message.channel.send(mb);
        });
        return;
    }

    if (command === "refresh") {
        mb.addField("Shrine of Secrets", REFRESH_PREFIX + refresh_timer, false);
        message.channel.send(mb);
        return;
    }
}

function onReady(Client) {
    Client.user.setActivity('Dead by Daylight', { type : 'PLAYING' });
    refresh();
}

function attachWikiLink(pageName) {
    return '[' + pageName + ']' + '(' + DBD_WIKI_PREFIX + pageName.split(' ').join('_') + ')';
}

setInterval(refresh, 180000);
create();
