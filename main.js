const Discord = require('discord.js');
const RequestPromise = require('request-promise');
const Cheerio = require('cheerio');

const { T } = require('./src/Translate.js');
const Perk = require('./src/Perk.js');
const Commands = require('./src/Commands.js');
const Misc = require('./src/Misc.js');

function create() {
    const Client = new Discord.Client();

    Client.login(process.env.SESSION_DISCORD_TOKEN);

    Client.on('ready', () => onReady(Client));
    Client.on('message', (message) => onMessage(message, Client));
}

const perk_list = [];

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

function errorHandler(error) {
    console.log(error);
    process.exit(1);
}

function refresh() {
    RequestPromise(Misc.DBD_WIKI_SOS_PAGE)
        .then(processHTML)
        .catch(errorHandler);
}

function onMessage(message, Client) {
    const { author, channel, content, guild } = message;

    if (author == Client.user) return;
    if (!content.startsWith(Client.user.toString())) return;

    const command = content.trim().split(' ');
    const id = (channel.type === 'dm' || channel.tag_tr === 'group') ? channel.id : guild.id;
    
    if (perk_list.length === 0) {
        channel.send(T("Not available right now, try again in a minute or so", id));
        return;
    }

    switch (command[1]) {
        case 'shrine':
            Commands.cmdRefresh(channel, id);
            Commands.cmdShrine(channel, id, perk_list);
            break;
        case 'refresh':
            Commands.cmdRefresh(channel, id);
            break;
        case 'locale':
            Commands.cmdLocale(channel, id, command[2]);
            break;
        case 'help':
        default:
            Commands.cmdHelp(Client, channel, id);
            break;
    }
}

function onReady(Client) {
    Client.user.setActivity('Dead by Daylight', { type : 'PLAYING' });
    refresh();
}

setInterval(refresh, 180000);
create();
