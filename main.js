const Discord = require('discord.js');
const RequestPromise = require('request-promise');
const Cheerio = require('cheerio');

const { T, setLocale } = require('./src/Translate.js');
const Perk = require('./src/Perk.js');

const DBD_WIKI_PREFIX = 'https://deadbydaylight.gamepedia.com/';
const DBD_WIKI_SOS_PAGE = DBD_WIKI_PREFIX + 'Shrine_of_Secrets';
const REPORT_ISSUE_LINK = 'https://github.com/lututui/discord-dbd-shrine-of-secrets/issues';

function create() {
    const Client = new Discord.Client();

    Client.login(process.env.SESSION_DISCORD_TOKEN);

    Client.on('ready', () => onReady(Client));
    Client.on('message', (message) => onMessage(message, Client));
}

let perk_list = [];

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
        return [ 24 - new Date().getUTCHours(),  "hours" ];
    } else if (weekDay > 2) {
        return [ 10 - weekDay, "days" ];
    } else {
        return [ 2 - weekDay, "days" ];
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

    let mb = new Discord.RichEmbed();

    if (command[1] === "help") {
        mb.setTitle(T("Shrine of Secrets Bot Help", id));
        mb.setThumbnail(Client.user.avatarURL);
        mb.setDescription(T("Command list and descriptions. If you have any issues, report [here]", id) + '(' + REPORT_ISSUE_LINK + ')');
        mb.addBlankField();

        mb.addField("help", T("Shows help", id));
        mb.addField("shrine", T("Displays shrine of secrets content and refresh timer", id));
        mb.addField("refresh", T("Displays shrine of secrets refresh timer", id));

        channel.send(mb);
        return;
    }

    if (command[1] == "locale") {
        setLocale(command[2], id);
        return;
    }

    const [ timeout, timeoutString ] = calculateRefreshTime();

    if (command[1] === "shrine") {
        mb.addField(T("Shrine of Secrets", id), [T("The Shrine of Secrets refreshes in", id), timeout, T(timeoutString, id)].join(' '), false);
        channel.send(mb);

        perk_list.forEach(perk => {
            mb = new Discord.RichEmbed();

            mb.setImage(perk.getTeachableImage(), true);
            mb.addField(T("Perk", id), attachWikiLink(perk.getName()), true);
            mb.addField(T("Cost", id), perk.getCost(), true);
            mb.addField(T("Unique Of", id), attachWikiLink(perk.getOwner()), true);
            
            channel.send(mb);
        });
        return;
    }

    if (command[1] === "refresh") {
        mb.addField(T("Shrine of Secrets", id), [T("The Shrine of Secrets refreshes in", id), timeout, T(timeoutString, id)].join(' '), false);
        channel.send(mb);
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
