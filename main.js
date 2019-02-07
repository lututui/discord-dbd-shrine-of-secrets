const Discord = require('discord.js');
const RequestPromise = require('request-promise');
const Cheerio = require('cheerio');

const Translate = require('./src/Translate.js');
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

function calculateRefreshTime(guildUID) {
    const weekDay = new Date().getUTCDay();

    // Tuesday
    if (weekDay == 2) {
        refresh_timer = (24 - new Date().getUTCHours()) + Translate.T(" hours", guildUID);
    } else if (weekDay > 2) {
        refresh_timer = (10 - weekDay) + Translate.T(" days", guildUID);
    } else {
        refresh_timer = (2 - weekDay) + Translate.T(" days", guildUID);
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
    if (message.channel instanceof Discord.DMChannel) {
        mb.channel.send("I don't DM");
        return;
    }

    const command = message.content.split(Client.user.toString()).slice(1).join().trim();

    if (!command) return;

    const guildUID = message.guild.id;
    
    if (perk_list.length === 0) {
        message.channel.send(Translate.T("Not available right now, try again in a minute or so", guildUID));
        return;
    }

    let mb = new Discord.RichEmbed();

    if (command === "help") {
        mb.setTitle(Translate.T("Shrine of Secrets Bot Help", guildUID));
        mb.setThumbnail(Client.user.avatarURL);
        mb.setDescription(Translate.T("Command list and descriptions. If you have any issues, report [here]", guildUID) + '(' + REPORT_ISSUE_LINK + ')');
        mb.addBlankField();

        mb.addField("help", Translate.T("Shows help", guildUID));
        mb.addField("shrine", Translate.T("Displays shrine of secrets content and refresh timer", guildUID));
        mb.addField("refresh", Translate.T("Displays shrine of secrets refresh timer", guildUID));

        message.channel.send(mb);
        return;
    }

    if (command.includes("locale") && command !== "locale") {
        const localeString = command.split(" ")[1];
        Translate.setLocale(localeString, guildUID);
        return;
    }

    calculateRefreshTime(guildUID);

    if (command === "shrine") {
        mb.addField(Translate.T("Shrine of Secrets", guildUID), Translate.T("The Shrine of Secrets refreshes in ", guildUID) + refresh_timer, false);
        message.channel.send(mb);

        perk_list.forEach(perk => {
            mb = new Discord.RichEmbed();

            mb.setImage(perk.getTeachableImage(), true);
            mb.addField(Translate.T("Perk", guildUID), attachWikiLink(perk.getName()), true);
            mb.addField(Translate.T("Cost", guildUID), perk.getCost(), true);
            mb.addField(Translate.T("Unique Of", guildUID), attachWikiLink(perk.getOwner()), true);
            
            message.channel.send(mb);
        });
        return;
    }

    if (command === "refresh") {
        mb.addField(Translate.T("Shrine of Secrets", guildUID), Translate.T("The Shrine of Secrets refreshes in ", guildUID) + refresh_timer, false);
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
